-- =============================================================================
-- ADMIN TABLES SETUP - Run this to add missing admin functionality
-- =============================================================================

-- =============================================================================
-- 1. ORDERS SYSTEM
-- =============================================================================

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  pickup JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  special_instructions TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Allow public order creation" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for order_status_history
CREATE POLICY "Users can view own order history" ON order_status_history FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM orders WHERE id = order_id
  ) OR auth.uid() IS NULL
);
CREATE POLICY "Allow authenticated users to insert status history" ON order_status_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. TIME SLOTS SYSTEM
-- =============================================================================

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_slot_config table for general settings
CREATE TABLE IF NOT EXISTS time_slot_config (
  id SERIAL PRIMARY KEY,
  setting_name VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default time slot configuration
INSERT INTO time_slot_config (setting_name, setting_value, description) VALUES
('lead_time_hours', '24', 'Minimum hours in advance for orders'),
('max_advance_days', '7', 'Maximum days in advance to allow orders'),
('default_slot_duration', '30', 'Default time slot duration in minutes'),
('max_orders_per_slot', '10', 'Maximum orders per time slot')
ON CONFLICT (setting_name) DO NOTHING;

-- Insert default time slots
INSERT INTO time_slots (day_of_week, start_time, end_time, max_orders, is_active) VALUES
(3, '11:00', '11:30', 10, true), -- Wednesday 11:00-11:30
(3, '11:30', '12:00', 10, true), -- Wednesday 11:30-12:00
(4, '11:00', '11:30', 10, true), -- Thursday 11:00-11:30
(4, '11:30', '12:00', 10, true), -- Thursday 11:30-12:00
(5, '11:00', '11:30', 10, true), -- Friday 11:00-11:30
(5, '11:30', '12:00', 10, true)  -- Friday 11:30-12:00
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slot_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_slots
CREATE POLICY "Allow public read access to time slots" ON time_slots FOR SELECT USING (is_active = true);
CREATE POLICY "Allow authenticated admin to manage time slots" ON time_slots FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for time_slot_config
CREATE POLICY "Allow public read access to time slot config" ON time_slot_config FOR SELECT USING (true);
CREATE POLICY "Allow authenticated admin to modify config" ON time_slot_config FOR ALL USING (auth.role() = 'authenticated');

-- Insert a sample order for testing
INSERT INTO orders (customer, items, pickup, total, status, special_instructions) VALUES
(
  '{"name": "John Doe", "email": "john@example.com", "phone": "555-0123"}',
  '[{"id": 1, "name": "Mediterranean Delight", "price": 9.95, "quantity": 2}]',
  '{"date": "2025-06-06", "time": "11:30"}',
  19.90,
  'pending',
  'Extra hummus please'
)
ON CONFLICT DO NOTHING;

-- Verify setup by checking table counts
SELECT 
    'orders' as table_name, 
    COUNT(*) as record_count 
FROM orders
UNION ALL
SELECT 
    'time_slots' as table_name, 
    COUNT(*) as record_count 
FROM time_slots
UNION ALL
SELECT 
    'time_slot_config' as table_name, 
    COUNT(*) as record_count 
FROM time_slot_config; 