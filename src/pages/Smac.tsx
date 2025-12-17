import { useEffect, useState } from 'react';
import {
  FileCheck,
  FileX,
  Calendar,
  CheckCircle,
  AlertCircle,
  Check,
  RefreshCw,
} from 'lucide-react';
import { getOrders } from '../lib/database';
import { showToast } from '../components/ui/Toast';
import type { Order } from '../types';

// Extend the database to support SMAC update
async function updateOrderSmac(orderId: number, smacPassed: boolean): Promise<void> {
  // For local storage mode
  const STORAGE_PREFIX = 'kebab_';
  const orders = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'orders') || '[]');
  const index = orders.findIndex((o: Order) => o.id === orderId);
  if (index !== -1) {
    orders[index].smac_passed = smacPassed;
    localStorage.setItem(STORAGE_PREFIX + 'orders', JSON.stringify(orders));
  }
}

export function Smac() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'passed' | 'not_passed'>('all');

  useEffect(() => {
    loadOrders();
  }, [selectedDate]);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await getOrders(selectedDate);
      // Filter out cancelled orders
      setOrders(data.filter(o => o.status !== 'cancelled'));
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Errore nel caricamento ordini', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === 'passed') return order.smac_passed;
    if (filter === 'not_passed') return !order.smac_passed;
    return true;
  });

  const passedTotal = orders
    .filter((o) => o.smac_passed)
    .reduce((sum, o) => sum + o.total, 0);

  const notPassedTotal = orders
    .filter((o) => !o.smac_passed)
    .reduce((sum, o) => sum + o.total, 0);

  const passedCount = orders.filter((o) => o.smac_passed).length;
  const notPassedCount = orders.filter((o) => !o.smac_passed).length;

  async function toggleSmac(order: Order) {
    try {
      await updateOrderSmac(order.id, !order.smac_passed);
      showToast(
        order.smac_passed ? 'SMAC rimossa' : 'SMAC registrata',
        'success'
      );
      loadOrders();
    } catch (error) {
      console.error('Error updating SMAC:', error);
      showToast('Errore nell\'aggiornamento', 'error');
    }
  }

  async function markAllAsPassed() {
    if (!confirm(`Segnare tutti i ${notPassedCount} ordini come SMAC passata?`)) return;

    try {
      for (const order of orders.filter((o) => !o.smac_passed)) {
        await updateOrderSmac(order.id, true);
      }
      showToast(`${notPassedCount} ordini segnati come SMAC passata`, 'success');
      loadOrders();
    } catch (error) {
      console.error('Error updating SMAC:', error);
      showToast('Errore nell\'aggiornamento', 'error');
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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
          <h1 className="text-3xl font-bold text-white">Dichiarazioni SMAC</h1>
          <p className="text-dark-400 mt-1">
            Gestione SMAC per la dichiarazione fiscale di San Marino
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadOrders} className="btn-secondary">
            <RefreshCw className="w-5 h-5" />
          </button>
          {notPassedCount > 0 && (
            <button onClick={markAllAsPassed} className="btn-primary">
              <CheckCircle className="w-5 h-5" />
              Segna Tutti come Passati
            </button>
          )}
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-dark-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input w-auto"
        />
        <span className="text-dark-400">{formatDate(selectedDate)}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Ordini Totali</p>
              <p className="stat-value">{orders.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card glow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">SMAC Passata</p>
              <p className="stat-value text-emerald-400">€{passedTotal.toFixed(2)}</p>
              <p className="text-xs text-dark-500 mt-1">{passedCount} ordini</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">SMAC Non Passata</p>
              <p className="stat-value text-amber-400">€{notPassedTotal.toFixed(2)}</p>
              <p className="text-xs text-dark-500 mt-1">{notPassedCount} ordini</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Incasso Giornata</p>
              <p className="stat-value">€{(passedTotal + notPassedTotal).toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filter === 'all'
              ? 'bg-primary-500 text-dark-900'
              : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
          }`}
        >
          Tutti ({orders.length})
        </button>
        <button
          onClick={() => setFilter('passed')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filter === 'passed'
              ? 'bg-emerald-500 text-white'
              : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Passata ({passedCount})
          </span>
        </button>
        <button
          onClick={() => setFilter('not_passed')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filter === 'not_passed'
              ? 'bg-amber-500 text-dark-900'
              : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Non Passata ({notPassedCount})
          </span>
        </button>
      </div>

      {/* Orders List */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-white">
            Ordini del {formatDate(selectedDate)}
          </h2>
        </div>
        <div className="divide-y divide-dark-700">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-dark-400">
              <FileX className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nessun ordine trovato per questa data</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 hover:bg-dark-900/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      order.smac_passed
                        ? 'bg-emerald-500/20'
                        : 'bg-amber-500/20'
                    }`}
                  >
                    {order.smac_passed ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Ordine #{order.id}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-dark-400">
                      <span>
                        {order.order_type === 'dine_in'
                          ? `Tavolo ${order.table_name || order.table_id}`
                          : order.order_type === 'takeaway'
                          ? 'Asporto'
                          : 'Domicilio'}
                      </span>
                      <span>•</span>
                      <span>
                        {order.payment_method === 'cash'
                          ? 'Contanti'
                          : order.payment_method === 'card'
                          ? 'Carta'
                          : 'Online'}
                      </span>
                      {order.customer_name && (
                        <>
                          <span>•</span>
                          <span>{order.customer_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-400">
                      €{order.total.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm ${
                        order.smac_passed ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {order.smac_passed ? 'SMAC Passata' : 'SMAC Non Passata'}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleSmac(order)}
                    className={`p-3 rounded-xl transition-all ${
                      order.smac_passed
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-dark-700 text-dark-300 hover:bg-amber-500 hover:text-dark-900'
                    }`}
                    title={order.smac_passed ? 'Rimuovi SMAC' : 'Segna come SMAC passata'}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="font-semibold text-blue-400 mb-2">Cos'è la SMAC?</h3>
        <p className="text-sm text-dark-300">
          La <strong>SMAC</strong> (Carta Servizi) è il sistema di San Marino per la
          tracciabilità delle transazioni commerciali. Quando un cliente presenta
          la sua carta SMAC al momento del pagamento, l'importo viene registrato
          per beneficiare di detrazioni fiscali. Questa sezione ti permette di
          tenere traccia di quali ordini hanno avuto la SMAC passata.
        </p>
      </div>
    </div>
  );
}
