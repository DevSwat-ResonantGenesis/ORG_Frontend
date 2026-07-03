// ============== TASK RUNNER ==============
// Automated task execution with npm scripts and custom commands

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './TaskRunner.module.css';

interface Task {
  id: string;
  name: string;
  command: string;
  type: 'npm' | 'shell' | 'custom';
  status: 'idle' | 'running' | 'success' | 'failed';
  lastRun?: Date;
  duration?: number;
  output?: string[];
  isDefault?: boolean;
}

interface TaskGroup {
  name: string;
  tasks: Task[];
}

interface TaskRunnerProps {
  tasks?: Task[];
  packageJson?: { scripts?: Record<string, string> };
  onRunTask?: (task: Task) => void;
  onStopTask?: (taskId: string) => void;
  className?: string;
}

const defaultTasks: Task[] = [
  { id: 'dev', name: 'dev', command: 'npm run dev', type: 'npm', status: 'idle', isDefault: true },
  { id: 'build', name: 'build', command: 'npm run build', type: 'npm', status: 'idle' },
  { id: 'test', name: 'test', command: 'npm run test', type: 'npm', status: 'idle' },
  { id: 'lint', name: 'lint', command: 'npm run lint', type: 'npm', status: 'idle' },
  { id: 'format', name: 'format', command: 'npm run format', type: 'npm', status: 'idle' },
  { id: 'typecheck', name: 'typecheck', command: 'npm run typecheck', type: 'npm', status: 'idle' },
];

const TaskRunnerComponent: React.FC<TaskRunnerProps> = ({
  tasks: initialTasks = defaultTasks,
  packageJson,
  onRunTask,
  onStopTask,
  className,
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', command: '', type: 'shell' as Task['type'] });
  const [filter, setFilter] = useState<'all' | 'npm' | 'shell' | 'running'>('all');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [selectedTask?.output]);

  const runTask = useCallback((task: Task) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id 
        ? { ...t, status: 'running' as const, output: ['Starting task...'], lastRun: new Date() }
        : t
    ));
    setSelectedTask(task);
    onRunTask?.(task);

    // Simulate task execution
    const startTime = Date.now();
    const outputs: string[] = ['Starting task...', `$ ${task.command}`, ''];

    const interval = setInterval(() => {
      const randomOutput = getRandomOutput(task.type);
      outputs.push(randomOutput);
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, output: [...outputs] } : t
      ));
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      const success = Math.random() > 0.2;
      const duration = Date.now() - startTime;
      
      outputs.push('');
      outputs.push(success ? '✓ Task completed successfully' : '✗ Task failed');
      outputs.push(`Duration: ${(duration / 1000).toFixed(2)}s`);

      setTasks(prev => prev.map(t => 
        t.id === task.id 
          ? { ...t, status: success ? 'success' : 'failed', output: outputs, duration }
          : t
      ));
    }, 2000 + Math.random() * 2000);
  }, [onRunTask]);

  const stopTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'idle', output: [...(t.output || []), '', '⚠ Task stopped by user'] }
        : t
    ));
    onStopTask?.(taskId);
  }, [onStopTask]);

  const addTask = useCallback(() => {
    if (!newTask.name || !newTask.command) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      name: newTask.name,
      command: newTask.command,
      type: newTask.type,
      status: 'idle',
    };

    setTasks(prev => [...prev, task]);
    setNewTask({ name: '', command: '', type: 'shell' });
    setShowAddModal(false);
  }, [newTask]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  }, [selectedTask]);

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'running': return '⏳';
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '○';
    }
  };

  const getTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'npm': return '📦';
      case 'shell': return '💻';
      default: return '⚡';
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'running') return t.status === 'running';
    if (filter === 'npm') return t.type === 'npm';
    if (filter === 'shell') return t.type === 'shell';
    return true;
  });

  const runningCount = tasks.filter(t => t.status === 'running').length;

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>⚡</span>
          <span>Task Runner</span>
          {runningCount > 0 && (
            <span className={styles.runningBadge}>{runningCount} running</span>
          )}
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          + Add Task
        </button>
      </div>

      <div className={styles.filters}>
        {(['all', 'npm', 'shell', 'running'] as const).map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' && 'All'}
            {f === 'npm' && '📦 NPM'}
            {f === 'shell' && '💻 Shell'}
            {f === 'running' && `⏳ Running (${runningCount})`}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.taskList}>
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`${styles.taskItem} ${styles[task.status]} ${selectedTask?.id === task.id ? styles.selected : ''}`}
              onClick={() => setSelectedTask(task)}
            >
              <span className={styles.statusIcon}>{getStatusIcon(task.status)}</span>
              <div className={styles.taskInfo}>
                <span className={styles.taskName}>{task.name}</span>
                <span className={styles.taskCommand}>{task.command}</span>
              </div>
              <span className={styles.typeIcon}>{getTypeIcon(task.type)}</span>
              <div className={styles.taskActions}>
                {task.status === 'running' ? (
                  <button
                    className={styles.stopBtn}
                    onClick={e => { e.stopPropagation(); stopTask(task.id); }}
                  >
                    ⏹
                  </button>
                ) : (
                  <button
                    className={styles.runBtn}
                    onClick={e => { e.stopPropagation(); runTask(task); }}
                  >
                    ▶
                  </button>
                )}
                {!task.isDefault && (
                  <button
                    className={styles.deleteBtn}
                    onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedTask && (
          <div className={styles.outputPanel}>
            <div className={styles.outputHeader}>
              <span className={styles.outputTitle}>
                {getStatusIcon(selectedTask.status)} {selectedTask.name}
              </span>
              {selectedTask.duration && (
                <span className={styles.duration}>
                  {(selectedTask.duration / 1000).toFixed(2)}s
                </span>
              )}
            </div>
            <div className={styles.outputContent} ref={outputRef}>
              {selectedTask.output?.map((line, i) => (
                <div key={i} className={styles.outputLine}>
                  {line}
                </div>
              )) || <div className={styles.noOutput}>No output yet</div>}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Add New Task</span>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Task Name</label>
                <input
                  type="text"
                  placeholder="e.g., deploy"
                  value={newTask.name}
                  onChange={e => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Command</label>
                <input
                  type="text"
                  placeholder="e.g., npm run deploy"
                  value={newTask.command}
                  onChange={e => setNewTask(prev => ({ ...prev, command: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Type</label>
                <select
                  value={newTask.type}
                  onChange={e => setNewTask(prev => ({ ...prev, type: e.target.value as Task['type'] }))}
                >
                  <option value="npm">NPM Script</option>
                  <option value="shell">Shell Command</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className={styles.createBtn} onClick={addTask}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getRandomOutput(type: Task['type']): string {
  const outputs = {
    npm: [
      '> vite build',
      'vite v5.0.0 building for production...',
      '✓ 245 modules transformed.',
      'dist/index.html       0.45 kB',
      'dist/assets/index.js  142.30 kB',
      'Compiling TypeScript...',
      'Type checking complete.',
    ],
    shell: [
      'Executing command...',
      'Processing files...',
      'Copying assets...',
      'Generating output...',
      'Cleaning up...',
    ],
    custom: [
      'Running custom task...',
      'Step 1 complete',
      'Step 2 complete',
      'Finalizing...',
    ],
  };
  const list = outputs[type] || outputs.custom;
  return list[Math.floor(Math.random() * list.length)];
}

export const TaskRunner = memo(TaskRunnerComponent);
export default TaskRunner;
