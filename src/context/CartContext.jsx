import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("menu_cart")) || [];
  });

  const [tableNumber, setTableNumberState] = useState(() => {
    // Attempt to load from URL first
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get("table");
    if (tableParam) {
      localStorage.setItem("table_number", tableParam);
      return tableParam;
    }
    return localStorage.getItem("table_number") || "";
  });

  // Sync table from URL if changed
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get("table");
      if (tableParam) {
        setTableNumberState(tableParam);
        localStorage.setItem("table_number", tableParam);
      }
    };
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("menu_cart", JSON.stringify(cart));
  }, [cart]);

  const setTableNumber = (num) => {
    setTableNumberState(num);
    localStorage.setItem("table_number", num);
  };

  const addToCart = (dish, quantity = 1, customizations = { spice: "medium", notes: "", extraCheese: false }) => {
    setCart((prevCart) => {
      // Create a unique key for items based on customizations
      const cartItemId = `${dish.id}-${customizations.spice}-${customizations.extraCheese ? "cheese" : "none"}-${customizations.notes.trim()}`;
      
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === cartItemId);
      
      if (existingIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { 
          cartItemId, 
          dish, 
          quantity, 
          customizations,
          customPrice: dish.price + (customizations.extraCheese ? 2.00 : 0)
        }];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.customPrice * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        tableNumber,
        setTableNumber,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
