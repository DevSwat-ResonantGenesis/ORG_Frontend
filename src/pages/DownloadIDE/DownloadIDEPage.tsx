import React, { useState } from 'react';
import styles from '../DownloadShared/DownloadPage.module.css';

const GITHUB_REPO = 'https://github.com/DevSwat-ResonantGenesis/RG_IDE';
const GITHUB_DOWNLOAD = 'https://github.com/DevSwat-ResonantGenesis/RG_IDE/archive/refs/heads/main.zip';
const ONE_LINE_INSTALL = `bash <(curl -fsSL https://raw.githubusercontent.com/DevSwat-ResonantGenesis/RG_IDE/main/scripts/install.sh)`;

const SETUP_STEPS = [
  { cmd: 'curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash', note: 'Install nvm (skip if already installed)' },
  { cmd: 'export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"', note: 'Load nvm into this shell' },
  { cmd: 'git clone https://github.com/DevSwat-ResonantGenesis/RG_IDE.git && cd RG_IDE', note: 'Clone the repo (or: cd RG_IDE && git pull)' },
  { cmd: 'nvm install && nvm use', note: 'Use required Node version from .nvmrc (v22.x)' },
  { cmd: 'npm install', note: 'Install dependencies (2-5 min)' },
  { cmd: 'cd extensions/resonant-ai && npm install && npx tsc -p tsconfig.json && cd ../..', note: 'Build the AI extension' },
  { cmd: 'npm run compile', note: 'Compile the IDE (~2 min)' },
  { cmd: './scripts/code.sh', note: 'Launch DevSwat IDE (creates DevSwat IDE.app on first run)' },
];

const QUICK_START = [
  { title: 'Clone & Install', desc: 'Grab the repo, install the right Node version, and run npm install.' },
  { title: 'Build the AI Extension', desc: 'Compile the resonant-ai extension, then compile the IDE itself.' },
  { title: 'Launch & Sign In', desc: 'Run ./scripts/code.sh and log in with your free dev-swat.com account.' },
];

const FEATURE_ICONS = [
  <path key="a" d="M4 17l6-6-6-6M12 19h8" />,
  <>
    <rect key="b1" x="3" y="4" width="18" height="14" rx="2" />
    <path key="b2" d="M7 20h10M9 4v0M12 12h.01" />
  </>,
  <>
    <path key="c1" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path key="c2" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </>,
  <>
    <path key="d1" d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
    <path key="d2" d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
  </>,
  <>
    <circle key="e1" cx="12" cy="12" r="8" />
    <circle key="e2" cx="12" cy="12" r="2" />
    <path key="e3" d="M12 4v2M20 12h-2M12 20v-2M4 12h2" />
  </>,
  <>
    <rect key="f1" x="3" y="11" width="18" height="10" rx="2" />
    <circle key="f2" cx="12" cy="5" r="2" />
    <path key="f3" d="M12 7v4" />
  </>,
];

const FEATURES = [
  { title: '71 Local Tools · 13 Categories', desc: 'File I/O, multi-edit, grep, find, git (status/diff/commit/push/pull/branch), run_command, 8 interactive terminal tools, web search, browser preview, notebook edit, deploy, SSH, Docker, MCP, workflows, checkpoints, and inline SVG/Mermaid visualization — all executed locally via Electron IPC.' },
  { title: '11 AI Providers · Cloud + Local', desc: '6 cloud providers (OpenAI, Anthropic, Groq, Google, DeepSeek, BYOK) + 5 local (Ollama, LM Studio, llama.cpp, LocalAI, vLLM). Server-side fallback chain auto-rotates through keys and providers on failure. You choose the model in the IDE picker.' },
  { title: '14 Code Visualizer Tools', desc: 'AST-based static analysis engine with 14 dedicated tools: scan projects, trace dependency flows, run SAST security audits, detect dead code, score governance compliance (0–100), compare multi-repo drift, verify formal invariants, and compile reversible Graph Analysis Language patches.' },
  { title: 'Hash Sphere Memory', desc: 'Persistent cross-session memory synced with dev-swat.com via save_memory, read_memory, and create_memory tools. The AI stores project context, coding preferences, and decisions — retrieves them semantically across machines.' },
  { title: 'Agentic Chat Loop', desc: 'LLM plans → calls tools → reads results → iterates. Configurable loop depth (1 to unlimited). Smart context compression summarizes large tool outputs to reduce token usage. Interactive terminals let the AI run REPLs, dev servers, and SSH sessions persistently.' },
  { title: 'Platform API Access', desc: 'platform_api_search indexes 450+ backend endpoints across agents, billing, and memory. platform_api_call lets the AI invoke any endpoint directly — turning the IDE into a full control plane for the DevSwat platform.' },
];

const IDE_TOOL_CATALOG = [
  { category: 'Filesystem & Editing', count: 6, tools: [
    { name: 'file_read', desc: 'Read file with optional offset/limit for large files.' },
    { name: 'file_write', desc: 'Create or overwrite a file with new content.' },
    { name: 'file_edit', desc: 'Replace an exact unique string in a file (surgical edits).' },
    { name: 'multi_edit', desc: 'Atomic batch edits on one file — multiple find/replace in sequence.' },
    { name: 'file_list', desc: 'List directory contents with sizes and types.' },
    { name: 'file_delete', desc: 'Delete a file or directory.' },
  ]},
  { category: 'Search & Navigation', count: 2, tools: [
    { name: 'grep_search', desc: 'Search text patterns across files via ripgrep — regex, case-insensitive, glob filters.' },
    { name: 'find_by_name', desc: 'Find files by name glob pattern with depth limits and type filters.' },
  ]},
  { category: 'Terminal & Commands', count: 2, tools: [
    { name: 'run_command', desc: 'Run any shell command (blocking or async) with working directory control.' },
    { name: 'command_status', desc: 'Check background command status and read output.' },
  ]},
  { category: 'Git Operations', count: 5, tools: [
    { name: 'git_clone', desc: 'Clone a Git repository to local path.' },
    { name: 'git_branch', desc: 'Create, list, or switch Git branches.' },
    { name: 'git_merge', desc: 'Merge a branch into current branch.' },
    { name: 'git_push', desc: 'Push commits to remote.' },
    { name: 'git_pull', desc: 'Pull changes from remote.' },
  ]},
  { category: 'Code Visualizer (14 AST Tools)', count: 8, tools: [
    { name: 'code_visualizer_scan', desc: 'Full AST scan — functions, classes, endpoints, imports, pipelines, dead code detection.' },
    { name: 'code_visualizer_functions', desc: 'List all functions and API endpoints in a project.' },
    { name: 'code_visualizer_trace', desc: 'Trace dependency flow from any node through the codebase.' },
    { name: 'code_visualizer_governance', desc: 'Architecture governance audit — reachability, drift detection, health score (0-100).' },
    { name: 'code_visualizer_graph', desc: 'Get full dependency graph as structured data.' },
    { name: 'code_visualizer_pipeline', desc: 'Auto-detect and visualize pipeline flows.' },
    { name: 'code_visualizer_filter', desc: 'Filter graph by file path, node type, or keyword.' },
    { name: 'code_visualizer_by_type', desc: 'Get all nodes of a type — function, class, api_endpoint, service, file, import.' },
  ]},
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
    { name: 'memory_read', desc: 'Search user\'s long-term memory (cross-session, cross-machine).' },
    { name: 'memory_write', desc: 'Save information to long-term memory.' },
    { name: 'memory_search', desc: 'Deep keyword + semantic search through memories.' },
    { name: 'memory_stats', desc: 'Get memory usage stats.' },
    { name: 'hash_sphere_search', desc: 'Search Hash Sphere anchors (hash-verified memories).' },
    { name: 'hash_sphere_anchor', desc: 'Create a new hash-verified memory point.' },
    { name: 'hash_sphere_list_anchors', desc: 'List all user\'s Hash Sphere anchors.' },
    { name: 'hash_sphere_hash', desc: 'Generate a Hash Sphere hash for content.' },
    { name: 'hash_sphere_resonance', desc: 'Check resonance between two content pieces.' },
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
    { name: 'agents_metrics', desc: 'Get agent run metrics.' },
    { name: 'agents_session_cancel', desc: 'Cancel a running session.' },
    { name: 'workspace_snapshot', desc: 'Full overview of workspace.' },
    { name: 'run_agent', desc: 'Directly run an agent with a goal.' },
    { name: 'schedule_agent', desc: 'Set recurring schedule for an agent.' },
    { name: 'present_options', desc: 'Present interactive options to the user.' },
    { name: 'architect_plan', desc: 'Analyze a request and produce a JSON blueprint for agents.' },
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
    { name: 'visualize', desc: 'Generate SVG diagram inline in chat.' },
    { name: 'get_current_time', desc: 'Get current date, time, timezone.' },
    { name: 'get_system_info', desc: 'Get platform system info.' },
  ]},
  { category: 'Platform API', count: 2, tools: [
    { name: 'platform_api_search', desc: 'Search ~383 platform API endpoints by keyword or category.' },
    { name: 'platform_api_call', desc: 'Call any authenticated platform API endpoint directly.' },
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

const IDE_FAQ_ITEMS = [
  {
    label: 'Architecture',
    labelClass: 'faqLabelArch',
    question: 'What exactly is the DevSwat IDE and how does it work?',
    answer: `<p><strong>DevSwat IDE is a fork of VS Code Open Source</strong> (Code-OSS) with a built-in AI extension called <code>resonant-ai</code>. Here's the architecture:</p>
<p><strong>The IDE (Electron):</strong> A full VS Code editor that runs locally on your machine. All file I/O, terminal commands, git operations, and code editing happen through local Electron IPC — nothing goes to the server for tool execution.</p>
<p><strong>The AI Extension:</strong> A TypeScript extension (<code>extensions/resonant-ai/</code>) that provides an agentic chat panel inside the IDE. The AI can plan multi-step workflows, call tools, observe results, and iterate. It supports configurable loop depth (1 to unlimited).</p>
<p><strong>Server provides only:</strong></p>
<ul>
<li><strong>LLM routing:</strong> Your prompts are sent to the selected model (OpenAI, Anthropic, Groq, Google, DeepSeek, Ollama, LM Studio, etc.) via the platform's LLM gateway. Server-side fallback chain auto-rotates through providers on failure.</li>
<li><strong>Memory sync:</strong> Long-term memories are stored in the Hash Sphere memory system on dev-swat.com. The AI saves and retrieves project context, coding preferences, and decisions across sessions and machines.</li>
</ul>
<p><strong>What stays local:</strong> Your code, your files, your terminal sessions, your git repos. The IDE never sends file contents to the server unless the AI needs to use a cloud tool (like web search or image generation).</p>`,
  },
  {
    label: 'Auth',
    labelClass: 'faqLabelAuth',
    question: 'How does authentication work? Is my code safe?',
    answer: `<p><strong>Same JWT auth flow as the OpenClaw connector.</strong></p>
<p><strong>Login:</strong> You provide your dev-swat.com credentials in the IDE settings. The extension authenticates with the platform auth service over HTTPS and receives a JWT token. The token is stored in VS Code's secure credential storage — never in plain text.</p>
<p><strong>What the token is used for:</strong></p>
<ul>
<li><strong>LLM requests:</strong> Your prompts are sent to the LLM gateway with your JWT. The server routes to the model you selected.</li>
<li><strong>Memory sync:</strong> Reading and writing long-term memories to Hash Sphere.</li>
<li><strong>Platform API calls:</strong> If the AI uses platform_api_search or platform_api_call, those are authenticated via your JWT.</li>
</ul>
<p><strong>What is NOT sent to the server:</strong></p>
<ul>
<li>Your source code files (unless the AI calls a cloud tool that needs content)</li>
<li>Your terminal output</li>
<li>Your git credentials</li>
<li>Your local file system structure</li>
</ul>
<p><strong>Identity layers:</strong> On registration, you get identity anchors: UUID (platform), user_hash (Hash Sphere), universe_id (deterministic anchor).</p>
<p><strong>Security hardening:</strong> HSTS, CORS lockdown to dev-swat.com, fail-closed auth (no JWT = 503), rate limiting.</p>`,
  },
  {
    label: 'Tools',
    labelClass: 'faqLabelPlatform',
    question: 'What tools does the IDE AI have access to?',
    answer: `<p><strong>The IDE AI has access to every tool on the platform</strong> — both local tools that execute on your machine and cloud tools that execute on the server:</p>
<p><strong>Local tools (via Electron IPC):</strong></p>
<ul>
<li><strong>Filesystem:</strong> file_read, file_write, file_edit, multi_edit, file_list, file_delete — the AI reads and modifies your code directly</li>
<li><strong>Search:</strong> grep_search (ripgrep), find_by_name — fast codebase navigation</li>
<li><strong>Terminal:</strong> run_command, command_status — the AI runs build commands, tests, dev servers</li>
<li><strong>Git:</strong> git_clone, git_branch, git_merge, git_push, git_pull — full version control</li>
</ul>
<p><strong>Cloud tools (via platform API):</strong></p>
<ul>
<li><strong>Code Visualizer:</strong> 8 AST analysis tools — scan projects, trace dependencies, governance audits, SAST security</li>
<li><strong>Web Search:</strong> web_search, reddit_search, news_search, deep_research, wikipedia</li>
<li><strong>Memory:</strong> memory_read, memory_write, hash_sphere_* — persistent cross-session memory</li>
<li><strong>Media:</strong> generate_image, generate_audio, generate_music</li>
<li><strong>Integrations:</strong> Gmail, Slack, Google Calendar/Drive, Figma, Sigma</li>
<li><strong>Agents:</strong> Create, manage, schedule autonomous agents from inside the IDE</li>
<li><strong>Platform API:</strong> Discover and call any of 560+ REST endpoints across 42 services</li>
</ul>
<p><strong>Total: 137+ tools.</strong> The AI chooses tools based on your request — no manual configuration needed.</p>`,
  },
  {
    label: 'Trust',
    labelClass: 'faqLabelTrust',
    question: 'Why should I use this IDE over VS Code or Cursor?',
    answer: `<p><strong>Honest comparison — here's what we offer vs. what we don't:</strong></p>
<p><strong>What DevSwat IDE does that others don't:</strong></p>
<ul>
<li><strong>Full platform integration:</strong> Your AI assistant isn't just a code helper — it can create agents, search the web, store persistent memories, interact with Google/Slack/GitHub/Figma, run physics simulations, and call 560+ platform APIs. No other IDE AI has this breadth.</li>
<li><strong>14 Code Visualizer tools:</strong> AST-based static analysis with dependency tracing, governance scoring, dead code detection, and architecture drift monitoring. Not just syntax highlighting — actual program analysis.</li>
<li><strong>Hash Sphere Memory:</strong> Your AI remembers context across sessions and across machines. Open a different laptop, and it knows your project structure, your preferences, and your decisions.</li>
<li><strong>Agent Architect:</strong> Design and deploy autonomous agents directly from the IDE chat. Schedule them, give them webhooks, set governance modes.</li>
<li><strong>Fully open source:</strong> Every line of the IDE, the extension, and the platform tools is on GitHub. Cursor and Copilot are closed-source.</li>
</ul>
<p><strong>What we haven't done yet:</strong></p>
<ul>
<li>No Windows/Linux pre-built binaries yet (build from source works on all platforms)</li>
<li>No extension marketplace (yet) — the AI extension is built-in</li>
<li>Smaller community than VS Code — we need early adopters</li>
<li>No inline code completions (tab-complete) yet — the AI works through the chat panel</li>
</ul>
<p><strong>The pitch:</strong> If you want an AI IDE that does more than autocomplete — one that can research, remember, build agents, analyze architecture, and integrate with your entire workflow — DevSwat IDE is that. It's free, open source, and you can fork it.</p>`,
  },
  {
    label: 'License',
    labelClass: 'faqLabelLicense',
    question: 'What license is this under? Can I modify it?',
    answer: `<p><strong>DevSwat IDE is built on Code-OSS</strong> (VS Code Open Source), which is MIT licensed. Our modifications and the <code>resonant-ai</code> extension are source-available under the RG Source Available License.</p>
<p><strong>What it means:</strong></p>
<ul>
<li><strong>Full source access:</strong> Every line of the IDE, the AI extension, the tool implementations, and the platform integration is on GitHub.</li>
<li><strong>You can build and run it:</strong> Clone, compile, run. No binary-only distribution.</li>
<li><strong>Modifications for personal use:</strong> You can modify the code for your own deployments and workflows.</li>
</ul>
<p><strong>Key source files you can audit:</strong></p>
<ul>
<li><strong>AI Extension:</strong> <code>extensions/resonant-ai/src/</code> — all tool implementations, LLM client, chat panel</li>
<li><strong>Tool Registry:</strong> <code>rg_tool_registry/builtin_tools.py</code> — every tool definition with parameters and handlers</li>
<li><strong>LLM Client:</strong> <code>extensions/resonant-ai/src/rg_llm/</code> — how prompts are sent to providers</li>
<li><strong>Memory Integration:</strong> <code>extensions/resonant-ai/src/memory/</code> — how memories are stored and retrieved</li>
</ul>
<p>The platform services that the IDE connects to (agent engine, memory, LLM gateway) are also open source under their respective repos in the <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer">DevSwat-ResonantGenesis</a> organization.</p>`,
  },
];

const REQUIREMENTS = [
  { label: 'Node.js 22.x', detail: '22.22.0 recommended — do NOT use Node 23+ or 25+' },
  { label: 'npm 10.x+', detail: '' },
  { label: 'Python 3.10+', detail: 'for native modules & SAST analysis' },
  { label: 'Xcode CLI Tools', detail: 'macOS, or build-essential on Linux' },
  { label: 'Free account', detail: 'at dev-swat.com — required for AI features' },
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

const DownloadIDEPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);
  const [openCat, setOpenCat] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    <div className={styles.page} data-product="ide">
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <GitHubGlyph size={16} />
            Open Source on GitHub
          </div>
          <h1 className={styles.heroTitle}>
            DevSwat <span className={styles.heroAccent}>IDE</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Fork of VS Code Open Source with a built-in AI extension — 71 local tools across 13 categories,
            agentic chat loop, AST code analysis engine, interactive terminals, and cross-session memory.
            All tools execute locally. Server provides LLM routing and memory sync only.
          </p>
          <div className={styles.heroActions}>
            <a href={GITHUB_DOWNLOAD} className={styles.btnPrimary}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Source Code
            </a>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
              <GitHubGlyph size={18} />
              View on GitHub
            </a>
          </div>
          <div className={styles.heroFacts}>
            {['Build from source', 'Node.js 22 required', 'macOS · Windows · Linux'].map((f) => (
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
              <strong>Tip:</strong> If you have Node 25+, use <code>brew install node@22</code> and prefix with <code>PATH="/opt/homebrew/opt/node@22/bin:$PATH"</code>
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

      {/* Screenshots */}
      <section className={styles.screenshots}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionKicker}>See it in action</span>
          <h2 className={styles.sectionTitle}>A code editor with a real AI teammate</h2>
          <p className={styles.sectionDesc}>
            A professional code editor with an AI assistant that reads, analyzes, and modifies your code.
          </p>
        </div>
        <div className={styles.screenshotGrid}>
          <div className={styles.screenshotCard}>
            <div className={styles.screenshotImageWrap}>
              <img src="/images/showcase/resonant-ide-answer.png" alt="DevSwat IDE — Code Analysis" className={styles.screenshotImage} />
            </div>
            <div className={styles.screenshotCaption}>
              <h3>Deep Code Analysis</h3>
              <p>Analyze project structure, trace execution flows, and generate dependency graphs.</p>
            </div>
          </div>
          <div className={styles.screenshotCard}>
            <div className={styles.screenshotImageWrap}>
              <img src="/images/showcase/resonant-ide-inquiry.png" alt="DevSwat IDE — Agentic Tool Execution" className={styles.screenshotImage} />
            </div>
            <div className={styles.screenshotCaption}>
              <h3>Agentic Tool Execution</h3>
              <p>Watch the AI read files, search code, and execute commands in real-time with full SSE streaming.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionKicker}>What's inside</span>
          <h2 className={styles.sectionTitle}>71 tools, 13 categories, zero telemetry</h2>
          <p className={styles.sectionDesc}>Built-in extension — every tool runs locally on your machine.</p>
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
          <h2 className={styles.sectionTitle}>Every tool the AI can call</h2>
          <p className={styles.sectionDesc}>
            {IDE_TOOL_CATALOG.reduce((sum, c) => sum + c.count, 0)} tools across {IDE_TOOL_CATALOG.length} categories.
            Click a category to see every tool with its description.
          </p>
        </div>
        <div className={styles.catalogGrid}>
          {IDE_TOOL_CATALOG.map((cat, i) => (
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

      {/* Transparency & FAQ */}
      <section className={styles.faq}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionKicker}>Transparency</span>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          <p className={styles.sectionDesc}>
            Running an IDE with an AI assistant is a trust decision. Here are honest, code-backed answers.
          </p>
        </div>
        <div className={styles.faqList}>
          {IDE_FAQ_ITEMS.map((item, i) => (
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
          <h2 className={styles.ctaTitle}>Build with DevSwat</h2>
          <p className={styles.ctaDesc}>
            Open source. Clone it, build it, run it. Your code stays on your machine.
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

export default DownloadIDEPage;
