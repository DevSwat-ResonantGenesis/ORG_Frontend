# Resonant Chat & IDE - Full Capabilities Analysis

## Overview

This document provides a comprehensive analysis of all features in Resonant Chat and IDE Chat, including how to test each feature.

---

## 🤖 Agent System (18 Specialized Agents)

### Core Agents (Original 6)
| Agent | Trigger Keywords | Purpose | Test Command |
|-------|------------------|---------|--------------|
| `reasoning` | analyze, explain why, how does | Deep analysis and reasoning | "Analyze why React uses virtual DOM" |
| `code` | write code, generate, implement | Code generation | "Write a Python function to sort a list" |
| `debug` | fix, debug, error, bug | Bug fixing | "Debug this code: [paste buggy code]" |
| `research` | research, find information, compare | Information gathering | "Research the difference between REST and GraphQL" |
| `summary` | summarize, tldr, brief | Summarization | "Summarize this article: [paste text]" |
| `planning` | plan, strategy, roadmap | Strategic planning | "Plan a migration from React to Next.js" |

### Phase 1 Agents (6 more)
| Agent | Trigger Keywords | Purpose | Test Command |
|-------|------------------|---------|--------------|
| `math` | calculate, math, equation, solve | Mathematical reasoning | "Calculate the derivative of x^3 + 2x" |
| `security` | security, vulnerability, hack | Security analysis | "Review this code for security vulnerabilities" |
| `architecture` | architecture, design pattern | System design | "Design a microservices architecture for e-commerce" |
| `test` | test, unit test, coverage | Test generation | "Write unit tests for this function" |
| `review` | review, critique, feedback | Code review | "Review this code for best practices" |
| `explain` | eli5, simple terms, beginner | ELI5 explanations | "Explain Docker in simple terms" |

### Phase 3 Agents (6 more)
| Agent | Trigger Keywords | Purpose | Test Command |
|-------|------------------|---------|--------------|
| `optimization` | optimize, performance, speed up | Performance optimization | "Optimize this SQL query for performance" |
| `documentation` | document, readme, jsdoc | Documentation generation | "Generate JSDoc for this function" |
| `migration` | migrate, upgrade, convert | Code migration | "Migrate this code from JavaScript to TypeScript" |
| `api` | api, endpoint, rest, graphql | API design | "Design a REST API for user management" |
| `database` | database, sql, query, schema | Database operations | "Design a schema for a blog application" |
| `devops` | deploy, ci/cd, docker, kubernetes | DevOps & deployment | "Create a Dockerfile for this Node.js app" |

### Phase 5 Agents (6 more)
| Agent | Trigger Keywords | Purpose | Test Command |
|-------|------------------|---------|--------------|
| `refactor` | refactor, restructure, clean up | Code refactoring | "Refactor this code using SOLID principles" |
| `accessibility` | accessibility, a11y, wcag | A11y compliance | "Check this HTML for accessibility issues" |
| `i18n` | translate, i18n, localize | Internationalization | "Add i18n support to this React component" |
| `regex` | regex, regular expression, pattern | Regex generation | "Create a regex to validate email addresses" |
| `git` | git, merge, branch, commit | Git operations | "How do I resolve this merge conflict?" |
| `css` | css, style, flexbox, tailwind | CSS/styling | "Create a responsive grid layout with CSS Grid" |

---

## 👥 Team System (9 Internal Teams)

### Original Teams (5)
| Team | Agents | Workflow | Trigger | Test Command |
|------|--------|----------|---------|--------------|
| `code_review_team` | code → review → test | Sequential | "full review", "code audit" | "Do a full review of this code" |
| `security_audit_team` | security + review + architecture | Parallel | "security audit" | "Perform a security audit on this API" |
| `architecture_team` | architecture → review → planning | Sequential | "design system" | "Design a system architecture for this app" |
| `learning_team` | explain → research → summary | Sequential | "teach me", "tutorial" | "Teach me about machine learning" |
| `debug_team` | debug → test → review | Sequential | "fix everything" | "Debug this thoroughly and add tests" |

### Phase 5 Teams (4 more)
| Team | Agents | Workflow | Trigger | Test Command |
|------|--------|----------|---------|--------------|
| `full_stack_team` | api → database → code → test | Sequential | "full stack", "end to end" | "Build a full stack user auth feature" |
| `refactor_team` | review → refactor → test | Sequential | "safe refactor" | "Safely refactor this with tests" |
| `accessibility_team` | accessibility → review → test | Sequential | "accessibility audit" | "Do an accessibility audit on this page" |
| `performance_team` | optimization → review → test | Sequential | "performance audit" | "Optimize this for performance" |

---

## 🔧 Advanced Features (Phase 5)

### 1. Agent Voting System
**Purpose:** Multiple agents generate solutions, then vote on the best one.

**API Endpoint:** `POST /resonant-chat/voting`

**Test:**
```bash
curl -X POST http://localhost:8000/resonant-chat/voting \
  -H "Content-Type: application/json" \
  -d '{"task": "Write a function to reverse a string", "candidate_agents": ["code", "reasoning", "architecture"]}'
```

### 2. Confidence Scoring
**Purpose:** Analyze response quality and confidence level.

**API Endpoint:** `POST /resonant-chat/analyze/confidence`

**Test:**
```bash
curl -X POST http://localhost:8000/resonant-chat/analyze/confidence \
  -H "Content-Type: application/json" \
  -d '{"response": "The answer is definitely 42.", "task": "What is the meaning of life?"}'
```

### 3. User Feedback Loop (👍/👎)
**Purpose:** Collect thumbs up/down feedback to improve agent quality.

**UI Location:** Below each assistant message in Resonant Chat

**API Endpoint:** `POST /resonant-chat/feedback`

**Test:** Click 👍 or 👎 on any assistant message

### 4. Agent Chaining (Custom Pipelines)
**Purpose:** Create custom agent sequences.

**API Endpoints:**
- `GET /resonant-chat/chains` - List available chains
- `POST /resonant-chat/chains` - Create custom chain
- `POST /resonant-chat/chains/execute` - Execute chain

**Built-in Templates:**
- `template_code_quality` - code → review → test → documentation
- `template_research_summary` - research → explain → summary
- `template_secure_code` - code → security → code → test
- `template_refactor_safe` - review → refactor → test → review

### 5. Context Persistence
**Purpose:** Remember project context across sessions.

**API Endpoint:** `POST /resonant-chat/context/project`

**Test:**
```bash
curl -X POST http://localhost:8000/resonant-chat/context/project \
  -H "Content-Type: application/json" \
  -d '{"project_name": "my-react-app"}'
```

### 6. Code Execution Sandbox
**Purpose:** Safely execute code before responding.

**Supported Languages:** Python, JavaScript, SQL (validation), Bash (limited)

**API Endpoint:** `POST /resonant-chat/sandbox/execute`

**Test:**
```bash
curl -X POST http://localhost:8000/resonant-chat/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(2 + 2)", "language": "python"}'
```

### 7. Cross-Validation
**Purpose:** Second agent verifies first agent's output.

**API Endpoint:** `POST /resonant-chat/validate`

**Test:**
```bash
curl -X POST http://localhost:8000/resonant-chat/validate \
  -H "Content-Type: application/json" \
  -d '{"response": "Use import_helper library", "task": "How to import files?", "agent_type": "code"}'
```

### 8. Source Citations
**Purpose:** Auto-add documentation links to responses.

**API Endpoint:** `POST /resonant-chat/analyze/citations`

**Supported Sources:** React, Vue, Angular, Python, JavaScript, TypeScript, Node.js, FastAPI, Django, Next.js, Tailwind, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, Git

### 9. Hallucination Detection
**Purpose:** Flag potentially fabricated information.

**API Endpoint:** `POST /resonant-chat/analyze/hallucinations`

**Detects:**
- Fake libraries/packages
- Non-existent APIs
- Unverified statistics
- Unsupported claims
- Fake version numbers

---

## 🖥️ UI Components

### 1. Agent Selector Dropdown
**Location:** Chat toolbar (📊 Metrics button area)
**Purpose:** Manually select which agent or team to use
**Test:** Click the agent selector dropdown and choose an agent

### 2. Feedback Buttons (👍/👎)
**Location:** Below each assistant message
**Purpose:** Rate response quality
**Test:** Click thumbs up or down on any response

### 3. Metrics Dashboard
**Location:** Click "📊 Metrics" button in toolbar
**Purpose:** View agent performance statistics
**Shows:**
- Execution counts per agent
- Success rates
- Average execution times
- User satisfaction rates
- Trend indicators

### 4. Memory Viewer
**Location:** Click "🧠 Memory" button in toolbar
**Purpose:** View what agents remember about you
**Shows:**
- Recent memories
- Project contexts
- Learned patterns

### 5. Team Visualization
**Purpose:** Show which agents are working in a team
**Shows:**
- Team name and workflow type
- Agent sequence with icons
- Current active agent (highlighted)

---

## 📊 Metrics Explained

### Quality Score (0-100%)
- Based on resonance score from Hash Sphere
- Higher = better response quality
- Calculated from: certainty, structure, relevance

### Hallucination Risk (0-100%)
- Lower = better (less risk of fabrication)
- Based on: uncertainty markers, unsupported claims, vague language
- Red if > 30%, Yellow if > 10%, Green if < 10%

### Resonant Energy
- Measures semantic coherence with context
- Higher = better alignment with conversation

### Evidence Score
- Inverse of hallucination risk
- Higher = more grounded response

### Anchor Following
- How well response follows memory anchors
- Derived from quality score

---

## 🔌 API Endpoints Summary

### Chat Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/resonant-chat/message` | POST | Send a message |
| `/resonant-chat/history/{chat_id}` | GET | Get chat history |
| `/resonant-chat/metrics/{chat_id}` | GET | Get chat metrics |
| `/resonant-chat/message-metrics/{message_id}` | GET | Get message metrics |

### Agent Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/resonant-chat/agents/list` | GET | List all agents |
| `/resonant-chat/agents/stats` | GET | Get agent statistics |
| `/resonant-chat/teams` | GET | List all teams |

### Phase 5 Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/resonant-chat/feedback` | POST | Submit feedback |
| `/resonant-chat/feedback/stats` | GET | Get feedback stats |
| `/resonant-chat/chains` | GET/POST | List/create chains |
| `/resonant-chat/chains/execute` | POST | Execute chain |
| `/resonant-chat/sandbox/execute` | POST | Execute code |
| `/resonant-chat/analyze/confidence` | POST | Analyze confidence |
| `/resonant-chat/analyze/hallucinations` | POST | Detect hallucinations |
| `/resonant-chat/analyze/citations` | POST | Add citations |
| `/resonant-chat/validate` | POST | Cross-validate |
| `/resonant-chat/voting` | POST | Run voting |
| `/resonant-chat/context/project` | POST | Get project context |

---

## 🧪 Testing Guide

### Quick Test Commands

**Test Agent Routing:**
```
"Calculate 2 + 2"  → math agent
"Fix this bug"     → debug agent
"Review this code" → review agent
"Explain Docker"   → explain agent
```

**Test Teams:**
```
"Do a full review of this code"     → code_review_team
"Perform a security audit"          → security_audit_team
"Teach me about React hooks"        → learning_team
```

**Test UI Components:**
1. Send a message
2. Click 👍 or 👎 on the response
3. Click "📊 Metrics" to see dashboard
4. Click "🧠 Memory" to see memory viewer

**Test Chat Sync:**
1. Open Resonant Chat page
2. Open floating chat widget
3. Send message from widget
4. Verify message appears on main page

**Test Persistence:**
1. Send a few messages
2. Refresh the page
3. Verify messages are still there

---

## 🐛 Troubleshooting

### Messages Not Persisting
- Check localStorage key: `resonant-chat-current-conversation`
- Verify backend is saving to database
- Check network tab for API errors

### Metrics Showing 0
- Metrics are calculated from actual responses
- Send a few messages to generate data
- Check `/resonant-chat/metrics/{chat_id}` endpoint

### Floating Widget Not Syncing
- Both use `localStorage` with key `resonant-chat-current-conversation`
- Check for `resonant-chat-sync` event in console
- Verify `triggerChatSync()` is called after sending

### Agent Not Triggering
- Check trigger keywords in message
- Agents are case-insensitive
- Default fallback is `reasoning` agent

---

*Last Updated: December 12, 2025*
*Version: Phase 5 Complete*
