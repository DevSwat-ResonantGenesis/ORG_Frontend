/**
 * DSID-P LLM Engine
 * 
 * Multi-provider LLM integration for:
 * - Code generation
 * - Code analysis
 * - Natural language understanding
 * - Planning and reasoning
 */

// ============== TYPES ==============

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'azure' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retries: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'function_call' | 'error';
  functionCall?: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface CodeGenerationRequest {
  task: string;
  language: string;
  context?: string;
  existingCode?: string;
  constraints?: string[];
  style?: 'concise' | 'verbose' | 'documented';
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  analysisType: 'bugs' | 'security' | 'performance' | 'style' | 'all';
}

export interface PlanningRequest {
  goal: string;
  context: string;
  constraints?: string[];
  availableTools: string[];
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

// ============== PROMPTS ==============

const SYSTEM_PROMPTS = {
  codeGeneration: `You are an expert software engineer. Generate clean, production-ready code.
Rules:
- Write idiomatic, modern code
- Include proper error handling
- Add TypeScript types where applicable
- Follow best practices for the language
- Make code readable and maintainable
- Do not include explanations unless asked`,

  codeAnalysis: `You are a senior code reviewer. Analyze code for issues and improvements.
Report:
- Bugs and potential runtime errors
- Security vulnerabilities
- Performance issues
- Code style violations
- Suggestions for improvement
Format your response as JSON with categories.`,

  planning: `You are a technical project planner. Create detailed execution plans.
For each plan:
- Break down into specific tasks
- Identify dependencies between tasks
- Estimate complexity (low/medium/high)
- List required tools and resources
- Consider error scenarios
Output as structured JSON.`,

  debugging: `You are a debugging expert. Analyze errors and provide fixes.
For each error:
- Identify root cause
- Explain why it happened
- Provide exact fix with code
- Suggest preventive measures`,

  refactoring: `You are a refactoring specialist. Improve code structure.
Focus on:
- Clean architecture principles
- DRY (Don't Repeat Yourself)
- SOLID principles
- Readability and maintainability
- Performance where relevant`,
};

// ============== LLM ENGINE ==============

export class LLMEngine {
  private config: LLMConfig;
  private conversationHistory: LLMMessage[] = [];
  private tokenUsage = { prompt: 0, completion: 0, total: 0 };

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = {
      provider: config.provider || 'openai',
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
      baseUrl: config.baseUrl,
      model: config.model || this.getDefaultModel(config.provider || 'openai'),
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature ?? 0.7,
      timeout: config.timeout || 60000,
      retries: config.retries || 3,
    };
  }

  private getDefaultModel(provider: string): string {
    switch (provider) {
      case 'openai': return 'gpt-4-turbo-preview';
      case 'anthropic': return 'claude-3-opus-20240229';
      case 'ollama': return 'llama2';
      case 'azure': return 'gpt-4';
      default: return 'gpt-4';
    }
  }

  // ============== CORE API ==============

  async chat(messages: LLMMessage[], functions?: FunctionDefinition[]): Promise<LLMResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const response = await this.callProvider(messages, functions);
        
        // Track usage
        this.tokenUsage.prompt += response.usage.promptTokens;
        this.tokenUsage.completion += response.usage.completionTokens;
        this.tokenUsage.total += response.usage.totalTokens;

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Exponential backoff
        if (attempt < this.config.retries - 1) {
          await this.sleep(1000 * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('LLM request failed');
  }

  private async callProvider(messages: LLMMessage[], functions?: FunctionDefinition[]): Promise<LLMResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(messages, functions);
      case 'anthropic':
        return this.callAnthropic(messages);
      case 'ollama':
        return this.callOllama(messages);
      case 'azure':
        return this.callAzure(messages, functions);
      default:
        return this.callCustom(messages, functions);
    }
  }

  // ============== PROVIDER IMPLEMENTATIONS ==============

  private async callOpenAI(messages: LLMMessage[], functions?: FunctionDefinition[]): Promise<LLMResponse> {
    const url = this.config.baseUrl || 'https://api.openai.com/v1/chat/completions';
    
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.name && { name: m.name }),
        ...(m.function_call && { function_call: m.function_call }),
      })),
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
    };

    if (functions && functions.length > 0) {
      body.functions = functions;
      body.function_call = 'auto';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content || '',
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason: choice.finish_reason,
      functionCall: choice.message.function_call ? {
        name: choice.message.function_call.name,
        arguments: JSON.parse(choice.message.function_call.arguments),
      } : undefined,
    };
  }

  private async callAnthropic(messages: LLMMessage[]): Promise<LLMResponse> {
    const url = this.config.baseUrl || 'https://api.anthropic.com/v1/messages';
    
    // Convert messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2024-01-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        system: systemMessage?.content || '',
        messages: chatMessages,
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
    }

    const data = await response.json();

    return {
      content: data.content[0]?.text || '',
      model: data.model,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
    };
  }

  private async callOllama(messages: LLMMessage[]): Promise<LLMResponse> {
    const url = this.config.baseUrl || 'http://localhost:11434/api/chat';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.message?.content || '',
      model: data.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
      finishReason: 'stop',
    };
  }

  private async callAzure(messages: LLMMessage[], functions?: FunctionDefinition[]): Promise<LLMResponse> {
    // Azure OpenAI uses same format as OpenAI
    return this.callOpenAI(messages, functions);
  }

  private async callCustom(messages: LLMMessage[], functions?: FunctionDefinition[]): Promise<LLMResponse> {
    if (!this.config.baseUrl) {
      throw new Error('Custom provider requires baseUrl');
    }
    // Assume OpenAI-compatible API
    return this.callOpenAI(messages, functions);
  }

  // ============== HIGH-LEVEL METHODS ==============

  async generateCode(request: CodeGenerationRequest): Promise<string> {
    const messages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.codeGeneration },
      {
        role: 'user',
        content: `Task: ${request.task}
Language: ${request.language}
${request.context ? `Context: ${request.context}` : ''}
${request.existingCode ? `Existing code to modify:\n\`\`\`\n${request.existingCode}\n\`\`\`` : ''}
${request.constraints ? `Constraints:\n${request.constraints.map(c => `- ${c}`).join('\n')}` : ''}
Style: ${request.style || 'concise'}

Generate the code:`,
      },
    ];

    const response = await this.chat(messages);
    return this.extractCode(response.content);
  }

  async analyzeCode(request: CodeAnalysisRequest): Promise<{
    bugs: string[];
    security: string[];
    performance: string[];
    style: string[];
    suggestions: string[];
  }> {
    const messages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.codeAnalysis },
      {
        role: 'user',
        content: `Analyze this ${request.language} code for ${request.analysisType}:

\`\`\`${request.language}
${request.code}
\`\`\`

Return JSON with categories: bugs, security, performance, style, suggestions`,
      },
    ];

    const response = await this.chat(messages);
    
    try {
      return JSON.parse(this.extractJson(response.content));
    } catch {
      return {
        bugs: [],
        security: [],
        performance: [],
        style: [],
        suggestions: [response.content],
      };
    }
  }

  async createPlan(request: PlanningRequest): Promise<{
    tasks: Array<{
      id: string;
      name: string;
      description: string;
      tool: string;
      dependencies: string[];
      complexity: 'low' | 'medium' | 'high';
    }>;
    estimatedTime: number;
  }> {
    const messages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.planning },
      {
        role: 'user',
        content: `Goal: ${request.goal}

Context: ${request.context}

Available tools: ${request.availableTools.join(', ')}

${request.constraints ? `Constraints:\n${request.constraints.map(c => `- ${c}`).join('\n')}` : ''}

Create a detailed execution plan as JSON with: tasks (id, name, description, tool, dependencies, complexity), estimatedTime (minutes)`,
      },
    ];

    const response = await this.chat(messages);
    
    try {
      return JSON.parse(this.extractJson(response.content));
    } catch {
      return {
        tasks: [{
          id: 'task-1',
          name: request.goal,
          description: 'Execute the goal',
          tool: request.availableTools[0] || 'run_terminal',
          dependencies: [],
          complexity: 'medium',
        }],
        estimatedTime: 30,
      };
    }
  }

  async debugError(error: string, code: string, language: string): Promise<{
    cause: string;
    fix: string;
    fixedCode: string;
    prevention: string[];
  }> {
    const messages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.debugging },
      {
        role: 'user',
        content: `Error: ${error}

Code (${language}):
\`\`\`${language}
${code}
\`\`\`

Analyze and provide JSON with: cause, fix (explanation), fixedCode, prevention (array)`,
      },
    ];

    const response = await this.chat(messages);
    
    try {
      return JSON.parse(this.extractJson(response.content));
    } catch {
      return {
        cause: 'Unable to determine',
        fix: response.content,
        fixedCode: code,
        prevention: [],
      };
    }
  }

  async refactorCode(code: string, language: string, focus: string[]): Promise<{
    refactoredCode: string;
    changes: string[];
    explanation: string;
  }> {
    const messages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.refactoring },
      {
        role: 'user',
        content: `Refactor this ${language} code focusing on: ${focus.join(', ')}

\`\`\`${language}
${code}
\`\`\`

Return JSON with: refactoredCode, changes (array), explanation`,
      },
    ];

    const response = await this.chat(messages);
    
    try {
      return JSON.parse(this.extractJson(response.content));
    } catch {
      return {
        refactoredCode: code,
        changes: [],
        explanation: response.content,
      };
    }
  }

  async chat_simple(userMessage: string, systemPrompt?: string): Promise<string> {
    const messages: LLMMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: userMessage });
    
    const response = await this.chat(messages);
    return response.content;
  }

  // ============== CONVERSATION ==============

  addToHistory(message: LLMMessage): void {
    this.conversationHistory.push(message);
    
    // Keep history manageable (last 20 messages)
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  async continueConversation(userMessage: string): Promise<string> {
    this.addToHistory({ role: 'user', content: userMessage });
    
    const response = await this.chat(this.conversationHistory);
    
    this.addToHistory({ role: 'assistant', content: response.content });
    
    return response.content;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  // ============== UTILITIES ==============

  private extractCode(content: string): string {
    // Extract code from markdown code blocks
    const codeBlockMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    return content.trim();
  }

  private extractJson(content: string): string {
    // Try to find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return content;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============== STATS ==============

  getTokenUsage(): { prompt: number; completion: number; total: number } {
    return { ...this.tokenUsage };
  }

  resetTokenUsage(): void {
    this.tokenUsage = { prompt: 0, completion: 0, total: 0 };
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }
}

// ============== FACTORY ==============

export function createLLMEngine(config?: Partial<LLMConfig>): LLMEngine {
  return new LLMEngine(config);
}

// ============== DEFAULT INSTANCE ==============

let defaultEngine: LLMEngine | null = null;

export function getLLMEngine(config?: Partial<LLMConfig>): LLMEngine {
  if (!defaultEngine) {
    defaultEngine = createLLMEngine(config);
  }
  return defaultEngine;
}

export { SYSTEM_PROMPTS };
