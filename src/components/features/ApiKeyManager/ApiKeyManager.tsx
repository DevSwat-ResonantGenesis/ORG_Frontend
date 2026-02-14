/**
 * API Key Manager Component
 * Allows users to add, view, and manage their own API keys (BYOK)
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import {
  addUserApiKey,
  API_KEY_PROVIDERS,
  deleteUserApiKey,
  fetchUserApiKeys,
  type UserApiKey,
  validateApiKey,
} from '@/api/userApiKeys';
import styles from './ApiKeyManager.module.css';

interface ApiKeyManagerProps {
  onKeyAdded?: (key: UserApiKey) => void;
  onKeyDeleted?: (keyId: string) => void;
  requireAtLeastOne?: boolean;
  showTitle?: boolean;
  compact?: boolean;
}

type PurposeTag =
  | 'chat'
  | 'reasoning'
  | 'coding'
  | 'vision'
  | 'image'
  | 'video'
  | 'speech'
  | 'audio'
  | 'embeddings'
  | 'moderation'
  | 'search'
  | 'rerank';

type PriceTier = 'free' | 'low' | 'mid' | 'high' | 'enterprise';

type ProviderSupport = 'active' | 'catalog';

type CatalogModel = {
  id: string;
  label?: string;
  description?: string;
  deprecated?: boolean;
  tags?: PurposeTag[];
};

type ProviderCatalogEntry = {
  id: string;
  company: string;
  name: string;
  support: ProviderSupport;
  priceTier: PriceTier;
  purposes: PurposeTag[];
  advantages: string[];
  purchaseUrl: string;
  models: CatalogModel[];
};

const PROVIDER_CATALOG: ProviderCatalogEntry[] = [
  {
    id: 'openai',
    company: 'OpenAI',
    name: 'OpenAI',
    support: 'active',
    priceTier: 'high',
    purposes: ['chat', 'reasoning', 'coding', 'vision', 'image', 'audio', 'speech', 'embeddings', 'moderation', 'search'],
    advantages: ['High-quality reasoning', 'Strong vision + multimodal', 'Broad model lineup'],
    purchaseUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', description: 'Fast, intelligent, flexible GPT model', tags: ['chat', 'reasoning', 'coding', 'vision'] },
      { id: 'gpt-4o-mini', description: 'Fast, affordable small model for focused tasks', tags: ['chat', 'coding'] },
      { id: 'gpt-4.1', description: 'Smarter non-reasoning model', tags: ['chat', 'coding'] },
      { id: 'gpt-4.1-mini', description: 'Smaller, faster version of GPT-4.1', tags: ['chat', 'coding'] },
      { id: 'o1', description: 'Reasoning model (previous generation)', tags: ['reasoning'] },
      { id: 'o1-pro', description: 'More compute for better responses', tags: ['reasoning'] },
      { id: 'gpt-image-1', description: 'Image generation model', tags: ['image'] },
      { id: 'gpt-4o-realtime', description: 'Realtime text and audio inputs/outputs', tags: ['audio', 'speech'] },
      { id: 'text-embedding-3-small', description: 'Small embedding model', tags: ['embeddings'] },
      { id: 'omni-moderation', description: 'Moderation across text and images', tags: ['moderation'] },
    ],
  },
  {
    id: 'anthropic',
    company: 'Anthropic',
    name: 'Anthropic (Claude)',
    support: 'active',
    priceTier: 'high',
    purposes: ['chat', 'reasoning', 'coding', 'vision'],
    advantages: ['Strong writing + reasoning', 'Great long-context reliability', 'Good safety tooling'],
    purchaseUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-3-opus', description: 'Top reasoning + writing', tags: ['chat', 'reasoning', 'coding'] },
      { id: 'claude-3-sonnet', description: 'Balanced performance/cost', tags: ['chat', 'coding'] },
      { id: 'claude-3-haiku', description: 'Fast + cost efficient', tags: ['chat'] },
    ],
  },
  {
    id: 'google',
    company: 'Google',
    name: 'Google (Gemini)',
    support: 'active',
    priceTier: 'mid',
    purposes: ['chat', 'reasoning', 'coding', 'vision'],
    advantages: ['Strong multimodal', 'Good cost/perf options', 'Fast iteration'],
    purchaseUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { id: 'gemini-1.5-pro', description: 'High capability multimodal', tags: ['chat', 'vision'] },
      { id: 'gemini-1.5-flash', description: 'Low latency + cost', tags: ['chat', 'coding'] },
      { id: 'gemini-pro', description: 'General model', tags: ['chat'] },
    ],
  },
  {
    id: 'groq',
    company: 'Groq',
    name: 'Groq',
    support: 'active',
    priceTier: 'low',
    purposes: ['chat', 'coding', 'reasoning'],
    advantages: ['Very fast inference', 'Great for latency-sensitive apps', 'OpenAI-compatible API'],
    purchaseUrl: 'https://console.groq.com/keys',
    models: [
      { id: 'llama-3.3-70b', description: 'Fast general model', tags: ['chat', 'coding'] },
      { id: 'llama-3.1-70b', description: 'Strong instruction-following', tags: ['chat', 'coding'] },
      { id: 'mixtral-8x7b', description: 'Strong coding + chat', tags: ['coding', 'chat'] },
    ],
  },
  {
    id: 'mistral',
    company: 'Mistral',
    name: 'Mistral AI',
    support: 'catalog',
    priceTier: 'mid',
    purposes: ['chat', 'coding'],
    advantages: ['Great European provider', 'Strong open models', 'OpenAI-compatible API'],
    purchaseUrl: 'https://console.mistral.ai/api-keys',
    models: [
      { id: 'mistral-large-latest', description: 'Top Mistral model', tags: ['chat', 'coding'] },
      { id: 'mistral-medium-latest', description: 'Balanced cost/perf', tags: ['chat'] },
      { id: 'mistral-small-latest', description: 'Fast + cost efficient', tags: ['chat'] },
      { id: 'open-mixtral-8x22b', description: 'Open weights Mixtral', tags: ['chat', 'coding'] },
    ],
  },
  {
    id: 'cohere',
    company: 'Cohere',
    name: 'Cohere',
    support: 'catalog',
    priceTier: 'mid',
    purposes: ['chat', 'rerank', 'embeddings'],
    advantages: ['Strong enterprise focus', 'Excellent rerank models', 'Good multilingual'],
    purchaseUrl: 'https://dashboard.cohere.com/api-keys',
    models: [
      { id: 'command-r-plus', description: 'Top chat/coding', tags: ['chat', 'coding'] },
      { id: 'command-r', description: 'Balanced', tags: ['chat'] },
      { id: 'rerank', description: 'Reranking for search', tags: ['rerank', 'search'] },
    ],
  },
  {
    id: 'openrouter',
    company: 'OpenRouter',
    name: 'OpenRouter',
    support: 'catalog',
    priceTier: 'mid',
    purposes: ['chat', 'reasoning', 'coding', 'vision'],
    advantages: ['Access many models', 'Unified billing + routing', 'OpenAI-compatible API'],
    purchaseUrl: 'https://openrouter.ai/keys',
    models: [
      { id: 'auto', description: 'Auto-route to best model', tags: ['chat'] },
      { id: 'openai/gpt-4o', description: 'OpenAI via OpenRouter', tags: ['chat', 'vision'] },
      { id: 'anthropic/claude-3-opus', description: 'Claude via OpenRouter', tags: ['reasoning'] },
    ],
  },
  {
    id: 'together',
    company: 'Together',
    name: 'Together AI',
    support: 'catalog',
    priceTier: 'low',
    purposes: ['chat', 'coding'],
    advantages: ['Many open models hosted', 'Good value', 'OpenAI-compatible API'],
    purchaseUrl: 'https://api.together.xyz/settings/api-keys',
    models: [
      { id: 'meta-llama/Llama-3.1-405B-Instruct-Turbo', description: 'Large instruction model', tags: ['chat', 'reasoning'] },
      { id: 'mistralai/Mixtral-8x22B-Instruct-v0.1', description: 'Strong coding + chat', tags: ['coding', 'chat'] },
      { id: 'Qwen/Qwen2.5-72B-Instruct', description: 'Strong general model', tags: ['chat', 'coding'] },
    ],
  },
  {
    id: 'deepseek',
    company: 'DeepSeek',
    name: 'DeepSeek',
    support: 'catalog',
    priceTier: 'low',
    purposes: ['chat', 'coding', 'reasoning'],
    advantages: ['Very strong coding', 'Great cost/perf', 'OpenAI-compatible API'],
    purchaseUrl: 'https://platform.deepseek.com/api_keys',
    models: [
      { id: 'deepseek-chat', description: 'General chat model', tags: ['chat'] },
      { id: 'deepseek-coder', description: 'Coding model', tags: ['coding'] },
    ],
  },
  {
    id: 'perplexity',
    company: 'Perplexity',
    name: 'Perplexity AI',
    support: 'catalog',
    priceTier: 'mid',
    purposes: ['search', 'chat'],
    advantages: ['Search-grounded answers', 'Good online retrieval', 'OpenAI-compatible API'],
    purchaseUrl: 'https://www.perplexity.ai/settings/api',
    models: [
      { id: 'llama-3.1-sonar-large', description: 'Search-focused model', tags: ['search', 'chat'] },
      { id: 'llama-3.1-sonar-small', description: 'Faster + cheaper search', tags: ['search'] },
    ],
  },
  {
    id: 'fireworks',
    company: 'Fireworks',
    name: 'Fireworks AI',
    support: 'catalog',
    priceTier: 'low',
    purposes: ['chat', 'coding'],
    advantages: ['Fast inference', 'Good model hosting', 'OpenAI-compatible API'],
    purchaseUrl: 'https://fireworks.ai/api-keys',
    models: [
      { id: 'llama-v3p1-70b-instruct', description: 'Hosted Llama 3.1 70B', tags: ['chat', 'coding'] },
      { id: 'mixtral-8x7b-instruct', description: 'Hosted Mixtral', tags: ['chat', 'coding'] },
    ],
  },
  {
    id: 'huggingface',
    company: 'Hugging Face',
    name: 'Hugging Face',
    support: 'catalog',
    priceTier: 'free',
    purposes: ['chat', 'embeddings', 'image'],
    advantages: ['Huge ecosystem', 'Inference endpoints', 'Open models'],
    purchaseUrl: 'https://huggingface.co/settings/tokens',
    models: [
      { id: 'inference-endpoints', label: 'Inference Endpoints', description: 'Dedicated hosted inference', tags: ['chat'] },
      { id: 'hf-inference-api', label: 'Inference API', description: 'Serverless inference', tags: ['chat'] },
    ],
  },
  {
    id: 'replicate',
    company: 'Replicate',
    name: 'Replicate',
    support: 'catalog',
    priceTier: 'mid',
    purposes: ['image', 'video', 'audio'],
    advantages: ['Huge model marketplace', 'Great for image/video', 'Simple API'],
    purchaseUrl: 'https://replicate.com/account/api-tokens',
    models: [
      { id: 'image-models', description: 'Image models marketplace', tags: ['image'] },
      { id: 'video-models', description: 'Video models marketplace', tags: ['video'] },
    ],
  },
  {
    id: 'stability',
    company: 'Stability AI',
    name: 'Stability AI',
    support: 'catalog',
    priceTier: 'mid',
    purposes: ['image'],
    advantages: ['Strong image generation', 'Widely supported', 'Good tools'],
    purchaseUrl: 'https://platform.stability.ai/account/keys',
    models: [
      { id: 'stable-image-ultra', description: 'High quality image generation', tags: ['image'] },
      { id: 'stable-diffusion', description: 'Classic diffusion family', tags: ['image'] },
    ],
  },
  {
    id: 'elevenlabs',
    company: 'ElevenLabs',
    name: 'ElevenLabs',
    support: 'catalog',
    priceTier: 'mid',
    purposes: ['speech', 'audio'],
    advantages: ['High-quality TTS', 'Voices + cloning', 'Fast streaming audio'],
    purchaseUrl: 'https://elevenlabs.io/app/settings/api-keys',
    models: [
      { id: 'tts', description: 'Text-to-speech', tags: ['speech', 'audio'] },
      { id: 'stt', description: 'Speech-to-text', tags: ['audio'] },
    ],
  },
];

const PURPOSE_ORDER: PurposeTag[] = [
  'chat',
  'reasoning',
  'coding',
  'vision',
  'image',
  'video',
  'speech',
  'audio',
  'embeddings',
  'moderation',
  'search',
  'rerank',
];

const PRICE_ORDER: PriceTier[] = ['free', 'low', 'mid', 'high', 'enterprise'];

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  onKeyAdded,
  onKeyDeleted,
  requireAtLeastOne = false,
  showTitle = true,
  compact = false,
}) => {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyName, setKeyName] = useState('');
  const [validating, setValidating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [marketQuery, setMarketQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<PurposeTag | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<PriceTier | 'all'>('all');
  const [supportFilter, setSupportFilter] = useState<'all' | ProviderSupport>('all');
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});

  const addFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const userKeys = await fetchUserApiKeys();
      setKeys(userKeys);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const beginAddKeyForProvider = (providerId: string) => {
    setSelectedProvider(providerId);
    setValidationResult(null);
    setError('');
    setShowAddForm(true);
    requestAnimationFrame(() => {
      addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const providerOptions = useMemo(() => {
    const map = new Map<string, (typeof API_KEY_PROVIDERS)[number]>();
    for (const p of API_KEY_PROVIDERS) {
      map.set(p.id, p);
    }

    for (const p of PROVIDER_CATALOG) {
      if (map.has(p.id)) continue;
      map.set(p.id, {
        id: p.id,
        name: p.name,
        placeholder: '...',
        helpUrl: p.purchaseUrl,
        models: p.models.map((m) => m.id),
      });
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedProviderInfo = providerOptions.find((p) => p.id === selectedProvider);

  const uniquePurposes = useMemo(() => {
    const s = new Set<PurposeTag>();
    for (const p of PROVIDER_CATALOG) {
      for (const t of p.purposes) s.add(t);
    }
    return PURPOSE_ORDER.filter((t) => s.has(t));
  }, []);

  const uniquePrices = useMemo(() => {
    const s = new Set<PriceTier>();
    for (const p of PROVIDER_CATALOG) s.add(p.priceTier);
    return PRICE_ORDER.filter((t) => s.has(t));
  }, []);

  const handleValidateKey = async () => {
    if (!apiKeyInput.trim()) {
      setError('Please enter an API key');
      return;
    }

    setValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const result = await validateApiKey(selectedProvider, apiKeyInput.trim());
      setValidationResult(result);
      if (!result.valid) {
        setError(result.error || 'Invalid API key');
      }
    } catch (err: any) {
      setError(err?.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleAddKey = async () => {
    if (!apiKeyInput.trim()) {
      setError('Please enter an API key');
      return;
    }

    setAdding(true);
    setError('');

    try {
      const result = await addUserApiKey({
        provider: selectedProvider,
        apiKey: apiKeyInput.trim(),
        name: keyName.trim() || undefined,
      });

      if (result.success && result.key) {
        setKeys((prev) => [...prev, result.key!]);
        setApiKeyInput('');
        setKeyName('');
        setShowAddForm(false);
        setValidationResult(null);
        onKeyAdded?.(result.key);
      } else {
        setError(result.error || 'Failed to add API key');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add API key');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (requireAtLeastOne && keys.length <= 1) {
      setError('You must have at least one API key');
      return;
    }

    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      const result = await deleteUserApiKey(keyId);
      if (result.success) {
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
        onKeyDeleted?.(keyId);
      } else {
        setError(result.error || 'Failed to delete API key');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete API key');
    }
  };

  const toggleCompany = (company: string, next?: boolean) => {
    setExpandedCompanies((prev) => ({ ...prev, [company]: typeof next === 'boolean' ? next : !prev[company] }));
  };

  const filteredCompanies = useMemo(() => {
    const q = marketQuery.trim().toLowerCase();

    const matchesQuery = (p: ProviderCatalogEntry) => {
      if (!q) return true;
      if (p.company.toLowerCase().includes(q)) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.id.toLowerCase().includes(q)) return true;
      for (const m of p.models) {
        if (m.id.toLowerCase().includes(q)) return true;
        if (m.label && m.label.toLowerCase().includes(q)) return true;
        if (m.description && m.description.toLowerCase().includes(q)) return true;
      }
      return false;
    };

    const matchesFilters = (p: ProviderCatalogEntry) => {
      if (purposeFilter !== 'all' && !p.purposes.includes(purposeFilter)) return false;
      if (priceFilter !== 'all' && p.priceTier !== priceFilter) return false;
      if (supportFilter !== 'all' && p.support !== supportFilter) return false;
      return true;
    };

    const providers = PROVIDER_CATALOG.filter((p) => matchesQuery(p) && matchesFilters(p));

    const map = new Map<string, ProviderCatalogEntry[]>();
    for (const p of providers) {
      const arr = map.get(p.company) || [];
      arr.push(p);
      map.set(p.company, arr);
    }

    const out = Array.from(map.entries())
      .map(([company, ps]) => ({
        company,
        providers: ps.slice().sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.company.localeCompare(b.company));

    return out;
  }, [marketQuery, purposeFilter, priceFilter, supportFilter]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading API keys...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      {showTitle && <h3 className={styles.title}>Your API Keys</h3>}

      {requireAtLeastOne && keys.length === 0 && (
        <div className={styles.warning}>
          <strong>API Key Required</strong>
          <p>You need to add at least one API key to use the platform during your trial.</p>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.marketplace}>
        <div className={styles.marketplaceTopRow}>
          <div>
            <div className={styles.marketplaceTitle}>Provider Marketplace</div>
            <div className={styles.marketplaceSubtitle}>
              Search providers and models, then add your key or open the provider to purchase one.
            </div>
          </div>
          <div className={styles.marketplaceMeta}>
            <span className={styles.metaBadge}>Active: OpenAI, Anthropic, Gemini, Groq</span>
            <span className={styles.metaBadgeSecondary}>Catalog: store keys for more providers</span>
          </div>
        </div>

        <div className={styles.marketControls}>
          <input
            className={styles.marketSearch}
            value={marketQuery}
            onChange={(e) => setMarketQuery(e.target.value)}
            placeholder="Search company, provider, or model..."
            aria-label="Search providers and models"
          />

          <div className={styles.marketFilters}>
            <select
              className={styles.marketSelect}
              value={purposeFilter}
              onChange={(e) => setPurposeFilter((e.target.value as PurposeTag) || 'all')}
              aria-label="Filter by purpose"
            >
              <option value="all">All purposes</option>
              {uniquePurposes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              className={styles.marketSelect}
              value={priceFilter}
              onChange={(e) => setPriceFilter((e.target.value as PriceTier) || 'all')}
              aria-label="Filter by price"
            >
              <option value="all">All prices</option>
              {uniquePrices.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              className={styles.marketSelect}
              value={supportFilter}
              onChange={(e) => setSupportFilter(e.target.value as 'all' | ProviderSupport)}
              aria-label="Filter by support"
            >
              <option value="all">All support</option>
              <option value="active">Active</option>
              <option value="catalog">Catalog</option>
            </select>
          </div>
        </div>

        <div className={styles.companyGrid}>
          {filteredCompanies.map(({ company, providers }) => {
            const expanded = !!expandedCompanies[company];
            const topProvider = providers[0];

            return (
              <div
                key={company}
                className={`${styles.companyCard} ${expanded ? styles.companyCardExpanded : ''}`}
                onMouseEnter={() => toggleCompany(company, true)}
                onMouseLeave={() => toggleCompany(company, false)}
              >
                <button
                  type="button"
                  className={styles.companyHeader}
                  onClick={() => toggleCompany(company)}
                >
                  <div className={styles.companyHeaderLeft}>
                    <div className={styles.companyName}>{company}</div>
                    <div className={styles.companyHint}>
                      {providers.length} provider{providers.length === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div className={styles.companyHeaderRight}>
                    <span className={topProvider.support === 'active' ? styles.supportActive : styles.supportCatalog}>
                      {topProvider.support === 'active' ? 'Active' : 'Catalog'}
                    </span>
                    <span className={styles.expandIcon}>{expanded ? '−' : '+'}</span>
                  </div>
                </button>

                <div className={styles.companyBody}>
                  {providers.map((p) => (
                    <div key={p.id} className={styles.providerBlock}>
                      <div className={styles.providerTop}>
                        <div>
                          <div className={styles.providerName}>{p.name}</div>
                          <div className={styles.providerSubline}>
                            <span className={styles.providerMeta}>{p.priceTier}</span>
                            <span className={styles.dot}>·</span>
                            <span className={styles.providerMeta}>{p.purposes.slice(0, 4).join(', ')}</span>
                          </div>
                        </div>
                        <div className={styles.providerActions}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => beginAddKeyForProvider(p.id)}
                          >
                            Add key
                          </Button>
                          <a
                            href={p.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.purchaseLink}
                          >
                            Get API key →
                          </a>
                        </div>
                      </div>

                      <div className={styles.advantagesRow}>
                        {p.advantages.slice(0, 3).map((a) => (
                          <span key={a} className={styles.advantageChip}>
                            {a}
                          </span>
                        ))}
                      </div>

                      <div className={styles.modelsGrid}>
                        {p.models.map((m) => (
                          <div key={m.id} className={styles.modelItem}>
                            <div className={styles.modelTopRow}>
                              <div className={styles.modelName}>{m.label || m.id}</div>
                              {m.deprecated && <span className={styles.deprecatedBadge}>Deprecated</span>}
                            </div>
                            {m.description && <div className={styles.modelDesc}>{m.description}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredCompanies.length === 0 && (
            <div className={styles.emptyMarketplace}>No providers match your search.</div>
          )}
        </div>
      </div>

      {keys.length > 0 && (
        <div className={styles.keysList}>
          {keys.map((key) => (
            <div key={key.id} className={styles.keyItem}>
              <div className={styles.keyInfo}>
                <div className={styles.keyProvider}>
                  {providerOptions.find((p) => p.id === key.provider)?.name || key.provider}
                </div>
                <div className={styles.keyName}>{key.name}</div>
                <div className={styles.keyPrefix}>
                  <code>{key.keyPrefix}...</code>
                  {key.isValid ? (
                    <span className={styles.validBadge}>Valid</span>
                  ) : (
                    <span className={styles.invalidBadge}>Invalid</span>
                  )}
                </div>
                {key.usageTokens > 0 && (
                  <div className={styles.keyUsage}>{key.usageTokens.toLocaleString()} tokens used</div>
                )}
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteKey(key.id)}
                disabled={requireAtLeastOne && keys.length <= 1}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddForm ? (
        <div className={styles.addForm} ref={addFormRef}>
          <div className={styles.formGroup}>
            <label>Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setValidationResult(null);
                setError('');
              }}
              className={styles.select}
            >
              {providerOptions.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>API Key</label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                setValidationResult(null);
                setError('');
              }}
              placeholder={selectedProviderInfo?.placeholder || 'Enter your API key'}
              className={styles.input}
            />
            {selectedProviderInfo?.helpUrl && (
              <a
                href={selectedProviderInfo.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.helpLink}
              >
                Get your {selectedProviderInfo.name} API key →
              </a>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Name (optional)</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., Production Key"
              className={styles.input}
            />
          </div>

          {validationResult && (
            <div className={validationResult.valid ? styles.validationSuccess : styles.validationError}>
              {validationResult.valid ? '✓ API key is valid' : `✗ ${validationResult.error}`}
            </div>
          )}

          <div className={styles.formActions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setApiKeyInput('');
                setKeyName('');
                setValidationResult(null);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleValidateKey}
              disabled={validating || !apiKeyInput.trim()}
            >
              {validating ? 'Validating...' : 'Validate'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddKey}
              disabled={adding || !apiKeyInput.trim()}
            >
              {adding ? 'Adding...' : 'Add Key'}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
        >
          + Add API Key
        </Button>
      )}
    </div>
  );
};

export default ApiKeyManager;
