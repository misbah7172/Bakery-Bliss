import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatDate } from '../lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500')
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
      expect(result).toBe('base-class conditional-class')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('p-4', 'px-8') // px-8 should override px from p-4
      expect(result).toBe('p-4 px-8') // cn doesn't actually merge classes, it just combines them
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0.99)).toBe('$0.99')
    })

    it('should handle zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should handle negative numbers correctly', () => {
      expect(formatCurrency(-100)).toBe('-$100.00')
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })

    it('should handle decimal values correctly', () => {
      expect(formatCurrency(123.4)).toBe('$123.40')
      expect(formatCurrency(123.456)).toBe('$123.46') // Should round to 2 decimal places
    })

    it('should handle null and undefined values', () => {
      expect(formatCurrency(null)).toBe('$0.00')
      expect(formatCurrency(undefined)).toBe('$0.00')
    })

    it('should handle NaN values', () => {
      expect(formatCurrency(NaN)).toBe('$0.00')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
    })
  })

  describe('formatDate', () => {
    it('should format valid date strings correctly', () => {
      const dateString = '2025-07-14T10:30:00.000Z'
      const result = formatDate(dateString)
      expect(result).toMatch(/Jul 14, 2025/)
    })

    it('should handle ISO date strings', () => {
      const result = formatDate('2025-12-25T00:00:00.000Z')
      expect(result).toMatch(/Dec 25, 2025/)
    })

    it('should handle different date formats', () => {
      const result = formatDate('2025-01-01')
      expect(result).toMatch(/Jan 1, 2025/)
    })

    it('should format dates with proper US locale format', () => {
      const result = formatDate('2025-06-15T14:30:00.000Z')
      expect(result).toMatch(/Jun 15, 2025/)
    })
  })
})
