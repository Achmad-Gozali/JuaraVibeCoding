'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import {
  Plus, Trash2, Copy, Check, Loader2,
  AlertCircle, CheckCircle2, Key, BarChart3,
  Eye, EyeOff, ExternalLink, Clock, Wifi,
} from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

interface ApiKey {
  id: string;
  name: string;
  key: string;
  requests_today: number;
  requests_total: number;
  daily_limit: number;
  is_active: boolean;
  created_at: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getResetCountdown() {
  const now = new Date();
  const reset = new Date();
  reset.setHours(24, 0, 0, 0); // midnight
  const diff = reset.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, resetTime: reset.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
}

export default function DeveloperDashboardClient() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [token, setToken] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [countdown, setCountdown] = useState(getResetCountdown());

  const supabase = createClient();

  // Cek status API
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(5000) });
        setApiStatus(res.ok ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown setiap menit
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getResetCountdown());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setToken(session.access_token);
      await fetchApiKeys(session.access_token);
    };
    init();
  }, []);

  const fetchApiKeys = async (t: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/apikeys`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success) setApiKeys(data.data);
      else setError('Gagal memuat API key.');
    } catch {
      setError('Gagal memuat API key.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) { setError('Nama aplikasi wajib diisi.'); return; }
    if (!token) return;
    setCreating(true); setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/apikeys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(prev => [data.data, ...prev]);
        setShowForm(false);
        setNewKeyName('');
        showSuccess('API key berhasil dibuat!');
        setVisibleKeys(prev => new Set([...prev, data.data.id]));
      } else setError(data.message || 'Gagal membuat API key.');
    } catch {
      setError('Gagal membuat API key.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus API key "${name}"? Aplikasi yang menggunakan key ini akan berhenti bekerja.`)) return;
    if (!token) return;
    setDeletingId(id); setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/apikeys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(prev => prev.filter(k => k.id !== id));
        showSuccess('API key berhasil dihapus.');
      } else setError(data.message || 'Gagal menghapus API key.');
    } catch {
      setError('Gagal menghapus API key.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const maskKey = (key: string) => `${key.slice(0, 10)}${'•'.repeat(20)}`;

  const totalRequestsToday = apiKeys.reduce((sum, k) => sum + k.requests_today, 0);
  const totalRequests = apiKeys.reduce((sum, k) => sum + k.requests_total, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">API Dashboard</h1>
              <p className="text-sm text-slate-400 mt-1">Kelola API key dan pantau penggunaan kamu</p>
            </div>
            <div className="flex items-center gap-3">
              {/* API Status */}
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                apiStatus === 'online'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : apiStatus === 'offline'
                  ? 'bg-red-50 border-red-100 text-red-600'
                  : 'bg-slate-50 border-slate-100 text-slate-500'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
                  apiStatus === 'offline' ? 'bg-red-500' : 'bg-slate-400'
                }`} />
                {apiStatus === 'online' ? 'API Online' : apiStatus === 'offline' ? 'API Offline' : 'Checking...'}
              </div>
              <Link
                href="/developer"
                className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Dokumentasi
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Stats */}
        {apiKeys.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total API Key', value: apiKeys.length },
              { label: 'Request Hari Ini', value: totalRequestsToday },
              { label: 'Total Request', value: totalRequests },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-[8px] border border-slate-200 p-4">
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reset info */}
        {apiKeys.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-[8px] border border-slate-200">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500">
              Daily limit reset pukul <span className="font-bold text-slate-700">00:00 WIB</span>
              {' '}—{' '}
              <span className="font-bold text-slate-700">{countdown.hours} jam {countdown.minutes} menit</span> lagi
            </p>
          </div>
        )}

        {/* API Keys */}
        <div className="bg-white rounded-[8px] border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">API Keys</p>
              <p className="text-xs text-slate-400 mt-0.5">Maksimal 3 API key per akun</p>
            </div>
            {apiKeys.length < 3 && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-[8px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Buat API Key
              </button>
            )}
          </div>

          {/* Form buat API key */}
          {showForm && (
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-bold text-slate-600 mb-3">Buat API Key Baru</p>
              <div className="flex gap-2">
                <input
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="Nama aplikasi (contoh: Bot Telegram Saya)"
                  className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-[8px] text-sm focus:outline-none focus:border-emerald-400 transition-all"
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-[8px] disabled:opacity-50 transition-colors"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Buat
                </button>
                <button
                  onClick={() => { setShowForm(false); setNewKeyName(''); }}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-[8px] transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="py-16 text-center">
              <Key className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400 mb-1">Belum ada API key</p>
              <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
                Buat API key untuk mulai menggunakan API KawalTransaksi
              </p>

              {/* 3 langkah */}
              <div className="flex items-start justify-center gap-6 mb-6 max-w-sm mx-auto text-left">
                {[
                  { step: '1', label: 'Buat key', desc: 'Klik tombol di bawah' },
                  { step: '2', label: 'Copy key', desc: 'Simpan di tempat aman' },
                  { step: '3', label: 'Mulai pakai', desc: 'Sertakan di header request' },
                ].map(item => (
                  <div key={item.step} className="flex-1 text-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center mx-auto mb-2">
                      {item.step}
                    </div>
                    <p className="text-xs font-bold text-slate-700">{item.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-[8px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Buat API Key Pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {apiKeys.map(apiKey => (
                <div key={apiKey.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{apiKey.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Dibuat {formatDate(apiKey.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(apiKey.id, apiKey.name)}
                      disabled={deletingId === apiKey.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-[8px] disabled:opacity-50 transition-colors shrink-0"
                    >
                      {deletingId === apiKey.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Hapus
                    </button>
                  </div>

                  {/* API Key display */}
                  <div className="flex items-center gap-2 bg-slate-50 rounded-[8px] px-3 py-2.5 mb-3">
                    <code className="text-xs font-mono text-slate-700 flex-1 truncate">
                      {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <button onClick={() => toggleVisibility(apiKey.id)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                      {visibleKeys.has(apiKey.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleCopy(apiKey.id, apiKey.key)} className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0">
                      {copiedId === apiKey.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Usage bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Usage hari ini</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">
                        {apiKey.requests_today} / {apiKey.daily_limit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          apiKey.requests_today / apiKey.daily_limit > 0.8
                            ? 'bg-red-500'
                            : apiKey.requests_today / apiKey.daily_limit > 0.5
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((apiKey.requests_today / apiKey.daily_limit) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-slate-400">
                        Sisa {apiKey.daily_limit - apiKey.requests_today} request hari ini · Total {apiKey.requests_total} request
                      </p>
                      {apiKey.requests_today / apiKey.daily_limit > 0.8 && (
                        <p className="text-[10px] font-bold text-amber-500">
                          Reset dalam {countdown.hours}j {countdown.minutes}m
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick start */}
        <div className="bg-slate-900 rounded-[8px] p-5 sm:p-6">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Quick Start</p>
          <pre className="text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto mb-4">{`curl https://api.kawaltransaksi.com/api/v1/check/08123456789 \\
  -H "X-API-Key: YOUR_API_KEY"`}</pre>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/developer#docs"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Lihat dokumentasi lengkap
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}