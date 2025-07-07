import { 
  CCRunConfig, 
  ToolPermissions, 
  Settings, 
  Session, 
  Message, 
  CCRunResult, 
  StreamChunk 
} from '../../src/core/types';

describe('Core Types', () => {
  describe('CCRunConfig', () => {
    it('should create valid config with all properties', () => {
      const config: CCRunConfig = {
        prompt: 'test prompt',
        inputFile: 'test.txt',
        maxTurns: 10,
        sessionId: 'session123',
        allowedTools: ['Read', 'Write'],
        disallowedTools: ['Bash'],
        continue: true,
        resume: 'session456',
        permissionMode: 'plan'
      };

      expect(config.prompt).toBe('test prompt');
      expect(config.inputFile).toBe('test.txt');
      expect(config.maxTurns).toBe(10);
      expect(config.sessionId).toBe('session123');
      expect(config.allowedTools).toEqual(['Read', 'Write']);
      expect(config.disallowedTools).toEqual(['Bash']);
      expect(config.continue).toBe(true);
      expect(config.resume).toBe('session456');
      expect(config.permissionMode).toBe('plan');
    });

    it('should create config with minimal properties', () => {
      const config: CCRunConfig = {};

      expect(config.prompt).toBeUndefined();
      expect(config.inputFile).toBeUndefined();
      expect(config.maxTurns).toBeUndefined();
      expect(config.permissionMode).toBeUndefined();
    });

    it('should create config with valid permission modes', () => {
      const modes = ['default', 'acceptEdits', 'bypassPermissions', 'plan'];
      
      modes.forEach(mode => {
        const config: CCRunConfig = {
          permissionMode: mode as any
        };
        
        expect(config.permissionMode).toBe(mode);
      });
    });
  });

  describe('ToolPermissions', () => {
    it('should create valid tool permissions', () => {
      const permissions: ToolPermissions = {
        allowedTools: ['Read', 'Write', 'Edit'],
        disallowedTools: ['Bash', 'WebFetch']
      };

      expect(permissions.allowedTools).toEqual(['Read', 'Write', 'Edit']);
      expect(permissions.disallowedTools).toEqual(['Bash', 'WebFetch']);
    });

    it('should create empty tool permissions', () => {
      const permissions: ToolPermissions = {};

      expect(permissions.allowedTools).toBeUndefined();
      expect(permissions.disallowedTools).toBeUndefined();
    });
  });

  describe('Settings', () => {
    it('should create valid settings', () => {
      const settings: Settings = {
        allowedTools: ['Read', 'Write'],
        disallowedTools: ['Bash'],
        maxTurns: 50,
        customSetting: 'value'
      };

      expect(settings['allowedTools']).toEqual(['Read', 'Write']);
      expect(settings['disallowedTools']).toEqual(['Bash']);
      expect(settings.maxTurns).toBe(50);
      expect(settings['customSetting']).toBe('value');
    });
  });

  describe('Session', () => {
    it('should create valid session', () => {
      const now = new Date();
      const session: Session = {
        id: 'session123',
        created: now,
        lastUsed: now,
        messages: [],
        config: { prompt: 'test' },
        status: 'active'
      };

      expect(session.id).toBe('session123');
      expect(session.created).toBe(now);
      expect(session.lastUsed).toBe(now);
      expect(session.messages).toEqual([]);
      expect(session.config).toEqual({ prompt: 'test' });
      expect(session.status).toBe('active');
    });

    it('should validate session status values', () => {
      const validStatuses: Session['status'][] = ['active', 'completed', 'error'];
      
      validStatuses.forEach(status => {
        const session: Session = {
          id: 'test',
          created: new Date(),
          lastUsed: new Date(),
          messages: [],
          config: {},
          status
        };
        
        expect(session.status).toBe(status);
      });
    });
  });

  describe('Message', () => {
    it('should create valid message', () => {
      const now = new Date();
      const message: Message = {
        id: 'msg123',
        timestamp: now,
        type: 'user',
        content: 'Hello',
        metadata: { custom: 'value' }
      };

      expect(message.id).toBe('msg123');
      expect(message.timestamp).toBe(now);
      expect(message.type).toBe('user');
      expect(message.content).toBe('Hello');
      expect(message.metadata).toEqual({ custom: 'value' });
    });

    it('should validate message types', () => {
      const validTypes: Message['type'][] = ['user', 'assistant', 'system'];
      
      validTypes.forEach(type => {
        const message: Message = {
          id: 'test',
          timestamp: new Date(),
          type,
          content: 'test content'
        };
        
        expect(message.type).toBe(type);
      });
    });

    it('should create message without metadata', () => {
      const message: Message = {
        id: 'msg123',
        timestamp: new Date(),
        type: 'assistant',
        content: 'Response'
      };

      expect(message.metadata).toBeUndefined();
    });
  });

  describe('CCRunResult', () => {
    it('should create successful result', () => {
      const messages: Message[] = [
        {
          id: 'msg1',
          timestamp: new Date(),
          type: 'user',
          content: 'Question'
        },
        {
          id: 'msg2',
          timestamp: new Date(),
          type: 'assistant',
          content: 'Answer'
        }
      ];

      const result: CCRunResult = {
        success: true,
        messages,
        sessionId: 'session123',
        metadata: { duration: 1000 }
      };

      expect(result.success).toBe(true);
      expect(result.messages).toBe(messages);
      expect(result.sessionId).toBe('session123');
      expect(result.error).toBeUndefined();
      expect(result.metadata).toEqual({ duration: 1000 });
    });

    it('should create error result', () => {
      const result: CCRunResult = {
        success: false,
        messages: [],
        error: 'Something went wrong'
      };

      expect(result.success).toBe(false);
      expect(result.messages).toEqual([]);
      expect(result.error).toBe('Something went wrong');
      expect(result.sessionId).toBeUndefined();
      expect(result.metadata).toBeUndefined();
    });
  });

  describe('StreamChunk', () => {
    it('should create valid stream chunk', () => {
      const chunk: StreamChunk = {
        type: 'message',
        content: 'Streaming content',
        metadata: { timestamp: Date.now() }
      };

      expect(chunk.type).toBe('message');
      expect(chunk.content).toBe('Streaming content');
      expect(chunk.metadata).toEqual({ timestamp: expect.any(Number) });
    });

    it('should validate stream chunk types', () => {
      const validTypes: StreamChunk['type'][] = ['message', 'error', 'completion'];
      
      validTypes.forEach(type => {
        const chunk: StreamChunk = {
          type,
          content: 'test content'
        };
        
        expect(chunk.type).toBe(type);
      });
    });

    it('should create chunk without metadata', () => {
      const chunk: StreamChunk = {
        type: 'completion',
        content: 'Done'
      };

      expect(chunk.metadata).toBeUndefined();
    });
  });
});