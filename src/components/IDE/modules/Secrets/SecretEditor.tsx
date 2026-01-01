/**
 * Secret Editor Component
 * 
 * Modal for creating/editing secrets
 */

import { Eye, EyeOff, Key, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Secret {
    key: string;
    value: string;
    masked: boolean;
    created_at: string;
    updated_at: string;
    version: number;
    metadata: Record<string, any>;
}

interface SecretEditorProps {
    secret: Secret | null;
    onSave: (key: string, value: string, metadata?: Record<string, any>) => void;
    onCancel: () => void;
}

const SecretEditor: React.FC<SecretEditorProps> = ({
    secret,
    onSave,
    onCancel,
}) => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');
    const [rotationDays, setRotationDays] = useState('90');
    const [showValue, setShowValue] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (secret) {
            setKey(secret.key);
            setValue(''); // Don't pre-fill value for security
            setDescription(secret.metadata?.description || '');
            setRotationDays(secret.metadata?.rotation_days?.toString() || '90');
        }
    }, [secret]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!key.trim()) {
            newErrors.key = 'Key is required';
        } else if (!/^[A-Z0-9_]+$/.test(key)) {
            newErrors.key = 'Key must contain only uppercase letters, numbers, and underscores';
        }

        if (!value.trim()) {
            newErrors.value = 'Value is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) {
            return;
        }

        const metadata: Record<string, any> = {};

        if (description) {
            metadata.description = description;
        }

        if (rotationDays) {
            metadata.rotation_days = parseInt(rotationDays);
        }

        onSave(key, value, metadata);
    };

    const generateRandomValue = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setValue(result);
        setShowValue(true);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Key className="w-6 h-6 text-green-400" />
                        <h3 className="text-xl font-semibold">
                            {secret ? 'Edit Secret' : 'Add Secret'}
                        </h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Key */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Secret Key *
                        </label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value.toUpperCase())}
                            placeholder="DB_PASSWORD"
                            disabled={!!secret}
                            className={`w-full px-4 py-2 bg-gray-900 border rounded-lg focus:outline-none focus:border-blue-500 font-mono ${errors.key ? 'border-red-500' : 'border-gray-700'
                                } ${secret ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        {errors.key && (
                            <p className="mt-1 text-sm text-red-400">{errors.key}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Use uppercase letters, numbers, and underscores only
                        </p>
                    </div>

                    {/* Value */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Secret Value *
                        </label>
                        <div className="relative">
                            <input
                                type={showValue ? 'text' : 'password'}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Enter secret value"
                                className={`w-full px-4 py-2 pr-24 bg-gray-900 border rounded-lg focus:outline-none focus:border-blue-500 font-mono ${errors.value ? 'border-red-500' : 'border-gray-700'
                                    }`}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowValue(!showValue)}
                                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                    title={showValue ? 'Hide' : 'Show'}
                                >
                                    {showValue ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {errors.value && (
                            <p className="mt-1 text-sm text-red-400">{errors.value}</p>
                        )}
                        <button
                            type="button"
                            onClick={generateRandomValue}
                            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                            Generate random value
                        </button>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this secret used for?"
                            rows={3}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Rotation Days */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Rotation Period (Days)
                        </label>
                        <input
                            type="number"
                            value={rotationDays}
                            onChange={(e) => setRotationDays(e.target.value)}
                            placeholder="90"
                            min="1"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Recommended rotation period for this secret
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-300">
                            <strong>Security Note:</strong> Secrets are encrypted at rest and masked by default.
                            Use the reveal function only when necessary.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {secret ? 'Update Secret' : 'Create Secret'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecretEditor;
