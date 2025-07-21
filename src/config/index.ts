import dotenv from 'dotenv'
import { BotConfig } from '../types'

dotenv.config()

export class ConfigManager {
  private static instance: ConfigManager
  private config: BotConfig

  private constructor() {
    this.config = this.loadConfig()
    this.validateConfig()
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  private loadConfig(): BotConfig {
    return {
      rpcEndpoint: process.env.RPC_ENDPOINT!,
      rpcWebsocketEndpoint: process.env.RPC_WEBSOCKET_ENDPOINT,
      privateKey: process.env.PRIVATE_KEY!,
      pumpSwapProgramId: process.env.PUMP_SWAP_PROGRAM_ID!,
      sellTimer: Number(process.env.SELL_TIMER) || 300,
      stopLoss: Number(process.env.STOP_LOSS) || 15,
      lowerMcInterval: Number(process.env.LOWER_MC_INTERVAL) || 10,
      higherMcInterval: Number(process.env.HIGHER_MC_INTERVAL) || 20,
      lowerTpInterval: Number(process.env.LOWER_TP_INTERVAL) || 5,
      higherTpInterval: Number(process.env.HIGHER_TP_INTERVAL) || 15,
      blockEngineUrl: process.env.BLOCKENGINE_URL,
      jitoKey: process.env.JITO_KEY ? Number(process.env.JITO_KEY) : undefined,
      jitoTip: process.env.JITO_TIP ? Number(process.env.JITO_TIP) : undefined,
    }
  }

  private validateConfig(): void {
    const requiredFields = ['rpcEndpoint', 'privateKey', 'pumpSwapProgramId']
    
    for (const field of requiredFields) {
      if (!this.config[field as keyof BotConfig]) {
        throw new Error(`Missing required configuration: ${field}`)
      }
    }

    if (this.config.sellTimer <= 0) {
      throw new Error('SELL_TIMER must be greater than 0')
    }

    if (this.config.stopLoss <= 0 || this.config.stopLoss > 100) {
      throw new Error('STOP_LOSS must be between 0 and 100')
    }
  }

  public getConfig(): BotConfig {
    return { ...this.config }
  }

  public getRpcEndpoint(): string {
    return this.config.rpcEndpoint
  }

  public getPrivateKey(): string {
    return this.config.privateKey
  }

  public getPumpSwapProgramId(): string {
    return this.config.pumpSwapProgramId
  }

  public getTradingThresholds() {
    return {
      lowerMcInterval: this.config.lowerMcInterval,
      higherMcInterval: this.config.higherMcInterval,
      lowerTpInterval: this.config.lowerTpInterval,
      higherTpInterval: this.config.higherTpInterval,
      stopLoss: this.config.stopLoss,
      sellTimer: this.config.sellTimer,
    }
  }
}

export const configManager = ConfigManager.getInstance() 