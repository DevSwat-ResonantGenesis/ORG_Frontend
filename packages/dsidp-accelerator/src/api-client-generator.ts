/**
 * DSID-P API Client Generator
 * 
 * Generate type-safe API clients from:
 * - OpenAPI/Swagger specs
 * - GraphQL schemas
 * - REST endpoints
 */

import { LLMEngine, createLLMEngine } from './llm-engine';

// ============== TYPES ==============

export interface APIClientConfig {
  outputPath: string;
  language: 'typescript' | 'javascript';
  httpClient: 'fetch' | 'axios' | 'ky';
  includeTypes: boolean;
  includeValidation: boolean;
  baseUrlEnvVar: string;
}

export interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, PathItem>;
  components?: { schemas?: Record<string, Schema> };
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  parameters?: Parameter[];
}

export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
}

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  schema: Schema;
  description?: string;
}

export interface RequestBody {
  required?: boolean;
  content: Record<string, { schema: Schema }>;
}

export interface Response {
  description: string;
  content?: Record<string, { schema: Schema }>;
}

export interface Schema {
  type?: string;
  format?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  enum?: string[];
  $ref?: string;
  allOf?: Schema[];
  oneOf?: Schema[];
  anyOf?: Schema[];
}

export interface GraphQLSchema {
  types: GraphQLType[];
  queries: GraphQLField[];
  mutations: GraphQLField[];
  subscriptions: GraphQLField[];
}

export interface GraphQLType {
  name: string;
  kind: 'OBJECT' | 'INPUT_OBJECT' | 'ENUM' | 'SCALAR' | 'INTERFACE' | 'UNION';
  fields?: GraphQLField[];
  enumValues?: string[];
}

export interface GraphQLField {
  name: string;
  type: string;
  args?: Array<{ name: string; type: string }>;
  description?: string;
}

// ============== OPENAPI CLIENT GENERATOR ==============

export class OpenAPIClientGenerator {
  private config: APIClientConfig;

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = {
      outputPath: config.outputPath || './api-client',
      language: config.language || 'typescript',
      httpClient: config.httpClient || 'fetch',
      includeTypes: config.includeTypes ?? true,
      includeValidation: config.includeValidation ?? false,
      baseUrlEnvVar: config.baseUrlEnvVar || 'API_BASE_URL',
    };
  }

  async generate(spec: OpenAPISpec): Promise<{ client: string; types: string }> {
    const types = this.generateTypes(spec);
    const client = this.generateClient(spec);
    return { client, types };
  }

  private generateTypes(spec: OpenAPISpec): string {
    let code = `// Generated API Types for ${spec.info.title}\n`;
    code += `// Version: ${spec.info.version}\n\n`;

    // Generate schema types
    if (spec.components?.schemas) {
      for (const [name, schema] of Object.entries(spec.components.schemas)) {
        code += this.schemaToType(name, schema);
      }
    }

    // Generate request/response types from paths
    for (const [path, item] of Object.entries(spec.paths)) {
      for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
        const operation = item[method];
        if (operation) {
          const opName = this.getOperationName(method, path, operation);
          
          // Request params type
          if (operation.parameters?.length) {
            code += this.generateParamsType(opName, operation.parameters);
          }
          
          // Request body type
          if (operation.requestBody) {
            code += this.generateBodyType(opName, operation.requestBody);
          }
          
          // Response type
          const successResponse = operation.responses['200'] || operation.responses['201'];
          if (successResponse?.content?.['application/json']?.schema) {
            code += this.generateResponseType(opName, successResponse.content['application/json'].schema);
          }
        }
      }
    }

    return code;
  }

  private generateClient(spec: OpenAPISpec): string {
    const baseUrl = spec.servers?.[0]?.url || '';
    
    let code = `// Generated API Client for ${spec.info.title}\n`;
    code += `// Version: ${spec.info.version}\n\n`;
    
    if (this.config.includeTypes) {
      code += `import type * as Types from './types';\n\n`;
    }

    // Base client setup
    code += this.generateBaseClient(baseUrl);

    // Generate methods for each endpoint
    for (const [path, item] of Object.entries(spec.paths)) {
      for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
        const operation = item[method];
        if (operation) {
          code += this.generateMethod(method, path, operation, item.parameters);
        }
      }
    }

    code += `}\n\n`;
    code += `export const api = new APIClient();\n`;
    code += `export default api;\n`;

    return code;
  }

  private generateBaseClient(baseUrl: string): string {
    if (this.config.httpClient === 'axios') {
      return `import axios from 'axios';

const BASE_URL = process.env.${this.config.baseUrlEnvVar} || '${baseUrl}';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export class APIClient {
  private token?: string;

  setToken(token: string) {
    this.token = token;
    client.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
  }

  clearToken() {
    this.token = undefined;
    delete client.defaults.headers.common['Authorization'];
  }

`;
    }

    return `const BASE_URL = process.env.${this.config.baseUrlEnvVar} || '${baseUrl}';

async function request<T>(
  method: string,
  path: string,
  options: { body?: unknown; params?: Record<string, string>; headers?: Record<string, string> } = {}
): Promise<T> {
  const url = new URL(path, BASE_URL);
  
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(\`API Error: \${response.status} \${response.statusText}\`);
  }

  return response.json();
}

export class APIClient {
  private token?: string;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = undefined;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = \`Bearer \${this.token}\`;
    }
    return headers;
  }

`;
  }

  private generateMethod(
    method: string,
    path: string,
    operation: Operation,
    pathParams?: Parameter[]
  ): string {
    const opName = this.getOperationName(method, path, operation);
    const allParams = [...(pathParams || []), ...(operation.parameters || [])];
    
    const pathParamNames = allParams.filter(p => p.in === 'path').map(p => p.name);
    const queryParams = allParams.filter(p => p.in === 'query');
    const hasBody = !!operation.requestBody;

    // Build function signature
    let params: string[] = [];
    
    for (const name of pathParamNames) {
      params.push(`${name}: string`);
    }
    
    if (queryParams.length > 0) {
      params.push(`params?: { ${queryParams.map(p => `${p.name}?: ${this.schemaToTsType(p.schema)}`).join('; ')} }`);
    }
    
    if (hasBody) {
      params.push(`body: Types.${opName}Body`);
    }

    // Build path with params
    let pathTemplate = path;
    for (const name of pathParamNames) {
      pathTemplate = pathTemplate.replace(`{${name}}`, `\${${name}}`);
    }

    let code = `  /**\n`;
    code += `   * ${operation.summary || opName}\n`;
    if (operation.description) {
      code += `   * ${operation.description}\n`;
    }
    code += `   */\n`;
    code += `  async ${opName}(${params.join(', ')}): Promise<Types.${opName}Response> {\n`;
    
    if (this.config.httpClient === 'axios') {
      code += `    const response = await client.${method}(\`${pathTemplate}\``;
      if (hasBody) {
        code += `, body`;
      }
      if (queryParams.length > 0) {
        code += `, { params }`;
      }
      code += `);\n`;
      code += `    return response.data;\n`;
    } else {
      code += `    return request<Types.${opName}Response>('${method.toUpperCase()}', \`${pathTemplate}\`, {\n`;
      if (hasBody) {
        code += `      body,\n`;
      }
      if (queryParams.length > 0) {
        code += `      params: params as Record<string, string>,\n`;
      }
      code += `      headers: this.getHeaders(),\n`;
      code += `    });\n`;
    }
    
    code += `  }\n\n`;
    return code;
  }

  private getOperationName(method: string, path: string, operation: Operation): string {
    if (operation.operationId) {
      return this.toCamelCase(operation.operationId);
    }
    
    const parts = path.split('/').filter(Boolean).map(p => {
      if (p.startsWith('{')) return 'By' + this.toPascalCase(p.slice(1, -1));
      return this.toPascalCase(p);
    });
    
    return method + parts.join('');
  }

  private schemaToType(name: string, schema: Schema): string {
    if (schema.enum) {
      return `export type ${name} = ${schema.enum.map(e => `'${e}'`).join(' | ')};\n\n`;
    }

    if (schema.type === 'object' || schema.properties) {
      let code = `export interface ${name} {\n`;
      
      for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
        const required = schema.required?.includes(propName);
        const optional = required ? '' : '?';
        code += `  ${propName}${optional}: ${this.schemaToTsType(propSchema)};\n`;
      }
      
      code += `}\n\n`;
      return code;
    }

    return `export type ${name} = ${this.schemaToTsType(schema)};\n\n`;
  }

  private schemaToTsType(schema: Schema): string {
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop() || 'unknown';
      return refName;
    }

    if (schema.allOf) {
      return schema.allOf.map(s => this.schemaToTsType(s)).join(' & ');
    }

    if (schema.oneOf || schema.anyOf) {
      const schemas = schema.oneOf || schema.anyOf || [];
      return schemas.map(s => this.schemaToTsType(s)).join(' | ');
    }

    switch (schema.type) {
      case 'string':
        if (schema.enum) {
          return schema.enum.map(e => `'${e}'`).join(' | ');
        }
        return 'string';
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return `${this.schemaToTsType(schema.items || {})}[]`;
      case 'object':
        if (schema.properties) {
          const props = Object.entries(schema.properties)
            .map(([k, v]) => `${k}: ${this.schemaToTsType(v)}`)
            .join('; ');
          return `{ ${props} }`;
        }
        return 'Record<string, unknown>';
      default:
        return 'unknown';
    }
  }

  private generateParamsType(opName: string, params: Parameter[]): string {
    let code = `export interface ${opName}Params {\n`;
    for (const param of params) {
      const optional = param.required ? '' : '?';
      code += `  ${param.name}${optional}: ${this.schemaToTsType(param.schema)};\n`;
    }
    code += `}\n\n`;
    return code;
  }

  private generateBodyType(opName: string, body: RequestBody): string {
    const schema = body.content['application/json']?.schema;
    if (!schema) return '';
    
    return `export type ${opName}Body = ${this.schemaToTsType(schema)};\n\n`;
  }

  private generateResponseType(opName: string, schema: Schema): string {
    return `export type ${opName}Response = ${this.schemaToTsType(schema)};\n\n`;
  }

  private toCamelCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
  }

  private toPascalCase(str: string): string {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }
}

// ============== GRAPHQL CLIENT GENERATOR ==============

export class GraphQLClientGenerator {
  private config: APIClientConfig;

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = {
      outputPath: config.outputPath || './graphql-client',
      language: config.language || 'typescript',
      httpClient: config.httpClient || 'fetch',
      includeTypes: config.includeTypes ?? true,
      includeValidation: config.includeValidation ?? false,
      baseUrlEnvVar: config.baseUrlEnvVar || 'GRAPHQL_ENDPOINT',
    };
  }

  async generate(schema: GraphQLSchema): Promise<{ client: string; types: string }> {
    const types = this.generateTypes(schema);
    const client = this.generateClient(schema);
    return { client, types };
  }

  private generateTypes(schema: GraphQLSchema): string {
    let code = '// Generated GraphQL Types\n\n';

    // Generate type definitions
    for (const type of schema.types) {
      if (type.name.startsWith('__')) continue;
      
      if (type.kind === 'ENUM') {
        code += `export type ${type.name} = ${type.enumValues?.map(v => `'${v}'`).join(' | ')};\n\n`;
      } else if (type.kind === 'OBJECT' || type.kind === 'INPUT_OBJECT') {
        code += `export interface ${type.name} {\n`;
        for (const field of type.fields || []) {
          code += `  ${field.name}: ${this.graphqlToTsType(field.type)};\n`;
        }
        code += `}\n\n`;
      }
    }

    return code;
  }

  private generateClient(schema: GraphQLSchema): string {
    let code = `// Generated GraphQL Client\n\n`;
    code += `import type * as Types from './types';\n\n`;
    
    code += `const ENDPOINT = process.env.${this.config.baseUrlEnvVar} || '/graphql';\n\n`;
    
    code += `async function graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  
  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  
  return result.data;
}\n\n`;

    // Generate query methods
    code += `export const queries = {\n`;
    for (const query of schema.queries) {
      code += this.generateQueryMethod(query);
    }
    code += `};\n\n`;

    // Generate mutation methods
    code += `export const mutations = {\n`;
    for (const mutation of schema.mutations) {
      code += this.generateMutationMethod(mutation);
    }
    code += `};\n\n`;

    code += `export default { queries, mutations };\n`;

    return code;
  }

  private generateQueryMethod(field: GraphQLField): string {
    const args = field.args?.map(a => `$${a.name}: ${a.type}`).join(', ') || '';
    const params = field.args?.map(a => `${a.name}: $${a.name}`).join(', ') || '';
    const tsArgs = field.args?.map(a => `${a.name}: ${this.graphqlToTsType(a.type)}`).join(', ') || '';
    const variables = field.args?.map(a => a.name).join(', ') || '';

    return `  async ${field.name}(${tsArgs}): Promise<Types.${this.graphqlToTsType(field.type)}> {
    const query = \`query${args ? `(${args})` : ''} { ${field.name}${params ? `(${params})` : ''} { ...fields } }\`;
    const result = await graphql<{ ${field.name}: Types.${this.graphqlToTsType(field.type)} }>(query${variables ? `, { ${variables} }` : ''});
    return result.${field.name};
  },
`;
  }

  private generateMutationMethod(field: GraphQLField): string {
    const args = field.args?.map(a => `$${a.name}: ${a.type}`).join(', ') || '';
    const params = field.args?.map(a => `${a.name}: $${a.name}`).join(', ') || '';
    const tsArgs = field.args?.map(a => `${a.name}: ${this.graphqlToTsType(a.type)}`).join(', ') || '';
    const variables = field.args?.map(a => a.name).join(', ') || '';

    return `  async ${field.name}(${tsArgs}): Promise<Types.${this.graphqlToTsType(field.type)}> {
    const mutation = \`mutation${args ? `(${args})` : ''} { ${field.name}${params ? `(${params})` : ''} { ...fields } }\`;
    const result = await graphql<{ ${field.name}: Types.${this.graphqlToTsType(field.type)} }>(mutation${variables ? `, { ${variables} }` : ''});
    return result.${field.name};
  },
`;
  }

  private graphqlToTsType(type: string): string {
    // Handle non-null and list types
    const isNonNull = type.endsWith('!');
    const isList = type.startsWith('[');
    
    let baseType = type.replace(/[!\[\]]/g, '');
    
    // Map GraphQL scalars to TypeScript
    const scalarMap: Record<string, string> = {
      'String': 'string',
      'Int': 'number',
      'Float': 'number',
      'Boolean': 'boolean',
      'ID': 'string',
    };
    
    const tsType = scalarMap[baseType] || baseType;
    
    if (isList) {
      return `${tsType}[]${isNonNull ? '' : ' | null'}`;
    }
    
    return isNonNull ? tsType : `${tsType} | null`;
  }
}

// ============== AUTO GENERATOR ==============

export class APIClientAutoGenerator {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async generateFromEndpoints(endpoints: string[]): Promise<string> {
    const prompt = `Generate a TypeScript API client for these endpoints:

${endpoints.join('\n')}

Generate:
1. TypeScript interfaces for request/response types
2. A client class with methods for each endpoint
3. Error handling
4. Token-based authentication support

Use fetch as the HTTP client. Include JSDoc comments.`;

    return this.llm.chat_simple(prompt);
  }

  async generateFromDescription(description: string): Promise<string> {
    const prompt = `Generate a TypeScript API client based on this description:

${description}

Include:
1. All necessary type definitions
2. Client class with async methods
3. Error handling
4. Authentication support
5. Request/response validation`;

    return this.llm.chat_simple(prompt);
  }
}

// ============== FACTORY ==============

export function createOpenAPIClientGenerator(config?: Partial<APIClientConfig>): OpenAPIClientGenerator {
  return new OpenAPIClientGenerator(config);
}

export function createGraphQLClientGenerator(config?: Partial<APIClientConfig>): GraphQLClientGenerator {
  return new GraphQLClientGenerator(config);
}

export function createAPIClientAutoGenerator(llm?: LLMEngine): APIClientAutoGenerator {
  return new APIClientAutoGenerator(llm);
}
