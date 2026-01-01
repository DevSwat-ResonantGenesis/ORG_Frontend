import React, { createContext, useContext, useState } from 'react';

type BillingContextValue = {
  refreshToken: number;
  triggerRefresh: () => void;
};

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export const BillingProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshToken, setRefreshToken] = useState(0);

  const triggerRefresh = () => setRefreshToken((token) => token + 1);

  return <BillingContext.Provider value={{ refreshToken, triggerRefresh }}>{children}</BillingContext.Provider>;
};

export const useBillingContext = () => {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBillingContext must be used within BillingProvider');
  return ctx;
};
