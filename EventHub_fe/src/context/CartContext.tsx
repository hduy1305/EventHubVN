import React, { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  ticketTypeId: number;
  ticketTypeName: string;
  price: number;
  eventId: number;
  eventName: string;
  quantity: number;
  seatId?: number; // Optional for unassigned seats
  description?: string;
  quota?: number;
  purchaseLimit?: number;
  startSale?: string;
  endSale?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (ticketTypeId: number, seatId?: number) => void;
  updateQuantity: (ticketTypeId: number, quantity: number, seatId?: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.ticketTypeId === item.ticketTypeId && i.seatId === item.seatId
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [...prevItems, { ...item, quantity }];
      }
    });
  }, []);

  const removeFromCart = useCallback((ticketTypeId: number, seatId?: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.ticketTypeId === ticketTypeId && item.seatId === seatId))
    );
  }, []);

  const updateQuantity = useCallback((ticketTypeId: number, quantity: number, seatId?: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.ticketTypeId === ticketTypeId && item.seatId === seatId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      ).filter(item => item.quantity > 0) // Remove if quantity drops to 0
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
