import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import SiteShell from '@/components/SiteShell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-dm-mono',
});

export const metadata: Metadata = {
  title: 'KawalTransaksi - Cek & Laporkan Nomor Penipu',
  description: 'Cek nomor HP, rekening bank, dan e-wallet terindikasi penipuan secara gratis. Database laporan komunitas anti-penipuan Indonesia terlengkap.',
  metadataBase: new URL('https://kawaltransaksi.vercel.app/'),
  icons: {
    icon: '/logo.png',
  },
  keywords: [
    'cek nomor penipu',
    'cek rekening penipu',
    'nomor hp penipu',
    'rekening penipuan',
    'cek ewallet penipu',
    'lapor penipuan online',
    'anti penipuan indonesia',
    'database penipu',
    'cek nomor BCA',
    'cek nomor BRI',
    'cek GoPay penipu',
    'kawaltransaksi',
  ],
  authors: [{ name: 'KawalTransaksi' }],
  creator: 'KawalTransaksi',
  publisher: 'KawalTransaksi',
  openGraph: {
    title: 'KawalTransaksi - Cek & Laporkan Nomor Penipu',
    description: 'Cek nomor HP, rekening bank, dan e-wallet terindikasi penipuan secara gratis. Database laporan komunitas anti-penipuan Indonesia.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'KawalTransaksi',
    url: 'https://kawaltransaksi.vercel.app/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KawalTransaksi - Cek & Laporkan Nomor Penipu',
    description: 'Cek nomor HP, rekening bank, dan e-wallet terindikasi penipuan secara gratis.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://kawaltransaksi.vercel.app/',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

// Cache semua halaman 60 detik — halaman dengan force-dynamic tetap override ini
export const revalidate = 60;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`scroll-smooth ${inter.variable} ${robotoMono.variable}`}>
      <body
        className={`${inter.className} bg-zinc-50 text-zinc-900 min-h-screen flex flex-col selection:bg-red-100 selection:text-red-900`}
        suppressHydrationWarning
      >
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}