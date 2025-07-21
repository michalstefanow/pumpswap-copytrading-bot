// Test setup file
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Set test timeout
jest.setTimeout(10000)

// Mock process.exit to prevent tests from actually exiting
const originalExit = process.exit
beforeAll(() => {
  process.exit = jest.fn() as any
})

afterAll(() => {
  process.exit = originalExit
}) 