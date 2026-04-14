// frontend/app/api/sb/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params;
  const targetUrl = `${SUPABASE_URL}/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!['connection', 'host', 'keep-alive', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set('host', new URL(SUPABASE_URL).host);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      // @ts-expect-error duplex required for streaming
      duplex: 'half',
    });

    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!['connection', 'transfer-encoding', 'x-supabase-api-version'].includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch {
    return NextResponse.json({ error: 'Proxy error' }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;