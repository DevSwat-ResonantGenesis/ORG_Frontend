import React, { createContext, useCallback, useContext, useState } from 'react';

type OrgContextValue = {
  org: string | null;
  changeOrg: (orgId: string) => void;
};

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export const OrgProvider = ({ children }: { children: React.ReactNode }) => {
  const [org, setOrg] = useState<string | null>(localStorage.getItem('rg_org_id'));

  const changeOrg = useCallback(
    (orgId: string) => {
      if (!orgId || orgId === org) return;
      setOrg(orgId);
      localStorage.setItem('rg_org_id', orgId);
      window.location.reload();
    },
    [org]
  );

  return <OrgContext.Provider value={{ org, changeOrg }}>{children}</OrgContext.Provider>;
};

export const useOrg = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within OrgProvider');
  return ctx;
};
