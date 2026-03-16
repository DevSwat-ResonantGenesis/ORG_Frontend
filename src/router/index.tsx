import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import OwnerProtectedRoute from './OwnerProtectedRoute';
import PlanRestrictedRoute from './PlanRestrictedRoute';
import { isAuthenticated } from '@/utils/auth-cookies';

// CANONICAL PAGES - Dashboard handles all billing features
const AccountPage = lazy(() => import('../pages/Account/AccountPage'));
// UsagePage removed - all metrics consolidated into Dashboard
const ProfilePageNew = lazy(() => import('../pages/Profile/ProfilePageNew'));

// Dashboards - 4 types: User, Plus, Enterprise, Owner
const UserDashboard = lazy(() => import('../pages/Dashboards/NewUserDashboard'));
const PlusDashboard = lazy(() => import('../pages/Dashboards/PlusDashboard'));
const EnterpriseDashboard = lazy(() => import('../pages/Dashboards/EnterpriseDashboard'));
const OwnerDashboard = lazy(() => import('../pages/Dashboards/OwnerDashboard'));
const V8Page = lazy(() => import('../pages/V8/V8Page'));
const PredictionsPage = lazy(() =>
  import('../pages/Predictions/PredictionsPage-2025')
);

const PredictionDetailPage = lazy(() =>
  import('../pages/Predictions/PredictionDetailPage')
);
const EvidenceGraphPage = lazy(() => import('../pages/EvidenceGraph/EvidenceGraphPage'));
const AnchorsPage = lazy(() => import('../pages/Anchors/AnchorsPage'));
const PoliciesPage = lazy(() => import('../pages/Policies/PoliciesPage-2025'));
const CompliancePage = lazy(() => import('../pages/Compliance/CompliancePage-2025'));
const AuditLogsPage = lazy(() => import('../pages/Audit/AuditLogsPage-2025'));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage-2025'));
const OrganizationPage = lazy(() => import('../pages/Organizations/OrganizationPage'));
// BillingPage removed - billing features merged into ProfilePage
const SystemDashboardPage = lazy(() => import('../pages/Admin/SystemDashboardPage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPageNew'));
const OwnerLoginPage = lazy(() => import('../pages/Auth/OwnerLoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage-2025'));
const HomeNew = lazy(() => import('../pages/HomeNew/HomeNew'));
const SignupPage = lazy(() => import('../pages/Auth/SignupPageNew'));
const TrainingJobsPage = lazy(() => import('../pages/ML/TrainingJobsPage'));
const CreateTrainingJobPage = lazy(() => import('../pages/ML/CreateTrainingJobPage'));
const TrainingJobDetailPage = lazy(() => import('../pages/ML/TrainingJobDetailPage'));
const ModelVersionsPage = lazy(() => import('../pages/ML/ModelVersionsPage'));
const WorkerMonitorPage = lazy(() => import('../pages/ML/WorkerMonitorPage'));
const InvoicesPage = lazy(() => import('../pages/Finance/InvoicesPage'));
const ReportsPage = lazy(() => import('../pages/Finance/ReportsPage'));
const FeatureFlagsPage = lazy(() => import('../pages/Admin/FeatureFlagsPage'));
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));
const HelpCenterPage = lazy(() => import('../pages/Help/HelpCenterPage'));
const HelpArticlePage = lazy(() => import('../pages/Help/HelpArticlePage'));
const ContactPage = lazy(() => import('../pages/Public/ContactPageSimple'));
// Legal pages removed - not needed for MVP
const ValidationToolPage = lazy(() => import('../pages/Public/ValidationToolPageFull'));
const LLMScannerPage = lazy(() => import('../pages/Public/LLMScannerPageFull'));
const AIAuditDashboardPage = lazy(() => import('../pages/AIAudit/AIAuditDashboardPage'));
const AIAuditLogDetailPage = lazy(() => import('../pages/AIAudit/AIAuditLogDetailPage'));
const DSIDPPage = lazy(() => import('../pages/DSIDP/DSIDPPage'));
const ResetPasswordPage = lazy(() => import('../pages/Auth/ResetPasswordPage-2025'));
const OAuthCallbackPage = lazy(() => import('../pages/Auth/OAuthCallback'));
const VerifyEmailPage = lazy(() => import('../pages/Auth/VerifyEmailPage'));
const MFASetupPage = lazy(() => import('../pages/Settings/MFASetupPage'));
const UserManagementPage = lazy(() => import('../pages/Admin/UserManagementPage'));
const CreditsRefundsPage = lazy(() => import('../pages/Finance/CreditsRefundsPage'));
const EvaluationDriftPage = lazy(() => import('../pages/ML/EvaluationDriftPage'));
const HashSphereTestPage = lazy(() => import('../pages/HashSphereTest/HashSphereTestPage'));
const HashSphereFullscreenPage = lazy(() => import('../pages/HashSphere/HashSphereFullscreenPage'));
const TypographyShowcasePage = lazy(() => import('../pages/Typography/TypographyShowcasePage'));
const ResonantChatPage = lazy(() => import('../pages/ResonantChat/ResonantChatPage'));
const ResonantChatSettingsPage = lazy(() => import('../pages/Settings/ResonantChatSettings/ResonantChatSettingsPage'));
const AIChatConsoleV2 = lazy(() => import('../pages/AIChatConsoleV2/AIChatConsoleV2'));
const PricingPage = lazy(() => import('../pages/Public/PricingPageComplete'));
const APIDocsPage = lazy(() => import('../pages/API/APIDocsPage'));
const IDEPage = lazy(() => import('../pages/IDE/IDEPage'));
const BuildPage = lazy(() => import('../pages/Build/BuildPage'));
const EmbeddingTestPage = lazy(() => import('../pages/Test/EmbeddingTestPage'));
const ReviewQueuePage = lazy(() => import('../pages/AIReview/ReviewQueuePage'));
const InvestorPitchDeckPage = lazy(() => import('../pages/Public/InvestorPitchDeckPage'));
const AgentTeamsPage = lazy(() => import('../pages/AgentTeams/AgentTeamsPage'));
const TeamDashboard = lazy(() => import('../pages/AgentTeams/TeamDashboard'));
const MarketplacePage = lazy(() => import('../pages/Marketplace/MarketplacePage'));
const NFTMarketplace = lazy(() => import('../pages/Marketplace/NFTMarketplace'));
const ItemDetailPage = lazy(() => import('../pages/Marketplace/ItemDetailPage'));
const MyInstallationsPage = lazy(() => import('../pages/Marketplace/MyInstallationsPage'));
const PurchasesPage = lazy(() => import('../pages/Marketplace/PurchasesPage'));
const RabbitPage = lazy(() => import('../pages/Rabbit/RabbitPage'));
const WalletPage = lazy(() => import("../pages/Wallet/WalletPage"));
const AgenticChatPage = lazy(() => import("../pages/AgenticChat/AgenticChatPage"));
const DownloadIDEPage = lazy(() => import("../pages/DownloadIDE/DownloadIDEPage"));
const AgentsPage = lazy(() => import('../pages/Agents/AgentOSv2'));
const AgentDashboard = lazy(() => import('../pages/Agents/AgentOSv2'));
const CreateTeamPage = lazy(() => import('../pages/AgentTeams/CreateTeamPage'));
const EditTeamPage = lazy(() => import('../pages/AgentTeams/EditTeamPage'));
const AutonomousAgentDashboard = lazy(() => import('../pages/Dashboards/AutonomousAgentDashboard'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));

// Owner-Only ML Training Page
const MLTrainingPage = lazy(() => import('../pages/Owner/MLTraining'));
const ChatSkillsControlPage = lazy(() => import('../pages/Owner/ChatSkillsControlPage'));
const AgentsControlPage = lazy(() => import('../pages/Owner/AgentsControlPage'));

// DSID-P Protocol Dashboard Pages
const ProtocolDashboard = lazy(() => import('../pages/Protocol/ProtocolDashboard'));
const SemanticExplorer = lazy(() => import('../pages/Protocol/SemanticExplorer'));
const TrustDashboard = lazy(() => import('../pages/Protocol/TrustDashboard'));
const GovernanceCenter = lazy(() => import('../pages/Protocol/GovernanceCenter'));
const ComplianceHub = lazy(() => import('../pages/Protocol/ComplianceHub'));
const SecurityMonitor = lazy(() => import('../pages/Protocol/SecurityMonitor'));
const PerformanceDashboard = lazy(() => import('../pages/Protocol/PerformanceDashboard'));
const BusinessDashboard = lazy(() => import('../pages/Protocol/BusinessDashboard'));
const LiveExecutionMonitor = lazy(() => import('../pages/Protocol/LiveExecutionMonitor'));
const GuidedScenarios = lazy(() => import('../pages/ControlPlane/GuidedScenarios'));
const ControlPlaneOverview = lazy(() => import('../pages/ControlPlane/ControlPlaneOverview'));
const ControlPlaneGuide = lazy(() => import('../pages/ControlPlane/ControlPlaneGuide'));

// Decentralized Network Pages
const AgentBrowserPage = lazy(() => import('../pages/Network/AgentBrowserPage'));
const AgentPublishPage = lazy(() => import('../pages/Network/AgentPublishPage'));
const AgentMarketplacePage = lazy(() => import('../pages/Network/AgentMarketplacePage'));
const WorkflowDesignerPage = lazy(() => import('../pages/Network/WorkflowDesignerPage'));
const VisualWorkflowPage = lazy(() => import("../pages/Network/VisualWorkflowPage"));
const ExecutionHistoryPage = lazy(() => import('../pages/Network/ExecutionHistoryPage'));
const AgentTemplatesPage = lazy(() => import('../pages/Network/AgentTemplatesPage'));
const BlockchainDashboardPage = lazy(() => import("../pages/Network/BlockchainDashboardPage"));

// Enterprise and Community Pages
const EnterprisePage = lazy(() => import('../pages/Enterprise/EnterprisePage'));
const CommunityPage = lazy(() => import('../pages/Community/CommunityPage'));

// Developer Tools Pages
const HashSpherePage = lazy(() => import('../pages/HashSphere/HashSpherePage'));
const ResonantMemoryPage = lazy(() => import('../pages/ResonantMemory/ResonantMemoryPage'));
const CodeVisualizerPage = lazy(() => import('../pages/CodeVisualizer/CodeVisualizerPage'));
const StatePhysicsAPI = lazy(() => import('../pages/StatePhysicsAPI/StatePhysicsAPI'));
const APIKeysPage = lazy(() => import('../pages/APIKeys/APIKeysPage'));
const HashSphereMemoryAPI = lazy(() => import('../pages/HashSphereMemoryAPI/HashSphereMemoryAPI'));
const ConnectProfilesPage = lazy(() => import('../pages/ConnectProfiles/ConnectProfilesPage'));

const withShell = (node: React.ReactNode) => (
  <ProtectedRoute>
    <MainLayout>{node}</MainLayout>
  </ProtectedRoute>
);

const withPublicShell = (node: React.ReactNode) => (
  <MainLayout>{node}</MainLayout>
);

const HomeGate = () => {
  if (isAuthenticated()) {
    return <Navigate to="/resonant-chat" replace />;
  }
  return <HomeNew />;
};

const withRole = (node: React.ReactNode, roles: string[]) =>
  withShell(<RoleRoute allowed={roles}>{node}</RoleRoute>);

// Plan-restricted routes - requires specific subscription plan
const withPlanRestriction = (node: React.ReactNode, requiredPlan: 'free' | 'plus' | 'pro' | 'enterprise') => {
  const normalizedRequiredPlan = (requiredPlan === 'free'
    ? 'developer'
    : requiredPlan === 'pro'
      ? 'plus'
      : requiredPlan) as 'developer' | 'plus' | 'enterprise';

  return (
  <ProtectedRoute>
    <MainLayout>
      <PlanRestrictedRoute requiredPlan={normalizedRequiredPlan}>{node}</PlanRestrictedRoute>
    </MainLayout>
  </ProtectedRoute>
  );
};

// Owner-protected routes - uses separate owner token authentication
// Note: No MainLayout wrapper - owner dashboard has its own header
const withOwnerAuth = (node: React.ReactNode) => (
  <OwnerProtectedRoute>{node}</OwnerProtectedRoute>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: withPublicShell(<HomeGate />)
  },
  {
    path: '/signup',
    element: withPublicShell(<SignupPage />)
  },
  {
    path: '/public/signup',
    element: <Navigate to="/signup" replace />
  },
  // CANONICAL: /account redirects to dashboard
  {
    path: '/account',
    element: <Navigate to="/dashboard" replace />
  },
  // CANONICAL: /usage redirects to dashboard (metrics consolidated)
  {
    path: '/usage',
    element: <Navigate to="/dashboard" replace />
  },
  // /dashboard - User Dashboard (default for all users)
  {
    path: '/dashboard',
    element: withShell(<UserDashboard />)
  },
  // /plus-dashboard - Plus plan users (more credits, advanced features)
  {
    path: '/plus-dashboard',
    element: withShell(<PlusDashboard />)
  },
  // /enterprise-dashboard - Enterprise clients (SSO, employees, roles, audit logs)
  {
    path: '/enterprise-dashboard',
    element: withShell(<EnterpriseDashboard />)
  },
  // Owner Dashboard - For superusers only (regular auth, superuser check in component)
  {
    path: '/owner-dashboard',
    element: withShell(<OwnerDashboard />)
  },
  // Legacy owner route redirect
  {
    path: '/owner',
    element: <Navigate to="/owner-dashboard" replace />
  },
  // Owner-only dedicated pages
  {
    path: '/owner/chat-skills-control',
    element: withShell(<ChatSkillsControlPage />)
  },
  {
    path: '/owner/agents-control',
    element: withShell(<AgentsControlPage />)
  },
  // V8 Engine Page - For superusers only
  {
    path: '/v8',
    element: withShell(<ProtectedRoute><V8Page /></ProtectedRoute>)
  },
  // ResonantGenesisPrivate - For superusers only
  {
    path: '/resonant-genesis-private',
    element: withShell(<ProtectedRoute><V8Page /></ProtectedRoute>)
  },
  {
    path: '/hash-sphere-test',
    element: withShell(<HashSphereTestPage />)
  },
  {
    path: '/hash-sphere/fullscreen',
    element: withShell(<HashSphereFullscreenPage />)
  },
  {
    path: '/resonant-chat-next',
    element: withShell(<ResonantChatPage />)
  },
  {
    path: '/predictions',
    element: withShell(<RoleRoute category="predictions"><PredictionsPage /></RoleRoute>)
  },
  {
    path: '/predictions/:id',
    element: withShell(<RoleRoute category="predictions"><PredictionDetailPage /></RoleRoute>)
  },
  {
    path: '/evidence/:id',
    element: withShell(<RoleRoute category="predictions"><EvidenceGraphPage /></RoleRoute>)
  },
  {
    path: '/anchors',
    element: withRole(<AnchorsPage />, ['admin', 'org_admin'])
  },
  {
    path: '/policies',
    element: withShell(<RoleRoute category="policies"><PoliciesPage /></RoleRoute>)
  },
  {
    path: '/compliance',
    element: withShell(<RoleRoute category="compliance"><CompliancePage /></RoleRoute>)
  },
  {
    path: '/audit',
    element: withShell(<RoleRoute category="audit"><AuditLogsPage /></RoleRoute>)
  },
  {
    path: '/settings',
    element: withShell(<RoleRoute category="settings"><SettingsPage /></RoleRoute>)
  },
  {
    path: '/settings/resonant-chat',
    element: withShell(<RoleRoute category="settings"><ResonantChatSettingsPage /></RoleRoute>)
  },
  {
    path: '/organization',
    element: withShell(<RoleRoute category="organization"><OrganizationPage /></RoleRoute>)
  },
  // Billing redirects to profile (billing features merged into profile)
  {
    path: '/billing',
    element: <Navigate to="/profile" replace />
  },
  {
    path: '/admin/system',
    element: withShell(<RoleRoute category="admin"><SystemDashboardPage /></RoleRoute>)
  },
  {
    path: '/ml/training-jobs',
    element: withShell(<RoleRoute category="ml_ops"><TrainingJobsPage /></RoleRoute>)
  },
  {
    path: '/ml/training-jobs/new',
    element: withShell(<RoleRoute category="ml_ops"><CreateTrainingJobPage /></RoleRoute>)
  },
  {
    path: '/ml/training-jobs/:id',
    element: withShell(<RoleRoute category="ml_ops"><TrainingJobDetailPage /></RoleRoute>)
  },
  {
    path: '/ml/model-versions',
    element: withShell(<RoleRoute category="ml_ops"><ModelVersionsPage /></RoleRoute>)
  },
  {
    path: '/ml/worker',
    element: withShell(<RoleRoute category="ml_ops"><WorkerMonitorPage /></RoleRoute>)
  },
  {
    path: '/autonomous-agents',
    element: withShell(<AutonomousAgentDashboard />)
  },
  {
    path: '/finance/invoices',
    element: withShell(<RoleRoute category="finance"><InvoicesPage /></RoleRoute>)
  },
  {
    path: '/finance/reports',
    element: withShell(<RoleRoute category="finance"><ReportsPage /></RoleRoute>)
  },
  {
    path: '/admin/feature-flags',
    element: withShell(<RoleRoute category="admin"><FeatureFlagsPage /></RoleRoute>)
  },
  // CANONICAL: /profile for user identity with API keys
  {
    path: '/profile',
    element: withShell(<ProfilePage />)
  },
  {
    path: '/help',
    element: withShell(<HelpCenterPage />)
  },
  {
    path: '/help/getting-started/first-prediction',
    element: <Navigate to="/help" replace />
  },
  {
    path: '/help/:category/:article',
    element: withShell(<HelpArticlePage />)
  },
  {
    path: '/login',
    element: withPublicShell(<LoginPage />)
  },
  {
    path: '/owner-login',
    element: withPublicShell(<OwnerLoginPage />)
  },
  {
    path: '/auth/oauth/callback',
    element: <OAuthCallbackPage />
  },
  {
    path: '/forgot-password',
    element: withPublicShell(<ForgotPasswordPage />)
  },
  // Pricing page
  {
    path: '/pricing',
    element: withPublicShell(<PricingPage />)
  },
  {
    path: '/investor-pitch-deck',
    element: withPublicShell(<InvestorPitchDeckPage />)
  },
  // Enterprise page
  {
    path: '/enterprise',
    element: withPublicShell(<EnterprisePage />)
  },
  // Community page
  {
    path: '/community',
    element: withPublicShell(<CommunityPage />)
  },
  {
    path: '/contact',
    element: withPublicShell(<ContactPage />)
  },
  // Legal routes removed - not needed for MVP
  {
    path: '/validate',
    element: withPublicShell(<ValidationToolPage />)
  },
  {
    path: '/public/validate',
    element: withPublicShell(<ValidationToolPage />)
  },
  {
    path: '/llm-scan',
    element: withPublicShell(<LLMScannerPage />)
  },
  {
    path: '/public/llm-scan',
    element: withPublicShell(<LLMScannerPage />)
  },
  {
    path: '/ai-audit',
    element: withShell(<RoleRoute category="audit"><AIAuditDashboardPage /></RoleRoute>)
  },
  {
    path: '/ai-audit/logs/:id',
    element: withShell(<RoleRoute category="audit"><AIAuditLogDetailPage /></RoleRoute>)
  },
  {
    path: '/ai-review',
    element: withShell(<RoleRoute category="audit"><ReviewQueuePage /></RoleRoute>)
  },
  {
    path: '/agents',
    element: <ProtectedRoute><AgentsPage /></ProtectedRoute>
  },
  {
    path: '/agents/:agentId',
    element: <ProtectedRoute><AgentDashboard /></ProtectedRoute>
  },
  {
    path: '/agent-teams',
    element: withShell(<RoleRoute category="predictions"><AgentTeamsPage /></RoleRoute>)
  },
  {
    path: '/agent-teams/:teamId/dashboard',
    element: withShell(<RoleRoute category="predictions"><TeamDashboard /></RoleRoute>)
  },
  {
    path: '/teams',
    element: <Navigate to="/agent-teams" replace />
  },
  {
    path: '/agent-teams/create',
    element: withShell(<RoleRoute category="predictions"><CreateTeamPage /></RoleRoute>)
  },
  {
    path: '/agent-teams/:teamId/edit',
    element: withShell(<RoleRoute category="predictions"><EditTeamPage /></RoleRoute>)
  },
  {
    path: '/marketplace',
    element: withShell(<ProtectedRoute><MarketplacePage /></ProtectedRoute>)
  },
  {
    path: '/marketplace/nft',
    element: withShell(<ProtectedRoute><NFTMarketplace /></ProtectedRoute>)
  },
  {
    path: '/marketplace/items/:itemId',
    element: withShell(<ProtectedRoute><ItemDetailPage /></ProtectedRoute>)
  },
  {
    path: '/marketplace/installations',
    element: withShell(<ProtectedRoute><MyInstallationsPage /></ProtectedRoute>)
  },
  {
    path: '/marketplace/purchases',
    element: withShell(<ProtectedRoute><PurchasesPage /></ProtectedRoute>)
  },
  {
    path: '/wallet',
    element: withShell(<ProtectedRoute><WalletPage /></ProtectedRoute>)
  },
  {
    path: '/resonant_assistant',
    element: withShell(<ProtectedRoute><AgenticChatPage /></ProtectedRoute>)
  },
  {
    path: '/agent',
    element: <Navigate to="/resonant_assistant" replace />
  },
  {
    path: '/reset-password',
    element: withPublicShell(<ResetPasswordPage />)
  },
  {
    path: '/verify-email',
    element: withPublicShell(<VerifyEmailPage />)
  },
  {
    path: '/settings/mfa',
    element: withShell(<MFASetupPage />)
  },
  {
    path: '/admin/users',
    element: withShell(<RoleRoute category="admin"><UserManagementPage /></RoleRoute>)
  },
  {
    path: '/finance/credits-refunds',
    element: withShell(<RoleRoute category="finance"><CreditsRefundsPage /></RoleRoute>)
  },
  {
    path: '/ml/evaluation-drift',
    element: withShell(<RoleRoute category="ml_ops"><EvaluationDriftPage /></RoleRoute>)
  },
  {
    path: '/resonant-chat',
    element: withPublicShell(<ResonantChatPage />) // Public — guest mode handled internally
  },
  // IDE disabled - using Build Page instead
  {
    path: '/ide',
    element: withShell(<ProtectedRoute><IDEPage /></ProtectedRoute>) // IDE page - requires authentication
  },
  {
    path: '/build',
    element: withShell(<BuildPage />) // Standalone Project Builder page
  },
  {
    path: '/ai-chat-console-v2',
    element: withShell(<AIChatConsoleV2 />)
  },
  {
    path: '/api/docs',
    element: withPublicShell(<APIDocsPage />)
  },
  {
    path: '/dsid-p',
    element: withPublicShell(<DSIDPPage />)
  },
  // Decentralized Network - Protected routes (require authentication)
  {
    path: '/network/agents',
    element: withShell(<AgentBrowserPage />)
  },
  {
    path: "/network/node",
    element: withShell(<AgentMarketplacePage />)
  },
  {
    path: '/network/publish',
    element: withShell(<AgentPublishPage />)
  },
  {
    path: '/network/marketplace',
    element: withShell(<AgentMarketplacePage />)
  },
  {
    path: '/network/workflows',
    element: withShell(<WorkflowDesignerPage />)
  },
  {
    path: '/network/workflows/visual',
    element: withShell(<VisualWorkflowPage />)
  },
  {
    path: '/network/history',
    element: withShell(<ExecutionHistoryPage />)
  },
  {
    path: "/network/blockchain",
    element: withShell(<BlockchainDashboardPage />)
  },
  {
    path: '/network/templates',
    element: withShell(<AgentTemplatesPage />)
  },
  // Shortcut routes for network pages
  {
    path: '/agent-browser',
    element: <Navigate to="/network/agents" replace />
  },
  
  {
    path: '/execution-history',
    element: <Navigate to="/network/history" replace />
  },
  {
    path: '/workflow-designer',
    element: <Navigate to="/network/workflows" replace />
  },
  {
    path: '/agent-templates',
    element: <Navigate to="/network/templates" replace />
  },
  {
    path: '/test-embedding',
    element: withPublicShell(<EmbeddingTestPage />) // Public - no auth required for testing
  },
  {
    path: '/api',
    element: withPublicShell(<APIDocsPage />)
  },
  // State Physics API - Public pricing and documentation page
  {
    path: '/state-physics-api',
    element: withPublicShell(<StatePhysicsAPI />)
  },
  // Connect Your Profiles - integrations hub
  {
    path: '/connect-profiles',
    element: withShell(<ConnectProfilesPage />)
  },
  // API Keys Management - Redirect to Profile page
  {
    path: '/api-keys',
    element: <Navigate to="/profile" replace />
  },
  // Settings API Keys - Redirect to Profile page
  {
    path: '/settings/api-keys',
    element: <Navigate to="/profile" replace />
  },
    // Hash Sphere Memory API - Public pricing and documentation page
  {
    path: '/hash-sphere-memory-api',
    element: withPublicShell(<HashSphereMemoryAPI />)
  },
  // Control Plane - Requires Enterprise plan
  {
    path: '/control-plane',
    element: withPlanRestriction(<ControlPlaneOverview />, 'enterprise')
  },
  {
    path: '/control-plane/semantics',
    element: withPlanRestriction(<SemanticExplorer />, 'enterprise')
  },
  {
    path: '/control-plane/trust',
    element: withPlanRestriction(<TrustDashboard />, 'enterprise')
  },
  {
    path: '/control-plane/governance',
    element: withPlanRestriction(<GovernanceCenter />, 'enterprise')
  },
  {
    path: '/control-plane/compliance',
    element: withPlanRestriction(<ComplianceHub />, 'enterprise')
  },
  {
    path: '/control-plane/security',
    element: withPlanRestriction(<SecurityMonitor />, 'enterprise')
  },
  {
    path: '/control-plane/performance',
    element: withPlanRestriction(<PerformanceDashboard />, 'enterprise')
  },
  {
    path: '/control-plane/live',
    element: withPlanRestriction(<LiveExecutionMonitor />, 'enterprise')
  },
  {
    path: '/control-plane/guided',
    element: withPlanRestriction(<ControlPlaneGuide />, 'enterprise')
  },
  // Developer Tools
  {
    path: '/state-physics',
    element: withPublicShell(<HashSpherePage />)
  },
  {
    path: '/hash-sphere',
    element: <Navigate to="/state-physics" replace />
  },
  {
    path: '/resonant-memory',
    element: withPublicShell(<ResonantMemoryPage />)
  },
  {
    path: '/hash-sphere-memory',
    element: <Navigate to="/resonant-memory" replace />
  },
  {
    path: '/code-visualizer',
    element: withPublicShell(<CodeVisualizerPage />)
  },
  {
    path: '/rabbit',
    element: withPublicShell(<RabbitPage />)
  },
  {
    path: '/download-ide',
    element: withPublicShell(<DownloadIDEPage />)
  },
  {
    path: '*',
    element: withPublicShell(<NotFoundPage />)
  }
]);

export default router;
