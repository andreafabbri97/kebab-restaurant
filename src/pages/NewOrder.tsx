import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Users,
  Clock,
  Bike,
  X,
  Check,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getCategories,
  getMenuItems,
  getTables,
  createOrder,
  getSettings,
} from '../lib/database';
import { showToast } from '../components/ui/Toast';
import type { Category, MenuItem, Table, CartItem, Settings } from '../types';

type OrderType = 'dine_in' | 'takeaway' | 'delivery';
type PaymentMethod = 'cash' | 'card' | 'online';

export function NewOrder() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [smacPassed, setSmacPassed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cats, items, tbls, setts] = await Promise.all([
        getCategories(),
        getMenuItems(),
        getTables(),
        getSettings(),
      ]);
      setCategories(cats);
      setMenuItems(items);
      setTables(tbls);
      setSettings(setts);
      if (cats.length > 0) {
        setSelectedCategory(cats[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Errore nel caricamento dati', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category_id === selectedCategory && item.available)
    : menuItems.filter((item) => item.available);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const ivaRate = settings?.iva_rate || 17;
  const ivaAmount = cartTotal * (ivaRate / 100);
  const grandTotal = cartTotal + ivaAmount;

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function updateQuantity(itemId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(itemId: number) {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }

  function updateItemNotes(itemId: number, itemNotes: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, notes: itemNotes } : item
      )
    );
  }

  function clearCart() {
    setCart([]);
    setExpandedItemId(null);
  }

  async function submitOrder() {
    if (cart.length === 0) {
      showToast('Aggiungi almeno un prodotto', 'warning');
      return;
    }

    if (orderType === 'dine_in' && !selectedTable) {
      showToast('Seleziona un tavolo', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = {
        date: new Date().toISOString().split('T')[0],
        total: grandTotal,
        payment_method: paymentMethod,
        order_type: orderType,
        table_id: orderType === 'dine_in' ? selectedTable ?? undefined : undefined,
        notes: notes || undefined,
        status: 'pending' as const,
        smac_passed: smacPassed,
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
      };

      const items = cart.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
      }));

      await createOrder(order, items);

      showToast('Ordine creato con successo!', 'success');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Errore nella creazione dell\'ordine', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-100px)]">
      {/* Left side - Products */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-dark-900'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="menu-item-card text-left"
              >
                <h3 className="font-semibold text-white mb-1 line-clamp-2">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-sm text-dark-400 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <p className="text-xl font-bold text-primary-400">
                  €{item.price.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Cart */}
      <div className="w-[420px] flex flex-col bg-dark-800 rounded-2xl border border-dark-700">
        {/* Order Type - Compact Header */}
        <div className="p-3 border-b border-dark-700">
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1 ${
                orderType === 'dine_in'
                  ? 'bg-primary-500 text-dark-900'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Tavolo</span>
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1 ${
                orderType === 'takeaway'
                  ? 'bg-primary-500 text-dark-900'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Asporto</span>
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1 ${
                orderType === 'delivery'
                  ? 'bg-primary-500 text-dark-900'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span className="text-sm font-medium">Domicilio</span>
            </button>
          </div>

          {/* Table Selection - Compact */}
          {orderType === 'dine_in' && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTable === table.id
                        ? 'bg-primary-500 text-dark-900'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    {table.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info for delivery/takeaway - Compact */}
          {(orderType === 'takeaway' || orderType === 'delivery') && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Nome cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input py-2 text-sm flex-1"
              />
              <input
                type="tel"
                placeholder="Telefono"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input py-2 text-sm w-32"
              />
            </div>
          )}
        </div>

        {/* Cart Header with Count */}
        <div className="px-3 py-2 bg-dark-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-white">
              Carrello ({cart.reduce((sum, item) => sum + item.quantity, 0)} articoli)
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Svuota
            </button>
          )}
        </div>

        {/* Cart Items - Main scrollable area with more space */}
        <div className="flex-1 overflow-y-auto p-3 min-h-[200px]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-dark-400 py-8">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">Carrello vuoto</p>
              <p className="text-xs">Clicca su un prodotto per aggiungerlo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="bg-dark-900 rounded-lg p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-primary-400">
                        €{item.price.toFixed(2)} × {item.quantity} = €{(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.notes && expandedItemId !== item.id && (
                        <p className="text-xs text-amber-400 mt-1 truncate">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                          expandedItemId === item.id || item.notes
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                        }`}
                        title="Aggiungi note/variazioni"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-md bg-dark-700 flex items-center justify-center hover:bg-dark-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-md bg-dark-700 flex items-center justify-center hover:bg-dark-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 ml-1 text-red-400 hover:bg-red-500/20 rounded-md transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {/* Expanded notes section */}
                  {expandedItemId === item.id && (
                    <div className="mt-2 pt-2 border-t border-dark-700">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MessageSquare className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">Note / Variazioni</span>
                      </div>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        placeholder="Es: senza cipolla, piccante, doppia carne..."
                        className="w-full bg-dark-800 border border-dark-600 rounded-md px-2 py-1.5 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-amber-500"
                        autoFocus
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['Senza cipolla', 'Piccante', 'Extra salsa', 'Senza pomodoro', 'Ben cotto'].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              const currentNotes = item.notes || '';
                              const newNote = currentNotes ? `${currentNotes}, ${suggestion}` : suggestion;
                              updateItemNotes(item.id, newNote);
                            }}
                            className="px-2 py-0.5 text-[10px] bg-dark-700 text-dark-300 rounded hover:bg-dark-600 transition-colors"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section - Fixed height, only shows when cart has items */}
        {cart.length > 0 && (
          <div className="border-t border-dark-700 bg-dark-800">
            {/* Notes - Collapsible inline */}
            <div className="px-3 py-2 border-b border-dark-700">
              <input
                type="text"
                placeholder="Note ordine (opzionale)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input py-2 text-sm"
              />
            </div>

            {/* Payment + SMAC Row */}
            <div className="px-3 py-2 flex items-center gap-2 border-b border-dark-700">
              <div className="flex gap-1 flex-1">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span className="text-xs">Contanti</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-500 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">Carta</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    paymentMethod === 'online'
                      ? 'bg-purple-500 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs">Online</span>
                </button>
              </div>
              <button
                onClick={() => setSmacPassed(!smacPassed)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  smacPassed
                    ? 'bg-primary-500 text-dark-900'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                }`}
              >
                {smacPassed && <Check className="w-3 h-3" />}
                <span className="text-xs font-medium">SMAC</span>
              </button>
            </div>

            {/* Totals - Compact */}
            <div className="px-3 py-2 space-y-1">
              <div className="flex justify-between text-xs text-dark-400">
                <span>Subtotale</span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-dark-400">
                <span>IVA ({ivaRate}%)</span>
                <span>€{ivaAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-1">
                <span>Totale</span>
                <span className="text-primary-400">€{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="p-3 pt-0">
              <button
                onClick={submitOrder}
                disabled={cart.length === 0 || isSubmitting}
                className="btn-primary w-full py-3"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-dark-900"></div>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Conferma Ordine - €{grandTotal.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty cart bottom - just the button */}
        {cart.length === 0 && (
          <div className="p-3 border-t border-dark-700">
            <button
              disabled
              className="btn-primary w-full py-3 opacity-50 cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              Aggiungi prodotti al carrello
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
