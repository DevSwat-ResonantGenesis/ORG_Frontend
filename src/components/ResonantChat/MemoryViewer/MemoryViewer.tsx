import React, { useState, useEffect } from 'react';
import { getSession } from '@/utils/auth';
import fastapiClient from '@/api/fastapiClient';
import { useThemeStore } from '@/store/themeStore';

interface MemoryEntry {
  id: string;
  task: string;
  response_summary: string;
  timestamp: string;
  relevance_score: number;
}

interface ProjectContext {
  project_id: string;
  name: string;
  languages: string[];
  frameworks: string[];
  session_count: number;
  context_prompt: string;
}

interface MemoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  } catch {
    return timestamp;
  }
};

const MemoryViewer: React.FC<MemoryViewerProps> = ({ isOpen, onClose }) => {
  const theme = useThemeStore(state => state.theme);
  const isLight = theme === 'light';
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [projects, setProjects] = useState<ProjectContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'memories' | 'projects'>('memories');
  const [selectedProject, setSelectedProject] = useState<ProjectContext | null>(null);
  const [totalMemories, setTotalMemories] = useState(0);
  const [avgRelevance, setAvgRelevance] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use fastapiClient which handles auth automatically
      const response = await fastapiClient.get('/resonant-chat/agents/stats');
      const data = response.data;
      console.log('[MemoryViewer] Agent stats response:', data);
      const memoryData = data.data?.memory || data.memory || {};
      
      if (memoryData.recent_memories) {
        setMemories(memoryData.recent_memories);
      }
      if (memoryData.total_count !== undefined) {
        setTotalMemories(memoryData.total_count);
      } else {
        setTotalMemories(memoryData.recent_memories?.length || 0);
      }
      
      // Get avg_relevance from API response
      if (memoryData.avg_relevance !== undefined) {
        setAvgRelevance(memoryData.avg_relevance);
      }
      
      // Fetch project contexts if available
      if (data.data?.projects || data.projects) {
        setProjects(data.data?.projects || data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch memory data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99997 }}>
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      {/* Modal */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '85vh',
        zIndex: 99998,
        background: isLight ? 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)' : 'linear-gradient(180deg, rgba(28, 28, 30, 0.98) 0%, rgba(20, 20, 22, 0.98) 100%)',
        borderRadius: '16px',
        boxShadow: isLight ? '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)' : '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
          borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
        }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: isLight ? '#1D1D1F' : '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
            </svg>
            Agent Memory
          </h3>
          <button
            onClick={onClose}
            style={{
              background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
              border: 'none',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = isLight ? '#1D1D1F' : '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#888';
            }}
          >
            ×
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px', 
          padding: '16px 20px',
          borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>{totalMemories}</div>
            <div style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#888', textTransform: 'uppercase' }}>Total Memories</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0ea5e9' }}>{projects.length}</div>
            <div style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#888', textTransform: 'uppercase' }}>Projects</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>
              {avgRelevance > 0 ? avgRelevance : (memories.length > 0 ? Math.round(memories.reduce((sum, m) => sum + (m.relevance_score || 0), 0) / memories.length * 100) : 0)}%
            </div>
            <div style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#888', textTransform: 'uppercase' }}>Avg Relevance</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('memories')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'memories' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'memories' ? '2px solid #22c55e' : '2px solid transparent',
              color: activeTab === 'memories' ? '#22c55e' : '#888',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Recent Memories
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'projects' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'projects' ? '2px solid #22c55e' : '2px solid transparent',
              color: activeTab === 'projects' ? '#22c55e' : '#888',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Project Context
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Loading memory data...
            </div>
          ) : activeTab === 'memories' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {memories.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
                  </svg>
                  <div style={{ fontSize: '14px' }}>No memories stored yet</div>
                  <div style={{ fontSize: '12px', marginTop: '8px', color: '#555' }}>
                    Agents will remember context from your conversations to provide better responses.
                  </div>
                </div>
              ) : (
                memories.map(memory => (
                  <div key={memory.id} style={{ 
                    padding: '14px', 
                    background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)', 
                    borderRadius: '12px',
                    border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', color: isLight ? '#9ca3af' : '#888' }}>{formatTime(memory.timestamp)}</span>
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '3px 8px', 
                        borderRadius: '10px',
                        background: memory.relevance_score > 0.7 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: memory.relevance_score > 0.7 ? '#22c55e' : '#eab308',
                      }}>
                        {(memory.relevance_score * 100).toFixed(0)}% relevant
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: isLight ? '#1D1D1F' : '#fff', marginBottom: '8px', fontWeight: 500 }}>
                      {memory.task.slice(0, 100)}{memory.task.length > 100 && '...'}
                    </div>
                    <div style={{ fontSize: '12px', color: isLight ? '#6b7280' : '#888', lineHeight: 1.5 }}>
                      {memory.response_summary}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <div style={{ fontSize: '14px' }}>No project context stored yet</div>
                  <div style={{ fontSize: '12px', marginTop: '8px', color: '#555' }}>
                    Project context helps agents understand your codebase patterns.
                  </div>
                </div>
              ) : (
                projects.map(project => (
                  <div 
                    key={project.project_id} 
                    style={{ 
                      padding: '14px', 
                      background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)', 
                      borderRadius: '12px',
                      border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSelectedProject(project)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>📁</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: isLight ? '#1D1D1F' : '#fff' }}>{project.name}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: isLight ? '#9ca3af' : '#888' }}>{project.session_count} sessions</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {project.languages.map(lang => (
                        <span key={lang} style={{ 
                          fontSize: '10px', 
                          padding: '3px 8px', 
                          borderRadius: '10px',
                          background: 'rgba(14, 165, 233, 0.15)',
                          color: '#0ea5e9',
                        }}>{lang}</span>
                      ))}
                      {project.frameworks.map(fw => (
                        <span key={fw} style={{ 
                          fontSize: '10px', 
                          padding: '3px 8px', 
                          borderRadius: '10px',
                          background: 'rgba(139, 92, 246, 0.15)',
                          color: '#8b5cf6',
                        }}>{fw}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Project Detail Modal */}
        {selectedProject && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}>
            <div style={{
              background: isLight ? 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)' : 'linear-gradient(180deg, rgba(28, 28, 30, 0.98) 0%, rgba(20, 20, 22, 0.98) 100%)',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80%',
              overflow: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, color: isLight ? '#1D1D1F' : '#fff', fontSize: '16px' }}>{selectedProject.name}</h4>
                <button
                  onClick={() => setSelectedProject(null)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    color: '#888',
                    cursor: 'pointer',
                  }}
                >×</button>
              </div>
              <div style={{ fontSize: '12px', color: isLight ? '#6b7280' : '#888', marginBottom: '8px' }}>Context Prompt:</div>
              <pre style={{ 
                fontSize: '12px', 
                color: isLight ? '#374151' : '#ccc', 
                background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.3)', 
                padding: '12px', 
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {selectedProject.context_prompt || 'No context built yet'}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          padding: '12px 20px', 
          borderTop: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
          background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: isLight ? '#6b7280' : '#888',
        }}>
          <span>💡</span>
          <span>Memories help agents provide personalized responses</span>
        </div>
      </div>
    </div>
  );
};

export default MemoryViewer;
