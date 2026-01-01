/**
 * Merge Viewer Component
 * 
 * Displays merge statistics and conflict resolution history
 */

import {
    AlertTriangle,
    CheckCircle,
    Clock,
    GitMerge,
    RefreshCw,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface MergeStats {
    total_merges: number;
    successful_merges: number;
    conflicts_resolved: number;
    resolution_strategies: Record<string, number>;
    avg_merge_time: number;
    recent_merges: MergeHistory[];
}

interface MergeHistory {
    merge_id: string;
    timestamp: string;
    files_merged: number;
    conflicts: number;
    strategy_used: string;
    duration: number;
    workers_involved: string[];
}

const MergeViewer: React.FC = () => {
    const [stats, setStats] = useState<MergeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch merge stats
    const fetchMergeStats = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/agents/distributed-agents/merge-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch merge stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh
    useEffect(() => {
        fetchMergeStats();

        if (autoRefresh) {
            const interval = setInterval(fetchMergeStats, 3000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const getStrategyColor = (strategy: string) => {
        const colors: Record<string, string> = {
            'prefer_newer': 'text-blue-400',
            'prefer_longer': 'text-green-400',
            'prefer_worker_type': 'text-purple-400',
            'three_way_merge': 'text-yellow-400',
            'ai_resolve': 'text-cyan-400',
            'auto': 'text-pink-400',
        };
        return colors[strategy] || 'text-gray-400';
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
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
                    <p className="text-gray-400">Loading merge statistics...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-center text-gray-500">
                    <GitMerge className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No merge data available</p>
                </div>
            </div>
        );
    }

    const successRate = stats.total_merges > 0
        ? ((stats.successful_merges / stats.total_merges) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Merge Statistics</h3>
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
                        onClick={fetchMergeStats}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Merges */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Total Merges</span>
                        <GitMerge className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold">{stats.total_merges}</div>
                </div>

                {/* Successful Merges */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Successful</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold">{stats.successful_merges}</div>
                    <div className="text-xs text-gray-500 mt-1">{successRate}% success rate</div>
                </div>

                {/* Conflicts Resolved */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Conflicts Resolved</span>
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold">{stats.conflicts_resolved}</div>
                </div>

                {/* Avg Merge Time */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Avg Merge Time</span>
                        <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold">{formatDuration(stats.avg_merge_time)}</div>
                </div>
            </div>

            {/* Resolution Strategies */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Resolution Strategies
                </h4>
                <div className="space-y-3">
                    {Object.entries(stats.resolution_strategies).map(([strategy, count]) => {
                        const percentage = stats.total_merges > 0
                            ? ((count / stats.total_merges) * 100).toFixed(1)
                            : '0.0';

                        return (
                            <div key={strategy}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className={`capitalize ${getStrategyColor(strategy)}`}>
                                        {strategy.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-gray-400">
                                        {count} ({percentage}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getStrategyColor(strategy)} bg-current transition-all duration-300`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Merges */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold mb-4">Recent Merges</h4>
                {stats.recent_merges && stats.recent_merges.length > 0 ? (
                    <div className="space-y-3">
                        {stats.recent_merges.map((merge) => (
                            <div
                                key={merge.merge_id}
                                className="bg-gray-700/50 rounded p-3 border border-gray-600"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="text-sm font-mono text-gray-400 mb-1">
                                            {merge.merge_id}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatTimestamp(merge.timestamp)}
                                        </div>
                                    </div>
                                    <div className={`text-sm ${getStrategyColor(merge.strategy_used)}`}>
                                        {merge.strategy_used.replace(/_/g, ' ')}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-400">Files:</span>{' '}
                                        <span className="font-semibold">{merge.files_merged}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Conflicts:</span>{' '}
                                        <span className="font-semibold text-yellow-400">{merge.conflicts}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Duration:</span>{' '}
                                        <span className="font-semibold">{formatDuration(merge.duration)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Workers:</span>{' '}
                                        <span className="font-semibold">{merge.workers_involved.length}</span>
                                    </div>
                                </div>

                                {merge.workers_involved.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {merge.workers_involved.map((worker, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-gray-600 rounded text-xs"
                                            >
                                                {worker}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <p>No recent merges</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MergeViewer;
