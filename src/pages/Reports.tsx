import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ShoppingCart,
  Package,
  BarChart3,
} from 'lucide-react';
import {
  getWeeklyStats,
  getTopProducts,
  getOrders,
  getExpenses,
  createExpense,
} from '../lib/database';
import { showToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface WeeklyStat {
  date: string;
  orders: number;
  revenue: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export function Reports() {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [periodStats, setPeriodStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalExpenses: 0,
    profit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Expense modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'general',
  });

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  async function loadData() {
    setLoading(true);
    try {
      const [weekly, top, orders, expenses] = await Promise.all([
        getWeeklyStats(),
        getTopProducts(10),
        getOrders(),
        getExpenses(startDate, endDate),
      ]);

      setWeeklyStats(weekly);
      setTopProducts(top);

      // Calculate period stats
      const periodOrders = orders.filter(
        (o) => o.date >= startDate && o.date <= endDate && o.status !== 'cancelled'
      );
      const totalRevenue = periodOrders.reduce((sum, o) => sum + o.total, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

      setPeriodStats({
        totalRevenue,
        totalOrders: periodOrders.length,
        totalExpenses,
        profit: totalRevenue - totalExpenses,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Errore nel caricamento dati', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExpense() {
    if (!expenseForm.description.trim() || !expenseForm.amount) {
      showToast('Compila tutti i campi', 'warning');
      return;
    }

    try {
      await createExpense({
        date: new Date().toISOString().split('T')[0],
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
      });

      showToast('Spesa aggiunta', 'success');
      setShowExpenseModal(false);
      setExpenseForm({ description: '', amount: '', category: 'general' });
      loadData();
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast('Errore nell\'aggiunta', 'error');
    }
  }

  const chartData = weeklyStats.map((stat) => ({
    ...stat,
    date: new Date(stat.date).toLocaleDateString('it-IT', { weekday: 'short' }),
  }));

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
          <h1 className="text-3xl font-bold text-white">Report</h1>
          <p className="text-dark-400 mt-1">Analisi vendite e statistiche</p>
        </div>
        <button onClick={() => setShowExpenseModal(true)} className="btn-primary">
          <DollarSign className="w-5 h-5" />
          Aggiungi Spesa
        </button>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-dark-400" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input w-auto"
        />
        <span className="text-dark-400">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input w-auto"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card glow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Incasso Totale</p>
              <p className="stat-value">€{periodStats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Ordini Totali</p>
              <p className="stat-value">{periodStats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Spese Totali</p>
              <p className="stat-value">€{periodStats.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Profitto</p>
              <p className={`stat-value ${periodStats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                €{periodStats.profit.toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${periodStats.profit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              <DollarSign className={`w-6 h-6 ${periodStats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Incassi Ultimi 7 Giorni
            </h2>
          </div>
          <div className="card-body h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Ordini Ultimi 7 Giorni
            </h2>
          </div>
          <div className="card-body h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Prodotti Più Venduti
          </h2>
        </div>
        <div className="card-body">
          {topProducts.length === 0 ? (
            <p className="text-dark-400 text-center py-8">
              Nessun dato disponibile per il periodo selezionato
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-4 p-4 bg-dark-900 rounded-xl"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-primary-500 text-dark-900'
                        : index === 1
                        ? 'bg-dark-600 text-white'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-dark-700 text-dark-300'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="text-sm text-dark-400">
                      {product.quantity} venduti
                    </p>
                  </div>
                  <p className="font-semibold text-primary-400">
                    €{product.revenue.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Aggiungi Spesa"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Descrizione *</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="input"
              placeholder="Es. Bolletta elettricità"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Importo (€) *</label>
              <input
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="select"
              >
                <option value="general">Generale</option>
                <option value="utilities">Utenze</option>
                <option value="rent">Affitto</option>
                <option value="supplies">Forniture</option>
                <option value="salaries">Stipendi</option>
                <option value="maintenance">Manutenzione</option>
                <option value="other">Altro</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button onClick={handleAddExpense} className="btn-primary flex-1">
              Aggiungi Spesa
            </button>
            <button onClick={() => setShowExpenseModal(false)} className="btn-secondary">
              Annulla
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
