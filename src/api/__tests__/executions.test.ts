/**
 * Executions API Tests
 */

import * as executionsApi from '../executions';

describe('Executions API', () => {
  describe('Type Definitions', () => {
    it('should have correct Execution interface', () => {
      const execution: executionsApi.Execution = {
        id: 'exec-1',
        agent_id: 'agent-1',
        status: 'completed',
        started_at: '2024-01-01T00:00:00Z',
        steps: [],
      };
      expect(execution).toBeDefined();
    });
  });

  describe('API Functions', () => {
    it('should export getExecutions function', () => {
      expect(typeof executionsApi.getExecutions).toBe('function');
    });

    it('should export getExecutionDetails function', () => {
      expect(typeof executionsApi.getExecutionDetails).toBe('function');
    });
  });

  describe('Helper Functions', () => {
    it('should format duration correctly', () => {
      expect(executionsApi.formatDuration(1000)).toBe('1.0s');
      expect(executionsApi.formatDuration(60000)).toBe('1.0m');
      expect(executionsApi.formatDuration(3600000)).toBe('1.0h');
    });

    it('should get status color', () => {
      expect(executionsApi.getStatusColor('completed')).toBe('#22c55e');
      expect(executionsApi.getStatusColor('failed')).toBe('#ef4444');
    });
  });
});
