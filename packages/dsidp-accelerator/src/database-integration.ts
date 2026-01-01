/**
 * DSID-P Database Integration
 * 
 * Automatic database setup and management:
 * - Schema generation from descriptions
 * - Migration management
 * - ORM setup (Prisma, Drizzle, TypeORM)
 * - Seed data generation
 * - Query optimization
 */

import { LLMEngine, createLLMEngine } from './llm-engine';

// ============== TYPES ==============

export interface DatabaseConfig {
  provider: DatabaseProvider;
  connectionString?: string;
  orm: ORMType;
  schemaPath: string;
  migrationsPath: string;
  seedPath: string;
}

export type DatabaseProvider = 
  | 'postgresql'
  | 'mysql'
  | 'sqlite'
  | 'mongodb'
  | 'cockroachdb'
  | 'planetscale'
  | 'supabase'
  | 'neon';

export type ORMType = 'prisma' | 'drizzle' | 'typeorm' | 'mongoose' | 'kysely';

export interface TableSchema {
  name: string;
  columns: ColumnDefinition[];
  indexes: IndexDefinition[];
  relations: RelationDefinition[];
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  unique: boolean;
  default?: string;
  primaryKey: boolean;
  autoIncrement: boolean;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface RelationDefinition {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  from: string;
  to: string;
  foreignKey: string;
}

export interface Migration {
  id: string;
  name: string;
  timestamp: number;
  up: string;
  down: string;
  applied: boolean;
}

export interface SeedData {
  table: string;
  records: Record<string, unknown>[];
}

export interface QueryOptimization {
  originalQuery: string;
  optimizedQuery: string;
  improvements: string[];
  estimatedSpeedup: number;
}

// ============== SCHEMA GENERATOR ==============

export class SchemaGenerator {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async generateFromDescription(description: string, orm: ORMType = 'prisma'): Promise<string> {
    const prompt = `Generate a ${orm} database schema for the following application:

${description}

Requirements:
- Include all necessary tables/models
- Add proper relationships (one-to-one, one-to-many, many-to-many)
- Include indexes for common queries
- Add timestamps (createdAt, updatedAt) where appropriate
- Use proper data types
- Include soft delete where appropriate
- Add proper constraints

Return ONLY the schema code, no explanations.`;

    const response = await this.llm.chat_simple(prompt);
    return this.extractCode(response);
  }

  async generateFromEntities(entities: string[]): Promise<TableSchema[]> {
    const schemas: TableSchema[] = [];

    for (const entity of entities) {
      const schema = await this.generateEntitySchema(entity);
      schemas.push(schema);
    }

    // Add relationships
    return this.inferRelationships(schemas);
  }

  private async generateEntitySchema(entity: string): Promise<TableSchema> {
    const prompt = `Generate a database table schema for entity: "${entity}"

Return JSON with:
{
  "name": "table_name",
  "columns": [
    { "name": "id", "type": "uuid", "nullable": false, "unique": true, "primaryKey": true, "autoIncrement": false },
    ...
  ],
  "indexes": [
    { "name": "idx_name", "columns": ["col"], "unique": false }
  ],
  "relations": []
}`;

    const response = await this.llm.chat_simple(prompt);
    try {
      return JSON.parse(this.extractJson(response));
    } catch {
      return {
        name: entity.toLowerCase(),
        columns: [
          { name: 'id', type: 'uuid', nullable: false, unique: true, primaryKey: true, autoIncrement: false },
          { name: 'createdAt', type: 'timestamp', nullable: false, unique: false, primaryKey: false, autoIncrement: false },
          { name: 'updatedAt', type: 'timestamp', nullable: false, unique: false, primaryKey: false, autoIncrement: false },
        ],
        indexes: [],
        relations: [],
      };
    }
  }

  private inferRelationships(schemas: TableSchema[]): TableSchema[] {
    // Simple relationship inference based on naming conventions
    for (const schema of schemas) {
      for (const column of schema.columns) {
        if (column.name.endsWith('Id') && column.name !== 'id') {
          const relatedTable = column.name.replace('Id', '').toLowerCase();
          const related = schemas.find(s => s.name.toLowerCase() === relatedTable);
          
          if (related) {
            schema.relations.push({
              name: relatedTable,
              type: 'many-to-one' as any,
              from: schema.name,
              to: related.name,
              foreignKey: column.name,
            });
          }
        }
      }
    }
    
    return schemas;
  }

  private extractCode(content: string): string {
    const codeBlockMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
    return codeBlockMatch ? codeBlockMatch[1].trim() : content.trim();
  }

  private extractJson(content: string): string {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : content;
  }
}

// ============== ORM GENERATORS ==============

export class PrismaGenerator {
  generateSchema(tables: TableSchema[]): string {
    let schema = `// Prisma Schema
// Generated by DSID-P Accelerator

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

    for (const table of tables) {
      schema += this.generateModel(table);
    }

    return schema;
  }

  private generateModel(table: TableSchema): string {
    let model = `model ${this.pascalCase(table.name)} {\n`;

    for (const col of table.columns) {
      model += `  ${col.name} ${this.prismaType(col.type)}`;
      if (col.primaryKey) model += ' @id';
      if (col.autoIncrement) model += ' @default(autoincrement())';
      if (col.type === 'uuid' && col.primaryKey) model += ' @default(uuid())';
      if (col.unique && !col.primaryKey) model += ' @unique';
      if (!col.nullable) model += '';
      else model += '?';
      if (col.default) model += ` @default(${col.default})`;
      if (col.name === 'createdAt') model += ' @default(now())';
      if (col.name === 'updatedAt') model += ' @updatedAt';
      model += '\n';
    }

    // Add relations
    for (const rel of table.relations) {
      model += `  ${rel.name} ${this.pascalCase(rel.to)}? @relation(fields: [${rel.foreignKey}], references: [id])\n`;
    }

    // Add indexes
    if (table.indexes.length > 0) {
      model += '\n';
      for (const idx of table.indexes) {
        if (idx.unique) {
          model += `  @@unique([${idx.columns.join(', ')}])\n`;
        } else {
          model += `  @@index([${idx.columns.join(', ')}])\n`;
        }
      }
    }

    model += '}\n\n';
    return model;
  }

  private prismaType(type: string): string {
    const typeMap: Record<string, string> = {
      'uuid': 'String',
      'string': 'String',
      'text': 'String',
      'int': 'Int',
      'integer': 'Int',
      'bigint': 'BigInt',
      'float': 'Float',
      'decimal': 'Decimal',
      'boolean': 'Boolean',
      'bool': 'Boolean',
      'timestamp': 'DateTime',
      'datetime': 'DateTime',
      'date': 'DateTime',
      'json': 'Json',
      'bytes': 'Bytes',
    };
    return typeMap[type.toLowerCase()] || 'String';
  }

  private pascalCase(str: string): string {
    return str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
  }

  generateMigration(name: string, changes: string): string {
    return `-- Migration: ${name}
-- Generated: ${new Date().toISOString()}

${changes}
`;
  }
}

export class DrizzleGenerator {
  generateSchema(tables: TableSchema[]): string {
    let schema = `// Drizzle Schema
// Generated by DSID-P Accelerator

import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';

`;

    for (const table of tables) {
      schema += this.generateTable(table);
    }

    return schema;
  }

  private generateTable(table: TableSchema): string {
    let code = `export const ${this.camelCase(table.name)} = pgTable('${table.name}', {\n`;

    for (const col of table.columns) {
      code += `  ${col.name}: ${this.drizzleType(col)}`;
      if (col.primaryKey) code += '.primaryKey()';
      if (col.unique && !col.primaryKey) code += '.unique()';
      if (!col.nullable) code += '.notNull()';
      if (col.default) code += `.default(${col.default})`;
      code += ',\n';
    }

    code += '}';

    // Add indexes
    if (table.indexes.length > 0) {
      code += ', (table) => ({\n';
      for (const idx of table.indexes) {
        const indexFn = idx.unique ? 'uniqueIndex' : 'index';
        code += `  ${idx.name}: ${indexFn}('${idx.name}').on(${idx.columns.map(c => `table.${c}`).join(', ')}),\n`;
      }
      code += '})';
    }

    code += ');\n\n';
    return code;
  }

  private drizzleType(col: ColumnDefinition): string {
    const typeMap: Record<string, string> = {
      'uuid': `uuid('${col.name}')`,
      'string': `varchar('${col.name}', { length: 255 })`,
      'text': `text('${col.name}')`,
      'int': `integer('${col.name}')`,
      'integer': `integer('${col.name}')`,
      'boolean': `boolean('${col.name}')`,
      'timestamp': `timestamp('${col.name}')`,
      'datetime': `timestamp('${col.name}')`,
    };
    return typeMap[col.type.toLowerCase()] || `varchar('${col.name}', { length: 255 })`;
  }

  private camelCase(str: string): string {
    return str.replace(/_(\w)/g, (_, c) => c.toUpperCase());
  }
}

// ============== MIGRATION MANAGER ==============

export class MigrationManager {
  private config: DatabaseConfig;
  private migrations: Migration[] = [];

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = {
      provider: config.provider || 'postgresql',
      orm: config.orm || 'prisma',
      schemaPath: config.schemaPath || './prisma/schema.prisma',
      migrationsPath: config.migrationsPath || './prisma/migrations',
      seedPath: config.seedPath || './prisma/seed.ts',
    };
  }

  async createMigration(name: string, changes: TableSchema[]): Promise<Migration> {
    const migration: Migration = {
      id: `${Date.now()}_${name}`,
      name,
      timestamp: Date.now(),
      up: this.generateUpMigration(changes),
      down: this.generateDownMigration(changes),
      applied: false,
    };

    this.migrations.push(migration);
    return migration;
  }

  private generateUpMigration(changes: TableSchema[]): string {
    let sql = '';

    for (const table of changes) {
      sql += `CREATE TABLE IF NOT EXISTS "${table.name}" (\n`;
      
      const columnDefs = table.columns.map(col => {
        let def = `  "${col.name}" ${this.sqlType(col.type)}`;
        if (col.primaryKey) def += ' PRIMARY KEY';
        if (!col.nullable) def += ' NOT NULL';
        if (col.unique && !col.primaryKey) def += ' UNIQUE';
        if (col.default) def += ` DEFAULT ${col.default}`;
        return def;
      });
      
      sql += columnDefs.join(',\n');
      sql += '\n);\n\n';

      // Create indexes
      for (const idx of table.indexes) {
        const unique = idx.unique ? 'UNIQUE ' : '';
        sql += `CREATE ${unique}INDEX IF NOT EXISTS "${idx.name}" ON "${table.name}" (${idx.columns.map(c => `"${c}"`).join(', ')});\n`;
      }
    }

    return sql;
  }

  private generateDownMigration(changes: TableSchema[]): string {
    return changes.map(t => `DROP TABLE IF EXISTS "${t.name}" CASCADE;`).join('\n');
  }

  private sqlType(type: string): string {
    const typeMap: Record<string, string> = {
      'uuid': 'UUID',
      'string': 'VARCHAR(255)',
      'text': 'TEXT',
      'int': 'INTEGER',
      'integer': 'INTEGER',
      'bigint': 'BIGINT',
      'float': 'FLOAT',
      'decimal': 'DECIMAL(10,2)',
      'boolean': 'BOOLEAN',
      'timestamp': 'TIMESTAMP',
      'datetime': 'TIMESTAMP',
      'date': 'DATE',
      'json': 'JSONB',
    };
    return typeMap[type.toLowerCase()] || 'VARCHAR(255)';
  }

  async runMigrations(): Promise<string[]> {
    const applied: string[] = [];
    
    for (const migration of this.migrations) {
      if (!migration.applied) {
        // Would execute migration.up against database
        migration.applied = true;
        applied.push(migration.id);
      }
    }
    
    return applied;
  }

  async rollback(count: number = 1): Promise<string[]> {
    const rolledBack: string[] = [];
    const appliedMigrations = this.migrations.filter(m => m.applied).reverse();
    
    for (let i = 0; i < Math.min(count, appliedMigrations.length); i++) {
      const migration = appliedMigrations[i];
      // Would execute migration.down against database
      migration.applied = false;
      rolledBack.push(migration.id);
    }
    
    return rolledBack;
  }

  getMigrations(): Migration[] {
    return [...this.migrations];
  }
}

// ============== SEED GENERATOR ==============

export class SeedGenerator {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async generateSeedData(tables: TableSchema[], count: number = 10): Promise<SeedData[]> {
    const seeds: SeedData[] = [];

    for (const table of tables) {
      const records = await this.generateRecords(table, count);
      seeds.push({ table: table.name, records });
    }

    return seeds;
  }

  private async generateRecords(table: TableSchema, count: number): Promise<Record<string, unknown>[]> {
    const prompt = `Generate ${count} realistic seed data records for a database table with these columns:
${table.columns.map(c => `- ${c.name}: ${c.type}`).join('\n')}

Return as JSON array. Make the data realistic and varied.`;

    const response = await this.llm.chat_simple(prompt);
    
    try {
      return JSON.parse(this.extractJson(response));
    } catch {
      // Generate fallback data
      return Array(count).fill(null).map((_, i) => this.generateFallbackRecord(table, i));
    }
  }

  private generateFallbackRecord(table: TableSchema, index: number): Record<string, unknown> {
    const record: Record<string, unknown> = {};
    
    for (const col of table.columns) {
      if (col.primaryKey && col.type === 'uuid') {
        record[col.name] = `uuid-${index + 1}`;
      } else if (col.name === 'createdAt' || col.name === 'updatedAt') {
        record[col.name] = new Date().toISOString();
      } else if (col.type === 'string' || col.type === 'text') {
        record[col.name] = `${col.name}_${index + 1}`;
      } else if (col.type === 'int' || col.type === 'integer') {
        record[col.name] = index + 1;
      } else if (col.type === 'boolean') {
        record[col.name] = index % 2 === 0;
      }
    }
    
    return record;
  }

  generateSeedFile(seeds: SeedData[], orm: ORMType = 'prisma'): string {
    if (orm === 'prisma') {
      return this.generatePrismaSeed(seeds);
    } else if (orm === 'drizzle') {
      return this.generateDrizzleSeed(seeds);
    }
    return '';
  }

  private generatePrismaSeed(seeds: SeedData[]): string {
    let code = `// Seed file generated by DSID-P Accelerator
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
`;

    for (const seed of seeds) {
      const modelName = this.pascalCase(seed.table);
      code += `  // Seed ${modelName}\n`;
      code += `  await prisma.${this.camelCase(seed.table)}.createMany({\n`;
      code += `    data: ${JSON.stringify(seed.records, null, 4).split('\n').map((l, i) => i === 0 ? l : '    ' + l).join('\n')},\n`;
      code += `    skipDuplicates: true,\n`;
      code += `  });\n\n`;
    }

    code += `}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

    return code;
  }

  private generateDrizzleSeed(seeds: SeedData[]): string {
    let code = `// Seed file generated by DSID-P Accelerator
import { db } from './db';
import { ${seeds.map(s => this.camelCase(s.table)).join(', ')} } from './schema';

async function seed() {
`;

    for (const seed of seeds) {
      code += `  await db.insert(${this.camelCase(seed.table)}).values(${JSON.stringify(seed.records, null, 2)});\n`;
    }

    code += `}

seed().catch(console.error);
`;
    return code;
  }

  private extractJson(content: string): string {
    const match = content.match(/\[[\s\S]*\]/);
    return match ? match[0] : '[]';
  }

  private pascalCase(str: string): string {
    return str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
  }

  private camelCase(str: string): string {
    return str.replace(/_(\w)/g, (_, c) => c.toUpperCase());
  }
}

// ============== QUERY OPTIMIZER ==============

export class QueryOptimizer {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async optimizeQuery(query: string, schema?: string): Promise<QueryOptimization> {
    const prompt = `Optimize this SQL query for better performance:

${query}

${schema ? `Schema context:\n${schema}` : ''}

Analyze and provide:
1. Optimized query
2. List of improvements made
3. Estimated speedup factor

Return as JSON: { "optimizedQuery": "...", "improvements": ["..."], "estimatedSpeedup": 1.5 }`;

    const response = await this.llm.chat_simple(prompt);
    
    try {
      const result = JSON.parse(this.extractJson(response));
      return {
        originalQuery: query,
        optimizedQuery: result.optimizedQuery,
        improvements: result.improvements,
        estimatedSpeedup: result.estimatedSpeedup,
      };
    } catch {
      return {
        originalQuery: query,
        optimizedQuery: query,
        improvements: [],
        estimatedSpeedup: 1.0,
      };
    }
  }

  suggestIndexes(queries: string[], schema: TableSchema[]): IndexDefinition[] {
    const suggestions: IndexDefinition[] = [];
    const columnUsage: Record<string, number> = {};

    // Simple analysis: find frequently used columns in WHERE clauses
    for (const query of queries) {
      const whereMatch = query.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|$)/i);
      if (whereMatch) {
        const conditions = whereMatch[1];
        // Extract column names
        const columns = conditions.match(/(\w+)\s*[=<>]/g);
        if (columns) {
          for (const col of columns) {
            const name = col.replace(/\s*[=<>]/, '');
            columnUsage[name] = (columnUsage[name] || 0) + 1;
          }
        }
      }
    }

    // Suggest indexes for frequently used columns
    for (const [column, count] of Object.entries(columnUsage)) {
      if (count >= 2) {
        suggestions.push({
          name: `idx_${column}`,
          columns: [column],
          unique: false,
        });
      }
    }

    return suggestions;
  }

  private extractJson(content: string): string {
    const match = content.match(/\{[\s\S]*\}/);
    return match ? match[0] : '{}';
  }
}

// ============== DATABASE INTEGRATION ==============

export class DatabaseIntegration {
  private config: DatabaseConfig;
  private schemaGenerator: SchemaGenerator;
  private migrationManager: MigrationManager;
  private seedGenerator: SeedGenerator;
  private queryOptimizer: QueryOptimizer;
  private prismaGenerator: PrismaGenerator;
  private drizzleGenerator: DrizzleGenerator;

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = {
      provider: config.provider || 'postgresql',
      orm: config.orm || 'prisma',
      schemaPath: config.schemaPath || './prisma/schema.prisma',
      migrationsPath: config.migrationsPath || './prisma/migrations',
      seedPath: config.seedPath || './prisma/seed.ts',
    };

    const llm = createLLMEngine();
    this.schemaGenerator = new SchemaGenerator(llm);
    this.migrationManager = new MigrationManager(config);
    this.seedGenerator = new SeedGenerator(llm);
    this.queryOptimizer = new QueryOptimizer(llm);
    this.prismaGenerator = new PrismaGenerator();
    this.drizzleGenerator = new DrizzleGenerator();
  }

  async setupFromDescription(description: string): Promise<{
    schema: string;
    migration: Migration;
    seed: string;
  }> {
    // Generate schema from description
    const schemaCode = await this.schemaGenerator.generateFromDescription(description, this.config.orm);
    
    // Parse into table schemas (simplified)
    const tables = await this.schemaGenerator.generateFromEntities(
      this.extractEntitiesFromSchema(schemaCode)
    );

    // Create migration
    const migration = await this.migrationManager.createMigration('initial', tables);

    // Generate seed data
    const seeds = await this.seedGenerator.generateSeedData(tables, 10);
    const seedCode = this.seedGenerator.generateSeedFile(seeds, this.config.orm);

    return {
      schema: schemaCode,
      migration,
      seed: seedCode,
    };
  }

  async generateSchema(entities: string[]): Promise<string> {
    const tables = await this.schemaGenerator.generateFromEntities(entities);
    
    if (this.config.orm === 'prisma') {
      return this.prismaGenerator.generateSchema(tables);
    } else if (this.config.orm === 'drizzle') {
      return this.drizzleGenerator.generateSchema(tables);
    }
    
    return '';
  }

  async createMigration(name: string, changes: TableSchema[]): Promise<Migration> {
    return this.migrationManager.createMigration(name, changes);
  }

  async runMigrations(): Promise<string[]> {
    return this.migrationManager.runMigrations();
  }

  async rollback(count: number = 1): Promise<string[]> {
    return this.migrationManager.rollback(count);
  }

  async generateSeed(tables: TableSchema[], count: number = 10): Promise<string> {
    const seeds = await this.seedGenerator.generateSeedData(tables, count);
    return this.seedGenerator.generateSeedFile(seeds, this.config.orm);
  }

  async optimizeQuery(query: string): Promise<QueryOptimization> {
    return this.queryOptimizer.optimizeQuery(query);
  }

  private extractEntitiesFromSchema(schema: string): string[] {
    const modelMatch = schema.match(/model\s+(\w+)/g);
    if (modelMatch) {
      return modelMatch.map(m => m.replace('model ', ''));
    }
    
    const tableMatch = schema.match(/export\s+const\s+(\w+)/g);
    if (tableMatch) {
      return tableMatch.map(t => t.replace('export const ', ''));
    }
    
    return [];
  }

  getConfig(): DatabaseConfig {
    return { ...this.config };
  }
}

// ============== FACTORY ==============

export function createDatabaseIntegration(config?: Partial<DatabaseConfig>): DatabaseIntegration {
  return new DatabaseIntegration(config);
}

