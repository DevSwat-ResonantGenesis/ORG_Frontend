/**
 * Agent Export/Import Component
 * Export agent configurations and import from JSON
 */
import React, { useState } from 'react';
import { settingsApi } from '@/api/settings';
import { logger } from '@/utils/logger';
import styles from './AgentExportImport.module.css';

interface AgentExportImportProps {
  agentId: string;
  agentName: string;
  onImportComplete?: () => void;
}

export const AgentExportImport: React.FC<AgentExportImportProps> = ({
  agentId,
  agentName,
  onImportComplete,
}) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importData, setImportData] = useState('');
  const [overwrite, setOverwrite] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);
      
      // Get agent data first
      const agent = await settingsApi.getAgent(agentId);
      
      // Create export object with all agent data
      const exportData = {
        name: agent.name,
        description: agent.description,
        system_prompt: agent.system_prompt,
        personality_config: agent.personality_config,
        enabled_patches: agent.enabled_patches,
        patch_config: agent.patch_config,
        memory_config: agent.memory_config,
        anchor_config: agent.anchor_config,
        agent_hash: agent.agent_hash,
        version: '1.0',
        exported_at: new Date().toISOString(),
      };
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agentName.replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Agent exported successfully!');
    } catch (err: any) {
      logger.error('Failed to export agent', err);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to export agent';
      setError(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      setError('Please paste the JSON export data or upload a file');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      
      const parsedData = JSON.parse(importData);
      
      // Create new agent from imported data
      const agentData = {
        name: parsedData.name || 'Imported Agent',
        description: parsedData.description,
        system_prompt: parsedData.system_prompt,
        personality_config: parsedData.personality_config,
        enabled_patches: parsedData.enabled_patches,
        patch_config: parsedData.patch_config,
        memory_config: parsedData.memory_config,
        anchor_config: parsedData.anchor_config,
      };
      
      // Check if agent with same name exists
      const existingAgents = await settingsApi.listAgents();
      const existing = existingAgents.find(a => a.name === agentData.name);
      
      if (existing && !overwrite) {
        setError(`Agent "${agentData.name}" already exists. Check "Overwrite" to replace it.`);
        setImporting(false);
        return;
      }
      
      if (existing && overwrite) {
        await settingsApi.updateAgent(existing.id, agentData);
        alert(`Agent "${agentData.name}" updated successfully!`);
      } else {
        await settingsApi.createAgent(agentData);
        alert(`Agent "${agentData.name}" imported successfully!`);
      }
      
      setImportData('');
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: any) {
      logger.error('Failed to import agent', err);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to import agent. Please check the JSON format.';
      setError(errorMsg);
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Export / Import</h2>
        <p className={styles.subtitle}>
          Export agent configuration or import from a JSON file
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Export Agent</h3>
        <p className={styles.sectionDescription}>
          Download this agent's configuration as a JSON file
        </p>
        <button
          className={styles.exportButton}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export Agent Configuration'}
        </button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Import Agent</h3>
        <p className={styles.sectionDescription}>
          Import an agent configuration from a JSON file or paste JSON data
        </p>

        <div className={styles.importOptions}>
          <div className={styles.fileUpload}>
            <label className={styles.fileLabel}>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className={styles.fileInput}
              />
              Choose JSON File
            </label>
          </div>

          <div className={styles.orDivider}>or</div>

          <div className={styles.textAreaContainer}>
            <label className={styles.label}>Paste JSON Data</label>
            <textarea
              className={styles.textarea}
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={10}
              placeholder="Paste exported agent JSON here..."
            />
          </div>
        </div>

        <div className={styles.importOptions}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
            />
            <span>Overwrite existing agent if name matches</span>
          </label>
        </div>

        <button
          className={styles.importButton}
          onClick={handleImport}
          disabled={importing || !importData.trim()}
        >
          {importing ? 'Importing...' : 'Import Agent'}
        </button>
      </div>
    </div>
  );
};

