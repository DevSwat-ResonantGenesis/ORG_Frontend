import React from 'react';

// Minimal, stylish icons that work in both dark and light mode
// Using currentColor so they inherit text color from parent

export const CopyIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.5 4.5V2.5C5.5 1.95 5.95 1.5 6.5 1.5H11.5C12.05 1.5 12.5 1.95 12.5 2.5V7.5C12.5 8.05 12.05 8.5 11.5 8.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 5.5H3.5C2.95 5.5 2.5 5.95 2.5 6.5V13.5C2.5 14.05 2.95 14.5 3.5 14.5H10.5C11.05 14.5 11.5 14.05 11.5 13.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LinkIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 9.5L9.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 6.5H11.5C12.05 6.5 12.5 6.95 12.5 7.5V11.5C12.5 12.05 12.05 12.5 11.5 12.5H7.5C6.95 12.5 6.5 12.05 6.5 11.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 4.5H8.5C9.05 4.5 9.5 4.95 9.5 5.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 2.5H9.5L12.5 5.5V13.5C12.5 14.05 12.05 14.5 11.5 14.5H4.5C3.95 14.5 3.5 14.05 3.5 13.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 2.5V5.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 8.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 9.5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 8C2.5 10.5 4.5 12.5 7 12.5C8.5 12.5 9.8 11.8 10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 8C13.5 5.5 11.5 3.5 9 3.5C7.5 3.5 6.2 4.2 5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 10.5L12.5 12.5L10.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 5.5L3.5 3.5L5.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const GraphIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
    <path d="M5.5 11.5L7.5 8.5L10.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AttachIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5 4.5L5.5 9.5C4.95 10.05 4.95 10.95 5.5 11.5C6.05 12.05 6.95 12.05 7.5 11.5L13.5 5.5C14.6 4.4 14.6 2.6 13.5 1.5C12.4 0.4 10.6 0.4 9.5 1.5L3.5 7.5C1.8 9.2 1.8 11.8 3.5 13.5C5.2 15.2 7.8 15.2 9.5 13.5L14.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BrainIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2.5C7.5 6.5 5.5 8 5.5C5.5 8 6.5 10.5 8 10.5C9.5 10.5 10.5 8 8 5.5C10.5 6.5 12.5 7 8 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M6 8C6 9 6.5 9.5 7.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M10 8C10 9 9.5 9.5 8.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// File type icons
export const ImageIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="5" cy="5" r="1" fill="currentColor"/>
    <path d="M2 10L4 8L6 10L9 7L12 10V11C12 11.5 11.5 12 11 12H3C2.5 12 2 11.5 2 11V10Z" fill="currentColor"/>
  </svg>
);

export const MusicIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.5 11C6.5 11 7.5 10 7.5 9V4L11.5 2.5V7.5C12.5 7.5 13.5 6.5 13.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.5" cy="11" r="1.5" fill="currentColor"/>
    <circle cx="11.5" cy="5.5" r="1.5" fill="currentColor"/>
  </svg>
);

export const CodeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4L2 7L4 10M10 4L12 7L10 10M8.5 2L5.5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FileIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 1.5H8.5L11.5 4.5V12.5C11.5 13 11 13.5 10.5 13.5H3.5C3 13.5 2.5 13 2.5 12.5V2.5C2.5 2 3 1.5 3.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 1.5V4.5H11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

