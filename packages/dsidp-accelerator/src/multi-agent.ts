/**
 * DSID-P Multi-Agent Orchestration
 * 
 * Coordinate specialized agents working in parallel:
 * - Frontend Agent
 * - Backend Agent
 * - DevOps Agent
 * - QA Agent
 * - Security Agent
 * - Design Agent
 */

import { LLMEngine, createLLMEngine } from './llm-engine';
import { AutonomousExecutor, Tool, ToolResult } from './autonomous';

// ============== TYPES ==============

export interface AgentSpec {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  systemPrompt: string;
  tools: string[];
  capabilities: string[];
  trustLevel: 1 | 2 | 3 | 4 | 5;
}

export type AgentRole = 
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'qa'
  | 'security'
  | 'design'
  | 'architect'
  | 'pm'
  | 'general';

export interface AgentState {
  id: string;
  status: 'idle' | 'thinking' | 'executing' | 'waiting' | 'error';
  currentTask?: string;
  lastAction?: string;
  memory: AgentMemory;
  metrics: AgentMetrics;
}

export interface AgentMemory {
  shortTerm: Map<string, unknown>;
  context: string[];
  decisions: Decision[];
  learnings: string[];
}

export interface Decision {
  timestamp: number;
  task: string;
  decision: string;
  reasoning: string;
  outcome?: 'success' | 'failure' | 'pending';
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  avgResponseTime: number;
  tokensUsed: number;
}

export interface TaskAssignment {
  taskId: string;
  agentId: string;
  task: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  deadline?: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  result?: unknown;
}

export interface AgentMessage {
  from: string;
  to: string | 'all';
  type: 'request' | 'response' | 'broadcast' | 'handoff';
  content: string;
  data?: unknown;
  timestamp: number;
}

export interface OrchestratorConfig {
  maxConcurrentAgents: number;
  taskTimeout: number;
  enableCollaboration: boolean;
  enableLearning: boolean;
  resonantNodeUrl?: string;
  onAgentStateChange?: (agentId: string, state: AgentState) => void;
  onTaskComplete?: (task: TaskAssignment) => void;
  onMessage?: (message: AgentMessage) => void;
}

// ============== AGENT DEFINITIONS ==============

const AGENT_SPECS: Record<AgentRole, Omit<AgentSpec, 'id'>> = {
  frontend: {
    name: 'Frontend Agent',
    role: 'frontend',
    description: 'Specializes in React, Vue, UI/UX implementation',
    systemPrompt: `You are an expert Frontend Developer Agent.
Your expertise:
- React, Next.js, Vue, Svelte
- TailwindCSS, CSS-in-JS, animations
- State management (Zustand, Redux, Jotai)
- Performance optimization
- Accessibility (WCAG)
- Responsive design

When given a task:
1. Analyze UI requirements
2. Choose optimal component structure
3. Implement with modern best practices
4. Ensure accessibility and performance
5. Write clean, maintainable code`,
    tools: ['create_file', 'edit_file', 'run_terminal', 'capture_screenshot', 'analyze_ui'],
    capabilities: ['component_design', 'styling', 'state_management', 'animations', 'accessibility'],
    trustLevel: 4,
  },

  backend: {
    name: 'Backend Agent',
    role: 'backend',
    description: 'Specializes in APIs, databases, server architecture',
    systemPrompt: `You are an expert Backend Developer Agent.
Your expertise:
- Node.js, Python, Go, Rust
- REST APIs, GraphQL, tRPC
- PostgreSQL, MongoDB, Redis
- Authentication & authorization
- Microservices architecture
- Performance & scaling

When given a task:
1. Design API contracts
2. Plan database schema
3. Implement with security in mind
4. Add proper error handling
5. Write efficient queries`,
    tools: ['create_file', 'edit_file', 'run_terminal', 'read_file', 'search_code'],
    capabilities: ['api_design', 'database_design', 'authentication', 'caching', 'scaling'],
    trustLevel: 4,
  },

  devops: {
    name: 'DevOps Agent',
    role: 'devops',
    description: 'Specializes in CI/CD, infrastructure, deployment',
    systemPrompt: `You are an expert DevOps Engineer Agent.
Your expertise:
- Docker, Kubernetes
- CI/CD (GitHub Actions, GitLab CI)
- Cloud platforms (AWS, GCP, Azure)
- Infrastructure as Code (Terraform)
- Monitoring & logging
- Security hardening

When given a task:
1. Analyze infrastructure needs
2. Design scalable architecture
3. Implement automation
4. Set up monitoring
5. Document procedures`,
    tools: ['create_file', 'edit_file', 'run_terminal', 'deploy', 'run_tests'],
    capabilities: ['containerization', 'ci_cd', 'cloud_deployment', 'monitoring', 'security'],
    trustLevel: 5,
  },

  qa: {
    name: 'QA Agent',
    role: 'qa',
    description: 'Specializes in testing, quality assurance',
    systemPrompt: `You are an expert QA Engineer Agent.
Your expertise:
- Unit testing (Jest, Vitest, pytest)
- E2E testing (Playwright, Cypress)
- Integration testing
- Performance testing
- Test automation
- Bug analysis

When given a task:
1. Identify test scenarios
2. Write comprehensive tests
3. Cover edge cases
4. Ensure high coverage
5. Report issues clearly`,
    tools: ['create_file', 'edit_file', 'run_terminal', 'run_tests', 'capture_screenshot'],
    capabilities: ['unit_testing', 'e2e_testing', 'performance_testing', 'bug_detection', 'coverage'],
    trustLevel: 4,
  },

  security: {
    name: 'Security Agent',
    role: 'security',
    description: 'Specializes in security audits, vulnerability detection',
    systemPrompt: `You are an expert Security Engineer Agent.
Your expertise:
- OWASP Top 10
- Vulnerability scanning
- Penetration testing
- Security best practices
- Authentication/Authorization
- Data protection

When given a task:
1. Identify security risks
2. Scan for vulnerabilities
3. Recommend mitigations
4. Implement security fixes
5. Validate security posture`,
    tools: ['read_file', 'search_code', 'run_terminal', 'analyze_code'],
    capabilities: ['vulnerability_scanning', 'security_audit', 'penetration_testing', 'compliance'],
    trustLevel: 5,
  },

  design: {
    name: 'Design Agent',
    role: 'design',
    description: 'Specializes in UI/UX design, visual systems',
    systemPrompt: `You are an expert UI/UX Designer Agent.
Your expertise:
- Design systems
- Color theory & typography
- User experience principles
- Accessibility design
- Responsive layouts
- Animation & micro-interactions

When given a task:
1. Understand user needs
2. Create intuitive layouts
3. Apply design principles
4. Ensure consistency
5. Validate accessibility`,
    tools: ['capture_screenshot', 'analyze_ui', 'create_file', 'edit_file'],
    capabilities: ['ui_design', 'ux_design', 'design_systems', 'prototyping', 'accessibility'],
    trustLevel: 3,
  },

  architect: {
    name: 'Architect Agent',
    role: 'architect',
    description: 'Specializes in system design, technical decisions',
    systemPrompt: `You are an expert Software Architect Agent.
Your expertise:
- System design
- Architecture patterns
- Technology selection
- Scalability planning
- Technical documentation
- Code review

When given a task:
1. Analyze requirements
2. Design system architecture
3. Select appropriate technologies
4. Plan for scale
5. Document decisions`,
    tools: ['read_file', 'search_code', 'create_file', 'edit_file', 'research_tech'],
    capabilities: ['system_design', 'architecture', 'tech_selection', 'documentation', 'review'],
    trustLevel: 5,
  },

  pm: {
    name: 'Project Manager Agent',
    role: 'pm',
    description: 'Specializes in project planning, coordination',
    systemPrompt: `You are an expert Project Manager Agent.
Your expertise:
- Project planning
- Task breakdown
- Resource allocation
- Risk management
- Stakeholder communication
- Progress tracking

When given a task:
1. Break down into subtasks
2. Estimate effort
3. Identify dependencies
4. Assign to specialists
5. Track progress`,
    tools: ['create_file', 'read_file'],
    capabilities: ['planning', 'coordination', 'estimation', 'risk_management', 'communication'],
    trustLevel: 3,
  },

  general: {
    name: 'General Agent',
    role: 'general',
    description: 'General-purpose development assistant',
    systemPrompt: `You are a versatile Development Agent.
You can handle various tasks across the stack.
Delegate to specialists when appropriate.`,
    tools: ['create_file', 'edit_file', 'read_file', 'run_terminal', 'search_code'],
    capabilities: ['general_development', 'problem_solving', 'research'],
    trustLevel: 3,
  },
};

// ============== AGENT CLASS ==============

export class Agent {
  public spec: AgentSpec;
  public state: AgentState;
  private llm: LLMEngine;
  private executor: AutonomousExecutor;

  constructor(spec: AgentSpec, llm: LLMEngine, executor: AutonomousExecutor) {
    this.spec = spec;
    this.llm = llm;
    this.executor = executor;
    this.state = {
      id: spec.id,
      status: 'idle',
      memory: {
        shortTerm: new Map(),
        context: [],
        decisions: [],
        learnings: [],
      },
      metrics: {
        tasksCompleted: 0,
        tasksFailed: 0,
        avgResponseTime: 0,
        tokensUsed: 0,
      },
    };
  }

  async think(task: string, context?: string): Promise<string> {
    this.state.status = 'thinking';
    this.state.currentTask = task;
    const start = Date.now();

    try {
      const response = await this.llm.chat_simple(
        `Task: ${task}\n\n${context ? `Context: ${context}` : ''}`,
        this.spec.systemPrompt
      );

      this.state.metrics.avgResponseTime = 
        (this.state.metrics.avgResponseTime + (Date.now() - start)) / 2;

      return response;
    } finally {
      this.state.status = 'idle';
    }
  }

  async execute(toolName: string, params: Record<string, unknown>): Promise<ToolResult> {
    if (!this.spec.tools.includes(toolName)) {
      return {
        success: false,
        output: null,
        error: `Agent ${this.spec.name} does not have access to tool: ${toolName}`,
        duration_ms: 0,
      };
    }

    this.state.status = 'executing';
    this.state.lastAction = `${toolName}(${JSON.stringify(params)})`;

    try {
      const result = await this.executor.execute(toolName, params);
      
      if (result.success) {
        this.state.metrics.tasksCompleted++;
      } else {
        this.state.metrics.tasksFailed++;
      }

      return result;
    } finally {
      this.state.status = 'idle';
    }
  }

  async planAndExecute(task: string): Promise<{ success: boolean; result: unknown }> {
    // Think about the task
    const plan = await this.think(task);
    
    // Parse plan and execute steps
    // This is simplified - real implementation would parse structured plan
    
    this.state.memory.decisions.push({
      timestamp: Date.now(),
      task,
      decision: plan,
      reasoning: 'Based on task analysis',
      outcome: 'pending',
    });

    return { success: true, result: plan };
  }

  addContext(context: string): void {
    this.state.memory.context.push(context);
    // Keep last 10 context items
    if (this.state.memory.context.length > 10) {
      this.state.memory.context.shift();
    }
  }

  addLearning(learning: string): void {
    this.state.memory.learnings.push(learning);
  }

  getState(): AgentState {
    return { ...this.state };
  }
}

// ============== ORCHESTRATOR ==============

export class MultiAgentOrchestrator {
  private config: OrchestratorConfig;
  private agents: Map<string, Agent> = new Map();
  private taskQueue: TaskAssignment[] = [];
  private messageHistory: AgentMessage[] = [];
  private llm: LLMEngine;
  private executor: AutonomousExecutor;
  private isRunning: boolean = false;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = {
      maxConcurrentAgents: config.maxConcurrentAgents || 4,
      taskTimeout: config.taskTimeout || 300000, // 5 minutes
      enableCollaboration: config.enableCollaboration ?? true,
      enableLearning: config.enableLearning ?? true,
      resonantNodeUrl: config.resonantNodeUrl,
      onAgentStateChange: config.onAgentStateChange,
      onTaskComplete: config.onTaskComplete,
      onMessage: config.onMessage,
    };

    this.llm = createLLMEngine();
    this.executor = new AutonomousExecutor();
  }

  // ============== AGENT MANAGEMENT ==============

  createAgent(role: AgentRole, customSpec?: Partial<AgentSpec>): Agent {
    const baseSpec = AGENT_SPECS[role];
    const spec: AgentSpec = {
      ...baseSpec,
      id: `agent-${role}-${Date.now()}`,
      ...customSpec,
    };

    const agent = new Agent(spec, this.llm, this.executor);
    this.agents.set(spec.id, agent);
    
    return agent;
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAgentsByRole(role: AgentRole): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.spec.role === role);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  removeAgent(id: string): boolean {
    return this.agents.delete(id);
  }

  // ============== TASK MANAGEMENT ==============

  async assignTask(task: string, role?: AgentRole, priority: TaskAssignment['priority'] = 'medium'): Promise<TaskAssignment> {
    // Find or create appropriate agent
    let agent: Agent;
    
    if (role) {
      const agents = this.getAgentsByRole(role);
      agent = agents.find(a => a.state.status === 'idle') || this.createAgent(role);
    } else {
      // Auto-detect best agent for task
      const bestRole = await this.detectBestAgent(task);
      const agents = this.getAgentsByRole(bestRole);
      agent = agents.find(a => a.state.status === 'idle') || this.createAgent(bestRole);
    }

    const assignment: TaskAssignment = {
      taskId: `task-${Date.now()}`,
      agentId: agent.spec.id,
      task,
      priority,
      dependencies: [],
      status: 'assigned',
    };

    this.taskQueue.push(assignment);
    return assignment;
  }

  private async detectBestAgent(task: string): Promise<AgentRole> {
    const taskLower = task.toLowerCase();
    
    // Simple keyword matching (real implementation would use LLM)
    if (taskLower.includes('ui') || taskLower.includes('component') || taskLower.includes('react') || taskLower.includes('style')) {
      return 'frontend';
    }
    if (taskLower.includes('api') || taskLower.includes('database') || taskLower.includes('server') || taskLower.includes('endpoint')) {
      return 'backend';
    }
    if (taskLower.includes('deploy') || taskLower.includes('docker') || taskLower.includes('ci') || taskLower.includes('kubernetes')) {
      return 'devops';
    }
    if (taskLower.includes('test') || taskLower.includes('bug') || taskLower.includes('quality')) {
      return 'qa';
    }
    if (taskLower.includes('security') || taskLower.includes('vulnerability') || taskLower.includes('auth')) {
      return 'security';
    }
    if (taskLower.includes('design') || taskLower.includes('ux') || taskLower.includes('layout')) {
      return 'design';
    }
    if (taskLower.includes('architect') || taskLower.includes('system design') || taskLower.includes('structure')) {
      return 'architect';
    }
    
    return 'general';
  }

  // ============== EXECUTION ==============

  async executeTask(assignment: TaskAssignment): Promise<TaskAssignment> {
    const agent = this.agents.get(assignment.agentId);
    if (!agent) {
      assignment.status = 'failed';
      assignment.result = { error: 'Agent not found' };
      return assignment;
    }

    assignment.status = 'in_progress';
    this.config.onAgentStateChange?.(agent.spec.id, agent.state);

    try {
      const result = await agent.planAndExecute(assignment.task);
      
      assignment.status = result.success ? 'completed' : 'failed';
      assignment.result = result.result;
      
      this.config.onTaskComplete?.(assignment);
    } catch (error) {
      assignment.status = 'failed';
      assignment.result = { error: error instanceof Error ? error.message : String(error) };
    }

    this.config.onAgentStateChange?.(agent.spec.id, agent.state);
    return assignment;
  }

  async executeParallel(tasks: string[]): Promise<TaskAssignment[]> {
    // Assign all tasks
    const assignments = await Promise.all(
      tasks.map(task => this.assignTask(task))
    );

    // Execute in parallel with concurrency limit
    const results: TaskAssignment[] = [];
    const executing: Promise<TaskAssignment>[] = [];

    for (const assignment of assignments) {
      if (executing.length >= this.config.maxConcurrentAgents) {
        const completed = await Promise.race(executing);
        results.push(completed);
        executing.splice(executing.indexOf(Promise.resolve(completed)), 1);
      }

      executing.push(this.executeTask(assignment));
    }

    // Wait for remaining
    const remaining = await Promise.all(executing);
    results.push(...remaining);

    return results;
  }

  // ============== COLLABORATION ==============

  sendMessage(from: string, to: string | 'all', content: string, data?: unknown): void {
    const message: AgentMessage = {
      from,
      to,
      type: to === 'all' ? 'broadcast' : 'request',
      content,
      data,
      timestamp: Date.now(),
    };

    this.messageHistory.push(message);
    this.config.onMessage?.(message);

    // Deliver to recipient(s)
    if (to === 'all') {
      this.agents.forEach(agent => {
        if (agent.spec.id !== from) {
          agent.addContext(`Message from ${from}: ${content}`);
        }
      });
    } else {
      const recipient = this.agents.get(to);
      if (recipient) {
        recipient.addContext(`Message from ${from}: ${content}`);
      }
    }
  }

  async handoff(fromAgentId: string, toRole: AgentRole, task: string, context: string): Promise<TaskAssignment> {
    // Create handoff message
    this.sendMessage(fromAgentId, 'all', `Handing off task to ${toRole}: ${task}`, { context });

    // Assign to new agent
    const assignment = await this.assignTask(task, toRole, 'high');
    
    // Add context from previous agent
    const toAgent = this.agents.get(assignment.agentId);
    if (toAgent) {
      toAgent.addContext(context);
    }

    return assignment;
  }

  async collaborate(task: string, roles: AgentRole[]): Promise<{
    results: Map<AgentRole, unknown>;
    combined: string;
  }> {
    // Create agents for each role
    const agents = roles.map(role => {
      const existing = this.getAgentsByRole(role).find(a => a.state.status === 'idle');
      return existing || this.createAgent(role);
    });

    // Each agent thinks about the task
    const thoughts = await Promise.all(
      agents.map(async agent => ({
        role: agent.spec.role,
        thought: await agent.think(task),
      }))
    );

    // Combine insights
    const results = new Map<AgentRole, unknown>();
    thoughts.forEach(t => results.set(t.role as AgentRole, t.thought));

    // Have architect agent synthesize
    const architect = this.createAgent('architect');
    const combined = await architect.think(
      `Synthesize these perspectives on the task "${task}":\n\n${thoughts.map(t => `${t.role}: ${t.thought}`).join('\n\n')}`
    );

    return { results, combined };
  }

  // ============== TEAM WORKFLOWS ==============

  async buildFeature(featureDescription: string): Promise<{
    design: unknown;
    frontend: unknown;
    backend: unknown;
    tests: unknown;
    security: unknown;
  }> {
    // 1. Design phase
    const designAgent = this.createAgent('design');
    const design = await designAgent.planAndExecute(`Design UI/UX for: ${featureDescription}`);

    // 2. Architecture phase
    const architectAgent = this.createAgent('architect');
    const architecture = await architectAgent.planAndExecute(
      `Design technical architecture for: ${featureDescription}\nDesign context: ${JSON.stringify(design.result)}`
    );

    // 3. Parallel implementation
    const [frontend, backend] = await Promise.all([
      this.createAgent('frontend').planAndExecute(
        `Implement frontend for: ${featureDescription}\nDesign: ${JSON.stringify(design.result)}`
      ),
      this.createAgent('backend').planAndExecute(
        `Implement backend for: ${featureDescription}\nArchitecture: ${JSON.stringify(architecture.result)}`
      ),
    ]);

    // 4. Testing
    const qaAgent = this.createAgent('qa');
    const tests = await qaAgent.planAndExecute(
      `Write tests for: ${featureDescription}\nFrontend: ${JSON.stringify(frontend.result)}\nBackend: ${JSON.stringify(backend.result)}`
    );

    // 5. Security review
    const securityAgent = this.createAgent('security');
    const security = await securityAgent.planAndExecute(
      `Security review for: ${featureDescription}`
    );

    return {
      design: design.result,
      frontend: frontend.result,
      backend: backend.result,
      tests: tests.result,
      security: security.result,
    };
  }

  async fullStackBuild(projectDescription: string): Promise<void> {
    this.isRunning = true;

    // 1. Planning phase with PM
    const pm = this.createAgent('pm');
    const plan = await pm.planAndExecute(`Create project plan for: ${projectDescription}`);
    this.sendMessage(pm.spec.id, 'all', 'Project plan created', plan.result);

    // 2. Architecture phase
    const architect = this.createAgent('architect');
    const architecture = await architect.planAndExecute(
      `Design system architecture for: ${projectDescription}`
    );
    this.sendMessage(architect.spec.id, 'all', 'Architecture designed', architecture.result);

    // 3. Parallel development
    const devTasks = [
      { role: 'frontend' as AgentRole, task: `Build frontend for: ${projectDescription}` },
      { role: 'backend' as AgentRole, task: `Build backend for: ${projectDescription}` },
      { role: 'devops' as AgentRole, task: `Setup infrastructure for: ${projectDescription}` },
    ];

    await this.executeParallel(devTasks.map(t => t.task));

    // 4. QA and Security
    await this.executeParallel([
      `Run comprehensive tests for: ${projectDescription}`,
      `Security audit for: ${projectDescription}`,
    ]);

    // 5. Deployment
    const devops = this.getAgentsByRole('devops')[0] || this.createAgent('devops');
    await devops.planAndExecute(`Deploy ${projectDescription} to production`);

    this.isRunning = false;
  }

  // ============== CONTROL ==============

  stop(): void {
    this.isRunning = false;
  }

  isExecuting(): boolean {
    return this.isRunning;
  }

  getStatus(): {
    agents: Array<{ id: string; role: AgentRole; status: string }>;
    pendingTasks: number;
    completedTasks: number;
  } {
    return {
      agents: Array.from(this.agents.values()).map(a => ({
        id: a.spec.id,
        role: a.spec.role,
        status: a.state.status,
      })),
      pendingTasks: this.taskQueue.filter(t => t.status === 'pending' || t.status === 'assigned').length,
      completedTasks: this.taskQueue.filter(t => t.status === 'completed').length,
    };
  }

  getMessageHistory(): AgentMessage[] {
    return [...this.messageHistory];
  }
}

// ============== FACTORY ==============

export function createOrchestrator(config?: Partial<OrchestratorConfig>): MultiAgentOrchestrator {
  return new MultiAgentOrchestrator(config);
}

export { AGENT_SPECS };
