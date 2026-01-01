/**
 * Task Monitor Component
 * 
 * Monitors and displays active, completed, and failed tasks
 */

import {
    CheckCircle,
    Clock,
    Eye,
    Play,
    RefreshCw,
    Trash2,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Task {
    task_id: string;
    type: string;
    status: 'active' | 'completed' | 'failed';
    worker_id?: string;
    duration?: number;
    result?: any;
    error?: string;
    created_at: string;
    completed_at?: string;
}

const TaskMonitor: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('access_token');

            // In a real implementation, we'd have an endpoint that returns all tasks
            // For now, we'll simulate with empty data
            // const response = await fetch('http://localhost:8001/distributed-agents/tasks', {
            //   headers: { 'Authorization': `Bearer ${token}` },
            // });
            // const data = await response.json();
            // setTasks(data.tasks || []);

            setTasks([]);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            setLoading(false);
        }
    };

    // Cancel task
    const cancelTask = async (taskId: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            await fetch(`${apiUrl}/api/agents/distributed-agents/task/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchTasks();
        } catch (err) {
            console.error('Failed to cancel task:', err);
        }
    };

    // Auto-refresh
    useEffect(() => {
        fetchTasks();

        if (autoRefresh) {
            const interval = setInterval(fetchTasks, 2000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'completed':
                return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'failed':
                return 'text-red-400 bg-red-400/10 border-red-400/30';
            default:
                return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Play className="w-4 h-4 animate-pulse" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'failed':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A';
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs.toFixed(0)}s`;
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-400">Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Task Monitor</h3>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded"
                        />
                        Auto-refresh
                    </label>
                    <button
                        onClick={fetchTasks}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {[
                    { id: 'all', label: 'All', count: tasks.length },
                    { id: 'active', label: 'Active', count: tasks.filter(t => t.status === 'active').length },
                    { id: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
                    { id: 'failed', label: 'Failed', count: tasks.filter(t => t.status === 'failed').length },
                ].map(({ id, label, count }) => (
                    <button
                        key={id}
                        onClick={() => setFilter(id as any)}
                        className={`px-4 py-2 rounded transition-colors ${filter === id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {label} <span className="ml-1 text-xs opacity-75">({count})</span>
                    </button>
                ))}
            </div>

            {/* Task List */}
            {filteredTasks.length === 0 ? (
                <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-center text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No {filter !== 'all' ? filter : ''} tasks found</p>
                        <p className="text-sm mt-2">Tasks will appear here when executed</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.task_id}
                            className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                {/* Task Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${getStatusColor(task.status)}`}>
                                            {getStatusIcon(task.status)}
                                            <span className="capitalize">{task.status}</span>
                                        </div>
                                        <span className="text-sm font-semibold capitalize">{task.type}</span>
                                        {task.worker_id && (
                                            <span className="text-xs text-gray-500">
                                                Worker: {task.worker_id}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs text-gray-400 space-y-1">
                                        <div>Task ID: <span className="font-mono">{task.task_id}</span></div>
                                        <div>Created: {formatTimestamp(task.created_at)}</div>
                                        {task.completed_at && (
                                            <div>Completed: {formatTimestamp(task.completed_at)}</div>
                                        )}
                                        {task.duration && (
                                            <div>Duration: {formatDuration(task.duration)}</div>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {task.error && (
                                        <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">
                                            {task.error}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedTask(task)}
                                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    {task.status === 'active' && (
                                        <button
                                            onClick={() => cancelTask(task.task_id)}
                                            className="p-2 hover:bg-red-700 rounded transition-colors text-red-400"
                                            title="Cancel Task"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Details Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Task Details</h3>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Task ID</div>
                                <div className="font-mono text-sm">{selectedTask.task_id}</div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-400 mb-1">Type</div>
                                <div className="capitalize">{selectedTask.type}</div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-400 mb-1">Status</div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(selectedTask.status)}`}>
                                    {getStatusIcon(selectedTask.status)}
                                    <span className="capitalize">{selectedTask.status}</span>
                                </div>
                            </div>

                            {selectedTask.result && (
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Result</div>
                                    <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto max-h-64">
                                        {JSON.stringify(selectedTask.result, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedTask.error && (
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Error</div>
                                    <div className="bg-red-900/20 border border-red-500/30 rounded p-3 text-sm text-red-400">
                                        {selectedTask.error}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskMonitor;
