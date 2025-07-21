import fs from 'fs'
import { PublicKey } from '@solana/web3.js'
import { TradingSettings, TradingConfig } from '../types'
import { logger } from '../utils/logger'

export class SettingsService {
  private static instance: SettingsService
  private readonly settingsFile = 'settings.json'

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  public readSettings(): TradingSettings {
    try {
      if (!fs.existsSync(this.settingsFile)) {
        return this.createDefaultSettings()
      }

      const fileContent = fs.readFileSync(this.settingsFile, 'utf-8')
      const settings = JSON.parse(fileContent) as TradingSettings
      
      logger.info('Settings loaded successfully')
      return settings
    } catch (error) {
      logger.error(`Failed to read settings: ${error}`)
      return this.createDefaultSettings()
    }
  }

  public saveSettings(settings: TradingConfig): void {
    try {
      const settingsToSave: TradingSettings = {
        mint: settings.mint,
        poolId: settings.poolId,
        isPump: settings.isPump,
        amount: settings.amount.toString(),
        slippage: settings.slippage.toString(),
      }

      fs.writeFileSync(this.settingsFile, JSON.stringify(settingsToSave, null, 2))
      logger.info('Settings saved successfully')
    } catch (error) {
      logger.error(`Failed to save settings: ${error}`)
      throw new Error(`Failed to save settings: ${error}`)
    }
  }

  public validateSettings(settings: TradingSettings): boolean {
    if (!settings.mint || !settings.poolId) {
      logger.error('Missing required settings: mint and poolId')
      return false
    }

    if (settings.amount === null || settings.slippage === null) {
      logger.error('Missing required settings: amount and slippage')
      return false
    }

    const amount = Number(settings.amount)
    const slippage = Number(settings.slippage)

    if (isNaN(amount) || amount <= 0) {
      logger.error('Invalid amount setting')
      return false
    }

    if (isNaN(slippage) || slippage <= 0 || slippage > 100) {
      logger.error('Invalid slippage setting (must be between 0 and 100)')
      return false
    }

    return true
  }

  public getSettingsAsConfig(): TradingConfig | null {
    const settings = this.readSettings()
    
    if (!this.validateSettings(settings)) {
      return null
    }

    return {
      mint: settings.mint!,
      poolId: settings.poolId!,
      isPump: settings.isPump!,
      amount: Number(settings.amount!),
      slippage: Number(settings.slippage!),
    }
  }

  private createDefaultSettings(): TradingSettings {
    const defaultSettings: TradingSettings = {
      mint: null,
      poolId: null,
      isPump: null,
      amount: null,
      slippage: null,
    }

    this.saveSettings({
      mint: '',
      poolId: '',
      isPump: false,
      amount: 0,
      slippage: 0,
    })

    return defaultSettings
  }
}

export const settingsService = SettingsService.getInstance() 