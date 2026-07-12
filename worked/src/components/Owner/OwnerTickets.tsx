import { useState } from 'react';
import { useShopOrdersSupabase } from '../../hooks/useShopOrdersSupabase';
import Receipt from './Receipt';
import './Owner.css';

interface OwnerTicketsProps {
  ownerId: string;
}

export default function OwnerTickets({ ownerId }: OwnerTicketsProps) {
  const { orders, loading, error, markFulfilled, clearAllOrders } = useShopOrdersSupabase(ownerId);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const fulfilledOrders = orders.filter((o) => o.status === 'fulfilled');

  const handleMarkFulfilled = async (orderId: string) => {
    await markFulfilled(orderId);
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all orders? This cannot be undone.')) {
      await clearAllOrders();
    }
  };

  if (loading) {
    return <div className="tickets-container">Loading orders...</div>;
  }

  if (selectedOrder) {
    const order = orders.find((o) => o.id === selectedOrder);
    if (order) {
      return (
        <div className="tickets-container">
          <button onClick={() => setSelectedOrder(null)} className="btn-back">
            ← Back to Tickets
          </button>
          <Receipt order={order} />
        </div>
      );
    }
  }

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h3>Incoming Tickets ({pendingOrders.length})</h3>
        {orders.length > 0 && (
          <button onClick={handleClearAll} className="btn-clear">
            Clear All
          </button>
        )}
      </div>

      {error && <div className="tickets-error">{error}</div>}

      {pendingOrders.length === 0 ? (
        <p className="tickets-empty">No pending orders</p>
      ) : (
        <div className="tickets-grid">
          {pendingOrders.map((order) => (
            <div key={order.id} className="ticket-card pending">
              <div className="ticket-number">{order.ticketNumber}</div>
              <div className="ticket-customer">{order.customerName}</div>
              <div className="ticket-items">{order.items.length} item(s)</div>
              <div className="ticket-total">₦{order.total.toFixed(2)}</div>
              <div className="ticket-actions">
                <button onClick={() => setSelectedOrder(order.id)} className="btn-view">
                  View
                </button>
                <button
                  onClick={() => handleMarkFulfilled(order.id)}
                  className="btn-fulfill"
                >
                  ✓ Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {fulfilledOrders.length > 0 && (
        <>
          <h3 style={{ marginTop: '40px' }}>Fulfilled ({fulfilledOrders.length})</h3>
          <div className="tickets-grid">
            {fulfilledOrders.map((order) => (
              <div key={order.id} className="ticket-card fulfilled">
                <div className="ticket-number">{order.ticketNumber}</div>
                <div className="ticket-customer">{order.customerName}</div>
                <div className="ticket-items">{order.items.length} item(s)</div>
                <div className="ticket-total">₦{order.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
