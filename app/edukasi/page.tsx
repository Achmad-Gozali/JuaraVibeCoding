// app/edukasi/page.tsx
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  CreditCard,
  Gift,
  PhoneCall,
  Globe,
  MessageSquare,
  Landmark,
  TrendingUp,
  UserX,
  PlusCircle
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'edukasi modus penipuan - kawaltransaksi',
  description:
    'pelajari berbagai modus penipuan online di indonesia dan cara melindungi diri dari scam, phishing, investasi bodong, dan modus lainnya.',
};

const modusData = [
  {
    slug: 'jual-beli-online',
    icon: CreditCard,
    iconBg: 'bg-blue-100',
    headerBg: 'bg-blue-50',
    title: 'penipuan jual beli online',
    summary:
      'modus paling umum di indonesia. penipu menjual barang di marketplace atau media sosial dengan harga murah, setelah korban transfer uang, barang tidak dikirim.',
    redFlags: [
      'harga jauh di bawah pasaran',
      'minta transfer ke rekening pribadi, bukan lewat marketplace',
      'menolak cod atau rekening bersama',
      'akun baru dengan sedikit review',
      'memaksa korban untuk cepat transfer',
    ],
    tips: [
      'selalu gunakan fitur pembayaran resmi marketplace',
      'cek reputasi dan review penjual',
      'gunakan rekening bersama untuk transaksi di luar marketplace',
      'jangan tergiur harga yang terlalu murah',
    ],
    example:
      'penipu posting iphone 15 pro max seharga rp 5 juta di facebook. setelah korban transfer, penipu blokir nomor dan menghilang.',
  },
  {
    slug: 'investasi-bodong',
    icon: TrendingUp,
    iconBg: 'bg-red-100',
    headerBg: 'bg-red-50',
    title: 'investasi bodong',
    summary:
      'menjanjikan keuntungan besar dalam waktu singkat. biasanya menggunakan skema ponzi — membayar investor lama dari uang investor baru sampai akhirnya kolaps.',
    redFlags: [
      'menjanjikan return tetap 10-50% per bulan',
      'tidak terdaftar di ojk',
      'tekanan untuk mengajak orang lain bergabung',
      'tidak jelas produk investasinya apa',
      'testimoni palsu dari "investor sukses"',
    ],
    tips: [
      'cek legalitas di website ojk (ojk.go.id)',
      'ingat: high return = high risk, kalau terlalu bagus pasti palsu',
      'jangan invest uang yang tidak siap hilang',
      'waspadai skema mlm berkedok investasi',
    ],
    example:
      'aplikasi "tradingpro" menjanjikan profit 30% per bulan dari trading forex. setelah 3 bulan dan ribuan korban, aplikasi tiba-tiba tidak bisa diakses.',
  },
  {
    slug: 'phishing-soceng',
    icon: Globe,
    iconBg: 'bg-purple-100',
    headerBg: 'bg-purple-50',
    title: 'phishing & social engineering',
    summary:
      'penipu berpura-pura menjadi pihak bank, e-commerce, atau instansi resmi untuk mencuri data pribadi seperti password, pin, otp, atau nomor kartu kredit.',
    redFlags: [
      'sms/email berisi link mencurigakan',
      'mengaku dari bank dan meminta otp',
      'website palsu yang mirip website resmi',
      'meminta data pribadi lewat telepon',
      'ancaman akun akan diblokir jika tidak segera bertindak',
    ],
    tips: [
      'bank tidak pernah meminta otp, pin, atau password',
      'selalu cek url website — pastikan domain resmi',
      'jangan klik link dari sms/email yang tidak dikenal',
      'aktifkan 2fa di semua akun penting',
    ],
    example:
      'korban menerima sms "bca: akun anda terblokir, klik link berikut untuk verifikasi". link mengarah ke website palsu yang mencuri username dan password.',
  },
  {
    slug: 'undian-palsu',
    icon: Gift,
    iconBg: 'bg-amber-100',
    headerBg: 'bg-amber-50',
    title: 'undian & hadiah palsu',
    summary:
      'korban diberitahu memenangkan undian atau hadiah besar, lalu diminta membayar "pajak" atau "biaya admin" terlebih dahulu untuk menerima hadiah.',
    redFlags: [
      'anda tidak pernah mengikuti undian tersebut',
      'diminta transfer uang untuk "pajak hadiah"',
      'menggunakan nama perusahaan besar (telkomsel, shopee, dll)',
      'menghubungi lewat whatsapp bukan channel resmi',
      'memberikan tekanan waktu untuk segera bayar',
    ],
    tips: [
      'tidak ada undian yang meminta korban bayar duluan',
      'verifikasi ke channel resmi perusahaan yang disebutkan',
      'blokir dan laporkan nomor pengirim',
      'jangan bagikan data pribadi ke nomor yang tidak dikenal',
    ],
    example:
      'pesan whatsapp: "selamat! anda memenangkan rp 50 juta dari shopee! transfer rp 500.000 untuk biaya pajak ke rekening berikut."',
  },
  {
    slug: 'pinjaman-online-ilegal',
    icon: Landmark,
    iconBg: 'bg-emerald-100',
    headerBg: 'bg-emerald-50',
    title: 'pinjaman online ilegal',
    summary:
      'aplikasi pinjaman yang tidak terdaftar di ojk. memberikan pinjaman dengan bunga sangat tinggi, lalu melakukan intimidasi dan teror ke peminjam dan kontaknya.',
    redFlags: [
      'tidak terdaftar di ojk',
      'proses pencairan sangat cepat tanpa verifikasi',
      'bunga harian sangat tinggi (1-2% per hari)',
      'mengakses semua kontak di hp peminjam',
      'melakukan teror dan ancaman via telepon',
    ],
    tips: [
      'cek daftar pinjol legal di website ojk',
      'baca syarat dan ketentuan sebelum meminjam',
      'jangan berikan akses kontak dan galeri ke aplikasi',
      'laporkan ke ojk jika mengalami intimidasi',
    ],
    example:
      'aplikasi "danacepat" memberikan pinjaman rp 1 juta tapi yang diterima hanya rp 700.000. dalam 7 hari harus bayar rp 1.400.000. jika telat, semua kontak diteror.',
  },
  {
    slug: 'penipuan-telepon',
    icon: PhoneCall,
    iconBg: 'bg-orange-100',
    headerBg: 'bg-orange-50',
    title: 'penipuan via telepon',
    summary:
      'penipu menelepon mengaku sebagai polisi, jaksa, atau petugas bank. mengklaim korban terlibat kasus hukum atau punya tunggakan, lalu meminta transfer uang.',
    redFlags: [
      'mengaku dari kepolisian atau kejaksaan',
      'menyebut korban terlibat kasus pencucian uang',
      'meminta transfer ke rekening pribadi',
      'memberikan tekanan dan ancaman',
      'melarang korban menghubungi pihak lain',
    ],
    tips: [
      'polisi dan jaksa tidak pernah meminta uang lewat telepon',
      'tutup telepon dan verifikasi ke kantor polisi terdekat',
      'jangan panik — penipu memanfaatkan rasa takut korban',
      'catat nomor penelepon dan laporkan',
    ],
    example:
      'penelepon mengaku jaksa dan mengatakan korban terlibat kasus narkoba. diminta transfer rp 25 juta untuk "biaya penghentian penyidikan".',
  },
  {
    slug: 'love-scam',
    icon: UserX,
    iconBg: 'bg-pink-100',
    headerBg: 'bg-pink-50',
    title: 'romance scam (love scam)',
    summary:
      'penipu membangun hubungan romantis online dengan korban selama berminggu-minggu, lalu mulai meminta uang dengan berbagai alasan darurat.',
    redFlags: [
      'kenalan di dating app atau media sosial',
      'profil terlalu sempurna (foto model, karir sukses)',
      'selalu menolak video call',
      'mulai minta uang setelah hubungan terasa dekat',
      'alasan darurat: sakit, kecelakaan, bisnis rugi',
    ],
    tips: [
      'jangan pernah kirim uang ke orang yang belum pernah ditemui langsung',
      'reverse image search foto profil mereka',
      'waspadai hubungan online yang berkembang terlalu cepat',
      'ceritakan ke teman/keluarga untuk perspektif objektif',
    ],
    example:
      'korban berkenalan dengan "dokter dari london" di instagram. setelah 2 bulan chat setiap hari, dia minta rp 15 juta untuk "biaya customs paket hadiah dari luar negeri".',
  },
  {
    slug: 'modus-kurir',
    icon: MessageSquare,
    iconBg: 'bg-teal-100',
    headerBg: 'bg-teal-50',
    title: 'modus file apk / kurir paket',
    summary:
      'penipu mengirim file apk berbahaya lewat whatsapp yang disamarkan sebagai foto paket, undangan pernikahan, atau surat tilang. jika di-install, malware mencuri data perbankan.',
    redFlags: [
      'pesan dari nomor tidak dikenal',
      'file berekstensi .apk (bukan .jpg atau .pdf)',
      'mengaku kurir dan meminta "konfirmasi paket"',
      'undangan pernikahan digital dari orang tidak dikenal',
      'surat tilang elektronik palsu',
    ],
    tips: [
      'jangan pernah install file apk dari whatsapp',
      'cek ekstensi file — foto asli berakhiran .jpg/.png',
      'matikan "install dari sumber tidak dikenal" di hp',
      'jika sudah terlanjur install, segera factory reset hp',
    ],
    example:
      'pesan wa: "paket anda sudah sampai, cek resi di sini" disertai file "resi_j&t.apk". jika di-install, saldo m-banking korban terkuras.',
  },
];

export default function EdukasiPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200">
      
      {/* header: clean & simple */}
      <div className="bg-zinc-100/50 pt-20 pb-28 px-4 border-b border-zinc-200/50">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-4 uppercase leading-none">
            kenali modus <br className="hidden sm:block" /> penipuan
          </h1>
          <p className="text-zinc-500 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed px-2">
            pelajari berbagai modus penipuan yang marak di indonesia dan cara
            melindungi diri anda serta keluarga.
          </p>
        </div>
      </div>

      {/* stats section */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'modus terdokumentasi', value: `${modusData.length}+` },
            { label: 'korban per tahun (est.)', value: '300k+' },
            { label: 'kerugian nasional', value: 'rp 18t+' },
            { label: 'kasus dilaporkan', value: '180k+' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-zinc-200 rounded-2xl p-6 text-center shadow-xl shadow-zinc-200/20 hover:border-zinc-300 transition-colors"
            >
              <p className="text-2xl sm:text-3xl font-black text-zinc-900">
                {stat.value}
              </p>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* cards list */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="space-y-10">
          {modusData.map((modus, i) => {
            const Icon = modus.icon;
            return (
              <div
                key={modus.slug}
                id={modus.slug}
                className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-lg shadow-zinc-200/30 hover:shadow-xl hover:border-zinc-300 transition-all border-l-[6px] border-l-zinc-900 group"
              >
                <div className={`${modus.headerBg} p-8 border-b border-zinc-100`}>
                  <div className="flex items-start gap-6">
                    <div className={`w-14 h-14 ${modus.iconBg} rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7 text-zinc-900" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                          #{String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tighter uppercase leading-tight">
                        {modus.title}
                      </h2>
                      <p className="text-sm sm:text-base text-zinc-600 font-medium leading-relaxed mt-2.5 max-w-2xl">
                        {modus.summary}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">
                        tanda-tanda bahaya
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {modus.redFlags.map((flag, j) => (
                        <div key={j} className="flex items-start gap-3.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                          <p className="text-sm text-zinc-600 font-bold uppercase tracking-tight leading-relaxed">
                            {flag}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <ShieldAlert className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">
                        cara melindungi diri
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {modus.tips.map((tip, j) => (
                        <div key={j} className="flex items-start gap-3.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                          <p className="text-sm text-zinc-600 font-bold uppercase tracking-tight leading-relaxed">
                            {tip}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 shadow-inner">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                      contoh kasus
                    </p>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed italic">
                      &quot;{modus.example}&quot;
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* footer cta */}
      <div className="bg-zinc-900 py-20 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-4 uppercase leading-none">
            sudah jadi korban?
          </h2>
          <p className="text-zinc-400 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
            laporkan nomor penipu ke database kami untuk membantu melindungi
            orang lain dari modus yang sama. identitas anda aman 100%.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/report"
              className="px-10 py-4 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-500 transition-all uppercase tracking-[0.2em] shadow-lg active:scale-95"
            >
              buat laporan
            </Link>
            <Link
              href="/"
              className="px-10 py-4 bg-zinc-800 text-zinc-300 font-black text-xs rounded-xl border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all uppercase tracking-[0.2em] active:scale-95"
            >
              cek nomor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}