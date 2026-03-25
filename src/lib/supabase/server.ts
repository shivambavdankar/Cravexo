import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-side client using the service role key or anon key
// Used in API routes where we need direct DB access
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
