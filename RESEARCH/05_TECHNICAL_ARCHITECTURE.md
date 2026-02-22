# ResonantGenesis Technical Architecture

## System Overview

ResonantGenesis is a **hybrid architecture** platform combining blockchain identity with traditional database performance.

### Architecture Principles
1. **Blockchain for Identity Only** - Ethereum Base Sepolia L2 for immutable identity registry
2. **Traditional DB for Everything Else** - PostgreSQL for high-performance execution logging
3. **Best of Both Worlds** - Immutability where needed, performance everywhere else
4. **Cost-Effective at Scale** - Avoid blockchain bloat while maintaining verifiability

---

## Blockchain Layer (Ethereum Base Sepolia)

### Smart Contracts

#### IdentityRegistry.sol
**Purpose**: Decentralized Semantic Identity (DSID) management
**Functions**:
- `registerIdentity(bytes32 dsid, bytes publicKey)` - Register new identity
- `getIdentity(bytes32 dsid)` - Retrieve identity details
- `updateStatus(bytes32 dsid, Status newStatus)` - Update identity status
- `transferOwnership(bytes32 dsid, address newOwner)` - Transfer identity

**Storage**:
- Identity owner address
- Public key
- Status (Active, Suspended, Revoked)
- Creation timestamp

#### AgentRegistry.sol
**Purpose**: AI agent registration and manifest tracking
**Functions**:
- `registerAgent(bytes32 manifestHash, string metadataUri)` - Register agent
- `getAgent(bytes32 manifestHash)` - Get agent details
- `updateStatus(bytes32 manifestHash, Status newStatus)` - Update agent status
- `getAgentsByOwner(address owner)` - List owner's agents

**Storage**:
- Agent owner address
- Metadata URI (IPFS/HTTP)
- Status (Active, Paused, Deprecated)
- Registration timestamp

#### MemoryAnchors.sol
**Purpose**: Content hash anchoring for verifiable timestamps
**Functions**:
- `anchor(bytes32 contentHash)` - Anchor content hash
- `getAnchor(bytes32 contentHash)` - Get anchor details
- `verifyBefore(bytes32 contentHash, uint256 timestamp)` - Verify timestamp

**Storage**:
- Content hash
- Owner address
- Timestamp
- Block number

### Why Base Sepolia?
- **Low Cost**: L2 transactions cost pennies vs mainnet dollars
- **Fast**: Sub-second confirmation times
- **Ethereum Security**: Inherits Ethereum mainnet security
- **Production Ready**: Battle-tested L2 infrastructure

---

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: FastAPI (Python) for API layer
- **Database**: PostgreSQL for execution logs and state
- **Cache**: Redis for session management
- **Queue**: RabbitMQ for async task processing
- **Storage**: S3-compatible for file storage

### Core Services

#### 1. Identity Service
- DSID creation and verification
- Blockchain interaction for identity registry
- Public key management
- Status updates

#### 2. Agent Service
- Agent CRUD operations
- Manifest validation
- Capability management
- Trust tier calculation

#### 3. Execution Service
- Agent execution orchestration
- Docker container management
- Resource limit enforcement
- Timeout handling

#### 4. Governance Service
- Policy evaluation engine
- Domain classification
- Pre-execution approval workflow
- Audit logging

#### 5. Team Service
- Multi-agent team management
- Workflow orchestration
- Inter-agent communication
- Team execution coordination

### Database Schema (PostgreSQL)

#### Core Tables
- `identities` - User/agent identities (synced from blockchain)
- `agents` - Agent configurations and state
- `executions` - Execution history and results
- `capabilities` - Agent capability definitions
- `teams` - Multi-agent team configurations
- `workflows` - Workflow execution state
- `audit_logs` - Governance and policy decisions
- `memory_anchors` - Memory content references

#### Execution Logging
- **NOT on blockchain** - Too expensive and slow
- **PostgreSQL** - High-performance, queryable logs
- **Retention**: 90 days hot, 1 year archive
- **Backup**: Daily snapshots to S3

---

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand stores
- **Routing**: React Router v6
- **Styling**: CSS Modules with CSS variables
- **Build**: Vite for fast development
- **Deployment**: Static hosting via Cloudflare

### Component Library (53 Components)
All components are pure React/TypeScript with inline styles:
- Form components (Button, Input, Checkbox, Radio, Switch, etc.)
- Data display (Card, Table, Timeline, Stats, etc.)
- Navigation (Breadcrumbs, Tabs, Dropdown, etc.)
- Feedback (Alert, Toast, Spinner, Skeleton, etc.)
- Overlays (Modal, Drawer, Popover, Tooltip, etc.)

### State Architecture
- **UI Store**: UI state (sidebar, modals, active section)
- **Agent Store**: Agent data and operations
- **Execution Store**: Execution history and status
- **Economy Store**: Wallet and cost tracking

### API Integration
- **FastAPI Client**: Axios-based with interceptors
- **Authentication**: JWT tokens with refresh
- **Error Handling**: Centralized error boundaries
- **Loading States**: Suspense and skeleton screens

---

## Security Architecture

### Sandboxed Execution
- **Docker Containers**: Each agent runs in isolated container
- **Resource Limits**: CPU, memory, network quotas
- **Filesystem**: Read-only with specific mount points
- **Network**: Restricted egress, no ingress
- **Timeout**: Configurable max execution time

### Authentication & Authorization
- **JWT Tokens**: Short-lived access tokens
- **Refresh Tokens**: Long-lived, securely stored
- **API Keys**: Per-tier rate limiting
- **OAuth2**: Third-party integrations
- **2FA**: Optional two-factor authentication

### Data Protection
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: TLS 1.3 everywhere
- **Secrets Management**: Encrypted vault for API keys
- **PII Handling**: GDPR-compliant data handling

---

## Deployment Architecture

### Production Environment
- **Frontend**: Cloudflare Pages (CDN + static hosting)
- **Backend API**: DigitalOcean Droplet (Ubuntu 22.04)
- **Database**: Managed PostgreSQL (DigitalOcean)
- **Redis**: Managed Redis (DigitalOcean)
- **Blockchain**: Base Sepolia RPC endpoints

### CI/CD Pipeline
- **Git**: GitHub repository
- **CI**: GitHub Actions for tests and builds
- **Deployment**: Automated on push to main
- **Monitoring**: Uptime checks and error tracking

### Scaling Strategy
- **Horizontal**: Add more API servers behind load balancer
- **Database**: Read replicas for query scaling
- **Cache**: Redis cluster for distributed caching
- **Queue**: RabbitMQ cluster for task distribution

---

## Integration Architecture

### SDK Support
- **Python SDK**: Full-featured with async/await
- **JavaScript SDK**: Browser and Node.js compatible
- **TypeScript**: Full type definitions
- **React Hooks**: Custom hooks for common operations

### API Design
- **REST**: Standard HTTP methods
- **Versioning**: `/api/v1/` prefix
- **Pagination**: Cursor-based for large datasets
- **Rate Limiting**: Per-tier limits with headers
- **Webhooks**: Event-driven notifications

### External Integrations
- **AI Models**: OpenAI, Anthropic, Google, etc.
- **Tools**: Web search, code execution, file access
- **Webhooks**: GitHub, Slack, Discord, custom
- **Storage**: IPFS for decentralized storage

---

## Performance Characteristics

### Latency
- **API Response**: <100ms p95
- **Agent Execution**: Depends on task (seconds to minutes)
- **Blockchain Writes**: 1-2 seconds (Base Sepolia)
- **Database Queries**: <10ms p95

### Throughput
- **API Requests**: 10K+ requests/second
- **Concurrent Agents**: 1000+ simultaneous executions
- **Database Writes**: 5K+ writes/second
- **Blockchain TPS**: Limited by Base Sepolia (~100 TPS)

### Scalability
- **Users**: Millions (horizontal scaling)
- **Agents**: Unlimited (containerized execution)
- **Executions**: Billions (efficient logging)
- **Storage**: Petabytes (S3-compatible)

---

## Monitoring & Observability

### Metrics
- **Application**: Request rate, error rate, latency
- **Infrastructure**: CPU, memory, disk, network
- **Business**: Active users, agent executions, revenue
- **Blockchain**: Gas costs, transaction success rate

### Logging
- **Application Logs**: Structured JSON logs
- **Audit Logs**: Governance decisions and policy enforcement
- **Execution Logs**: Agent execution history
- **Error Logs**: Exception tracking and alerting

### Alerting
- **Uptime**: Service availability monitoring
- **Performance**: Latency threshold alerts
- **Errors**: Error rate spike detection
- **Security**: Suspicious activity alerts

---

## Disaster Recovery

### Backup Strategy
- **Database**: Daily full backups, hourly incrementals
- **Blockchain**: No backup needed (immutable)
- **Files**: S3 versioning and lifecycle policies
- **Configuration**: Infrastructure as code (Terraform)

### Recovery Procedures
- **RTO**: 1 hour (Recovery Time Objective)
- **RPO**: 1 hour (Recovery Point Objective)
- **Failover**: Automated database failover
- **Restore**: Documented restore procedures

---

**Last Updated**: 2026-02-21  
**Version**: 1.0  
**Status**: Technical Architecture Documented
