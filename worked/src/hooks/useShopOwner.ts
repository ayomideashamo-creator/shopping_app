import { useEffect, useState } from 'react';
import { loadStored, saveStored } from '../storage';
import { ShopOwner } from '../types';

export function useShopOwner() {
  const [owner, setOwner] = useState<ShopOwner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadStored('shop-owner', null);
    if (stored) {
      setOwner(stored);
    }
    setLoading(false);
  }, []);

  const setCurrentOwner = (newOwner: ShopOwner) => {
    saveStored('shop-owner', newOwner);
    setOwner(newOwner);
  };

  const getOwnerId = (): string => {
    return owner?.id || 'default';
  };

  return { owner, loading, setCurrentOwner, getOwnerId };
}
