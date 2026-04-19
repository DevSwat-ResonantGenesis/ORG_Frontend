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
    title: 'Semantic Memory – DevSwat',
    description: 'Per-user encrypted semantic memory with embedding-based retrieval, resonance clustering, dual short/long-term engines, and FTS5 full-text search. 3D visualization.',
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
    route: '/hash-sphere-memory-api',
    title: 'Memory API – DevSwat',
    description: 'API documentation for the Semantic Memory engine. Embedding-based retrieval, memory clustering, dual memory engines, and encrypted per-user storage.',
    image: 'https://dev-swat.com/devswat/DevSwat.png',
    url: 'https://dev-swat.com/hash-sphere-memory-api',
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
