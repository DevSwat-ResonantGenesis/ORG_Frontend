/**
 * Project Wizard Component
 * 
 * Step-by-step wizard for creating new projects from templates
 */

import {
    ArrowLeft,
    ArrowRight,
    Check,
    Loader2,
    Wand2
} from 'lucide-react';
import React, { useState } from 'react';
import FeatureSelector from './FeatureSelector';
import PreviewPanel from './PreviewPanel';
import TemplateSelector from './TemplateSelector';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    features: string[];
}

interface ProjectWizardProps {
    onComplete?: (projectId: string) => void;
    onCancel?: () => void;
}

const ProjectWizard: React.FC<ProjectWizardProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [projectName, setProjectName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<Record<string, any>>({});
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = 4;

    const steps = [
        { number: 1, title: 'Project Name', description: 'Choose a name for your project' },
        { number: 2, title: 'Template', description: 'Select a project template' },
        { number: 3, title: 'Features', description: 'Configure project features' },
        { number: 4, title: 'Review', description: 'Review and generate' },
    ];

    const canProceed = () => {
        switch (step) {
            case 1:
                return projectName.trim().length > 0;
            case 2:
                return selectedTemplate !== null;
            case 3:
                return true; // Features are optional
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (canProceed() && step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleGenerate = async () => {
        if (!selectedTemplate) return;

        setGenerating(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/code/code/bootstrap/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    template_id: selectedTemplate.id,
                    project_name: projectName,
                    options: {
                        PROJECT_NAME: projectName,
                        ...selectedFeatures,
                    },
                    use_preferences: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate project');
            }

            const result = await response.json();

            if (onComplete) {
                onComplete(result.project_id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <Wand2 className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl font-semibold">Create New Project</h2>
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                    {steps.map((s, idx) => (
                        <React.Fragment key={s.number}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step > s.number
                                            ? 'bg-green-600 border-green-600'
                                            : step === s.number
                                                ? 'bg-blue-600 border-blue-600'
                                                : 'bg-gray-700 border-gray-600'
                                        }`}
                                >
                                    {step > s.number ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span>{s.number}</span>
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <div className={`text-sm font-medium ${step >= s.number ? 'text-white' : 'text-gray-500'}`}>
                                        {s.title}
                                    </div>
                                    <div className="text-xs text-gray-500 hidden md:block">
                                        {s.description}
                                    </div>
                                </div>
                            </div>
                            {idx < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-4 transition-colors ${step > s.number ? 'bg-green-600' : 'bg-gray-700'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Step 1: Project Name */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">What's your project name?</h3>
                                <p className="text-gray-400">
                                    Choose a descriptive name for your project. You can change this later.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="my-awesome-project"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
                                    autoFocus
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Use lowercase letters, numbers, and hyphens
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Template Selection */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Choose a template</h3>
                                <p className="text-gray-400">
                                    Select a template that best fits your project needs
                                </p>
                            </div>

                            <TemplateSelector
                                selectedTemplate={selectedTemplate}
                                onSelectTemplate={setSelectedTemplate}
                            />
                        </div>
                    )}

                    {/* Step 3: Feature Selection */}
                    {step === 3 && selectedTemplate && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Configure features</h3>
                                <p className="text-gray-400">
                                    Customize your project with additional features
                                </p>
                            </div>

                            <FeatureSelector
                                template={selectedTemplate}
                                selectedFeatures={selectedFeatures}
                                onFeaturesChange={setSelectedFeatures}
                            />
                        </div>
                    )}

                    {/* Step 4: Review & Generate */}
                    {step === 4 && selectedTemplate && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Review your project</h3>
                                <p className="text-gray-400">
                                    Review the configuration before generating your project
                                </p>
                            </div>

                            <PreviewPanel
                                projectName={projectName}
                                template={selectedTemplate}
                                features={selectedFeatures}
                            />

                            {error && (
                                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700">
                <button
                    onClick={handleBack}
                    disabled={step === 1}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {step < totalSteps ? (
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={generating || !canProceed()}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4" />
                                Generate Project
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectWizard;
