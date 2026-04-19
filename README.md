<p align="center">
  <img src="public/devswat/DevSwat.png" alt="DevSwat — Agentic AI Infrastructure" width="100%" />
</p>

<h1 align="center">DevSwat</h1>
<h3 align="center">Agentic AI Infrastructure — Build, Run & Schedule Server and Local Agents</h3>

<p align="center">
  <strong>Built-in IDE &bull; AST/SAST Code Analysis &bull; Invariant Simulation &bull; Decentralized LLM Training &bull; P2P Weight Shards &bull; Two Blockchains</strong>
</p>

<p align="center">
  <a href="https://dev-swat.com">Live Platform</a> &bull;
  <a href="https://dev-swat.com/pricing">Pricing</a> &bull;
  <a href="https://dev-swat.com/api/docs">API Docs</a> &bull;
  <a href="https://dev-swat.com/help">Help Center</a> &bull;
  <a href="https://dev-swat.com/contact">Contact</a>
</p>

<p align="center">
  <a href="https://www.linkedin.com/company/devswat/">LinkedIn</a> &bull;
  <a href="https://www.youtube.com/@DevSwat">YouTube</a> &bull;
  <a href="https://x.com/devswat">X (Twitter)</a> &bull;
  <a href="https://www.reddit.com/u/DevSwat/">Reddit</a> &bull;
  <a href="mailto:contact@dev-swat.com">contact@dev-swat.com</a>
</p>

---

## What Is DevSwat?

**DevSwat** is a full-stack, production-deployed **Agentic AI SaaS platform** built from scratch by **Louie Nemesh** — a single engineer — in under 4 months. It is the most feature-complete autonomous agent infrastructure available today, combining multi-agent orchestration, governed memory, physics-based state simulation, a custom blockchain, a 68-module AI chat pipeline with hallucination detection, and complete SaaS billing — all in one platform.

Unlike wrapper products that put a UI on top of OpenAI or LangChain, DevSwat is **9 proprietary IP systems** built from the ground up. Every line of code is original. Every system is production-deployed.

**Available for acquisition.** Replacement cost: **$2M–$5M+** (18–24 months for a standard team). [View the investor pitch deck →](https://dev-swat.com/investor-pitch-deck)

---

## Why DevSwat Exists

The AI agent landscape in 2025–2026 is fragmented. Companies like **OpenAI**, **Anthropic**, **Google DeepMind**, **Cohere**, **Mistral AI**, and **Meta AI** provide foundation models — but building production agent systems on top of them requires stitching together dozens of tools, frameworks, and services. **LangChain**, **LlamaIndex**, **CrewAI**, **AutoGen**, **Semantic Kernel**, and **Haystack** each solve a slice of the problem, but none provide a complete, production-ready, multi-tenant SaaS platform.

DevSwat fills this gap. It is the **full vertical stack** — from LLM provider abstraction to agent orchestration to memory to billing to deployment.

### How DevSwat Compares

| Capability | DevSwat | LangChain / LangSmith | CrewAI | AutoGen (Microsoft) | OpenAI Assistants API | Anthropic Claude | AWS Bedrock |
|---|---|---|---|---|---|---|---|
| Multi-agent orchestration (voting, debate, chain) | ✅ Built-in | ❌ Manual | ✅ Basic | ✅ Basic | ❌ | ❌ | ❌ |
| Governed semantic memory | ✅ 9-layer cognitive | ❌ | ❌ | ❌ | ✅ Threads only | ❌ | ❌ |
| Physics-based state simulation | ✅ Hash Sphere | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Custom blockchain (audit/identity) | ✅ DSID-P | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Hallucination detection pipeline | ✅ 68-module | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Code analysis & dependency graphs | ✅ Code Visualizer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Full SaaS billing (Stripe) | ✅ 5 revenue streams | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Multi-tenant RBAC | ✅ 4 role levels | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 7 LLM providers built-in | ✅ | ✅ | ❌ 1-2 | ✅ | ❌ OpenAI only | ❌ Claude only | ✅ |
| Self-hosted / Kubernetes-ready | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Production-deployed with users | ✅ 178 users | ❌ Framework only | ❌ Framework only | ❌ Framework only | ✅ | ✅ | ✅ |

---

## Supported LLM Providers & Models

DevSwat connects to **7 LLM providers** out of the box. Bring your own API keys or use platform-provided credits.

### OpenAI
- GPT-4o, GPT-4o-mini, GPT-4-Turbo, GPT-4, GPT-3.5-Turbo
- o1-preview, o1-mini (reasoning models)
- text-embedding-ada-002, text-embedding-3-small, text-embedding-3-large

### Anthropic
- Claude 3.5 Sonnet, Claude 3.5 Haiku
- Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku

### Google (Gemini)
- Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash
- Gemini Pro, Gemini Pro Vision

### Groq (Ultra-fast inference)
- LLaMA 3.3 70B, LLaMA 3.1 70B, LLaMA 3.1 8B
- Mixtral 8x7B, Gemma 2 9B

### Mistral AI
- Mistral Large, Mistral Medium, Mistral Small
- Mistral 7B, Mixtral 8x7B, Codestral

### Cohere
- Command R+, Command R, Command
- Embed English v3.0, Embed Multilingual v3.0

### Local / Ollama (Self-hosted)
- LLaMA 3, Mistral 7B, CodeLlama, Phi-3, Gemma
- Any GGUF model via Ollama

---

## Connect Any Agent Framework to DevSwat

DevSwat is designed as **agent infrastructure** — not just another chatbot. You can connect agents built with any framework:

- **OpenAI Assistants** — Connect your OpenAI agents, give them governed memory, identity, and billing
- **Anthropic Claude** tool-use agents — Plug into DevSwat for orchestration and audit trails
- **LangChain / LangGraph** agents — Use DevSwat as the memory, state, and governance layer
- **CrewAI** crews — Orchestrate CrewAI teams through DevSwat multi-agent voting and debate
- **AutoGen (Microsoft)** — Add governed memory and physics-based state to AutoGen conversations
- **Semantic Kernel (Microsoft)** — Connect enterprise .NET agents to DevSwat control plane
- **Haystack (deepset)** — Use DevSwat semantic memory with Haystack RAG pipelines
- **LlamaIndex** — Combine LlamaIndex data connectors with DevSwat agent orchestration
- **Hugging Face Transformers** — Deploy custom models and connect via DevSwat agent API
- **OpenClaw / Open-source agents** — Register, govern, and monetize any open-source agent
- **Custom Python/JS agents** — RESTful API for any agent to gain identity, memory, and billing

### What Agents Gain on DevSwat
1. **Identity** — Every agent gets a unique identity with DSID-P blockchain anchoring
2. **Governed Memory** — 9-layer semantic memory with dual short/long-term engines
3. **Orchestration** — Multi-agent voting, debate, and chaining protocols
4. **Billing** — Per-agent credit tracking, usage metering, and Stripe-powered monetization
5. **Audit Trails** — Every action recorded with evidence graphs and immutable hash chains
6. **Marketplace** — Publish, discover, and monetize agents in the built-in marketplace

---

## 9 Proprietary IP Systems

### 1. ResonantChat — 68-Module AI Pipeline
The most sophisticated chat pipeline in any SaaS product. 68 processing modules including:
- **Hallucination detection** — System prompt grounding, LLM-as-judge, knowledge base cross-referencing
- **Evidence graph construction** — Links every claim to source material with citation chains
- **9 modular AI skills** — Auto-detected and executed: web search, code analysis, memory read/write, agent orchestration, social posting, HTTP API calls
- **Multi-provider fallback** — Automatic failover across 7 LLM providers
- **Streaming responses** — Real-time token streaming with quality metrics overlay

### 2. Hash Sphere — Physics-Based State Engine
A completely novel approach to state management using physics simulation:
- N-body particle system with gravity, repulsion, electromagnetic, and resonance forces
- State represented as nodes in 3D space with spin, energy, and conservation invariants
- Real-time Three.js visualization with interactive exploration
- Force-directed graph layouts for dependency analysis

### 3. Semantic Memory Universe
Per-user encrypted memory space with cognitive architecture:
- 9-layer memory system: sensory buffer → working memory → episodic → semantic → procedural → meta-cognitive → emotional → social → creative
- Embedding-based retrieval with resonance clustering
- Dual short-term and long-term memory engines
- AES-encrypted per-user storage with 3D visualization

### 4. DSID-P — Decentralized State Identity Protocol
Custom blockchain protocol built from scratch:
- DSID records with unique identifiers for every agent and action
- HashNode graph with merkle root verification
- Immutable audit entries and state snapshots
- Anchor records for cross-service identity verification
- 8 database tables, 988 API endpoints

### 5. RARA — Resonant Autonomous Runtime Architecture
Governance layer for autonomous agent operations:
- Runtime constraint enforcement and safety boundaries
- Autonomous planning, execution, and error correction
- Real-time monitoring with intervention capabilities

### 6. Code Visualizer
GitHub repository analysis and visualization engine:
- Scan any public/private GitHub repo via OAuth
- Generate interactive dependency graphs
- Trace function call chains across files
- Produce governance reports and code quality metrics
- AI-powered code review with 20+ analysis endpoints

### 7. Multi-Agent Orchestration Engine
Production-ready multi-agent coordination:
- **Voting protocol** — Agents vote on decisions with configurable quorum
- **Debate protocol** — Agents argue positions with structured turn-taking
- **Chain protocol** — Sequential agent pipelines with state passing
- **Team management** — Create, configure, and deploy agent teams

### 8. Enterprise Control Plane
Full governance and compliance infrastructure:
- Semantic Explorer — Search and analyze all platform data
- Trust Dashboard — Real-time trust scoring for agents and users
- Governance Center — Policy management and enforcement
- Compliance Hub — Regulatory compliance tracking
- Security Monitor — Threat detection and response
- Performance Dashboard — System-wide performance metrics
- Live Execution Monitor — Real-time agent execution tracking

### 9. SaaS Billing Engine
Complete revenue infrastructure:
- Stripe integration with subscriptions, one-time payments, and usage billing
- 5 revenue streams: subscriptions, agent credits, marketplace fees, API usage, enterprise licensing
- 4 plan tiers: Free, Plus ($29/mo), Enterprise ($499/mo), Owner
- Credit system with purchase, spend, and refund workflows
- Real-time usage tracking and billing dashboards

---

## Architecture Overview

### Backend — 30 FastAPI Microservices
| Service | Purpose |
|---------|---------|
| gateway | API gateway with auth middleware, rate limiting, 1,048 route forwards |
| auth_service | JWT authentication, OAuth (Google/GitHub), MFA/TOTP, session management |
| chat_service | 68-module ResonantChat pipeline, streaming, hallucination detection |
| agent_engine_service | Agent CRUD, sessions, execution, orchestration (54,608 lines) |
| billing_service | Stripe integration, subscriptions, credits, usage tracking |
| blockchain_service | DSID-P protocol, hash chains, merkle trees, audit records (38,043 lines) |
| code_visualizer_service | GitHub repo scanning, dependency graphs, governance reports |
| memory_service | Hash Sphere semantic memory, embeddings, clustering |
| user_memory_service | Per-user memory universe, 9-layer cognitive architecture |
| state_physics_service | Physics-based state engine, N-body simulation, conservation invariants |
| rara_service | RARA governance layer, autonomous runtime architecture |
| cognitive_service | Anomaly detection, clustering, workflow triggering |
| ml_service | ML model registry, training jobs, inference endpoints |
| llm_service | LLM provider abstraction, model catalog, health monitoring |
| marketplace_service | Agent marketplace, publish, discover, purchase, review |
| rabbit_api_service | Social platform: communities, posts, comments, voting |
| notification_service | Multi-channel: in-app, email, push, SMS notifications |
| workflow_service | Visual workflow builder, execution engine, event sourcing |
| crypto_service | Wallet management, token economics, payment processing |
| storage_service | S3-compatible file storage with presigned URLs |
| sandbox_runner_service | Docker-isolated code execution, multi-language sandboxes |
| ed_service / ide_service | Cloud IDE, file management, terminal, execution environments |
| + 8 more | Content moderation, search, analytics, health, config, etc. |

### Frontend — React + TypeScript
- **662 React components** across 85+ routes
- **Vite** build system with code splitting and lazy loading
- **CSS Modules** for scoped styling
- **Three.js** for 3D visualizations (Hash Sphere, Memory Universe)
- **React Helmet** for dynamic SEO meta tags
- **Stripe Elements** for payment UI

### Infrastructure
- **Docker Compose** — 33 containers on a unified bridge network
- **Nginx** — Reverse proxy with SSL termination, static file serving
- **PostgreSQL** — Primary database with multi-service schema isolation
- **Redis** — Caching, session storage, rate limiting
- **DigitalOcean** — Single droplet deployment (scales to Kubernetes)

---

## Tech Stack

### Languages & Frameworks
Python, TypeScript, JavaScript, SQL, CSS, HTML, Bash, YAML, Dockerfile

### Backend
FastAPI, SQLAlchemy, Alembic, Pydantic, Celery, Redis, PostgreSQL, asyncio, aiohttp, httpx, WebSockets, JWT (PyJWT), bcrypt, TOTP (pyotp), Stripe SDK, Docker, Nginx, Gunicorn, Uvicorn

### Frontend
React 18, TypeScript, Vite, React Router v6, Zustand, React Helmet Async, Three.js, D3.js, Lucide Icons, CSS Modules, Stripe Elements, Monaco Editor, Markdown-it, Highlight.js

### AI / ML
OpenAI SDK, Anthropic SDK, Google Generative AI, Groq SDK, Mistral AI, Cohere SDK, Ollama, LangChain (selective), sentence-transformers, scikit-learn, NumPy, PyTorch

### DevOps & Infrastructure
Docker, Docker Compose, Nginx, Certbot (Let's Encrypt), GitHub Actions, SSH, rsync, systemd, DigitalOcean

---

## Platform Statistics (Verified by Code Visualizer)

| Metric | Count |
|--------|-------|
| Total lines of code | ~550,000 |
| Python backend lines | ~310,000 |
| TypeScript/React frontend lines | ~240,000 |
| Backend microservices | 30 |
| React components | 662 |
| Frontend routes | 85+ |
| API endpoints | 4,384 |
| Database tables | 120+ |
| Docker containers | 33 |
| Proprietary IP systems | 9 |
| AI skills (auto-detected) | 9 |
| LLM providers | 7 |

---

## Who Built This

**Louie Nemesh** — Founder & Lead Engineer at DevSwat.

Built the entire platform solo in under 4 months using DevSwat's own agentic workflows — the ultimate proof-of-concept. Every line of code, every system design, every deployment decision.

- **LinkedIn**: [linkedin.com/company/devswat](https://www.linkedin.com/company/devswat/)
- **YouTube**: [youtube.com/@DevSwat](https://www.youtube.com/@DevSwat)
- **X (Twitter)**: [x.com/devswat](https://x.com/devswat)
- **Reddit**: [reddit.com/u/DevSwat](https://www.reddit.com/u/DevSwat/)
- **Email**: [contact@dev-swat.com](mailto:contact@dev-swat.com)

---

## Acquisition & Licensing

DevSwat is **production-deployed and available for acquisition**.

### Deal Structures Available
- **Full acquisition** — Complete platform, all IP, all code
- **Partial stake + revenue share** — Co-ownership with aligned incentives
- **White-label licensing** — License the platform for your brand/vertical
- **Technology licensing** — License individual IP systems (Hash Sphere, DSID-P, Code Visualizer, etc.)

### Ideal Buyers
- **AI agencies / dev shops** — White-label the platform for your clients
- **SaaS companies adding AI** — Skip 18+ months of infrastructure build
- **Enterprise ISVs** — Plug-in agent orchestration with governance and audit trails
- **Technical founders** — Buy the infrastructure, focus on your vertical
- **AI infrastructure / MLOps companies** — Unique IP: 68-module pipeline, custom blockchain, physics engine

### Why It's Worth It
- **Replacement cost**: $2M–$5M+ (18–24 months with a senior team)
- **Built in 4 months** by one engineer using the platform's own tools
- **Production-ready** — Not a prototype. Live with 178 users.
- **Zero vendor lock-in** — Self-hosted, Docker Compose, Kubernetes-ready
- **All original code** — No forks, no wrappers, no dependencies on third-party SaaS for core functionality

---

## Live Demo & Links

| Resource | URL |
|----------|-----|
| **Live Platform** | [dev-swat.com](https://dev-swat.com) |
| **Investor Pitch Deck** | [dev-swat.com/investor-pitch-deck](https://dev-swat.com/investor-pitch-deck) |
| **Pricing** | [dev-swat.com/pricing](https://dev-swat.com/pricing) |
| **API Documentation** | [dev-swat.com/api/docs](https://dev-swat.com/api/docs) |
| **Code Visualizer** | [dev-swat.com/code-visualizer](https://dev-swat.com/code-visualizer) |
| **Hash Sphere Demo** | [dev-swat.com/state-physics](https://dev-swat.com/state-physics) |
| **Memory Universe** | [dev-swat.com/resonant-memory](https://dev-swat.com/resonant-memory) |
| **Help Center** | [dev-swat.com/help](https://dev-swat.com/help) |
| **Enterprise** | [dev-swat.com/enterprise](https://dev-swat.com/enterprise) |
| **Community** | [dev-swat.com/community](https://dev-swat.com/community) |
| **Contact** | [dev-swat.com/contact](https://dev-swat.com/contact) |
| **Mirror Domain** | [dev-swat.com](https://dev-swat.com) |

---

## Keywords & Topics

`agentic AI` `autonomous agents` `multi-agent orchestration` `AI SaaS platform` `agent infrastructure` `LLM orchestration` `AI governance` `AI safety` `AI compliance` `hallucination detection` `evidence graphs` `semantic memory` `physics-based state management` `custom blockchain` `DSID-P protocol` `code visualizer` `dependency graph analysis` `AI agent marketplace` `Stripe AI billing` `multi-tenant RBAC` `enterprise AI` `self-hosted AI` `Kubernetes AI` `Docker AI deployment` `FastAPI microservices` `React TypeScript` `Three.js visualization` `OpenAI GPT-4` `Anthropic Claude` `Google Gemini` `Groq LLaMA` `Mistral AI` `Cohere Command` `Ollama local LLM` `LangChain alternative` `CrewAI alternative` `AutoGen alternative` `AI agent framework` `production AI platform` `full-stack AI` `Louie Nemesh` `DevSwat` `dev-swat` `resonant genesis` `AI startup acquisition`

---

<p align="center">
  <strong>Built with determination by <a href="https://www.linkedin.com/company/devswat/">Louie Nemesh</a></strong><br/>
  <a href="https://dev-swat.com">dev-swat.com</a> &bull; <a href="https://dev-swat.com">dev-swat.com</a>
</p>
