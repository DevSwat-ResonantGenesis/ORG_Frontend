import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Navigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useThemeStore } from '../../store/themeStore';
import styles from './HelpArticlePage.module.css';

const HELP_THEME_STORAGE_KEY = 'rg_help_theme';

const applyDomTheme = (t: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.setAttribute('theme', t);
  document.body.setAttribute('data-theme', t);
  document.documentElement.style.colorScheme = t;
};

const goToHelp = (navigate: ReturnType<typeof useNavigate>) => {
  navigate('/help');
};

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  content?: string;
}

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
  'agent-studio': `
# Agent Studio & Factory

The **Agent Studio** is the primary workspace for creating, managing, and operating AI agents in ResonantGenesis. It lives at \`/agents\` and is powered by the \`AgentOSv2\` component.

## Page Architecture

\`\`\`
/agents (route)
  AgentOSv2 (main page)
    Sidebar (section navigation)
      agents    - list / manage agents
      sessions  - active agent sessions
      factory   - create new agents (Wizard or Advanced)
      economy   - agent wallet & spending
      settings  - agent-level settings
    Active Panel (lazy-loaded per section)
\`\`\`

When you click **Factory** in the sidebar, you see two modes: **Wizard** and **Advanced**.

---

## Wizard Panel (AgentWizard)

A **5-step guided flow** designed for new users or quick agent creation.

### Steps

| # | Step | What You Configure |
|---|------|--------------------|
| 1 | **Basic Info** | Agent name (2-50 chars, validated), description (max 500 chars) |
| 2 | **Agent Type** | executor, researcher, coder, planner, or general assistant |
| 3 | **AI Model** | Pick a provider + model from a fixed list (see below) |
| 4 | **Tools** | Toggle up to 4 built-in tools: web_search, code_exec, file_access, api_calls |
| 5 | **Review** | Summary of all selections, then "Create Agent" |

### Hardcoded Providers in Wizard

| Provider | Model | Label |
|----------|-------|-------|
| Groq | llama-3.3-70b-versatile | Groq (Fast) |
| OpenAI | gpt-4o | OpenAI GPT-4 |
| Anthropic | claude-3.5-sonnet | Claude 3.5 |
| Google | gemini-2.0-flash | Gemini 2.0 |

### What happens on "Create"

1. Calls \`POST /api/v1/agents\` with name, type, description, model, tools.
2. Adds the new agent to the frontend store (\`useAgentStore\`).
3. Navigates back to the agents list panel.

### What Wizard does NOT support

- System prompt editing
- Temperature / token limit tuning
- Memory, autonomy, or wallet configuration
- Custom tool creation
- Provider routing / fallback chain
- Templates, import/export
- API key generation
- Deployment settings

---

## Advanced Panel (AdvancedFactory)

A **single-page full-configuration form** for power users. All sections are visible at once.

### Sections

#### 1. Agent Templates
8 pre-built templates (Research Assistant, Code Generator, Data Analyst, Content Writer, Task Planner, Customer Support, Full Stack Dev, Vision Analyst). Clicking a template pre-fills name, description, type, provider, model, and tools.

#### 2. Agent Identity
- **Name** (required)
- **Type** (executor, planner, researcher, coder, negotiator, verifier)
- **Description** (free text)
- **Tags** (array of strings)
- **Governance Mode** (governed / unbounded)

#### 3. AI Model & Provider
- **Routing Mode**: auto, manual, or fallback
- **Provider Selection**: groq, openai, anthropic, google, local (5 hardcoded providers + live catalog overlay from \`GET /api/v1/agents/providers\`)
- **Model Selection**: each provider has a hardcoded list of models
- **Provider Key Status**: checks which keys the user has configured via \`fetchUserApiKeys()\`
- **Fallback Chain**: ordered list of providers for automatic failover

#### 4. Model Parameters
- Temperature (0-2)
- Max tokens
- Top P
- Frequency penalty
- Presence penalty
- System prompt (full text editor)

#### 5. Tools
- 10 built-in tools (web_search, code_exec, file_access, api_calls, database, email, calendar, image_gen, speech, vision)
- **Live tool catalog** from \`GET /api/v1/agents/tools\` with filtering by category, risk level, search
- **Custom tools** from \`GET /api/v1/agents/tools/custom\`
- **Create custom tool**: name, URL, method, risk level, approval required, JSON parameters schema
- **Edit / delete custom tools**
- Tool detail inspector (schema, handler config, risk level)

#### 6. Memory Configuration
- Memory enabled (toggle)
- Vector store enabled (toggle)
- Context window size

#### 7. Autonomy Configuration
- Can spawn sub-agents
- Can modify self
- Can access network
- Can execute code
- Max concurrent tasks

#### 8. Wallet Configuration
- Wallet enabled (toggle)
- Initial balance, daily limit, transaction limit, monthly limit

#### 9. Developer Options
- Webhook URL
- API key generation (\`POST /api/v1/developer/keys\`)
- Rate limit per minute

#### 10. Deployment Settings
- Environment (development / staging / production)
- Auto-scale toggle
- Min / max instances

#### 11. Import / Export
- Import agent config from JSON
- Export current config to JSON file

### What happens on "Create"

1. Calls \`POST /api/v1/agents\` with full payload (name, type, description, system_prompt, model, temperature, max_tokens, tools, allowed_actions, blocked_actions, safety_config with provider, routing, memory, autonomy, deployment, developer settings).
2. Sets autonomy mode: \`POST /api/v1/autonomy/mode/{agent_id}\`
3. Creates wallet if enabled: \`POST /api/v1/wallets/{agent_id}\`
4. Generates API key if enabled: \`POST /api/v1/developer/keys\`
5. Adds agent to frontend store
6. Shows option to "Publish to Network" or "Create Another"

---

## Backend API Dependency Map

| API Endpoint | Wizard | Advanced | Backend Service |
|---|---|---|---|
| \`POST /api/v1/agents\` | Yes | Yes | agent_engine_service |
| \`GET /api/v1/agents/providers\` | No | Yes | agent_engine_service |
| \`GET /api/v1/agents/tools\` | No | Yes | agent_engine_service |
| \`GET /api/v1/agents/tools/custom\` | No | Yes | agent_engine_service |
| \`POST /api/v1/agents/tools/custom\` | No | Yes | agent_engine_service |
| \`DELETE /api/v1/agents/tools/custom/{id}\` | No | Yes | agent_engine_service |
| \`POST /api/v1/autonomy/mode/{id}\` | No | Yes | agent_engine_service |
| \`POST /api/v1/wallets/{id}\` | No | Yes | agent_engine_service |
| \`POST /api/v1/developer/keys\` | No | Yes | agent_engine_service |
| \`fetchUserApiKeys()\` | No | Yes | gateway |

All requests go through \`fastapiClient\` (Axios) -> gateway -> agent_engine_service.

---

## Why Are Providers Hardcoded?

**Both panels hardcode provider and model lists in the frontend instead of fetching them from the LLM service router.**

The backend already has:
- **llm_service/multi_provider/multi_ai_router.py** — full BYOK (Bring Your Own Key) support, automatic fallback chain, intelligent routing by task complexity
- **llm_service/services/intelligent_router.py** — Layer 8 routing that scores providers by strength, cost, speed, quality, and health
- **chat_service/domain/provider/facade.py** — provider facade with \`set_user_api_keys()\` and streaming support

The Advanced panel partially addresses this: it calls \`GET /api/v1/agents/providers\` to get the live catalog and overlays it on top of the hardcoded list. But the **Wizard panel** does not call any provider catalog at all — it shows 4 static entries regardless of which providers are actually available or which keys the user has configured.

**This is a known gap.** Ideally both panels should:
1. Fetch the live provider catalog on mount
2. Show only providers that are available (system keys or user BYOK keys)
3. Use the intelligent router's model list instead of hardcoded model arrays
4. Respect the user's configured fallback chain from their profile

---

## Do We Need Both Panels?

**Yes.** They serve different audiences:

- **Wizard** = onboarding funnel. 5 clicks, no cognitive overload. Good for first-time or casual users.
- **Advanced** = power-user configuration. Full control over every parameter. Templates, custom tools, wallet, deployment, import/export.

This follows standard UX patterns (WordPress Quick Draft vs. full editor, GitHub Quick Setup vs. full repo settings). The Wizard reduces drop-off; the Advanced panel is where real configuration happens.

They are **complementary, not redundant**.

---

## Platform Pages Reference

Short descriptions for every major page in ResonantGenesis:

| Page | Route | Description |
|------|-------|-------------|
| **Home** | \`/\` | Landing page with platform overview and quick-start links |
| **AGI Neural Hub** | \`/resonant-chat\` | General-purpose autonomous action workspace with tool-enabled chat |
| **Synthetic Neural Memory** | \`/resonant-memory\` | 9-layer cognitive memory system for agents: storage, retrieval, visualization |
| **Invariants SIM** | \`/state-physics\` | Economic constraint modeling and invariant enforcement across state transitions |
| **SAST & Dependency Graph** | \`/code-visualizer\` | Full-stack architecture observability, SAST scanning, and remediation engine |
| **Agent Studio** | \`/agents\` | Create, manage, and operate AI agents (Wizard + Advanced factory, sessions, economy) |
| **Agent Teams** | \`/agent-teams\` | Orchestrate multi-agent teams and collaborative workflows |
| **Network / Marketplace** | \`/network\` | Discover, publish, and execute agents on the decentralized agent network |
| **Hash Sphere Memory** | \`/hash-sphere\` | 3D visualization of the Hash Sphere memory coordinate system |
| **Dashboard** | \`/dashboard\` | System metrics, agent activity, and operational overview |
| **Evidence Graph** | \`/evidence-graph\` | Visualize reasoning chains and prediction evidence |
| **API Keys** | \`/api-keys\` | Manage provider API keys (OpenAI, Anthropic, Groq, Google, etc.) |
| **Profile** | \`/profile\` | User account settings, preferences, and API key management |
| **Billing** | \`/billing\` | Usage, credits, plan limits, and payment management |
| **Admin** | \`/admin\` | Platform administration, user management, system configuration |
| **Help Center** | \`/help\` | Tutorials, documentation, and FAQ for all platform features |
| **Community** | \`/community\` | Community discussions, shared agents, and collaboration |
| **Rabbit** | \`/rabbit\` | Rabbit social network and content feed |
| **Compliance** | \`/compliance\` | Compliance monitoring, policy enforcement, and audit trails |

## Next Steps

- [AGI Neural Hub](/help/core/agi-neural-hub)
- [Synthetic Neural Memory](/help/core/synthetic-neural-memory)
- [Marketplace](/help/marketplace/overview)
- [API Keys](/help/account/api-keys)
  `,
  'resonant-chat-metrics': `
# Resonant Chat Metrics & Hallucination Detection

Everything you need to understand about how AGI Neural Hub measures response quality, detects hallucinations, and gives you control over AI verification.

---

## Overview

Every message in Resonant Chat is scored across multiple dimensions. You can view these metrics by clicking the **metrics icon** on any assistant message. Metrics help you understand:

- How good a response is (quality)
- Whether the AI made things up (hallucination)
- How well the response uses conversation context (coherence)
- Whether it followed your instructions (grounding)

---

## Chat-Level Metrics

When you open the **Metrics panel** (bottom-left icon), you see aggregate scores for the entire conversation:

| Metric | Range | What It Means |
|--------|-------|---------------|
| **Quality** | 0-100% | Overall response quality across all messages |
| **Hallucination** | 0-100% | Average hallucination risk (lower = better) |
| **Tokens** | Count | Total tokens used in the conversation |

These are calculated from all assistant messages in the chat, giving you a high-level view of the conversation's reliability.

---

## Message-Level Metrics

Click the **chart icon** on any assistant message to see detailed per-message metrics:

### Resonant Energy
\`0.0 - 1.0\` · How well the response "resonates" with the conversation context.

Factors:
- Base resonance from Hash Sphere positioning
- Response completeness and structure
- Code blocks, lists, and formatting quality
- Semantic coherence with previous messages

### Hallucination Score
\`0.0 - 1.0\` · Risk that the response contains fabricated or inaccurate information.

**Lower is better.** A score of 0.0 means no hallucination detected. A score above 0.4 triggers a warning.

This score is calculated by combining multiple detection methods (see Hallucination Detection below).

### Evidence Score
\`0.0 - 1.0\` · How well the response is grounded in available evidence (RAG sources, anchors, knowledge base).

### Anchor Following
\`0.0 - 1.0\` · How well the response follows conversation anchors (key topics and context points).

### Context Coherence
\`0.0 - 1.0\` · Semantic similarity between the response and the conversation history.

### Memory Utilization
\`0.0 - 1.0\` · How effectively the response uses stored memories from your conversation history.

---

## Sentiment & Emotion Detection

Each message is also analyzed for:

| Metric | Values | Description |
|--------|--------|-------------|
| **Sentiment** | positive, negative, neutral | Overall tone of the response |
| **Sentiment Confidence** | 0-100% | How confident the detection is |
| **Emotion** | joy, sadness, anger, fear, surprise, neutral | Detected emotional tone |
| **Emotion Confidence** | 0-100% | How confident the emotion detection is |

---

## Hallucination Detection System

The hallucination detector uses **multiple layers** of analysis. You can configure which methods are active in **Chat Settings > Hallucination Detection**.

### Layer 1: Base Pattern Detection (Always Active)

This runs on every message automatically. It uses regex patterns to detect:

- **Fake Libraries**: References to non-existent packages or APIs
- **Fake Statistics**: Made-up numbers, percentages, or data claims
- **Overconfident Claims**: Phrases like "definitely", "100%", "guaranteed" without evidence
- **Fabrication Indicators**: Unsourced claims like "studies show", "research indicates"
- **System Leaks**: Internal debug output appearing in responses
- **Fake Versions**: Suspiciously high or non-existent version numbers

### Layer 2: RAG Verification (Automatic when sources exist)

When the response has RAG (Retrieval-Augmented Generation) sources or conversation anchors, claims are verified against them:

- Claims are extracted from the response
- Each claim is checked against source material
- A **support score** indicates how many claims are backed by evidence
- Unsupported claims increase the hallucination risk score

### Layer 3: System Prompt Grounding (Default ON, Free)

**What it does:** Checks if the AI response contradicts the system prompt instructions.

**Detects:**
- **Identity Mismatch**: The AI claims to be something the system prompt didn't define (e.g., saying "I am Spectrum" when the system prompt says "You are a helpful assistant")
- **Directive Violations**: Breaking "never do X" or "always do Y" rules from the system prompt
- **Role Deviation**: The AI breaks character by revealing it's an AI when the system prompt defined a persona

**Cost:** Free - no additional API calls. Uses local text analysis.

**How to enable:** On by default. Toggle in Chat Settings > Hallucination Detection > **System Prompt Grounding**.

### Layer 4: Knowledge Base Cross-Referencing (Optional)

**What it does:** Checks AI responses against facts, documents, and data that you upload.

**How it works:**
1. You upload entries to your Knowledge Base (facts, documents, data, book excerpts)
2. When enabled, every response is checked against your uploaded content
3. Claims that contradict your knowledge base are flagged
4. Claims that are supported by your knowledge base reduce the hallucination score

**Use cases:**
- Upload company facts to ensure the AI doesn't make up information about your business
- Upload product specifications to verify technical claims
- Upload book excerpts or research papers to fact-check against
- Upload data tables to verify numerical claims

**Cost:** Free - no additional API calls. Uses local text matching.

**How to enable:** Toggle in Chat Settings > Hallucination Detection > **Knowledge Base Check**, then add entries using the **+ Add** button.

### Layer 5: LLM-as-Judge Verification (Optional, Costly)

**What it does:** Makes a **second AI call** to independently judge the original response for hallucinations.

**How it works:**
1. The original response is sent to a fast AI model (Groq)
2. The judge AI analyzes for: factual accuracy, identity accuracy, self-consistency, and groundedness
3. Returns a structured verdict: **clean**, **minor**, or **major**
4. Issues found are listed as specific hallucination flags

**What it catches that other methods don't:**
- Subtle factual errors that pattern matching misses
- Logical inconsistencies within the response
- Plausible-sounding but incorrect technical claims

**Cost:** Uses credits - one additional LLM call per message. Uses the fastest/cheapest available provider (Groq) to minimize cost.

**How to enable:** Toggle in Chat Settings > Hallucination Detection > **LLM-as-Judge**. Labeled "COSTLY" in the UI.

---

## How Scores Are Combined

The final hallucination score blends all active detection methods:

\`\`\`
Final Score = Base Regex Score
            + (System Prompt Grounding Score × 0.4)    [if enabled]
            + (Knowledge Base Contradiction Score × 0.3) [if enabled]
            + (LLM Judge Score × 0.5)                   [if enabled]
\`\`\`

The score is clamped to \`0.0 - 1.0\`.

### Risk Levels

| Score | Level | Meaning |
|-------|-------|---------|
| 0.0 - 0.3 | **Low** | Response appears reliable |
| 0.3 - 0.7 | **Medium** | Some concerns detected - verify key claims |
| 0.7 - 1.0 | **High** | Significant hallucination risk - do not trust without verification |

A warning is shown when the score exceeds **0.4**.

---

## Managing Your Knowledge Base

Your Knowledge Base is your personal fact store for hallucination cross-referencing.

### Adding Entries

1. Open **Chat Settings** (gear icon, bottom-left)
2. Scroll to **Hallucination Detection**
3. Enable **Knowledge Base Check**
4. Click **+ Add**
5. Fill in:
   - **Title**: A descriptive name (e.g., "Company Product List")
   - **Type**: fact, document, data, or book_excerpt
   - **Content**: Paste your text content
6. Click **Save Entry**

### Entry Types

| Type | Best For | Example |
|------|----------|---------|
| **Fact** | Short, specific truths | "Our company was founded in 2020" |
| **Document** | Longer reference material | Product documentation, policies |
| **Data** | Structured information | Price lists, specifications, statistics |
| **Book Excerpt** | Published source material | Textbook passages, research papers |

### Deleting Entries

Click the red **Delete** button next to any entry to remove it.

---

## Viewing Detailed Results

In the Message Metrics modal, you'll see:

### Hallucination Section
- **Risk Score**: The combined hallucination score (0-100%)
- **Risk Level**: low / medium / high
- **Flags Count**: Number of individual issues detected
- **Flag Details**: Each detected issue with type, content, and confidence

### Claim Verification Section (when enhanced detection is active)
- **Methods Used**: Which detection methods ran
- **System Prompt Grounding**: Grounded (yes/no), violations list
- **Knowledge Base**: Claims checked, supported, contradictions found
- **LLM Judge**: Verdict (clean/minor/major), specific issues

### RAG Verification Section
- **Verified**: Whether claims are supported by sources
- **Support Score**: Percentage of claims backed by evidence
- **Claims Checked/Supported**: Raw counts
- **Claim Details**: Per-claim breakdown

---

## Tips for Best Results

1. **Keep System Prompt Grounding ON** - it's free and catches identity/instruction violations
2. **Add key facts to your Knowledge Base** when discussing specific topics
3. **Enable LLM-as-Judge selectively** - turn it on when accuracy is critical, off for casual chat
4. **Check the flags count** - even a low overall score might have specific concerning flags
5. **Use the risk level as a guide** - "medium" means double-check, "high" means don't trust

## Settings Location

All hallucination detection settings are in:
**Chat Settings** (gear icon, bottom-left of chat) → scroll to **Hallucination Detection**

Settings are saved per-user and persist across sessions.

---

## Related Articles

- [AGI Neural Hub](/help/core/agi-neural-hub) - The chat workspace these metrics apply to
- [Hash Sphere Memory](/help/core/hash-sphere-memory) - How memory and retrieval works
- [Synthetic Neural Memory](/help/core/synthetic-neural-memory) - The memory system behind context coherence
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

const HelpArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { category, article } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [helpTheme, setHelpTheme] = useState<'light' | 'dark'>('light');

  const [content, setContent] = useState<string>('');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const previousTheme =
      (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') ||
      useThemeStore.getState().theme;

    let nextHelpTheme: 'light' | 'dark' = 'light';
    try {
      const saved = localStorage.getItem(HELP_THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') nextHelpTheme = saved;
    } catch {
      nextHelpTheme = 'light';
    }

    setHelpTheme(nextHelpTheme);
    applyDomTheme(nextHelpTheme);

    return () => {
      applyDomTheme(previousTheme);
    };
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

  useEffect(() => {
    if (!article) {
      setContent('');
      return;
    }

    const articleText = articleContent[article] || `# Article Not Found\n\nThis tutorial does not exist yet. Go back to the [Help Center](/help).`;
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
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <Button variant="secondary" size="sm" onClick={toggleHelpTheme}>
                {helpTheme === 'dark' ? 'Light mode' : 'Dark mode'}
              </Button>
              <Button variant="secondary" size="md" onClick={() => goToHelp(navigate)}>
                ← Back to Help Center
              </Button>
            </div>
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

