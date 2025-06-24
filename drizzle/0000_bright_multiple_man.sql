-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'quality_check', 'ready', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('customer', 'junior_baker', 'main_baker', 'admin');--> statement-breakpoint
CREATE TABLE "baker_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"current_role" "role" NOT NULL,
	"requested_role" "role" NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"main_baker_id" integer
);
--> statement-breakpoint
CREATE TABLE "cake_shapes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_multiplier" real NOT NULL,
	"serving_size" text,
	CONSTRAINT "cake_shapes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"message" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"is_read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"user_id" integer,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" real NOT NULL,
	"deadline" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"junior_baker_id" integer,
	"main_baker_id" integer,
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" real NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"image_url" text NOT NULL,
	"in_stock" boolean DEFAULT true,
	"is_best_seller" boolean DEFAULT false,
	"is_new" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"main_baker_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cake_decorations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"additional_price" real DEFAULT 0,
	CONSTRAINT "cake_decorations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "cake_flavors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"additional_price" real DEFAULT 0,
	CONSTRAINT "cake_flavors_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "cake_frostings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"additional_price" real DEFAULT 0,
	CONSTRAINT "cake_frostings_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "chat_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"last_read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "custom_cakes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text,
	"shape_id" integer,
	"flavor_id" integer,
	"frosting_id" integer,
	"decoration_id" integer,
	"message" text,
	"special_instructions" text,
	"total_price" real NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"is_saved" boolean DEFAULT false,
	"main_baker_id" integer
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"junior_baker_id" integer,
	"rating" integer NOT NULL,
	"comment" text,
	"is_verified_purchase" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shipping_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"payment_method" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "role" DEFAULT 'customer' NOT NULL,
	"profile_image" text,
	"created_at" timestamp DEFAULT now(),
	"customer_since" integer DEFAULT 2025,
	"completed_orders" integer DEFAULT 0,
	"main_baker_id" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"product_id" integer,
	"custom_cake_id" integer,
	"quantity" integer NOT NULL,
	"price_per_item" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "baker_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"main_baker_id" integer NOT NULL,
	"junior_baker_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "baker_applications" ADD CONSTRAINT "baker_applications_main_baker_id_users_id_fk" FOREIGN KEY ("main_baker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baker_applications" ADD CONSTRAINT "baker_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baker_applications" ADD CONSTRAINT "baker_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_junior_baker_id_users_id_fk" FOREIGN KEY ("junior_baker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_main_baker_id_users_id_fk" FOREIGN KEY ("main_baker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_main_baker_id_users_id_fk" FOREIGN KEY ("main_baker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_cakes" ADD CONSTRAINT "custom_cakes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_cakes" ADD CONSTRAINT "custom_cakes_decoration_id_cake_decorations_id_fk" FOREIGN KEY ("decoration_id") REFERENCES "public"."cake_decorations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_cakes" ADD CONSTRAINT "custom_cakes_flavor_id_cake_flavors_id_fk" FOREIGN KEY ("flavor_id") REFERENCES "public"."cake_flavors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_cakes" ADD CONSTRAINT "custom_cakes_frosting_id_cake_frostings_id_fk" FOREIGN KEY ("frosting_id") REFERENCES "public"."cake_frostings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_cakes" ADD CONSTRAINT "custom_cakes_shape_id_cake_shapes_id_fk" FOREIGN KEY ("shape_id") REFERENCES "public"."cake_shapes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_cakes" ADD CONSTRAINT "custom_cakes_main_baker_id_users_id_fk" FOREIGN KEY ("main_baker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_junior_baker_id_users_id_fk" FOREIGN KEY ("junior_baker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_info" ADD CONSTRAINT "shipping_info_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_custom_cake_id_custom_cakes_id_fk" FOREIGN KEY ("custom_cake_id") REFERENCES "public"."custom_cakes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baker_teams" ADD CONSTRAINT "baker_teams_main_baker_id_users_id_fk" FOREIGN KEY ("main_baker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baker_teams" ADD CONSTRAINT "baker_teams_junior_baker_id_users_id_fk" FOREIGN KEY ("junior_baker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
*/