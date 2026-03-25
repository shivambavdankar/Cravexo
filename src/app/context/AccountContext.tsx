'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

import { PlanId, PLANS } from '@/lib/billing/billing.config';
export type { PlanId };
export { PLANS };

export interface UserProfile {
  id?: string;
  auth_id?: string;
  name: string;
  email: string;
  phone_number?: string | null;
  location?: string | null;
  subscription_plan?: PlanId;
  interactions_this_month?: number;
  interactions_reset_month?: string;
}

interface AccountContextType {
  user: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateUsage: (used: number) => void;
}

const AccountContext = createContext<AccountContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUsage: () => {},
});

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Rehydrate from localStorage first (fast, no flicker)
    try {
      const stored = localStorage.getItem('cravexo_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}

    // Then listen to real Supabase auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('cravexo_user');
        return;
      }

      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session) {
        // Defer fetch to prevent Supabase internal auth lock deadlock during session initialization
        setTimeout(async () => {
          try {
            const emailLookup = session.user.email?.toLowerCase() ?? '';
            const nameLookup = session.user.user_metadata?.name ?? session.user.user_metadata?.full_name ?? emailLookup.split('@')[0] ?? '';
            let profile = null;

            if (emailLookup) {
              const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: emailLookup,
                  name: nameLookup,
                  auth_id: session.user.id
                }),
              });
              if (res.ok) {
                const data = await res.json();
                profile = data.profile;
              }
            }

            const userObj: UserProfile = profile ?? {
              auth_id: session.user.id,
              name: session.user.user_metadata?.name ?? session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? '',
              email: session.user.email ?? '',
              subscription_plan: 'lite',
              interactions_this_month: 0,
            };

            setUser(userObj);
            localStorage.setItem('cravexo_user', JSON.stringify(userObj));
          } catch (err) {
            console.error('[AccountContext] Failed to fetch profile:', err);
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (u: UserProfile) => {
    const withDefaults: UserProfile = { subscription_plan: 'lite', interactions_this_month: 0, ...u };
    setUser(withDefaults);
    localStorage.setItem('cravexo_user', JSON.stringify(withDefaults));
  };

  const logout = async () => {
    // Clear state immediately so UI responds right away
    setUser(null);
    localStorage.removeItem('cravexo_user');
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors — local state is already cleared
    }
  };

  const updateUsage = (used: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, interactions_this_month: used };
      localStorage.setItem('cravexo_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AccountContext.Provider value={{ user, login, logout, updateUsage }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
