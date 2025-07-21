import { ConfigManager } from '../config'

describe('ConfigManager', () => {
  let configManager: ConfigManager

  beforeEach(() => {
    // Reset environment variables for each test
    delete process.env.RPC_ENDPOINT
    delete process.env.PRIVATE_KEY
    delete process.env.PUMP_SWAP_PROGRAM_ID
    delete process.env.SELL_TIMER
    delete process.env.STOP_LOSS
  })

  afterEach(() => {
    // Clean up singleton instance
    (ConfigManager as any).instance = undefined
  })

  describe('getInstance', () => {
    it('should create a singleton instance', () => {
      const instance1 = ConfigManager.getInstance()
      const instance2 = ConfigManager.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('configuration loading', () => {
    it('should load configuration from environment variables', () => {
      process.env.RPC_ENDPOINT = 'https://test.rpc.com'
      process.env.PRIVATE_KEY = 'test-private-key'
      process.env.PUMP_SWAP_PROGRAM_ID = 'test-program-id'
      process.env.SELL_TIMER = '300'
      process.env.STOP_LOSS = '15'

      configManager = ConfigManager.getInstance()
      const config = configManager.getConfig()

      expect(config.rpcEndpoint).toBe('https://test.rpc.com')
      expect(config.privateKey).toBe('test-private-key')
      expect(config.pumpSwapProgramId).toBe('test-program-id')
      expect(config.sellTimer).toBe(300)
      expect(config.stopLoss).toBe(15)
    })

    it('should use default values for optional configuration', () => {
      process.env.RPC_ENDPOINT = 'https://test.rpc.com'
      process.env.PRIVATE_KEY = 'test-private-key'
      process.env.PUMP_SWAP_PROGRAM_ID = 'test-program-id'

      configManager = ConfigManager.getInstance()
      const config = configManager.getConfig()

      expect(config.sellTimer).toBe(300) // default value
      expect(config.stopLoss).toBe(15) // default value
      expect(config.lowerMcInterval).toBe(10) // default value
      expect(config.higherMcInterval).toBe(20) // default value
    })
  })

  describe('configuration validation', () => {
    it('should throw error when required fields are missing', () => {
      expect(() => {
        ConfigManager.getInstance()
      }).toThrow('Missing required configuration: rpcEndpoint')
    })

    it('should throw error for invalid sell timer', () => {
      process.env.RPC_ENDPOINT = 'https://test.rpc.com'
      process.env.PRIVATE_KEY = 'test-private-key'
      process.env.PUMP_SWAP_PROGRAM_ID = 'test-program-id'
      process.env.SELL_TIMER = '0'

      expect(() => {
        ConfigManager.getInstance()
      }).toThrow('SELL_TIMER must be greater than 0')
    })

    it('should throw error for invalid stop loss', () => {
      process.env.RPC_ENDPOINT = 'https://test.rpc.com'
      process.env.PRIVATE_KEY = 'test-private-key'
      process.env.PUMP_SWAP_PROGRAM_ID = 'test-program-id'
      process.env.STOP_LOSS = '150'

      expect(() => {
        ConfigManager.getInstance()
      }).toThrow('STOP_LOSS must be between 0 and 100')
    })
  })

  describe('getTradingThresholds', () => {
    it('should return trading thresholds', () => {
      process.env.RPC_ENDPOINT = 'https://test.rpc.com'
      process.env.PRIVATE_KEY = 'test-private-key'
      process.env.PUMP_SWAP_PROGRAM_ID = 'test-program-id'
      process.env.LOWER_MC_INTERVAL = '10'
      process.env.HIGHER_MC_INTERVAL = '20'
      process.env.LOWER_TP_INTERVAL = '5'
      process.env.HIGHER_TP_INTERVAL = '15'
      process.env.STOP_LOSS = '15'
      process.env.SELL_TIMER = '300'

      configManager = ConfigManager.getInstance()
      const thresholds = configManager.getTradingThresholds()

      expect(thresholds).toEqual({
        lowerMcInterval: 10,
        higherMcInterval: 20,
        lowerTpInterval: 5,
        higherTpInterval: 15,
        stopLoss: 15,
        sellTimer: 300,
      })
    })
  })
}) 