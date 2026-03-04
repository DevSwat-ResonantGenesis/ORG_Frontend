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
  'agi-neural-hub': `
# AGI Neural Hub

AGI Neural Hub is the action layer of ResonantGenesis: a workspace for general-purpose autonomous action, operator workflows, and tool-enabled execution.

## Where to find it

- Navigate to: [/resonant-chat](/resonant-chat)
- In the top nav: Products → **AGI Neural Hub**

## What it does

- Run goal-driven conversations that can trigger platform tools.
- Orchestrate workflows that combine:
  - autonomous reasoning
  - memory retrieval (Synthetic Neural Memory)
  - constraint simulation (Invariants SIM)
  - code/security analysis (SAST & Dependency Graph Analysis)

## Providers + “bring your own key”

If a provider requires your own key, add it in:

- Settings → API Keys
- Or go directly: [/profile?tab=api-keys](/profile?tab=api-keys)

## Recommended stack setup

1. Start in **AGI Neural Hub** for autonomous action.
2. Enable **Synthetic Neural Memory** for persistence and retrieval.
3. Use **Invariants SIM** to model constraints and enforce safe state transitions.
4. Use **SAST & Dependency Graph Analysis** for architecture visibility and remediation planning.

## Troubleshooting

- If you are redirected to signup/login, you’re not authenticated.
- If a tool says it’s disabled, check your role/plan and the relevant Settings toggles.

## Next steps

- [Synthetic Neural Memory](/help/core/synthetic-neural-memory)
- [Invariants SIM](/help/core/invariants-sim)
- [SAST & Dependency Graph Analysis](/help/core/sast-dependency-graph-analysis)
  `,
  'synthetic-neural-memory': `
# Synthetic Neural Memory

Synthetic Neural Memory is the memory layer of ResonantGenesis.

It’s designed as a **physics-informed, 9-layer cognitive infrastructure** for autonomous agents: persistence, structured retrieval, and governance-ready storage.

## Where to find it

- Product page: [/resonant-memory](/resonant-memory)
- In the top nav: Products → **Synthetic Neural Memory**

## What it’s for

- Long-term memory for agents and operator workflows.
- Retrieval that supports:
  - context reconstruction
  - high-signal recall
  - “what changed” investigation (pairing well with Execution History)

## How it fits the stack

- **AGI Neural Hub** triggers actions.
- **Synthetic Neural Memory** stores/retrieves the context that keeps actions consistent.
- **Invariants SIM** models constraints so actions stay safe.
- **SAST & Dependency Graph Analysis** provides visibility/remediation when actions touch code.

## Next steps

- [AGI Neural Hub](/help/core/agi-neural-hub)
- [Invariants SIM](/help/core/invariants-sim)
  `,
  'invariants-sim': `
# Invariants SIM

Invariants SIM is the constraint layer of ResonantGenesis.

It focuses on **economic constraint modeling** and invariant enforcement across state transitions so autonomous systems behave safely and predictably.

## Where to find it

- Product page: [/state-physics](/state-physics)
- In the top nav: Products → **Invariants SIM**

## What it’s for

- Define constraints (“invariants”) that must hold.
- Simulate state transitions under constraints.
- Detect invalid transitions early.

## How to use it (typical workflow)

1. Start a workflow in **AGI Neural Hub**.
2. Use Invariants SIM concepts to model guardrails.
3. Validate that planned actions satisfy constraints before execution.

## Next steps

- [AGI Neural Hub](/help/core/agi-neural-hub)
- [SAST & Dependency Graph Analysis](/help/core/sast-dependency-graph-analysis)
  `,
  'sast-dependency-graph-analysis': `
# SAST & Dependency Graph Analysis

This product provides **full-stack architecture observability and remediation**.

It combines static analysis (SAST) with dependency graph mapping so teams can understand system shape, risks, and remediation paths.

## Where to find it

- Product page: [/code-visualizer](/code-visualizer)
- In the top nav: Products → **SAST & Dependency Graph Analysis**

## What it’s for

- Identify security issues and risky patterns.
- Map dependency relationships.
- Support refactors and remediation planning with architecture visibility.

## Saved analyses

If the UI shows **Saved Analyses**, you can:

- list previous analyses
- load an analysis
- delete (soft-delete) an analysis

## Next steps

- [Synthetic Neural Memory](/help/core/synthetic-neural-memory)
- [Invariants SIM](/help/core/invariants-sim)
  `,
  'hash-sphere-memory': `
# 🧠 Hash Sphere Memory System

## Overview

The **Hash Sphere Memory System** is ResonantGenesis's revolutionary 9-layer architecture for semantic memory storage, retrieval, and visualization. Unlike traditional vector databases, Hash Sphere Memory combines cryptographic hashing, 3D spatial coordinates, physics-based resonance scoring, and multi-method retrieval.

## 🏗️ 9-Layer Architecture

### Layer 1: Input Processing
Text normalization, tokenization, and context extraction prepare memories for storage.

### Layer 2: Hash Generation
Multiple hash types capture different semantic properties:
- **Meaning Hash**: SHA-256 hash of semantic content (20 chars)
- **Energy Hash**: Emotional/intensity indicators (8 chars)
- **Spin Hash**: Sentiment/direction (8 chars)
- **Universe ID**: 256-bit unique identifier

### Layer 3: Universe ID
Each memory gets a cryptographically secure 256-bit identifier with nanosecond-precision timestamps.

### Layer 4: Embedding Generation
1536-dimensional semantic vectors with task-specific prefixes and intelligent caching.

### Layer 5: Coordinate Calculation

**Cartesian Coordinates (x, y, z)**:
- Derived from embeddings using PCA
- Similar meanings cluster in 3D space
- Normalized for visualization

**Hyperspherical Coordinates (r, φ, θ)**:
- r: Radius (typically 1.0 for unit sphere)
- φ: Latitude (-π/2 to π/2)
- θ: Longitude (-π to π)

### Layer 6: Resonance Scoring

**Resonance Function**: \`R(h) = sin(a·x) + cos(b·y) + tan(c·z)\`

Where a = π/4, b = e/3, c = φ/2 (golden ratio)

**Anchor Energy**: \`E_j(s) = exp(-β·||s - A_j||²)\`
Measures attraction to nearest anchor point.

### Layer 7: Evidence Aggregation
Combines multiple memory positions into single evidence vector: \`E* = Σ w_i · s_i\`

### Layer 8: Multi-LLM Routing
Optimal model selection, load balancing, and automatic failover.

### Layer 9: Output Correction
\`o_corrected = λ·o_k* + (1-λ)·Ê*\`

Blends LLM output (80%) with evidence (20%) to reduce hallucination.

## 🎯 Advanced Features

### Spin Vectors
3D vectors representing semantic "direction":
- **X-axis**: Topic/domain (technical ↔ creative)
- **Y-axis**: Emotional valence (positive ↔ negative)
- **Z-axis**: Complexity/abstraction level

### Semantic Components
- **Meaning Score**: Content richness (0-1)
- **Intensity Score**: Emotional/urgency indicators (0-1)
- **Sentiment Score**: Positive/negative sentiment (0-1)

### Magnetic Pull System (HS-MPS)
Non-linear boost: \`magnetic = min((resonance² × 1.5), 1.0)\`

Amplifies strong memories while weakening low-resonance ones.

### Drift & Decay
\`s_{t+1} = s_t + γ(A_{j*} - s_t)\`

Memories gradually move toward anchor points, simulating consolidation.

## 🔄 Multi-Method Retrieval

1. **RAG**: Vector similarity with cosine distance
2. **Vector Embeddings**: pgvector with HNSW indexing
3. **Hash Sphere Proximity**: 3D Euclidean distance
4. **Resonance Filtering**: Hash similarity + energy ranking
5. **Hybrid Ranking**: Weighted combination of all methods

## 📊 Visualization

Access the visualization at [/resonant-memory](/resonant-memory).

### 3D Sphere View
- **Memory Nodes**: Colored spheres by xyz coordinates
- **Size**: Scaled by importance
- **Color**: By type (chat, code, function)
- **Connections**: Lines between related memories

### Spin Vector Arrows
Shows semantic rotation direction and magnitude.

### Cluster Regions
Semi-transparent spheres around cluster centroids with unique colors.

### Energy Fields
Gradient visualization showing anchor attraction with pulsing animation.

### Semantic Overlays
**Color Modes**:
- **Type**: Color by memory type (default)
- **Meaning**: Gradient by meaning score
- **Intensity**: Heat map of emotional intensity
- **Sentiment**: Red → Yellow → Green

### Hyperspherical View
Alternative coordinate system with latitude/longitude grid overlay.

## 🔐 Security

- **AES-256-GCM Encryption**: All memories encrypted at rest
- **Per-User Keys**: Unique encryption key per user
- **User Universes**: Isolated memory spaces
- **Org Scoping**: Organization-level sharing

## 📈 Performance

- **Retrieval Time**: < 100ms for typical queries
- **Storage**: ~2KB per memory (including embeddings)
- **Throughput**: 1000+ memories/second ingestion
- **Cache Hit Rate**: 60-80% for repeated queries

## 🎓 Use Cases

### Personal Knowledge Base
Store conversations, notes, documents with semantic retrieval.

### Code Memory
Remember code snippets, functions, patterns for reuse.

### Research Assistant
Store papers, articles, research notes with knowledge graphs.

### Customer Support
Remember customer interactions for personalized responses.

## 🚀 Getting Started

1. Navigate to [Resonant Memory](/resonant-memory)
2. Your chat conversations are automatically stored as memories
3. Use the 3D visualization to explore your memory space
4. Toggle advanced features (spin vectors, clusters, energy fields)
5. Search memories semantically or by filters

## 📚 API Endpoints

**Ingest Memory**:
\`\`\`http
POST /api/v1/memory/ingest
{
  "content": "Memory text",
  "source": "chat"
}
\`\`\`

**Search Memories**:
\`\`\`http
POST /api/v1/memory/search
{
  "query": "Search query",
  "limit": 10
}
\`\`\`

**Hash Sphere Extract**:
\`\`\`http
POST /api/v1/memory/hash-sphere/extract
{
  "query": "Query text",
  "use_anchors": true,
  "apply_magnetic_pull": true
}
\`\`\`

For complete documentation, see our [GitHub repository](https://github.com/louienemesh/ResonantGenesis/blob/main/docs/HASH_SPHERE_MEMORY.md).
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
- [Browse Tutorials](/help)
  `,
  'creating-agents': `
# Creating AI Agents

Learn how to create, configure, and deploy AI agents in ResonantGenesis Agent Studio.

## What Are Agents?

Agents are autonomous AI entities that can perform tasks, make decisions, and interact with other systems. In ResonantGenesis, agents are:
- **Governed**: Every action is traced and auditable
- **Secure**: Built-in trust verification and compliance
- **Scalable**: Deploy across your organization

## Creating Your First Agent

### Step 1: Open Agent Studio
Navigate to Agent Studio from the main menu or go to \`/agents\`.

### Step 2: Click "Create Agent"
You'll see options for:
- **Blank Agent**: Start from scratch
- **Template**: Use a pre-built template
- **Import**: Import an existing agent configuration

### Step 3: Configure Agent Settings

#### Basic Settings
- **Name**: A descriptive name for your agent
- **Description**: What the agent does
- **Category**: Classification for organization

#### Capabilities
- **Tools**: What tools the agent can use
- **Permissions**: What actions it can perform
- **Limits**: Rate limits and resource constraints

### Step 4: Define Agent Behavior
Use the visual workflow builder or code editor to define:
- Input processing
- Decision logic
- Output formatting
- Error handling

### Step 5: Test Your Agent
Use the built-in testing environment to:
- Run test cases
- Verify outputs
- Check compliance

### Step 6: Deploy
Once tested, deploy your agent to production with:
- Staging deployment for final verification
- Production deployment with monitoring
- Rollback capability if issues arise

## Best Practices

- **Start Simple**: Begin with basic functionality and iterate
- **Test Thoroughly**: Use comprehensive test cases
- **Monitor Performance**: Watch metrics after deployment
- **Document Behavior**: Keep agent documentation updated

## Next Steps

- [Agent Templates](/help/agents/agent-templates)
- [Agent Monitoring](/help/agents/monitoring)
- [Team Collaboration](/help/agents/teams)
  `,
  'best-practices': `
# Security Best Practices

Essential security guidelines for using ResonantGenesis safely and effectively.

## Authentication & Access

### Strong Passwords
- Use passwords with at least 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Never reuse passwords across services
- Consider using a password manager

### API Key Security
- **Never commit API keys to version control**
- Store keys in environment variables or secure vaults
- Rotate keys regularly (every 90 days recommended)
- Use separate keys for development and production
- Revoke unused keys immediately

### Multi-Factor Authentication
- Enable MFA for all user accounts
- Use authenticator apps over SMS when possible
- Keep backup codes in a secure location

## Data Protection

### Encryption
- All data is encrypted in transit (TLS 1.3)
- Data at rest is encrypted with AES-256
- Use client-side encryption for sensitive payloads

### Data Minimization
- Only send data that is necessary
- Avoid including PII in prediction requests
- Use data masking for sensitive fields

### Audit Logging
- All actions are logged with timestamps
- Logs are immutable and tamper-evident
- Regular log reviews are recommended

## Network Security

### IP Allowlisting
- Restrict API access to known IP ranges
- Use VPN for administrative access
- Monitor for unauthorized access attempts

### Rate Limiting
- Implement client-side rate limiting
- Handle rate limit responses gracefully
- Use exponential backoff for retries

## Compliance

### Regular Audits
- Review access permissions quarterly
- Audit API key usage monthly
- Check compliance reports weekly

### Incident Response
- Have an incident response plan ready
- Know how to revoke access quickly
- Document and report security incidents

## Security Checklist

- [ ] MFA enabled for all users
- [ ] API keys stored securely
- [ ] IP allowlisting configured
- [ ] Regular key rotation scheduled
- [ ] Audit logs reviewed regularly
- [ ] Incident response plan documented

## Next Steps

- [API Security Guide](/help/security/api-security)
- [Compliance Overview](/help/security/compliance)
- [Contact Security Team](/contact)
  `,
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
            <pre key={index} className={styles.codeBlock}>
              <code>{codeBlockContent}</code>
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
            <ul key={`list-${index}`} className={styles.mdList}>
              {currentList.map((item, i) => (
                <li key={i} className={styles.mdListItem}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h1 key={index} className={styles.mdH1}>
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className={styles.mdList}>
              {currentList.map((item, i) => (
                <li key={i} className={styles.mdListItem}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h2 key={index} className={styles.mdH2}>
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className={styles.mdList}>
              {currentList.map((item, i) => (
                <li key={i} className={styles.mdListItem}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h3 key={index} className={styles.mdH3}>
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        currentList.push(line.substring(2));
      } else if (line.trim() === '') {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className={styles.mdList}>
              {currentList.map((item, i) => (
                <li key={i} className={styles.mdListItem}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
      } else if (line.trim()) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className={styles.mdList}>
              {currentList.map((item, i) => (
                <li key={i} className={styles.mdListItem}>{item}</li>
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
            <Link key={key++} to={match[2]} className={styles.mdLink}>
              {match[1]}
            </Link>
          );
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < line.length) {
          parts.push(<span key={key++}>{line.substring(lastIndex)}</span>);
        }

        elements.push(
          <p key={index} className={styles.mdP}>
            {parts.length > 0 ? parts : line}
          </p>
        );
      }
    });

    if (currentList.length > 0) {
      elements.push(
        <ul key="final-list" className={styles.mdList}>
          {currentList.map((item, i) => (
            <li key={i} className={styles.mdListItem}>{item}</li>
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
              <div className={styles.breadcrumbs}>
                <button className={styles.breadcrumbLink} onClick={() => goToHelp(navigate)}>Help Center</button>
                <span className={styles.breadcrumbSep}>/</span>
                <span className={styles.breadcrumbCurrent}>{categoryTitle || 'Article'}</span>
              </div>
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

