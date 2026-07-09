import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import styles from './InteractiveTerminal.module.css';

interface InteractiveTerminalProps {
  terminalId: string;
  projectId?: string;
  visible: boolean;
}

// One real interactive shell, running inside the user's own hardened
// RG_Terminal_Sandbox container (node:20-slim + Claude Code CLI, egress
// restricted to api.anthropic.com/github.com only - see
// RG_Terminal_Sandbox/app/docker_manager.py). Each reconnect gets a fresh
// `docker exec` shell inside the same long-lived container (files/workspace
// persist; in-shell state like `cd` or exported env vars does not).
export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({
  terminalId,
  projectId,
  visible,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'SF Mono', Monaco, 'Cascadia Code', monospace",
      theme: { background: '#262321' },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    fit.fit();
    termRef.current = term;
    fitRef.current = fit;

    // xterm.js captures keystrokes via a hidden textarea. Without disabling
    // these, mobile keyboards (and some desktop browsers) run autocorrect/
    // autocomplete over it and mangle typed input - e.g. inserting spaces
    // after "recognized" words instead of sending raw keystrokes.
    const helperTextarea = containerRef.current.querySelector('textarea.xterm-helper-textarea');
    if (helperTextarea) {
      helperTextarea.setAttribute('autocorrect', 'off');
      helperTextarea.setAttribute('autocapitalize', 'off');
      helperTextarea.setAttribute('autocomplete', 'off');
      helperTextarea.setAttribute('spellcheck', 'false');
    }

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const params = new URLSearchParams();
    if (projectId) params.set('project_id', projectId);
    const ws = new WebSocket(
      `${proto}//${window.location.host}/api/v1/ws/terminal/${terminalId}?${params.toString()}`
    );
    wsRef.current = ws;

    term.writeln('Connecting to sandboxed terminal...');

    ws.onopen = () => {
      term.clear();
      fit.fit();
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'output') {
          term.write(msg.data);
        } else if (msg.type === 'error') {
          term.writeln(`\r\n[error] ${msg.message || msg.error}`);
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      term.writeln('\r\n[disconnected]');
    };

    ws.onerror = () => {
      term.writeln('\r\n[connection error]');
    };

    const dataDisposable = term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }));
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      fit.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      dataDisposable.dispose();
      resizeObserver.disconnect();
      ws.close();
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalId]);

  useEffect(() => {
    if (visible) {
      fitRef.current?.fit();
      termRef.current?.focus();
    }
  }, [visible]);

  return (
    <div
      className={styles.terminalHost}
      style={{ display: visible ? 'block' : 'none' }}
      ref={containerRef}
    />
  );
};
