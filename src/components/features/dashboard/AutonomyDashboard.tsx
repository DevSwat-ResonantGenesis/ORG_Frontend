/**
 * AUTONOMY DASHBOARD
 * ==================
 * 
 * Dashboard component for monitoring and controlling the Full Autonomy System.
 */

import React, { useState } from 'react';
import {
  useAutonomyStatus,
  useAgentNetwork,
  useAgentBrains,
  useAutonomousQueue,
  useWatchdog,
  useAutonomyControl,
} from '../../../hooks/useAutonomy';
import styles from './AutonomyDashboard.module.css';

// ============== STATUS BADGE ==============

interface StatusBadgeProps {
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const statusColors = {
    healthy: '#22c55e',
    degraded: '#eab308',
    critical: '#ef4444',
    offline: '#6b7280',
  };

  return (
    <span className={styles.statusBadge} style={{ backgroundColor: statusColors[status] }}>
      {label || status}
    </span>
  );
};

// ============== STAT CARD ==============

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTitle}>{title}</div>
      <div className={styles.statValue}>
        {value}
        {trend && (
          <span className={`${styles.trend} ${styles[trend]}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
    </div>
  );
};

// ============== SYSTEM STATUS PANEL ==============

const SystemStatusPanel: React.FC = () => {
  const { status, stats, isLoading, error } = useAutonomyStatus({ pollingInterval: 5000 });

  if (isLoading) {
    return <div className={styles.loading}>Loading system status...</div>;
  }

  if (error) {
    return <div className={styles.error}>Failed to load: {error.message}</div>;
  }

  if (!status) {
    return <div className={styles.offline}>System offline</div>;
  }

  const healthPercent = status.total_subsystems > 0
    ? Math.round((status.healthy_subsystems / status.total_subsystems) * 100)
    : 0;

  const overallStatus = healthPercent >= 80 ? 'healthy' : healthPercent >= 50 ? 'degraded' : 'critical';

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>System Status</h3>
        <StatusBadge status={status.running ? overallStatus : 'offline'} />
      </div>
      
      <div className={styles.statsGrid}>
        <StatCard
          title="Health"
          value={`${healthPercent}%`}
          subtitle={`${status.healthy_subsystems}/${status.total_subsystems} subsystems`}
        />
        <StatCard
          title="Status"
          value={status.running ? 'Running' : 'Stopped'}
          subtitle={status.startup_complete ? 'Fully initialized' : 'Initializing...'}
        />
      </div>

      <div className={styles.subsystems}>
        <h4>Subsystems</h4>
        {Object.entries(status.subsystems).map(([name, sub]) => (
          <div key={name} className={styles.subsystemRow}>
            <span className={styles.subsystemName}>{name}</span>
            <StatusBadge status={sub.running ? 'healthy' : sub.error ? 'critical' : 'offline'} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============== AGENT NETWORK PANEL ==============

const AgentNetworkPanel: React.FC = () => {
  const { hierarchy, stats, isLoading, error, spawnAgent } = useAgentNetwork();
  const [spawning, setSpawning] = useState(false);

  const handleSpawnAgent = async () => {
    setSpawning(true);
    try {
      await spawnAgent({
        name: `Agent_${Date.now()}`,
        role: 'worker',
        capabilities: ['execute', 'learn'],
      });
    } finally {
      setSpawning(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading network...</div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Agent Network</h3>
        <button
          className={styles.actionButton}
          onClick={handleSpawnAgent}
          disabled={spawning}
        >
          {spawning ? 'Spawning...' : '+ Spawn Agent'}
        </button>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <StatCard title="Total Agents" value={stats.total_agents} />
          <StatCard title="Active" value={stats.active_agents} />
          <StatCard title="Tasks Done" value={stats.total_tasks_completed} />
          <StatCard title="Spawned" value={stats.total_agents_spawned} />
        </div>
      )}

      {stats?.by_role && (
        <div className={styles.roleDistribution}>
          <h4>By Role</h4>
          {Object.entries(stats.by_role).map(([role, count]) => (
            <div key={role} className={styles.roleRow}>
              <span>{role}</span>
              <span className={styles.roleCount}>{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============== BRAINS PANEL ==============

const BrainsPanel: React.FC = () => {
  const { brains, isLoading, error, setGoal } = useAgentBrains();

  if (isLoading) {
    return <div className={styles.loading}>Loading brains...</div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Agent Brains</h3>
        <span className={styles.count}>{brains.length} active</span>
      </div>

      <div className={styles.brainsList}>
        {brains.length === 0 ? (
          <div className={styles.empty}>No active brains</div>
        ) : (
          brains.map((brain) => (
            <div key={brain.agent_id} className={styles.brainCard}>
              <div className={styles.brainHeader}>
                <span className={styles.brainName}>{brain.name}</span>
                <StatusBadge status={brain.running ? 'healthy' : 'offline'} />
              </div>
              <div className={styles.brainGoal}>{brain.current_goal}</div>
              <div className={styles.brainStats}>
                <span>Actions: {brain.actions_taken}</span>
                <span>Success: {Math.round(brain.success_rate * 100)}%</span>
                <span>Spawned: {brain.spawned_agents}</span>
              </div>
              <div className={styles.brainState}>
                State: <strong>{brain.state}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============== QUEUE PANEL ==============

const QueuePanel: React.FC = () => {
  const { stats, tasks, isLoading } = useAutonomousQueue();

  if (isLoading) {
    return <div className={styles.loading}>Loading queue...</div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Task Queue</h3>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <StatCard title="Total Tasks" value={stats.total_tasks} />
          <StatCard title="Pending" value={stats.pending_tasks} />
          <StatCard title="Agents" value={stats.registered_agents} />
        </div>
      )}

      <div className={styles.tasksList}>
        <h4>Recent Tasks</h4>
        {tasks.slice(0, 5).map((task) => (
          <div key={task.id} className={styles.taskRow}>
            <span className={styles.taskDesc}>{task.description.slice(0, 50)}...</span>
            <span className={`${styles.taskStatus} ${styles[task.status]}`}>
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============== WATCHDOG PANEL ==============

const WatchdogPanel: React.FC = () => {
  const { status, alerts, isLoading, acknowledgeAlert } = useWatchdog();

  if (isLoading) {
    return <div className={styles.loading}>Loading watchdog...</div>;
  }

  const unacknowledged = alerts.filter((a) => !a.acknowledged);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>System Watchdog</h3>
        {unacknowledged.length > 0 && (
          <span className={styles.alertBadge}>{unacknowledged.length} alerts</span>
        )}
      </div>

      {status && (
        <div className={styles.watchdogStatus}>
          <span>Running: {status.running ? 'Yes' : 'No'}</span>
          <span>Healthy: {status.healthy_count}/{status.total_count}</span>
        </div>
      )}

      {unacknowledged.length > 0 && (
        <div className={styles.alertsList}>
          <h4>Active Alerts</h4>
          {unacknowledged.slice(0, 5).map((alert) => (
            <div key={alert.id} className={`${styles.alertRow} ${styles[alert.severity]}`}>
              <div className={styles.alertContent}>
                <span className={styles.alertSubsystem}>{alert.subsystem}</span>
                <span className={styles.alertMessage}>{alert.message}</span>
              </div>
              <button
                className={styles.ackButton}
                onClick={() => acknowledgeAlert(alert.id)}
              >
                Ack
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============== CONTROL PANEL ==============

const ControlPanel: React.FC = () => {
  const { isStarting, isStopping, start, stop, quickStart, createAgent } = useAutonomyControl();
  const { status } = useAutonomyStatus({ pollingInterval: 2000 });
  const [agentName, setAgentName] = useState('');
  const [agentGoal, setAgentGoal] = useState('');

  const handleQuickStart = async () => {
    await quickStart(agentName || undefined, agentGoal || undefined);
    setAgentName('');
    setAgentGoal('');
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>Control Center</h3>
      </div>

      <div className={styles.controls}>
        {!status?.running ? (
          <button
            className={`${styles.controlButton} ${styles.start}`}
            onClick={() => start()}
            disabled={isStarting}
          >
            {isStarting ? 'Starting...' : 'Start Full Autonomy'}
          </button>
        ) : (
          <button
            className={`${styles.controlButton} ${styles.stop}`}
            onClick={() => stop()}
            disabled={isStopping}
          >
            {isStopping ? 'Stopping...' : 'Stop Autonomy'}
          </button>
        )}
      </div>

      <div className={styles.quickStart}>
        <h4>Quick Start Agent</h4>
        <input
          type="text"
          placeholder="Agent name (optional)"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Goal (optional)"
          value={agentGoal}
          onChange={(e) => setAgentGoal(e.target.value)}
          className={styles.input}
        />
        <button
          className={styles.quickStartButton}
          onClick={handleQuickStart}
          disabled={isStarting}
        >
          Quick Start
        </button>
      </div>
    </div>
  );
};

// ============== MAIN DASHBOARD ==============

export const AutonomyDashboard: React.FC = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Full Autonomy Dashboard</h1>
        <p>Monitor and control autonomous agents</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <SystemStatusPanel />
          <AgentNetworkPanel />
          <QueuePanel />
        </div>
        <div className={styles.sideColumn}>
          <ControlPanel />
          <BrainsPanel />
          <WatchdogPanel />
        </div>
      </div>
    </div>
  );
};

export default AutonomyDashboard;
