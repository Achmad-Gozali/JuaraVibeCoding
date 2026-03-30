'use client';

import React, { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

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
      setError(`Gagal login dengan ${provider}.`);
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
        setSuccessMessage('Pendaftaran berhasil! Cek email buat verifikasi.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        
        // JURUS: Refresh cache router sebelum push
        router.refresh();
        setTimeout(() => router.push(redirectTo), 100);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-zinc-200/50 border border-zinc-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-2xl mb-6 shadow-xl shadow-zinc-200">
            {type === 'login' ? <LogIn className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-4xl font-black text-zinc-900 mb-3 tracking-tight">
            {type === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
          </h2>
          <p className="text-zinc-500 font-medium">
            {type === 'login' ? 'Masuk untuk mulai melaporkan nomor penipu.' : 'Daftar untuk berkontribusi.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{successMessage}</p>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {oauthProviders.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleOAuthLogin(p.id)}
              disabled={!!oauthLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {oauthLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : p.icon}
              {type === 'login' ? 'Masuk' : 'Daftar'} dengan {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-zinc-100" />
          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">atau email</span>
          <div className="flex-1 h-px bg-zinc-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'register' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900" required />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:border-zinc-900 focus:bg-white outline-none transition-all font-bold text-zinc-900" required minLength={6} />
            </div>
          </div>
          <button type="submit" disabled={isLoading || !!oauthLoading}
            className="w-full py-5 bg-zinc-900 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-2xl shadow-zinc-900/20 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{type === 'login' ? 'MASUK SEKARANG' : 'DAFTAR SEKARANG'}<LogIn className="w-5 h-5 text-zinc-400" /></>}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-zinc-100 text-center">
          <p className="text-sm text-zinc-500 font-medium">
            {type === 'login' ? <>Belum punya akun? <Link href="/register" className="text-zinc-900 font-black hover:underline underline-offset-4">Daftar di sini</Link></> : <>Sudah punya akun? <Link href="/login" className="text-zinc-900 font-black hover:underline underline-offset-4">Masuk di sini</Link></>}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthForm({ type }: AuthFormProps) {
  return (
    <Suspense fallback={<div className="w-full max-w-md mx-auto p-10 bg-white rounded-[2.5rem] animate-pulse h-96 border border-zinc-100" />}>
      <AuthFormInner type={type} />
    </Suspense>
  );
}