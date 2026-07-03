/**
 * Secret Manager Component
 * 
 * Main interface for managing secrets across multiple providers
 */

import {
    History,
    Key,
    Plus,
    RefreshCw,
    Shield
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AuditLog from './AuditLog';
import SecretEditor from './SecretEditor';
import SecretList from './SecretList';

interface Secret {
    key: string;
    value: string;
    masked: boolean;
    created_at: string;
    updated_at: string;
    version: number;
    metadata: Record<string, any>;
}

interface SecretManagerProps {
    onClose?: () => void;
}

const SecretManager: React.FC<SecretManagerProps> = ({ onClose }) => {
    const [secrets, setSecrets] = useState<Secret[]>([]);
    const [loading, setLoading] = useState(true);
    const [environment, setEnvironment] = useState('development');
    const [provider, setProvider] = useState('local');
    const [providers, setProviders] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'secrets' | 'audit'>('secrets');
    const [showEditor, setShowEditor] = useState(false);
    const [editingSecret, setEditingSecret] = useState<Secret | null>(null);

    const environments = ['development', 'staging', 'production'];

    useEffect(() => {
        fetchProviders();
    }, []);

    useEffect(() => {
        if (provider) {
            fetchSecrets();
        }
    }, [environment, provider]);

    const fetchProviders = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/secrets/secrets/providers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProviders(data.providers || ['local']);
            }
        } catch (err) {
            console.error('Failed to fetch providers:', err);
            setProviders(['local']);
        }
    };

    const fetchSecrets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/secrets/secrets/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    environment,
                    provider,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSecrets(data.secrets || []);
            }
        } catch (err) {
            console.error('Failed to fetch secrets:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSecret = () => {
        setEditingSecret(null);
        setShowEditor(true);
    };

    const handleEditSecret = (secret: Secret) => {
        setEditingSecret(secret);
        setShowEditor(true);
    };

    const handleDeleteSecret = async (key: string) => {
        if (!confirm(`Are you sure you want to delete secret "${key}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(
                `${apiUrl}/api/secrets/secrets/${key}?environment=${environment}&provider=${provider}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                fetchSecrets();
            }
        } catch (err) {
            console.error('Failed to delete secret:', err);
        }
    };

    const handleRotateSecret = async (key: string) => {
        if (!confirm(`Are you sure you want to rotate secret "${key}"? This will generate a new random value.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/secrets/secrets/rotate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    key,
                    environment,
                    provider,
                }),
            });

            if (response.ok) {
                fetchSecrets();
            }
        } catch (err) {
            console.error('Failed to rotate secret:', err);
        }
    };

    const handleSaveSecret = async (key: string, value: string, metadata?: Record<string, any>) => {
        try {
            const token = localStorage.getItem('access_token');
            const endpoint = editingSecret ? '/secrets/update' : '/secrets/store';
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

            const response = await fetch(`${apiUrl}/api/secrets${endpoint}`, {
                method: editingSecret ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    key,
                    value,
                    environment,
                    provider,
                    metadata,
                }),
            });

            if (response.ok) {
                setShowEditor(false);
                fetchSecrets();
            }
        } catch (err) {
            console.error('Failed to save secret:', err);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-400" />
                    <h2 className="text-xl font-semibold">Secret Manager</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAddSecret}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Secret
                    </button>
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

            {/* Environment & Provider Selection */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-700 bg-gray-800">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Environment:</label>
                    <select
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value)}
                        className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                    >
                        {environments.map(env => (
                            <option key={env} value={env}>{env}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Provider:</label>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500 capitalize"
                    >
                        {providers.map(prov => (
                            <option key={prov} value={prov} className="capitalize">{prov}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1" />

                <button
                    onClick={fetchSecrets}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('secrets')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'secrets'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    <Key className="w-4 h-4" />
                    Secrets
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'audit'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    <History className="w-4 h-4" />
                    Audit Log
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'secrets' && (
                    <SecretList
                        secrets={secrets}
                        loading={loading}
                        onEdit={handleEditSecret}
                        onDelete={handleDeleteSecret}
                        onRotate={handleRotateSecret}
                    />
                )}

                {activeTab === 'audit' && (
                    <AuditLog environment={environment} provider={provider} />
                )}
            </div>

            {/* Secret Editor Modal */}
            {showEditor && (
                <SecretEditor
                    secret={editingSecret}
                    onSave={handleSaveSecret}
                    onCancel={() => setShowEditor(false)}
                />
            )}
        </div>
    );
};

export default SecretManager;
