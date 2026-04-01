'use client';
import { useCart } from '../context/CartContext';
import Image from 'next/image';

const PLATFORMS = [
  { key: 'zomato_url', label: 'Zomato', color: '#E23744', icon: '🛵' },
  { key: 'swiggy_url', label: 'Swiggy', color: '#FC8019', icon: '🚴' },
  { key: 'ubereats_url', label: 'UberEats', color: '#06C167', icon: '🚗' },
];

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateQuantity, isLoading } = useCart();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsOpen(false);
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          width: 'min(420px, 100vw)',
          height: '100%',
          background: 'rgba(10,12,24,.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,107,0,.2)',
          boxShadow: '-10px 0 40px rgba(0,0,0,.5)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Saved Intent 🛒</h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'rgba(255,255,255,.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLoading && cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,.4)' }}>Loading...</div>
          ) : cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '3rem' }}>📭</span>
              <p>Your cart is empty.</p>
              <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.3)' }}>Save a recommendation to prep your order.</span>
            </div>
          ) : (
            cart.map((item) => {
              const activeLinks = PLATFORMS.filter(p => item.metadata?.[p.key]);
              
              return (
                <div key={item.id} style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Item Image & Details */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {/* Tiny Skeleton or Image */}
                    <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: 'rgba(255,255,255,.04)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                      {item.image_url && item.image_url !== 'error' ? (
                        <img src={item.image_url} alt={item.food_item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🥘</div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>{item.food_item_name}</h4>
                      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.8rem', marginBottom: '2px' }}>at {item.restaurant_name}</p>
                      {item.restaurant_location && <p style={{ color: '#FF6B00', fontSize: '.75rem', fontWeight: 600, marginBottom: '6px' }}>📍 {item.restaurant_location}</p>}
                      {item.price && <p style={{ color: '#00D4FF', fontSize: '.85rem', fontWeight: 600 }}>{item.price}</p>}
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,.05)' }} />

                  {/* Quantity & Actions Combo Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', overflow: 'hidden' }}>
                      <button onClick={() => updateQuantity(item.id!, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.7 }}>
                        {item.quantity === 1 ? '🗑️' : '−'}
                      </button>
                      <span style={{ color: '#fff', fontSize: '.9rem', fontWeight: 700, width: '24px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id!, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.7 }}>
                        +
                      </button>
                    </div>

                    {/* Delivery Links inline (or wrapped underneath) */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {activeLinks.map(p => (
                        <a 
                          key={p.key} 
                          href={item.metadata?.[p.key]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title={`Order on ${p.label}`}
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            background: p.color, 
                            borderRadius: '8px', 
                            color: '#fff', 
                            fontSize: '1rem', 
                            textDecoration: 'none',
                            boxShadow: `0 4px 8px ${p.color}44`,
                            transition: 'transform 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {p.icon}
                        </a>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
