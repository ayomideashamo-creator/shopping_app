import { Order } from '../../types';
import { escapeHtml } from '../../storage';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
}

const SHOP_NAME = 'The Counter';
const SHOP_TAGLINE = "Order it. We'll have it ready.";

function formatMoney(n: number): string {
  return '₦' + Number(n).toFixed(2);
}

export default function Receipt({ order, onClose }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div id="receipt-print-area">
          <div className="r-center" style={{ marginBottom: '6px' }}>
            <div style={{ fontFamily: "'Special Elite'", fontSize: '15px' }}>
              {escapeHtml(SHOP_NAME)}
            </div>
            <div style={{ fontSize: '11px' }}>{escapeHtml(SHOP_TAGLINE)}</div>
          </div>
          <div className="r-divider"></div>
          <div className="r-row">
            <span>Ticket {order.ticketNumber}</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="r-row">
            <span>Customer:</span>
            <span>{escapeHtml(order.customerName)}</span>
          </div>
          <div className="r-divider"></div>
          {order.items.map((item, idx) => (
            <div key={idx} className="r-row">
              <span>
                {item.qty}× {escapeHtml(item.name)}
              </span>
              <span>{formatMoney(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="r-divider"></div>
          <div className="r-total">
            <span>TOTAL</span>
            <span>{formatMoney(order.total)}</span>
          </div>
          <div className="r-center" style={{ marginTop: '14px', fontSize: '11px' }}>
            THANK YOU — COME AGAIN
          </div>
          <div className="r-center" style={{ marginTop: '10px' }}>
            <span className="stamp" style={{ color: 'var(--stamp)', borderColor: 'var(--stamp)' }}>
              Paid {order.ticketNumber}
            </span>
          </div>
        </div>
        <div className="modal-actions">
          <button className="print-btn" onClick={handlePrint}>
            Print
          </button>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
