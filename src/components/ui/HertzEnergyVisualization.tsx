import React from 'react';
import styles from './HertzEnergyVisualization.module.css';

export interface HertzEnergyData {
  hash?: string;
  hertzValue: number;
  resonanceFrequency: number;
  energyLevel: 'low' | 'medium' | 'high' | 'critical';
  calculatedAt?: Date;
}

export interface HertzEnergyVisualizationProps {
  data: HertzEnergyData;
  showFrequency?: boolean;
  showEnergyLevel?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const getEnergyColor = (level: HertzEnergyData['energyLevel']): string => {
  switch (level) {
    case 'low':
      return '#10B981'; // green
    case 'medium':
      return '#F59E0B'; // yellow
    case 'high':
      return '#EF4444'; // red
    case 'critical':
      return '#DC2626'; // dark red
    default:
      return '#6B7280'; // gray
  }
};

const getEnergyLabel = (level: HertzEnergyData['energyLevel']): string => {
  switch (level) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
    default:
      return 'Unknown';
  }
};

export const HertzEnergyVisualization: React.FC<HertzEnergyVisualizationProps> = ({
  data,
  showFrequency = true,
  showEnergyLevel = true,
  size = 'medium',
  className = '',
}) => {
  const energyColor = getEnergyColor(data.energyLevel);
  const energyLabel = getEnergyLabel(data.energyLevel);
  
  // Calculate percentage for visualization (0-100)
  const energyPercentage = Math.min(100, Math.max(0, (data.hertzValue / 100) * 100));
  
  // Generate frequency wave visualization
  const frequencyPoints = Array.from({ length: 50 }, (_, i) => {
    const x = (i / 50) * 100;
    const y = 50 + Math.sin((i / 50) * Math.PI * 2 * (data.resonanceFrequency / 1000)) * 30;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`${styles.hertzVisualization} ${styles[size]} ${className}`}>
      <div className={styles.hertzContainer}>
        {/* Energy Meter */}
        <div className={styles.energyMeter}>
          <div className={styles.meterLabel}>Quality Level</div>
          <div className={styles.meterBar}>
            <div
              className={styles.meterFill}
              style={{
                width: `${energyPercentage}%`,
                backgroundColor: energyColor,
              }}
            />
          </div>
          <div className={styles.meterValue}>
            {data.hertzValue.toFixed(2)} Hz
          </div>
        </div>

        {/* Frequency Wave Visualization */}
        {showFrequency && (
          <div className={styles.frequencyWave}>
            <div className={styles.waveLabel}>Quality Frequency</div>
            <svg
              className={styles.waveSvg}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polyline
                points={frequencyPoints}
                fill="none"
                stroke={energyColor}
                strokeWidth="2"
              />
            </svg>
            <div className={styles.frequencyValue}>
              {data.resonanceFrequency.toFixed(2)} Hz
            </div>
          </div>
        )}

        {/* Energy Level Badge */}
        {showEnergyLevel && (
          <div
            className={styles.energyBadge}
            style={{ backgroundColor: energyColor }}
          >
            {energyLabel}
          </div>
        )}

        {/* Calculated At Timestamp */}
        {data.calculatedAt && (
          <div className={styles.timestamp}>
            Calculated: {new Date(data.calculatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

