import { useProjectStore } from '@/stores/projectStore';
import { ACTION_DEFINITIONS, type TriggerType } from '@/types/builder';
import { Zap, GitBranch, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BlueprintEditor } from './BlueprintEditor';

const TRIGGER_LABELS: Record<TriggerType,string> = {
  on_click:'On Tap', on_double_click:'On Double Tap', on_long_press:'On Long Press',
  on_swipe_left:'On Swipe Left', on_swipe_right:'On Swipe Right',
  on_change:'On Change', on_load:'On Load',
};

export const LogicBuilder = () => {
  const selectedId   = useProjectStore(s=>s.selectedComponentId);
  const components   = useProjectStore(s=>s.components);
  const removeLogic  = useProjectStore(s=>s.removeLogic);
  const comp = selectedId ? components[selectedId] : null;
  const [open,setOpen] = useState(false);

  if(!comp) return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-3 rounded-2xl bg-white/[0.03] p-4"><Zap className="h-6 w-6 text-white/20"/></div>
      <p className="text-sm font-medium text-white/40">No selection</p>
      <p className="mt-1 text-xs text-white/20">Select a component to add logic</p>
    </div>
  );

  return (
    <>
      {open && <BlueprintEditor onClose={()=>setOpen(false)}/>}

      <div className="flex flex-col p-3 gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white/50">Logic · </span>
            <span className="text-xs font-semibold text-violet-300">{comp.name}</span>
          </div>
          <button onClick={()=>setOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-900/40">
            <GitBranch className="h-3.5 w-3.5"/>
            Open Blueprint
          </button>
        </div>

        {/* Summary of saved logic */}
        {comp.logic.length===0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.07] p-8 text-center">
            <GitBranch className="mx-auto mb-2 h-7 w-7 text-violet-400/25"/>
            <p className="text-xs text-white/25">No logic yet</p>
            <p className="mt-1 text-[10px] text-white/15">Open the Blueprint editor to build node graphs</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Saved Nodes</p>
            {comp.logic.map((l,i)=>{
              const actionDef = ACTION_DEFINITIONS.find(a=>a.type===l.action);
              return (
                <div key={l.id} className="group flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-white/10 transition-colors">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-[9px] font-bold text-violet-400">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-medium text-amber-300">{TRIGGER_LABELS[l.trigger]||l.trigger}</span>
                    <span className="mx-1.5 text-[10px] text-white/20">→</span>
                    <span className="text-[10px] font-medium text-cyan-300">{actionDef?.label||l.action}</span>
                  </div>
                  <button onClick={()=>removeLogic(comp.id,l.id)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all">
                    <Trash2 className="h-3 w-3"/>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
