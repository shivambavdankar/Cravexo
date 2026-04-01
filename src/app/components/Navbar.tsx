'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAccount } from '../context/AccountContext';
import { createClient } from '@/lib/supabase/client';
import SignupModal from './SignupModal';
import SubscriptionModal from './SubscriptionModal';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Concept', href: '#concept' },
  { label: 'Mr. Fry', href: '#mrfry' },
  { label: 'Features', href: '#features' },
  { label: 'Vision', href: '#vision' },
];

export default function Navbar() {
  const { user, logout } = useAccount();
  const { cart, setIsOpen: setCartOpen } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Listen for signup open event
  useEffect(() => {
    const handler = () => setSignupOpen(true);
    window.addEventListener('cravexo:signup', handler);
    return () => window.removeEventListener('cravexo:signup', handler);
  }, []);

  // Listen for subscription open event (fired from Mr. Fry limit-reached panel)
  useEffect(() => {
    const handler = () => setSubscriptionOpen(true);
    window.addEventListener('cravexo:subscription', handler);
    return () => window.removeEventListener('cravexo:subscription', handler);
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() ?? '';

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const trueAuthId = data.session?.user?.id;

      await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, auth_id: trueAuthId || user?.auth_id }),
      });
    } catch { /* best-effort */ }
    // Sign out and reset all local state regardless of API result
    await logout();
    setDeleteConfirmOpen(false);
    setShowProfile(false);
    setDeleteLoading(false);
  };

  const menuItems = [
    { label: '👤 Account Info', action: () => { setShowProfile(true); setDropdownOpen(false); } },
    { label: '⭐ Subscription', action: () => { setSubscriptionOpen(true); setDropdownOpen(false); } },
  ];

  return (
    <>
      <nav
        id="navbar"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          padding: '0 24px', height: '72px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(4,5,10,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo */}
        <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Image src="/logo.jpg" alt="Cravexo" width={44} height={44} style={{ borderRadius: '10px', objectFit: 'cover' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>
            Crave<span style={{ color: '#FF6B00' }}>xo</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: '36px', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FF6B00')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            >
              {link.label}
            </a>
          ))}

          {/* Cart Icon Desktop */}
          {user && (
            <button
              onClick={() => setCartOpen(true)}
              style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🛒
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-10px', background: '#FF2020', color: '#fff', fontSize: '.7rem', fontWeight: 800, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: '0 2px 8px rgba(255,32,32,.5)' }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Talk to Mr. Fry */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('mrfry:open'))}
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.85rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
          >
            Talk to Mr. Fry
          </button>

          {/* Auth Area */}
          {!user ? (
            <button
              onClick={() => setSignupOpen(true)}
              style={{
                padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700,
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: '10px', color: '#fff', cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif', transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,0,.15)'; e.currentTarget.style.borderColor = '#FF6B00'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; }}
            >
              Sign Up
            </button>
          ) : (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              {/* Profile Circle */}
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B00, #FF2020)',
                  border: '2px solid rgba(255,107,0,.5)',
                  color: '#fff', fontWeight: 800, fontSize: '1rem',
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(255,107,0,.3)',
                  transition: 'transform .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title={user.name}
              >
                {initial}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '52px', right: 0,
                  background: 'rgba(10,12,24,.98)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,.1)', borderRadius: '16px',
                  minWidth: '200px', padding: '8px', boxShadow: '0 16px 48px rgba(0,0,0,.6)',
                  animation: 'slideUpFade .2s ease',
                }}>
                  {/* User info header */}
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,.06)', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 700, fontSize: '.9rem', color: '#fff', marginBottom: '2px' }}>{user.name}</p>
                    <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)' }}>{user.email}</p>
                  </div>

                  {menuItems.map(item => (
                    <button key={item.label} onClick={item.action}
                      style={{
                        width: '100%', padding: '11px 14px', background: 'transparent',
                        border: 'none', borderRadius: '10px', color: 'rgba(255,255,255,.75)',
                        textAlign: 'left', cursor: 'pointer', fontSize: '.88rem', fontWeight: 500,
                        fontFamily: 'Outfit, sans-serif', transition: 'all .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.75)'; }}
                    >
                      {item.label}
                    </button>
                  ))}

                  {/* Sign Out */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      style={{
                        width: '100%', padding: '11px 14px', background: 'transparent',
                        border: 'none', borderRadius: '10px', color: '#FF6B6B',
                        textAlign: 'left', cursor: 'pointer', fontSize: '.88rem', fontWeight: 600,
                        fontFamily: 'Outfit, sans-serif', transition: 'all .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,32,32,.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', flexDirection: 'column', gap: '5px', padding: '4px' }}
          aria-label="Toggle menu"
        >
          {[0,1,2].map((i) => (
            <span key={i} style={{ display: 'block', width: '24px', height: '2px', background: '#fff', borderRadius: '2px', transition: 'all 0.3s ease' }} />
          ))}
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            position: 'absolute', top: '72px', left: 0, right: 0,
            background: 'rgba(4,5,10,0.98)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 500 }}>
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('mrfry:open')); }}
              className="btn-primary"
              style={{ textAlign: 'center', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', width: '100%', padding: '14px' }}
            >
              Talk to Mr. Fry
            </button>

            {user && (
              <button
                onClick={() => { setMenuOpen(false); setCartOpen(true); }}
                style={{ textAlign: 'center', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', width: '100%', padding: '14px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                🛒 Open Cart {cartCount > 0 && <span style={{ background: '#FF2020', borderRadius: '50%', padding: '2px 8px', fontSize: '.8rem' }}>{cartCount}</span>}
              </button>
            )}

            {!user ? (
              <button onClick={() => { setMenuOpen(false); setSignupOpen(true); }}
                style={{ padding: '14px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                Sign Up
              </button>
            ) : (
              <>
                <div style={{ padding: '12px', background: 'rgba(255,107,0,.06)', border: '1px solid rgba(255,107,0,.15)', borderRadius: '12px' }}>
                  <p style={{ fontWeight: 700, color: '#fff' }}>{user.name}</p>
                  <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>{user.email}</p>
                </div>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ padding: '14px', background: 'rgba(255,32,32,.08)', border: '1px solid rgba(255,32,32,.2)', borderRadius: '10px', color: '#FF6B6B', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
          }
        `}</style>
      </nav>

      {/* Signup Modal */}
      <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Subscription Modal */}
      <SubscriptionModal isOpen={subscriptionOpen} onClose={() => setSubscriptionOpen(false)} />

      {/* Profile Panel */}
      {showProfile && user && (
        <>
          <div onClick={() => setShowProfile(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(5px)', animation: 'fadeIn .2s ease' }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 100vw)',
            zIndex: 2001, background: 'rgba(7,8,16,.99)',
            borderLeft: '1px solid rgba(255,107,0,.2)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight .3s cubic-bezier(.22,1,.36,1)',
          }}>
            <div style={{ padding: '28px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Account Info</h2>
              <button onClick={() => setShowProfile(false)}
                style={{ background: 'rgba(255,255,255,.05)', border: 'none', color: 'rgba(255,255,255,.5)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #FF2020)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, boxShadow: '0 8px 24px rgba(255,107,0,.3)' }}>
                  {initial}
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{user.name}</p>
                  <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.4)' }}>Cravexo Member</p>
                </div>
              </div>
              {/* Fields */}
              {[
                { label: 'Email', value: user.email },
                { label: 'Phone Number', value: user.phone_number || '—' },
                { label: 'Location', value: user.location || '—' },
              ].map(f => (
                <div key={f.label} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>{f.label}</p>
                  <p style={{ fontSize: '.95rem', color: f.value === '—' ? 'rgba(255,255,255,.3)' : '#fff', fontWeight: 500 }}>{f.value}</p>
                </div>
              ))}
              {/* Delete Account */}
              <div style={{ marginTop: '8px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,.6)', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', padding: 0, letterSpacing: '.01em' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#FF4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,80,80,.6)'}
                >
                  🗑 Delete Account
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Account Confirmation Overlay */}
      {deleteConfirmOpen && (
        <>
          <div onClick={() => setDeleteConfirmOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', animation: 'fadeIn .15s ease' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            zIndex: 2101, width: 'min(420px, 90vw)',
            background: 'rgba(10,10,20,.99)', border: '1px solid rgba(255,60,60,.3)',
            borderRadius: '20px', padding: '36px 32px',
            boxShadow: '0 24px 80px rgba(0,0,0,.8)',
            fontFamily: 'Outfit, sans-serif',
          }}>
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem', textAlign: 'center', marginBottom: '12px' }}>
              Delete your account?
            </h3>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', textAlign: 'center', lineHeight: 1.6, marginBottom: '28px' }}>
              This will permanently remove your Cravexo profile and all account data. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{ width: '100%', padding: '14px', background: deleteLoading ? 'rgba(200,40,40,.4)' : 'rgba(220,40,40,.9)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '.95rem', cursor: deleteLoading ? 'wait' : 'pointer', fontFamily: 'Outfit, sans-serif' }}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleteLoading}
                style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px', color: 'rgba(255,255,255,.7)', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
