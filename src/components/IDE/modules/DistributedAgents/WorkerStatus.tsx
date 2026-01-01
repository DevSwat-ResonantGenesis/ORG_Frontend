/**
 * Worker Status Component
 * 
 * Displays detailed status information for each worker in the cluster
 */

import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Cpu,
    TrendingUp
} from 'lucide-react';
import React from 'react';

interface WorkerInfo {
    worker_id: string;
    type: string;
    status: 'idle' | 'busy' | 'error';
    tasks_completed: number;
    tasks_failed: number;
    avg_duration: number;
    current_task?: string;
}

interface WorkerStatusProps {
    workers: Record<string, WorkerInfo>;
}

const WorkerStatus: React.FC<WorkerStatusProps> = ({ workers }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'idle':
                return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'busy':
                return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'error':
                return 'text-red-400 bg-red-400/10 border-red-400/30';
            default:
                return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'idle':
                return <CheckCircle className="w-5 h-5" />;
            case 'busy':
                return <Activity className="w-5 h-5 animate-pulse" />;
            case 'error':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Clock className="w-5 h-5" />;
        }
    };

    const getWorkerTypeIcon = (type: string) => {
        // Return appropriate icon based on worker type
        return <Cpu className="w-5 h-5" />;
    };

    const getWorkerTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'build': 'text-blue-400',
            'test': 'text-green-400',
            'refactor': 'text-purple-400',
            'docs': 'text-yellow-400',
            'security': 'text-red-400',
            'codegen': 'text-cyan-400',
        };
        return colors[type] || 'text-gray-400';
    };

    const workerArray = Object.entries(workers);

    if (workerArray.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                    <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No workers available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Worker Details</h3>
                <div className="text-sm text-gray-400">
                    {workerArray.length} worker{workerArray.length !== 1 ? 's' : ''} total
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {workerArray.map(([id, worker]) => {
                    const successRate = worker.tasks_completed + worker.tasks_failed > 0
                        ? ((worker.tasks_completed / (worker.tasks_completed + worker.tasks_failed)) * 100).toFixed(1)
                        : '0.0';

                    return (
                        <div
                            key={id}
                            className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`${getWorkerTypeColor(worker.type)}`}>
                                        {getWorkerTypeIcon(worker.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold capitalize">{worker.type} Worker</h4>
                                        <p className="text-xs text-gray-500">{id}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(worker.status)}`}>
                                    {getStatusIcon(worker.status)}
                                    <span className="text-sm font-medium capitalize">{worker.status}</span>
                                </div>
                            </div>

                            {/* Current Task */}
                            {worker.current_task && (
                                <div className="mb-4 p-3 bg-gray-700/50 rounded border border-gray-600">
                                    <div className="text-xs text-gray-400 mb-1">Current Task</div>
                                    <div className="text-sm font-mono truncate">{worker.current_task}</div>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Tasks Completed */}
                                <div className="bg-gray-700/30 rounded p-3">
                                    <div className="flex items-center gap-2 text-green-400 mb-1">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-xs">Completed</span>
                                    </div>
                                    <div className="text-xl font-bold">{worker.tasks_completed}</div>
                                </div>

                                {/* Tasks Failed */}
                                <div className="bg-gray-700/30 rounded p-3">
                                    <div className="flex items-center gap-2 text-red-400 mb-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs">Failed</span>
                                    </div>
                                    <div className="text-xl font-bold">{worker.tasks_failed}</div>
                                </div>

                                {/* Success Rate */}
                                <div className="bg-gray-700/30 rounded p-3">
                                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-xs">Success Rate</span>
                                    </div>
                                    <div className="text-xl font-bold">{successRate}%</div>
                                </div>

                                {/* Avg Duration */}
                                <div className="bg-gray-700/30 rounded p-3">
                                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs">Avg Duration</span>
                                    </div>
                                    <div className="text-xl font-bold">
                                        {worker.avg_duration ? `${worker.avg_duration.toFixed(1)}s` : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Performance Bar */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                    <span>Performance</span>
                                    <span>{successRate}%</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                                        style={{ width: `${successRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorkerStatus;
