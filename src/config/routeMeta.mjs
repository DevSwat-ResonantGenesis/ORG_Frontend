/**
 * Single source of truth for per-route <title>/description.
 *
 * Both the React pages (via Helmet) and scripts/inject-og-pages.mjs (which bakes
 * these into prerendered static HTML for non-JS crawlers) import from here, so a
 * route's SEO copy can only be edited in one place.
 *
 * Plain .mjs (not .ts) so the plain Node build script can import it directly
 * without a TypeScript compile step.
 */

export const ROUTE_META = {
  '/pricing': { title: 'Pricing – DevSwat', description: 'Free tier to get started, Plus for power users, Enterprise for teams. Build, run, and schedule AI agents. DevSwat IDE, Code Visualizer, OpenClaw — all included.' },
  '/consulting-workshop/intake': { title: 'Consulting Workshop Intake – DevSwat', description: 'Product & Architecture Discovery Consulting Workshop. Elite, high-touch architectural intervention to de-risk your foundation before full-scale development.' },
  '/consulting-workshop/payment': { title: 'Consulting Workshop Payment – DevSwat', description: 'Complete your consulting workshop purchase. 6-week execution framework with pre-research diagnostics, live workshop sprints, and 30 days of dedicated advisory.' },
  '/contact': { title: 'Contact – DevSwat', description: 'Get in touch with the DevSwat team. Enterprise inquiries, partnership opportunities, or technical questions about the agentic AI infrastructure.' },
  '/signup': { title: 'Sign Up – DevSwat', description: 'Create your free DevSwat account. Build and run AI agents, use the DevSwat IDE, and scan code with Code Visualizer.' },
  '/login': { title: 'Log In – DevSwat', description: 'Log in to DevSwat. Access your agents, IDE projects, and Code Visualizer scans.' },
  '/code-visualizer': { title: 'Code Visualizer – DevSwat', description: 'AST/SAST code analysis for any repository. Dependency graphs, function tracing, dead code detection, governance reports, and AI-powered code reviews.' },
  '/resonant-memory': { title: 'Resonant Memory — 3D Hash-Sphere Visualizer | DevSwat', description: 'Explore your AI memory as a living 12-D hash-sphere in 3D — gravity wells, emergent anchors, and the associative mesh, rendered in real time. Part of Resonant Memory.' },
  '/api/docs': { title: 'API Documentation – DevSwat', description: 'Complete API reference for DevSwat: authentication, agents, IDE, billing, memory, code analysis, and all platform endpoints.' },
  '/help': { title: 'Help Center – DevSwat', description: 'Documentation, guides, and FAQs for DevSwat: getting started, agent building, IDE setup, Code Visualizer, memory systems, and API reference.' },
  '/about': { title: 'About DevSwat — Agentic AI Infrastructure Built by One Engineer', description: 'Full-stack agentic AI platform built from scratch by Louie Nemesh. 7 proprietary IP systems, ~550K lines of code. AI agents, IDE, governance, smart routing. Production-deployed at dev-swat.com.' },
  '/technology': { title: 'Technology — DevSwat Architecture, Agent Runtime, AI Infrastructure', description: 'Full-stack AI infrastructure: RARA governance, 137-tool federated agent runtime, personalized chat intelligence, smart routing, and semantic memory.' },
  '/open-source': { title: 'Open Source — DevSwat GitHub Repos, OpenClaw', description: 'DevSwat open-source repositories on GitHub, including OpenClaw, the local-first federated agent connector. Auditable, source-available code.' },
  '/download-ide': { title: 'Download IDE – DevSwat', description: 'Download the DevSwat IDE. AI-powered code editor with 66 tools, code execution intelligence, terminal, and live preview. macOS, Linux, Windows.' },
  '/download-openclaw': { title: 'Download OpenClaw – DevSwat', description: 'Download OpenClaw, the local-first federated agent connector. 137 tools, privacy-first execution on YOUR machine. Self-creating tools via LLM + AST safety scan.' },
  '/enterprise': { title: 'Enterprise — Self-Hosted Agentic AI Infrastructure | DevSwat', description: 'Self-hosted deployment, RARA governance, SOC2/EU AI Act compliance, custom agent pipelines, dedicated support. Enterprise AI infrastructure with custom pricing.' },
  '/careers': { title: 'Careers at DevSwat — Build the Future of AI Infrastructure', description: 'Join DevSwat. Work on AI agent infrastructure and a full AI IDE. Python, FastAPI, React, Docker.' },
  '/products/ai-agents': { title: 'AI Agents — Build, Run & Schedule Autonomous Agents | DevSwat', description: 'Build, run, and schedule autonomous AI agents. Multi-agent orchestration with voting, debate, chain protocols. 30+ tools. Agent Architect.' },
  '/products/ide': { title: 'DevSwat IDE — AI-Powered Code Editor with 66 Tools', description: 'AI-powered code editor with code execution intelligence, 66 tools, terminal, live preview. Desktop app for macOS, Linux, Windows.' },
  '/products/code-analysis': { title: 'Code Visualizer — AST/SAST Analysis, Dependency Graphs | DevSwat', description: 'AST/SAST code analysis for Python, JS, TS. GitHub scanning, dependency graphs, dead code detection, governance reports.' },
  '/products/openclaw': { title: 'OpenClaw — 137-Tool Local-First AI Agent Connector | DevSwat', description: '137 tools, 15 categories. Tools run locally on YOUR machine. Self-creating tools via LLM + AST safety scan.' },
  '/products/memory': { title: 'Resonant Memory — Physics-Informed, Immutable AI Memory API | DevSwat', description: 'The world\'s first physics-informed, immutable, sovereign AI memory. 12-D hash-sphere retrieval with gravity ranking, emergent anchors, associative mesh, cross-encoder reranking, multi-hop fact graph and temporal reasoning. Cryptographically hashed, encrypted, isolated per user/agent/org. API + SDK, pay-per-call.' },
  '/products/chat': { title: 'ResonantChat — Personalized AI Chat Intelligence with Smart Routing | DevSwat', description: 'Personalized chat intelligence with hallucination detection, evidence graphs, neural skill classification, smart routing, unlimited LLM providers.' },
  '/products/governance': { title: 'RARA Governance — AI Safety, Kill Switch, Compliance | DevSwat', description: 'Invariant enforcement, capability decay, kill switch, atomic mutations with rollback, EU AI Act/SOC2 compliance.' },
  '/products/neural-routing': { title: 'Neural Routing — ML Skill Classifier & Multi-Agent Selection | DevSwat', description: 'Trained MLP classifier routes messages to 14 specialized skills in ~5ms. Active learning. PostgreSQL persistence.' },
  '/use-cases/developers': { title: 'DevSwat for Developers — AI Pair Programming, Agents & Code Analysis', description: 'AI-powered IDE with DevSwat AI intelligence, autonomous agents, AST/SAST scanning, 9-layer semantic memory, smart routing, unlimited LLM providers.' },
  '/use-cases/teams': { title: 'DevSwat for Teams — Multi-Agent Collaboration & Governance', description: 'Multi-agent orchestration, shared memory, RARA governance, role-based access, audit trails.' },
  '/use-cases/security': { title: 'DevSwat for Security — SAST Scanning, Governance & Compliance', description: 'AST/SAST scanning, RARA governance, immutable audit trails, EU AI Act/SOC2 compliance profiles.' },
  '/use-cases/automation': { title: 'DevSwat for Automation — Scheduled Agents, Webhooks & Workflows', description: 'Scheduled AI agents, webhook triggers, visual workflows, Gmail/Slack integrations, governed execution.' },
  '/compare/devswat-vs-cursor': { title: 'DevSwat vs Cursor — AI IDE Comparison 2026', description: 'Feature comparison: agents, SAST, memory vs AI autocomplete.' },
  '/compare/devswat-vs-windsurf': { title: 'DevSwat vs Windsurf — AI IDE & Platform Comparison 2026', description: 'Both have agentic coding. DevSwat adds a full agent platform, SAST, and governance.' },
  '/compare/devswat-vs-chatgpt': { title: 'DevSwat vs ChatGPT — AI Platform Comparison 2026', description: 'Chat assistant vs full agentic infrastructure: agents, IDE, SAST, governance.' },
  '/compare/devswat-vs-replit': { title: 'DevSwat vs Replit — AI Development Platform Comparison 2026', description: 'Cloud IDE vs full AI infrastructure: agents, SAST, governance.' },
  '/docs/architecture': { title: 'Architecture — Platform Infrastructure & Service Topology | DevSwat Docs', description: 'Full-stack AI agent infrastructure. Governance, smart routing, memory, IDE. Technical deep dive.' },
  '/docs/agent-api': { title: 'Agent API Reference — Create, Run & Schedule Agents | DevSwat Docs', description: 'REST API for creating, running, scheduling, and managing autonomous AI agents.' },
  '/docs/governance-protocol': { title: 'Governance Protocol — RARA Invariants, Capability Grammar | DevSwat Docs', description: 'Invariant classes, capability grammar, trust scoring, mutation executor.' },
  '/docs/neural-routing': { title: 'Neural Routing Docs — MLP Classifier Architecture & Training | DevSwat Docs', description: 'MLP architecture, training pipeline, active learning, PostgreSQL persistence.' },
  '/integrations': { title: 'Integrations — Unlimited LLM Providers, Platform Connectors, OAuth | DevSwat', description: 'Connect any LLM provider and any external platform. Google Drive, Gmail, Slack, Calendar, Figma, Stripe. Unlimited.' },
  '/blog': { title: 'Blog — Engineering, AI Research & Platform Updates | DevSwat', description: 'Deep dives into agentic AI, neural routing, governance, and platform architecture.' },
  '/changelog': { title: 'Changelog — Platform Updates & Release History | DevSwat', description: 'All platform updates, new features, bug fixes, and improvements.' },
  '/security': { title: 'Security — Encryption, Auth, Governance & Compliance | DevSwat', description: 'JWT/MFA auth, AES encryption, tamper-evident audit trails, RARA governance, compliance.' },
  '/privacy': { title: 'Privacy Policy | DevSwat', description: 'How we collect, use, and protect your data. Per-user AES encryption, local-first tools.' },
  '/terms': { title: 'Terms of Service | DevSwat', description: 'Platform usage terms, account responsibilities, pricing, intellectual property.' },
  '/community': { title: 'Community — Open Source & Developers | DevSwat', description: 'Open source, developer forums, contributor opportunities.' },
};
