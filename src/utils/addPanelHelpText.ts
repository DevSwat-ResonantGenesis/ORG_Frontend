/**
 * Panel Help Text Configuration
 * Adds clear descriptions and guidance to every panel
 */

export const PANEL_HELP_TEXT = {
  factory: {
    title: "Agent Factory",
    description: "Create new AI agents with custom capabilities and configurations",
    actions: [
      "Click 'Create Agent' to start",
      "Configure agent name, model, and capabilities",
      "Set budget limits and permissions",
      "Deploy agent when ready"
    ]
  },
  agents: {
    title: "Agent Management",
    description: "View and manage all your AI agents in one place",
    actions: [
      "Click on an agent to view details",
      "Use Start/Stop to control agent execution",
      "Monitor agent performance and costs",
      "Archive agents you no longer need"
    ]
  },
  goals: {
    title: "Agent Goals",
    description: "Define and track objectives for your agents",
    actions: [
      "Add new goals with clear descriptions",
      "Assign goals to specific agents",
      "Track progress and completion",
      "Update or remove goals as needed"
    ]
  },
  sessions: {
    title: "Agent Sessions",
    description: "Monitor active agent execution sessions",
    actions: [
      "View all running agent sessions",
      "Check session status and progress",
      "Stop sessions if needed",
      "Review session logs and outputs"
    ]
  },
  monitor: {
    title: "System Monitor",
    description: "Real-time monitoring of agent performance and system health",
    actions: [
      "View execution metrics and statistics",
      "Monitor resource usage",
      "Check for errors or warnings",
      "Review system logs"
    ]
  },
  economy: {
    title: "Economy & Billing",
    description: "Manage credits, transactions, and agent costs",
    actions: [
      "View current credit balance",
      "Review transaction history",
      "Set spending limits",
      "Purchase additional credits"
    ]
  },
  settings: {
    title: "Agent Settings",
    description: "Configure agent behavior and preferences",
    actions: [
      "Select LLM provider and model",
      "Configure API keys",
      "Set execution parameters",
      "Manage permissions"
    ]
  },
  capabilities: {
    title: "Agent Capabilities",
    description: "Add and manage custom capabilities for your agents",
    actions: [
      "Select an agent to configure",
      "Add new capabilities",
      "Enable/disable capabilities",
      "Remove unused capabilities"
    ]
  },
  executions: {
    title: "Execution History",
    description: "View detailed history of all agent executions",
    actions: [
      "Browse execution records",
      "View execution details and logs",
      "Check success/failure status",
      "Analyze execution patterns"
    ]
  },
  workflows: {
    title: "Workflow Management",
    description: "Create and manage multi-step agent workflows",
    actions: [
      "Create new workflows",
      "Define workflow steps",
      "Run workflows",
      "Monitor workflow execution"
    ]
  },
  chat: {
    title: "Agent Chat",
    description: "Interact with your agents through natural conversation",
    actions: [
      "Select an agent to chat with",
      "Type your message and press Enter",
      "Review agent responses",
      "Clear chat history if needed"
    ]
  },
  memory: {
    title: "Agent Memory",
    description: "Manage agent memory and knowledge storage",
    actions: [
      "View stored memories",
      "Search memory contents",
      "Add new memories",
      "Delete outdated memories"
    ]
  },
  audit: {
    title: "Audit Trail",
    description: "Blockchain-based immutable audit logs for compliance",
    actions: [
      "View all audit entries",
      "Filter by category or actor",
      "Verify audit chain integrity",
      "Export audit reports"
    ]
  },
  utility: {
    title: "Utility Metrics",
    description: "Track agent utility and performance scores",
    actions: [
      "Select agent to analyze",
      "View utility calculations",
      "Compare against targets",
      "Optimize agent performance"
    ]
  },
  debug: {
    title: "Debug Console",
    description: "Debug agent execution and troubleshoot issues",
    actions: [
      "View execution logs",
      "Check for errors",
      "Inspect execution steps",
      "Analyze failure causes"
    ]
  },
  governance: {
    title: "Governance & Policies",
    description: "Manage governance policies and compliance rules",
    actions: [
      "View active policies",
      "Check compliance status",
      "Create new policies",
      "Review policy violations"
    ]
  },
  network: {
    title: "Agent Network",
    description: "Visualize and manage agent team connections",
    actions: [
      "View agent network topology",
      "See team relationships",
      "Monitor collaboration",
      "Manage team memberships"
    ]
  },
  external: {
    title: "External Integrations",
    description: "Connect agents to external services and APIs",
    actions: [
      "View connected services",
      "Add new integrations",
      "Configure webhooks",
      "Test connections"
    ]
  },
  negotiation: {
    title: "Agent Negotiation",
    description: "Monitor agent-to-agent negotiations and agreements",
    actions: [
      "View active negotiations",
      "Track agreement status",
      "Review negotiation history",
      "Manage team collaborations"
    ]
  }
};

export function getPanelHelp(panelId: string) {
  return PANEL_HELP_TEXT[panelId as keyof typeof PANEL_HELP_TEXT] || {
    title: "Panel",
    description: "Manage your agents and workflows",
    actions: []
  };
}
