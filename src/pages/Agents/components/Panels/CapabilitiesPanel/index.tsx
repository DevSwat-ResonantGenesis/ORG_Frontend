import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as capabilitiesApi from '../../../../../api/capabilities';
import styles from './CapabilitiesPanel.module.css';

// ============== CAPABILITIES PANEL ==============
// Contract: reads [agent], writes [agent]
// Forbidden: [execution, economy]

interface Capability {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'tool' | 'integration' | 'custom';
  enabled: boolean;
  requiredPermissions: string[];
  required_permissions?: string[];
}

interface CapabilitiesPanelProps {
  className?: string;
}

const CapabilitiesPanelComponent: React.FC<CapabilitiesPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const updateAgent = useAgentStore(state => state.updateAgent);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'tool' | 'integration' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newCapability, setNewCapability] = useState({
    name: '',
    description: '',
    requiredPermissions: '',
  });
  const [customCapabilities, setCustomCapabilities] = useState<capabilitiesApi.Capability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Fetch custom capabilities from backend when agent changes
  const fetchCustomCapabilities = useCallback(async () => {
    if (!selectedAgent?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const caps = await capabilitiesApi.getCustomCapabilities(selectedAgent.id);
      setCustomCapabilities(caps);
    } catch (err: any) {
      console.error('Failed to fetch custom capabilities:', err);
      setError(err.message || 'Failed to load capabilities');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent?.id]);

  useEffect(() => {
    fetchCustomCapabilities();
  }, [fetchCustomCapabilities]);

  const baseCapabilities: Capability[] = [
    { id: 'c1', name: 'Web Search', description: 'Search the internet for information', category: 'tool', enabled: true, requiredPermissions: ['network'] },
    { id: 'c2', name: 'Code Execution', description: 'Execute code in a sandboxed environment', category: 'tool', enabled: false, requiredPermissions: ['code', 'sandbox'] },
    { id: 'c3', name: 'File Access', description: 'Read and write files', category: 'core', enabled: true, requiredPermissions: ['filesystem'] },
    { id: 'c4', name: 'API Calls', description: 'Make HTTP requests to external APIs', category: 'integration', enabled: true, requiredPermissions: ['network'] },
    { id: 'c5', name: 'Database Query', description: 'Query SQL and NoSQL databases', category: 'integration', enabled: false, requiredPermissions: ['database'] },
    { id: 'c6', name: 'Email Sending', description: 'Send emails via SMTP', category: 'integration', enabled: false, requiredPermissions: ['email'] },
    { id: 'c7', name: 'Image Generation', description: 'Generate images using AI models', category: 'tool', enabled: true, requiredPermissions: ['ai'] },
    { id: 'c8', name: 'Text Analysis', description: 'Analyze and extract insights from text', category: 'core', enabled: true, requiredPermissions: [] },
    { id: 'c9', name: 'Data Visualization', description: 'Create charts and graphs', category: 'tool', enabled: true, requiredPermissions: [] },
    { id: 'c10', name: 'Slack Integration', description: 'Send messages to Slack channels', category: 'integration', enabled: false, requiredPermissions: ['slack'] },
    { id: 'c11', name: 'Custom Script', description: 'Run custom Python scripts', category: 'custom', enabled: false, requiredPermissions: ['code', 'custom'] },
    { id: 'c12', name: 'Memory Management', description: 'Manage agent memory and context', category: 'core', enabled: true, requiredPermissions: [] },
  ];

  const capabilities = [...baseCapabilities, ...customCapabilities];

  const filteredCapabilities = capabilities.filter(cap => {
    if (activeCategory !== 'all' && cap.category !== activeCategory) return false;
    if (searchQuery) {
      return cap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             cap.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const toggleCapability = async (capId: string) => {
    if (!selectedAgent) return;
    
    const capability = capabilities.find(c => c.id === capId);
    if (!capability) return;
    
    // Only toggle custom capabilities via API
    if (capability.category === 'custom') {
      try {
        await capabilitiesApi.toggleCapability(
          selectedAgent.id,
          capId,
          !capability.enabled
        );
        
        // Update local state
        setCustomCapabilities(prev => 
          prev.map(c => c.id === capId ? { ...c, enabled: !c.enabled } : c)
        );
      } catch (err: any) {
        setError(err.message || 'Failed to toggle capability');
        setTimeout(() => setError(null), 3000);
      }
    } else {
      // For base capabilities, just update local agent store
      const currentCaps = selectedAgent.capabilities || [];
      const capName = capability.name;
      
      if (capability.enabled) {
        const updated = currentCaps.filter(c => c !== capName);
        updateAgent(selectedAgent.id, { capabilities: updated });
      } else {
        const updated = [...currentCaps, capName];
        updateAgent(selectedAgent.id, { capabilities: updated });
      }
    }
  };

  const handleAddCapability = async () => {
    if (!newCapability.name.trim()) {
      setError('Please enter a capability name');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!selectedAgent) {
      setError('Please select an agent first');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newCap = await capabilitiesApi.addCapability(selectedAgent.id, {
        name: newCapability.name,
        description: newCapability.description,
        category: 'custom',
        enabled: true,
        required_permissions: newCapability.requiredPermissions
          .split(',')
          .map(p => p.trim())
          .filter(p => p),
      });

      // Add to local state
      setCustomCapabilities(prev => [...prev, newCap]);
      
      // Show success message
      setSuccessMessage(`Custom capability "${newCap.name}" added successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reset form and close modal
      setNewCapability({ name: '', description: '', requiredPermissions: '' });
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add capability');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return styles.core;
      case 'tool': return styles.tool;
      case 'integration': return styles.integration;
      case 'custom': return styles.custom;
      default: return '';
    }
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Capabilities /> Capabilities</h2>
        <div className={styles.agentSelector}>
          <select 
            value={selectedAgentId || ''} 
            onChange={e => setSelectedAgentId(e.target.value)}
          >
            <option value="">Select Agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
            {agents.length === 0 && (
              <option value="" disabled>No agents available - create one first</option>
            )}
          </select>
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Success Message */}
        {successMessage && (
          <div className={styles.successBanner}>
            <Icons.CheckCircle />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorBanner}>
            <Icons.XCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={styles.loadingBanner}>
            <span>Loading capabilities...</span>
          </div>
        )}

        {/* Stats */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{capabilities.filter(c => c.enabled).length}</span>
            <span className={styles.statLabel}>Enabled</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{capabilities.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{capabilities.filter(c => c.category === 'custom').length}</span>
            <span className={styles.statLabel}>Custom</span>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersBar}>
          <div className={styles.categoryTabs}>
            {(['all', 'core', 'tool', 'integration', 'custom'] as const).map(cat => (
              <button
                key={cat}
                className={`${styles.categoryTab} ${activeCategory === cat ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search capabilities..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Capabilities Grid */}
        <div className={styles.capabilitiesGrid}>
          {filteredCapabilities.map(cap => (
            <div key={cap.id} className={`${styles.capabilityCard} ${cap.enabled ? styles.enabled : ''}`}>
              <div className={styles.capHeader}>
                <span className={`${styles.categoryBadge} ${getCategoryColor(cap.category)}`}>
                  {cap.category}
                </span>
                <label className={styles.toggle}>
                  <input 
                    type="checkbox" 
                    checked={cap.enabled}
                    onChange={() => toggleCapability(cap.id)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <h4>{cap.name}</h4>
              <p>{cap.description}</p>
              {((cap as any).requiredPermissions || cap.required_permissions || []).length > 0 && (
                <div className={styles.permissions}>
                  <span className={styles.permLabel}>Requires:</span>
                  {((cap as any).requiredPermissions || cap.required_permissions || []).map((perm: string) => (
                    <span key={perm} className={styles.permBadge}>{perm}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Custom */}
        <div className={styles.addSection}>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
            <Icons.Plus /> Add Custom Capability
          </button>
        </div>
      </div>

      {/* Add Custom Capability Modal */}
      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Add Custom Capability</h3>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                <Icons.X />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Capability Name *</label>
                <input
                  type="text"
                  value={newCapability.name}
                  onChange={e => setNewCapability({ ...newCapability, name: e.target.value })}
                  placeholder="e.g., Twitter Integration"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newCapability.description}
                  onChange={e => setNewCapability({ ...newCapability, description: e.target.value })}
                  placeholder="Describe what this capability does..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Required Permissions (comma-separated)</label>
                <input
                  type="text"
                  value={newCapability.requiredPermissions}
                  onChange={e => setNewCapability({ ...newCapability, requiredPermissions: e.target.value })}
                  placeholder="e.g., network, api, custom"
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleAddCapability}>
                <Icons.Plus /> Add Capability
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CapabilitiesPanel = memo(CapabilitiesPanelComponent);
export default CapabilitiesPanel;
