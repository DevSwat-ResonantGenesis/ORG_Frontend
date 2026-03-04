/**
 * Settings Sidebar Navigation
 */
import React from 'react';
import { AgentIcon, ProviderIcon, PatchIcon } from '@/components/Icons/SettingsIcons';
import { Tooltip } from '@/components/ui/Tooltip';
import styles from './SettingsSidebar.module.css';

type SettingsView = 'agents' | 'providers' | 'patches' | 'agent-edit';

interface SettingsSidebarProps {
  currentView: SettingsView;
  onViewChange: (view: SettingsView, agentId?: string) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  currentView,
  onViewChange,
}) => {
  const menuItems = [
    {
      id: 'agents' as SettingsView,
      label: 'Agents',
      icon: AgentIcon,
      description: 'Manage AI agents',
      tooltip: 'Create, edit, and configure AI agents. Set system prompts, memory settings, and customize behavior.',
    },
    {
      id: 'providers' as SettingsView,
      label: 'Providers',
      icon: ProviderIcon,
      description: 'Custom AI providers',
      tooltip: 'Add and manage custom AI providers. Configure API keys, endpoints, and model availability.',
    },
    {
      id: 'patches' as SettingsView,
      label: 'Patches',
      icon: PatchIcon,
      description: 'Control 23 patches',
      tooltip: 'Enable or disable the 23 cognitive patches. Control execution mode (live/background) for each patch.',
    },
  ];

  return (
    <nav className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Settings</h2>
        <p className={styles.subtitle}>AGI Neural Hub Configuration</p>
      </div>

      <ul className={styles.menu}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.id}>
              <Tooltip content={item.tooltip} position="right">
                <button
                  className={`${styles.menuItem} ${
                    currentView === item.id ? styles.active : ''
                  }`}
                  onClick={() => onViewChange(item.id)}
                >
                  <span className={styles.icon}>
                    <IconComponent size={20} />
                  </span>
                  <div className={styles.menuItemContent}>
                    <span className={styles.label}>{item.label}</span>
                    <span className={styles.description}>{item.description}</span>
                  </div>
                </button>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

