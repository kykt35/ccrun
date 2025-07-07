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

    it('should allow valid tools with parentheses', () => {
      const validWithParens = [
        'Read(/path/to/file)',
        'Write(/tmp/a.txt)',
        'Edit(foo)',
        'MultiEdit(bar)',
        'Bash(echo 1)',
        'Glob(**/*.ts)',
        'Grep(pattern)',
        'LS(/home)',
        'WebFetch(http://example.com)',
        'WebSearch(hello)',
        'TodoRead(1)',
        'TodoWrite(2)',
        'Task(3)'
      ];
      expect(ValidationUtils.validateToolList(validWithParens)).toBe(true);
    });

    it('should not allow invalid tool names with parentheses', () => {
      const invalidWithParens = [
        'read(/path)', // 小文字
        'InvalidTool(foo)',
        'Read-foo(bar)',
        'Write_foo(baz)'
      ];
      expect(ValidationUtils.validateToolList(invalidWithParens)).toBe(false);
    });

    it('should allow mix of normal and parentheses tools', () => {
      const mixed = ['Read', 'Write(/tmp/a.txt)', 'Edit', 'Bash(echo 1)'];
      expect(ValidationUtils.validateToolList(mixed)).toBe(true);
    });

    // デバッグ用テストケース
    it('should debug validateToolList behavior', () => {
      console.log('=== validateToolList デバッグ ===');

      // 正常なケース
      const validTools = ['Read', 'Write', 'Edit'];
      console.log('Valid tools:', validTools);
      console.log('Result:', ValidationUtils.validateToolList(validTools));

      // 部分一致のケース
      const partialMatchTools = ['ReadFile', 'WriteFile', 'EditFile'];
      console.log('Partial match tools:', partialMatchTools);
      console.log('Result:', ValidationUtils.validateToolList(partialMatchTools));

      // 大文字小文字のケース
      const caseSensitiveTools = ['read', 'write', 'edit'];
      console.log('Lowercase tools:', caseSensitiveTools);
      console.log('Result:', ValidationUtils.validateToolList(caseSensitiveTools));

      // 空白を含むケース
      const whitespaceTools = [' Read ', ' Write ', ' Edit '];
      console.log('Whitespace tools:', whitespaceTools);
      console.log('Result:', ValidationUtils.validateToolList(whitespaceTools));

      // 無効なツール
      const invalidTools = ['Read', 'InvalidTool', 'Write'];
      console.log('Invalid tools:', invalidTools);
      console.log('Result:', ValidationUtils.validateToolList(invalidTools));
    });

    it('should test edge cases for tool validation', () => {
      // 空文字列
      expect(ValidationUtils.validateToolList([''])).toBe(false);

      // 空白のみ
      expect(ValidationUtils.validateToolList(['   '])).toBe(false);

      // 部分一致（現在の実装ではfalseになる）
      expect(ValidationUtils.validateToolList(['ReadFile'])).toBe(false);
      expect(ValidationUtils.validateToolList(['WriteFile'])).toBe(false);

      // 完全一致
      expect(ValidationUtils.validateToolList(['Read'])).toBe(true);
      expect(ValidationUtils.validateToolList(['Write'])).toBe(true);

      // 大文字小文字
      expect(ValidationUtils.validateToolList(['read'])).toBe(false);
      expect(ValidationUtils.validateToolList(['READ'])).toBe(false);
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

  describe('validatePermissionMode', () => {
    it('should return true for valid permission modes', () => {
      expect(ValidationUtils.validatePermissionMode('default')).toBe(true);
      expect(ValidationUtils.validatePermissionMode('acceptEdits')).toBe(true);
      expect(ValidationUtils.validatePermissionMode('bypassPermissions')).toBe(true);
      expect(ValidationUtils.validatePermissionMode('plan')).toBe(true);
    });

    it('should return false for invalid permission modes', () => {
      expect(ValidationUtils.validatePermissionMode('invalid')).toBe(false);
      expect(ValidationUtils.validatePermissionMode('Accept')).toBe(false);
      expect(ValidationUtils.validatePermissionMode('PLAN')).toBe(false);
      expect(ValidationUtils.validatePermissionMode('bypass')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(ValidationUtils.validatePermissionMode('')).toBe(false);
    });

    it('should return false for whitespace-only string', () => {
      expect(ValidationUtils.validatePermissionMode('   ')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(ValidationUtils.validatePermissionMode(null as any)).toBe(false);
      expect(ValidationUtils.validatePermissionMode(undefined as any)).toBe(false);
      expect(ValidationUtils.validatePermissionMode(123 as any)).toBe(false);
      expect(ValidationUtils.validatePermissionMode({} as any)).toBe(false);
    });

    it('should handle permission modes with leading/trailing whitespace', () => {
      expect(ValidationUtils.validatePermissionMode(' default ')).toBe(true);
      expect(ValidationUtils.validatePermissionMode('  plan  ')).toBe(true);
      expect(ValidationUtils.validatePermissionMode(' acceptEdits ')).toBe(true);
    });

    it('should be case sensitive', () => {
      expect(ValidationUtils.validatePermissionMode('Default')).toBe(false);
      expect(ValidationUtils.validatePermissionMode('PLAN')).toBe(false);
      expect(ValidationUtils.validatePermissionMode('AcceptEdits')).toBe(false);
    });
  });
});