/**
 * Terminal API Client
 * Connects frontend to IDE Terminal Service
 */

import fastapiClient from './fastapiClient';

export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  shell: string;
  created_at: string;
  is_active: boolean;
}

export interface TerminalOutput {
  session_id: string;
  output: string;
  timestamp: string;
}

export interface TerminalCommand {
  command: string;
  cwd?: string;
}

export interface TerminalCreateRequest {
  name?: string;
  cwd?: string;
  shell?: string;
}

// Create a new terminal session
export const createTerminalSession = async (request: TerminalCreateRequest = {}): Promise<TerminalSession> => {
  const response = await fastapiClient.post('/api/ide/terminal/sessions', request);
  return response.data;
};

// List all terminal sessions
export const listTerminalSessions = async (): Promise<TerminalSession[]> => {
  const response = await fastapiClient.get('/api/ide/terminal/sessions');
  return response.data;
};

// Get a specific terminal session
export const getTerminalSession = async (sessionId: string): Promise<TerminalSession> => {
  const response = await fastapiClient.get(`/api/ide/terminal/sessions/${sessionId}`);
  return response.data;
};

// Execute a command in a terminal session
export const executeCommand = async (sessionId: string, command: TerminalCommand): Promise<TerminalOutput> => {
  const response = await fastapiClient.post(`/api/ide/terminal/sessions/${sessionId}/execute`, command);
  return response.data;
};

// Get terminal output/history
export const getTerminalOutput = async (sessionId: string, lines?: number): Promise<TerminalOutput> => {
  const params = lines ? { lines } : {};
  const response = await fastapiClient.get(`/api/ide/terminal/sessions/${sessionId}/output`, { params });
  return response.data;
};

// Close a terminal session
export const closeTerminalSession = async (sessionId: string): Promise<void> => {
  await fastapiClient.delete(`/api/ide/terminal/sessions/${sessionId}`);
};

// Resize terminal
export const resizeTerminal = async (sessionId: string, cols: number, rows: number): Promise<void> => {
  await fastapiClient.post(`/api/ide/terminal/sessions/${sessionId}/resize`, { cols, rows });
};

// Send input to terminal (for interactive commands)
export const sendTerminalInput = async (sessionId: string, input: string): Promise<void> => {
  await fastapiClient.post(`/api/ide/terminal/sessions/${sessionId}/input`, { input });
};

export default {
  createTerminalSession,
  listTerminalSessions,
  getTerminalSession,
  executeCommand,
  getTerminalOutput,
  closeTerminalSession,
  resizeTerminal,
  sendTerminalInput,
};
