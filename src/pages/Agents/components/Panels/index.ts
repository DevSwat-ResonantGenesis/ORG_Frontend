import { lazy } from 'react';

// ============== LAZY LOADED PANELS ==============
// All panels are lazy loaded for optimal bundle splitting

export const AgentsPanel = lazy(() => import('./AgentsPanel'));
export const FactoryPanel = lazy(() => import('./FactoryPanel'));
export const EconomyPanel = lazy(() => import('./EconomyPanel'));
export const ExecutionPanel = lazy(() => import('./ExecutionPanel'));
export const WorkflowPanel = lazy(() => import('./WorkflowPanel'));
export const SettingsPanel = lazy(() => import('./SettingsPanel'));
export const MonitorPanel = lazy(() => import('./MonitorPanel'));
export const ChatPanel = lazy(() => import('./ChatPanel'));
export const AuditPanel = lazy(() => import('./AuditPanel'));
export const GovernancePanel = lazy(() => import('./GovernancePanel'));
export const MemoryPanel = lazy(() => import('./MemoryPanel'));
export const CapabilitiesPanel = lazy(() => import('./CapabilitiesPanel'));
export const GoalsPanel = lazy(() => import('./GoalsPanel'));
export const DebugPanel = lazy(() => import('./DebugPanel'));
export const UtilityPanel = lazy(() => import('./UtilityPanel'));
export const NegotiationPanel = lazy(() => import('./NegotiationPanel'));
export const ExternalPanel = lazy(() => import('./ExternalPanel'));

// Panel registry for dynamic loading
export const PANEL_REGISTRY = {
  agents: AgentsPanel,
  factory: FactoryPanel,
  economy: EconomyPanel,
  execution: ExecutionPanel,
  workflow: WorkflowPanel,
  settings: SettingsPanel,
  monitor: MonitorPanel,
  chat: ChatPanel,
  audit: AuditPanel,
  governance: GovernancePanel,
  memory: MemoryPanel,
  capabilities: CapabilitiesPanel,
  goals: GoalsPanel,
  debug: DebugPanel,
  utility: UtilityPanel,
  negotiation: NegotiationPanel,
  external: ExternalPanel,
} as const;

export type PanelId = keyof typeof PANEL_REGISTRY;
