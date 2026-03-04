import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const suggestedSearches = ['AGI Neural Hub', 'memory', 'invariants', 'SAST', 'API keys', 'marketplace'];

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
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Help Center</h1>
          <p className={styles.subtitle}>
            Tutorials and documentation for ResonantGenesis — aligned to the current stack.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {/* Search */}
            <div className={styles.helpSearch}>
              <div className={styles.searchInputWrapper}>
                <SearchIcon size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search help articles... (⌘K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <span className={styles.searchShortcut}>⌘K</span>
              </div>
            </div>

            {/* Category Filter */}
            <div className={styles.categoryFilters}>
              <button
                className={`${styles.categoryFilter} ${selectedCategory === null ? styles.active : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={`${styles.categoryFilter} ${selectedCategory === category ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className={styles.categoryIcon}>{categoryIcons[category]}</span>
                  {category}
                </button>
              ))}
            </div>

            {/* Articles by Category */}
            {Object.entries(groupedArticles).map(([category, categoryArticles]) => (
              <section key={category} className={styles.contentSection}>
                <h2>{category}</h2>
                <div className={styles.articleGrid}>
                  {categoryArticles.map(article => (
                    <div
                      key={article.id}
                      className={styles.articleCard}
                      onClick={() => navigate(article.path)}
                    >
                      <h3>{article.title}</h3>
                      <p>{article.description}</p>
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
              <h2>API Reference & Developer Resources</h2>
              <div className={styles.articleGrid}>
                <div className={styles.articleCard} onClick={() => navigate("/help/developers/api-reference")}>
                  <h3>REST API Documentation</h3>
                  <p>Complete API reference for integrating with ResonantGenesis platform.</p>
                </div>
                <div className={styles.articleCard} onClick={() => window.open("https://github.com/louienemesh/ResonantGenesis", "_blank")}>
                  <h3>GitHub Repository</h3>
                  <p>Explore our open-source codebase and join the community.</p>
                </div>
                <div className={styles.articleCard} onClick={() => goToContact(navigate)}>
                  <h3>Contact Support</h3>
                  <p>Get help from our support team via email or contact form.</p>
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

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>Popular Articles</h3>
              <ul>
                <li><a href="/help/getting-started/what-is-resonantgraph">What Is ResonantGenesis?</a></li>
                <li><a href="/help/core/agi-neural-hub">AGI Neural Hub</a></li>
                <li><a href="/help/core/synthetic-neural-memory">Synthetic Neural Memory</a></li>
                <li><a href="/help/core/invariants-sim">Invariants SIM</a></li>
                <li><a href="/help/account/api-keys">API Keys</a></li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Quick Links</h3>
              <ul>
                <li><a href="/validate">Validation Tool</a></li>
                <li><a href="/llm-scan">LLM Scanner</a></li>
                <li><a href="/contact">Contact Support</a></li>
                <li><a href="/about">About Us</a></li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Need More Help?</h3>
              <p>
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={() => goToContact(navigate)}>
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
