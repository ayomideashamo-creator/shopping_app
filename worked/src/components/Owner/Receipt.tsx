import { Order } from '../../types';
import './Owner.css';

interface ReceiptProps {
  order: Order;
}

export default function Receipt({ order }: ReceiptProps) {
  return (
    <div className="receipt">
      <div className="receipt-header">
        <h2>Receipt</h2>
        <div className="receipt-ticket">Ticket #{order.ticketNumber}</div>
      </div>

      <div className="receipt-customer">
        <div className="receipt-label">Customer:</div>
        <div className="receipt-value">{order.customerName}</div>
      </div>

      <div className="receipt-time">
        {new Date(order.createdAt).toLocaleString()}
      </div>

      <div className="receipt-items">
        <div className="receipt-items-header">
          <div>Item</div>
          <div>Qty</div>
          <div>Price</div>
          <div>Total</div>
        </div>
        {order.items.map((item, idx) => (
          <div key={idx} className="receipt-item-row">
            <div>{item.name}</div>
            <div>{item.qty}</div>
            <div>₦{item.price.toFixed(2)}</div>
            <div>₦{(item.price * item.qty).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="receipt-total">
        <div className="receipt-total-label">Total:</div>
        <div className="receipt-total-value">₦{order.total.toFixed(2)}</div>
      </div>

      <div className="receipt-status">
        Status: <strong>{order.status === 'pending' ? '⏳ Pending' : '✓ Fulfilled'}</strong>
      </div>
    </div>
  );
}
