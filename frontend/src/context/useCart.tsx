'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, MenuItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: MenuItem, restaurantId: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const addItem = (menuItem: MenuItem, rid: string) => {
    if (restaurantId && restaurantId !== rid) {
      // Clear cart if switching restaurants
      setItems([{ menuItem, quantity: 1 }]);
      setRestaurantId(rid);
      return;
    }
    setRestaurantId(rid);
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.menuItem.id !== menuItemId);
      if (next.length === 0) setRestaurantId(null);
      return next;
    });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity } : i,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const total = items.reduce(
    (sum, i) => sum + Number(i.menuItem.price) * i.quantity,
    0,
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}