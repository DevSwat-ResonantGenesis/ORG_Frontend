import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { SearchIcon } from '../../components/Icons/DashboardIcons';
import { goToContact } from '../../utils/navigation';

import styles from './HelpCenterPage.module.css';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  tags?: string[];
}

const articles: Article[] = [
  // Getting Started
  {
    id: '1',
    title: 'What Is ResonantGenesis?',
    description: 'Overview of ResonantGenesis\'s governance platform, prediction tracing, evidence graphs, and policy enforcement.',
    category: 'Getting Started',
    path: '/help/getting-started/what-is-resonantgraph',
    tags: ['overview', 'introduction']
  },
  {
    id: '2',
    title: 'Account Creation',
    description: 'Create an account, set up an organization, invite users, and configure access.',
    category: 'Getting Started',
    path: '/help/getting-started/account-creation',
    tags: ['signup', 'onboarding']
  },
  {
    id: '3',
    title: 'Roles & Permissions (RBAC)',
    description: 'User roles, permissions, and access levels for Org Admin, Compliance, Finance, ML Engineer, and Platform Dev.',
    category: 'Getting Started',
    path: '/help/getting-started/roles-permissions',
    tags: ['roles', 'permissions', 'rbac']
  },
  {
    id: '4',
    title: 'Quick Start: First Prediction',
    description: 'Submit your first AI prediction, review outputs, validate compliance, and analyze results.',
    category: 'Getting Started',
    path: '/help/getting-started/first-prediction',
    tags: ['tutorial', 'quickstart']
  },
  // Using the Platform
  {
    id: '5',
    title: 'Dashboard Overview',
    description: 'KPIs, alerts, compliance scores, risk metrics, and prediction summaries.',
    category: 'Using the Platform',
    path: '/help/platform/dashboard',
    tags: ['dashboard', 'overview']
  },
  {
    id: '6',
    title: 'Running Predictions',
    description: 'Run predictions manually or via API, upload datasets, and analyze risk scores.',
    category: 'Using the Platform',
    path: '/help/platform/running-predictions',
    tags: ['predictions', 'api']
  },
  {
    id: '7',
    title: 'Evidence Graph Explained',
    description: 'Detailed breakdown of how the Evidence Graph shows feature contributions, decision paths, risk assessment, and transparent reasoning.',
    category: 'Using the Platform',
    path: '/help/platform/evidence-graph',
    tags: ['evidence', 'graph', 'visualization']
  },
  {
    id: '8',
    title: 'Compliance Center',
    description: 'Learn how the Compliance Center tracks violations, policy matches, risk thresholds, and organization-wide AI compliance benchmarks.',
    category: 'Using the Platform',
    path: '/help/platform/compliance-center',
    tags: ['compliance', 'policies']
  },
  {
    id: '9',
    title: 'Policy Management',
    description: 'Guide to creating, editing, enabling, and disabling AI policies that enforce rules, thresholds, restrictions, and automatic violation detection.',
    category: 'Using the Platform',
    path: '/help/platform/policy-management',
    tags: ['policies', 'management']
  },
  {
    id: '10',
    title: 'Audit Logs',
    description: 'Understand the full audit trail, including user actions, model events, policy triggers, and compliance interactions across your organization.',
    category: 'Using the Platform',
    path: '/help/platform/audit-logs',
    tags: ['audit', 'logs', 'compliance']
  },
  // Organization Management
  {
    id: '11',
    title: 'Inviting Users',
    description: 'Instructions for adding users, assigning roles, sending invitations, and managing team access within a secure multi-tenant environment.',
    category: 'Organization Management',
    path: '/help/organization/inviting-users',
    tags: ['users', 'invitations']
  },
  {
    id: '12',
    title: 'Assigning Roles',
    description: 'Learn how to assign or change roles, enforce least-privilege access, and maintain compliance through role-based permissions.',
    category: 'Organization Management',
    path: '/help/organization/assigning-roles',
    tags: ['roles', 'permissions']
  },
  {
    id: '13',
    title: 'API Keys',
    description: 'How to generate, revoke, rotate, and secure API keys for automated access to the ResonantGenesis API.',
    category: 'Organization Management',
    path: '/help/organization/api-keys',
    tags: ['api', 'keys', 'security']
  },
  {
    id: '14',
    title: 'Billing & Invoices',
    description: 'Overview of billing cycles, usage tracking, invoice downloads, payment methods, and financial reporting for your organization.',
    category: 'Organization Management',
    path: '/help/organization/billing-invoices',
    tags: ['billing', 'invoices', 'payments']
  },
  // ML Engineer Guide
  {
    id: '15',
    title: 'Training Jobs',
    description: 'How to create, monitor, and manage ML training jobs, including retraining workflows, dataset usage, and model performance metrics.',
    category: 'ML Engineer Guide',
    path: '/help/ml-engineer/training-jobs',
    tags: ['ml', 'training', 'models']
  },
  {
    id: '16',
    title: 'Model Versions',
    description: 'Learn how to view, compare, promote, roll back, and download model versions with full lifecycle tracking.',
    category: 'ML Engineer Guide',
    path: '/help/ml-engineer/model-versions',
    tags: ['models', 'versions', 'mlops']
  },
  {
    id: '17',
    title: 'Worker Monitoring',
    description: 'Monitor ML worker health, job queues, uptime, processing load, and system status with real-time insights.',
    category: 'ML Engineer Guide',
    path: '/help/ml-engineer/worker-monitoring',
    tags: ['monitoring', 'workers', 'infrastructure']
  },
  {
    id: '18',
    title: 'Dataset Management',
    description: 'Guide to uploading datasets, managing versions, generating synthetic sets, and preparing input for training jobs.',
    category: 'ML Engineer Guide',
    path: '/help/ml-engineer/dataset-management',
    tags: ['datasets', 'data', 'ml']
  },
  // Platform Administrator Guide
  {
    id: '19',
    title: 'Global Oversight (Platform Admin)',
    description: 'Understand the capabilities available to Platform Developers, including cross-org visibility, system metrics, and global governance controls.',
    category: 'Platform Administrator Guide',
    path: '/help/platform-admin/global-oversight',
    tags: ['admin', 'platform', 'governance']
  },
  {
    id: '20',
    title: 'Feature Flags',
    description: 'How to enable, disable, roll back, and test feature flags across the entire platform in a controlled production-safe environment.',
    category: 'Platform Administrator Guide',
    path: '/help/platform-admin/feature-flags',
    tags: ['features', 'flags', 'admin']
  },
  {
    id: '21',
    title: 'Global Metrics & Logging',
    description: 'Learn to view system-wide metrics, API latency, worker status, and aggregate audit logs for platform-wide monitoring.',
    category: 'Platform Administrator Guide',
    path: '/help/platform-admin/global-metrics',
    tags: ['metrics', 'logging', 'monitoring']
  },
  {
    id: '22',
    title: 'System Log Aggregation',
    description: 'Unified view of error logs, security logs, performance records, and cross-service operational data for debugging and compliance.',
    category: 'Platform Administrator Guide',
    path: '/help/platform-admin/system-logs',
    tags: ['logs', 'system', 'debugging']
  },
  // Developers
  {
    id: '23',
    title: 'API Reference',
    description: 'Complete API reference for predictions, evidence graphs, compliance, training jobs, and model management with request/response schemas.',
    category: 'Developers',
    path: '/help/developers/api-reference',
    tags: ['api', 'reference', 'documentation']
  },
  {
    id: '24',
    title: 'Authentication & Tokens',
    description: 'Explanation of JWTs, API keys, scopes, and secure authentication workflows for both internal and external integrations.',
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

  const categories = Array.from(new Set(articles.map(a => a.category)));

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
            Find answers, guides, and documentation for using ResonantGenesis platform.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {/* Search */}
            <div className={styles.helpSearch}>
              <div className={styles.searchInputWrapper}>
                <SearchIcon size={20} />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
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
                      {article.tags && article.tags.length > 0 && (
                        <div className={styles.articleTags}>
                          {article.tags.map(tag => (
                            <span key={tag} className={styles.articleTag}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {filteredArticles.length === 0 && (
              <div className={styles.noResults}>
                <p>No articles found matching your search.</p>
                <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>Popular Articles</h3>
              <ul>
                <li><a href="/help/getting-started/what-is-resonantgraph">What Is ResonantGenesis?</a></li>
                <li><a href="/help/getting-started/first-prediction">Quick Start: First Prediction</a></li>
                <li><a href="/help/developers/api-reference">API Reference</a></li>
                <li><a href="/help/platform/evidence-graph">Evidence Graph Explained</a></li>
                <li><a href="/help/organization/api-keys">API Keys</a></li>
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
