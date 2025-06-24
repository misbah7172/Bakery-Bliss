-- Migration to add baker earnings tracking
CREATE TABLE baker_earnings (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  baker_id INTEGER NOT NULL REFERENCES users(id),
  baker_type TEXT NOT NULL CHECK (baker_type IN ('main_baker', 'junior_baker')),
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(order_id, baker_id, baker_type)
);
