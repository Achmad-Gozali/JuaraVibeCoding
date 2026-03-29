// ============================================
// 📁 LOKASI: app/auth/callback/route.ts
// ============================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kawaltransaksi-kf68.vercel.app';

  if (error) {
    console.error('OAuth error from provider:', error);
    return NextResponse.redirect(`${siteUrl}/login?error=oauth_failed`);
  }

  // ✅ PKCE flow: ada code di query param
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch { /* ignore */ }
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
    console.error('Code exchange failed:', exchangeError.message);
  }

  // ✅ Implicit flow: tidak ada code, token ada di URL fragment (#access_token=...)
  // Fragment tidak bisa dibaca server-side, redirect ke halaman yang handle di client
  return NextResponse.redirect(`${siteUrl}${next}`);
}