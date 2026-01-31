import React, { memo } from 'react';
import AdvancedFactory from './AdvancedFactory';

interface FactoryPanelProps {
  className?: string;
}

const FactoryPanelComponent: React.FC<FactoryPanelProps> = ({ className }) => {
  return <AdvancedFactory className={className} />;
};

export const FactoryPanel = memo(FactoryPanelComponent);
export default FactoryPanel;
