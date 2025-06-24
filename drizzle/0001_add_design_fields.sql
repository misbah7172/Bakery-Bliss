import { pgTable, serial, text, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";

-- Add new columns to custom_cakes table for design-based cake builder
ALTER TABLE custom_cakes 
ADD COLUMN layers text,
ADD COLUMN color text,
ADD COLUMN side_design text,
ADD COLUMN upper_design text,
ADD COLUMN pounds real,
ADD COLUMN design_key text;

-- Update pounds column to have a default value
ALTER TABLE custom_cakes 
ALTER COLUMN pounds SET NOT NULL,
ALTER COLUMN pounds SET DEFAULT 1.0;

-- Create index on design_key for faster lookups
CREATE INDEX idx_custom_cakes_design_key ON custom_cakes(design_key);
CREATE INDEX idx_custom_cakes_main_baker ON custom_cakes(main_baker_id);
