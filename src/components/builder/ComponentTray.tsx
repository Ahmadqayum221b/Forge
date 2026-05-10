import { useProjectStore } from '@/stores/projectStore';
import { type ComponentType } from '@/types/builder';
import {
  Square,
  Type,
  Image as ImageIcon,
  ToggleLeft,
  Sliders,
  TextCursorInput,
  AlignLeft,
  CheckSquare,
  Circle,
  LayoutGrid,
  CreditCard,
  Minus,
  ArrowDownUp,
  List,
  Star,
  MapPin,
  Video,
  Search,
  Sparkles,
  ChevronUp,
  ChevronDown,
  LayoutPanelTop,
  FolderOpen,
  Tag,
  Activity,
  CircleUser,
} from 'lucide-react';
import { useState } from 'react';
import { AIGeneratorPanel } from './AIGeneratorPanel';

interface ComponentDef {
  type: ComponentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'layout' | 'advanced';
}

const COMPONENTS: ComponentDef[] = [
  { type: 'button', label: 'Button', icon: Square, category: 'basic' },
  { type: 'text', label: 'Text', icon: Type, category: 'basic' },
  { type: 'image', label: 'Image', icon: ImageIcon, category: 'basic' },
  { type: 'input', label: 'Input', icon: TextCursorInput, category: 'basic' },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft, category: 'basic' },
  { type: 'switch', label: 'Switch', icon: ToggleLeft, category: 'basic' },
  { type: 'slider', label: 'Slider', icon: Sliders, category: 'basic' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, category: 'basic' },
  { type: 'radio', label: 'Radio', icon: Circle, category: 'basic' },
  { type: 'container', label: 'Container', icon: LayoutGrid, category: 'layout' },
  { type: 'card', label: 'Card', icon: CreditCard, category: 'layout' },
  { type: 'header', label: 'Header', icon: LayoutPanelTop, category: 'layout' },
  { type: 'tabs', label: 'Tabs', icon: FolderOpen, category: 'layout' },
  { type: 'divider', label: 'Divider', icon: Minus, category: 'layout' },
  { type: 'spacer', label: 'Spacer', icon: ArrowDownUp, category: 'layout' },
  { type: 'list', label: 'List', icon: List, category: 'advanced' },
  { type: 'icon', label: 'Icon', icon: Star, category: 'advanced' },
  { type: 'map', label: 'Map', icon: MapPin, category: 'advanced' },
  { type: 'video', label: 'Video', icon: Video, category: 'advanced' },
  { type: 'badge', label: 'Badge', icon: Tag, category: 'advanced' },
  { type: 'progress', label: 'Progress', icon: Activity, category: 'advanced' },
  { type: 'avatar', label: 'Avatar', icon: CircleUser, category: 'advanced' },
];

const CATEGORY_LABELS = {
  basic: 'Basic',
  layout: 'Layout',
  advanced: 'Advanced',
};

export const ComponentTray = () => {
  const addComponent = useProjectStore((s) => s.addComponent);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'basic' | 'layout' | 'advanced'>('all');
  const [showAI, setShowAI] = useState(false);

  const filtered = COMPONENTS.filter((c) => {
    const matchesSearch = c.label.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = activeCategory === 'all'
    ? (['basic', 'layout', 'advanced'] as const).map((cat) => ({
        category: cat,
        items: filtered.filter((c) => c.category === cat),
      })).filter((g) => g.items.length > 0)
    : [{ category: activeCategory as 'basic' | 'layout' | 'advanced', items: filtered }];

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('component-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col">
      {/* AI Generate Button */}
      <button
        onClick={() => setShowAI(v => !v)}
        className={`flex items-center justify-between gap-2 border-b px-3 py-2.5 text-xs font-semibold transition ${
          showAI
            ? 'border-violet-500/30 bg-violet-500/10 text-violet-300'
            : 'border-white/[0.06] text-white/60 hover:bg-white/[0.03] hover:text-white'
        }`}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Generate with AI
        </span>
        {showAI ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {/* AI Panel (inline collapsible) */}
      {showAI && (
        <AIGeneratorPanel onClose={() => setShowAI(false)} />
      )}

      {/* Manual component tray */}
      <div className="flex flex-col p-3">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 pl-8 pr-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition"
          />
        </div>

        {/* Category filter */}
        <div className="mb-3 flex gap-1">
          {(['all', 'basic', 'layout', 'advanced'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition ${
                activeCategory === cat
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/60'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Component list */}
        <div className="space-y-4">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              {activeCategory === 'all' && (
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  {CATEGORY_LABELS[category]}
                </div>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {items.map(({ type, label, icon: Icon }) => (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, type)}
                    onClick={() => addComponent(type)}
                    className="group flex cursor-grab flex-col items-center gap-1.5 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-center transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.06] hover:shadow-lg hover:shadow-violet-500/5 active:cursor-grabbing active:scale-95"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] transition group-hover:bg-violet-500/10">
                      <Icon className="h-4 w-4 text-white/50 transition group-hover:text-violet-300" />
                    </div>
                    <span className="text-[10px] font-medium text-white/50 transition group-hover:text-white/80">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Drag hint */}
        <div className="mt-4 rounded-lg border border-dashed border-white/[0.06] p-3 text-center">
          <p className="text-[10px] text-white/25">
            Drag & drop onto canvas
            <br />
            or click to add
          </p>
        </div>
      </div>
    </div>
  );
};
