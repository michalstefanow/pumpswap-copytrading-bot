import { cliInterface } from './cli/CLIInterface'
import { logger } from './utils/logger'
import { configManager } from './config'

async function main() {
  try {
    // Initialize configuration
    logger.info('Initializing Pumpswap Trading Bot...')
    
    // Validate configuration
    const config = configManager.getConfig()
    logger.info('Configuration loaded successfully')
    
    // Start CLI interface
    await cliInterface.start()
    
  } catch (error) {
    logger.error(`Failed to start bot: ${error}`)
    console.error('❌ Bot initialization failed. Please check your configuration.')
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled rejection at ${promise}, reason: ${reason}`)
  process.exit(1)
})

// Start the application
main().catch((error) => {
  logger.error(`Main function error: ${error}`)
  process.exit(1)
})
