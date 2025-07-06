import { ValidationUtils } from '../../src/utils/validation';

describe('ValidationUtils', () => {
  describe('validateToolList', () => {
    it('should return true for valid tool list', () => {
      const validTools = ['Read', 'Write', 'Edit'];
      expect(ValidationUtils.validateToolList(validTools)).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(ValidationUtils.validateToolList([])).toBe(true);
    });

    it('should return true for all valid tools', () => {
      const allValidTools = [
        'Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Glob', 'Grep', 
        'LS', 'WebFetch', 'WebSearch', 'TodoRead', 'TodoWrite', 'Task'
      ];
      expect(ValidationUtils.validateToolList(allValidTools)).toBe(true);
    });

    it('should return false for invalid tool names', () => {
      const invalidTools = ['Read', 'InvalidTool', 'Write'];
      expect(ValidationUtils.validateToolList(invalidTools)).toBe(false);
    });

    it('should return false for non-array input', () => {
      expect(ValidationUtils.validateToolList('Read' as any)).toBe(false);
      expect(ValidationUtils.validateToolList(null as any)).toBe(false);
      expect(ValidationUtils.validateToolList(undefined as any)).toBe(false);
      expect(ValidationUtils.validateToolList({} as any)).toBe(false);
    });

    it('should return false for array with non-string elements', () => {
      const mixedArray = ['Read', 123, 'Write'] as any;
      expect(ValidationUtils.validateToolList(mixedArray)).toBe(false);
    });

    it('should return false for empty string elements', () => {
      const emptyStringArray = ['Read', '', 'Write'];
      expect(ValidationUtils.validateToolList(emptyStringArray)).toBe(false);
    });

    it('should return false for whitespace-only elements', () => {
      const whitespaceArray = ['Read', '   ', 'Write'];
      expect(ValidationUtils.validateToolList(whitespaceArray)).toBe(false);
    });
  });

  describe('validateMaxTurns', () => {
    it('should return true for valid positive integers', () => {
      expect(ValidationUtils.validateMaxTurns(1)).toBe(true);
      expect(ValidationUtils.validateMaxTurns(10)).toBe(true);
      expect(ValidationUtils.validateMaxTurns(100)).toBe(true);
    });

    it('should return false for zero', () => {
      expect(ValidationUtils.validateMaxTurns(0)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(ValidationUtils.validateMaxTurns(-1)).toBe(false);
      expect(ValidationUtils.validateMaxTurns(-10)).toBe(false);
    });

    it('should return false for non-integer numbers', () => {
      expect(ValidationUtils.validateMaxTurns(1.5)).toBe(false);
      expect(ValidationUtils.validateMaxTurns(10.99)).toBe(false);
    });

    it('should return false for numbers above 100', () => {
      expect(ValidationUtils.validateMaxTurns(101)).toBe(false);
      expect(ValidationUtils.validateMaxTurns(1000)).toBe(false);
    });

    it('should return false for non-number input', () => {
      expect(ValidationUtils.validateMaxTurns('10' as any)).toBe(false);
      expect(ValidationUtils.validateMaxTurns(null as any)).toBe(false);
      expect(ValidationUtils.validateMaxTurns(undefined as any)).toBe(false);
      expect(ValidationUtils.validateMaxTurns({} as any)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(ValidationUtils.validateMaxTurns(NaN)).toBe(false);
    });

    it('should return false for Infinity', () => {
      expect(ValidationUtils.validateMaxTurns(Infinity)).toBe(false);
      expect(ValidationUtils.validateMaxTurns(-Infinity)).toBe(false);
    });
  });

  describe('validateSessionId', () => {
    it('should return true for valid session IDs', () => {
      expect(ValidationUtils.validateSessionId('session123')).toBe(true);
      expect(ValidationUtils.validateSessionId('session_123')).toBe(true);
      expect(ValidationUtils.validateSessionId('session-123')).toBe(true);
      expect(ValidationUtils.validateSessionId('SESSION123')).toBe(true);
      expect(ValidationUtils.validateSessionId('a1b2c3')).toBe(true);
    });

    it('should return true for alphanumeric with underscores and hyphens', () => {
      expect(ValidationUtils.validateSessionId('valid_session-123')).toBe(true);
      expect(ValidationUtils.validateSessionId('_session_')).toBe(true);
      expect(ValidationUtils.validateSessionId('session-id-123')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(ValidationUtils.validateSessionId('')).toBe(false);
    });

    it('should return false for whitespace-only string', () => {
      expect(ValidationUtils.validateSessionId('   ')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(ValidationUtils.validateSessionId(null as any)).toBe(false);
      expect(ValidationUtils.validateSessionId(undefined as any)).toBe(false);
      expect(ValidationUtils.validateSessionId(123 as any)).toBe(false);
      expect(ValidationUtils.validateSessionId({} as any)).toBe(false);
    });

    it('should return false for session IDs with invalid characters', () => {
      expect(ValidationUtils.validateSessionId('session@123')).toBe(false);
      expect(ValidationUtils.validateSessionId('session#123')).toBe(false);
      expect(ValidationUtils.validateSessionId('session 123')).toBe(false);
      expect(ValidationUtils.validateSessionId('session.123')).toBe(false);
    });

    it('should return false for session IDs longer than 100 characters', () => {
      const longSessionId = 'a'.repeat(101);
      expect(ValidationUtils.validateSessionId(longSessionId)).toBe(false);
    });

    it('should return true for session IDs exactly 100 characters', () => {
      const maxLengthSessionId = 'a'.repeat(100);
      expect(ValidationUtils.validateSessionId(maxLengthSessionId)).toBe(true);
    });

    it('should handle session IDs with leading/trailing whitespace', () => {
      expect(ValidationUtils.validateSessionId(' session123 ')).toBe(true);
      expect(ValidationUtils.validateSessionId('  valid-session  ')).toBe(true);
    });
  });
});