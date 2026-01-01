/**
 * useLLMProviders hook - Fetches available LLM providers and models
 */

import { useState, useEffect, useCallback } from 'react';
import * as llmAPI from '../api/llm';
import type { LLMProvider, LLMModel } from '../api/llm';

interface UseLLMProvidersReturn {
  providers: LLMProvider[];
  models: LLMModel[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getModelsForProvider: (providerId: string) => LLMModel[];
  selectedProvider: string | null;
  setSelectedProvider: (providerId: string | null) => void;
  selectedModel: string | null;
  setSelectedModel: (modelId: string | null) => void;
}

export function useLLMProviders(): UseLLMProvidersReturn {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [providerList, modelList] = await Promise.all([
        llmAPI.listProviders(),
        llmAPI.listModels(),
      ]);
      setProviders(providerList);
      setModels(modelList);
      
      // Auto-select first available provider if none selected
      if (!selectedProvider && providerList.length > 0) {
        const available = providerList.find(p => p.status === 'available');
        if (available) {
          setSelectedProvider(available.id);
        }
      }
    } catch (err: any) {
      // Don't show error if service is unavailable
      if (err?.response?.status === 404 || err?.response?.status === 503) {
        setProviders([]);
        setModels([]);
      } else {
        setError(err.message || 'Failed to load LLM providers');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProvider]);

  const getModelsForProvider = useCallback((providerId: string): LLMModel[] => {
    return models.filter(m => m.provider === providerId);
  }, [models]);

  // Initial load
  useEffect(() => {
    refresh();
  }, []);

  // Auto-select model when provider changes
  useEffect(() => {
    if (selectedProvider) {
      const providerModels = getModelsForProvider(selectedProvider);
      if (providerModels.length > 0 && !selectedModel) {
        setSelectedModel(providerModels[0].id);
      } else if (selectedModel) {
        // Check if current model belongs to selected provider
        const currentModelBelongs = providerModels.some(m => m.id === selectedModel);
        if (!currentModelBelongs && providerModels.length > 0) {
          setSelectedModel(providerModels[0].id);
        }
      }
    }
  }, [selectedProvider, getModelsForProvider, selectedModel]);

  return {
    providers,
    models,
    loading,
    error,
    refresh,
    getModelsForProvider,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
  };
}

export default useLLMProviders;
