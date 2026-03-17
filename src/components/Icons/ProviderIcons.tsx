import React from 'react';
import './ProviderIcons.css';

// Custom animated provider icons - visible in dark and light mode

export const AutoIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon auto-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <path d="M10 4V10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <circle cx="10" cy="10" r="1.5" fill="currentColor" className="icon-dot"/>
    <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" className="icon-path"/>
  </svg>
);

export const ChatGPTIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon chatgpt-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2C5.582 2 2 5.582 2 10C2 14.418 5.582 18 10 18C14.418 18 18 14.418 18 10C18 5.582 14.418 2 10 2Z" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <path d="M7 8C7 8 8.5 7 10 7C11.5 7 13 8 13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <path d="M7 12C7 12 8.5 11 10 11C11.5 11 13 12 13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <circle cx="7" cy="8" r="0.5" fill="currentColor" className="icon-dot"/>
    <circle cx="13" cy="8" r="0.5" fill="currentColor" className="icon-dot"/>
    <circle cx="7" cy="12" r="0.5" fill="currentColor" className="icon-dot"/>
    <circle cx="13" cy="12" r="0.5" fill="currentColor" className="icon-dot"/>
  </svg>
);

export const GeminiIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon gemini-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M3 7L10 12L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M10 12V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <circle cx="10" cy="10" r="1" fill="currentColor" className="icon-dot"/>
  </svg>
);

export const ClaudeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon claude-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3C6.134 3 3 6.134 3 10C3 13.866 6.134 17 10 17C13.866 17 17 13.866 17 10C17 6.134 13.866 3 10 3Z" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <path d="M7 8C7 8 8.5 7 10 7C11.5 7 13 8 13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <path d="M7 12C7 12 8.5 11 10 11C11.5 11 13 12 13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <path d="M10 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
  </svg>
);

export const MistralIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon mistral-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L3 7V13L10 18L17 13V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M6 10L10 6L14 10L10 14L6 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <circle cx="10" cy="10" r="1" fill="currentColor" className="icon-dot"/>
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon chevron-icon ${className}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
  </svg>
);

export const CheckmarkIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon checkmark-icon ${className}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
  </svg>
);

export const SmartIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon smart-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1" className="icon-path" opacity="0.6"/>
  </svg>
);

export const LocalIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon local-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <path d="M7 17H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <path d="M10 14V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <circle cx="10" cy="9" r="1" fill="currentColor" className="icon-dot"/>
  </svg>
);

export const CodeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon code-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 6L3 10L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M13 6L17 10L13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M11 4L9 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path" opacity="0.6"/>
  </svg>
);

export const KeyIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon key-icon ${className}`} width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <path d="M7.5 9L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <path d="M12 9V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <path d="M14 9V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
  </svg>
);

export const CreditIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon credit-icon ${className}`} width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <path d="M10 6.5C10 6.5 9.3 5.5 8 5.5C6.5 5.5 6 6.5 6 7C6 8 7 8.5 8 8.5C9 8.5 10 9 10 10C10 10.5 9.5 11.5 8 11.5C6.7 11.5 6 10.5 6 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="icon-path"/>
    <path d="M8 4.5V5.5M8 11.5V12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="icon-path"/>
  </svg>
);

export const GroqIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`provider-icon groq-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10L10 4L16 10L10 16L4 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M7 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
    <path d="M10 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
  </svg>
);

