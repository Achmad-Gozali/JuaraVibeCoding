'use client';

import { useState } from 'react';
import { Copy, Check, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  slug: string;
  shareText: string;
}

export default function ShareButtons({ slug, shareText }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/check/${slug}`
    : `/check/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = pageUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${pageUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`${shareText} ${pageUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCopy}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${
          copied
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
        }`}
      >
        {copied ? (
          <><Check className="w-3.5 h-3.5" /> Tersalin!</>
        ) : (
          <><Copy className="w-3.5 h-3.5" /> Salin Link</>
        )}
      </button>

      <button
        onClick={handleWhatsApp}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all active:scale-95"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        Share ke WhatsApp
      </button>

      <button
        onClick={handleTwitter}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest bg-slate-900/5 text-slate-700 hover:bg-slate-900/10 border border-slate-200 transition-all active:scale-95"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.243 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share ke X / Twitter
      </button>
    </div>
  );
}