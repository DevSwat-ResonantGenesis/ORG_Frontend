import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import OwnerProtectedRoute from './OwnerProtectedRoute';
import PlanRestrictedRoute from './PlanRestrictedRoute';
import { isAuthenticated } from '@/utils/auth-cookies';

// Dashboards
const UserDashboard = lazy(() => import('../pages/Dashboards/NewUserDashboard'));
const PlusDashboard = lazy(() => import('../pages/Dashboards/PlusDashboard'));
const OwnerDashboard = lazy(() => import('../pages/Dashboards/OwnerDashboard'));
const AnchorsPage = lazy(() => import('../pages/Anchors/AnchorsPage'));
const PoliciesPage = lazy(() => import('../pages/Policies/PoliciesPage-2025'));
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
const FeatureFlagsPage = lazy(() => import('../pages/Admin/FeatureFlagsPage'));
// ProfilePage deleted - consolidated into NewUserDashboard
const HelpCenterPage = lazy(() => import('../pages/Help/HelpCenterPage'));
const HelpArticlePage = lazy(() => import('../pages/Help/HelpArticlePage'));
const ContactPage = lazy(() => import('../pages/Public/ContactPageSimple'));
const PrivacyPolicyPage = lazy(() => import('../pages/Public/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('../pages/Public/TermsOfServicePage'));
const ValidationToolPage = lazy(() => import('../pages/Public/ValidationToolPageFull'));
const LLMScannerPage = lazy(() => import('../pages/Public/LLMScannerPageFull'));
const AIAuditDashboardPage = lazy(() => import('../pages/AIAudit/AIAuditDashboardPage'));
const AIAuditLogDetailPage = lazy(() => import('../pages/AIAudit/AIAuditLogDetailPage'));
const ResetPasswordPage = lazy(() => import('../pages/Auth/ResetPasswordPage-2025'));
const OAuthCallbackPage = lazy(() => import('../pages/Auth/OAuthCallback'));
const DesktopCallbackPage = lazy(() => import('../pages/Auth/DesktopCallbackPage'));
const VerifyEmailPage = lazy(() => import('../pages/Auth/VerifyEmailPage'));
const MFASetupPage = lazy(() => import('../pages/Settings/MFASetupPage'));
const UserManagementPage = lazy(() => import('../pages/Admin/UserManagementPage'));
const HashSphereFullscreenPage = lazy(() => import('../pages/HashSphere/HashSphereFullscreenPage'));
const ResonantChatPage = lazy(() => import('../pages/ResonantChat/ResonantChatPage'));
const ResonantChatSettingsPage = lazy(() => import('../pages/Settings/ResonantChatSettings/ResonantChatSettingsPage'));
const PricingPage = lazy(() => import('../pages/Public/PricingPageComplete'));
const APIDocsPage = lazy(() => import('../pages/API/APIDocsPage'));
const ReviewQueuePage = lazy(() => import('../pages/AIReview/ReviewQueuePage'));
const AgentTeamsPage = lazy(() => import('../pages/AgentTeams/AgentTeamsPage'));
const TeamDashboard = lazy(() => import('../pages/AgentTeams/TeamDashboard'));
const WalletPage = lazy(() => import("../pages/Wallet/WalletPage"));
const DownloadMinerPage = lazy(() => import("../pages/DownloadMiner/DownloadMinerPage"));
const DownloadIDEPage = lazy(() => import("../pages/DownloadIDE/DownloadIDEPage"));
const OpenClawPage = lazy(() => import("../pages/OpenClaw/OpenClawPage"));
const AgentsPage = lazy(() => import('../pages/Agents/AgentOSv2'));
const CreateTeamPage = lazy(() => import('../pages/AgentTeams/CreateTeamPage'));
const EditTeamPage = lazy(() => import('../pages/AgentTeams/EditTeamPage'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));

const ChatSkillsControlPage = lazy(() => import('../pages/Owner/ChatSkillsControlPage'));
const AgentsControlPage = lazy(() => import('../pages/Owner/AgentsControlPage'));


// Decentralized Network Pages
const AgentBrowserPage = lazy(() => import('../pages/Network/AgentBrowserPage'));
const AgentPublishPage = lazy(() => import('../pages/Network/AgentPublishPage'));
const AgentMarketplacePage = lazy(() => import('../pages/Network/AgentMarketplacePage'));
const WorkflowDesignerPage = lazy(() => import('../pages/Network/WorkflowDesignerPage'));
const VisualWorkflowPage = lazy(() => import("../pages/Network/VisualWorkflowPage"));
const ExecutionHistoryPage = lazy(() => import('../pages/Network/ExecutionHistoryPage'));
const AgentTemplatesPage = lazy(() => import('../pages/Network/AgentTemplatesPage'));
const BlockchainDashboardPage = lazy(() => import("../pages/Network/BlockchainDashboardPage"));
const NetworkDashboardPage = lazy(() => import("../pages/Network/NetworkDashboardPage"));


// Developer Tools Pages
const HashSpherePage = lazy(() => import('../pages/HashSphere/HashSpherePage'));
const ResonantMemoryPage = lazy(() => import('../pages/ResonantMemory/ResonantMemoryPage'));
const CodeVisualizerPage = lazy(() => import('../pages/CodeVisualizer/CodeVisualizerPage'));
const StatePhysicsAPI = lazy(() => import('../pages/StatePhysicsAPI/StatePhysicsAPI'));
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
  return isAuthenticated() ? <ResonantChatPage /> : <HomeNew />;
};

const withRole = (node: React.ReactNode, roles: string[]) =>
  withShell(<RoleRoute allowed={roles}>{node}</RoleRoute>);

// Plan-restricted routes - requires specific subscription plan
const withPlanRestriction = (node: React.ReactNode, requiredPlan: 'free' | 'developer' | 'plus' | 'pro' | 'enterprise') => {
  const normalizedRequiredPlan = (requiredPlan === 'pro'
      ? 'plus'
      : requiredPlan) as 'free' | 'developer' | 'plus' | 'enterprise';

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
    path: '/chat',
    element: withShell(<ResonantChatPage />)
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
  {
    path: '/hash-sphere/fullscreen',
    element: withShell(<HashSphereFullscreenPage />)
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
  // Billing redirects to dashboard billing tab
  {
    path: '/billing',
    element: <Navigate to="/dashboard?tab=billing" replace />
  },
  {
    path: '/admin/system',
    element: withShell(<RoleRoute category="admin"><SystemDashboardPage /></RoleRoute>)
  },
  {
    path: '/admin/feature-flags',
    element: withShell(<RoleRoute category="admin"><FeatureFlagsPage /></RoleRoute>)
  },
  // Profile now consolidated into dashboard
  {
    path: '/profile',
    element: <Navigate to="/dashboard?tab=profile" replace />
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
    path: '/auth/desktop-callback',
    element: <DesktopCallbackPage />
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
    path: '/contact',
    element: withPublicShell(<ContactPage />)
  },
  {
    path: '/privacy-policy',
    element: withPublicShell(<PrivacyPolicyPage />)
  },
  {
    path: '/terms-of-service',
    element: withPublicShell(<TermsOfServicePage />)
  },
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
    element: <ProtectedRoute><AgentsPage /></ProtectedRoute>
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
    path: '/wallet',
    element: withShell(<ProtectedRoute><WalletPage /></ProtectedRoute>)
  },
  {
    path: '/resonant_assistant',
    element: <Navigate to="/chat" replace />
  },
  {
    path: '/agent',
    element: <Navigate to="/chat" replace />
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
    path: '/resonant-chat',
    element: <Navigate to="/" replace /> // Resonant Chat is now the home page
  },
  {
    path: '/api/docs',
    element: withPublicShell(<APIDocsPage />)
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
    path: "/network",
    element: withPublicShell(<NetworkDashboardPage />)
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
    path: '/api',
    element: withPublicShell(<APIDocsPage />)
  },
  // State Physics API - Public pricing and documentation page
  {
    path: '/state-physics-api',
    element: withPublicShell(<StatePhysicsAPI />)
  },
  // Connect Your Profiles - now consolidated into dashboard integrations tab
  {
    path: '/connect-profiles',
    element: <Navigate to="/dashboard?tab=integrations" replace />
  },
  // API Keys Management - Redirect to dashboard api-keys tab
  {
    path: '/api-keys',
    element: <Navigate to="/dashboard?tab=api-keys" replace />
  },
  // Settings API Keys - Redirect to dashboard api-keys tab
  {
    path: '/settings/api-keys',
    element: <Navigate to="/dashboard?tab=api-keys" replace />
  },
    // Hash Sphere Memory API - Public pricing and documentation page
  {
    path: '/hash-sphere-memory-api',
    element: withPublicShell(<HashSphereMemoryAPI />)
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
    path: '/download-miner',
    element: withPublicShell(<DownloadMinerPage />)
  },
  {
    path: '/download-ide',
    element: withPublicShell(<DownloadIDEPage />)
  },
  {
    path: '/download-openclaw',
    element: withPublicShell(<OpenClawPage />)
  },
]);

export default router;
