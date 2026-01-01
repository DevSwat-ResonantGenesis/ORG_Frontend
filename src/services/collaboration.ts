// ============== REAL-TIME COLLABORATION SERVICE ==============
// Utilities for collaborative editing and presence awareness

import { getWebSocket } from '../utils/websocketManager';

// ============== TYPES ==============
export interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

export interface CursorPosition {
  userId: string;
  file: string;
  line: number;
  column: number;
  timestamp: number;
}

export interface Selection {
  userId: string;
  file: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface EditOperation {
  id: string;
  userId: string;
  file: string;
  type: 'insert' | 'delete' | 'replace';
  position: { line: number; column: number };
  text: string;
  timestamp: number;
}

export interface PresenceState {
  users: Map<string, User>;
  cursors: Map<string, CursorPosition>;
  selections: Map<string, Selection>;
  activeFile: Map<string, string>;
}

type PresenceHandler = (state: PresenceState) => void;
type EditHandler = (operation: EditOperation) => void;

// ============== COLLABORATION MANAGER ==============
class CollaborationService {
  private ws = (() => {
    const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
    const wsUrl = ideUrl.replace('http', 'ws');
    return getWebSocket(`${wsUrl}/ws/collab`);
  })();
  private currentUser: User | null = null;
  private state: PresenceState = {
    users: new Map(),
    cursors: new Map(),
    selections: new Map(),
    activeFile: new Map(),
  };
  private presenceHandlers = new Set<PresenceHandler>();
  private editHandlers = new Set<EditHandler>();
  private isConnected = false;
  private pendingOperations: EditOperation[] = [];
  private operationBuffer: EditOperation[] = [];
  private bufferTimeout: NodeJS.Timeout | null = null;
  private readonly BUFFER_DELAY = 50;

  constructor() {
    this.setupHandlers();
  }

  // Join a collaboration session
  async join(user: User, sessionId: string): Promise<void> {
    this.currentUser = user;
    
    await this.ws.connect();
    this.isConnected = true;

    await this.ws.send('collab:join', {
      user,
      sessionId,
    });

    this.state.users.set(user.id, user);
    this.notifyPresenceChange();
  }

  // Leave the session
  async leave(): Promise<void> {
    if (!this.currentUser) return;

    await this.ws.send('collab:leave', {
      userId: this.currentUser.id,
    });

    this.state.users.delete(this.currentUser.id);
    this.state.cursors.delete(this.currentUser.id);
    this.state.selections.delete(this.currentUser.id);
    this.currentUser = null;
    this.isConnected = false;
    this.notifyPresenceChange();
  }

  // Update cursor position
  updateCursor(file: string, line: number, column: number): void {
    if (!this.currentUser || !this.isConnected) return;

    const cursor: CursorPosition = {
      userId: this.currentUser.id,
      file,
      line,
      column,
      timestamp: Date.now(),
    };

    this.state.cursors.set(this.currentUser.id, cursor);
    this.ws.send('collab:cursor', cursor).catch(() => {});
    this.notifyPresenceChange();
  }

  // Update selection
  updateSelection(
    file: string,
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number
  ): void {
    if (!this.currentUser || !this.isConnected) return;

    const selection: Selection = {
      userId: this.currentUser.id,
      file,
      startLine,
      startColumn,
      endLine,
      endColumn,
    };

    this.state.selections.set(this.currentUser.id, selection);
    this.ws.send('collab:selection', selection).catch(() => {});
    this.notifyPresenceChange();
  }

  // Send edit operation (buffered)
  sendEdit(operation: Omit<EditOperation, 'id' | 'userId' | 'timestamp'>): void {
    if (!this.currentUser || !this.isConnected) return;

    const fullOperation: EditOperation = {
      ...operation,
      id: this.generateId(),
      userId: this.currentUser.id,
      timestamp: Date.now(),
    };

    this.operationBuffer.push(fullOperation);
    this.scheduleBufferFlush();
  }

  // Subscribe to presence changes
  onPresenceChange(handler: PresenceHandler): () => void {
    this.presenceHandlers.add(handler);
    handler(this.state);
    return () => this.presenceHandlers.delete(handler);
  }

  // Subscribe to edit operations
  onEdit(handler: EditHandler): () => void {
    this.editHandlers.add(handler);
    return () => this.editHandlers.delete(handler);
  }

  // Get current state
  getState(): PresenceState {
    return this.state;
  }

  // Get online users
  getOnlineUsers(): User[] {
    return Array.from(this.state.users.values());
  }

  // Get cursors for a file
  getCursorsForFile(file: string): CursorPosition[] {
    return Array.from(this.state.cursors.values()).filter(
      c => c.file === file && c.userId !== this.currentUser?.id
    );
  }

  // Get selections for a file
  getSelectionsForFile(file: string): Selection[] {
    return Array.from(this.state.selections.values()).filter(
      s => s.file === file && s.userId !== this.currentUser?.id
    );
  }

  private setupHandlers(): void {
    // User joined
    this.ws.on('collab:user-joined', (data) => {
      const user = data as User;
      this.state.users.set(user.id, user);
      this.notifyPresenceChange();
    });

    // User left
    this.ws.on('collab:user-left', (data) => {
      const { userId } = data as { userId: string };
      this.state.users.delete(userId);
      this.state.cursors.delete(userId);
      this.state.selections.delete(userId);
      this.notifyPresenceChange();
    });

    // Cursor update
    this.ws.on('collab:cursor', (data) => {
      const cursor = data as CursorPosition;
      if (cursor.userId !== this.currentUser?.id) {
        this.state.cursors.set(cursor.userId, cursor);
        this.notifyPresenceChange();
      }
    });

    // Selection update
    this.ws.on('collab:selection', (data) => {
      const selection = data as Selection;
      if (selection.userId !== this.currentUser?.id) {
        this.state.selections.set(selection.userId, selection);
        this.notifyPresenceChange();
      }
    });

    // Edit operation
    this.ws.on('collab:edit', (data) => {
      const operation = data as EditOperation;
      if (operation.userId !== this.currentUser?.id) {
        this.editHandlers.forEach(handler => handler(operation));
      }
    });

    // Sync state
    this.ws.on('collab:sync', (data) => {
      const { users, cursors, selections } = data as {
        users: User[];
        cursors: CursorPosition[];
        selections: Selection[];
      };

      this.state.users = new Map(users.map(u => [u.id, u]));
      this.state.cursors = new Map(cursors.map(c => [c.userId, c]));
      this.state.selections = new Map(selections.map(s => [s.userId, s]));
      this.notifyPresenceChange();
    });
  }

  private scheduleBufferFlush(): void {
    if (this.bufferTimeout) return;

    this.bufferTimeout = setTimeout(() => {
      this.flushBuffer();
      this.bufferTimeout = null;
    }, this.BUFFER_DELAY);
  }

  private flushBuffer(): void {
    if (this.operationBuffer.length === 0) return;

    const operations = this.operationBuffer;
    this.operationBuffer = [];

    this.ws.send('collab:edit-batch', { operations }).catch(() => {
      // Re-add to buffer on failure
      this.operationBuffer.unshift(...operations);
    });
  }

  private notifyPresenceChange(): void {
    this.presenceHandlers.forEach(handler => handler(this.state));
  }

  private generateId(): string {
    return `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const collaborationService = new CollaborationService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useCollaboration(sessionId: string, user: User) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    collaborationService.join(user, sessionId)
      .then(() => setIsConnected(true))
      .catch(setError);

    const unsubscribe = collaborationService.onPresenceChange((state) => {
      setOnlineUsers(Array.from(state.users.values()));
    });

    return () => {
      unsubscribe();
      collaborationService.leave();
    };
  }, [sessionId, user]);

  return { isConnected, onlineUsers, error };
}

export function useCollaborativeCursors(file: string) {
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);

  useEffect(() => {
    const unsubscribe = collaborationService.onPresenceChange(() => {
      setCursors(collaborationService.getCursorsForFile(file));
      setSelections(collaborationService.getSelectionsForFile(file));
    });

    return unsubscribe;
  }, [file]);

  const updateCursor = useCallback((line: number, column: number) => {
    collaborationService.updateCursor(file, line, column);
  }, [file]);

  const updateSelection = useCallback(
    (startLine: number, startColumn: number, endLine: number, endColumn: number) => {
      collaborationService.updateSelection(file, startLine, startColumn, endLine, endColumn);
    },
    [file]
  );

  return { cursors, selections, updateCursor, updateSelection };
}

export function useCollaborativeEditing(file: string) {
  const [pendingEdits, setPendingEdits] = useState<EditOperation[]>([]);

  useEffect(() => {
    const unsubscribe = collaborationService.onEdit((operation) => {
      if (operation.file === file) {
        setPendingEdits(prev => [...prev, operation]);
      }
    });

    return unsubscribe;
  }, [file]);

  const sendEdit = useCallback(
    (type: 'insert' | 'delete' | 'replace', line: number, column: number, text: string) => {
      collaborationService.sendEdit({
        file,
        type,
        position: { line, column },
        text,
      });
    },
    [file]
  );

  const clearPendingEdits = useCallback(() => {
    setPendingEdits([]);
  }, []);

  return { pendingEdits, sendEdit, clearPendingEdits };
}

// ============== USER COLORS ==============
const COLLABORATION_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  return COLLABORATION_COLORS[Math.abs(hash) % COLLABORATION_COLORS.length];
}

export default collaborationService;
