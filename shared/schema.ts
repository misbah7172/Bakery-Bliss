import { pgTable, text, serial, integer, boolean, real, timestamp, pgEnum, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const roleEnum = pgEnum('role', ['customer', 'junior_baker', 'main_baker', 'admin']);

// Enum for order statuses
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'quality_check', 'ready', 'delivered', 'cancelled']);

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: roleEnum("role").notNull().default('customer'),
  profileImage: text("profile_image"),
  completedOrders: integer("completed_orders").default(0), // Track completed orders for junior bakers
  mainBakerId: integer("main_baker_id"), // Junior bakers are assigned to a main baker
  createdAt: timestamp("created_at").defaultNow(),
  customerSince: integer("customer_since").default(2025),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  imageUrl: text("image_url").notNull(),
  inStock: boolean("in_stock").default(true),
  isBestSeller: boolean("is_best_seller").default(false),
  isNew: boolean("is_new").default(false),
  mainBakerId: integer("main_baker_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cake shapes table
export const cakeShapes = pgTable("cake_shapes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  priceMultiplier: real("price_multiplier").notNull(),
  servingSize: text("serving_size"),
});

// Cake flavors table
export const cakeFlavors = pgTable("cake_flavors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  additionalPrice: real("additional_price").default(0),
});

// Cake frostings table
export const cakeFrostings = pgTable("cake_frostings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  additionalPrice: real("additional_price").default(0),
});

// Cake decorations table
export const cakeDecorations = pgTable("cake_decorations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  additionalPrice: real("additional_price").default(0),
});

// Custom cakes table
export const customCakes = pgTable("custom_cakes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name"),
  
  // Legacy cake builder fields (optional for backwards compatibility)
  shapeId: integer("shape_id").references(() => cakeShapes.id),
  flavorId: integer("flavor_id").references(() => cakeFlavors.id),
  frostingId: integer("frosting_id").references(() => cakeFrostings.id),
  decorationId: integer("decoration_id").references(() => cakeDecorations.id),
  
  // New design-based fields
  layers: text("layers"), // e.g., "2layer", "3layer"
  color: text("color"), // e.g., "pink", "green", "red"
  sideDesign: text("side_design"), // e.g., "butterfly", "strawberry"
  upperDesign: text("upper_design"), // e.g., "rose", "butterfly"
  pounds: real("pounds").notNull(), // Weight in pounds (e.g., 1.5, 2.0, 3.0)
  designKey: text("design_key"), // Generated key for design lookup
  
  message: text("message"),
  specialInstructions: text("special_instructions"),
  totalPrice: real("total_price").notNull(),
  mainBakerId: integer("main_baker_id").references(() => users.id), // Selected main baker for custom cake
  createdAt: timestamp("created_at").defaultNow(),
  isSaved: boolean("is_saved").default(false),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  status: orderStatusEnum("status").notNull().default('pending'),
  totalAmount: real("total_amount").notNull(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  mainBakerId: integer("main_baker_id").references(() => users.id),
  juniorBakerId: integer("junior_baker_id").references(() => users.id),
});

// Shipping info table
export const shippingInfo = pgTable("shipping_info", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  customCakeId: integer("custom_cake_id").references(() => customCakes.id),
  quantity: integer("quantity").notNull(),
  pricePerItem: real("price_per_item").notNull(),
});

// Chats table - supports multi-participant conversations per order
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(), // Chat belongs to an order
  senderId: integer("sender_id").references(() => users.id).notNull(), // Who sent the message
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
  // Remove receiverId since chat is order-based with multiple participants
});

// Chat participants table - tracks who can participate in each order's chat
export const chatParticipants = pgTable("chat_participants", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // 'customer', 'junior_baker', 'main_baker'
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at"),
});

// Baker application table
export const bakerApplications = pgTable("baker_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  currentRole: roleEnum("current_role").notNull(),
  requestedRole: roleEnum("requested_role").notNull(),
  mainBakerId: integer("main_baker_id").references(() => users.id), // Which main baker they are applying to
  reason: text("reason").notNull(),
  status: text("status").notNull().default('pending'),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Main Baker - Junior Baker relationship table
export const bakerTeams = pgTable("baker_teams", {
  id: serial("id").primaryKey(),
  mainBakerId: integer("main_baker_id").notNull().references(() => users.id),
  juniorBakerId: integer("junior_baker_id").notNull().references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  userId: integer("user_id").notNull().references(() => users.id),
  juniorBakerId: integer("junior_baker_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Baker earnings table  
export const bakerEarnings = pgTable("baker_earnings", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  bakerId: integer("baker_id").notNull().references(() => users.id),
  bakerType: text("baker_type").notNull(), // 'main_baker' or 'junior_baker'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertCakeShapeSchema = createInsertSchema(cakeShapes).omit({ id: true });
export const insertCakeFlavorSchema = createInsertSchema(cakeFlavors).omit({ id: true });
export const insertCakeFrostingSchema = createInsertSchema(cakeFrostings).omit({ id: true });
export const insertCakeDecorationSchema = createInsertSchema(cakeDecorations).omit({ id: true });
export const insertCustomCakeSchema = createInsertSchema(customCakes).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertShippingInfoSchema = createInsertSchema(shippingInfo).omit({ id: true, createdAt: true });
export const insertChatSchema = createInsertSchema(chats).omit({ id: true, timestamp: true });
export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({ id: true, joinedAt: true });
export const insertBakerApplicationSchema = createInsertSchema(bakerApplications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBakerTeamSchema = createInsertSchema(bakerTeams).omit({ id: true, assignedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBakerEarningSchema = createInsertSchema(bakerEarnings).omit({ id: true, createdAt: true });

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CakeShape = typeof cakeShapes.$inferSelect;
export type InsertCakeShape = z.infer<typeof insertCakeShapeSchema>;

export type CakeFlavor = typeof cakeFlavors.$inferSelect;
export type InsertCakeFlavor = z.infer<typeof insertCakeFlavorSchema>;

export type CakeFrosting = typeof cakeFrostings.$inferSelect;
export type InsertCakeFrosting = z.infer<typeof insertCakeFrostingSchema>;

export type CakeDecoration = typeof cakeDecorations.$inferSelect;
export type InsertCakeDecoration = z.infer<typeof insertCakeDecorationSchema>;

export type CustomCake = typeof customCakes.$inferSelect;
export type InsertCustomCake = z.infer<typeof insertCustomCakeSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;

export type BakerApplication = typeof bakerApplications.$inferSelect;
export type InsertBakerApplication = z.infer<typeof insertBakerApplicationSchema>;

export type BakerTeam = typeof bakerTeams.$inferSelect;
export type InsertBakerTeam = z.infer<typeof insertBakerTeamSchema>;

export type ShippingInfo = typeof shippingInfo.$inferSelect;
export type InsertShippingInfo = z.infer<typeof insertShippingInfoSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type BakerEarning = typeof bakerEarnings.$inferSelect;
export type InsertBakerEarning = z.infer<typeof insertBakerEarningSchema>;
