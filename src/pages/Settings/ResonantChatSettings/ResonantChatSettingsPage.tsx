/**
 * Resonant Chat Settings Page
 * Main settings panel for agents, providers, and patches
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernPageLayout } from '@/components/layout/ModernPageLayout';
import { SettingsSidebar } from './SettingsSidebar';
import { AgentList } from './Agents/AgentList';
import { AgentEditor } from './Agents/AgentEditor';
import { ProviderList } from './Providers/ProviderList';
import { PatchControlPanel } from './Patches/PatchControlPanel';
import { BackArrowIcon } from '@/components/Icons/SettingsIcons';
import { Tooltip } from '@/components/ui/Tooltip';
import styles from './ResonantChatSettingsPage.module.css';

type SettingsView = 'agents' | 'providers' | 'patches' | 'agent-edit';

interface ResonantChatSettingsPageProps {
  initialView?: SettingsView;
  agentId?: string;
}

export const ResonantChatSettingsPage: React.FC<ResonantChatSettingsPageProps> = ({
  initialView = 'agents',
  agentId,
}) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<SettingsView>(
    agentId ? 'agent-edit' : initialView
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(agentId);

  const handleViewChange = (view: SettingsView, agentId?: string) => {
    setCurrentView(view);
    setSelectedAgentId(agentId);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'agents':
        return (
          <AgentList
            onEditAgent={(id) => handleViewChange('agent-edit', id)}
            onCreateAgent={() => handleViewChange('agent-edit')}
          />
        );
      case 'agent-edit':
        return (
          <AgentEditor
            agentId={selectedAgentId}
            onBack={() => handleViewChange('agents')}
            onSave={() => handleViewChange('agents')}
          />
        );
      case 'providers':
        return <ProviderList />;
      case 'patches':
        return (
          <PatchControlPanel
            agentId={selectedAgentId}
            onSelectAgent={(id) => setSelectedAgentId(id)}
          />
        );
      default:
        return <AgentList onEditAgent={() => {}} onCreateAgent={() => {}} />;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backButtonContainer}>
        <Tooltip content="Go back to previous page">
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            <BackArrowIcon size={18} />
            <span>Back</span>
          </button>
        </Tooltip>
      </div>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <SettingsSidebar
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>
        <div className={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ResonantChatSettingsPage;

