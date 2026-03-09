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

import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

const ThreeParticleSphere = lazy(() =>
  import('@/components/features/landing/ThreeParticleSphere').then(m => ({ default: m.ThreeParticleSphere }))
);

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

  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  const isActive = status === 'listening' || status === 'speaking' || status === 'processing';
  const sphereSize = isActive ? 160 : 140;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: isLight ? 'rgba(248,250,252,0.92)' : 'rgba(5,7,11,0.92)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '1.5rem',
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          color: isLight ? '#0f172a' : '#f8fafc', margin: 0,
          fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.02em',
        }}>
          Voice Conversation
        </h2>
        <p style={{
          color: isLight ? '#64748b' : '#64748b',
          margin: '0.4rem 0 0 0', fontSize: '0.85rem',
        }}>
          Real-time voice · Powered by Resonant Genesis
        </p>
      </div>

      {/* ThreeParticleSphere + Mic container */}
      <div
        style={{
          position: 'relative',
          width: sphereSize + 80,
          height: sphereSize + 80,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
        }}
        onClick={handleToggleListen}
      >
        {/* Actual 3D Parallax Sphere — scaled down 2x, green hue when listening */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: isActive ? 'scale(0.52)' : 'scale(0.48)',
          filter: (status === 'listening') ? 'hue-rotate(90deg)' : 'none',
          transition: 'transform 1.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s, filter 0.8s ease',
          animation: isActive ? 'voiceSphereBreath 3s ease-in-out infinite' : 'none',
          opacity: isActive ? 1 : 0.85,
          pointerEvents: 'none',
        }}>
          <Suspense fallback={null}>
            <ThreeParticleSphere />
          </Suspense>
        </div>

        {/* Breathing rings — expands/shrinks when listening */}
        {isActive && [0, 1, 2].map(i => (
          <div key={`ring-${i}`} style={{
            position: 'absolute',
            left: '50%', top: '50%',
            width: sphereSize + 20 + i * 30,
            height: sphereSize + 20 + i * 30,
            borderRadius: '50%',
            border: `1.5px solid ${pulseColor}`,
            opacity: 0.3 - i * 0.08,
            transform: 'translate(-50%, -50%)',
            animation: `voiceBreathe 2.5s ease-in-out ${i * 0.3}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Mic icon — overlays center of sphere */}
        <div style={{
          position: 'absolute', zIndex: 10,
          width: 64, height: 64, borderRadius: '50%',
          background: isActive
            ? `radial-gradient(circle, ${pulseColor}35 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(0,0,0,0.4) 0%, transparent 70%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.4s',
          left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke={isActive ? pulseColor : (isLight ? '#3b82f6' : '#e0e7ff')}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'stroke 0.3s', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
          >
            {listening ? (
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

      {/* Voice waveform — trace lines when speaking/processing */}
      {(status === 'speaking' || status === 'processing') && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 3, height: 32,
        }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={`bar-${i}`} style={{
              width: 2.5, borderRadius: 2,
              background: status === 'speaking' ? '#8b5cf6' : '#f59e0b',
              animation: `voiceBar 0.8s ease-in-out ${i * 0.05}s infinite alternate`,
              opacity: 0.7,
            }} />
          ))}
        </div>
      )}

      {/* Status label */}
      <p style={{
        color: isActive ? pulseColor : (isLight ? '#475569' : '#94a3b8'),
        margin: 0, fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.03em',
        transition: 'color 0.3s',
      }}>
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
                  ? (isLight ? 'rgba(59,130,246,0.12)' : 'rgba(99,102,241,0.25)')
                  : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)'),
                border: `1px solid ${t.role === 'user'
                  ? (isLight ? '#3b82f622' : '#6366f144')
                  : (isLight ? '#0000000a' : '#ffffff1a')}`,
                borderRadius: t.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '0.6rem 1rem',
                color: t.partial
                  ? (isLight ? '#94a3b8' : '#aaa')
                  : (isLight ? '#0f172a' : '#f8fafc'),
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

      {/* Close button — below text */}
      <button onClick={onClose} style={{
        marginTop: '0.5rem',
        background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 12,
        padding: '10px 28px',
        cursor: 'pointer',
        color: isLight ? '#475569' : '#94a3b8',
        fontSize: '0.85rem', fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 8,
        transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: '1rem' }}>✕</span> End Session
      </button>

      {/* Keyframes */}
      <style>{`
        @keyframes voiceSphereBreath {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.1); }
        }
        @keyframes voiceBreathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50%      { transform: translate(-50%, -50%) scale(1.12); opacity: 0.12; }
        }
        @keyframes voiceBar {
          0%   { height: 4px; }
          100% { height: 28px; }
        }
      `}</style>
    </div>
  );
};

export default VoiceConversationModal;
