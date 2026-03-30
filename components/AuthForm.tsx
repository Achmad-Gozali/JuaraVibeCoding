'use client';

import React, { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2, Mail, Lock, UserPlus, LogIn, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'register';
}

const oauthProviders = [
  {
    id: 'google',
    label: 'Google',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
] as const;

type OAuthProvider = typeof oauthProviders[number]['id'];

function AuthFormInner({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectTo = searchParams.get('redirectTo') || '/';

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setOauthLoading(provider);
    setError(null);
    const siteUrl = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(`Gagal otentikasi dengan ${provider}.`);
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (type === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (signUpError) throw signUpError;
        setSuccessMessage('Pendaftaran berhasil! Silakan periksa kotak masuk email Anda untuk instruksi verifikasi.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        
        router.refresh();
        setTimeout(() => router.push(redirectTo), 100);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {/* Social Login Button - Kotak & Rapi */}
      <div className="mb-8">
        {oauthProviders.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleOAuthLogin(p.id)}
            disabled={!!oauthLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {oauthLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : p.icon}
            Lanjutkan dengan {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">atau email</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {type === 'register' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Nama Lengkap</label>
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm shadow-sm" 
                required 
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Alamat Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="email@perusahaan.com"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm shadow-sm" 
              required 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Kata Sandi</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Minimal 6 karakter"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm shadow-sm" 
              required 
              minLength={6} 
            />
          </div>
        </div>

        {/* Tombol Utama - Sharp & Pro */}
        <button 
          type="submit" 
          disabled={isLoading || !!oauthLoading}
          className={`w-full py-4 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md disabled:opacity-50 text-sm uppercase tracking-widest mt-4 ${
            type === 'login' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {type === 'login' ? 'OTENTIKASI MASUK' : 'BUAT AKUN'}
              <ArrowRight className="w-4 h-4 opacity-70" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AuthForm({ type }: AuthFormProps) {
  return (
    <Suspense fallback={<div className="w-full max-w-sm mx-auto bg-slate-50 rounded-xl animate-pulse h-64 border border-slate-100" />}>
      <AuthFormInner type={type} />
    </Suspense>
  );
}