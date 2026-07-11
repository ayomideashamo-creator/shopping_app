import { useState } from 'react';
import { ShopItem } from '../../types';
import { escapeHtml } from '../../storage';

interface OwnerLedgerProps {
  items: ShopItem[];
  onAddItem: (name: string, price: number, stock: number) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onUpdateItem: (itemId: string, field: keyof ShopItem, value: any) => Promise<void>;
  error: string | null;
}

export default function OwnerLedger({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  error,
}: OwnerLedgerProps) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');

  const handleAddItem = async () => {
    const name = newItemName.trim();
    const price = parseFloat(newItemPrice);
    const stock = parseInt(newItemStock, 10);

    await onAddItem(name, price, stock);

    setNewItemName('');
    setNewItemPrice('');
    setNewItemStock('');
  };

  return (
    <div>
      <table className="ledger">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty-note">
                The shelf is bare — add an item below to stock it.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    value={item.name}
                    onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => onUpdateItem(item.id, 'price', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) => onUpdateItem(item.id, 'stock', e.target.value)}
                  />
                </td>
                <td>
                  <button className="remove-x" onClick={() => onRemoveItem(item.id)} title="Remove item">
                    ×
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="add-row">
        <input
          type="text"
          placeholder="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Price"
          value={newItemPrice}
          onChange={(e) => setNewItemPrice(e.target.value)}
        />
        <input
          type="number"
          min="0"
          placeholder="Stock"
          value={newItemStock}
          onChange={(e) => setNewItemStock(e.target.value)}
        />
        <button onClick={handleAddItem}>Add item</button>
      </div>

      {error && <div className="note error">{escapeHtml(error)}</div>}
    </div>
  );
}
