import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Zap, ShieldAlert, Sparkles } from 'lucide-react';

export default function CompatibilityHUD({ compatibilityReport: reportProp, report, loading }) {
  const compatibilityReport = reportProp || report;
  if (!compatibilityReport) return null;

  const isCompatible = compatibilityReport.compatible !== undefined ? compatibilityReport.compatible : compatibilityReport.isCompatible;
  const isCompleteBuild = compatibilityReport.completeBuild !== undefined ? compatibilityReport.completeBuild : compatibilityReport.isCompleteBuild;
  const {
    hasWarnings,
    totalEstimatedWattage,
    recommendedPsuWattage,
    selectedPsuWattage,
    wattageUtilizationPercent,
    issues
  } = compatibilityReport;

  // Determine overall status
  let statusBadge = {
    color: 'emerald',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    icon: CheckCircle2,
    title: '100% Hardware Compatible',
    subtitle: isCompleteBuild ? 'All 8 core slots filled with zero conflicts' : 'Selected components are mutually compatible'
  };

  if (!isCompatible) {
    statusBadge = {
      color: 'rose',
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/40',
      text: 'text-rose-400',
      icon: XCircle,
      title: 'Incompatibility Conflict Detected',
      subtitle: 'Review error alerts below to fix matching sockets or form factor'
    };
  } else if (hasWarnings) {
    statusBadge = {
      color: 'amber',
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      icon: AlertTriangle,
      title: 'Hardware Warnings Noted',
      subtitle: 'Build will function, but check PSU safety headroom'
    };
  } else if (!isCompleteBuild) {
    statusBadge = {
      color: 'cyan',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-400',
      icon: Sparkles,
      title: 'Configuration in Progress',
      subtitle: 'Selected parts are compatible. Keep picking remaining components.'
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className={`rounded-2xl border ${statusBadge.border} ${statusBadge.bg} backdrop-blur-xl p-5 shadow-xl transition-all duration-300`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Status Badge */}
        <div className="flex items-start sm:items-center gap-4">
          <div className={`p-3 rounded-2xl bg-dark-900 border ${statusBadge.border} ${statusBadge.text} shadow-inner`}>
            <StatusIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className={`text-base font-bold ${statusBadge.text} tracking-tight`}>
                {statusBadge.title}
              </h3>
              {loading && (
                <span className="text-xs text-slate-400 animate-pulse font-mono">(calculating...)</span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{statusBadge.subtitle}</p>
          </div>
        </div>

        {/* Wattage & Power Gauge */}
        <div className="bg-dark-900/80 rounded-xl p-3.5 border border-slate-800 flex-1 max-w-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Power Draw Estimation
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">Est:</span>
              <span className="text-white font-bold">{totalEstimatedWattage}W</span>
              {selectedPsuWattage && (
                <>
                  <span className="text-slate-500">/</span>
                  <span className="text-cyan-400 font-bold">{selectedPsuWattage}W PSU</span>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                wattageUtilizationPercent > 100
                  ? 'bg-rose-500'
                  : wattageUtilizationPercent > 85
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, wattageUtilizationPercent || (totalEstimatedWattage / 850 * 100))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
            <span>Rec. Min PSU: <strong className="text-slate-200">{recommendedPsuWattage}W</strong></span>
            <span>Load: <strong className={wattageUtilizationPercent > 100 ? 'text-rose-400' : 'text-slate-200'}>
              {selectedPsuWattage ? `${wattageUtilizationPercent}%` : 'Select PSU'}
            </strong></span>
          </div>
        </div>
      </div>

      {/* Issues list (if any errors or warnings) */}
      {issues && issues.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                issue.severity === 'ERROR'
                  ? 'bg-rose-950/50 border-rose-800/60 text-rose-200'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              }`}
            >
              {issue.severity === 'ERROR' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold tracking-wide">{issue.title}</div>
                <div className="mt-0.5 opacity-90">{issue.message}</div>
                {issue.suggestion && (
                  <div className="mt-1.5 inline-block px-2.5 py-1 rounded bg-black/30 border border-white/10 font-mono text-[11px] text-cyan-300">
                    Suggestion: {issue.suggestion}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
