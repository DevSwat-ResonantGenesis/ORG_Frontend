import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  goToPricing, 
  goToHelp, 
  goToContact,
  goToPrivacy,
  goToTerms
} from '@/utils/navigation';
import { useToolbar } from '@/context/ToolbarContext';
import './Footer.css';

interface ToolbarAction {
  key: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface FooterProps {
  variant?: 'default' | 'minimal';
  toolbarActions?: ToolbarAction[];
}

const Footer: React.FC<FooterProps> = () => {
  return null;
};

export default Footer;

