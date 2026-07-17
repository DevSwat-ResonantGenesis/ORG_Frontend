/**
 * Terminal Page - Standalone Terminal Interface
 * ==========================================
 * 
 * A dedicated page for the terminal that can be accessed via /terminal route.
 * Uses the same TerminalTabs and InteractiveTerminal components as the IDE and split view.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TerminalTabs, type TerminalTab as TerminalTabType } from '@/components/IDE/TerminalTabs';
import { storageKeyFor, loadInitialTabs } from '@/components/IDE/terminalSession';
import { WorkspaceSwitcher } from '@/components/IDE/WorkspaceSwitcher';
import { Header } from '@/components/layout/Header/Header';
import { isAuthenticated } from '@/api/auth';
import styles from './TerminalPage.module.css';

export const TerminalPage: React.FC = () => {
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<TerminalTabType[]>(() => loadInitialTabs(projectId));

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login?redirect=/terminal');
    }
  }, [navigate]);

  // Reload tabs when projectId changes
  const loadedProjectIdRef = useRef(projectId);
  useEffect(() => {
    if (loadedProjectIdRef.current === projectId) return;
    loadedProjectIdRef.current = projectId;
    setTabs(loadInitialTabs(projectId));
  }, [projectId]);

  // Save tabs to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKeyFor(projectId), JSON.stringify(tabs));
    } catch {
      // sessionStorage unavailable - not fatal
    }
  }, [tabs, projectId]);

  const handleTabAdd = () => {
    const newTab: TerminalTabType = {
      id: crypto.randomUUID(),
      name: `Terminal ${tabs.length + 1}`,
      content: '',
      active: false,
    };
    setTabs([...tabs.map((t) => ({ ...t, active: false })), newTab]);
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;
    const wasActive = tabs.find((t) => t.id === tabId)?.active;
    const newTabs = tabs.filter((t) => t.id !== tabId);
    if (wasActive && newTabs.length > 0) newTabs[0].active = true;
    setTabs(newTabs);
  };

  const handleTabSelect = (tabId: string) => {
    setTabs(tabs.map((t) => ({ ...t, active: t.id === tabId })));
  };

  return (
    <div className={styles.terminalPage}>
      {/* Global Header */}
      <Header showLogout={true} />

      {/* Terminal Page Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Terminal</h1>
          </div>
          <div className={styles.headerRight}>
            <WorkspaceSwitcher activeProjectId={projectId} onSelect={setProjectId} />
          </div>
        </div>
      </header>

      {/* Subtitle */}
      <div className={styles.subtitleContainer}>
        <p className={styles.subtitle}>Real sandboxed shell with Claude Code CLI</p>
      </div>

      {/* Terminal Content */}
      <div className={styles.terminalContent}>
        <TerminalTabs
          tabs={tabs}
          projectId={projectId}
          onTabAdd={handleTabAdd}
          onTabClose={handleTabClose}
          onTabSelect={handleTabSelect}
        />
      </div>
    </div>
  );
};

export default TerminalPage;
