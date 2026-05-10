import { useProjectStore } from '@/stores/projectStore';
import { Eye, EyeOff, Lock, Unlock, Component as ComponentIcon, MousePointerClick } from 'lucide-react';
import React from 'react';

export const LayersPanel = () => {
  const currentScreenId = useProjectStore((s) => s.currentScreenId);
  const components = useProjectStore((s) => s.components);
  const selectedComponentId = useProjectStore((s) => s.selectedComponentId);
  const selectComponent = useProjectStore((s) => s.selectComponent);
  const updateComponent = useProjectStore((s) => s.updateComponent);
  const hoverComponent = useProjectStore((s) => s.hoverComponent);

  if (!currentScreenId) return null;

  // Get components for current screen, sorted by zIndex descending (top layers first)
  const layerComps = Object.values(components)
    .filter((c) => c.screenId === currentScreenId)
    .sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] p-4">
        <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Layers</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {layerComps.length === 0 ? (
          <div className="p-4 text-center text-xs text-white/40">No components on this screen</div>
        ) : (
          <div className="flex flex-col gap-1">
            {layerComps.map((comp) => {
              const isSelected = selectedComponentId === comp.id;
              return (
                <div
                  key={comp.id}
                  className={`group flex items-center justify-between rounded px-2 py-1.5 text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-violet-500/20 text-white' : 'text-white/60 hover:bg-white/[0.04] hover:text-white/90'
                  }`}
                  onClick={() => selectComponent(comp.id)}
                  onMouseEnter={() => hoverComponent(comp.id)}
                  onMouseLeave={() => hoverComponent(null)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ComponentIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
                    <span className="truncate">{comp.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" style={{ opacity: isSelected || !comp.visible || comp.locked ? 1 : undefined }}>
                    <button
                      className="p-1 hover:text-white text-white/40"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateComponent(comp.id, { locked: !comp.locked });
                      }}
                    >
                      {comp.locked ? <Lock className="h-3 w-3 text-red-400" /> : <Unlock className="h-3 w-3" />}
                    </button>
                    <button
                      className="p-1 hover:text-white text-white/40"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateComponent(comp.id, { visible: !comp.visible });
                      }}
                    >
                      {comp.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-white/20" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
