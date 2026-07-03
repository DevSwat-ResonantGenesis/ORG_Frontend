/**
 * Cluster Dashboard Component
 * 
 * Displays the status of the distributed agent cluster including:
 * - Worker status and health
 * - Active tasks
 * - Performance metrics
 * - Resource usage
 */

import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Cpu,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import MergeViewer from './MergeViewer';
import TaskMonitor from './TaskMonitor';
import WorkerStatus from './WorkerStatus';

interface WorkerInfo {
    worker_id: string;
    type: string;
    status: 'idle' | 'busy' | 'error';
    tasks_completed: number;
    tasks_failed: number;
    avg_duration: number;
    current_task?: string;
}

interface ClusterStatus {
    workers: Record<string, WorkerInfo>;
    active_tasks: number;
    completed_tasks: number;
    failed_tasks: number;
    total_workers: number;
    idle_workers: number;
    busy_workers: number;
}

interface ClusterDashboardProps {
    onClose?: () => void;
}

const ClusterDashboard: React.FC<ClusterDashboardProps> = ({ onClose }) => {
    const [clusterStatus, setClusterStatus] = useState<ClusterStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'workers' | 'tasks' | 'merges'>('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch cluster status
    const fetchClusterStatus = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/agents/distributed-agents/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cluster status');
            }

            const data = await response.json();
            setClusterStatus(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh every 2 seconds
    useEffect(() => {
        fetchClusterStatus();

        if (autoRefresh) {
            const interval = setInterval(fetchClusterStatus, 2000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // Calculate metrics
    const getMetrics = () => {
        if (!clusterStatus) return null;

        const totalTasks = clusterStatus.completed_tasks + clusterStatus.failed_tasks;
        const successRate = totalTasks > 0
            ? ((clusterStatus.completed_tasks / totalTasks) * 100).toFixed(1)
            : '0.0';

        const utilizationRate = clusterStatus.total_workers > 0
            ? ((clusterStatus.busy_workers / clusterStatus.total_workers) * 100).toFixed(1)
            : '0.0';

        return {
            totalTasks,
            successRate,
            utilizationRate,
        };
    };

    const metrics = getMetrics();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading cluster status...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchClusterStatus}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl font-semibold">Distributed Agent Cluster</h2>
                </div>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded"
                        />
                        Auto-refresh
                    </label>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-3 py-1 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
                {[
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'workers', label: 'Workers', icon: Users },
                    { id: 'tasks', label: 'Tasks', icon: Clock },
                    { id: 'merges', label: 'Merges', icon: TrendingUp },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id as any)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === id
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'overview' && clusterStatus && (
                    <div className="space-y-6">
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Workers */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Total Workers</span>
                                    <Users className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="text-2xl font-bold">{clusterStatus.total_workers}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {clusterStatus.busy_workers} busy, {clusterStatus.idle_workers} idle
                                </div>
                            </div>

                            {/* Active Tasks */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Active Tasks</span>
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div className="text-2xl font-bold">{clusterStatus.active_tasks}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Currently running
                                </div>
                            </div>

                            {/* Success Rate */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Success Rate</span>
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                </div>
                                <div className="text-2xl font-bold">{metrics?.successRate}%</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {clusterStatus.completed_tasks} / {metrics?.totalTasks} tasks
                                </div>
                            </div>

                            {/* Utilization */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">Utilization</span>
                                    <Cpu className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="text-2xl font-bold">{metrics?.utilizationRate}%</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Worker capacity
                                </div>
                            </div>
                        </div>

                        {/* Worker Types */}
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Worker Types
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {Object.entries(clusterStatus.workers).map(([id, worker]) => (
                                    <div
                                        key={id}
                                        className="bg-gray-700 rounded p-3 text-center"
                                    >
                                        <div className="text-xs text-gray-400 mb-1">{worker.type}</div>
                                        <div className={`text-sm font-semibold ${worker.status === 'busy' ? 'text-yellow-400' :
                                                worker.status === 'idle' ? 'text-green-400' :
                                                    'text-red-400'
                                            }`}>
                                            {worker.status.toUpperCase()}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {worker.tasks_completed} tasks
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance Chart Placeholder */}
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                Performance Trends
                            </h3>
                            <div className="h-48 flex items-center justify-center text-gray-500">
                                <p>Performance charts coming soon...</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'workers' && clusterStatus && (
                    <WorkerStatus workers={clusterStatus.workers} />
                )}

                {activeTab === 'tasks' && (
                    <TaskMonitor />
                )}

                {activeTab === 'merges' && (
                    <MergeViewer />
                )}
            </div>
        </div>
    );
};

export default ClusterDashboard;
