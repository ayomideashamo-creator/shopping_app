import { useEffect, useState } from 'react';
import { loadStoredForOwner, saveStoredForOwner } from '../storage';
import { ShopItem } from '../types';

const DEFAULT_ITEMS: ShopItem[] = [
  { id: 'itm_bread', name: 'Bread', price: 3.0, stock: 20, reservedStock: 0 },
  { id: 'itm_milk', name: 'Milk', price: 2.5, stock: 15, reservedStock: 0 },
  { id: 'itm_eggs', name: 'Eggs (dozen)', price: 4.2, stock: 10, reservedStock: 0 },
  { id: 'itm_coffee', name: 'Coffee', price: 7.5, stock: 8, reservedStock: 0 },
  { id: 'itm_apples', name: 'Apples (kg)', price: 2.8, stock: 25, reservedStock: 0 },
  { id: 'itm_soap', name: 'Soap', price: 1.9, stock: 30, reservedStock: 0 },
];

export function useShopItems(ownerId: string) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      const stored = loadStoredForOwner('shop-items', null, ownerId);
      if (stored) {
        setItems(stored);
      } else {
        setItems(DEFAULT_ITEMS);
        saveStoredForOwner('shop-items', DEFAULT_ITEMS, ownerId);
      }
      setLoading(false);
    };
    loadItems();
  }, [ownerId]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith(`shop-items:${ownerId}`)) {
        const updated = JSON.parse(e.newValue || '[]');
        setItems(updated);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [ownerId]);

  const addItem = async (name: string, price: number, stock: number) => {
    const newItem: ShopItem = {
      id: `id_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      name,
      price,
      stock,
      reservedStock: 0,
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveStoredForOwner('shop-items', updated, ownerId);
  };

  const removeItem = async (itemId: string) => {
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    saveStoredForOwner('shop-items', updated, ownerId);
  };

  const updateItem = async (itemId: string, field: keyof ShopItem, value: any) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        if (field === 'price') {
          const v = parseFloat(value);
          return { ...item, price: !isNaN(v) && v >= 0 ? v : item.price };
        } else if (field === 'stock') {
          const v = parseInt(value, 10);
          return { ...item, stock: !isNaN(v) && v >= 0 ? v : item.stock };
        } else if (field === 'name') {
          return { ...item, name: String(value).trim() || item.name };
        }
      }
      return item;
    });
    setItems(updated);
    saveStoredForOwner('shop-items', updated, ownerId);
  };

  return { items, loading, addItem, removeItem, updateItem };
}
