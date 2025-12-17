import { useEffect, useState } from 'react';
import {
  Plus,
  Users,
  Clock,
  X,
  Calendar,
  Phone,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  getTables,
  getReservations,
  getOrders,
  createTable,
  updateTable,
  deleteTable,
  createReservation,
  deleteReservation,
} from '../lib/database';
import { showToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import type { Table, Reservation, Order } from '../types';

export function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal states
  const [showTableModal, setShowTableModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Form states
  const [tableForm, setTableForm] = useState({ name: '', capacity: '4' });
  const [reservationForm, setReservationForm] = useState({
    table_id: 0,
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    customer_name: '',
    phone: '',
    guests: '2',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  async function loadData() {
    try {
      const [tablesData, reservationsData, ordersData] = await Promise.all([
        getTables(),
        getReservations(selectedDate),
        getOrders(selectedDate),
      ]);
      setTables(tablesData);
      setReservations(reservationsData);
      setActiveOrders(ordersData.filter(o => o.status !== 'delivered' && o.status !== 'cancelled'));
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Errore nel caricamento dati', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getTableStatus(tableId: number): 'available' | 'occupied' | 'reserved' {
    const hasActiveOrder = activeOrders.some(o => o.table_id === tableId);
    if (hasActiveOrder) return 'occupied';

    const hasReservation = reservations.some(r => r.table_id === tableId && r.status === 'confirmed');
    if (hasReservation) return 'reserved';

    return 'available';
  }

  function getTableOrder(tableId: number): Order | undefined {
    return activeOrders.find(o => o.table_id === tableId);
  }

  function getTableReservation(tableId: number): Reservation | undefined {
    return reservations.find(r => r.table_id === tableId && r.status === 'confirmed');
  }

  function openTableModal(table?: Table) {
    if (table) {
      setEditingTable(table);
      setTableForm({ name: table.name, capacity: table.capacity.toString() });
    } else {
      setEditingTable(null);
      setTableForm({ name: '', capacity: '4' });
    }
    setShowTableModal(true);
  }

  function openReservationModal(tableId: number) {
    setReservationForm({
      ...reservationForm,
      table_id: tableId,
      date: selectedDate,
    });
    setShowReservationModal(true);
  }

  async function handleSaveTable() {
    if (!tableForm.name.trim()) {
      showToast('Inserisci un nome per il tavolo', 'warning');
      return;
    }

    try {
      const data = {
        name: tableForm.name.trim(),
        capacity: parseInt(tableForm.capacity) || 4,
      };

      if (editingTable) {
        await updateTable(editingTable.id, data);
        showToast('Tavolo aggiornato', 'success');
      } else {
        await createTable(data);
        showToast('Tavolo creato', 'success');
      }

      setShowTableModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving table:', error);
      showToast('Errore nel salvataggio', 'error');
    }
  }

  async function handleDeleteTable(id: number) {
    if (!confirm('Sei sicuro di voler eliminare questo tavolo?')) return;

    try {
      await deleteTable(id);
      showToast('Tavolo eliminato', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting table:', error);
      showToast('Errore nell\'eliminazione', 'error');
    }
  }

  async function handleSaveReservation() {
    if (!reservationForm.customer_name.trim()) {
      showToast('Inserisci il nome del cliente', 'warning');
      return;
    }

    try {
      await createReservation({
        table_id: reservationForm.table_id,
        date: reservationForm.date,
        time: reservationForm.time,
        customer_name: reservationForm.customer_name.trim(),
        phone: reservationForm.phone,
        guests: parseInt(reservationForm.guests) || 2,
        notes: reservationForm.notes || undefined,
        status: 'confirmed',
      });

      showToast('Prenotazione creata', 'success');
      setShowReservationModal(false);
      setReservationForm({
        table_id: 0,
        date: selectedDate,
        time: '19:00',
        customer_name: '',
        phone: '',
        guests: '2',
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating reservation:', error);
      showToast('Errore nella creazione', 'error');
    }
  }

  async function handleCancelReservation(id: number) {
    if (!confirm('Annullare questa prenotazione?')) return;

    try {
      await deleteReservation(id);
      showToast('Prenotazione annullata', 'success');
      loadData();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      showToast('Errore nell\'annullamento', 'error');
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
          <h1 className="text-3xl font-bold text-white">Tavoli</h1>
          <p className="text-dark-400 mt-1">Gestisci tavoli e prenotazioni</p>
        </div>
        <button onClick={() => openTableModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Nuovo Tavolo
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-dark-400" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input w-auto"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-sm text-dark-300">Disponibile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm text-dark-300">Occupato</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500" />
          <span className="text-sm text-dark-300">Prenotato</span>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => {
          const status = getTableStatus(table.id);
          const order = getTableOrder(table.id);
          const reservation = getTableReservation(table.id);

          return (
            <div
              key={table.id}
              className={`
                ${status === 'available' ? 'table-available' : ''}
                ${status === 'occupied' ? 'table-occupied' : ''}
                ${status === 'reserved' ? 'table-reserved' : ''}
                p-4
              `}
            >
              <h3 className="text-lg font-bold">{table.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">{table.capacity}</span>
              </div>

              {order && (
                <div className="mt-2 text-xs">
                  <p>Ordine #{order.id}</p>
                  <p className="font-semibold">€{order.total.toFixed(2)}</p>
                </div>
              )}

              {reservation && !order && (
                <div className="mt-2 text-xs">
                  <p>{reservation.customer_name}</p>
                  <p>{reservation.time}</p>
                </div>
              )}

              {status === 'available' && (
                <button
                  onClick={() => openReservationModal(table.id)}
                  className="mt-3 text-xs underline hover:no-underline"
                >
                  Prenota
                </button>
              )}

              {/* Edit/Delete on hover */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openTableModal(table);
                  }}
                  className="p-1 bg-dark-800 rounded hover:bg-dark-700"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTable(table.id);
                  }}
                  className="p-1 bg-dark-800 rounded hover:bg-red-500/20"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Reservations */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold text-white">
            Prenotazioni per {new Date(selectedDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
        </div>
        <div className="card-body">
          {reservations.length === 0 ? (
            <p className="text-dark-400 text-center py-4">
              Nessuna prenotazione per questa data
            </p>
          ) : (
            <div className="space-y-3">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-4 bg-dark-900 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {res.customer_name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-dark-400">
                        <span>{res.time}</span>
                        <span>{res.table_name}</span>
                        <span>{res.guests} ospiti</span>
                      </div>
                      {res.phone && (
                        <div className="flex items-center gap-1 text-sm text-dark-400">
                          <Phone className="w-3 h-3" />
                          {res.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${res.status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                      {res.status === 'confirmed' ? 'Confermata' : 'Annullata'}
                    </span>
                    {res.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelReservation(res.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Modal */}
      <Modal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        title={editingTable ? 'Modifica Tavolo' : 'Nuovo Tavolo'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Nome Tavolo</label>
            <input
              type="text"
              value={tableForm.name}
              onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
              className="input"
              placeholder="Es. Tavolo 1"
            />
          </div>

          <div>
            <label className="label">Capacità (posti)</label>
            <input
              type="number"
              min="1"
              value={tableForm.capacity}
              onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button onClick={handleSaveTable} className="btn-primary flex-1">
              {editingTable ? 'Salva' : 'Crea'}
            </button>
            <button onClick={() => setShowTableModal(false)} className="btn-secondary">
              Annulla
            </button>
          </div>
        </div>
      </Modal>

      {/* Reservation Modal */}
      <Modal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        title="Nuova Prenotazione"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data</label>
              <input
                type="date"
                value={reservationForm.date}
                onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Ora</label>
              <input
                type="time"
                value={reservationForm.time}
                onChange={(e) => setReservationForm({ ...reservationForm, time: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Nome Cliente *</label>
            <input
              type="text"
              value={reservationForm.customer_name}
              onChange={(e) => setReservationForm({ ...reservationForm, customer_name: e.target.value })}
              className="input"
              placeholder="Nome e cognome"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Telefono</label>
              <input
                type="tel"
                value={reservationForm.phone}
                onChange={(e) => setReservationForm({ ...reservationForm, phone: e.target.value })}
                className="input"
                placeholder="+39..."
              />
            </div>
            <div>
              <label className="label">Ospiti</label>
              <input
                type="number"
                min="1"
                value={reservationForm.guests}
                onChange={(e) => setReservationForm({ ...reservationForm, guests: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Note</label>
            <textarea
              value={reservationForm.notes}
              onChange={(e) => setReservationForm({ ...reservationForm, notes: e.target.value })}
              className="input resize-none h-20"
              placeholder="Note aggiuntive..."
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button onClick={handleSaveReservation} className="btn-primary flex-1">
              Crea Prenotazione
            </button>
            <button onClick={() => setShowReservationModal(false)} className="btn-secondary">
              Annulla
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
