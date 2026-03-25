'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    const supabase = createClient();

    const handleCallback = async () => {
      try {
        // Exchange the code in the URL for a session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session?.user) {
          // Try exchanging code from URL (for OAuth and email verification)
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');

          if (code) {
            const { data: exchanged, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              // @supabase/ssr might have already exchanged the code automatically. Check session again.
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession?.user) {
                await finishOnboarding(supabase, retrySession.user);
                return;
              }
              throw exchangeError;
            }
            if (!exchanged.session) throw new Error('No session after exchange');

            await finishOnboarding(supabase, exchanged.session.user);
          } else {
            setStatus('error');
            setMessage('Verification link is invalid or has expired. Please try again.');
            return;
          }
        } else {
          await finishOnboarding(supabase, session.user);
        }
      } catch (err) {
        console.error('[Callback] Error:', err);
        setStatus('error');
        setMessage('Something went wrong. Please try signing in again.');
      }
    };

    const finishOnboarding = async (supabase: ReturnType<typeof createClient>, authUser: NonNullable<Awaited<ReturnType<ReturnType<typeof createClient>['auth']['getUser']>>['data']['user']>) => {
      const email = authUser.email ?? '';
      const meta = authUser.user_metadata ?? {};
      const name = (meta.name as string) || (meta.full_name as string) || email.split('@')[0];
      const provider = (authUser as { app_metadata?: { provider?: string } }).app_metadata?.provider ?? 'email';

      // Send welcome email (fire and forget)
      fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      }).catch(() => {});

      console.log(`[Callback] ✅ Auth complete for ${email} via ${provider}`);
      setStatus('success');
      setMessage(`Welcome${name ? `, ${name.split(' ')[0]}` : ''}! Redirecting...`);

      setTimeout(() => router.push('/'), 1500);
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh', background: '#07080F', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '24px', fontFamily: 'Outfit, sans-serif',
    }}>
      <div style={{ fontSize: '3rem' }}>
        {status === 'loading' ? '⏳' : status === 'success' ? '✅' : '❌'}
      </div>
      <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', margin: 0 }}>
        {message}
      </h1>
      {status === 'error' && (
        <a href="/" style={{ color: '#FF6B00', textDecoration: 'none', fontWeight: 700 }}>← Back to Cravexo</a>
      )}
      {status === 'loading' && (
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,107,0,.2)', borderTop: '3px solid #FF6B00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
