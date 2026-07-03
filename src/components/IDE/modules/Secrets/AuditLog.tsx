/**
 * Audit Log Component
 * 
 * Displays audit trail of secret operations
 */

import {
    CheckCircle,
    Clock,
    Edit,
    Eye,
    History,
    List,
    Plus,
    RefreshCw,
    RotateCw,
    Trash2,
    User,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface AuditEntry {
    timestamp: string;
    action: string;
    key: string;
    environment: string;
    provider: string;
    user_id: string;
    success: boolean;
}

interface AuditLogProps {
    environment: string;
    provider: string;
}

const AuditLog: React.FC<AuditLogProps> = ({ environment, provider }) => {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchLogs();
    }, [environment, provider]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/secrets/secrets/audit/log?limit=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'store':
                return <Plus className="w-4 h-4 text-green-400" />;
            case 'retrieve':
                return <Eye className="w-4 h-4 text-blue-400" />;
            case 'reveal':
                return <Eye className="w-4 h-4 text-yellow-400" />;
            case 'update':
                return <Edit className="w-4 h-4 text-blue-400" />;
            case 'delete':
                return <Trash2 className="w-4 h-4 text-red-400" />;
            case 'rotate':
                return <RotateCw className="w-4 h-4 text-purple-400" />;
            case 'list':
                return <List className="w-4 h-4 text-gray-400" />;
            default:
                return <History className="w-4 h-4 text-gray-400" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'store':
                return 'text-green-400 bg-green-400/10';
            case 'retrieve':
                return 'text-blue-400 bg-blue-400/10';
            case 'reveal':
                return 'text-yellow-400 bg-yellow-400/10';
            case 'update':
                return 'text-blue-400 bg-blue-400/10';
            case 'delete':
                return 'text-red-400 bg-red-400/10';
            case 'rotate':
                return 'text-purple-400 bg-purple-400/10';
            default:
                return 'text-gray-400 bg-gray-400/10';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.action === filter;
    });

    const actions = ['all', ...new Set(logs.map(log => log.action))];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-400">Loading audit logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-gray-400">Filter by action:</span>
                <div className="flex gap-2">
                    {actions.map(action => (
                        <button
                            key={action}
                            onClick={() => setFilter(action)}
                            className={`px-3 py-1 rounded capitalize text-sm transition-colors ${filter === action
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {action}
                        </button>
                    ))}
                </div>
                <div className="flex-1" />
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Log Entries */}
            {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No audit logs found</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredLogs.map((log, index) => (
                        <div
                            key={index}
                            className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`p-2 rounded ${getActionColor(log.action)}`}>
                                    {getActionIcon(log.action)}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-1 rounded text-sm font-medium capitalize ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                        <span className="font-mono text-sm">{log.key}</span>
                                        {log.success ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTimestamp(log.timestamp)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            <span>{log.user_id?.slice(0, 8) || 'Unknown'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Env:</span> {log.environment}
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Provider:</span>{' '}
                                            <span className="capitalize">{log.provider}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Entries:</span>
                    <span className="font-semibold">{filteredLogs.length}</span>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
