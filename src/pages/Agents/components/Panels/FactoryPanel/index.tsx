import React, { memo } from 'react';
import SimpleFactory from './SimpleFactory';

interface FactoryPanelProps {
  className?: string;
}

const FactoryPanelComponent: React.FC<FactoryPanelProps> = ({ className }) => {
  return <SimpleFactory className={className} />;
};

export const FactoryPanel = memo(FactoryPanelComponent);
export default FactoryPanel;
