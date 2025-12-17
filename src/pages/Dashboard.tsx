import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
  ChefHat,
} from 'lucide-react';
import {
  getDailyStats,
  getLowStockItems,
  getOrdersByStatus,
} from '../lib/database';
import type { Order, InventoryItem } from '../types';

export function Dashboard() {
  const [todayStats, setTodayStats] = useState({ orders: 0, revenue: 0, avgOrder: 0 });
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [stats, pending, preparing, stock] = await Promise.all([
        getDailyStats(today),
        getOrdersByStatus('pending'),
        getOrdersByStatus('preparing'),
        getLowStockItems(),
      ]);

      setTodayStats(stats);
      setPendingOrders(pending);
      setPreparingOrders(preparing);
      setLowStock(stock);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Panoramica del ristorante</p>
        </div>
        <Link to="/orders/new" className="btn-primary btn-lg">
          <ShoppingCart className="w-5 h-5" />
          Nuovo Ordine
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card glow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Ordini Oggi</p>
              <p className="stat-value">{todayStats.orders}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Incasso Oggi</p>
              <p className="stat-value">€{todayStats.revenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Media Ordine</p>
              <p className="stat-value">€{todayStats.avgOrder.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Scorte Basse</p>
              <p className="stat-value">{lowStock.length}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStock.length > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
              <AlertTriangle className={`w-6 h-6 ${lowStock.length > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="font-semibold text-white">In Attesa</h2>
            </div>
            <span className="badge-warning">{pendingOrders.length}</span>
          </div>
          <div className="card-body space-y-3">
            {pendingOrders.length === 0 ? (
              <p className="text-dark-400 text-center py-4">Nessun ordine in attesa</p>
            ) : (
              pendingOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="order-item">
                  <div>
                    <p className="font-medium text-white">Ordine #{order.id}</p>
                    <p className="text-sm text-dark-400">
                      {order.order_type === 'dine_in' ? `Tavolo ${order.table_name}` :
                       order.order_type === 'takeaway' ? 'Asporto' : 'Domicilio'}
                    </p>
                  </div>
                  <p className="font-semibold text-primary-400">€{order.total.toFixed(2)}</p>
                </div>
              ))
            )}
            {pendingOrders.length > 5 && (
              <Link to="/orders" className="flex items-center justify-center gap-2 text-primary-400 hover:text-primary-300 py-2">
                Vedi tutti <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Preparing Orders */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-white">In Preparazione</h2>
            </div>
            <span className="badge-info">{preparingOrders.length}</span>
          </div>
          <div className="card-body space-y-3">
            {preparingOrders.length === 0 ? (
              <p className="text-dark-400 text-center py-4">Nessun ordine in preparazione</p>
            ) : (
              preparingOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="order-item">
                  <div>
                    <p className="font-medium text-white">Ordine #{order.id}</p>
                    <p className="text-sm text-dark-400">
                      {order.order_type === 'dine_in' ? `Tavolo ${order.table_name}` :
                       order.order_type === 'takeaway' ? 'Asporto' : 'Domicilio'}
                    </p>
                  </div>
                  <p className="font-semibold text-primary-400">€{order.total.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="font-semibold text-white">Scorte Basse</h2>
            </div>
            {lowStock.length > 0 && <span className="badge-danger">{lowStock.length}</span>}
          </div>
          <div className="card-body space-y-3">
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
                <p className="text-dark-300">Tutte le scorte sono OK!</p>
              </div>
            ) : (
              lowStock.map((item) => (
                <div key={item.id} className="order-item border-l-4 border-red-500">
                  <div>
                    <p className="font-medium text-white">{item.ingredient_name}</p>
                    <p className="text-sm text-dark-400">Soglia: {item.threshold} {item.unit}</p>
                  </div>
                  <p className="font-semibold text-red-400">{item.quantity} {item.unit}</p>
                </div>
              ))
            )}
            {lowStock.length > 0 && (
              <Link to="/inventory" className="flex items-center justify-center gap-2 text-primary-400 hover:text-primary-300 py-2">
                Gestisci inventario <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-white">Azioni Rapide</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/orders/new" className="btn-primary text-center py-6 flex flex-col items-center gap-2">
              <ShoppingCart className="w-8 h-8" />
              <span>Nuovo Ordine</span>
            </Link>
            <Link to="/tables" className="btn-secondary text-center py-6 flex flex-col items-center gap-2">
              <Users className="w-8 h-8" />
              <span>Tavoli</span>
            </Link>
            <Link to="/menu" className="btn-secondary text-center py-6 flex flex-col items-center gap-2">
              <ChefHat className="w-8 h-8" />
              <span>Menu</span>
            </Link>
            <Link to="/reports" className="btn-secondary text-center py-6 flex flex-col items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              <span>Report</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
