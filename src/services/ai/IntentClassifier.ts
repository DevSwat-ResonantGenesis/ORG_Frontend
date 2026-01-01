// ============== INTENT CLASSIFIER SERVICE ==============
// Classifies user requests into actionable intents

import { 
  UserIntent, 
  ClassifiedIntent, 
  ExecutionContext,
  IIntentClassifier 
} from './types';

const INTENT_PATTERNS: Record<UserIntent, RegExp[]> = {
  [UserIntent.CREATE_FILE]: [
    /create\s+(a\s+)?(new\s+)?file/i,
    /add\s+(a\s+)?(new\s+)?file/i,
    /make\s+(a\s+)?(new\s+)?file/i,
    /new\s+component/i,
    /new\s+page/i,
    /scaffold/i,
  ],
  [UserIntent.MODIFY_FILE]: [
    /update\s+(the\s+)?file/i,
    /change\s+(the\s+)?file/i,
    /edit\s+(the\s+)?file/i,
    /modify/i,
  ],
  [UserIntent.DELETE_FILE]: [
    /delete\s+(the\s+)?file/i,
    /remove\s+(the\s+)?file/i,
  ],
  [UserIntent.REFACTOR_CODE]: [
    /refactor/i,
    /restructure/i,
    /reorganize/i,
    /clean\s*up/i,
    /improve\s+(the\s+)?code/i,
  ],
  [UserIntent.FIX_BUG]: [
    /fix\s+(the\s+)?(bug|error|issue|problem)/i,
    /debug/i,
    /resolve\s+(the\s+)?(bug|error|issue)/i,
    /why\s+(is|does|isn't|doesn't).*(work|error|fail)/i,
  ],
  [UserIntent.ADD_FEATURE]: [
    /add\s+(a\s+)?(new\s+)?feature/i,
    /implement/i,
    /build\s+(a\s+)?/i,
    /create\s+(a\s+)?(new\s+)?(function|method|component|api)/i,
    /add\s+(support\s+for|functionality)/i,
    /enhance/i,
    /upgrade/i,
  ],
  [UserIntent.EXPLAIN_CODE]: [
    /explain/i,
    /what\s+(does|is)/i,
    /how\s+does/i,
    /tell\s+me\s+about/i,
    /describe/i,
  ],
  [UserIntent.QUESTION]: [
    /\?$/,
    /^(what|why|how|when|where|who|which|can|could|would|should|is|are|do|does)/i,
  ],
  [UserIntent.DOCUMENTATION]: [
    /document/i,
    /add\s+(comments|docs|documentation)/i,
    /write\s+(the\s+)?readme/i,
    /jsdoc/i,
  ],
  [UserIntent.REVIEW_CODE]: [
    /review/i,
    /check\s+(the\s+)?code/i,
    /look\s+at/i,
    /analyze\s+(the\s+)?code/i,
  ],
  [UserIntent.FIND_ISSUES]: [
    /find\s+(issues|problems|bugs)/i,
    /look\s+for\s+(issues|problems|bugs)/i,
    /scan\s+for/i,
  ],
  [UserIntent.SECURITY_AUDIT]: [
    /security/i,
    /vulnerabilit/i,
    /audit/i,
    /safe/i,
  ],
  [UserIntent.PERFORMANCE_ANALYSIS]: [
    /performance/i,
    /optimize/i,
    /speed\s*up/i,
    /slow/i,
    /fast/i,
    /efficient/i,
  ],
  [UserIntent.ARCHITECTURE_CHANGE]: [
    /architecture/i,
    /structure\s+(of\s+)?(the\s+)?project/i,
    /reorganize\s+(the\s+)?project/i,
  ],
  [UserIntent.DEPENDENCY_UPDATE]: [
    /update\s+(the\s+)?dependenc/i,
    /upgrade\s+(the\s+)?package/i,
    /install/i,
    /npm|yarn|pnpm/i,
  ],
  [UserIntent.CONFIG_CHANGE]: [
    /config/i,
    /setting/i,
    /env/i,
    /\.env/i,
  ],
  [UserIntent.RUN_COMMAND]: [
    /run\s+(the\s+)?command/i,
    /execute/i,
    /^run\s+/i,
    /terminal/i,
    /shell/i,
  ],
  [UserIntent.TEST_CODE]: [
    /test/i,
    /spec/i,
    /unit\s+test/i,
    /integration\s+test/i,
  ],
  [UserIntent.BUILD_PROJECT]: [
    /build/i,
    /compile/i,
    /bundle/i,
  ],
  [UserIntent.DEPLOY]: [
    /deploy/i,
    /publish/i,
    /release/i,
    /ship/i,
  ],
  [UserIntent.UNKNOWN]: [],
};

export class IntentClassifier implements IIntentClassifier {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/v1/ai/classify-intent') {
    this.apiEndpoint = apiEndpoint;
  }

  async classify(input: string, context: ExecutionContext): Promise<ClassifiedIntent> {
    // First, try pattern-based classification for speed
    const patternResult = this.classifyByPattern(input);
    
    // If high confidence from patterns, use it
    if (patternResult.confidence > 0.8) {
      return this.enrichIntent(patternResult, input, context);
    }

    // Otherwise, use LLM for better classification
    try {
      const llmResult = await this.classifyWithLLM(input, context);
      return llmResult;
    } catch (error) {
      console.error('LLM classification failed, using pattern result:', error);
      return this.enrichIntent(patternResult, input, context);
    }
  }

  private classifyByPattern(input: string): ClassifiedIntent {
    const normalizedInput = input.toLowerCase().trim();
    let bestMatch: UserIntent = UserIntent.UNKNOWN;
    let bestConfidence = 0;
    let matchCount = 0;

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedInput)) {
          matchCount++;
          const confidence = this.calculatePatternConfidence(pattern, normalizedInput);
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestMatch = intent as UserIntent;
          }
        }
      }
    }

    // Boost confidence if multiple patterns match the same intent
    if (matchCount > 1) {
      bestConfidence = Math.min(bestConfidence + 0.1, 1);
    }

    return {
      type: bestMatch,
      confidence: bestConfidence,
      description: input,
      targets: this.extractTargets(input),
      specificChanges: [],
      successCriteria: [],
      potentialSideEffects: [],
      implicitRequirements: [],
    };
  }

  private calculatePatternConfidence(pattern: RegExp, input: string): number {
    const match = input.match(pattern);
    if (!match) return 0;
    
    // Longer matches = higher confidence
    const matchLength = match[0].length;
    const inputLength = input.length;
    const lengthRatio = matchLength / inputLength;
    
    // Base confidence + length bonus
    return Math.min(0.5 + lengthRatio * 0.5, 0.9);
  }

  private extractTargets(input: string): string[] {
    const targets: string[] = [];
    
    // Extract file paths
    const filePathPattern = /(?:\/|\.\/|\.\.\/)?[\w\-./]+\.\w+/g;
    const filePaths = input.match(filePathPattern);
    if (filePaths) {
      targets.push(...filePaths);
    }

    // Extract component/function names in quotes
    const quotedPattern = /['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = quotedPattern.exec(input)) !== null) {
      targets.push(match[1]);
    }

    // Extract code-like identifiers (camelCase, PascalCase, snake_case)
    const identifierPattern = /\b([A-Z][a-z]+[A-Z][a-zA-Z]*|[a-z]+[A-Z][a-zA-Z]*|[a-z]+_[a-z_]+)\b/g;
    while ((match = identifierPattern.exec(input)) !== null) {
      if (!targets.includes(match[1])) {
        targets.push(match[1]);
      }
    }

    return targets;
  }

  private async classifyWithLLM(input: string, context: ExecutionContext): Promise<ClassifiedIntent> {
    const prompt = this.buildClassificationPrompt(input, context);
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({
          input,
          context: this.serializeContext(context),
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Classification API error: ${response.status}`);
      }

      const result = await response.json();
      return this.parseClassificationResult(result, input);
    } catch (error) {
      console.error('LLM classification error:', error);
      throw error;
    }
  }

  private buildClassificationPrompt(input: string, context: ExecutionContext): string {
    return `
Classify the following user request into one of these intent types:
${Object.values(UserIntent).join(', ')}

User Request: "${input}"

Context:
- Active File: ${context.activeFile?.path || 'None'}
- Open Files: ${context.openFiles.map(f => f.path).join(', ') || 'None'}
- Project Type: ${context.codebaseAnalysis?.techStack?.framework || 'Unknown'}
- Recent Changes: ${context.recentChanges.slice(0, 3).map(c => c.description).join('; ') || 'None'}
- Recent Errors: ${context.errorHistory.slice(0, 2).map(e => e.message).join('; ') || 'None'}

Respond in JSON format:
{
  "type": "intent_type",
  "confidence": 0.0-1.0,
  "description": "What the user wants to achieve",
  "targets": ["file or component targets"],
  "specificChanges": ["specific changes requested"],
  "successCriteria": ["how to know if successful"],
  "potentialSideEffects": ["possible side effects"],
  "implicitRequirements": ["things user didn't say but needs"]
}
`;
  }

  private serializeContext(context: ExecutionContext): Record<string, unknown> {
    return {
      activeFile: context.activeFile ? {
        path: context.activeFile.path,
        name: context.activeFile.name,
        language: context.activeFile.language,
        // Truncate content for API
        content: context.activeFile.content.slice(0, 5000),
      } : null,
      openFiles: context.openFiles.map(f => ({
        path: f.path,
        name: f.name,
        language: f.language,
      })),
      selectedText: context.selectedText?.slice(0, 1000) || null,
      techStack: context.codebaseAnalysis?.techStack || null,
      recentChanges: context.recentChanges.slice(0, 5),
      errorHistory: context.errorHistory.slice(0, 3),
    };
  }

  private parseClassificationResult(result: any, originalInput: string): ClassifiedIntent {
    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      
      return {
        type: this.validateIntentType(parsed.type),
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        description: parsed.description || originalInput,
        targets: Array.isArray(parsed.targets) ? parsed.targets : [],
        specificChanges: Array.isArray(parsed.specificChanges) ? parsed.specificChanges : [],
        successCriteria: Array.isArray(parsed.successCriteria) ? parsed.successCriteria : [],
        potentialSideEffects: Array.isArray(parsed.potentialSideEffects) ? parsed.potentialSideEffects : [],
        implicitRequirements: Array.isArray(parsed.implicitRequirements) ? parsed.implicitRequirements : [],
      };
    } catch (error) {
      console.error('Failed to parse classification result:', error);
      return this.classifyByPattern(originalInput);
    }
  }

  private validateIntentType(type: string): UserIntent {
    if (Object.values(UserIntent).includes(type as UserIntent)) {
      return type as UserIntent;
    }
    return UserIntent.UNKNOWN;
  }

  private enrichIntent(
    intent: ClassifiedIntent, 
    input: string, 
    context: ExecutionContext
  ): ClassifiedIntent {
    // Add implicit requirements based on intent type
    const implicitRequirements: string[] = [...intent.implicitRequirements];
    
    switch (intent.type) {
      case UserIntent.ADD_FEATURE:
        implicitRequirements.push('Should follow existing code patterns');
        implicitRequirements.push('Should include error handling');
        if (context.codebaseAnalysis?.techStack?.testFramework) {
          implicitRequirements.push('May need tests');
        }
        break;
        
      case UserIntent.FIX_BUG:
        implicitRequirements.push('Should not introduce new bugs');
        implicitRequirements.push('Should understand root cause');
        break;
        
      case UserIntent.REFACTOR_CODE:
        implicitRequirements.push('Should maintain existing functionality');
        implicitRequirements.push('Should not break imports');
        break;
        
      case UserIntent.CREATE_FILE:
        implicitRequirements.push('Should follow project structure');
        implicitRequirements.push('Should include proper exports');
        break;
    }

    // Add success criteria based on intent type
    const successCriteria: string[] = [...intent.successCriteria];
    
    switch (intent.type) {
      case UserIntent.FIX_BUG:
        successCriteria.push('Error no longer occurs');
        successCriteria.push('No new errors introduced');
        break;
        
      case UserIntent.ADD_FEATURE:
        successCriteria.push('Feature works as expected');
        successCriteria.push('Code compiles without errors');
        break;
        
      case UserIntent.CREATE_FILE:
        successCriteria.push('File created in correct location');
        successCriteria.push('File has proper structure');
        break;
    }

    return {
      ...intent,
      implicitRequirements,
      successCriteria,
    };
  }
}

export default IntentClassifier;
