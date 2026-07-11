import { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { useShopItems } from '../../hooks/useShopItems';
import { useShopOrders } from '../../hooks/useShopOrders';
import { Order, Toast } from '../../types';
import { escapeHtml } from '../../storage';
import OwnerTickets from './OwnerTickets';
import OwnerLedger from './OwnerLedger';
import Receipt from './Receipt';
import '../styles/Owner.css';

const SHOP_NAME = 'The Counter';
const SHOP_TAGLINE = "Order it. We'll have it ready.";

export default function OwnerDashboard() {
  const { getOwnerId } = useShop();
  const ownerId = getOwnerId();

  const { items, loading: itemsLoading, addItem, removeItem, updateItem } = useShopItems(ownerId);
  const { orders, loading: ordersLoading, addOrder, markFulfilled, clearAllOrders } = useShopOrders(ownerId);

  const [tab, setTab] = useState<'tickets' | 'ledger'>('tickets');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAddItem = async (name: string, price: number, stock: number) => {
    if (!name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
      setStorageError('Give the item a name, a price, and a stock count to add it to the shelf.');
      return;
    }
    await addItem(name, price, stock);
    setStorageError(null);
  };

  const handleOpenReceipt = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowReceipt(true);
    }
  };

  const handleClearAllTickets = async () => {
    if (orders.length === 0) return;
    const confirmed = window.confirm(
      'Clear all incoming tickets? This cannot be undone. Stock levels will not be affected.'
    );
    if (!confirmed) return;
    await clearAllOrders();
  };

  if (itemsLoading || ordersLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: "'Special Elite'", color: 'var(--paper-2)' }}>
        Opening the shop…
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      {toast && <div className="toast">🔔 {escapeHtml(toast.message)}</div>}

      <header>
        <div>
          <div className="shop-title display">{escapeHtml(SHOP_NAME)}</div>
          <div className="shop-tagline">{escapeHtml(SHOP_TAGLINE)}</div>
        </div>
        <div className="header-actions">
          <a href="/" className="header-home" aria-label="Owner home">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </a>
          <div className="badge">Owner's Desk</div>
        </div>
      </header>

      <div className="owner-tabs">
        <button className={tab === 'tickets' ? 'active' : ''} onClick={() => setTab('tickets')}>
          Incoming Tickets
        </button>
        <button className={tab === 'ledger' ? 'active' : ''} onClick={() => setTab('ledger')}>
          Stock Ledger
        </button>
      </div>

      <div className="panel">
        {tab === 'tickets' ? (
          <OwnerTickets
            orders={orders}
            onMarkFulfilled={markFulfilled}
            onOpenReceipt={handleOpenReceipt}
            onClearAll={handleClearAllTickets}
          />
        ) : (
          <OwnerLedger
            items={items}
            onAddItem={handleAddItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
            error={storageError}
          />
        )}
      </div>

      {showReceipt && selectedOrder && (
        <Receipt order={selectedOrder} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
}
