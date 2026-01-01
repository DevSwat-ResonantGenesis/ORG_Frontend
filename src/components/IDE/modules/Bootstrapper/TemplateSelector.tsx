/**
 * Template Selector Component
 * 
 * Displays available templates with filtering and search
 */

import {
    Code,
    Filter,
    Layers,
    Loader2,
    Search,
    Server
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    features: string[];
}

interface TemplateSelectorProps {
    selectedTemplate: Template | null;
    onSelectTemplate: (template: Template) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    selectedTemplate,
    onSelectTemplate,
}) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/code/code/bootstrap/templates`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates || []);
                setCategories(['all', ...data.categories]);
            }
        } catch (err) {
            console.error('Failed to fetch templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'frontend':
                return <Code className="w-5 h-5" />;
            case 'backend':
                return <Server className="w-5 h-5" />;
            case 'fullstack':
                return <Layers className="w-5 h-5" />;
            default:
                return <Code className="w-5 h-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'frontend':
                return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
            case 'backend':
                return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'fullstack':
                return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
            default:
                return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = searchQuery === '' ||
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg capitalize transition-colors ${selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No templates found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map(template => (
                        <button
                            key={template.id}
                            onClick={() => onSelectTemplate(template)}
                            className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-105 ${selectedTemplate?.id === template.id
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded ${getCategoryColor(template.category)}`}>
                                    {getCategoryIcon(template.category)}
                                </div>
                                {selectedTemplate?.id === template.id && (
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                {template.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                                {template.tags.slice(0, 3).map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {template.tags.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                                        +{template.tags.length - 3}
                                    </span>
                                )}
                            </div>

                            {/* Features count */}
                            <div className="mt-3 text-xs text-gray-500">
                                {template.features.length} features included
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TemplateSelector;
