/**
 * VoiceConversationModal — real-time duplex voice session
 *
 * Connects to the gateway /api/v1/voice/session WebSocket.
 * Browser sends rg_access_token cookie automatically on WS upgrade.
 *
 * Protocol (gateway/app/voice_ws.py):
 *   → voice.session.awaiting_auth
 *   ← (cookie auth, no explicit message needed)
 *   → auth.success
 *   → voice.session.ready
 *   ← session.start { sample_rate_hz, encoding }
 *   → session.started
 *   ← [audio bytes / audio.chunk base64]
 *   → asr.partial, asr.final, assistant.delta, assistant.done
 *   → tts.chunk (base64 mp3), tts.done
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Turn {
  role: 'user' | 'assistant';
  text: string;
  partial?: boolean;
}

interface VoiceConversationModalProps {
  onClose: () => void;
}

const SAMPLE_RATE = 16_000;
const CHUNK_FRAMES = 4_096; // samples per script-processor buffer

const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({ onClose }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const ttsQueueRef = useRef<ArrayBuffer[]>([]);
  const ttsPlayingRef = useRef(false);

  const [status, setStatus] = useState<'connecting' | 'ready' | 'listening' | 'processing' | 'speaking' | 'error'>('connecting');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [listening, setListening] = useState(false);

  const wsUrl = (() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${window.location.host}/api/v1/voice/session`;
  })();

  // ── Audio capture helpers ──────────────────────────────────────────────────

  const stopCapture = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    setListening(false);
  }, []);

  const startCapture = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: SAMPLE_RATE, channelCount: 1 } });
    streamRef.current = stream;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE });
    audioCtxRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);
    sourceRef.current = source;

    // ScriptProcessor converts float32 → PCM16 and sends to WS
    const processor = ctx.createScriptProcessor(CHUNK_FRAMES, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      const float32 = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      wsRef.current.send(pcm16.buffer);
    };

    source.connect(processor);
    processor.connect(ctx.destination);
    setListening(true);
    setStatus('listening');
  }, []);

  // ── TTS playback via Web Audio ─────────────────────────────────────────────

  const playNextTtsChunk = useCallback(async () => {
    if (ttsPlayingRef.current || ttsQueueRef.current.length === 0) return;
    ttsPlayingRef.current = true;
    setStatus('speaking');

    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;

    while (ttsQueueRef.current.length > 0) {
      const buf = ttsQueueRef.current.shift()!;
      try {
        const decoded = await ctx.decodeAudioData(buf.slice(0)); // .slice to own the buffer
        const src = ctx.createBufferSource();
        src.buffer = decoded;
        src.connect(ctx.destination);
        await new Promise<void>(res => { src.onended = () => res(); src.start(); });
      } catch {
        // ignore decode errors for individual chunks
      }
    }

    ttsPlayingRef.current = false;
    setStatus(listening ? 'listening' : 'ready');
  }, [listening]);

  // ── WebSocket setup ────────────────────────────────────────────────────────

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      setStatus('connecting');
    };

    ws.onmessage = async (event) => {
      // Text JSON messages
      if (typeof event.data === 'string') {
        let msg: any;
        try { msg = JSON.parse(event.data); } catch { return; }

        switch (msg.type) {
          case 'voice.session.awaiting_auth':
            // Cookie auth: backend reads rg_access_token from WS cookies automatically.
            // No explicit auth message needed in most cases.
            break;

          case 'auth.success':
            // Send session.start right after auth
            ws.send(JSON.stringify({
              type: 'session.start',
              sample_rate_hz: SAMPLE_RATE,
              encoding: 'pcm16',
            }));
            break;

          case 'voice.session.ready':
          case 'session.started':
            setStatus('ready');
            break;

          case 'asr.partial':
            setTurns(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'user' && last.partial) {
                return [...prev.slice(0, -1), { role: 'user', text: msg.text, partial: true }];
              }
              return [...prev, { role: 'user', text: msg.text, partial: true }];
            });
            setStatus('listening');
            break;

          case 'asr.final':
            setTurns(prev => {
              const filtered = prev.filter(t => !(t.role === 'user' && t.partial));
              return [...filtered, { role: 'user', text: msg.text }];
            });
            setStatus('processing');
            break;

          case 'assistant.delta':
            setTurns(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant' && last.partial) {
                return [...prev.slice(0, -1), { role: 'assistant', text: last.text + msg.text, partial: true }];
              }
              return [...prev, { role: 'assistant', text: msg.text, partial: true }];
            });
            setStatus('processing');
            break;

          case 'assistant.done':
            setTurns(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant' && last.partial) {
                return [...prev.slice(0, -1), { role: 'assistant', text: last.text }];
              }
              return prev;
            });
            break;

          case 'tts.interrupted':
            ttsQueueRef.current = [];
            ttsPlayingRef.current = false;
            setStatus(listening ? 'listening' : 'ready');
            break;

          case 'tts.done':
            // All chunks received — start playing
            void playNextTtsChunk();
            break;

          case 'error':
            if (msg.error?.includes('auth') || msg.error?.includes('Authentication')) {
              setErrorMsg('Authentication failed. Please refresh the page.');
              setStatus('error');
            }
            break;

          default:
            break;
        }
        return;
      }

      // Binary data = TTS audio chunk (shouldn't happen with current protocol, but handle)
      if (event.data instanceof ArrayBuffer) {
        ttsQueueRef.current.push(event.data);
      }
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        let msg: any;
        try { msg = JSON.parse(event.data); } catch { return; }

        switch (msg.type) {
          case 'voice.session.awaiting_auth':
            break;

          case 'auth.success':
            ws.send(JSON.stringify({ type: 'session.start', sample_rate_hz: SAMPLE_RATE, encoding: 'pcm16' }));
            break;

          case 'voice.session.ready':
          case 'session.started':
            setStatus('ready');
            break;

          case 'asr.partial':
            setTurns(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'user' && last.partial) {
                return [...prev.slice(0, -1), { role: 'user', text: msg.text || 'listening…', partial: true }];
              }
              return [...prev, { role: 'user', text: msg.text || 'listening…', partial: true }];
            });
            setStatus('listening');
            break;

          case 'asr.final':
            setTurns(prev => {
              const filtered = prev.filter(t => !(t.role === 'user' && t.partial));
              return [...filtered, { role: 'user', text: msg.text }];
            });
            setStatus('processing');
            break;

          case 'assistant.delta': {
            const token = msg.text || '';
            setTurns(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant' && last.partial) {
                return [...prev.slice(0, -1), { role: 'assistant', text: last.text + token, partial: true }];
              }
              return [...prev, { role: 'assistant', text: token, partial: true }];
            });
            setStatus('processing');
            break;
          }

          case 'assistant.done':
            setTurns(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant' && last.partial) {
                return [...prev.slice(0, -1), { role: 'assistant', text: last.text }];
              }
              return prev;
            });
            break;

          case 'tts.chunk': {
            // base64 MP3 chunk → decode and queue
            try {
              const binary = atob(msg.audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              ttsQueueRef.current.push(bytes.buffer);
            } catch { /* ignore */ }
            break;
          }

          case 'tts.done':
            void playNextTtsChunk();
            break;

          case 'tts.interrupted':
            ttsQueueRef.current = [];
            ttsPlayingRef.current = false;
            setStatus('listening');
            break;

          case 'tts.unavailable':
            // TTS not configured, just show text
            setStatus(listening ? 'listening' : 'ready');
            break;

          case 'error':
            if (msg.error?.toLowerCase().includes('auth')) {
              setErrorMsg('Session authentication failed. Please refresh.');
              setStatus('error');
            }
            break;
        }
      }
    };

    ws.onerror = () => {
      setErrorMsg('WebSocket connection failed.');
      setStatus('error');
    };

    ws.onclose = (e) => {
      if (e.code !== 1000) {
        setStatus('error');
        setErrorMsg(`Disconnected (code ${e.code}).`);
      }
      stopCapture();
    };

    return () => {
      ws.close(1000);
      wsRef.current = null;
      stopCapture();
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleListen = useCallback(async () => {
    if (listening) {
      stopCapture();
      setStatus('ready');
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'session.stop' }));
      }
    } else {
      try {
        await startCapture();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Microphone access denied.');
        setStatus('error');
      }
    }
  }, [listening, startCapture, stopCapture]);

  // ── Pulse animation ────────────────────────────────────────────────────────

  const pulseColor = {
    connecting: '#6366f1',
    ready: '#22d3ee',
    listening: '#10b981',
    processing: '#f59e0b',
    speaking: '#8b5cf6',
    error: '#ef4444',
  }[status];

  const statusLabel = {
    connecting: 'Connecting…',
    ready: 'Tap mic to start',
    listening: 'Listening…',
    processing: 'Thinking…',
    speaking: 'Speaking…',
    error: errorMsg || 'Error',
  }[status];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '2rem',
    }}>
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: '1.5rem', right: '1.5rem',
        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
        width: 40, height: 40, cursor: 'pointer', color: '#fff', fontSize: '1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          Voice Conversation
        </h2>
        <p style={{ color: '#888', margin: '0.4rem 0 0 0', fontSize: '0.85rem' }}>
          Real-time voice · Powered by Resonant Genesis
        </p>
      </div>

      {/* Pulse orb */}
      <div style={{ position: 'relative', width: 120, height: 120, cursor: 'pointer' }} onClick={handleToggleListen}>
        {/* Ripple rings */}
        {(status === 'listening' || status === 'speaking') && [0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${pulseColor}`,
            opacity: 0.5 - i * 0.15,
            animation: `voiceRipple 1.5s ease-out ${i * 0.4}s infinite`,
            transform: 'scale(1)',
          }} />
        ))}
        {/* Main orb */}
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle, ${pulseColor}33 0%, ${pulseColor}11 70%)`,
          border: `2px solid ${pulseColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s',
          boxShadow: status === 'listening' ? `0 0 40px ${pulseColor}66` : 'none',
        }}>
          {/* Mic icon */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={pulseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {status === 'listening' || listening ? (
              <rect x="9" y="9" width="6" height="6" rx="1" fill={pulseColor} />
            ) : (
              <>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Status label */}
      <p style={{ color: pulseColor, margin: 0, fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.05em' }}>
        {statusLabel}
      </p>

      {/* Conversation turns */}
      {turns.length > 0 && (
        <div style={{
          width: '100%', maxWidth: 560, maxHeight: '35vh',
          overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem',
          padding: '0 1.5rem',
        }}>
          {turns.map((t, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: t.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%',
                background: t.role === 'user'
                  ? 'rgba(99,102,241,0.25)'
                  : 'rgba(255,255,255,0.08)',
                border: `1px solid ${t.role === 'user' ? '#6366f144' : '#ffffff1a'}`,
                borderRadius: t.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '0.6rem 1rem',
                color: t.partial ? '#aaa' : '#fff',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                fontStyle: t.partial ? 'italic' : 'normal',
              }}>
                {t.text}
                {t.partial && <span style={{ opacity: 0.6 }}> ▋</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ripple keyframes */}
      <style>{`
        @keyframes voiceRipple {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VoiceConversationModal;
