import { useProjectStore } from '@/stores/projectStore';
import { Plus, Trash2, Table2, PlusCircle, X } from 'lucide-react';
import { useState } from 'react';
import { nanoid } from 'nanoid';
import type { DatabaseColumn } from '@/types/builder';

export const DatabasePanel = () => {
  const database = useProjectStore((s) => s.database);
  const addTable = useProjectStore((s) => s.addTable);
  const removeTable = useProjectStore((s) => s.removeTable);
  const updateTable = useProjectStore((s) => s.updateTable);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const activeTable = database.find((t) => t.id === activeTableId);

  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    addTable(newTableName.trim());
    setNewTableName(''); setShowAdd(false);
  };

  const addColumn = (tableId: string) => {
    const table = database.find((t) => t.id === tableId);
    if (!table) return;
    const col: DatabaseColumn = { id: nanoid(6), name: `column_${table.columns.length}`, type: 'text' };
    updateTable(tableId, { columns: [...table.columns, col] });
  };

  const addRow = (tableId: string) => {
    const table = database.find((t) => t.id === tableId);
    if (!table) return;
    const row: Record<string, any> = {};
    table.columns.forEach((c) => { row[c.id] = ''; });
    updateTable(tableId, { rows: [...table.rows, row] });
  };

  return (
    <div className="flex flex-col p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-white/60">Database</span>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-medium text-violet-300 hover:bg-violet-500/20">
          <Plus className="h-3 w-3" /> New Table
        </button>
      </div>

      {showAdd && (
        <div className="mb-3 flex items-center gap-2">
          <input placeholder="Table name..." value={newTableName} onChange={(e) => setNewTableName(e.target.value)}
            className="flex-1 rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/20" autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddTable()} />
          <button onClick={handleAddTable} className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs text-white hover:bg-violet-500">Add</button>
        </div>
      )}

      {/* Table list */}
      {database.length === 0 && !showAdd && (
        <div className="rounded-xl border border-dashed border-white/[0.06] p-6 text-center">
          <Table2 className="mx-auto mb-2 h-5 w-5 text-white/15" />
          <p className="text-xs text-white/25">No tables yet</p>
          <p className="mt-1 text-[10px] text-white/15">Create a table to store app data</p>
        </div>
      )}

      <div className="space-y-1.5 mb-3">
        {database.map((t) => (
          <div key={t.id} onClick={() => setActiveTableId(t.id === activeTableId ? null : t.id)}
            className={`group flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 transition ${
              activeTableId === t.id ? 'border-violet-500/30 bg-violet-500/[0.08]' : 'border-white/[0.04] bg-white/[0.02] hover:border-white/10'
            }`}>
            <Table2 className="h-4 w-4 text-emerald-400/60" />
            <div className="flex-1">
              <div className="text-xs font-medium text-white/80">{t.name}</div>
              <div className="text-[10px] text-white/30">{t.columns.length} cols · {t.rows.length} rows</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); removeTable(t.id); }}
              className="rounded p-1 text-red-400/0 group-hover:text-red-400/40 hover:!text-red-400">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Active table detail */}
      {activeTable && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] p-2.5">
            <span className="text-xs font-semibold text-white/70">{activeTable.name}</span>
            <div className="flex gap-1">
              <button onClick={() => addColumn(activeTable.id)} className="rounded bg-white/5 px-2 py-1 text-[10px] text-white/50 hover:bg-white/10">+ Column</button>
              <button onClick={() => addRow(activeTable.id)} className="rounded bg-white/5 px-2 py-1 text-[10px] text-white/50 hover:bg-white/10">+ Row</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {activeTable.columns.map((col) => (
                    <th key={col.id} className="px-2 py-1.5 text-left font-medium text-white/40">
                      <input value={col.name} onChange={(e) => {
                        const cols = activeTable.columns.map((c) => c.id === col.id ? { ...c, name: e.target.value } : c);
                        updateTable(activeTable.id, { columns: cols });
                      }} className="bg-transparent text-white/60 outline-none w-full" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTable.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-white/[0.02]">
                    {activeTable.columns.map((col) => (
                      <td key={col.id} className="px-2 py-1">
                        <input value={row[col.id] || ''} onChange={(e) => {
                          const rows = [...activeTable.rows];
                          rows[ri] = { ...rows[ri], [col.id]: e.target.value };
                          updateTable(activeTable.id, { rows });
                        }} className="w-full bg-transparent text-white/60 outline-none" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
