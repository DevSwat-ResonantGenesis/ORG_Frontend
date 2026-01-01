#!/usr/bin/env node
/**
 * DSID-P CLI Tool
 * 
 * Command line interface for DSID-P Accelerator:
 * - dsidp build "my app idea"
 * - dsidp deploy
 * - dsidp analyze
 * - dsidp security
 * - dsidp docs
 */

// ============== TYPES ==============

export interface CLIConfig {
  configPath: string;
  verbose: boolean;
  color: boolean;
  outputFormat: 'text' | 'json';
}

export interface Command {
  name: string;
  description: string;
  aliases: string[];
  options: CommandOption[];
  action: (args: string[], options: Record<string, unknown>) => Promise<void>;
}

export interface CommandOption {
  name: string;
  short?: string;
  description: string;
  type: 'string' | 'boolean' | 'number';
  default?: unknown;
  required?: boolean;
}

// ============== CLI HELPERS ==============

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

export class Logger {
  private useColor: boolean;
  private verbose: boolean;

  constructor(useColor: boolean = true, verbose: boolean = false) {
    this.useColor = useColor;
    this.verbose = verbose;
  }

  private color(text: string, color: keyof typeof COLORS): string {
    if (!this.useColor) return text;
    return `${COLORS[color]}${text}${COLORS.reset}`;
  }

  log(message: string): void {
    console.log(message);
  }

  info(message: string): void {
    console.log(this.color('ℹ', 'blue'), message);
  }

  success(message: string): void {
    console.log(this.color('✓', 'green'), message);
  }

  warning(message: string): void {
    console.log(this.color('⚠', 'yellow'), message);
  }

  error(message: string): void {
    console.error(this.color('✖', 'red'), message);
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(this.color('🔍', 'dim'), this.color(message, 'dim'));
    }
  }

  title(text: string): void {
    console.log('\n' + this.color(this.color(text, 'bold'), 'cyan'));
  }

  table(data: Record<string, unknown>[]): void {
    console.table(data);
  }

  progress(current: number, total: number, label: string = ''): void {
    const percent = Math.round((current / total) * 100);
    const filled = Math.round(percent / 5);
    const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
    process.stdout.write(`\r${this.color(bar, 'green')} ${percent}% ${label}`);
    if (current === total) console.log();
  }

  spinner(message: string): { stop: (success?: boolean) => void } {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const interval = setInterval(() => {
      process.stdout.write(`\r${this.color(frames[i], 'cyan')} ${message}`);
      i = (i + 1) % frames.length;
    }, 80);

    return {
      stop: (success = true) => {
        clearInterval(interval);
        const icon = success ? this.color('✓', 'green') : this.color('✖', 'red');
        process.stdout.write(`\r${icon} ${message}\n`);
      },
    };
  }
}

// ============== ARGUMENT PARSER ==============

export class ArgParser {
  parseArgs(args: string[]): {
    command: string;
    args: string[];
    options: Record<string, unknown>;
  } {
    const options: Record<string, unknown> = {};
    const positional: string[] = [];
    let command = '';

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        if (value !== undefined) {
          options[key] = this.parseValue(value);
        } else if (args[i + 1] && !args[i + 1].startsWith('-')) {
          options[key] = this.parseValue(args[++i]);
        } else {
          options[key] = true;
        }
      } else if (arg.startsWith('-') && arg.length === 2) {
        const key = arg.slice(1);
        if (args[i + 1] && !args[i + 1].startsWith('-')) {
          options[key] = this.parseValue(args[++i]);
        } else {
          options[key] = true;
        }
      } else if (!command) {
        command = arg;
      } else {
        positional.push(arg);
      }
    }

    return { command, args: positional, options };
  }

  private parseValue(value: string): unknown {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }
}

// ============== CLI CLASS ==============

export class CLI {
  private commands: Map<string, Command> = new Map();
  private aliases: Map<string, string> = new Map();
  private logger: Logger;
  private config: CLIConfig;
  private version: string = '1.0.0';

  constructor(config: Partial<CLIConfig> = {}) {
    this.config = {
      configPath: config.configPath || '.dsidprc',
      verbose: config.verbose ?? false,
      color: config.color ?? true,
      outputFormat: config.outputFormat || 'text',
    };
    this.logger = new Logger(this.config.color, this.config.verbose);
    this.registerBuiltinCommands();
  }

  // ============== COMMAND REGISTRATION ==============

  register(command: Command): void {
    this.commands.set(command.name, command);
    for (const alias of command.aliases) {
      this.aliases.set(alias, command.name);
    }
  }

  private registerBuiltinCommands(): void {
    // Help command
    this.register({
      name: 'help',
      description: 'Show help information',
      aliases: ['h', '-h', '--help'],
      options: [],
      action: async (args) => {
        if (args[0]) {
          this.showCommandHelp(args[0]);
        } else {
          this.showHelp();
        }
      },
    });

    // Version command
    this.register({
      name: 'version',
      description: 'Show version number',
      aliases: ['v', '-v', '--version'],
      options: [],
      action: async () => {
        console.log(`dsidp v${this.version}`);
      },
    });

    // Build command
    this.register({
      name: 'build',
      description: 'Build a project from an idea',
      aliases: ['b', 'create'],
      options: [
        { name: 'output', short: 'o', description: 'Output directory', type: 'string', default: '.' },
        { name: 'platform', short: 'p', description: 'Target platform (web/mobile/desktop)', type: 'string', default: 'web' },
        { name: 'quality', short: 'q', description: 'Quality level (mvp/production/enterprise)', type: 'string', default: 'production' },
        { name: 'dry-run', description: 'Show plan without executing', type: 'boolean', default: false },
      ],
      action: async (args, options) => {
        await this.buildCommand(args.join(' '), options);
      },
    });

    // Deploy command
    this.register({
      name: 'deploy',
      description: 'Deploy project to cloud',
      aliases: ['d'],
      options: [
        { name: 'provider', short: 'p', description: 'Cloud provider (vercel/netlify/aws)', type: 'string', default: 'vercel' },
        { name: 'env', short: 'e', description: 'Environment (dev/staging/prod)', type: 'string', default: 'production' },
        { name: 'preview', description: 'Deploy as preview', type: 'boolean', default: false },
      ],
      action: async (args, options) => {
        await this.deployCommand(args[0] || '.', options);
      },
    });

    // Analyze command
    this.register({
      name: 'analyze',
      description: 'Analyze codebase',
      aliases: ['a'],
      options: [
        { name: 'type', short: 't', description: 'Analysis type (security/performance/quality)', type: 'string', default: 'all' },
        { name: 'fix', short: 'f', description: 'Auto-fix issues', type: 'boolean', default: false },
      ],
      action: async (args, options) => {
        await this.analyzeCommand(args[0] || '.', options);
      },
    });

    // Security command
    this.register({
      name: 'security',
      description: 'Run security scan',
      aliases: ['sec', 'scan'],
      options: [
        { name: 'severity', short: 's', description: 'Minimum severity (low/medium/high/critical)', type: 'string', default: 'low' },
        { name: 'fix', short: 'f', description: 'Auto-fix vulnerabilities', type: 'boolean', default: false },
      ],
      action: async (args, options) => {
        await this.securityCommand(args[0] || '.', options);
      },
    });

    // Docs command
    this.register({
      name: 'docs',
      description: 'Generate documentation',
      aliases: ['doc'],
      options: [
        { name: 'output', short: 'o', description: 'Output directory', type: 'string', default: './docs' },
        { name: 'format', short: 'f', description: 'Format (markdown/html)', type: 'string', default: 'markdown' },
      ],
      action: async (args, options) => {
        await this.docsCommand(args[0] || '.', options);
      },
    });

    // Init command
    this.register({
      name: 'init',
      description: 'Initialize DSID-P in a project',
      aliases: ['i'],
      options: [
        { name: 'template', short: 't', description: 'Project template', type: 'string' },
      ],
      action: async (args, options) => {
        await this.initCommand(args[0] || '.', options);
      },
    });

    // Status command
    this.register({
      name: 'status',
      description: 'Show project status',
      aliases: ['s'],
      options: [],
      action: async () => {
        await this.statusCommand();
      },
    });

    // Cost command
    this.register({
      name: 'cost',
      description: 'Show LLM usage and costs',
      aliases: ['costs', 'usage'],
      options: [
        { name: 'period', short: 'p', description: 'Time period (day/week/month)', type: 'string', default: 'month' },
      ],
      action: async (args, options) => {
        await this.costCommand(options);
      },
    });
  }

  // ============== COMMAND IMPLEMENTATIONS ==============

  private async buildCommand(idea: string, options: Record<string, unknown>): Promise<void> {
    if (!idea) {
      this.logger.error('Please provide a project idea');
      this.logger.info('Usage: dsidp build "your project idea"');
      return;
    }

    this.logger.title('🚀 DSID-P Autonomous Builder');
    this.logger.info(`Building: ${idea}`);
    this.logger.info(`Platform: ${options.platform}`);
    this.logger.info(`Quality: ${options.quality}`);
    this.logger.info(`Output: ${options.output}`);

    if (options['dry-run']) {
      this.logger.warning('Dry run - showing plan only');
      // Would show plan here
      return;
    }

    const spinner = this.logger.spinner('Analyzing requirements...');
    
    try {
      // Import and use AutonomousDeveloper
      const { createAutonomousDeveloper } = await import('./autonomous-dev');
      const dev = createAutonomousDeveloper({
        workDir: options.output as string,
        enableVision: true,
        enableSelfRepair: true,
        onProgress: (report) => {
          this.logger.progress(report.progress, 100, report.phase);
        },
      });

      spinner.stop(true);

      const result = await dev.buildFromIdea({
        description: idea,
        targetPlatform: options.platform as any,
        qualityLevel: options.quality as any,
        features: [],
      });

      this.logger.success('Build complete!');
      this.logger.info(`Project created at: ${options.output}`);
    } catch (error) {
      spinner.stop(false);
      this.logger.error(`Build failed: ${error}`);
    }
  }

  private async deployCommand(path: string, options: Record<string, unknown>): Promise<void> {
    this.logger.title('🌐 Deploying to Cloud');
    this.logger.info(`Provider: ${options.provider}`);
    this.logger.info(`Environment: ${options.env}`);

    const spinner = this.logger.spinner('Preparing deployment...');

    try {
      const { createCloudDeployer } = await import('./cloud-deployer');
      const deployer = createCloudDeployer();
      
      spinner.stop(true);

      const result = await deployer.deploy({
        provider: options.provider as any,
        projectPath: path,
        environment: options.env as any,
      });

      if (result.success) {
        this.logger.success('Deployment successful!');
        if (result.url) {
          this.logger.info(`URL: ${result.url}`);
        }
      } else {
        this.logger.error(`Deployment failed: ${result.error}`);
      }
    } catch (error) {
      spinner.stop(false);
      this.logger.error(`Deployment failed: ${error}`);
    }
  }

  private async analyzeCommand(path: string, options: Record<string, unknown>): Promise<void> {
    this.logger.title('🔍 Analyzing Codebase');
    
    const spinner = this.logger.spinner('Running analysis...');

    try {
      const { createSecurityScanner } = await import('./security-scanner');
      const scanner = createSecurityScanner();
      
      const result = await scanner.scan(path);
      spinner.stop(true);

      this.logger.info(`Security Score: ${result.score}/100`);
      this.logger.info(`Issues Found: ${result.summary.total}`);
      
      if (result.summary.critical > 0) {
        this.logger.error(`Critical: ${result.summary.critical}`);
      }
      if (result.summary.high > 0) {
        this.logger.warning(`High: ${result.summary.high}`);
      }
      if (result.summary.medium > 0) {
        this.logger.info(`Medium: ${result.summary.medium}`);
      }
      if (result.summary.low > 0) {
        this.logger.debug(`Low: ${result.summary.low}`);
      }

      if (result.passed) {
        this.logger.success('Analysis passed!');
      } else {
        this.logger.warning('Issues need attention');
      }
    } catch (error) {
      spinner.stop(false);
      this.logger.error(`Analysis failed: ${error}`);
    }
  }

  private async securityCommand(path: string, options: Record<string, unknown>): Promise<void> {
    this.logger.title('🔒 Security Scan');
    
    const spinner = this.logger.spinner('Scanning for vulnerabilities...');

    try {
      const { createSecurityScanner } = await import('./security-scanner');
      const scanner = createSecurityScanner({
        severity: options.severity as any,
      });
      
      const result = await scanner.scan(path);
      spinner.stop(true);

      // Show vulnerabilities
      for (const vuln of result.vulnerabilities.slice(0, 10)) {
        const color = vuln.severity === 'critical' ? 'error' : 
                     vuln.severity === 'high' ? 'warning' : 'info';
        (this.logger as any)[color](`[${vuln.severity.toUpperCase()}] ${vuln.title}`);
        if (vuln.file) {
          this.logger.debug(`  ${vuln.file}:${vuln.line}`);
        }
      }

      // Show secrets
      if (result.secrets.length > 0) {
        this.logger.warning(`Found ${result.secrets.length} potential secrets!`);
        for (const secret of result.secrets.slice(0, 5)) {
          this.logger.error(`  ${secret.type} in ${secret.file}:${secret.line}`);
        }
      }

      // Summary
      this.logger.info(`\nScore: ${result.score}/100`);
      this.logger.info(`Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      spinner.stop(false);
      this.logger.error(`Scan failed: ${error}`);
    }
  }

  private async docsCommand(path: string, options: Record<string, unknown>): Promise<void> {
    this.logger.title('📚 Generating Documentation');
    
    const spinner = this.logger.spinner('Generating docs...');

    try {
      const { createDocumentationGenerator } = await import('./doc-generator');
      const generator = createDocumentationGenerator({
        outputDir: options.output as string,
        format: options.format as any,
      });
      
      const docs = await generator.generateProjectDocs(path);
      spinner.stop(true);

      // Write docs
      const fs = await import('fs/promises');
      const outputPath = await import('path');
      
      await fs.mkdir(options.output as string, { recursive: true });
      await fs.writeFile(outputPath.join(options.output as string, 'README.md'), docs.readme);
      await fs.writeFile(outputPath.join(options.output as string, 'API.md'), docs.api);
      await fs.writeFile(outputPath.join(options.output as string, 'CHANGELOG.md'), docs.changelog);

      this.logger.success('Documentation generated!');
      this.logger.info(`Output: ${options.output}`);
    } catch (error) {
      spinner.stop(false);
      this.logger.error(`Doc generation failed: ${error}`);
    }
  }

  private async initCommand(path: string, options: Record<string, unknown>): Promise<void> {
    this.logger.title('⚡ Initializing DSID-P');

    const config = {
      version: '1.0.0',
      llm: {
        provider: 'openai',
        model: 'gpt-4-turbo',
      },
      features: {
        autonomousBuild: true,
        securityScanning: true,
        documentation: true,
        costTracking: true,
      },
    };

    try {
      const fs = await import('fs/promises');
      const configPath = await import('path');
      
      await fs.writeFile(
        configPath.join(path, '.dsidprc.json'),
        JSON.stringify(config, null, 2)
      );

      this.logger.success('DSID-P initialized!');
      this.logger.info('Configuration saved to .dsidprc.json');
    } catch (error) {
      this.logger.error(`Init failed: ${error}`);
    }
  }

  private async statusCommand(): Promise<void> {
    this.logger.title('📊 DSID-P Status');

    try {
      const { getCostTracker } = await import('./cost-tracker');
      const tracker = getCostTracker();
      const budget = tracker.getBudgetStatus();
      const analytics = tracker.getAnalytics('month');

      this.logger.info(`Budget: $${budget.used.toFixed(2)} / $${budget.limit.toFixed(2)} (${budget.percentUsed.toFixed(1)}%)`);
      this.logger.info(`Requests: ${analytics.totalRequests}`);
      this.logger.info(`Tokens: ${analytics.totalTokens.toLocaleString()}`);
      
      if (budget.alertTriggered) {
        this.logger.warning('Budget alert triggered!');
      }
    } catch (error) {
      this.logger.error(`Status check failed: ${error}`);
    }
  }

  private async costCommand(options: Record<string, unknown>): Promise<void> {
    this.logger.title('💰 Cost Report');

    try {
      const { getCostTracker } = await import('./cost-tracker');
      const tracker = getCostTracker();
      const analytics = tracker.getAnalytics(options.period as any);

      this.logger.info(`Period: ${options.period}`);
      this.logger.info(`Total Cost: $${analytics.totalCost.toFixed(2)}`);
      this.logger.info(`Total Requests: ${analytics.totalRequests}`);
      this.logger.info(`Avg Cost/Request: $${analytics.avgCostPerRequest.toFixed(4)}`);
      
      if (analytics.topModels.length > 0) {
        this.logger.info('\nTop Models:');
        for (const model of analytics.topModels) {
          this.logger.info(`  ${model.model}: $${model.cost.toFixed(2)} (${model.percentage}%)`);
        }
      }

      // Show optimizations
      const optimizations = tracker.getOptimizations();
      if (optimizations.length > 0) {
        this.logger.info('\n💡 Optimization Suggestions:');
        for (const opt of optimizations.slice(0, 3)) {
          this.logger.info(`  [${opt.priority.toUpperCase()}] ${opt.description}`);
          this.logger.debug(`    Potential savings: $${opt.potentialSavings.toFixed(2)}`);
        }
      }
    } catch (error) {
      this.logger.error(`Cost report failed: ${error}`);
    }
  }

  // ============== HELP ==============

  private showHelp(): void {
    console.log(`
${COLORS.cyan}${COLORS.bold}DSID-P Accelerator CLI${COLORS.reset}

${COLORS.bold}Usage:${COLORS.reset}
  dsidp <command> [options]

${COLORS.bold}Commands:${COLORS.reset}`);

    for (const [name, cmd] of this.commands) {
      if (!name.startsWith('-')) {
        console.log(`  ${COLORS.green}${name.padEnd(12)}${COLORS.reset} ${cmd.description}`);
      }
    }

    console.log(`
${COLORS.bold}Examples:${COLORS.reset}
  dsidp build "a todo app with React"
  dsidp deploy --provider vercel
  dsidp security --severity high
  dsidp docs --output ./docs

${COLORS.bold}Options:${COLORS.reset}
  --help, -h     Show help
  --version, -v  Show version
  --verbose      Verbose output
  --no-color     Disable colors

Run 'dsidp help <command>' for more information on a specific command.
`);
  }

  private showCommandHelp(commandName: string): void {
    const name = this.aliases.get(commandName) || commandName;
    const command = this.commands.get(name);

    if (!command) {
      this.logger.error(`Unknown command: ${commandName}`);
      return;
    }

    console.log(`
${COLORS.bold}dsidp ${command.name}${COLORS.reset}

${command.description}

${COLORS.bold}Usage:${COLORS.reset}
  dsidp ${command.name} [options]

${COLORS.bold}Aliases:${COLORS.reset}
  ${command.aliases.join(', ') || 'none'}
`);

    if (command.options.length > 0) {
      console.log(`${COLORS.bold}Options:${COLORS.reset}`);
      for (const opt of command.options) {
        const short = opt.short ? `-${opt.short}, ` : '    ';
        console.log(`  ${short}--${opt.name.padEnd(15)} ${opt.description} ${opt.default !== undefined ? `(default: ${opt.default})` : ''}`);
      }
    }
  }

  // ============== RUN ==============

  async run(argv: string[] = process.argv.slice(2)): Promise<void> {
    const parser = new ArgParser();
    const { command, args, options } = parser.parseArgs(argv);

    // Handle global options
    if (options.verbose) {
      this.config.verbose = true;
      this.logger = new Logger(this.config.color, true);
    }
    if (options['no-color']) {
      this.config.color = false;
      this.logger = new Logger(false, this.config.verbose);
    }

    // Find and execute command
    const cmdName = this.aliases.get(command) || command || 'help';
    const cmd = this.commands.get(cmdName);

    if (!cmd) {
      this.logger.error(`Unknown command: ${command}`);
      this.showHelp();
      process.exit(1);
    }

    try {
      await cmd.action(args, options);
    } catch (error) {
      this.logger.error(`Error: ${error}`);
      process.exit(1);
    }
  }
}

// ============== FACTORY ==============

export function createCLI(config?: Partial<CLIConfig>): CLI {
  return new CLI(config);
}

// ============== MAIN ==============

if (typeof require !== 'undefined' && require.main === module) {
  const cli = createCLI();
  cli.run().catch(console.error);
}
