// ============== HOOKS INDEX ==============
// Export all custom hooks

// Performance hooks
export {
  useCachedRequest,
  useDebouncedValue,
  useThrottledCallback,
  useIntersectionObserver,
  useVirtualList,
  usePerformanceMetrics,
  useLazyInit,
  useOptimisticUpdate,
  useIdleCallback,
  clearRequestCache,
  clearExpiredCache,
} from './usePerformance';

// API hooks
export {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useOptimisticMutation,
  usePrefetch,
  usePolling,
} from './useAPI';

// WebSocket hook
export { useWebSocket } from '../utils/websocketManager';

// Component optimizer hooks
export {
  useStableCallback,
  usePrevious,
  useStableObject,
  useStableArray,
  useMemoizedSelector,
  useRenderTracker,
  useLazyRender,
  useVisibility,
  useBatchedState,
  useDebouncedState,
  useEffectDebugger,
} from '../utils/componentOptimizer';

// Autonomy hooks
export {
  useAutonomyStatus,
  useAgentNetwork,
  useAgentBrains,
  useAutonomousQueue,
  useWatchdog,
  useAutonomyControl,
} from './useAutonomy';

// Notifications hook
export { useNotifications } from './useNotifications';

// LLM Providers hook
export { useLLMProviders } from './useLLMProviders';

// Billing hook (default export)
export { default as useBilling } from './useBilling';

// Memory hook (default export)
export { default as useMemory } from './useMemory';
