/**
 * Workflow Configuration Validator
 * Prevents recursive loops and malformed workflow configs
 */

export interface WorkflowStep {
  id: string;
  agentId: string;
  inputKey: string | string[];
  outputKey: string;
  role?: string;
  prompt?: string;
}

export interface WorkflowConfig {
  type: 'sequential' | 'parallel' | 'branching';
  steps?: WorkflowStep[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate workflow configuration
 */
export function validateWorkflowConfig(config: WorkflowConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if config has steps
  if (!config.steps || !Array.isArray(config.steps)) {
    errors.push('Workflow config must have a "steps" array');
    return { valid: false, errors, warnings };
  }

  if (config.steps.length === 0) {
    errors.push('Workflow must have at least one step');
    return { valid: false, errors, warnings };
  }

  const stepIds = new Set<string>();
  const outputKeys = new Set<string>();
  const lastStepIndex = config.steps.length - 1;

  // Validate each step
  config.steps.forEach((step, index) => {
    // Check required fields
    if (!step.id) {
      errors.push(`Step ${index + 1}: Missing required field "id"`);
    } else if (stepIds.has(step.id)) {
      errors.push(`Step ${index + 1}: Duplicate step id "${step.id}"`);
    } else {
      stepIds.add(step.id);
    }

    if (!step.agentId) {
      errors.push(`Step ${index + 1} (${step.id || 'unknown'}): Missing required field "agentId"`);
    }

    if (!step.inputKey) {
      errors.push(`Step ${index + 1} (${step.id || 'unknown'}): Missing required field "inputKey"`);
    }

    if (!step.outputKey) {
      errors.push(`Step ${index + 1} (${step.id || 'unknown'}): Missing required field "outputKey"`);
    } else if (outputKeys.has(step.outputKey)) {
      errors.push(`Step ${index + 1} (${step.id || 'unknown'}): Duplicate outputKey "${step.outputKey}"`);
    } else {
      outputKeys.add(step.outputKey);
    }

    // Check for recursive loop: final step using "*" inputKey
    const isLastStep = index === lastStepIndex;
    const inputKeyValue = Array.isArray(step.inputKey) ? step.inputKey : [step.inputKey];
    const usesWildcard = inputKeyValue.includes('*');

    if (isLastStep && usesWildcard) {
      warnings.push(
        `⚠️ Step ${index + 1} (${step.id}) is the final step but uses inputKey: "*". ` +
        `This can cause infinite loops. Use explicit inputKeys like ["profile", "metabolicData", ...] instead.`
      );
    }

    // Check if inputKey references non-existent outputKeys (except first step and wildcard)
    if (index > 0 && !usesWildcard) {
      inputKeyValue.forEach(inputKey => {
        if (inputKey !== 'userInput' && !outputKeys.has(inputKey)) {
          // Check if it's a future step (for parallel workflows)
          const futureStep = config.steps.slice(0, index).find(s => s.outputKey === inputKey);
          if (!futureStep) {
            errors.push(
              `Step ${index + 1} (${step.id}): inputKey "${inputKey}" references a non-existent outputKey. ` +
              `Available outputs: ${Array.from(outputKeys).join(', ') || 'none'}`
            );
          }
        }
      });
    }
  });

  // Check first step
  const firstStep = config.steps[0];
  if (firstStep) {
    const firstInputKey = Array.isArray(firstStep.inputKey) ? firstStep.inputKey : [firstStep.inputKey];
    if (!firstInputKey.includes('userInput') && !firstInputKey.includes('*')) {
      warnings.push(
        `First step should typically use inputKey: "userInput" or "*", but found: ${firstInputKey.join(', ')}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if workflow config has potential for recursive loops
 */
export function hasRecursiveLoopRisk(config: WorkflowConfig): boolean {
  if (!config.steps || config.steps.length === 0) {
    return false;
  }

  const lastStep = config.steps[config.steps.length - 1];
  if (!lastStep) {
    return false;
  }

  const inputKeyValue = Array.isArray(lastStep.inputKey) ? lastStep.inputKey : [lastStep.inputKey];
  return inputKeyValue.includes('*');
}

/**
 * Suggest corrected workflow config
 */
export function suggestCorrectedConfig(config: WorkflowConfig): WorkflowConfig | null {
  if (!config.steps || config.steps.length === 0) {
    return null;
  }

  const corrected = { ...config, steps: [...config.steps] };
  const lastStepIndex = corrected.steps.length - 1;
  const lastStep = corrected.steps[lastStepIndex];

  if (!lastStep) {
    return null;
  }

  // If last step uses "*", replace with explicit outputKeys
  const inputKeyValue = Array.isArray(lastStep.inputKey) ? lastStep.inputKey : [lastStep.inputKey];
  if (inputKeyValue.includes('*')) {
    // Collect all outputKeys from previous steps
    const allOutputKeys = corrected.steps
      .slice(0, lastStepIndex)
      .map(step => step.outputKey)
      .filter(Boolean);

    if (allOutputKeys.length > 0) {
      corrected.steps[lastStepIndex] = {
        ...lastStep,
        inputKey: allOutputKeys,
      };
      return corrected;
    }
  }

  return null;
}

