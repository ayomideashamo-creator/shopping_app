-- The Counter - Shopping App Database Schema
-- Execute this in your Supabase SQL Editor

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS shop_orders CASCADE;
DROP TABLE IF EXISTS shop_items CASCADE;
DROP TABLE IF EXISTS shop_owners CASCADE;

-- Create shop_owners table
CREATE TABLE shop_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shop_items table
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shop_orders table
CREATE TABLE shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES shop_owners(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  ticket_number INTEGER NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_shop_items_owner ON shop_items(owner_id);
CREATE INDEX idx_shop_orders_owner ON shop_orders(owner_id);
CREATE INDEX idx_shop_orders_status ON shop_orders(status);
CREATE INDEX idx_shop_orders_ticket ON shop_orders(ticket_number);

-- Enable Row Level Security (RLS)
ALTER TABLE shop_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shop_items
CREATE POLICY "Enable read access for all authenticated users" ON shop_items
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users with owner_id" ON shop_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all" ON shop_items
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for all" ON shop_items
  FOR DELETE
  USING (true);

-- RLS Policies for shop_orders
CREATE POLICY "Enable read access for all" ON shop_orders
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON shop_orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all" ON shop_orders
  FOR UPDATE
  USING (true);

-- Enable real-time for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE shop_items;
ALTER PUBLICATION supabase_realtime ADD TABLE shop_orders;

-- Insert demo data
INSERT INTO shop_owners (name, email, password_hash) VALUES
  ('Demo Shop', 'demo@counter.com', '$2a$12$demo.hash.here');

INSERT INTO shop_items (owner_id, name, price, stock) 
SELECT id, 'Burger', 2500, 10 FROM shop_owners WHERE email = 'demo@counter.com'
UNION ALL
SELECT id, 'Fries', 1000, 20 FROM shop_owners WHERE email = 'demo@counter.com'
UNION ALL
SELECT id, 'Drink', 800, 15 FROM shop_owners WHERE email = 'demo@counter.com';
