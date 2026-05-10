import { toast } from 'sonner';
import { useState } from 'react';
import {
  MousePointer2,
  Square,
  Type,
  PenTool,
  MessageSquare,
  Hand,
  Ruler,
  Code2,
  ChevronDown,
  Layout,
  Sparkles,
  Circle,
  Minus,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';

const TOOL_GROUPS = [
  {
    id: 'select',
    icon: MousePointer2,
    label: 'Selection',
    kbd: 'V',
    subTools: [
      { id: 'select', icon: MousePointer2, label: 'Move', kbd: 'V' },
      { id: 'scale', icon: Layout, label: 'Scale', kbd: 'S' },
    ],
  },
  {
    id: 'shape',
    icon: Square,
    label: 'Shape',
    kbd: 'R',
    subTools: [
      { id: 'rect', icon: Square, label: 'Rectangle', kbd: 'R' },
      { id: 'circle', icon: Circle, label: 'Circle', kbd: 'O' },
      { id: 'line', icon: Minus, label: 'Line', kbd: 'L' },
      { id: 'arrow', icon: ArrowRight, label: 'Arrow', kbd: 'A' },
    ],
  },
  {
    id: 'text',
    icon: Type,
    label: 'Text',
    kbd: 'T',
    subTools: [
      { id: 'text', icon: Type, label: 'Text', kbd: 'T' },
      { id: 'heading', icon: Type, label: 'Heading', kbd: 'H' },
    ],
  },
  { id: 'pen', icon: PenTool, label: 'Pen', kbd: 'P', subTools: [] },
  { id: 'comment', icon: MessageSquare, label: 'Comment', kbd: 'C', subTools: [] },
  { id: 'ai', icon: Sparkles, label: 'AI Generate', kbd: 'G', subTools: [] },
];

const ACTIONS = [
  { id: 'pan', icon: Hand, label: 'Pan', kbd: 'H' },
  { id: 'measure', icon: Ruler, label: 'Measure', kbd: 'M' },
  { id: 'dev', icon: Code2, label: 'Dev Mode', kbd: 'D' },
];

export const FloatingToolbar = () => {
  const activeTool = useProjectStore((s) => s.activeTool);
  const setActiveTool = useProjectStore((s) => s.setActiveTool);
  const canvasZoom = useProjectStore((s) => s.canvasZoom);
  const setCanvasZoom = useProjectStore((s) => s.setCanvasZoom);
  const setLeftPanelTab = useProjectStore((s) => s.setLeftPanelTab);

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
    if (toolId === 'ai') {
      setLeftPanelTab('components');
      toast.info('AI Generator is now active — describe a component below.');
    }
    setOpenDropdown(null);
  };

  const handleZoom = (delta: number) => {
    const next = Math.min(4, Math.max(0.1, canvasZoom + delta));
    setCanvasZoom(Math.round(next * 10) / 10);
  };

  const handleZoomReset = () => setCanvasZoom(1);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-1 rounded-2xl border border-white/[0.1] bg-[#16162280]/90 p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl ring-1 ring-white/[0.04]">

        {/* ── Tools Group ── */}
        <div className="flex items-center gap-0.5">
          {TOOL_GROUPS.map((group) => {
            const isGroupActive =
              activeTool === group.id ||
              group.subTools.some((s) => s.id === activeTool);
            const activeSub = group.subTools.find((s) => s.id === activeTool);
            const Icon = activeSub ? activeSub.icon : group.icon;

            return (
              <div key={group.id} className="relative group/tool">
                <div className="flex items-center">
                  {/* Main tool button */}
                  <button
                    onClick={() => handleToolClick(group.id)}
                    className={`relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-150 ${
                      isGroupActive
                        ? group.id === 'ai'
                          ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-[0_0_18px_rgba(139,92,246,0.55)]'
                          : 'bg-blue-500/90 text-white shadow-[0_0_14px_rgba(59,130,246,0.4)]'
                        : 'text-white/55 hover:bg-white/[0.07] hover:text-white'
                    }`}
                    title={`${group.label}  [${group.kbd}]`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        group.id === 'ai' && isGroupActive ? 'animate-pulse' : ''
                      }`}
                    />
                    {/* Show label for AI tool only */}
                    {group.id === 'ai' && (
                      <span className="hidden sm:inline text-[11px]">AI</span>
                    )}
                    {/* Kbd badge */}
                    <span
                      className={`absolute -top-1.5 -right-1 hidden group-hover/tool:flex items-center justify-center h-3.5 min-w-[14px] rounded bg-white/10 px-0.5 text-[8px] font-bold text-white/50 leading-none`}
                    >
                      {activeSub?.kbd ?? group.kbd}
                    </span>
                  </button>

                  {/* Dropdown chevron */}
                  {group.subTools.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown === group.id ? null : group.id
                        );
                      }}
                      className={`h-8 px-0.5 transition-colors rounded ${
                        openDropdown === group.id
                          ? 'text-white'
                          : 'text-white/20 hover:text-white/50'
                      }`}
                    >
                      <ChevronDown className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown sub-tools */}
                {openDropdown === group.id && group.subTools.length > 0 && (
                  <>
                    {/* Click-away */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute bottom-full mb-3 left-0 z-50 min-w-[150px] rounded-xl border border-white/[0.1] bg-[#1A1A28] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
                      {group.subTools.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleToolClick(sub.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-xs transition-all ${
                            activeTool === sub.id
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'text-white/50 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <sub.icon className="h-3.5 w-3.5" />
                            {sub.label}
                          </div>
                          <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold text-white/30">
                            {sub.kbd}
                          </kbd>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-white/[0.08] mx-1 shrink-0" />

        {/* ── Actions Group ── */}
        <div className="flex items-center gap-0.5 rounded-xl bg-white/[0.03] p-0.5">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() =>
                setActiveAction(activeAction === action.id ? null : action.id)
              }
              className={`group/action relative rounded-lg p-2 transition-all ${
                activeAction === action.id
                  ? 'bg-white/10 text-blue-400'
                  : 'text-white/35 hover:text-white/70'
              }`}
              title={`${action.label}  [${action.kbd}]`}
            >
              <action.icon className="h-3.5 w-3.5" />
              <span className="absolute -top-1.5 -right-1 hidden group-hover/action:flex items-center justify-center h-3.5 min-w-[14px] rounded bg-white/10 px-0.5 text-[8px] font-bold text-white/40 leading-none">
                {action.kbd}
              </span>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-white/[0.08] mx-1 shrink-0" />

        {/* ── Zoom Controls ── */}
        <div className="flex items-center gap-0.5 rounded-xl bg-white/[0.03] p-0.5">
          <button
            onClick={() => handleZoom(-0.1)}
            className="rounded-lg p-2 text-white/35 hover:bg-white/[0.06] hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1.5 text-[10px] font-mono font-semibold text-white/40 hover:text-white transition-colors min-w-[42px] text-center rounded-lg hover:bg-white/[0.06]"
            title="Reset Zoom"
          >
            {Math.round(canvasZoom * 100)}%
          </button>
          <button
            onClick={() => handleZoom(0.1)}
            className="rounded-lg p-2 text-white/35 hover:bg-white/[0.06] hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCanvasZoom(1)}
            className="rounded-lg p-2 text-white/35 hover:bg-white/[0.06] hover:text-white transition-all"
            title="Fit to Screen"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Floating hint strip */}
      <div className="mt-2 flex justify-center">
        <span className="text-[9px] text-white/15 font-medium tracking-widest uppercase">
          Press <kbd className="rounded bg-white/5 px-1 py-0.5 text-white/25">V</kbd> Select ·{' '}
          <kbd className="rounded bg-white/5 px-1 py-0.5 text-white/25">R</kbd> Rect ·{' '}
          <kbd className="rounded bg-white/5 px-1 py-0.5 text-white/25">T</kbd> Text ·{' '}
          <kbd className="rounded bg-white/5 px-1 py-0.5 text-white/25">G</kbd> AI
        </span>
      </div>
    </div>
  );
};
