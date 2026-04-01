import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  capabilities: string[];
  credit_cost: number;
  requires_api_key?: string;
  is_default: boolean;
  enabled: boolean;
}

export interface SkillListResponse {
  skills: Skill[];
}

export interface SkillExecuteResponse {
  skill_id: string;
  skill_name: string;
  success: boolean;
  action?: string;
  summary?: string;
  error?: string;
  data?: Record<string, any>;
}

const SKILLS_LIST_ENDPOINTS = ['/skills/list', '/api/skills/list', '/api/v1/skills/list'] as const;
const SKILLS_TOGGLE_ENDPOINTS = ['/skills/toggle', '/api/skills/toggle', '/api/v1/skills/toggle'] as const;
const SKILLS_EXECUTE_ENDPOINTS = ['/skills/execute', '/api/skills/execute', '/api/v1/skills/execute'] as const;
const SKILLS_ENABLED_ENDPOINTS = ['/skills/enabled', '/api/skills/enabled', '/api/v1/skills/enabled'] as const;

const FALLBACK_SKILLS: Skill[] = [
  {
    id: 'code_visualizer',
    name: 'Code Visualizer',
    description: 'Analyze codebases, trace execution pipelines, and generate reports.',
    icon: 'code',
    category: 'analysis',
    capabilities: ['analyze_codebase', 'trace_pipeline', 'scan_github'],
    credit_cost: 200,
    is_default: false,
    enabled: false,
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the web for current information and documentation.',
    icon: 'search',
    category: 'search',
    capabilities: ['web_search', 'news_search'],
    credit_cost: 50,
    requires_api_key: 'tavily',
    is_default: false,
    enabled: false,
  },
  {
    id: 'image_generation',
    name: 'Image Generation',
    description: 'Generate images from text prompts.',
    icon: 'image',
    category: 'generation',
    capabilities: ['generate_image', 'edit_image'],
    credit_cost: 100,
    requires_api_key: 'openai',
    is_default: false,
    enabled: false,
  },
  {
    id: 'memory_search',
    name: 'Memory Search',
    description: 'Search prior conversations and saved memory anchors.',
    icon: 'brain',
    category: 'memory',
    capabilities: ['search_memories', 'search_conversations'],
    credit_cost: 20,
    is_default: true,
    enabled: true,
  },
  {
    id: 'agent_architect',
    name: 'Agent Architect',
    description: 'Advanced meta-agent that analyzes your needs and creates fully-configured autonomous agents with tools, schedules, goals, webhooks, and API connections.',
    icon: 'sparkles',
    category: 'utility',
    capabilities: ['analyze_user_needs', 'plan_agent_architecture', 'create_agents', 'configure_tools', 'assign_goals', 'create_schedules', 'create_webhooks'],
    credit_cost: 50,
    is_default: true,
    enabled: true,
  },
];

const parseSkillsPayload = (payload: unknown): Skill[] => {
  if (Array.isArray(payload)) return payload as Skill[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as any).skills)) {
    return (payload as any).skills as Skill[];
  }
  return [];
};

/**
 * List all available skills with user's enabled/disabled status
 */
export const listSkills = async (): Promise<Skill[]> => {
  for (const endpoint of SKILLS_LIST_ENDPOINTS) {
    try {
      const response = await fastapiClient.get<SkillListResponse | Skill[]>(endpoint);
      const parsed = parseSkillsPayload(response.data);
      if (parsed.length > 0) return parsed;
      if (endpoint === SKILLS_LIST_ENDPOINTS[SKILLS_LIST_ENDPOINTS.length - 1]) {
        return parsed;
      }
    } catch (error: any) {
      logger.warn('Skills list endpoint failed, trying fallback', {
        component: 'Skills',
        endpoint,
        status: error?.response?.status,
      });
    }
  }

  logger.error('Failed to list skills from all endpoints, using fallback skill catalog', undefined, { component: 'Skills' });
  return FALLBACK_SKILLS;
};

/**
 * Toggle a skill on/off for the current user
 */
export const toggleSkill = async (skillId: string, enabled: boolean): Promise<boolean> => {
  for (const endpoint of SKILLS_TOGGLE_ENDPOINTS) {
    try {
      await fastapiClient.post(endpoint, { skill_id: skillId, enabled });
      return true;
    } catch (error: any) {
      logger.warn('Skills toggle endpoint failed, trying fallback', {
        component: 'Skills',
        endpoint,
        status: error?.response?.status,
      });
    }
  }

  logger.error('Failed to toggle skill from all endpoints', undefined, { component: 'Skills', skillId, enabled });
  return false;
};

/**
 * Execute a skill action directly
 */
export const executeSkill = async (
  skillId: string,
  message: string,
  context?: Record<string, any>
): Promise<SkillExecuteResponse | null> => {
  for (const endpoint of SKILLS_EXECUTE_ENDPOINTS) {
    try {
      const response = await fastapiClient.post<SkillExecuteResponse>(endpoint, {
        skill_id: skillId,
        message,
        context,
      });
      return response.data;
    } catch (error: any) {
      logger.warn('Skills execute endpoint failed, trying fallback', {
        component: 'Skills',
        endpoint,
        status: error?.response?.status,
      });
    }
  }

  logger.error('Failed to execute skill from all endpoints', undefined, { component: 'Skills', skillId });
  return null;
};

/**
 * Get list of enabled skills for toolbar display
 */
export const getEnabledSkills = async (): Promise<Array<{ id: string; name: string; icon: string; category: string }>> => {
  for (const endpoint of SKILLS_ENABLED_ENDPOINTS) {
    try {
      const response = await fastapiClient.get(endpoint);
      return response.data?.enabled_skills || [];
    } catch (error: any) {
      logger.warn('Enabled skills endpoint failed, trying fallback', {
        component: 'Skills',
        endpoint,
        status: error?.response?.status,
      });
    }
  }

  logger.error('Failed to get enabled skills from all endpoints', undefined, { component: 'Skills' });
  return [];
};
