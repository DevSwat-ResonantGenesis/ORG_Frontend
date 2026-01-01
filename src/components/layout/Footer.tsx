import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  goToPricing, 
  goToHelp, 
  goToAbout, 
  goToContact,
  goToPrivacy,
  goToTerms,
  goToCompliance
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

const Footer: React.FC<FooterProps> = ({ variant = 'default', toolbarActions: propsToolbarActions }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toolbarActions: contextToolbarActions } = useToolbar();
  const toolbarActions = propsToolbarActions || contextToolbarActions;
  
  // Only show toolbar on resonant-chat pages
  const isResonantChatPage = location.pathname.includes('/resonant-chat');
  const showToolbar = isResonantChatPage && toolbarActions && toolbarActions.length > 0;
  
  if (variant === 'minimal') {
    return (
      <footer className="footer footer-minimal">
        <div className="page-wrapper">
          <div className="footer-bottom">
            <div className="footer-toolbar">
              {showToolbar && toolbarActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className="footer-toolbar-button"
                  onClick={action.onClick}
                >
                  <span className="footer-toolbar-icon">{action.icon}</span>
                  <span className="footer-toolbar-label">{action.label}</span>
                  <span className="footer-toolbar-detail">{action.detail}</span>
                </button>
              ))}
              <div className="footer-copyright-text">© 2025 ResonantGenesis. All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="page-wrapper">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="footer-title">Product</h4>
            <div className="footer-links">
              <a href="/help" onClick={(e) => { e.preventDefault(); goToHelp(navigate); }}>Documentation</a>
              <a href="/pricing" onClick={(e) => { e.preventDefault(); goToPricing(navigate); }}>Pricing</a>
              <a href="/help" onClick={(e) => { e.preventDefault(); goToHelp(navigate); }}>API Reference</a>
            </div>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <div className="footer-links">
              <a href="/about" onClick={(e) => { e.preventDefault(); goToAbout(navigate); }}>About</a>
              <a href="/community" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>Community Hub</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); goToContact(navigate); }}>Contact</a>
            </div>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <div className="footer-links">
              <a href="/public/legal/privacy" onClick={(e) => { e.preventDefault(); goToPrivacy(navigate); }}>Privacy</a>
              <a href="/public/legal/terms" onClick={(e) => { e.preventDefault(); goToTerms(navigate); }}>Terms</a>
              <a href="/public/legal/compliance" onClick={(e) => { e.preventDefault(); goToCompliance(navigate); }}>Compliance</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 ResonantGenesis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

