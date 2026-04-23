import { Brain, ShieldCheck, ShieldAlert, ShieldX, Info } from 'lucide-react';
import type { AnalysisResult, TextAnalysis } from '../report/types';

export function ImageAnalysisResult({ analysis }: { analysis: AnalysisResult }) {
  const isValid = analysis.is_likely_authentic && analysis.relevance_score >= 90;
  const isPartial = !isValid && analysis.authenticity_score >= 70;

  const config = isValid
    ? {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        icon: ShieldCheck,
        iconColor: 'text-emerald-500',
        label: 'Bukti Terverifikasi',
      }
    : isPartial
    ? {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: ShieldAlert,
        iconColor: 'text-amber-500',
        label: 'Bukti Kurang Kuat',
      }
    : {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: ShieldX,
        iconColor: 'text-red-500',
        label: 'Bukti Tidak Valid',
      };

  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.bg} ${config.border} mt-3 overflow-hidden`}>
      <div className={`px-4 py-3 flex flex-wrap items-center gap-2 border-b ${config.border}`}>
        <Icon className={`w-4 h-4 ${config.iconColor} shrink-0`} />
        <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
        <span className={`ml-auto text-xs ${config.text} shrink-0`}>
          Keaslian <b>{analysis.authenticity_score}%</b> · Relevansi{' '}
          <b>{analysis.relevance_score}%</b>
        </span>
      </div>
      <div className="px-4 py-3">
        <p className={`text-sm leading-relaxed ${config.text}`}>{analysis.summary}</p>
      </div>
    </div>
  );
}

export function TextAnalysisResult({ analysis }: { analysis: TextAnalysis }) {
  const isHigh = analysis.risk_level === 'high';
  const isMedium = analysis.risk_level === 'medium';

  const config = isHigh
    ? {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        badge: 'bg-red-100 text-red-700 border-red-200',
        label: 'Risiko Tinggi',
        score: 'text-red-600',
      }
    : isMedium
    ? {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        label: 'Risiko Sedang',
        score: 'text-amber-600',
      }
    : {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-700',
        badge: 'bg-slate-100 text-slate-600 border-slate-200',
        label: 'Risiko Rendah',
        score: 'text-slate-500',
      };

  return (
    <div className={`rounded-xl border ${config.bg} ${config.border} mt-4 overflow-hidden`}>
      <div className={`px-4 py-3 flex flex-wrap items-center gap-2 border-b ${config.border}`}>
        <Brain className={`w-4 h-4 ${config.score} shrink-0`} />
        <span className={`text-sm font-semibold ${config.text}`}>Hasil Analisis AI</span>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${config.badge}`}>
            {config.label}
          </span>
          <span className={`text-sm font-bold ${config.score}`}>
            {analysis.chronology_score}/100
          </span>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        <p className={`text-sm leading-relaxed ${config.text}`}>{analysis.analysis}</p>
        {analysis.suggested_category && (
          <div className={`flex items-start gap-2 pt-2 border-t ${config.border}`}>
            <Info className={`w-3.5 h-3.5 ${config.score} shrink-0 mt-0.5`} />
            <p className={`text-sm ${config.text}`}>
              Kategori disarankan: <b>{analysis.suggested_category}</b>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}