/**
 * Secret List Component
 * 
 * Displays list of secrets with actions
 */

import {
    Check,
    Clock,
    Copy,
    Edit,
    Eye,
    EyeOff,
    RefreshCw,
    Tag,
    Trash2
} from 'lucide-react';
import React, { useState } from 'react';

interface Secret {
    key: string;
    value: string;
    masked: boolean;
    created_at: string;
    updated_at: string;
    version: number;
    metadata: Record<string, any>;
}

interface SecretListProps {
    secrets: Secret[];
    loading: boolean;
    onEdit: (secret: Secret) => void;
    onDelete: (key: string) => void;
    onRotate: (key: string) => void;
}

const SecretList: React.FC<SecretListProps> = ({
    secrets,
    loading,
    onEdit,
    onDelete,
    onRotate,
}) => {
    const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const toggleReveal = async (key: string) => {
        if (revealedSecrets.has(key)) {
            // Hide
            setRevealedSecrets(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        } else {
            // Reveal - fetch unmasked value
            try {
                const token = localStorage.getItem('access_token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const response = await fetch(
                    `${apiUrl}/api/secrets/secrets/${key}?reveal=true`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                if (response.ok) {
                    setRevealedSecrets(prev => new Set(prev).add(key));
                }
            } catch (err) {
                console.error('Failed to reveal secret:', err);
            }
        }
    };

    const copyToClipboard = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-400">Loading secrets...</p>
                </div>
            </div>
        );
    }

    if (secrets.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                    <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No secrets found</p>
                    <p className="text-sm">Click "Add Secret" to create your first secret</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="space-y-3">
                {secrets.map((secret) => {
                    const isRevealed = revealedSecrets.has(secret.key);
                    const isCopied = copiedKey === secret.key;

                    return (
                        <div
                            key={secret.key}
                            className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold font-mono">{secret.key}</h3>
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                                            v{secret.version}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>Updated {formatDate(secret.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleReveal(secret.key)}
                                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                                        title={isRevealed ? "Hide value" : "Reveal value"}
                                    >
                                        {isRevealed ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => copyToClipboard(secret.value, secret.key)}
                                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                                        title="Copy value"
                                    >
                                        {isCopied ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => onEdit(secret)}
                                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                                        title="Edit secret"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => onRotate(secret.key)}
                                        className="p-2 hover:bg-yellow-700 rounded transition-colors text-yellow-400"
                                        title="Rotate secret"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => onDelete(secret.key)}
                                        className="p-2 hover:bg-red-700 rounded transition-colors text-red-400"
                                        title="Delete secret"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Value */}
                            <div className="mb-3">
                                <div className="text-sm text-gray-400 mb-1">Value:</div>
                                <div className="p-3 bg-gray-900 rounded border border-gray-700 font-mono text-sm">
                                    {isRevealed ? secret.value : secret.value}
                                </div>
                            </div>

                            {/* Metadata */}
                            {secret.metadata && Object.keys(secret.metadata).length > 0 && (
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Metadata:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(secret.metadata).map(([key, value]) => (
                                            <span
                                                key={key}
                                                className="px-2 py-1 bg-gray-700 rounded text-xs"
                                            >
                                                <span className="text-gray-400">{key}:</span>{' '}
                                                <span className="text-white">{String(value)}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SecretList;
