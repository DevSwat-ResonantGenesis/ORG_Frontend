import React from 'react';

// Custom animated minimal icons for Resonant Chat
// Black/white based on theme, no emojis, minimal design

export const CheckIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M3 8L6 11L13 4" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{
        strokeDasharray: 20,
        strokeDashoffset: 20,
        animation: 'drawCheck 0.6s ease-out forwards'
      }}
    />
    <style>{`
      @keyframes drawCheck {
        to { stroke-dashoffset: 0; }
      }
    `}</style>
  </svg>
);

export const WarningIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M8 2L14 13H2L8 2Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ animation: 'pulseWarning 2s ease-in-out infinite' }}
    />
    <path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11" r="0.5" fill="currentColor" />
    <style>{`
      @keyframes pulseWarning {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `}</style>
  </svg>
);

export const MemoryIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 37.7, strokeDashoffset: 37.7, animation: 'drawCircle 1s ease-out forwards' }} />
    <circle cx="6" cy="6" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.5s ease-out 0.3s forwards', opacity: 0 }} />
    <circle cx="10" cy="6" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.5s ease-out 0.4s forwards', opacity: 0 }} />
    <circle cx="8" cy="10" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.5s ease-out 0.5s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawCircle { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const TargetIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'drawCircle 0.8s ease-out forwards' }} />
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 18.85, strokeDashoffset: 18.85, animation: 'drawCircle 0.8s ease-out 0.2s forwards' }} />
    <circle cx="8" cy="8" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.6s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawCircle { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const AnalyticsIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12L5 9L8 11L14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'drawLine 1s ease-out forwards' }} />
    <circle cx="2" cy="12" r="1.5" fill="currentColor" style={{ animation: 'scaleIn 0.3s ease-out 0.2s forwards', transform: 'scale(0)' }} />
    <circle cx="5" cy="9" r="1.5" fill="currentColor" style={{ animation: 'scaleIn 0.3s ease-out 0.4s forwards', transform: 'scale(0)' }} />
    <circle cx="8" cy="11" r="1.5" fill="currentColor" style={{ animation: 'scaleIn 0.3s ease-out 0.6s forwards', transform: 'scale(0)' }} />
    <circle cx="14" cy="5" r="1.5" fill="currentColor" style={{ animation: 'scaleIn 0.3s ease-out 0.8s forwards', transform: 'scale(0)' }} />
    <style>{`
      @keyframes drawLine { to { stroke-dashoffset: 0; } }
      @keyframes scaleIn { to { transform: scale(1); } }
    `}</style>
  </svg>
);

export const ConversationIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H13C13.55 3 14 3.45 14 4V10C14 10.55 13.55 11 13 11H6L3 14V4C3 3.45 3.45 3 4 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawChat 0.8s ease-out forwards' }} />
    <circle cx="6" cy="7" r="0.5" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.6s forwards', opacity: 0 }} />
    <circle cx="8" cy="7" r="0.5" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.7s forwards', opacity: 0 }} />
    <circle cx="10" cy="7" r="0.5" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.8s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawChat { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const LockIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="7" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'drawRect 0.5s ease-out forwards' }} />
    <path d="M5 7V5C5 3.9 5.9 3 7 3H9C10.1 3 11 3.9 11 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: 'drawPath 0.5s ease-out 0.3s forwards' }} />
    <circle cx="8" cy="10" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.6s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawRect { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      @keyframes drawPath { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const StorageIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'drawRect 0.6s ease-out forwards' }} />
    <path d="M5 5V3C5 2.45 5.45 2 6 2H10C10.55 2 11 2.45 11 3V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 10, strokeDashoffset: 10, animation: 'drawPath 0.4s ease-out 0.3s forwards' }} />
    <path d="M6 8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ animation: 'fadeIn 0.3s ease-out 0.6s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawRect { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes drawPath { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const RocketIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L10 6L14 8L10 10L8 14L6 10L2 8L6 6L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 32, strokeDashoffset: 32, animation: 'drawRocket 0.8s ease-out forwards' }} />
    <circle cx="8" cy="8" r="2" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.6s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawRocket { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3V13M10 3L6 7M10 3L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'drawUpload 0.6s ease-out forwards' }} />
    <path d="M3 16H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ animation: 'fadeIn 0.3s ease-out 0.4s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawUpload { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawCopy 0.6s ease-out forwards' }} />
    <path d="M4 4H12V12H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 16, strokeDashoffset: 16, animation: 'drawCopy 0.6s ease-out 0.2s forwards', opacity: 0.5 }} />
    <style>{`
      @keyframes drawCopy { to { stroke-dashoffset: 0; opacity: 1; } }
    `}</style>
  </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'fadeIn 0.3s ease-out forwards', opacity: 0 }} />
    <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.66 4.34L14.24 5.76M5.76 14.24L4.34 15.66M15.66 15.66L14.24 14.24M5.76 5.76L4.34 4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'drawSettings 1s ease-out forwards' }} />
    <style>{`
      @keyframes drawSettings { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawSend 0.6s ease-out forwards' }} />
    <style>{`
      @keyframes drawSend { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const FileIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 2H12L17 7V18C17 18.55 16.55 19 16 19H4C3.45 19 3 18.55 3 18V3C3 2.45 3.45 2 4 2H5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawFile 0.6s ease-out forwards' }} />
    <path d="M12 2V7H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'fadeIn 0.3s ease-out 0.4s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawFile { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const ImageIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'drawImage 0.6s ease-out forwards' }} />
    <circle cx="7" cy="8" r="1.5" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.4s forwards', opacity: 0 }} />
    <path d="M3 14L7 10L11 14L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'drawImage 0.6s ease-out 0.3s forwards' }} />
    <style>{`
      @keyframes drawImage { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'drawPlus 0.5s ease-out forwards' }} />
    <style>{`
      @keyframes drawPlus { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 37.7, strokeDashoffset: 37.7, animation: 'drawCircle 0.6s ease-out forwards' }} />
    <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 8, strokeDashoffset: 8, animation: 'drawLine 0.4s ease-out 0.4s forwards' }} />
    <style>{`
      @keyframes drawCircle { to { stroke-dashoffset: 0; } }
      @keyframes drawLine { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3L17 17M17 3L3 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: 'drawClose 0.4s ease-out forwards' }} />
    <style>{`
      @keyframes drawClose { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

// Provider Icons
export const AutoIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 37.7, strokeDashoffset: 37.7, animation: 'drawCircle 0.8s ease-out forwards' }} />
    <path d="M8 4L10 7L13 8L10 9L8 12L6 9L3 8L6 7L8 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'drawStar 0.6s ease-out 0.3s forwards' }} />
    <style>{`
      @keyframes drawCircle { to { stroke-dashoffset: 0; } }
      @keyframes drawStar { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const ChatGPTIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2C4.7 2 2 4.7 2 8C2 11.3 4.7 14 8 14C11.3 14 14 11.3 14 8C14 4.7 11.3 2 8 2Z" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawCircle 0.8s ease-out forwards' }} />
    <path d="M6 6H10M6 8H10M6 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: 'drawLines 0.6s ease-out 0.4s forwards' }} />
    <style>{`
      @keyframes drawCircle { to { stroke-dashoffset: 0; } }
      @keyframes drawLines { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const ClaudeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L12 6L8 10L4 6L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'drawDiamond 0.6s ease-out forwards' }} />
    <circle cx="8" cy="8" r="2" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.4s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawDiamond { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const GeminiIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L10 6L14 8L10 10L8 14L6 10L2 8L6 6L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 32, strokeDashoffset: 32, animation: 'drawGemini 0.8s ease-out forwards' }} />
    <path d="M8 6L10 8L8 10L6 8L8 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 8, strokeDashoffset: 8, animation: 'drawInner 0.4s ease-out 0.5s forwards' }} />
    <style>{`
      @keyframes drawGemini { to { stroke-dashoffset: 0; } }
      @keyframes drawInner { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const MistralIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L8 3L13 8L8 13L3 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: 'drawMistral 0.6s ease-out forwards' }} />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.4s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawMistral { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const CohereIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2C5.2 2 3 4.2 3 7C3 9.8 5.2 12 8 12C10.8 12 13 9.8 13 7C13 4.2 10.8 2 8 2Z" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 35, strokeDashoffset: 35, animation: 'drawCohere 0.8s ease-out forwards' }} />
    <path d="M5 7L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 10, strokeDashoffset: 10, animation: 'drawCheck 0.4s ease-out 0.5s forwards' }} />
    <style>{`
      @keyframes drawCohere { to { stroke-dashoffset: 0; } }
      @keyframes drawCheck { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const GroqIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawGroq 0.6s ease-out forwards' }} />
    <path d="M6 6H10M6 8H10M6 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: 'drawLines 0.4s ease-out 0.4s forwards' }} />
    <style>{`
      @keyframes drawGroq { to { stroke-dashoffset: 0; } }
      @keyframes drawLines { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

// Action Icons
export const RegenerateIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 3V6H10M3 13V10H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: 'drawArrows 0.6s ease-out forwards' }} />
    <path d="M2 8C2 5.2 4.2 3 7 3L13 3M14 8C14 10.8 11.8 13 9 13L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawArcs 0.8s ease-out 0.2s forwards' }} />
    <style>{`
      @keyframes drawArrows { to { stroke-dashoffset: 0; } }
      @keyframes drawArcs { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const DeleteIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4H13M5 4V3C5 2.45 5.45 2 6 2H10C10.55 2 11 2.45 11 3V4M6 7V11M10 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawDelete 0.6s ease-out forwards' }} />
    <path d="M4 4L5 13C5 13.55 5.45 14 6 14H10C10.55 14 11 13.55 11 13L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 16, strokeDashoffset: 16, animation: 'drawBin 0.4s ease-out 0.3s forwards' }} />
    <style>{`
      @keyframes drawDelete { to { stroke-dashoffset: 0; } }
      @keyframes drawBin { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 2L14 5L8 11H5V8L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'drawEdit 0.6s ease-out forwards' }} />
    <path d="M9 4L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 6, strokeDashoffset: 6, animation: 'drawLine 0.3s ease-out 0.4s forwards' }} />
    <style>{`
      @keyframes drawEdit { to { stroke-dashoffset: 0; } }
      @keyframes drawLine { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const PinIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L9 6L13 7L9 8L8 12L7 8L3 7L7 6L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: 'drawPin 0.6s ease-out forwards' }} />
    <circle cx="8" cy="7" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.4s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawPin { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 12.57, strokeDashoffset: 12.57, animation: 'drawCircle 0.4s ease-out forwards' }} />
    <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 12.57, strokeDashoffset: 12.57, animation: 'drawCircle 0.4s ease-out 0.2s forwards' }} />
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 12.57, strokeDashoffset: 12.57, animation: 'drawCircle 0.4s ease-out 0.4s forwards' }} />
    <path d="M6 8L10 5M6 8L10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 10, strokeDashoffset: 10, animation: 'drawLines 0.4s ease-out 0.5s forwards' }} />
    <style>{`
      @keyframes drawCircle { to { stroke-dashoffset: 0; } }
      @keyframes drawLines { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3V11M8 11L5 8M8 11L11 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 16, strokeDashoffset: 16, animation: 'drawDownload 0.6s ease-out forwards' }} />
    <path d="M3 13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 10, strokeDashoffset: 10, animation: 'drawLine 0.3s ease-out 0.4s forwards' }} />
    <style>{`
      @keyframes drawDownload { to { stroke-dashoffset: 0; } }
      @keyframes drawLine { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const ArchiveIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4H13M3 4V13C3 13.55 3.45 14 4 14H12C12.55 14 13 13.55 13 13V4M3 4L4 2H12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawArchive 0.6s ease-out forwards' }} />
    <path d="M6 8H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 4, strokeDashoffset: 4, animation: 'drawLine 0.2s ease-out 0.4s forwards' }} />
    <style>{`
      @keyframes drawArchive { to { stroke-dashoffset: 0; } }
      @keyframes drawLine { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 10, strokeDashoffset: 10, animation: 'drawChevron 0.3s ease-out forwards' }} />
    <style>{`
      @keyframes drawChevron { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'drawArrow 0.4s ease-out forwards' }} />
    <style>{`
      @keyframes drawArrow { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const UnreadIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="4" r="4" fill="currentColor" style={{ animation: 'pulseUnread 2s ease-in-out infinite' }} />
    <style>{`
      @keyframes pulseUnread {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(0.9); }
      }
    `}</style>
  </svg>
);

// Quick Start Prompt Icons - Animated Special Icons
export const LightbulbIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V4M12 20V22M4 12H2M22 12H20M5.64 5.64L4.22 4.22M19.78 19.78L18.36 18.36M5.64 18.36L4.22 19.78M19.78 4.22L18.36 5.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawLightbulb 1s ease-out forwards' }} />
    <path d="M12 6C9.79 6 8 7.79 8 10C8 11.5 8.5 12.8 9.3 13.7L10 14.5V17H14V14.5L14.7 13.7C15.5 12.8 16 11.5 16 10C16 7.79 14.21 6 12 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawBulb 0.8s ease-out 0.3s forwards' }} />
    <circle cx="12" cy="10" r="1" fill="currentColor" style={{ animation: 'glow 2s ease-in-out infinite', opacity: 0 }} />
    <style>{`
      @keyframes drawLightbulb { to { stroke-dashoffset: 0; } }
      @keyframes drawBulb { to { stroke-dashoffset: 0; } }
      @keyframes glow {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `}</style>
  </svg>
);

export const PenIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3L21 7L11 17H7V13L17 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: 'drawPen 0.8s ease-out forwards' }} />
    <path d="M15 5L19 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 8, strokeDashoffset: 8, animation: 'drawLine 0.4s ease-out 0.5s forwards' }} />
    <circle cx="7" cy="17" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.7s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawPen { to { stroke-dashoffset: 0; } }
      @keyframes drawLine { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const ClipboardIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5H7C5.9 5 5 5.9 5 7V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V7C19 5.9 18.1 5 17 5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawClipboard 0.8s ease-out forwards' }} />
    <path d="M9 3C9 2.45 9.45 2 10 2H14C14.55 2 15 2.45 15 3V5H9V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 16, strokeDashoffset: 16, animation: 'drawClip 0.4s ease-out 0.4s forwards' }} />
    <path d="M9 9H15M9 12H15M9 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: 'drawLines 0.6s ease-out 0.6s forwards' }} />
    <style>{`
      @keyframes drawClipboard { to { stroke-dashoffset: 0; } }
      @keyframes drawClip { to { stroke-dashoffset: 0; } }
      @keyframes drawLines { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export const SearchMagnifyIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 44, strokeDashoffset: 44, animation: 'drawCircle 0.8s ease-out forwards' }} />
    <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 8, strokeDashoffset: 8, animation: 'drawLine 0.4s ease-out 0.6s forwards' }} />
    <circle cx="11" cy="11" r="2" fill="currentColor" style={{ animation: 'pulse 2s ease-in-out infinite', opacity: 0 }} />
    <style>{`
      @keyframes drawCircle { to { stroke-dashoffset: 0; } }
      @keyframes drawLine { to { stroke-dashoffset: 0; } }
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
      }
    `}</style>
  </svg>
);

export const GlobeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 56.5, strokeDashoffset: 56.5, animation: 'drawGlobe 1s ease-out forwards' }} />
    <path d="M3 12H21M12 3C15.3 5.4 17 8.5 17 12C17 15.5 15.3 18.6 12 21M12 3C8.7 5.4 7 8.5 7 12C7 15.5 8.7 18.6 12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawMeridians 0.8s ease-out 0.3s forwards' }} />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" style={{ animation: 'rotate 3s linear infinite', transformOrigin: '12px 12px' }} />
    <style>{`
      @keyframes drawGlobe { to { stroke-dashoffset: 0; } }
      @keyframes drawMeridians { to { stroke-dashoffset: 0; } }
      @keyframes rotate {
        from { transform: rotate(0deg) translateX(8px) rotate(0deg); }
        to { transform: rotate(360deg) translateX(8px) rotate(-360deg); }
      }
    `}</style>
  </svg>
);

export const BugIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" style={{ strokeDasharray: 37.7, strokeDashoffset: 37.7, animation: 'drawCircle 0.8s ease-out forwards' }} />
    <path d="M12 6V2M12 22V18M6 12H2M22 12H18M8.93 8.93L6.34 6.34M17.66 17.66L15.07 15.07M8.93 15.07L6.34 17.66M17.66 6.34L15.07 8.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: 'drawAntenna 0.6s ease-out 0.3s forwards' }} />
    <circle cx="10" cy="10" r="1" fill="currentColor" style={{ animation: 'blink 2s ease-in-out infinite', opacity: 0 }} />
    <circle cx="14" cy="10" r="1" fill="currentColor" style={{ animation: 'blink 2s ease-in-out infinite 0.1s', opacity: 0 }} />
    <path d="M9 14C9 15.1 10.34 16 12 16C13.66 16 15 15.1 15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: 8, strokeDashoffset: 8, animation: 'drawMouth 0.4s ease-out 0.7s forwards' }} />
    <style>{`
      @keyframes drawCircle { to { stroke-dashoffset: 0; } }
      @keyframes drawAntenna { to { stroke-dashoffset: 0; } }
      @keyframes drawMouth { to { stroke-dashoffset: 0; } }
      @keyframes blink {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.3; }
      }
    `}</style>
  </svg>
);

export const ChatIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'drawChat 0.8s ease-out forwards' }} />
    <circle cx="9" cy="11.5" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.6s forwards', opacity: 0 }} />
    <circle cx="12" cy="11.5" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.7s forwards', opacity: 0 }} />
    <circle cx="15" cy="11.5" r="1" fill="currentColor" style={{ animation: 'fadeIn 0.3s ease-out 0.8s forwards', opacity: 0 }} />
    <style>{`
      @keyframes drawChat { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { to { opacity: 1; } }
    `}</style>
  </svg>
);

export const MinimizeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Split View Tab Icons
export const CodeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 4L1 8L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 4L15 8L11 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 2L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const PreviewIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1 8C1 8 4 3 8 3C12 3 15 8 15 8C15 8 12 13 8 13C4 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TerminalIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 6L6 8L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 10H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3L13 8L4 13V3Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LoadingIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="7" strokeLinecap="round" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

export const MaximizeIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H12V12H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
  </svg>
);

export const BuildIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H7V7H3V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 3H13V7H9V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 9H7V13H3V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 9H13V13H9V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C10.0711 2.5 11.8816 3.60879 12.8284 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.5 5.25H13V2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HtmlFileIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2H9L12 5V14H4V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 2V5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 9L8 11L10 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CssFileIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2H9L12 5V14H4V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 2V5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const JsFileIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2H9L12 5V14H4V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 2V5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 8V11C7 11.5 6.5 12 6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 8C9.5 8 10 8.5 10 9C10 9.5 9.5 10 9 10C9.5 10 10 10.5 10 11C10 11.5 9.5 12 9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const JsonFileIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2H9L12 5V14H4V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 2V5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 9H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 11H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const PythonFileIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2H9L12 5V14H4V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 2V5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 8C6 8 6 10 8 10C10 10 10 8 10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 12C6 12 6 10 8 10C10 10 10 12 10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const DefaultFileIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2H9L12 5V14H4V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 2V5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

