import { useProjectStore } from '@/stores/projectStore';
import { X, ShoppingBag, Dumbbell, Users, Calendar, BookOpen, UtensilsCrossed, Search, Star } from 'lucide-react';
import { useState } from 'react';
import { nanoid } from 'nanoid';
import type { AppScreen, AppComponent } from '@/types/builder';

interface TemplateItem {
  id: string; name: string; description: string; category: string;
  icon: React.ComponentType<{ className?: string }>; color: string;
  screens: { name: string; bgColor: string; components: Partial<AppComponent>[] }[];
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'ecommerce', name: 'E-Commerce Store', description: 'Product listing, cart, and checkout flow',
    category: 'ecommerce', icon: ShoppingBag, color: 'violet',
    screens: [
      { name: 'Home', bgColor: '#0C0A1A', components: [
        { type: 'text', x: 20, y: 10, width: 250, height: 32, props: { content: '🛍️ Shop', align: 'left' }, styles: { color: '#FFF', fontSize: 24, fontWeight: '700' } },
        { type: 'input', x: 20, y: 55, width: 280, height: 44, props: { placeholder: 'Search products...' }, styles: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFF', fontSize: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingX: 12 } },
        { type: 'card', x: 20, y: 115, width: 130, height: 160, props: { title: 'Sneakers', subtitle: '$89.99' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12 } },
        { type: 'card', x: 165, y: 115, width: 130, height: 160, props: { title: 'Watch', subtitle: '$199.00' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12 } },
        { type: 'card', x: 20, y: 290, width: 130, height: 160, props: { title: 'Headphones', subtitle: '$149.00' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12 } },
        { type: 'card', x: 165, y: 290, width: 130, height: 160, props: { title: 'Backpack', subtitle: '$59.99' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12 } },
        { type: 'button', x: 20, y: 470, width: 280, height: 48, props: { label: '🛒 View Cart (2)' }, styles: { backgroundColor: '#6C3AED', color: '#FFF', fontSize: 15, fontWeight: '600', borderRadius: 14, borderWidth: 0, borderColor: '#000' } },
      ]},
      { name: 'Cart', bgColor: '#0C0A1A', components: [
        { type: 'text', x: 20, y: 10, width: 200, height: 30, props: { content: 'Your Cart' }, styles: { color: '#FFF', fontSize: 22, fontWeight: '700' } },
        { type: 'card', x: 20, y: 55, width: 280, height: 80, props: { title: 'Sneakers x1', subtitle: '$89.99' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14 } },
        { type: 'card', x: 20, y: 145, width: 280, height: 80, props: { title: 'Watch x1', subtitle: '$199.00' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14 } },
        { type: 'divider', x: 20, y: 250, width: 280, height: 1, props: {}, styles: { backgroundColor: 'rgba(255,255,255,0.12)' } },
        { type: 'text', x: 20, y: 265, width: 280, height: 28, props: { content: 'Total: $288.99', align: 'right' }, styles: { color: '#FFF', fontSize: 18, fontWeight: '700' } },
        { type: 'button', x: 20, y: 310, width: 280, height: 48, props: { label: 'Checkout →' }, styles: { backgroundColor: '#EC4899', color: '#FFF', fontSize: 15, fontWeight: '600', borderRadius: 14, borderWidth: 0, borderColor: '#000' } },
      ]},
    ],
  },
  {
    id: 'fitness', name: 'Fitness Tracker', description: 'Workout logging and progress dashboard',
    category: 'fitness', icon: Dumbbell, color: 'cyan',
    screens: [
      { name: 'Dashboard', bgColor: '#0C0A1A', components: [
        { type: 'text', x: 20, y: 10, width: 250, height: 32, props: { content: '💪 Today\'s Progress' }, styles: { color: '#FFF', fontSize: 22, fontWeight: '700' } },
        { type: 'card', x: 20, y: 55, width: 280, height: 100, props: { title: '2,450 cal', subtitle: 'Calories burned' }, styles: { backgroundColor: 'rgba(6,182,212,0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', padding: 16 } },
        { type: 'card', x: 20, y: 170, width: 130, height: 100, props: { title: '8,240', subtitle: 'Steps' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14 } },
        { type: 'card', x: 165, y: 170, width: 130, height: 100, props: { title: '45 min', subtitle: 'Active' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14 } },
        { type: 'button', x: 20, y: 295, width: 280, height: 48, props: { label: '+ Start Workout' }, styles: { backgroundColor: '#06B6D4', color: '#FFF', fontSize: 15, fontWeight: '600', borderRadius: 14, borderWidth: 0, borderColor: '#000' } },
        { type: 'text', x: 20, y: 365, width: 280, height: 24, props: { content: 'Recent Workouts' }, styles: { color: '#FFF', fontSize: 16, fontWeight: '600' } },
        { type: 'list', x: 20, y: 395, width: 280, height: 144, props: { items: ['Chest & Triceps - 45min', 'Morning Run - 30min', 'Yoga Flow - 25min'], itemHeight: 48 }, styles: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, dividerColor: 'rgba(255,255,255,0.06)', itemColor: '#FFF', fontSize: 13 } },
      ]},
    ],
  },
  {
    id: 'social', name: 'Social Feed', description: 'Feed, profile, and post creation',
    category: 'social', icon: Users, color: 'pink',
    screens: [
      { name: 'Feed', bgColor: '#0C0A1A', components: [
        { type: 'text', x: 20, y: 10, width: 250, height: 30, props: { content: '✨ Feed' }, styles: { color: '#FFF', fontSize: 22, fontWeight: '700' } },
        { type: 'card', x: 20, y: 55, width: 280, height: 120, props: { title: 'Alex posted a photo', subtitle: '🌅 Beautiful sunset today! #nature' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16 } },
        { type: 'card', x: 20, y: 190, width: 280, height: 120, props: { title: 'Jordan shared a link', subtitle: '🔗 Check out this cool article about AI...' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16 } },
        { type: 'button', x: 230, y: 470, width: 60, height: 60, props: { label: '+' }, styles: { backgroundColor: '#EC4899', color: '#FFF', fontSize: 24, fontWeight: '700', borderRadius: 30, borderWidth: 0, borderColor: '#000' } },
      ]},
    ],
  },
  {
    id: 'booking', name: 'Appointment Booker', description: 'Calendar, booking form, and confirmation',
    category: 'booking', icon: Calendar, color: 'emerald',
    screens: [
      { name: 'Book', bgColor: '#0C0A1A', components: [
        { type: 'text', x: 20, y: 10, width: 250, height: 30, props: { content: '📅 Book Appointment' }, styles: { color: '#FFF', fontSize: 22, fontWeight: '700' } },
        { type: 'input', x: 20, y: 55, width: 280, height: 44, props: { placeholder: 'Your name', type: 'text' }, styles: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFF', fontSize: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingX: 12 } },
        { type: 'input', x: 20, y: 110, width: 280, height: 44, props: { placeholder: 'Email address', type: 'email' }, styles: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFF', fontSize: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingX: 12 } },
        { type: 'input', x: 20, y: 165, width: 280, height: 44, props: { placeholder: 'Phone number', type: 'tel' }, styles: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFF', fontSize: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingX: 12 } },
        { type: 'text', x: 20, y: 230, width: 280, height: 24, props: { content: 'Select Time Slot' }, styles: { color: '#FFF', fontSize: 14, fontWeight: '600' } },
        { type: 'list', x: 20, y: 260, width: 280, height: 144, props: { items: ['9:00 AM - 10:00 AM', '11:00 AM - 12:00 PM', '2:00 PM - 3:00 PM'], itemHeight: 48 }, styles: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, dividerColor: 'rgba(255,255,255,0.06)', itemColor: '#FFF', fontSize: 13 } },
        { type: 'button', x: 20, y: 420, width: 280, height: 48, props: { label: 'Confirm Booking ✓' }, styles: { backgroundColor: '#10B981', color: '#FFF', fontSize: 15, fontWeight: '600', borderRadius: 14, borderWidth: 0, borderColor: '#000' } },
      ]},
    ],
  },
  {
    id: 'restaurant', name: 'Restaurant Menu', description: 'Menu categories, items, and ordering',
    category: 'restaurant', icon: UtensilsCrossed, color: 'amber',
    screens: [
      { name: 'Menu', bgColor: '#0C0A1A', components: [
        { type: 'text', x: 20, y: 10, width: 250, height: 30, props: { content: '🍕 Our Menu' }, styles: { color: '#FFF', fontSize: 22, fontWeight: '700' } },
        { type: 'card', x: 20, y: 55, width: 280, height: 80, props: { title: 'Margherita Pizza', subtitle: '$12.99 · Classic cheese & tomato' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14 } },
        { type: 'card', x: 20, y: 145, width: 280, height: 80, props: { title: 'Caesar Salad', subtitle: '$8.99 · Fresh romaine, croutons' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14 } },
        { type: 'card', x: 20, y: 235, width: 280, height: 80, props: { title: 'Pasta Carbonara', subtitle: '$14.99 · Creamy bacon pasta' }, styles: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14 } },
        { type: 'button', x: 20, y: 340, width: 280, height: 48, props: { label: '🛒 Order (3 items) - $36.97' }, styles: { backgroundColor: '#F59E0B', color: '#000', fontSize: 14, fontWeight: '700', borderRadius: 14, borderWidth: 0, borderColor: '#000' } },
      ]},
    ],
  },
];

export const TemplateMarketplace = () => {
  const setTemplateModalOpen = useProjectStore((s) => s.setTemplateModalOpen);
  const loadProject = useProjectStore((s) => s.loadProject);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const filtered = TEMPLATES.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'all' || t.category === selectedCat;
    return matchSearch && matchCat;
  });

  const handleUse = (template: TemplateItem) => {
    const screens: AppScreen[] = template.screens.map((s, i) => ({
      id: nanoid(8), name: s.name, backgroundColor: s.bgColor, statusBarColor: '#000', order: i,
    }));
    const components: Record<string, AppComponent> = {};
    template.screens.forEach((s, si) => {
      s.components.forEach((c, ci) => {
        const id = nanoid(8);
        components[id] = {
          id, type: c.type as any, screenId: screens[si].id,
          name: `${(c.type || 'comp')}_${id.slice(0, 4)}`,
          x: c.x || 0, y: c.y || 0, width: c.width || 200, height: c.height || 44,
          props: c.props || {}, styles: c.styles || {},
          logic: [], variableBindings: {}, locked: false, visible: true, zIndex: ci,
        };
      });
    });
    loadProject({ projectName: template.name, screens, components, variables: [], database: [], nativeFeatures: undefined });
    setTemplateModalOpen(false);
  };

  const cats = ['all', ...new Set(TEMPLATES.map((t) => t.category))];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-[#12121e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div>
            <h3 className="text-lg font-bold text-white">Template Marketplace</h3>
            <p className="text-sm text-white/40">Start with a polished template</p>
          </div>
          <button onClick={() => setTemplateModalOpen(false)} className="rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 border-b border-white/[0.06]">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-500/40" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {cats.map((c) => (
              <button key={c} onClick={() => setSelectedCat(c)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition capitalize ${
                  selectedCat === c ? 'bg-violet-500/20 text-violet-300' : 'bg-white/[0.04] text-white/40 hover:text-white/60'
                }`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.id} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 shrink-0">
                      <Icon className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-white/40">{t.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">{t.screens.length} screen{t.screens.length > 1 ? 's' : ''} · {t.screens.reduce((a, s) => a + s.components.length, 0)} components</span>
                    <button onClick={() => handleUse(t)}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition">
                      Use Template
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
