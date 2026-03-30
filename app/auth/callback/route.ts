import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    
    // Default response, tapi nanti kita suntik header di bawah
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
            } catch { /* Handle in middleware */ }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const finalUrl = profile?.role === 'admin' ? `${origin}/admin` : `${origin}${next}`;
      
      // ✅ FIX: Buat response baru dan suntik cookie store secara manual agar sinkron
      const redirectResponse = NextResponse.redirect(finalUrl);
      
      // Copy cookies dari store ke response redirect
      cookieStore.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value);
      });

      return redirectResponse;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}