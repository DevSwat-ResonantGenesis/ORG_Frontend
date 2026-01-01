// SplitView Constants

export const DEFAULT_SPLIT_WIDTH = 50;
export const MIN_SPLIT_WIDTH = 20;
export const MAX_SPLIT_WIDTH = 80;

export const LANGUAGE_MAP: Record<string, string> = {
  'tsx': 'typescript',
  'ts': 'typescript',
  'jsx': 'javascript',
  'js': 'javascript',
  'py': 'python',
  'json': 'json',
  'md': 'markdown',
  'css': 'css',
  'html': 'html',
  'yml': 'yaml',
  'yaml': 'yaml',
  'xml': 'xml',
  'sh': 'shell',
  'bash': 'shell',
  'sql': 'sql',
  'go': 'go',
  'rs': 'rust',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'cs': 'csharp',
  'rb': 'ruby',
  'php': 'php',
  'swift': 'swift',
  'kt': 'kotlin',
};

export const FILE_TEMPLATES: Record<string, string> = {
  typescript: '// New TypeScript file\n\nexport {};\n',
  javascript: '// New JavaScript file\n\n',
  python: '# New Python file\n\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()\n',
  html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>New Page</title>\n</head>\n<body>\n  \n</body>\n</html>',
  css: '/* New CSS file */\n\n',
  json: '{\n  \n}\n',
  markdown: '# New Document\n\n',
};

export const FILE_ICONS: Record<string, string> = {
  folder: '📁',
  folderOpen: '📂',
  file: '📄',
  typescript: '🔷',
  javascript: '🟨',
  python: '🐍',
  html: '🌐',
  css: '🎨',
  json: '📋',
  markdown: '📝',
};

export const getFileIcon = (path: string, isFolder = false, isOpen = false): string => {
  if (isFolder) return isOpen ? FILE_ICONS.folderOpen : FILE_ICONS.folder;
  
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return FILE_ICONS.typescript;
    case 'js':
    case 'jsx':
      return FILE_ICONS.javascript;
    case 'py':
      return FILE_ICONS.python;
    case 'html':
      return FILE_ICONS.html;
    case 'css':
    case 'scss':
    case 'sass':
      return FILE_ICONS.css;
    case 'json':
      return FILE_ICONS.json;
    case 'md':
      return FILE_ICONS.markdown;
    default:
      return FILE_ICONS.file;
  }
};

export const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  return LANGUAGE_MAP[ext || ''] || 'plaintext';
};

export const getDefaultContent = (language: string): string => {
  return FILE_TEMPLATES[language] || '';
};
