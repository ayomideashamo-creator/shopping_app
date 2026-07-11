import { useEffect, useState } from 'react';
import { loadStoredForOwner, saveStoredForOwner } from '../storage';
import { Order } from '../types';

export function useShopOrders(ownerId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const stored = loadStoredForOwner('shop-orders', [], ownerId);
      setOrders(stored || []);
      setLoading(false);
    };
    loadOrders();
  }, [ownerId]);

  // Listen for storage events from other tabs (live updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith(`shop-orders:${ownerId}`)) {
        const updated = JSON.parse(e.newValue || '[]');
        setOrders(updated);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [ownerId]);

  const addOrder = async (order: Order) => {
    const updated = [...orders, order];
    setOrders(updated);
    saveStoredForOwner('shop-orders', updated, ownerId);
  };

  const markFulfilled = async (orderId: string) => {
    const updated = orders.map((order) => {
      if (order.id === orderId && order.status === 'pending') {
        return { ...order, status: 'fulfilled' as const };
      }
      return order;
    });
    setOrders(updated);
    saveStoredForOwner('shop-orders', updated, ownerId);
  };

  const clearAllOrders = async () => {
    setOrders([]);
    saveStoredForOwner('shop-orders', [], ownerId);
  };

  return { orders, loading, addOrder, markFulfilled, clearAllOrders };
}
