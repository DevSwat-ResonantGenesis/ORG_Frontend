/**
 * Quick Actions Component
 * Provides quick access to common actions
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Bot, 
  Code, 
  BarChart3, 
  CreditCard,
  ChevronRight 
} from 'lucide-react';
import styles from './QuickActions.module.css';

interface QuickAction {
  label: string;
  description: string;
  icon: 'chat' | 'agent' | 'ide' | 'usage' | 'credits';
  path: string;
  primary?: boolean;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: 'Start Chat', description: 'AI conversations', icon: 'chat', path: '/resonant-chat', primary: true },
  { label: 'Create Agent', description: 'Build AI agents', icon: 'agent', path: '/agents' },
  { label: 'Open IDE', description: 'Code editor', icon: 'ide', path: '/ide' },
  { label: 'Buy Credits', description: 'Add more credits', icon: 'credits', path: '/pricing' },
];

const ICONS = {
  chat: MessageSquare,
  agent: Bot,
  ide: Code,
  usage: BarChart3,
  credits: CreditCard,
};

interface QuickActionsProps {
  actions?: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions = DEFAULT_ACTIONS }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <span className={styles.title}>Quick Actions</span>
      </div>
      <div className={styles.actions}>
        {actions.map((action, index) => {
          const Icon = ICONS[action.icon] || MessageSquare;
          
          return (
            <button
              key={index}
              className={`${styles.action} ${action.primary ? styles.primary : ''}`}
              onClick={() => navigate(action.path)}
            >
              <Icon size={20} className={styles.icon} />
              <div className={styles.content}>
                <span className={styles.label}>{action.label}</span>
                <span className={styles.description}>{action.description}</span>
              </div>
              <ChevronRight size={16} className={styles.arrow} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
