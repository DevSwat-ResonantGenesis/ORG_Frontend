/**
 * Capabilities API Tests
 */

import * as capabilitiesApi from '../capabilities';

describe('Capabilities API', () => {
  describe('Type Definitions', () => {
    it('should have correct Capability interface', () => {
      const capability: capabilitiesApi.Capability = {
        id: 'cap-1',
        name: 'Test Capability',
        description: 'Test description',
        enabled: true,
        category: 'custom',
      };
      expect(capability).toBeDefined();
    });
  });

  describe('API Functions', () => {
    it('should export getCapabilities function', () => {
      expect(typeof capabilitiesApi.getCapabilities).toBe('function');
    });

    it('should export addCapability function', () => {
      expect(typeof capabilitiesApi.addCapability).toBe('function');
    });

    it('should export updateCapability function', () => {
      expect(typeof capabilitiesApi.updateCapability).toBe('function');
    });

    it('should export deleteCapability function', () => {
      expect(typeof capabilitiesApi.deleteCapability).toBe('function');
    });
  });

  describe('Helper Functions', () => {
    it('should format category correctly', () => {
      expect(capabilitiesApi.formatCategory('code')).toBe('Code Execution');
      expect(capabilitiesApi.formatCategory('custom')).toBe('custom');
    });

    it('should get category color', () => {
      expect(capabilitiesApi.getCategoryColor('code')).toBe('#3b82f6');
      expect(capabilitiesApi.getCategoryColor('unknown')).toBe('#6b7280');
    });
  });
});
