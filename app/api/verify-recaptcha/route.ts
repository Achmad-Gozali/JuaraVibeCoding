import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token tidak ditemukan.' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const res = await fetch(verifyUrl, { method: 'POST' });
    const data = await res.json();

    // v3: score >= 0.5 dianggap manusia
    if (!data.success || data.score < 0.5) {
      return NextResponse.json(
        { success: false, message: 'Terdeteksi aktivitas mencurigakan. Coba lagi.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, score: data.score });
  } catch {
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}