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
  showtimeCode?: string; // Showtime code for this ticket
  showtimeName?: string; // Showtime display name
  description?: string;
  quota?: number;
  purchaseLimit?: number;
  startSale?: string;
  endSale?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (ticketTypeId: number, seatId?: number, showtimeCode?: string) => void;
  updateQuantity: (ticketTypeId: number, quantity: number, seatId?: number, showtimeCode?: string) => { success: boolean; message?: string };
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getTotalQuantityForTicketType: (ticketTypeId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number) => {
    // Pre-validate by checking current state
    const existingItem = cartItems.find(
      (i) => i.ticketTypeId === item.ticketTypeId && 
             i.seatId === item.seatId &&
             i.showtimeCode === item.showtimeCode
    );
    
    const currentQty = existingItem?.quantity || 0;
    const newTotalQty = currentQty + quantity;
    const purchaseLimit = item.purchaseLimit;
    const quota = item.quota;

    console.log('addToCart validation:', {
      ticketTypeId: item.ticketTypeId,
      showtimeCode: item.showtimeCode,
      currentQty,
      quantity,
      newTotalQty,
      purchaseLimit,
      quota
    });

    // Validate against purchase limit
    if (purchaseLimit && newTotalQty > purchaseLimit) {
      return {
        success: false,
        message: `Cannot add: Total would be ${newTotalQty} but purchase limit is ${purchaseLimit}`
      };
    }

    // Validate against available quota
    if (quota && newTotalQty > quota) {
      return {
        success: false,
        message: `Cannot add: Total would be ${newTotalQty} but only ${quota} available`
      };
    }

    // Validation passed, update state
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.ticketTypeId === item.ticketTypeId && 
               i.seatId === item.seatId &&
               i.showtimeCode === item.showtimeCode
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity = newTotalQty;
        return updatedItems;
      } else {
        return [...prevItems, { ...item, quantity }];
      }
    });

    return { success: true, message: '' };
  }, [cartItems]);

  const removeFromCart = useCallback((ticketTypeId: number, seatId?: number, showtimeCode?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(
        item.ticketTypeId === ticketTypeId && 
        item.seatId === seatId &&
        item.showtimeCode === showtimeCode
      ))
    );
  }, []);

  const updateQuantity = useCallback((ticketTypeId: number, quantity: number, seatId?: number, showtimeCode?: string) => {
    let resultMessage = '';
    
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex(
        (item) => item.ticketTypeId === ticketTypeId && 
                  item.seatId === seatId &&
                  item.showtimeCode === showtimeCode
      );

      if (itemIndex === -1) {
        resultMessage = 'Item not found in cart';
        return prevItems;
      }

      const item = prevItems[itemIndex];
      const newQty = Math.max(1, quantity);
      const purchaseLimit = item.purchaseLimit;
      const quota = item.quota;

      // Validate against purchase limit
      if (purchaseLimit && newQty > purchaseLimit) {
        resultMessage = `Cannot update: Purchase limit is ${purchaseLimit}`;
        return prevItems;
      }

      // Validate against available quota
      if (quota && newQty > quota) {
        resultMessage = `Cannot update: Only ${quota} available`;
        return prevItems;
      }

      return prevItems
        .map((itm) =>
          itm.ticketTypeId === ticketTypeId && itm.seatId === seatId
            ? { ...itm, quantity: newQty }
            : itm
        )
        .filter(itm => itm.quantity > 0); // Remove if quantity drops to 0
    });

    return {
      success: resultMessage === '',
      message: resultMessage
    };
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

  const getTotalQuantityForTicketType = useCallback((ticketTypeId: number) => {
    return cartItems
      .filter(item => item.ticketTypeId === ticketTypeId)
      .reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getTotalQuantityForTicketType,
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
