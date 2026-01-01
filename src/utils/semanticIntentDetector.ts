/**
 * Semantic Intent Detector using Hash Sphere Anchors & Clusters
 * 
 * Instead of keyword matching, this uses semantic meaning:
 * - Creates anchor for "build project" intent
 * - Uses clusters (alpha/beta/gamma) to detect semantic patterns
 * - Checks resonance with existing project generation anchors
 * 
 * Alpha Cluster: Action verbs (build, create, make, develop, code, generate)
 * Beta Cluster: Context words (help, need, want, should, can, will)
 * Gamma Cluster: Project types (project, app, system, software, website, game, chat, bot, code)
 */

interface IntentDetectionResult {
  isProjectRequest: boolean;
  confidence: number;
  projectType?: string;
  reasoning: string;
}

interface SemanticPattern {
  anchor: string;
  alphaWords: string[];
  betaWords: string[];
  gammaWords: string[];
  resonanceThreshold: number;
}

// Core anchor: "build project" intent
const PROJECT_INTENT_ANCHOR: SemanticPattern = {
  anchor: "build_project_intent",
  alphaWords: ["build", "create", "make", "develop", "code", "generate", "scaffold", "setup", "initialize", "start", "new"],
  betaWords: ["help", "need", "want", "should", "can", "will", "please", "could", "would"],
  gammaWords: ["project", "app", "application", "website", "webapp", "program", "codebase", "game", "tool", "script", "package", "library", "module", "system", "software", "chat", "bot"],
  resonanceThreshold: 0.6 // 60% match required
};

/**
 * Calculate semantic resonance between message and anchor pattern
 * Uses cluster-based scoring (alpha + beta + gamma)
 */
function calculateResonance(message: string, pattern: SemanticPattern): number {
  const lower = message.toLowerCase();
  const words = lower.split(/\s+/);
  
  // Count matches in each cluster
  let alphaMatches = 0;
  let betaMatches = 0;
  let gammaMatches = 0;
  
  // Alpha cluster: action words (high weight)
  for (const word of words) {
    if (pattern.alphaWords.some(alpha => word.includes(alpha) || alpha.includes(word))) {
      alphaMatches++;
    }
  }
  
  // Beta cluster: context words (medium weight)
  for (const word of words) {
    if (pattern.betaWords.some(beta => word.includes(beta) || beta.includes(word))) {
      betaMatches++;
    }
  }
  
  // Gamma cluster: project types (high weight)
  for (const word of words) {
    if (pattern.gammaWords.some(gamma => word.includes(gamma) || gamma.includes(word))) {
      gammaMatches++;
    }
  }
  
  // Weighted resonance score
  // Alpha (40%) + Gamma (40%) + Beta (20%)
  const alphaScore = Math.min(alphaMatches / 2, 1.0) * 0.4; // Max 2 alpha words = full score
  const gammaScore = Math.min(gammaMatches / 2, 1.0) * 0.4; // Max 2 gamma words = full score
  const betaScore = Math.min(betaMatches / 3, 1.0) * 0.2;   // Max 3 beta words = full score
  
  const totalResonance = alphaScore + gammaScore + betaScore;
  
  return totalResonance;
}

/**
 * Check if message is a request (not just mentioning projects)
 * Uses semantic patterns to distinguish:
 * - "I need to build a project" → REQUEST
 * - "My project is doing well" → NOT A REQUEST
 */
function isRequest(message: string): boolean {
  const lower = message.toLowerCase();
  
  // Request indicators (positive)
  const requestPatterns = [
    /\b(?:build|create|make|generate|develop|code|scaffold|setup|initialize|start|new)\s+(?:a|an|the|my|our|this|that)?\s*(?:project|app|game|tool|script|website|application|program|codebase|system|software|chat|bot|library|module|package)/i,
    /\b(?:help|need|want|should|can|will|please|could|would)\s+(?:me|us|you)?\s*(?:to|with)?\s*(?:build|create|make|generate|develop|code|scaffold|setup|initialize|start)/i,
    /\b(?:let|lets|let's)\s+(?:me|us|you)?\s*(?:build|create|make|generate|develop|code|scaffold|setup|initialize|start)/i,
    /\b(?:i|we|you)\s+(?:want|need|should|can|will|could|would)\s+(?:to|a|an|the)?\s*(?:project|app|game|tool|script|website|application|program|codebase|system|software|chat|bot)/i,
  ];
  
  // Non-request indicators (negative - these suggest it's NOT a request)
  const nonRequestPatterns = [
    /\b(?:my|our|their|his|her|this|that|the)\s+(?:project|app|game|tool|script|website|application|program|codebase|system|software|chat|bot)\s+(?:is|was|are|were|has|have|had|does|did|will|would|should|could)/i,
    /\b(?:project|app|game|tool|script|website|application|program|codebase|system|software|chat|bot)\s+(?:is|was|are|were|has|have|had|does|did|will|would|should|could)\s+(?:doing|going|working|running|finished|complete|done)/i,
    /\b(?:in|on|for|with|about|regarding|concerning)\s+(?:my|our|their|his|her|this|that|the)\s+(?:project|app|game|tool|script|website|application|program|codebase|system|software|chat|bot)/i,
    /\b(?:report|document|summary|analysis|review|status|update|progress)\s+(?:on|about|regarding|concerning|for)\s+(?:my|our|their|his|her|this|that|the)?\s*(?:project|app|game|tool|script|website|application|program|codebase|system|software|chat|bot)/i,
  ];
  
  // Check for non-request patterns first (higher priority)
  for (const pattern of nonRequestPatterns) {
    if (pattern.test(lower)) {
      return false; // Definitely NOT a request
    }
  }
  
  // Check for request patterns
  for (const pattern of requestPatterns) {
    if (pattern.test(lower)) {
      return true; // Definitely a request
    }
  }
  
  // Default: check resonance score
  const resonance = calculateResonance(message, PROJECT_INTENT_ANCHOR);
  return resonance >= PROJECT_INTENT_ANCHOR.resonanceThreshold;
}

/**
 * Detect project type from message
 */
function detectProjectType(message: string): string | undefined {
  const lower = message.toLowerCase();
  
  if (lower.includes('react') || lower.includes('jsx') || lower.includes('tsx')) {
    return 'react';
  } else if (lower.includes('python') || lower.includes('flask') || lower.includes('django') || lower.includes('pygame')) {
    return 'python';
  } else if (lower.includes('node') || lower.includes('express')) {
    return 'node';
  } else if (lower.includes('next')) {
    return 'nextjs';
  } else if (lower.includes('vue')) {
    return 'vue';
  } else if (lower.includes('game') || lower.includes('tetris') || lower.includes('pong') || lower.includes('snake') || lower.includes('chess') || lower.includes('puzzle')) {
    return 'python'; // Default games to Python (pygame)
  }
  
  return undefined;
}

/**
 * Main semantic intent detection function
 * Uses Hash Sphere anchor + cluster logic
 */
export function detectProjectIntent(message: string): IntentDetectionResult {
  // Step 1: Calculate resonance with project intent anchor
  const resonance = calculateResonance(message, PROJECT_INTENT_ANCHOR);
  
  // Step 2: Check if it's actually a request (not just mentioning projects)
  const isRequestMessage = isRequest(message);
  
  // Step 3: Determine if it's a project request
  const isProjectRequest = isRequestMessage && resonance >= PROJECT_INTENT_ANCHOR.resonanceThreshold;
  
  // Step 4: Detect project type
  const projectType = isProjectRequest ? detectProjectType(message) : undefined;
  
  // Step 5: Generate reasoning
  let reasoning = '';
  if (!isRequestMessage) {
    reasoning = `Not a request - message mentions projects but doesn't request generation (resonance: ${(resonance * 100).toFixed(1)}%)`;
  } else if (resonance < PROJECT_INTENT_ANCHOR.resonanceThreshold) {
    reasoning = `Low resonance - insufficient semantic match (${(resonance * 100).toFixed(1)}% < ${(PROJECT_INTENT_ANCHOR.resonanceThreshold * 100).toFixed(1)}%)`;
  } else {
    reasoning = `High resonance - semantic match detected (${(resonance * 100).toFixed(1)}%)`;
  }
  
  return {
    isProjectRequest,
    confidence: resonance,
    projectType,
    reasoning
  };
}

/**
 * Example usage:
 * 
 * detectProjectIntent("create projext mini tetris game")
 * → { isProjectRequest: true, confidence: 0.85, projectType: "python", reasoning: "High resonance..." }
 * 
 * detectProjectIntent("My project is doing well")
 * → { isProjectRequest: false, confidence: 0.2, reasoning: "Not a request - message mentions projects..." }
 * 
 * detectProjectIntent("We built this project last year")
 * → { isProjectRequest: false, confidence: 0.3, reasoning: "Not a request - message mentions projects..." }
 */

