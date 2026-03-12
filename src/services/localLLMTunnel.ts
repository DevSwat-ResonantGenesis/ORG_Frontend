/**
 * Local LLM Tunnel Client
 * 
 * Opens a WebSocket to the gateway that acts as a bridge between
 * the server and the user's local Ollama/LM Studio instance.
 * 
 * Flow:
 * 1. Browser opens WS to /api/v1/ws/local-llm/tunnel
 * 2. Sends auth + endpoint_url
 * 3. Server sends LLM requests → this client fetches from localhost → returns result
 * 4. Heartbeat every 20s to keep alive
 */

type TunnelStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type StatusListener = (status: TunnelStatus, info?: string) => void;

class LocalLLMTunnelClient {
  private ws: WebSocket | null = null;
  private endpointUrl: string = 'http://localhost:11434';
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private _status: TunnelStatus = 'disconnected';
  private listeners: StatusListener[] = [];
  private shouldReconnect = false;

  get status(): TunnelStatus {
    return this._status;
  }

  get isConnected(): boolean {
    return this._status === 'connected';
  }

  onStatusChange(listener: StatusListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private setStatus(status: TunnelStatus, info?: string) {
    this._status = status;
    this.listeners.forEach(l => l(status, info));
  }

  connect(endpointUrl: string) {
    this.endpointUrl = endpointUrl;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this._connect();
  }

  disconnect() {
    this.shouldReconnect = false;
    this._cleanup();
    this.setStatus('disconnected');
  }

  private _connect() {
    this._cleanup();
    this.setStatus('connecting');

    const token = localStorage.getItem('access_token') || '';
    if (!token) {
      this.setStatus('error', 'No auth token');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/v1/ws/local-llm/tunnel`;

    try {
      this.ws = new WebSocket(wsUrl);
    } catch (e) {
      this.setStatus('error', 'WebSocket creation failed');
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      // Send auth message
      this.ws?.send(JSON.stringify({
        type: 'auth',
        token,
        endpoint_url: this.endpointUrl,
      }));
    };

    this.ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        await this._handleMessage(msg);
      } catch (e) {
        console.error('[LocalLLMTunnel] message parse error:', e);
      }
    };

    this.ws.onclose = () => {
      this._stopHeartbeat();
      if (this._status === 'connected') {
        this.setStatus('disconnected');
      }
      if (this.shouldReconnect) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.setStatus('error', 'WebSocket error');
    };
  }

  private async _handleMessage(msg: any) {
    switch (msg.type) {
      case 'auth_success':
        this.reconnectAttempts = 0;
        this.setStatus('connected', msg.endpoint_url);
        this._startHeartbeat();
        // Probe local models and send to server
        this._probeModels();
        break;

      case 'error':
        this.setStatus('error', msg.error);
        break;

      case 'heartbeat_ack':
        break;

      case 'llm_request':
        // Server wants us to make a local LLM call
        await this._handleLLMRequest(msg.request_id, msg.payload);
        break;

      case 'pong':
        break;
    }
  }

  private async _handleLLMRequest(requestId: string, payload: any) {
    const endpoint = payload.endpoint_url || this.endpointUrl;
    const baseUrl = endpoint.replace(/\/v1\/?$/, ''); // strip /v1 suffix

    try {
      let result: any;

      if (payload.method === 'chat') {
        // Ollama /api/chat format
        const resp = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: payload.model || 'llama3.1:8b',
            messages: payload.messages || [],
            stream: false,
            options: {
              temperature: payload.temperature ?? 0.7,
              ...(payload.max_tokens ? { num_predict: payload.max_tokens } : {}),
            },
          }),
        });

        if (!resp.ok) {
          const errText = await resp.text();
          this.ws?.send(JSON.stringify({
            type: 'llm_response',
            request_id: requestId,
            error: `Local LLM returned ${resp.status}: ${errText.slice(0, 200)}`,
          }));
          return;
        }

        result = await resp.json();
        const content = result?.message?.content || '';

        this.ws?.send(JSON.stringify({
          type: 'llm_response',
          request_id: requestId,
          response: {
            id: `local-${Date.now()}`,
            object: 'chat.completion',
            model: payload.model || result?.model || 'local',
            choices: [{
              index: 0,
              message: { role: 'assistant', content },
              finish_reason: result?.done ? 'stop' : 'length',
            }],
            usage: {
              prompt_tokens: result?.prompt_eval_count || 0,
              completion_tokens: result?.eval_count || 0,
              total_tokens: (result?.prompt_eval_count || 0) + (result?.eval_count || 0),
            },
            provider: 'local',
          },
        }));
      } else {
        // OpenAI-compatible /v1/chat/completions format (LM Studio, etc.)
        const resp = await fetch(`${endpoint}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: payload.model || 'local',
            messages: payload.messages || [],
            temperature: payload.temperature ?? 0.7,
            ...(payload.max_tokens ? { max_tokens: payload.max_tokens } : {}),
          }),
        });

        result = await resp.json();
        this.ws?.send(JSON.stringify({
          type: 'llm_response',
          request_id: requestId,
          response: result,
        }));
      }
    } catch (e: any) {
      this.ws?.send(JSON.stringify({
        type: 'llm_response',
        request_id: requestId,
        error: `Failed to reach local LLM at ${endpoint}: ${e.message}`,
      }));
    }
  }

  private async _probeModels() {
    try {
      const baseUrl = this.endpointUrl.replace(/\/v1\/?$/, '');
      const resp = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const data = await resp.json();
        const models = (data.models || []).map((m: any) => m.name || m.model);
        this.ws?.send(JSON.stringify({ type: 'models_update', models }));
      }
    } catch {
      // Ollama might not be running yet, that's ok
    }
  }

  private _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 20000);
  }

  private _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private _scheduleReconnect() {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    this.reconnectTimeout = setTimeout(() => this._connect(), delay);
  }

  private _cleanup() {
    this._stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
  }
}

// Singleton
const localLLMTunnel = new LocalLLMTunnelClient();
export default localLLMTunnel;
