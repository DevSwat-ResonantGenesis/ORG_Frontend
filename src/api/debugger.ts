/**
 * Debugger API Client
 * Connects frontend to IDE Debugger Service
 */

import fastapiClient from './fastapiClient';

export interface DebugSession {
  id: string;
  name: string;
  language: string;
  file_path: string;
  status: 'idle' | 'running' | 'paused' | 'stopped';
  created_at: string;
}

export interface Breakpoint {
  id: string;
  file_path: string;
  line: number;
  condition?: string;
  enabled: boolean;
}

export interface StackFrame {
  id: number;
  name: string;
  file_path: string;
  line: number;
  column: number;
  source?: string;
}

export interface Variable {
  name: string;
  value: string;
  type: string;
  children?: Variable[];
}

export interface DebugState {
  session_id: string;
  status: 'idle' | 'running' | 'paused' | 'stopped';
  current_frame?: StackFrame;
  stack_frames: StackFrame[];
  variables: Variable[];
  breakpoints: Breakpoint[];
}

export interface DebugCreateRequest {
  name?: string;
  file_path: string;
  language?: string;
  args?: string[];
  env?: Record<string, string>;
}

// Create a new debug session
export const createDebugSession = async (request: DebugCreateRequest): Promise<DebugSession> => {
  const response = await fastapiClient.post('/api/ide/debugger/sessions', request);
  return response.data;
};

// List all debug sessions
export const listDebugSessions = async (): Promise<DebugSession[]> => {
  const response = await fastapiClient.get('/api/ide/debugger/sessions');
  return response.data;
};

// Get a specific debug session
export const getDebugSession = async (sessionId: string): Promise<DebugSession> => {
  const response = await fastapiClient.get(`/api/ide/debugger/sessions/${sessionId}`);
  return response.data;
};

// Get debug state (stack, variables, breakpoints)
export const getDebugState = async (sessionId: string): Promise<DebugState> => {
  const response = await fastapiClient.get(`/api/ide/debugger/sessions/${sessionId}/state`);
  return response.data;
};

// Start debugging
export const startDebug = async (sessionId: string): Promise<DebugState> => {
  const response = await fastapiClient.post(`/api/ide/debugger/sessions/${sessionId}/start`);
  return response.data;
};

// Pause debugging
export const pauseDebug = async (sessionId: string): Promise<DebugState> => {
  const response = await fastapiClient.post(`/api/ide/debugger/sessions/${sessionId}/pause`);
  return response.data;
};

// Continue debugging
export const continueDebug = async (sessionId: string): Promise<DebugState> => {
  const response = await fastapiClient.post(`/api/ide/debugger/sessions/${sessionId}/continue`);
  return response.data;
};

// Step over
export const stepOver = async (sessionId: string): Promise<DebugState> => {
  const response = await fastapiClient.post(`/api/ide/debugger/sessions/${sessionId}/step-over`);
  return response.data;
};

// Step into
export const stepInto = async (sessionId: string): Promise<DebugState> => {
  const response = await fastapiClient.post(`/api/ide/debugger/sessions/${sessionId}/step-into`);
  return response.data;
};

// Step out
export const stepOut = async (sessionId: string): Promise<DebugState> => {
  const response = await fastapiClient.post(`/api/ide/debugger/sessions/${sessionId}/step-out`);
  return response.data;
};

// Stop debugging
export const stopDebug = async (sessionId: string): Promise<void> => {
  await fastapiClient.post(`/api/ide/debugger/sessions/${sessionId}/stop`);
};

// Add breakpoint
export const addBreakpoint = async (sessionId: string, filePath: string, line: number, condition?: string): Promise<Breakpoint> => {
  const response = await fastapiClient.post(`/api/ide/debugger/sessions/${sessionId}/breakpoints`, {
    file_path: filePath,
    line,
    condition,
  });
  return response.data;
};

// Remove breakpoint
export const removeBreakpoint = async (sessionId: string, breakpointId: string): Promise<void> => {
  await fastapiClient.delete(`/api/ide/debugger/sessions/${sessionId}/breakpoints/${breakpointId}`);
};

// Toggle breakpoint
export const toggleBreakpoint = async (sessionId: string, breakpointId: string): Promise<Breakpoint> => {
  const response = await fastapiClient.patch(`/api/ide/debugger/sessions/${sessionId}/breakpoints/${breakpointId}/toggle`);
  return response.data;
};

// Evaluate expression
export const evaluateExpression = async (sessionId: string, expression: string, frameId?: number): Promise<Variable> => {
  const response = await fastapiClient.post(`/api/ide/debugger/sessions/${sessionId}/evaluate`, {
    expression,
    frame_id: frameId,
  });
  return response.data;
};

// Close debug session
export const closeDebugSession = async (sessionId: string): Promise<void> => {
  await fastapiClient.delete(`/api/ide/debugger/sessions/${sessionId}`);
};

export default {
  createDebugSession,
  listDebugSessions,
  getDebugSession,
  getDebugState,
  startDebug,
  pauseDebug,
  continueDebug,
  stepOver,
  stepInto,
  stepOut,
  stopDebug,
  addBreakpoint,
  removeBreakpoint,
  toggleBreakpoint,
  evaluateExpression,
  closeDebugSession,
};
