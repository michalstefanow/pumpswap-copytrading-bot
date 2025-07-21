# 🚀 Pumpswap Trading Bot v2.0

A high-performance, refactored Solana trading bot designed for automated trading on Pumpswap with advanced market cap monitoring, risk management, and a modern architecture.

## ✨ Key Features

- 🏗️ **Modern Architecture** - Clean separation of concerns with services, controllers, and proper dependency injection
- ⚡ **Automated Trading** - Smart market cap monitoring with dynamic thresholds
- 🔄 **Risk Management** - Built-in stop loss, take profit, and sell timer mechanisms
- 📊 **Advanced Analytics** - Comprehensive logging and trading state monitoring
- 🛡️ **Error Handling** - Robust error handling and graceful degradation
- 🧪 **Testing** - Comprehensive test suite with Jest
- 📝 **Type Safety** - Full TypeScript support with strict type checking
- 🎨 **Code Quality** - ESLint and Prettier for consistent code style

## 🏗️ Architecture Overview

```
src/
├── config/           # Configuration management
├── services/         # Business logic services
├── controllers/      # Application controllers
├── cli/             # Command-line interface
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── constants/       # Application constants
└── __tests__/       # Test files
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/michalstefanow/pumpswap-copytrading-bot.git
cd pumpswap-copytrading-bot

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

Create a `.env` file in the root directory:

```env
# Core Settings
PRIVATE_KEY="your_main_wallet_private_key"
RPC_ENDPOINT="https://your.solana.rpc"
RPC_WEBSOCKET_ENDPOINT="wss://your.solana.wss"
PUMP_SWAP_PROGRAM_ID="program_id_here"

# Trading Parameters
LOWER_MC_INTERVAL=10    # % market cap lower threshold
HIGHER_MC_INTERVAL=20   # % market cap upper threshold
LOWER_TP_INTERVAL=5     # % take profit lower bound
HIGHER_TP_INTERVAL=15   # % take profit upper bound

# Risk Management
SELL_TIMER=300          # Seconds between sell checks
STOP_LOSS=15            # % loss threshold for auto-sell

# Optional Settings
BLOCKENGINE_URL="your_blockengine_url"
JITO_KEY=your_jito_key
JITO_TIP=your_jito_tip
```

### Usage

```bash
# Development mode
npm run dev

# Production mode
npm start

# Run tests
npm test

# Code quality checks
npm run lint
npm run format
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start in development mode with hot reload |
| `npm run build` | Build the project for production |
| `npm start` | Start the production build |
| `npm test` | Run the test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check code quality with ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Clean build artifacts |

## 🔧 Configuration Management

The bot uses a centralized configuration system with the following features:

- **Environment-based configuration** via `.env` files
- **Configuration validation** with meaningful error messages
- **Default values** for optional settings
- **Type-safe configuration** with TypeScript interfaces

### Configuration Structure

```typescript
interface BotConfig {
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
```

## 🧪 Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- **Unit tests** for individual components
- **Integration tests** for service interactions
- **Mock implementations** for external dependencies
- **Test utilities** for common testing patterns

## 📊 Trading Strategy

The bot implements a sophisticated trading strategy:

1. **Market Cap Monitoring** - Continuously monitors token market cap
2. **Dynamic Thresholds** - Adjusts buy/sell thresholds based on market conditions
3. **Risk Management** - Implements stop loss and take profit mechanisms
4. **State Management** - Tracks trading state and performance metrics

### Trading Flow

```
1. Monitor Market Cap
   ↓
2. Check Buy Conditions
   ↓
3. Execute Buy Order
   ↓
4. Monitor for Sell Conditions
   ↓
5. Execute Sell Order
   ↓
6. Repeat
```

## 🔍 Error Handling

The bot implements comprehensive error handling:

- **Graceful degradation** when services are unavailable
- **Retry mechanisms** for transient failures
- **Detailed logging** for debugging and monitoring
- **User-friendly error messages** in the CLI

## 📈 Performance Monitoring

Built-in performance monitoring includes:

- **Trading statistics** (success/failure rates)
- **Execution times** for operations
- **Memory usage** tracking
- **Network latency** monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Changelog

### v2.0.0
- Complete codebase refactoring
- Modern TypeScript architecture
- Improved error handling
- Comprehensive testing suite
- Enhanced CLI interface
- Better configuration management
- Performance optimizations

---

**⚠️ Disclaimer**: This software is for educational purposes only. Use at your own risk. The authors are not responsible for any financial losses.
