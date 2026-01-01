import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ResonantChatMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  divider?: boolean;
  danger?: boolean;
}

interface ResonantChatMenuContextType {
  menuItems: ResonantChatMenuItem[];
  setMenuItems: (items: ResonantChatMenuItem[]) => void;
  addMenuItem: (item: ResonantChatMenuItem) => void;
  removeMenuItem: (id: string) => void;
  clearMenuItems: () => void;
}

const ResonantChatMenuContext = createContext<ResonantChatMenuContextType | undefined>(undefined);

export const ResonantChatMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<ResonantChatMenuItem[]>([]);

  const addMenuItem = useCallback((item: ResonantChatMenuItem) => {
    setMenuItems(prev => {
      // Check if item already exists
      if (prev.find(i => i.id === item.id)) {
        return prev.map(i => i.id === item.id ? item : i);
      }
      return [...prev, item];
    });
  }, []);

  const removeMenuItem = useCallback((id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearMenuItems = useCallback(() => {
    setMenuItems([]);
  }, []);

  return (
    <ResonantChatMenuContext.Provider
      value={{
        menuItems,
        setMenuItems,
        addMenuItem,
        removeMenuItem,
        clearMenuItems,
      }}
    >
      {children}
    </ResonantChatMenuContext.Provider>
  );
};

export const useResonantChatMenu = (): ResonantChatMenuContextType => {
  const context = useContext(ResonantChatMenuContext);
  if (!context) {
    // Return default empty state if not within provider (similar to ToolbarContext)
    return {
      menuItems: [],
      setMenuItems: () => {},
      addMenuItem: () => {},
      removeMenuItem: () => {},
      clearMenuItems: () => {},
    };
  }
  return context;
};

