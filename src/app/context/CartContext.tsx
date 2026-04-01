'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from './AccountContext';

export interface CartItem {
  id?: string;
  food_item_name: string;
  restaurant_name?: string;
  price?: string;
  image_url?: string;
  cuisine?: string;
  metadata?: any;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addToCart: (item: CartItem) => Promise<void>;
  updateQuantity: (id: string, newQuantity: number) => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  isOpen: false,
  setIsOpen: () => {},
  addToCart: async () => {},
  updateQuantity: async () => {},
  isLoading: false,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAccount();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user?.email) {
      setIsLoading(true);
      fetch(`/api/cart?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.cart) setCart(data.cart);
        })
        .finally(() => setIsLoading(false));
    } else {
      setCart([]);
    }
  }, [user?.email]);

  const addToCart = async (item: CartItem) => {
    if (!user?.email) return;
    
    // Optimistic UI Update (if it already exists, increment qty, otherwise push)
    const existingIndex = cart.findIndex(c => c.food_item_name === item.food_item_name && c.restaurant_name === item.restaurant_name);
    let newCart = [...cart];
    
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({ ...item, quantity: 1, id: 'temp-' + Date.now() });
    }
    setCart(newCart);
    setIsOpen(true); // Pop open the cart drawer

    // Background sync to db
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, item }),
      });
      const data = await res.json();
      if (data.cart) {
        // Sync with actual DB IDs
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (!user?.email || id.startsWith('temp-')) return;

    // Optimistic UI Update
    setCart(prev => 
      newQuantity <= 0 
        ? prev.filter(c => c.id !== id) 
        : prev.map(c => c.id === id ? { ...c, quantity: newQuantity } : c)
    );

    // Background sync to DB
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, item_id: id, quantity: newQuantity }),
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, isOpen, setIsOpen, addToCart, updateQuantity, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
