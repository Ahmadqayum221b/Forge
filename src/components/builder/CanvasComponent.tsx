import { useProjectStore } from '@/stores/projectStore';
import type { AppComponent } from '@/types/builder';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SharedRenderer } from './SharedRenderer';

interface CanvasComponentProps {
  component: AppComponent;
  zoom: number;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const CanvasComponent = ({ component: comp, zoom, isSelected, onMouseDown }: CanvasComponentProps) => {
  const updateComponent = useProjectStore((s) => s.updateComponent);
  const resizeComponent = useProjectStore((s) => s.resizeComponent);
  const hoveredComponentId = useProjectStore((s) => s.hoveredComponentId);
  const hoverComponent = useProjectStore((s) => s.hoverComponent);
  const isHovered = hoveredComponentId === comp.id;

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // ── Resize handlers ──
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, _corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: comp.width,
      startH: comp.height,
    };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = (ev.clientX - resizeRef.current.startX) / zoom;
      const dy = (ev.clientY - resizeRef.current.startY) / zoom;
      resizeComponent(comp.id, resizeRef.current.startW + dx, resizeRef.current.startH + dy);
    };
    const onUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      useProjectStore.getState().pushHistory('Resized component');
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [comp.id, comp.width, comp.height, zoom, resizeComponent]);

  if (!comp.visible) return null;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: comp.x * zoom,
    top: comp.y * zoom,
    width: comp.width * zoom,
    height: comp.height * zoom,
    zIndex: comp.zIndex,
    cursor: comp.locked ? 'default' : isResizing ? 'nwse-resize' : 'move',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: comp.styles.opacity ?? 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
      style={style}
      onMouseDown={onMouseDown}
      onMouseEnter={() => hoverComponent(comp.id)}
      onMouseLeave={() => hoverComponent(null)}
      className={`group relative ${isSelected ? '' : ''}`}
    >
      {/* The visual component */}
      <div className="h-full w-full">
        <SharedRenderer component={comp} zoom={zoom} />
      </div>

      {/* Hover outline */}
      {isHovered && !isSelected && (
        <div className="pointer-events-none absolute inset-0 rounded border border-cyan-400/40" />
      )}

      {/* Selection outline + handles */}
      {isSelected && (
        <>
          <div className="pointer-events-none absolute inset-0 rounded border-2 border-violet-500 shadow-[0_0_0_1px_rgba(139,92,246,0.3)]" />
          {/* Resize handles */}
          {!comp.locked && (
            <>
              <div onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-sm border-2 border-violet-500 bg-white shadow" />
              <div onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                className="absolute -bottom-1.5 -left-1.5 h-3 w-3 cursor-nesw-resize rounded-sm border-2 border-violet-500 bg-white shadow" />
              <div onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                className="absolute -right-1.5 -top-1.5 h-3 w-3 cursor-nesw-resize rounded-sm border-2 border-violet-500 bg-white shadow" />
              <div onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                className="absolute -left-1.5 -top-1.5 h-3 w-3 cursor-nwse-resize rounded-sm border-2 border-violet-500 bg-white shadow" />
            </>
          )}
          {/* Component name label */}
          <div className="absolute -top-6 left-0 rounded bg-violet-600 px-1.5 py-0.5 text-[9px] font-medium text-white whitespace-nowrap shadow">
            {comp.name}
          </div>
        </>
      )}
    </motion.div>
  );
};


