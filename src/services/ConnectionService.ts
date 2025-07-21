import { Connection, PublicKey } from '@solana/web3.js'
import { configManager } from '../config'

export class ConnectionService {
  private static instance: ConnectionService
  private connection: Connection

  private constructor() {
    const config = configManager.getConfig()
    this.connection = new Connection(config.rpcEndpoint, 'confirmed')
  }

  public static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService()
    }
    return ConnectionService.instance
  }

  public getConnection(): Connection {
    return this.connection
  }

  public async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey)
      return balance
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`)
    }
  }

  public async getTokenAccountBalance(tokenAccount: PublicKey) {
    try {
      return await this.connection.getTokenAccountBalance(tokenAccount)
    } catch (error) {
      throw new Error(`Failed to get token account balance: ${error}`)
    }
  }

  public async confirmTransaction(signature: string): Promise<boolean> {
    try {
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed')
      return !confirmation.value.err
    } catch (error) {
      throw new Error(`Failed to confirm transaction: ${error}`)
    }
  }
}

export const connectionService = ConnectionService.getInstance() 