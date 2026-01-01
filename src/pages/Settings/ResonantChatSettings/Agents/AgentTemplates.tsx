/**
 * Agent Templates Component
 * Save agents as templates and create new agents from templates
 */
import React, { useState, useEffect } from 'react';
import { settingsApi } from '@/api/settings';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { logger } from '@/utils/logger';
import styles from './AgentTemplates.module.css';

interface AgentTemplatesProps {
  agentId?: string;
  agentName?: string;
  onTemplateCreated?: () => void;
  onAgentCreated?: () => void;
}

interface Template {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const AgentTemplates: React.FC<AgentTemplatesProps> = ({
  agentId,
  agentName,
  onTemplateCreated,
  onAgentCreated,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAgentName, setNewAgentName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get all agents and filter for templates
      const allAgents = await settingsApi.listAgents();
      const templateAgents = allAgents.filter(a => a.is_template === true);
      setTemplates(templateAgents.map(a => ({
        id: a.id,
        template_id: a.id,
        name: a.name,
        description: a.description,
        created_at: a.created_at,
      })));
    } catch (err: any) {
      logger.error('Failed to load templates', err);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to load templates';
      // If 404, show empty state
      if (err?.response?.status === 404) {
        setTemplates([]);
        setError(null);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!agentId) {
      setError('No agent selected');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Get current agent
      const agent = await settingsApi.getAgent(agentId);
      
      // Create new agent as template
      const templateData = {
        name: `${agent.name} (Template)`,
        description: agent.description || `Template based on ${agent.name}`,
        system_prompt: agent.system_prompt,
        personality_config: agent.personality_config,
        enabled_patches: agent.enabled_patches,
        patch_config: agent.patch_config,
        memory_config: agent.memory_config,
        anchor_config: agent.anchor_config,
        is_template: true,
      };
      
      const result = await settingsApi.createAgent(templateData);
      
      alert(`Agent saved as template: ${result.name}`);
      await loadTemplates();
      if (onTemplateCreated) {
        onTemplateCreated();
      }
    } catch (err: any) {
      logger.error('Failed to save template', err);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to save template';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !newAgentName.trim()) {
      setError('Please select a template and enter a name');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      // Get template agent
      const template = await settingsApi.getAgent(selectedTemplate);
      
      // Create new agent from template
      const agentData = {
        name: newAgentName.trim(),
        description: template.description,
        system_prompt: template.system_prompt,
        personality_config: template.personality_config,
        enabled_patches: template.enabled_patches,
        patch_config: template.patch_config,
        memory_config: template.memory_config,
        anchor_config: template.anchor_config,
        template_id: template.id,
        is_template: false,
      };
      
      const result = await settingsApi.createAgent(agentData);
      
      alert(`Agent created from template: ${result.name}`);
      setNewAgentName('');
      setSelectedTemplate(null);
      if (onAgentCreated) {
        onAgentCreated();
      }
    } catch (err: any) {
      logger.error('Failed to create from template', err);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to create agent from template';
      setError(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading templates..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Agent Templates</h2>
        <p className={styles.subtitle}>
          Save agents as reusable templates or create new agents from templates
        </p>
      </div>

      {loading && templates.length === 0 && !error && (
        <LoadingState message="Loading templates..." />
      )}

      {error && (
        <div className={styles.errorBanner}>
          <ErrorState message={error} onRetry={loadTemplates} />
        </div>
      )}

      {agentId && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Save Current Agent as Template</h3>
          <p className={styles.sectionDescription}>
            Save "{agentName}" as a reusable template that can be used to create new agents
          </p>
          <button
            className={styles.saveButton}
            onClick={handleSaveAsTemplate}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Template'}
          </button>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Create Agent from Template</h3>
        <p className={styles.sectionDescription}>
          Select a template and create a new agent with the same configuration
        </p>

        {templates.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No templates available. Save an agent as a template first.</p>
          </div>
        ) : (
          <>
            <div className={styles.templateSelect}>
              <label className={styles.label}>Select Template</label>
              <select
                className={styles.select}
                value={selectedTemplate || ''}
                onChange={(e) => setSelectedTemplate(e.target.value || null)}
              >
                <option value="">Choose a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.template_id}>
                    {template.name} {template.description ? `- ${template.description}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.nameInput}>
              <label className={styles.label}>
                New Agent Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                placeholder="My New Agent"
              />
            </div>

            <button
              className={styles.createButton}
              onClick={handleCreateFromTemplate}
              disabled={creating || !selectedTemplate || !newAgentName.trim()}
            >
              {creating ? 'Creating...' : 'Create Agent from Template'}
            </button>
          </>
        )}
      </div>

      {templates.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Available Templates</h3>
          <div className={styles.templatesList}>
            {templates.map((template) => (
              <div key={template.id} className={styles.templateCard}>
                <h4 className={styles.templateName}>{template.name}</h4>
                {template.description && (
                  <p className={styles.templateDescription}>{template.description}</p>
                )}
                <div className={styles.templateMeta}>
                  <span className={styles.metaText}>
                    Created: {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

