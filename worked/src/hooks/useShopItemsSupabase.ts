import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShopItem } from '../types';

export function useShopItemsSupabase(ownerId: string) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();

    // Real-time subscription
    const subscription = supabase
      .channel(`shop_items:${ownerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_items', filter: `owner_id=eq.${ownerId}` }, () => {
        loadItems();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [ownerId]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('shop_items')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setItems(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (name: string, price: number, stock: number) => {
    try {
      const { data, error: err } = await supabase
        .from('shop_items')
        .insert([{ owner_id: ownerId, name, price, stock, reserved_stock: 0 }])
        .select();

      if (err) throw err;
      if (data) setItems([...items, ...data]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      return false;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error: err } = await supabase.from('shop_items').delete().eq('id', itemId);

      if (err) throw err;
      setItems(items.filter((i) => i.id !== itemId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      return false;
    }
  };

  const updateItem = async (itemId: string, field: keyof ShopItem, value: any) => {
    try {
      const updates: Record<string, any> = {};

      if (field === 'price') {
        updates.price = parseFloat(value);
      } else if (field === 'stock') {
        updates.stock = parseInt(value, 10);
      } else if (field === 'name') {
        updates.name = String(value).trim();
      }

      const { error: err } = await supabase.from('shop_items').update(updates).eq('id', itemId);

      if (err) throw err;

      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      return false;
    }
  };

  return { items, loading, error, addItem, removeItem, updateItem };
}
