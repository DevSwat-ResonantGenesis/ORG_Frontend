# ResonantGenesis Decentralized Network - Complete Analysis

**Generated:** December 17, 2025  
**Scope:** Full analysis of the decentralized agent network across backend node service, blockchain integration, marketplace, and frontend

---

## Executive Summary

ResonantGenesis implements a **decentralized AI agent network** with:
- **Node Service** - Runtime for executing agents in sandboxed environments
- **Governance Engine** - Policy-based trust and safety framework
- **Chain Integration** - Blockchain-based identity and agent registry
- **Marketplace** - Agent publishing, discovery, and monetization
- **Frontend** - 6 Network pages for browsing, executing, and managing agents

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RESONANTGENESIS DECENTRALIZED NETWORK                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐        │
│  │    FRONTEND    │    │   NODE SERVICE │    │   BLOCKCHAIN   │        │
│  │  (React/Vite)  │───▶│   (FastAPI)    │───▶│  (Base Chain)  │        │
│  └────────────────┘    └────────────────┘    └────────────────┘        │
│         │                     │                      │                  │
│         │              ┌──────┴──────┐               │                  │
│         │              │             │               │                  │
│         ▼              ▼             ▼               ▼                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │  Network   │ │  Runtime   │ │ Governance │ │  Identity  │          │
│  │   Pages    │ │  Executor  │ │   Engine   │ │  Registry  │          │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘          │
│         │              │             │               │                  │
│         │              ▼             │               │                  │
│         │       ┌────────────┐       │               │                  │
│         │       │  Sandbox   │◀──────┘               │                  │
│         │       │ Execution  │                       │                  │
│         │       └────────────┘                       │                  │
│         │              │                             │                  │
│         ▼              ▼                             ▼                  │
│  ┌────────────────────────────────────────────────────────────┐       │
│  │                    MARKETPLACE SERVICE                       │       │
│  │  (Listings, Reviews, Purchases, Publisher Profiles)          │       │
│  └────────────────────────────────────────────────────────────┘       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Backend Node Service

**Location:** `resonantgenesis_backend/node/`  
**Port:** 8081  
**Framework:** FastAPI + Uvicorn

### 1.1 Core Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| **ResonantNode** | `core/node.py` | 239 | Main orchestrator, lifecycle management |
| **APIServer** | `api/server.py` | 305 | REST API endpoints |
| **AgentRuntime** | `runtime/executor.py` | 400 | Agent execution in sandboxes |
| **GovernanceEngine** | `runtime/governance.py` | 309 | Policy-based trust enforcement |
| **Sandbox** | `runtime/sandbox.py` | 272 | Isolated execution environment |
| **WorkflowExecutor** | `runtime/workflow.py` | 336 | Multi-agent workflow chains |
| **ChainClient** | `chain/client.py` | 112 | Blockchain interaction |
| **ChainIndexer** | `chain/indexer.py` | ~150 | Index chain data |
| **StorageManager** | `storage/ipfs.py` | ~100 | IPFS content hosting |
| **LocalAgents** | `runtime/local_agents.py` | 146 | Dev/test agent registry |

**Total Backend Node Code: ~2,400 lines**

### 1.2 Node Modes

```python
class NodeMode(Enum):
    RUNTIME = "runtime"      # Execute agents only
    INDEX = "index"          # Index chain data
    STORAGE = "storage"      # Host content (IPFS)
    GATEWAY = "gateway"      # API endpoint only
    FULL = "full"            # All components
```

### 1.3 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/status` | Node status (running, mode, identity, etc.) |
| GET | `/health` | Simple health check |
| GET | `/agents` | Search/list agents |
| GET | `/agents/{hash}` | Get agent details by manifest hash |
| POST | `/execute` | Execute an agent |
| POST | `/workflow/execute` | Execute a multi-agent workflow |
| GET | `/workflow/history` | Get workflow execution history |

### 1.4 Execution Flow

```
Agent Execution Pipeline
========================

1. Request Received
   └─▶ POST /execute { manifest_hash, input_data, user_dsid, trust_tier }

2. Manifest Fetch
   └─▶ Check cache → Local registry → Chain → IPFS

3. Manifest Verification
   └─▶ Compute hash, verify integrity (skip for local dev agents)

4. Governance Evaluation
   └─▶ Policy checks, trust score calculation
   └─▶ Decision: PASS | FLAG | BLOCK

5. Sandbox Creation
   └─▶ Create isolated environment based on trust tier
   └─▶ Resource limits (memory, time, tokens)

6. Code Loading
   └─▶ Fetch from local:// or ipfs://

7. Sandboxed Execution
   └─▶ Run agent code in subprocess
   └─▶ Timeout enforcement
   └─▶ Capture output

8. Result Return
   └─▶ { success, output, execution_hash, tokens_used, duration_ms, governance_decision }
```

---

## 2. Governance Engine

**File:** `runtime/governance.py` (309 lines)

### 2.1 Trust Tiers

| Tier | Name | Threshold | Capabilities |
|------|------|-----------|--------------|
| 0 | Untrusted | 0.9 | Very strict, no dangerous tools |
| 1 | Basic | 0.7 | Limited tools, no network |
| 2 | Standard | 0.5 | Network access, flagged |
| 3 | Elevated | 0.3 | Most tools, agent spawning |
| 4 | Full | 0.1 | All capabilities |

### 2.2 Default Policies

```python
POLICIES = [
    # P001: Block dangerous tools for low trust
    Policy(
        id="p001",
        name="block_dangerous_tools",
        conditions={"tools": ["code.execute", "filesystem.write", "shell.execute"], "trust_tier_below": 2},
        action=BLOCK
    ),
    
    # P002: Flag network access
    Policy(
        id="p002",
        name="flag_network_access",
        conditions={"tools": ["network.http"], "trust_tier_below": 3},
        action=FLAG
    ),
    
    # P003: Rate limit agent spawning
    Policy(
        id="p003",
        name="rate_limit_spawning",
        conditions={"tools": ["agent.spawn"], "rate_limit": {"max": 5, "window": 60}},
        action=BLOCK
    ),
    
    # P004: Block global memory access
    Policy(
        id="p004",
        name="block_memory_cross_access",
        conditions={"memory_scope": "global", "trust_tier_below": 4},
        action=BLOCK
    ),
    
    # P005: Flag high token usage
    Policy(
        id="p005",
        name="flag_high_token_usage",
        conditions={"token_threshold": 10000},
        action=FLAG
    ),
]
```

### 2.3 Trust Score Calculation

```python
def _calculate_trust_score(manifest, context):
    score = 1.0
    
    # Reduce for high-risk tools
    if tool in ["code.execute", "agent.spawn", "filesystem.write", "shell.execute"]:
        score -= 0.15
    
    # Reduce for network access
    if network_config.get("allowedDomains"):
        score -= 0.1
    
    # Boost for audit level
    audit_boosts = {"none": 0, "basic": 0.1, "full": 0.2, "compliance": 0.3}
    score += audit_boosts[audit_level]
    
    # Boost for sandbox isolation
    if sandbox.isolated:
        score += 0.1
    
    # Trust tier boost
    score += context.trust_tier * 0.05
    
    return max(0.0, min(1.0, score))
```

---

## 3. Sandbox Execution

**File:** `runtime/sandbox.py` (272 lines)

### 3.1 Sandbox Configuration

```python
@dataclass
class SandboxConfig:
    max_memory_mb: int = 512        # Memory limit
    max_execution_time: int = 300   # Timeout in seconds
    max_tokens: int = 50000         # Token budget
    isolated: bool = True           # Process isolation
    trust_tier: int = 0             # Trust level
    network_enabled: bool = False   # Network access
    allowed_domains: list = []      # Allowed domains if network enabled
```

### 3.2 Resource Limits by Trust Tier

| Tier | Memory | Timeout | Tokens | Network |
|------|--------|---------|--------|---------|
| 0 (Untrusted) | 256 MB | 150s | 25,000 | ❌ |
| 1 (Basic) | 384 MB | 225s | 37,500 | ❌ |
| 2 (Standard) | 512 MB | 300s | 50,000 | ✅ |
| 3 (Elevated) | 768 MB | 450s | 75,000 | ✅ |
| 4 (Full) | 1024 MB | 600s | 100,000 | ✅ |

### 3.3 Execution Wrapper

```python
# Agent code is wrapped and executed:
exec_script = '''
import sys, json
from pathlib import Path

# Load input
with open(work_dir / "data" / "input.json") as f:
    data = json.load(f)

# Import agent module
import {module_name} as agent_module

# Execute entry point
if hasattr(agent_module, "handle"):
    result = agent_module.handle(input_data, context)
elif hasattr(agent_module, "main"):
    result = agent_module.main(input_data, context)

# Output result
output = {"success": True, "output": result}
'''
```

---

## 4. Workflow Executor

**File:** `runtime/workflow.py` (336 lines)

### 4.1 Workflow Schema

```json
{
  "workflow": {
    "id": "example-workflow",
    "name": "Example Pipeline",
    "version": "1.0.0"
  },
  "steps": [
    {
      "id": "step-1",
      "agent": "0xabc123...",
      "input": { "static": "value" },
      "inputMapping": {
        "text": "$input.text"
      },
      "timeout": 30000,
      "retry": { "maxAttempts": 3, "delayMs": 1000 },
      "onError": "fail"
    },
    {
      "id": "step-2",
      "agent": "0xdef456...",
      "inputMapping": {
        "data": "$steps.step-1.output.result"
      },
      "condition": {
        "if": "$steps.step-1.success == true"
      }
    }
  ],
  "output": {
    "mapping": {
      "finalResult": "$steps.step-2.output"
    }
  }
}
```

### 4.2 Features

- **Sequential execution** - Steps run in order
- **Input/output mapping** - `$input.field`, `$steps.step-1.output`
- **Conditional execution** - `condition.if` expressions
- **Retry logic** - `maxAttempts`, `delayMs`
- **Error handling** - `onError: fail | skip | continue`
- **Timeout per step** - Individual step timeouts

---

## 5. Local Agent Registry

**File:** `runtime/local_agents.py` (146 lines)

### 5.1 Registered Agents

| Manifest Hash | Name | Path |
|---------------|------|------|
| `0x6bf8e49...` | Hello World Agent | `agents/hello-world` |
| `0xfc6a5c4...` | Code Analyzer Agent | `agents/code-analyzer` |
| `0x97a2c79...` | Data Summarizer Agent | `agents/data-summarizer` |
| `0x8979fb0...` | Task Planner Agent | `agents/task-planner` |
| `0x05634df...` | JSON Validator Agent | `agents/json-validator` |

### 5.2 Agent Structure

```
agents/
├── hello-world/
│   ├── manifest.json    # Agent manifest (DSID-P compliant)
│   └── main.py          # Agent code with handle() function
├── code-analyzer/
│   ├── manifest.json
│   └── main.py
└── ...
```

---

## 6. Marketplace Service

**Location:** `marketplace_service/`  
**File:** `app/routers.py` (773 lines)

### 6.1 Data Models

| Model | Purpose |
|-------|---------|
| `AgentListing` | Published agent in marketplace |
| `AgentVersion` | Version history |
| `AgentPurchase` | Purchase records |
| `AgentReview` | User reviews |
| `AgentUsageStats` | Usage analytics |
| `PublisherProfile` | Developer profiles |
| `MarketplaceCategory` | Agent categories |

### 6.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/marketplace/listings` | Create new listing |
| GET | `/marketplace/listings` | Search/filter listings |
| GET | `/marketplace/listings/featured` | Featured agents |
| GET | `/marketplace/listings/{id}` | Get listing details |
| PUT | `/marketplace/listings/{id}` | Update listing |
| POST | `/marketplace/listings/{id}/publish` | Publish draft |
| POST | `/marketplace/listings/{id}/purchase` | Purchase/acquire agent |
| GET | `/marketplace/purchases` | User's purchased agents |
| POST | `/marketplace/listings/{id}/reviews` | Create review |
| GET | `/marketplace/listings/{id}/reviews` | List reviews |
| GET | `/marketplace/categories` | List categories |
| POST | `/marketplace/publisher/profile` | Create/update profile |
| GET | `/marketplace/publisher/{id}` | Get publisher profile |
| GET | `/marketplace/stats` | Marketplace statistics |

### 6.3 Listing Workflow

```
Publisher Flow
==============
1. Create listing (status: "draft")
2. Upload agent code/manifest
3. Configure pricing (free, one-time, subscription, per-execution)
4. Submit for review (status: "pending_review")
5. Publish (status: "published")

Buyer Flow
==========
1. Browse/search listings
2. View details, reviews
3. Purchase (free = instant, paid = Stripe checkout)
4. Access agent config
5. Execute via Node API
```

### 6.4 Pricing Models

| Type | Description |
|------|-------------|
| `free` | No cost, instant access |
| `one_time` | Single purchase |
| `subscription` | Monthly recurring |
| `per_execution` | Pay per use |

---

## 7. Frontend Network Pages

**Location:** `src/pages/Network/`  
**Total Lines:** 129,702 (6 pages)

### 7.1 Page Overview

| Page | File | Lines | Purpose |
|------|------|-------|---------|
| **Agent Browser** | `AgentBrowserPage.tsx` | 472 | Browse and execute agents |
| **Marketplace** | `AgentMarketplacePage.tsx` | 735 | Discover and purchase agents |
| **Publish Agent** | `AgentPublishPage.tsx` | 855 | Publish new agents |
| **Workflow Designer** | `WorkflowDesignerPage.tsx` | 730 | Create multi-agent workflows |
| **Execution History** | `ExecutionHistoryPage.tsx` | 574 | View past executions |
| **Agent Templates** | `AgentTemplatesPage.tsx` | 1,017 | Pre-built agent templates |

### 7.2 Node API Client

**File:** `src/services/nodeApi.ts` (117 lines)

```typescript
// Configuration
const NODE_API_BASE = import.meta.env.VITE_NODE_API_URL || 'http://localhost:8081';

// Types
interface NodeStatus {
  running: boolean;
  mode: string;
  identity: string | null;
  chain_connected: boolean;
  runtime_active: boolean;
  indexer_synced: boolean;
}

interface Agent {
  manifest_hash: string;
  name: string;
  version: string;
  description: string;
  category: string;
  trust_tier: number;
  status: string;
  owner_dsid: string;
  execution_count: number;
}

interface ExecuteResponse {
  success: boolean;
  output: unknown;
  execution_hash: string;
  tokens_used: number;
  duration_ms: number;
  governance_decision: string;
  error?: string;
}

// API Functions
export async function getNodeStatus(): Promise<NodeStatus>
export async function searchAgents(params?): Promise<{ agents: Agent[]; count: number }>
export async function getAgent(manifestHash: string): Promise<Agent | null>
export async function executeAgent(request: ExecuteRequest): Promise<ExecuteResponse>
```

### 7.3 Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/network/agents` | AgentBrowserPage | Browse agents |
| `/network/marketplace` | AgentMarketplacePage | Marketplace |
| `/network/publish` | AgentPublishPage | Publish agent |
| `/network/workflows` | WorkflowDesignerPage | Design workflows |
| `/network/history` | ExecutionHistoryPage | Execution history |
| `/network/templates` | AgentTemplatesPage | Agent templates |

### 7.4 Sidebar Integration

```tsx
// UnifiedSidebarMenu.tsx - Decentralized Network Section
<div className={styles.usmSection}>
  <div className={styles.usmSectionTitle}>Decentralized Network</div>
  
  <button onClick={() => navigate('/network/marketplace')}>
    <span>Marketplace</span>
  </button>
  
  <button onClick={() => navigate('/network/agents')}>
    <span>Agent Browser</span>
  </button>
  
  <button onClick={() => navigate('/network/publish')}>
    <span>Publish Agent</span>
  </button>
  
  <button onClick={() => navigate('/network/workflows')}>
    <span>Workflow Designer</span>
  </button>
  
  <button onClick={() => navigate('/network/history')}>
    <span>Execution History</span>
  </button>
  
  <button onClick={() => navigate('/network/templates')}>
    <span>Agent Templates</span>
  </button>
</div>
```

---

## 8. Chain Integration

**File:** `node/src/resonant_node/chain/client.py` (112 lines)

### 8.1 Smart Contracts (Planned)

| Contract | Purpose |
|----------|---------|
| `IdentityRegistry` | DSID registration and verification |
| `AgentRegistry` | Agent manifest registration |
| `MemoryAnchors` | Memory content hashes |

### 8.2 Chain Configuration

```python
# Default configuration
chain_rpc: str = "https://sepolia.base.org"  # Base Sepolia testnet
identity_contract: str = ""
agent_contract: str = ""
memory_contract: str = ""
```

### 8.3 Current Status

- **Chain client**: Implemented, connects to Base Sepolia
- **Contract calls**: Stubbed (TODO markers)
- **Offline mode**: Supported when web3 not installed

---

## 9. DSID-P Protocol Integration

### 9.1 Identity Format

```
DSID Format: dsid-{type}-{hash16}-{check4}

Types:
- u = User
- o = Organization
- a = Agent
- n = Node

Example: dsid-n-31a5fef8736bdac3-6d2f
```

### 9.2 Agent Manifest Schema

```json
{
  "manifest_version": "1.0.0",
  "agent": {
    "id": "code-analyzer",
    "name": "Code Analyzer",
    "version": "1.0.0",
    "description": "Analyzes code for issues",
    "author": {
      "name": "ResonantGenesis",
      "dsid": "dsid-o-..."
    },
    "tags": ["analysis", "code", "quality"]
  },
  "ownership": {
    "ownerDsid": "dsid-o-...",
    "createdAt": "2024-12-16T00:00:00Z"
  },
  "capabilities": {
    "tools": [
      { "tool": "llm.chat", "params": { "model": "gpt-4" } },
      { "tool": "code.analyze" }
    ],
    "memory": { "scope": "self", "maxSize": "10MB" },
    "network": { "allowedDomains": [] }
  },
  "trust": {
    "tier": 2,
    "auditLevel": "basic",
    "sandbox": {
      "isolated": true,
      "maxMemory": 512,
      "maxExecutionTime": 300,
      "maxTokens": 50000
    }
  },
  "governance": {
    "category": "analysis",
    "compliance": ["safe-output"]
  },
  "code": {
    "runtime": "python",
    "entrypoint": "main.py",
    "sourceUri": "local://agents/code-analyzer/main.py"
  }
}
```

---

## 10. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE DATA FLOW                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  FRONTEND                    NODE SERVICE                  STORAGE        │
│  ────────                    ────────────                  ───────        │
│                                                                           │
│  ┌─────────────┐            ┌─────────────┐              ┌──────────┐   │
│  │  Browser    │  ──────▶   │  API Server │  ──────────▶ │  IPFS    │   │
│  │  /network/* │  HTTP:8081 │  /execute   │  manifest    │  Gateway │   │
│  └─────────────┘            └──────┬──────┘              └──────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│                             ┌─────────────┐              ┌──────────┐   │
│                             │  Runtime    │  ──────────▶ │  Chain   │   │
│                             │  Executor   │  verify      │  Client  │   │
│                             └──────┬──────┘              └──────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│                             ┌─────────────┐                               │
│                             │ Governance  │                               │
│                             │   Engine    │                               │
│                             └──────┬──────┘                               │
│                                    │ decision                             │
│                                    ▼                                      │
│                             ┌─────────────┐                               │
│                             │   Sandbox   │                               │
│                             │  Execution  │                               │
│                             └──────┬──────┘                               │
│                                    │ result                               │
│                                    ▼                                      │
│  ┌─────────────┐            ┌─────────────┐              ┌──────────┐   │
│  │  UI Update  │  ◀──────   │  Response   │  ──────────▶ │  Audit   │   │
│  │  Results    │  JSON      │  Builder    │  log         │  Log     │   │
│  └─────────────┘            └─────────────┘              └──────────┘   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Code Statistics

### Backend

| Service | Files | Lines | Language |
|---------|-------|-------|----------|
| Node Service | 12 | ~2,400 | Python |
| Blockchain Service | 20+ | ~5,000 | Python |
| Marketplace Service | 8 | ~1,500 | Python |
| **Total Backend** | **40+** | **~9,000** | **Python** |

### Frontend

| Component | Files | Lines | Language |
|-----------|-------|-------|----------|
| Network Pages | 6 | 4,383 | TypeScript/React |
| Node API Client | 1 | 117 | TypeScript |
| Sidebar Integration | 1 | ~100 | TypeScript/React |
| **Total Frontend** | **8** | **~4,600** | **TypeScript** |

### Grand Total: ~13,600 lines of decentralized network code

---

## 12. Integration Points

### 12.1 Frontend → Node Service

```typescript
// nodeApi.ts connects to:
const NODE_API_BASE = 'http://localhost:8081';

// Endpoints used:
GET  /status     → NodeStatus
GET  /agents     → Agent[]
GET  /agents/:id → Agent
POST /execute    → ExecuteResponse
```

### 12.2 Node Service → Chain

```python
# chain/client.py connects to:
rpc_url = "https://sepolia.base.org"

# Contract interactions (TODO):
- IdentityRegistry.getIdentity(dsid)
- AgentRegistry.getAgent(manifestHash)
- MemoryAnchors.getAnchor(contentHash)
```

### 12.3 Node Service → IPFS

```python
# storage/ipfs.py fetches from:
ipfs_gateway = "https://ipfs.io/ipfs/"

# Operations:
- Fetch manifest JSON
- Fetch agent code
- Store execution results
```

---

## 13. Gap Analysis

### 13.1 Backend Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| Chain contract calls | **High** | `get_agent()`, `get_identity()` are stubbed |
| IPFS upload | **Medium** | Only download implemented |
| Agent versioning | **Medium** | Single version per agent |
| Execution persistence | **Low** | History not persisted to DB |

### 13.2 Frontend Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| Real-time status | **Medium** | No WebSocket for live updates |
| Workflow persistence | **Medium** | Workflows not saved to backend |
| Agent analytics | **Low** | Execution metrics not visualized |

### 13.3 Integration Gaps

| Gap | Priority | Description |
|-----|----------|-------------|
| Auth integration | **High** | Node API doesn't verify user tokens |
| Billing integration | **Medium** | Executions not tracked for billing |
| Error handling | **Low** | Better error messages needed |

---

## 14. Starting the Network

### Start Node Service

```bash
cd /Users/devswat/resonantgenesis_backend/node
source venv/bin/activate
pip install -e .
resonant-node start --mode full --port 8081
```

### Start Frontend

```bash
cd /Applications/ResonantGraphAI_FrontendV0.1
npm run dev  # Port 5175
```

### Verify Connection

```bash
# Check node status
curl http://localhost:8081/status

# List agents
curl http://localhost:8081/agents

# Execute agent
curl -X POST http://localhost:8081/execute \
  -H "Content-Type: application/json" \
  -d '{
    "manifest_hash": "PRIVATE_KEY_PLACEHOLDER_2",
    "input_data": {"message": "Hello"},
    "user_dsid": "dsid-u-test-0000",
    "trust_tier": 2
  }'
```

---

## Appendix: File Reference

### Backend Node Service

| File | Path | Lines |
|------|------|-------|
| `node.py` | `node/src/resonant_node/core/node.py` | 239 |
| `identity.py` | `node/src/resonant_node/core/identity.py` | ~100 |
| `crypto.py` | `node/src/resonant_node/core/crypto.py` | ~80 |
| `server.py` | `node/src/resonant_node/api/server.py` | 305 |
| `executor.py` | `node/src/resonant_node/runtime/executor.py` | 400 |
| `governance.py` | `node/src/resonant_node/runtime/governance.py` | 309 |
| `sandbox.py` | `node/src/resonant_node/runtime/sandbox.py` | 272 |
| `workflow.py` | `node/src/resonant_node/runtime/workflow.py` | 336 |
| `local_agents.py` | `node/src/resonant_node/runtime/local_agents.py` | 146 |
| `client.py` | `node/src/resonant_node/chain/client.py` | 112 |
| `indexer.py` | `node/src/resonant_node/chain/indexer.py` | ~150 |
| `ipfs.py` | `node/src/resonant_node/storage/ipfs.py` | ~100 |

### Backend Marketplace Service

| File | Path | Lines |
|------|------|-------|
| `routers.py` | `marketplace_service/app/routers.py` | 773 |
| `models.py` | `marketplace_service/app/models.py` | ~200 |
| `payments.py` | `marketplace_service/app/payments.py` | 383 |
| `reviews.py` | `marketplace_service/app/reviews.py` | ~150 |

### Frontend Network Pages

| File | Path | Lines |
|------|------|-------|
| `AgentBrowserPage.tsx` | `src/pages/Network/AgentBrowserPage.tsx` | 472 |
| `AgentMarketplacePage.tsx` | `src/pages/Network/AgentMarketplacePage.tsx` | 735 |
| `AgentPublishPage.tsx` | `src/pages/Network/AgentPublishPage.tsx` | 855 |
| `WorkflowDesignerPage.tsx` | `src/pages/Network/WorkflowDesignerPage.tsx` | 730 |
| `ExecutionHistoryPage.tsx` | `src/pages/Network/ExecutionHistoryPage.tsx` | 574 |
| `AgentTemplatesPage.tsx` | `src/pages/Network/AgentTemplatesPage.tsx` | 1,017 |
| `nodeApi.ts` | `src/services/nodeApi.ts` | 117 |

---

*Report generated by automated analysis of ResonantGenesis codebase*
*December 17, 2025*
