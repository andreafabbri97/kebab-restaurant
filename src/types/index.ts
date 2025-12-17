// ============== AUTH TYPES ==============
export type UserRole = 'superadmin' | 'admin' | 'staff';

export interface User {
  id: number;
  username: string;
  password: string; // In produzione: hash
  name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  last_login?: string;
}

// Permessi per ruolo
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: [
    'dashboard', 'orders', 'orders.new', 'menu', 'tables',
    'inventory', 'recipes', 'staff', 'reports', 'smac',
    'settings', 'users'
  ],
  admin: [
    'dashboard', 'orders', 'orders.new', 'menu', 'tables',
    'inventory', 'recipes', 'staff'
  ],
  staff: [
    'orders.new', 'orders', 'tables'
  ],
};

// Labels per i ruoli
export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
};

// ============== DATABASE TYPES ==============
export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  price: number;
  description?: string;
  image_url?: string;
  available: boolean;
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  cost: number;
  // Per EOQ
  lead_time_days?: number; // Tempo di consegna fornitore
  order_cost?: number; // Costo fisso per ordine
  holding_cost_percent?: number; // Costo di stoccaggio (% del valore)
}

// Ricetta: collega piatti del menu agli ingredienti
export interface MenuItemIngredient {
  id: number;
  menu_item_id: number;
  menu_item_name?: string;
  ingredient_id: number;
  ingredient_name?: string;
  quantity: number; // Quantità di ingrediente per 1 porzione
  unit?: string;
}

// Storico consumi per calcolo EOQ
export interface IngredientConsumption {
  id: number;
  ingredient_id: number;
  ingredient_name?: string;
  date: string;
  quantity_used: number;
  order_id?: number;
}

// Risultato calcolo EOQ
export interface EOQResult {
  ingredient_id: number;
  ingredient_name: string;
  current_stock: number;
  avg_daily_consumption: number;
  eoq: number; // Quantità ottimale da ordinare
  reorder_point: number; // Quando riordinare
  safety_stock: number; // Scorta di sicurezza
  days_until_reorder: number;
  annual_demand: number;
  order_frequency: number; // Ordini per anno
  total_annual_cost: number;
}

export interface InventoryItem {
  id: number;
  ingredient_id: number;
  ingredient_name?: string;
  quantity: number;
  threshold: number;
  unit?: string;
}

export interface Supply {
  id: number;
  date: string;
  total_cost: number;
  description?: string;
}

export interface SupplyItem {
  id: number;
  supply_id: number;
  ingredient_id: number;
  ingredient_name?: string;
  quantity: number;
  unit_cost: number;
}

export interface Order {
  id: number;
  date: string;
  total: number;
  payment_method: 'cash' | 'card' | 'online';
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  pickup_time?: string;
  table_id?: number;
  table_name?: string;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  smac_passed: boolean;
  customer_name?: string;
  customer_phone?: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item_name?: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  hourly_rate: number;
  phone?: string;
  email?: string;
  active: boolean;
}

export interface WorkShift {
  id: number;
  employee_id: number;
  employee_name?: string;
  date: string;
  hours_worked: number;
  status: 'scheduled' | 'completed' | 'absent';
  shift_type: 'worked' | 'sick' | 'vacation' | 'other';
  notes?: string;
  start_time: string;
  end_time: string;
}

export interface Table {
  id: number;
  name: string;
  capacity: number;
  status?: 'available' | 'occupied' | 'reserved';
  current_order_id?: number;
}

export interface Reservation {
  id: number;
  table_id: number;
  table_name?: string;
  date: string;
  time: string;
  customer_name: string;
  phone: string;
  guests: number;
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface Expense {
  id: number;
  date: string;
  description: string;
  amount: number;
  category?: string;
}

export interface Settings {
  shop_name: string;
  currency: string;
  iva_rate: number;
  default_threshold: number;
  language: string;
  address?: string;
  phone?: string;
  email?: string;
}

// UI Types
export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface DailyStats {
  date: string;
  orders_count: number;
  total_revenue: number;
  avg_order_value: number;
}

export interface TopProduct {
  menu_item_id: number;
  name: string;
  quantity_sold: number;
  revenue: number;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  profit: number;
  period_start: string;
  period_end: string;
}
