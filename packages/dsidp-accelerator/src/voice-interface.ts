/**
 * DSID-P Voice Interface
 * 
 * Speech-to-build capabilities:
 * - Voice command recognition
 * - Natural language processing for dev tasks
 * - Text-to-speech feedback
 * - Continuous listening mode
 * - Command shortcuts and aliases
 */

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare let SpeechRecognition: {
  new(): SpeechRecognition;
};

import { LLMEngine } from './llm-engine';

// ============== TYPES ==============

export interface VoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  confidenceThreshold: number;
  wakeWord?: string;
  enableTTS: boolean;
  ttsVoice?: string;
  ttsRate?: number;
  ttsPitch?: number;
}

export interface VoiceCommand {
  id: string;
  pattern: RegExp | string;
  aliases?: string[];
  description: string;
  examples: string[];
  handler: (params: CommandParams) => Promise<CommandResult>;
}

export interface CommandParams {
  raw: string;
  transcript: string;
  confidence: number;
  matches?: RegExpMatchArray;
  entities: Record<string, string>;
}

export interface CommandResult {
  success: boolean;
  message: string;
  action?: string;
  data?: unknown;
  speak?: string;
}

export interface VoiceEvent {
  type: VoiceEventType;
  timestamp: number;
  data?: unknown;
}

export type VoiceEventType = 
  | 'start'
  | 'end'
  | 'result'
  | 'error'
  | 'command_recognized'
  | 'command_executed'
  | 'wake_word_detected'
  | 'speech_start'
  | 'speech_end';

export interface TranscriptResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{ transcript: string; confidence: number }>;
}

export interface SpeechSynthesisConfig {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// ============== SPEECH RECOGNITION ==============

export class SpeechRecognizer {
  private config: VoiceConfig;
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private eventListeners: Map<VoiceEventType, Array<(event: VoiceEvent) => void>> = new Map();

  constructor(config: Partial<VoiceConfig> = {}) {
    this.config = {
      language: config.language || 'en-US',
      continuous: config.continuous ?? true,
      interimResults: config.interimResults ?? true,
      maxAlternatives: config.maxAlternatives || 3,
      confidenceThreshold: config.confidenceThreshold || 0.7,
      wakeWord: config.wakeWord,
      enableTTS: config.enableTTS ?? true,
      ttsVoice: config.ttsVoice,
      ttsRate: config.ttsRate || 1,
      ttsPitch: config.ttsPitch || 1,
    };

    this.initRecognition();
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognitionAPI = 
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.recognition.onstart = () => {
      this.emit('start', {});
    };

    this.recognition.onend = () => {
      this.emit('end', {});
      if (this.isListening && this.config.continuous) {
        this.recognition?.start();
      }
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results: TranscriptResult[] = [];
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const alternatives: Array<{ transcript: string; confidence: number }> = [];
        
        for (let j = 0; j < result.length; j++) {
          alternatives.push({
            transcript: result[j].transcript,
            confidence: result[j].confidence,
          });
        }

        results.push({
          transcript: result[0].transcript,
          confidence: result[0].confidence,
          isFinal: result.isFinal,
          alternatives,
        });
      }

      this.emit('result', { results });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.emit('error', { error: event.error, message: event.message });
    };

    this.recognition.onspeechstart = () => {
      this.emit('speech_start', {});
    };

    this.recognition.onspeechend = () => {
      this.emit('speech_end', {});
    };
  }

  start(): boolean {
    if (!this.recognition) return false;
    
    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  stop(): void {
    this.isListening = false;
    this.recognition?.stop();
  }

  abort(): void {
    this.isListening = false;
    this.recognition?.abort();
  }

  isActive(): boolean {
    return this.isListening;
  }

  setLanguage(language: string): void {
    this.config.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  on(event: VoiceEventType, callback: (event: VoiceEvent) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
    
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index >= 0) listeners.splice(index, 1);
      }
    };
  }

  private emit(type: VoiceEventType, data: unknown): void {
    const event: VoiceEvent = { type, timestamp: Date.now(), data };
    const listeners = this.eventListeners.get(type) || [];
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Voice event listener error:', error);
      }
    }
  }
}

// ============== TEXT-TO-SPEECH ==============

export class TextToSpeech {
  private config: VoiceConfig;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;

  constructor(config: Partial<VoiceConfig> = {}) {
    this.config = {
      language: config.language || 'en-US',
      continuous: config.continuous ?? false,
      interimResults: config.interimResults ?? false,
      maxAlternatives: config.maxAlternatives || 1,
      confidenceThreshold: config.confidenceThreshold || 0.7,
      enableTTS: config.enableTTS ?? true,
      ttsVoice: config.ttsVoice,
      ttsRate: config.ttsRate || 1,
      ttsPitch: config.ttsPitch || 1,
    };

    this.initSynthesis();
  }

  private initSynthesis(): void {
    if (typeof window === 'undefined') return;
    
    this.synth = window.speechSynthesis;
    
    if (this.synth) {
      this.loadVoices();
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  speak(text: string, options?: Partial<SpeechSynthesisConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      const voiceName = options?.voice || this.config.ttsVoice;
      if (voiceName) {
        const voice = this.voices.find(v => v.name === voiceName || v.lang === voiceName);
        if (voice) utterance.voice = voice;
      }

      utterance.rate = options?.rate || this.config.ttsRate || 1;
      utterance.pitch = options?.pitch || this.config.ttsPitch || 1;
      utterance.volume = options?.volume || 1;

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        reject(new Error(event.error));
      };

      this.synth.speak(utterance);
    });
  }

  stop(): void {
    this.synth?.cancel();
    this.isSpeaking = false;
  }

  pause(): void {
    this.synth?.pause();
  }

  resume(): void {
    this.synth?.resume();
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

// ============== COMMAND PROCESSOR ==============

export class CommandProcessor {
  private commands: Map<string, VoiceCommand> = new Map();
  private llm: LLMEngine | null = null;
  private aliases: Map<string, string> = new Map();

  constructor(llmEngine?: LLMEngine) {
    this.llm = llmEngine || null;
    this.registerBuiltinCommands();
  }

  registerCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command);
    
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias.toLowerCase(), command.id);
      }
    }
  }

  unregisterCommand(id: string): boolean {
    const command = this.commands.get(id);
    if (!command) return false;
    
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.delete(alias.toLowerCase());
      }
    }
    
    return this.commands.delete(id);
  }

  async process(transcript: string, confidence: number): Promise<CommandResult> {
    const normalized = transcript.toLowerCase().trim();
    
    // Check direct aliases first
    for (const [alias, commandId] of this.aliases) {
      if (normalized.startsWith(alias)) {
        const command = this.commands.get(commandId);
        if (command) {
          return this.executeCommand(command, { raw: transcript, transcript: normalized, confidence, entities: {} });
        }
      }
    }

    // Check pattern matches
    for (const command of this.commands.values()) {
      if (typeof command.pattern === 'string') {
        if (normalized.includes(command.pattern.toLowerCase())) {
          return this.executeCommand(command, { raw: transcript, transcript: normalized, confidence, entities: {} });
        }
      } else {
        const match = normalized.match(command.pattern);
        if (match) {
          return this.executeCommand(command, { raw: transcript, transcript: normalized, confidence, matches: match, entities: {} });
        }
      }
    }

    // Fall back to LLM interpretation
    if (this.llm) {
      return this.interpretWithLLM(transcript);
    }

    return {
      success: false,
      message: 'Command not recognized',
      speak: "I didn't understand that command. Try saying 'help' for available commands.",
    };
  }

  private async executeCommand(command: VoiceCommand, params: CommandParams): Promise<CommandResult> {
    try {
      return await command.handler(params);
    } catch (error) {
      return {
        success: false,
        message: `Command failed: ${error}`,
        speak: 'Sorry, that command failed to execute.',
      };
    }
  }

  private async interpretWithLLM(transcript: string): Promise<CommandResult> {
    if (!this.llm) {
      return { success: false, message: 'LLM not available' };
    }

    const commandList = Array.from(this.commands.values())
      .map(c => `- ${c.id}: ${c.description}. Examples: ${c.examples.join(', ')}`)
      .join('\n');

    const prompt = `You are a voice command interpreter for a development tool.
Available commands:
${commandList}

User said: "${transcript}"

Determine the user's intent and respond with JSON:
{
  "command": "command_id or null if unclear",
  "confidence": 0.0-1.0,
  "entities": { extracted entities },
  "interpretation": "what you think they meant"
}`;

    try {
      const response = await this.llm.generateCode({ task: prompt, language: 'json', context: '' });
      const parsed = JSON.parse(response);
      
      if (parsed.command && parsed.confidence > 0.7) {
        const command = this.commands.get(parsed.command);
        if (command) {
          return this.executeCommand(command, {
            raw: transcript,
            transcript: transcript.toLowerCase(),
            confidence: parsed.confidence,
            entities: parsed.entities || {},
          });
        }
      }

      return {
        success: false,
        message: parsed.interpretation || 'Could not understand command',
        speak: `I think you meant: ${parsed.interpretation}. Is that right?`,
      };
    } catch {
      return {
        success: false,
        message: 'Failed to interpret command',
        speak: "I couldn't understand that. Please try again.",
      };
    }
  }

  private registerBuiltinCommands(): void {
    // Help command
    this.registerCommand({
      id: 'help',
      pattern: /^(help|what can you do|commands|show commands)/i,
      aliases: ['help', 'what can you do'],
      description: 'Show available voice commands',
      examples: ['help', 'what can you do', 'show commands'],
      handler: async () => {
        const commands = Array.from(this.commands.values())
          .map(c => `${c.id}: ${c.description}`)
          .join('. ');
        return {
          success: true,
          message: commands,
          speak: `Available commands: ${commands}`,
        };
      },
    });

    // Create file command
    this.registerCommand({
      id: 'create_file',
      pattern: /^(create|make|new) (a )?(file|component|page) (called |named )?(.+)/i,
      aliases: ['create file', 'new file', 'make file'],
      description: 'Create a new file or component',
      examples: ['create file called header', 'new component named Button'],
      handler: async (params) => {
        const name = params.matches?.[5] || params.entities.name || 'untitled';
        const type = params.matches?.[3] || 'file';
        return {
          success: true,
          message: `Creating ${type}: ${name}`,
          action: 'create_file',
          data: { name, type },
          speak: `Creating new ${type} called ${name}`,
        };
      },
    });

    // Run build command
    this.registerCommand({
      id: 'build',
      pattern: /^(build|compile|bundle)( the)?( project| app)?/i,
      aliases: ['build', 'compile', 'bundle'],
      description: 'Build the current project',
      examples: ['build', 'compile the project', 'bundle app'],
      handler: async () => ({
        success: true,
        message: 'Starting build...',
        action: 'build',
        speak: 'Starting the build process',
      }),
    });

    // Deploy command
    this.registerCommand({
      id: 'deploy',
      pattern: /^deploy( to)?( production| staging| preview)?/i,
      aliases: ['deploy', 'publish', 'ship it'],
      description: 'Deploy the application',
      examples: ['deploy', 'deploy to production', 'ship it'],
      handler: async (params) => {
        const env = params.matches?.[2]?.trim() || 'preview';
        return {
          success: true,
          message: `Deploying to ${env}...`,
          action: 'deploy',
          data: { environment: env },
          speak: `Deploying to ${env}`,
        };
      },
    });

    // Run tests command
    this.registerCommand({
      id: 'test',
      pattern: /^(run |execute )?(tests?|specs?)/i,
      aliases: ['test', 'run tests', 'execute tests'],
      description: 'Run test suite',
      examples: ['run tests', 'test', 'execute specs'],
      handler: async () => ({
        success: true,
        message: 'Running tests...',
        action: 'test',
        speak: 'Running the test suite',
      }),
    });

    // Git commands
    this.registerCommand({
      id: 'git_commit',
      pattern: /^(commit|save)( changes)?( with message)?(.+)?/i,
      aliases: ['commit', 'save changes'],
      description: 'Commit changes to git',
      examples: ['commit', 'save changes', 'commit with message fixed bug'],
      handler: async (params) => {
        const message = params.matches?.[4]?.trim() || 'Auto-commit via voice';
        return {
          success: true,
          message: `Committing: ${message}`,
          action: 'git_commit',
          data: { message },
          speak: `Committing changes with message: ${message}`,
        };
      },
    });

    this.registerCommand({
      id: 'git_push',
      pattern: /^push( changes| code)?( to)?( origin| remote)?/i,
      aliases: ['push', 'push changes'],
      description: 'Push changes to remote',
      examples: ['push', 'push changes', 'push to origin'],
      handler: async () => ({
        success: true,
        message: 'Pushing to remote...',
        action: 'git_push',
        speak: 'Pushing changes to remote repository',
      }),
    });

    // Open file command
    this.registerCommand({
      id: 'open_file',
      pattern: /^open( file)?( called| named)? (.+)/i,
      aliases: ['open', 'open file'],
      description: 'Open a file in the editor',
      examples: ['open index.tsx', 'open file called App.js'],
      handler: async (params) => {
        const filename = params.matches?.[3] || params.entities.filename;
        return {
          success: true,
          message: `Opening ${filename}`,
          action: 'open_file',
          data: { filename },
          speak: `Opening ${filename}`,
        };
      },
    });

    // Search command
    this.registerCommand({
      id: 'search',
      pattern: /^(search|find|look for) (.+)/i,
      aliases: ['search', 'find'],
      description: 'Search in codebase',
      examples: ['search for useState', 'find handleClick'],
      handler: async (params) => {
        const query = params.matches?.[2] || params.entities.query;
        return {
          success: true,
          message: `Searching for: ${query}`,
          action: 'search',
          data: { query },
          speak: `Searching for ${query}`,
        };
      },
    });

    // Stop/cancel command
    this.registerCommand({
      id: 'stop',
      pattern: /^(stop|cancel|abort|nevermind|never mind)/i,
      aliases: ['stop', 'cancel', 'abort'],
      description: 'Stop current operation',
      examples: ['stop', 'cancel', 'nevermind'],
      handler: async () => ({
        success: true,
        message: 'Operation cancelled',
        action: 'stop',
        speak: 'Cancelled',
      }),
    });
  }

  getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values());
  }
}

// ============== VOICE INTERFACE ==============

export class VoiceInterface {
  private config: VoiceConfig;
  private recognizer: SpeechRecognizer;
  private tts: TextToSpeech;
  private processor: CommandProcessor;
  private isAwake: boolean = false;
  private wakeWordTimeout: NodeJS.Timeout | null = null;

  constructor(config: Partial<VoiceConfig> = {}, llmEngine?: LLMEngine) {
    this.config = {
      language: config.language || 'en-US',
      continuous: config.continuous ?? true,
      interimResults: config.interimResults ?? true,
      maxAlternatives: config.maxAlternatives || 3,
      confidenceThreshold: config.confidenceThreshold || 0.7,
      wakeWord: config.wakeWord,
      enableTTS: config.enableTTS ?? true,
      ttsVoice: config.ttsVoice,
      ttsRate: config.ttsRate || 1,
      ttsPitch: config.ttsPitch || 1,
    };

    this.recognizer = new SpeechRecognizer(this.config);
    this.tts = new TextToSpeech(this.config);
    this.processor = new CommandProcessor(llmEngine);

    this.setupListeners();
  }

  private setupListeners(): void {
    this.recognizer.on('result', async (event) => {
      const data = event.data as { results: TranscriptResult[] };
      
      for (const result of data.results) {
        if (!result.isFinal) continue;
        
        if (result.confidence < this.config.confidenceThreshold) continue;

        // Check for wake word if configured
        if (this.config.wakeWord && !this.isAwake) {
          if (result.transcript.toLowerCase().includes(this.config.wakeWord.toLowerCase())) {
            this.wake();
            if (this.config.enableTTS) {
              await this.tts.speak("I'm listening");
            }
          }
          continue;
        }

        // Process command
        const commandResult = await this.processor.process(result.transcript, result.confidence);
        
        if (commandResult.speak && this.config.enableTTS) {
          await this.tts.speak(commandResult.speak);
        }

        // Reset wake state after command if using wake word
        if (this.config.wakeWord) {
          this.scheduleWakeSleep();
        }
      }
    });
  }

  private wake(): void {
    this.isAwake = true;
    if (this.wakeWordTimeout) {
      clearTimeout(this.wakeWordTimeout);
    }
    this.scheduleWakeSleep();
  }

  private scheduleWakeSleep(): void {
    if (!this.config.wakeWord) return;
    
    if (this.wakeWordTimeout) {
      clearTimeout(this.wakeWordTimeout);
    }
    
    this.wakeWordTimeout = setTimeout(() => {
      this.isAwake = false;
    }, 10000); // Sleep after 10 seconds of inactivity
  }

  start(): boolean {
    if (!this.config.wakeWord) {
      this.isAwake = true;
    }
    return this.recognizer.start();
  }

  stop(): void {
    this.isAwake = false;
    this.recognizer.stop();
  }

  async speak(text: string): Promise<void> {
    if (this.config.enableTTS) {
      await this.tts.speak(text);
    }
  }

  registerCommand(command: VoiceCommand): void {
    this.processor.registerCommand(command);
  }

  getCommands(): VoiceCommand[] {
    return this.processor.getCommands();
  }

  isListening(): boolean {
    return this.recognizer.isActive();
  }

  isAwakeState(): boolean {
    return this.isAwake;
  }

  setWakeWord(word: string | undefined): void {
    this.config.wakeWord = word;
    if (!word) {
      this.isAwake = true;
    }
  }
}

// ============== FACTORY ==============

export function createVoiceInterface(config?: Partial<VoiceConfig>, llmEngine?: LLMEngine): VoiceInterface {
  return new VoiceInterface(config, llmEngine);
}

export function createSpeechRecognizer(config?: Partial<VoiceConfig>): SpeechRecognizer {
  return new SpeechRecognizer(config);
}

export function createTextToSpeech(config?: Partial<VoiceConfig>): TextToSpeech {
  return new TextToSpeech(config);
}

export function createCommandProcessor(llmEngine?: LLMEngine): CommandProcessor {
  return new CommandProcessor(llmEngine);
}
