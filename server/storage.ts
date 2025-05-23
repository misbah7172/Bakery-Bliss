import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  cakeShapes, type CakeShape, type InsertCakeShape,
  cakeFlavors, type CakeFlavor, type InsertCakeFlavor,
  cakeFrostings, type CakeFrosting, type InsertCakeFrosting,
  cakeDecorations, type CakeDecoration, type InsertCakeDecoration,
  customCakes, type CustomCake, type InsertCustomCake,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  shippingInfo, type ShippingInfo, type InsertShippingInfo,
  chats, type Chat, type InsertChat,
  bakerApplications, type BakerApplication, type InsertBakerApplication
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ne, desc, sql, like, or, gte } from "drizzle-orm";

// Storage interface definition
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: number, role: "customer" | "junior_baker" | "main_baker" | "admin"): Promise<void>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsByMainBaker(mainBakerId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cake builder methods
  getAllCakeShapes(): Promise<CakeShape[]>;
  getAllCakeFlavors(): Promise<CakeFlavor[]>;
  getAllCakeFrostings(): Promise<CakeFrosting[]>;
  getAllCakeDecorations(): Promise<CakeDecoration[]>;
  createCustomCake(cake: InsertCustomCake): Promise<CustomCake>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getUserOrders(userId: number): Promise<Order[]>;
  getUserOrdersWithDetails(userId: number): Promise<any[]>;
  getMainBakerOrders(mainBakerId: number): Promise<Order[]>;
  getJuniorBakerOrders(juniorBakerId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderByOrderId(orderId: string): Promise<any>;
  updateOrderStatus(orderId: number, status: "pending" | "processing" | "quality_check" | "ready" | "delivered" | "cancelled"): Promise<Order | undefined>;
  assignOrderToJuniorBaker(orderId: number, juniorBakerId: number): Promise<Order | undefined>;
  deleteOrder(orderId: number): Promise<void>;
  
  // Chat methods
  createChat(chat: InsertChat): Promise<Chat>;
  getChatsByOrderId(orderId: number): Promise<Chat[]>;
  markChatsAsRead(chatIds: number[]): Promise<void>;
  
  // Baker application methods
  createBakerApplication(application: InsertBakerApplication): Promise<BakerApplication>;
  updateBakerApplicationStatus(applicationId: number, status: string, reviewerId: number): Promise<BakerApplication | undefined>;
  
  // Dashboard stats methods
  getCustomerStats(userId: number): Promise<any>;
  getJuniorBakerStats(bakerId: number): Promise<any>;
  getMainBakerStats(): Promise<any>;
  
  // Shipping info methods
  addShippingInfo(info: InsertShippingInfo): Promise<ShippingInfo>;
  getShippingInfo(orderId: number): Promise<ShippingInfo | undefined>;
  
  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByOrderId(orderId: number): Promise<Review[]>;
  getReviewsByUserId(userId: number): Promise<Review[]>;
  getReviewsByJuniorBakerId(juniorBakerId: number): Promise<Review[]>;
  getBakerAverageRating(juniorBakerId: number): Promise<number>;
  getAllReviews(): Promise<any[]>;
  canUserReviewOrder(userId: number, orderId: number): Promise<boolean>;

  // Admin methods
  getAdminStats(): Promise<any>;
  getAllUsers(): Promise<User[]>;
  getAllOrdersWithDetails(): Promise<any[]>;
  getAllBakerApplications(): Promise<BakerApplication[]>;
  deleteUser(userId: number): Promise<void>;
  updateProduct(productId: number, updateData: any): Promise<Product>;
  deleteProduct(productId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserRole(userId: number, role: "customer" | "junior_baker" | "main_baker" | "admin"): Promise<void> {
    await db.update(users)
      .set({ role })
      .where(eq(users.id, userId));
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }
  
  async getProductsByMainBaker(mainBakerId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.mainBakerId, mainBakerId));
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }
  
  // Cake builder methods
  async getAllCakeShapes(): Promise<CakeShape[]> {
    return await db.select().from(cakeShapes);
  }

  async getAllCakeFlavors(): Promise<CakeFlavor[]> {
    return await db.select().from(cakeFlavors);
  }

  async getAllCakeFrostings(): Promise<CakeFrosting[]> {
    return await db.select().from(cakeFrostings);
  }

  async getAllCakeDecorations(): Promise<CakeDecoration[]> {
    return await db.select().from(cakeDecorations);
  }

  async createCustomCake(cakeData: InsertCustomCake): Promise<CustomCake> {
    const [cake] = await db.insert(customCakes).values(cakeData).returning();
    return cake;
  }
  
  // Order methods
  async createOrder(orderData: InsertOrder): Promise<Order> {
    try {
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      const [order] = await db.insert(orders).values(orderData).returning();
      console.log('Order created:', JSON.stringify(order, null, 2));
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async addOrderItem(itemData: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values(itemData).returning();
    return item;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getUserOrdersWithDetails(userId: number): Promise<any[]> {
    const ordersWithDetails = await db.select({
      id: orders.id,
      orderId: orders.orderId,
      status: orders.status,
      totalAmount: orders.totalAmount,
      deadline: orders.deadline,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userFullName: users.fullName,
      userEmail: users.email
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(shippingInfo, eq(orders.id, shippingInfo.orderId))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

    // Get order items for each order
    for (const order of ordersWithDetails) {
      const items = await db.select({
        quantity: orderItems.quantity,
        pricePerItem: orderItems.pricePerItem,
        productName: products.name,
        customCakeName: customCakes.name
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(customCakes, eq(orderItems.customCakeId, customCakes.id))
      .where(eq(orderItems.orderId, order.id));

      (order as any).items = items.map(item => ({
        productName: item.productName,
        customCakeName: item.customCakeName,
        quantity: item.quantity,
        pricePerItem: item.pricePerItem
      }));
    }

    return ordersWithDetails;
  }

  async getOrderByOrderId(orderId: string): Promise<any> {
    const [orderData] = await db.select({
      id: orders.id,
      orderId: orders.orderId,
      status: orders.status,
      totalAmount: orders.totalAmount,
      deadline: orders.deadline,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      userFullName: users.fullName,
      userEmail: users.email
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(shippingInfo, eq(orders.id, shippingInfo.orderId))
    .where(eq(orders.orderId, orderId));

    if (!orderData) {
      return null;
    }

    // Get order items
    const items = await db.select({
      quantity: orderItems.quantity,
      pricePerItem: orderItems.pricePerItem,
      productName: products.name,
      customCakeName: customCakes.name
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(customCakes, eq(orderItems.customCakeId, customCakes.id))
    .where(eq(orderItems.orderId, orderData.id));

    return {
      ...orderData,
      user: {
        fullName: orderData.userFullName,
        email: orderData.userEmail
      },
      items: items.map(item => ({
        productName: item.productName,
        customCakeName: item.customCakeName,
        quantity: item.quantity,
        pricePerItem: item.pricePerItem
      }))
    };
  }

  async getMainBakerOrders(mainBakerId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.mainBakerId, mainBakerId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getJuniorBakerOrders(juniorBakerId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.juniorBakerId, juniorBakerId))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderId: number, status: "pending" | "processing" | "quality_check" | "ready" | "delivered" | "cancelled"): Promise<Order | undefined> {
    const [order] = await db.update(orders)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }

  async assignOrderToJuniorBaker(orderId: number, juniorBakerId: number): Promise<Order | undefined> {
    // Get the order to check if it already has a chat
    const [existingOrder] = await db.select().from(orders).where(eq(orders.id, orderId));
    
    // Update the order with the junior baker ID
    const [order] = await db.update(orders)
      .set({ 
        juniorBakerId, 
        status: 'processing', // Automatically update status to processing
        updatedAt: new Date() 
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    if (order) {
      // Create initial chat message automatically
      const customerMessage: InsertChat = {
        senderId: order.userId,
        receiverId: juniorBakerId,
        orderId: order.id,
        message: "Hello! I've placed this order and look forward to working with you.",
        isRead: false
      };
      
      await this.createChat(customerMessage);
      
      // Create baker welcome message
      const bakerMessage: InsertChat = {
        senderId: juniorBakerId,
        receiverId: order.userId,
        orderId: order.id,
        message: "Hi there! I'll be working on your order. Please let me know if you have any specific requests or questions!",
        isRead: false
      };
      
      await this.createChat(bakerMessage);
    }
    
    return order;
  }
  
  async deleteOrder(orderId: number): Promise<void> {
    try {
      console.log('Deleting order:', orderId);
      await db.delete(orders).where(eq(orders.id, orderId));
      console.log('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
  
  // Chat methods
  async createChat(chatData: InsertChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values(chatData).returning();
    return chat;
  }

  async getChatsByOrderId(orderId: number): Promise<Chat[]> {
    return await db.select()
      .from(chats)
      .where(eq(chats.orderId, orderId))
      .orderBy(chats.timestamp);
  }

  async markChatsAsRead(chatIds: number[]): Promise<void> {
    await db.update(chats)
      .set({ isRead: true })
      .where(sql`${chats.id} IN ${chatIds}`);
  }
  
  // Baker application methods
  async createBakerApplication(applicationData: InsertBakerApplication): Promise<BakerApplication> {
    const [application] = await db.insert(bakerApplications).values(applicationData).returning();
    return application;
  }

  async updateBakerApplicationStatus(applicationId: number, status: string, reviewerId: number): Promise<BakerApplication | undefined> {
    const [application] = await db.update(bakerApplications)
      .set({ 
        status, 
        reviewedBy: reviewerId, 
        updatedAt: new Date() 
      })
      .where(eq(bakerApplications.id, applicationId))
      .returning();
    return application;
  }
  
  // Dashboard stats methods
  async getCustomerStats(userId: number): Promise<any> {
    // Get total orders
    const totalOrdersResult = await db.select({ count: sql`count(*)` })
      .from(orders)
      .where(eq(orders.userId, userId));
    const totalOrders = Number(totalOrdersResult[0]?.count) || 0;
    
    // Get pending orders
    const pendingOrdersResult = await db.select({ count: sql`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        or(
          eq(orders.status, 'pending'),
          eq(orders.status, 'processing')
        )
      ));
    const pendingOrders = Number(pendingOrdersResult[0]?.count) || 0;
    
    // Get total spent
    const totalSpentResult = await db.select({ 
      total: sql`sum(${orders.totalAmount})` 
    })
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        ne(orders.status, 'cancelled')
      ));
    const lifetimeValue = Number(totalSpentResult[0]?.total) || 0;
    
    // Get recent orders
    const recentOrders = await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(5);
    
    return {
      totalOrders,
      pendingOrders,
      lifetimeValue,
      recentOrders
    };
  }

  async getJuniorBakerStats(bakerId: number): Promise<any> {
    // Get assigned orders
    const assignedOrdersResult = await db.select({ count: sql`count(*)` })
      .from(orders)
      .where(eq(orders.juniorBakerId, bakerId));
    const assignedOrders = Number(assignedOrdersResult[0]?.count) || 0;
    
    // Get in-progress orders
    const inProgressResult = await db.select({ count: sql`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.juniorBakerId, bakerId),
        eq(orders.status, 'processing')
      ));
    const inProgressOrders = Number(inProgressResult[0]?.count) || 0;
    
    // Get quality check orders
    const qualityCheckResult = await db.select({ count: sql`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.juniorBakerId, bakerId),
        eq(orders.status, 'quality_check')
      ));
    const qualityCheckOrders = Number(qualityCheckResult[0]?.count) || 0;
    
    // Get completed orders
    const completedResult = await db.select({ count: sql`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.juniorBakerId, bakerId),
        or(
          eq(orders.status, 'ready'),
          eq(orders.status, 'delivered')
        )
      ));
    const completedOrders = Number(completedResult[0]?.count) || 0;
    
    // Get upcoming tasks
    const upcomingTasks = await db.select()
      .from(orders)
      .where(and(
        eq(orders.juniorBakerId, bakerId),
        or(
          eq(orders.status, 'pending'),
          eq(orders.status, 'processing'),
          eq(orders.status, 'quality_check')
        )
      ))
      .orderBy(orders.deadline)
      .limit(5);
    
    return {
      assignedOrders,
      inProgressOrders,
      qualityCheckOrders,
      completedOrders,
      upcomingTasks,
      // Performance is calculated as completed / (total - cancelled)
      performance: assignedOrders > 0 ? (completedOrders / assignedOrders) * 100 : 0
    };
  }

  async getMainBakerStats(): Promise<any> {
    // Get incoming orders
    const incomingOrdersResult = await db.select({ count: sql`count(*)` })
      .from(orders)
      .where(eq(orders.status, 'pending'));
    const incomingOrders = Number(incomingOrdersResult[0]?.count) || 0;
    
    // Get pending tasks
    const pendingTasksResult = await db.select({ count: sql`count(*)` })
      .from(orders)
      .where(or(
        eq(orders.status, 'processing'),
        eq(orders.status, 'quality_check')
      ));
    const pendingTasks = Number(pendingTasksResult[0]?.count) || 0;
    
    // Get average task time (in minutes) - this is a simplification
    const avgTaskTime = 45; // Placeholder value
    
    // Get team performance
    const teamPerformance = 91; // Placeholder value
    
    // Get orders needing assignment to a junior baker
    const ordersNeedingAssignment = await db.select()
      .from(orders)
      .where(and(
        eq(orders.status, 'pending'),
        sql`${orders.juniorBakerId} IS NULL`
      ))
      .orderBy(orders.deadline)
      .limit(5);
    
    return {
      incomingOrders,
      pendingTasks,
      avgTaskTime,
      teamPerformance,
      ordersNeedingAssignment
    };
  }
  
  // Shipping info methods
  async addShippingInfo(infoData: InsertShippingInfo): Promise<ShippingInfo> {
    const [info] = await db.insert(shippingInfo).values(infoData).returning();
    return info;
  }

  async getShippingInfo(orderId: number): Promise<ShippingInfo | undefined> {
    const [info] = await db.select().from(shippingInfo).where(eq(shippingInfo.orderId, orderId));
    return info;
  }

  // Admin methods
  async getAdminStats(): Promise<any> {
    // Get total counts
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalProductsResult = await db.select({ count: sql<number>`count(*)` }).from(products);
    const totalOrdersResult = await db.select({ count: sql<number>`count(*)` }).from(orders);
    
    // Get total revenue
    const revenueResult = await db.select({ 
      total: sql<number>`coalesce(sum(total_amount), 0)` 
    }).from(orders);
    
    // Get pending orders count
    const pendingOrdersResult = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(orders).where(eq(orders.status, 'pending'));
    
    // Get new users this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const newUsersResult = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(users).where(gte(users.createdAt, currentMonth));
    
    // Get recent orders with user info - properly mapped
    const recentOrdersData = await db.select({
      id: orders.id,
      orderId: orders.orderId,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt,
      userFullName: users.fullName
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(10);
    
    // Get recent users - properly mapped
    const recentUsersData = await db.select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(10);
    
    // Map database results to expected format
    const recentOrders = recentOrdersData.map(order => ({
      id: order.id,
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      userFullName: order.userFullName
    }));

    const recentUsers = recentUsersData.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));
    
    return {
      totalUsers: Number(totalUsersResult[0]?.count || 0),
      totalProducts: Number(totalProductsResult[0]?.count || 0),
      totalOrders: Number(totalOrdersResult[0]?.count || 0),
      totalRevenue: Number(revenueResult[0]?.total || 0),
      pendingOrders: Number(pendingOrdersResult[0]?.count || 0),
      newUsersThisMonth: Number(newUsersResult[0]?.count || 0),
      recentOrders,
      recentUsers
    };
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers; // Drizzle already maps full_name to fullName automatically
  }

  async getAllOrdersWithDetails(): Promise<any[]> {
    const ordersWithDetails = await db.select({
      id: orders.id,
      orderId: orders.orderId,
      userId: orders.userId,
      status: orders.status,
      totalAmount: orders.totalAmount,
      deadline: orders.deadline,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      mainBakerId: orders.mainBakerId,
      juniorBakerId: orders.juniorBakerId,
      userFullName: users.fullName,
      userEmail: users.email
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));
    
    return ordersWithDetails.map(order => ({
      ...order,
      user: {
        fullName: order.userFullName,
        email: order.userEmail
      }
    }));
  }

  async getAllBakerApplications(): Promise<BakerApplication[]> {
    return await db.select().from(bakerApplications).orderBy(desc(bakerApplications.createdAt));
  }

  async deleteUser(userId: number): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async updateProduct(productId: number, updateData: any): Promise<Product> {
    const result = await db.update(products)
      .set(updateData)
      .where(eq(products.id, productId))
      .returning();
    
    if (!result.length) {
      throw new Error("Product not found");
    }
    
    return result[0];
  }

  async deleteProduct(productId: number): Promise<void> {
    await db.delete(products).where(eq(products.id, productId));
  }

  // Review methods
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }

  async getReviewsByOrderId(orderId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.orderId, orderId));
  }

  async getReviewsByUserId(userId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByJuniorBakerId(juniorBakerId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.juniorBakerId, juniorBakerId)).orderBy(desc(reviews.createdAt));
  }

  async getBakerAverageRating(juniorBakerId: number): Promise<number> {
    const result = await db.select({ 
      avgRating: sql<number>`AVG(rating)` 
    }).from(reviews).where(eq(reviews.juniorBakerId, juniorBakerId));
    
    return Number(result[0]?.avgRating || 0);
  }

  async getAllReviews(): Promise<any[]> {
    const reviewsWithDetails = await db.select({
      id: reviews.id,
      orderId: reviews.orderId,
      rating: reviews.rating,
      comment: reviews.comment,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
      userFullName: users.fullName,
      userEmail: users.email,
      juniorBakerFullName: sql`junior_baker.full_name`
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(sql`users as junior_baker`, sql`${reviews.juniorBakerId} = junior_baker.id`)
    .orderBy(desc(reviews.createdAt));

    return reviewsWithDetails.map(review => ({
      id: review.id,
      orderId: review.orderId,
      rating: review.rating,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt,
      user: {
        fullName: review.userFullName,
        email: review.userEmail
      },
      juniorBaker: review.juniorBakerFullName ? {
        fullName: review.juniorBakerFullName
      } : null
    }));
  }

  async canUserReviewOrder(userId: number, orderId: number): Promise<boolean> {
    // Check if order exists, belongs to user, and is delivered
    const [order] = await db.select().from(orders).where(
      and(
        eq(orders.id, orderId),
        eq(orders.userId, userId),
        eq(orders.status, 'delivered')
      )
    );

    if (!order) return false;

    // Check if user already reviewed this order
    const [existingReview] = await db.select().from(reviews).where(
      and(
        eq(reviews.orderId, orderId),
        eq(reviews.userId, userId)
      )
    );

    return !existingReview;
  }
}

export const storage = new DatabaseStorage();
