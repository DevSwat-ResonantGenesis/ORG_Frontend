/**
 * Post-build script: generates route-specific HTML files with correct OG meta tags.
 * Crawlers (iMessage, WhatsApp, Slack, Twitter, Facebook) don't execute JS,
 * so they need the OG tags in the raw HTML served by Nginx.
 *
 * Usage: node scripts/inject-og-pages.mjs (runs after vite build)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const OG_PAGES = [
  {
    route: '/pricing',
    title: 'Pricing – DevSwat',
    description: 'Free tier to get started, Plus for power users, Enterprise for teams. Build, run, and schedule AI agents. DevSwat IDE, Code Visualizer, Mining, OpenClaw — all included.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/pricing',
  },
  {
    route: '/contact',
    title: 'Contact – DevSwat',
    description: 'Get in touch with the DevSwat team. Enterprise inquiries, partnership opportunities, or technical questions about the agentic AI infrastructure.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/contact',
  },
  {
    route: '/signup',
    title: 'Sign Up – DevSwat',
    description: 'Create your free DevSwat account. Build and run AI agents, use the DevSwat IDE, scan code with Code Visualizer, and join the decentralized training network.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/signup',
  },
  {
    route: '/login',
    title: 'Log In – DevSwat',
    description: 'Log in to DevSwat. Access your agents, IDE projects, Code Visualizer scans, mining dashboard, and wallet.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/login',
  },
  {
    route: '/code-visualizer',
    title: 'Code Visualizer – DevSwat',
    description: 'AST/SAST code analysis for any repository. Dependency graphs, function tracing, dead code detection, governance reports, and AI-powered code reviews.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/code-visualizer',
  },
  {
    route: '/state-physics',
    title: 'Hash Sphere – Invariant Simulation – DevSwat',
    description: 'Interactive 3D invariant simulation engine. N-body physics with gravity, repulsion, entropy forces, and conservation constraints. Built with Three.js.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/state-physics',
  },
  {
    route: '/resonant-memory',
    title: 'Resonant Memory — 3D Hash-Sphere Visualizer | DevSwat',
    description: 'Explore your AI memory as a living 12-D hash-sphere in 3D — gravity wells, emergent anchors, and the associative mesh, rendered in real time. Part of Resonant Memory.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/resonant-memory',
  },
  {
    route: '/api/docs',
    title: 'API Documentation – DevSwat',
    description: 'Complete API reference for DevSwat: authentication, agents, IDE, billing, blockchain, memory, code analysis, mining, and all platform endpoints.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/api/docs',
  },
  {
    route: '/validate',
    title: 'Validation Tool – DevSwat',
    description: 'Validate AI outputs, check model compliance, and verify evidence chains. Built-in grounding checks and cross-reference validation.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/validate',
  },
  {
    route: '/llm-scan',
    title: 'LLM Scanner – DevSwat',
    description: 'Scan and compare LLM providers: OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere, Ollama. Benchmark latency, cost, quality, and capabilities.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/llm-scan',
  },
  {
    route: '/help',
    title: 'Help Center – DevSwat',
    description: 'Documentation, guides, and FAQs for DevSwat: getting started, agent building, IDE setup, Code Visualizer, mining, memory systems, and API reference.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/help',
  },
  {
    route: '/privacy-policy',
    title: 'Privacy Policy – DevSwat',
    description: 'How DevSwat collects, uses, and protects your data. Local-first architecture, OAuth integrations, data security, and your rights.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/privacy-policy',
  },
  {
    route: '/terms-of-service',
    title: 'Terms of Service – DevSwat',
    description: 'Terms governing use of the DevSwat platform, agent creation, IDE, mining, third-party integrations, and services.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/terms-of-service',
  },
  {
    route: '/state-physics-api',
    title: 'State Physics API – DevSwat',
    description: 'API documentation for the Hash Sphere invariant simulation engine. N-body physics, force-directed graphs, entropy injection, and conservation constraints.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/state-physics-api',
  },
  {
    route: '/about',
    title: 'About DevSwat — Agentic AI Infrastructure Built by One Engineer',
    description: 'Full-stack agentic AI platform built from scratch by Louie Nemesh. 9 proprietary IP systems, ~550K lines of code. AI agents, IDE, blockchain, mining, governance, smart routing. Production-deployed at dev-swat.com.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/about',
  },
  {
    route: '/technology',
    title: 'Technology — DevSwat Architecture, Blockchain, Mining, AI Infrastructure',
    description: 'Full-stack AI infrastructure: 3-blockchain architecture, pipeline-parallel LLM training, physics-based state engine, 137-tool federated agent runtime, personalized chat intelligence, smart routing, and governance.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/technology',
  },
  {
    route: '/open-source',
    title: 'Open Source — DevSwat GitHub Repos, Mining Client, OpenClaw, Blockchain',
    description: '7+ open-source repos on GitHub. AGPL-3.0 miner app, OpenClaw federated agent connector, sovereign blockchain with Raft consensus, Lighthouse P2P discovery. All auditable.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/open-source',
  },
  {
    route: '/download-miner',
    title: 'Download Miner – DevSwat',
    description: 'Download the DevSwat mining client. Train frontier LLMs on your GPU and earn $RGT tokens. Real PyTorch training with 1F1B pipeline parallelism. macOS, Linux, Windows.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/download-miner',
  },
  {
    route: '/download-ide',
    title: 'Download IDE – DevSwat',
    description: 'Download the DevSwat IDE. AI-powered code editor with 66 tools, code execution intelligence, terminal, and live preview. macOS, Linux, Windows.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/download-ide',
  },
  {
    route: '/download-openclaw',
    title: 'Download OpenClaw – DevSwat',
    description: 'Download OpenClaw, the local-first federated agent connector. 137 tools, privacy-first execution on YOUR machine. Self-creating tools via LLM + AST safety scan.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/download-openclaw',
  },
  {
    route: '/network',
    title: 'Network Dashboard – DevSwat',
    description: 'Monitor the DevSwat decentralized network. Mining stats, blockchain data, chain bridge credits, peer connections, and $RGT token transactions.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/network',
  },
  // Batch 1: Enterprise + Careers
  {
    route: '/enterprise',
    title: 'Enterprise — Self-Hosted Agentic AI Infrastructure | DevSwat',
    description: 'Self-hosted deployment, RARA governance, SOC2/EU AI Act compliance, custom agent pipelines, dedicated support. Enterprise AI infrastructure with custom pricing.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/enterprise',
  },
  {
    route: '/careers',
    title: 'Careers at DevSwat — Build the Future of AI Infrastructure',
    description: 'Join DevSwat. Work on AI agent infrastructure, 3 blockchains, decentralized LLM training, and a full AI IDE. Python, FastAPI, React, PyTorch, Docker.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/careers',
  },
  // Batch 2: Product Pages
  {
    route: '/products/ai-agents',
    title: 'AI Agents — Build, Run & Schedule Autonomous Agents | DevSwat',
    description: 'Build, run, and schedule autonomous AI agents. Multi-agent orchestration with voting, debate, chain protocols. 30+ tools. Agent Architect.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/ai-agents',
  },
  {
    route: '/products/ide',
    title: 'DevSwat IDE — AI-Powered Code Editor with 66 Tools',
    description: 'AI-powered code editor with code execution intelligence, 66 tools, terminal, live preview. Desktop app for macOS, Linux, Windows.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/ide',
  },
  {
    route: '/products/code-analysis',
    title: 'Code Visualizer — AST/SAST Analysis, Dependency Graphs | DevSwat',
    description: 'AST/SAST code analysis for Python, JS, TS. GitHub scanning, dependency graphs, dead code detection, governance reports.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/code-analysis',
  },
  {
    route: '/products/mining',
    title: 'Decentralized LLM Training — Mine AI Models & Earn $RGT | DevSwat',
    description: 'Real PyTorch GPU training. 1F1B pipeline parallelism, gradient compression, WebRTC P2P, 5-layer Proof-of-Training security.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/mining',
  },
  {
    route: '/products/openclaw',
    title: 'OpenClaw — 137-Tool Local-First AI Agent Connector | DevSwat',
    description: '137 tools, 15 categories. Tools run locally on YOUR machine. Self-creating tools via LLM + AST safety scan.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/openclaw',
  },
  {
    route: '/products/memory',
    title: 'Resonant Memory — Physics-Informed, Immutable AI Memory API | DevSwat',
    description: "The world's first physics-informed, immutable, sovereign AI memory. 12-D hash-sphere retrieval with gravity ranking, emergent anchors, associative mesh, cross-encoder reranking, multi-hop fact graph and temporal reasoning. On-chain, encrypted, isolated per user/agent/org. API + SDK, pay-per-call.",
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/memory',
  },
  {
    route: '/products/blockchain',
    title: 'Three-Blockchain Architecture — Audit, Training & Cross-Chain | DevSwat',
    description: 'Internal DSID-P audit chain, sovereign external chain with Raft consensus, and planned Base/ETH cross-chain bridge.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/blockchain',
  },
  {
    route: '/products/chat',
    title: 'ResonantChat — Personalized AI Chat Intelligence with Smart Routing | DevSwat',
    description: 'Personalized chat intelligence with hallucination detection, evidence graphs, neural skill classification, smart routing, unlimited LLM providers.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/chat',
  },
  {
    route: '/products/governance',
    title: 'RARA Governance — AI Safety, Kill Switch, Compliance | DevSwat',
    description: 'Invariant enforcement, capability decay, kill switch, atomic mutations with rollback, EU AI Act/SOC2 compliance.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/governance',
  },
  {
    route: '/products/state-physics',
    title: 'Hash Sphere — Physics-Based State Engine & N-Body Simulation | DevSwat',
    description: 'N-body simulation with gravity, repulsion, resonance forces. Conservation invariants. Three.js 3D visualization.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/state-physics',
  },
  {
    route: '/products/dsid',
    title: 'DSID-P — Decentralized State Identity Protocol | DevSwat',
    description: 'Custom blockchain protocol for agent identity, hash lineage tracking, merkle proofs, and Base Sepolia anchoring.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/dsid',
  },
  {
    route: '/products/crypto',
    title: '$RGT Token — Crypto Wallet & Mining Credits | DevSwat',
    description: 'Earn $RGT by training LLMs. Spend on IDE, agents, LLM APIs. 5-layer security. Halving schedule.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/crypto',
  },
  {
    route: '/products/neural-routing',
    title: 'Neural Routing — ML Skill Classifier & Multi-Agent Selection | DevSwat',
    description: 'Trained MLP classifier routes messages to 14 specialized skills in ~5ms. Active learning. PostgreSQL persistence.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/products/neural-routing',
  },
  // Batch 3: Use Cases + Comparisons
  {
    route: '/use-cases/developers',
    title: 'DevSwat for Developers — AI Pair Programming, Agents & Code Analysis',
    description: 'AI-powered IDE with DevSwat AI intelligence, autonomous agents, AST/SAST scanning, 9-layer semantic memory, smart routing, unlimited LLM providers.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/use-cases/developers',
  },
  {
    route: '/use-cases/teams',
    title: 'DevSwat for Teams — Multi-Agent Collaboration & Governance',
    description: 'Multi-agent orchestration, shared memory, RARA governance, role-based access, audit trails.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/use-cases/teams',
  },
  {
    route: '/use-cases/security',
    title: 'DevSwat for Security — SAST Scanning, Governance & Compliance',
    description: 'AST/SAST scanning, RARA governance, immutable audit chains, EU AI Act/SOC2 compliance profiles.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/use-cases/security',
  },
  {
    route: '/use-cases/automation',
    title: 'DevSwat for Automation — Scheduled Agents, Webhooks & Workflows',
    description: 'Scheduled AI agents, webhook triggers, visual workflows, Gmail/Slack integrations, governed execution.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/use-cases/automation',
  },
  {
    route: '/compare/devswat-vs-cursor',
    title: 'DevSwat vs Cursor — AI IDE Comparison 2026',
    description: 'Feature comparison: agents, blockchain, mining, SAST, memory vs AI autocomplete.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/compare/devswat-vs-cursor',
  },
  {
    route: '/compare/devswat-vs-windsurf',
    title: 'DevSwat vs Windsurf — AI IDE & Platform Comparison 2026',
    description: 'Both have agentic coding. DevSwat adds agents, blockchain, mining, SAST, governance.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/compare/devswat-vs-windsurf',
  },
  {
    route: '/compare/devswat-vs-chatgpt',
    title: 'DevSwat vs ChatGPT — AI Platform Comparison 2026',
    description: 'Chat assistant vs full agentic infrastructure: agents, blockchain, IDE, SAST, mining.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/compare/devswat-vs-chatgpt',
  },
  {
    route: '/compare/devswat-vs-replit',
    title: 'DevSwat vs Replit — AI Development Platform Comparison 2026',
    description: 'Cloud IDE vs full AI infrastructure: agents, blockchain, mining, SAST, governance.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/compare/devswat-vs-replit',
  },
  // Batch 4: Docs
  {
    route: '/docs/architecture',
    title: 'Architecture — Platform Infrastructure & Service Topology | DevSwat Docs',
    description: 'Full-stack AI agent infrastructure. Blockchain logging, governance, smart routing, mining, IDE. Technical deep dive.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/docs/architecture',
  },
  {
    route: '/docs/agent-api',
    title: 'Agent API Reference — Create, Run & Schedule Agents | DevSwat Docs',
    description: 'REST API for creating, running, scheduling, and managing autonomous AI agents.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/docs/agent-api',
  },
  {
    route: '/docs/blockchain-protocol',
    title: 'Blockchain Protocol — DSID-P, Merkle Trees, Block Format | DevSwat Docs',
    description: 'DSID-P identity, block structure, merkle tree computation, CBOR encoding, audit chain.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/docs/blockchain-protocol',
  },
  {
    route: '/docs/mining-protocol',
    title: 'Mining Protocol — Pipeline Parallelism, Gradient Compression | DevSwat Docs',
    description: '1F1B pipeline parallelism, Top-K gradient compression, FedAvg, Proof-of-Training.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/docs/mining-protocol',
  },
  {
    route: '/docs/governance-protocol',
    title: 'Governance Protocol — RARA Invariants, Capability Grammar | DevSwat Docs',
    description: 'Invariant classes, capability grammar, trust scoring, mutation executor.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/docs/governance-protocol',
  },
  {
    route: '/docs/cbor-spec',
    title: 'CBOR Block Format — RFC 8949 Encoding for Blockchain | DevSwat Docs',
    description: 'RFC 8949 canonical encoding. 5-layer blockchain data serialization.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/docs/cbor-spec',
  },
  {
    route: '/docs/cross-chain',
    title: 'Cross-Chain Bridge — Atomic Swaps, HTLC, Light Clients | DevSwat Docs',
    description: 'Light clients, relay network, HTLC atomic swaps, multi-chain bridge.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/docs/cross-chain',
  },
  {
    route: '/docs/neural-routing',
    title: 'Neural Routing Docs — MLP Classifier Architecture & Training | DevSwat Docs',
    description: 'MLP architecture, training pipeline, active learning, PostgreSQL persistence.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/docs/neural-routing',
  },
  // Batch 5: Trust & Community
  {
    route: '/integrations',
    title: 'Integrations — Unlimited LLM Providers, Platform Connectors, OAuth | DevSwat',
    description: 'Connect any LLM provider and any external platform. Google Drive, Gmail, Slack, Calendar, Figma, Stripe. Unlimited.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/integrations',
  },
  {
    route: '/blog',
    title: 'Blog — Engineering, AI Research & Platform Updates | DevSwat',
    description: 'Deep dives into agentic AI, neural routing, decentralized training, blockchain, governance.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/blog',
  },
  {
    route: '/changelog',
    title: 'Changelog — Platform Updates & Release History | DevSwat',
    description: 'All platform updates, new features, bug fixes, and improvements.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/changelog',
  },
  {
    route: '/security',
    title: 'Security — Encryption, Auth, Governance & Compliance | DevSwat',
    description: 'JWT/MFA auth, AES encryption, blockchain audit, RARA governance, compliance.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/security',
  },
  {
    route: '/privacy',
    title: 'Privacy Policy | DevSwat',
    description: 'How we collect, use, and protect your data. Per-user AES encryption, local-first tools.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/privacy',
  },
  {
    route: '/terms',
    title: 'Terms of Service | DevSwat',
    description: 'Platform usage terms, account responsibilities, pricing, intellectual property.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/terms',
  },
  {
    route: '/community',
    title: 'Community — Open Source, Mining Network & Developers | DevSwat',
    description: 'Open source, mining network, developer forums, contributor opportunities.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/community',
  },
];

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

for (const page of OG_PAGES) {
  let html = indexHtml;

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`);

  // Replace og:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${page.title}" />`
  );

  // Replace og:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${page.description}" />`
  );

  // Replace og:image
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${page.image}" />`
  );

  // Replace og:url
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${page.url}" />`
  );

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${page.description}" />`
  );

  // Add twitter card tags if not present
  if (!html.includes('twitter:card')) {
    const ogInsertPoint = html.indexOf('<!-- Twitter -->');
    if (ogInsertPoint !== -1) {
      // Replace existing twitter section
      html = html.replace(
        /<!-- Twitter -->[\s\S]*?(?=\n\s*<link|<\/head>)/,
        `<!-- Twitter -->\n  <meta name="twitter:card" content="summary_large_image" />\n  <meta name="twitter:title" content="${page.title}" />\n  <meta name="twitter:description" content="${page.description}" />\n  <meta name="twitter:image" content="${page.image}" />\n`
      );
    } else {
      // Insert before </head>
      html = html.replace(
        '</head>',
        `  <meta name="twitter:card" content="summary_large_image" />\n  <meta name="twitter:title" content="${page.title}" />\n  <meta name="twitter:description" content="${page.description}" />\n  <meta name="twitter:image" content="${page.image}" />\n</head>`
      );
    }
  } else {
    html = html.replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${page.title}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${page.description}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${page.image}" />`
    );
  }

  // Write to route directory
  const routeDir = path.join(distDir, page.route.replace(/^\//, ''));
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
  console.log(`✓ OG tags injected: ${page.route}/index.html`);
}
