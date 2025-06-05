-- =============================================================================
-- COMPLETE LENTIL LIFE DATABASE SETUP
-- Run this entire file in your new Supabase project SQL editor
-- =============================================================================

-- =============================================================================
-- 1. USER PROFILES AND AUTHENTICATION SETUP
-- =============================================================================

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  location_data JSONB,
  marketing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_codes table
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order DECIMAL(10,2) DEFAULT 0,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  location_restrictions JSONB,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_promo_usage table
CREATE TABLE user_promo_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  promo_code_id INTEGER REFERENCES promo_codes(id),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_total DECIMAL(10,2),
  discount_applied DECIMAL(10,2)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_promo_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for promo_codes
CREATE POLICY "Allow public read access to active promo codes" ON promo_codes FOR SELECT USING (is_active = true);

-- RLS Policies for user_promo_usage
CREATE POLICY "Users can view own promo usage" ON user_promo_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own promo usage" ON user_promo_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, minimum_order, usage_limit, valid_until) VALUES
('WELCOME10', 'percentage', 10.00, 15.00, 100, NOW() + INTERVAL '90 days'),
('SAVE5', 'fixed', 5.00, 25.00, 200, NOW() + INTERVAL '60 days'),
('FIRST20', 'percentage', 20.00, 20.00, 50, NOW() + INTERVAL '30 days'),
('WEEKEND15', 'percentage', 15.00, 30.00, 75, NOW() + INTERVAL '7 days');

-- =============================================================================
-- 2. MENU ITEMS SETUP
-- =============================================================================

-- Create menu_items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category VARCHAR(100),
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  dietary_info JSONB,
  nutritional_info JSONB,
  ingredients TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, image_url, category, is_featured, dietary_info, nutritional_info, ingredients) VALUES
('Mediterranean Delight', 'A fresh blend of hummus, falafel, mixed greens, tomatoes, cucumbers, and tahini sauce.', 9.95, 'https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg', 'lunch', true, '{"vegan": true, "vegetarian": true, "glutenFree": true, "dairyFree": true}', '{"calories": 420, "protein": 15, "carbs": 48, "fat": 18, "fiber": 12}', ARRAY['Whole wheat wrap', 'Hummus', 'Falafel', 'Mixed greens', 'Tomatoes', 'Cucumbers', 'Tahini sauce']),
('Avocado Ranch Chicken', 'Grilled chicken, avocado, lettuce, tomato, and ranch dressing in a spinach wrap.', 10.95, 'https://images.pexels.com/photos/4145365/pexels-photo-4145365.jpeg', 'lunch', true, '{"vegan": false, "vegetarian": false, "glutenFree": false, "dairyFree": false}', '{"calories": 550, "protein": 32, "carbs": 42, "fat": 28, "fiber": 8}', ARRAY['Spinach wrap', 'Grilled chicken', 'Avocado', 'Lettuce', 'Tomato', 'Ranch dressing']),
('Quinoa Power Bowl', 'Protein-packed quinoa, black beans, roasted sweet potatoes, kale, and avocado with cilantro lime dressing.', 11.95, 'https://images.pexels.com/photos/5966431/pexels-photo-5966431.jpeg', 'lunch', true, '{"vegan": true, "vegetarian": true, "glutenFree": true, "dairyFree": true}', '{"calories": 480, "protein": 18, "carbs": 62, "fat": 20, "fiber": 15}', ARRAY['Quinoa', 'Black beans', 'Roasted sweet potatoes', 'Kale', 'Avocado', 'Cilantro lime dressing']),
('Berry Protein Smoothie Bowl', 'Mixed berries, banana, plant protein, topped with granola, coconut flakes, and chia seeds.', 8.95, 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg', 'breakfast', true, '{"vegan": true, "vegetarian": true, "glutenFree": true, "dairyFree": true}', '{"calories": 380, "protein": 22, "carbs": 52, "fat": 12, "fiber": 10}', ARRAY['Mixed berries', 'Banana', 'Plant protein', 'Granola', 'Coconut flakes', 'Chia seeds']),
('Spicy Southwest', 'Black beans, corn, brown rice, bell peppers, and avocado with chipotle sauce.', 9.95, 'https://images.pexels.com/photos/8448323/pexels-photo-8448323.jpeg', 'lunch', true, '{"vegan": true, "vegetarian": true, "glutenFree": true, "dairyFree": true}', '{"calories": 520, "protein": 16, "carbs": 68, "fat": 22, "fiber": 14}', ARRAY['Whole grain wrap', 'Black beans', 'Corn', 'Brown rice', 'Bell peppers', 'Avocado', 'Chipotle sauce']);

-- Enable Row Level Security for menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_items
CREATE POLICY "Allow public read access to menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert menu items" ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update menu items" ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete menu items" ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================================================
-- 3. LOYALTY POINTS SYSTEM
-- =============================================================================

-- Create user_points table
CREATE TABLE user_points (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    available_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create points_transactions table
CREATE TABLE points_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus')),
    points_amount INTEGER NOT NULL,
    order_id INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create points_settings table
CREATE TABLE points_settings (
    id SERIAL PRIMARY KEY,
    setting_name VARCHAR(50) UNIQUE NOT NULL,
    setting_value DECIMAL(10,2) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default points settings
INSERT INTO points_settings (setting_name, setting_value, description) VALUES
('points_per_dollar', 1.00, 'Points earned per dollar spent'),
('minimum_redemption', 100.00, 'Minimum points required for redemption'),
('redemption_value', 0.01, 'Dollar value per point when redeeming'),
('welcome_bonus', 50.00, 'Points awarded for signing up'),
('referral_bonus', 100.00, 'Points awarded for successful referrals');

-- Enable Row Level Security
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_points
CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points" ON user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own points" ON user_points FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for points_transactions
CREATE POLICY "Users can view own transactions" ON points_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to insert transactions" ON points_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for points_settings
CREATE POLICY "Allow public read access to points settings" ON points_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated admin to modify settings" ON points_settings FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Menu items indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_featured ON menu_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Promo codes indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);

-- Points indexes
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);

-- =============================================================================
-- 5. CREATE USEFUL FUNCTIONS
-- =============================================================================

-- Function to award welcome bonus points
CREATE OR REPLACE FUNCTION award_welcome_bonus()
RETURNS TRIGGER AS $$
DECLARE
    welcome_points INTEGER;
BEGIN
    -- Get welcome bonus amount from settings
    SELECT setting_value INTO welcome_points FROM points_settings WHERE setting_name = 'welcome_bonus';
    
    -- Insert user_points record
    INSERT INTO user_points (user_id, available_points, lifetime_points)
    VALUES (NEW.id, welcome_points, welcome_points);
    
    -- Record the transaction
    INSERT INTO points_transactions (user_id, transaction_type, points_amount, description)
    VALUES (NEW.id, 'bonus', welcome_points, 'Welcome bonus for new user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to award welcome bonus when user profile is created
CREATE TRIGGER trigger_award_welcome_bonus
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION award_welcome_bonus();

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================

-- =============================================================================
-- 6. ORDERS SYSTEM
-- =============================================================================

-- Create orders table
CREATE TABLE orders (
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
CREATE TABLE order_status_history (
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
-- 7. TIME SLOTS SYSTEM
-- =============================================================================

-- Create time_slots table
CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_slot_config table for general settings
CREATE TABLE time_slot_config (
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
('max_orders_per_slot', '10', 'Maximum orders per time slot');

-- Insert default time slots
INSERT INTO time_slots (day_of_week, start_time, end_time, max_orders, is_active) VALUES
(3, '11:00', '11:30', 10, true), -- Wednesday 11:00-11:30
(3, '11:30', '12:00', 10, true), -- Wednesday 11:30-12:00
(4, '11:00', '11:30', 10, true), -- Thursday 11:00-11:30
(4, '11:30', '12:00', 10, true), -- Thursday 11:30-12:00
(5, '11:00', '11:30', 10, true), -- Friday 11:00-11:30
(5, '11:30', '12:00', 10, true); -- Friday 11:30-12:00

-- Enable Row Level Security
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slot_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_slots
CREATE POLICY "Allow public read access to time slots" ON time_slots FOR SELECT USING (is_active = true);
CREATE POLICY "Allow authenticated admin to manage time slots" ON time_slots FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for time_slot_config
CREATE POLICY "Allow public read access to time slot config" ON time_slot_config FOR SELECT USING (true);
CREATE POLICY "Allow authenticated admin to modify config" ON time_slot_config FOR ALL USING (auth.role() = 'authenticated');

-- Verify setup by checking table counts
SELECT 
    'menu_items' as table_name, 
    COUNT(*) as record_count 
FROM menu_items
UNION ALL
SELECT 
    'promo_codes' as table_name, 
    COUNT(*) as record_count 
FROM promo_codes
UNION ALL
SELECT 
    'points_settings' as table_name, 
    COUNT(*) as record_count 
FROM points_settings
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