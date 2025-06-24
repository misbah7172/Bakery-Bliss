// Baker payment distribution service
import { db } from "./db";
import { orders, users, bakerEarnings } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface PaymentDistribution {
  orderId: number;
  totalAmount: number;
  juniorBakerAmount?: number;
  mainBakerAmount: number;
  distributedAt: Date;
}

export class BakerPaymentService {
  
  /**
   * Calculate and distribute payment when an order is completed
   * @param orderId The completed order ID
   * @returns Payment distribution details
   */
  static async distributeOrderPayment(orderId: number): Promise<PaymentDistribution | null> {
    try {
      // Get order details
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (order.length === 0) {
        throw new Error(`Order ${orderId} not found`);
      }      const orderData = order[0];
      
      // Only distribute payment for delivered orders
      if (orderData.status !== 'delivered') {
        console.log(`Order ${orderId} is not delivered yet. Current status: ${orderData.status}`);
        return null;
      }

      // Skip orders without a main baker assigned
      if (!orderData.mainBakerId) {
        console.log(`Order ${orderId} has no main baker assigned. Skipping payment distribution.`);
        return null;
      }

      // Check if payment has already been distributed
      const existingEarnings = await db
        .select()
        .from(bakerEarnings)
        .where(eq(bakerEarnings.orderId, orderId));

      if (existingEarnings.length > 0) {
        console.log(`Payment already distributed for order ${orderId}`);
        return null;
      }

      const totalAmount = parseFloat(orderData.totalAmount.toString());
      let distribution: PaymentDistribution;

      if (orderData.juniorBakerId) {
        // Junior baker completed the order: 70% to junior, 30% to main baker
        const juniorBakerAmount = totalAmount * 0.70;
        const mainBakerAmount = totalAmount * 0.30;

        // Record junior baker earnings
        await db.insert(bakerEarnings).values({
          orderId: orderId,
          bakerId: orderData.juniorBakerId,
          bakerType: 'junior_baker',
          amount: juniorBakerAmount.toFixed(2),
          percentage: '70.00'
        });

        // Record main baker earnings
        await db.insert(bakerEarnings).values({
          orderId: orderId,
          bakerId: orderData.mainBakerId!,
          bakerType: 'main_baker',
          amount: mainBakerAmount.toFixed(2),
          percentage: '30.00'
        });

        distribution = {
          orderId,
          totalAmount,
          juniorBakerAmount,
          mainBakerAmount,
          distributedAt: new Date()
        };

        console.log(`✅ Payment distributed for order ${orderId}: Junior Baker $${juniorBakerAmount.toFixed(2)} (70%), Main Baker $${mainBakerAmount.toFixed(2)} (30%)`);

      } else {
        // Main baker completed the order: 100% to main baker
        const mainBakerAmount = totalAmount;

        // Record main baker earnings
        await db.insert(bakerEarnings).values({
          orderId: orderId,
          bakerId: orderData.mainBakerId!,
          bakerType: 'main_baker',
          amount: mainBakerAmount.toFixed(2),
          percentage: '100.00'
        });

        distribution = {
          orderId,
          totalAmount,
          mainBakerAmount,
          distributedAt: new Date()
        };

        console.log(`✅ Payment distributed for order ${orderId}: Main Baker $${mainBakerAmount.toFixed(2)} (100%)`);
      }

      return distribution;

    } catch (error) {
      console.error(`❌ Error distributing payment for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Get total earnings for a baker
   * @param bakerId The baker's user ID
   * @returns Total earnings amount
   */
  static async getBakerTotalEarnings(bakerId: number): Promise<number> {
    try {
      const earnings = await db
        .select()
        .from(bakerEarnings)
        .where(eq(bakerEarnings.bakerId, bakerId));

      const total = earnings.reduce((sum, earning) => {
        return sum + parseFloat(earning.amount.toString());
      }, 0);

      return total;
    } catch (error) {
      console.error(`❌ Error getting total earnings for baker ${bakerId}:`, error);
      return 0;
    }
  }

  /**
   * Get earnings breakdown for a baker
   * @param bakerId The baker's user ID
   * @returns Detailed earnings breakdown
   */
  static async getBakerEarningsBreakdown(bakerId: number) {
    try {
      const earnings = await db
        .select({
          orderId: bakerEarnings.orderId,
          amount: bakerEarnings.amount,
          percentage: bakerEarnings.percentage,
          bakerType: bakerEarnings.bakerType,
          createdAt: bakerEarnings.createdAt,
          orderNumber: orders.orderId,
          orderTotal: orders.totalAmount
        })
        .from(bakerEarnings)
        .leftJoin(orders, eq(bakerEarnings.orderId, orders.id))
        .where(eq(bakerEarnings.bakerId, bakerId))
        .orderBy(bakerEarnings.createdAt);

      return earnings;
    } catch (error) {
      console.error(`❌ Error getting earnings breakdown for baker ${bakerId}:`, error);
      return [];
    }
  }

  /**
   * Get earnings summary for all bakers
   * @returns Summary of all baker earnings
   */
  static async getAllBakersEarningsSummary() {
    try {
      const summary = await db
        .select({
          bakerId: bakerEarnings.bakerId,
          bakerName: users.fullName,
          bakerType: bakerEarnings.bakerType,
          totalEarnings: bakerEarnings.amount,
          orderCount: bakerEarnings.orderId
        })
        .from(bakerEarnings)
        .leftJoin(users, eq(bakerEarnings.bakerId, users.id));

      // Group by baker and calculate totals
      const groupedSummary = summary.reduce((acc, record) => {
        const key = `${record.bakerId}-${record.bakerType}`;
        if (!acc[key]) {
          acc[key] = {
            bakerId: record.bakerId,
            bakerName: record.bakerName,
            bakerType: record.bakerType,
            totalEarnings: 0,
            orderCount: 0
          };
        }
        acc[key].totalEarnings += parseFloat(record.totalEarnings?.toString() || '0');
        acc[key].orderCount += 1;
        return acc;
      }, {} as any);

      return Object.values(groupedSummary);
    } catch (error) {
      console.error('❌ Error getting all bakers earnings summary:', error);
      return [];
    }
  }
}
