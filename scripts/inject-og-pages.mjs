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
    title: 'Pricing – ResonantGenesis',
    description: 'Free tier, Plus, Enterprise, and Owner plans. Multi-agent orchestration, governed memory, Code Visualizer, hallucination detection, 7 LLM providers. Start free, scale to enterprise.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/pricing',
  },
  {
    route: '/contact',
    title: 'Contact – ResonantGenesis',
    description: 'Get in touch for acquisition inquiries, enterprise demos, partnership opportunities, or technical questions about the ResonantGenesis Agentic AI platform.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/contact',
  },
  {
    route: '/signup',
    title: 'Sign Up – ResonantGenesis',
    description: 'Create your free ResonantGenesis account. Access AGI Neural Hub, Code Visualizer, multi-agent orchestration, governed memory, and 7 LLM providers.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/signup',
  },
  {
    route: '/login',
    title: 'Log In – ResonantGenesis',
    description: 'Log in to your ResonantGenesis account. Access your agents, chat sessions, Code Visualizer projects, and billing dashboard.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/login',
  },
  {
    route: '/code-visualizer',
    title: 'Code Visualizer – ResonantGenesis',
    description: 'Scan any GitHub repository. Generate interactive dependency graphs, trace function calls, produce governance reports, and run AI-powered code reviews. 20+ analysis endpoints.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/code-visualizer',
  },
  {
    route: '/state-physics',
    title: 'Hash Sphere – State Physics Demo – ResonantGenesis',
    description: 'Interactive 3D physics-based state management simulation. N-body constraint system with gravity, repulsion, entropy forces, and conservation invariants. Built with Three.js.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/state-physics',
  },
  {
    route: '/resonant-memory',
    title: 'Semantic Memory Universe – ResonantGenesis',
    description: 'Per-user semantic memory space with embedding-based retrieval, resonance clustering, dual short/long-term memory engines, and AES-encrypted storage. 3D visualization.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/resonant-memory',
  },
  {
    route: '/api/docs',
    title: 'API Documentation – ResonantGenesis',
    description: 'Complete API reference for ResonantGenesis: authentication, chat, agents, billing, blockchain, memory, code analysis, skills, and 4,384+ endpoints across 30 microservices.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/api/docs',
  },
  {
    route: '/validate',
    title: 'Validation Tool – ResonantGenesis',
    description: 'Validate AI outputs, check model compliance, and verify evidence chains. Built-in grounding checks and cross-reference validation.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/validate',
  },
  {
    route: '/llm-scan',
    title: 'LLM Scanner – ResonantGenesis',
    description: 'Scan and compare LLM providers: OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere, Ollama. Benchmark latency, cost, quality, and capabilities.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/llm-scan',
  },
  {
    route: '/help',
    title: 'Help Center – ResonantGenesis',
    description: 'Documentation, guides, and FAQs for ResonantGenesis: getting started, AGI Neural Hub, agent orchestration, memory systems, Code Visualizer, billing, and API reference.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/help',
  },
  {
    route: '/privacy-policy',
    title: 'Privacy Policy – ResonantGenesis',
    description: 'How ResonantGenesis collects, uses, and protects your data. OAuth integrations, data security, and your rights.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://dev-swat.com/privacy-policy',
  },
  {
    route: '/terms-of-service',
    title: 'Terms of Service – ResonantGenesis',
    description: 'Terms governing use of the ResonantGenesis AI platform, agent creation, third-party integrations, and services.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://dev-swat.com/terms-of-service',
  },
  {
    route: '/state-physics-api',
    title: 'State Physics API – ResonantGenesis',
    description: 'API documentation and pricing for the Hash Sphere State Physics engine. N-body simulation, force-directed graphs, entropy injection, and conservation invariants.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/state-physics-api',
  },
  {
    route: '/hash-sphere-memory-api',
    title: 'Memory Universe API – ResonantGenesis',
    description: 'API documentation and pricing for the Semantic Memory Universe. Embedding-based retrieval, memory clustering, dual memory engines, and encrypted per-user storage.',
    image: 'https://resonantgenesis.xyz/images/investorpitch/VR1.jpg',
    url: 'https://resonantgenesis.xyz/hash-sphere-memory-api',
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
