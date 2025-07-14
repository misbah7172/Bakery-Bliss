import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
})

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/bakery_test'
process.env.JWT_SECRET = 'test-jwt-secret'
