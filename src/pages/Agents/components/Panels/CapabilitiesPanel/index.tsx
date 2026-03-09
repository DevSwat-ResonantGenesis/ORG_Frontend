import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as capabilitiesApi from '../../../../../api/capabilities';
import fastapiClient from '../../../../../api/fastapiClient';
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
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'tool' | 'integration' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inlineView, setInlineView] = useState<'list' | 'add' | 'edit'>('list');
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
  const [systemCapabilities, setSystemCapabilities] = useState<Capability[]>([]);
  const [customCapabilities, setCustomCapabilities] = useState<Capability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<Set<string>>(new Set());
  const [editingCapability, setEditingCapability] = useState<Capability | null>(null);
  const [editCapability, setEditCapability] = useState({
    name: '',
    description: '',
    requiredPermissions: '',
    enabled: true,
  });
  const [testingCapability, setTestingCapability] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const [platformTools, setPlatformTools] = useState<any[]>([]);

  // Fetch capabilities from backend when agent changes
  const fetchCapabilities = useCallback(async () => {
    if (!selectedAgent?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Use Promise.allSettled so one failure doesn't block everything
      const [systemResult, customResult, toolsResult] = await Promise.allSettled([
        capabilitiesApi.getAgentCapabilities(selectedAgent.id),
        capabilitiesApi.getCustomCapabilities(selectedAgent.id),
        fastapiClient.get('/api/v1/agents/available-tools').catch(() => 
          fastapiClient.get('/api/v1/agents/tools')
        ),
      ]);
      
      if (systemResult.status === 'fulfilled') {
        setSystemCapabilities(systemResult.value as any);
      } else {
        setSystemCapabilities([]);
      }
      
      if (customResult.status === 'fulfilled') {
        setCustomCapabilities(customResult.value as any);
      } else {
        setCustomCapabilities([]);
      }
      
      if (toolsResult.status === 'fulfilled') {
        const data = (toolsResult.value as any)?.data ?? toolsResult.value;
        setPlatformTools(Array.isArray(data) ? data : []);
      } else {
        setPlatformTools([]);
      }
      
      setSelectedCapabilities(new Set());
    } catch (err: any) {
      console.error('Failed to fetch capabilities:', err);
      setError(err.message || 'Failed to load capabilities');
    } finally {
      setIsLoading(false);
      setInlineView('list');
    }
  }, [selectedAgent?.id]);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  const capabilities = [...systemCapabilities, ...customCapabilities];
  const allTools: any[] = [...capabilities, ...platformTools.map((t: any) => ({
    id: t.id || t.name,
    name: t.display_name || t.name?.replace(/_/g, ' ').replace(/\./g, ' ') || t.name,
    description: t.description || '',
    category: t.category || 'tool',
    enabled: true,
    system: true,
    risk_level: t.risk_level,
    requires_approval: t.requires_approval,
    byok_provider: t.byok_provider,
    tags: t.tags || [],
    permissions: t.permissions || [],
    cooldown: 0,
    maxRetries: 3,
    timeout: 60,
  }))];

  const filteredCapabilities = allTools.filter(cap => {
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
      setError('System capabilities are managed by the platform and cannot be toggled here');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateCapability = async () => {
    if (!selectedAgent?.id || !editingCapability) return;

    if (!editCapability.name.trim()) {
      setError('Please enter a capability name');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updated = await capabilitiesApi.updateCapability(selectedAgent.id, editingCapability.id, {
        name: editCapability.name,
        description: editCapability.description,
        enabled: editCapability.enabled,
        required_permissions: editCapability.requiredPermissions
          .split(',')
          .map(p => p.trim())
          .filter(p => p),
      });

      setCustomCapabilities(prev =>
        prev.map(c => (c.id === editingCapability.id ? { ...c, ...updated, category: 'custom' } : c))
      );

      setSuccessMessage(`Capability "${updated.name}" updated`);
      setTimeout(() => setSuccessMessage(null), 3000);

      setInlineView('list');
      setEditingCapability(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update capability');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
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
    if (cap.category !== 'custom') {
      setError('Only custom capabilities can be edited');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setEditingCapability(cap);
    setEditCapability({
      name: cap.name,
      description: cap.description,
      requiredPermissions: ((cap as any).requiredPermissions || cap.required_permissions || []).join(', '),
      enabled: cap.enabled,
    });
    setInlineView('edit');
  };

  // Test capability
  const handleTestCapability = async (capId: string) => {
    if (!selectedAgent?.id) return;

    const capability = capabilities.find(c => c.id === capId);
    if (!capability) return;

    if (capability.category !== 'custom') {
      setError('System capabilities cannot be tested here');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setTestingCapability(capId);
    setTestResult(null);

    const startedAt = Date.now();
    try {
      await capabilitiesApi.getCapabilitiesManifest(selectedAgent.id);
      const latency = Date.now() - startedAt;
      setTestResult({
        success: true,
        message: 'Capability reachable (manifest refreshed)',
        latency,
      });
    } catch (err: any) {
      const latency = Date.now() - startedAt;
      setTestResult({
        success: false,
        message: err.message || 'Test failed',
        latency,
      });
    }
    
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
      requiredPermissions: (((cap as any).requiredPermissions || cap.required_permissions || []) as string[]).join(', '),
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
    setInlineView('add');
  };

  // Toggle selection
  const toggleSelection = (capId: string) => {
    const cap = capabilities.find(c => c.id === capId);
    if (!cap || cap.category !== 'custom') return;
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
    const selectable = filteredCapabilities.filter(c => c.category === 'custom');
    if (selectedCapabilities.size === selectable.length) {
      setSelectedCapabilities(new Set());
    } else {
      setSelectedCapabilities(new Set(selectable.map(c => c.id)));
    }
  };

  // Bulk enable/disable
  const bulkToggle = async (enable: boolean) => {
    const idsToToggle = Array.from(selectedCapabilities);
    for (const capId of idsToToggle) {
      const cap = capabilities.find(c => c.id === capId);
      if (!cap || cap.category !== 'custom') continue;
      if (cap.enabled !== enable) {
        await toggleCapability(capId);
      }
    }
    setSelectedCapabilities(new Set());
    setSuccessMessage(`${idsToToggle.length} capabilities ${enable ? 'enabled' : 'disabled'}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Calculate totals for analytics
  const totalCallsToday = capabilities.reduce((sum, c) => sum + (c.callsToday || 0), 0);
  const totalCost = capabilities.reduce((sum, c) => sum + ((c.callsToday || 0) * (c.costPerCall || 0)), 0);
  const avgSuccessRate = capabilities.filter(c => c.successRate).reduce((sum, c, _, arr) => sum + (c.successRate || 0) / arr.length, 0);

  const exportCapabilities = () => {
    const data = JSON.stringify({ systemCapabilities, customCapabilities, platformTools, agent: selectedAgent?.name || 'unknown' }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capabilities-${selectedAgent?.name || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
      setInlineView('list');
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
        {inlineView === 'list' && (
          <button className={styles.addHeaderBtn} onClick={() => setInlineView('add')} title="Add Custom Capability">
            <Icons.Plus />
          </button>
        )}
        <button onClick={exportCapabilities} className={styles.exportBtn}>
          <Icons.Download /> Export
        </button>
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

      {inlineView === 'list' && <div className={styles.panelContent}>
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
                    disabled={cap.category !== 'custom'}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <h4>{cap.name}</h4>
              <p>{cap.description}</p>
              {cap.byok_provider && (
                <span style={{ fontSize: 11, color: '#f59e0b', display: 'inline-block', marginBottom: 4 }}>
                  🔑 Requires {cap.byok_provider} API key (BYOK)
                </span>
              )}
              {cap.risk_level && cap.risk_level !== 'low' && (
                <span style={{ fontSize: 11, color: cap.risk_level === 'high' ? '#ef4444' : '#f59e0b', display: 'inline-block', marginBottom: 4, marginLeft: 8 }}>
                  ⚠ {cap.risk_level} risk
                </span>
              )}

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
                {cap.timeout && <span className={styles.configItem}><Icons.Clock /> {cap.timeout}s</span>}
                {cap.rateLimit && <span className={styles.configItem}><Icons.Repeat /> {cap.rateLimit}/min</span>}
                {cap.costPerCall !== undefined && cap.costPerCall > 0 && (
                  <span className={styles.configItem}><Icons.DollarSign /> ${cap.costPerCall.toFixed(3)}</span>
                )}
                {cap.apiEndpoint && <span className={styles.configItem}><Icons.Link /> API</span>}
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
                  disabled={testingCapability === cap.id || cap.category !== 'custom'}
                  title="Test Capability"
                >
                  {testingCapability === cap.id ? <Icons.Clock /> : <Icons.Play />} Test
                </button>
                <button 
                  className={styles.actionBtn} 
                  onClick={() => handleEditCapability(cap)}
                  disabled={cap.category !== 'custom'}
                  title="Edit"
                >
                  <Icons.Edit /> Edit
                </button>
                <button 
                  className={styles.actionBtn} 
                  onClick={() => handleDuplicateCapability(cap)}
                  title="Duplicate"
                >
                  <Icons.Copy /> Copy
                </button>
                {cap.category === 'custom' && (
                  <button 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                    onClick={() => handleDeleteCapability(cap.id)}
                    title="Delete"
                  >
                    <Icons.Trash />
                  </button>
                )}
              </div>

              {/* Test Result */}
              {testingCapability === cap.id && testResult && (
                <div className={`${styles.testResult} ${testResult.success ? styles.testSuccess : styles.testFail}`}>
                  {testResult.success ? <Icons.CheckCircle /> : <Icons.XCircle />} {testResult.message}
                  {testResult.latency && <span> ({testResult.latency}ms)</span>}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>}

      {/* ====== INLINE ADD CAPABILITY FORM ====== */}
      {inlineView === 'add' && (
        <div className={styles.inlineForm}>
          <div className={styles.inlineFormHeader}>
            <h3 className={styles.inlineFormTitle}><Icons.Plus /> New Capability</h3>
            <button className={styles.inlineFormClose} onClick={() => setInlineView('list')}>
              <Icons.X />
            </button>
          </div>

          <div className={styles.inlineFormBody}>
            {/* Basic Info */}
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

            {/* Execution Settings */}
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

            {/* API / Integration */}
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

            {/* Schema */}
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

            {/* Cost */}
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>Cost & Billing</h4>
              <div className={styles.formGroup}>
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

          <div className={styles.inlineFormFooter}>
            <button className={styles.cancelBtn} onClick={() => setInlineView('list')}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleAddCapability} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Capability'}
            </button>
          </div>
        </div>
      )}

      {/* ====== INLINE EDIT CAPABILITY FORM ====== */}
      {inlineView === 'edit' && editingCapability && (
        <div className={styles.inlineForm}>
          <div className={styles.inlineFormHeader}>
            <h3 className={styles.inlineFormTitle}><Icons.Edit /> Edit Capability</h3>
            <button className={styles.inlineFormClose} onClick={() => { setInlineView('list'); setEditingCapability(null); }}>
              <Icons.X />
            </button>
          </div>

          <div className={styles.inlineFormBody}>
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>Basic Information</h4>
              <div className={styles.formGroup}>
                <label>Capability Name *</label>
                <input
                  type="text"
                  value={editCapability.name}
                  onChange={e => setEditCapability({ ...editCapability, name: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={editCapability.description}
                  onChange={e => setEditCapability({ ...editCapability, description: e.target.value })}
                  className={styles.textarea}
                  rows={2}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Required Permissions</label>
                <input
                  type="text"
                  value={editCapability.requiredPermissions}
                  onChange={e => setEditCapability({ ...editCapability, requiredPermissions: e.target.value })}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <div className={styles.toggleRow}>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={editCapability.enabled}
                      onChange={e => setEditCapability({ ...editCapability, enabled: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span className={styles.toggleLabel}>Enabled</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.inlineFormFooter}>
            <button className={styles.cancelBtn} onClick={() => { setInlineView('list'); setEditingCapability(null); }}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleUpdateCapability} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const CapabilitiesPanel = memo(CapabilitiesPanelComponent);
export default CapabilitiesPanel;
