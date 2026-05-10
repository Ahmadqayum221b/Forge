import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SharedRenderer } from '@/components/builder/SharedRenderer';
import type { AppComponent, AppScreen } from '@/types/builder';
import { Smartphone, Wifi } from 'lucide-react';

interface PreviewProject {
  screens: AppScreen[];
  components: Record<string, AppComponent>;
  settings: Record<string, any>;
}

export const PhonePreview = () => {
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState<PreviewProject | null>(null);
  const [currentScreenId, setCurrentScreenId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [localVars, setLocalVars] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    // ── Path A: base64-encoded project (Vercel / no backend) ─────────
    const projectParam = searchParams.get('project');
    if (projectParam) {
      try {
        const jsonStr = decodeURIComponent(escape(atob(projectParam)));
        const raw = JSON.parse(jsonStr);
        
        // ── Map short keys back to long names ────────────────────────
        const decoded: PreviewProject = {
          screens: (raw.sc || []).map((s: any) => ({
            id: s.i,
            name: s.n,
            backgroundColor: s.b || 'transparent',
          })),
          settings: raw.se || {},
          components: Object.fromEntries(
            Object.entries(raw.co || {}).map(([id, c]: [string, any]) => [
              id,
              {
                id: id, // Use the key as the ID
                type: c.t,
                screenId: c.s,
                x: c.x || 0,
                y: c.y || 0,
                width: c.w || 0,
                height: c.h || 0,
                zIndex: c.z || 0,
                visible: c.vi === false ? false : true,
                props: c.p || {},
                styles: c.st || {},
                variableBindings: c.vb || {},
                logic: c.lo || [],
              },
            ])
          ),
        };

        if (!decoded.screens || decoded.screens.length === 0) throw new Error('Invalid project');
        setProject(decoded);
        setCurrentScreenId(decoded.screens[0].id);
      } catch (err) {
        console.error('Preview decode error:', err);
        setError('Could not decode the preview data. The project might be too large or contain invalid characters.');
      }
      return;
    }

    // ── Path B: token-based preview (requires local backend) ─────────
    const token = searchParams.get('token');
    const apiBase = searchParams.get('api') || 'http://localhost:3001';

    if (!token) {
      setError('No preview token or project data provided.');
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/api/preview/${token}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: PreviewProject = await res.json();
        setProject(data);
        setCurrentScreenId(data.screens[0]?.id || '');
      } catch {
        setError(
          'Could not load preview. Make sure the backend server is running and your phone is on the same WiFi network.'
        );
      }
    };

    load();
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0C0A1A] text-white gap-5 px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <Wifi className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-white/80">Unable to load preview</p>
          <p className="text-xs text-white/35 leading-relaxed max-w-xs">{error}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 w-full max-w-xs">
          <p className="text-[10px] text-white/30 font-medium mb-1">For local network preview, run:</p>
          <code className="font-mono text-[11px] text-violet-300">node server.js</code>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0C0A1A] gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        </div>
        <p className="text-xs text-white/30">Loading preview…</p>
      </div>
    );
  }

  const currentScreen = project.screens.find((s) => s.id === currentScreenId);
  const screenComps = Object.values(project.components)
    .filter((c) => c.screenId === currentScreenId && c.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  // ── Scaling Logic ────────────────────────────────────────────────
  // Get design width from project settings or default to Pixel 8 (412px)
  const designWidth = project.settings?.deviceFrame ? (project.settings.deviceFrame === 'iphone15' ? 393 : (project.settings.deviceFrame === 'pixel8' ? 412 : 400)) : 412;
  const actualWidth = window.innerWidth;
  const scale = actualWidth / designWidth;

  const navigate = (screenId: string) => {
    setHistory((h) => [...h, currentScreenId]);
    setCurrentScreenId(screenId);
  };

  const goBack = () => {
    if (history.length === 0) return;
    setCurrentScreenId(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  const handleComponentClick = (comp: AppComponent) => {
    const triggers = comp.logic?.filter((l) => l.trigger === 'on_click') || [];
    triggers.forEach((t) => {
      switch (t.action) {
        case 'navigate':
          if (t.params.screenId) navigate(t.params.screenId);
          break;
        case 'go_back':
          goBack();
          break;
        case 'show_toast':
          setToast(t.params.message || 'Toast');
          setTimeout(() => setToast(null), 3000);
          break;
        case 'show_alert':
          alert(`${t.params.title || ''}\n${t.params.message || ''}`);
          break;
        case 'open_url':
          if (t.params.url) window.open(t.params.url, '_blank');
          break;
        case 'set_variable':
          if (t.params.variableId)
            setLocalVars((prev) => ({ ...prev, [t.params.variableId]: t.params.value }));
          break;
      }
    });
  };

  return (
    <div
      className="relative flex h-screen w-screen flex-col overflow-hidden"
      style={{ backgroundColor: currentScreen?.backgroundColor || '#0C0A1A' }}
    >
      {/* Status bar */}
      <div className="flex shrink-0 items-center justify-between px-6 pt-3 pb-1 text-[11px] font-medium text-white/70">
        <span>9:41</span>
        <span className="text-[9px] tracking-wider">●●●● 5G</span>
      </div>

      {/* Components Container with Scaling */}
      <div className="relative flex-1 overflow-hidden origin-top-left" style={{ width: designWidth, transform: `scale(${scale})` }}>
        {screenComps.map((comp) => (
          <div
            key={comp.id}
            style={{
              position: 'absolute',
              left: comp.x,
              top: comp.y,
              width: comp.width,
              height: comp.height,
              zIndex: comp.zIndex,
            }}
            onClick={() => handleComponentClick(comp)}
          >
            <SharedRenderer
              component={comp}
              zoom={1}
              isInteractive={true}
              localVariables={localVars}
              onVariableChange={(vid, val) =>
                setLocalVars((p) => ({ ...p, [vid]: val }))
              }
            />
          </div>
        ))}

        {screenComps.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-white/20 text-sm gap-2" style={{ transform: `scale(${1/scale})` }}>
            <Smartphone className="h-8 w-8 opacity-50" />
            <span>Empty screen</span>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-white/10 whitespace-nowrap">
            {toast}
          </div>
        )}
      </div>

      {/* Forge watermark */}
      <div className="absolute bottom-2 right-3 flex items-center gap-1 opacity-25 pointer-events-none">
        <div className="h-3 w-3 rounded bg-gradient-to-br from-violet-500 to-pink-500" />
        <span className="text-[9px] text-white font-medium">Forge</span>
      </div>
    </div>
  );
};
