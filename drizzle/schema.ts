import { pgTable, foreignKey, serial, integer, text, timestamp, unique, real, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const orderStatus = pgEnum("order_status", ['pending', 'processing', 'quality_check', 'ready', 'delivered', 'cancelled'])
export const role = pgEnum("role", ['customer', 'junior_baker', 'main_baker', 'admin'])


export const bakerApplications = pgTable("baker_applications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	currentRole: role("current_role").notNull(),
	requestedRole: role("requested_role").notNull(),
	reason: text().notNull(),
	status: text().default('pending').notNull(),
	reviewedBy: integer("reviewed_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	mainBakerId: integer("main_baker_id"),
}, (table) => [
	foreignKey({
			columns: [table.mainBakerId],
			foreignColumns: [users.id],
			name: "baker_applications_main_baker_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [users.id],
			name: "baker_applications_reviewed_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "baker_applications_user_id_users_id_fk"
		}),
]);

export const cakeShapes = pgTable("cake_shapes", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	priceMultiplier: real("price_multiplier").notNull(),
	servingSize: text("serving_size"),
}, (table) => [
	unique("cake_shapes_name_unique").on(table.name),
]);

export const chats = pgTable("chats", {
	id: serial().primaryKey().notNull(),
	senderId: integer("sender_id").notNull(),
	orderId: integer("order_id").notNull(),
	message: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
	isRead: boolean("is_read").default(false),
}, (table) => [
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "chats_sender_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "chats_order_id_orders_id_fk"
		}),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	userId: integer("user_id"),
	status: orderStatus().default('pending').notNull(),
	totalAmount: real("total_amount").notNull(),
	deadline: timestamp({ mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	juniorBakerId: integer("junior_baker_id"),
	mainBakerId: integer("main_baker_id"),
}, (table) => [
	foreignKey({
			columns: [table.juniorBakerId],
			foreignColumns: [users.id],
			name: "orders_junior_baker_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.mainBakerId],
			foreignColumns: [users.id],
			name: "orders_main_baker_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}),
	unique("orders_order_id_unique").on(table.orderId),
]);

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	price: real().notNull(),
	category: text().notNull(),
	subcategory: text(),
	imageUrl: text("image_url").notNull(),
	inStock: boolean("in_stock").default(true),
	isBestSeller: boolean("is_best_seller").default(false),
	isNew: boolean("is_new").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	mainBakerId: integer("main_baker_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.mainBakerId],
			foreignColumns: [users.id],
			name: "products_main_baker_id_users_id_fk"
		}),
]);

export const cakeDecorations = pgTable("cake_decorations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	additionalPrice: real("additional_price").default(0),
}, (table) => [
	unique("cake_decorations_name_unique").on(table.name),
]);

export const cakeFlavors = pgTable("cake_flavors", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	additionalPrice: real("additional_price").default(0),
}, (table) => [
	unique("cake_flavors_name_unique").on(table.name),
]);

export const cakeFrostings = pgTable("cake_frostings", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	additionalPrice: real("additional_price").default(0),
}, (table) => [
	unique("cake_frostings_name_unique").on(table.name),
]);

export const chatParticipants = pgTable("chat_participants", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	userId: integer("user_id").notNull(),
	role: text().notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
	lastReadAt: timestamp("last_read_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chat_participants_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "chat_participants_order_id_orders_id_fk"
		}),
]);

export const customCakes = pgTable("custom_cakes", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	name: text(),
	shapeId: integer("shape_id"),
	flavorId: integer("flavor_id"),
	frostingId: integer("frosting_id"),
	decorationId: integer("decoration_id"),
	message: text(),
	specialInstructions: text("special_instructions"),
	totalPrice: real("total_price").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	isSaved: boolean("is_saved").default(false),
	mainBakerId: integer("main_baker_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "custom_cakes_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.decorationId],
			foreignColumns: [cakeDecorations.id],
			name: "custom_cakes_decoration_id_cake_decorations_id_fk"
		}),
	foreignKey({
			columns: [table.flavorId],
			foreignColumns: [cakeFlavors.id],
			name: "custom_cakes_flavor_id_cake_flavors_id_fk"
		}),
	foreignKey({
			columns: [table.frostingId],
			foreignColumns: [cakeFrostings.id],
			name: "custom_cakes_frosting_id_cake_frostings_id_fk"
		}),
	foreignKey({
			columns: [table.shapeId],
			foreignColumns: [cakeShapes.id],
			name: "custom_cakes_shape_id_cake_shapes_id_fk"
		}),
	foreignKey({
			columns: [table.mainBakerId],
			foreignColumns: [users.id],
			name: "custom_cakes_main_baker_id_users_id_fk"
		}),
]);

export const reviews = pgTable("reviews", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	userId: integer("user_id").notNull(),
	juniorBakerId: integer("junior_baker_id"),
	rating: integer().notNull(),
	comment: text(),
	isVerifiedPurchase: boolean("is_verified_purchase").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.juniorBakerId],
			foreignColumns: [users.id],
			name: "reviews_junior_baker_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reviews_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "reviews_order_id_orders_id_fk"
		}),
]);

export const shippingInfo = pgTable("shipping_info", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id"),
	fullName: text("full_name").notNull(),
	email: text().notNull(),
	phone: text().notNull(),
	address: text().notNull(),
	city: text().notNull(),
	state: text().notNull(),
	zipCode: text("zip_code").notNull(),
	paymentMethod: text("payment_method").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "shipping_info_order_id_orders_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	fullName: text("full_name").notNull(),
	role: role().default('customer').notNull(),
	profileImage: text("profile_image"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	customerSince: integer("customer_since").default(2025),
	completedOrders: integer("completed_orders").default(0),
	mainBakerId: integer("main_baker_id"),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
]);

export const orderItems = pgTable("order_items", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id"),
	productId: integer("product_id"),
	customCakeId: integer("custom_cake_id"),
	quantity: integer().notNull(),
	pricePerItem: real("price_per_item").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.customCakeId],
			foreignColumns: [customCakes.id],
			name: "order_items_custom_cake_id_custom_cakes_id_fk"
		}),
]);

export const bakerTeams = pgTable("baker_teams", {
	id: serial().primaryKey().notNull(),
	mainBakerId: integer("main_baker_id").notNull(),
	juniorBakerId: integer("junior_baker_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(true),
}, (table) => [
	foreignKey({
			columns: [table.mainBakerId],
			foreignColumns: [users.id],
			name: "baker_teams_main_baker_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.juniorBakerId],
			foreignColumns: [users.id],
			name: "baker_teams_junior_baker_id_users_id_fk"
		}),
]);
