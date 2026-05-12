import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Code2, ArrowRight, Terminal, Check, X, Phone, Landmark, Wallet } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Developer API - KawalTransaksi',
  description: 'Integrasikan database anti-penipuan KawalTransaksi ke aplikasi kamu dengan API yang simpel dan cepat.',
};

const exampleResponse = `{
  "success": true,
  "data": {
    "number": "08123456789",
    "status": "danger",
    "total_reports": 3,
    "verified_reports": 2,
    "total_loss": 5000000,
    "categories": ["Jual Beli Online"],
    "platforms": ["WhatsApp"],
    "url": "https://kawaltransaksi.com/check/08123456789"
  },
  "meta": {
    "requests_today": 1,
    "daily_limit": 100,
    "remaining": 99
  }
}`;

const endpoints = [
  { method: 'GET', path: '/api/v1/check/:number', desc: 'Cek nomor HP, rekening, atau ewallet' },
  { method: 'GET', path: '/api/v1/stats', desc: 'Statistik database KawalTransaksi' },
];

const useCases = [
  {
    icon: Phone,
    title: 'Cek Nomor HP',
    desc: 'Verifikasi nomor HP sebelum bertransaksi. Cek apakah nomor terindikasi penipu di database komunitas.',
    links: [
      { label: 'Lihat endpoint →', href: '#docs' },
      { label: 'Cek langsung di website →', href: '/cek-nomor' },
    ],
  },
  {
    icon: Landmark,
    title: 'Cek Rekening Bank',
    desc: 'Cek rekening bank sebelum transfer ke siapapun. Didukung semua bank besar di Indonesia.',
    links: [
      { label: 'Lihat endpoint →', href: '#docs' },
      { label: 'Cek langsung di website →', href: '/cek-rekening' },
    ],
  },
  {
    icon: Wallet,
    title: 'Cek E-Wallet',
    desc: 'Verifikasi akun GoPay, DANA, OVO, ShopeePay, dan LinkAja sebelum transfer.',
    links: [
      { label: 'Lihat endpoint →', href: '#docs' },
      { label: 'Cek langsung di website →', href: '/cek-nomor' },
    ],
  },
];

const comparisonFeatures = [
  {
    category: 'Akses API',
    items: [
      { label: 'REST API Access', free: true, pro: true },
      { label: 'Cek nomor HP', free: true, pro: true },
      { label: 'Cek rekening bank', free: true, pro: true },
      { label: 'Cek e-wallet', free: true, pro: true },
      { label: 'Endpoint statistik', free: true, pro: true },
    ],
  },
  {
    category: 'Batas Penggunaan',
    items: [
      { label: 'Request per hari', free: '100', pro: '10.000' },
      { label: 'Jumlah API key', free: '3 key', pro: 'Unlimited' },
      { label: 'Rate limit per detik', free: '10 req/s', pro: '100 req/s' },
    ],
  },
  {
    category: 'Fitur Tambahan',
    items: [
      { label: 'Usage dashboard', free: true, pro: true },
      { label: 'Webhook notifikasi', free: false, pro: 'soon' as const },
      { label: 'Priority support', free: false, pro: 'soon' as const },
    ],
  },
];

export default function DeveloperPage() {
  return (
    <main className="bg-white min-h-screen font-sans text-slate-900">

      {/* Hero */}
      <section className="bg-slate-900 px-4 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1">
              <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-4">Developer API KawalTransaksi</p>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-6">
                Mulai proteksi pengguna kamu dengan API anti-penipuan gratis.
              </h1>
              <ul className="space-y-3 mb-8">
                {[
                  'Daftar gratis — tidak perlu kartu kredit.',
                  'Akses database laporan penipuan komunitas Indonesia.',
                  'Gratis hingga 100 request per hari selamanya.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-slate-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-[8px] transition-colors"
                >
                  Mulai secara gratis <ArrowRight className="w-4 h-4" />
                </Link>
                
                <a
                  href="#docs"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 text-slate-300 text-sm font-bold rounded-[8px] transition-colors"
                >
                  Referensi API
                </a>
              </div>
            </div>
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="relative w-[420px] h-[320px]">
                <Image src="/api-hero.png" alt="Developer API" fill className="object-contain" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — desktop */}
      <div className="relative bg-slate-900 hidden sm:block">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full block" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 C240,80 480,30 720,60 C960,90 1200,40 1440,65 L1440,100 L0,100 Z" fill="#ffffff" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-4 sm:px-6 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[8px] border border-slate-200 shadow-lg shadow-slate-100 overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                <div className="px-5 py-5 sm:px-8 sm:py-6">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Gratis</p>
                  <p className="text-2xl sm:text-4xl font-black text-slate-900 leading-none tabular-nums">100</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-600 mt-1.5 leading-snug">Request/hari gratis</p>
                </div>
                <div className="px-5 py-5 sm:px-8 sm:py-6">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Performa</p>
                  <p className="text-2xl sm:text-4xl font-black text-emerald-700 leading-none tabular-nums">200ms</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-600 mt-1.5 leading-snug">Response time</p>
                </div>
                <div className="px-5 py-5 sm:px-8 sm:py-6">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Standard</p>
                  <p className="text-2xl sm:text-4xl font-black text-slate-900 leading-none tabular-nums">REST</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-600 mt-1.5 leading-snug">API standard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats — mobile */}
      <div className="sm:hidden bg-white px-4 pt-4 pb-6">
        <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="px-4 py-4">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Gratis</p>
              <p className="text-2xl font-black text-slate-900 leading-none">100</p>
              <p className="text-[9px] text-slate-600 mt-1.5">Request/hari</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Performa</p>
              <p className="text-2xl font-black text-emerald-700 leading-none">200ms</p>
              <p className="text-[9px] text-slate-600 mt-1.5">Response time</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">Standard</p>
              <p className="text-2xl font-black text-slate-900 leading-none">REST</p>
              <p className="text-[9px] text-slate-600 mt-1.5">API standard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <section className="px-4 pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter mb-3 uppercase">Jelajahi Fitur API</h2>
          <p className="text-sm text-slate-500 mb-10 max-w-xl">
            Integrasikan fitur anti-penipuan KawalTransaksi ke aplikasi kamu. Tersedia untuk nomor HP, rekening bank, dan e-wallet.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="border-t-2 border-slate-200 pt-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-[8px] flex items-center justify-center mb-4">
                  <uc.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{uc.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{uc.desc}</p>
                <div className="space-y-1">
                  {uc.links.map(link => (
                    <Link key={link.label} href={link.href} className="block text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave */}
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full block bg-white -mb-1" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 C240,60 480,20 720,45 C960,70 1200,30 1440,50 L1440,70 L0,70 Z" fill="#f8fafc" />
      </svg>

      {/* Pricing */}
      <section className="px-4 py-16 sm:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter text-center mb-3 uppercase">Paket API KawalTransaksi</h2>
          <p className="text-sm text-slate-500 text-center max-w-xl mx-auto mb-10">
            Pilih paket yang sesuai kebutuhan kamu. Mulai gratis, upgrade kapan saja.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="p-6 bg-white rounded-[8px] border-2 border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Free</p>
              <p className="text-3xl font-black text-slate-900 mb-1">Rp 0</p>
              <p className="text-xs text-slate-400 mb-2">Gratis selamanya</p>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">Cocok untuk developer individu yang mau mulai integrasi atau eksplor API KawalTransaksi.</p>
              <ul className="space-y-2 mb-6">
                {['100 request/hari', 'Akses semua endpoint', 'Maks. 3 API key', 'Usage dashboard', 'Support komunitas'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center px-4 py-2.5 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold rounded-[8px] transition-colors">
                Mulai secara gratis
              </Link>
            </div>
            <div className="p-6 bg-slate-900 rounded-[8px] border-2 border-slate-900 relative overflow-hidden">
              <div className="absolute top-4 right-4">
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pro</p>
              <p className="text-3xl font-black text-white mb-1">Coming Soon</p>
              <p className="text-xs text-slate-500 mb-2">Per bulan</p>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">Untuk startup dan bisnis yang butuh akses lebih banyak dan fitur premium.</p>
              <ul className="space-y-2 mb-6">
                {['10.000 request/hari', 'Akses semua endpoint', 'API key unlimited', 'Webhook notifikasi', 'Priority support'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button disabled className="block w-full text-center px-4 py-2.5 bg-white/10 text-slate-500 text-xs font-bold rounded-[8px] cursor-not-allowed">
                Segera Hadir
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Wave */}
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full block bg-slate-50 -mb-1" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,80 C360,20 720,65 1080,25 C1260,5 1380,45 1440,30 L1440,80 Z" fill="#ffffff" />
      </svg>

      {/* Comparison table */}
      <section className="px-4 py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter text-center mb-3 uppercase">Perbandingan Fitur Lengkap</h2>
          <p className="text-sm text-slate-500 text-center mb-12">Bandingkan fitur dari setiap paket.</p>
          {comparisonFeatures.map((group) => (
            <div key={group.category} className="mb-8">
              <div className="bg-slate-900 rounded-t-[8px] overflow-hidden">
                <div className="grid grid-cols-3 px-4 sm:px-5 py-4">
                  <p className="text-xs sm:text-sm font-bold text-white">{group.category}</p>
                  <p className="text-xs sm:text-sm font-bold text-white text-center">Free</p>
                  <p className="text-xs sm:text-sm font-bold text-white text-center">
                    Pro
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-b-[8px] border border-slate-200 border-t-0 overflow-hidden divide-y divide-slate-100">
                {group.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 px-4 sm:px-5 py-3.5 items-center hover:bg-slate-50 transition-colors">
                    <p className="text-xs sm:text-sm text-slate-700">{item.label}</p>
                    <div className="flex justify-center">
                      {typeof item.free === 'boolean' ? (
                        item.free
                          ? <Check className="w-4 h-4 text-emerald-500" />
                          : <X className="w-4 h-4 text-slate-300" />
                      ) : (
                        <span className="text-xs font-bold text-slate-700">{item.free}</span>
                      )}
                    </div>
                    <div className="flex justify-center">
                      {item.pro === 'soon' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">Soon</span>
                      ) : typeof item.pro === 'boolean' ? (
                        item.pro
                          ? <Check className="w-4 h-4 text-emerald-500" />
                          : <X className="w-4 h-4 text-slate-300" />
                      ) : (
                        <span className="text-xs font-bold text-slate-700">{item.pro}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wave */}
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full block bg-white -mb-1" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 C240,60 480,20 720,45 C960,70 1200,30 1440,50 L1440,70 L0,70 Z" fill="#f8fafc" />
      </svg>

      {/* Docs */}
      <section id="docs" className="px-4 py-16 sm:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">Dokumentasi</p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter mb-10 uppercase">Referensi API</h2>
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Base URL</p>
            <div className="bg-slate-900 rounded-[8px] px-4 py-3 font-mono text-sm text-emerald-400 overflow-x-auto">
              https://api.kawaltransaksi.com
            </div>
          </div>
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Authentication</p>
            <div className="bg-slate-900 rounded-[8px] px-4 py-3 font-mono text-sm text-slate-300 overflow-x-auto">
              {/* Sertakan API key di setiap request */}
              X-API-Key: kt_live_xxxxxxxxxxxxxxxx
            </div>
          </div>
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Available Endpoints</p>
            <div className="space-y-2">
              {endpoints.map((ep) => (
                <div key={ep.path} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-white rounded-[8px] border border-slate-200">
                  <span className="text-[11px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-[6px] shrink-0 border border-emerald-100 self-start">
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-slate-700 flex-1 break-all">{ep.path}</code>
                  <span className="text-xs text-slate-400">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contoh Response</p>
            <div className="bg-slate-900 rounded-[8px] p-4 overflow-x-auto">
              <pre className="text-xs text-slate-300 font-mono leading-relaxed">{exampleResponse}</pre>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contoh Penggunaan</p>
            <div className="bg-slate-900 rounded-[8px] p-4 overflow-x-auto mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-mono">JavaScript</span>
              </div>
              <pre className="text-xs text-slate-300 font-mono leading-relaxed">{`const response = await fetch(
  'https://api.kawaltransaksi.com/api/v1/check/08123456789',
  {
    headers: {
      'X-API-Key': 'kt_live_xxxxxxxxxxxxxxxx'
    }
  }
);

const data = await response.json();

if (data.data.status === 'danger') {
  console.log('Nomor ini terindikasi penipu!');
} else {
  console.log('Nomor aman');
}`}</pre>
            </div>
            <div className="bg-slate-900 rounded-[8px] p-4 overflow-x-auto mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-mono">Python</span>
              </div>
              <pre className="text-xs text-slate-300 font-mono leading-relaxed">{`import requests

response = requests.get(
    'https://api.kawaltransaksi.com/api/v1/check/08123456789',
    headers={'X-API-Key': 'kt_live_xxxxxxxxxxxxxxxx'}
)

data = response.json()

if data['data']['status'] == 'danger':
    print('Nomor ini terindikasi penipu!')
else:
    print('Nomor aman')`}</pre>
            </div>
            <div className="bg-slate-900 rounded-[8px] p-4 overflow-x-auto">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-mono">cURL</span>
              </div>
              <pre className="text-xs text-slate-300 font-mono leading-relaxed">{`curl https://api.kawaltransaksi.com/api/v1/check/08123456789 \\
  -H "X-API-Key: kt_live_xxxxxxxxxxxxxxxx"`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Wave */}
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full block bg-slate-50 -mb-1" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,80 C360,20 720,65 1080,25 C1260,5 1380,45 1440,30 L1440,80 Z" fill="#ffffff" />
      </svg>

      {/* Bukan Developer? */}
      <section className="px-4 py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter mb-3 uppercase">Bukan developer?</h2>
          <p className="text-sm text-slate-500 mb-3">Tidak familiar dengan API atau pemrograman?</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-8 max-w-2xl">
            KawalTransaksi tetap bisa kamu pakai langsung di website tanpa perlu integrasi atau pengetahuan teknis apapun.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Cek langsung di website',
                desc: 'Masukkan nomor HP atau rekening, hasil muncul seketika. Gratis, tanpa daftar.',
                href: '/cek-nomor',
                label: 'Cek nomor sekarang →',

              },
              {
                title: 'Laporkan penipuan',
                desc: 'Laporkan nomor penipu ke database komunitas. Satu laporan bisa melindungi ribuan orang.',
                href: '/login?redirect=/report',
                label: 'Buat laporan →',
                requireLogin: true,
              },
              {
                title: 'Lihat laporan publik',
                desc: 'Lihat semua laporan yang sudah diverifikasi. Transparansi penuh dari komunitas.',
                href: '/login?redirect=/laporan-publik',
                label: 'Lihat laporan publik →',
                requireLogin: true,
              },
            ].map((item) => (
              <div key={item.title} className="border-t-2 border-slate-200 pt-5">
                <h3 className="text-sm font-black text-slate-900 mb-2">
                  {item.title}
                  {item.requireLogin && (
                    <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-full uppercase tracking-wider">Login</span>
                  )}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{item.desc}</p>
                <Link href={item.href} className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 pt-8 space-y-2">
            <p className="text-sm text-slate-600">
              <span className="font-bold">Ada pertanyaan?</span>{' '}
              <Link href="/kontak" className="text-emerald-600 hover:text-emerald-800 transition-colors">Hubungi tim kami.</Link>
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-bold">Belum siap integrasi?</span>{' '}
              <Link href="/cek-nomor" className="text-emerald-600 hover:text-emerald-800 transition-colors">Coba cek langsung di website dulu.</Link>
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-bold">Bantu kami perluas database anti-penipuan Indonesia</span>{' '}
              —{' '}
              <Link href="/login?redirect=/report" className="text-emerald-600 hover:text-emerald-800 transition-colors">laporkan penipuan sekarang.</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="relative w-[380px] h-[300px]">
                <Image src="/api-hero.png" alt="Mulai gratis sekarang" fill className="object-contain" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter mb-4">
                Mulailah tanpa komitmen apa pun.
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Daftar akun KawalTransaksi dan dapatkan API key gratis seketika. Tidak perlu kartu kredit. Upgrade kapan saja seiring berkembangnya kebutuhan kamu.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-[8px] transition-colors"
              >
                Mulai secara gratis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}