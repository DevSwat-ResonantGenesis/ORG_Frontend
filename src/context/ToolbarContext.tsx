import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ToolbarAction {
  key: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface ToolbarContextType {
  toolbarActions: ToolbarAction[];
  setToolbarActions: (actions: ToolbarAction[]) => void;
}

const ToolbarContext = createContext<ToolbarContextType | undefined>(undefined);

export const ToolbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toolbarActions, setToolbarActions] = useState<ToolbarAction[]>([]);

  const updateToolbarActions = React.useCallback((actions: ToolbarAction[]) => {
    setToolbarActions(actions);
  }, []);

  return (
    <ToolbarContext.Provider value={{ toolbarActions, setToolbarActions: updateToolbarActions }}>
      {children}
    </ToolbarContext.Provider>
  );
};

export const useToolbar = () => {
  const context = useContext(ToolbarContext);
  if (!context) {
    // Return default empty state if not within provider
    return { toolbarActions: [], setToolbarActions: () => {} };
  }
  return context;
};

