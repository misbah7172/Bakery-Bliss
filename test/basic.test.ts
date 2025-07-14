import { describe, it, expect } from 'vitest'

describe('Basic Unit Tests', () => {
  describe('Math Operations', () => {
    it('should add numbers correctly', () => {
      expect(2 + 2).toBe(4)
      expect(10 + 5).toBe(15)
      expect(-1 + 1).toBe(0)
    })

    it('should multiply numbers correctly', () => {
      expect(3 * 4).toBe(12)
      expect(0 * 100).toBe(0)
      expect(-2 * 3).toBe(-6)
    })

    it('should handle division correctly', () => {
      expect(10 / 2).toBe(5)
      expect(9 / 3).toBe(3)
      expect(1 / 4).toBe(0.25)
    })
  })

  describe('String Operations', () => {
    it('should concatenate strings correctly', () => {
      expect('Hello' + ' ' + 'World').toBe('Hello World')
      expect('Bakery' + ' ' + 'Bliss').toBe('Bakery Bliss')
    })

    it('should check string length correctly', () => {
      expect('hello'.length).toBe(5)
      expect(''.length).toBe(0)
      expect('Bakery Bliss'.length).toBe(12)
    })

    it('should convert to uppercase correctly', () => {
      expect('hello'.toUpperCase()).toBe('HELLO')
      expect('bakery bliss'.toUpperCase()).toBe('BAKERY BLISS')
    })
  })

  describe('Array Operations', () => {
    it('should create arrays correctly', () => {
      const arr = [1, 2, 3]
      expect(arr.length).toBe(3)
      expect(arr[0]).toBe(1)
      expect(arr[2]).toBe(3)
    })

    it('should filter arrays correctly', () => {
      const numbers = [1, 2, 3, 4, 5]
      const evens = numbers.filter(n => n % 2 === 0)
      expect(evens).toEqual([2, 4])
    })

    it('should map arrays correctly', () => {
      const numbers = [1, 2, 3]
      const doubled = numbers.map(n => n * 2)
      expect(doubled).toEqual([2, 4, 6])
    })
  })

  describe('Object Operations', () => {
    it('should create objects correctly', () => {
      const user = {
        name: 'John Doe',
        age: 30,
        role: 'customer'
      }
      
      expect(user.name).toBe('John Doe')
      expect(user.age).toBe(30)
      expect(user.role).toBe('customer')
    })

    it('should handle object destructuring', () => {
      const order = {
        id: 1,
        total: 25.50,
        items: ['cake', 'cookies']
      }
      
      const { id, total, items } = order
      expect(id).toBe(1)
      expect(total).toBe(25.50)
      expect(items).toEqual(['cake', 'cookies'])
    })
  })

  describe('Date Operations', () => {
    it('should create dates correctly', () => {
      const date = new Date('2025-07-14')
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(6) // 0-indexed, July = 6
      expect(date.getDate()).toBe(14)
    })

    it('should format dates correctly', () => {
      const date = new Date('2025-07-14T10:30:00')
      const formatted = date.toLocaleDateString('en-US')
      expect(formatted).toMatch(/7\/14\/2025/)
    })
  })

  describe('Bakery Business Logic', () => {
    it('should calculate order total correctly', () => {
      const calculateTotal = (items: { price: number; quantity: number }[]) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0)
      }

      const items = [
        { price: 10.00, quantity: 2 },
        { price: 5.50, quantity: 3 },
        { price: 15.00, quantity: 1 }
      ]

      const total = calculateTotal(items)
      expect(total).toBe(51.5) // 20 + 16.5 + 15
    })

    it('should calculate baker commission correctly', () => {
      const calculateCommission = (orderTotal: number, percentage: number) => {
        return (orderTotal * percentage) / 100
      }

      expect(calculateCommission(100, 15)).toBe(15)
      expect(calculateCommission(200, 20)).toBe(40)
      expect(calculateCommission(50.5, 10)).toBe(5.05)
    })

    it('should validate order status transitions', () => {
      const isValidStatusTransition = (from: string, to: string) => {
        const validTransitions: Record<string, string[]> = {
          'pending': ['confirmed', 'cancelled'],
          'confirmed': ['in_progress', 'cancelled'],
          'in_progress': ['completed', 'cancelled'],
          'completed': ['delivered'],
          'delivered': [],
          'cancelled': []
        }
        
        return validTransitions[from]?.includes(to) ?? false
      }

      expect(isValidStatusTransition('pending', 'confirmed')).toBe(true)
      expect(isValidStatusTransition('confirmed', 'in_progress')).toBe(true)
      expect(isValidStatusTransition('completed', 'delivered')).toBe(true)
      expect(isValidStatusTransition('pending', 'delivered')).toBe(false)
      expect(isValidStatusTransition('delivered', 'cancelled')).toBe(false)
    })

    it('should validate user roles correctly', () => {
      const hasPermission = (userRole: string, requiredRole: string) => {
        const roleHierarchy: Record<string, number> = {
          'customer': 1,
          'junior_baker': 2,
          'main_baker': 3,
          'admin': 4
        }
        
        return (roleHierarchy[userRole] ?? 0) >= (roleHierarchy[requiredRole] ?? 0)
      }

      expect(hasPermission('admin', 'customer')).toBe(true)
      expect(hasPermission('main_baker', 'junior_baker')).toBe(true)
      expect(hasPermission('customer', 'main_baker')).toBe(false)
      expect(hasPermission('junior_baker', 'admin')).toBe(false)
    })
  })
})
