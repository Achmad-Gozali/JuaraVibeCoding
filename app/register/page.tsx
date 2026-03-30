import AuthForm from '@/components/AuthForm';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, UserPlus, FileText, Database } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Bar - Back Link */}
      <div className="absolute top-0 left-0 w-full p-6 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-widest transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
        </Link>
        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-[0.3em]">
          <UserPlus className="w-3 h-3" /> Contributor Access
        </div>
      </div>

      {/* Main Container (Compact but Pro) */}
      <div className="w-full max-w-[440px] px-6 py-12">
        
        {/* ✅ LOGO GEDE & PRO (48px) ✅ */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-5">
             <Image 
                src="/logo.png" 
                alt="Logo KawalTransaksi" 
                width={48} 
                height={48} 
                className="rounded-xl shadow-sm"
                priority
             />
             <div className="absolute -inset-1 bg-emerald-500/15 rounded-xl blur opacity-75" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Gabung Komunitas.</h1>
          <p className="text-sm text-slate-500 font-medium">Bantu kami membangun database keamanan transaksi terbaik.</p>
        </div>

        {/* ✅ REGISTER CARD (Enterprise Style - Emerald) ✅ */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-emerald-900/5 p-8 sm:p-10 relative overflow-hidden">
          
          {/* Subtle Top Accent Emerald */}
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600" />
          
          <AuthForm type="register" />
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sudah punya akses?</p>
             <Link href="/login" className="text-xs font-black text-slate-800 hover:text-emerald-700 uppercase tracking-widest flex items-center justify-center gap-1 transition-colors">
               Masuk ke Portal Kontributor <ArrowLeft className="w-3 h-3 rotate-180" />
             </Link>
          </div>
        </div>

        {/* Legal Links (Small Caps) */}
        <div className="mt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] space-x-6">
           <Link href="/syarat-ketentuan" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</Link>
           <Link href="/kebijakan-privasi" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</Link>
        </div>
      </div>
    </div>
  );
}