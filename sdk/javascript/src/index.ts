/**
 * ResonantGraph AI JavaScript/TypeScript SDK
 * Official client for ResonantGraph AI Platform
 */

export interface ValidationOptions {
  model_output: string;
  context?: string;
  policy_pack?: string;
}

export interface ValidationResult {
  validity: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  detected_issues: string[];
  confidence: number;
  summary: string;
}

export interface PredictionOptions {
  input_text: string;
  context?: Record<string, any>;
}

export interface Prediction {
  id: string;
  validity: number;
  risk_level: string;
  anchors?: string[];
  resonance_score?: number;
  created_at: string;
}

export interface ListPredictionsOptions {
  start_date?: string;
  end_date?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  limit?: number;
  offset?: number;
}

export interface ResonantGraphConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class ResonantGraphError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ResonantGraphError';
  }
}

export class AuthenticationError extends ResonantGraphError {
  constructor(message: string = 'Invalid API key or expired token') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends ResonantGraphError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * ResonantGraph AI Client
 * 
 * @example
 * ```typescript
 * import { ResonantGraph } from '@resonantgraph/sdk';
 * 
 * const client = new ResonantGraph({
 *   apiKey: 'your-api-key'
 * });
 * 
 * const result = await client.validate({
 *   modelOutput: 'Your LLM output',
 *   policyPack: 'compliance-v1'
 * });
 * 
 * console.log(result.complianceScore);
 * ```
 */
export class ResonantGraph {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: ResonantGraphConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.resonantgraph.ai';
    this.timeout = config.timeout || 30000;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url.toString(), options);

      if (response.status === 401) {
        throw new AuthenticationError();
      } else if (response.status === 429) {
        throw new RateLimitError();
      } else if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ResonantGraphError(
          errorData.detail || `API error ${response.status}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ResonantGraphError) {
        throw error;
      }
      throw new ResonantGraphError(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate AI-generated content
   */
  async validate(options: ValidationOptions): Promise<ValidationResult> {
    const data: any = {
      text: options.model_output,
    };
    
    if (options.context) {
      data.context = options.context;
    }

    return this.request<ValidationResult>('POST', '/public/validate', data);
  }

  /**
   * Create a prediction and get analysis
   */
  async createPrediction(options: PredictionOptions): Promise<Prediction> {
    const data: any = {
      input_text: options.input_text,
    };
    
    if (options.context) {
      data.context = options.context;
    }

    return this.request<Prediction>('POST', '/predictions', data);
  }

  /**
   * Get prediction details by ID
   */
  async getPrediction(predictionId: string): Promise<Prediction> {
    return this.request<Prediction>('GET', `/predictions/${predictionId}`);
  }

  /**
   * List predictions with optional filters
   */
  async listPredictions(options: ListPredictionsOptions = {}): Promise<{ items: Prediction[]; total: number; limit: number; offset: number }> {
    const params: Record<string, any> = {
      limit: options.limit || 50,
      offset: options.offset || 0,
    };
    
    if (options.start_date) params.start_date = options.start_date;
    if (options.end_date) params.end_date = options.end_date;
    if (options.risk_level) params.risk_level = options.risk_level;

    return this.request('GET', '/predictions', undefined, params);
  }

  /**
   * Get evidence graph for a prediction
   */
  async getEvidenceGraph(predictionId: string): Promise<{ nodes: any[]; edges: any[] }> {
    return this.request('GET', `/evidence/${predictionId}`);
  }

  /**
   * List all compliance policies
   */
  async listPolicies(): Promise<any[]> {
    return this.request<any[]>('GET', '/policies');
  }

  /**
   * Get compliance summary statistics
   */
  async getComplianceSummary(): Promise<any> {
    return this.request('GET', '/compliance/summary');
  }
}

export default ResonantGraph;


