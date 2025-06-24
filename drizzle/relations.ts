import { relations } from "drizzle-orm/relations";
import { users, bakerApplications, chats, orders, products, chatParticipants, customCakes, cakeDecorations, cakeFlavors, cakeFrostings, cakeShapes, reviews, shippingInfo, orderItems, bakerTeams } from "./schema";

export const bakerApplicationsRelations = relations(bakerApplications, ({one}) => ({
	user_mainBakerId: one(users, {
		fields: [bakerApplications.mainBakerId],
		references: [users.id],
		relationName: "bakerApplications_mainBakerId_users_id"
	}),
	user_reviewedBy: one(users, {
		fields: [bakerApplications.reviewedBy],
		references: [users.id],
		relationName: "bakerApplications_reviewedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [bakerApplications.userId],
		references: [users.id],
		relationName: "bakerApplications_userId_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	bakerApplications_mainBakerId: many(bakerApplications, {
		relationName: "bakerApplications_mainBakerId_users_id"
	}),
	bakerApplications_reviewedBy: many(bakerApplications, {
		relationName: "bakerApplications_reviewedBy_users_id"
	}),
	bakerApplications_userId: many(bakerApplications, {
		relationName: "bakerApplications_userId_users_id"
	}),
	chats: many(chats),
	orders_juniorBakerId: many(orders, {
		relationName: "orders_juniorBakerId_users_id"
	}),
	orders_mainBakerId: many(orders, {
		relationName: "orders_mainBakerId_users_id"
	}),
	orders_userId: many(orders, {
		relationName: "orders_userId_users_id"
	}),
	products: many(products),
	chatParticipants: many(chatParticipants),
	customCakes_userId: many(customCakes, {
		relationName: "customCakes_userId_users_id"
	}),
	customCakes_mainBakerId: many(customCakes, {
		relationName: "customCakes_mainBakerId_users_id"
	}),
	reviews_juniorBakerId: many(reviews, {
		relationName: "reviews_juniorBakerId_users_id"
	}),
	reviews_userId: many(reviews, {
		relationName: "reviews_userId_users_id"
	}),
	bakerTeams_mainBakerId: many(bakerTeams, {
		relationName: "bakerTeams_mainBakerId_users_id"
	}),
	bakerTeams_juniorBakerId: many(bakerTeams, {
		relationName: "bakerTeams_juniorBakerId_users_id"
	}),
}));

export const chatsRelations = relations(chats, ({one}) => ({
	user: one(users, {
		fields: [chats.senderId],
		references: [users.id]
	}),
	order: one(orders, {
		fields: [chats.orderId],
		references: [orders.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	chats: many(chats),
	user_juniorBakerId: one(users, {
		fields: [orders.juniorBakerId],
		references: [users.id],
		relationName: "orders_juniorBakerId_users_id"
	}),
	user_mainBakerId: one(users, {
		fields: [orders.mainBakerId],
		references: [users.id],
		relationName: "orders_mainBakerId_users_id"
	}),
	user_userId: one(users, {
		fields: [orders.userId],
		references: [users.id],
		relationName: "orders_userId_users_id"
	}),
	chatParticipants: many(chatParticipants),
	reviews: many(reviews),
	shippingInfos: many(shippingInfo),
	orderItems: many(orderItems),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	user: one(users, {
		fields: [products.mainBakerId],
		references: [users.id]
	}),
	orderItems: many(orderItems),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({one}) => ({
	user: one(users, {
		fields: [chatParticipants.userId],
		references: [users.id]
	}),
	order: one(orders, {
		fields: [chatParticipants.orderId],
		references: [orders.id]
	}),
}));

export const customCakesRelations = relations(customCakes, ({one, many}) => ({
	user_userId: one(users, {
		fields: [customCakes.userId],
		references: [users.id],
		relationName: "customCakes_userId_users_id"
	}),
	cakeDecoration: one(cakeDecorations, {
		fields: [customCakes.decorationId],
		references: [cakeDecorations.id]
	}),
	cakeFlavor: one(cakeFlavors, {
		fields: [customCakes.flavorId],
		references: [cakeFlavors.id]
	}),
	cakeFrosting: one(cakeFrostings, {
		fields: [customCakes.frostingId],
		references: [cakeFrostings.id]
	}),
	cakeShape: one(cakeShapes, {
		fields: [customCakes.shapeId],
		references: [cakeShapes.id]
	}),
	user_mainBakerId: one(users, {
		fields: [customCakes.mainBakerId],
		references: [users.id],
		relationName: "customCakes_mainBakerId_users_id"
	}),
	orderItems: many(orderItems),
}));

export const cakeDecorationsRelations = relations(cakeDecorations, ({many}) => ({
	customCakes: many(customCakes),
}));

export const cakeFlavorsRelations = relations(cakeFlavors, ({many}) => ({
	customCakes: many(customCakes),
}));

export const cakeFrostingsRelations = relations(cakeFrostings, ({many}) => ({
	customCakes: many(customCakes),
}));

export const cakeShapesRelations = relations(cakeShapes, ({many}) => ({
	customCakes: many(customCakes),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	user_juniorBakerId: one(users, {
		fields: [reviews.juniorBakerId],
		references: [users.id],
		relationName: "reviews_juniorBakerId_users_id"
	}),
	user_userId: one(users, {
		fields: [reviews.userId],
		references: [users.id],
		relationName: "reviews_userId_users_id"
	}),
	order: one(orders, {
		fields: [reviews.orderId],
		references: [orders.id]
	}),
}));

export const shippingInfoRelations = relations(shippingInfo, ({one}) => ({
	order: one(orders, {
		fields: [shippingInfo.orderId],
		references: [orders.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	customCake: one(customCakes, {
		fields: [orderItems.customCakeId],
		references: [customCakes.id]
	}),
}));

export const bakerTeamsRelations = relations(bakerTeams, ({one}) => ({
	user_mainBakerId: one(users, {
		fields: [bakerTeams.mainBakerId],
		references: [users.id],
		relationName: "bakerTeams_mainBakerId_users_id"
	}),
	user_juniorBakerId: one(users, {
		fields: [bakerTeams.juniorBakerId],
		references: [users.id],
		relationName: "bakerTeams_juniorBakerId_users_id"
	}),
}));