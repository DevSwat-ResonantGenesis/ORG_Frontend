# FRONTEND ANALYSIS REPORT
## ResonantGenesis Frontend - Complete Analysis
### Generated: December 17, 2025

---

## 1. SUMMARY STATISTICS

| Metric | Count |
|--------|-------|
| **Total Page Files (.tsx)** | 210 |
| **Total Page Directories** | 46 |
| **Total API Service Files** | 50+ |
| **Total Routes Defined** | 65 |
| **Total API Endpoints Called** | 195 |

---

## 2. PAGE DIRECTORIES

| Directory | Description | Files |
|-----------|-------------|-------|
| Admin | Admin dashboard, system, users, feature flags | 7 |
| Agents | Agent management, dashboard | 7 |
| AgentTeams | Team management, creation, editing | 13 |
| AIAudit | AI audit dashboard, logs | 6 |
| AIChatConsoleV2 | Chat console v2 | 4 |
| AIReview | AI review queue | 6 |
| Analytics | Analytics pages | 3 |
| Anchors | Anchor management | 5 |
| API | API documentation | 4 |
| Audit | Audit logs | 9 |
| Auth | Login, signup, OAuth, MFA, password reset | 13 |
| Billing | Billing, payments | 8 |
| Compliance | Compliance dashboard | 9 |
| ControlPlane | Control plane scenarios | 4 |
| Dashboard | User dashboard | 8 |
| Dashboards | Role-based dashboards | 18 |
| DSIDP | DSIDP identity | 4 |
| EvidenceGraph | Evidence visualization | 6 |
| Finance | Invoices, reports, credits | 5 |
| HashSphere | Hash sphere visualization | 4 |
| HashSphereTest | Hash sphere testing | 4 |
| Help | Help center, articles | 6 |
| Home | Marketing home | 3 |
| HomeNew | New home page | 5 |
| IDE | IDE page | 4 |
| Landing | Landing page | 3 |
| Marketplace | NFT marketplace, listings, purchases | 11 |
| ML | Training jobs, model versions, workers | 10 |
| Network | Agent browser, publish, marketplace, workflows | 8 |
| NotFound | 404 page | 4 |
| Onboarding | Onboarding wizard | 3 |
| Organizations | Organization management | 8 |
| Policies | Policy management | 9 |
| Predictions | Predictions, details | 12 |
| Pricing | Pricing page | 3 |
| Profile | User profile | 3 |
| Protocol | Protocol dashboard, trust, governance | 13 |
| Public | Public pages (about, contact, legal, pricing) | 27 |
| ResonantChat | Resonant Chat page | 6 |
| Settings | Settings, MFA, chat settings | 16 |
| shared | Shared components | 4 |
| Test | Test pages | 4 |
| Typography | Typography components | 4 |

---

## 3. ROUTES DEFINED (src/router/index.tsx)

### Public Routes (No Auth Required)
| Path | Page Component |
|------|----------------|
| `/` | HomeNew |
| `/public/signup` | SignupPage |
| `/login` | LoginPage |
| `/forgot-password` | ForgotPasswordPage |
| `/reset-password` | ResetPasswordPage |
| `/pricing` | PricingPage |
| `/about` | AboutPage |
| `/contact` | ContactPage |
| `/public/legal/privacy` | PrivacyPage |
| `/public/legal/terms` | TermsPage |
| `/public/legal/compliance` | LegalCompliancePage |
| `/validate` | ValidationToolPage |
| `/public/validate` | ValidationToolPage |
| `/llm-scan` | LLMScannerPage |
| `/public/llm-scan` | LLMScannerPage |
| `/resonant-chat` | ResonantChatPage |
| `/api/docs` | APIDocsPage |
| `/api` | APIDocsPage |
| `/dsid-p` | DSIDPPage |
| `/test-embedding` | EmbeddingTestPage |

### Protected Routes (Auth Required)
| Path | Page Component | Role Required |
|------|----------------|---------------|
| `/dashboard` | RoleBasedDashboard | - |
| `/hash-sphere-test` | HashSphereTestPage | - |
| `/hash-sphere/fullscreen` | HashSphereFullscreenPage | - |
| `/resonant-chat-next` | ResonantChatPage | - |
| `/predictions` | PredictionsPage | predictions |
| `/predictions/:id` | PredictionDetailPage | predictions |
| `/evidence/:id` | EvidenceGraphPage | predictions |
| `/anchors` | AnchorsPage | admin, org_admin |
| `/policies` | PoliciesPage | policies |
| `/compliance` | CompliancePage | compliance |
| `/audit` | AuditLogsPage | audit |
| `/settings` | SettingsPage | settings |
| `/settings/resonant-chat` | ResonantChatSettingsPage | settings |
| `/settings/mfa` | MFASetupPage | - |
| `/organization` | OrganizationPage | organization |
| `/billing` | BillingPage | billing |
| `/admin/system` | SystemDashboardPage | admin |
| `/admin/users` | UserManagementPage | admin |
| `/admin/feature-flags` | FeatureFlagsPage | admin |
| `/ml/training-jobs` | TrainingJobsPage | ml_ops |
| `/ml/training-jobs/new` | CreateTrainingJobPage | ml_ops |
| `/ml/training-jobs/:id` | TrainingJobDetailPage | ml_ops |
| `/ml/model-versions` | ModelVersionsPage | ml_ops |
| `/ml/worker` | WorkerMonitorPage | ml_ops |
| `/ml/evaluation-drift` | EvaluationDriftPage | ml_ops |
| `/finance/invoices` | InvoicesPage | finance |
| `/finance/reports` | ReportsPage | finance |
| `/finance/credits-refunds` | CreditsRefundsPage | finance |
| `/profile` | ProfilePage | - |
| `/help` | HelpCenterPage | - |
| `/help/:category/:article` | HelpArticlePage | - |
| `/ai-audit` | AIAuditDashboardPage | audit |
| `/ai-audit/logs/:id` | AIAuditLogDetailPage | audit |
| `/ai-review` | ReviewQueuePage | audit |
| `/agents` | AgentsPage | - |
| `/agents/:agentId` | AgentDashboard | - |
| `/agent-teams` | AgentTeamsPage | predictions |
| `/agent-teams/:teamId/dashboard` | TeamDashboard | predictions |
| `/agent-teams/create` | CreateTeamPage | predictions |
| `/agent-teams/:teamId/edit` | EditTeamPage | predictions |
| `/marketplace` | NFTMarketplace | predictions |
| `/marketplace/old` | MarketplacePage | predictions |
| `/marketplace/items/:itemId` | ItemDetailPage | predictions |
| `/marketplace/installations` | MyInstallationsPage | predictions |
| `/marketplace/purchases` | PurchasesPage | predictions |
| `/ide` | IDEPage | - |
| `/ai-chat-console-v2` | AIChatConsoleV2 | - |

### Control Plane Routes
| Path | Page Component |
|------|----------------|
| `/control-plane` | ProtocolDashboard |
| `/control-plane/semantics` | SemanticExplorer |
| `/control-plane/trust` | TrustDashboard |
| `/control-plane/governance` | GovernanceCenter |
| `/control-plane/compliance` | ComplianceHub |
| `/control-plane/security` | SecurityMonitor |
| `/control-plane/performance` | PerformanceDashboard |
| `/control-plane/business` | BusinessDashboard |
| `/control-plane/live` | LiveExecutionMonitor |
| `/control-plane/scenarios` | GuidedScenarios |

---

## 4. API SERVICE FILES (src/api/)

| File | Purpose | Key Endpoints |
|------|---------|---------------|
| `admin.ts` | Admin operations | `/admin/*` |
| `agentApi.ts` | Agent API | `/agents/*` |
| `agentEngine.ts` | Agent engine | `/agents/*` |
| `agents.ts` | Agent CRUD | `/agents/*` |
| `agentTeams.ts` | Team management | `/agent-teams/*` |
| `aiAudit.ts` | AI audit | `/audit/*` |
| `aiReview.ts` | AI review | `/ai-review/*` |
| `anchors.ts` | Anchors | `/anchors/*` |
| `audit.ts` | Audit logs | `/audit/*` |
| `auth.ts` | Authentication | `/auth/*` |
| `billing.ts` | Billing | `/billing/*` |
| `blockchain.ts` | Blockchain | `/blockchain/*` |
| `build.ts` | Build service | `/build/*` |
| `client.ts` | Axios client | - |
| `code.ts` | Code operations | `/code/*` |
| `compliance.ts` | Compliance | `/compliance/*` |
| `crypto.ts` | Crypto | `/crypto/*` |
| `debugger.ts` | Debugger | `/debug/*` |
| `deployment.ts` | Deployment | `/deploy/*` |
| `dsidProtocol.ts` | DSID protocol | `/dsid/*` |
| `enterprise.ts` | Enterprise | `/enterprise/*` |
| `evidence.ts` | Evidence | `/evidence/*` |
| `fastapiClient.ts` | FastAPI client | - |
| `finance.ts` | Finance | `/finance/*` |
| `github.ts` | GitHub integration | `/github/*` |
| `hashSphere.ts` | Hash Sphere | `/hash-sphere/*` |
| `ideService.ts` | IDE service | `/ide/*` |
| `lsp.ts` | LSP | `/lsp/*` |
| `marketplace.ts` | Marketplace | `/marketplace/*` |
| `memoryComplete.ts` | Memory | `/memory/*` |
| `metrics.ts` | Metrics | `/metrics/*` |
| `ml.ts` | ML operations | `/ml/*` |
| `org.ts` | Organization | `/orgs/*` |
| `plugins.ts` | Plugins | `/plugins/*` |
| `policies.ts` | Policies | `/policies/*` |
| `predictions.ts` | Predictions | `/predictions/*` |
| `rag.ts` | RAG | `/rag/*` |
| `resonantChat.ts` | Resonant Chat | `/resonant-chat/*` |
| `settings.ts` | Settings | `/settings/*` |
| `stripe.ts` | Stripe | `/stripe/*` |
| `universe.ts` | Universe | `/universe/*` |
| `usage.ts` | Usage tracking | `/usage/*` |
| `usageTracking.ts` | Usage tracking | `/usage/*` |
| `userApiKeys.ts` | User API keys | `/user/api-keys/*` |
| `users.ts` | User management | `/users/*` |
| `workspace.ts` | Workspace | `/workspace/*` |

---

## 5. ALL FRONTEND API CALLS (Extracted from src/api/)

### Authentication (auth.ts)
- POST `/auth/login`
- POST `/auth/signup`
- POST `/auth/logout`
- POST `/auth/refresh`
- GET `/auth/me`
- POST `/auth/change-password`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- POST `/auth/mfa/setup`
- POST `/auth/mfa/verify`
- POST `/auth/mfa/disable`
- GET `/auth/mfa/status`
- GET `/auth/api-keys`
- POST `/auth/api-keys`
- POST `/auth/api-keys/revoke`
- POST `/auth/sso/oauth/initiate`
- POST `/auth/sso/oauth/callback`
- POST `/auth/sso/saml/initiate`
- POST `/auth/sso/saml/callback`
- GET `/auth/sso/providers`
- GET `/auth/settings/agents`
- POST `/auth/settings/agents`
- POST `/auth/settings/agents/import`
- GET `/auth/settings/agents/shared`
- GET `/auth/settings/agents/templates`

### Agents (agents.ts, agentApi.ts)
- GET `/agents`
- GET `/agents/`
- POST `/agents`
- POST `/agents/`
- GET `/agents/{id}`
- PUT `/agents/{id}`
- DELETE `/agents/{id}`
- POST `/agents/restore-by-hash`

### Agent Teams (agentTeams.ts)
- GET `/agent-teams`
- POST `/agent-teams`
- GET `/agent-teams/{id}`
- PUT `/agent-teams/{id}`
- DELETE `/agent-teams/{id}`
- GET `/agent-teams/my-rentals`

### Billing (billing.ts)
- GET `/billing/overview`
- GET `/billing/plans`
- GET `/billing/subscription`
- POST `/billing/subscription`
- POST `/billing/subscription/cancel`
- POST `/billing/subscription/reactivate`
- POST `/billing/subscription/change-plan`
- POST `/billing/change-plan`
- GET `/billing/invoices`
- GET `/billing/payment-methods`
- POST `/billing/payment-methods`
- DELETE `/billing/payment-methods/{id}`
- GET `/billing/credits`
- GET `/billing/credits/transactions`
- POST `/billing/credits/purchase`
- POST `/billing/checkout/subscription`
- POST `/billing/checkout/credits`
- POST `/billing/portal`
- GET `/billing/usage/summary`
- GET `/billing/usage/metrics`
- POST `/billing/usage/record`
- POST `/billing/token-packs`
- GET `/billing/stripe/subscription`
- POST `/billing/stripe/checkout`
- POST `/billing/stripe/portal`

### Resonant Chat (resonantChat.ts)
- POST `/resonant-chat/conversations`
- POST `/resonant-chat/message`
- GET `/resonant-chat/providers`
- GET `/resonant-chat/provider/stats`
- GET `/resonant-chat/anchors`
- GET `/resonant-chat/clusters`
- GET `/resonant-chat/metrics/{chatId}`
- GET `/resonant-chat/message-metrics/{messageId}`
- GET `/resonant-chat/evidence-graph/{messageId}`

### Audit (audit.ts, aiAudit.ts)
- GET `/audit`
- POST `/audit/audit`
- GET `/audit/ai-audit/logs`
- GET `/audit/ai-audit/logs/{id}`
- GET `/audit/audit/stats`
- GET `/audit/audit/verify`
- GET `/audit/audit/export`
- GET `/audit/compliance/soc2`

### Compliance (compliance.ts)
- GET `/compliance/summary`
- POST `/compliance/report`

### Finance (finance.ts)
- GET `/finance/reports/mrr`
- GET `/finance/reports/usage`
- GET `/finance/invoices`
- GET `/finance/invoices/{id}/download`
- GET `/finance/credits`
- GET `/finance/refunds`
- POST `/finance/credits`
- POST `/finance/refunds`

### ML (ml.ts)
- GET `/ml/predictions`
- GET `/ml/predictions/{id}`
- GET `/ml/training-jobs`
- GET `/ml/training-jobs/{id}`
- POST `/ml/training-jobs`
- POST `/ml/training-jobs/{id}/stop`
- GET `/ml/model-versions`
- POST `/ml/model-versions/{id}/promote`
- POST `/ml/model-versions/{id}/rollback`
- GET `/ml/evaluations`
- POST `/ml/evaluations`
- GET `/ml/drift-detections`
- POST `/ml/drift-detections`
- GET `/ml/worker/metrics`
- GET `/ml/worker/logs`
- POST `/predict`

### IDE (ideService.ts)
- GET `/ide/projects`
- POST `/ide/projects`
- POST `/ide/projects/clone`
- GET `/api/ide/debugger/sessions`
- POST `/api/ide/debugger/sessions`
- GET `/api/ide/terminal/sessions`
- POST `/api/ide/terminal/sessions`

### Code (code.ts)
- POST `/code/complete`
- POST `/code/generate`
- POST `/code/refactor`
- POST `/code/refactor/advanced`
- POST `/code/index`
- POST `/code/lsp/completion`
- POST `/code/lsp/definition`
- POST `/code/lsp/hover`
- POST `/code/lsp/references`
- POST `/code/project/generate`
- POST `/code/project/upload`
- POST `/code/project/restore`
- POST `/code/project/restore-by-hash`
- POST `/code/project/archive`
- POST `/code/project/delete-file`
- POST `/code/project/file/rename`
- POST `/code/project/file/move`

### Memory (memoryComplete.ts)
- POST `/memory/store`
- POST `/memory/store/batch`
- GET `/memory/list`
- POST `/memory/search`
- POST `/memory/search/anchors`
- POST `/memory/clear`
- POST `/memory/embedding`
- POST `/memory/similarity`
- GET `/memory/anchors`
- GET `/memory/sphere/stats`
- GET `/memory/sphere/visualization`
- POST `/memory/sphere/compute`
- POST `/memory/rag/context`
- POST `/memory/rag/augment`

### Hash Sphere (hashSphere.ts)
- POST `/hash-sphere/hash`
- POST `/hash-sphere/resonance`
- GET `/hash-sphere/universes`
- GET `/hash-sphere/universe/current`
- POST `/hash-sphere/universe`
- POST `/hash-sphere/universe/infer`
- POST `/hash-sphere/switch-universe`
- GET `/hash-sphere/health`
- POST `/public/hash-sphere/token`

### Marketplace (marketplace.ts)
- GET `/marketplace/browse`
- GET `/marketplace/search`
- GET `/marketplace/categories`
- GET `/marketplace/featured`
- GET `/marketplace/trending`
- GET `/marketplace/installed`
- GET `/marketplace/purchases`
- POST `/marketplace/listings`
- GET `/marketplace/publisher/dashboard`
- PUT `/marketplace/publisher/profile`
- POST `/marketplace/publisher/payout/setup`

### Admin (admin.ts)
- GET `/admin/system/health`
- GET `/admin/system/metrics`
- GET `/admin/system/logs`
- GET `/admin/metrics/performance`
- GET `/admin/feature-flags`

### Users (users.ts)
- GET `/users`
- GET `/users/{id}`
- POST `/users`
- PUT `/users/{id}`
- DELETE `/users/{id}`
- POST `/users/{id}/assign-role`
- POST `/users/{id}/suspend`
- POST `/users/{id}/reactivate`
- POST `/users/reveal-seed`

### User API Keys (userApiKeys.ts)
- GET `/user/api-keys`
- POST `/user/api-keys`
- POST `/user/api-keys/validate`
- DELETE `/user/api-keys/{id}`
- GET `/user/trial-status`
- GET `/user/service-access`

### Settings (settings.ts)
- GET `/settings/providers`
- POST `/settings/providers`
- DELETE `/settings/providers/{id}`
- GET `/settings/patches/catalog`

### Policies (policies.ts)
- GET `/policies`
- POST `/policies`
- PUT `/policies/{id}`
- DELETE `/policies/{id}`

### Organizations (org.ts)
- GET `/orgs`
- POST `/orgs/invite`
- PUT `/orgs/users/{userId}`

### Usage (usage.ts)
- GET `/usage/summary`
- GET `/usage/metrics`
- GET `/usage/providers`
- GET `/usage/tokens/history`

### Autonomy (autonomy.ts)
- GET `/autonomy/status`
- GET `/autonomy/stats`
- POST `/autonomy/start`
- POST `/autonomy/stop`
- POST `/autonomy/quick-start`
- GET `/autonomy/startup/status`
- GET `/autonomy/brains`
- POST `/autonomy/agents/create`
- GET `/autonomy/network/stats`
- GET `/autonomy/network/hierarchy`
- POST `/autonomy/network/spawn`
- GET `/autonomy/queue/tasks`
- GET `/autonomy/queue/stats`
- GET `/autonomy/watchdog/status`
- GET `/autonomy/watchdog/alerts`

### Blockchain Advanced (advancedBlockchain.ts)
- GET `/advanced/status`
- POST `/advanced/contracts/deploy`
- GET `/advanced/contracts/stats`
- POST `/advanced/shards/add`
- POST `/advanced/shards/rebalance`
- POST `/advanced/shards/transaction`
- POST `/advanced/bridge/initiate`
- POST `/advanced/bridge/message`
- POST `/advanced/bridge/swap`
- POST `/advanced/zk/prove/range`
- POST `/advanced/zk/prove/knowledge`
- POST `/advanced/zk/commitment`
- POST `/advanced/zk/private-transaction`

### GitHub (github.ts)
- POST `/github/clone`
- POST `/github/sync`

### Git (ideService.ts)
- POST `/git/init`
- POST `/git/status`
- POST `/git/add`
- POST `/git/stage`
- POST `/git/unstage`
- POST `/git/commit`
- POST `/git/push`
- POST `/git/branch`
- GET `/git/branches`
- GET `/git/log`

### RAG (rag.ts)
- POST `/rag/ask`
- POST `/rag/files/upload`
- GET `/rag/memories`
- POST `/rag/memories`
- PUT `/rag/memories/{id}`
- DELETE `/rag/memories/{id}`
- GET `/rag/conversations`
- GET `/rag/conversations/{id}`
- PUT `/rag/conversations/{id}`
- DELETE `/rag/conversations/{id}`

### Terminal (ideService.ts)
- POST `/terminal/session/create`
- POST `/terminal/session/{id}/execute`
- DELETE `/terminal/session/{id}`

---

## 6. COMPONENTS STRUCTURE

### Layout Components
- `MainLayout.tsx` - Main app layout with header/sidebar
- `Header/Header.tsx` - App header
- `UnifiedSidebarMenu.tsx` - Sidebar navigation
- `SidebarMenu.tsx` - Legacy sidebar

### Feature Components
- `ResonantChat/` - Chat components
- `IDE/` - IDE components
- `Agents/` - Agent components
- `AgentTeams/` - Team components
- `Marketplace/` - Marketplace components
- `Protocol/` - Protocol dashboard components
- `landing/` - Landing page components

### UI Components
- `ui/` - Base UI components (Button, Card, Modal, etc.)
- `Charts/` - Chart components
- `billing/` - Billing components

---

## 7. KEY OBSERVATIONS

### Strengths
1. Comprehensive page structure with 46 page directories
2. Role-based access control on routes
3. Modular API service files
4. Good separation of concerns

### Issues Found
1. Many API endpoints called but not connected to backend
2. Some routes reference components that may not exist
3. Duplicate API calls across different service files
4. Missing error handling in some API files

### Missing Frontend Integrations
1. No frontend for 450+ blockchain advanced endpoints
2. No frontend for cognitive service endpoints
3. No frontend for workflow service endpoints
4. Limited storage service integration
5. Limited notification service integration

---

*Report generated by automated analysis*
