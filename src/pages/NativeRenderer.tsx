import { useState, useEffect } from 'react';
import type { AppComponent, AppScreen } from '@/types/builder';
import { SharedRenderer } from '@/components/builder/SharedRenderer';

export const NativeRenderer = () => {
  const [projectData, setProjectData] = useState<any>(null);
  const [currentScreenId, setCurrentScreenId] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real native app built by our backend, the JSON will be placed in /project.json
    fetch('/project.json')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load project.json');
        return res.json();
      })
      .then((data) => {
        setProjectData(data);
        if (data.screens && data.screens.length > 0) {
          setCurrentScreenId(data.screens.sort((a: any, b: any) => a.order - b.order)[0].id);
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return <div className="flex h-screen items-center justify-center bg-black text-white p-4 text-center">Error loading app configuration: {error}</div>;
  }

  if (!projectData || !currentScreenId) {
    return <div className="flex h-screen items-center justify-center bg-black text-white">Loading App...</div>;
  }

  const screens: AppScreen[] = projectData.screens || [];
  const components: Record<string, AppComponent> = projectData.components || {};
  const currentScreen = screens.find((s) => s.id === currentScreenId);

  const screenComps = Object.values(components)
    .filter((c) => c.screenId === currentScreenId && c.visible !== false)
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

  const handleAction = (action: string, params: Record<string, any>) => {
    switch (action) {
      case 'navigate': if (params.screenId) navigate(params.screenId); break;
      case 'go_back': goBack(); break;
      case 'show_alert': alert(`${params.title || 'Alert'}\n${params.message || ''}`); break;
      case 'open_url': if (params.url) window.open(params.url, '_blank'); break;
      case 'vibrate': navigator.vibrate?.(200); break;
      case 'share': navigator.share?.({ text: params.text || 'Shared from Forge' }).catch(() => {}); break;
    }
  };

  const renderComp = (comp: any) => {
    const s = comp.styles;
    const p = comp.props;
    const onClick = () => {
      comp.logic?.filter((l: any) => l.trigger === 'on_click').forEach((l: any) => handleAction(l.action, l.params));
    };

    const base: React.CSSProperties = {
      position: 'absolute', left: comp.x, top: comp.y, width: comp.width, height: comp.height, zIndex: comp.zIndex,
      opacity: s.opacity ?? 1,
    };

    return (
      <div key={comp.id} style={base} onClick={onClick} className={comp.type === 'button' ? 'cursor-pointer active:scale-95 transition-transform' : ''}>
        <SharedRenderer component={comp} zoom={1} />
      </div>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ backgroundColor: currentScreen?.backgroundColor || '#0C0A1A' }}>
      {screenComps.map(renderComp)}
    </div>
  );
};
