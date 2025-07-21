import readline from 'readline'
import { logger } from '../utils/logger'
import { settingsService } from '../services/SettingsService'
import { configManager } from '../config'
import { TradingController } from '../controllers/TradingController'

export class CLIInterface {
  private rl: readline.Interface
  private tradingController: TradingController | null = null

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
  }

  public async start(): Promise<void> {
    try {
      this.clearScreen()
      this.displayWelcome()
      
      while (true) {
        this.displayMainMenu()
        const choice = await this.getUserInput('\t[Main] - Choice: ')
        
        await this.handleMainMenuChoice(choice)
      }
    } catch (error) {
      logger.error(`CLI error: ${error}`)
      process.exit(1)
    }
  }

  private displayWelcome(): void {
    console.log('🚀 Pumpswap Trading Bot v2.0')
    console.log('================================')
    console.log('')
  }

  private displayMainMenu(): void {
    console.log('\t[1] - Show Current Settings')
    console.log('\t[2] - Configure Settings')
    console.log('\t[3] - Start Auto Trading')
    console.log('\t[4] - Sell All Tokens')
    console.log('\t[5] - Show Trading Status')
    console.log('\t[6] - Exit')
    console.log('')
  }

  private async handleMainMenuChoice(choice: string): Promise<void> {
    const choiceNum = parseInt(choice)
    
    switch (choiceNum) {
      case 1:
        await this.showCurrentSettings()
        break
      case 2:
        await this.configureSettings()
        break
      case 3:
        await this.startAutoTrading()
        break
      case 4:
        await this.sellAllTokens()
        break
      case 5:
        await this.showTradingStatus()
        break
      case 6:
        await this.exit()
        break
      default:
        console.log('\t❌ Invalid choice! Please try again.')
        await this.sleep(2000)
        break
    }
  }

  private async showCurrentSettings(): Promise<void> {
    this.clearScreen()
    console.log('📋 Current Settings')
    console.log('==================')
    
    try {
      const settings = settingsService.readSettings()
      const config = configManager.getConfig()
      
      console.log(`\n🔧 Bot Configuration:`)
      console.log(`   RPC Endpoint: ${config.rpcEndpoint}`)
      console.log(`   Program ID: ${config.pumpSwapProgramId}`)
      console.log(`   Sell Timer: ${config.sellTimer}s`)
      console.log(`   Stop Loss: ${config.stopLoss}%`)
      
      console.log(`\n📊 Trading Settings:`)
      console.log(`   Token Mint: ${settings.mint || 'Not set'}`)
      console.log(`   Pool ID: ${settings.poolId || 'Not set'}`)
      console.log(`   Is Pump: ${settings.isPump || 'Not set'}`)
      console.log(`   Amount: ${settings.amount || 'Not set'} SOL`)
      console.log(`   Slippage: ${settings.slippage || 'Not set'}%`)
      
      console.log(`\n📈 Market Cap Thresholds:`)
      console.log(`   Lower Interval: ${config.lowerMcInterval}%`)
      console.log(`   Higher Interval: ${config.higherMcInterval}%`)
      console.log(`   Lower TP: ${config.lowerTpInterval}%`)
      console.log(`   Higher TP: ${config.higherTpInterval}%`)
      
    } catch (error) {
      console.log(`\n❌ Error loading settings: ${error}`)
    }
    
    await this.waitForUserInput('\nPress Enter to continue...')
  }

  private async configureSettings(): Promise<void> {
    this.clearScreen()
    console.log('⚙️  Configure Trading Settings')
    console.log('=============================')
    
    try {
      const currentSettings = settingsService.readSettings()
      
      console.log('\nCurrent settings:')
      console.log(`Token Mint: ${currentSettings.mint || 'Not set'}`)
      console.log(`Pool ID: ${currentSettings.poolId || 'Not set'}`)
      console.log(`Amount: ${currentSettings.amount || 'Not set'} SOL`)
      console.log(`Slippage: ${currentSettings.slippage || 'Not set'}%`)
      
      console.log('\nEnter new settings (press Enter to keep current value):')
      
      const mint = await this.getUserInput(`Token Mint [${currentSettings.mint || ''}]: `) || currentSettings.mint
      const poolId = await this.getUserInput(`Pool ID [${currentSettings.poolId || ''}]: `) || currentSettings.poolId
      const amount = await this.getUserInput(`Amount (SOL) [${currentSettings.amount || ''}]: `) || currentSettings.amount
      const slippage = await this.getUserInput(`Slippage (%) [${currentSettings.slippage || ''}]: `) || currentSettings.slippage
      
      const newSettings = {
        mint: mint || '',
        poolId: poolId || '',
        isPump: true, // Default to true for pump tokens
        amount: Number(amount) || 0,
        slippage: Number(slippage) || 1,
      }
      
      settingsService.saveSettings(newSettings)
      console.log('\n✅ Settings saved successfully!')
      
    } catch (error) {
      console.log(`\n❌ Error configuring settings: ${error}`)
    }
    
    await this.waitForUserInput('\nPress Enter to continue...')
  }

  private async startAutoTrading(): Promise<void> {
    this.clearScreen()
    console.log('🚀 Starting Auto Trading')
    console.log('=======================')
    
    try {
      const config = configManager.getConfig()
      this.tradingController = new TradingController(config.privateKey)
      
      console.log('✅ Trading controller initialized')
      console.log('🔄 Starting trading loop...')
      console.log('Press Ctrl+C to stop trading')
      
      await this.tradingController.startAutoTrading()
      
    } catch (error) {
      console.log(`\n❌ Error starting trading: ${error}`)
      await this.waitForUserInput('\nPress Enter to continue...')
    }
  }

  private async sellAllTokens(): Promise<void> {
    this.clearScreen()
    console.log('💰 Selling All Tokens')
    console.log('====================')
    
    try {
      const config = configManager.getConfig()
      const controller = new TradingController(config.privateKey)
      
      console.log('🔄 Executing sell order...')
      await controller.sellAllTokens()
      console.log('✅ Sell operation completed')
      
    } catch (error) {
      console.log(`\n❌ Error selling tokens: ${error}`)
    }
    
    await this.waitForUserInput('\nPress Enter to continue...')
  }

  private async showTradingStatus(): Promise<void> {
    this.clearScreen()
    console.log('📊 Trading Status')
    console.log('================')
    
    if (!this.tradingController) {
      console.log('❌ No active trading session')
    } else {
      const state = this.tradingController.getTradingState()
      
      console.log(`Status: ${state.isRunning ? '🟢 Running' : '🔴 Stopped'}`)
      console.log(`Processing: ${state.isProcessing ? '🔄 Yes' : '⏸️  No'}`)
      console.log(`Total Trades: ${state.totalTrades}`)
      console.log(`Successful: ${state.successfulTrades}`)
      console.log(`Failed: ${state.failedTrades}`)
      
      if (state.lastBuyTime) {
        console.log(`Last Buy: ${state.lastBuyTime.toLocaleString()}`)
      }
      if (state.lastSellTime) {
        console.log(`Last Sell: ${state.lastSellTime.toLocaleString()}`)
      }
    }
    
    await this.waitForUserInput('\nPress Enter to continue...')
  }

  private async exit(): Promise<void> {
    console.log('\n👋 Goodbye!')
    if (this.tradingController) {
      this.tradingController.stopTrading()
    }
    this.rl.close()
    process.exit(0)
  }

  private clearScreen(): void {
    console.clear()
  }

  private async getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim())
      })
    })
  }

  private async waitForUserInput(prompt: string): Promise<void> {
    await this.getUserInput(prompt)
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const cliInterface = new CLIInterface() 