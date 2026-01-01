// File Tree Management Hook

import { useCallback, useMemo } from 'react';
import type { ProjectFile, FileTreeNode } from '../types';

export const useFileTree = (projectFiles: ProjectFile[]) => {
  const buildFileTree = useCallback((): FileTreeNode[] => {
    const tree: Record<string, any> = {};
    
    projectFiles.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            path: parts.slice(0, index + 1).join('/'),
            name: part,
            type: index === parts.length - 1 ? 'file' : 'folder',
            children: index === parts.length - 1 ? undefined : {},
            file: index === parts.length - 1 ? file : undefined
          };
        }
        if (index < parts.length - 1) {
          current = current[part].children;
        }
      });
    });
    
    const convertToArray = (obj: Record<string, any>): FileTreeNode[] => {
      return Object.values(obj).map((item: any) => ({
        ...item,
        children: item.children ? convertToArray(item.children) : undefined
      })).sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    };
    
    return convertToArray(tree);
  }, [projectFiles]);

  const fileTree = useMemo(() => buildFileTree(), [buildFileTree]);

  return { fileTree };
};

export default useFileTree;
