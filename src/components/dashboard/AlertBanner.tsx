/**
 * Alert Banner Component
 * Shows limit warnings, billing alerts, and system notices
 */
import React from 'react';
import { AlertTriangle, AlertCircle, Info, X, ArrowRight } from 'lucide-react';
import styles from './AlertBanner.module.css';

export interface Alert {
  type: 'warning' | 'error' | 'info';
  level?: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'critical' | string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (index: number) => void;
}

const ALERT_ICONS = {
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className={styles.container}>
      {alerts.map((alert, index) => {
        const Icon = ALERT_ICONS[alert.type] || Info;
        const priorityClass = alert.priority === 'critical' ? styles.critical : 
                              alert.priority === 'high' ? styles.high : '';
        
        return (
          <div 
            key={index} 
            className={`${styles.alert} ${styles[alert.type]} ${priorityClass}`}
          >
            <Icon className={styles.icon} size={18} />
            <span className={styles.message}>{alert.message}</span>
            {alert.action && (
              <button className={styles.actionBtn} onClick={alert.action.onClick}>
                {alert.action.label}
                <ArrowRight size={14} />
              </button>
            )}
            {onDismiss && (
              <button className={styles.dismissBtn} onClick={() => onDismiss(index)}>
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AlertBanner;
