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

export const articleContent: Record<string, string> = {
  'what-is-resonantgraph': `
# What Is DevSwat?

DevSwat is an enterprise-grade governance platform designed to monitor, trace, evaluate, and control every AI prediction in a multi-tenant environment.

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

DevSwat supports multiple organizations with complete data isolation. Each organization has:
- Isolated data storage
- Role-based access control (RBAC)
- Independent billing
- Custom policies

## Getting Started

To get started with DevSwat:
1. Create an account
2. Set up your organization
3. Configure your first policy
4. Submit your first prediction

For more details, see our [Account Creation Guide](/help/getting-started/account-creation).
  `,
  'agi-neural-hub': `
# AGI Neural Hub

AGI Neural Hub is the action layer of DevSwat: a workspace for general-purpose autonomous action, operator workflows, and tool-enabled execution.

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

Synthetic Neural Memory is the memory layer of DevSwat.

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

Invariants SIM is the constraint layer of DevSwat.

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

The **Hash Sphere Memory System** is DevSwat's revolutionary 9-layer architecture for semantic memory storage, retrieval, and visualization. Unlike traditional vector databases, Hash Sphere Memory combines cryptographic hashing, 3D spatial coordinates, physics-based resonance scoring, and multi-method retrieval.

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

For complete documentation, see our [GitHub repository](https://github.com/louienemesh/DevSwat/blob/main/docs/HASH_SPHERE_MEMORY.md).
  `,
  'account-creation': `
# Account Creation

Learn how to create your DevSwat account and set up your organization.

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

Learn how to create, configure, and deploy AI agents in DevSwat Agent Studio.

## What Are Agents?

Agents are autonomous AI entities that can perform tasks, make decisions, and interact with other systems. In DevSwat, agents are:
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

The **Agent Studio** is the primary workspace for creating, managing, and operating AI agents in DevSwat. It lives at \`/agents\` and is powered by the \`AgentOSv2\` component.

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
6. Shows option to "Publish to Store" or "Create Another"

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

Short descriptions for every major page in DevSwat:

| Page | Route | Description |
|------|-------|-------------|
| **Home** | \`/\` | Landing page with platform overview and quick-start links |
| **AGI Neural Hub** | \`/resonant-chat\` | General-purpose autonomous action workspace with tool-enabled chat |
| **Synthetic Neural Memory** | \`/resonant-memory\` | 9-layer cognitive memory system for agents: storage, retrieval, visualization |
| **SAST & Dependency Graph** | \`/code-visualizer\` | Full-stack architecture observability, SAST scanning, and remediation engine |
| **Agent Studio** | \`/agents\` | Create, manage, and operate AI agents (Wizard + Advanced factory, sessions, economy) |
| **Agent Teams** | \`/agent-teams\` | Orchestrate multi-agent teams and collaborative workflows |
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
  'agent-sessions-vs-chat': `
# Agent Sessions vs Chat

Understanding the two ways to interact with agents in Agent Studio — and when to use each.

---

## Overview

Agent Studio provides two distinct interaction modes for every agent:

- **Sessions** — autonomous background task execution
- **Chat** — synchronous back-and-forth conversation

Both connect to the same backend (\`agent_engine_service\`), but they use different API endpoints and have fundamentally different behavior.

---

## Sessions (Autonomous Tasks)

### What It Is

A **session** is a persistent, autonomous task. You give the agent a goal, and it works on it independently — using reasoning loops, tool calls, and multi-step execution.

### API Endpoint

\`\`\`http
POST /api/v1/agents/{agent_id}/sessions
{
  "goal": "Research the latest trends in quantum computing and write a summary report"
}
\`\`\`

### Behavior

- **Fire-and-forget**: You submit a goal, then the agent works in the background
- **Multi-step execution**: The agent can loop, reason, call tools, and chain actions
- **Polled for status**: The frontend polls \`GET /api/v1/sessions/{session_id}\` every 2 seconds to check progress
- **Persistent**: Sessions are stored in the database with full history
- **Tracked**: Appears in the Sessions panel with status, loop count, token usage, and timestamps

### Session Lifecycle

1. **Starting** — Session created, agent initializing
2. **Running** — Agent is actively working (reasoning, tool calls, loops)
3. **Completed** — Agent finished the task, final output available
4. **Failed** — Something went wrong (error message available)

### What Gets Tracked

- Session ID
- Agent ID
- Goal / task description
- Status (running / completed / failed)
- Number of reasoning loops
- Token usage (input + output)
- Start time and completion time
- Final output / result
- Error message (if failed)

### When to Use Sessions

- Long-running research tasks
- Multi-step workflows (gather data → analyze → write report)
- Tasks that require tool use (web search, code execution, API calls)
- Background processing while you do other work
- Any task where you want a tracked, auditable result

---

## Chat (Synchronous Messaging)

### What It Is

**Chat** is a direct, real-time conversation with the agent. You send a message, wait for the response, and see it immediately — like chatting with ChatGPT.

### API Endpoint

\`\`\`http
POST /api/v1/agents/{agent_id}/execute
{
  "mode": "chat",
  "input": "What are the key differences between REST and GraphQL?"
}
\`\`\`

### Behavior

- **Synchronous**: You send a message and wait for the reply
- **Single request-response**: No background processing or polling
- **Not persistent**: Messages are stored in frontend state only — lost on page refresh
- **No session created**: Nothing appears in the Sessions panel
- **Immediate feedback**: Response comes back in the same HTTP request

### What Gets Tracked

- Nothing in the database
- Messages exist only in browser memory
- Conversation history is lost on page refresh or navigation

### When to Use Chat

- Quick questions and answers
- Brainstorming and exploration
- Testing agent behavior before running a full session
- Casual conversation that doesn't need to be saved
- Getting immediate feedback without waiting for background processing

---

## Side-by-Side Comparison

### Architecture

- **Sessions**: POST \`/api/v1/agents/{agent_id}/sessions\` → creates persistent DB record → agent runs autonomously → poll for result
- **Chat**: POST \`/api/v1/agents/{agent_id}/execute\` → synchronous processing → immediate response → no DB record

### Key Differences

- **Endpoint**: Sessions use \`/sessions\`, Chat uses \`/execute\`
- **Mode**: Sessions are autonomous tasks, Chat is synchronous conversation
- **Persistent**: Sessions are stored in the database, Chat is frontend-only
- **Background**: Sessions run in the background (polled), Chat waits for reply
- **History**: Sessions are fully tracked, Chat is lost on refresh
- **Tool Use**: Sessions can chain multiple tool calls, Chat is single request-response
- **Duration**: Sessions can run for minutes, Chat responds in seconds

### Think of It As

- **Sessions** = Giving the agent a task to go work on (like assigning a ticket)
- **Chat** = Talking to the agent directly (like a quick conversation)

---

## How to Access Each Mode

### Sessions

1. Open **Agent Studio** (\`/agents\`)
2. Click the **Play button** on any agent card
3. The **Sessions panel** opens in the right pane
4. Click **Start New Session** and enter a goal
5. Monitor progress in the session list

### Chat

1. Open **Agent Studio** (\`/agents\`)
2. Click the **Message button** (speech bubble icon) on any agent card
3. The **Chat pane** opens in the right pane
4. Type a message and press Enter
5. Response appears immediately

---

## Related Articles

- [Agent Studio & Factory](/help/core/agent-studio) — Full guide to creating and managing agents
- [Agent Management](/help/core/agent-management) — Agent card actions and lifecycle
- [API Reference](/help/developers/api-reference) — Developer reference for all endpoints
  `,
  'agent-management': `
# Agent Management

Everything you need to know about managing agents in Agent Studio — actions, lifecycle, inline panels, and the agent card interface.

---

## Agent Cards

Every agent in Agent Studio is displayed as a **card** in the left pane. Each card shows:

- **Agent name** and type badge
- **Status indicator** (idle, active, paused, error)
- **Mode badge** (Governed or Unbounded)
- **Action buttons** along the bottom

---

## Agent Card Actions

Each agent card has a row of action buttons:

### Play (Run)

Selects the agent and opens the **Sessions panel** in the right pane. From there you can start new autonomous sessions, view running sessions, and check completed results.

### Message (Chat)

Opens the **inline Chat pane** in the right pane. Send synchronous messages to the agent and receive immediate responses. Chat history is maintained per-agent during your browser session (lost on refresh).

### Info (Details)

Opens the **inline Detail pane** in the right pane showing comprehensive agent information:

- **Identity**: Agent ID and Hash with copy buttons
- **Status & Mode**: Current status and governance mode
- **Stats**: Type, executions count, cost today, wallet balance, risk level
- **Capabilities**: List of enabled tools and permissions
- **Performance Benchmarks**: Average response time, P95 latency, success rate, throughput, platform ranking
- **Recent Activity**: Last 5 actions with timestamps
- **Version History**: Version numbers, hashes, dates, and changelogs

From the detail pane you can also quickly jump to **Open Sessions** or **Chat**.

### Copy (Clone)

Creates a duplicate of the agent with " (Clone)" appended to the name. The cloned agent is a fully independent copy with its own ID.

### Trash (Archive)

Archives the agent. It will be hidden from the list but preserved in your history. Requires confirmation before proceeding.

---

## Right Pane Priority

The right pane displays one panel at a time, with this priority order:

1. **Detail pane** — if you clicked Info on an agent
2. **Chat pane** — if you clicked Message on an agent
3. **Sessions panel** — if an agent is selected (via Play or card click)

Each pane has a close button (×) that dismisses it and falls back to the next priority level.

---

## Agent Lifecycle

### Statuses

- **idle** — Agent is ready, not currently running any tasks
- **active** — Agent is currently executing a session or task
- **paused** — Agent execution is temporarily suspended
- **error** — Agent encountered a problem

### Actions

- **Start** — Begin a new session (via Sessions panel)
- **Stop** — Terminate a running session
- **Pause** — Temporarily suspend execution
- **Archive** — Soft-delete the agent (preserved on chain)

---

## Bulk Operations

Press **X** to toggle bulk mode. In bulk mode:

- Checkboxes appear on each agent card
- Select multiple agents
- Use **Select All** to select every visible agent
- **Bulk Archive** to archive all selected agents at once

---

## Filtering & Sorting

### Filters

- **All** — Show all agents
- **Favorites** — Show only pinned/favorited agents
- **Status filters** — Filter by idle, active, paused, error

### Sorting

- **Name** — Alphabetical
- **Status** — By current status
- **Executions** — By total execution count
- **Cost** — By today's spending

Pinned (favorited) agents always float to the top regardless of sort order.

### Search

Use the search bar to filter agents by name. Supports real-time filtering as you type.

---

## Keyboard Shortcuts

- **X** — Toggle bulk selection mode
- **F** — Toggle favorite/pin for the selected agent

---

## Related Articles

- [Agent Sessions vs Chat](/help/core/agent-sessions-vs-chat) — When to use sessions vs chat
- [Agent Studio & Factory](/help/core/agent-studio) — Creating agents with Wizard and Advanced panels
- [API Reference](/help/developers/api-reference) — Developer reference for all endpoints
  `,
  'agent-api-reference': `
# Agent API Reference

Complete API reference for agent operations. All endpoints are accessed through the gateway and route to \`agent_engine_service\`.

---

## Authentication

All requests require authentication via one of:

- **Cookie**: \`rg_access_token\` HttpOnly cookie (browser sessions)
- **Bearer Token**: \`Authorization: Bearer <token>\` header
- **API Key**: \`Authorization: RG-<key>\` header

The gateway validates the token and injects identity headers (\`x-user-id\`, \`x-user-role\`, \`x-org-id\`) to downstream services.

---

## Agent CRUD

### Create Agent

\`\`\`http
POST /api/v1/agents
{
  "name": "Research Assistant",
  "type": "researcher",
  "description": "Autonomous research agent",
  "system_prompt": "You are a research assistant...",
  "model": "gpt-4o",
  "temperature": 0.7,
  "max_tokens": 4096,
  "tools": ["web_search", "code_exec"]
}
\`\`\`

### List Agents

\`\`\`http
GET /api/v1/agents
\`\`\`

### Get Agent

\`\`\`http
GET /api/v1/agents/{agent_id}
\`\`\`

### Delete Agent

\`\`\`http
DELETE /api/v1/agents/{agent_id}
\`\`\`

---

## Sessions (Autonomous Tasks)

### Start Session

Creates a persistent, autonomous session. The agent works on the goal in the background.

\`\`\`http
POST /api/v1/agents/{agent_id}/sessions
{
  "goal": "Research quantum computing trends and write a summary"
}
\`\`\`

**Response:**

\`\`\`http
{
  "id": "session-uuid",
  "agent_id": "agent-uuid",
  "status": "starting",
  "goal": "Research quantum computing trends...",
  "created_at": "2026-03-09T20:00:00Z"
}
\`\`\`

### Get Session

Poll this endpoint to check session progress.

\`\`\`http
GET /api/v1/sessions/{session_id}
\`\`\`

**Response:**

\`\`\`http
{
  "id": "session-uuid",
  "agent_id": "agent-uuid",
  "status": "completed",
  "goal": "Research quantum computing trends...",
  "final_output": "Here is the summary report...",
  "loop_count": 5,
  "tokens_used": 12450,
  "created_at": "2026-03-09T20:00:00Z",
  "completed_at": "2026-03-09T20:02:30Z"
}
\`\`\`

### Stop Session

Terminate a running session.

\`\`\`http
POST /api/v1/sessions/{session_id}/stop
\`\`\`

### List Sessions

\`\`\`http
GET /api/v1/agents/{agent_id}/sessions
\`\`\`

---

## Chat (Synchronous Execute)

### Execute Task (Chat Mode)

Sends a single synchronous message. Response is immediate — no session is created.

\`\`\`http
POST /api/v1/agents/{agent_id}/execute
{
  "mode": "chat",
  "input": "What is the difference between REST and GraphQL?"
}
\`\`\`

**Response:**

\`\`\`http
{
  "output": "REST and GraphQL differ in several key ways...",
  "tokens_used": 850,
  "execution_time_ms": 2340
}
\`\`\`

---

## Agent Metadata

### Get Agent Versions

\`\`\`http
GET /api/v1/agents/{agent_id}/versions
\`\`\`

### Get Agent Activity

\`\`\`http
GET /api/v1/agents/{agent_id}/activity?limit=5
\`\`\`

### Get Agent Benchmarks

\`\`\`http
GET /api/v1/agents/{agent_id}/benchmarks
\`\`\`

---

## Provider & Tool Catalog

### List Providers

\`\`\`http
GET /api/v1/agents/providers
\`\`\`

### List Tools

\`\`\`http
GET /api/v1/agents/tools
\`\`\`

### List Custom Tools

\`\`\`http
GET /api/v1/agents/tools/custom
\`\`\`

### Create Custom Tool

\`\`\`http
POST /api/v1/agents/tools/custom
{
  "name": "my-tool",
  "url": "https://api.example.com/action",
  "method": "POST",
  "risk_level": "low",
  "approval_required": false,
  "parameters_schema": {}
}
\`\`\`

---

## Autonomy & Wallet

### Set Autonomy Mode

\`\`\`http
POST /api/v1/autonomy/mode/{agent_id}
{
  "mode": "governed"
}
\`\`\`

### Create Wallet

\`\`\`http
POST /api/v1/wallets/{agent_id}
{
  "initial_balance": 100,
  "daily_limit": 25,
  "transaction_limit": 10,
  "monthly_limit": 500
}
\`\`\`

---

## Related Articles

- [Agent Sessions vs Chat](/help/core/agent-sessions-vs-chat) — When to use sessions vs chat
- [Agent Management](/help/core/agent-management) — Agent card actions and lifecycle
- [Agent Studio & Factory](/help/core/agent-studio) — Creating agents with Wizard and Advanced panels
  `,
  'best-practices': `
# Security Best Practices

Essential security guidelines for using DevSwat safely and effectively.

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
  'connect-profiles-agent-setup': `
# Connect Profiles & Agent Setup

Complete guide to connecting external services and setting up agents on DevSwat.

## Overview

DevSwat lets you connect 25+ external services (GitHub, Discord, Slack, OpenAI, Stripe, and more) and create AI agents that can use those connections. This guide covers the full workflow from connecting a service to creating and configuring an agent.

## Step 1: Connect Your Profiles

Navigate to **/connect-profiles** from the sidebar or top navigation.

The Connect Profiles page shows all available integrations organized by category:

- **Version Control** — GitHub, GitLab, Bitbucket
- **AI & Intelligence** — OpenAI, Anthropic Claude, HuggingFace, Openclaw
- **Cloud & Hosting** — DigitalOcean, Vercel, Netlify, Railway
- **Productivity** — Slack, Discord, Notion, Google Calendar, Google Drive
- **Design** — Figma
- **Databases** — Supabase, MongoDB Atlas
- **Payments** — Stripe
- **Communication** — Twilio, SendGrid
- **Automation** — Zapier, n8n
- **Monitoring** — Sentry, Datadog

### How to Connect a Service

1. Go to **/connect-profiles**
2. Find the service you want (use the search bar to filter)
3. Click the **Connect** button on the service card
4. Enter the required credentials (API key, webhook URL, or access token)
5. Click **Connect [Service Name]** to save

All credentials are encrypted and stored securely on the server.

## Step 2: Discord Webhook Setup (Example)

Discord is one of the most common integrations. Here's how to set it up:

### Create a Discord Webhook

1. Open your Discord server
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Give it a name (e.g., "DevSwat Alerts")
5. Select the channel where you want notifications
6. Click **Copy Webhook URL**

The URL looks like: \`https://discord.com/api/webhooks/123456789/abcdef...\`

### Connect Discord on DevSwat

1. Go to **/connect-profiles**
2. Find **Discord** in the Productivity category
3. Click **Connect**
4. Paste your webhook URL in the input field
5. Click **Connect Discord**

Your Discord is now connected. Agents and build notifications will be sent to your channel.

## Step 3: Create an Agent

Navigate to **/agents** (AgentOS workspace) to create agents.

### Using Resonant Chat (Recommended)

1. Open Resonant Chat
2. Enable the **Agents OS** skill in the input bar skills toggle
3. Type your request, e.g.: "Create a Webhook agent that monitors Discord events"
4. The chat will create the agent with appropriate tools and configuration
5. The agent appears in the split view panel on the right

### Using Agent Studio Directly

1. Go to **/agents**
2. Click the **+ Create Agent** button
3. Choose **Wizard** (guided) or **Advanced** (manual) mode
4. Fill in: Name, Description, System Prompt, Tools, Provider/Model
5. Click **Create**

## Step 4: Configure Your Agent

After creation, configure the agent from its dashboard:

1. Go to **/agents** and click on your agent card
2. In the agent dashboard you can:
   - Edit the system prompt and description
   - Change the AI provider and model
   - Add or remove tools
   - Set temperature, max tokens, and other parameters
   - View execution logs and metrics
   - Start/stop the agent

## Step 5: Run Your Agent

Agents can be run in two modes:

### Autonomous Sessions (Background)
- Click the **Play** button on the agent card
- The agent runs autonomously in the background
- It processes tasks based on its system prompt and tools
- View results in the agent dashboard

### Chat Execute (Interactive)
- Click the **Message** button on the agent card
- Chat directly with the agent
- Send specific instructions and get immediate responses
- Good for testing and ad-hoc tasks

## Connecting Agents to External Services

Once you've connected services at **/connect-profiles**, your agents can use those connections:

- **Discord**: Send notifications, alerts, and reports to Discord channels
- **GitHub**: Push code, create PRs, manage repos
- **Slack**: Send messages and notifications to Slack channels
- **Stripe**: Process payments and manage subscriptions
- **Zapier/n8n**: Trigger automation workflows

## Troubleshooting

### Agent not connecting to a service?
- Verify the service is connected at **/connect-profiles** (green "Connected" badge)
- Check that the API key or webhook URL is correct
- Try disconnecting and reconnecting the service

### Agent created with wrong name?
- Go to the agent dashboard at **/agents/:agentId**
- Click the edit/settings button to rename
- Or ask Resonant Chat: "Rename my agent to [New Name]"

### Need help?
- Ask Resonant Chat — it has full knowledge of all platform pages and setup workflows
- Visit **/help** for more guides
- Contact support at contact@dev-swat.com

## Related Articles

- [Agent Studio & Factory](/help/core/agent-studio) — Full guide to creating agents
- [Agent Management](/help/core/agent-management) — Agent actions and lifecycle
- [Agent API Reference](/help/developers/agent-api-reference) — Complete API reference
- [API Keys](/help/account/api-keys) — Managing provider API keys
  `,
  'integrations-guide': `
# Integrations & Connected Services

*Connect 40+ services to supercharge your agents, workflows, and deployments.*

DevSwat provides a comprehensive integrations hub that connects your AI agents and projects to the tools you already use. From AI model providers to cloud hosting, version control to payment processing — everything connects through a unified, one-click interface.

---

## Model Provider API Keys

![Model Providers — 20+ AI providers available](/images/showcase/integration1.png)

### What You See
The **Model Provider API Keys** page shows all supported AI model providers in a grid layout. Each card displays:
- **Provider name and logo** (OpenAI, Anthropic, Google Gemini, etc.)
- **Available models** (gpt-4o, claude-3-opus, gemini-1.5-pro, etc.)
- **Connection status** (● Available, ● Connected)
- **Connect/Disconnect button**

### Supported AI Providers (20+)
| Provider | Models | Use Case |
|----------|--------|----------|
| **OpenAI** | GPT-4o, GPT-4, GPT-4 Turbo | General AI, coding, analysis |
| **Anthropic (Claude)** | Claude 3 Opus, Sonnet, Haiku | Long-context, safety-focused AI |
| **Google (Gemini)** | Gemini 1.5 Pro, Flash | Multimodal AI, large context |
| **Mistral AI** | Mistral Large, Medium | European AI, fast inference |
| **Groq (Fast)** | LLaMA 3.1 70B, 8B | Ultra-fast inference |
| **Cohere** | Command R+, Command R | Enterprise search, RAG |
| **Together AI** | LLaMA 3.1 405B, Mistral 8x22B | Open-source model hosting |
| **DeepSeek** | DeepSeek Chat, Coder | Code generation specialist |
| **OpenRouter** | 100+ models | Universal model gateway |
| **Perplexity AI** | LLaMA 3.1 Sonar | Search-augmented AI |
| **Fireworks AI (Fast)** | LLaMA, Mixtral variants | High-speed inference |
| **Hugging Face** | Meta LLaMA, community models | Open-source model hub |
| **Replicate** | Stable Diffusion, LLaMA | Image + text generation |
| **Stability AI** | Stable Diffusion XL | Image generation |
| **ElevenLabs** | Eleven Turbo v2, Multilingual | Voice synthesis and cloning |
| **Grok (xAI)** | Grok-2, Grok-2 Mini | Real-time knowledge AI |
| **Kimi (Moonshot)** | Moonshot v1 | Long-context Chinese/English AI |
| **Meta (Llama)** | LLaMA 3.2 90B, 3.2 11B | Direct Meta model access |
| **Microsoft Copilot** | GPT-4o, GPT-4 Turbo | Microsoft ecosystem AI |
| **GLM (Zhipu AI)** | GLM-4, GLM-4V, GLM-3 Turbo | Chinese language specialist |
| **ChatGPT (Direct)** | ChatGPT-4o Latest | Direct ChatGPT integration |

### How to Connect
1. Go to **Settings → Integrations → Model Provider API Keys**
2. Click **Connect** on any provider
3. Enter your API key from the provider's dashboard
4. The status changes to **● Connected** with a masked key display
5. Your agents and Resonant Chat can now use models from that provider

### How Agents Use Model Providers
Once connected, any agent you create can be configured to use models from connected providers. In the agent configuration, select the model provider and specific model. Agents can also be set to auto-select the best model for each task.

### How Resonant Chat Uses Model Providers
Resonant Chat automatically routes your messages to the connected provider based on your preferences. You can switch between providers mid-conversation, and the chat maintains context across provider switches.

---

## Version Control, AI & Intelligence, Cloud & Hosting

![Version Control, AI & Intelligence, Cloud Hosting](/images/showcase/integration2.png)

### Version Control (3 providers)
- **GitHub** — Push projects, sync repos, trigger CI/CD pipelines
- **GitLab** — Push generated projects to your GitLab instance
- **Bitbucket** — Sync projects to Bitbucket repositories

### AI & Intelligence (2 providers)
- **OpenClaw** — Register and discover agents running on the OpenClaw network
- **Local LLM** — Connect your own local LLM (Ollama) for private, offline AI processing

### Cloud & Hosting (5 providers)
- **DigitalOcean** — Deploy projects to DigitalOcean droplets and apps
- **Vercel** — One-click deploy React/Next.js frontends
- **Netlify** — Deploy static sites and serverless functions
- **Railway** — Deploy any backend project to Railway
- **Amazon AWS** — Deploy to EC2, Lambda, ECS, or S3 (Coming Soon)

---

## Productivity, Design & Databases

![Productivity, Design, Databases](/images/showcase/integration3.png)

### Productivity (5 tools)
- **Google Calendar** — Schedule deployments, sync agent tasks with your calendar
- **Google Drive** — Save generated projects and documentation to Drive
- **Notion** — Auto-create project documentation in Notion workspaces
- **Slack** — Get build and deployment notifications in Slack channels
- **Discord** — Connect a DevSwat bot to your Discord server

### Design (1 tool)
- **Figma** — Import Figma designs to auto-generate frontend code from mockups

### Databases (3 providers)
- **Supabase** — Auto-provision databases, auth, and storage
- **MongoDB Atlas** — Auto-create Atlas database clusters for your projects
- **Firebase** — Real-time databases, auth, and cloud functions (Coming Soon)

---

## Payments, Communication, Automation & Monitoring

![Payments, Communication, Automation](/images/showcase/integration4.png)

![Automation & Monitoring](/images/showcase/integration5.png)

### Payments (1 provider)
- **Stripe** — Auto-configure Stripe checkout and billing in generated projects

### Communication (2 providers)
- **Twilio** — Add SMS and messaging capabilities to your agents and projects
- **SendGrid** — Configure transactional email for your applications

### Automation (2 providers)
- **Zapier** — Trigger Zapier workflows on build events, deployments, or agent completions
- **n8n** — Open-source workflow automation connected to your agent pipeline

### Monitoring (3 providers)
- **Sentry** — Auto-configure error tracking in your generated projects
- **Datadog** — Monitor deployed applications with Datadog APM
- **New Relic** — Full-stack observability and performance monitoring (Coming Soon)

---

## What You Can Do With Integrations

### For Agents
- **Use any AI model** as the brain of your agent (GPT-4o, Claude, Gemini, etc.)
- **Push agent-generated code** directly to GitHub/GitLab/Bitbucket
- **Deploy agent builds** to Vercel, Netlify, DigitalOcean, or Railway
- **Send notifications** to Slack/Discord when agents complete tasks
- **Store agent data** in Supabase, MongoDB, or Firebase
- **Trigger automations** in Zapier/n8n based on agent events

### For Resonant Chat
- **Switch between 20+ AI models** mid-conversation
- **Use local LLM** for private, offline conversations
- **Connect Google Drive** to reference documents in chat
- **Import Figma designs** and discuss them with AI
- **Generate and deploy projects** directly from chat commands

### For Projects
- **Full CI/CD pipeline** — build, test, deploy to any cloud provider
- **Payment integration** — Stripe checkout configured automatically
- **Error monitoring** — Sentry/Datadog added to generated projects
- **Database provisioning** — Auto-create databases on project generation

---

## API Access

All integrations are also available via the **DevSwat API**. You can programmatically:
- Connect and disconnect integrations
- Query integration status
- Trigger deployments and builds
- Access model providers through a unified API gateway

See the [API Reference](/help/developer/api-reference) for full documentation.

---

## Investor Insight

![20+ AI Model Providers](/images/showcase/integration1.png)

![Cloud, Version Control & AI Intelligence](/images/showcase/integration2.png)

DevSwat's **40+ integration ecosystem** creates a powerful network effect:

**Model Provider Aggregation (20+ providers):** Unlike single-vendor AI platforms, DevSwat connects to every major AI provider simultaneously. This gives users vendor independence, automatic failover, and the ability to use the best model for each task. No other platform offers this breadth of AI model access in a unified interface.

**Full-Stack DevOps Pipeline:** From code generation to deployment, monitoring, and payments — every stage of the software lifecycle is integrated. Generated projects come pre-configured with CI/CD, error tracking, database connections, and payment processing.

**Enterprise Ecosystem Value:** Each integration increases switching costs and platform stickiness. A user connected to GitHub + Slack + Vercel + OpenAI + Sentry is deeply embedded in the platform. This drives >90% retention among power users.

**Revenue Multiplier:** Every AI model call through the platform generates margin. With 20+ providers and growing usage, the integrations layer becomes a significant revenue stream beyond subscriptions.

**Competitive Moat:** Building and maintaining 40+ production-grade integrations with real-time status monitoring, one-click connect, and automatic configuration represents thousands of engineering hours that competitors cannot easily replicate.
`,
  'code-visualizer-pro': `
# Code Visualizer Pro — SAST & Full-Stack Architecture Scanner

*See your entire codebase in 3D. Find vulnerabilities, dead code, broken dependencies, and architecture drift — all in one scan.*

![Code Visualizer Pro — 3D Architecture View with Graph Janitor Agent](/images/showcase/visualizer-1.png)

---

## What Is Code Visualizer Pro?

Code Visualizer Pro is a **full-stack static analysis (SAST) and architecture visualization tool** built into the DevSwat platform. It renders your entire codebase as an interactive **3D graph** where:

- **Services** are large spheres (color-coded by type)
- **Files** are medium spheres connected to their service
- **Functions** are smaller nodes connected to their files
- **API Endpoints** are highlighted nodes showing your public interface
- **Connections** are lines showing imports, calls, and dependencies between nodes

This is not just a pretty visualization — it is a **production-grade security and architecture scanner** that identifies vulnerabilities, dead code, broken dependencies, unreachable nodes, and governance violations.

---

## UI Walkthrough

### Controls Panel (Left Sidebar)

![Governance Report with Violations](/images/showcase/visualizer-2.PNG)

- **Single / Compare** toggle — Analyze one codebase or compare up to 3 versions
- **Codebase Path** — Enter the path to any project (local, GitHub URL, or uploaded)
- **Analyze** button — Triggers the full scan
- **Filters** — Filter by Pipeline, Service, Code Type (All/Backend/Frontend)
- **Search** — Search for specific files, functions, or classes
- **Visualization** — Layout Mode (Circular, Force, Hierarchical), Heat Map, Show Level
- **Quick Filters** — Broken, Endpoints, Functions, Hide Lines, Direct Only
- **Full Pipeline Trace** — Trace data flow through entire pipeline
- **Export for AI** — Export graph data for AI analysis

### Main 3D View (Center)

![3D Circular Layout with 10,000+ nodes](/images/showcase/visualizer-3.png)

The centerpiece is a fully interactive **WebGL-powered 3D graph**:
- **Rotate** — Click and drag to orbit the graph
- **Zoom** — Scroll to zoom in/out
- **Click nodes** — Select any node to see its details
- **Color coding** — Services (blue), Files (orange/cyan), Functions (purple), Endpoints (yellow), Broken (red), Modified (orange)

### Node Details Panel (Right)

![Node Details showing GovernanceEngine class](/images/showcase/visualizer-4.png)

When you click any node, the right panel shows:
- **Name** — File, class, or function name
- **Type** — service, file, class, function, endpoint
- **Service** — Which microservice it belongs to
- **File path** — Full path to the source file
- **Incoming connections** — What imports or calls this node
- **Outgoing connections** — What this node imports or calls
- **Trace Execution** — Follow the call chain through the codebase
- **Full Pipeline** — See the complete data flow path

### Statistics Panel (Bottom Left)
Real-time metrics for the scanned codebase:
- **Files** — Total number of files analyzed (e.g., 604-626)
- **Services** — Number of microservices detected (e.g., 23-30)
- **Connections** — Total dependency connections mapped (e.g., 10,658-20,701)
- **Endpoints** — API endpoints discovered (e.g., 1,463-1,469)
- **Broken** — Broken or dead connections found (e.g., 6,035-2,898)
- **Drift Score** — How much the codebase has changed (0-100%)

### Graph Analysis Panel (Right Bottom)
Architecture health metrics:
- **Layout** — fragmented, connected, modular, or healthy
- **Density** — Connection density (lower = more modular)
- **Hub Nodes** — Critical central nodes (high coupling risk)
- **Isolated** — Nodes with no connections (potential dead code)

### Minimap (Bottom Right)
A birds-eye view of the entire graph for navigation.

---

## Governance Engine

![Governance Report showing violations](/images/showcase/visualizer-2.PNG)

The Governance Engine runs automated policy checks on your codebase:

### What It Checks
- **Forbidden dependencies** — e.g., "Services should not depend on gateway"
- **Unreachable code** — Files and functions not reachable from any entry point
- **Circular dependencies** — Import cycles that cause build issues
- **Orphan endpoints** — API endpoints with no handlers
- **Dead code** — Functions never called from anywhere

### Violation Severity
- **Critical/High** — Security risks, forbidden dependencies, broken imports
- **Medium** — Unreachable code, unused functions, isolated modules

### CI Integration
- **CI Status** shows PASS/FAIL based on governance rules
- Can be integrated into your CI/CD pipeline to block deployments with violations

---

## Timeline Playback & Drift Analysis

![Timeline Playback comparing 3 project versions](/images/showcase/visualizer-5.png)

### Compare Mode
Switch to **Compare** mode to analyze up to **3 different versions** of your codebase:
1. Select Project 1 (oldest), Project 2 (middle), Project 3 (current)
2. Click **Compare 3 Projects**
3. The **Evolution Timeline** shows changes over time

### What Timeline Shows
- **File count changes** between versions (e.g., 236 → 285 → 604)
- **New files, removed files, modified files** between each version
- **Breaking Changes** — Critical files that changed significantly
- **Code Drift Score** — 0% (identical) to 100% (complete rewrite)

### Playback Controls
- **Play/Pause** — Animate the graph morphing between versions
- **Step Forward/Back** — Move one version at a time
- **Speed control** — Normal or fast playback

---

## How to Scan a Project

### Method 1: Local Path
1. Go to **Code Visualizer** in the sidebar
2. Enter the full path to your project (e.g., \`/Users/dev/my-project\`)
3. Click **Analyze**
4. Wait 5-30 seconds depending on project size

### Method 2: GitHub Repository
1. Enter a GitHub URL (e.g., \`https://github.com/user/repo\`)
2. The system clones and analyzes the repository
3. Results include full dependency mapping

### Method 3: File Upload
1. Upload a ZIP file of your project
2. The system extracts and analyzes all files

### Method 4: API
\`\`\`bash
curl -X POST https://dev-swat.com/api/v1/scan/github \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"repo_url": "https://github.com/user/repo"}'
\`\`\`

---

## Supported Languages & File Types

| Language | Extensions | Analysis Depth |
|----------|-----------|----------------|
| **Python** | .py | Functions, classes, imports, decorators, async |
| **JavaScript** | .js, .jsx | Functions, classes, imports, exports, React components |
| **TypeScript** | .ts, .tsx | Types, interfaces, generics, decorators |
| **Solidity** | .sol | Contracts, functions, modifiers, events |
| **Go** | .go | Functions, structs, interfaces, goroutines |
| **Rust** | .rs | Functions, structs, traits, macros |
| **Java** | .java | Classes, methods, interfaces, annotations |
| **C/C++** | .c, .cpp, .h | Functions, classes, includes, preprocessor |
| **YAML/JSON** | .yml, .json | Configuration, Docker Compose, package.json |
| **SQL** | .sql | Tables, views, procedures, migrations |
| **Dockerfile** | Dockerfile | Stages, dependencies, base images |

---

## Analysis Functions

### 1. Dependency Mapping
Maps every import, require, and include statement to build a complete dependency graph. Identifies circular dependencies, broken imports, and unused dependencies.

### 2. Reachability Analysis
Starting from entry points (main files, API endpoints, route handlers), traces which code is reachable and which is dead code. Unreachable code is flagged as a medium-severity violation.

### 3. Service Boundary Detection
Automatically detects microservice boundaries based on directory structure, Docker Compose files, and import patterns. Maps inter-service communication.

### 4. API Endpoint Discovery
Finds all HTTP endpoints (GET, POST, PUT, DELETE) across all frameworks (Express, FastAPI, Flask, Spring, etc.) and maps them to their handlers.

### 5. Security Analysis (SAST)
- Forbidden dependency patterns (e.g., frontend should not import backend secrets)
- Hardcoded credentials detection
- Unsafe import patterns
- Dependency vulnerability correlation

### 6. Architecture Drift Detection
Compares multiple versions of a codebase to detect:
- New dependencies introduced
- Removed files that may break other services
- Changed file structures that affect imports
- Overall drift score (0-100%)

### 7. Graph Health Metrics
- **Density** — How interconnected the codebase is (lower = more modular)
- **Hub Nodes** — Critical files that many other files depend on (single points of failure)
- **Isolated Nodes** — Files with no connections (potential dead code)
- **Fragmentation** — Whether the graph is connected or split into islands

---

## Using with Resonant Chat & Agents

### Resonant Chat Integration
You can run Code Visualizer scans directly from Resonant Chat:
- "Scan my project at /path/to/project" — Triggers analysis
- "Show me the governance violations" — Displays violation report
- "Find all unreachable code" — Filters to dead code
- "Trace the execution path from gateway to billing_service" — Shows call chain

### Agent Integration
Agents can use Code Visualizer as a **tool**:
- **Graph Janitor Agent** — Built-in AI agent that automatically proposes fixes for governance violations, remembers past proposals, and avoids re-proposing rejected changes
- Custom agents can call the scan API to analyze code before making changes
- Agents can use the graph data to understand codebase structure before writing code

### API Access
Full programmatic access via REST API:
- \`POST /api/v1/scan/github\` — Scan a GitHub repository
- \`POST /api/v1/scan/upload\` — Scan an uploaded project
- \`GET /api/v1/analysis/{id}/governance\` — Get governance results
- \`GET /api/v1/analysis/{id}\` — Get full analysis results

---

## Investor Insight

![Full 3D Architecture View with 10,000+ nodes](/images/showcase/visualizer-1.png)

![Governance Violations & SAST Report](/images/showcase/visualizer-2.PNG)

![Timeline Playback & Drift Analysis](/images/showcase/visualizer-5.png)

Code Visualizer Pro represents a **category-defining product** in the developer tools space:

**Market Opportunity:** The SAST (Static Application Security Testing) market is projected to reach **$7.8B by 2028** (Gartner). Current tools (SonarQube, Snyk, Checkmarx) provide text-based reports. Code Visualizer Pro is the **only tool that renders full-stack architecture as an interactive 3D graph** with real-time governance and AI-powered remediation.

**Unique Technical Moat:**
- **3D WebGL visualization** of codebases with 10,000+ nodes rendered in real-time
- **AI Graph Janitor Agent** that autonomously proposes and applies fixes
- **Timeline Playback** showing architecture evolution across versions
- **Multi-service awareness** — understands microservice boundaries, not just individual files

**Enterprise Value Proposition:**
- Replace 3-4 separate tools (SAST scanner + dependency checker + architecture visualizer + drift detector) with one platform
- **CI/CD integration** blocks deployments that violate governance policies
- **SOC 2 / ISO 27001 compliance** — automated security scanning with audit trail
- **Developer productivity** — new engineers understand codebase architecture in minutes instead of weeks

**Key Differentiator:** The combination of **visual architecture understanding + AI-powered remediation + real-time governance** in a single product does not exist anywhere else in the market.
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

      // Image: ![alt](src)
      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
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
          <div key={index} className={styles.mdImageWrap}>
            <img src={imgMatch[2]} alt={imgMatch[1]} className={styles.mdImage} loading="lazy" />
            {imgMatch[1] && <span className={styles.mdImageCaption}>{imgMatch[1]}</span>}
          </div>
        );
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

