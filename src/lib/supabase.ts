import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Per configurare Supabase:
// 1. Vai su https://supabase.com e crea un account gratuito
// 2. Crea un nuovo progetto
// 3. Vai su Settings > API e copia URL e anon key
// 4. Crea un file .env nella root del progetto con:
//    VITE_SUPABASE_URL=your-project-url
//    VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database schema SQL for Supabase
// Run this in the Supabase SQL Editor to create all tables
export const DATABASE_SCHEMA = `
-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  cost DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) DEFAULT 0,
  threshold DECIMAL(10, 2) DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplies table
CREATE TABLE IF NOT EXISTS supplies (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_cost DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supply items table
CREATE TABLE IF NOT EXISTS supply_items (
  id SERIAL PRIMARY KEY,
  supply_id INTEGER REFERENCES supplies(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL
);

-- Tables (restaurant tables)
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
  order_type VARCHAR(20) NOT NULL DEFAULT 'dine_in',
  pickup_time TIME,
  table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  smac_passed BOOLEAN DEFAULT false,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work shifts table
CREATE TABLE IF NOT EXISTS work_shifts (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked DECIMAL(4, 2),
  status VARCHAR(20) DEFAULT 'scheduled',
  shift_type VARCHAR(20) DEFAULT 'worked',
  notes TEXT,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES tables(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  guests INTEGER DEFAULT 2,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('shop_name', 'Kebab San Marino'),
  ('currency', '€'),
  ('iva_rate', '17'),
  ('default_threshold', '10'),
  ('language', 'it')
ON CONFLICT (key) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, icon, color) VALUES
  ('Kebab', 'utensils', '#f97316'),
  ('Piadine', 'sandwich', '#eab308'),
  ('Bibite', 'coffee', '#3b82f6'),
  ('Contorni', 'salad', '#22c55e'),
  ('Dolci', 'cake', '#ec4899')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_work_shifts_employee ON work_shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_shifts_date ON work_shifts(date);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

-- Enable Row Level Security (optional, for multi-user)
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
`;
