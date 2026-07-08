import React, { useState } from 'react';
import styles from '../DownloadShared/DownloadPage.module.css';

const GITHUB_REPO = 'https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw';
const GITHUB_DOWNLOAD = 'https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw/archive/refs/heads/main.zip';
const ONE_LINE_INSTALL = `bash -lc 'set -e; [ -d RG_OpenClaw ] || git clone https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw.git; cd RG_OpenClaw; python3 -m venv venv; source venv/bin/activate; pip install -r requirements.txt; cp -n .env.example .env; uvicorn app.main:app --port 8000 &; sleep 2; echo "Connector running. Authenticate:"; echo "curl -X POST http://localhost:8000/auth/login -H Content-Type:application/json -d {email:YOUR_EMAIL,password:YOUR_PASS}"'`;

const SETUP_STEPS = [
  { cmd: 'git clone https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw.git', note: 'Clone the repo' },
  { cmd: 'cd RG_OpenClaw', note: 'Enter directory' },
  { cmd: 'python3 -m venv venv && source venv/bin/activate', note: 'Create & activate venv' },
  { cmd: 'pip install -r requirements.txt', note: 'Install dependencies' },
  { cmd: 'cp .env.example .env', note: 'Config ready (defaults work out of the box)' },
  { cmd: 'uvicorn app.main:app --port 8000 --reload', note: 'Start the connector (open localhost:8000 to verify)' },
  { cmd: 'curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d \'{"email":"you@example.com","password":"your-pass"}\'', note: 'Authenticate with your dev-swat.com account' },
  { cmd: 'curl http://localhost:8000/auth/status', note: 'Verify — should show authenticated: true' },
  { cmd: 'curl -X POST http://localhost:8000/agents/register -H "Content-Type: application/json" -d \'{"name":"my-agent","tools":["web_search","memory_read","memory_write"]}\'', note: 'Register a federated agent on the platform' },
  { cmd: '# Go to dev-swat.com/agents → find your agent → click Run', note: 'Run your agent from the platform UI!' },
];

const QUICK_START = [
  { title: 'Clone & Install', desc: 'Clone the repo, create a virtualenv, and pip install the requirements.' },
  { title: 'Start & Authenticate', desc: 'Launch the connector with uvicorn, then authenticate with your free dev-swat.com account.' },
  { title: 'Register & Run', desc: 'Register a federated agent and run it live from dev-swat.com/agents.' },
];

const FEATURE_ICONS = [
  <>
    <polyline key="a1" points="4 17 10 11 4 5" />
    <line key="a2" x1="12" y1="19" x2="20" y2="19" />
  </>,
  <>
    <ellipse key="b1" cx="12" cy="5" rx="9" ry="3" />
    <path key="b2" d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path key="b3" d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </>,
  <>
    <path key="c1" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </>,
  <>
    <path key="d1" d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path key="d2" d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path key="d3" d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line key="d4" x1="12" y1="20" x2="12.01" y2="20" />
  </>,
  <polyline key="e1" points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  <path key="f1" d="M17.5 19H9a7 7 0 1 1 6.71-9h.79a4.5 4.5 0 1 1 0 9z" />,
  <>
    <polygon key="g1" points="12 2 2 7 12 12 22 7 12 2" />
    <polyline key="g2" points="2 17 12 22 22 17" />
    <polyline key="g3" points="2 12 12 17 22 12" />
  </>,
  <>
    <line key="h1" x1="22" y1="12" x2="2" y2="12" />
    <path key="h2" d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    <line key="h3" x1="6" y1="16" x2="6.01" y2="16" />
    <line key="h4" x1="10" y1="16" x2="10.01" y2="16" />
  </>,
];

const FEATURES = [
  { title: 'Local-First Execution', desc: 'Tools run directly on YOUR machine — web search via DuckDuckGo, page fetching via httpx + BeautifulSoup, code execution via Python subprocess. No data leaves your machine. Server only gets the final answer.' },
  { title: 'Local Memory (SQLite)', desc: 'All agent memory stored in ~/.openclaw/data/memory.db on YOUR disk. FTS5 full-text search. Memory content is NEVER sent to the server. Persists across sessions, restarts, and updates.' },
  { title: 'Privacy by Architecture', desc: 'Memory content, search results, fetched pages, and code output never leave your machine. The platform only receives: tool name + timing (step reports) and the final answer text. That\'s it.' },
  { title: 'Secure Polling Dispatch', desc: 'Click "Run" on your federated agent — the platform queues the task. Your connector polls every 5 seconds and picks it up. ALL traffic is outbound HTTPS. Zero inbound connections. Works behind any firewall.' },
  { title: 'Live Step Streaming', desc: 'Each tool call reports step metadata to the platform UI in real-time — tool name, timing, and ran_locally flag. Watch your agent work live on dev-swat.com/agents without any data exposure.' },
  { title: 'Cloud Fallback for OAuth Tools', desc: 'Tools requiring OAuth (Google Calendar, Gmail, Slack) or GPU (image generation) automatically fall back to the platform server. Everything else runs locally on your machine.' },
  { title: '162 Platform Tools + 560+ APIs', desc: 'Access 162 tools across 16 categories. 8 run locally (web search, fetch, memory, code exec, deep research). The rest available via platform. Plus 560+ REST APIs across the full DevSwat platform.' },
  { title: 'Your Hardware, Your Data', desc: 'Your agent runs on YOUR machine. Memory stays on YOUR disk. Search results stay in YOUR RAM. Server only gets the final answer. No telemetry, no data collection. Disconnect any time — nothing is lost.' },
];

const TOOL_CATALOG = [
  { category: 'Search & Web', count: 11, tools: [
    { name: 'web_search', desc: '🟢 LOCAL — Search the web via DuckDuckGo on YOUR machine. No API key needed.' },
    { name: 'fetch_url', desc: '🟢 LOCAL — Fetch and read content from any URL directly from your machine.' },
    { name: 'read_webpage', desc: '🟢 LOCAL — Read a webpage and extract clean text with BeautifulSoup.' },
    { name: 'read_many_pages', desc: 'Read multiple web pages in parallel (max 5).' },
    { name: 'reddit_search', desc: 'Search Reddit for discussions and recommendations.' },
    { name: 'image_search', desc: 'Search for images on the web.' },
    { name: 'news_search', desc: 'Search latest news articles.' },
    { name: 'places_search', desc: 'Search for businesses on Google Maps.' },
    { name: 'youtube_search', desc: 'Search YouTube for videos.' },
    { name: 'deep_research', desc: '🟢 LOCAL — Deep multi-source research (search + fetch combo) on YOUR machine.' },
    { name: 'wikipedia', desc: 'Search and read Wikipedia articles.' },
  ]},
  { category: 'Memory — Local SQLite', count: 9, tools: [
    { name: 'memory_read', desc: '🟢 LOCAL — Search your local memory (SQLite FTS5 full-text search on your disk).' },
    { name: 'memory_write', desc: '🟢 LOCAL — Save to ~/.openclaw/data/memory.db. Content NEVER sent to server.' },
    { name: 'memory_search', desc: '🟢 LOCAL — Deep keyword search through local memories.' },
    { name: 'memory_stats', desc: 'Get memory usage stats.' },
    { name: 'hash_sphere_search', desc: 'Search Hash Sphere anchors (hash-verified memories).' },
    { name: 'hash_sphere_anchor', desc: 'Create a new hash-verified memory point.' },
    { name: 'hash_sphere_list_anchors', desc: 'List all user\'s Hash Sphere anchors.' },
    { name: 'hash_sphere_hash', desc: 'Generate a Hash Sphere hash for content.' },
    { name: 'hash_sphere_resonance', desc: 'Check resonance between two content pieces.' },
  ]},
  { category: 'Code Visualizer (SAST)', count: 8, tools: [
    { name: 'code_visualizer_scan', desc: 'AST-scan project: functions, classes, endpoints, imports, pipelines, dead code.' },
    { name: 'code_visualizer_functions', desc: 'List all functions and API endpoints.' },
    { name: 'code_visualizer_trace', desc: 'Trace dependency flow from any node.' },
    { name: 'code_visualizer_governance', desc: 'Architecture governance: reachability, drift, health score.' },
    { name: 'code_visualizer_graph', desc: 'Get full dependency graph.' },
    { name: 'code_visualizer_pipeline', desc: 'Get auto-detected pipeline flow.' },
    { name: 'code_visualizer_filter', desc: 'Filter graph by file path, node type, or keyword.' },
    { name: 'code_visualizer_by_type', desc: 'Get all nodes of a type (function, class, endpoint, service, etc.).' },
  ]},
  { category: 'Agents OS', count: 24, tools: [
    { name: 'agents_list', desc: 'List user\'s AI agents.' },
    { name: 'agents_create', desc: 'Create a new AI agent.' },
    { name: 'agents_start', desc: 'Start/run an agent.' },
    { name: 'agents_stop', desc: 'Stop a running agent.' },
    { name: 'agents_status', desc: 'Get agent config and status.' },
    { name: 'agents_delete', desc: 'Delete an agent.' },
    { name: 'agents_update', desc: 'Update agent config — name, goal, model, tools, etc.' },
    { name: 'agents_sessions', desc: 'List sessions/runs for an agent.' },
    { name: 'agents_session_steps', desc: 'Get execution steps for a session.' },
    { name: 'agents_session_trace', desc: 'Full execution trace — steps, waterfall, cost, safety flags.' },
    { name: 'agents_metrics', desc: 'Get agent run metrics (sessions, tokens, success rate).' },
    { name: 'agents_session_cancel', desc: 'Cancel a running session.' },
    { name: 'workspace_snapshot', desc: 'Full overview of workspace.' },
    { name: 'run_agent', desc: 'Directly run an agent with a goal.' },
    { name: 'schedule_agent', desc: 'Set recurring schedule for an agent.' },
    { name: 'present_options', desc: 'Present interactive options to the user.' },
    { name: 'architect_plan', desc: 'Analyze a request and produce a JSON blueprint for production-ready agents.' },
    { name: 'architect_create_agent', desc: 'Create a fully-configured agent from a blueprint.' },
    { name: 'architect_assign_goal', desc: 'Assign a goal to an agent.' },
    { name: 'architect_create_schedule', desc: 'Create a recurring schedule — cron or interval.' },
    { name: 'architect_create_webhook', desc: 'Create a webhook trigger for an agent.' },
    { name: 'architect_set_autonomy', desc: 'Set autonomy mode (governed, supervised, unbounded).' },
    { name: 'architect_list_available_tools', desc: 'List all tools available to assign to agents.' },
    { name: 'architect_list_providers', desc: 'List available LLM providers and models.' },
  ]},
  { category: 'Media Generation', count: 3, tools: [
    { name: 'generate_image', desc: 'Generate an AI image from text (DALL-E).' },
    { name: 'generate_audio', desc: 'Generate speech from text (TTS).' },
    { name: 'generate_music', desc: 'Generate music from text description.' },
  ]},
  { category: 'Integrations', count: 9, tools: [
    { name: 'gmail_send', desc: 'Send email via Gmail.' },
    { name: 'gmail_read', desc: 'Read recent Gmail inbox.' },
    { name: 'slack_send', desc: 'Send Slack message.' },
    { name: 'slack_read', desc: 'Read Slack channel messages.' },
    { name: 'google_calendar', desc: 'Google Calendar: list/create events, check availability.' },
    { name: 'google_drive', desc: 'Google Drive: list/search/read/create files.' },
    { name: 'figma', desc: 'Figma: list projects, get file, inspect components.' },
    { name: 'sigma', desc: 'Sigma Computing dashboards and analytics.' },
    { name: 'send_email', desc: 'Send email via SendGrid with HTML support.' },
  ]},
  { category: 'GitHub', count: 9, tools: [
    { name: 'github_create_repo', desc: 'Create GitHub repository.' },
    { name: 'github_list_repos', desc: 'List GitHub repositories.' },
    { name: 'github_list_files', desc: 'List files in a GitHub repo.' },
    { name: 'github_download_file', desc: 'Download file from GitHub repo.' },
    { name: 'github_upload_file', desc: 'Upload file to GitHub repo.' },
    { name: 'github_pull_request', desc: 'Create or list pull requests.' },
    { name: 'github_issue', desc: 'Create or list issues.' },
    { name: 'github_commit', desc: 'Get commits in a repository.' },
    { name: 'github_comment', desc: 'Comment on a GitHub issue or PR.' },
  ]},
  { category: 'Git Operations', count: 5, tools: [
    { name: 'git_clone', desc: 'Clone a Git repository.' },
    { name: 'git_branch', desc: 'Create, list, or switch Git branches.' },
    { name: 'git_merge', desc: 'Merge a branch into current branch.' },
    { name: 'git_push', desc: 'Push commits to remote.' },
    { name: 'git_pull', desc: 'Pull changes from remote.' },
  ]},
  { category: 'State Physics Engine', count: 21, tools: [
    { name: 'sp_state', desc: 'Get full State Physics universe — nodes, edges, metrics, invariants.' },
    { name: 'sp_reset', desc: 'Reset State Physics universe to initial state.' },
    { name: 'sp_nodes', desc: 'List all nodes in Hash Sphere universe.' },
    { name: 'sp_metrics', desc: 'Get universe metrics — node count, edge count, entropy.' },
    { name: 'sp_identity', desc: 'Create identity node in Hash Sphere universe.' },
    { name: 'sp_simulate', desc: 'Run N physics simulation steps.' },
    { name: 'sp_galaxy', desc: 'Create galaxy-scale simulation.' },
    { name: 'sp_demo', desc: 'Seed universe with demo data.' },
    { name: 'sp_asymmetry', desc: 'Get asymmetry score — trust variance and Gini.' },
    { name: 'sp_physics_config', desc: 'Update physics engine parameters.' },
    { name: 'sp_entropy_config', desc: 'Update entropy engine parameters.' },
    { name: 'sp_entropy_toggle', desc: 'Enable or disable entropy injection.' },
    { name: 'sp_entropy_perturbation', desc: 'Inject perturbation event.' },
    { name: 'sp_agent_spawn', desc: 'Spawn autonomous agent in universe.' },
    { name: 'sp_agent_step', desc: 'Step the active agent once.' },
    { name: 'sp_agent_kill', desc: 'Kill the active agent.' },
    { name: 'sp_agents_spawn', desc: 'Spawn multiple agents.' },
    { name: 'sp_agents_kill_all', desc: 'Kill all autonomous agents.' },
    { name: 'sp_experiment', desc: 'Setup named experiment — zero_agent, stress_test, long_run.' },
    { name: 'sp_memory_cost', desc: 'Set memory cost multiplier.' },
    { name: 'sp_metrics_record', desc: 'Record metrics snapshot to history.' },
  ]},
  { category: 'Community (Rabbit)', count: 12, tools: [
    { name: 'create_rabbit_post', desc: 'Create post in Rabbit community.' },
    { name: 'list_rabbit_communities', desc: 'List all Rabbit communities.' },
    { name: 'list_rabbit_posts', desc: 'List Rabbit posts.' },
    { name: 'rabbit_vote', desc: 'Vote on Rabbit post/comment.' },
    { name: 'create_rabbit_community', desc: 'Create a new Rabbit community.' },
    { name: 'get_rabbit_community', desc: 'Get a Rabbit community by slug.' },
    { name: 'search_rabbit_posts', desc: 'Search Rabbit posts by keyword.' },
    { name: 'get_rabbit_post', desc: 'Get a specific Rabbit post by ID.' },
    { name: 'delete_rabbit_post', desc: 'Delete a Rabbit post (owner only).' },
    { name: 'create_rabbit_comment', desc: 'Comment on a Rabbit post.' },
    { name: 'list_rabbit_comments', desc: 'List comments on a Rabbit post.' },
    { name: 'delete_rabbit_comment', desc: 'Delete a Rabbit comment (owner only).' },
  ]},
  { category: 'Developer', count: 4, tools: [
    { name: 'execute_code', desc: '🟢 LOCAL — Run Python code on YOUR machine (subprocess, 30s timeout).' },
    { name: 'http_request', desc: 'HTTP request to internal platform APIs.' },
    { name: 'external_http_request', desc: 'HTTP request to any external URL.' },
    { name: 'dev_tool', desc: 'Bridge to ED service for file ops, git, docker, testing.' },
  ]},
  { category: 'Utilities', count: 6, tools: [
    { name: 'weather', desc: 'Get current weather and 3-day forecast.' },
    { name: 'stock_crypto', desc: 'Get real-time stock or crypto prices.' },
    { name: 'generate_chart', desc: 'Generate chart image from data (bar, line, pie, radar, scatter).' },
    { name: 'visualize', desc: 'Generate SVG diagram inline.' },
    { name: 'get_current_time', desc: 'Get current date, time, timezone.' },
    { name: 'get_system_info', desc: 'Get platform system info.' },
  ]},
  { category: 'Platform API', count: 2, tools: [
    { name: 'platform_api_search', desc: 'Search ~383 platform API endpoints.' },
    { name: 'platform_api_call', desc: 'Call any authenticated platform API endpoint.' },
  ]},
  { category: 'Filesystem', count: 10, tools: [
    { name: 'file_read', desc: 'Read file with offset/limit.' },
    { name: 'file_write', desc: 'Create or overwrite file.' },
    { name: 'file_edit', desc: 'Replace exact unique string in file.' },
    { name: 'multi_edit', desc: 'Atomic batch edits on one file.' },
    { name: 'file_list', desc: 'List directory contents.' },
    { name: 'file_delete', desc: 'Delete file or directory.' },
    { name: 'grep_search', desc: 'Search text pattern in files via ripgrep.' },
    { name: 'find_by_name', desc: 'Find files by name glob.' },
    { name: 'run_command', desc: 'Run shell command.' },
    { name: 'command_status', desc: 'Check background command status.' },
  ]},
  { category: 'Tool Management & Self-Creation', count: 6, tools: [
    { name: 'create_tool', desc: 'Create custom HTTP tool stored in DB. Set is_shared=true for platform-wide access.' },
    { name: 'list_tools', desc: 'List user\'s custom tools + all shared platform tools.' },
    { name: 'delete_tool', desc: 'Delete a custom tool.' },
    { name: 'update_tool', desc: 'Update an existing custom tool.' },
    { name: 'auto_build_tool', desc: 'LLM designs, validates (AST safety scan), and registers a new tool at runtime. Describe what the tool should do.' },
    { name: 'check_tool_exists', desc: 'Check if a capability exists as a tool. Suggests auto_build_tool if not found.' },
  ]},
];

const REQUIREMENTS = [
  { label: 'Python 3.9+', detail: '3.11+ recommended' },
  { label: 'pip', detail: 'Package manager' },
  { label: 'Free account', detail: 'at dev-swat.com (same login as the IDE)' },
  { label: 'Terminal', detail: '5 minutes to full setup' },
];

const NETWORK_FLOW = [
  { step: '1', title: 'Create Account', desc: 'Sign up at dev-swat.com. You get a platform UUID and Hash Sphere identity.' },
  { step: '2', title: 'Start Connector', desc: 'Clone RG_OpenClaw, pip install, uvicorn start. Local SQLite memory DB created automatically at ~/.openclaw/data/memory.db.' },
  { step: '3', title: 'Authenticate', desc: 'POST /auth/login with your dev-swat.com credentials. JWT stored at ~/.openclaw/tokens.json. Auto-refreshes — no re-login needed.' },
  { step: '4', title: 'Create Agent', desc: 'Option A: dev-swat.com/agents → + Create → ⚡ Federated. Option B: POST /agents/register from the connector. Both create agent_source=\'federated\' on the platform.' },
  { step: '5', title: 'Run from Platform', desc: 'Click "Run" on your agent at dev-swat.com/agents. Task is queued → your connector picks it up within 5 seconds.' },
  { step: '6', title: 'Local Execution', desc: 'Tools run on YOUR machine: web_search → DuckDuckGo, memory → local SQLite, fetch_url → direct HTTP, code → subprocess. No data leaves your machine.' },
  { step: '7', title: 'Live Streaming', desc: 'Each tool call sends step metadata (tool name + timing) to the platform UI. Watch your agent work live. Memory content and search results are NOT sent.' },
  { step: '8', title: 'Final Answer Only', desc: 'Only the final answer text is submitted to the platform. Your memory stays on YOUR disk. Search results stay in YOUR RAM. Server only displays the result.' },
];

const FAQ_ITEMS = [
  {
    label: 'Architecture',
    labelClass: 'faqLabelArch',
    question: 'What exactly is the OpenClaw connector and how does it work?',
    answer: `<p><strong>OpenClaw is a local-first federated agent</strong> that runs on YOUR machine. Most tools execute locally — only the final answer is sent to the platform.</p>
<p><strong>Local execution:</strong> When your agent calls <code>web_search</code>, it searches DuckDuckGo directly from your machine. When it calls <code>memory_write</code>, it saves to <code>~/.openclaw/data/memory.db</code> (local SQLite). When it calls <code>fetch_url</code>, your machine fetches the page. Code execution runs as a local Python subprocess.</p>
<p><strong>What the server receives:</strong></p>
<ul>
<li><strong>Step reports:</strong> Tool name + timing + ran_locally flag (for live UI updates)</li>
<li><strong>Final answer:</strong> The text response only</li>
</ul>
<p><strong>What the server does NOT receive:</strong></p>
<ul>
<li><strong>Memory content</strong> — stays in local SQLite, step report says "[stored locally]"</li>
<li><strong>Search results</strong> — stay in RAM on your machine</li>
<li><strong>Fetched page content</strong> — stays in RAM on your machine</li>
<li><strong>Code execution output</strong> — stays in RAM on your machine</li>
</ul>
<p><strong>Cloud fallback:</strong> Tools requiring OAuth (Google Calendar, Gmail, Slack) or GPU (image generation) fall back to the platform server automatically. Everything else runs locally.</p>
<p><strong>ALL traffic is outbound HTTPS.</strong> The platform NEVER connects to your machine. No ports exposed, no tunnels needed, works behind any firewall/NAT/VPN.</p>`,
  },
  {
    label: 'Auth',
    labelClass: 'faqLabelAuth',
    question: 'How does authentication work? Where is my data stored?',
    answer: `<p><strong>Same auth flow as the DevSwat IDE.</strong> JWT stored locally at <code>~/.openclaw/tokens.json</code>. Auto-refreshes.</p>
<p><strong>Where your data lives:</strong></p>
<ul>
<li><strong>Memory:</strong> <code>~/.openclaw/data/memory.db</code> (SQLite on YOUR disk) — never uploaded to server</li>
<li><strong>Search results:</strong> In RAM during the task — never persisted on server</li>
<li><strong>Fetched pages:</strong> In RAM during the task — never persisted on server</li>
<li><strong>Code output:</strong> In RAM during the task — never persisted on server</li>
<li><strong>Final answer:</strong> Sent to platform for display in the Agents UI</li>
<li><strong>Step metadata:</strong> Tool name + timing sent for live UI streaming (no data content)</li>
</ul>
<p><strong>Identity layers:</strong> On registration, you get identity anchors:</p>
<ul>
<li><strong>UUID</strong> — platform identity</li>
<li><strong>user_hash</strong> — Hash Sphere semantic identity</li>
<li><strong>universe_id</strong> — Deterministic Anchor Universe ID</li>
</ul>
<p><strong>Security:</strong> HSTS, CORS lockdown, fail-closed auth (no JWT = 503), all outbound HTTPS. The connector source is fully open — audit every HTTP call yourself.</p>`,
  },
  {
    label: 'Platform',
    labelClass: 'faqLabelPlatform',
    question: 'What runs locally vs on the server?',
    answer: `<p><strong>8 tools run locally on YOUR machine. The rest available via platform server.</strong></p>
<p><strong>🟢 LOCAL tools (your machine):</strong></p>
<ul>
<li><strong>web_search</strong> — DuckDuckGo, no API key needed</li>
<li><strong>fetch_url / read_webpage</strong> — httpx + BeautifulSoup, your machine fetches directly</li>
<li><strong>deep_research</strong> — search + fetch combo, all local</li>
<li><strong>memory_write</strong> — saves to ~/.openclaw/data/memory.db (local SQLite)</li>
<li><strong>memory_read</strong> — FTS5 full-text search on local SQLite</li>
<li><strong>execute_code</strong> — Python subprocess on your machine (30s timeout)</li>
</ul>
<p><strong>🔵 Server tools (cloud fallback):</strong></p>
<ul>
<li><strong>Google Calendar, Gmail, Drive</strong> — needs OAuth credentials</li>
<li><strong>Slack</strong> — needs OAuth credentials</li>
<li><strong>Image/audio/video generation</strong> — needs GPU</li>
<li><strong>Code Visualizer, GitHub, Git</strong> — platform services</li>
<li><strong>All 140+ other tools</strong> — available via platform</li>
</ul>
<p><strong>The connector automatically decides:</strong> If a tool is in the local set, it runs on your machine. If not, it falls back to the platform server. You don't need to configure anything — it just works.</p>`,
  },
  {
    label: 'Trust',
    labelClass: 'faqLabelTrust',
    question: 'This is a new project — why should I connect my agent to it?',
    answer: `<p><strong>We won't pretend we're established. Here's where we actually stand:</strong></p>
<p><strong>What you can verify right now:</strong></p>
<ul>
<li><strong>Fully open source:</strong> The connector (<a href="https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw" target="_blank" rel="noopener noreferrer">RG_OpenClaw</a>), the agent engine, and the tool registry — all available on GitHub under <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer">DevSwat-ResonantGenesis</a>.</li>
<li><strong>Real infrastructure:</strong> Dozens of microservices in Docker Compose, Nginx TLS, JWT auth with fail-closed security, HSTS, CORS lockdown. Not a demo — a production platform at <a href="https://dev-swat.com" target="_blank" rel="noopener noreferrer">dev-swat.com</a>.</li>
<li><strong>Same auth as everything else:</strong> The OpenClaw connector uses the exact same authentication flow as the DevSwat IDE. One account, one JWT, consistent security across all entry points.</li>
<li><strong>Your agent, your hardware:</strong> The connector is a bridge, not a cage. Your OpenClaw agent runs locally. You control what tools it calls. You can disconnect at any time. The source is open — audit every HTTP call it makes.</li>
</ul>
<p><strong>What we haven't done yet:</strong></p>
<ul>
<li>No third-party security audit (code is open for anyone to audit)</li>
<li>No large agent network yet — we need early participants</li>
</ul>
<p><strong>The honest pitch:</strong> If you run OpenClaw agents and want them to have access to web search, persistent memory, code analysis, and 560+ platform APIs — without building all that infrastructure yourself — this connector gives you that in 5 minutes. It's free, it's open source, and you can unplug any time.</p>`,
  },
  {
    label: 'License',
    labelClass: 'faqLabelLicense',
    question: 'What license is this under? Can I modify it?',
    answer: `<p><strong>The OpenClaw connector is source-available under the RG Source Available License.</strong></p>
<p><strong>What it means:</strong></p>
<ul>
<li><strong>Full source access:</strong> Every line of the connector, bridge protocol, federation API, and governance integration is on GitHub.</li>
<li><strong>You can read, audit, and run it:</strong> Deploy it on your own machine, inspect every API call, verify the authentication flow.</li>
<li><strong>Modifications for personal use:</strong> You can modify the code for your own deployments.</li>
</ul>
<p><strong>What you can audit right now:</strong></p>
<ul>
<li><strong>Connector service:</strong> <code>app/routers.py</code> — every REST endpoint, every HTTP call to the platform</li>
<li><strong>Models:</strong> <code>app/models.py</code> — every data structure, request/response schema</li>
<li><strong>Configuration:</strong> <code>app/config.py</code> — every environment variable, every service URL</li>
<li><strong>Bridge protocol:</strong> <code>openclaw_bridge.py</code> in the agent engine — the WebSocket RPC implementation</li>
</ul>
<p>The platform services (agent engine, memory) that the connector calls are also open source under their respective licenses in the DevSwat-ResonantGenesis GitHub organization.</p>`,
  },
];

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const GitHubGlyph = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const OpenClawPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openCat, setOpenCat] = useState<number | null>(null);

  const fullCloneScript = SETUP_STEPS.map(s => s.cmd).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCloneScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOneLiner = () => {
    navigator.clipboard.writeText(ONE_LINE_INSTALL);
    setCopiedOneLiner(true);
    setTimeout(() => setCopiedOneLiner(false), 2000);
  };

  return (
    <div className={styles.page} data-product="openclaw">
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <GitHubGlyph size={16} />
            Open Source on GitHub
          </div>
          <h1 className={styles.heroTitle}>
            Open<span className={styles.heroAccent}>Claw</span>+
          </h1>
          <p className={styles.heroSubtitle}>
            Run AI agents on YOUR hardware. Tools execute LOCALLY — web search, page fetching, code execution, and memory all happen on YOUR machine.
            Only the final answer is sent to the platform. Memory is stored in local SQLite on your disk, never uploaded to the server.
            Zero inbound connections. Outbound HTTPS only. Works behind any firewall. Your compute, your data, your control.
          </p>
          <div className={styles.heroActions}>
            <a href={GITHUB_DOWNLOAD} className={styles.btnPrimary}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download from GitHub
            </a>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
              <GitHubGlyph size={18} />
              View on GitHub
            </a>
          </div>
          <div className={styles.heroFacts}>
            {['Python 3.9+', 'Local-First', 'SQLite Memory', 'DuckDuckGo Search', 'BeautifulSoup', 'JWT Auth', 'Zero Inbound Connections'].map((f) => (
              <span key={f} className={styles.heroFactChip}><span className={styles.heroFactDot} />{f}</span>
            ))}
          </div>
          <div className={styles.installCard}>
            <div className={styles.installCardHead}>
              <span className={styles.installCardLabel}>One-line install</span>
              <button type="button" onClick={handleCopyOneLiner} className={`${styles.copyChip} ${copiedOneLiner ? styles.copyChipActive : ''}`}>
                {copiedOneLiner ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className={styles.installCardBody}>
              <code>{ONE_LINE_INSTALL}</code>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start — 3 step overview */}
      <section className={styles.quickStart}>
        <div className={styles.quickStartGrid}>
          {QUICK_START.map((s, i) => (
            <div key={i} className={styles.quickStartCard}>
              <div className={styles.quickStartNum}>{i + 1}</div>
              <div>
                <h3 className={styles.quickStartTitle}>{s.title}</h3>
                <p className={styles.quickStartDesc}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Setup — Two Column */}
      <section className={styles.setupSection}>
        <div className={styles.setupGrid}>
          <div>
            <div className={styles.reqCard}>
              <h3 className={styles.reqCardTitle}>Prerequisites</h3>
              <div className={styles.reqList}>
                {REQUIREMENTS.map((r, i) => (
                  <div key={i} className={styles.reqItem}>
                    <span className={styles.reqCheck}><CheckIcon /></span>
                    <span><span className={styles.reqLabel}>{r.label}</span>{r.detail && <> — {r.detail}</>}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.tipCallout}>
              <strong>Tip:</strong> Defaults work out of the box — no .env editing needed.
              After starting the connector, run <code>POST /auth/login</code> with your{' '}
              <a href="https://dev-swat.com" target="_blank" rel="noopener noreferrer">dev-swat.com</a> credentials.
              JWT is stored securely and auto-refreshes.
            </div>
          </div>

          <div className={styles.terminal}>
            <div className={styles.terminalHead}>
              <div className={styles.terminalDots}>
                <span className={styles.terminalDot} /><span className={styles.terminalDot} /><span className={styles.terminalDot} />
              </div>
              <span className={styles.terminalLabel}>Terminal</span>
              <button onClick={handleCopy} className={`${styles.terminalCopyBtn} ${copied ? styles.terminalCopyActive : ''}`}>
                {copied ? 'Copied!' : 'Copy all'}
              </button>
            </div>
            <div className={styles.terminalBody}>
              {SETUP_STEPS.map((step, i) => (
                <div key={i} className={styles.terminalLine} style={{ marginBottom: i < SETUP_STEPS.length - 1 ? 8 : 0 }}>
                  <span className={styles.terminalPrompt}>$</span>
                  <span className={styles.terminalCmd}>{step.cmd}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Network Flow */}
      <section className={styles.networkFlow}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionKicker}>Local-first</span>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionDesc}>
            Local-first execution: tools run on YOUR machine, platform only dispatches tasks and displays the final answer.
            Authenticate once, register as federated, and run your agent from dev-swat.com/agents.
            Memory stays local. Data never leaves your machine.
          </p>
        </div>
        <div className={styles.flowGrid}>
          {NETWORK_FLOW.map((item, i) => (
            <div key={i} className={styles.flowCard}>
              <div className={styles.flowStepNumber}>{item.step}</div>
              <h3 className={styles.flowStepTitle}>{item.title}</h3>
              <p className={styles.flowStepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionKicker}>What's inside</span>
          <h2 className={styles.sectionTitle}>What Your Agent Gets</h2>
          <p className={styles.sectionDesc}>Local-first execution with cloud fallback — your data stays on your machine, server only gets the final answer.</p>
        </div>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {FEATURE_ICONS[i]}
                </svg>
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tool Catalog */}
      <section className={styles.toolCatalog}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionKicker}>Full catalog</span>
          <h2 className={styles.sectionTitle}>Full Tool Catalog</h2>
          <p className={styles.sectionDesc}>
            Every tool your OpenClaw agent can call — {TOOL_CATALOG.reduce((sum, c) => sum + c.count, 0)} tools across {TOOL_CATALOG.length} categories.
            Click a category to see every tool with its description.
          </p>
        </div>
        <div className={styles.catalogGrid}>
          {TOOL_CATALOG.map((cat, i) => (
            <div key={i} className={styles.catalogCategory}>
              <button className={styles.catalogHeader} onClick={() => setOpenCat(openCat === i ? null : i)}>
                <span className={styles.catalogCategoryName}>
                  {cat.category}
                  <span className={styles.catalogCount}>{cat.count}</span>
                </span>
                <svg
                  className={`${styles.catalogChevron} ${openCat === i ? styles.catalogChevronOpen : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openCat === i && (
                <div className={styles.catalogTools}>
                  {cat.tools.map((tool, j) => (
                    <div key={j} className={styles.catalogTool}>
                      <code className={styles.catalogToolName}>{tool.name}</code>
                      <span className={styles.catalogToolDesc}>{tool.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ / Transparency */}
      <section className={styles.faq}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionKicker}>Transparency</span>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          <p className={styles.sectionDesc}>
            Connecting your agent to an external platform is a trust decision. Here are honest, code-backed answers.
          </p>
        </div>
        <div className={styles.faqList}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>
                  <span className={`${styles.faqLabel} ${styles[item.labelClass]}`}>{item.label}</span>
                  {item.question}
                </span>
                <svg
                  className={`${styles.faqChevron} ${openFaq === i ? styles.faqChevronOpen : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === i && (
                <div className={styles.faqAnswer} dangerouslySetInnerHTML={{ __html: item.answer }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <img src="/devswat/devswat_logo.png" alt="DevSwat" className={styles.ctaLogo} />
          <h2 className={styles.ctaTitle}>Connect Your Agent Today</h2>
          <p className={styles.ctaDesc}>
            Run AI agents on YOUR hardware. Tools execute locally. Memory stays on YOUR disk.
            Server only gets the final answer. Open source. 5-minute setup. Unplug any time.
          </p>
          <div className={styles.ctaActions}>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              <GitHubGlyph size={18} />
              View Source on GitHub
            </a>
            <a href={GITHUB_DOWNLOAD} className={styles.btnSecondary}>
              Download ZIP (latest from GitHub)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OpenClawPage;
