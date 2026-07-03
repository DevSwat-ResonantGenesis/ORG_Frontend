/**
 * Preview Panel Component
 * 
 * Shows a preview of the project structure and configuration
 */

import {
    CheckCircle,
    FileText,
    Folder,
    Package,
    Settings
} from 'lucide-react';
import React from 'react';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    features: string[];
}

interface PreviewPanelProps {
    projectName: string;
    template: Template;
    features: Record<string, any>;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
    projectName,
    template,
    features,
}) => {
    const enabledFeatures = Object.entries(features)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);

    const estimatedFiles = 15 + enabledFeatures.length * 3;

    return (
        <div className="space-y-6">
            {/* Project Summary */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    Project Configuration
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-gray-400 mb-1">Project Name</div>
                        <div className="font-semibold">{projectName}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-400 mb-1">Template</div>
                        <div className="font-semibold">{template.name}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-400 mb-1">Category</div>
                        <div className="font-semibold capitalize">{template.category}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-400 mb-1">Estimated Files</div>
                        <div className="font-semibold">~{estimatedFiles} files</div>
                    </div>
                </div>
            </div>

            {/* Included Features */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Included Features
                </h4>

                <div className="space-y-2">
                    {/* Template Features */}
                    {template.features.map(feature => (
                        <div
                            key={feature}
                            className="flex items-center gap-2 text-sm"
                        >
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            <span>{feature}</span>
                        </div>
                    ))}

                    {/* Additional Features */}
                    {enabledFeatures.map(feature => (
                        <div
                            key={feature}
                            className="flex items-center gap-2 text-sm text-blue-400"
                        >
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Project Structure Preview */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-yellow-400" />
                    Project Structure
                </h4>

                <div className="space-y-1 font-mono text-sm">
                    <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-yellow-400" />
                        <span className="font-semibold">{projectName}/</span>
                    </div>

                    <div className="ml-6 space-y-1">
                        {template.category === 'frontend' && (
                            <>
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>app/</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>components/</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>lib/</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>public/</span>
                                </div>
                            </>
                        )}

                        {template.category === 'backend' && (
                            <>
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>app/</span>
                                </div>
                                <div className="flex items-center gap-2 ml-6">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>routers/</span>
                                </div>
                                <div className="flex items-center gap-2 ml-6">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>models/</span>
                                </div>
                                <div className="flex items-center gap-2 ml-6">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>services/</span>
                                </div>
                            </>
                        )}

                        {template.category === 'fullstack' && (
                            <>
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>frontend/</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>backend/</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-yellow-400" />
                                    <span>docker/</span>
                                </div>
                            </>
                        )}

                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>README.md</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>.gitignore</span>
                        </div>

                        {features.docker && (
                            <>
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span>Dockerfile</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span>docker-compose.yml</span>
                                </div>
                            </>
                        )}

                        {features.ci_cd && (
                            <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-yellow-400" />
                                <span>.github/</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-500">
                            <span>...</span>
                            <span>and more</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    What happens next?
                </h4>

                <ol className="space-y-2 text-sm">
                    <li className="flex gap-3">
                        <span className="font-semibold text-blue-400">1.</span>
                        <span>We'll generate your complete project structure</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-semibold text-blue-400">2.</span>
                        <span>All files will be customized with your project name</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-semibold text-blue-400">3.</span>
                        <span>Your coding preferences will be applied from Hash Sphere</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="font-semibold text-blue-400">4.</span>
                        <span>The project will open in the IDE ready to use</span>
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default PreviewPanel;
