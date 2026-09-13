interface AppFooterProps {
  isDark: boolean;
  onOpenOptimizationTips: () => void;
  onOpenVerification: () => void;
}

export function AppFooter({ isDark, onOpenOptimizationTips, onOpenVerification }: AppFooterProps) {
  return (
    <footer
      id="appFooter"
      className={`border-t py-6 text-xs transition-colors mt-8 ${
        isDark
          ? 'border-slate-800/80 bg-slate-950/60 text-slate-500'
          : 'border-slate-200 bg-white/80 text-slate-500'
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:left">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>SpeedPulse Precision Benchmark • Edge Wire Telemetry</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            id="footerOptimizationTipsBtn"
            onClick={onOpenOptimizationTips}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
          >
            Optimization Tips
          </button>
          <button
            id="footerVerifySocketBtn"
            onClick={onOpenVerification}
            className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
          >
            Verify Socket
          </button>
        </div>
      </div>
    </footer>
  );
}
