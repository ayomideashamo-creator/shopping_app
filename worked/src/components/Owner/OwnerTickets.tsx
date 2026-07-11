import { Order } from '../../types';
import { escapeHtml } from '../../storage';

interface OwnerTicketsProps {
  orders: Order[];
  onMarkFulfilled: (orderId: string) => Promise<void>;
  onOpenReceipt: (orderId: string) => void;
  onClearAll: () => Promise<void>;
}

function formatMoney(n: number): string {
  return '₦' + Number(n).toFixed(2);
}

export default function OwnerTickets({
  orders,
  onMarkFulfilled,
  onOpenReceipt,
  onClearAll,
}: OwnerTicketsProps) {
  if (orders.length === 0) {
    return <div className="empty-note">No tickets yet — orders sent by customers will land here.</div>;
  }

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <button className="btn-outline" onClick={onClearAll}>
          Clear all tickets
        </button>
      </div>

      {sorted.map((order) => {
        const stampColor = order.status === 'fulfilled' ? 'var(--mint)' : 'var(--brass)';
        return (
          <div key={order.id} className="ticket-stub">
            <div className="stub-left">
              <div className="stub-customer">
                {escapeHtml(order.customerName)}{' '}
                <span className="ledger-num" style={{ color: '#8a8273', fontSize: '12px' }}>
                  {order.ticketNumber}
                </span>
              </div>
              <div className="stub-meta">{new Date(order.createdAt).toLocaleString()}</div>
              <div className="stub-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="row">
                    <span>
                      {item.qty}× {escapeHtml(item.name)}
                    </span>
                    <span>{formatMoney(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="stub-total">Total: {formatMoney(order.total)}</div>
            </div>
            <div className="stub-right">
              <span className="stamp" style={{ color: stampColor, borderColor: stampColor }}>
                {order.status}
              </span>
              <div className="stub-actions">
                <button className="btn-outline" onClick={() => onOpenReceipt(order.id)}>
                  Print Receipt
                </button>
                {order.status === 'pending' && (
                  <button className="btn-fill" onClick={() => onMarkFulfilled(order.id)}>
                    Mark Fulfilled
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
