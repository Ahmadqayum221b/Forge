import { useState } from 'react';
import { 
  MousePointer2, 
  Square, 
  Type, 
  PenTool, 
  MessageSquare, 
  Component, 
  Hand, 
  Ruler, 
  Code2,
  ChevronDown,
  Layout,
  Plus,
  Sparkles,
  Circle,
  Minus,
  MoveUpRight,
  ArrowRight,
  Type as TypeIcon,
  MousePointer2,
} from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';

const TOOL_GROUPS = [
  { 
    id: 'select', 
    icon: MousePointer2, 
    label: 'Selection', 
    subTools: [
      { id: 'select', icon: MousePointer2, label: 'Move' },
      { id: 'scale', icon: Layout, label: 'Scale' }
    ]
  },
  { 
    id: 'shape', 
    icon: Square, 
    label: 'Shape', 
    subTools: [
      { id: 'rect', icon: Square, label: 'Rectangle' },
      { id: 'circle', icon: Circle, label: 'Circle' },
      { id: 'line', icon: Minus, label: 'Line' },
      { id: 'arrow', icon: ArrowRight, label: 'Arrow' }
    ]
  },
  { 
    id: 'text', 
    icon: TypeIcon, 
    label: 'Text', 
    subTools: [
      { id: 'text', icon: TypeIcon, label: 'Text' },
      { id: 'heading', icon: TypeIcon, label: 'Heading' }
    ]
  },
  { id: 'pen', icon: PenTool, label: 'Pen', subTools: [] },
  { id: 'comment', icon: MessageSquare, label: 'Comment', subTools: [] },
  { id: 'ai', icon: Sparkles, label: 'AI', subTools: [] },
];

const ACTIONS = [
  { id: 'pan', icon: Hand, label: 'Pan' },
  { id: 'measure', icon: Ruler, label: 'Measure' },
  { id: 'dev', icon: Code2, label: 'Dev Mode' },
];

export const FloatingToolbar = () => {
  const activeTool = useProjectStore((s) => s.activeTool);
  const setActiveTool = useProjectStore((s) => s.setActiveTool);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const setLeftPanelTab = useProjectStore((s) => s.setLeftPanelTab);

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
    if (toolId === 'ai') {
      setLeftPanelTab('components');
      toast.info('AI Generator is now active!');
    }
    setOpenDropdown(null);
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#1A1A24]/90 p-1.5 shadow-2xl backdrop-blur-xl">
        {/* Tools Group */}
        <div className="flex items-center gap-0.5">
          {TOOL_GROUPS.map((group) => (
            <div key={group.id} className="relative group">
              <div className="flex items-center">
                <button
                  onClick={() => handleToolClick(group.id)}
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-2 transition-all ${
                    activeTool === group.id || group.subTools.some(s => s.id === activeTool)
                      ? group.id === 'ai' 
                        ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                        : 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                  title={group.label}
                >
                  {(() => {
                    const activeSub = group.subTools.find(s => s.id === activeTool);
                    const Icon = activeSub ? activeSub.icon : group.icon;
                    return <Icon className={`h-4 w-4 ${activeTool === 'ai' && group.id === 'ai' ? 'animate-pulse' : ''}`} />;
                  })()}
                </button>
                
                {group.subTools.length > 0 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === group.id ? null : group.id);
                    }}
                    className={`h-8 px-0.5 transition-colors ${openDropdown === group.id ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                  >
                    <ChevronDown className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>

              {/* Dropdown Menu */}
              {openDropdown === group.id && group.subTools.length > 0 && (
                <div className="absolute bottom-full mb-3 left-0 min-w-[140px] rounded-xl border border-white/10 bg-[#1A1A24] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
                  {group.subTools.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleToolClick(sub.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs transition-all ${
                        activeTool === sub.id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <sub.icon className="h-3.5 w-3.5" />
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-white/10 mx-1" />

        {/* Actions Group */}
        <div className="flex items-center gap-0.5 rounded-xl bg-white/[0.03] p-0.5">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveAction(activeAction === action.id ? null : action.id)}
              className={`rounded-lg p-2 transition-all ${
                activeAction === action.id 
                  ? 'bg-white/10 text-blue-400' 
                  : 'text-white/40 hover:text-white/60'
              }`}
              title={action.label}
            >
              <action.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Hint */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-white/20 font-medium uppercase tracking-widest">
          Press <kbd className="rounded bg-white/5 px-1 py-0.5 text-white/40">V</kbd> for Selection
        </span>
      </div>
    </div>
  );
};
import { toast } from 'sonner';
