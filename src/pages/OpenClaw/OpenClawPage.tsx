import React, { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import styles from './OpenClawPage.module.css';

const GITHUB_REPO = 'https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw';
const GITHUB_DOWNLOAD = 'https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw/archive/refs/heads/main.zip';
const ONE_LINE_INSTALL = `bash -lc 'set -e; [ -d RG_OpenClaw ] || git clone https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw.git; cd RG_OpenClaw; python3 -m venv venv; source venv/bin/activate; pip install -r requirements.txt; cp -n .env.example .env; echo "Edit .env with your credentials, then press Ctrl+X to save"; \${EDITOR:-nano} .env; uvicorn app.main:app --port 8000 --reload'`;

const SETUP_STEPS = [
  { cmd: 'git clone https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw.git', note: 'Clone the repo' },
  { cmd: 'cd RG_OpenClaw', note: 'Enter directory' },
  { cmd: 'python3 -m venv venv', note: 'Create virtual environment' },
  { cmd: 'source venv/bin/activate', note: 'Activate venv' },
  { cmd: 'pip install -r requirements.txt', note: 'Install dependencies' },
  { cmd: 'cp .env.example .env && nano .env', note: 'Configure your environment' },
  { cmd: 'uvicorn app.main:app --port 8000 --reload', note: 'Start OpenClaw connector' },
];

const FEATURES = [
  { title: '162 Platform Tools', desc: 'Your OpenClaw agent gets instant access to all 162 tools on the ResonantGenesis platform — web search, memory, code analysis, media generation, GitHub, email, and more. No per-tool API keys needed for platform tools.' },
  { title: 'Bidirectional Bridge', desc: 'Two-way WebSocket RPC between your local OpenClaw agent and the platform. Your agent calls platform tools, the platform can dispatch tasks to your agent. Real-time streaming of tool events, results, and lifecycle status.' },
  { title: '560+ Platform APIs', desc: 'Beyond tools, your agent can discover and call any of 560+ REST APIs across 42 platform services — AI, memory, blockchain, community, developer tools, integrations, and more. Dynamic discovery, no hardcoded endpoints.' },
  { title: 'Hash Sphere Memory', desc: 'Persistent cross-session memory for your OpenClaw agent. Store facts, preferences, and context into the Hash Sphere semantic memory system. Memories persist across sessions and are retrievable by any of your agents.' },
  { title: 'RARA Governance', desc: 'Enroll your agent in the Resonant Autonomous Regulatory Authority governance framework. Get a compliance score, DSID identity anchor, and eligibility for the agent marketplace.' },
  { title: 'Custom Skill Import', desc: 'Export skills from your OpenClaw agent back to the platform. Other users and agents can discover and use your custom skills. Skills execute on your hardware — you control the compute.' },
];

const TOOL_CATALOG = [
  { category: 'Search & Web', count: 11, tools: [
    { name: 'web_search', desc: 'Search the web for current information, news, articles, documentation.' },
    { name: 'fetch_url', desc: 'Fetch and read content from any URL.' },
    { name: 'read_webpage', desc: 'Read a webpage and extract clean structured content.' },
    { name: 'read_many_pages', desc: 'Read multiple web pages in parallel (max 5).' },
    { name: 'reddit_search', desc: 'Search Reddit for discussions and recommendations.' },
    { name: 'image_search', desc: 'Search for images on the web.' },
    { name: 'news_search', desc: 'Search latest news articles.' },
    { name: 'places_search', desc: 'Search for businesses on Google Maps.' },
    { name: 'youtube_search', desc: 'Search YouTube for videos.' },
    { name: 'deep_research', desc: 'Deep multi-source research via Perplexity AI.' },
    { name: 'wikipedia', desc: 'Search and read Wikipedia articles.' },
  ]},
  { category: 'Memory & Hash Sphere', count: 9, tools: [
    { name: 'memory_read', desc: 'Search user\'s long-term memory.' },
    { name: 'memory_write', desc: 'Save information to long-term memory.' },
    { name: 'memory_search', desc: 'Deep keyword + semantic search through memories.' },
    { name: 'memory_stats', desc: 'Get memory usage stats.' },
    { name: 'hash_sphere_search', desc: 'Search Hash Sphere anchors (blockchain-verified memories).' },
    { name: 'hash_sphere_anchor', desc: 'Create a new blockchain-verified memory point.' },
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
    { name: 'execute_code', desc: 'Run code in Docker sandbox (Python, JavaScript, Bash).' },
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
  { label: 'Python 3.9+', detail: '(3.11+ recommended)' },
  { label: 'pip', detail: 'Package manager' },
  { label: 'OpenClaw runtime', detail: '(pi-agent-core installed on your machine)' },
  { label: 'Free account', detail: 'at dev-swat.com (required for authentication)' },
  { label: 'Network', detail: 'Broadband internet for WebSocket connection' },
];

const NETWORK_FLOW = [
  { step: '1', title: 'Register', desc: 'Create a free account at dev-swat.com. You get a platform UUID, blockchain identity (crypto_hash), and Hash Sphere identity (user_hash).' },
  { step: '2', title: 'Install Connector', desc: 'Clone the RG_OpenClaw repo. The connector is a lightweight FastAPI service that bridges your local OpenClaw agent to the platform.' },
  { step: '3', title: 'Authenticate', desc: 'Your OpenClaw agent authenticates with the same JWT flow as the Resonant IDE and Mining App. Credentials sent to platform auth, JWT stored locally.' },
  { step: '4', title: 'Agent Registration', desc: 'The connector registers your OpenClaw agent on the platform — creates a DSID identity anchor and optional RARA governance enrollment.' },
  { step: '5', title: 'Tool Discovery', desc: 'On connect, the platform sends your agent the full list of 162 available tools across 16 categories. Your agent picks tools by name.' },
  { step: '6', title: 'Execute Tasks', desc: 'Your agent thinks, picks a platform tool (e.g. web_search, memory.read), sends a tool_call via WebSocket. The platform executes and returns results.' },
  { step: '7', title: 'Heartbeat', desc: 'Your agent sends periodic heartbeats so the platform knows it\'s online. If offline >2 min, status updates automatically.' },
  { step: '8', title: 'Earn & Contribute', desc: 'Import custom skills back to the platform. List your agent on the marketplace. Participate in the decentralized agent ecosystem.' },
];

const FAQ_ITEMS = [
  {
    label: 'Architecture',
    labelClass: 'faqLabelArch',
    question: 'What exactly is the OpenClaw connector and how does it work?',
    answer: `<p><strong>The OpenClaw connector is a lightweight bridge service</strong> that connects your local OpenClaw agent (pi-agent-core) to the full ResonantGenesis platform. Here's the architecture:</p>
<p><strong>Your Machine:</strong> OpenClaw runtime (pi-agent-core) runs your autonomous agent locally — it thinks, picks tools, executes, observes, loops. The agent has access to local tools like bash, browser (CDP), and file I/O.</p>
<p><strong>The Connector:</strong> A FastAPI microservice (<code>RG_OpenClaw</code>) that establishes a WebSocket connection to the platform's OpenClaw Gateway. It acts as a bidirectional bridge:</p>
<ul>
<li><strong>Outbound (Agent → Platform):</strong> Your agent calls <code>/skills/execute</code> with a tool name and parameters. The connector routes it to the platform's tool execution engine and returns results.</li>
<li><strong>Inbound (Platform → Agent):</strong> The platform can dispatch tasks to your agent via the WebSocket channel. Your agent processes them locally and streams results back.</li>
</ul>
<p><strong>Wire Protocol:</strong> Standard WebSocket RPC with JSON frames. Requests: <code>{type:"req", id, method, params}</code>. Responses: <code>{type:"res", id, ok, payload}</code>. Events: <code>{type:"event", event, payload}</code>. The same protocol used by the platform's internal agent engine.</p>
<p><strong>No shared database, no shared imports.</strong> The connector communicates with the platform exclusively via HTTP and WebSocket. Your data stays on your machine unless you explicitly send it to a platform tool.</p>`,
  },
  {
    label: 'Auth',
    labelClass: 'faqLabelAuth',
    question: 'How does authentication work? Is my data safe?',
    answer: `<p><strong>Same auth flow as the Resonant IDE and Mining App.</strong> Here's exactly what happens:</p>
<p><strong>Login:</strong> You provide your dev-swat.com credentials (email + password). The connector sends them to the platform auth service over HTTPS and receives a JWT token. The token is stored locally on your machine — never sent to any third party.</p>
<p><strong>All API calls include this JWT.</strong> Every request from your connector to the platform (tool execution, memory access, heartbeat) includes the JWT in the Authorization header. The platform verifies it on every request. Tokens expire and auto-refresh.</p>
<p><strong>Identity layers:</strong> On registration, you get 4 identity anchors:</p>
<ul>
<li><strong>UUID</strong> — platform identity</li>
<li><strong>crypto_hash</strong> — SHA-256 blockchain identity (anchored on-chain)</li>
<li><strong>user_hash</strong> — Hash Sphere semantic identity</li>
<li><strong>universe_id</strong> — Deterministic Anchor Universe ID</li>
</ul>
<p><strong>Your OpenClaw agent gets a DSID:</strong> When registered, your agent receives a Decentralized Semantic Identity — a unique identity hash that's anchored on the ResonantGenesis Blockchain. This creates an immutable provenance trail for your agent's actions.</p>
<p><strong>Data sovereignty:</strong> Your agent runs on YOUR hardware. Tool execution happens on the platform, but the connector only sends what you explicitly request (tool name + parameters). No telemetry, no background data collection, no model training on your data. The connector source is fully open — audit it yourself.</p>
<p><strong>Security hardening:</strong> All platform services run with HSTS, CORS lockdown (locked to dev-swat.com in production), fail-closed auth (no JWT = 503), and <code>X-Internal-Service-Key</code> for service-to-service calls. The same security infrastructure protecting $RGT wallets protects your agent's API calls.</p>`,
  },
  {
    label: 'Platform',
    labelClass: 'faqLabelPlatform',
    question: 'What tools and APIs can my OpenClaw agent actually use?',
    answer: `<p><strong>162 tools across 16 categories</strong> — all available to your agent on day one:</p>
<ul>
<li><strong>Search:</strong> web_search, reddit_search, news_search, academic_search, youtube_search</li>
<li><strong>Memory:</strong> memory.read, memory.write, memory.search — persistent Hash Sphere memory</li>
<li><strong>Developer:</strong> code_visualizer (14 AST analysis tools), github_*, git_*, file operations</li>
<li><strong>Media:</strong> generate_image, text_to_speech, image_analysis</li>
<li><strong>Community:</strong> create_rabbit_post, community interactions</li>
<li><strong>Integrations:</strong> gmail, google_calendar, google_drive, slack, discord</li>
<li><strong>Agents:</strong> spawn sub-agents, agent-to-agent communication</li>
<li><strong>Platform API:</strong> discover_services, discover_api, platform_api — call any of 560+ REST endpoints across 42 microservices</li>
</ul>
<p><strong>Dynamic discovery:</strong> Your agent doesn't need a hardcoded list. Call <code>discover_services</code> to browse services by category. Call <code>discover_api</code> to fetch OpenAPI specs and list endpoints for any service. Call <code>platform_api</code> to invoke any endpoint directly.</p>
<p><strong>No per-tool API keys:</strong> Platform tools are authenticated via your JWT. External integrations (Gmail, Slack) use OAuth flows managed by the platform — your agent triggers the flow, you approve in browser, done.</p>`,
  },
  {
    label: 'Trust',
    labelClass: 'faqLabelTrust',
    question: 'This is a new project — why should I connect my agent to it?',
    answer: `<p><strong>We won't pretend we're established. Here's where we actually stand:</strong></p>
<p><strong>What you can verify right now:</strong></p>
<ul>
<li><strong>Fully open source:</strong> The connector (<a href="https://github.com/DevSwat-ResonantGenesis/RG_OpenClaw" target="_blank" rel="noopener noreferrer">RG_OpenClaw</a>), the agent engine, the tool registry, the mining service, the blockchain — all available on GitHub under <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer">DevSwat-ResonantGenesis</a>.</li>
<li><strong>Real infrastructure:</strong> 42 microservices in Docker Compose, Nginx TLS, JWT auth with fail-closed security, HSTS, CORS lockdown. Not a demo — a production platform at <a href="https://dev-swat.com" target="_blank" rel="noopener noreferrer">dev-swat.com</a>.</li>
<li><strong>Same auth as everything else:</strong> The OpenClaw connector uses the exact same authentication flow as the Resonant IDE and Mining App. One account, one JWT, consistent security across all entry points.</li>
<li><strong>Your agent, your hardware:</strong> The connector is a bridge, not a cage. Your OpenClaw agent runs locally. You control what tools it calls. You can disconnect at any time. The source is open — audit every HTTP call it makes.</li>
</ul>
<p><strong>What we haven't done yet:</strong></p>
<ul>
<li>No third-party security audit (code is open for anyone to audit)</li>
<li>No large agent network yet — we need early participants</li>
<li>Marketplace for agent skills is built but needs community contributions</li>
</ul>
<p><strong>The honest pitch:</strong> If you run OpenClaw agents and want them to have access to web search, persistent memory, code analysis, 560+ platform APIs, and a decentralized identity — without building all that infrastructure yourself — this connector gives you that in 5 minutes. It's free, it's open source, and you can unplug any time.</p>`,
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
<p>The platform services (agent engine, memory, blockchain) that the connector calls are also open source under their respective licenses in the DevSwat-ResonantGenesis GitHub organization.</p>`,
  },
];

const OpenClawPage: React.FC = () => {
  const { theme } = useThemeStore();
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
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Open Source on GitHub
          </div>
          <h1 className={styles.heroTitle}>
            Open<span className={styles.heroAccent}>Claw</span>+
          </h1>
          <p className={styles.heroSubtitle}>
            Connect your local OpenClaw agent to the full ResonantGenesis platform.
            162 tools, 560+ APIs, persistent memory, blockchain identity, and a decentralized agent marketplace —
            all accessible from your own hardware through a single WebSocket bridge.
          </p>
          <div className={styles.heroActions}>
            <a href={GITHUB_DOWNLOAD} className={styles.downloadButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download from GitHub
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadButtonOutline}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
          <div className={styles.heroPlatforms}>
            Python 3.9+ &bull; FastAPI &bull; WebSocket RPC &bull; Same auth as Resonant IDE &amp; Miner
          </div>
          <div style={{ marginTop: 16, width: '100%', maxWidth: 980 }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>One-line install (copy/paste in Terminal)</div>
            <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '10px 12px', overflowX: 'auto', textAlign: 'left' }}>
              <code style={{ color: '#e6edf3', fontSize: 12, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", whiteSpace: 'pre' }}>{ONE_LINE_INSTALL}</code>
            </div>
            <button
              type="button"
              onClick={handleCopyOneLiner}
              style={{ marginTop: 8, background: 'none', border: '1px solid #30363d', borderRadius: 6, color: copiedOneLiner ? '#3fb950' : '#8b949e', fontSize: 12, padding: '6px 10px', cursor: 'pointer' }}
            >
              {copiedOneLiner ? 'One-line copied!' : 'Copy one-line command'}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Setup — Two Column */}
      <section className={styles.setupSection}>
        <div className={styles.setupGrid}>
          {/* Left: Prerequisites */}
          <div>
            <div style={{ background: 'var(--bg-secondary, #111827)', border: '1px solid var(--border-color, #1f2937)', borderRadius: 12, padding: '20px 24px' }}>
              <h3 style={{ color: 'var(--text-primary, #e5e7eb)', fontSize: 13, fontWeight: 600, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6 }}>Requirements</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {REQUIREMENTS.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13, color: 'var(--text-secondary, #94a3b8)' }}>
                    <span style={{ color: 'var(--accent-color, #818cf8)', fontWeight: 600 }}>{r.label}</span>
                    {r.detail && <span style={{ opacity: 0.7 }}>{r.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
            {/* Tip */}
            <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--bg-secondary, #111827)', border: '1px solid var(--border-color, #1f2937)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-primary, #e5e7eb)' }}>Tip:</strong> The connector uses the same auth as the Resonant IDE and Mining App.
              If you already have an account at{' '}
              <a href="https://dev-swat.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color, #818cf8)' }}>dev-swat.com</a>
              {' '}you're already set — just provide your credentials in the <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>.env</code> file.
            </div>
          </div>

          {/* Right: Terminal */}
          <div style={{ position: 'relative', background: '#0d1117', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #21262d', background: '#161b22' }}>
              <span style={{ fontSize: 12, color: '#8b949e', fontFamily: 'monospace' }}>Terminal</span>
              <button
                onClick={handleCopy}
                style={{ background: 'none', border: '1px solid #30363d', borderRadius: 6, color: copied ? '#3fb950' : '#8b949e', fontSize: 12, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ padding: '16px 20px', overflowX: 'auto' }}>
              {SETUP_STEPS.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < SETUP_STEPS.length - 1 ? 8 : 0, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13, lineHeight: 1.6 }}>
                  <span style={{ color: '#3fb950', userSelect: 'none', flexShrink: 0 }}>$</span>
                  <span style={{ color: '#e6edf3' }}>{step.cmd}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Network Flow */}
      <section className={styles.networkFlow}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionDesc}>
          Your OpenClaw agent connects to the platform through a WebSocket bridge.
          It discovers available tools, calls them by name, and receives results in real-time.
          Same auth, same identity, same security as every other platform entry point.
        </p>
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
        <h2 className={styles.sectionTitle}>What Your Agent Gets</h2>
        <p className={styles.sectionDesc}>Full platform access from your own hardware — every tool, every API, every memory system.</p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tool Catalog */}
      <section className={styles.toolCatalog}>
        <h2 className={styles.sectionTitle}>Full Tool Catalog</h2>
        <p className={styles.sectionDesc}>
          Every tool your OpenClaw agent can call — {TOOL_CATALOG.reduce((sum, c) => sum + c.count, 0)} tools across {TOOL_CATALOG.length} categories.
          Click a category to see every tool with its description.
        </p>
        <div className={styles.catalogGrid}>
          {TOOL_CATALOG.map((cat, i) => (
            <div key={i} className={styles.catalogCategory}>
              <button
                className={styles.catalogHeader}
                onClick={() => setOpenCat(openCat === i ? null : i)}
              >
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
        <h2 className={styles.sectionTitle}>Transparency & FAQ</h2>
        <p className={styles.sectionDesc}>
          Connecting your agent to an external platform is a trust decision. Here are honest, code-backed answers.
        </p>
        <div className={styles.faqList}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>
                  <span className={`${styles.faqLabel} ${styles[item.labelClass]}`}>{item.label}</span>
                  {item.question}
                </span>
                <svg
                  className={`${styles.faqChevron} ${openFaq === i ? styles.faqChevronOpen : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === i && (
                <div
                  className={styles.faqAnswer}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <img
            src={theme === 'dark' ? '/logo white.png' : '/logo black.png'}
            alt=""
            className={styles.ctaLogo}
          />
          <h2 className={styles.ctaTitle}>Connect Your Agent Today</h2>
          <p className={styles.ctaDesc}>
            Give your OpenClaw agent access to 162 tools, 560+ APIs, persistent memory, and a decentralized identity.
            Open source. 5-minute setup. Unplug any time.
          </p>
          <div className={styles.ctaActions}>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className={styles.downloadButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View Source on GitHub
            </a>
            <a href={GITHUB_DOWNLOAD} className={styles.downloadButtonOutline}>
              Download ZIP (latest from GitHub)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OpenClawPage;
