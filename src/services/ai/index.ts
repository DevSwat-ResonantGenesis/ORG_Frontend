// ============== AI SERVICES INDEX ==============
// Smart AI Execution Pipeline Services

export * from './types';

export { IntentClassifier } from './IntentClassifier';
export { ContextAggregator } from './ContextAggregator';
export { PlanningEngine } from './PlanningEngine';
export { SmartExecutor } from './SmartExecutor';

// Create singleton instances for global use
import { IntentClassifier } from './IntentClassifier';
import { ContextAggregator } from './ContextAggregator';
import { PlanningEngine } from './PlanningEngine';
import { SmartExecutor } from './SmartExecutor';

let intentClassifierInstance: IntentClassifier | null = null;
let contextAggregatorInstance: ContextAggregator | null = null;
let planningEngineInstance: PlanningEngine | null = null;
let smartExecutorInstance: SmartExecutor | null = null;

export const getIntentClassifier = (): IntentClassifier => {
  if (!intentClassifierInstance) {
    intentClassifierInstance = new IntentClassifier();
  }
  return intentClassifierInstance;
};

export const getContextAggregator = (projectRoot?: string): ContextAggregator => {
  if (!contextAggregatorInstance) {
    contextAggregatorInstance = new ContextAggregator(projectRoot);
  }
  return contextAggregatorInstance;
};

export const getPlanningEngine = (): PlanningEngine => {
  if (!planningEngineInstance) {
    planningEngineInstance = new PlanningEngine();
  }
  return planningEngineInstance;
};

export const getSmartExecutor = (callbacks?: {
  onStepStart?: (step: any) => void;
  onStepComplete?: (step: any, result: any) => void;
  onPlanComplete?: (result: any) => void;
  onError?: (error: Error, step: any) => void;
}): SmartExecutor => {
  if (!smartExecutorInstance) {
    smartExecutorInstance = new SmartExecutor(callbacks);
  }
  return smartExecutorInstance;
};

// Reset all instances (useful for testing)
export const resetAIServices = (): void => {
  intentClassifierInstance = null;
  contextAggregatorInstance = null;
  planningEngineInstance = null;
  smartExecutorInstance = null;
};
