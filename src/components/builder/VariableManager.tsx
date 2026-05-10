import { useProjectStore } from '@/stores/projectStore';
import type { VariableType } from '@/types/builder';
import { Plus, Trash2, Variable, Hash, ToggleLeft, Image, List } from 'lucide-react';
import { useState } from 'react';

const TYPE_ICONS: Record<VariableType, React.ComponentType<{ className?: string }>> = {
  string: Variable, number: Hash, boolean: ToggleLeft, image: Image, list: List,
};
const TYPE_LABELS: Record<VariableType, string> = {
  string: 'Text', number: 'Number', boolean: 'True/False', image: 'Image URL', list: 'List',
};

export const VariableManager = () => {
  const variables = useProjectStore((s) => s.variables);
  const components = useProjectStore((s) => s.components);
  const addVariable = useProjectStore((s) => s.addVariable);
  const updateVariable = useProjectStore((s) => s.updateVariable);
  const removeVariable = useProjectStore((s) => s.removeVariable);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<VariableType>('string');
  const [newDefault, setNewDefault] = useState('');

  const getUsageCount = (varId: string) =>
    Object.values(components).filter((c) => Object.values(c.variableBindings || {}).includes(varId)).length;

  const handleAdd = () => {
    if (!newName.trim()) return;
    let dv: any = newDefault;
    if (newType === 'number') dv = Number(newDefault) || 0;
    if (newType === 'boolean') dv = newDefault === 'true';
    if (newType === 'list') dv = newDefault ? newDefault.split(',').map((s) => s.trim()) : [];
    addVariable({ name: newName.trim(), type: newType, defaultValue: dv, description: '' });
    setNewName(''); setNewDefault(''); setIsAdding(false);
  };

  return (
    <div className="flex flex-col p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-white/60">Variables</span>
        <button onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-medium text-violet-300 hover:bg-violet-500/20">
          <Plus className="h-3 w-3" /> New
        </button>
      </div>
      {isAdding && (
        <div className="mb-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-3 space-y-2">
          <input placeholder="Variable name..." value={newName} onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/20" autoFocus />
          <select value={newType} onChange={(e) => setNewType(e.target.value as VariableType)}
            className="w-full rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none">
            {(Object.entries(TYPE_LABELS) as [VariableType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input placeholder="Default value..." value={newDefault} onChange={(e) => setNewDefault(e.target.value)}
            className="w-full rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/20" />
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!newName.trim()}
              className="flex-1 rounded-lg bg-violet-600 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-40">Create</button>
            <button onClick={() => setIsAdding(false)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:bg-white/5">Cancel</button>
          </div>
        </div>
      )}
      {variables.length === 0 && !isAdding && (
        <div className="rounded-xl border border-dashed border-white/[0.06] p-6 text-center">
          <Variable className="mx-auto mb-2 h-5 w-5 text-white/15" />
          <p className="text-xs text-white/25">No variables yet</p>
          <p className="mt-1 text-[10px] text-white/15">Variables store data your app can use</p>
        </div>
      )}
      <div className="space-y-1.5">
        {variables.map((v) => {
          const Icon = TYPE_ICONS[v.type];
          const usage = getUsageCount(v.id);
          return (
            <div key={v.id} className="group rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5 hover:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Icon className="h-3.5 w-3.5 text-cyan-400/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <input value={v.name} onChange={(e) => updateVariable(v.id, { name: e.target.value })}
                    className="w-full bg-transparent text-xs font-medium text-white outline-none" />
                  <div className="text-[10px] text-white/30">{TYPE_LABELS[v.type]} · {usage} binding{usage !== 1 ? 's' : ''}</div>
                </div>
                <button onClick={() => removeVariable(v.id)}
                  className="rounded p-1 text-red-400/0 group-hover:text-red-400/40 hover:!text-red-400">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-white/25">Default:</span>
                <input value={String(v.defaultValue ?? '')}
                  onChange={(e) => { let val: any = e.target.value; if (v.type === 'number') val = Number(val) || 0; updateVariable(v.id, { defaultValue: val }); }}
                  className="flex-1 rounded border border-white/[0.04] bg-white/[0.02] px-2 py-1 text-[10px] text-white/60 outline-none font-mono" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
