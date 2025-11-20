"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi, CartItem as ApiCartItem } from '@/services/api';

// Define types for our cart items
export interface CartItem {
  id: number;
  name: string;
  seller?: string;
  price: number;
  quantity: number;
  image: string;
  personalizable?: boolean;
  personalization?: string;
  options?: Record<string, string>;
}

type CartContextType = {
  cartItems: ApiCartItem[];
  addToCart: (item: { 
    product_id: number;
    quantity: number;
    personalization?: string;
    selected_options?: Record<string, string>;
  }) => Promise<void>;
  updateQuantity: (id: number, newQuantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  saveForLater: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<ApiCartItem[]>([]);

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await cartApi.getItems();
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  const addToCart = async (item: { 
    product_id: number;
    quantity: number;
    personalization?: string;
    selected_options?: Record<string, string>;
  }) => {
    try {
      await cartApi.addItem(item);
      const updatedCart = await cartApi.getItems();
      setCartItems(updatedCart.data);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await cartApi.updateItem(id, { quantity: newQuantity });
      const updatedCart = await cartApi.getItems();
      setCartItems(updatedCart.data);
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };
  
  const removeItem = async (id: number) => {
    try {
      await cartApi.removeItem(id);
      const updatedCart = await cartApi.getItems();
      setCartItems(updatedCart.data);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };
  
  const saveForLater = async (id: number) => {
    // For now just remove the item, but you could implement a "saved for later" feature
    await removeItem(id);
    alert('Item saved for later!');
  };

  const clearCart = async () => {
    try {
      await cartApi.clear();
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        updateQuantity, 
        removeItem, 
        saveForLater,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};