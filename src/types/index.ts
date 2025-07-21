export type Direction = "quoteToBase" | "baseToQuote"

export interface TradingConfig {
  mint: string
  poolId: string
  isPump: boolean
  amount: number
  slippage: number
}

export interface TradingSettings {
  mint: string | null
  poolId: string | null
  isPump: boolean | null
  amount: string | null
  slippage: string | null
}

export interface WalletData {
  privateKey: string
  pubkey: string
  solBalance: number | null
  tokenBuyTx: string | null
  tokenSellTx: string | null
}

export interface MarketCapThresholds {
  current: number
  lower: number
  higher: number
}

export interface TradingState {
  isRunning: boolean
  isProcessing: boolean
  lastBuyTime?: Date
  lastSellTime?: Date
  totalTrades: number
  successfulTrades: number
  failedTrades: number
}

export interface TradeResult {
  success: boolean
  transactionHash?: string
  error?: string
  timestamp: Date
  amount: number
  direction: Direction
}

export interface BotConfig {
  rpcEndpoint: string
  rpcWebsocketEndpoint?: string
  privateKey: string
  pumpSwapProgramId: string
  sellTimer: number
  stopLoss: number
  lowerMcInterval: number
  higherMcInterval: number
  lowerTpInterval: number
  higherTpInterval: number
  blockEngineUrl?: string
  jitoKey?: number
  jitoTip?: number
}