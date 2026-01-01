import { type AgentTeam, listAgentTeams, executeWorkflow } from '@/api/agentTeams';
import { type AgentResponse, listAgents } from '@/api/agents';
import { sendResonantMessage, getChatHistory, createChat, type ResonantChatRequest } from '@/api/resonantChat';
import { isAuthenticated } from '@/utils/auth-cookies';
import { ChevronDownIcon } from '@/components/Icons/ResonantChatIcons';
import { ProviderSelector, type Provider } from '@/components/ui/ProviderSelector';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import styles from './CursorChatPanel.module.css';
import { FilePreviewCard } from './FilePreviewCard';
import { FormattedMessageContent } from './FormattedMessageContent';
import { ExecutionVisualizer } from './ExecutionVisualizer';
import { AcceleratorProcessFlow, AcceleratorMessageDetails } from './AcceleratorProcessFlow';
import { AcceleratorSettings } from './AcceleratorSettings';
import {
  getIntentClassifier,
  getContextAggregator,
  getPlanningEngine,
  getSmartExecutor,
  type ExecutionPlan,
  type ExecutionContext,
  type Suggestion,
  UserIntent,
} from '@/services/ai';
import { ideAccelerator } from '@/services/dsidp';
import { useDSIDP } from '@/hooks/useDSIDPAccelerator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedChanges?: {
    type: 'create' | 'modify' | 'delete';
    path: string;
    content?: string;
    explanation?: string;
  }[];
  canAutoApply?: boolean;
  filePreviews?: {
    path: string;
    content: string;
    language?: string;
    isModified?: boolean;
  }[];
  teamId?: string;
  agentId?: string;
}

export type Agent = 'default' | 'code-assistant' | 'debugger' | 'documentation' | 'refactor';

interface SendMessageOptions {
  teamId?: string;
  agentId?: string;
  customAgentId?: string;
  systemPrompt?: string;
}

interface ProjectFileInfo {
  name: string;
  path: string;
  content?: string;
  type?: 'file' | 'folder';
}

interface CursorChatPanelProps {
  onClose?: () => void;
  onSendMessage?: (message: string, options?: SendMessageOptions) => Promise<string>;
  selectedProvider?: Provider;
  onProviderChange?: (provider: Provider) => void;
  onPhotoUpload?: (file: File) => void;
  projectId?: string;
  selectedAgent?: Agent;
  onAgentChange?: (agent: Agent) => void;
  onApplyChanges?: (changes: { type: 'create' | 'modify' | 'delete'; path: string; content?: string }[]) => Promise<void>;
  onOpenFile?: (filePath: string) => void;
  teams?: AgentTeam[];
  onTeamChange?: (teamId: string | null) => void;
  selectedTeamId?: string | null;
  files?: ProjectFileInfo[];
  activeFilePath?: string;
}

// Default welcome message for new sessions
const getDefaultMessages = (): Message[] => [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I can help you:\n• Check and read your project files\n• Edit files and modify code\n• Generate new code\n• Answer questions about your project\n\nTry asking: "check my files" or "read my project"',
    timestamp: new Date(),
  },
];

export const CursorChatPanel: React.FC<CursorChatPanelProps> = React.memo(({
  onClose,
  onSendMessage,
  selectedProvider,
  onProviderChange,
  onPhotoUpload,
  projectId,
  selectedAgent: externalSelectedAgent,
  onAgentChange: externalOnAgentChange,
  onApplyChanges,
  onOpenFile,
  teams: externalTeams,
  onTeamChange,
  selectedTeamId: externalSelectedTeamId,
  files = [],
  activeFilePath,
}) => {
  // Messages are loaded from backend - no localStorage backup
  const [messages, setMessages] = useState<Message[]>(getDefaultMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // IDE Chat conversation ID for backend persistence
  // Uses projectId as part of the key to separate conversations per project
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const isLoggedIn = isAuthenticated();
  const [selectedAgent, setSelectedAgent] = useState<Agent>('default');
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  
  // Team state
  const [teams, setTeams] = useState<AgentTeam[]>(externalTeams || []);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(externalSelectedTeamId || null);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  
  // Custom agents state
  const [customAgents, setCustomAgents] = useState<AgentResponse[]>([]);
  const [selectedCustomAgentId, setSelectedCustomAgentId] = useState<string | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  
  // Smart execution state
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [useSmartExecution, setUseSmartExecution] = useState(true);
  
  // Accelerator mode state
  const [acceleratorMode, setAcceleratorMode] = useState(false);
  const [showAcceleratorSettings, setShowAcceleratorSettings] = useState(false);
  const {
    initialized: acceleratorReady,
    executing: acceleratorExecuting,
    executeTask: acceleratorExecute,
    currentTask: acceleratorTask,
    costMetrics,
    performanceMetrics,
  } = useDSIDP();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const agentButtonRef = useRef<HTMLButtonElement>(null);
  const teamDropdownRef = useRef<HTMLDivElement>(null);
  const teamButtonRef = useRef<HTMLButtonElement>(null);

  // Load IDE chat history from backend on mount
  useEffect(() => {
    const loadIDEChatHistory = async () => {
      if (!isLoggedIn || !projectId) return;
      
      setIsLoadingHistory(true);
      try {
        // Try to get existing IDE chat conversation for this project
        const history = await getChatHistory();
        
        if (history && Array.isArray(history)) {
          // Find IDE chat conversation for this project
          const ideConversation = history.find((conv: any) => 
            conv.title?.startsWith(`IDE:${projectId}`) || 
            conv.metadata?.projectId === projectId
          );
          
          if (ideConversation) {
            setCurrentConversationId(ideConversation.id);
            // Load messages for this conversation
            const convHistory = await getChatHistory(ideConversation.id);
            if (convHistory?.messages && Array.isArray(convHistory.messages)) {
              const loadedMessages: Message[] = convHistory.messages.map((msg: any) => ({
                id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                timestamp: new Date(msg.timestamp || msg.created_at),
              }));
              if (loadedMessages.length > 0) {
                setMessages(loadedMessages);
                console.log('[IDE Chat] Loaded', loadedMessages.length, 'messages from backend');
              }
            }
          } else {
            // Create new IDE chat conversation for this project
            const newChat = await createChat(`IDE:${projectId}`);
            if (newChat?.id) {
              setCurrentConversationId(newChat.id);
              console.log('[IDE Chat] Created new conversation:', newChat.id);
            }
          }
        }
      } catch (error) {
        console.error('[IDE Chat] Failed to load chat history:', error);
        // Continue with default messages on error
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadIDEChatHistory();
  }, [isLoggedIn, projectId]);

  // Load teams on mount
  useEffect(() => {
    const loadTeams = async () => {
      if (externalTeams && externalTeams.length > 0) {
        setTeams(externalTeams);
        return;
      }
      
      setIsLoadingTeams(true);
      try {
        const fetchedTeams = await listAgentTeams();
        setTeams(fetchedTeams);
      } catch (error) {
        console.error('Failed to load teams:', error);
      } finally {
        setIsLoadingTeams(false);
      }
    };
    
    loadTeams();
  }, [externalTeams]);

  // Sync external team selection
  useEffect(() => {
    if (externalSelectedTeamId !== undefined) {
      setSelectedTeamId(externalSelectedTeamId);
    }
  }, [externalSelectedTeamId]);

  // Get selected team
  const selectedTeam = useMemo(() => {
    return teams.find(t => t.id === selectedTeamId) || null;
  }, [teams, selectedTeamId]);

  // Handle team change
  const handleTeamChange = useCallback((teamId: string | null) => {
    setSelectedTeamId(teamId);
    setIsTeamDropdownOpen(false);
    onTeamChange?.(teamId);
  }, [onTeamChange]);

  // Load custom agents on mount
  useEffect(() => {
    const loadCustomAgents = async () => {
      setIsLoadingAgents(true);
      try {
        const fetchedAgents = await listAgents({ status_filter: 'active' });
        setCustomAgents(fetchedAgents);
      } catch (error) {
        console.error('Failed to load custom agents:', error);
      } finally {
        setIsLoadingAgents(false);
      }
    };
    
    loadCustomAgents();
  }, []);

  // Get selected custom agent (with safety check)
  const selectedCustomAgent = useMemo(() => {
    if (!Array.isArray(customAgents)) return null;
    return customAgents.find(a => a.id === selectedCustomAgentId) || null;
  }, [customAgents, selectedCustomAgentId]);

  // Handle custom agent selection
  const handleCustomAgentSelect = useCallback((agentId: string | null) => {
    setSelectedCustomAgentId(agentId);
    if (agentId) {
      // When selecting custom agent, reset built-in agent to default
      setSelectedAgent('default');
    }
    setIsAgentDropdownOpen(false);
  }, []);

  // Handle built-in agent selection
  const handleBuiltInAgentSelect = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    // When selecting built-in agent, clear custom agent selection
    setSelectedCustomAgentId(null);
    setIsAgentDropdownOpen(false);
    externalOnAgentChange?.(agent);
  }, [externalOnAgentChange]);

  // Messages are managed in state only - loaded fresh each session

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Smart execution handler
  const handleSmartExecution = useCallback(async (userInput: string): Promise<string> => {
    try {
      console.log('🧠 Smart Execution: Starting intelligent pipeline');
      
      // 1. Build execution context
      const contextAggregator = getContextAggregator();
      // Expose IDE state for context aggregation
      (window as any).__IDE_STATE__ = {
        activeFile: activeFilePath ? files.find(f => f.path === activeFilePath) : null,
        openFiles: files.filter(f => f.type === 'file'),
        selectedText: null,
        cursorPosition: null,
        files,
      };
      const context = await contextAggregator.buildContext();
      contextAggregator.addConversationMessage('user', userInput);
      
      // 2. Classify intent
      const intentClassifier = getIntentClassifier();
      const intent = await intentClassifier.classify(userInput, context);
      console.log('🎯 Intent classified:', intent.type, 'confidence:', intent.confidence);
      
      // 3. For simple questions/explanations, skip planning
      const simpleIntents = [UserIntent.QUESTION, UserIntent.EXPLAIN_CODE, UserIntent.DOCUMENTATION];
      if (simpleIntents.includes(intent.type)) {
        console.log('📝 Simple intent - using direct response');
        return ''; // Return empty to fall through to normal handling
      }
      
      // 4. Create execution plan for complex intents
      const planningEngine = getPlanningEngine();
      const plan = await planningEngine.createPlan(intent, context);
      setExecutionPlan(plan);
      console.log('📋 Execution plan created with', plan.steps.length, 'steps');
      
      // 5. Execute plan with visualization
      const smartExecutor = getSmartExecutor({
        onStepStart: (step) => {
          console.log('▶️ Starting step:', step.purpose);
          setExecutionPlan(prev => prev ? { ...prev, status: 'executing' } : null);
        },
        onStepComplete: (step, result) => {
          console.log('✅ Step completed:', step.id, result.success ? 'success' : 'failed');
          setExecutionPlan(prev => {
            if (!prev) return null;
            return {
              ...prev,
              steps: prev.steps.map(s => s.id === step.id ? { ...s, ...step } : s),
            };
          });
        },
        onPlanComplete: (result) => {
          console.log('🏁 Plan completed:', result.success ? 'success' : 'failed');
          setSuggestions(result.suggestions || []);
          setExecutionPlan(prev => prev ? { ...prev, status: result.success ? 'completed' : 'failed' } : null);
        },
      });
      
      const result = await smartExecutor.execute(plan, context);
      
      // 6. Generate response summary
      const summary = result.success
        ? `✅ **Execution Complete**\n\n${result.summary}\n\n**Steps completed:** ${result.stepResults.filter(r => r.success).length}/${result.stepResults.length}`
        : `⚠️ **Execution Incomplete**\n\n${result.summary}\n\nSome steps may need manual attention.`;
      
      contextAggregator.addConversationMessage('assistant', summary);
      
      return summary;
    } catch (error) {
      console.error('Smart execution error:', error);
      setExecutionPlan(null);
      return ''; // Fall through to normal handling
    }
  }, [files, activeFilePath]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Determine which agent to use
    const activeAgentId = selectedCustomAgentId || (selectedAgent !== 'default' ? selectedAgent : undefined);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      teamId: selectedTeamId || undefined,
      agentId: activeAgentId,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response = 'I understand. How can I help you with that?';

      // ACCELERATOR MODE: Use real backend autonomous executor
      if (acceleratorMode && acceleratorReady) {
        console.log('⚡ Accelerator Mode: Using real backend executor');
        try {
          const result = await acceleratorExecute(userMessage.content);
          
          // Check if execution failed
          if ((result as any)?.error || result?.status === 'failed') {
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `⚡ **Accelerator Error**\n\n❌ ${(result as any)?.error || 'Execution failed'}\n\n**Task:** "${userMessage.content}"\n\n_Try checking your API keys in settings or use regular chat mode._`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
            return;
          }
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `⚡ **Accelerator Task Started**\n\nTask: "${userMessage.content}"\n\nThe autonomous executor is now running. Check the accelerator metrics for progress.`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        } catch (accError: any) {
          console.error('Accelerator execution failed:', accError);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `⚡ **Accelerator Error**\n\n❌ ${accError?.message || 'Connection failed'}\n\n**Task:** "${userMessage.content}"\n\n_Falling back to regular chat mode..._`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          // Fall through to normal handling
        }
      }
      
      // SMART EXECUTION (frontend simulation) - only when accelerator is OFF
      if (useSmartExecution && !acceleratorMode) {
        const smartResponse = await handleSmartExecution(userMessage.content);
        if (smartResponse) {
          response = smartResponse;
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
          return; // Skip normal handling if smart execution handled it
        }
      }

      // Get system prompt - either from custom agent or built-in agent
      let systemPrompt: string | undefined;
      let customAgentConfig: AgentResponse | undefined;
      
      if (selectedCustomAgentId && Array.isArray(customAgents)) {
        // Using custom agent from backend
        customAgentConfig = customAgents.find(a => a.id === selectedCustomAgentId);
        systemPrompt = customAgentConfig?.personality_config?.system_prompt || 
                       customAgentConfig?.personality_config?.systemPrompt ||
                       `You are ${customAgentConfig?.name}. ${customAgentConfig?.description || ''}`;
      } else {
        // Using built-in agent
        const agentConfig = agentOptions.find(a => a.value === selectedAgent);
        systemPrompt = agentConfig?.systemPrompt;
      }

      // PRIMARY: Use Resonant Backend with execute_mode for better quality responses
      // This routes through agents/debate instead of direct LLM calls
      try {
        console.log('🚀 IDE Chat: Using Resonant Backend with execute_mode');
        
        // Build file context for the AI to read actual file contents
        const fileContextList = files
          .filter(f => f.type === 'file' && f.content)
          .map(f => `--- File: ${f.path} ---\n${f.content}\n--- End of ${f.path} ---`)
          .join('\n\n');
        
        // Get active file content specifically
        const activeFile = activeFilePath ? files.find(f => f.path === activeFilePath) : null;
        const activeFileContext = activeFile?.content 
          ? `\n\n[CURRENTLY OPEN FILE: ${activeFilePath}]\n${activeFile.content}\n[END OF CURRENT FILE]`
          : '';
        
        // Build enhanced message with file context
        const enhancedMessage = fileContextList 
          ? `${userMessage.content}\n\n[PROJECT FILES CONTEXT]:\n${fileContextList}${activeFileContext}`
          : userMessage.content;
        
        console.log('📁 Including', files.filter(f => f.type === 'file' && f.content).length, 'files in context');
        
        const resonantRequest: ResonantChatRequest = {
          message: enhancedMessage,
          chatId: currentConversationId || undefined, // Pass chatId for backend persistence
          execute_mode: true, // IDE mode: code-focused, no explanations
          project_context: {
            projectId: projectId,
            files: files.filter(f => f.type === 'file').map(f => ({ path: f.path, content: f.content || '' })),
            activeFile: activeFilePath,
          },
          teamId: selectedTeamId || undefined,
          agent_hash: activeAgentId,
        };
        
        const resonantResponse = await sendResonantMessage(resonantRequest);
        response = resonantResponse.message?.content || response;
        
        // Save chatId from response if provided (backend creates chat if not provided)
        if (resonantResponse.chatId && !currentConversationId) {
          setCurrentConversationId(resonantResponse.chatId);
          console.log('[IDE Chat] Conversation ID set from response:', resonantResponse.chatId);
        }
        
        console.log('✅ Resonant Backend response received, provider:', resonantResponse.aiProvider);
      } catch (resonantError) {
        console.warn('⚠️ Resonant Backend failed, falling back to legacy handler:', resonantError);
        
        // FALLBACK: Use legacy handlers if Resonant backend fails
        // If team is selected, use team workflow (multi-agent collaboration)
        if (selectedTeamId && projectId) {
          try {
            const workflow = await executeWorkflow(selectedTeamId, {
              input_data: {
                message: userMessage.content,
                agent: activeAgentId,
                customAgentId: selectedCustomAgentId,
                systemPrompt,
              },
              project_id: projectId,
            });
            response = workflow.result?.response || workflow.result?.output || 'Workflow completed.';
          } catch (workflowError) {
            console.error('Team workflow failed:', workflowError);
            response = 'Team workflow failed. Falling back to single agent.';
            if (onSendMessage) {
              response = await onSendMessage(userMessage.content, { 
                teamId: selectedTeamId, 
                agentId: activeAgentId,
                systemPrompt,
              });
            }
          }
        } else if (onSendMessage) {
          // Single agent mode - use selected agent's system prompt
          response = await onSendMessage(userMessage.content, { 
            agentId: activeAgentId,
            customAgentId: selectedCustomAgentId || undefined,
            systemPrompt,
          });
        }
      }

      // Check if response contains code blocks and detect auto-apply intent
      const hasCodeBlocks = response.includes('```');
      const lowerMessage = userMessage.content.toLowerCase();
      const isAutoApplyRequest = lowerMessage.includes('apply') ||
        lowerMessage.includes('change') ||
        lowerMessage.includes('modify') ||
        lowerMessage.includes('add') ||
        lowerMessage.includes('create') ||
        lowerMessage.includes('refactor') ||
        lowerMessage.includes('update') ||
        lowerMessage.includes('fix');

      // Extract file previews from code blocks
      const filePreviews: Message['filePreviews'] = [];
      if (hasCodeBlocks) {
        try {
          // Look for code blocks with file paths or language hints
          const codeBlockRegex = /```(\w+)?\s*(?:file:\s*)?([^\n]+)?\n([\s\S]*?)```/g;
          let match;
          while ((match = codeBlockRegex.exec(response)) !== null) {
            const language = match[1] || 'plaintext';
            const potentialPath = match[2]?.trim();
            const codeContent = match[3] || '';

            // Check if this looks like a file path
            if (potentialPath && (potentialPath.includes('/') || potentialPath.includes('\\') || potentialPath.match(/\.\w+$/))) {
              // Limit to reasonable preview (first 300 lines or 8000 chars for preview)
              const previewContent = codeContent.split('\n').slice(0, 300).join('\n').substring(0, 8000);
              filePreviews.push({
                path: potentialPath,
                content: previewContent,
                language: language !== 'plaintext' ? language : undefined,
                isModified: true,
              });
            } else if (codeContent.length > 100 && language !== 'plaintext') {
              // If we have substantial code but no path, try to infer from language or context
              const pathMatch = response.match(/(?:file|path|in|from)[:\s]+([^\s\n]+\.(ts|tsx|js|jsx|py|json|md|css|html|java|cpp|c|go|rs|rb|php))/i);
              if (pathMatch) {
                const previewContent = codeContent.split('\n').slice(0, 300).join('\n').substring(0, 8000);
                filePreviews.push({
                  path: pathMatch[1],
                  content: previewContent,
                  language: language !== 'plaintext' ? language : undefined,
                  isModified: true,
                });
              }
            }
          }
        } catch (err) {
          console.error('Failed to extract file previews:', err);
        }
      }

      // Extract code blocks for potential auto-apply
      let suggestedChanges: Message['suggestedChanges'] = undefined;

      // First, check if response contains JSON with actions (from AI Dev Agent)
      try {
        // Try multiple JSON patterns
        let jsonMatch = response.match(/```json\s*(\{[\s\S]*"actions"[\s\S]*\})\s*```/);
        if (!jsonMatch) {
          // Try without code block markers
          jsonMatch = response.match(/\{[\s\S]*"actions"[\s\S]*\}/);
        }
        if (jsonMatch) {
          console.log('📦 Found JSON match, parsing...');
          const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          if (parsed.actions && Array.isArray(parsed.actions) && parsed.actions.length > 0) {
            suggestedChanges = parsed.actions.map((action: any) => ({
              type: (action.type || 'modify') as 'create' | 'modify' | 'delete',
              path: action.path || `file-${Date.now()}.txt`,
              content: action.content || '',
              explanation: action.explanation || 'AI-generated change'
            }));
            console.log('✅ Extracted actions from JSON:', suggestedChanges?.length || 0, suggestedChanges);
          } else {
            console.warn('⚠️ JSON found but no actions array or empty:', parsed);
          }
        } else {
          console.debug('🔍 No JSON actions found in response');
        }
      } catch (err) {
        console.error('❌ Error parsing JSON actions:', err);
        console.debug('Trying code block extraction...');
      }

      // Fallback: Extract from code blocks if no JSON actions found
      if (!suggestedChanges && hasCodeBlocks && isAutoApplyRequest && projectId) {
        try {
          // Try to extract file paths and code from response
          const codeBlockRegex = /```(\w+)?\s*(?:file:\s*)?([^\n]+)?\n([\s\S]*?)```/g;
          const matches = [...response.matchAll(codeBlockRegex)];

          if (matches.length > 0) {
            suggestedChanges = matches.map((match, idx) => {
              const language = match[1] || 'text';
              const potentialPath = match[2]?.trim();
              const codeContent = match[3] || '';

              // Try to detect file path
              let detectedPath = potentialPath;
              if (!detectedPath || !detectedPath.match(/\.\w+$/)) {
                // Try to find path in response text
                const pathMatch = response.match(/(?:file|path|create|modify|in|to)[:\s]+([^\s\n]+\.(ts|tsx|js|jsx|py|json|md|css|html|txt))/i);
                detectedPath = pathMatch ? pathMatch[1] : `file-${idx + 1}.${language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
              }

              return {
                type: (lowerMessage.includes('create') || lowerMessage.includes('new') ? 'create' : 'modify') as 'create' | 'modify' | 'delete',
                path: detectedPath,
                content: codeContent,
                explanation: `Code block ${idx + 1} from AI response`
              };
            });
            console.log('✅ Extracted changes from code blocks:', suggestedChanges?.length || 0);
          }
        } catch (err) {
          console.error('Failed to extract changes:', err);
        }
      }

      // Ensure response is a string
      const responseText = typeof response === 'string' ? response : String(response || 'I apologize, but I encountered an error processing your request.');

      console.log('📨 Received response:', {
        type: typeof response,
        length: responseText.length,
        preview: responseText.substring(0, 100)
      });

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        suggestedChanges,
        canAutoApply: suggestedChanges && suggestedChanges.length > 0 && !!onApplyChanges,
        filePreviews: filePreviews.length > 0 ? filePreviews : undefined,
      };

      console.log('📨 Creating assistant message:', {
        hasSuggestedChanges: !!suggestedChanges,
        suggestedChangesCount: suggestedChanges?.length || 0,
        canAutoApply: assistantMessage.canAutoApply,
        hasOnApplyChanges: !!onApplyChanges,
        suggestedChanges: suggestedChanges
      });

      // CRITICAL: Use functional update to ensure we have the latest state
      // Also ensure we're not accidentally clearing messages
      setMessages(prev => {
        // Prevent duplicate messages
        const isDuplicate = prev.some(m => m.id === assistantMessage.id ||
          (m.role === 'assistant' && m.content === responseText &&
            Math.abs(m.timestamp.getTime() - assistantMessage.timestamp.getTime()) < 1000));

        if (isDuplicate) {
          console.warn('⚠️ Duplicate message detected, skipping');
          return prev;
        }

        const updated = [...prev, assistantMessage];
        console.log('✅ Adding assistant message:', {
          id: assistantMessage.id,
          contentLength: responseText.length,
          messageCount: updated.length,
          hasFilePreviews: filePreviews.length > 0,
          hasSuggestedChanges: !!suggestedChanges
        });

        return updated;
      });
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartNewMessage = () => {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (onPhotoUpload) {
        onPhotoUpload(file);
      } else {
        // Default behavior: add image to message
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          setInput(prev => prev + `\n![${file.name}](${imageUrl})\n`);
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset input
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // Built-in agent presets with system prompts - using SVG icons
  const agentOptions: { value: Agent; label: string; icon: React.ReactNode; description: string; systemPrompt: string }[] = [
    { 
      value: 'default', 
      label: 'Auto', 
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><circle cx="6" cy="6" r="1" fill="currentColor" /><circle cx="10" cy="6" r="1" fill="currentColor" /><path d="M5 10C5.5 11 6.5 12 8 12C9.5 12 10.5 11 11 10" strokeLinecap="round" /></svg>,
      description: 'General purpose assistant',
      systemPrompt: 'You are a helpful AI coding assistant. Help the user with their coding tasks.'
    },
    { 
      value: 'code-assistant', 
      label: 'Coder', 
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4L1 8L5 12M11 4L15 8L11 12M9 2L7 14" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      description: 'Write & edit code',
      systemPrompt: 'You are an expert code writer. Focus on writing clean, efficient, well-documented code. Always provide complete implementations.'
    },
    { 
      value: 'debugger', 
      label: 'Debug', 
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5" /><path d="M11 11L14 14" strokeLinecap="round" /></svg>,
      description: 'Find & fix bugs',
      systemPrompt: 'You are an expert debugger. Analyze code for bugs, errors, and issues. Explain the root cause and provide fixes.'
    },
    { 
      value: 'documentation', 
      label: 'Docs', 
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2H11L13 4V14H3V2Z" /><path d="M5 6H11M5 9H11M5 12H9" strokeLinecap="round" /></svg>,
      description: 'Write documentation',
      systemPrompt: 'You are a technical writer. Create clear, comprehensive documentation including JSDoc, README files, and inline comments.'
    },
    { 
      value: 'refactor', 
      label: 'Refactor', 
      icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12L2 10L4 8M12 4L14 6L12 8M6 14L10 2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
      description: 'Improve code quality',
      systemPrompt: 'You are a code refactoring expert. Improve code structure, readability, and performance while maintaining functionality.'
    },
  ];

  const selectedAgentOption = agentOptions.find(opt => opt.value === selectedAgent);
  const selectedAgentLabel = selectedAgentOption?.label || 'Auto';

  // Close agent dropdown when clicking outside and position it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        agentDropdownRef.current &&
        !agentDropdownRef.current.contains(event.target as Node) &&
        agentButtonRef.current &&
        !agentButtonRef.current.contains(event.target as Node)
      ) {
        setIsAgentDropdownOpen(false);
      }
    };

    const updateDropdownPosition = () => {
      if (isAgentDropdownOpen && agentButtonRef.current && agentDropdownRef.current) {
        const buttonRect = agentButtonRef.current.getBoundingClientRect();
        const dropdownWidth = 280; // max-width from CSS
        const dropdownHeight = agentDropdownRef.current.offsetHeight || 300;

        // Position from right side of button (opens to the left) - same as ProviderSelector
        let right = window.innerWidth - buttonRect.right;
        let top = buttonRect.top - dropdownHeight - 8;

        // If not enough space above, position below
        if (top < 10) {
          top = buttonRect.bottom + 8;
        }

        // Ensure it doesn't overflow right edge (minimum 10px from edge)
        if (right < 10) {
          right = 10;
        }

        // Ensure it doesn't overflow left edge
        const left = window.innerWidth - right - dropdownWidth;
        if (left < 10) {
          right = window.innerWidth - dropdownWidth - 10;
        }

        // Ensure it doesn't overflow bottom
        if (top + dropdownHeight > window.innerHeight - 10) {
          top = window.innerHeight - dropdownHeight - 10;
        }

        agentDropdownRef.current.style.top = `${top}px`;
        agentDropdownRef.current.style.right = `${right}px`;
        agentDropdownRef.current.style.left = 'auto';
        agentDropdownRef.current.style.bottom = 'auto';
      }
    };

    if (isAgentDropdownOpen) {
      // Set initial position immediately and on next frame
      updateDropdownPosition();
      requestAnimationFrame(() => {
        updateDropdownPosition();
      });
      // Also update after a short delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        updateDropdownPosition();
      }, 10);

      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
      };
    }
  }, [isAgentDropdownOpen]);

  // Close team dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        teamDropdownRef.current &&
        !teamDropdownRef.current.contains(event.target as Node) &&
        teamButtonRef.current &&
        !teamButtonRef.current.contains(event.target as Node)
      ) {
        setIsTeamDropdownOpen(false);
      }
    };

    if (isTeamDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isTeamDropdownOpen]);

  return (
    <div className={styles.chatPanel}>
      {/* Smart Execution Visualizer */}
      {executionPlan && (
        <ExecutionVisualizer
          plan={executionPlan}
          suggestions={suggestions}
          onSuggestionClick={(suggestion) => {
            if (suggestion.action) {
              suggestion.action();
            }
          }}
          onPause={() => {
            const executor = getSmartExecutor();
            executor.pause();
          }}
          onResume={() => {
            const executor = getSmartExecutor();
            executor.resume();
          }}
          onCancel={() => {
            const executor = getSmartExecutor();
            executor.cancel();
            setExecutionPlan(null);
          }}
        />
      )}

      {/* Accelerator Settings Panel - overlay */}
      <AcceleratorSettings 
        isOpen={showAcceleratorSettings} 
        onClose={() => setShowAcceleratorSettings(false)} 
      />
      
      <div className={styles.chatMessages}>
        {/* Accelerator Process Flow - inline at top of messages */}
        {acceleratorMode && acceleratorExecuting && (
          <div className={styles.acceleratorFlowInline}>
            <AcceleratorProcessFlow 
              isActive={acceleratorExecuting}
              compact={true}
            />
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${styles[message.role]}`}
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          >
            <div className={styles.messageContent} style={{ maxWidth: '100%', width: '100%' }}>
              <FormattedMessageContent content={message.content} />
            </div>

            {/* File Previews - Show modified files */}
            {message.filePreviews && message.filePreviews.length > 0 && (
              <div className={styles.filePreviewsSection}>
                {message.filePreviews.map((preview, idx) => (
                  <FilePreviewCard
                    key={idx}
                    filePath={preview.path}
                    content={preview.content}
                    language={preview.language}
                    isModified={preview.isModified}
                    onOpenFile={onOpenFile}
                  />
                ))}
              </div>
            )}

            {message.canAutoApply && message.suggestedChanges && (
              <div className={styles.autoApplySection}>
                <div className={styles.autoApplyInfo}>
                  <strong><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}><path d="M12 3l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-4-3-4 3 1.5-4.5-3.5-2.5h4.5z" strokeLinejoin="round" /></svg>I can apply these changes automatically:</strong>
                  <ul className={styles.changesList}>
                    {message.suggestedChanges.map((change, idx) => (
                      <li key={idx}>
                        {change.type === 'create' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg> : change.type === 'modify' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" /></svg>} {change.path}
                        {change.explanation && <span className={styles.changeExplanation}> - {change.explanation}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className={styles.applyButton}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🚀 Apply Changes button clicked!', {
                      hasOnApplyChanges: !!onApplyChanges,
                      suggestedChanges: message.suggestedChanges,
                      changesCount: message.suggestedChanges?.length
                    });
                    if (onApplyChanges && message.suggestedChanges) {
                      try {
                        console.log('📤 Calling onApplyChanges with:', message.suggestedChanges);
                        await onApplyChanges(message.suggestedChanges);
                        console.log('✅ onApplyChanges completed successfully');
                        // Update message to show applied
                        setMessages(prev => prev.map(m =>
                          m.id === message.id
                            ? { ...m, canAutoApply: false, content: m.content + '\n\nChanges applied successfully!' }
                            : m
                        ));
                      } catch (err: any) {
                        console.error('❌ Failed to apply changes:', err);
                        alert(`Failed to apply changes: ${err.message || 'Unknown error'}`);
                      }
                    } else {
                      console.warn('⚠️ Cannot apply changes:', {
                        hasOnApplyChanges: !!onApplyChanges,
                        hasSuggestedChanges: !!message.suggestedChanges
                      });
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" strokeLinecap="round" strokeLinejoin="round" /></svg>Apply Changes Automatically
                </button>
              </div>
            )}
            <div className={styles.messageTime}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageContent}>
              <span className={styles.typingIndicator}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInput}>
        <div className={styles.inputControls}>
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to check files, read code, or make changes..."
              rows={3}
              disabled={isLoading}
            />
            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 8L14 8M10 4L14 8L10 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className={styles.selectorRow}>
            {/* Team Selector */}
            <div className={styles.teamSelectorContainer}>
              <button
                ref={teamButtonRef}
                className={`${styles.teamSelectorButton} ${selectedTeamId ? styles.teamActive : ''}`}
                onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                type="button"
                disabled={isLoadingTeams}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="5" cy="5" r="2" />
                  <circle cx="11" cy="5" r="2" />
                  <circle cx="8" cy="11" r="2" />
                  <path d="M5 7V9L8 11M11 7V9L8 11" strokeLinecap="round" />
                </svg>
                <span className={styles.teamSelectorLabel}>
                  {isLoadingTeams ? 'Loading...' : (selectedTeam?.name || 'No Team')}
                </span>
                <ChevronDownIcon className={`${styles.agentChevron} ${isTeamDropdownOpen ? styles.agentChevronOpen : ''}`} />
              </button>
              {isTeamDropdownOpen && (
                <div ref={teamDropdownRef} className={styles.teamDropdown}>
                  <button
                    className={`${styles.teamOption} ${!selectedTeamId ? styles.teamOptionActive : ''}`}
                    onClick={() => handleTeamChange(null)}
                    type="button"
                  >
                    <span className={styles.teamOptionIcon}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3" /><path d="M3 14C3 11 5 9 8 9C11 9 13 11 13 14" strokeLinecap="round" /></svg>
                    </span>
                    <div className={styles.teamOptionContent}>
                      <span className={styles.teamOptionName}>No Team</span>
                      <span className={styles.teamOptionDesc}>Use single agent</span>
                    </div>
                  </button>
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      className={`${styles.teamOption} ${selectedTeamId === team.id ? styles.teamOptionActive : ''}`}
                      onClick={() => handleTeamChange(team.id)}
                      type="button"
                    >
                      <span className={styles.teamOptionIcon}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="5" r="2" /><circle cx="11" cy="5" r="2" /><path d="M1 12C1 10 2.5 9 5 9C6 9 6.8 9.2 7.5 9.5M9 12C9 10 10.5 9 11 9C13.5 9 15 10 15 12" strokeLinecap="round" /></svg>
                      </span>
                      <div className={styles.teamOptionContent}>
                        <span className={styles.teamOptionName}>{team.name}</span>
                        <span className={styles.teamOptionDesc}>
                          {team.member_count} agents • {team.workflow_config.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Agent Selector - Built-in + Custom agents */}
            <div className={styles.agentSelectorContainer}>
              <button
                ref={agentButtonRef}
                className={`${styles.agentSelectorButton} ${selectedCustomAgentId ? styles.customAgentActive : ''}`}
                onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                type="button"
              >
                <span className={styles.agentIcon}>
                  {selectedCustomAgentId ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1L9.5 6H15L10.5 9L12 14L8 11L4 14L5.5 9L1 6H6.5L8 1Z" strokeLinejoin="round" /></svg>
                  ) : (selectedAgentOption?.icon || <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><circle cx="6" cy="6" r="1" fill="currentColor" /><circle cx="10" cy="6" r="1" fill="currentColor" /><path d="M5 10C5.5 11 6.5 12 8 12C9.5 12 10.5 11 11 10" strokeLinecap="round" /></svg>)}
                </span>
                <span className={styles.agentSelectorLabel}>
                  {selectedCustomAgentId 
                    ? (selectedCustomAgent?.name || 'Custom Agent')
                    : selectedAgentLabel
                  }
                </span>
                <ChevronDownIcon className={`${styles.agentChevron} ${isAgentDropdownOpen ? styles.agentChevronOpen : ''}`} />
              </button>
              {isAgentDropdownOpen && (
                <div ref={agentDropdownRef} className={styles.agentDropdown}>
                  {/* Built-in Agents Section */}
                  <div className={styles.dropdownHeader}>Built-in Agents</div>
                  {agentOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`${styles.agentOption} ${!selectedCustomAgentId && selectedAgent === option.value ? styles.agentOptionActive : ''}`}
                      onClick={() => handleBuiltInAgentSelect(option.value)}
                      type="button"
                    >
                      <span className={styles.agentOptionIcon}>{option.icon}</span>
                      <div className={styles.agentOptionContent}>
                        <span className={styles.agentOptionName}>{option.label}</span>
                        <span className={styles.agentOptionDesc}>{option.description}</span>
                      </div>
                    </button>
                  ))}
                  
                  {/* Custom Agents Section */}
                  {(Array.isArray(customAgents) && customAgents.length > 0 || isLoadingAgents) && (
                    <>
                      <div className={styles.dropdownDivider} />
                      <div className={styles.dropdownHeader}>
                        Your Custom Agents
                        {isLoadingAgents && <span className={styles.loadingDot}>...</span>}
                      </div>
                      {Array.isArray(customAgents) && customAgents.map((agent) => (
                        <button
                          key={agent.id}
                          className={`${styles.agentOption} ${selectedCustomAgentId === agent.id ? styles.agentOptionActive : ''}`}
                          onClick={() => handleCustomAgentSelect(agent.id)}
                          type="button"
                        >
                          <span className={styles.agentOptionIcon}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1L9.5 6H15L10.5 9L12 14L8 11L4 14L5.5 9L1 6H6.5L8 1Z" strokeLinejoin="round" /></svg>
                          </span>
                          <div className={styles.agentOptionContent}>
                            <span className={styles.agentOptionName}>{agent.name}</span>
                            <span className={styles.agentOptionDesc}>
                              {agent.description || 'Custom agent'}
                            </span>
                          </div>
                        </button>
                      ))}
                      {(!Array.isArray(customAgents) || customAgents.length === 0) && !isLoadingAgents && (
                        <div className={styles.emptyState}>
                          No custom agents yet
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Accelerator Mode Toggle */}
            <button
              className={`${styles.acceleratorToggle} ${acceleratorMode ? styles.acceleratorActive : ''}`}
              onClick={() => setAcceleratorMode(!acceleratorMode)}
              title={acceleratorMode ? 'Accelerator ON' : 'Accelerator OFF'}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 2L8 8L10 9L3 14L8 8L6 7L13 2Z" strokeLinejoin="round" />
              </svg>
              {acceleratorMode && (
                <span className={styles.acceleratorMetrics}>
                  {costMetrics?.totalRequests || 0} · ${(costMetrics?.totalCost || 0).toFixed(2)}
                </span>
              )}
            </button>
            
            {/* Accelerator Settings */}
            {acceleratorMode && (
              <button
                className={styles.acceleratorSettingsBtn}
                onClick={() => setShowAcceleratorSettings(true)}
                title="Accelerator Settings"
                type="button"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="2" />
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5l1.5-1.5M11 5l1.5-1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}

            {/* Photo Upload */}
            <button
              className={styles.uploadPhotoButton}
              onClick={() => photoInputRef.current?.click()}
              title="Upload Photo"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="12" height="9" rx="1" />
                <circle cx="6" cy="8" r="1.5" />
                <path d="M14 10L11 7L7 11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            <button
              className={styles.newMessageButton}
              onClick={handleStartNewMessage}
              title="New Chat"
              type="button"
            >
              <span className={styles.newMessageText}>New Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

