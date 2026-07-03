/**
 * Feature Selector Component
 * 
 * Allows users to configure project features
 */

import { Check, Info } from 'lucide-react';
import React from 'react';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    features: string[];
}

interface FeatureSelectorProps {
    template: Template;
    selectedFeatures: Record<string, any>;
    onFeaturesChange: (features: Record<string, any>) => void;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({
    template,
    selectedFeatures,
    onFeaturesChange,
}) => {
    const toggleFeature = (key: string, value: any) => {
        onFeaturesChange({
            ...selectedFeatures,
            [key]: value,
        });
    };

    const commonFeatures = [
        {
            id: 'docker',
            name: 'Docker Support',
            description: 'Include Dockerfile and docker-compose.yml',
            default: false,
        },
        {
            id: 'ci_cd',
            name: 'CI/CD Pipeline',
            description: 'GitHub Actions workflow for automated testing and deployment',
            default: false,
        },
        {
            id: 'testing',
            name: 'Testing Setup',
            description: 'Pre-configured testing framework with example tests',
            default: true,
        },
        {
            id: 'linting',
            name: 'Code Linting',
            description: 'ESLint/Ruff configuration for code quality',
            default: true,
        },
    ];

    // Category-specific features
    const categoryFeatures: Record<string, any[]> = {
        frontend: [
            {
                id: 'auth',
                name: 'Authentication',
                description: 'JWT-based authentication with login/signup pages',
                default: false,
            },
            {
                id: 'api_client',
                name: 'API Client',
                description: 'Configured HTTP client for backend communication',
                default: true,
            },
            {
                id: 'state_management',
                name: 'State Management',
                description: 'Global state management (Context API or Zustand)',
                default: false,
            },
        ],
        backend: [
            {
                id: 'database',
                name: 'Database',
                description: 'PostgreSQL with SQLAlchemy ORM',
                default: true,
            },
            {
                id: 'auth',
                name: 'Authentication',
                description: 'JWT-based authentication endpoints',
                default: true,
            },
            {
                id: 'migrations',
                name: 'Database Migrations',
                description: 'Alembic for database schema migrations',
                default: true,
            },
        ],
        fullstack: [
            {
                id: 'auth',
                name: 'Full Authentication',
                description: 'Complete auth flow (frontend + backend)',
                default: true,
            },
            {
                id: 'database',
                name: 'Database',
                description: 'PostgreSQL with full integration',
                default: true,
            },
            {
                id: 'deployment',
                name: 'Deployment Config',
                description: 'Docker Compose and deployment scripts',
                default: true,
            },
        ],
    };

    const specificFeatures = categoryFeatures[template.category] || [];

    return (
        <div className="space-y-6">
            {/* Common Features */}
            <div>
                <h4 className="text-lg font-semibold mb-4">Common Features</h4>
                <div className="space-y-3">
                    {commonFeatures.map(feature => {
                        const isSelected = selectedFeatures[feature.id] ?? feature.default;

                        return (
                            <button
                                key={feature.id}
                                onClick={() => toggleFeature(feature.id, !isSelected)}
                                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'border-gray-600'
                                            }`}
                                    >
                                        {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">{feature.name}</span>
                                            {feature.default && (
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                                                    Recommended
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400">{feature.description}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Category-Specific Features */}
            {specificFeatures.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold mb-4 capitalize">
                        {template.category} Features
                    </h4>
                    <div className="space-y-3">
                        {specificFeatures.map(feature => {
                            const isSelected = selectedFeatures[feature.id] ?? feature.default;

                            return (
                                <button
                                    key={feature.id}
                                    onClick={() => toggleFeature(feature.id, !isSelected)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'border-gray-600'
                                                }`}
                                        >
                                            {isSelected && <Check className="w-4 h-4 text-white" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold">{feature.name}</span>
                                                {feature.default && (
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                                                        Recommended
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400">{feature.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                        <p className="font-semibold mb-1">Smart Configuration</p>
                        <p className="text-blue-400">
                            We'll use your preferences from Hash Sphere to customize the generated code.
                            This includes your coding style, preferred libraries, and naming conventions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureSelector;
