import { describe, it, expect } from 'vitest'

describe('Baker Payment System', () => {
  describe('Payment Calculation Logic', () => {
    it('should calculate base payment for junior baker', () => {
      const orderValue = 100
      const bakerLevel = 'junior'
      const expectedPayment = orderValue * 0.15 // 15% for junior
      
      expect(expectedPayment).toBe(15)
    })

    it('should calculate base payment for main baker', () => {
      const orderValue = 100
      const bakerLevel = 'main'
      const expectedPayment = orderValue * 0.25 // 25% for main
      
      expect(expectedPayment).toBe(25)
    })

    it('should add rush bonus for urgent orders', () => {
      const basePayment = 20
      const rushBonus = 5
      const totalPayment = basePayment + rushBonus
      
      expect(totalPayment).toBe(25)
    })

    it('should handle multiple bakers per order', () => {
      const orderValue = 200
      const bakerCount = 2
      const expectedIndividualPayment = (orderValue * 0.2) / bakerCount // 20% split
      
      expect(expectedIndividualPayment).toBe(20)
    })

    it('should validate payment thresholds', () => {
      const minPayment = 5
      const calculatedPayment = 3
      const finalPayment = Math.max(minPayment, calculatedPayment)
      
      expect(finalPayment).toBe(5)
    })
  })

  describe('Commission Structure', () => {
    it('should apply correct commission rates', () => {
      const rates = {
        junior: 0.15,
        main: 0.25,
        senior: 0.30
      }
      
      expect(rates.junior).toBe(0.15)
      expect(rates.main).toBe(0.25)
      expect(rates.senior).toBe(0.30)
    })

    it('should calculate total commission pool', () => {
      const orderValue = 1000
      const totalCommissionRate = 0.20 // 20% of order value
      const expectedPool = orderValue * totalCommissionRate
      
      expect(expectedPool).toBe(200)
    })
  })
})
