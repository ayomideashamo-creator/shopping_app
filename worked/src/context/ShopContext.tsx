import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ShopOwner } from '../types';
import { loadStored, saveStored } from '../storage';

interface ShopContextType {
  currentOwner: ShopOwner | null;
  setCurrentOwner: (owner: ShopOwner) => void;
  getOwnerId: () => string;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [currentOwner, setCurrentOwnerState] = useState<ShopOwner | null>(() => {
    return loadStored('shop-owner', null);
  });

  const setCurrentOwner = useCallback((owner: ShopOwner) => {
    saveStored('shop-owner', owner);
    setCurrentOwnerState(owner);
  }, []);

  const getOwnerId = useCallback(() => {
    return currentOwner?.id || 'default';
  }, [currentOwner]);

  return (
    <ShopContext.Provider value={{ currentOwner, setCurrentOwner, getOwnerId }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return context;
}
