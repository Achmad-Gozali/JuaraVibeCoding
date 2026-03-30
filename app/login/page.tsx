import AuthForm from '@/components/AuthForm';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Bar - Back Link */}
      <div className="absolute top-0 left-0 w-full p-6 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-widest transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
        </Link>
        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-[0.3em]">
          <ShieldCheck className="w-3 h-3" /> Community Registry
        </div>
      </div>

      {/* Main Container (Compact but Pro) */}
      <div className="w-full max-w-[440px] px-6 py-12">
        
        {/* ✅ LOGO GEDE & PRO (48px) ✅ */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-5">
             <Image 
                src="/logo.png" // Pastikan file logo.png ada di folder /public
                alt="Logo KawalTransaksi" 
                width={48} 
                height={48} 
                className="rounded-xl shadow-sm"
                priority
             />
             <div className="absolute -inset-1 bg-emerald-500/15 rounded-xl blur opacity-75" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Masuk Portal.</h1>
          <p className="text-sm text-slate-500 font-medium">Gunakan kredensial terdaftar untuk mengakses database.</p>
        </div>

        {/* ✅ LOGIN CARD (Enterprise Style) ✅ */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5 p-8 sm:p-10 relative overflow-hidden">
          
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-900" />
          
          <AuthForm type="login" />
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Belum punya akses?</p>
             <Link href="/register" className="text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center justify-center gap-1 transition-colors">
               Daftar Akun Kontributor <ShieldCheck className="w-3 h-3" />
             </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
           © 2026 INFORMATICS COMMUNITY PROJECT
        </div>
      </div>
    </div>
  );
}