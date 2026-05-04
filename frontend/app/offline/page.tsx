'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        
        {/* Icon */}
        <div className="bg-red-100 p-5 rounded-full mb-6">
          <WifiOff className="w-12 h-12 text-red-500" />
        </div>

        {/* Logo/Brand */}
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">
          KawalTransaksi
        </h1>

        {/* Pesan */}
        <p className="text-zinc-500 mb-2">
          Kamu sedang offline
        </p>
        <p className="text-sm text-zinc-400 mb-8">
          Periksa koneksi internet kamu dan coba lagi.
        </p>

        {/* Tombol retry */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>

      </div>
    </div>
  );
}