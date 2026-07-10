import type { TerminalTab } from './TerminalTabs';

// Terminal ownership is keyed only by terminal_id, not user_id+terminal_id
// (see RG_Terminal_Sandbox/app/docker_manager.py's container_name_for), so a
// hardcoded literal like "1" would be a single globally-shared container
// name across every user on the platform - the first user to ever open a
// terminal "owns" it forever and everyone else gets rejected. Persist a
// randomly generated id in sessionStorage (keyed per project) so toggling
// the terminal panel closed/open within the same browser session reconnects
// to the same container instead of generating a fresh id (and abandoning
// the old one) on every remount.
//
// Shared by the IDE terminal panel (CursorTerminalPanel) and the chat
// split-view terminal (ResonantChat/SplitView/components/Terminal) so that
// opening a terminal for the same projectId from either surface resolves to
// the same RG_Terminal_Sandbox container.
export const storageKeyFor = (projectId?: string) => `ide-terminal-tabs-${projectId || 'default'}`;

export const loadInitialTabs = (projectId?: string): TerminalTab[] => {
  try {
    const raw = sessionStorage.getItem(storageKeyFor(projectId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fall through to a fresh tab
  }
  return [{ id: crypto.randomUUID(), name: 'Terminal 1', content: '', active: true }];
};

// Id of the default (first) terminal tab for a project, creating and
// persisting one if none exists yet.
export const getOrCreateDefaultTerminalId = (projectId?: string): string => {
  const tabs = loadInitialTabs(projectId);
  try {
    sessionStorage.setItem(storageKeyFor(projectId), JSON.stringify(tabs));
  } catch {
    // sessionStorage unavailable (private mode, quota) - not fatal, just
    // loses continuity across panel toggles/remounts this session.
  }
  return tabs[0].id;
};
