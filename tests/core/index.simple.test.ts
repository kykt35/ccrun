import { CCRunService } from '../../src/core/index';
import { ConfigManager } from '../../src/core/config';
import { ValidationUtils } from '../../src/utils/validation';
import { CCRunConfig } from '../../src/core/types';

// Mock dependencies
jest.mock('../../src/core/config');
jest.mock('../../src/utils/validation');

describe('CCRunService', () => {
  let ccrunService: CCRunService;
  let mockConfigManager: jest.Mocked<typeof ConfigManager>;
  let mockValidationUtils: jest.Mocked<typeof ValidationUtils>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    ccrunService = new CCRunService();
    mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;
    mockValidationUtils = ValidationUtils as jest.Mocked<typeof ValidationUtils>;

    // Set up default mocks
    mockConfigManager.validateConfig.mockReturnValue(true);
    mockValidationUtils.validateToolList.mockReturnValue(true);
    mockValidationUtils.validateMaxTurns.mockReturnValue(true);
    mockValidationUtils.validateSessionId.mockReturnValue(true);
  });

  describe('validateConfig', () => {
    it('should validate valid configuration', () => {
      const config: CCRunConfig = {
        prompt: 'test',
        allowedTools: ['Read', 'Write'],
        disallowedTools: ['Bash'],
        maxTurns: 10,
        sessionId: 'session123'
      };

      const result = (ccrunService as any).validateConfig(config);

      expect(result).toBe(true);
      expect(mockConfigManager.validateConfig).toHaveBeenCalledWith(config);
      expect(mockValidationUtils.validateToolList).toHaveBeenCalledWith(['Read', 'Write']);
      expect(mockValidationUtils.validateToolList).toHaveBeenCalledWith(['Bash']);
      expect(mockValidationUtils.validateMaxTurns).toHaveBeenCalledWith(10);
      expect(mockValidationUtils.validateSessionId).toHaveBeenCalledWith('session123');
    });

    it('should reject invalid base config', () => {
      mockConfigManager.validateConfig.mockReturnValue(false);

      const config: CCRunConfig = { prompt: 'test' };
      const result = (ccrunService as any).validateConfig(config);

      expect(result).toBe(false);
    });

    it('should reject invalid allowed tools', () => {
      mockValidationUtils.validateToolList.mockReturnValueOnce(false);

      const config: CCRunConfig = {
        prompt: 'test',
        allowedTools: ['InvalidTool']
      };

      const result = (ccrunService as any).validateConfig(config);

      expect(result).toBe(false);
    });

    it('should reject invalid maxTurns', () => {
      mockValidationUtils.validateMaxTurns.mockReturnValue(false);

      const config: CCRunConfig = {
        prompt: 'test',
        maxTurns: -1
      };

      const result = (ccrunService as any).validateConfig(config);

      expect(result).toBe(false);
    });
  });

  describe('resolvePrompt', () => {
    it('should resolve prompt from config.prompt', async () => {
      const config: CCRunConfig = { prompt: 'direct prompt' };

      const result = await (ccrunService as any).resolvePrompt(config);

      expect(result).toBe('\n\n# Prompt\ndirect prompt\n\n');
    });

    it('should throw error when no prompt or file provided', async () => {
      const config: CCRunConfig = {};

      await expect((ccrunService as any).resolvePrompt(config))
        .rejects.toThrow('No prompt or input file provided');
    });
  });

  describe('cleanup', () => {
    it('should cleanup claude wrapper', async () => {
      // Mock the claudeWrapper.cleanup method
      const mockCleanup = jest.fn().mockResolvedValue(undefined);
      (ccrunService as any).claudeWrapper.cleanup = mockCleanup;

      await ccrunService.cleanup();

      expect(mockCleanup).toHaveBeenCalled();
    });
  });

});