import React from 'react';

interface FileIconProps {
  fileName: string;
  className?: string;
}

/**
 * File icon component that returns appropriate icon based on file extension
 */
export const FileIcon: React.FC<FileIconProps> = ({ fileName, className = '' }) => {
  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    
    // Language/File type icons
    const iconMap: Record<string, React.ReactNode> = {
      // TypeScript/JavaScript
      'ts': <TypeScriptIcon />,
      'tsx': <TypeScriptIcon />,
      'js': <JavaScriptIcon />,
      'jsx': <JavaScriptIcon />,
      'mjs': <JavaScriptIcon />,
      'cjs': <JavaScriptIcon />,
      
      // Python
      'py': <PythonIcon />,
      'pyw': <PythonIcon />,
      
      // Java
      'java': <JavaIcon />,
      'class': <JavaIcon />,
      
      // C/C++
      'c': <CIcon />,
      'cpp': <CPPIcon />,
      'cc': <CPPIcon />,
      'cxx': <CPPIcon />,
      'h': <CIcon />,
      'hpp': <CPPIcon />,
      
      // Web
      'html': <HTMLIcon />,
      'htm': <HTMLIcon />,
      'css': <CSSIcon />,
      'scss': <CSSIcon />,
      'sass': <CSSIcon />,
      'less': <CSSIcon />,
      
      // JSON/Config
      'json': <JSONIcon />,
      'jsonc': <JSONIcon />,
      'yaml': <YAMLIcon />,
      'yml': <YAMLIcon />,
      'toml': <ConfigIcon />,
      'ini': <ConfigIcon />,
      'conf': <ConfigIcon />,
      
      // Markdown
      'md': <MarkdownIcon />,
      'markdown': <MarkdownIcon />,
      
      // Shell
      'sh': <ShellIcon />,
      'bash': <ShellIcon />,
      'zsh': <ShellIcon />,
      'fish': <ShellIcon />,
      
      // Rust
      'rs': <RustIcon />,
      
      // Go
      'go': <GoIcon />,
      
      // PHP
      'php': <PHPIcon />,
      
      // SQL
      'sql': <SQLIcon />,
      
      // XML
      'xml': <XMLIcon />,
      'svg': <SVGIcon />,
      
      // Images
      'png': <ImageIcon />,
      'jpg': <ImageIcon />,
      'jpeg': <ImageIcon />,
      'gif': <ImageIcon />,
      'webp': <ImageIcon />,
      
      // Other
      'txt': <TextIcon />,
      'log': <TextIcon />,
      'lock': <LockIcon />,
      'gitignore': <GitIcon />,
      'gitattributes': <GitIcon />,
    };
    
    return iconMap[ext] || <DefaultFileIcon />;
  };

  return (
    <span className={className}>
      {getFileIcon(fileName)}
    </span>
  );
};

// Icon components
const TypeScriptIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M6 6H10M6 10H12" strokeLinecap="round" />
  </svg>
);

const JavaScriptIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M6 6C6 8 8 8 8 10C8 12 6 12 6 12" strokeLinecap="round" />
    <path d="M10 6L10 12" strokeLinecap="round" />
  </svg>
);

const PythonIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6" cy="6" r="2" />
    <circle cx="10" cy="10" r="2" />
    <path d="M6 8V12C6 13 8 14 10 14" strokeLinecap="round" />
    <path d="M10 8V4C10 3 8 2 6 2" strokeLinecap="round" />
  </svg>
);

const JavaIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 2H12V14H4V2Z" />
    <path d="M6 6H10M6 8H10M6 10H8" strokeLinecap="round" />
  </svg>
);

const CIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M5 6C5 7 6 8 7 8C8 8 9 7 9 6" strokeLinecap="round" />
    <path d="M5 10C5 11 6 12 7 12C8 12 9 11 9 10" strokeLinecap="round" />
  </svg>
);

const CPPIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M5 6C5 7 6 8 7 8C8 8 9 7 9 6M5 10C5 11 6 12 7 12C8 12 9 11 9 10" strokeLinecap="round" />
    <path d="M11 6H13M11 10H13" strokeLinecap="round" />
  </svg>
);

const HTMLIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M4 4L6 6L4 8M12 4L10 6L12 8" strokeLinecap="round" />
  </svg>
);

const CSSIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M4 6H12M4 8H10M4 10H8" strokeLinecap="round" />
  </svg>
);

const JSONIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M5 6C5 7 6 8 7 8C8 8 9 7 9 6M5 10C5 11 6 12 7 12C8 12 9 11 9 10" strokeLinecap="round" />
  </svg>
);

const YAMLIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M4 6L6 8L4 10M8 6L10 8L8 10M12 6L14 8L12 10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ConfigIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="5" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const MarkdownIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M4 6H6L5 8L6 10H4M8 6H12M8 10H10" strokeLinecap="round" />
  </svg>
);

const ShellIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 4L6 8L2 12M8 6H14M8 10H12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RustIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M5 6C6 5 8 5 9 6C10 7 10 9 9 10C8 11 6 11 5 10" strokeLinecap="round" />
  </svg>
);

const GoIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="5" />
    <path d="M8 3L10 8L8 13L6 8Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PHPIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M4 6C4 7 5 8 6 8C7 8 8 7 8 6M4 10C4 11 5 12 6 12C7 12 8 11 8 10" strokeLinecap="round" />
  </svg>
);

const SQLIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M4 6H12M4 8H10M4 10H8" strokeLinecap="round" />
  </svg>
);

const XMLIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M4 4L6 6L4 8M12 4L10 6L12 8M8 4L8 8" strokeLinecap="round" />
  </svg>
);

const SVGIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M4 4L8 8L4 12M12 4L8 8L12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ImageIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <circle cx="6" cy="6" r="1.5" />
    <path d="M2 12L5 9L8 12L14 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TextIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 2H14V14H2V2Z" />
    <path d="M4 6H12M4 8H10M4 10H8" strokeLinecap="round" />
  </svg>
);

const LockIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 6V4C4 2.89543 4.89543 2 6 2H10C11.1046 2 12 2.89543 12 4V6M4 6H2V14H14V6H12M4 6H12" />
    <circle cx="8" cy="10" r="1" />
  </svg>
);

const GitIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="4" r="2" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M8 6V10M4 10L12 14" strokeLinecap="round" />
  </svg>
);

const DefaultFileIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 2C4 1.44772 4.44772 1 5 1H9.58579C9.851 1 10.1054 1.10536 10.2929 1.29289L13.7071 4.70711C13.8946 4.89464 14 5.149 14 5.41421V13C14 13.5523 13.5523 14 13 14H5C4.44772 14 4 13.5523 4 13V2Z" />
  </svg>
);

