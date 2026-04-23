'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { Card, SectionTitle } from '../ui/primitives';
import { TextAnalysisResult } from '../ui/AnalysisResults';
import type { TextAnalysis } from '../report/types';

interface Step2Props {
  chronology: string;
  textAnalysis: TextAnalysis | null;
  isAnalyzingText: boolean;
  onChronologyChange: (value: string) => void;
  onAnalyzeText: () => void;
}

export function Step2Kronologi({
  chronology,
  textAnalysis,
  isAnalyzingText,
  onChronologyChange,
  onAnalyzeText,
}: Step2Props) {
  const chronologyProgress = Math.min((chronology.length / 150) * 100, 100);

  return (
    <Card>
      <div className="p-5">
        <div className="flex items-start justify-between mb-5 gap-3">
          <SectionTitle
            title="Kronologi Kejadian"
            subtitle="Ceritakan dengan detail agar laporan cepat diverifikasi"
          />
          <button
            type="button"
            onClick={onAnalyzeText}
            disabled={isAnalyzingText || chronology.length < 20}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-30 transition-all shrink-0"
          >
            {isAnalyzingText ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Analisis AI
          </button>
        </div>

        <textarea
          rows={10}
          value={chronology}
          onChange={(e) => onChronologyChange(e.target.value)}
          placeholder="Ceritakan bagaimana penipuan terjadi. Sertakan nominal kerugian, tanggal kejadian, cara komunikasi, dan detail identitas pelaku yang kamu ketahui..."
          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-800 placeholder:text-slate-300 leading-relaxed focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 outline-none transition-all resize-none"
        />

        <div className="mt-4 space-y-2">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                chronologyProgress >= 100
                  ? 'bg-emerald-500'
                  : chronologyProgress > 50
                  ? 'bg-amber-400'
                  : 'bg-slate-300'
              }`}
              style={{ width: `${chronologyProgress}%` }}
            />
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-xs text-slate-400 leading-relaxed">
              {chronology.length < 150
                ? 'Tambahkan lebih banyak detail untuk memperkuat laporan'
                : '✓ Kronologi sudah cukup lengkap'}
            </span>
            <span
              className={`text-xs font-semibold shrink-0 ${
                chronology.length >= 150 ? 'text-emerald-500' : 'text-slate-400'
              }`}
            >
              {chronology.length} / 150
            </span>
          </div>
        </div>

        {textAnalysis && <TextAnalysisResult analysis={textAnalysis} />}
      </div>
    </Card>
  );
}