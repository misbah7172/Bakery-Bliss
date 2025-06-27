CREATE TABLE IF NOT EXISTS "direct_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"message" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"is_read" boolean DEFAULT false
);

DO $$ BEGIN
 ALTER TABLE "direct_chats" ADD CONSTRAINT "direct_chats_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "direct_chats" ADD CONSTRAINT "direct_chats_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
