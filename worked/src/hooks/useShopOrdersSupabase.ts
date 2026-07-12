import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

export function useShopOrdersSupabase(ownerId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();

    // Real-time subscription
    const subscription = supabase
      .channel(`shop_orders:${ownerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_orders', filter: `owner_id=eq.${ownerId}` }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [ownerId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('shop_orders')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setOrders(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (order: Omit<Order, 'id'> & { owner_id: string }) => {
    try {
      const { data, error: err } = await supabase
        .from('shop_orders')
        .insert([order])
        .select();

      if (err) throw err;
      if (data) setOrders([...data, ...orders]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add order');
      return false;
    }
  };

  const markFulfilled = async (orderId: string) => {
    try {
      const { error: err } = await supabase
        .from('shop_orders')
        .update({ status: 'fulfilled' })
        .eq('id', orderId);

      if (err) throw err;

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: 'fulfilled' } : order
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark order fulfilled');
      return false;
    }
  };

  const clearAllOrders = async () => {
    try {
      const { error: err } = await supabase
        .from('shop_orders')
        .delete()
        .eq('owner_id', ownerId);

      if (err) throw err;
      setOrders([]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear orders');
      return false;
    }
  };

  return { orders, loading, error, addOrder, markFulfilled, clearAllOrders };
}
