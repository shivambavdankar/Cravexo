'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    const initSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errParam = params.get('error_description') || params.get('error');

      if (errParam) {
        setError(errParam.replace(/\+/g, ' '));
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          // @supabase/ssr auto-exchange race condition check
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            setSessionReady(true);
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
          setError('This reset link has expired or is invalid. Please request a new one.');
        } else {
          setSessionReady(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionReady(true);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) setSessionReady(true);
      if (event === 'SIGNED_OUT') setSessionReady(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
    borderRadius: '12px', color: '#fff', fontSize: '.95rem',
    fontFamily: 'Outfit, sans-serif', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07080F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,107,0,.2)', borderRadius: '24px', padding: '40px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <Image src="/logo.jpg" alt="Cravexo" width={36} height={36} style={{ borderRadius: '8px', objectFit: 'cover' }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>Crave<span style={{ color: '#FF6B00' }}>xo</span></span>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#fff', fontWeight: 800 }}>Password updated!</h2>
            <p style={{ color: 'rgba(255,255,255,.5)' }}>Redirecting you back...</p>
          </div>
        ) : (
          <>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>Set new password</h2>
            <p style={{ color: 'rgba(255,255,255,.45)', marginBottom: '28px', fontSize: '.9rem' }}>Choose a strong password for your Cravexo account.</p>

            {!sessionReady && (
              <div style={{ background: 'rgba(255,200,0,.08)', border: '1px solid rgba(255,200,0,.25)', borderRadius: '10px', padding: '12px', color: '#FFD700', fontSize: '.85rem', marginBottom: '20px' }}>
                ⏳ Waiting for secure session... (open this link directly from your reset email)
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} placeholder="New password" value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={inputStyle} />
                <button onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '.85rem' }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <input type={showPw ? 'text' : 'password'} placeholder="Confirm password" value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                style={inputStyle} />

              {error && <div style={{ color: '#FF6B6B', fontSize: '.85rem', background: 'rgba(255,32,32,.08)', border: '1px solid rgba(255,32,32,.25)', borderRadius: '10px', padding: '10px 14px' }}>⚠️ {error}</div>}

              <button onClick={handleReset} disabled={loading || !sessionReady}
                style={{ padding: '15px', background: 'linear-gradient(135deg, #FF6B00, #FF2020)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'wait' : 'pointer', fontFamily: 'Outfit, sans-serif', opacity: !sessionReady ? 0.5 : 1 }}>
                {loading ? 'Updating...' : 'Update Password →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
