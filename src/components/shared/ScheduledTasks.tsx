import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, MoreVertical, Search, CheckCircle, XCircle, Clock, Play, Pause, RefreshCw, AlertTriangle, Zap } from 'lucide-react';

type TaskStatus = 'active' | 'paused' | 'completed' | 'failed';
type TaskFrequency = 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'cron';

interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  frequency: TaskFrequency;
  cronExpression?: string;
  lastRun?: Date;
  nextRun?: Date;
  lastDuration?: number;
  successCount: number;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ScheduledTasksProps {
  tasks: ScheduledTask[];
  onCreateTask?: () => void;
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleTask?: (taskId: string) => void;
  onRunNow?: (taskId: string) => void;
  onViewLogs?: (taskId: string) => void;
  className?: string;
}

interface TaskRowProps {
  task: ScheduledTask;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  onRunNow?: () => void;
  onViewLogs?: () => void;
}

const STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: 'Active',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  paused: {
    label: 'Paused',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Pause size={12} />,
  },
  completed: {
    label: 'Completed',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <CheckCircle size={12} />,
  },
  failed: {
    label: 'Failed',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
};

const FREQUENCY_CONFIG: Record<TaskFrequency, { label: string; color: string }> = {
  once: { label: 'Once', color: '#888' },
  hourly: { label: 'Hourly', color: '#3b82f6' },
  daily: { label: 'Daily', color: '#10b981' },
  weekly: { label: 'Weekly', color: '#8b5cf6' },
  monthly: { label: 'Monthly', color: '#f59e0b' },
  cron: { label: 'Custom', color: '#ec4899' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tableTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '180px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  tr: {
    transition: 'background 0.15s',
  },
  trHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.875rem',
    color: '#e4e4e7',
  },
  taskCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  taskIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  taskName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  taskDescription: {
    fontSize: '0.6875rem',
    color: '#888',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  frequencyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  scheduleCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  scheduleLabel: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  scheduleValue: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
  },
  statsCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  runButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '6px',
    color: '#10b981',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '22px',
    borderRadius: '11px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleKnob: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#fff',
    transition: 'transform 0.15s',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.375rem',
    minWidth: '140px',
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#e4e4e7',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'background 0.15s',
    textAlign: 'left',
  },
  dropdownItemDanger: {
    color: '#ef4444',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatDuration = (ms: number): string => {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatTimeUntil = (date: Date) => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (diff < 0) return 'Overdue';
  if (minutes < 60) return `in ${minutes}m`;
  if (hours < 24) return `in ${hours}h`;
  return `in ${Math.floor(hours / 24)}d`;
};

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onEdit,
  onDelete,
  onToggle,
  onRunNow,
  onViewLogs,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = STATUS_CONFIG[task.status];
  const frequencyConfig = FREQUENCY_CONFIG[task.frequency];

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <td style={styles.td}>
        <div style={styles.taskCell}>
          <div
            style={{
              ...styles.taskIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Calendar size={18} />
          </div>
          <div>
            <div style={styles.taskName}>{task.name}</div>
            {task.description && (
              <div style={styles.taskDescription}>{task.description}</div>
            )}
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.statusBadge,
            background: statusConfig.bgColor,
            color: statusConfig.color,
          }}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.frequencyBadge, color: frequencyConfig.color }}>
          {frequencyConfig.label}
        </span>
        {task.cronExpression && (
          <div style={{ fontSize: '0.6875rem', color: '#666', marginTop: '0.25rem', fontFamily: "'JetBrains Mono', monospace" }}>
            {task.cronExpression}
          </div>
        )}
      </td>
      <td style={styles.td}>
        <div style={styles.scheduleCell}>
          {task.lastRun ? (
            <>
              <span style={styles.scheduleLabel}>Last run</span>
              <span style={styles.scheduleValue}>{formatDate(task.lastRun)}</span>
            </>
          ) : (
            <span style={{ color: '#666' }}>Never run</span>
          )}
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.scheduleCell}>
          {task.nextRun && task.status === 'active' ? (
            <>
              <span style={styles.scheduleLabel}>Next run</span>
              <span style={styles.scheduleValue}>{formatTimeUntil(task.nextRun)}</span>
            </>
          ) : (
            <span style={{ color: '#666' }}>-</span>
          )}
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.statsCell}>
          <span style={{ ...styles.statItem, color: '#10b981' }}>
            <CheckCircle size={12} />
            {task.successCount}
          </span>
          <span style={{ ...styles.statItem, color: '#ef4444' }}>
            <XCircle size={12} />
            {task.failureCount}
          </span>
        </div>
      </td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <div style={styles.actionButtons}>
          {onToggle && (
            <button
              style={{
                ...styles.toggleButton,
                background: task.status === 'active' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
              }}
              onClick={onToggle}
            >
              <div
                style={{
                  ...styles.toggleKnob,
                  transform: task.status === 'active' ? 'translateX(9px)' : 'translateX(-9px)',
                }}
              />
            </button>
          )}
          {onRunNow && task.status === 'active' && (
            <button style={styles.runButton} onClick={onRunNow}>
              <Play size={12} />
              Run
            </button>
          )}
          <button
            style={styles.actionButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>
        </div>
        {showMenu && (
          <div style={styles.dropdown}>
            {onEdit && (
              <button style={styles.dropdownItem} onClick={onEdit}>
                <Edit2 size={14} />
                Edit
              </button>
            )}
            {onViewLogs && (
              <button style={styles.dropdownItem} onClick={onViewLogs}>
                <Clock size={14} />
                View Logs
              </button>
            )}
            {onDelete && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onDelete}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const ScheduledTasks: React.FC<ScheduledTasksProps> = ({
  tasks,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
  onRunNow,
  onViewLogs,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTasks = tasks.filter(t => t.status === 'active').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;
  const totalSuccess = tasks.reduce((sum, t) => sum + t.successCount, 0);
  const totalFailure = tasks.reduce((sum, t) => sum + t.failureCount, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Calendar size={22} />
          Scheduled Tasks
        </h2>
        <div style={styles.headerActions}>
          {onCreateTask && (
            <button style={styles.createButton} onClick={onCreateTask}>
              <Plus size={14} />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Calendar size={20} />
          </div>
          <div style={styles.statValue}>{tasks.length}</div>
          <div style={styles.statLabel}>Total Tasks</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Zap size={20} />
          </div>
          <div style={styles.statValue}>{activeTasks}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{failedTasks}</div>
          <div style={styles.statLabel}>Failed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <RefreshCw size={20} />
          </div>
          <div style={styles.statValue}>{totalSuccess + totalFailure}</div>
          <div style={styles.statLabel}>Total Runs</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>All Tasks</span>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search tasks..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div style={styles.empty}>
            <Calendar size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No scheduled tasks found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Task</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Frequency</th>
                <th style={styles.th}>Last Run</th>
                <th style={styles.th}>Next Run</th>
                <th style={styles.th}>Stats</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onEdit={onEditTask ? () => onEditTask(task.id) : undefined}
                  onDelete={onDeleteTask ? () => onDeleteTask(task.id) : undefined}
                  onToggle={onToggleTask ? () => onToggleTask(task.id) : undefined}
                  onRunNow={onRunNow ? () => onRunNow(task.id) : undefined}
                  onViewLogs={onViewLogs ? () => onViewLogs(task.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ScheduledTasks;
