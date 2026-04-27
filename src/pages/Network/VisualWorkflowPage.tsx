import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Panel,
  Handle,
  Position,
  NodeProps,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, Trash2, ArrowLeft, Layout, Settings, X, Copy, Undo2, Redo2, Download, Upload, Eye, Zap, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import fastapiClient from '../../api/fastapiClient';

// ── Types ──
type WorkflowStepType =
  | 'http_request'
  | 'llm_completion'
  | 'memory_search'
  | 'agent_execute'
  | 'send_notification'
  | 'transform_data'
  | 'condition'
  | 'delay'
  | 'code_execute'
  | 'webhook_trigger'
  | 'data_filter'
  | 'aggregator'
  | 'web_search'
  | 'email_send'
  | 'loop'
  | 'parallel'
  | 'database_query';

interface StepNodeData {
  label: string;
  stepType: WorkflowStepType;
  config: Record<string, any>;
  status?: 'idle' | 'running' | 'completed' | 'failed';
  description?: string;
}

const STEP_PALETTE: { type: WorkflowStepType; label: string; color: string; icon: string; desc: string }[] = [
  { type: 'webhook_trigger', label: 'Webhook Trigger', color: '#f97316', icon: '🔔', desc: 'Start workflow from external webhook' },
  { type: 'http_request', label: 'HTTP Request', color: '#3b82f6', icon: '🌐', desc: 'Call any REST API endpoint' },
  { type: 'llm_completion', label: 'LLM Call', color: '#8b5cf6', icon: '🧠', desc: 'Generate text with AI models (live providers)' },
  { type: 'web_search', label: 'Web Search', color: '#14b8a6', icon: '🔎', desc: 'Search the internet via DuckDuckGo/Brave' },
  { type: 'memory_search', label: 'Memory Search', color: '#06b6d4', icon: '🧲', desc: 'Search Hash Sphere semantic memory' },
  { type: 'agent_execute', label: 'Run Agent', color: '#f59e0b', icon: '🤖', desc: 'Execute an autonomous agent by ID' },
  { type: 'code_execute', label: 'Run Code', color: '#22c55e', icon: '💻', desc: 'Execute Python or JavaScript code' },
  { type: 'email_send', label: 'Send Email', color: '#e11d48', icon: '✉️', desc: 'Send email via SMTP or SendGrid' },
  { type: 'send_notification', label: 'Notification', color: '#10b981', icon: '📧', desc: 'Send Slack, Discord, or webhook notification' },
  { type: 'transform_data', label: 'Transform', color: '#6366f1', icon: '🔄', desc: 'Map, filter, transform JSON data' },
  { type: 'condition', label: 'If/Else', color: '#ef4444', icon: '🔀', desc: 'Branch based on expression' },
  { type: 'loop', label: 'Loop', color: '#a855f7', icon: '🔁', desc: 'Iterate over array items' },
  { type: 'parallel', label: 'Parallel', color: '#0ea5e9', icon: '⚡', desc: 'Run multiple branches concurrently' },
  { type: 'data_filter', label: 'Filter', color: '#d946ef', icon: '🧹', desc: 'Filter array data by rules' },
  { type: 'aggregator', label: 'Aggregator', color: '#ec4899', icon: '📊', desc: 'Merge multiple input streams' },
  { type: 'database_query', label: 'Database', color: '#7c3aed', icon: '🗄️', desc: 'Query PostgreSQL, MongoDB, or Redis' },
  { type: 'delay', label: 'Delay', color: '#78716c', icon: '⏱️', desc: 'Wait N seconds before continuing' },
];

const COLORS: Record<string, string> = Object.fromEntries(STEP_PALETTE.map(s => [s.type, s.color]));
const ICONS: Record<string, string> = Object.fromEntries(STEP_PALETTE.map(s => [s.type, s.icon]));

// ── Config fields per step type ──
// NOTE: LLM model options are updated dynamically from live providers in ConfigPanel
// defaultValue is pre-populated into node config when a node is first created
type ConfigField = { key: string; label: string; type: 'text' | 'textarea' | 'select' | 'number'; options?: string[]; defaultValue?: string | number };
const CONFIG_FIELDS: Record<WorkflowStepType, ConfigField[]> = {
  webhook_trigger: [
    { key: 'path', label: 'Webhook Path', type: 'text', defaultValue: '/webhook/incoming' },
    { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'GET', 'PUT'], defaultValue: 'POST' },
    { key: 'secret', label: 'Verification Secret', type: 'text' },
    { key: 'response_mode', label: 'Response Mode', type: 'select', options: ['sync', 'async'], defaultValue: 'async' },
  ],
  http_request: [
    { key: 'url', label: 'URL', type: 'text' },
    { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], defaultValue: 'GET' },
    { key: 'headers', label: 'Headers (JSON)', type: 'textarea', defaultValue: '{}' },
    { key: 'body', label: 'Body (JSON)', type: 'textarea', defaultValue: '{}' },
    { key: 'timeout', label: 'Timeout (ms)', type: 'number', defaultValue: 30000 },
  ],
  llm_completion: [
    { key: 'provider', label: 'Provider', type: 'select', options: ['groq', 'openai', 'anthropic', 'google'], defaultValue: 'groq' },
    { key: 'model', label: 'Model', type: 'select', options: ['groq/llama-3.3-70b-versatile', 'groq/llama-3.1-8b-instant', 'groq/mixtral-8x7b-32768', 'openai/gpt-4o', 'openai/gpt-4o-mini', 'anthropic/claude-opus-4-6-20250514', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro'], defaultValue: 'groq/llama-3.3-70b-versatile' },
    { key: 'prompt', label: 'System Prompt', type: 'textarea', defaultValue: 'You are an expert assistant.' },
    { key: 'user_message', label: 'User Message (use {{steps.X.output}} for dynamic input)', type: 'textarea' },
    { key: 'max_tokens', label: 'Max Tokens', type: 'number', defaultValue: 2048 },
    { key: 'temperature', label: 'Temperature (0-2)', type: 'number', defaultValue: 0.7 },
  ],
  web_search: [
    { key: 'query', label: 'Search Query', type: 'text' },
    { key: 'engine', label: 'Search Engine', type: 'select', options: ['duckduckgo', 'brave', 'google'], defaultValue: 'duckduckgo' },
    { key: 'max_results', label: 'Max Results', type: 'number', defaultValue: 10 },
    { key: 'region', label: 'Region', type: 'select', options: ['us-en', 'uk-en', 'de-de', 'fr-fr', 'global'], defaultValue: 'global' },
    { key: 'time_range', label: 'Time Range', type: 'select', options: ['any', 'day', 'week', 'month', 'year'], defaultValue: 'any' },
  ],
  memory_search: [
    { key: 'query', label: 'Search Query', type: 'text' },
    { key: 'namespace', label: 'Namespace', type: 'text', defaultValue: 'default' },
    { key: 'top_k', label: 'Results Limit', type: 'number', defaultValue: 5 },
  ],
  agent_execute: [
    { key: 'agent_id', label: 'Agent ID', type: 'text' },
    { key: 'goal', label: 'Goal / Task Description', type: 'textarea' },
    { key: 'max_steps', label: 'Max Steps', type: 'number', defaultValue: 10 },
    { key: 'timeout', label: 'Timeout (seconds)', type: 'number', defaultValue: 300 },
  ],
  code_execute: [
    { key: 'language', label: 'Language', type: 'select', options: ['python', 'javascript'], defaultValue: 'python' },
    { key: 'code', label: 'Code', type: 'textarea', defaultValue: 'result = input_data\noutput = {"status": "ok", "data": result}' },
    { key: 'timeout', label: 'Timeout (ms)', type: 'number', defaultValue: 30000 },
  ],
  email_send: [
    { key: 'to', label: 'To (email address)', type: 'text' },
    { key: 'subject', label: 'Subject', type: 'text' },
    { key: 'body', label: 'Email Body (HTML or text)', type: 'textarea' },
    { key: 'from_name', label: 'From Name', type: 'text', defaultValue: 'DevSwat Workflows' },
    { key: 'provider', label: 'Email Provider', type: 'select', options: ['platform_smtp', 'sendgrid', 'ses', 'custom_smtp'], defaultValue: 'platform_smtp' },
    { key: 'attach_output', label: 'Attach Previous Output As', type: 'select', options: ['none', 'pdf', 'json', 'csv'], defaultValue: 'none' },
  ],
  send_notification: [
    { key: 'channel', label: 'Channel', type: 'select', options: ['slack', 'discord', 'webhook', 'telegram'], defaultValue: 'slack' },
    { key: 'webhook_url', label: 'Webhook URL', type: 'text' },
    { key: 'message', label: 'Message', type: 'textarea' },
  ],
  transform_data: [
    { key: 'operation', label: 'Operation', type: 'select', options: ['map', 'filter', 'reduce', 'flatten', 'sort', 'unique', 'jq', 'jsonpath', 'template'], defaultValue: 'map' },
    { key: 'expression', label: 'Expression / Template', type: 'textarea' },
    { key: 'output_key', label: 'Output Key Name', type: 'text', defaultValue: 'result' },
  ],
  condition: [
    { key: 'expression', label: 'Condition (JS expression)', type: 'text' },
    { key: 'true_label', label: 'True Branch Label', type: 'text', defaultValue: 'True' },
    { key: 'false_label', label: 'False Branch Label', type: 'text', defaultValue: 'False' },
  ],
  loop: [
    { key: 'items_path', label: 'Items Array Path', type: 'text' },
    { key: 'max_iterations', label: 'Max Iterations', type: 'number', defaultValue: 100 },
    { key: 'parallel', label: 'Parallel Execution', type: 'select', options: ['false', 'true'], defaultValue: 'false' },
    { key: 'batch_size', label: 'Batch Size (if parallel)', type: 'number', defaultValue: 5 },
  ],
  parallel: [
    { key: 'branches', label: 'Number of Branches', type: 'number', defaultValue: 3 },
    { key: 'wait_mode', label: 'Wait Mode', type: 'select', options: ['all', 'any', 'first_success'], defaultValue: 'all' },
    { key: 'timeout', label: 'Timeout (seconds)', type: 'number', defaultValue: 60 },
  ],
  data_filter: [
    { key: 'field', label: 'Field Path', type: 'text' },
    { key: 'operator', label: 'Operator', type: 'select', options: ['equals', 'not_equals', 'contains', 'not_contains', 'gt', 'lt', 'gte', 'lte', 'regex', 'exists', 'is_unique'], defaultValue: 'equals' },
    { key: 'value', label: 'Value', type: 'text' },
    { key: 'deduplicate_key', label: 'Deduplicate By Field', type: 'text' },
  ],
  aggregator: [
    { key: 'mode', label: 'Aggregation Mode', type: 'select', options: ['merge', 'concat', 'first', 'last', 'all', 'sum', 'count'], defaultValue: 'merge' },
    { key: 'wait_for', label: 'Wait For (inputs count)', type: 'number', defaultValue: 2 },
  ],
  database_query: [
    { key: 'db_type', label: 'Database Type', type: 'select', options: ['postgresql', 'mongodb', 'redis', 'elasticsearch'], defaultValue: 'postgresql' },
    { key: 'connection_string', label: 'Connection String', type: 'text' },
    { key: 'query', label: 'Query', type: 'textarea' },
    { key: 'params', label: 'Parameters (JSON)', type: 'textarea', defaultValue: '[]' },
  ],
  delay: [
    { key: 'duration', label: 'Duration (seconds)', type: 'number', defaultValue: 5 },
    { key: 'until', label: 'Or Wait Until (ISO datetime)', type: 'text' },
  ],
};

// ── Custom Node ──
const StepNodeComponent = React.memo(({ data, selected }: NodeProps<StepNodeData>) => {
  const color = COLORS[data.stepType] || '#6366f1';
  const icon = ICONS[data.stepType] || '⚙️';
  const statusColors: Record<string, string> = { idle: '#475569', running: '#f59e0b', completed: '#10b981', failed: '#ef4444' };
  const st = data.status || 'idle';

  return (
    <div style={{
      background: '#161616',
      border: `2px solid ${selected ? 'rgba(255,255,255,0.7)' : color}`,
      borderRadius: 10,
      minWidth: 200,
      maxWidth: 260,
      boxShadow: selected ? `0 0 16px ${color}50` : '0 2px 10px rgba(0,0,0,0.3)',
      transition: 'all 0.2s',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a0c' }} />

      {/* Header */}
      <div style={{
        background: `${color}18`,
        borderBottom: `1px solid ${color}30`,
        padding: '6px 12px',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', flex: 1 }}>
          {data.stepType.replace(/_/g, ' ')}
        </span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[st], flexShrink: 0 }} />
      </div>

      {/* Body */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{data.label}</div>
        {data.description && (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, lineHeight: 1.3 }}>{data.description}</div>
        )}
        {data.config?.url && (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220, fontFamily: 'monospace' }}>
            {data.config.method || 'GET'} {data.config.url}
          </div>
        )}
        {data.config?.model && (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 4, fontFamily: 'monospace' }}>{data.config.model}</div>
        )}
        {data.config?.expression && (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 4, fontFamily: 'monospace' }}>if ({data.config.expression})</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: color, width: 10, height: 10, border: '2px solid #0a0a0c' }} />
      {data.stepType === 'condition' && (
        <>
          <Handle type="source" position={Position.Right} id="true" style={{ background: '#10b981', width: 8, height: 8, border: '2px solid #0a0a0c', top: '65%' }} />
          <Handle type="source" position={Position.Left} id="false" style={{ background: '#ef4444', width: 8, height: 8, border: '2px solid #0a0a0c', top: '65%' }} />
        </>
      )}
    </div>
  );
});
StepNodeComponent.displayName = 'StepNodeComponent';

const nodeTypes: NodeTypes = { stepNode: StepNodeComponent };

// ── Config Panel ──
interface ConfigPanelProps {
  node: Node<StepNodeData> | null;
  onUpdate: (id: string, data: Partial<StepNodeData>) => void;
  onClose: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ node, onUpdate, onClose }) => {
  const [liveModels, setLiveModels] = useState<string[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Fetch live LLM providers when an LLM node is selected
  useEffect(() => {
    if (!node) return;
    const data = node.data as StepNodeData;
    if (data.stepType === 'llm_completion' && liveModels.length === 0) {
      setLoadingProviders(true);
      fastapiClient.get('/resonant-chat/providers').then(res => {
        const providers = res.data?.providers || [];
        const models: string[] = [];
        providers.forEach((p: any) => {
          if (p.live || p.status === 'online') {
            const provId = p.id || p.name || '';
            (p.models || []).forEach((m: any) => {
              const modelId = typeof m === 'string' ? m : (m.id || m.name || '');
              if (modelId) models.push(`${provId}/${modelId}`);
            });
            if ((p.models || []).length === 0 && provId) {
              models.push(provId);
            }
          }
        });
        // Merge with default options if live fetch returned results
        if (models.length > 0) {
          setLiveModels(models);
        }
      }).catch(() => {}).finally(() => setLoadingProviders(false));
    }
  }, [node, liveModels.length]);

  if (!node) return null;
  const data = node.data as StepNodeData;
  const fields = CONFIG_FIELDS[data.stepType] || [];
  const color = COLORS[data.stepType] || '#6366f1';
  const icon = ICONS[data.stepType] || '⚙️';
  const palette = STEP_PALETTE.find(s => s.type === data.stepType);

  // Get options for a field, with live override for LLM models
  const getFieldOptions = (field: typeof fields[0]): string[] => {
    if (data.stepType === 'llm_completion' && field.key === 'model' && liveModels.length > 0) {
      return liveModels;
    }
    return field.options || [];
  };

  return (
    <div style={{
      width: 340,
      background: '#161616',
      borderLeft: '1px solid rgba(255,255,255,0.06)',
      padding: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>Configure: {data.stepType.replace(/_/g, ' ')}</span>
          {palette?.desc && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 2 }}>{palette.desc}</div>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={16} color="rgba(255,255,255,0.35)" />
        </button>
      </div>

      {loadingProviders && (
        <div style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
          Loading live providers...
        </div>
      )}

      <div style={{ padding: 16, flex: 1 }}>
        {/* Step Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
            Step Name
          </label>
          <input
            value={data.label}
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              color: 'rgba(255,255,255,0.85)',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
            Description
          </label>
          <input
            value={data.description || ''}
            onChange={(e) => onUpdate(node.id, { description: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              color: 'rgba(255,255,255,0.85)',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Config Fields */}
        {fields.map((field) => (
          <div key={field.key} style={{ marginBottom: 14 }}>
            <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={data.config?.[field.key] || ''}
                onChange={(e) => onUpdate(node.id, { config: { ...data.config, [field.key]: e.target.value } })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select...</option>
                {getFieldOptions(field).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={data.config?.[field.key] || ''}
                onChange={(e) => onUpdate(node.id, { config: { ...data.config, [field.key]: e.target.value } })}
                rows={field.key === 'code' ? 8 : 3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 12,
                  fontFamily: field.key === 'code' || field.key === 'query' ? 'monospace' : 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={data.config?.[field.key] ?? ''}
                onChange={(e) => onUpdate(node.id, {
                  config: { ...data.config, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }
                })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}
          </div>
        ))}

        {/* Variable reference helper */}
        <div style={{
          marginTop: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, marginBottom: 4 }}>VARIABLE REFERENCE</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, lineHeight: 1.5 }}>
            Use <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{'{{steps.<name>.output}}'}</span> to reference output from a previous step.
            Use <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{'{{env.<KEY>}}'}</span> for environment variables.
          </div>
        </div>
      </div>

      {/* Panel Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
            {data.stepType.replace(/_/g, ' ')} • Node {node.id.split('_').pop()}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Main Canvas (inner — needs ReactFlowProvider) ──
function VisualWorkflowInner() {
  const navigate = useNavigate();
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const nodeCounter = useRef(0);

  // Push to undo history
  const pushHistory = useCallback(() => {
    setHistory(prev => {
      const newH = prev.slice(0, historyIdx + 1);
      newH.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
      return newH.slice(-30); // keep 30 max
    });
    setHistoryIdx(prev => Math.min(prev + 1, 29));
  }, [nodes, edges, historyIdx]);

  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const prev = history[historyIdx - 1];
    if (prev) {
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIdx(i => i - 1);
    }
  }, [history, historyIdx, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const next = history[historyIdx + 1];
    if (next) {
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIdx(i => i + 1);
    }
  }, [history, historyIdx, setNodes, setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({ ...connection, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds));
    pushHistory();
  }, [setEdges, pushHistory]);

  const addNode = useCallback((stepType: WorkflowStepType) => {
    const palette = STEP_PALETTE.find(s => s.type === stepType)!;
    nodeCounter.current++;
    const id = `step_${nodeCounter.current}_${Date.now()}`;
    // Calculate good position
    const viewport = reactFlowInstance.getViewport();
    const x = (-viewport.x + 400) / viewport.zoom + Math.random() * 100;
    const y = (-viewport.y + 200) / viewport.zoom + nodes.length * 40;
    
    const newNode: Node<StepNodeData> = {
      id,
      type: 'stepNode',
      position: { x, y },
      data: {
        label: palette.label,
        stepType,
        config: Object.fromEntries(
          (CONFIG_FIELDS[stepType] || [])
            .filter(f => f.defaultValue !== undefined)
            .map(f => [f.key, f.defaultValue])
        ),
        description: palette.desc,
      },
    };
    setNodes(nds => [...nds, newNode]);
    setSelectedNodeId(id);
    setShowConfig(true);
    pushHistory();
  }, [nodes.length, setNodes, pushHistory, reactFlowInstance]);

  const deleteSelected = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes(nds => nds.filter(n => n.id !== selectedNodeId));
    setEdges(eds => eds.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
    setShowConfig(false);
    pushHistory();
  }, [selectedNodeId, setNodes, setEdges, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (!selectedNodeId) return;
    const original = nodes.find(n => n.id === selectedNodeId);
    if (!original) return;
    nodeCounter.current++;
    const id = `step_${nodeCounter.current}_${Date.now()}`;
    const newNode: Node<StepNodeData> = {
      ...original,
      id,
      position: { x: original.position.x + 40, y: original.position.y + 40 },
      data: { ...original.data as StepNodeData, label: `${(original.data as StepNodeData).label} (copy)` },
      selected: false,
    };
    setNodes(nds => [...nds, newNode]);
    pushHistory();
  }, [selectedNodeId, nodes, setNodes, pushHistory]);

  const updateNodeData = useCallback((id: string, updates: Partial<StepNodeData>) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== id) return n;
      return { ...n, data: { ...n.data, ...updates } as StepNodeData };
    }));
  }, [setNodes]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const toWorkflowJson = useCallback(() => {
    const steps = nodes.map((node, idx) => {
      const data = node.data as StepNodeData;
      const outEdges = edges.filter(e => e.source === node.id);
      return {
        id: node.id, name: data.label, type: data.stepType, order: idx,
        config: data.config || {}, description: data.description || '',
        next: outEdges.map(e => ({ target: e.target, sourceHandle: e.sourceHandle })),
        position: node.position,
      };
    });
    return {
      name: workflowName,
      description: workflowDesc,
      steps,
      graph_data: {
        nodes: nodes.map(n => ({ id: n.id, position: n.position, data: n.data })),
        edges,
      },
    };
  }, [nodes, edges, workflowName, workflowDesc]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fastapiClient.post('/workflows', toWorkflowJson());
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  }, [toWorkflowJson]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    // Set all nodes to running
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'running' } as StepNodeData })));
    try {
      await fastapiClient.post('/workflows/draft/run', { inputs: {}, ...toWorkflowJson() });
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'completed' } as StepNodeData })));
    } catch (e) {
      console.error('Run failed:', e);
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'failed' } as StepNodeData })));
    } finally {
      setRunning(false);
    }
  }, [toWorkflowJson, setNodes]);

  const exportJson = useCallback(() => {
    const json = JSON.stringify(toWorkflowJson(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [toWorkflowJson, workflowName]);

  const importJson = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.graph_data?.nodes && data.graph_data?.edges) {
          setNodes(data.graph_data.nodes);
          setEdges(data.graph_data.edges);
          if (data.name) setWorkflowName(data.name);
          if (data.description) setWorkflowDesc(data.description);
          pushHistory();
        }
      } catch { console.error('Invalid workflow JSON'); }
    };
    input.click();
  }, [setNodes, setEdges, pushHistory]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0c' }}>
      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
        background: '#161616', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
      }}>
        <button onClick={() => navigate('/network/workflows')} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12,
        }}>
          <ArrowLeft size={14} /> Back
        </button>
        <Layout size={14} color="rgba(255,255,255,0.4)" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
          <input value={workflowName} onChange={e => setWorkflowName(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, outline: 'none', width: '100%', padding: '1px 0', lineHeight: 1.2 }} />
          <input value={workflowDesc} onChange={e => setWorkflowDesc(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 10, outline: 'none', width: '100%', padding: '1px 0', lineHeight: 1.2 }} />
        </div>

        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>{nodes.length} steps • {edges.length} connections</span>

        {/* Undo/Redo */}
        <button onClick={undo} title="Undo" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '3px 5px', cursor: 'pointer' }}>
          <Undo2 size={13} color="rgba(255,255,255,0.4)" />
        </button>
        <button onClick={redo} title="Redo" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '3px 5px', cursor: 'pointer' }}>
          <Redo2 size={13} color="rgba(255,255,255,0.4)" />
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />

        {/* Import/Export */}
        <button onClick={importJson} title="Import JSON" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '3px 5px', cursor: 'pointer' }}>
          <Upload size={13} color="rgba(255,255,255,0.4)" />
        </button>
        <button onClick={exportJson} title="Export JSON" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '3px 5px', cursor: 'pointer' }}>
          <Download size={13} color="rgba(255,255,255,0.4)" />
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />

        {/* Save / Run / Delete */}
        <button onClick={handleSave} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer', fontSize: 11, opacity: saving ? 0.6 : 1,
        }}>
          <Save size={13} /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleRun} disabled={running || nodes.length === 0} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer', fontSize: 11, opacity: running || nodes.length === 0 ? 0.5 : 1,
        }}>
          <Play size={13} /> {running ? 'Running...' : 'Run'}
        </button>
        {selectedNodeId && (
          <>
            <button onClick={duplicateSelected} title="Duplicate" style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', fontSize: 11,
            }}>
              <Copy size={13} />
            </button>
            <button onClick={deleteSelected} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', fontSize: 11,
            }}>
              <Trash2 size={13} /> Delete
            </button>
          </>
        )}
      </div>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Step Palette */}
        <div style={{
          width: 200, background: '#161616', borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '8px', overflowY: 'auto', flexShrink: 0,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, padding: '0 4px' }}>
            Add Steps
          </div>
          {STEP_PALETTE.map(step => (
            <button
              key={step.type}
              onClick={() => addNode(step.type)}
              title={step.desc}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                padding: '6px 8px', marginBottom: 2, background: 'rgba(255,255,255,0.04)',
                border: '1px solid transparent', borderLeft: `3px solid ${step.color}`,
                borderRadius: 5, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 12,
                transition: 'all 0.15s', textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <span style={{ fontSize: 13, flexShrink: 0 }}>{step.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.label}</span>
            </button>
          ))}
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 12, padding: '8px 4px', borderTop: '1px solid rgba(255,255,255,0.06)', lineHeight: 1.4 }}>
            Click to add. Drag nodes to position. Connect handles to wire steps.
          </div>
        </div>

        {/* Center: Canvas */}
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => { setSelectedNodeId(node.id); setShowConfig(true); }}
            onNodeDoubleClick={(_, node) => { setSelectedNodeId(node.id); setShowConfig(true); }}
            onPaneClick={() => { setSelectedNodeId(null); setShowConfig(false); }}
            fitView
            style={{ background: '#0a0a0c' }}
            defaultEdgeOptions={{ animated: true, style: { stroke: 'rgba(255,255,255,0.25)', strokeWidth: 2 } }}
            snapToGrid snapGrid={[15, 15]}
          >
            <Background color="rgba(255,255,255,0.05)" gap={20} />
            <Controls style={{ background: '#161616', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8 }} />
            <MiniMap style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
              nodeColor={(n: Node) => COLORS[(n.data as StepNodeData)?.stepType] || '#6366f1'} />
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div style={{
                  background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                  padding: '24px 32px', color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center',
                  marginTop: 100, maxWidth: 400,
                }}>
                  <Zap size={36} color="rgba(255,255,255,0.3)" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 8 }}>
                    Visual Workflow Builder
                  </div>
                  <div style={{ lineHeight: 1.5, marginBottom: 16 }}>
                    Build powerful automations by connecting steps visually.
                    Click steps from the left panel to get started.
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => addNode('webhook_trigger')} style={{
                      padding: '6px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6, color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer',
                    }}>
                      🔔 Start with Trigger
                    </button>
                    <button onClick={() => addNode('llm_completion')} style={{
                      padding: '6px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6, color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer',
                    }}>
                      🧠 Start with LLM
                    </button>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Right: Config Panel */}
        {showConfig && selectedNode && (
          <ConfigPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setShowConfig(false)}
          />
        )}
      </div>
    </div>
  );
}

// ── Page Wrapper ──
export default function VisualWorkflowPage() {
  return (
    <ReactFlowProvider>
      <VisualWorkflowInner />
    </ReactFlowProvider>
  );
}
