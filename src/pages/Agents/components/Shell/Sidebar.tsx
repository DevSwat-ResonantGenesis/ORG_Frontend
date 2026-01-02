import React, { memo } from 'react';
import { useUIStore } from '../../../../stores';
import { Icons } from '../shared/Icons';
import type { SidebarSection } from '../../../../types';
import styles from './Sidebar.module.css';

const SIDEBAR_SECTIONS: { id: SidebarSection; label: string; icon: React.ReactNode }[] = [
  { id: 'agents', label: 'Agents', icon: <Icons.Agents /> },
  { id: 'factory', label: 'Factory', icon: <Icons.Factory /> },
  { id: 'capabilities', label: 'Capabilities', icon: <Icons.Capabilities /> },
  { id: 'utility', label: 'Utility', icon: <Icons.Execution /> },
  { id: 'goals', label: 'Goals', icon: <Icons.Goals /> },
  { id: 'execution', label: 'Execution', icon: <Icons.Execution /> },
  { id: 'memory', label: 'Memory', icon: <Icons.Memory /> },
  { id: 'economy', label: 'Economy', icon: <Icons.Economy /> },
  { id: 'negotiation', label: 'Negotiation', icon: <Icons.Negotiation /> },
  { id: 'governance', label: 'Governance', icon: <Icons.Governance /> },
  { id: 'audit', label: 'Audit', icon: <Icons.Audit /> },
  { id: 'debug', label: 'Debug', icon: <Icons.Health /> },
  { id: 'workflow', label: 'Workflow', icon: <Icons.Fork /> },
  { id: 'chat', label: 'Chat', icon: <Icons.User /> },
  { id: 'monitor', label: 'Monitor', icon: <Icons.Health /> },
  { id: 'external', label: 'External', icon: <Icons.External /> },
  { id: 'settings', label: 'Settings', icon: <Icons.Settings /> },
];

interface SidebarProps {
  className?: string;
}

const SidebarComponent: React.FC<SidebarProps> = ({ className }) => {
  const activeSection = useUIStore((state) => state.activeSection);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const setActiveSection = useUIStore((state) => state.setActiveSection);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''} ${className || ''}`}>
      <div className={styles.sidebarHeader}>
        <button className={styles.collapseBtn} onClick={toggleSidebar}>
          {sidebarCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        {SIDEBAR_SECTIONS.map((section) => (
          <button
            key={section.id}
            className={`${styles.navItem} ${activeSection === section.id ? styles.active : ''}`}
            onClick={() => setActiveSection(section.id)}
            title={sidebarCollapsed ? section.label : undefined}
          >
            <span className={styles.navIcon}>{section.icon}</span>
            {!sidebarCollapsed && <span className={styles.navLabel}>{section.label}</span>}
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter} />
    </aside>
  );
};

export const Sidebar = memo(SidebarComponent);
export default Sidebar;
