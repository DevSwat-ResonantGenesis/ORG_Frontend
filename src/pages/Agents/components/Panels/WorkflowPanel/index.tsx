import React, { memo, useState, useCallback } from 'react';
import { useWorkflowStore, useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import { WorkflowCanvas } from './WorkflowCanvas';
import type { Workflow, WorkflowNode } from '../../../../../types';
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
  const { addWorkflow, updateWorkflow, removeWorkflow, selectWorkflow, publishWorkflow, validateWorkflow } = useWorkflowStore();
  const agents = useAgentStore(state => state.agents);
  
  const [activeView, setActiveView] = useState<ViewMode>('list');
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [localWorkflows, setLocalWorkflows] = useState<Workflow[]>([
    {
      id: 'wf-1',
      name: 'Data Processing Pipeline',
      description: 'Extract, transform, and load data from multiple sources',
      version: '1.2.0',
      status: 'published',
      nodes: [
        { id: 'n1', type: 'start', label: 'Start', position: { x: 100, y: 100 }, config: {} },
        { id: 'n2', type: 'agent', label: 'Data Extractor', position: { x: 250, y: 100 }, config: { agentId: 'agent-1' } },
        { id: 'n3', type: 'agent', label: 'Transform', position: { x: 400, y: 100 }, config: {} },
        { id: 'n4', type: 'end', label: 'End', position: { x: 550, y: 100 }, config: {} },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '' },
        { id: 'e2', source: 'n2', target: 'n3', label: '' },
        { id: 'e3', source: 'n3', target: 'n4', label: '' },
      ],
      variables: [],
      triggers: [],
      createdAt: new Date(Date.now() - 86400000 * 7),
      updatedAt: new Date(Date.now() - 86400000),
      publishedAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: 'wf-2',
      name: 'Customer Onboarding',
      description: 'Automated customer onboarding workflow',
      version: '2.0.0',
      status: 'draft',
      nodes: [
        { id: 'n1', type: 'start', label: 'Start', position: { x: 100, y: 100 }, config: {} },
        { id: 'n2', type: 'agent', label: 'Welcome Agent', position: { x: 250, y: 100 }, config: {} },
        { id: 'n3', type: 'end', label: 'End', position: { x: 400, y: 100 }, config: {} },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: '' },
        { id: 'e2', source: 'n2', target: 'n3', label: '' },
      ],
      variables: [],
      triggers: [],
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(),
      publishedAt: null,
    },
  ] as Workflow[]);

  // Use real workflows if available, otherwise use local mock data
  const workflows = Array.isArray(storeWorkflows) && storeWorkflows.length > 0 ? storeWorkflows : localWorkflows;
  const selectedWorkflow = Array.isArray(workflows) ? workflows.find((w: any) => w.id === selectedWorkflowId) || null : null;

  // Handle workflow updates
  const handleWorkflowUpdate = useCallback((workflowId: string, updates: Partial<Workflow>) => {
    if (storeWorkflows.length === 0) {
      setLocalWorkflows(prev => prev.map((w: Workflow) => 
        w.id === workflowId ? { ...w, ...updates, updatedAt: new Date() } : w
      ));
    } else {
      updateWorkflow(workflowId, updates);
    }
  }, [storeWorkflows.length, updateWorkflow]);

  const handleCreateWorkflow = useCallback(() => {
    if (!newWorkflowName.trim()) return;
    
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: newWorkflowName,
      description: '',
      version: '1.0.0',
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
    
    addWorkflow(newWorkflow);
    setNewWorkflowName('');
    selectWorkflow(newWorkflow.id);
    setActiveView('builder');
  }, [newWorkflowName, addWorkflow, selectWorkflow]);

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

  const getStatusColor = (status: Workflow['status']) => {
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
              {workflows.map((workflow: Workflow) => (
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
                      <button onClick={(e) => { e.stopPropagation(); validateWorkflow(workflow.id); }}>
                        <Icons.Check /> Validate
                      </button>
                    )}
                    {workflow.status === 'validated' && (
                      <button onClick={(e) => { e.stopPropagation(); publishWorkflow(workflow.id); }}>
                        <Icons.Upload /> Publish
                      </button>
                    )}
                    <button 
                      className={styles.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); removeWorkflow(workflow.id); }}
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
                    <button className={styles.secondaryBtn} onClick={() => validateWorkflow(selectedWorkflow.id)}>
                      <Icons.Check /> Validate
                    </button>
                    <button className={styles.primaryBtn}>
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
