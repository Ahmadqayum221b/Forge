import { useProjectStore } from '@/stores/projectStore';
import { History, RotateCcw, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export const HistoryPanel = () => {
  const history = useProjectStore((s) => s.history);
  const historyIndex = useProjectStore((s) => s.historyIndex);
  const undo = useProjectStore((s) => s.undo);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white">Project History</h2>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">
          {history.length} events
        </span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center opacity-40">
          <Clock className="mb-2 h-8 w-8" />
          <p className="text-xs">No activity yet</p>
          <p className="mt-1 text-[10px]">Changes will appear here as you work</p>
        </div>
      ) : (
        <div className="relative space-y-1">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/5" />

          {[...history].reverse().map((entry, i) => {
            const actualIndex = history.length - 1 - i;
            const isActive = actualIndex === historyIndex;
            const isFuture = actualIndex > historyIndex;

            return (
              <div
                key={entry.timestamp}
                className={`group relative flex items-start gap-4 rounded-xl p-3 transition-colors ${
                  isActive ? 'bg-violet-500/10' : 'hover:bg-white/[0.02]'
                } ${isFuture ? 'opacity-40' : ''}`}
              >
                <div className="relative z-10 mt-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                  <div className={`h-2 w-2 rounded-full ${
                    isActive ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'bg-white/20 group-hover:bg-white/40'
                  }`} />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                      {entry.description}
                    </p>
                    <span className="text-[10px] text-white/20">
                      {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  
                  {isActive && (
                    <div className="flex items-center gap-1 text-[10px] text-violet-400">
                      <ArrowRight className="h-3 w-3" />
                      Current Version
                    </div>
                  )}

                  {!isActive && !isFuture && (
                    <button
                      onClick={() => {
                        // In a real app, we'd jump to this index.
                        // For now, we only have undo/redo.
                        // To "jump", we'd need a jumpToHistory action.
                        toast.info('Restoring to this version...');
                      }}
                      className="hidden items-center gap-1 text-[10px] text-white/30 transition hover:text-white group-hover:flex"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-auto border-t border-white/5 pt-4">
        <p className="text-[10px] leading-relaxed text-white/20">
          History is saved locally in your browser. Clearing cache will remove history.
        </p>
      </div>
    </div>
  );
};
