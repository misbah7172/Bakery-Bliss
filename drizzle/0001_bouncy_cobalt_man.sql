CREATE TABLE "baker_earnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"baker_id" integer NOT NULL,
	"baker_type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "baker_earnings" ADD CONSTRAINT "baker_earnings_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baker_earnings" ADD CONSTRAINT "baker_earnings_baker_id_users_id_fk" FOREIGN KEY ("baker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;