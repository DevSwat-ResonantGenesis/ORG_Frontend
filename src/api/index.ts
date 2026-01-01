export * from './predictions';
export * from './anchors';
// Note: settings.ts also exports Anchor interface - we don't export settings.ts from index to avoid conflict
// If you need settings exports, import directly from './settings'
export * from './evidence';
export * from './policies';
export * from './compliance';
export * from './audit';
// settings.ts NOT exported here - it conflicts with anchors.ts Anchor interface
// Import directly: import { ... } from '@/api/settings'
export * from './auth';
export * from './mfa';
export * from './metrics';
export * from './ml';
export * from './org';
// billing.ts exports - avoid conflicts with stripe.ts
export { 
  fetchBillingOverview,
  getSubscription,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  changePlan,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getCredits,
  purchaseCredits,
  getCreditTransactions,
  getUsageSummary,
  getUsageHistory,
  getInvoices,
  getInvoice,
  downloadInvoice,
  createPortalSession,
  formatTokens,
  type Subscription,
  type CreditBalance,
  type CreditTransaction,
  type UsageSummary,
  type Invoice,
} from './billing';
// stripe.ts - import directly to avoid duplicate exports
// export * from './stripe';
export * from './finance';
export * from './admin';
export * from './aiReview';
export * from './agentTeams';
// Only export agentEngine to avoid conflicts with agents.ts
export * from './agentEngine';
// New service APIs - import directly to avoid naming conflicts
// import agentEngine from '@/api/agentEngine';
// import crypto from '@/api/crypto';
// import blockchain from '@/api/blockchain';

// Full Autonomy System API
export * from './autonomy';

// Advanced Blockchain API (Smart Contracts, ZK Proofs, Sharding, Cross-Chain)
export * from './advancedBlockchain';

// Complete service APIs - import directly for full functionality
// import billingAPI from '@/api/billingComplete';
// import memoryAPI from '@/api/memoryComplete';
// import ideAPI from '@/api/ideComplete';
// import marketplaceAPI from '@/api/marketplaceComplete';

// New Service APIs (Priority 1-2 gap closure)
// Exclude healthCheck from these exports to avoid conflicts
export { 
  createWorkflow, getWorkflow, updateWorkflow, deleteWorkflow,
  executeWorkflow, type Workflow, type WorkflowExecution
} from './workflow';
export { 
  uploadFile, downloadFile, deleteFile, listFiles
} from './storage';
export { 
  getNotification, markAsRead, markAllAsRead, deleteNotification,
  type NotificationPreferences
} from './notifications';
export { 
  analyzeText, summarizeText, classifyText
} from './cognitive';
export { 
  chat, getModel, getProvider
} from './llm';

// Economic State API - SINGLE SOURCE OF TRUTH for user economic state
export * from './economicState';
