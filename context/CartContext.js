'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('bags_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart items from localStorage', e);
      }
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('bags_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  const addToCart = (product, quantity = 1, size = 'Medium') => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        // Item with same ID and size exists, update its quantity (max 10)
        const updatedItems = [...prevItems];
        const newQty = Math.min(10, updatedItems[existingItemIndex].quantity + quantity);
        updatedItems[existingItemIndex].quantity = newQty;
        return updatedItems;
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
            category: product.category,
            quantity: Math.min(10, Math.max(1, quantity)),
            size: size,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        if (size !== undefined && size !== null) {
          return !(item.id === productId && item.size === size);
        }
        return item.id !== productId;
      })
    );
  };

  const updateQuantity = (productId, size, quantity) => {
    let actualSize = size;
    let actualQty = quantity;
    // Support two argument call: updateQuantity(productId, newQty)
    if (typeof size === 'number' && quantity === undefined) {
      actualQty = size;
      actualSize = null;
    }
    if (actualQty < 1 || actualQty > 10) return;
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const matches = actualSize !== null && actualSize !== undefined
          ? (item.id === productId && item.size === actualSize)
          : (item.id === productId);
        return matches ? { ...item, quantity: Number(actualQty) } : item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Helper values
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartTax = cartSubtotal * 0.05; // 5% tax
  const cartTotal = cartSubtotal + cartTax;

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    mounted,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
