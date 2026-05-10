import { useProjectStore } from '@/stores/projectStore';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Play,
  Download,
  Sparkles,
  Save,
  Grid3X3,
  Magnet,
  Monitor,
  ChevronDown,
  Figma,
  LayoutTemplate,
  QrCode,
} from 'lucide-react';
import { DEVICE_FRAMES, type DeviceFrame } from '@/types/builder';
import { useState, useCallback } from 'react';

export const Toolbar = () => {
  const projectName = useProjectStore((s) => s.projectName);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const canvasZoom = useProjectStore((s) => s.canvasZoom);
  const setCanvasZoom = useProjectStore((s) => s.setCanvasZoom);
  const showGrid = useProjectStore((s) => s.showGrid);
  const setShowGrid = useProjectStore((s) => s.setShowGrid);
  const snapToGrid = useProjectStore((s) => s.snapToGrid);
  const setSnapToGrid = useProjectStore((s) => s.setSnapToGrid);
  const deviceFrame = useProjectStore((s) => s.deviceFrame);
  const setDeviceFrame = useProjectStore((s) => s.setDeviceFrame);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const historyIndex = useProjectStore((s) => s.historyIndex);
  const historyLength = useProjectStore((s) => s.history.length);
  const setPreviewOpen = useProjectStore((s) => s.setPreviewOpen);
  const setApkModalOpen = useProjectStore((s) => s.setApkModalOpen);
  const setTemplateModalOpen = useProjectStore((s) => s.setTemplateModalOpen);
  const setFigmaModalOpen = useProjectStore((s) => s.setFigmaModalOpen);
  const setQrModalOpen = useProjectStore((s) => s.setQrModalOpen);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  const handleSave = useCallback(() => {
    const state = useProjectStore.getState();
    const data = {
      projectId: state.projectId,
      projectName: state.projectName,
      settings: state.settings,
      screens: state.screens,
      components: state.components,
      variables: state.variables,
      database: state.database,
      nativeFeatures: state.nativeFeatures,
    };
    localStorage.setItem(`forge_project_${state.projectId}`, JSON.stringify(data));
    const projects = JSON.parse(localStorage.getItem('forge_projects') || '[]');
    if (!projects.find((p: any) => p.id === state.projectId)) {
      projects.push({ id: state.projectId, name: state.projectName, updatedAt: Date.now() });
    } else {
      const idx = projects.findIndex((p: any) => p.id === state.projectId);
      projects[idx] = { id: state.projectId, name: state.projectName, updatedAt: Date.now() };
    }
    localStorage.setItem('forge_projects', JSON.stringify(projects));
  }, []);

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0E0E18] px-3">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="relative h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/30">
            <div className="absolute inset-[2px] rounded-[6px] bg-[#0E0E18]/80 backdrop-blur" />
            <Sparkles className="absolute inset-0 m-auto h-3.5 w-3.5 text-white" />
          </div>
        </a>

        <div className="h-5 w-px bg-white/10" />

        {/* Project name */}
        {isEditing ? (
          <input
            className="rounded bg-white/10 px-2 py-1 text-sm text-white outline-none ring-1 ring-violet-500"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded px-2 py-1 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
          >
            {projectName}
          </button>
        )}

        <div className="h-5 w-px bg-white/10" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="rounded p-1.5 text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= historyLength - 1}
            className="rounded p-1.5 text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Center section */}
      <div className="flex items-center gap-2">
        {/* Device picker */}
        <div className="relative">
          <button
            onClick={() => setShowDeviceMenu(!showDeviceMenu)}
            className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Monitor className="h-3.5 w-3.5" />
            {DEVICE_FRAMES[deviceFrame].name}
            <ChevronDown className="h-3 w-3" />
          </button>
          {showDeviceMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDeviceMenu(false)} />
              <div className="absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 rounded-lg border border-white/10 bg-[#18182a] p-1 shadow-xl">
                {(Object.keys(DEVICE_FRAMES) as DeviceFrame[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setDeviceFrame(key); setShowDeviceMenu(false); }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition ${
                      deviceFrame === key ? 'bg-violet-500/20 text-violet-300' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {DEVICE_FRAMES[key].name}
                    <span className="ml-auto text-white/30">{DEVICE_FRAMES[key].width}×{DEVICE_FRAMES[key].height}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button onClick={() => setCanvasZoom(canvasZoom - 0.1)} className="rounded p-1.5 text-white/50 transition hover:bg-white/5 hover:text-white">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-xs text-white/50">{Math.round(canvasZoom * 100)}%</span>
          <button onClick={() => setCanvasZoom(canvasZoom + 0.1)} className="rounded p-1.5 text-white/50 transition hover:bg-white/5 hover:text-white">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* Grid / Snap toggles */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`rounded p-1.5 transition ${showGrid ? 'bg-violet-500/20 text-violet-300' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
          title="Toggle Grid"
        >
          <Grid3X3 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`rounded p-1.5 transition ${snapToGrid ? 'bg-violet-500/20 text-violet-300' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
          title="Snap to Grid"
        >
          <Magnet className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFigmaModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <Figma className="h-3.5 w-3.5" /> Import
        </button>
        <button
          onClick={() => setTemplateModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <LayoutTemplate className="h-3.5 w-3.5" /> Templates
        </button>

        <div className="h-5 w-px bg-white/10" />

        <button onClick={handleSave} className="rounded p-1.5 text-white/50 transition hover:bg-white/5 hover:text-white" title="Save (Ctrl+S)">
          <Save className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/[0.1]"
        >
          <Play className="h-3.5 w-3.5" /> Preview
        </button>
        {/* QR Phone Preview */}
        <button
          onClick={() => setQrModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition hover:bg-violet-500/20"
          title="Open on phone via QR code"
        >
          <QrCode className="h-3.5 w-3.5" /> QR
        </button>
        <button
          onClick={() => setApkModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90"
        >
          <Download className="h-3.5 w-3.5" /> Generate APK
        </button>
      </div>
    </div>
  );
};
