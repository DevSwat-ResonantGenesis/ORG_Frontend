import React from 'react';
import './ChatIcons.css';

// Additional functional icons for chat input and actions

export const ShareIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`chat-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 8C16.6569 8 18 6.65685 18 5C18 3.34315 16.6569 2 15 2C13.3431 2 12 3.34315 12 5C12 5.35064 12.0602 5.68722 12.1707 6M5 13C6.65685 13 8 11.6569 8 10C8 8.34315 6.65685 7 5 7C3.34315 7 2 8.34315 2 10C2 11.6569 3.34315 13 5 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M15 18C16.6569 18 18 16.6569 18 15C18 13.3431 16.6569 12 15 12C13.3431 12 12 13.3431 12 15C12 15.3506 12.0602 15.6872 12.1707 16M7.82929 4C7.93984 4.31278 8 4.64936 8 5C8 6.65685 6.65685 8 5 8C3.34315 8 2 6.65685 2 5C2 3.34315 3.34315 2 5 2C6.65685 2 8 3.34315 8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
  </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`chat-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3V13M10 3L6 7M10 3L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M3 16H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
  </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`chat-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17V7M10 7L6 11M10 7L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M3 4H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
  </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`chat-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.66 4.34L14.24 5.76M5.76 14.24L4.34 15.66M15.66 15.66L14.24 14.24M5.76 5.76L4.34 4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
  </svg>
);

export const MetricsIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`chat-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
    <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" className="icon-path"/>
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`chat-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
  </svg>
);

export const VoiceIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`chat-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2V10M10 10C11.6569 10 13 8.65685 13 7C13 5.34315 11.6569 4 10 4C8.34315 4 7 5.34315 7 7C7 8.65685 8.34315 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-path"/>
    <path d="M10 13V17M6 17H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
  </svg>
);

export const ClearIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`chat-icon ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3L17 17M17 3L3 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="icon-path"/>
  </svg>
);

