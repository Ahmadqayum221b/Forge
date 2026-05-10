import { useState } from 'react';
import { Package, Search, Download, Check, Star, ExternalLink, ArrowLeft, Info, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PACKAGES = [
  {
    id: 'material-ui-kit',
    name: 'Material UI Kit',
    description: 'Complete set of Google Material Design 3 components, including inputs, cards, and navigation.',
    author: 'Forge Team',
    version: '2.1.0',
    downloads: '12.4k',
    stars: 4.8,
    category: 'UI Kit',
    icon: Layers,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  {
    id: 'chart-js',
    name: 'Realtime Charts',
    description: 'Dynamic line, bar, and pie charts with realtime data binding support.',
    author: 'DataViz Pro',
    version: '1.0.5',
    downloads: '8.2k',
    stars: 4.6,
    category: 'Component',
    icon: Package,
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
  },
  {
    id: 'supabase-connector',
    name: 'Supabase Sync',
    description: 'Ready-to-use auth and database sync for Supabase backends.',
    author: 'Backend Tools',
    version: '3.0.0',
    downloads: '25.1k',
    stars: 4.9,
    category: 'Plugin',
    icon: Package,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
  {
    id: 'animation-engine',
    name: 'Motion Suite',
    description: 'Advanced transition effects and micro-animations for interactive elements.',
    author: 'Forge Team',
    version: '1.2.0',
    downloads: '5.6k',
    stars: 4.7,
    category: 'Animation',
    icon: Package,
    color: 'text-violet-400',
    bgColor: 'bg-violet-400/10',
  },
];

export const PackagesPanel = () => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [installed, setInstalled] = useState<string[]>(['material-ui-kit']);

  const filtered = PACKAGES.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const selected = PACKAGES.find(p => p.id === selectedId);

  const toggleInstall = (id: string) => {
    if (installed.includes(id)) {
      setInstalled(installed.filter(i => i !== id));
      toast.info('Package removed');
    } else {
      setInstalled([...installed, id]);
      toast.success('Package installed successfully!');
    }
  };

  if (selectedId && selected) {
    return (
      <div className="flex h-full flex-col p-4 animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setSelectedId(null)}
          className="mb-6 flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Packages
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${selected.bgColor}`}>
            <selected.icon className={`h-8 w-8 ${selected.color}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{selected.name}</h2>
            <div className="mt-1 flex items-center gap-3 text-[10px] text-white/40">
              <span className="flex items-center gap-1"><Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" /> {selected.stars}</span>
              <span>{selected.downloads} downloads</span>
              <span>v{selected.version}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button 
            onClick={() => toggleInstall(selected.id)}
            className={`flex-1 ${installed.includes(selected.id) ? 'bg-white/10 text-white' : 'bg-gradient-primary text-white shadow-glow'}`}
          >
            {installed.includes(selected.id) ? (
              <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Installed</span>
            ) : (
              <span className="flex items-center gap-2"><Download className="h-4 w-4" /> Install Package</span>
            )}
          </Button>
          <Button variant="outline" className="glass h-10 w-10 p-0 border-white/10">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-8 space-y-6">
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-white">
              <Info className="h-3 w-3 text-violet-400" /> Overview
            </h3>
            <p className="text-xs leading-relaxed text-white/60">
              {selected.description} This package is maintained by {selected.author} and is optimized for the latest version of Forge.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold text-white text-violet-400">Features</h3>
            <ul className="space-y-2">
              {['Optimized for mobile performance', 'Full TypeScript support', 'Customizable theme variables', 'Zero-config integration'].map(f => (
                <li key={f} className="flex items-center gap-2 text-[11px] text-white/50">
                  <div className="h-1 w-1 rounded-full bg-violet-500" />
                  {f}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4 animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white">Package Marketplace</h2>
        <p className="text-[10px] text-white/30">Extend your app with curated components</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search packages..."
          className="w-full rounded-xl border border-white/5 bg-white/5 py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/30"
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        {filtered.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => setSelectedId(pkg.id)}
            className="group flex w-full items-start gap-3 rounded-xl border border-white/[0.03] bg-white/[0.02] p-3 text-left transition hover:border-white/10 hover:bg-white/[0.05]"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${pkg.bgColor}`}>
              <pkg.icon className={`h-5 w-5 ${pkg.color}`} />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-xs font-semibold text-white">{pkg.name}</h3>
                {installed.includes(pkg.id) && (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400">
                    <Check className="h-2.5 w-2.5" /> INSTALLED
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-white/40">
                {pkg.description}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[9px] text-white/20">
                <span className="flex items-center gap-1"><Star className="h-2 w-2 fill-yellow-500/30 text-yellow-500/50" /> {pkg.stars}</span>
                <span>{pkg.author}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
