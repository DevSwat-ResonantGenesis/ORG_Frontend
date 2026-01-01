/**
 * IDEHeader - Compact header with burger menu for IDE page
 * Matches home page style, no borders, #0a0a0a background
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './IDEHeader.module.css';

interface IDEHeaderProps {
  projectName?: string;
  onNewProject?: () => void;
  onOpenProject?: () => void;
  onSaveProject?: () => void;
}

export const IDEHeader: React.FC<IDEHeaderProps> = ({
  projectName,
  onNewProject,
  onOpenProject,
  onSaveProject,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const menuItems = [
    { label: 'Home', icon: '🏠', action: () => navigate('/') },
    { label: 'Dashboard', icon: '📊', action: () => navigate('/dashboard') },
    { label: 'Build', icon: '🔨', action: () => navigate('/build') },
    { label: 'Chat', icon: '💬', action: () => navigate('/chat') },
    { type: 'divider' },
    { label: 'New Project', icon: '➕', action: onNewProject },
    { label: 'Open Project', icon: '📂', action: onOpenProject },
    { label: 'Save Project', icon: '💾', action: onSaveProject },
    { type: 'divider' },
    { label: 'Settings', icon: '⚙️', action: () => navigate('/settings') },
    { label: 'Help', icon: '❓', action: () => navigate('/help') },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button 
          className={styles.burgerBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className={styles.logo} onClick={() => navigate('/')}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>Resonant</span>
        </div>

        {projectName && (
          <span className={styles.projectName}>{projectName}</span>
        )}
      </div>

      <div className={styles.right}>
        <span className={styles.badge}>IDE</span>
      </div>

      {/* Burger Menu Dropdown */}
      {menuOpen && (
        <div className={styles.menuDropdown} ref={menuRef}>
          {menuItems.map((item, i) => 
            item.type === 'divider' ? (
              <div key={i} className={styles.divider} />
            ) : (
              <button
                key={i}
                className={styles.menuItem}
                onClick={() => {
                  item.action?.();
                  setMenuOpen(false);
                }}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </header>
  );
};

export default IDEHeader;
