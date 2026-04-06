'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, X, Loader2, AlertCircle, CheckCircle2,
  ArrowLeft, ChevronDown, Plus, Trash2,
} from 'lucide-react';

interface EditReportFormProps {
  report: {
    id: string;
    target_number: string;
    target_name: string | null;
    target_type: string;
    category: string;
    chronology: string;
    bank_name?: string | null;
    loss_amount?: number | null;
    incident_date?: string | null;
    platform?: string | null;
    link_url?: string | null;
    social_media_accounts?: string[] | null;
    has_other_victims?: string | null;
    reported_to?: string[] | null;
    evidence_urls?: string[] | null;
    evidence_url?: string | null;
    suspect_photo_url?: string | null;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const MAX_EVIDENCE_FILES = 10;

const categoryList = [
  { value: 'Jual Beli Online', label: 'Jual Beli Online' },
  { value: 'Investasi Bodong', label: 'Investasi Bodong' },
  { value: 'Pinjaman Online', label: 'Pinjaman Online' },
  { value: 'Phishing / Soceng', label: 'Phishing / Social Engineering' },
  { value: 'Modus Kurir/APK', label: 'Modus Kurir / File APK' },
  { value: 'Lainnya', label: 'Lainnya' },
];

const platformList = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'TikTok Shop', label: 'TikTok Shop' },
  { value: 'Facebook', label: 'Facebook / Marketplace' },
  { value: 'Telegram', label: 'Telegram' },
  { value: 'Twitter/X', label: 'Twitter / X' },
  { value: 'Lainnya', label: 'Platform Lainnya' },
];

const reportedToOptions = [
  { value: 'polisi', label: 'Polisi' },
  { value: 'ojk', label: 'OJK' },
  { value: 'platform', label: 'Platform' },
  { value: 'belum', label: 'Belum lapor' },
];

// ── SUB COMPONENTS ─────────────────────────────────────────────────────────────
function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest whitespace-nowrap">{label}</p>
      <div className="flex-1 h-px bg-zinc-100" />
    </div>
  );
}

function FieldLabel({ label, optional, badge }: { label: string; optional?: boolean; badge?: string }) {
  return (
    <label className="text-[11px] font-bold text-zinc-700 ml-1 flex items-center gap-1.5 mb-1.5">
      {label}
      {badge && <span className="text-zinc-300 font-normal bg-zinc-100 px-2 py-0.5 rounded-lg">{badge}</span>}
      {optional && <span className="text-zinc-300 font-normal">(opsional)</span>}
    </label>
  );
}

function InputBase({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300 ${className}`}
    />
  );
}

function SelectBase({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold appearance-none focus:bg-white focus:border-zinc-900 outline-none transition-all ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function EditReportForm({ report }: EditReportFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Existing evidence
  const existingUrls: string[] = [
    ...(report.evidence_urls ?? []),
    ...(report.evidence_url && !report.evidence_urls?.includes(report.evidence_url)
      ? [report.evidence_url] : []),
  ].filter(Boolean);

  const [keptExistingUrls, setKeptExistingUrls] = useState<string[]>(existingUrls);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>([]);

  // Suspect photo
  const [suspectPhotoUrl] = useState<string | null>(report.suspect_photo_url ?? null);
  const [newSuspectPhoto, setNewSuspectPhoto] = useState<File | null>(null);
  const [suspectPhotoPreview, setSuspectPhotoPreview] = useState<string | null>(report.suspect_photo_url ?? null);

  const [formData, setFormData] = useState({
    target_name: report.target_name ?? '',
    category: report.category,
    chronology: report.chronology,
    bank_name: report.bank_name ?? '',
    loss_amount: report.loss_amount
      ? new Intl.NumberFormat('id-ID').format(report.loss_amount)
      : '',
    incident_date: report.incident_date ?? '',
    platform: report.platform ?? '',
    link_url: report.link_url ?? '',
    social_media_accounts: report.social_media_accounts?.length
      ? report.social_media_accounts
      : [''],
    has_other_victims: (report.has_other_victims ?? '') as '' | 'yes' | 'no',
    reported_to: report.reported_to ?? [],
  });

  const totalPhotos = keptExistingUrls.length + newFiles.length;
  const chronologyProgress = Math.min((formData.chronology.length / 150) * 100, 100);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const addSocialField = () =>
    setFormData(f => ({ ...f, social_media_accounts: [...f.social_media_accounts, ''] }));

  const removeSocialField = (i: number) =>
    setFormData(f => ({ ...f, social_media_accounts: f.social_media_accounts.filter((_, idx) => idx !== i) }));

  const updateSocialField = (i: number, val: string) =>
    setFormData(f => {
      const arr = [...f.social_media_accounts];
      arr[i] = val;
      return { ...f, social_media_accounts: arr };
    });

  const toggleReportedTo = (val: string) =>
    setFormData(f => ({
      ...f,
      reported_to: f.reported_to.includes(val)
        ? f.reported_to.filter(v => v !== val)
        : [...f.reported_to, val],
    }));

  const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_EVIDENCE_FILES - totalPhotos;
    const toAdd = files.slice(0, remaining);
    const oversized = toAdd.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) { setError(`${oversized.length} file melebihi batas 5MB.`); return; }
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setNewFiles(prev => [...prev, { file, preview: reader.result as string }]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSuspectPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Ukuran foto profil melebihi 5MB.'); return; }
    setNewSuspectPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setSuspectPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, token: string): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${BACKEND_URL}/api/reports/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    return data.success ? data.url : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.chronology.trim().length < 20) {
      setError('Kronologi minimal 20 karakter.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setUploadProgress(null);

    try {
      const { createClient } = await import('@/lib/supabase-browser');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Sesi habis. Silakan login ulang.'); return; }
      const token = session.access_token;

      // Upload foto bukti baru
      const uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        for (let i = 0; i < newFiles.length; i++) {
          setUploadProgress(`Mengupload foto ${i + 1} dari ${newFiles.length}...`);
          const url = await uploadFile(newFiles[i].file, token);
          if (url) uploadedUrls.push(url);
        }
      }

      // Upload foto profil penipu baru
      let finalSuspectPhotoUrl = suspectPhotoUrl;
      if (newSuspectPhoto) {
        setUploadProgress('Mengupload foto profil...');
        finalSuspectPhotoUrl = await uploadFile(newSuspectPhoto, token);
      }

      const allEvidenceUrls = [...keptExistingUrls, ...uploadedUrls];
      setUploadProgress('Menyimpan perubahan...');

      const res = await fetch(`${BACKEND_URL}/api/reports/${report.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_name: formData.target_name || null,
          category: formData.category,
          chronology: formData.chronology,
          bank_name: formData.bank_name || null,
          loss_amount: formData.loss_amount
            ? parseInt(formData.loss_amount.replace(/\D/g, ''), 10)
            : null,
          incident_date: formData.incident_date || null,
          platform: formData.platform || null,
          link_url: formData.link_url || null,
          social_media_accounts: formData.social_media_accounts.filter(Boolean),
          has_other_victims: formData.has_other_victims || null,
          reported_to: formData.reported_to,
          evidence_urls: allEvidenceUrls,
          evidence_url: allEvidenceUrls[0] || null,
          suspect_photo_url: finalSuspectPhotoUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/dashboard/laporan');
        router.refresh();
      } else {
        setError(data.message || 'Gagal menyimpan perubahan.');
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12">

        {/* Back */}
        <button
          onClick={() => router.push('/dashboard/laporan')}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-800 transition-colors mb-6 sm:mb-10"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke laporan saya
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-zinc-900 uppercase mb-1">
            Edit Laporan
          </h1>
          <p className="text-sm font-mono text-zinc-400">{report.target_number}</p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-8">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 leading-relaxed">
            Setelah menyimpan, laporan akan masuk ke antrian review admin kembali.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* ── INFORMASI DASAR ── */}
          <div className="space-y-5">
            <SectionTitle label="Informasi dasar" />

            <div>
              <FieldLabel label="Nomor" badge="tidak bisa diubah" />
              <InputBase value={report.target_number} disabled className="opacity-40 cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Nama pemilik" optional />
                <InputBase
                  type="text"
                  value={formData.target_name}
                  onChange={e => setFormData({ ...formData, target_name: e.target.value })}
                  placeholder="Budi Santoso"
                />
              </div>
              <div>
                <FieldLabel label="Kategori penipuan" />
                <SelectBase
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {categoryList.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </SelectBase>
              </div>
            </div>

            {/* Akun sosmed */}
            <div>
              <FieldLabel label="Akun media sosial penipu" optional />
              <p className="text-[10px] text-zinc-400 font-medium ml-1 -mt-1 mb-2">Instagram, TikTok, Facebook, Telegram, dll.</p>
              <div className="space-y-2">
                {formData.social_media_accounts.map((val, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold select-none">@</span>
                      <input
                        type="text"
                        value={val}
                        onChange={e => updateSocialField(i, e.target.value)}
                        placeholder="username atau link profil"
                        className="w-full pl-7 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-300"
                      />
                    </div>
                    {formData.social_media_accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSocialField(i)}
                        className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-zinc-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {formData.social_media_accounts.length < 4 && (
                  <button
                    type="button"
                    onClick={addSocialField}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-zinc-700 transition-colors mt-1 ml-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah akun lain
                  </button>
                )}
              </div>
            </div>

            {/* Foto profil penipu */}
            <div>
              <FieldLabel label="Foto profil / identitas visual penipu" optional />
              {!suspectPhotoPreview ? (
                <label className="group border-2 border-dashed border-zinc-200 rounded-2xl p-5 flex items-center gap-4 hover:border-zinc-400 hover:bg-zinc-50 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-600">Upload foto penipu</p>
                    <p className="text-[10px] text-zinc-400 font-medium">JPG, PNG · maks 5MB</p>
                  </div>
                  <input type="file" onChange={handleSuspectPhotoChange} className="hidden" accept="image/*" />
                </label>
              ) : (
                <div className="relative inline-block">
                  <img src={suspectPhotoPreview} alt="Foto penipu" className="w-24 h-24 object-cover rounded-2xl border border-zinc-200" />
                  <button
                    type="button"
                    onClick={() => { setNewSuspectPhoto(null); setSuspectPhotoPreview(null); }}
                    className="absolute -top-2 -right-2 p-1 bg-zinc-900 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── DETAIL KEJADIAN ── */}
          <div className="space-y-5">
            <SectionTitle label="Detail kejadian" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Kerugian" optional />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold select-none">Rp</span>
                  <InputBase
                    type="text"
                    value={formData.loss_amount}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, loss_amount: val ? new Intl.NumberFormat('id-ID').format(parseInt(val)) : '' });
                    }}
                    placeholder="500.000"
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <FieldLabel label="Tanggal kejadian" optional />
                <InputBase
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.incident_date}
                  onChange={e => setFormData({ ...formData, incident_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Platform" optional />
                <SelectBase
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="">Pilih...</option>
                  {platformList.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </SelectBase>
              </div>
              <div>
                <FieldLabel label="Link / URL" optional />
                <InputBase
                  type="url"
                  value={formData.link_url}
                  onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* ── KRONOLOGI ── */}
          <div className="space-y-3">
            <SectionTitle label="Kronologi" />
            <textarea
              required
              rows={7}
              minLength={20}
              value={formData.chronology}
              onChange={e => setFormData({ ...formData, chronology: e.target.value })}
              placeholder="Ceritakan bagaimana penipuan terjadi, termasuk nominal kerugian, tanggal kejadian, dan identitas pelaku..."
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:bg-white focus:border-zinc-900 transition-all outline-none resize-none placeholder:text-zinc-300 leading-relaxed"
            />
            <div className="space-y-1.5">
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    chronologyProgress >= 100 ? 'bg-emerald-500'
                    : chronologyProgress > 50 ? 'bg-amber-400'
                    : 'bg-zinc-300'
                  }`}
                  style={{ width: `${chronologyProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 font-medium">
                  {formData.chronology.length < 150 ? 'Tambahkan lebih banyak detail' : 'Kronologi sudah cukup lengkap'}
                </span>
                <span className={`text-[10px] font-bold ${formData.chronology.length >= 150 ? 'text-emerald-500' : 'text-zinc-400'}`}>
                  {formData.chronology.length} / 150 min
                </span>
              </div>
            </div>
          </div>

          {/* ── BUKTI FOTO ── */}
          <div className="space-y-4">
            <SectionTitle label="Bukti foto" />
            <p className="text-[10px] text-zinc-400 font-medium -mt-2">
              Screenshot percakapan, struk transfer, atau bukti pembayaran · Maks {MAX_EVIDENCE_FILES} foto · 5MB per file
            </p>

            {/* Existing photos */}
            {keptExistingUrls.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Foto sebelumnya</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {keptExistingUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={url} alt={`Bukti ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-zinc-200" />
                      <button
                        type="button"
                        onClick={() => setKeptExistingUrls(prev => prev.filter(u => u !== url))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New photos */}
            {newFiles.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Foto baru</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {newFiles.map((item, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={item.preview} alt={`Baru ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-emerald-400" />
                      <button
                        type="button"
                        onClick={() => setNewFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-emerald-600/80 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">Baru</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalPhotos < MAX_EVIDENCE_FILES ? (
              <label className="group border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-zinc-400 hover:bg-zinc-50/50 transition-all cursor-pointer">
                <Upload className="w-6 h-6 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                <p className="text-xs font-bold text-zinc-500">
                  {totalPhotos === 0 ? 'Klik untuk upload foto bukti' : `Tambah foto (${totalPhotos}/${MAX_EVIDENCE_FILES})`}
                </p>
                <p className="text-[10px] text-zinc-400">JPG, PNG · maks 5MB per file</p>
                <input type="file" onChange={handleNewFiles} className="hidden" accept="image/*" multiple />
              </label>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[11px] text-zinc-500 font-medium">Batas maksimal {MAX_EVIDENCE_FILES} foto telah tercapai.</p>
              </div>
            )}
          </div>

          {/* ── INFORMASI TAMBAHAN ── */}
          <div className="space-y-5">
            <SectionTitle label="Informasi tambahan" />

            <div>
              <FieldLabel label="Ada korban lain yang kamu tahu?" optional />
              <div className="flex gap-2 mt-1">
                {[{ val: 'yes', label: 'Ya, ada korban lain' }, { val: 'no', label: 'Hanya saya' }].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, has_other_victims: f.has_other_victims === opt.val ? '' : opt.val as 'yes' | 'no' }))}
                    className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.has_other_victims === opt.val
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel label="Sudah lapor ke mana?" optional />
              <div className="grid grid-cols-2 gap-2 mt-1">
                {reportedToOptions.map(opt => {
                  const active = formData.reported_to.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleReportedTo(opt.value)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold border text-left transition-all ${
                        active
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => router.push('/dashboard/laporan')}
              className="sm:flex-1 py-3.5 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 bg-white hover:bg-zinc-50 transition-all uppercase tracking-widest"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="sm:flex-[2] py-3.5 bg-zinc-900 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 uppercase tracking-widest"
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress || 'Menyimpan...'}</>
                : 'Simpan & Kirim ke Review'
              }
            </button>
          </div>

          <p className="text-center text-[10px] text-zinc-400 font-medium uppercase tracking-widest -mt-4">
            Identitas pelapor tidak akan ditampilkan ke publik
          </p>

        </form>
      </div>
    </div>
  );
}