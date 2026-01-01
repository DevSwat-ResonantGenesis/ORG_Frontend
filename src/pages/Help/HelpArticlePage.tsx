import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, Text } from '../../components/ui';
import { goToHelp } from '../../utils/navigation';
import styles from './HelpArticlePage.module.css';


interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  content?: string;
}

// This would normally come from a CMS or markdown files
const articleContent: Record<string, string> = {
  'what-is-resonantgraph': `
# What Is ResonantGenesis?

ResonantGenesis is an enterprise-grade governance platform designed to monitor, trace, evaluate, and control every AI prediction in a multi-tenant environment.

## Key Features

### Prediction Tracing
Every AI prediction is automatically traced with full auditability. You can see exactly how a prediction was generated, what features contributed to it, and what decisions were made along the way.

### Evidence Graphs
Visualize the reasoning behind AI predictions with interactive evidence graphs. These graphs show:
- Input processing steps
- Feature contributions
- Decision paths
- Risk propagation
- Model interpretability

### Policy Enforcement
Define and enforce compliance policies that automatically detect violations. Policies can enforce:
- Risk thresholds
- Content restrictions
- Data usage rules
- Compliance requirements

### Enterprise Compliance
Built for enterprise requirements including:
- SOC2 alignment
- ISO 27001 readiness
- EU AI Act logging
- Complete audit trails

## Multi-Tenant Architecture

ResonantGenesis supports multiple organizations with complete data isolation. Each organization has:
- Isolated data storage
- Role-based access control (RBAC)
- Independent billing
- Custom policies

## Getting Started

To get started with ResonantGenesis:
1. Create an account
2. Set up your organization
3. Configure your first policy
4. Submit your first prediction

For more details, see our [Account Creation Guide](/help/getting-started/account-creation).
  `,
  'account-creation': `
# Account Creation

Learn how to create your ResonantGenesis account and set up your organization.

## Creating Your Account

1. Navigate to the signup page
2. Enter your email address
3. Choose a strong password (minimum 8 characters)
4. Provide your organization name
5. Click "Create Account"

Your organization will be created automatically, and you will become the organization administrator.

## Initial Setup

After account creation:

### 1. Verify Your Email
Check your inbox for a verification email and click the verification link.

### 2. Complete Your Profile
- Add your full name
- Set your timezone
- Configure notification preferences

### 3. Invite Team Members
As an organization admin, you can invite users:
- Go to Organization Management
- Click "Invite User"
- Enter email and assign role
- User receives invitation email

### 4. Configure API Keys
For programmatic access:
- Navigate to Settings → API Keys
- Generate a new API key
- Store it securely (it won't be shown again)

## Next Steps

- [Learn about Roles & Permissions](/help/getting-started/roles-permissions)
- [Run Your First Prediction](/help/getting-started/first-prediction)
  `,
  // Add more article content as needed
};

const HelpArticlePage = () => {
  const { category, article } = useParams<{ category: string; article: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    // In a real app, this would fetch from a CMS or markdown files
    const articleKey = article || '';
    const articleText = articleContent[articleKey] || `
# ${article?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article'}

This article is coming soon. Our documentation team is working on comprehensive guides for all features.

## What You Can Do

- Browse other [Help Center articles](/help)
- Contact [support](/help/faq/contact-support) for assistance
- Check our [FAQ](/help/faq/general) for common questions

## Related Articles

- [Getting Started Guide](/help/getting-started/what-is-resonantgraph)
- [API Reference](/help/developers/api-reference)
- [Troubleshooting Guide](/help/faq/troubleshooting)
    `;
    setContent(articleText);
  }, [article]);

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={index} style={{
              background: '#0a0a0a',
              color: '#0f0',
              padding: '16px',
              borderRadius: '6px',
              overflow: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              margin: '16px 0'
            }}>
              {codeBlockContent}
            </pre>
          );
          codeBlockContent = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        return;
      }

      if (line.startsWith('# ')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} style={{ margin: '16px 0', paddingLeft: '24px' }}>
              {currentList.map((item, i) => (
                <li key={i} style={{ margin: '8px 0' }}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h1 key={index} style={{ fontSize: '32px', fontWeight: 700, margin: '24px 0 16px' }}>
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} style={{ margin: '16px 0', paddingLeft: '24px' }}>
              {currentList.map((item, i) => (
                <li key={i} style={{ margin: '8px 0' }}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h2 key={index} style={{ fontSize: '24px', fontWeight: 600, margin: '20px 0 12px' }}>
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} style={{ margin: '16px 0', paddingLeft: '24px' }}>
              {currentList.map((item, i) => (
                <li key={i} style={{ margin: '8px 0' }}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h3 key={index} style={{ fontSize: '20px', fontWeight: 600, margin: '16px 0 8px' }}>
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        currentList.push(line.substring(2));
      } else if (line.trim() === '') {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} style={{ margin: '16px 0', paddingLeft: '24px' }}>
              {currentList.map((item, i) => (
                <li key={i} style={{ margin: '8px 0' }}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
      } else if (line.trim()) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} style={{ margin: '16px 0', paddingLeft: '24px' }}>
              {currentList.map((item, i) => (
                <li key={i} style={{ margin: '8px 0' }}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        // Simple link detection
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let lastIndex = 0;
        const parts: React.ReactNode[] = [];
        let match;
        let key = 0;

        while ((match = linkRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(<span key={key++}>{line.substring(lastIndex, match.index)}</span>);
          }
          parts.push(
            <Link key={key++} to={match[2]} style={{ color: 'var(--color-primary-500)', textDecoration: 'none' }}>
              {match[1]}
            </Link>
          );
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < line.length) {
          parts.push(<span key={key++}>{line.substring(lastIndex)}</span>);
        }

        elements.push(
          <p key={index} style={{ margin: '12px 0', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            {parts.length > 0 ? parts : line}
          </p>
        );
      }
    });

    if (currentList.length > 0) {
      elements.push(
        <ul key="final-list" style={{ margin: '16px 0', paddingLeft: '24px' }}>
          {currentList.map((item, i) => (
            <li key={i} style={{ margin: '8px 0' }}>{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  const articleTitle = article?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Article';
  const categoryTitle = category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  return (
    <div className={styles.helpArticlePage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1>{articleTitle}</h1>
              <p className={styles.subtitle}>{categoryTitle}</p>
            </div>
            <Button variant="secondary" size="md" onClick={() => goToHelp(navigate)}>
              ← Back to Help Center
            </Button>
          </div>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            <section className={styles.contentSection}>
              {renderContent(content)}
            </section>

            <div className={styles.actions}>
              <Button variant="secondary" size="md" onClick={() => goToHelp(navigate)}>
                Browse All Articles
              </Button>
              <Button size="md" onClick={() => navigate('/help/faq/contact-support')}>
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpArticlePage;

