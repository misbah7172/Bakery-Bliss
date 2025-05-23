import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
  insertShippingInfoSchema
} from "@shared/schema";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "bakerybliss-secret-key";

// Define WebSocket clients map to track connections
const clients = new Map<number, WebSocket>();

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: "No token provided" });
    }

    console.log('Authentication attempt with token:', token);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    console.log('Token decoded:', decoded);
    
    const user = await storage.getUser(decoded.userId);
    console.log('User found:', user);
    
    if (!user) {
      console.log('No user found for ID:', decoded.userId);
      return res.status(401).json({ message: "Invalid token" });
    }
    
    req.user = user;
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
    next();
  };
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
      
      // Create and send token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
      
      res.status(201).json({
        token,
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
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create and send token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== USER ROUTES =====
  
  // Get current user
  app.get("/api/users/me", authenticate, async (req, res) => {
    try {
      res.json({
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        fullName: req.user.fullName,
        role: req.user.role,
        profileImage: req.user.profileImage,
        customerSince: req.user.customerSince
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
  });

  // ===== ORDER ROUTES =====
  
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
      }

      // Calculate deadline (24 hours from now)
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24);
      
      // Validate order data
      const orderData = {
        orderId: `BB-ORD-${Math.floor(100000 + Math.random() * 900000)}`, // Longer, more unique ID
        userId: req.user.id,
        status: (status || 'pending') as "pending" | "processing" | "quality_check" | "ready" | "delivered" | "cancelled",
        totalAmount: orderTotal, // Use our validated number
        deadline: deadline,
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
            console.log('Order item added:', JSON.stringify(orderItem, null, 2));
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
      }
    } catch (error) {
      console.error('Error in order creation:', error);
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

  // Assign junior baker to order
  app.patch("/api/orders/:id/assign", authenticate, authorize(['main_baker', 'admin']), async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { juniorBakerId } = req.body;
      
      if (!juniorBakerId) {
        return res.status(400).json({ message: "Junior Baker ID is required" });
      }
      
      const order = await storage.assignOrderToJuniorBaker(orderId, juniorBakerId);
      
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
  app.get("/api/chats/order/:orderId", authenticate, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const chats = await storage.getChatsByOrderId(orderId);
      res.json(chats);
    } catch (error) {
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
      if (status === 'approved') {
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

  // ===== REVIEW ROUTES =====
  
  // Create a new review
  app.post('/api/reviews', authenticate, async (req: Request, res: Response) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      
      // Check if user can review this order
      const canReview = await storage.canUserReviewOrder(req.user.id, validatedData.orderId);
      if (!canReview) {
        return res.status(400).json({ error: 'You cannot review this order' });
      }

      const review = await storage.createReview({
        ...validatedData,
        userId: req.user.id
      });
      res.json(review);
    } catch (error: any) {
      console.error('Error creating review:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Invalid review data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to submit review' });
    }
  });

  // Get reviews for a specific order
  app.get('/api/reviews/order/:orderId', async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const reviews = await storage.getReviewsByOrderId(orderId);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching order reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  // Get reviews by a specific user
  app.get('/api/reviews/user/:userId', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const reviews = await storage.getReviewsByUserId(userId);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  // Get reviews for a specific baker with average rating
  app.get('/api/reviews/baker/:bakerId', async (req: Request, res: Response) => {
    try {
      const bakerId = parseInt(req.params.bakerId);
      const reviews = await storage.getReviewsByJuniorBakerId(bakerId);
      const averageRating = await storage.getBakerAverageRating(bakerId);
      res.json({ reviews, averageRating });
    } catch (error) {
      console.error('Error fetching baker reviews:', error);
      res.status(500).json({ error: 'Failed to fetch baker reviews' });
    }
  });

  // Check if user can review a specific order
  app.get('/api/reviews/can-review/:orderId', authenticate, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const canReview = await storage.canUserReviewOrder(req.user.id, orderId);
      res.json({ canReview });
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      res.status(500).json({ error: 'Failed to check review eligibility' });
    }
  });

  // Get all reviews for admin
  app.get('/api/reviews', authorize(['admin']), async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
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
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== INITIALIZE HTTP SERVER =====
  const httpServer = createServer(app);

  // ===== INITIALIZE WEBSOCKET SERVER =====
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // Extract token from URL params
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const userId = decoded.userId;
      
      // Store client connection
      clients.set(userId, ws);
      
      // Handle messages
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'chat') {
            // Save to database
            const chat = await storage.createChat({
              senderId: userId,
              receiverId: data.receiverId,
              orderId: data.orderId,
              message: data.message,
              isRead: false
            });
            
            // Forward to receiver if online
            const receiverWs = clients.get(data.receiverId);
            if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
              receiverWs.send(JSON.stringify({
                type: 'chat',
                chat
              }));
            }
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        clients.delete(userId);
      });
      
    } catch (error) {
      ws.close(1008, 'Invalid token');
    }
  });

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
    }
  });

  // Approve baker application (admin only)
  app.patch("/api/admin/baker-applications/:applicationId/approve", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { applicationId } = req.params;
      
      const application = await storage.updateBakerApplicationStatus(
        parseInt(applicationId), 
        "approved", 
        req.user.id
      );
      
      if (application?.applicantId) {
        await storage.updateUserRole(application.applicantId, "junior_baker");
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

  return httpServer;
}

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
