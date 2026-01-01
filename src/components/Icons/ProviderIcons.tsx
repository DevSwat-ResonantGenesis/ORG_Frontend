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

