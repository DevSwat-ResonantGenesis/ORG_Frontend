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

/**
 * List all available skills with user's enabled/disabled status
 */
export const listSkills = async (): Promise<Skill[]> => {
  try {
    const response = await fastapiClient.get<SkillListResponse>('/skills/list');
    return response.data.skills;
  } catch (error: any) {
    logger.error('Failed to list skills', error, { component: 'Skills' });
    return [];
  }
};

/**
 * Toggle a skill on/off for the current user
 */
export const toggleSkill = async (skillId: string, enabled: boolean): Promise<boolean> => {
  try {
    await fastapiClient.post('/skills/toggle', { skill_id: skillId, enabled });
    return true;
  } catch (error: any) {
    logger.error('Failed to toggle skill', error, { component: 'Skills' });
    return false;
  }
};

/**
 * Execute a skill action directly
 */
export const executeSkill = async (
  skillId: string,
  message: string,
  context?: Record<string, any>
): Promise<SkillExecuteResponse | null> => {
  try {
    const response = await fastapiClient.post<SkillExecuteResponse>('/skills/execute', {
      skill_id: skillId,
      message,
      context,
    });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to execute skill', error, { component: 'Skills' });
    return null;
  }
};

/**
 * Get list of enabled skills for toolbar display
 */
export const getEnabledSkills = async (): Promise<Array<{ id: string; name: string; icon: string; category: string }>> => {
  try {
    const response = await fastapiClient.get('/skills/enabled');
    return response.data.enabled_skills || [];
  } catch (error: any) {
    logger.error('Failed to get enabled skills', error, { component: 'Skills' });
    return [];
  }
};
