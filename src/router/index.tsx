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
const AIAuditDashboardPage = lazy(() => import('../pages/AIAudit/AIAuditDashboardPage'));
const AIAuditLogDetailPage = lazy(() => import('../pages/AIAudit/AIAuditLogDetailPage'));
const ResetPasswordPage = lazy(() => import('../pages/Auth/ResetPasswordPage-2025'));
const OAuthCallbackPage = lazy(() => import('../pages/Auth/OAuthCallback'));
const DesktopCallbackPage = lazy(() => import('../pages/Auth/DesktopCallbackPage'));
const VerifyEmailPage = lazy(() => import('../pages/Auth/VerifyEmailPage'));
const MFASetupPage = lazy(() => import('../pages/Settings/MFASetupPage'));
const UserManagementPage = lazy(() => import('../pages/Admin/UserManagementPage'));
const ResonantChatPage = lazy(() => import('../pages/ResonantChat/ResonantChatPage'));
const ResonantChatSettingsPage = lazy(() => import('../pages/Settings/ResonantChatSettings/ResonantChatSettingsPage'));
const PricingPage = lazy(() => import('../pages/Public/PricingPageComplete'));
const APIDocsPage = lazy(() => import('../pages/API/APIDocsPage'));
const ReviewQueuePage = lazy(() => import('../pages/AIReview/ReviewQueuePage'));
const AgentTeamsPage = lazy(() => import('../pages/AgentTeams/AgentTeamsPage'));
const TeamDashboard = lazy(() => import('../pages/AgentTeams/TeamDashboard'));
const DownloadIDEPage = lazy(() => import("../pages/DownloadIDE/DownloadIDEPage"));
const IDEPage = lazy(() => import('../pages/IDE/IDEPage'));
const BuildPage = lazy(() => import('../pages/Build/BuildPage'));
const OpenClawPage = lazy(() => import("../pages/OpenClaw/OpenClawPage"));
const AgentsPage = lazy(() => import('../pages/Agents/AgentOSv2'));
const AgentMarketplacePage = lazy(() => import('../pages/Marketplace/AgentMarketplacePage'));
const CreateTeamPage = lazy(() => import('../pages/AgentTeams/CreateTeamPage'));
const EditTeamPage = lazy(() => import('../pages/AgentTeams/EditTeamPage'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));
const AboutPage = lazy(() => import('../pages/Public/AboutPage'));
const TechnologyPage = lazy(() => import('../pages/Public/TechnologyPage'));
const OpenSourcePage = lazy(() => import('../pages/Public/OpenSourcePage'));
const EnterprisePage = lazy(() => import('../pages/Public/EnterprisePage'));
const CareersPage = lazy(() => import('../pages/Public/CareersPage'));
const IntegrationsPage = lazy(() => import('../pages/Public/IntegrationsPage'));
const BlogPage = lazy(() => import('../pages/Public/BlogPage'));
const ChangelogPage = lazy(() => import('../pages/Public/ChangelogPage'));
const SecurityPage = lazy(() => import('../pages/Public/SecurityPage'));
const PrivacyPage = lazy(() => import('../pages/Public/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/Public/TermsPage'));
const CommunityPage = lazy(() => import('../pages/Public/CommunityPage'));

// Product Pages
const AIAgentsProductPage = lazy(() => import('../pages/Products/AIAgentsPage'));
const IDEProductPage = lazy(() => import('../pages/Products/IDEPage'));
const CodeAnalysisProductPage = lazy(() => import('../pages/Products/CodeAnalysisPage'));
const OpenClawProductPage = lazy(() => import('../pages/Products/OpenClawProductPage'));
const MemoryProductPage = lazy(() => import('../pages/Products/MemoryPage'));
const ChatProductPage = lazy(() => import('../pages/Products/ChatPage'));
const GovernanceProductPage = lazy(() => import('../pages/Products/GovernancePage'));
const NeuralRoutingProductPage = lazy(() => import('../pages/Products/NeuralRoutingPage'));

// Use Case Pages
const DevelopersUseCasePage = lazy(() => import('../pages/UseCases/DevelopersPage'));
const TeamsUseCasePage = lazy(() => import('../pages/UseCases/TeamsPage'));
const SecurityUseCasePage = lazy(() => import('../pages/UseCases/SecurityUseCasePage'));
const AutomationUseCasePage = lazy(() => import('../pages/UseCases/AutomationPage'));

// Comparison Pages
const VsCursorPage = lazy(() => import('../pages/Compare/VsCursorPage'));
const VsWindsurfPage = lazy(() => import('../pages/Compare/VsWindsurfPage'));
const VsChatGPTPage = lazy(() => import('../pages/Compare/VsChatGPTPage'));
const VsReplitPage = lazy(() => import('../pages/Compare/VsReplitPage'));

// Documentation Pages
const ArchitectureDocsPage = lazy(() => import('../pages/Docs/ArchitecturePage'));
const AgentAPIDocsPage = lazy(() => import('../pages/Docs/AgentAPIPage'));
const GovernanceProtocolDocsPage = lazy(() => import('../pages/Docs/GovernanceProtocolPage'));
const NeuralRoutingDocsPage = lazy(() => import('../pages/Docs/NeuralRoutingDocsPage'));

const ChatSkillsControlPage = lazy(() => import('../pages/Owner/ChatSkillsControlPage'));
const AgentsControlPage = lazy(() => import('../pages/Owner/AgentsControlPage'));

// Developer Tools Pages
const ResonantMemoryPage = lazy(() => import('../pages/ResonantMemory/ResonantMemoryPage'));
const CodeVisualizerPage = lazy(() => import('../pages/CodeVisualizer/CodeVisualizerPage'));
const TerminalPage = lazy(() => import('../pages/Terminal/TerminalPage'));

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
  // CANONICAL: /account redirects to resonant-chat
  {
    path: '/account',
    element: <Navigate to="/resonant-chat" replace />
  },
  // CANONICAL: /usage redirects to resonant-chat (metrics consolidated)
  {
    path: '/usage',
    element: <Navigate to="/resonant-chat" replace />
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
  // Billing redirects to resonant-chat (billing moved to chat)
  {
    path: '/billing',
    element: <Navigate to="/resonant-chat" replace />
  },
  {
    path: '/admin/system',
    element: withShell(<RoleRoute category="admin"><SystemDashboardPage /></RoleRoute>)
  },
  {
    path: '/admin/feature-flags',
    element: withShell(<RoleRoute category="admin"><FeatureFlagsPage /></RoleRoute>)
  },
  // Profile now consolidated into resonant-chat
  {
    path: '/profile',
    element: <Navigate to="/resonant-chat" replace />
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
  // Legacy duplicate legal URLs - canonical pages are /privacy and /terms
  {
    path: '/privacy-policy',
    element: <Navigate to="/privacy" replace />
  },
  {
    path: '/terms-of-service',
    element: <Navigate to="/terms" replace />
  },
  // Retired tools - no longer offered
  {
    path: '/validate',
    element: <Navigate to="/" replace />
  },
  {
    path: '/public/validate',
    element: <Navigate to="/" replace />
  },
  {
    path: '/llm-scan',
    element: <Navigate to="/" replace />
  },
  {
    path: '/public/llm-scan',
    element: <Navigate to="/" replace />
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
    path: '/marketplace',
    element: withShell(<AgentMarketplacePage />)
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
  {
    path: '/api',
    element: withPublicShell(<APIDocsPage />)
  },
  // Connect Your Profiles - now consolidated into resonant-chat
  {
    path: '/connect-profiles',
    element: <Navigate to="/resonant-chat" replace />
  },
  // API Keys Management - Redirect to resonant-chat
  {
    path: '/api-keys',
    element: <Navigate to="/resonant-chat" replace />
  },
  // Settings API Keys - Redirect to resonant-chat
  {
    path: '/settings/api-keys',
    element: <Navigate to="/resonant-chat" replace />
  },
  // Consolidated: the single memory page lives at /products/memory
  {
    path: '/hash-sphere-memory-api',
    element: <Navigate to="/products/memory" replace />
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
    path: '/terminal',
    element: withShell(<TerminalPage />)
  },
  {
    path: '/download-ide',
    element: withPublicShell(<DownloadIDEPage />)
  },
  {
    path: '/ide',
    element: withShell(<ProtectedRoute><IDEPage /></ProtectedRoute>)
  },
  {
    path: '/build',
    element: withShell(<BuildPage />)
  },
  {
    path: '/download-openclaw',
    element: withPublicShell(<OpenClawPage />)
  },
  {
    path: '/about',
    element: withPublicShell(<AboutPage />)
  },
  {
    path: '/technology',
    element: withPublicShell(<TechnologyPage />)
  },
  {
    path: '/open-source',
    element: withPublicShell(<OpenSourcePage />)
  },
  {
    path: '/enterprise',
    element: withPublicShell(<EnterprisePage />)
  },
  {
    path: '/careers',
    element: withPublicShell(<CareersPage />)
  },
  {
    path: '/integrations',
    element: withPublicShell(<IntegrationsPage />)
  },
  {
    path: '/blog',
    element: withPublicShell(<BlogPage />)
  },
  {
    path: '/changelog',
    element: withPublicShell(<ChangelogPage />)
  },
  {
    path: '/security',
    element: withPublicShell(<SecurityPage />)
  },
  {
    path: '/privacy',
    element: withPublicShell(<PrivacyPage />)
  },
  {
    path: '/terms',
    element: withPublicShell(<TermsPage />)
  },
  {
    path: '/community',
    element: withPublicShell(<CommunityPage />)
  },
  // Product Pages
  {
    path: '/products/ai-agents',
    element: withPublicShell(<AIAgentsProductPage />)
  },
  {
    path: '/products/ide',
    element: withPublicShell(<IDEProductPage />)
  },
  {
    path: '/products/code-analysis',
    element: withPublicShell(<CodeAnalysisProductPage />)
  },
  {
    path: '/products/openclaw',
    element: withPublicShell(<OpenClawProductPage />)
  },
  {
    path: '/products/memory',
    element: withPublicShell(<MemoryProductPage />)
  },
  {
    path: '/products/chat',
    element: withPublicShell(<ChatProductPage />)
  },
  {
    path: '/products/governance',
    element: withPublicShell(<GovernanceProductPage />)
  },
  {
    path: '/products/neural-routing',
    element: withPublicShell(<NeuralRoutingProductPage />)
  },
  // Retired crypto/mining/blockchain/DePIN product lines - pivoted away from tokenomics
  {
    path: '/products/mining',
    element: <Navigate to="/" replace />
  },
  {
    path: '/products/blockchain',
    element: <Navigate to="/" replace />
  },
  {
    path: '/products/dsid',
    element: <Navigate to="/" replace />
  },
  {
    path: '/products/crypto',
    element: <Navigate to="/" replace />
  },
  {
    path: '/products/state-physics',
    element: <Navigate to="/" replace />
  },
  {
    path: '/state-physics',
    element: <Navigate to="/" replace />
  },
  {
    path: '/state-physics-api',
    element: <Navigate to="/" replace />
  },
  {
    path: '/hash-sphere',
    element: <Navigate to="/" replace />
  },
  {
    path: '/hash-sphere/fullscreen',
    element: <Navigate to="/" replace />
  },
  {
    path: '/download-miner',
    element: <Navigate to="/" replace />
  },
  {
    path: '/wallet',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/agents',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/node',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/publish',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/marketplace',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/workflows',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/workflows/visual',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/history',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/address/:hash',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/blockchain',
    element: <Navigate to="/" replace />
  },
  {
    path: '/network/templates',
    element: <Navigate to="/" replace />
  },
  {
    path: '/agent-browser',
    element: <Navigate to="/" replace />
  },
  {
    path: '/execution-history',
    element: <Navigate to="/" replace />
  },
  {
    path: '/workflow-designer',
    element: <Navigate to="/" replace />
  },
  {
    path: '/agent-templates',
    element: <Navigate to="/" replace />
  },
  // Use Case Pages
  {
    path: '/use-cases/developers',
    element: withPublicShell(<DevelopersUseCasePage />)
  },
  {
    path: '/use-cases/teams',
    element: withPublicShell(<TeamsUseCasePage />)
  },
  {
    path: '/use-cases/security',
    element: withPublicShell(<SecurityUseCasePage />)
  },
  {
    path: '/use-cases/automation',
    element: withPublicShell(<AutomationUseCasePage />)
  },
  // Comparison Pages
  {
    path: '/compare/devswat-vs-cursor',
    element: withPublicShell(<VsCursorPage />)
  },
  {
    path: '/compare/devswat-vs-windsurf',
    element: withPublicShell(<VsWindsurfPage />)
  },
  {
    path: '/compare/devswat-vs-chatgpt',
    element: withPublicShell(<VsChatGPTPage />)
  },
  {
    path: '/compare/devswat-vs-replit',
    element: withPublicShell(<VsReplitPage />)
  },
  // Documentation Pages
  {
    path: '/docs/architecture',
    element: withPublicShell(<ArchitectureDocsPage />)
  },
  {
    path: '/docs/agent-api',
    element: withPublicShell(<AgentAPIDocsPage />)
  },
  {
    path: '/docs/governance-protocol',
    element: withPublicShell(<GovernanceProtocolDocsPage />)
  },
  {
    path: '/docs/memory-protocol',
    element: <Navigate to="/products/memory" replace />
  },
  {
    path: '/docs/neural-routing',
    element: withPublicShell(<NeuralRoutingDocsPage />)
  },
  // Retired blockchain/mining protocol docs
  {
    path: '/docs/blockchain-protocol',
    element: <Navigate to="/docs/architecture" replace />
  },
  {
    path: '/docs/mining-protocol',
    element: <Navigate to="/docs/architecture" replace />
  },
  {
    path: '/docs/cbor-spec',
    element: <Navigate to="/docs/architecture" replace />
  },
  {
    path: '/docs/cross-chain',
    element: <Navigate to="/docs/architecture" replace />
  },
  {
    path: '*',
    element: withPublicShell(<NotFoundPage />)
  },
]);

export default router;
