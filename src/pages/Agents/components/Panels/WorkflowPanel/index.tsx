import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useWorkflowStore, useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import { WorkflowCanvas } from './WorkflowCanvas';
import type { Workflow as UIWorkflow, WorkflowNode } from '../../../../../types';
import * as workflowsApi from '../../../../../api/workflows';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './WorkflowPanel.module.css';

// ============== WORKFLOW PANEL ==============
// Contract: reads [workflow, agent], writes [workflow]
// Forbidden: [execution, economy]

type ViewMode = 'list' | 'builder' | 'templates';

interface WorkflowPanelProps {
  className?: string;
}

// Node palette configuration
const NODE_PALETTE = [
  { type: 'agent', label: 'Agent', color: '#0ea5e9' },
  { type: 'condition', label: 'Condition', color: '#f59e0b' },
  { type: 'loop', label: 'Loop', color: '#a855f7' },
  { type: 'transform', label: 'Transform', color: '#ec4899' },
  { type: 'api', label: 'API Call', color: '#14b8a6' },
  { type: 'delay', label: 'Delay', color: '#6366f1' },
];

const WorkflowPanelComponent: React.FC<WorkflowPanelProps> = ({ className }) => {
  const storeWorkflows = useWorkflowStore(state => state.workflows);
  const selectedWorkflowId = useWorkflowStore(state => state.selectedWorkflowId);
  const { setWorkflows, addWorkflow, updateWorkflow, removeWorkflow, selectWorkflow, publishWorkflow, validateWorkflow, setLoading, setError } = useWorkflowStore();
  const agents = useAgentStore(state => state.agents);
  
  const [activeView, setActiveView] = useState<ViewMode>('list');
  const [workflowStats, setWorkflowStats] = useState<any>(null);

  const handleExportWorkflows = () => {
    const exportData = { exported_at: new Date().toISOString(), workflows, stats: workflowStats };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflows-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const workflows = Array.isArray(storeWorkflows) ? storeWorkflows : [];
  const selectedWorkflow = Array.isArray(workflows)
    ? workflows.find((w: any) => w.id === selectedWorkflowId) || null
    : null;

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiToUiWorkflow = useCallback((api: workflowsApi.Workflow): UIWorkflow => {
    const triggerConfig = (api.trigger_config || {}) as any;
    const uiGraph = triggerConfig.ui_graph || {};
    const nodes = Array.isArray(uiGraph.nodes) ? uiGraph.nodes : [];
    const edges = Array.isArray(uiGraph.edges) ? uiGraph.edges : [];

    const fallbackNodes =
      nodes.length > 0
        ? nodes
        : [
            { id: 'start', type: 'start', label: 'Start', position: { x: 100, y: 200 }, config: {} },
            { id: 'end', type: 'end', label: 'End', position: { x: 500, y: 200 }, config: {} },
          ];

    const status = (triggerConfig.ui_status as UIWorkflow['status']) || 'draft';
    const createdAt = api.created_at ? new Date(api.created_at) : new Date();
    const updatedAt = api.updated_at ? new Date(api.updated_at) : createdAt;
    const publishedAt = triggerConfig.ui_published_at ? new Date(triggerConfig.ui_published_at) : null;

    return {
      id: api.id,
      name: api.name,
      description: api.description || '',
      version: String(api.version ?? '1'),
      status,
      nodes: fallbackNodes,
      edges,
      variables: [],
      triggers: [],
      createdAt,
      updatedAt,
      publishedAt,
    };
  }, []);

  const uiToApiUpdate = useCallback((ui: UIWorkflow): workflowsApi.UpdateWorkflowRequest => {
    return {
      name: ui.name,
      description: ui.description,
      trigger_type: 'manual',
      trigger_config: {
        ui_graph: {
          nodes: ui.nodes,
          edges: ui.edges,
        },
        ui_status: ui.status,
        ui_published_at: ui.publishedAt ? ui.publishedAt.toISOString() : null,
      },
      steps: [],
    };
  }, []);

  const schedulePersist = useCallback(
    (ui: UIWorkflow) => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }

      persistTimerRef.current = setTimeout(async () => {
        persistTimerRef.current = null;
        try {
          await workflowsApi.updateWorkflow(ui.id, uiToApiUpdate(ui));
        } catch (e: any) {
          setError(e?.message || 'Failed to persist workflow');
        }
      }, 500);
    },
    [setError, uiToApiUpdate]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch workflows and stats in parallel
        const [apiWorkflows, statsRes] = await Promise.all([
          workflowsApi.listWorkflows(),
          fastapiClient.get('/api/v1/workflows/stats').catch(() => ({ data: null })),
        ]);
        if (statsRes.data) setWorkflowStats(statsRes.data);
        if (!mounted) return;
        setWorkflows(apiWorkflows.map(apiToUiWorkflow));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load workflows');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [apiToUiWorkflow, setError, setLoading, setWorkflows]);

  // Handle workflow updates
  const handleWorkflowUpdate = useCallback((workflowId: string, updates: Partial<UIWorkflow>) => {
    const base = workflows.find((w: any) => w.id === workflowId) as UIWorkflow | undefined;
    const next = base ? ({ ...base, ...updates, updatedAt: new Date() } as UIWorkflow) : undefined;
    updateWorkflow(workflowId, updates);
    if (next) schedulePersist(next);
  }, [schedulePersist, updateWorkflow, workflows]);

  const handleCreateWorkflow = useCallback(() => {
    if (!newWorkflowName.trim()) return;

    const draft: UIWorkflow = {
      id: `local-${Date.now()}`,
      name: newWorkflowName,
      description: '',
      version: '1',
      status: 'draft',
      nodes: [
        { id: 'start', type: 'start', label: 'Start', position: { x: 100, y: 200 }, config: {} },
        { id: 'end', type: 'end', label: 'End', position: { x: 500, y: 200 }, config: {} },
      ],
      edges: [],
      variables: [],
      triggers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
    };

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const created = await workflowsApi.createWorkflow({
          name: draft.name,
          description: draft.description,
          trigger_type: 'manual',
          trigger_config: {
            ui_graph: { nodes: draft.nodes, edges: draft.edges },
            ui_status: draft.status,
            ui_published_at: null,
          },
          steps: [],
        });

        const uiCreated = apiToUiWorkflow(created);
        addWorkflow(uiCreated);
        setNewWorkflowName('');
        selectWorkflow(uiCreated.id);
        setActiveView('builder');
      } catch (e: any) {
        setError(e?.message || 'Failed to create workflow');
      } finally {
        setLoading(false);
      }
    })();
  }, [addWorkflow, apiToUiWorkflow, newWorkflowName, selectWorkflow, setActiveView, setError, setLoading]);

  const handleValidateWorkflow = useCallback((workflowId: string) => {
    const ok = validateWorkflow(workflowId);
    if (!ok) return;

    const base = workflows.find((w: any) => w.id === workflowId) as UIWorkflow | undefined;
    if (base) schedulePersist({ ...base, status: 'validated', updatedAt: new Date() });
  }, [schedulePersist, validateWorkflow, workflows]);

  const handlePublishWorkflow = useCallback((workflowId: string) => {
    publishWorkflow(workflowId);
    const base = workflows.find((w: any) => w.id === workflowId) as UIWorkflow | undefined;
    if (base) {
      schedulePersist({
        ...base,
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [publishWorkflow, schedulePersist, workflows]);

  const handleDeleteWorkflow = useCallback((workflowId: string) => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await workflowsApi.deleteWorkflow(workflowId);
        removeWorkflow(workflowId);
      } catch (e: any) {
        setError(e?.message || 'Failed to delete workflow');
      } finally {
        setLoading(false);
      }
    })();
  }, [removeWorkflow, setError, setLoading]);

  const handleRunWorkflow = useCallback((workflowId: string) => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await workflowsApi.runWorkflow(workflowId, { input_data: {} });
      } catch (e: any) {
        setError(e?.message || 'Failed to run workflow');
      } finally {
        setLoading(false);
      }
    })();
  }, [setError, setLoading]);

  const getTemplateIcon = (iconType: string) => {
    switch (iconType) {
      case 'refresh': return <Icons.Refresh />;
      case 'external': return <Icons.External />;
      case 'edit': return <Icons.Edit />;
      case 'search': return <Icons.Search />;
      case 'code': return <Icons.Code />;
      case 'barChart': return <Icons.BarChart />;
      default: return <Icons.Fork />;
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return <Icons.Play />;
      case 'end': return <Icons.Stop />;
      case 'agent': return <Icons.Agents />;
      case 'condition': return <Icons.Fork />;
      case 'loop': return <Icons.Refresh />;
      case 'transform': return <Icons.Zap />;
      case 'api': return <Icons.External />;
      case 'delay': return <Icons.Clock />;
      default: return <Icons.Zap />;
    }
  };

  const handleNodesChange = useCallback((nodes: any[]) => {
    if (selectedWorkflow) {
      handleWorkflowUpdate(selectedWorkflow.id, { nodes: nodes as WorkflowNode[] });
    }
  }, [selectedWorkflow, handleWorkflowUpdate]);

  const handleEdgesChange = useCallback((edges: any[]) => {
    if (selectedWorkflow) {
      handleWorkflowUpdate(selectedWorkflow.id, { edges });
    }
  }, [selectedWorkflow, handleWorkflowUpdate]);

  const handleAddNode = useCallback((type: string) => {
    if (!selectedWorkflow) return;
    
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      position: { x: 200 + Math.random() * 100, y: 150 + Math.random() * 100 },
      config: {},
    };
    
    handleWorkflowUpdate(selectedWorkflow.id, { 
      nodes: [...selectedWorkflow.nodes, newNode] 
    });
  }, [selectedWorkflow, handleWorkflowUpdate]);

  const renderNodeConfig = () => {
    if (!selectedWorkflow || !selectedNodeId) return null;
    const node = selectedWorkflow.nodes.find(n => n.id === selectedNodeId);
    if (!node) return null;

    return (
      <div className={styles.configForm}>
        <div className={styles.configField}>
          <label>Label</label>
          <input 
            type="text" 
            value={node.label} 
            onChange={(e) => {
              const updatedNodes = selectedWorkflow.nodes.map(n =>
                n.id === selectedNodeId ? { ...n, label: e.target.value } : n
              );
              handleWorkflowUpdate(selectedWorkflow.id, { nodes: updatedNodes });
            }}
          />
        </div>
        <div className={styles.configField}>
          <label>Type</label>
          <span className={styles.configValue}>{node.type}</span>
        </div>
        {node.type === 'agent' && (
          <div className={styles.configField}>
            <label>Agent</label>
            <select>
              <option value="">Select Agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
        )}
        {node.type === 'api' && (
          <div className={styles.configField}>
            <label>API Endpoint</label>
            <input type="text" placeholder="https://api.example.com/endpoint" />
          </div>
        )}
        {node.type === 'condition' && (
          <div className={styles.configField}>
            <label>Condition</label>
            <input type="text" placeholder="e.g., result.success === true" />
          </div>
        )}
      </div>
    );
  };

  const getStatusColor = (status: UIWorkflow['status']) => {
    switch (status) {
      case 'published': return styles.published;
      case 'draft': return styles.draft;
      case 'validated': return styles.validated;
      case 'deprecated': return styles.deprecated;
      default: return '';
    }
  };

  const workflowTemplates = [
    { id: 't1', name: 'Data Pipeline', iconType: 'refresh', description: 'ETL workflow for data processing', nodes: 5 },
    { id: 't2', name: 'Customer Support', iconType: 'external', description: 'Automated support ticket handling', nodes: 8 },
    { id: 't3', name: 'Content Generation', iconType: 'edit', description: 'Multi-step content creation', nodes: 6 },
    { id: 't4', name: 'Research Assistant', iconType: 'search', description: 'Research and analysis workflow', nodes: 7 },
    { id: 't5', name: 'Code Review', iconType: 'code', description: 'Automated code review pipeline', nodes: 4 },
    { id: 't6', name: 'Report Generator', iconType: 'barChart', description: 'Automated report generation', nodes: 5 },
  ];

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Fork /> Workflow Builder</h2>
        <button onClick={handleExportWorkflows} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Icons.Download /> Export
        </button>
        <div className={styles.viewTabs}>
          {(['list', 'builder', 'templates'] as ViewMode[]).map(view => (
            <button
              key={view}
              className={`${styles.viewTab} ${activeView === view ? styles.active : ''}`}
              onClick={() => setActiveView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* List View */}
        {activeView === 'list' && (
          <>
            {workflowStats && (
              <div className={styles.statsBar}>
                <span><strong>{workflowStats.total_workflows}</strong> Total</span>
                <span><strong>{workflowStats.published}</strong> Published</span>
                <span><strong>{workflowStats.draft}</strong> Draft</span>
                <span><strong>{workflowStats.success_rate}%</strong> Success</span>
                <span><strong>{workflowStats.total_executions}</strong> Runs</span>
              </div>
            )}
            <div className={styles.createSection}>
              <input
                type="text"
                placeholder="New workflow name..."
                value={newWorkflowName}
                onChange={e => setNewWorkflowName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCreateWorkflow()}
              />
              <button className={styles.createBtn} onClick={handleCreateWorkflow}>
                <Icons.Plus /> Create
              </button>
            </div>

            <div className={styles.workflowsList}>
              <h3>Your Workflows</h3>
              {workflows.map((workflow: UIWorkflow) => (
                <div 
                  key={workflow.id}
                  className={`${styles.workflowCard} ${selectedWorkflowId === workflow.id ? styles.selected : ''}`}
                  onClick={() => selectWorkflow(workflow.id)}
                >
                  <div className={styles.workflowHeader}>
                    <span className={styles.workflowName}>{workflow.name}</span>
                    <span className={`${styles.statusBadge} ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                  <p className={styles.workflowDesc}>{workflow.description || 'No description'}</p>
                  <div className={styles.workflowMeta}>
                    <span><Icons.Fork /> {workflow.nodes.length} nodes</span>
                    <span>v{workflow.version}</span>
                    <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.workflowActions}>
                    <button onClick={(e) => { e.stopPropagation(); selectWorkflow(workflow.id); setActiveView('builder'); }}>
                      <Icons.Edit /> Edit
                    </button>
                    {workflow.status === 'draft' && (
                      <button onClick={(e) => { e.stopPropagation(); handleValidateWorkflow(workflow.id); }}>
                        <Icons.Check /> Validate
                      </button>
                    )}
                    {workflow.status === 'validated' && (
                      <button onClick={(e) => { e.stopPropagation(); handlePublishWorkflow(workflow.id); }}>
                        <Icons.Upload /> Publish
                      </button>
                    )}
                    <button 
                      className={styles.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(workflow.id); }}
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Builder View */}
        {activeView === 'builder' && (
          <div className={styles.builderSection}>
            {selectedWorkflow ? (
              <>
                <div className={styles.builderHeader}>
                  <h3>{selectedWorkflow.name}</h3>
                  <span className={`${styles.statusBadge} ${getStatusColor(selectedWorkflow.status)}`}>
                    {selectedWorkflow.status}
                  </span>
                  <div className={styles.builderActions}>
                    <button className={styles.secondaryBtn} onClick={() => handleAddNode('agent')}>
                      <Icons.Plus /> Add Node
                    </button>
                    <button className={styles.secondaryBtn} onClick={() => handleValidateWorkflow(selectedWorkflow.id)}>
                      <Icons.Check /> Validate
                    </button>
                    <button className={styles.primaryBtn} onClick={() => handleRunWorkflow(selectedWorkflow.id)}>
                      <Icons.Play /> Run
                    </button>
                  </div>
                </div>
                <div className={styles.builderBody}>
                  <div className={styles.nodesPalette}>
                    <h4>Node Palette</h4>
                    <div className={styles.paletteGrid}>
                      {NODE_PALETTE.map(node => (
                        <div 
                          key={node.type} 
                          className={styles.paletteNode}
                          onClick={() => handleAddNode(node.type)}
                          style={{ borderColor: node.color }}
                        >
                          {getNodeIcon(node.type)}
                          <span>{node.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.paletteInfo}>
                      <p>Click a node to add it to the canvas</p>
                      <p>Drag nodes to reposition</p>
                      <p>Connect nodes by dragging from output to input</p>
                    </div>
                  </div>
                  <div className={styles.canvasArea}>
                    <WorkflowCanvas
                      nodes={selectedWorkflow.nodes as any}
                      edges={selectedWorkflow.edges as any}
                      onNodesChange={handleNodesChange}
                      onEdgesChange={handleEdgesChange}
                      onNodeSelect={setSelectedNodeId}
                      selectedNodeId={selectedNodeId}
                    />
                  </div>
                  {selectedNodeId && (
                    <div className={styles.nodeConfig}>
                      <h4>Node Configuration</h4>
                      {renderNodeConfig()}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <Icons.Fork />
                <p>Select a workflow to edit</p>
                <button className={styles.primaryBtn} onClick={() => setActiveView('list')}>
                  View Workflows
                </button>
              </div>
            )}
          </div>
        )}

        {/* Templates View */}
        {activeView === 'templates' && (
          <div className={styles.templatesSection}>
            <h3>Workflow Templates</h3>
            <div className={styles.templatesGrid}>
              {workflowTemplates.map(template => (
                <div key={template.id} className={styles.templateCard}>
                  <span className={styles.templateIcon}>{getTemplateIcon(template.iconType)}</span>
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  <div className={styles.templateMeta}>
                    <span>{template.nodes} nodes</span>
                  </div>
                  <button className={styles.useTemplateBtn}>
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const WorkflowPanel = memo(WorkflowPanelComponent);
export default WorkflowPanel;
