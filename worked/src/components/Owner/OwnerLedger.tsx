import { useState } from 'react';
import { useShopItemsSupabase } from '../../hooks/useShopItemsSupabase';

interface OwnerLedgerProps {
  ownerId: string;
}

export default function OwnerLedger({ ownerId }: OwnerLedgerProps) {
  const { items, loading, error, addItem, updateItem, removeItem } = useShopItemsSupabase(ownerId);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemPrice || !newItemStock) {
      alert('Please fill in all fields');
      return;
    }

    setIsAdding(true);
    const success = await addItem(
      newItemName.trim(),
      parseFloat(newItemPrice),
      parseInt(newItemStock, 10)
    );

    if (success) {
      setNewItemName('');
      setNewItemPrice('');
      setNewItemStock('');
    }
    setIsAdding(false);
  };

  if (loading) {
    return <div className="ledger-container">Loading inventory...</div>;
  }

  return (
    <div className="ledger-container">
      <div className="ledger-section">
        <h3>Add New Item</h3>
        <div className="ledger-form">
          <input
            type="text"
            placeholder="Item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            disabled={isAdding}
          />
          <input
            type="number"
            placeholder="Price"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            disabled={isAdding}
            step="0.01"
          />
          <input
            type="number"
            placeholder="Stock quantity"
            value={newItemStock}
            onChange={(e) => setNewItemStock(e.target.value)}
            disabled={isAdding}
          />
          <button onClick={handleAddItem} disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Item'}
          </button>
        </div>
        {error && <div className="ledger-error">{error}</div>}
      </div>

      <div className="ledger-section">
        <h3>Current Inventory</h3>
        {items.length === 0 ? (
          <p className="ledger-empty">No items yet. Add your first item above.</p>
        ) : (
          <div className="ledger-table">
            <div className="ledger-header">
              <div>Item Name</div>
              <div>Price</div>
              <div>Stock</div>
              <div>Reserved</div>
              <div>Actions</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="ledger-row">
                <div className="ledger-cell">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  />
                </div>
                <div className="ledger-cell">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                    step="0.01"
                  />
                </div>
                <div className="ledger-cell">
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) => updateItem(item.id, 'stock', e.target.value)}
                  />
                </div>
                <div className="ledger-cell">{item.reservedStock}</div>
                <div className="ledger-cell actions">
                  <button onClick={() => removeItem(item.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
