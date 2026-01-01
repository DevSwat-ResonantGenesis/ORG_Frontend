// ============== SMART AI EXECUTION TYPES ==============
// Core types for the intelligent execution pipeline

// ============== INTENT TYPES ==============

export enum UserIntent {
  // Code Modification
  CREATE_FILE = 'create_file',
  MODIFY_FILE = 'modify_file',
  DELETE_FILE = 'delete_file',
  REFACTOR_CODE = 'refactor_code',
  FIX_BUG = 'fix_bug',
  ADD_FEATURE = 'add_feature',
  
  // Information
  EXPLAIN_CODE = 'explain_code',
  QUESTION = 'question',
  DOCUMENTATION = 'documentation',
  
  // Analysis
  REVIEW_CODE = 'review_code',
  FIND_ISSUES = 'find_issues',
  SECURITY_AUDIT = 'security_audit',
  PERFORMANCE_ANALYSIS = 'performance_analysis',
  
  // Project-Level
  ARCHITECTURE_CHANGE = 'architecture_change',
  DEPENDENCY_UPDATE = 'dependency_update',
  CONFIG_CHANGE = 'config_change',
  
  // Execution
  RUN_COMMAND = 'run_command',
  TEST_CODE = 'test_code',
  BUILD_PROJECT = 'build_project',
  DEPLOY = 'deploy',
  
  // Unknown
  UNKNOWN = 'unknown'
}

export interface ClassifiedIntent {
  type: UserIntent;
  confidence: number;
  description: string;
  targets: string[];
  specificChanges: string[];
  successCriteria: string[];
  potentialSideEffects: string[];
  implicitRequirements: string[];
}

// ============== CONTEXT TYPES ==============

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  content: string;
  language: string;
  lastModified: Date;
  size: number;
}

export interface Position {
  line: number;
  column: number;
}

export interface DirectoryTree {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: DirectoryTree[];
}

export interface PackageInfo {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  modified: string[];
  untracked: string[];
  hasConflicts: boolean;
}

export interface Change {
  id: string;
  timestamp: Date;
  description: string;
  files: string[];
  type: 'create' | 'modify' | 'delete' | 'refactor';
}

export interface ErrorInfo {
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  timestamp: Date;
}

export interface ArchitectureInfo {
  type: string; // 'monolith', 'microservices', 'modular', etc.
  layers: string[];
  entryPoints: string[];
}

export interface PatternInfo {
  name: string;
  description: string;
  files: string[];
}

export interface TechStackInfo {
  framework: string;
  language: string;
  buildTool: string;
  testFramework: string;
  stateManagement?: string;
  styling?: string;
}

export interface CodebaseAnalysis {
  architecture: ArchitectureInfo;
  patterns: PatternInfo[];
  techStack: TechStackInfo;
}

export interface ExecutionContext {
  // Current state
  activeFile: FileInfo | null;
  openFiles: FileInfo[];
  selectedText: string | null;
  cursorPosition: Position | null;
  
  // Project context
  projectStructure: DirectoryTree;
  projectRoot: string;
  dependencies: PackageInfo | null;
  gitStatus: GitStatus | null;
  
  // Historical context
  recentChanges: Change[];
  conversationHistory: ConversationMessage[];
  errorHistory: ErrorInfo[];
  
  // Semantic context
  codebaseAnalysis: CodebaseAnalysis;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// ============== PLANNING TYPES ==============

export type StepAction = 
  | 'read_file'
  | 'write_file'
  | 'create_file'
  | 'delete_file'
  | 'modify_file'
  | 'run_command'
  | 'search_code'
  | 'analyze_code'
  | 'verify_change'
  | 'ask_user'
  | 'wait';

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface ExecutionStep {
  id: string;
  action: StepAction;
  target: string;
  purpose: string;
  verification: string;
  rollback: string | null;
  status: StepStatus;
  result?: StepResult;
  dependsOn?: string[];
}

export interface SuccessCriterion {
  description: string;
  met: boolean;
  verifiedAt?: Date;
}

export interface ExecutionPlan {
  id: string;
  intent: ClassifiedIntent;
  steps: ExecutionStep[];
  currentStepIndex: number;
  successCriteria: SuccessCriterion[];
  estimatedImpact: string;
  status: 'created' | 'approved' | 'executing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// ============== EXECUTION TYPES ==============

export interface StepResult {
  stepId: string;
  success: boolean;
  output: string;
  error?: string;
  changes?: FileChange[];
  duration: number;
  timestamp: Date;
}

export interface FileChange {
  path: string;
  type: 'create' | 'modify' | 'delete';
  before?: string;
  after?: string;
  diff?: string;
}

export interface ExecutionResult {
  planId: string;
  success: boolean;
  stepResults: StepResult[];
  finalState: ExecutionContext;
  summary: string;
  suggestions: Suggestion[];
  duration: number;
  completedAt: Date;
}

export interface VerificationResult {
  success: boolean;
  issues: Issue[];
  suggestions: Suggestion[];
}

export interface Issue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface Suggestion {
  id: string;
  type: 'pattern' | 'issue' | 'optimization' | 'security' | 'next_action';
  title: string;
  description: string;
  confidence: number;
  action?: () => Promise<void>;
}

// ============== PREDICTION TYPES ==============

export interface PredictedAction {
  id: string;
  description: string;
  type: UserIntent;
  probability: number;
  reasoning: string;
  prerequisites?: string[];
}

// ============== SERVICE INTERFACES ==============

export interface IIntentClassifier {
  classify(input: string, context: ExecutionContext): Promise<ClassifiedIntent>;
}

export interface IContextAggregator {
  buildContext(): Promise<ExecutionContext>;
  updateContext(changes: Partial<ExecutionContext>): void;
  getContext(): ExecutionContext;
}

export interface IPlanningEngine {
  createPlan(intent: ClassifiedIntent, context: ExecutionContext): Promise<ExecutionPlan>;
  validatePlan(plan: ExecutionPlan): Promise<VerificationResult>;
  updatePlan(planId: string, updates: Partial<ExecutionPlan>): void;
}

export interface ISmartExecutor {
  execute(plan: ExecutionPlan, context: ExecutionContext): Promise<ExecutionResult>;
  executeStep(step: ExecutionStep, context: ExecutionContext): Promise<StepResult>;
  rollback(plan: ExecutionPlan, toStepIndex: number): Promise<void>;
  pause(): void;
  resume(): void;
  cancel(): void;
}

export interface IPredictiveEngine {
  predictNextActions(intent: ClassifiedIntent, context: ExecutionContext): Promise<PredictedAction[]>;
  generateSuggestions(context: ExecutionContext): Promise<Suggestion[]>;
}
