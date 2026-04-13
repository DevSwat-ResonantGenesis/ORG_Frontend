import { lazy } from 'react';

// ============== LAZY LOADED PANELS ==============
// All panels are lazy loaded for optimal bundle splitting

export const AgentsPanel = lazy(() => import('./AgentsPanel'));
export const FactoryPanel = lazy(() => import('./FactoryPanel'));
export const ExecutionPanel = lazy(() => import('./ExecutionPanel'));
export const WorkflowPanel = lazy(() => import('./WorkflowPanel'));
export const SettingsPanel = lazy(() => import('./SettingsPanel'));
export const MonitorPanel = lazy(() => import('./MonitorPanel'));
export const MemoryPanel = lazy(() => import('./MemoryPanel'));
export const GoalsPanel = lazy(() => import('./GoalsPanel'));

// Panel registry for dynamic loading
export const PANEL_REGISTRY = {
  agents: AgentsPanel,
  factory: FactoryPanel,
  execution: ExecutionPanel,
  workflow: WorkflowPanel,
  settings: SettingsPanel,
  monitor: MonitorPanel,
  memory: MemoryPanel,
  goals: GoalsPanel,
} as const;

export type PanelId = keyof typeof PANEL_REGISTRY;
