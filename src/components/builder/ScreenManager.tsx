import { useProjectStore } from '@/stores/projectStore';
import { Plus, Trash2, Copy, GripVertical, Home, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export const ScreenManager = () => {
  const screens = useProjectStore((s) => s.screens);
  const activeScreenId = useProjectStore((s) => s.activeScreenId);
  const components = useProjectStore((s) => s.components);
  const setActiveScreen = useProjectStore((s) => s.setActiveScreen);
  const addScreen = useProjectStore((s) => s.addScreen);
  const removeScreen = useProjectStore((s) => s.removeScreen);
  const updateScreen = useProjectStore((s) => s.updateScreen);
  const duplicateScreen = useProjectStore((s) => s.duplicateScreen);

  const [editingId, setEditingId] = useState<string | null>(null);

  const getComponentCount = (screenId: string) =>
    Object.values(components).filter((c) => c.screenId === screenId).length;

  return (
    <div className="flex flex-col p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-white/60">Screens</span>
        <button
          onClick={() => addScreen()}
          className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-medium text-violet-300 transition hover:bg-violet-500/20"
        >
          <Plus className="h-3 w-3" />
          New Screen
        </button>
      </div>

      <div className="space-y-1.5">
        {screens.sort((a, b) => a.order - b.order).map((screen, index) => (
          <div
            key={screen.id}
            onClick={() => setActiveScreen(screen.id)}
            className={`group relative flex items-center gap-2 rounded-xl border p-2.5 transition cursor-pointer ${
              activeScreenId === screen.id
                ? 'border-violet-500/30 bg-violet-500/[0.08]'
                : 'border-white/[0.04] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
            }`}
          >
            {/* Drag handle */}
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-white/15 group-hover:text-white/30" />

            {/* Screen thumbnail */}
            <div
              className="flex h-14 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10"
              style={{ backgroundColor: screen.backgroundColor || '#0C0A1A' }}
            >
              <div className="text-[6px] text-white/30">{getComponentCount(screen.id)}</div>
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0">
              {editingId === screen.id ? (
                <input
                  className="w-full rounded bg-white/10 px-1.5 py-0.5 text-xs text-white outline-none ring-1 ring-violet-500"
                  value={screen.name}
                  onChange={(e) => updateScreen(screen.id, { name: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div
                  className="flex items-center gap-1.5 text-xs font-medium text-white/80"
                  onDoubleClick={(e) => { e.stopPropagation(); setEditingId(screen.id); }}
                >
                  {index === 0 && <Home className="h-3 w-3 text-violet-400" />}
                  <span className="truncate">{screen.name}</span>
                </div>
              )}
              <div className="mt-0.5 text-[10px] text-white/30">
                {getComponentCount(screen.id)} component{getComponentCount(screen.id) !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); duplicateScreen(screen.id); }}
                className="rounded p-1 text-white/30 hover:bg-white/5 hover:text-white/60"
                title="Duplicate"
              >
                <Copy className="h-3 w-3" />
              </button>
              {screens.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeScreen(screen.id); }}
                  className="rounded p-1 text-red-400/40 hover:bg-red-500/10 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Screen flow */}
      {screens.length > 1 && (
        <div className="mt-4 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Flow</div>
          <div className="flex flex-wrap items-center gap-1">
            {screens.sort((a, b) => a.order - b.order).map((s, i) => (
              <div key={s.id} className="flex items-center gap-1">
                <span className={`rounded px-2 py-0.5 text-[10px] ${
                  activeScreenId === s.id ? 'bg-violet-500/20 text-violet-300' : 'bg-white/[0.04] text-white/40'
                }`}>
                  {s.name}
                </span>
                {i < screens.length - 1 && <ChevronRight className="h-3 w-3 text-white/15" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
