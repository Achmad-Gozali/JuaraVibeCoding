import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-zinc-900">
                Kawal<span className="text-red-600">Transaksi</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-[200px]">
              Platform komunitas untuk saling melindungi dari penipuan online di Indonesia.
            </p>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-4">Layanan</h4>
            <ul className="space-y-2.5">
              <li><Link href="/cek-nomor" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Cek Nomor</Link></li>
              <li><Link href="/cek-rekening" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Cek Rekening</Link></li>
              <li><Link href="/report" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Lapor Penipuan</Link></li>
              <li><Link href="/edukasi" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Edukasi</Link></li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4 className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-4">Bantuan</h4>
            <ul className="space-y-2.5">
              <li><Link href="/faq" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">FAQ</Link></li>
              <li><Link href="/kontak" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Kontak</Link></li>
            </ul>
          </div>

          {/* Sosial */}
          <div>
            <h4 className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-4">Sosial</h4>
            <div className="flex gap-2">
              <a href="#" className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center hover:bg-zinc-200 transition-colors">
                <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.243 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center hover:bg-zinc-200 transition-colors">
                <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} KawalTransaksi. Seluruh hak cipta dilindungi.</p>
          <div className="flex gap-5">
            <Link href="/syarat-ketentuan" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Syarat &amp; Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}