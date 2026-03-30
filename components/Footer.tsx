import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* BRANDING KIRI */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" className="flex items-center gap-3.5 group shrink-0 mb-6">
              <div className="relative">
                <Image 
                  src="/logo.png?v=2" 
                  alt="Logo KawalTransaksi" 
                  width={48} 
                  height={48} 
                  className="rounded-xl group-hover:rotate-6 transition-transform duration-300 shadow-sm"
                />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                Kawal<span className="text-emerald-600">Transaksi</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mb-6">
              Membangun benteng pertahanan komunitas terhadap tindak penipuan digital di Indonesia. Cepat, Terbuka, & Terpercaya.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Platform Gratis
            </div>
          </div>

          {/* LAYANAN UTAMA */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Layanan Utama</h4>
            <ul className="space-y-4">
              {['Cek Nomor', 'Cek Rekening', 'Lapor Penipuan', 'Edukasi'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-xs font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-wider transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* BANTUAN */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Bantuan & Legal</h4>
            <ul className="space-y-4">
              {[
                { name: 'FAQ', path: '/faq' },
                { name: 'Kontak Kami', path: '/kontak' },
                { name: 'Syarat Ketentuan', path: '/syarat-ketentuan' },
                { name: 'Kebijakan Privasi', path: '/kebijakan-privasi' }
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.path} 
                    className="text-xs font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-wider transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ SOCIAL CONNECT - LINKS UPDATED ✅ */}
          <div className="md:col-span-12 lg:col-span-2">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 lg:text-right">Social Connect</h4>
            <div className="flex gap-4 lg:justify-end">
              
              {/* TIKTOK */}
              <a 
                href="https://www.tiktok.com/@alieee27_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.47-.88-.64-1.61-1.47-2.12-2.44v10.12c-.03 2.13-.8 4.29-2.39 5.73-1.61 1.48-3.9 2.15-6.04 1.83-2.34-.35-4.52-2.11-5.32-4.34-.84-2.34-.14-5.1 1.74-6.72 1.51-1.32 3.65-1.78 5.61-1.3v4.11c-1.2-.34-2.58-.1-3.52.74-.83.74-1.12 1.99-.75 3.03.34 1.02 1.42 1.73 2.49 1.71 1.17-.03 2.22-.92 2.45-2.07.03-.17.04-.34.04-.51V.02z"/>
                </svg>
              </a>

              {/* INSTAGRAM */}
              <a 
                href="https://www.instagram.com/achmadgozali27_/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>

              {/* FACEBOOK */}
              <a 
                href="https://www.facebook.com/ali.gntng201" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 KAWALTRANSAKSI — INFORMATICS STUDENT PROJECT
          </p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Online</p>
          </div>
        </div>
      </div>
    </footer>
  );
}