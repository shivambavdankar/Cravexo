'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAccount } from '@/app/context/AccountContext';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'main' | 'signup' | 'login' | 'forgot' | 'check-email' | 'check-reset';

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px',
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
  borderRadius: '12px', color: '#fff', fontSize: '.95rem',
  fontFamily: 'Outfit, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
};
const labelStyle: React.CSSProperties = {
  fontSize: '.78rem', fontWeight: 700, color: 'rgba(255,255,255,.45)',
  textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px', display: 'block',
};
const errStyle: React.CSSProperties = {
  background: 'rgba(255,32,32,.08)', border: '1px solid rgba(255,32,32,.28)',
  borderRadius: '10px', padding: '10px 14px', color: '#FF7070', fontSize: '.84rem',
};
const primaryBtnStyle: React.CSSProperties = {
  width: '100%', padding: '15px', background: 'linear-gradient(135deg, #FF6B00, #FF2020)',
  border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '1rem',
  cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 30px rgba(255,107,0,.3)',
};

// ─── Sub-components defined OUTSIDE to prevent remounting on re-render ────────
function ModalPanel({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.82)', backdropFilter: 'blur(6px)', animation: 'fadeIn .2s ease' }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(480px, 100vw)',
        zIndex: 2001, background: 'rgba(7,8,16,.99)',
        borderLeft: '1px solid rgba(255,107,0,.22)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight .35s cubic-bezier(.22,1,.36,1)',
        boxShadow: '-20px 0 80px rgba(0,0,0,.7)', overflowY: 'auto',
      }}>
        {children}
      </div>
    </>
  );
}

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid rgba(255,107,0,.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Image src="/logo.jpg" alt="Cravexo" width={36} height={36} style={{ borderRadius: '8px', objectFit: 'cover' }} />
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>Crave<span style={{ color: '#FF6B00' }}>xo</span></span>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: 'none', color: 'rgba(255,255,255,.4)', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
      </div>
      <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#fff', marginBottom: '6px', lineHeight: 1.1 }}>{title}</h2>
      <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem', lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
      background: '#fff', border: 'none', borderRadius: '12px', color: '#111', fontWeight: 700, fontSize: '.96rem',
      cursor: loading ? 'wait' : 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 20px rgba(0,0,0,.4)',
    }}>
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.8 0 7 5.4 3.2 13.3l7.8 6C12.9 13.3 18 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.6 37.5 46.5 31.4 46.5 24.5z"/>
        <path fill="#FBBC05" d="M11 28.3c-.5-1.4-.8-3-.8-4.8s.3-3.4.8-4.8l-7.8-6C1.2 16 0 19.9 0 24s1.2 8 3.2 11.3l7.8-7z"/>
        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.3-7.7 2.3-6 0-11.1-3.9-12.9-9.3l-7.8 7C7 42.6 14.8 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
  );
}

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,.08)' }} />
      <span style={{ color: 'rgba(255,255,255,.3)', fontSize: '.78rem' }}>or</span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,.08)' }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const { login } = useAccount();
  const [view, setView] = useState<View>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      setView('main');
      setError('');
      setLoading(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setLocation('');
      setForgotEmail('');
      setShowPw(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const supabase = createClient();

  const reset = () => {
    setError(''); setLoading(false);
    setName(''); setEmail(''); setPassword('');
    setPhone(''); setLocation(''); setForgotEmail('');
    setShowPw(false);
  };

  const go = (v: View) => {
    if (v === 'check-email') {
      setError(''); setLoading(false); setPassword(''); setShowPw(false);
    } else if (v === 'check-reset') {
      setError(''); setLoading(false);
    } else {
      reset();
    }
    setView(v);
  };

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    try {
      setLoading(true); setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) { setError(error.message); setLoading(false); }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
      setLoading(false);
    }
  };

  // ─── Manual Signup ─────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password || password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    try {
      setLoading(true); setError('');
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { name: name.trim(), phone_number: phone.trim() || null, location: location.trim() || null },
        },
      });
      setLoading(false);
      if (error) { setError(error.message); return; }
      go('check-email');
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
      setLoading(false);
    }
  };

  // ─── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    try {
      setLoading(true); setError('');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      setLoading(false);
      if (error) { setError(error.message); return; }

      if (data.session) {
        const emailLookup = data.session.user.email?.toLowerCase() ?? '';
        let profile = null;
        if (emailLookup) {
          const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailLookup }),
          });
          if (res.ok) profile = (await res.json()).profile;
        }
        login(profile ?? {
          name: data.session.user.user_metadata?.name ?? data.session.user.email?.split('@')[0] ?? '',
          email: data.session.user.email ?? '',
          subscription_plan: 'lite',
          interactions_this_month: 0,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
      setLoading(false);
    }
  };

  // ─── Forgot Password ───────────────────────────────────────────────────────
  const handleForgot = async () => {
    if (!forgotEmail.trim()) { setError('Please enter your email.'); return; }
    try {
      setLoading(true); setError('');
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      setLoading(false);
      if (error) { 
        // Handle Supabase strict rate limits gracefully (e.g. 3 per hour)
        if (error.message.toLowerCase().includes('rate limit') || error.status === 429) {
          go('check-reset');
          return;
        }
        setError(error.message); 
        return; 
      }
      go('check-reset');
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
      setLoading(false);
    }
  };

  // ─── Views ─────────────────────────────────────────────────────────────────

  if (view === 'main') return (
    <ModalPanel onClose={onClose}>
      <ModalHeader title="Join Cravexo" subtitle="Sign up to unlock Mr. Fry and start discovering food your way." onClose={onClose} />
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <GoogleButton onClick={handleGoogle} loading={loading} />
        <OrDivider />
        <button onClick={() => go('signup')} style={{ width: '100%', padding: '14px', background: 'rgba(255,107,0,.1)', border: '1px solid rgba(255,107,0,.3)', borderRadius: '12px', color: '#FF6B00', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
          Sign up with Email
        </button>
        <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'rgba(255,255,255,.35)' }}>
          Already have an account?{' '}
          <button onClick={() => go('login')} style={{ background: 'none', border: 'none', color: '#FF6B00', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '.84rem' }}>Sign In</button>
        </p>
      </div>
    </ModalPanel>
  );

  if (view === 'check-email') return (
    <ModalPanel onClose={onClose}>
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '16px' }}>
        <div style={{ fontSize: '3.5rem' }}>📬</div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem' }}>Check your inbox</h2>
        <p style={{ color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: '320px' }}>
          We sent a verification link to <strong style={{ color: '#fff' }}>{email}</strong>. Click the link to activate your account.
        </p>
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.82rem' }}>Didn&apos;t get it? Check your spam folder.</p>
        <button onClick={() => { reset(); setView('main'); onClose(); }} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#FF6B00', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Got it ✓</button>
      </div>
    </ModalPanel>
  );

  if (view === 'check-reset') return (
    <ModalPanel onClose={onClose}>
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '16px' }}>
        <div style={{ fontSize: '3.5rem' }}>🔑</div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem' }}>Reset link sent</h2>
        <p style={{ color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: '320px' }}>
          We emailed a password reset link to <strong style={{ color: '#fff' }}>{forgotEmail}</strong>. Click it to set a new password.
        </p>
        <button onClick={() => go('login')} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#FF6B00', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Back to Sign In</button>
      </div>
    </ModalPanel>
  );

  if (view === 'signup') return (
    <ModalPanel onClose={onClose}>
      <ModalHeader title="Create account" subtitle="Name, email and password required — the rest is optional." onClose={onClose} />
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <GoogleButton onClick={handleGoogle} loading={loading} />
        <OrDivider />

        <div>
          <label style={labelStyle}>Name <span style={{ color: '#FF6B00' }}>*</span></label>
          <input type="text" placeholder="Your full name" value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#FF6B00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
        </div>

        <div>
          <label style={labelStyle}>Email <span style={{ color: '#FF6B00' }}>*</span></label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#FF6B00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
        </div>

        <div>
          <label style={labelStyle}>Password <span style={{ color: '#FF6B00' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#FF6B00'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
            <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '.82rem', fontFamily: 'Outfit, sans-serif' }}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          {password.length > 0 && password.length < 8 && (
            <p style={{ color: '#FF9060', fontSize: '.78rem', marginTop: '5px' }}>⚠ At least 8 characters needed</p>
          )}
        </div>

        <div>
          <label style={labelStyle}>Phone <span style={{ color: 'rgba(255,255,255,.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#00D4FF'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
        </div>

        <div>
          <label style={labelStyle}>Where are you from? <span style={{ color: 'rgba(255,255,255,.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input type="text" placeholder="e.g. Bandra, Mumbai" value={location}
            onChange={e => setLocation(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#00D4FF'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
        </div>

        {error && <div style={errStyle}>⚠️ {error}</div>}

        <button onClick={handleSignup} disabled={loading} style={{ ...primaryBtnStyle, cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Creating Account...' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'rgba(255,255,255,.35)' }}>
          Already have an account?{' '}
          <button onClick={() => go('login')} style={{ background: 'none', border: 'none', color: '#FF6B00', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '.82rem' }}>Sign In</button>
        </p>
        <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'rgba(255,255,255,.2)', lineHeight: 1.5 }}>
          By signing up you agree to Cravexo&apos;s terms.
        </p>
      </div>
    </ModalPanel>
  );

  if (view === 'login') return (
    <ModalPanel onClose={onClose}>
      <ModalHeader title="Welcome back" subtitle="Sign in to continue your food discovery." onClose={onClose} />
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <GoogleButton onClick={handleGoogle} loading={loading} />
        <OrDivider />

        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#FF6B00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} placeholder="Your password" value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#FF6B00'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
            <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '.82rem', fontFamily: 'Outfit, sans-serif' }}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button onClick={() => go('forgot')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '.82rem', textAlign: 'right', padding: 0, fontFamily: 'Outfit, sans-serif' }}>
          Forgot password?
        </button>

        {error && <div style={errStyle}>⚠️ {error}</div>}

        <button onClick={handleLogin} disabled={loading} style={{ ...primaryBtnStyle, cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Signing In...' : 'Sign In →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'rgba(255,255,255,.35)' }}>
          Don&apos;t have an account?{' '}
          <button onClick={() => go('signup')} style={{ background: 'none', border: 'none', color: '#FF6B00', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '.82rem' }}>Sign Up</button>
        </p>
      </div>
    </ModalPanel>
  );

  if (view === 'forgot') return (
    <ModalPanel onClose={onClose}>
      <ModalHeader title="Reset password" subtitle="Enter your email and we'll send you a reset link." onClose={onClose} />
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" placeholder="you@example.com" value={forgotEmail}
            onChange={e => { setForgotEmail(e.target.value); setError(''); }}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#FF6B00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
        </div>

        {error && <div style={errStyle}>⚠️ {error}</div>}

        <button onClick={handleForgot} disabled={loading} style={{ ...primaryBtnStyle, cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Sending...' : 'Send Reset Link →'}
        </button>

        <button onClick={() => go('login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', cursor: 'pointer', fontSize: '.84rem', fontFamily: 'Outfit, sans-serif' }}>
          ← Back to Sign In
        </button>
      </div>
    </ModalPanel>
  );

  return null;
}
