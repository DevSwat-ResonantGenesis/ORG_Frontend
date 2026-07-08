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
import { ROUTE_META } from '../src/config/routeMeta.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const SITE_IMAGE = 'https://dev-swat.com/devswat/DevSwat.png';
const SITE_ORIGIN = 'https://dev-swat.com';

const OG_PAGES = Object.entries(ROUTE_META).map(([route, meta]) => ({
  route,
  title: meta.title,
  description: meta.description,
  image: SITE_IMAGE,
  url: `${SITE_ORIGIN}${route}`,
}));

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
