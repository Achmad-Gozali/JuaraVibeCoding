'use client';

import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookie_notice_accepted');
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_notice_accepted', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 text-white shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-6 sm:py-5 max-w-screen-2xl mx-auto w-full">
        <div className="flex items-start sm:items-center gap-4 flex-1">
          <Cookie className="w-7 h-7 shrink-0 text-red-400 mt-0.5 sm:mt-0" />
          <p className="text-base text-zinc-200 leading-relaxed">
            Website ini menggunakan cookie untuk menyimpan sesi login dan analitik penggunaan.
            Dengan melanjutkan, kamu menyetujui{' '}
            <a
              href="/kebijakan-privasi"
              className="text-red-400 underline underline-offset-2 hover:text-red-300 font-medium"
            >
              kebijakan privasi
            </a>{' '}
            kami.
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="w-full sm:w-auto shrink-0 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-base font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}