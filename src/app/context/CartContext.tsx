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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
      // Enforce max 10 distinct items
      if (cart.length >= 10) {
        showToast("Your cart is full. Remove an item to add a new one.");
        return;
      }
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
      
      {/* Global Cart Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: 'linear-gradient(135deg, rgba(30,15,5,0.98), rgba(12,14,26,0.98))', border: '1px solid rgba(255,107,0,0.4)', borderRadius: '16px', padding: '14px 24px', boxShadow: '0 10px 40px rgba(255,107,0,0.25)', display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.3s ease', backdropFilter: 'blur(10px)', color: '#fff', width: 'max-content', maxWidth: '90vw' }}>
          <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 8px rgba(255,107,0,0.8))' }}>⚠️</span>
          <p style={{ margin: 0, fontSize: '.95rem', fontWeight: 600, letterSpacing: '.02em' }}>{toastMessage}</p>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
