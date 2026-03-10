import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import styles from './InvestorPitchDeckPage.module.css';

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const TOC_ITEMS = [
  { id: 'summary', label: '01 — Executive Summary' },
  { id: 'scale', label: '02 — Platform Scale' },
  { id: 'architecture', label: '03 — Architecture' },
  { id: 'products', label: '04 — Core Products' },
  { id: 'services', label: '05 — All 30 Backend Services' },
  { id: 'frontend', label: '06 — Frontend (85+ Pages)' },
  { id: 'stack', label: '07 — Technology Stack' },
  { id: 'ip', label: '08 — Unique Intellectual Property' },
  { id: 'monetization', label: '09 — Monetization Infrastructure' },
  { id: 'infrastructure', label: '10 — Infrastructure & Deployment' },
  { id: 'security', label: '11 — Security' },
  { id: 'contact', label: '12 — Acquisition Inquiry' },
];

const SERVICES = [
  { name: 'Auth Service', desc: 'User authentication, OAuth (Google/GitHub), MFA (TOTP), JWT tokens, session management, organization & role management, agent configuration, API key encryption (AES)', tags: ['10 DB tables', '80+ endpoints', 'FastAPI'] },
  { name: 'Billing Service', desc: 'Stripe subscriptions, credit system, usage tracking, invoicing, payment methods, pricing plans, checkout sessions, webhooks, admin stats, revenue reporting', tags: ['8 DB tables', '45+ endpoints', 'Stripe'] },
  { name: 'Chat Service', desc: 'Multi-provider AI chat engine with 68 intelligence modules: hallucination detection, evidence graphs, RAG, agent chaining, debate engine, autonomous planning, knowledge base, sentiment analysis', tags: ['8 DB tables', '40+ endpoints', '68 modules'], color: 'green' },
  { name: 'LLM Service', desc: 'Unified LLM provider abstraction with automatic failover across OpenAI, Anthropic, Ollama. User API key passthrough, streaming SSE, context adaptation between provider formats', tags: ['5+ endpoints', 'Multi-provider'] },
  { name: 'Agent Engine Service', desc: 'Autonomous agent creation, versioning, execution, team management, multi-step planning, tool definitions, safety rules, economic configs, marketplace rental', tags: ['13 DB tables', 'Full CRUD', 'FastAPI'] },
  { name: 'Memory Service', desc: 'Persistent semantic memory with embedding vectors, chunking, anchoring, resonance clustering, similarity search, importance scoring, decay rates', tags: ['5 DB tables', 'Embeddings'] },
  { name: 'User Memory Service', desc: 'Per-user semantic memory universe with 3D visualization, embedding-based retrieval, clustering, archiving, and full universe state export', tags: ['4 models', 'Semantic space'] },
  { name: 'Blockchain Service', desc: 'DSID-P (Decentralized State Identity Protocol): immutable hash anchoring, block creation, transaction graphs, merkle roots, audit trail, state snapshots', tags: ['8 DB tables', 'Custom protocol'] },
  { name: 'Code Visualizer Service', desc: 'GitHub repo scanning, interactive dependency graphs, function tracing, governance reports, AI code review, codebase comparison, persistent saved analyses with storage limits', tags: ['20+ endpoints', 'Persistence', 'SQLAlchemy'], color: 'green' },
  { name: 'V8 API Service', desc: 'Custom PyTorch-based ML engine: token embedding to 3D resonance coordinates (x,y,z) with spin and energy. Vocabulary management, corpus retraining, spatial cluster classification', tags: ['Flask', 'PyTorch', 'Three.js'] },
  { name: 'State Physics Service', desc: 'Hash Sphere: physics-based state management with 3D nodes (position, velocity, mass, charge, spin), force edges (attraction/repulsion/resonance/gravity), invariant verification', tags: ['6 models', 'Physics engine'] },
  { name: 'RARA Service', desc: 'Resonant Autonomous Runtime Architecture: governance layer for autonomous agent operations. Capability manifests, mutation proposals, agent budgets, governance decisions, explainability artifacts', tags: ['9 capabilities', 'Governance'] },
  { name: 'Marketplace Service', desc: 'Agent marketplace: publish, discover, purchase, review AI agents. Publisher profiles, usage stats, category taxonomy, version management', tags: ['7 DB tables', 'Full CRUD'] },
  { name: 'Workflow Service', desc: 'Visual workflow builder: create, run, monitor multi-step automated workflows. Event sourcing, step results, cancellation, event publishing', tags: ['4 DB tables', 'Event sourcing'] },
  { name: 'Notification Service', desc: 'Multi-channel notification delivery: in-app, email, push, SMS. System, billing, security, agent, team, social, marketing notification types', tags: ['2 DB tables', '7 types'] },
  { name: 'ML Service', desc: 'Machine learning model registry, training job management, inference endpoints, owner vocabulary, anchor terms, forbidden words, training datasets', tags: ['9 DB tables', 'MLOps'] },
  { name: 'Cognitive Service', desc: 'Cognitive monitoring: anomaly detection, clustering, workflow triggering based on system patterns. Periodic tick sampling, severity tracking', tags: ['5 DB tables', 'Anomaly detection'] },
  { name: 'Crypto Service', desc: 'Cryptocurrency wallet management, token economics, payment processing. Wallets, transactions, token allocations, receipts, funding sources, withdrawal queue', tags: ['8 DB tables', 'Token economics'] },
  { name: 'Storage Service', desc: 'S3-compatible file storage abstraction: upload, download, batch upload, presigned URLs, bucket management, file metadata', tags: ['REST API', 'S3-compatible'] },
  { name: 'Gateway', desc: 'Central API gateway: reverse proxy, JWT auth middleware, WebSocket support, rate limiting, public path exemptions, system analytics, connection pooling (asyncpg)', tags: ['4,073 lines', 'Middleware'], color: 'amber' },
  { name: 'ED Service', desc: 'Execution/deployment environment: execution sessions, agent instances, workspace file management, action logging, tool definitions', tags: ['7 DB tables'] },
  { name: 'IDE Service', desc: 'Web-based IDE functionality: file management, terminal access, AI-assisted code editing, project workspace management', tags: ['Web IDE'] },
  { name: 'Build Service', desc: 'Project build system: compiles and packages user projects for deployment', tags: ['Build pipeline'] },
  { name: 'Code Execution Service', desc: 'Sandboxed multi-language code execution: terminal, code execute, preview start/stop, supported language list', tags: ['Multi-language', 'Sandbox'] },
  { name: 'Sandbox Runner Service', desc: 'Docker-based sandbox for secure code execution and sandboxed HTTP requests', tags: ['Docker isolation'] },
  { name: 'User Service', desc: 'Additional user profile management separate from auth: profile data, preferences, settings', tags: ['Profile management'] },
  { name: 'Rabbit API Service', desc: 'Social platform: Reddit-like communities, posts, comments, threaded replies, upvote/downvote voting. 4 sub-services for content, community, votes, moderation', tags: ['4 DB tables', '4 sub-services'] },
  { name: 'Rabbit Content Service', desc: 'Content moderation and management for the Rabbit social platform', tags: ['Moderation'] },
  { name: 'Rabbit Community Service', desc: 'Community management: creation, membership, settings for Rabbit social platform', tags: ['Community'] },
  { name: 'Rabbit Vote Service', desc: 'Vote aggregation and scoring for Rabbit social platform posts and comments', tags: ['Voting'] },
];

const IP_ITEMS = [
  { title: 'ResonantChat Intelligence Pipeline', desc: '68 service modules creating a multi-agent AI chat system with evidence graphs, hallucination detection, cross-validation, causal reasoning, debate engine, personality DNA, autonomous planning, and multi-provider failover. Not a ChatGPT wrapper.' },
  { title: 'Code Visualizer Engine', desc: 'Full code analysis engine: scans GitHub repos, generates interactive dependency graphs, traces function calls, produces governance reports, AI-powered code reviews. Persistent storage with per-user limits.' },
  { title: 'DSID-P Protocol', desc: 'Decentralized State Identity Protocol: custom blockchain-like system for immutable hash anchoring, audit trails, merkle roots, and cryptographic state verification.' },
  { title: 'Hash Sphere / State Physics', desc: 'Physics-based state management using 3D coordinates, forces (attraction/repulsion/resonance/gravity/electromagnetic), spin, energy, and conservation invariants. Unique concept.' },
  { title: 'Modular Skill System', desc: '9 built-in chat skills with auto-detection from message intent: Code Visualizer, Web Search, Image Generation, Memory Search, Memory Library, Agents OS, State Physics, IDE Workspace, Rabbit Post.' },
  { title: 'Multi-Agent Orchestration', desc: 'Agent voting, debate engine, chaining, team composition, autonomous planning with error correction, self-improving agents, A/B testing, dynamic team composition.' },
  { title: 'Semantic Memory Universe', desc: 'Per-user semantic memory space with embedding-based retrieval, clustering, anchoring, decay rates, importance scoring, and 3D visualization of the memory graph.' },
  { title: 'Full SaaS Billing Stack', desc: 'Credits + Stripe subscriptions + usage tracking + marketplace purchases + referral system (5,000/2,000 credits). Complete monetization infrastructure with per-operation cost tracking.' },
  { title: 'Multi-Tenant Architecture', desc: 'Organizations with roles (admin, member, owner, platform_owner), per-org API keys, plan-based feature gating, role-based route protection, enterprise control plane.' },
];

const InvestorPitchDeckPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const savedTheme = useRef(theme);

  useEffect(() => {
    savedTheme.current = useThemeStore.getState().theme;
    if (savedTheme.current !== 'dark') setTheme('dark');
    document.body.classList.add('pitch-deck-active');
    window.scrollTo(0, 0);
    return () => {
      if (savedTheme.current !== 'dark') setTheme(savedTheme.current);
      document.body.classList.remove('pitch-deck-active');
    };
  }, []);

  return (
    <div className={styles.wpPage}>
      <Helmet>
        <title>Technical Whitepaper & Acquisition Brief – ResonantGenesis</title>
        <meta name="description" content="ResonantGenesis: 685K-line full-stack Agentic AI platform. 30 microservices, 85+ pages, production-deployed. Technical whitepaper for acquisition." />
        <link rel="canonical" href="https://resonantgenesis.xyz/investor-pitch-deck" />
        <link rel="preload" as="image" href="/images/investorpitch/VR1.jpg" />
      </Helmet>

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section className={styles.wpHero}>
        <img src="/images/investorpitch/VR1.jpg" alt="ResonantGenesis platform" className={styles.wpHeroImage} />
        <div className={styles.wpHeroGrad} />
        <div className={styles.wpHeroContent}>
          <div className={styles.wpHeroBadge}>Sovereign Infrastructure for Autonomous Agents</div>
          <h1 className={styles.wpHeroTitle}>ResonantGenesis</h1>
          <p className={styles.wpHeroSub}>
            Governed memory, invariant-based constraint simulation, and full-stack observability—so teams can ship agentic products that are safe, auditable, and controllable.
          </p>
          <div className={styles.wpHeroCards}>
            <div className={styles.wpHeroCard}>
              <h3 className={styles.wpHeroCardTitle}>Governed Memory</h3>
              <p className={styles.wpHeroCardBody}>Encrypted, attributable, retrievable</p>
            </div>
            <div className={styles.wpHeroCard}>
              <h3 className={styles.wpHeroCardTitle}>Constraints SIM</h3>
              <p className={styles.wpHeroCardBody}>Invariants for actions and risk</p>
            </div>
            <div className={styles.wpHeroCard}>
              <h3 className={styles.wpHeroCardTitle}>Evidence Graphs</h3>
              <p className={styles.wpHeroCardBody}>Explainability & audit trails</p>
            </div>
          </div>
        </div>
        <div className={styles.wpScrollHint}>Scroll to explore</div>
      </section>

      {/* ═══════════════════════════════ BODY ═══════════════════════════════ */}
      <div className={styles.wpBody}>

        {/* ── 01 EXECUTIVE SUMMARY ── */}
        <section className={styles.wpSection} id="summary">
          <div className={styles.wpInner}>
            <div className={styles.wpToc}>
              <p className={styles.wpTocTitle}>Table of Contents</p>
              <ul className={styles.wpTocList}>
                {TOC_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button className={styles.wpTocItem} onClick={() => scrollTo(item.id)} type="button">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <h2 className={styles.wpSectionTitle}>Executive Summary</h2>
            <p className={styles.wpSectionSub}>
              ResonantGenesis is a production-deployed, full-stack Agentic AI SaaS platform built as a microservices
              architecture with a React frontend. It provides multi-provider AI chat with a 68-module intelligence pipeline,
              autonomous agent creation and orchestration, code analysis tools, a custom physics-based state engine,
              blockchain-based identity anchoring, and a complete SaaS billing stack with Stripe integration.
            </p>
            
            <div className={styles.wpHeroMetrics}>
              <div className={styles.wpHeroMetricCard}>
                <p className={styles.wpHeroMetricVal}>685K</p>
                <p className={styles.wpHeroMetricLbl}>Lines of Code</p>
              </div>
              <div className={styles.wpHeroMetricCard}>
                <p className={styles.wpHeroMetricVal}>30</p>
                <p className={styles.wpHeroMetricLbl}>Microservices</p>
              </div>
              <div className={styles.wpHeroMetricCard}>
                <p className={styles.wpHeroMetricVal}>85+</p>
                <p className={styles.wpHeroMetricLbl}>Frontend Pages</p>
              </div>
              <div className={styles.wpHeroMetricCard}>
                <p className={styles.wpHeroMetricVal}>80+</p>
                <p className={styles.wpHeroMetricLbl}>Database Tables</p>
              </div>
            </div>
            <p className={styles.wpText}>
              The platform is live at <span className={styles.wpHighlight}>dev-swat.com</span> with{' '}
              <span className={styles.wpHighlight}>178 registered users</span> and{' '}
              <span className={styles.wpHighlight}>33 Docker containers</span> running in production on
              DigitalOcean infrastructure. Every component described in this document is implemented in code
              and deployed &mdash; this is not a prototype or mockup.
            </p>
          </div>
        </section>

        {/* ── 02 PLATFORM SCALE ── */}
        <section className={`${styles.wpSection} ${styles.wpSectionAlt}`} id="scale">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>Platform Scale</h2>
            <p className={styles.wpSectionSub}>Quantitative metrics from the live codebase.</p>
            <div className={styles.wpMetricGrid}>
              {[
                { val: '271,785', lbl: 'Backend Python Lines' },
                { val: '284,423', lbl: 'Frontend TypeScript/TSX Lines' },
                { val: '129,328', lbl: 'Frontend CSS Lines' },
                { val: '843', lbl: 'Backend Python Files' },
                { val: '662', lbl: 'React Components (TSX)' },
                { val: '97', lbl: 'Frontend API Client Files' },
                { val: '30', lbl: 'Backend Microservices' },
                { val: '33', lbl: 'Docker Containers' },
                { val: '80+', lbl: 'PostgreSQL Database Tables' },
                { val: '14', lbl: 'Services with Alembic Migrations' },
                { val: '300+', lbl: 'REST API Endpoints' },
                { val: '178', lbl: 'Registered Users (Production)' },
              ].map((m) => (
                <div className={styles.wpMetricCard} key={m.lbl}>
                  <p className={styles.wpMetricValue}>{m.val}</p>
                  <p className={styles.wpMetricLabel}>{m.lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 ARCHITECTURE ── */}
        <section className={styles.wpSection} id="architecture">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>Architecture</h2>
            <p className={styles.wpSectionSub}>
              Microservices architecture with central API Gateway. All backend services are Python FastAPI
              (except V8 Engine which uses Flask). Frontend is React 18 with TypeScript. All services are
              containerized with Docker and orchestrated via Docker Compose.
            </p>
            <div className={styles.wpArchBox}>
{`Browser (HTTPS)
    ↓
Nginx (SSL termination + static files)
    ↓
API Gateway :8001 (FastAPI)
  ├── Auth Middleware (JWT / API Key / Cookie validation)
  ├── Reverse Proxy (routes to internal services)
  └── WebSocket Proxy (real-time chat, provider status)
    ↓
Internal Services (Docker network: app-network)
  ├── auth_service      :8000    ├── billing_service   :8000
  ├── chat_service      :8000    ├── llm_service       :8000
  ├── agent_engine      :8000    ├── memory_service    :8000
  ├── blockchain        :8000    ├── code_visualizer   :8000
  ├── v8_api_service    :8093    ├── state_physics     :8000
  ├── marketplace       :8000    ├── workflow_service   :8000
  ├── notification      :8000    ├── cognitive_service  :8000
  ├── crypto_service    :8000    ├── ml_service        :8000
  ├── storage_service   :8000    ├── rara_service      :8000
  ├── rabbit_api        :8000    ├── user_memory       :8000
  ├── ide_service       :8000    ├── build_service     :8000
  ├── code_execution    :8000    ├── sandbox_runner    :8000
  └── + 8 more services
    ↓
PostgreSQL (DigitalOcean Managed) + Redis (shared cache/pub-sub)`}
            </div>
            <p className={styles.wpText}>
              All inter-service communication is HTTP over the Docker internal network.
              WebSocket connections are supported for real-time chat and LLM provider status monitoring.
              The Gateway handles JWT validation, API key verification, cookie-based auth, rate limiting,
              and public path exemptions for unauthenticated routes.
            </p>
          </div>
        </section>

        {/* ── 04 CORE PRODUCTS ── */}
        <section className={`${styles.wpSection} ${styles.wpSectionAlt}`} id="products">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>Core Products</h2>
            <p className={styles.wpSectionSub}>Six integrated products forming one platform ecosystem.</p>

            <div className={styles.cardsGrid}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>AGI Neural Hub</h3>
                <p className={styles.cardBody}>
                  Multi-provider AI chat (OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere) with automatic failover.
                  68 intelligence modules including hallucination detection, evidence graphs, cross-validation,
                  causal reasoning, debate engine, autonomous planning, RAG, knowledge base upload, and 9 auto-detected chat skills.
                  Bring-your-own API keys supported.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>AI Agent Studio</h3>
                <p className={styles.cardBody}>
                  Create, configure, and deploy autonomous agents with custom system prompts, model selection,
                  temperature controls, capability restrictions, and safety rules. Agent versioning, team composition,
                  chaining, voting, and marketplace rental. 13 database tables backing the agent engine.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>SAST & Code Visualizer</h3>
                <p className={styles.cardBody}>
                  GitHub repo scanning, interactive dependency graph generation, function call tracing,
                  governance/compliance reports, AI-powered code review, codebase comparison, merge analysis.
                  Persistent saved analyses with per-plan storage limits. 20+ API endpoints.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Hash Sphere & State Physics</h3>
                <p className={styles.cardBody}>
                  Physics-based state management engine representing system state as nodes in a 3D sphere.
                  Nodes have position, velocity, mass, charge, spin, energy. Edges with force types
                  (attraction, repulsion, resonance, gravity, electromagnetic). Conservation invariants.
                  Three.js 3D visualization in the frontend.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Resonant IDE</h3>
                <p className={styles.cardBody}>
                  In-browser development environment with file management, terminal access,
                  AI-assisted code editing, multi-language sandboxed code execution (Docker isolation),
                  project build pipeline, and preview functionality.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Agent Marketplace</h3>
                <p className={styles.cardBody}>
                  Publish, discover, purchase, and review AI agents. Publisher profiles, usage statistics,
                  category taxonomy, version management, rating/review system.
                  Revenue model through agent sales and rentals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── VR3 BREAK — Platform Workflow ── */}
        <section className={styles.wpVrBreak}>
          <img
            src="/images/investorpitch/VR3.jpg"
            alt="ResonantGenesis VR interface — street view coding"
            className={styles.wpVrBreakImage}
          />
          <div className={styles.wpVrWorkflowOverlay}>
            <div className={styles.workflowPanel}>
              <h2 className={styles.workflowTitle}>The Platform Workflow</h2>
              <p className={styles.workflowSubtitle}>One ecosystem. Every capability an AI team needs.</p>
              <div className={styles.workflowSteps}>
                {[
                  { num: '01', title: 'AGI Neural Hub', sub: 'Conversational AI that plans, reasons, and acts autonomously' },
                  { num: '02', title: 'AI Agent Studio', sub: 'Create, configure & deploy autonomous agents' },
                  { num: '03', title: 'SAST & Dependency Graph', sub: 'Full-stack architecture observability & remediation' },
                  { num: '04', title: 'Invariants SIM', sub: 'Constraint simulation & economic safety modeling' },
                  { num: '05', title: 'Resonant IDE', sub: 'In-browser development with split-view AI assistance' },
                  { num: '06', title: 'Marketplace', sub: 'Publish & monetize T3-verified agents' },
                ].map((step, i) => (
                  <React.Fragment key={step.num}>
                    {i > 0 && <div className={styles.workflowConnector} />}
                    <div className={styles.workflowStep} style={{ opacity: 1, transform: 'none' }}>
                      <span className={styles.workflowStepNum}>{step.num}</span>
                      <div className={styles.workflowStepBody}>
                        <strong>{step.title}</strong>
                        <span>{step.sub}</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 05 ALL 30 SERVICES ── */}
        <section className={styles.wpSection} id="services">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>All 30 Backend Services</h2>
            <p className={styles.wpSectionSub}>
              Every microservice in the platform with its purpose, database models, and endpoint count.
            </p>
            <div className={styles.wpServiceGrid}>
              {SERVICES.map((svc) => (
                <div className={styles.wpServiceCard} key={svc.name}>
                  <p className={styles.wpServiceName}>{svc.name}</p>
                  <p className={styles.wpServiceDesc}>{svc.desc}</p>
                  <div className={styles.wpServiceMeta}>
                    {svc.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`${styles.wpTag}${svc.color === 'green' ? ` ${styles.wpTagGreen}` : svc.color === 'amber' ? ` ${styles.wpTagAmber}` : ''}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 06 FRONTEND ── */}
        <section className={`${styles.wpSection} ${styles.wpSectionAlt}`} id="frontend">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>Frontend — 85+ Pages, 662 Components</h2>
            <p className={styles.wpSectionSub}>
              React 18 + TypeScript SPA built with Vite. CSS Modules for styling (129K lines). React Router v6 with
              lazy loading. Role-based route protection (ProtectedRoute, RoleRoute, OwnerProtectedRoute, PlanRestrictedRoute).
            </p>

            <h3 className={styles.wpSubTitle}>Page Categories</h3>
            <div className={styles.wpColumns}>
              <div>
                <p className={styles.wpText}><strong>Public Pages (15+)</strong></p>
                <ul className={styles.wpFeatureList}>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Landing, Pricing, Enterprise, Community, Contact</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Login, Signup, OAuth callback, MFA setup</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Password reset, Email verification</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> API Docs, DSID-P Protocol, Investor Pitch Deck</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Public validation tool, LLM scanner</li>
                </ul>
              </div>
              <div>
                <p className={styles.wpText}><strong>Authenticated Pages (35+)</strong></p>
                <ul className={styles.wpFeatureList}>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Resonant Chat (main AI interface)</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> 4 Dashboard variants (User, Plus, Enterprise, Owner)</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Agent OS, Agent Teams, Autonomous Agents</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Marketplace, Web IDE, Build, Code Visualizer</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Predictions, Evidence Graphs, AI Audit</li>
                </ul>
              </div>
            </div>
            <div className={styles.wpColumns}>
              <div>
                <p className={styles.wpText}><strong>Admin & Finance (10+)</strong></p>
                <ul className={styles.wpFeatureList}>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> System dashboard, User management, Feature flags</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Invoice management, Financial reports, Credits/Refunds</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Compliance, Audit logs, Policy management</li>
                </ul>
              </div>
              <div>
                <p className={styles.wpText}><strong>Enterprise Control Plane (9 pages)</strong></p>
                <ul className={styles.wpFeatureList}>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Semantic Explorer, Trust Dashboard</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Governance Center, Compliance Hub</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Security Monitor, Performance Dashboard</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Live Execution Monitor, Guided Scenarios</li>
                </ul>
              </div>
            </div>
            <div className={styles.wpColumns}>
              <div>
                <p className={styles.wpText}><strong>ML Ops (6 pages)</strong></p>
                <ul className={styles.wpFeatureList}>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Training jobs (list, create, detail)</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Model versions, Worker monitor, Evaluation drift</li>
                </ul>
              </div>
              <div>
                <p className={styles.wpText}><strong>Decentralized Network (6 pages)</strong></p>
                <ul className={styles.wpFeatureList}>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Agent browser, Publish, Marketplace</li>
                  <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Workflow designer, History, Templates</li>
                </ul>
              </div>
            </div>

            <h3 className={styles.wpSubTitle}>Frontend API Layer</h3>
            <p className={styles.wpText}>
              97 TypeScript API client files in <code>src/api/</code> mapping to each backend service.
              Multi-LLM provider support with dedicated clients for OpenAI, Anthropic, Groq, Gemini, Mistral,
              and Cohere with a unified router. Cookie-based auth with <code>credentials: &apos;include&apos;</code>.
            </p>
          </div>
        </section>

        {/* ── 07 TECHNOLOGY STACK ── */}
        <section className={styles.wpSection} id="stack">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>Technology Stack</h2>
            <p className={styles.wpSectionSub}>Complete technology inventory.</p>
            <table className={styles.wpTable}>
              <thead>
                <tr><th>Layer</th><th>Technology</th></tr>
              </thead>
              <tbody>
                {[
                  ['Frontend Framework', 'React 18 + TypeScript'],
                  ['Frontend Build', 'Vite'],
                  ['Frontend Styling', 'CSS Modules (129,328 lines)'],
                  ['Frontend 3D', 'Three.js (Hash Sphere, V8 visualization)'],
                  ['Frontend Router', 'React Router v6 (lazy loading)'],
                  ['Backend Framework', 'FastAPI (Python 3.11) — 29 services'],
                  ['V8 Engine', 'Flask + PyTorch'],
                  ['Database', 'PostgreSQL (DigitalOcean Managed)'],
                  ['Cache / Pub-Sub', 'Redis (shared instance)'],
                  ['ORM', 'SQLAlchemy 2.0 (async)'],
                  ['Direct DB Access', 'asyncpg (gateway connection pool)'],
                  ['Migrations', 'Alembic (14 services)'],
                  ['Containerization', 'Docker + Docker Compose (33 containers)'],
                  ['Web Server', 'Nginx (SSL termination, reverse proxy)'],
                  ['Payments', 'Stripe (checkout, webhooks, subscriptions, portal)'],
                  ['LLM Providers', 'OpenAI, Anthropic, Groq, Google Gemini, Mistral, Cohere, Ollama'],
                  ['OAuth Providers', 'Google, GitHub'],
                  ['ML Framework', 'PyTorch (V8 resonance engine)'],
                  ['Authentication', 'JWT + HttpOnly cookies + API keys (AES encrypted)'],
                  ['MFA', 'TOTP with backup codes'],
                ].map(([layer, tech]) => (
                  <tr key={layer}><td><strong>{layer}</strong></td><td>{tech}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 08 UNIQUE IP ── */}
        <section className={`${styles.wpSection} ${styles.wpSectionAlt}`} id="ip">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>Unique Intellectual Property</h2>
            <p className={styles.wpSectionSub}>
              10 proprietary systems and differentiating technologies verified in the codebase.
            </p>
            <div className={styles.wpIpGrid}>
              {IP_ITEMS.map((item, i) => (
                <div className={styles.wpIpCard} key={item.title}>
                  <p className={styles.wpIpNum}>{String(i + 1).padStart(2, '0')}</p>
                  <p className={styles.wpIpTitle}>{item.title}</p>
                  <p className={styles.wpIpDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VR2 BREAK — Thesis Quote ── */}
        <section className={styles.wpVrBreak}>
          <img
            src="/images/investorpitch/VR2.jpg"
            alt="ResonantGenesis VR interface — street view coding experience"
            className={styles.wpVrBreakImage}
          />
          <div className={styles.wpVrQuoteOverlay}>
            <p className={styles.wpVrQuoteText}>
              <strong>Thesis:</strong> The winners in agentic AI won&apos;t just have better models.
              They&apos;ll have better infrastructure&mdash;memory, constraints, and governance that can survive production.
            </p>
          </div>
        </section>

        {/* ── 09 MONETIZATION ── */}
        <section className={styles.wpSection} id="monetization">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>Monetization Infrastructure</h2>
            <p className={styles.wpSectionSub}>Complete billing stack ready for revenue from day one.</p>

            <h3 className={styles.wpSubTitle}>Revenue Streams (Code-Supported)</h3>
            <div className={styles.cardsGrid}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Subscription Plans</h3>
                <p className={styles.cardBody}>
                  Free / Plus / Pro / Enterprise tiers with Stripe recurring billing.
                  Stripe checkout sessions, customer portal, and webhook handling fully implemented.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Credit Packs</h3>
                <p className={styles.cardBody}>
                  One-time credit purchases via Stripe. Per-operation credit deduction tracked by service,
                  operation, tokens used, LLM provider, model, and latency.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Marketplace Sales</h3>
                <p className={styles.cardBody}>
                  Agent purchases and rentals through the marketplace. Publisher profiles with
                  usage statistics and review/rating system.
                </p>
              </div>
            </div>

            <h3 className={styles.wpSubTitle}>Credit System</h3>
            <ul className={styles.wpFeatureList}>
              <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Free tier: 1,000 credits on signup (tx_type: &quot;bonus&quot;)</li>
              <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Referral system: 5,000 credits for referrer, 2,000 for referred user</li>
              <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Period grants and rollover logic between billing cycles</li>
              <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Per-operation cost tracking by LLM provider and model</li>
              <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Revenue calculated only from Stripe-confirmed transactions (stripe_payment_intent_id)</li>
              <li className={styles.wpFeatureItem}><span className={styles.wpArrow}>&rarr;</span> Full transaction history, refunds, and admin stats endpoints</li>
            </ul>

            <h3 className={styles.wpSubTitle}>Billing Endpoints</h3>
            <p className={styles.wpText}>
              45+ REST API endpoints covering: subscription CRUD, credit balance/purchase/deduct/refund,
              usage recording/metrics/export, invoice management with PDF generation, Stripe webhook processing,
              payment method CRUD, billing portal, pricing plans, credit packs, admin statistics,
              and per-user billing dashboards.
            </p>
          </div>
        </section>

        {/* ── 10 INFRASTRUCTURE ── */}
        <section className={`${styles.wpSection} ${styles.wpSectionAlt}`} id="infrastructure">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>Infrastructure & Deployment</h2>
            <p className={styles.wpSectionSub}>Production deployment architecture.</p>

            <table className={styles.wpTable}>
              <thead>
                <tr><th>Component</th><th>Details</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Server</strong></td><td>DigitalOcean Droplet (designed for Kubernetes)</td></tr>
                <tr><td><strong>Database</strong></td><td>DigitalOcean Managed PostgreSQL — separate DATABASE_URL per service (database-per-service design)</td></tr>
                <tr><td><strong>Cache</strong></td><td>Redis shared instance for caching, sessions, pub-sub</td></tr>
                <tr><td><strong>Web Server</strong></td><td>Nginx — SSL termination, static file serving, reverse proxy to gateway:8001</td></tr>
                <tr><td><strong>Containers</strong></td><td>33 Docker containers via docker-compose.unified.yml</td></tr>
                <tr><td><strong>Health Checks</strong></td><td>HTTP GET /health on every service, restart: unless-stopped</td></tr>
                <tr><td><strong>Persistent Volumes</strong></td><td>v8_data, v8_model, build_projects, blockchain_node_data</td></tr>
                <tr><td><strong>Connection Pooling</strong></td><td>SQLAlchemy QueuePool (critical services, pool_size=1), NullPool (non-critical services)</td></tr>
                <tr><td><strong>Gateway Pool</strong></td><td>asyncpg pool (min=0, max=2) for direct DB queries</td></tr>
                <tr><td><strong>CI/CD</strong></td><td>GitHub Actions workflows present</td></tr>
                <tr><td><strong>Frontend Deploy</strong></td><td>npm run build → rsync to /var/www/frontend/ → nginx reload</td></tr>
                <tr><td><strong>Domain</strong></td><td>dev-swat.com (active, SSL)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 11 SECURITY ── */}
        <section className={styles.wpSection} id="security">
          <div className={styles.wpInner}>
            <h2 className={styles.wpSectionTitle}>Security</h2>
            <p className={styles.wpSectionSub}>Production security measures implemented in code.</p>
            <div className={styles.cardsGrid}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Authentication</h3>
                <p className={styles.cardBody}>
                  JWT access tokens with configurable expiry. HttpOnly secure cookies with SameSite=lax.
                  Refresh token rotation. API key authentication with AES-encrypted storage.
                  TOTP-based MFA with backup codes and trusted device management.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Access Control</h3>
                <p className={styles.cardBody}>
                  Role-based access (admin, member, owner, platform_owner). Plan-based feature gating
                  (free, plus, pro, enterprise). Gateway auth middleware validates every non-public request.
                  Separate superuser and unlimited_credits flags for granular permission control.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Protection</h3>
                <p className={styles.cardBody}>
                  Rate limiting on auth endpoints (login, register, password reset, token refresh).
                  Account lockout after repeated failed logins. Bcrypt password hashing with strength validation.
                  CORS configuration per service. Docker-isolated code execution sandbox.
                  Audit logging with client IP and user-agent tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 12 CTA ── */}
        <section className={styles.wpCta} id="contact">
          <div className={styles.wpInner}>
            <h2 className={styles.wpCtaTitle}>Interested in Acquiring This Platform?</h2>
            <p className={styles.wpCtaBody}>
              685,000 lines of production code. 30 microservices. Complete SaaS infrastructure.
              Multiple unique IP assets. Ready for your team to scale.
            </p>
            <div className={styles.wpCtaButtons}>
              <button type="button" className={styles.ctaPrimary} onClick={() => navigate('/contact')}>
                <span>Contact for Acquisition</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
              <button type="button" className={styles.ctaSecondary} onClick={() => navigate('/signup')}>
                <span>Try the Platform</span>
                <span aria-hidden="true">&nearr;</span>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default InvestorPitchDeckPage;
