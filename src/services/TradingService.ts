import { Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { PumpAmmSdk } from '@pump-fun/pump-swap-sdk'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { BN } from 'bn.js'
import { Direction, TradeResult, MarketCapThresholds } from '../types'
import { connectionService } from './ConnectionService'
import { logger } from '../utils/logger'
import { wrapSol } from '../utils/wrapsol'

export class TradingService {
  private pumpSwap: PumpAmmSdk
  private tradingState = {
    isRunning: false,
    isProcessing: false,
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
  }

  constructor() {
    this.pumpSwap = new PumpAmmSdk(connectionService.getConnection())
  }

  public async executeTrade(
    poolId: PublicKey,
    mint: PublicKey,
    amount: BN,
    slippage: number,
    user: Keypair,
    direction: Direction
  ): Promise<TradeResult> {
    try {
      this.tradingState.isProcessing = true
      this.tradingState.totalTrades++

      logger.info(`Executing ${direction} trade for ${amount.toString()} lamports`)

      const result = await this.buyAndSell(
        this.pumpSwap,
        poolId,
        mint,
        amount,
        slippage,
        user,
        direction
      )

      this.tradingState.successfulTrades++
      logger.info(`Trade executed successfully: ${result.transactionHash}`)

      return {
        success: true,
        transactionHash: result.transactionHash,
        timestamp: new Date(),
        amount: amount.toNumber(),
        direction,
      }
    } catch (error) {
      this.tradingState.failedTrades++
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`Trade failed: ${errorMessage}`)

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
        amount: amount.toNumber(),
        direction,
      }
    } finally {
      this.tradingState.isProcessing = false
    }
  }

  public async getMarketCapThresholds(
    quoteVault: PublicKey,
    baseVault: PublicKey,
    isPump: boolean,
    mint: PublicKey,
    lowerInterval: number,
    higherInterval: number
  ): Promise<MarketCapThresholds> {
    const currentMC = await this.getTokenMarketCap(quoteVault, baseVault, isPump, mint)
    const mc = Math.floor(currentMC)
    
    return {
      current: currentMC,
      lower: mc * (1 - lowerInterval / 100),
      higher: mc * (1 + higherInterval / 100),
    }
  }

  public async checkWalletBalance(user: Keypair, requiredAmount: number): Promise<boolean> {
    const balance = await connectionService.getBalance(user.publicKey)
    const balanceInSol = balance / LAMPORTS_PER_SOL
    
    if (balanceInSol < requiredAmount) {
      logger.error(`Insufficient balance. Required: ${requiredAmount} SOL, Available: ${balanceInSol} SOL`)
      return false
    }
    
    return true
  }

  public async prepareWallet(user: Keypair, amount: number): Promise<void> {
    await wrapSol(user, amount * 2) // Wrap double the amount for fees
  }

  public getTradingState() {
    return { ...this.tradingState }
  }

  private async buyAndSell(
    pSwap: PumpAmmSdk,
    pool: PublicKey,
    mint: PublicKey,
    buyAmount: BN,
    slippage: number,
    user: Keypair,
    direction: Direction
  ): Promise<{ transactionHash: string }> {
    // Implementation would go here - this is a placeholder
    // The actual implementation would use the PumpAmmSdk to execute the trade
    throw new Error('buyAndSell implementation not yet refactored')
  }

  private async getTokenMarketCap(
    quoteVault: PublicKey,
    baseVault: PublicKey,
    isPump: boolean,
    mint: PublicKey
  ): Promise<number> {
    // Implementation would go here - this is a placeholder
    // The actual implementation would calculate market cap from token price and supply
    throw new Error('getTokenMarketCap implementation not yet refactored')
  }
}

export const tradingService = new TradingService() 