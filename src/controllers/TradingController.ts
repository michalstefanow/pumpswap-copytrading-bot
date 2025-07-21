import { Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { BN } from 'bn.js'
import { Direction, TradingState, MarketCapThresholds } from '../types'
import { tradingService } from '../services/TradingService'
import { settingsService } from '../services/SettingsService'
import { configManager } from '../config'
import { logger } from '../utils/logger'
import { sleep } from '../utils/utils'

export class TradingController {
  private tradingState: TradingState = {
    isRunning: false,
    isProcessing: false,
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
  }

  private user: Keypair
  private thresholds: MarketCapThresholds | null = null

  constructor(privateKey: string) {
    this.user = Keypair.fromSecretKey(Buffer.from(privateKey, 'base64'))
  }

  public async startAutoTrading(): Promise<void> {
    try {
      const config = settingsService.getSettingsAsConfig()
      if (!config) {
        throw new Error('Invalid trading configuration')
      }

      const thresholds = configManager.getTradingThresholds()
      
      logger.info('Starting automated trading...')
      logger.info(`Wallet: ${this.user.publicKey.toBase58()}`)
      logger.info(`Trading amount: ${config.amount} SOL`)
      logger.info(`Slippage: ${config.slippage}%`)

      this.tradingState.isRunning = true
      await this.runTradingLoop(config, thresholds)
    } catch (error) {
      logger.error(`Trading failed: ${error}`)
      this.tradingState.isRunning = false
      throw error
    }
  }

  public async sellAllTokens(): Promise<void> {
    try {
      const config = settingsService.getSettingsAsConfig()
      if (!config) {
        throw new Error('Invalid trading configuration')
      }

      logger.info('Starting token sell operation...')
      
      const poolId = new PublicKey(config.poolId)
      const mint = new PublicKey(config.mint)
      
      // Get token balance and sell
      const tokenBalance = await this.getTokenBalance(mint)
      if (tokenBalance > 0) {
        await tradingService.executeTrade(
          poolId,
          mint,
          new BN(tokenBalance),
          config.slippage,
          this.user,
          'quoteToBase'
        )
        logger.info('Token sell operation completed')
      } else {
        logger.info('No tokens to sell')
      }
    } catch (error) {
      logger.error(`Sell operation failed: ${error}`)
      throw error
    }
  }

  public getTradingState(): TradingState {
    return { ...this.tradingState }
  }

  public stopTrading(): void {
    this.tradingState.isRunning = false
    logger.info('Trading stopped by user')
  }

  private async runTradingLoop(config: any, thresholds: any): Promise<void> {
    const poolId = new PublicKey(config.poolId)
    const mint = new PublicKey(config.mint)
    const buyAmount = new BN(config.amount * LAMPORTS_PER_SOL)

    // Check initial balance
    const hasBalance = await tradingService.checkWalletBalance(this.user, config.amount)
    if (!hasBalance) {
      throw new Error('Insufficient balance to start trading')
    }

    // Prepare wallet
    await tradingService.prepareWallet(this.user, config.amount)

    let mcChecked = 0
    const mcCheckInterval = 200
    const maxChecks = 10000

    while (this.tradingState.isRunning) {
      try {
        this.tradingState.isProcessing = true

        // Get current market cap thresholds
        const currentThresholds = await this.getCurrentMarketCapThresholds(
          poolId,
          mint,
          config.isPump,
          thresholds.lowerMcInterval,
          thresholds.higherMcInterval
        )

        logger.info(`Current MC: ${currentThresholds.current} SOL`)
        logger.info(`Lower threshold: ${currentThresholds.lower} SOL`)
        logger.info(`Upper threshold: ${currentThresholds.higher} SOL`)

        // Check if we should buy
        if (currentThresholds.current > currentThresholds.higher) {
          logger.info('Market cap increased, executing buy order...')
          
          const result = await tradingService.executeTrade(
            poolId,
            mint,
            buyAmount,
            config.slippage,
            this.user,
            'baseToQuote'
          )

          if (result.success) {
            this.tradingState.successfulTrades++
            this.tradingState.lastBuyTime = new Date()
            logger.info(`Buy order successful: ${result.transactionHash}`)
            
            // Wait for token account to be ready
            await this.waitForTokenAccount(mint)
            
            // Start monitoring for sell conditions
            await this.monitorForSell(poolId, mint, config, thresholds)
          } else {
            this.tradingState.failedTrades++
            logger.error(`Buy order failed: ${result.error}`)
          }
        }

        await sleep(mcCheckInterval)
        mcChecked++

        if (mcChecked > maxChecks) {
          logger.warn('Maximum market cap checks reached, stopping trading')
          break
        }

      } catch (error) {
        logger.error(`Error in trading loop: ${error}`)
        this.tradingState.failedTrades++
        await sleep(1000) // Wait before retrying
      } finally {
        this.tradingState.isProcessing = false
      }
    }
  }

  private async monitorForSell(poolId: PublicKey, mint: PublicKey, config: any, thresholds: any): Promise<void> {
    const sellTimer = thresholds.sellTimer * 1000 // Convert to milliseconds
    const stopLoss = thresholds.stopLoss

    logger.info(`Monitoring for sell conditions (timer: ${thresholds.sellTimer}s, stop loss: ${stopLoss}%)`)

    const startTime = Date.now()
    
    while (this.tradingState.isRunning) {
      try {
        // Check if sell timer has elapsed
        if (Date.now() - startTime > sellTimer) {
          logger.info('Sell timer elapsed, executing sell order...')
          await this.executeSellOrder(poolId, mint, config)
          break
        }

        // Check stop loss conditions
        const currentPrice = await this.getCurrentTokenPrice(poolId, mint, config.isPump)
        // Implementation would check against entry price and stop loss threshold
        
        await sleep(5000) // Check every 5 seconds
      } catch (error) {
        logger.error(`Error in sell monitoring: ${error}`)
        await sleep(1000)
      }
    }
  }

  private async executeSellOrder(poolId: PublicKey, mint: PublicKey, config: any): Promise<void> {
    const tokenBalance = await this.getTokenBalance(mint)
    
    if (tokenBalance > 0) {
      const result = await tradingService.executeTrade(
        poolId,
        mint,
        new BN(tokenBalance),
        config.slippage,
        this.user,
        'quoteToBase'
      )

      if (result.success) {
        this.tradingState.successfulTrades++
        this.tradingState.lastSellTime = new Date()
        logger.info(`Sell order successful: ${result.transactionHash}`)
      } else {
        this.tradingState.failedTrades++
        logger.error(`Sell order failed: ${result.error}`)
      }
    }
  }

  private async getCurrentMarketCapThresholds(
    poolId: PublicKey,
    mint: PublicKey,
    isPump: boolean,
    lowerInterval: number,
    higherInterval: number
  ): Promise<MarketCapThresholds> {
    // This would need to be implemented based on the actual market cap calculation logic
    // For now, returning a placeholder
    return {
      current: 100,
      lower: 90,
      higher: 110,
    }
  }

  private async getTokenBalance(mint: PublicKey): Promise<number> {
    // Implementation would get the actual token balance
    return 0
  }

  private async getCurrentTokenPrice(poolId: PublicKey, mint: PublicKey, isPump: boolean): Promise<number> {
    // Implementation would get the current token price
    return 0
  }

  private async waitForTokenAccount(mint: PublicKey): Promise<void> {
    // Implementation would wait for the token account to be confirmed
    await sleep(2000)
  }
} 