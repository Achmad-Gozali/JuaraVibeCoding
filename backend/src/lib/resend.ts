export async function sendWelcomeEmail({
  to,
  fullName,
  apiKey,
}: {
  to: string;
  fullName: string;
  apiKey: string;
}) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'KawalTransaksi <noreply@kawaltransaksi.com>',
      to: [to],
      subject: 'Selamat datang di KawalTransaksi! 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; color: #1e293b;">
          <img src="https://kawaltransaksi.com/logo.png" alt="KawalTransaksi" width="48" style="border-radius: 12px; margin-bottom: 24px;" />
          <h1 style="font-size: 22px; font-weight: 900; margin: 0 0 8px;">Halo, ${fullName}! 👋</h1>
          <p style="color: #475569; margin: 0 0 24px;">Akun kamu di <strong>KawalTransaksi</strong> berhasil dibuat. Kamu sekarang bisa melaporkan dan mengecek nomor rekening atau e-wallet yang mencurigakan.</p>
          <a href="https://kawaltransaksi.com/dashboard" style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">Masuk ke Dashboard →</a>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">Jika kamu tidak merasa mendaftar, abaikan email ini. Email ini dikirim otomatis, mohon tidak membalas.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[RESEND] Gagal kirim email:', err);
  }
}