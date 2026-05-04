export default function CheckLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans animate-pulse">
      
      {/* Status bar skeleton */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <div className="h-3 w-32 bg-slate-300 rounded" />
          <div className="ml-auto h-3 w-20 bg-slate-200 rounded" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 space-y-4">

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-3 sm:p-5">
              <div className="h-8 w-12 bg-slate-200 rounded mb-2" />
              <div className="h-2 w-20 bg-slate-100 rounded" />
            </div>
          ))}
        </div>

        {/* Number card skeleton */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-px bg-slate-100" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2 w-16 bg-slate-100 rounded" />
                <div className="h-4 w-28 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Report list skeleton */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="h-3 w-24 bg-slate-200 rounded" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-4 py-4 border-b border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
            </div>
          ))}
        </div>

        {/* CTA skeleton */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900/10 px-4 py-4 space-y-2">
            <div className="h-4 w-40 bg-slate-300 rounded" />
            <div className="h-3 w-56 bg-slate-200 rounded" />
            <div className="h-9 w-full bg-slate-300 rounded-lg mt-3" />
          </div>
        </div>

      </div>
    </div>
  );
}