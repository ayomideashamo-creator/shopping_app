import { useState } from 'react';
import { useShopItems } from '../../hooks/useShopItems';
import { useShopOrders } from '../../hooks/useShopOrders';
import { ShopItem, LineItem } from '../../types';
import { escapeHtml } from '../../storage';
import './Customer.css';

const SHOP_NAME = 'The Counter';
const SHOP_TAGLINE = "Order it. We'll have it ready.";

interface CartItem extends LineItem {
  availableStock: number;
}

export default function CustomerPage({ ownerId }: { ownerId: string }) {
  const { items, loading } = useShopItems(ownerId);
  const { addOrder } = useShopOrders(ownerId);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);

  const addToCart = (item: ShopItem) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      if (existing.qty < item.stock - item.reservedStock) {
        setCart(
          cart.map((c) =>
            c.id === item.id ? { ...c, qty: c.qty + 1 } : c
          )
        );
      }
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          availableStock: item.stock - item.reservedStock,
        },
      ]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.id !== itemId));
  };

  const updateQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
    } else {
      const item = cart.find((c) => c.id === itemId);
      if (item && qty <= item.availableStock) {
        setCart(cart.map((c) => (c.id === itemId ? { ...c, qty } : c)));
      }
    }
  };

  const handleCheckout = async () => {
    if (!customerName.trim() || cart.length === 0) {
      alert('Please enter your name and add items to your cart.');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const ticket = Math.floor(Math.random() * 10000) + 1;

    const order = {
      id: `ord_${Date.now().toString(36)}`,
      customerName: customerName.trim(),
      ticketNumber: ticket,
      items: cart.map(({ availableStock, ...item }) => item),
      total,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    await addOrder(order);
    setTicketNumber(ticket);
    setOrderPlaced(true);
    setCart([]);
    setCustomerName('');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading menu…</div>;
  }

  if (orderPlaced && ticketNumber) {
    return (
      <div className="customer-page">
        <header className="customer-header">
          <div>
            <div className="shop-title">{escapeHtml(SHOP_NAME)}</div>
            <div className="shop-tagline">{escapeHtml(SHOP_TAGLINE)}</div>
          </div>
        </header>
        <div className="panel">
          <div className="success-message">
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
            <h2>Order Placed!</h2>
            <p>Your ticket number is:</p>
            <div className="ticket-display">{ticketNumber}</div>
            <p style={{ marginTop: '20px', color: '#666' }}>
              Please wait for your order to be prepared.
            </p>
            <button
              onClick={() => {
                setOrderPlaced(false);
                setTicketNumber(null);
              }}
              style={{ marginTop: '30px' }}
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="customer-page">
      <header className="customer-header">
        <div>
          <div className="shop-title">{escapeHtml(SHOP_NAME)}</div>
          <div className="shop-tagline">{escapeHtml(SHOP_TAGLINE)}</div>
        </div>
      </header>

      <div className="customer-container">
        <div className="menu-section">
          <h2>Menu</h2>
          <div className="menu-grid">
            {items.map((item) => {
              const available = item.stock - item.reservedStock;
              return (
                <div key={item.id} className="menu-item">
                  <div className="menu-item-name">{escapeHtml(item.name)}</div>
                  <div className="menu-item-price">₦{item.price.toFixed(2)}</div>
                  <div className="menu-item-stock">
                    {available > 0 ? `${available} available` : 'Out of stock'}
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={available <= 0}
                    className="btn-add-to-cart"
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cart-section">
          <h2>Your Order</h2>

          <div className="form-group">
            <label>Your name:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">Your cart is empty</div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-name">{escapeHtml(item.name)}</div>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateQty(item.id, parseInt(e.target.value, 10))}
                      />
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <div className="cart-item-price">₦{(item.price * item.qty).toFixed(2)}</div>
                    <button onClick={() => removeFromCart(item.id)} className="btn-remove">
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-total">
                <strong>Total: ₦{cartTotal.toFixed(2)}</strong>
              </div>

              <button onClick={handleCheckout} className="btn-checkout">
                Place Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
