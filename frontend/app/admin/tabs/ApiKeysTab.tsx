'use client';

import { useState, useEffect } from 'react';
import {
  Loader2, CheckCircle2, AlertCircle, Key,
  Search, X, ToggleLeft, ToggleRight, Trash2,
  ChevronDown, ChevronUp, BarChart3, User,
} from 'lucide-react';
import SectionTitle from '../components/SectionTitle';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key: string;
  requests_today: number;
  requests_total: number;
  daily_limit: number;
  is_active: boolean;
  created_at: string;
  user_email?: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function maskKey(key: string) {
  return `${key.slice(0, 14)}••••••••••••••••••••`;
}

export default function ApiKeysTab({ token }: { token: string }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState('');
  const [savingLimit, setSavingLimit] = useState(false);

  const fetchApiKeys = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/apikeys/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApiKeys(data.data);
      else setError('Gagal memuat API keys.');
    } catch { setError('Gagal memuat API keys.'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchApiKeys(); }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleToggleActive = async (apiKey: ApiKey) => {
    setTogglingId(apiKey.id); setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/apikeys/${apiKey.id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(prev => prev.map(k => k.id === apiKey.id ? { ...k, is_active: !k.is_active } : k));
        showSuccess(`API key ${apiKey.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`);
      } else setError(data.message || 'Gagal update status.');
    } catch { setError('Gagal update status.'); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (apiKey: ApiKey) => {
    if (!confirm(`Hapus API key "${apiKey.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeletingId(apiKey.id); setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/apikeys/${apiKey.id}/admin`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(prev => prev.filter(k => k.id !== apiKey.id));
        showSuccess('API key berhasil dihapus.');
      } else setError(data.message || 'Gagal menghapus.');
    } catch { setError('Gagal menghapus.'); }
    finally { setDeletingId(null); }
  };

  const handleSaveLimit = async (id: string) => {
    const limit = parseInt(newLimit);
    if (isNaN(limit) || limit < 1) { setError('Limit harus angka positif.'); return; }
    setSavingLimit(true); setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/apikeys/${id}/limit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ daily_limit: limit }),
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(prev => prev.map(k => k.id === id ? { ...k, daily_limit: limit } : k));
        setEditingLimitId(null);
        setNewLimit('');
        showSuccess('Daily limit berhasil diupdate.');
      } else setError(data.message || 'Gagal update limit.');
    } catch { setError('Gagal update limit.'); }
    finally { setSavingLimit(false); }
  };

  const filtered = apiKeys.filter(k => {
    const q = searchQuery.toLowerCase();
    return !q
      || k.name.toLowerCase().includes(q)
      || k.key.toLowerCase().includes(q)
      || k.user_email?.toLowerCase().includes(q)
      || k.user_id.toLowerCase().includes(q);
  });

  const totalRequests = apiKeys.reduce((s, k) => s + k.requests_total, 0);
  const activeKeys = apiKeys.filter(k => k.is_active).length;
  const totalToday = apiKeys.reduce((s, k) => s + k.requests_today, 0);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <SectionTitle title="API Keys" subtitle="Monitor dan kelola semua API key developer" />
        <button
          onClick={fetchApiKeys}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-medium transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total API Key', value: apiKeys.length, color: 'text-slate-900', bg: 'bg-slate-100', icon: Key },
          { label: 'Key Aktif', value: activeKeys, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ToggleRight },
          { label: 'Request Hari Ini', value: totalToday, color: 'text-blue-600', bg: 'bg-blue-50', icon: BarChart3 },
          { label: 'Total Request', value: totalRequests.toLocaleString('id-ID'), color: 'text-slate-900', bg: 'bg-slate-100', icon: BarChart3 },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama, email, atau API key..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center">
          <Key className="w-8 h-8 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Belum ada API key</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Header — desktop only */}
          <div className="hidden sm:grid grid-cols-12 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Nama / Email</div>
            <div className="col-span-3">API Key</div>
            <div className="col-span-2 text-center">Usage Hari Ini</div>
            <div className="col-span-2 text-center">Total Request</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">Aksi</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map(apiKey => {
              const usagePercent = Math.min((apiKey.requests_today / apiKey.daily_limit) * 100, 100);
              const isExpanded = expandedId === apiKey.id;

              return (
                <div key={apiKey.id}>
                  <div className={`px-4 sm:px-5 py-4 transition-colors ${!apiKey.is_active ? 'opacity-60 bg-slate-50' : 'hover:bg-slate-50/50'}`}>

                    {/* Mobile layout */}
                    <div className="sm:hidden">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                              <User className="w-3 h-3 text-emerald-600" />
                            </div>
                            <p className="text-xs font-bold text-slate-900 truncate">{apiKey.name}</p>
                          </div>
                          {apiKey.user_email && (
                            <p className="text-[10px] text-slate-400 truncate ml-8">{apiKey.user_email}</p>
                          )}
                          <p className="text-[10px] text-slate-300 truncate ml-8">{formatDate(apiKey.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            apiKey.is_active
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            {apiKey.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400">Usage hari ini</span>
                          <span className="text-[10px] font-bold text-slate-600">{apiKey.requests_today} / {apiKey.daily_limit}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(apiKey)}
                          disabled={togglingId === apiKey.id}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
                            apiKey.is_active ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {togglingId === apiKey.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : apiKey.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {apiKey.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => handleDelete(apiKey)}
                          disabled={deletingId === apiKey.id}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {deletingId === apiKey.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          Hapus
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : apiKey.id)}
                          className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center transition-colors shrink-0"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-12 items-center gap-2">
                      <div className="col-span-3 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                            <User className="w-3 h-3 text-emerald-600" />
                          </div>
                          <p className="text-xs font-bold text-slate-900 truncate">{apiKey.name}</p>
                        </div>
                        {apiKey.user_email && (
                          <p className="text-[10px] text-slate-400 truncate ml-8">{apiKey.user_email}</p>
                        )}
                        <p className="text-[10px] text-slate-300 truncate ml-8">{formatDate(apiKey.created_at)}</p>
                      </div>
                      <div className="col-span-3">
                        <code className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                          {maskKey(apiKey.key)}
                        </code>
                      </div>
                      <div className="col-span-2 px-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700">{apiKey.requests_today}</span>
                          <span className="text-[10px] text-slate-400">/ {apiKey.daily_limit}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <span className="text-xs font-bold text-slate-700">{apiKey.requests_total.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          apiKey.is_active
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {apiKey.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleToggleActive(apiKey)}
                          disabled={togglingId === apiKey.id}
                          title={apiKey.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors disabled:opacity-50 ${
                            apiKey.is_active ? 'bg-emerald-50 hover:bg-red-50 text-emerald-600 hover:text-red-500' : 'bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'
                          }`}
                        >
                          {togglingId === apiKey.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : apiKey.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(apiKey)}
                          disabled={deletingId === apiKey.id}
                          className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {deletingId === apiKey.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : apiKey.id)}
                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 sm:px-5 py-4 bg-slate-50/60 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white rounded-xl border border-slate-100 p-3.5">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">API Key</p>
                          <code className="text-[11px] font-mono text-slate-600 break-all">{maskKey(apiKey.key)}</code>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-100 p-3.5">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">User ID</p>
                          <code className="text-[11px] font-mono text-slate-600 break-all">{apiKey.user_id.slice(0, 16)}...</code>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-100 p-3.5">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Dibuat</p>
                          <p className="text-xs font-medium text-slate-700">{formatDate(apiKey.created_at)}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-100 p-3.5">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Usage Hari Ini</p>
                          <p className="text-xs font-bold text-slate-700">{apiKey.requests_today} / {apiKey.daily_limit} request</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-bold text-slate-700 mb-3">Ubah Daily Limit</p>
                        {editingLimitId === apiKey.id ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="number"
                              value={newLimit}
                              onChange={e => setNewLimit(e.target.value)}
                              placeholder={String(apiKey.daily_limit)}
                              className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-all"
                              min="1"
                            />
                            <span className="text-xs text-slate-400">request/hari</span>
                            <button
                              onClick={() => handleSaveLimit(apiKey.id)}
                              disabled={savingLimit}
                              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-colors"
                            >
                              {savingLimit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Simpan
                            </button>
                            <button
                              onClick={() => { setEditingLimitId(null); setNewLimit(''); }}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-900">{apiKey.daily_limit} request/hari</span>
                            <button
                              onClick={() => { setEditingLimitId(apiKey.id); setNewLimit(String(apiKey.daily_limit)); }}
                              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                            >
                              Ubah limit →
                            </button>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-2">Free tier: 100/hari. Naikkan limit untuk developer tertentu sebelum Pro tier tersedia.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}