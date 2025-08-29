import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActivityWithDetails, ActivityScheduleInstance } from '@/types/activity';

export interface CartItem {
  id: string;
  activity: ActivityWithDetails;
  schedule: ActivityScheduleInstance;
  quantity: number;
  addedAt: Date;
  providerId: string | number;
  title: string;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (activity: ActivityWithDetails, schedule: ActivityScheduleInstance, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (activityId: number, scheduleId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (activity: ActivityWithDetails, schedule: ActivityScheduleInstance, quantity: number) => {
    const itemId = `${activity.id}-${schedule.id}`;
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item with extra fields
        const newItem: CartItem = {
          id: itemId,
          activity,
          schedule,
          quantity,
          addedAt: new Date(),
          providerId: activity.provider_id,
          title: activity.title,
          price: schedule.price_override || activity.final_price || activity.b_price || 0
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.schedule.price_override || item.activity.final_price || item.activity.b_price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const isInCart = (activityId: number, scheduleId: number) => {
    return items.some(item => 
      item.activity.id === activityId && item.schedule.id === scheduleId
    );
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
