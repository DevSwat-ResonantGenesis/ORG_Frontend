import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useThemeStore } from '../../store/themeStore';
import { 
  SearchIcon, 
  PlayIcon, 
  ChartIcon, 
  UsersIcon, 
  BotIcon, 
  SettingsIcon, 
  KeyIcon,
  FileTextIcon 
} from '../../components/Icons/DashboardIcons';
import { goToContact } from '../../utils/navigation';

import styles from './HelpCenterPage.module.css';

const ThreeParticleSphere = lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  tags?: string[];
  readingTime?: number;
}

interface FAQ {
  question: string;
  answer: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Getting Started': <PlayIcon size={20} />,
  'Core Stack': <ChartIcon size={20} />,
  'Marketplace': <UsersIcon size={20} />,
  'Account & Billing': <SettingsIcon size={20} />,
  'Developers': <KeyIcon size={20} />,
};

const faqs: FAQ[] = [
  {
    question: 'How do I get started with ResonantGenesis?',
    answer: 'Create an account, complete onboarding, and start with AGI Neural Hub. Add API keys if you want to use your own providers, and configure your agent stack (memory, invariants, and analysis) as needed.'
  },
  {
    question: 'Where do I manage API keys?',
    answer: 'Go to API Keys and add your provider keys. You can manage and rotate keys anytime.'
  },
  {
    question: 'What is the recommended stack?',
    answer: 'Start with AGI Neural Hub for autonomous action, add Synthetic Neural Memory for persistence, use Invariants SIM for constraint modeling, and use SAST & Dependency Graph Analysis for full-stack observability and remediation.'
  },
  {
    question: 'Is my data secure on ResonantGenesis?',
    answer: 'Yes. We use secure session handling, tenant isolation, and encryption for sensitive workflows. Use least-privilege roles, rotate API keys, and follow best practices for production deployments.'
  },
  {
    question: 'How do I contact support?',
    answer: 'Use the Contact Support button in the sidebar, or email support@resonantgenesis.xyz. Enterprise customers have access to dedicated support channels.'
  }
];

const HELP_THEME_STORAGE_KEY = 'rg_help_theme';

const applyDomTheme = (t: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.setAttribute('theme', t);
  document.body.setAttribute('data-theme', t);
  document.documentElement.style.colorScheme = t;
};

const articles: Article[] = [
  // Getting Started
  {
    id: '1',
    title: 'What Is ResonantGenesis?',
    description: 'Autonomous agent infrastructure for action, memory, invariants simulation, and full-stack observability.',
    category: 'Getting Started',
    path: '/help/getting-started/what-is-resonantgraph',
    tags: ['overview', 'introduction'],
    readingTime: 5
  },
  {
    id: '2',
    title: 'Account Creation',
    description: 'Create an account, complete onboarding, and set up access.',
    category: 'Getting Started',
    path: '/help/getting-started/account-creation',
    tags: ['signup', 'onboarding'],
    readingTime: 3
  },
  {
    id: '3',
    title: 'Roles & Permissions (RBAC)',
    description: 'User roles, permissions, and access levels.',
    category: 'Getting Started',
    path: '/help/getting-started/roles-permissions',
    tags: ['roles', 'permissions', 'rbac'],
    readingTime: 4
  },
  // Core Stack
  {
    id: '5',
    title: 'AGI Neural Hub',
    description: 'General-purpose autonomous action and operator workflows.',
    category: 'Core Stack',
    path: '/help/core/agi-neural-hub',
    tags: ['chat', 'autonomy', 'agents'],
    readingTime: 6
  },
  {
    id: '31',
    title: 'Chat Metrics & Hallucination Detection',
    description: 'Understand quality scores, hallucination risk levels, and configure detection methods: system prompt grounding, LLM-as-judge, and knowledge base cross-referencing.',
    category: 'Core Stack',
    path: '/help/core/resonant-chat-metrics',
    tags: ['metrics', 'hallucination', 'quality', 'grounding', 'knowledge-base', 'llm-judge', 'verification'],
    readingTime: 10
  },
  {
    id: '6',
    title: 'Synthetic Neural Memory',
    description: 'A physics-informed 9-layer cognitive infrastructure for autonomous agents.',
    category: 'Core Stack',
    path: '/help/core/synthetic-neural-memory',
    tags: ['memory', 'persistence', 'retrieval'],
    readingTime: 8
  },
  {
    id: '7',
    title: 'Invariants SIM',
    description: 'Economic constraint modeling and invariants enforcement across state transitions.',
    category: 'Core Stack',
    path: '/help/core/invariants-sim',
    tags: ['constraints', 'simulation', 'safety'],
    readingTime: 7
  },
  {
    id: '8',
    title: 'SAST & Dependency Graph Analysis',
    description: 'Full-stack architecture observability and remediation engine.',
    category: 'Core Stack',
    path: '/help/core/sast-dependency-graph-analysis',
    tags: ['security', 'observability', 'remediation'],
    readingTime: 7
  },
  {
    id: '30',
    title: 'Agent Studio & Factory',
    description: 'Deep-dive into the Agent Factory: Wizard vs Advanced panels, backend API map, hardcoded providers analysis, and platform pages reference.',
    category: 'Core Stack',
    path: '/help/core/agent-studio',
    tags: ['agents', 'factory', 'wizard', 'advanced', 'providers'],
    readingTime: 12
  },
  {
    id: '32',
    title: 'Agent Sessions vs Chat',
    description: 'Understand the two ways to interact with agents — autonomous sessions (persistent, background) vs synchronous chat (immediate, frontend-only). Endpoints, behavior, and when to use each.',
    category: 'Core Stack',
    path: '/help/core/agent-sessions-vs-chat',
    tags: ['agents', 'sessions', 'chat', 'execute', 'api', 'autonomous'],
    readingTime: 8
  },
  {
    id: '33',
    title: 'Agent Management',
    description: 'Agent card actions (run, message, detail, clone, publish, archive), right pane panels, lifecycle statuses, bulk operations, filtering, sorting, and keyboard shortcuts.',
    category: 'Core Stack',
    path: '/help/core/agent-management',
    tags: ['agents', 'management', 'actions', 'lifecycle', 'bulk'],
    readingTime: 7
  },
  {
    id: '34',
    title: 'Agent API Reference',
    description: 'Complete API reference for agent CRUD, sessions, chat execute, metadata, providers, tools, autonomy, and wallet endpoints.',
    category: 'Developers',
    path: '/help/developers/agent-api-reference',
    tags: ['agents', 'api', 'sessions', 'execute', 'endpoints', 'reference'],
    readingTime: 10
  },
  // Marketplace
  {
    id: '9',
    title: 'Marketplace',
    description: 'Discover and evaluate verified AI agents and integrations.',
    category: 'Marketplace',
    path: '/help/marketplace/overview',
    tags: ['agents', 'discover'],
    readingTime: 5
  },
  // Account & Billing
  {
    id: '10',
    title: 'API Keys',
    description: 'Add, rotate, and manage provider API keys.',
    category: 'Account & Billing',
    path: '/help/account/api-keys',
    tags: ['api', 'keys', 'security'],
    readingTime: 4
  },
  {
    id: '11',
    title: 'Billing & Credits',
    description: 'Understand usage, credits, and plan limits.',
    category: 'Account & Billing',
    path: '/help/account/billing-credits',
    tags: ['billing', 'credits'],
    readingTime: 5
  },
  // Developers
  {
    id: '23',
    title: 'API Reference',
    description: 'Developer reference for integrating with ResonantGenesis services and routes.',
    category: 'Developers',
    path: '/help/developers/api-reference',
    tags: ['api', 'reference', 'documentation']
  },
  {
    id: '24',
    title: 'Authentication & Tokens',
    description: 'Authentication workflows, sessions, API keys, and secure integrations.',
    category: 'Developers',
    path: '/help/developers/authentication',
    tags: ['auth', 'tokens', 'security']
  },
  {
    id: '25',
    title: 'Example API Requests',
    description: 'Ready-to-use examples for sending predictions, fetching logs, managing models, and automating compliance workflows.',
    category: 'Developers',
    path: '/help/developers/api-examples',
    tags: ['api', 'examples', 'code']
  },
  {
    id: '26',
    title: 'Error Codes & Troubleshooting',
    description: 'List of API error codes, failure modes, and resolution steps to diagnose and fix issues quickly.',
    category: 'Developers',
    path: '/help/developers/error-codes',
    tags: ['errors', 'troubleshooting', 'debugging']
  },
  {
    id: '27',
    title: 'SDK Documentation',
    description: 'Python and JavaScript SDK documentation with installation guides, code examples, and integration tutorials.',
    category: 'Developers',
    path: '/help/developers/sdk-documentation',
    tags: ['sdk', 'python', 'javascript']
  }
];

const HelpCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [helpTheme, setHelpTheme] = useState<'light' | 'dark'>('light');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Follow platform theme — read current theme on mount */
  useEffect(() => {
    const currentTheme = (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || useThemeStore.getState().theme || 'dark';
    setHelpTheme(currentTheme);
  }, []);

  const toggleHelpTheme = () => {
    const next = helpTheme === 'dark' ? 'light' : 'dark';
    setHelpTheme(next);
    applyDomTheme(next);
    try {
      localStorage.setItem(HELP_THEME_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const categories = Array.from(new Set(articles.map(a => a.category)));

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detect when sticky search bar is stuck at top
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '56')}px 0px 0px 0px` }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const suggestedSearches = ['AGI Neural Hub', 'memory', 'invariants', 'SAST', 'API keys', 'marketplace'];

  const featuredTopics = articles.filter(a => a.category === 'Core Stack');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedArticles = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  return (
    <div className={styles.helpCenterPage}>
      {/* Fixed Background — 3D Particle Sphere stays behind everything */}
      <div className={`${styles.fixedBg} ${searchQuery ? styles.fixedBgSearching : ''}`} aria-hidden="true">
        <Suspense fallback={<div className={styles.parallaxPlaceholder} />}>
          <div className={styles.heroParallaxInner}>
            <ThreeParticleSphere />
          </div>
        </Suspense>
      </div>

      {/* Hero — title + subtitle + search + hashtags all together */}
      <section className={`${styles.hero} ${searchQuery ? styles.heroSearching : ''}`}>
        <div className={styles.heroContent}>
          <div className={styles.heroIntro}>
            <h1 className={styles.heroTitle}>Help Center</h1>
            <p className={styles.heroSubtitle}>
              Tutorials and documentation for ResonantGenesis — aligned to the current stack.
            </p>
          </div>

          {/* Search Bar */}
          <div className={styles.searchBar}>
            <SearchIcon size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchShortcut}>⌘K</span>
          </div>

          {/* Hashtag Category Filters */}
          <div className={styles.hashTags}>
            <button
              className={`${styles.hashTag} ${selectedCategory === null ? styles.hashTagActive : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              #All
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`${styles.hashTag} ${selectedCategory === category ? styles.hashTagActive : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                #{category.replace(/\s+&\s+/g, '').replace(/\s+/g, '')}
              </button>
            ))}
          </div>

          {/* Search Results — appear below hashtags when user is typing */}
          {searchQuery && (
            <div className={styles.heroSearchResults}>
              {filteredArticles.length > 0 ? (
                filteredArticles.slice(0, 8).map(article => (
                  <button
                    key={article.id}
                    className={styles.heroSearchItem}
                    onClick={() => navigate(article.path)}
                  >
                    <FileTextIcon size={16} />
                    <div className={styles.heroSearchItemText}>
                      <span className={styles.heroSearchItemTitle}>{article.title}</span>
                      <span className={styles.heroSearchItemDesc}>{article.description}</span>
                    </div>
                    {article.readingTime && (
                      <span className={styles.heroSearchItemMeta}>{article.readingTime} min</span>
                    )}
                  </button>
                ))
              ) : (
                <div className={styles.heroSearchEmpty}>
                  No articles found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {searchQuery === '' && selectedCategory === null && featuredTopics.length > 0 && (
              <section className={styles.featuredSection}>
                <div className={styles.featuredHeader}>
                  <h2>Start with the Core Stack</h2>
                  <p className={styles.featuredSubtitle}>
                    Action, memory, constraints, and analysis—pick a topic to begin.
                  </p>
                </div>
                <div className={styles.featuredGrid}>
                  {featuredTopics.map(topic => (
                    <button
                      key={topic.id}
                      className={styles.featuredCard}
                      onClick={() => navigate(topic.path)}
                    >
                      <div className={styles.featuredCardTop}>
                        <span className={styles.featuredIcon}>{categoryIcons[topic.category]}</span>
                        {topic.readingTime && (
                          <span className={styles.featuredMeta}>
                            <FileTextIcon size={14} /> {topic.readingTime} min
                          </span>
                        )}
                      </div>
                      <div className={styles.featuredTitle}>{topic.title}</div>
                      <div className={styles.featuredDesc}>{topic.description}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Articles by Category */}
            {Object.entries(groupedArticles).map(([category, categoryArticles]) => (
              <section key={category} className={styles.contentSection}>
                <h2 className={styles.sectionTitle}>{category}</h2>
                <div className={styles.articleGrid}>
                  {categoryArticles.map(article => (
                    <div
                      key={article.id}
                      className={styles.articleCard}
                      onClick={() => navigate(article.path)}
                    >
                      <h3 className={styles.articleTitle}>{article.title}</h3>
                      <p className={styles.articleDesc}>{article.description}</p>
                      <div className={styles.articleMeta}>
                        {article.readingTime && (
                          <span className={styles.readingTime}>
                            <FileTextIcon size={14} /> {article.readingTime} min read
                          </span>
                        )}
                        {article.tags && article.tags.length > 0 && (
                          <div className={styles.articleTags}>
                            {article.tags.map(tag => (
                              <span key={tag} className={styles.articleTag}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {filteredArticles.length === 0 && (
              <div className={styles.noResults}>
                <SearchIcon size={48} className={styles.noResultsIcon} />
                <h3>No articles found</h3>
                <p>We couldn't find any articles matching "{searchQuery}"</p>
                <div className={styles.suggestedSearches}>
                  <span>Try searching for:</span>
                  <div className={styles.suggestionTags}>
                    {suggestedSearches.map(term => (
                      <button
                        key={term}
                        className={styles.suggestionTag}
                        onClick={() => setSearchQuery(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
                  Clear Filters
                </Button>
              </div>
            )}
            {/* API Reference Section */}
            <section className={styles.contentSection}>
              <h2 className={styles.sectionTitle}>API Reference & Developer Resources</h2>
              <div className={styles.articleGrid}>
                <div className={styles.articleCard} onClick={() => navigate("/help/developers/api-reference")}>
                  <h3 className={styles.articleTitle}>REST API Documentation</h3>
                  <p className={styles.articleDesc}>Complete API reference for integrating with ResonantGenesis platform.</p>
                </div>
                <div className={styles.articleCard} onClick={() => window.open("https://github.com/louienemesh/ResonantGenesis", "_blank")}>
                  <h3 className={styles.articleTitle}>GitHub Repository</h3>
                  <p className={styles.articleDesc}>Explore our open-source codebase and join the community.</p>
                </div>
                <div className={styles.articleCard} onClick={() => goToContact(navigate)}>
                  <h3 className={styles.articleTitle}>Contact Support</h3>
                  <p className={styles.articleDesc}>Get help from our support team via email or contact form.</p>
                </div>
              </div>
            </section>


            {/* FAQ Section */}
            <section className={styles.faqSection}>
              <h2>Frequently Asked Questions</h2>
              <div className={styles.faqList}>
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`${styles.faqItem} ${expandedFaq === index ? styles.expanded : ''}`}
                  >
                    <button 
                      className={styles.faqQuestion}
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{faq.question}</span>
                      <span className={styles.faqToggle}>{expandedFaq === index ? '−' : '+'}</span>
                    </button>
                    {expandedFaq === index && (
                      <div className={styles.faqAnswer}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
