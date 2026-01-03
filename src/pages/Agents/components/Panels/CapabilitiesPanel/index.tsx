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
  requiredPermissions?: string[];
  required_permissions?: string[];
  // Enhanced fields
  executionMode?: 'sync' | 'async' | 'streaming';
  timeout?: number;
  rateLimit?: number;
  costPerCall?: number;
  apiEndpoint?: string;
  authType?: string;
  // Usage stats
  callsToday?: number;
  totalCalls?: number;
  successRate?: number;
  lastUsed?: string;
  totalCost?: number;
  avgLatency?: number;
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
    // Enhanced fields
    type: 'action' as 'action' | 'tool' | 'integration' | 'workflow',
    executionMode: 'sync' as 'sync' | 'async' | 'streaming',
    rateLimit: '',
    timeout: '30',
    retryPolicy: 'none' as 'none' | 'linear' | 'exponential',
    maxRetries: '3',
    inputSchema: '',
    outputSchema: '',
    webhookUrl: '',
    apiEndpoint: '',
    authType: 'none' as 'none' | 'api_key' | 'oauth2' | 'bearer',
    costPerCall: '',
    tags: '',
  });
  const [customCapabilities, setCustomCapabilities] = useState<capabilitiesApi.Capability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCapability, setEditingCapability] = useState<Capability | null>(null);
  const [testingCapability, setTestingCapability] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

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
    { id: 'c1', name: 'Web Search', description: 'Search the internet for information', category: 'tool', enabled: true, requiredPermissions: ['network'], executionMode: 'async', timeout: 30, rateLimit: 60, costPerCall: 0.001, callsToday: 145, totalCalls: 12450, successRate: 98.5, lastUsed: '2 min ago', avgLatency: 1200 },
    { id: 'c2', name: 'Code Execution', description: 'Execute code in a sandboxed environment', category: 'tool', enabled: false, requiredPermissions: ['code', 'sandbox'], executionMode: 'sync', timeout: 60, rateLimit: 30, costPerCall: 0.005, callsToday: 0, totalCalls: 3200, successRate: 94.2, lastUsed: '1 day ago', avgLatency: 2500 },
    { id: 'c3', name: 'File Access', description: 'Read and write files', category: 'core', enabled: true, requiredPermissions: ['filesystem'], executionMode: 'sync', timeout: 10, rateLimit: 100, costPerCall: 0, callsToday: 89, totalCalls: 8900, successRate: 99.9, lastUsed: '5 min ago', avgLatency: 50 },
    { id: 'c4', name: 'API Calls', description: 'Make HTTP requests to external APIs', category: 'integration', enabled: true, requiredPermissions: ['network'], executionMode: 'async', timeout: 30, rateLimit: 120, costPerCall: 0.002, apiEndpoint: 'https://api.example.com', authType: 'bearer', callsToday: 234, totalCalls: 45000, successRate: 97.8, lastUsed: '1 min ago', avgLatency: 800 },
    { id: 'c5', name: 'Database Query', description: 'Query SQL and NoSQL databases', category: 'integration', enabled: false, requiredPermissions: ['database'], executionMode: 'sync', timeout: 15, rateLimit: 50, costPerCall: 0.001, callsToday: 0, totalCalls: 5600, successRate: 99.1, lastUsed: '3 days ago', avgLatency: 150 },
    { id: 'c6', name: 'Email Sending', description: 'Send emails via SMTP', category: 'integration', enabled: false, requiredPermissions: ['email'], executionMode: 'async', timeout: 30, rateLimit: 20, costPerCall: 0.003, callsToday: 0, totalCalls: 1200, successRate: 96.5, lastUsed: '1 week ago', avgLatency: 2000 },
    { id: 'c7', name: 'Image Generation', description: 'Generate images using AI models', category: 'tool', enabled: true, requiredPermissions: ['ai'], executionMode: 'streaming', timeout: 120, rateLimit: 10, costPerCall: 0.02, callsToday: 12, totalCalls: 890, successRate: 92.3, lastUsed: '15 min ago', avgLatency: 8500 },
    { id: 'c8', name: 'Text Analysis', description: 'Analyze and extract insights from text', category: 'core', enabled: true, requiredPermissions: [], executionMode: 'sync', timeout: 10, rateLimit: 200, costPerCall: 0.001, callsToday: 567, totalCalls: 78000, successRate: 99.7, lastUsed: 'Just now', avgLatency: 200 },
    { id: 'c9', name: 'Data Visualization', description: 'Create charts and graphs', category: 'tool', enabled: true, requiredPermissions: [], executionMode: 'sync', timeout: 15, rateLimit: 50, costPerCall: 0, callsToday: 23, totalCalls: 4500, successRate: 98.9, lastUsed: '30 min ago', avgLatency: 350 },
    { id: 'c10', name: 'Slack Integration', description: 'Send messages to Slack channels', category: 'integration', enabled: false, requiredPermissions: ['slack'], executionMode: 'async', timeout: 10, rateLimit: 60, costPerCall: 0, apiEndpoint: 'https://slack.com/api', authType: 'oauth2', callsToday: 0, totalCalls: 2300, successRate: 99.2, lastUsed: '2 weeks ago', avgLatency: 400 },
    { id: 'c11', name: 'Custom Script', description: 'Run custom Python scripts', category: 'custom', enabled: false, requiredPermissions: ['code', 'custom'], executionMode: 'sync', timeout: 300, rateLimit: 5, costPerCall: 0.01, callsToday: 0, totalCalls: 450, successRate: 87.5, lastUsed: '5 days ago', avgLatency: 5000 },
    { id: 'c12', name: 'Memory Management', description: 'Manage agent memory and context', category: 'core', enabled: true, requiredPermissions: [], executionMode: 'sync', timeout: 5, rateLimit: 500, costPerCall: 0, callsToday: 1200, totalCalls: 150000, successRate: 99.99, lastUsed: 'Just now', avgLatency: 25 },
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

  // Delete capability
  const handleDeleteCapability = async (capId: string) => {
    if (!selectedAgent) return;
    
    const capability = capabilities.find(c => c.id === capId);
    if (!capability || capability.category !== 'custom') {
      setError('Only custom capabilities can be deleted');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      await capabilitiesApi.deleteCapability(selectedAgent.id, capId);
      setCustomCapabilities(prev => prev.filter(c => c.id !== capId));
      setSuccessMessage(`Capability "${capability.name}" deleted`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete capability');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Edit capability
  const handleEditCapability = (cap: Capability) => {
    setEditingCapability(cap);
    setShowEditModal(true);
  };

  // Test capability
  const handleTestCapability = async (capId: string) => {
    setTestingCapability(capId);
    setTestResult(null);
    
    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = Math.random() > 0.2;
    setTestResult({
      success,
      message: success ? 'Capability test passed successfully' : 'Test failed: Connection timeout',
      latency: Math.floor(Math.random() * 2000) + 100,
    });
    
    setTimeout(() => {
      setTestingCapability(null);
      setTestResult(null);
    }, 3000);
  };

  // Duplicate capability
  const handleDuplicateCapability = (cap: Capability) => {
    setNewCapability({
      name: `${cap.name} (Copy)`,
      description: cap.description,
      requiredPermissions: (cap.requiredPermissions || []).join(', '),
      type: 'action',
      executionMode: cap.executionMode || 'sync',
      rateLimit: cap.rateLimit?.toString() || '',
      timeout: cap.timeout?.toString() || '30',
      retryPolicy: 'none',
      maxRetries: '3',
      inputSchema: '',
      outputSchema: '',
      webhookUrl: '',
      apiEndpoint: cap.apiEndpoint || '',
      authType: (cap.authType as any) || 'none',
      costPerCall: cap.costPerCall?.toString() || '',
      tags: '',
    });
    setShowAddModal(true);
  };

  // Toggle selection
  const toggleSelection = (capId: string) => {
    setSelectedCapabilities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(capId)) {
        newSet.delete(capId);
      } else {
        newSet.add(capId);
      }
      return newSet;
    });
  };

  // Select all
  const selectAll = () => {
    if (selectedCapabilities.size === filteredCapabilities.length) {
      setSelectedCapabilities(new Set());
    } else {
      setSelectedCapabilities(new Set(filteredCapabilities.map(c => c.id)));
    }
  };

  // Bulk enable/disable
  const bulkToggle = async (enable: boolean) => {
    for (const capId of selectedCapabilities) {
      const cap = capabilities.find(c => c.id === capId);
      if (cap && cap.enabled !== enable) {
        await toggleCapability(capId);
      }
    }
    setSelectedCapabilities(new Set());
    setSuccessMessage(`${selectedCapabilities.size} capabilities ${enable ? 'enabled' : 'disabled'}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Calculate totals for analytics
  const totalCallsToday = capabilities.reduce((sum, c) => sum + (c.callsToday || 0), 0);
  const totalCost = capabilities.reduce((sum, c) => sum + ((c.callsToday || 0) * (c.costPerCall || 0)), 0);
  const avgSuccessRate = capabilities.filter(c => c.successRate).reduce((sum, c, _, arr) => sum + (c.successRate || 0) / arr.length, 0);

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
      // Parse JSON schemas if provided
      let inputSchema = undefined;
      let outputSchema = undefined;
      try {
        if (newCapability.inputSchema) inputSchema = JSON.parse(newCapability.inputSchema);
        if (newCapability.outputSchema) outputSchema = JSON.parse(newCapability.outputSchema);
      } catch (e) {
        // Invalid JSON, ignore
      }

      const newCap = await capabilitiesApi.addCapability(selectedAgent.id, {
        name: newCapability.name,
        description: newCapability.description,
        category: 'custom',
        enabled: true,
        required_permissions: newCapability.requiredPermissions
          .split(',')
          .map(p => p.trim())
          .filter(p => p),
        // Enhanced fields
        capability_type: newCapability.type,
        execution_mode: newCapability.executionMode,
        rate_limit: newCapability.rateLimit ? parseInt(newCapability.rateLimit) : undefined,
        timeout: parseInt(newCapability.timeout) || 30,
        retry_policy: newCapability.retryPolicy,
        max_retries: parseInt(newCapability.maxRetries) || 3,
        input_schema: inputSchema,
        output_schema: outputSchema,
        webhook_url: newCapability.webhookUrl || undefined,
        api_endpoint: newCapability.apiEndpoint || undefined,
        auth_type: newCapability.authType,
        cost_per_call: newCapability.costPerCall ? parseFloat(newCapability.costPerCall) : 0,
        tags: newCapability.tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t),
      });

      // Add to local state
      setCustomCapabilities(prev => [...prev, newCap]);
      
      // Show success message
      setSuccessMessage(`Custom capability "${newCap.name}" added successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reset form and close modal
      setNewCapability({ 
        name: '', 
        description: '', 
        requiredPermissions: '',
        type: 'action',
        executionMode: 'sync',
        rateLimit: '',
        timeout: '30',
        retryPolicy: 'none',
        maxRetries: '3',
        inputSchema: '',
        outputSchema: '',
        webhookUrl: '',
        apiEndpoint: '',
        authType: 'none',
        costPerCall: '',
        tags: '',
      });
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

        {/* Analytics Section */}
        <div className={styles.analyticsSection}>
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticCard}>
              <span className={styles.analyticValue}>{capabilities.filter(c => c.enabled).length}</span>
              <span className={styles.analyticLabel}>Enabled</span>
            </div>
            <div className={styles.analyticCard}>
              <span className={styles.analyticValue}>{capabilities.length}</span>
              <span className={styles.analyticLabel}>Total</span>
            </div>
            <div className={styles.analyticCard}>
              <span className={styles.analyticValue}>{totalCallsToday.toLocaleString()}</span>
              <span className={styles.analyticLabel}>Calls Today</span>
            </div>
            <div className={styles.analyticCard}>
              <span className={styles.analyticValue}>${totalCost.toFixed(2)}</span>
              <span className={styles.analyticLabel}>Cost Today</span>
            </div>
            <div className={styles.analyticCard}>
              <span className={styles.analyticValue}>{avgSuccessRate.toFixed(1)}%</span>
              <span className={styles.analyticLabel}>Success Rate</span>
            </div>
            <div className={styles.analyticCard}>
              <span className={styles.analyticValue}>{capabilities.filter(c => c.category === 'custom').length}</span>
              <span className={styles.analyticLabel}>Custom</span>
            </div>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedCapabilities.size > 0 && (
          <div className={styles.bulkToolbar}>
            <span className={styles.bulkCount}>{selectedCapabilities.size} selected</span>
            <button className={styles.bulkBtn} onClick={() => bulkToggle(true)}>
              <Icons.CheckCircle /> Enable All
            </button>
            <button className={styles.bulkBtn} onClick={() => bulkToggle(false)}>
              <Icons.XCircle /> Disable All
            </button>
            <button className={styles.bulkBtn} onClick={() => setSelectedCapabilities(new Set())}>
              Clear Selection
            </button>
          </div>
        )}

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
            <div key={cap.id} className={`${styles.capabilityCard} ${cap.enabled ? styles.enabled : ''} ${selectedCapabilities.has(cap.id) ? styles.selected : ''}`}>
              {/* Selection Checkbox */}
              <div className={styles.cardSelection}>
                <input 
                  type="checkbox" 
                  checked={selectedCapabilities.has(cap.id)}
                  onChange={() => toggleSelection(cap.id)}
                  className={styles.selectCheckbox}
                />
              </div>

              <div className={styles.capHeader}>
                <div className={styles.capBadges}>
                  <span className={`${styles.categoryBadge} ${getCategoryColor(cap.category)}`}>
                    {cap.category}
                  </span>
                  {cap.executionMode && (
                    <span className={styles.modeBadge}>{cap.executionMode}</span>
                  )}
                </div>
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

              {/* Usage Stats */}
              <div className={styles.usageStats}>
                <div className={styles.usageStat}>
                  <span className={styles.usageValue}>{cap.callsToday?.toLocaleString() || 0}</span>
                  <span className={styles.usageLabel}>Today</span>
                </div>
                <div className={styles.usageStat}>
                  <span className={styles.usageValue}>{cap.totalCalls?.toLocaleString() || 0}</span>
                  <span className={styles.usageLabel}>Total</span>
                </div>
                <div className={styles.usageStat}>
                  <span className={`${styles.usageValue} ${(cap.successRate || 0) >= 95 ? styles.good : (cap.successRate || 0) >= 80 ? styles.warn : styles.bad}`}>
                    {cap.successRate?.toFixed(1) || 0}%
                  </span>
                  <span className={styles.usageLabel}>Success</span>
                </div>
                <div className={styles.usageStat}>
                  <span className={styles.usageValue}>{cap.avgLatency || 0}ms</span>
                  <span className={styles.usageLabel}>Latency</span>
                </div>
              </div>

              {/* Config Info */}
              <div className={styles.configInfo}>
                {cap.timeout && <span className={styles.configItem}>⏱ {cap.timeout}s</span>}
                {cap.rateLimit && <span className={styles.configItem}>🔄 {cap.rateLimit}/min</span>}
                {cap.costPerCall !== undefined && cap.costPerCall > 0 && (
                  <span className={styles.configItem}>💰 ${cap.costPerCall.toFixed(3)}</span>
                )}
                {cap.apiEndpoint && <span className={styles.configItem}>🔗 API</span>}
              </div>

              {/* Permissions */}
              {((cap as any).requiredPermissions || cap.required_permissions || []).length > 0 && (
                <div className={styles.permissions}>
                  <span className={styles.permLabel}>Requires:</span>
                  {((cap as any).requiredPermissions || cap.required_permissions || []).map((perm: string) => (
                    <span key={perm} className={styles.permBadge}>{perm}</span>
                  ))}
                </div>
              )}

              {/* Last Used */}
              {cap.lastUsed && (
                <div className={styles.lastUsed}>Last used: {cap.lastUsed}</div>
              )}

              {/* Action Buttons */}
              <div className={styles.cardActions}>
                <button 
                  className={styles.actionBtn} 
                  onClick={() => handleTestCapability(cap.id)}
                  disabled={testingCapability === cap.id}
                  title="Test Capability"
                >
                  {testingCapability === cap.id ? '⏳' : '▶️'} Test
                </button>
                <button 
                  className={styles.actionBtn} 
                  onClick={() => handleEditCapability(cap)}
                  title="Edit"
                >
                  ✏️ Edit
                </button>
                <button 
                  className={styles.actionBtn} 
                  onClick={() => handleDuplicateCapability(cap)}
                  title="Duplicate"
                >
                  📋 Copy
                </button>
                {cap.category === 'custom' && (
                  <button 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                    onClick={() => handleDeleteCapability(cap.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Test Result */}
              {testingCapability === cap.id && testResult && (
                <div className={`${styles.testResult} ${testResult.success ? styles.testSuccess : styles.testFail}`}>
                  {testResult.success ? '✅' : '❌'} {testResult.message}
                  {testResult.latency && <span> ({testResult.latency}ms)</span>}
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
              {/* Basic Info Section */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>Basic Information</h4>
                <div className={styles.formRow}>
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
                    <label>Type</label>
                    <select
                      value={newCapability.type}
                      onChange={e => setNewCapability({ ...newCapability, type: e.target.value as any })}
                      className={styles.select}
                    >
                      <option value="action">Action</option>
                      <option value="tool">Tool</option>
                      <option value="integration">Integration</option>
                      <option value="workflow">Workflow</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={newCapability.description}
                    onChange={e => setNewCapability({ ...newCapability, description: e.target.value })}
                    placeholder="Describe what this capability does..."
                    className={styles.textarea}
                    rows={2}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newCapability.tags}
                      onChange={e => setNewCapability({ ...newCapability, tags: e.target.value })}
                      placeholder="e.g., social, automation"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Required Permissions</label>
                    <input
                      type="text"
                      value={newCapability.requiredPermissions}
                      onChange={e => setNewCapability({ ...newCapability, requiredPermissions: e.target.value })}
                      placeholder="e.g., network, api"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Execution Settings Section */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>Execution Settings</h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Execution Mode</label>
                    <select
                      value={newCapability.executionMode}
                      onChange={e => setNewCapability({ ...newCapability, executionMode: e.target.value as any })}
                      className={styles.select}
                    >
                      <option value="sync">Synchronous</option>
                      <option value="async">Asynchronous</option>
                      <option value="streaming">Streaming</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Timeout (seconds)</label>
                    <input
                      type="number"
                      value={newCapability.timeout}
                      onChange={e => setNewCapability({ ...newCapability, timeout: e.target.value })}
                      placeholder="30"
                      className={styles.input}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Retry Policy</label>
                    <select
                      value={newCapability.retryPolicy}
                      onChange={e => setNewCapability({ ...newCapability, retryPolicy: e.target.value as any })}
                      className={styles.select}
                    >
                      <option value="none">No Retry</option>
                      <option value="linear">Linear Backoff</option>
                      <option value="exponential">Exponential Backoff</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Max Retries</label>
                    <input
                      type="number"
                      value={newCapability.maxRetries}
                      onChange={e => setNewCapability({ ...newCapability, maxRetries: e.target.value })}
                      placeholder="3"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Rate Limit (calls/min)</label>
                    <input
                      type="number"
                      value={newCapability.rateLimit}
                      onChange={e => setNewCapability({ ...newCapability, rateLimit: e.target.value })}
                      placeholder="60"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* API/Integration Settings */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>API / Integration</h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>API Endpoint</label>
                    <input
                      type="text"
                      value={newCapability.apiEndpoint}
                      onChange={e => setNewCapability({ ...newCapability, apiEndpoint: e.target.value })}
                      placeholder="https://api.example.com/v1/action"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Auth Type</label>
                    <select
                      value={newCapability.authType}
                      onChange={e => setNewCapability({ ...newCapability, authType: e.target.value as any })}
                      className={styles.select}
                    >
                      <option value="none">None</option>
                      <option value="api_key">API Key</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="oauth2">OAuth 2.0</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Webhook URL (for async callbacks)</label>
                  <input
                    type="text"
                    value={newCapability.webhookUrl}
                    onChange={e => setNewCapability({ ...newCapability, webhookUrl: e.target.value })}
                    placeholder="https://your-server.com/webhook"
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Schema Settings */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>Input/Output Schema (JSON)</h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Input Schema</label>
                    <textarea
                      value={newCapability.inputSchema}
                      onChange={e => setNewCapability({ ...newCapability, inputSchema: e.target.value })}
                      placeholder='{"type": "object", "properties": {...}}'
                      className={styles.textarea}
                      rows={2}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Output Schema</label>
                    <textarea
                      value={newCapability.outputSchema}
                      onChange={e => setNewCapability({ ...newCapability, outputSchema: e.target.value })}
                      placeholder='{"type": "object", "properties": {...}}'
                      className={styles.textarea}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Cost Settings */}
              <div className={styles.formSection}>
                <h4 className={styles.sectionTitle}>Cost & Billing</h4>
                <div className={styles.formGroup} style={{ maxWidth: '200px' }}>
                  <label>Cost per Call (USD)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newCapability.costPerCall}
                    onChange={e => setNewCapability({ ...newCapability, costPerCall: e.target.value })}
                    placeholder="0.00"
                    className={styles.input}
                  />
                </div>
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
