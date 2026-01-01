// ============== PANEL CONTRACT DEFINITIONS ==============
// Each panel must declare what state domains it reads/writes

export type StateDomain = 
  | 'agent' 
  | 'execution' 
  | 'workflow' 
  | 'economy' 
  | 'network' 
  | 'session' 
  | 'ui';

export type EventType =
  | 'agent_created' | 'agent_updated' | 'agent_deleted' | 'agent_started' | 'agent_stopped'
  | 'execution_started' | 'execution_completed' | 'execution_failed'
  | 'workflow_published' | 'workflow_validated'
  | 'transaction_completed'
  | 'connection_established' | 'connection_lost';

export interface PanelContract {
  id: string;
  name: string;
  reads: StateDomain[];
  writes: StateDomain[];
  events: EventType[];
  forbidden: StateDomain[];
}

// ============== PANEL CONTRACTS ==============

export const PANEL_CONTRACTS: Record<string, PanelContract> = {
  agents: {
    id: 'agents',
    name: 'Agents Panel',
    reads: ['agent', 'execution'],
    writes: ['agent'],
    events: ['agent_created', 'agent_updated', 'agent_deleted', 'agent_started', 'agent_stopped'],
    forbidden: ['economy', 'network'],
  },
  factory: {
    id: 'factory',
    name: 'Factory Panel',
    reads: ['agent'],
    writes: ['agent'],
    events: ['agent_created'],
    forbidden: ['execution', 'economy'],
  },
  workflow: {
    id: 'workflow',
    name: 'Workflow Panel',
    reads: ['workflow', 'agent'],
    writes: ['workflow'],
    events: ['workflow_published', 'workflow_validated'],
    forbidden: ['execution', 'economy'],
  },
  execution: {
    id: 'execution',
    name: 'Execution Panel',
    reads: ['execution', 'agent', 'workflow'],
    writes: ['execution'],
    events: ['execution_started', 'execution_completed', 'execution_failed'],
    forbidden: ['economy'],
  },
  economy: {
    id: 'economy',
    name: 'Economy Panel',
    reads: ['economy', 'agent'],
    writes: ['economy'],
    events: ['transaction_completed'],
    forbidden: ['workflow'],
  },
  settings: {
    id: 'settings',
    name: 'Settings Panel',
    reads: ['session', 'network', 'ui'],
    writes: ['network', 'ui'],
    events: [],
    forbidden: ['execution', 'economy'],
  },
  external: {
    id: 'external',
    name: 'External Protocol Panel',
    reads: ['network'],
    writes: ['network'],
    events: ['connection_established', 'connection_lost'],
    forbidden: ['agent', 'execution'],
  },
  monitor: {
    id: 'monitor',
    name: 'System Monitor Panel',
    reads: ['execution', 'agent', 'network'],
    writes: [],
    events: [],
    forbidden: ['economy'],
  },
};

// Contract validation helper
export function validatePanelAccess(
  panelId: string, 
  domain: StateDomain, 
  accessType: 'read' | 'write'
): boolean {
  const contract = PANEL_CONTRACTS[panelId];
  if (!contract) return false;
  
  if (contract.forbidden.includes(domain)) {
    console.error(`Panel ${panelId} is forbidden from accessing ${domain}`);
    return false;
  }
  
  if (accessType === 'read') {
    return contract.reads.includes(domain);
  }
  
  return contract.writes.includes(domain);
}
