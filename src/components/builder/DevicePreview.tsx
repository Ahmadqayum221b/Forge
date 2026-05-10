import { useProjectStore } from '@/stores/projectStore';
import { X, Smartphone, RotateCcw, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DEVICE_FRAMES, ComponentLogic } from '@/types/builder';
import { SharedRenderer } from './SharedRenderer';

export const DevicePreview = () => {
  const setPreviewOpen = useProjectStore((s) => s.setPreviewOpen);
  const screens = useProjectStore((s) => s.screens);
  const components = useProjectStore((s) => s.components);
  const deviceFrame = useProjectStore((s) => s.deviceFrame);
  const variables = useProjectStore((s) => s.variables);
  
  const [currentScreenId, setCurrentScreenId] = useState(screens[0]?.id || '');
  const [history, setHistory] = useState<string[]>([]);
  const [scale, setScale] = useState(1);
  const [localVars, setLocalVars] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<string | null>(null);

  // Initialize variables
  useEffect(() => {
    const initialVars: Record<string, any> = {};
    variables.forEach(v => { initialVars[v.id] = v.defaultValue; });
    setLocalVars(initialVars);
  }, [variables]);

  const frame = DEVICE_FRAMES[deviceFrame];

  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 140;
      const frameHeight = frame.height + 24;
      if (frameHeight > availableHeight) {
        setScale(availableHeight / frameHeight);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [frame.height]);

  const currentScreen = screens.find((s) => s.id === currentScreenId);
  const screenComps = Object.values(components)
    .filter((c) => c.screenId === currentScreenId && c.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  const navigate = (screenId: string) => {
    setHistory((h) => [...h, currentScreenId]);
    setCurrentScreenId(screenId);
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentScreenId(prev);
  };

  // Evaluate simple condition string like "{varId} == text" or "var === value"
  const evaluateCondition = (conditionStr: string): boolean => {
    if (!conditionStr) return true;
    try {
      // Very basic evaluation: replace varIds with their string values and evaluate
      let expr = conditionStr;
      Object.keys(localVars).forEach(vid => {
        // Replace exact matches of varId if it exists
        expr = expr.replace(new RegExp(vid, 'g'), `"${localVars[vid]}"`);
      });
      // Allow user to write raw values like: myVarId == test@email.com
      // We will just do a basic string split for equality
      if (expr.includes('==')) {
        const [left, right] = expr.split('==').map(s => s.trim().replace(/^["']|["']$/g, ''));
        return left === right;
      }
      if (expr.includes('!=')) {
        const [left, right] = expr.split('!=').map(s => s.trim().replace(/^["']|["']$/g, ''));
        return left !== right;
      }
      return !!expr;
    } catch (e) {
      console.error("Condition eval error", e);
      return false;
    }
  };

  // Logic Executor
  const executeLogicChain = async (startLogic: ComponentLogic, allLogic: ComponentLogic[]) => {
    let current: ComponentLogic | undefined = startLogic;
    
    while (current) {
      const { action, params } = current;
      let shouldContinue = true;

      // Execute action
      switch (action) {
        case 'navigate': if (params.screenId) navigate(params.screenId); break;
        case 'go_back': goBack(); break;
        case 'show_alert': alert(`${params.title || 'Alert'}\n${params.message || ''}`); break;
        case 'show_toast': 
          setToast(params.message || 'Toast');
          setTimeout(() => setToast(null), 3000);
          break;
        case 'open_url': if (params.url) window.open(params.url, '_blank'); break;
        case 'open_camera': alert('📷 Camera opened (simulated)'); break;
        case 'get_location': alert('📍 Location: 37.7749, -122.4194 (simulated)'); break;
        case 'vibrate': navigator.vibrate?.(200); break;
        case 'set_variable':
          if (params.variableId) {
            setLocalVars(prev => ({ ...prev, [params.variableId]: params.value }));
          }
          break;
        case 'delay':
          if (params.durationMs) await new Promise(r => setTimeout(r, params.durationMs));
          break;
        case 'condition_if':
          if (!evaluateCondition(params.condition)) {
            shouldContinue = false; // Halt execution if condition fails
          }
          break;
      }

      if (!shouldContinue) break;

      // For sequential linear execution, find next node connected in Blueprint (this assumes linear array order for now)
      // Since blueprint wires logic sequentially in the array for the same trigger, we find the next index
      const currentIndex = allLogic.findIndex(l => l.id === current!.id);
      const nextLogic = allLogic.slice(currentIndex + 1).find(l => l.trigger === current!.trigger);
      current = nextLogic;
    }
  };

  const renderComp = (comp: any) => {
    const onClick = () => {
      const triggers = comp.logic?.filter((l: any) => l.trigger === 'on_click') || [];
      if (triggers.length > 0) {
        executeLogicChain(triggers[0], comp.logic);
      }
    };

    const base: React.CSSProperties = {
      position: 'absolute', left: comp.x, top: comp.y, width: comp.width, height: comp.height, zIndex: comp.zIndex,
    };

    // If component is interactive, intercept clicks inside
    return (
      <div key={comp.id} style={base} onClick={onClick}>
        <SharedRenderer 
          component={comp} 
          zoom={1} 
          isInteractive={true} 
          localVariables={localVars}
          onVariableChange={(vid, val) => setLocalVars(p => ({...p, [vid]: val}))}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col items-center gap-4">
        {/* Close */}
        <button onClick={() => setPreviewOpen(false)}
          className="absolute -right-12 -top-2 rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white transition-all hover:rotate-90">
          <X className="h-5 w-5" />
        </button>

        {/* Screen tabs */}
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button onClick={goBack} className="rounded-lg bg-white/10 p-2 text-white/60 hover:bg-white/20 shadow">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {screens.map((s) => (
            <button key={s.id} onClick={() => { setHistory([]); setCurrentScreenId(s.id); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition shadow ${
                currentScreenId === s.id ? 'bg-violet-600 text-white' : 'bg-white/10 text-white/50 hover:bg-white/15'
              }`}>{s.name}</button>
          ))}
          <button onClick={() => { setHistory([]); setCurrentScreenId(screens[0]?.id); }}
            className="rounded-lg bg-white/10 p-2 text-white/60 hover:bg-white/20 shadow ml-2">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Device Wrapper for Scaling */}
        <div style={{ width: (frame.width + 24) * scale, height: (frame.height + 24) * scale, position: 'relative' }}>
          <div className="absolute left-0 top-0 rounded-[44px] border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-3 shadow-2xl origin-top-left" style={{ width: frame.width + 24, height: frame.height + 24, transform: `scale(${scale})` }}>
            <div className="absolute left-1/2 top-4 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80 shadow-inner" />
            <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: frame.radius, backgroundColor: currentScreen?.backgroundColor || '#0C0A1A' }}>
              {/* Status bar */}
              <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-medium text-white/70">
                <span>9:41</span><span className="text-[9px] tracking-wider">●●●● 5G</span>
              </div>
              
              {/* Components */}
              <div className="relative" style={{ height: frame.height - 44 }}>
                {screenComps.map(renderComp)}
                {screenComps.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-white/20 text-sm gap-2">
                    <Smartphone className="h-8 w-8 opacity-50" />
                    Empty screen
                  </div>
                )}
                
                {/* Toast Overlay */}
                {toast && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-white/10 whitespace-nowrap animate-in fade-in slide-in-from-bottom-5">
                    {toast}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-violet-300/60 bg-violet-500/10 px-4 py-2 rounded-full border border-violet-500/20">
          <Smartphone className="h-3.5 w-3.5" />
          Live Preview Engine Active
        </div>
      </div>
    </div>
  );
};
