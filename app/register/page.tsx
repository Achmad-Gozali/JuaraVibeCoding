import AuthForm from '@/components/AuthForm';
import { ShieldCheck, Eye, Lock, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">

      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-14 py-16 bg-gradient-to-br from-zinc-50 to-white border-r border-zinc-100 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60" />

        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] mb-4">
              Satu Akun untuk<br />Melindungi<br />
              <span className="text-red-500">Jutaan Orang.</span>
            </h2>
            <p className="text-zinc-500 text-base leading-relaxed max-w-sm">
              Buat akun KawalTransaksi dan mulai berkontribusi melindungi sesama pengguna internet Indonesia dari penipuan.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: ShieldCheck, title: 'Gratis Selamanya', desc: 'Tidak ada biaya tersembunyi atau langganan.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Eye, title: 'Laporan Kamu Berarti', desc: 'Setiap laporan mencegah orang lain jadi korban.', color: 'bg-blue-50 text-blue-600' },
              { icon: Lock, title: 'Identitas Terlindungi', desc: 'Data pelapor tidak pernah ditampilkan publik.', color: 'bg-purple-50 text-purple-600' },
              { icon: HeartHandshake, title: 'Komunitas Nyata', desc: 'Ribuan pengguna aktif menjaga database.', color: 'bg-red-50 text-red-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{item.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <AuthForm type="register" />
        </div>
      </div>

    </div>
  );
}