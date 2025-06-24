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
  chatParticipants, type ChatParticipant, type InsertChatParticipant,
  bakerApplications, type BakerApplication, type InsertBakerApplication,
  bakerTeams, type BakerTeam, type InsertBakerTeam,
  reviews, type Review, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ne, desc, sql, like, or, gte, notInArray, inArray } from "drizzle-orm";

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
  createCustomCake(cake: InsertCustomCake): Promise<CustomCake>;  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderWithDetails(id: number): Promise<any>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrdersWithDetailsByUserId(userId: number): Promise<any[]>;  getOrdersByJuniorBaker(juniorBakerId: number): Promise<any[]>; // New method for tasks
  getOrdersByJuniorBakerWithCustomerInfo(juniorBakerId: number): Promise<any[]>; // For chat feature
  getCustomerOrdersForChat(customerId: number): Promise<any[]>; // For customer chat  assignOrderToJuniorBaker(orderId: number, juniorBakerId: number, deadline?: string): Promise<Order | undefined>; // Updated signature
  assignOrderToMainBaker(orderId: number, mainBakerId: number, deadline?: string): Promise<Order | undefined>; // New method for main baker self-assignment
  takeOrderAsMainBaker(orderId: number, mainBakerId: number, deadline?: string): Promise<Order | undefined>; // New method for main baker to take order themselves
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getUserOrders(userId: number): Promise<Order[]>;
  getUserOrdersWithDetails(userId: number): Promise<any[]>;
  getMainBakerOrders(mainBakerId: number): Promise<Order[]>;
  getJuniorBakerOrders(juniorBakerId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderByOrderId(orderId: string): Promise<any>;
  updateOrderStatus(orderId: number, status: "pending" | "processing" | "quality_check" | "ready" | "delivered" | "cancelled"): Promise<Order | undefined>;
  deleteOrder(orderId: number): Promise<void>;
  
  // Chat methods
  createChat(chat: InsertChat): Promise<Chat>;
  getChatsByOrderId(orderId: number): Promise<Chat[]>;
  markChatsAsRead(chatIds: number[]): Promise<void>;  // Baker application methods
  createBakerApplication(application: InsertBakerApplication): Promise<BakerApplication>;
  getBakerApplicationById(id: number): Promise<BakerApplication | undefined>;
  getBakerApplicationsByMainBaker(mainBakerId: number): Promise<BakerApplication[]>;
  getBakerApplicationsByUser(userId: number): Promise<BakerApplication[]>;
  getApplicationsForMainBaker(mainBakerId: number): Promise<any[]>;
  updateBakerApplicationStatus(applicationId: number, status: string, reviewerId: number): Promise<BakerApplication | undefined>;
  
  // Baker team methods
  createBakerTeam(team: InsertBakerTeam): Promise<BakerTeam>;
  getJuniorBakersByMainBaker(mainBakerId: number): Promise<User[]>;
  getMainBakerByJuniorBaker(juniorBakerId: number): Promise<User | undefined>;
  updateUserCompletedOrders(userId: number): Promise<void>;
  getUsersWithRole(role: string): Promise<User[]>;
  
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
  getBakerAverageRating(juniorBakerId: number): Promise<number>;  getAllReviews(): Promise<any[]>;
  canUserReviewOrder(userId: number, orderId: number): Promise<boolean>;
  getJuniorBakerCompletedOrdersWithReviews(juniorBakerId: number): Promise<any[]>;

  // Admin methods
  getAdminStats(): Promise<any>;
  getAllUsers(): Promise<User[]>;
  getAllOrdersWithDetails(): Promise<any[]>;
  getAllBakerApplications(): Promise<BakerApplication[]>;
  deleteUser(userId: number): Promise<void>;
  updateProduct(productId: number, updateData: any): Promise<Product>;
  deleteProduct(productId: number): Promise<void>;
  // Get all junior bakers
  getJuniorBakers(): Promise<User[]>;
  getCustomCakeById(customCakeId: number): Promise<CustomCake | null>;
  getCurrentOrdersCountForBaker(bakerId: number): Promise<number>;
  getCompletedOrdersCount(bakerId: number): Promise<number>;
  // Get customer orders with baker info for chat
  getCustomerOrdersForChat(customerId: number): Promise<any[]>;
  // Get orders assigned to junior baker with customer info for chat
  getOrdersByJuniorBakerWithCustomerInfo(juniorBakerId: number): Promise<any[]>;
  getJuniorBakerCompletedOrdersWithReviews(juniorBakerId: number): Promise<any[]>;
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
    return await db.select()
      .from(products)
      .where(eq(products.mainBakerId, mainBakerId))
      .orderBy(products.createdAt);
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
    return cake;  }
  
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
  }  async getOrderById(id: number): Promise<Order | undefined> {
    try {
      const [order] = await db.select()
        .from(orders)
        .where(eq(orders.id, id));
      return order;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  }

  async getOrderWithDetails(id: number): Promise<any> {
    try {
      // Get order
      const order = await this.getOrderById(id);
      if (!order) return null;

      // Get order items
      const items = await db.select()
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(customCakes, eq(orderItems.customCakeId, customCakes.id))
        .where(eq(orderItems.orderId, id));

      // Get shipping info
      const [shipping] = await db.select()
        .from(shippingInfo)
        .where(eq(shippingInfo.orderId, id));

      return {
        ...order,
        items: items.map(item => ({
          id: item.order_items.id,
          productId: item.order_items.productId,
          customCakeId: item.order_items.customCakeId,
          quantity: item.order_items.quantity,
          pricePerItem: item.order_items.pricePerItem,
          product: item.products ? {
            id: item.products.id,
            name: item.products.name,
            imageUrl: item.products.imageUrl
          } : null,          customCake: item.custom_cakes ? {
            id: item.custom_cakes.id,
            name: item.custom_cakes.name || `Custom Cake`
          } : null
        })),
        shippingInfo: shipping || null
      };
    } catch (error) {
      console.error('Error fetching order with details:', error);
      throw error;
    }
  }
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    try {
      return await db.select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error('Error fetching orders by user ID:', error);
      throw error;
    }
  }

  async getOrdersWithDetailsByUserId(userId: number): Promise<any[]> {
    try {
      const userOrders = await this.getOrdersByUserId(userId);
      
      const ordersWithDetails = await Promise.all(
        userOrders.map(async (order) => {
          // Get order items for each order
          const items = await db.select()
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .leftJoin(customCakes, eq(orderItems.customCakeId, customCakes.id))
            .where(eq(orderItems.orderId, order.id));

          return {
            ...order,
            items: items.map(item => ({
              id: item.order_items.id,
              productId: item.order_items.productId,
              customCakeId: item.order_items.customCakeId,
              quantity: item.order_items.quantity,
              pricePerItem: item.order_items.pricePerItem,
              price: item.order_items.pricePerItem, // Alias for compatibility
              product: item.products ? {
                id: item.products.id,
                name: item.products.name,
                imageUrl: item.products.imageUrl
              } : null,              customCake: item.custom_cakes ? {
                id: item.custom_cakes.id,
                name: item.custom_cakes.name || `Custom Cake`
              } : null,
              name: item.products?.name || (item.custom_cakes ? (item.custom_cakes.name || 'Custom Cake') : 'Unknown Item'),
              imageUrl: item.products?.imageUrl || null
            }))
          };
        })
      );

      return ordersWithDetails;
    } catch (error) {
      console.error('Error fetching orders with details by user ID:', error);
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
    .orderBy(desc(orders.createdAt));    // Get order items for each order
    for (const order of ordersWithDetails) {
      const items = await db.select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        pricePerItem: orderItems.pricePerItem,
        productName: products.name,
        customCakeName: customCakes.name,
        productId: orderItems.productId,
        customCakeId: orderItems.customCakeId
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(customCakes, eq(orderItems.customCakeId, customCakes.id))
      .where(eq(orderItems.orderId, order.id));

      (order as any).items = items.map(item => ({
        id: item.id,
        name: item.productName || item.customCakeName || 'Unknown Item',
        quantity: item.quantity,
        price: item.pricePerItem,
        isCustomCake: !!item.customCakeId
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

  // Get orders assigned to junior baker with detailed task information
  async getOrdersByJuniorBaker(juniorBakerId: number): Promise<any[]> {    // Get orders assigned to this junior baker with shipping info
    const ordersWithShipping = await db.select({
      id: orders.id,
      orderId: orders.orderId,
      status: orders.status,
      totalAmount: orders.totalAmount,
      deadline: orders.deadline,
      createdAt: orders.createdAt,
      userId: orders.userId,
      customerName: shippingInfo.fullName,
      customerEmail: shippingInfo.email,
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zipCode,
      phone: shippingInfo.phone,
      paymentMethod: shippingInfo.paymentMethod,
    })
    .from(orders)
    .leftJoin(shippingInfo, eq(orders.id, shippingInfo.orderId))
    .where(eq(orders.juniorBakerId, juniorBakerId))
    .orderBy(orders.deadline, orders.createdAt);
    
    // Get order items for each order
    const tasksWithItems = await Promise.all(
      ordersWithShipping.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          productId: orderItems.productId,
          customCakeId: orderItems.customCakeId,
          quantity: orderItems.quantity,
          pricePerItem: orderItems.pricePerItem,
          productName: products.name,
          productDescription: products.description,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));
        
        // Calculate priority based on deadline
        const priority = order.deadline ? 
          (new Date(order.deadline).getTime() < Date.now() + 24 * 60 * 60 * 1000 ? 'high' : 
           new Date(order.deadline).getTime() < Date.now() + 72 * 60 * 60 * 1000 ? 'medium' : 'low') 
          : 'low';        return {
          id: order.id,
          orderId: order.orderId,
          status: order.status,
          totalAmount: order.totalAmount,
          deadline: order.deadline,
          createdAt: order.createdAt,
          userId: order.userId || 0,
          userName: order.customerName || 'Unknown Customer',
          userEmail: order.customerEmail || '',
          items: items.map(item => ({
            id: item.id,
            productName: item.productName || undefined,
            customCakeName: item.productName ? undefined : 'Custom Cake',
            quantity: item.quantity,
            pricePerItem: item.pricePerItem,
          })),
          shippingInfo: order.address ? {
            fullName: order.customerName || '',
            address: order.address,
            city: order.city || '',
            state: order.state || '',
            zipCode: order.zipCode || '',
          } : undefined,
        };
      })
    );
    
    return tasksWithItems;
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
  async assignOrderToJuniorBaker(orderId: number, juniorBakerId: number, deadline?: string): Promise<Order | undefined> {
    // Get the order to check if it already has a chat
    const [existingOrder] = await db.select().from(orders).where(eq(orders.id, orderId));
    
    // Prepare update data
    const updateData: any = {
      juniorBakerId, 
      status: 'pending', // Set to pending when assigned
      updatedAt: new Date()
    };
    
    // Add deadline if provided
    if (deadline) {
      updateData.deadline = new Date(deadline);
    }
    
    // Update the order with the junior baker ID and optional deadline
    const [order] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    
    if (order) {
      // Initialize chat participants for this order
      await this.initializeChatForOrder(order.id);
    }
    
    return order;
  }
  
  async assignOrderToMainBaker(orderId: number, mainBakerId: number, deadline?: string): Promise<Order | undefined> {
    // Get the order to check if it already has a chat
    const [existingOrder] = await db.select().from(orders).where(eq(orders.id, orderId));
    
    // Prepare update data
    const updateData: any = {
      mainBakerId, 
      status: 'pending', // Set to pending when assigned
      updatedAt: new Date()
    };
    
    // Add deadline if provided
    if (deadline) {
      updateData.deadline = new Date(deadline);
    }
    
    // Update the order with the main baker ID and optional deadline
    const [order] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    
    if (order) {
      // Initialize chat participants for this order
      await this.initializeChatForOrder(order.id);
    }
    
    return order;
  }

  // New method for main baker to take order themselves (self-assign)
  async takeOrderAsMainBaker(orderId: number, mainBakerId: number, deadline?: string): Promise<Order | undefined> {
    // Prepare update data - main baker takes the order themselves
    const updateData: any = {
      status: 'processing', // Set to processing when main baker takes it
      juniorBakerId: null, // Clear any junior baker assignment
      updatedAt: new Date()
    };
    
    // Add deadline if provided
    if (deadline) {
      updateData.deadline = new Date(deadline);
    }
    
    // Update the order - main baker is already assigned, just taking it
    const [order] = await db.update(orders)
      .set(updateData)
      .where(and(
        eq(orders.id, orderId),
        eq(orders.mainBakerId, mainBakerId)
      ))
      .returning();
    
    if (order) {
      // Initialize chat participants for this order
      await this.initializeChatForOrder(order.id);
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
  async getChatsByOrderId(orderId: number): Promise<(Chat & { senderName: string })[]> {
    const result = await db.select({
      id: chats.id,
      orderId: chats.orderId,
      senderId: chats.senderId,
      message: chats.message,
      timestamp: chats.timestamp,
      isRead: chats.isRead,
      senderName: users.fullName
    })
      .from(chats)
      .leftJoin(users, eq(chats.senderId, users.id))
      .where(eq(chats.orderId, orderId))
      .orderBy(chats.timestamp);
    
    return result.map(row => ({
      ...row,
      senderName: row.senderName || 'Unknown User'
    }));
  }

  async addChatParticipant(participantData: InsertChatParticipant): Promise<ChatParticipant> {
    const [participant] = await db.insert(chatParticipants).values(participantData).returning();
    return participant;
  }
  async getChatParticipants(orderId: number): Promise<(ChatParticipant & { userName: string })[]> {
    const result = await db.select({
      id: chatParticipants.id,
      orderId: chatParticipants.orderId,
      userId: chatParticipants.userId,
      role: chatParticipants.role,
      joinedAt: chatParticipants.joinedAt,
      lastReadAt: chatParticipants.lastReadAt,
      userName: users.fullName
    })
      .from(chatParticipants)
      .leftJoin(users, eq(chatParticipants.userId, users.id))
      .where(eq(chatParticipants.orderId, orderId));
    
    return result.map(row => ({
      ...row,
      userName: row.userName || 'Unknown User'
    }));  }
  
  async initializeChatForOrder(orderId: number): Promise<void> {
    try {
      console.log('🔄 Initializing chat for order ID:', orderId);
      // Get order details to determine participants
      const order = await this.getOrderById(orderId);
      if (!order) {
        console.log('❌ Order not found for chat initialization:', orderId);
        return;
      }
      console.log('📦 Order found for chat initialization:', JSON.stringify(order, null, 2));

      // Add customer as participant
      if (order.userId) {
        console.log('➕ Adding customer as chat participant:', order.userId);
        await db.insert(chatParticipants).values({
          orderId,
          userId: order.userId,
          role: 'customer'
        }).onConflictDoNothing();
      }

      // Add junior baker as participant if assigned
      if (order.juniorBakerId) {
        console.log('➕ Adding junior baker as chat participant:', order.juniorBakerId);
        await db.insert(chatParticipants).values({
          orderId,
          userId: order.juniorBakerId,
          role: 'junior_baker'
        }).onConflictDoNothing();
      }

      // Add main baker as participant if assigned
      if (order.mainBakerId) {
        console.log('➕ Adding main baker as chat participant:', order.mainBakerId);
        await db.insert(chatParticipants).values({
          orderId,
          userId: order.mainBakerId,
          role: 'main_baker'
        }).onConflictDoNothing();
      }
      console.log('✅ Chat initialization completed for order:', orderId);
    } catch (error) {
      console.error('❌ Error initializing chat for order:', orderId, error);
      throw error;
    }
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

  async getBakerApplicationById(id: number): Promise<BakerApplication | undefined> {
    const [application] = await db.select()
      .from(bakerApplications)
      .where(eq(bakerApplications.id, id));
    return application;
  }
  async getBakerApplicationsByMainBaker(mainBakerId: number): Promise<BakerApplication[]> {
    return await db.select()
      .from(bakerApplications)
      .where(and(
        eq(bakerApplications.mainBakerId, mainBakerId),
        eq(bakerApplications.status, 'pending')
      ));
  }

  async getBakerApplicationsByUser(userId: number): Promise<BakerApplication[]> {
    return await db.select()
      .from(bakerApplications)
      .where(eq(bakerApplications.userId, userId));
  }

  async getApplicationsForMainBaker(mainBakerId: number): Promise<any[]> {
    const result = await db.select({
      id: bakerApplications.id,
      userId: bakerApplications.userId,
      currentRole: bakerApplications.currentRole,
      requestedRole: bakerApplications.requestedRole,
      reason: bakerApplications.reason,
      status: bakerApplications.status,
      createdAt: bakerApplications.createdAt,
      applicantName: users.fullName,
      applicantEmail: users.email
    })
    .from(bakerApplications)
    .innerJoin(users, eq(bakerApplications.userId, users.id))    .where(and(
      eq(bakerApplications.mainBakerId, mainBakerId),
      eq(bakerApplications.status, 'pending'),
      eq(bakerApplications.requestedRole, 'junior_baker')
    ));
    
    return result;
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

  // Baker team methods
  async createBakerTeam(teamData: InsertBakerTeam): Promise<BakerTeam> {
    const [team] = await db.insert(bakerTeams).values(teamData).returning();
    return team;
  }  async getJuniorBakersByMainBaker(mainBakerId: number): Promise<User[]> {
    const result = await db.select()      .from(bakerTeams)
      .innerJoin(users, eq(bakerTeams.juniorBakerId, users.id))
      .where(and(
        eq(bakerTeams.mainBakerId, mainBakerId),
        eq(bakerTeams.isActive, true),
        eq(users.role, 'junior_baker')
      ));
    
    return result.map(r => r.users);
  }

  async getMainBakerByJuniorBaker(juniorBakerId: number): Promise<User | undefined> {
    const result = await db.select()
    .from(bakerTeams)
    .innerJoin(users, eq(bakerTeams.mainBakerId, users.id))
    .where(and(
      eq(bakerTeams.juniorBakerId, juniorBakerId),
      eq(bakerTeams.isActive, true)
    ));
    
    return result[0]?.users;
  }

  async updateUserCompletedOrders(userId: number): Promise<void> {
    await db.update(users)
      .set({ 
        completedOrders: sql`${users.completedOrders} + 1`
      })
      .where(eq(users.id, userId));
  }

  async getUsersWithRole(role: string): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(eq(users.role, role as any));
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
    try {
      // Get incoming orders (pending orders without a junior baker)
      const incomingOrdersResult = await db.select({ count: sql`count(*)` })
        .from(orders)
        .where(and(
          eq(orders.status, 'pending'),
          sql`${orders.juniorBakerId} IS NULL`
        ));
      const incomingOrders = Number(incomingOrdersResult[0]?.count) || 0;
      
      // Get pending tasks (orders in processing or quality check)
      const pendingTasksResult = await db.select({ count: sql`count(*)` })
        .from(orders)
        .where(or(
          eq(orders.status, 'processing'),
          eq(orders.status, 'quality_check')
        ));
      const pendingTasks = Number(pendingTasksResult[0]?.count) || 0;
      
      // Calculate average task time (in minutes)
      const completedOrdersResult = await db.select({
        avgTime: sql`AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60)`
      })
      .from(orders)
      .where(and(
        eq(orders.status, 'ready'),
        sql`updated_at > created_at`
      ));
      const avgTaskTime = Math.round(Number(completedOrdersResult[0]?.avgTime) || 45);
      
      // Calculate team performance (percentage of orders completed on time)
      const performanceResult = await db.select({
        total: sql`count(*)`,
        onTime: sql`count(*) filter (where deadline >= updated_at)`
      })
      .from(orders)
      .where(eq(orders.status, 'ready'));
      
      const total = Number(performanceResult[0]?.total) || 0;
      const onTime = Number(performanceResult[0]?.onTime) || 0;
      const teamPerformance = total > 0 ? Math.round((onTime / total) * 100) : 95;
      
      // Get orders needing assignment to a junior baker
      const ordersNeedingAssignment = await db.select({
        id: orders.id,
        orderId: orders.orderId,
        status: orders.status,
        deadline: orders.deadline,
        customerName: users.fullName,
        items: sql`string_agg(${orderItems.quantity} || 'x ' || ${products.name}, ', ')`
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(and(
        eq(orders.status, 'pending'),
        sql`${orders.juniorBakerId} IS NULL`
      ))
      .groupBy(orders.id, users.fullName)
      .orderBy(orders.deadline)
      .limit(5);
      
      return {
        incomingOrders,
        pendingTasks,
        avgTaskTime,
        teamPerformance,
        ordersNeedingAssignment
      };
    } catch (error) {
      console.error('Error fetching main baker stats:', error);
      throw error;
    }
  }

  async getMainBakersWithStats(): Promise<any[]> {
    try {
      const mainBakers = await db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        profileImage: users.profileImage,
        completedOrders: users.completedOrders,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.role, 'main_baker'));

      // Get team size for each main baker
      const bakersWithStats = await Promise.all(
        mainBakers.map(async (baker) => {
          const teamMembers = await this.getJuniorBakersByMainBaker(baker.id);
          const averageRating = await this.getBakerAverageRating(baker.id);
          
          return {
            id: baker.id,
            fullName: baker.fullName,
            email: baker.email,
            profileImage: baker.profileImage,
            completedOrders: baker.completedOrders || 0,
            teamSize: teamMembers.length,
            averageRating: averageRating || 0,
            joinedAt: baker.createdAt
          };
        })
      );

      return bakersWithStats;
    } catch (error) {
      console.error('Error fetching main bakers with stats:', error);
      throw error;
    }
  }

  // Get all junior bakers
  async getJuniorBakers(): Promise<User[]> {
    try {
      const juniorBakers = await db.select()
        .from(users)
        .where(eq(users.role, 'junior_baker'))
        .orderBy(users.fullName);
      
      return juniorBakers;
    } catch (error) {
      console.error('Error fetching junior bakers:', error);
      throw error;
    }
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
  // Assign a junior baker to a main baker using baker_teams table
  async assignJuniorBakerToMainBaker(juniorBakerId: number, mainBakerId: number): Promise<void> {
    // First, deactivate any existing assignments for this junior baker
    await db.update(bakerTeams)
      .set({ isActive: false })
      .where(eq(bakerTeams.juniorBakerId, juniorBakerId));
    
    // Create new active assignment
    await db.insert(bakerTeams).values({
      mainBakerId,
      juniorBakerId,
      isActive: true
    });
  }

  // Get unassigned junior bakers
  async getUnassignedJuniorBakers(): Promise<User[]> {
    // Get all junior bakers who are not in an active baker team
    const assignedJuniorBakerIds = await db.select({ id: bakerTeams.juniorBakerId })
      .from(bakerTeams)
      .where(eq(bakerTeams.isActive, true));
    
    const assignedIds = assignedJuniorBakerIds.map(item => item.id);
    
    if (assignedIds.length === 0) {
      // No one is assigned, return all junior bakers
      return await db.select()
        .from(users)
        .where(eq(users.role, 'junior_baker'));
    }
    
    // Return junior bakers not in the assigned list
    return await db.select()
      .from(users)
      .where(and(
        eq(users.role, 'junior_baker'),
        notInArray(users.id, assignedIds)
      ));
  }
  // Get custom cake by ID
  async getCustomCakeById(customCakeId: number): Promise<CustomCake | null> {
    const [customCake] = await db.select()
      .from(customCakes)
      .where(eq(customCakes.id, customCakeId));
    
    return customCake || null;
  }

  // Get current orders count for a baker
  async getCurrentOrdersCountForBaker(bakerId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.juniorBakerId, bakerId),
          notInArray(orders.status, ['delivered', 'cancelled'])
        )
      );
    
    return result[0]?.count || 0;
  }

  // Get completed orders count for a baker
  async getCompletedOrdersCount(bakerId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.juniorBakerId, bakerId),
          inArray(orders.status, ['delivered'])
        )
      );
    
    return result[0]?.count || 0;
  }

  // Get customer orders with baker info for chat
  async getCustomerOrdersForChat(customerId: number): Promise<any[]> {
    const customerOrders = await db.select({
      id: orders.id,
      orderNumber: orders.orderId,
      status: orders.status,
      total: orders.totalAmount,
      createdAt: orders.createdAt,
      juniorBakerId: orders.juniorBakerId,
      assignedBaker: users.fullName,
    })
    .from(orders)
    .leftJoin(users, eq(orders.juniorBakerId, users.id))
    .where(eq(orders.userId, customerId))
    .orderBy(desc(orders.createdAt));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      customerOrders.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          productId: orderItems.productId,
          customCakeId: orderItems.customCakeId,
          quantity: orderItems.quantity,
          pricePerItem: orderItems.pricePerItem,
          productName: products.name,
          productDescription: products.description,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            customCakeId: item.customCakeId,
            quantity: item.quantity,
            pricePerItem: item.pricePerItem,
            productName: item.productName || 'Custom Cake',
            productDescription: item.productDescription || 'Custom cake design',
          })),
        };
      })
    );

    return ordersWithItems;
  }

  // Get orders assigned to junior baker with customer info for chat
  async getOrdersByJuniorBakerWithCustomerInfo(juniorBakerId: number): Promise<any[]> {
    const ordersWithCustomer = await db.select({
      id: orders.id,
      orderNumber: orders.orderId,
      status: orders.status,
      total: orders.totalAmount,
      createdAt: orders.createdAt,
      deadline: orders.deadline,
      customerId: orders.userId,
      customerName: users.fullName,
      customerEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.juniorBakerId, juniorBakerId))
    .orderBy(desc(orders.createdAt));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersWithCustomer.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          productId: orderItems.productId,
          customCakeId: orderItems.customCakeId,
          quantity: orderItems.quantity,
          pricePerItem: orderItems.pricePerItem,
          productName: products.name,
          productDescription: products.description,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            customCakeId: item.customCakeId,
            quantity: item.quantity,
            pricePerItem: item.pricePerItem,
            productName: item.productName || 'Custom Cake',
            productDescription: item.productDescription || 'Custom cake design',
          })),
        };
      })
    );

    return ordersWithItems;
  }

  async getJuniorBakerCompletedOrdersWithReviews(juniorBakerId: number): Promise<any[]> {
    try {
      // Get completed orders for this junior baker
      const ordersData = await db.select({
        orderId: orders.id,
        orderNumber: orders.orderId,
        customerName: users.fullName,
        total: orders.totalAmount,
        status: orders.status,
        completedAt: orders.updatedAt,
        createdAt: orders.createdAt
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(
        and(
          eq(orders.juniorBakerId, juniorBakerId),
          inArray(orders.status, ['delivered', 'ready'])
        )
      )
      .orderBy(desc(orders.updatedAt));

      // Get reviews for these orders
      const orderIds = ordersData.map(order => order.orderId);
      const reviewsData = orderIds.length > 0 ? await db.select({
        orderId: reviews.orderId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt
      })
      .from(reviews)
      .where(inArray(reviews.orderId, orderIds)) : [];

      // Get order items for each order
      const orderItemsData = orderIds.length > 0 ? await db.select({
        orderId: orderItems.orderId,
        productName: products.name,
        customCakeName: customCakes.name,
        quantity: orderItems.quantity
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(customCakes, eq(orderItems.customCakeId, customCakes.id))
      .where(inArray(orderItems.orderId, orderIds)) : [];

      // Combine data
      const completedOrders = ordersData.map(order => {
        const orderReview = reviewsData.find(review => review.orderId === order.orderId);
        const items = orderItemsData
          .filter(item => item.orderId === order.orderId)
          .map(item => `${item.productName || item.customCakeName} (${item.quantity})`);
        
        // Calculate duration in hours (rough estimate)
        const duration = order.completedAt && order.createdAt ? 
          Math.round((new Date(order.completedAt).getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)) : 
          null;

        return {
          id: order.orderId,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          items,
          total: order.total,
          completedAt: order.completedAt,
          rating: orderReview?.rating || null,
          feedback: orderReview?.comment || null,
          duration: duration || 24 // Default to 24 hours if we can't calculate
        };
      });

      return completedOrders;
    } catch (error) {
      console.error('Error fetching junior baker completed orders with reviews:', error);
      throw error;
    }
  }

  // New method to get orders that main baker is personally working on
  async getMainBakerPersonalOrders(mainBakerId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(and(
        eq(orders.mainBakerId, mainBakerId),
        sql`${orders.juniorBakerId} IS NULL`,
        eq(orders.status, 'processing')
      ))
      .orderBy(desc(orders.updatedAt));
  }
}

export const storage = new DatabaseStorage();
