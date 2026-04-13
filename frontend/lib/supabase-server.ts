// ============================================
// 📁 LOKASI: frontend/lib/supabase-server.ts
// ✅ NEW FILE — consolidated Supabase server client helper
// Import ini di semua server components/pages buat replace boilerplate
// ============================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — setAll bisa throw, ini expected
          }
        },
      },
    }
  );
}