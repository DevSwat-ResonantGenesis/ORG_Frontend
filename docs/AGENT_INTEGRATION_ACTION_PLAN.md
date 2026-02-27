# ResonantGenesis Agent Integration Action Plan

**Author:** Agent 11  
**Date:** 2026-02-28  
**Status:** ALL 4 PHASES COMPLETE ✓

---

## Executive Summary

This plan connects ResonantGenesis platform agents to the team SSH chat, makes the IDE fully functional with GitHub private repo integration, and enables platform agents to use the terminal via SSH — just like the Cascade agents do today.

---

## 1. Research Findings

### 1.1 Resonant Chat (chat_service)
- **Backend:** `chat_service` on port 8010 (FastAPI)
- **Router:** `/resonant-chat/*` with 6 sub-routers: resonant_chat, analytics, streaming, websocket, provider_status_ws, skills
- **Pipeline:** 20+ service layers (ResonanceHasher, RAG, personality DNA, intent engine, emotional normalizer, knowledge graph, thought branching, evidence graph, narrative continuity, temporal threads, token optimizer, causal reasoning, neural gravity, DSID integration, web search, image gen, skill executor)
- **Frontend API:** `src/api/resonantChat.ts` — `sendResonantMessage()` posts to `/resonant-chat/message`
- **Key endpoints:**
  - `POST /resonant-chat/message` — Main chat
  - `GET /resonant-chat/conversations` — History
  - `GET /resonant-chat/analytics` — User analytics
  - `GET /resonant-chat/providers` — Available LLM providers
  - `GET /resonant-chat/evidence-graph/{id}` — Evidence graph
  - `GET /resonant-chat/metrics/{id}` — Chat quality metrics
  - `WS /ws/chat` — Real-time streaming

### 1.2 Agents Page + Agent Engine (agent_engine_service)
- **Backend:** `agent_engine_service` on port 8009 (FastAPI + SQLAlchemy)
- **Routers:** agents, tools, safety, teams, settings, billing, execution, autonomy, wallet, goals, negotiation, approval, dsidp
- **Key endpoints:**
  - `GET/POST /agents` — CRUD agents
  - `POST /agents/{id}/sessions` — Start agent session
  - `GET /agents/tools` — Available tools (web_search, fetch_url, memory.read, memory.write)
  - `GET /agents/{id}/activity` — Activity feed
  - `GET /agents/{id}/logs` — Agent logs
  - `GET /api/v1/platform/health` — Platform health
- **Frontend:** `AgentOSv2.tsx` with 18+ panels (Agents, Chat, Workflow, Sessions, Debug, Governance, Audit, etc.)
- **Agent Store:** Zustand store with full lifecycle (start, stop, pause, resume, archive, fork)

### 1.3 IDE Page (ide_service)
- **Backend:** `ide_service` on port 8080 (FastAPI)
- **Endpoints:**
  - `POST /execute` — Code execution (proxies to code_execution_service)
  - `POST /build` — Project build (proxies to build_service)
  - `POST /chat` — LLM chat (placeholder)
  - Debugger: Full CRUD sessions, breakpoints, step-over/into/out, evaluate
  - Git: init, status, stage, unstage, commit, branch (CRUD), log
  - WebSocket: `/ws/ide`, `/ws/terminal`, `/ws/debug`, `/ws/dsidp-{session_id}`
- **Frontend:**
  - `IDEPage.tsx` → `CursorIDELayoutRefactored.tsx` (modular, 955 lines)
  - Components: CursorChatPanel, CursorEditorView, CursorTabsBar, CursorTerminalPanel, CommandPalette, StatusBar, AdvancedFeaturesPanel
  - API clients: `ideService.ts` (ide/code/terminal/debugger/git), `ideComplete.ts` (full CRUD), `code.ts` (1382 lines — projects, files, git, execution, patches, AST refactor)
- **Terminal:**
  - `CursorTerminalPanel.tsx` — Has tabs, command input, BUT currently uses `simulateCommand()` for local commands
  - Has `executeTerminalCommand()` call but marked as TODO for backend connection
  - Backend `/terminal/execute` route exists in gateway → proxies to code_execution_service
  - WebSocket `/ws/terminal` exists in ide_service but only echoes commands
- **Git:**
  - Frontend `code.ts` has `ideServiceClient` pointing to `http://localhost:8080` (direct to ide_service)
  - Functions: initGitRepo, getGitStatus, stageFiles, commitChanges, manageBranch, listBranches, getCommitLog
  - Backend ide_service has full git implementation using subprocess (init, status, stage, unstage, commit, branch, log)
  - Projects stored at `/tmp/resonant_projects/{project_id}/`
  - **CRITICAL GAP:** No `git remote add`, `git push`, `git pull`, `git clone` in ide_service — only local operations

---

## 2. Action Plan

### Phase 1: Connect Platform Agents to SSH Team Chat
**Goal:** Allow ResonantGenesis platform agents (from agent_engine_service) to send/receive messages in the same SSH-based team chat that Cascade agents use.

#### 1.1 Create Agent Chat Bridge Service (Backend)
- Add new router in `agent_engine_service`: `routers_chat_bridge.py`
- Endpoints:
  - `POST /agents/{agent_id}/chat/send` — Agent sends message to team chat
  - `GET /agents/{agent_id}/chat/read` — Agent reads team chat messages
  - `GET /agents/chat/history` — Get full chat history
- Implementation: Use `asyncio.subprocess` to execute SSH commands to droplet (`ssh deploy@134.199.221.149 "~/cascade_chat/chat.sh {agent_name} send {message}"`)
- Add SSH key to agent_engine_service container (mount from host or use env var)

#### 1.2 Add Chat Panel to AgentOS (Frontend)
- Enhance existing `ChatPanel` in AgentOS (`/Agents/components/Panels/ChatPanel/index.tsx`)
- Add "Team Chat" tab that shows messages from the SSH chat
- Real-time polling (every 5s) or WebSocket bridge
- Allow agents to be triggered to send messages when completing tasks

#### 1.3 Wire Gateway Routes
- Add proxy routes in `gateway/app/routers.py`:
  - `/api/v1/agents/{agent_id}/chat/*` → agent_engine_service

### Phase 2: Make IDE Terminal Fully Functional
**Goal:** Replace simulated terminal with real command execution.

#### 2.1 Implement Real Terminal Backend (ide_service)
- Upgrade `/ws/terminal` WebSocket to use `asyncio.create_subprocess_exec` with PTY
- Create persistent terminal sessions with `/bin/bash`
- Stream stdout/stderr back over WebSocket in real-time
- Support multiple concurrent terminal sessions
- Add environment variables and working directory support

#### 2.2 Connect Frontend Terminal to Real Backend
- Update `CursorTerminalPanel.tsx` to use WebSocket connection to `/ws/terminal`
- Remove `simulateCommand()` fallback
- Add xterm.js integration for proper terminal emulation (colors, cursor, scrollback)
- Wire `executeTerminalCommand()` to the real backend endpoint

#### 2.3 Enable Agent Terminal Access
- Add endpoint: `POST /agents/{agent_id}/terminal/execute`
- Agents can execute commands in their project context
- Rate limiting and command sandboxing for safety
- Log all agent terminal commands to audit trail

### Phase 3: GitHub Private Repo Integration
**Goal:** Connect IDE to private GitHub repos for clone, push, pull.

#### 3.1 Add Git Remote Operations (Backend)
- Add to ide_service `main.py`:
  - `POST /git/clone` — Clone a repo (supports SSH and HTTPS with token)
  - `POST /git/remote` — Add/remove/list remotes
  - `POST /git/push` — Push to remote
  - `POST /git/pull` — Pull from remote
  - `POST /git/fetch` — Fetch from remote
- Support GitHub personal access tokens (stored encrypted in user settings)
- Support SSH keys (generate per-user or use platform key)

#### 3.2 GitHub Token Management (Frontend + Backend)
- Add "GitHub Integration" section to IDE Settings panel
- Store GitHub PAT encrypted in user profile (auth_service)
- Backend endpoint: `POST /ide/github/connect` — Validate and store token
- Backend endpoint: `GET /ide/github/repos` — List user's repos
- Use token for HTTPS clone: `https://{token}@github.com/{owner}/{repo}.git`

#### 3.3 Clone & Sync UI (Frontend)
- Add "Clone Repository" button to IDE toolbar
- Add "Push/Pull" buttons to Git panel
- Show remote tracking status in StatusBar
- Add branch sync indicators

### Phase 4: Platform Agents Use SSH (Like Cascade Agents)
**Goal:** Enable ResonantGenesis platform agents to SSH into the droplet and execute commands, similar to how Cascade agents operate.

#### 4.1 SSH Key Management
- Generate SSH keypair per agent (or per-user)
- Store public key in `~/.ssh/authorized_keys` on droplet
- Store private key encrypted in agent config (agent_engine_service DB)
- Endpoint: `POST /agents/{agent_id}/ssh/setup` — Generate and register key

#### 4.2 SSH Execution Endpoint
- Add to agent_engine_service: `POST /agents/{agent_id}/ssh/execute`
- Parameters: `command`, `host` (default: droplet), `timeout`
- Uses `asyncssh` library for async SSH execution
- Returns stdout, stderr, exit_code
- Full audit logging

#### 4.3 Agent SSH UI
- Add "SSH Terminal" tab to agent detail view in AgentOS
- Show command history and output
- Allow manual command entry (owner-only)
- Show connection status indicator

---

## 3. Implementation Priority

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| P0 | 2.1-2.2 Real Terminal | 2-3 days | IDE becomes usable |
| P0 | 3.1 Git Remote Ops | 1-2 days | GitHub integration |
| P1 | 1.1-1.3 Agent Chat Bridge | 1-2 days | Agent communication |
| P1 | 3.2-3.3 GitHub Token + UI | 1-2 days | Full GitHub flow |
| P2 | 4.1-4.3 Agent SSH | 2-3 days | Agent autonomy |
| P2 | 2.3 Agent Terminal | 1 day | Agent terminal access |

**Total estimated effort: 8-13 days**

---

## 4. Files to Create/Modify

### New Files
1. `agent_engine_service/app/routers_chat_bridge.py` — Agent ↔ SSH chat bridge
2. `ide_service/app/terminal_pty.py` — Real PTY terminal sessions
3. `ide_service/app/git_remote.py` — Git remote operations (clone/push/pull)
4. `agent_engine_service/app/routers_ssh.py` — Agent SSH execution
5. `gateway/app/terminal_routes.py` — Gateway terminal WebSocket proxy (may already exist)

### Modified Files
1. `agent_engine_service/app/main.py` — Include chat_bridge and ssh routers
2. `ide_service/app/main.py` — Include terminal_pty and git_remote routers
3. `gateway/app/routers.py` — Add proxy routes for new endpoints
4. `src/components/IDE/CursorTerminalPanel.tsx` — Real WebSocket terminal
5. `src/components/IDE/CursorIDELayoutRefactored.tsx` — Git remote UI integration
6. `src/api/code.ts` — Add clone, push, pull, remote API functions
7. `src/api/ideService.ts` — Add SSH terminal API functions
8. `src/pages/Agents/components/Panels/ChatPanel/index.tsx` — Team chat integration

---

## 5. Dependencies & Risks

- **SSH Key Access:** agent_engine_service container needs SSH access to droplet. Risk: security exposure. Mitigation: Use dedicated keys with limited permissions.
- **PTY Terminal:** Requires `pty` module in Python. Available on Linux (droplet), may need container adjustment.
- **GitHub Tokens:** Must be encrypted at rest. Use Fernet encryption with platform secret key.
- **WebSocket Stability:** Terminal WebSocket needs reconnection logic and heartbeats.
- **Container Networking:** ide_service and agent_engine_service need network access to droplet (SSH) and GitHub (HTTPS).

---

## 6. Starting Point

Beginning with **Phase 2.1 + 3.1** — making the IDE terminal real and adding git remote operations. These are the highest-impact, lowest-risk changes that make the IDE immediately useful.
