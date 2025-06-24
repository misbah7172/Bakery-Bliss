import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import { z } from "zod";
import {
  insertUserSchema,
  insertProductSchema,
  insertCustomCakeSchema,
  insertOrderSchema,
  insertChatSchema,
  insertBakerApplicationSchema,
  orderStatusEnum,
  roleEnum,
  insertShippingInfoSchema,
  type InsertChat
} from "@shared/schema";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        fullName: string;
        role: string;
        profileImage?: string | null;
        customerSince?: number | null;
        completedOrders?: number | null;
        mainBakerId?: number | null;
      };
    }
  }
}

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: any) => {
  try {
    if (!req.session?.userId) {
      console.log('No user session found');
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log('Authentication attempt for user:', req.session.userId);
    
    const user = await storage.getUserById(req.session.userId);
    console.log('User found:', user);
    
    if (!user) {
      console.log('No user found for ID:', req.session.userId);
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Invalid session" });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profileImage: user.profileImage,
      customerSince: user.customerSince,
      completedOrders: user.completedOrders,
      mainBakerId: user.mainBakerId
    };
    console.log('Authentication successful for user:', user.id);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based access control middleware
const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: any) => {
    if (!req.user) {
      console.log('Authorization failed: No user in request');
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Ensure role is exactly "main_baker" for product creation
    const userRole = req.user.role;
    const isAuthorized = roles.some(role => role === userRole);

    console.log('Authorization check details:', {
      user: {
        id: req.user.id,
        email: req.user.email,
        role: userRole,
        roleType: typeof userRole
      },
      requiredRoles: roles,
      isAuthorized,
      roleComparison: roles.map(r => ({
        required: r,
        userRole: userRole,
        matches: r === userRole,
        requiredType: typeof r,
        userRoleType: typeof userRole
      }))
    });

    if (!isAuthorized) {
      console.log('Authorization failed:', {
        userRole,
        requiredRoles: roles,
        user: req.user
      });
      return res.status(403).json({ 
        message: "Not authorized",
        details: {
          userRole,
          requiredRoles: roles,
          user: req.user
        }
      });
    }

    console.log('Authorization successful for user:', {
      id: req.user.id,
      role: userRole
    });
    next();  };
};

// Helper function to ensure user is authenticated
const getAuthenticatedUser = (req: Request) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
  return req.user;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Default route for API testing
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ===== AUTH ROUTES =====
  
  // Register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
        // Create session
      req.session.userId = user.id;
      
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt:', { email, passwordLength: password?.length });
        // Validate input
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Trim whitespace from email and password
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      console.log('After trimming:', { 
        email: trimmedEmail, 
        passwordLength: trimmedPassword.length,
        originalPasswordLength: password.length 
      });
      
      // Find user
      console.log('Looking for user with email:', trimmedEmail);
      const user = await storage.getUserByEmail(trimmedEmail);
      console.log('User lookup result:', user ? { id: user.id, email: user.email, hasPassword: !!user.password } : 'User not found');
      
      if (!user) {
        console.log('No user found with email:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }      // Check password
      console.log('Comparing passwords...');
      console.log('Input password:', `"${trimmedPassword}"`);
      console.log('Input password length:', trimmedPassword.length);
      console.log('Input password bytes:', Buffer.from(trimmedPassword).toString('hex'));
      console.log('Stored hash:', user.password);
      
      const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
      console.log('Password comparison result:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Password mismatch for user:', trimmedEmail);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log('Login successful for user:', user.id);
      // Create session
      req.session.userId = user.id;
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ message: "Logged out successfully" });
    });
  });

  // ===== USER ROUTES =====
  
  // Get current user
  app.get("/api/users/me", authenticate, async (req, res) => {
    try {      res.json({
        id: req.user!.id,
        email: req.user!.email,
        username: req.user!.username,
        fullName: req.user!.fullName,
        role: req.user!.role,
        profileImage: req.user!.profileImage,
        customerSince: req.user!.customerSince
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== PRODUCT ROUTES =====
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const products = category 
        ? await storage.getProductsByCategory(category) 
        : await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get product by id
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create product
  app.post("/api/products", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== CAKE BUILDER ROUTES =====
  
  // Get cake shapes
  app.get("/api/cake-builder/shapes", async (req, res) => {
    try {
      const shapes = await storage.getAllCakeShapes();
      res.json(shapes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get cake flavors
  app.get("/api/cake-builder/flavors", async (req, res) => {
    try {
      const flavors = await storage.getAllCakeFlavors();
      res.json(flavors);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get cake frostings
  app.get("/api/cake-builder/frostings", async (req, res) => {
    try {
      const frostings = await storage.getAllCakeFrostings();
      res.json(frostings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get cake decorations
  app.get("/api/cake-builder/decorations", async (req, res) => {
    try {
      const decorations = await storage.getAllCakeDecorations();
      res.json(decorations);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create custom cake
  app.post("/api/cake-builder", authenticate, async (req, res) => {
    try {
      const cakeData = insertCustomCakeSchema.parse(req.body);
      
      // Add user id
      const customCake = await storage.createCustomCake({
        ...cakeData,
        userId: req.user.id
      });
      
      res.status(201).json(customCake);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });  // ===== ORDER ROUTES =====
  
  // Get user's orders
  app.get("/api/orders", authenticate, async (req, res) => {
    try {
      let orders;
      
      // Different query based on role
      if (req.user.role === 'customer') {
        orders = await storage.getUserOrders(req.user.id);
      } else if (req.user.role === 'junior_baker') {
        orders = await storage.getJuniorBakerOrders(req.user.id);
      } else if (req.user.role === 'main_baker') {
        orders = await storage.getMainBakerOrders(req.user.id);
      } else if (req.user.role === 'admin') {
        orders = await storage.getAllOrders();
      }
      
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create order
  app.post("/api/orders", authenticate, async (req, res) => {
    try {
      console.log('Creating order with data:', JSON.stringify(req.body, null, 2));
      const { items, shippingInfo, totalAmount, status } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.log('Invalid items:', items);
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      if (!shippingInfo) {
        console.log('Missing shipping info');
        return res.status(400).json({ message: "Shipping information is required" });
      }
      
      // Validate and convert totalAmount to a number
      const orderTotal = typeof totalAmount === 'number' ? totalAmount : parseFloat(String(totalAmount));
      if (isNaN(orderTotal)) {
        console.log('Invalid total amount:', totalAmount);
        return res.status(400).json({ message: "Valid total amount is required" });
      }      // Calculate deadline (24 hours from now)
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24);
        // Determine main baker based on products in the order
      let assignedMainBakerId = null;
      if (items.length > 0) {
        // Get the main baker from the first product in the order
        for (const item of items) {
          if (item.productId) {
            const product = await storage.getProduct(item.productId);
            if (product && product.mainBakerId) {
              assignedMainBakerId = product.mainBakerId;
              break; // Assign to the first product's main baker
            }
          } else if (item.customCakeId) {
            const customCake = await storage.getCustomCakeById(item.customCakeId);
            if (customCake && customCake.mainBakerId) {
              assignedMainBakerId = customCake.mainBakerId;
              break;
            }
          }
        }
      }
      
      // Validate order data
      const orderData = {
        orderId: `BB-ORD-${Math.floor(100000 + Math.random() * 900000)}`, // Longer, more unique ID
        userId: req.user.id,
        status: (status || 'pending') as "pending" | "processing" | "quality_check" | "ready" | "delivered" | "cancelled",
        totalAmount: orderTotal, // Use our validated number
        deadline: deadline,
        mainBakerId: assignedMainBakerId, // Automatically assign main baker
        // Let defaultNow handle the timestamps
      };
      
      console.log('Order data to create:', JSON.stringify(orderData, null, 2));
      
      try {
        const parsedOrderData = insertOrderSchema.parse(orderData);
        console.log('Parsed order data:', JSON.stringify(parsedOrderData, null, 2));
        
        // Create order
        const order = await storage.createOrder(parsedOrderData);
        if (!order || !order.id) {
          throw new Error("Failed to create order - no order ID returned");
        }
        console.log('Order created:', JSON.stringify(order, null, 2));
        
        try {
          // Add shipping info
          const shippingData = {
            orderId: order.id,
            fullName: shippingInfo.fullName,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zipCode: shippingInfo.zipCode,
            paymentMethod: shippingInfo.paymentMethod
          };
          
          console.log('Shipping data to add:', JSON.stringify(shippingData, null, 2));
          const parsedShippingInfo = insertShippingInfoSchema.parse(shippingData);
          console.log('Parsed shipping info:', JSON.stringify(parsedShippingInfo, null, 2));
          
          const shipping = await storage.addShippingInfo(parsedShippingInfo);
          console.log('Shipping info added:', JSON.stringify(shipping, null, 2));
          
          // Add order items
          for (const item of items) {
            if (!item.quantity || item.pricePerItem === undefined || item.pricePerItem === null) {
              console.log('Invalid order item:', JSON.stringify(item, null, 2));
              throw new Error("Invalid order item: missing quantity or price");
            }
            
            // Make sure either productId or customCakeId is valid (not both null)
            if (!item.productId && !item.customCakeId) {
              console.log('Item missing both product and custom cake IDs:', JSON.stringify(item, null, 2));
              continue; // Skip this item
            }
            
            const itemData = {
              orderId: order.id,
              productId: item.productId || null,
              customCakeId: item.customCakeId || null,
              quantity: item.quantity,
              pricePerItem: typeof item.pricePerItem === 'number' ? 
                item.pricePerItem : parseFloat(String(item.pricePerItem))
            };
            
            console.log('Order item data to add:', JSON.stringify(itemData, null, 2));
            const orderItem = await storage.addOrderItem(itemData);
            console.log('Order item added:', JSON.stringify(orderItem, null, 2));          }
          
          // Initialize chat for this order (add customer as participant)
          console.log('🔄 About to initialize chat for order:', order.id);
          try {
            await storage.initializeChatForOrder(order.id);
            console.log('✅ Chat initialization completed for order:', order.id);
          } catch (error) {
            console.error('❌ Error initializing chat for order:', order.id, error);
            // Don't fail the order creation if chat initialization fails
          }
          
          res.status(201).json(order);
        } catch (error) {
          console.error('Error adding shipping info or order items:', error);
          // Try to clean up the order if shipping info or items fail
          try {
            await storage.deleteOrder(order.id);
          } catch (cleanupError) {
            console.error('Error cleaning up order:', cleanupError);
          }
          throw error;
        }
      } catch (error) {
        console.error('Error creating order:', error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid input", errors: error.errors });
        }
        throw error;
      }    } catch (error) {
      console.error('Error in order creation:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer Orders for Chat
  app.get("/api/orders/customer", authenticate, authorize(['customer']), async (req, res) => {
    try {
      const customerId = req.user!.id;
      
      // Get customer orders with baker info for chat
      const orders = await storage.getCustomerOrdersForChat(customerId);
      
      console.log('Customer orders for chat:', JSON.stringify(orders, null, 2));
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching customer orders for chat:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get single order by ID
  app.get("/api/orders/:id", authenticate, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrderWithDetails(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user has access to this order
      if (req.user.role === 'customer' && order.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", authenticate, authorize(['main_baker', 'junior_baker', 'admin']), async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validate status
      if (!orderStatusEnum.enumValues.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
        res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== CHAT ROUTES =====
  
  // Get chats for an order
  app.get("/api/chats/:orderId", authenticate, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      console.log(`🔍 Fetching chats for order ${orderId} by user ${req.user.id} (${req.user.fullName}) - Role: ${req.user.role}`);
      
      // Check if user has access to this order
      const order = await storage.getOrderById(orderId);
      if (!order) {
        console.log(`❌ Order ${orderId} not found`);
        return res.status(404).json({ message: "Order not found" });
      }
      
      console.log(`📦 Order details:`, {
        id: order.id,
        userId: order.userId,
        juniorBakerId: order.juniorBakerId,
        status: order.status
      });
      
      // Check permissions
      const canAccess = (
        req.user.role === 'customer' && order.userId === req.user.id
      ) || (
        req.user.role === 'junior_baker' && order.juniorBakerId === req.user.id
      ) || (
        req.user.role === 'main_baker'
      );
      
      if (!canAccess) {
        console.log(`🚫 User ${req.user.id} doesn't have access to order ${orderId}`);
        return res.status(403).json({ message: "Access denied" });
      }
      
      const chats = await storage.getChatsByOrderId(orderId);
      console.log(`💬 Found ${chats.length} messages for order ${orderId}:`, chats);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send a new chat message
  app.post("/api/chats", authenticate, async (req, res) => {
    try {
      const { orderId, message } = req.body;
      
      if (!orderId || !message || !message.trim()) {
        return res.status(400).json({ message: "Order ID and message are required" });
      }

      // Create the chat message
      const chatData: InsertChat = {
        orderId: parseInt(orderId),
        senderId: req.user.id,
        message: message.trim(),
        isRead: false
      };

      const chat = await storage.createChat(chatData);
      
      // Initialize chat participants if not already done
      await storage.initializeChatForOrder(parseInt(orderId));
      
      res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get chat participants for an order
  app.get("/api/chats/:orderId/participants", authenticate, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const participants = await storage.getChatParticipants(orderId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching chat participants:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark chats as read
  app.patch("/api/chats/read", authenticate, async (req, res) => {
    try {
      const { chatIds } = req.body;
      
      if (!Array.isArray(chatIds) || chatIds.length === 0) {
        return res.status(400).json({ message: "Chat IDs are required" });
      }
      
      await storage.markChatsAsRead(chatIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== BAKER APPLICATION ROUTES =====
  
  // Apply to become baker
  app.post("/api/baker-applications", authenticate, async (req, res) => {
    try {
      const applicationData = insertBakerApplicationSchema.parse(req.body);
      
      // Validate role progression
      const { currentRole, requestedRole } = applicationData;
      const validProgression = 
        (currentRole === 'customer' && requestedRole === 'junior_baker') ||
        (currentRole === 'junior_baker' && requestedRole === 'main_baker');
      
      if (!validProgression) {
        return res.status(400).json({ message: "Invalid role progression" });
      }
      
      // Create application
      const application = await storage.createBakerApplication({
        ...applicationData,
        userId: req.user.id
      });
      
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Review baker application (admin only)
  app.patch("/api/baker-applications/:id", authenticate, authorize(['admin']), async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }
      
      const application = await storage.updateBakerApplicationStatus(applicationId, status, req.user.id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
        // If approved, update user role
      if (status === 'approved' && application.userId) {
        const user = await storage.getUserById(application.userId);
        
        if (user) {
          const newRole = application.requestedRole;
          await storage.updateUserRole(user.id, newRole);
        }
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Review junior baker application (main baker only)
  app.patch("/api/baker-applications/:id/main-baker-review", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }

      // Get the application first to verify it's for this main baker
      const application = await storage.getBakerApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (application.mainBakerId !== req.user.id) {
        return res.status(403).json({ message: "You can only review applications to your team" });
      }

      if (application.status !== 'pending') {
        return res.status(400).json({ message: "Application has already been reviewed" });
      }

      // Update application status
      const updatedApplication = await storage.updateBakerApplicationStatus(applicationId, status, req.user.id);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // If approved, update user role and create team relationship
      if (status === 'approved' && updatedApplication.userId) {
        await storage.updateUserRole(updatedApplication.userId, 'junior_baker');
        
        // Create baker team relationship
        await storage.createBakerTeam({
          mainBakerId: req.user.id,
          juniorBakerId: updatedApplication.userId,
          isActive: true
        });
      }
      
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error reviewing baker application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get applications for main baker
  app.get("/api/baker-applications/main-baker", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const applications = await storage.getBakerApplicationsByMainBaker(req.user.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching baker applications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // ===== DASHBOARD STATS ROUTES =====
  
  // Get customer dashboard stats
  app.get("/api/dashboard/customer", authenticate, async (req, res) => {
    try {
      const stats = await storage.getCustomerStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get junior baker dashboard stats
  app.get("/api/dashboard/junior-baker", authenticate, authorize(['junior_baker']), async (req, res) => {
    try {
      const stats = await storage.getJuniorBakerStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Get main baker dashboard stats
  app.get("/api/dashboard/main-baker", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const stats = await storage.getMainBakerStats();
      res.json(stats);
    } catch (error) {      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get main baker's team (junior bakers assigned to them)
  app.get("/api/main-baker/team", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const mainBakerId = req.user.id;
      
      // Get junior bakers assigned to this main baker
      const teamMembers = await storage.getJuniorBakersByMainBaker(mainBakerId);
      
      // For now, return basic team info (we can add order counts later)
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all junior bakers for order assignment
  app.get("/api/users/junior-bakers", authenticate, async (req, res) => {
    try {
      const juniorBakers = await storage.getUsersWithRole('junior_baker');
      res.json(juniorBakers);
    } catch (error) {
      console.error("Error fetching junior bakers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all main bakers (for junior baker applications)
  app.get("/api/users/main-bakers", async (req, res) => {
    try {
      const mainBakers = await storage.getUsersWithRole('main_baker');
      
      // Get junior baker counts for each main baker
      const bakersWithCounts = await Promise.all(
        mainBakers.map(async (baker) => {
          const juniorBakers = await storage.getJuniorBakersByMainBaker(baker.id);
          return {
            ...baker,
            juniorBakers: juniorBakers.length
          };
        })
      );
      
      res.json(bakersWithCounts);
    } catch (error) {
      console.error("Error fetching main bakers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get junior bakers for a specific main baker
  app.get("/api/users/main-baker/:id/junior-bakers", authenticate, authorize(['main_baker', 'admin']), async (req, res) => {
    try {
      const mainBakerId = parseInt(req.params.id);
      
      // Check if the requesting user is the main baker or an admin
      if (req.user.role === 'main_baker' && req.user.id !== mainBakerId) {
        return res.status(403).json({ message: "You can only view your own team" });
      }
      
      const juniorBakers = await storage.getJuniorBakersByMainBaker(mainBakerId);
      res.json(juniorBakers);
    } catch (error) {
      console.error("Error fetching junior bakers for main baker:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // ===== INITIALIZE HTTP SERVER =====
  const httpServer = createServer(app);

  // Admin API Routes
  // Get admin dashboard stats
  app.get("/api/admin/stats", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all users for admin management
  app.get("/api/admin/users", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all products for admin management
  app.get("/api/admin/products", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching all products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all orders for admin management
  app.get("/api/admin/orders", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const orders = await storage.getAllOrdersWithDetails();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get baker applications for admin
  app.get("/api/admin/baker-applications", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const applications = await storage.getAllBakerApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching baker applications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user role (admin only)
  app.patch("/api/admin/users/:userId/role", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!["customer", "junior_baker", "main_baker", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      await storage.updateUserRole(parseInt(userId), role);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:userId", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Prevent deleting admin users
      const user = await storage.getUserById(parseInt(userId));
      if (user?.role === "admin") {
        return res.status(403).json({ message: "Cannot delete admin users" });
      }

      await storage.deleteUser(parseInt(userId));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update product (admin only)
  app.patch("/api/admin/products/:productId", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { productId } = req.params;
      const updateData = req.body;

      const updatedProduct = await storage.updateProduct(parseInt(productId), updateData);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete product (admin only)
  app.delete("/api/admin/products/:productId", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { productId } = req.params;
      await storage.deleteProduct(parseInt(productId));
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Internal server error" });
    }  });

  // Approve baker application (admin only)
  app.patch("/api/admin/baker-applications/:applicationId/approve", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { applicationId } = req.params;
      
      // Get the application details first
      const application = await storage.getBakerApplicationById(parseInt(applicationId));
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Update application status
      await storage.updateBakerApplicationStatus(
        parseInt(applicationId), 
        "approved", 
        req.user.id
      );
      
      // Update user role to junior_baker and assign main baker
      if (application.userId) {
        await storage.updateUserRole(application.userId, "junior_baker");
        
        // Assign the main baker to the new junior baker
        if (application.mainBakerId) {
          await storage.assignJuniorBakerToMainBaker(application.userId, application.mainBakerId);
        }
      }

      res.json({ message: "Application approved successfully" });
    } catch (error) {
      console.error("Error approving application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reject baker application (admin only)
  app.patch("/api/admin/baker-applications/:applicationId/reject", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { applicationId } = req.params;
      
      await storage.updateBakerApplicationStatus(
        parseInt(applicationId), 
        "rejected", 
        req.user.id
      );

      res.json({ message: "Application rejected successfully" });
    } catch (error) {
      console.error("Error rejecting application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order Tracking API Routes
  // Get user's orders for tracking
  app.get("/api/orders/tracking", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserOrdersWithDetails(userId);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching user orders for tracking:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Track order by order ID (public endpoint)
  app.get("/api/orders/track/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await storage.getOrderByOrderId(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Error tracking order:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all main bakers for application selection
  app.get("/api/main-bakers", async (req, res) => {
    try {
      const mainBakers = await storage.getUsersWithRole('main_baker');
      
      // Get team size for each main baker (count of junior bakers assigned to them)
      const bakersWithTeamSize = await Promise.all(
        mainBakers.map(async (baker) => {
          const teamMembers = await storage.getJuniorBakersByMainBaker(baker.id);
          return {
            id: baker.id,
            fullName: baker.fullName,
            email: baker.email,
            completedOrders: baker.completedOrders || 0,
            profileImage: baker.profileImage,
            teamSize: teamMembers.length
          };
        })
      );
      
      res.json(bakersWithTeamSize);
    } catch (error) {
      console.error("Error fetching main bakers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get main baker's team (junior bakers assigned to them)
  app.get("/api/main-baker/team", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const mainBakerId = req.user.id;
      
      // Get junior bakers assigned to this main baker
      const teamMembers = await storage.getJuniorBakersByMainBaker(mainBakerId);
      
      // Get current order counts for each team member
      const teamWithStats = await Promise.all(
        teamMembers.map(async (member) => {
          const currentOrders = await storage.getCurrentOrdersCountForBaker(member.id);
          return {
            ...member,
            currentOrders
          };
        })
      );
      
      res.json(teamWithStats);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get products created by main baker
  app.get("/api/main-baker/products", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const mainBakerId = req.user.id;
      const products = await storage.getProductsByMainBaker(mainBakerId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching main baker products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create product (main baker only)
  app.post("/api/main-baker/products", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const mainBakerId = req.user.id;
      const productData = {
        ...req.body,
        mainBakerId
      };
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update product (main baker only - own products)
  app.put("/api/main-baker/products/:productId", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const { productId } = req.params;      const mainBakerId = req.user.id;
      
      // Verify the product belongs to this main baker
      const existingProduct = await storage.getProduct(parseInt(productId));
      if (!existingProduct || existingProduct.mainBakerId !== mainBakerId) {
        return res.status(403).json({ message: "You can only edit your own products" });
      }
      
      const updatedProduct = await storage.updateProduct(parseInt(productId), req.body);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete product (main baker only - own products)
  app.delete("/api/main-baker/products/:productId", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const { productId } = req.params;
      const mainBakerId = req.user.id;
        // Verify the product belongs to this main baker
      const existingProduct = await storage.getProduct(parseInt(productId));
      if (!existingProduct || existingProduct.mainBakerId !== mainBakerId) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }
      
      await storage.deleteProduct(parseInt(productId));
      res.json({ message: "Product deleted successfully" });    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });  // Junior Baker Tasks API
  app.get("/api/junior-baker/tasks", authenticate, authorize(['junior_baker']), async (req, res) => {
    try {
      const juniorBakerId = req.user.id;
      
      // Get orders assigned to this junior baker
      const tasks = await storage.getOrdersByJuniorBaker(juniorBakerId);
      
      console.log('Junior Baker Tasks Response:', JSON.stringify(tasks, null, 2));
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching junior baker tasks:", error);      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Assign order to junior baker OR take order as main baker
  app.patch("/api/orders/:orderId/assign", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const { orderId } = req.params;
      const { juniorBakerId, takeOrderMyself, deadline } = req.body;
      
      console.log('📝 Assignment request received:', {
        orderId,
        juniorBakerId,
        takeOrderMyself,
        deadline,
        body: req.body
      });
      
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const mainBakerId = req.user.id;
      
      // Must either assign to junior baker or take order themselves
      if (!juniorBakerId && !takeOrderMyself) {
        console.log('❌ Neither juniorBakerId nor takeOrderMyself provided');
        return res.status(400).json({ message: "Must either assign to junior baker or take order yourself" });
      }
      
      if (juniorBakerId && takeOrderMyself) {
        console.log('❌ Both juniorBakerId and takeOrderMyself provided');
        return res.status(400).json({ message: "Cannot both assign to junior baker and take order yourself" });
      }
      
      // Verify the order belongs to this main baker
      const order = await storage.getOrderById(parseInt(orderId));
      if (!order || order.mainBakerId !== mainBakerId) {
        console.log('❌ Order access denied:', { order: order ? order.id : 'not found', mainBakerId });
        return res.status(403).json({ message: "You can only manage your own orders" });
      }
      
      let resultMessage = "";
      let systemMessage = "";
      
      if (takeOrderMyself) {
        console.log('🔄 Main baker taking order personally...');
        // Main baker takes the order themselves
        await storage.takeOrderAsMainBaker(parseInt(orderId), mainBakerId, deadline);
        
        systemMessage = `🎂 Your order is now being personally handled by our Main Baker! They will be working on your order directly and can answer any questions you might have.${deadline ? ` Expected completion: ${new Date(deadline).toLocaleDateString()}` : ''}`;
        
        resultMessage = "Order taken successfully";
        
        console.log(`✅ Order ${orderId} taken by main baker ${mainBakerId} with deadline ${deadline || 'existing'}`);
      } else {
        console.log('🔄 Assigning order to junior baker...');
        // Assign to junior baker (existing functionality)
        // Verify the junior baker exists
        const juniorBaker = await storage.getUser(juniorBakerId);
        if (!juniorBaker || juniorBaker.role !== 'junior_baker') {
          return res.status(404).json({ message: "Junior baker not found" });
        }
        
        // Assign the order
        await storage.assignOrderToJuniorBaker(parseInt(orderId), juniorBakerId, deadline);
        
        // Create a system message to notify about the assignment
        const juniorBakerName = juniorBaker.fullName;
        systemMessage = `🎂 Your order has been assigned to ${juniorBakerName}, our skilled Junior Baker! They will be working on your order and can answer any questions you might have about the baking process.${deadline ? ` Expected completion: ${new Date(deadline).toLocaleDateString()}` : ''}`;
        
        resultMessage = "Order assigned successfully";
        
        console.log(`✅ Order ${orderId} assigned to junior baker ${juniorBakerId} with deadline ${deadline || 'existing'}`);
      }
      
      // Initialize/update chat participants for this order
      await storage.initializeChatForOrder(parseInt(orderId));
      
      // Send system message to customer
      await storage.createChat({
        orderId: parseInt(orderId),
        senderId: mainBakerId, // Main baker sends the notification
        message: systemMessage
      });
      
      console.log(`💬 Chat initialized for order ${orderId}`);
      
      res.json({
        message: resultMessage,
        orderId: parseInt(orderId),
        juniorBakerId: juniorBakerId || null,
        takenByMainBaker: !!takeOrderMyself,
        deadline: deadline
      });
    } catch (error) {
      console.error("❌ Error managing order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Junior Baker Assigned Orders for Chat
  app.get("/api/junior-baker/assigned-orders", authenticate, authorize(['junior_baker']), async (req, res) => {
    try {
      const juniorBakerId = req.user!.id;
      
      // Get orders assigned to this junior baker with customer info
      const orders = await storage.getOrdersByJuniorBakerWithCustomerInfo(juniorBakerId);
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching assigned orders for chat:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Review endpoints
  app.post("/api/reviews", authenticate, async (req, res) => {
    try {
      const { orderId, rating, comment } = req.body;
      const userId = req.user!.id;

      if (!orderId || !rating) {
        return res.status(400).json({ message: "Order ID and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      // Check if user can review this order
      const canReview = await storage.canUserReviewOrder(userId, orderId);
      if (!canReview) {
        return res.status(403).json({ message: "You cannot review this order" });
      }

      // Get order details to find the junior baker
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const reviewData = {
        orderId,
        userId,
        juniorBakerId: order.juniorBakerId,
        rating: parseInt(rating),
        comment: comment || null
      };

      const review = await storage.createReview(reviewData);
      console.log('Review created:', JSON.stringify(review, null, 2));

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/order/:orderId", authenticate, async (req, res) => {
    try {
      const { orderId } = req.params;
      const reviews = await storage.getReviewsByOrderId(parseInt(orderId));
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching order reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/junior-baker/:juniorBakerId", authenticate, authorize(['junior_baker', 'main_baker', 'admin']), async (req, res) => {
    try {
      const { juniorBakerId } = req.params;
      const reviews = await storage.getReviewsByJuniorBakerId(parseInt(juniorBakerId));
      const averageRating = await storage.getBakerAverageRating(parseInt(juniorBakerId));
      
      res.json({
        reviews,
        averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
      });
    } catch (error) {
      console.error("Error fetching junior baker reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark order as delivered (customer only)
  app.patch("/api/orders/:orderId/delivered", authenticate, authorize(['customer']), async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user!.id;

      // Verify the order belongs to this customer and is ready
      const order = await storage.getOrderById(parseInt(orderId));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== userId) {
        return res.status(403).json({ message: "You can only mark your own orders as delivered" });
      }

      if (order.status !== 'ready') {
        return res.status(400).json({ message: "Only orders with 'ready' status can be marked as delivered" });
      }

      // Update order status to delivered
      await storage.updateOrderStatus(parseInt(orderId), 'delivered');
      
      console.log(`Order ${orderId} marked as delivered by customer ${userId}`);
      
      res.json({ message: "Order marked as delivered successfully" });
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });  // Get completed orders with reviews for junior baker
  app.get("/api/junior-baker/completed-orders", authenticate, authorize(['junior_baker']), async (req, res) => {
    try {
      const juniorBakerId = req.user!.id;
      
      // Get completed orders for this junior baker with reviews
      const completedOrders = await storage.getJuniorBakerCompletedOrdersWithReviews(juniorBakerId);
      res.json(completedOrders);
    } catch (error) {
      console.error("Error fetching completed orders for junior baker:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get main baker's personal orders (ones they are working on themselves)
  app.get("/api/main-baker/personal-orders", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const mainBakerId = req.user!.id;
      const personalOrders = await storage.getMainBakerPersonalOrders(mainBakerId);
      res.json(personalOrders);
    } catch (error) {
      console.error("Error fetching main baker personal orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  // Get main baker's orders (for order management page)
  app.get("/api/main-baker/orders", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const mainBakerId = req.user!.id;
      console.log(`🔍 [${new Date().toISOString()}] Fetching main baker orders for user ${mainBakerId}`);
      
      // Get all orders for this main baker
      const rawOrders = await storage.getMainBakerOrders(mainBakerId);
      
      console.log(`📊 Main baker orders for user ${mainBakerId}:`, rawOrders.length, 'orders found');
      
      // Transform orders to match frontend expectations
      const orders = await Promise.all(rawOrders.map(async (order) => {        // Get customer name from order items or user
        let customerName = 'Unknown Customer';
        try {
          if (order.userId) {
            const customer = await storage.getUserById(order.userId);
            if (customer) {
              customerName = customer.fullName;
            }
          }
        } catch (e) {
          console.log('Error getting customer:', e);
        }

        // Get assigned baker name if any
        let assignedBaker = null;
        if (order.juniorBakerId) {
          try {
            const baker = await storage.getUserById(order.juniorBakerId);
            if (baker) {
              assignedBaker = baker.fullName;
            }
          } catch (e) {
            console.log('Error getting baker:', e);
          }
        }
        
        // Get order items (simplified for now)
        const items = ['Items details']; // TODO: Get actual items
          return {
          id: order.id,
          orderNumber: order.orderId,
          status: order.status,
          priority: 'medium' as const, // TODO: Add priority logic
          customerName,
          assignedBaker,
          items,
          total: order.totalAmount,
          createdAt: order.createdAt,
          dueDate: order.deadline
        };
      }));
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching main baker orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });  // Get junior bakers with detailed stats for baker management
  app.get("/api/main-baker/junior-bakers", authenticate, authorize(['main_baker']), async (req, res) => {
    try {
      const mainBakerId = req.user!.id;
      console.log(`Fetching junior bakers for main baker ${mainBakerId}`);
      
      // Get junior bakers assigned to this main baker
      const teamMembers = await storage.getJuniorBakersByMainBaker(mainBakerId);
      console.log(`Found ${teamMembers.length} team members:`, teamMembers.map(m => ({ id: m.id, name: m.fullName })));
      
      // Get detailed stats for each team member
      const teamWithStats = await Promise.all(
        teamMembers.map(async (member) => {
          console.log(`Getting stats for ${member.fullName} (ID: ${member.id})`);
          
          const activeOrders = await storage.getCurrentOrdersCountForBaker(member.id);
          console.log(`  Active orders: ${activeOrders}`);
          
          // Get completed orders count
          const completedOrdersCount = await storage.getCompletedOrdersCount(member.id);
          console.log(`  Completed orders: ${completedOrdersCount}`);
          
          // Get average rating from reviews
          const averageRating = await storage.getBakerAverageRating(member.id);
          console.log(`  Average rating: ${averageRating}`);
          
          // Calculate total earnings (simplified as completed orders * 20)
          const totalEarnings = completedOrdersCount * 20; // $20 per completed order
          
          // Determine status based on active orders and recent activity
          let status: 'active' | 'busy' | 'offline' = 'offline';
          if (activeOrders > 0) {
            status = activeOrders >= 3 ? 'busy' : 'active';
          }
            const result = {
            id: member.id,
            fullName: member.fullName,
            email: member.email,
            profileImage: member.profileImage,
            joinedAt: member.createdAt,
            completedOrders: Number(completedOrdersCount),
            activeOrders: Number(activeOrders),
            averageRating: Number(averageRating),
            totalEarnings,
            status,
            lastActive: member.createdAt // Use createdAt as fallback for lastActive
          };
          
          console.log(`  Final stats for ${member.fullName}:`, result);
          return result;
        })
      );
      
      console.log(`Returning ${teamWithStats.length} junior bakers with stats`);
      res.json(teamWithStats);
    } catch (error) {
      console.error("Error fetching junior bakers with stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get customer's application status
  app.get("/api/customer/application-status", authenticate, authorize(['customer']), async (req, res) => {
    try {
      const customerId = req.user!.id;
      
      // Check if customer has any active applications
      const activeApplications = await storage.getBakerApplicationsByUser(customerId);
      const activeApp = activeApplications.find(app => app.status === 'pending');
      
      if (activeApp) {
        // Get main baker info
        const mainBaker = await storage.getUser(activeApp.mainBakerId!);
        
        res.json({
          hasActiveApplication: true,
          applicationStatus: activeApp.status,
          applicationId: activeApp.id,
          mainBakerId: activeApp.mainBakerId,
          mainBakerName: mainBaker?.fullName
        });
      } else {
        res.json({
          hasActiveApplication: false
        });
      }
    } catch (error) {
      console.error("Error checking application status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
