import { useRef, useCallback, useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { DEVICE_FRAMES, type ComponentType } from '@/types/builder';
import { CanvasComponent } from './CanvasComponent';

export const Canvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);

  const activeScreenId = useProjectStore((s) => s.activeScreenId);
  const components = useProjectStore((s) => s.components);
  const deviceFrame = useProjectStore((s) => s.deviceFrame);
  const canvasZoom = useProjectStore((s) => s.canvasZoom);
  const showGrid = useProjectStore((s) => s.showGrid);
  const selectedComponentId = useProjectStore((s) => s.selectedComponentId);
  const selectComponent = useProjectStore((s) => s.selectComponent);
  const addComponent = useProjectStore((s) => s.addComponent);
  const moveComponent = useProjectStore((s) => s.moveComponent);
  const screens = useProjectStore((s) => s.screens);
  const activeTool = useProjectStore((s) => s.activeTool);
  const setActiveTool = useProjectStore((s) => s.setActiveTool);

  const frame = DEVICE_FRAMES[deviceFrame];
  const activeScreen = screens.find((s) => s.id === activeScreenId);
  const screenComponents = Object.values(components)
    .filter((c) => c.screenId === activeScreenId)
    .sort((a, b) => a.zIndex - b.zIndex);

  // ── Drag state for moving components ──
  const [dragState, setDragState] = useState<{
    componentId: string;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [snapLines, setSnapLines] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Walk up from the clicked element to see if we are inside the device screen div
    const target = e.target as HTMLElement;
    const isInsideDevice = deviceRef.current?.contains(target);

    if (isInsideDevice) {
      if (activeTool !== 'select') {
        const rect = deviceRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvasZoom;
        const y = (e.clientY - rect.top) / canvasZoom;

        // Map every tool to a component type
        let typeToAdd: ComponentType = 'container';
        if (activeTool === 'rect')                              typeToAdd = 'container';
        else if (activeTool === 'circle')                       typeToAdd = 'avatar';
        else if (activeTool === 'text' || activeTool === 'heading') typeToAdd = 'text';
        else if (activeTool === 'line')                         typeToAdd = 'divider';
        else if (activeTool === 'arrow')                        typeToAdd = 'icon';
        else if (activeTool === 'pen')                          typeToAdd = 'icon';
        else if (activeTool === 'comment')                      typeToAdd = 'badge';
        // 'ai', 'scale' etc. fall through to 'container' default

        const id = addComponent(typeToAdd, Math.max(0, x - 50), Math.max(0, y - 20));
        
        // Set specific props for specialized tools
        if (activeTool === 'arrow') updateComponent(id, { props: { name: 'arrow-right', size: 32 } });
        else if (activeTool === 'pen') updateComponent(id, { props: { name: 'pen-tool', size: 32 } });
        else if (activeTool === 'comment') updateComponent(id, { props: { text: 'New Comment' } });
        else if (activeTool === 'circle') updateComponent(id, { styles: { borderRadius: 1000 } });
        
        setActiveTool('select');
      } else {
        // Only deselect if clicking on the empty screen background, not a component
        const isScreenBg =
          target === deviceRef.current ||
          target.classList.contains('device-screen') ||
          target.classList.contains('device-screen-empty');
        if (isScreenBg) selectComponent(null);
      }
    }
  };


  // ── Drop handler for new components from tray ──
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('component-type') as ComponentType;
    if (!type || !deviceRef.current) return;

    const rect = deviceRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasZoom;
    const y = (e.clientY - rect.top) / canvasZoom;
    addComponent(type, Math.max(0, x - 50), Math.max(0, y - 20));
  };

  // ── Mouse handlers for moving placed components ──
  const handleComponentMouseDown = useCallback((e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    const comp = components[componentId];
    if (!comp) return;

    selectComponent(componentId);

    if (comp.locked) return;

    const rect = deviceRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragState({
      componentId,
      startX: comp.x,
      startY: comp.y,
      offsetX: e.clientX / canvasZoom - comp.x,
      offsetY: e.clientY / canvasZoom - comp.y,
    });
  }, [components, canvasZoom, selectComponent]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState) return;

    let newX = e.clientX / canvasZoom - dragState.offsetX;
    let newY = e.clientY / canvasZoom - dragState.offsetY;
    
    let lineX: number | null = null;
    let lineY: number | null = null;
    const SNAP_TOLERANCE = 5;

    const currentComp = components[dragState.componentId];
    if (currentComp) {
      const myWidth = currentComp.width;
      const myHeight = currentComp.height;
      const myCenterX = newX + myWidth / 2;
      const myCenterY = newY + myHeight / 2;

      for (const comp of screenComponents) {
        if (comp.id === dragState.componentId) continue;

        // X Snapping
        const targetsX = [comp.x, comp.x + comp.width / 2, comp.x + comp.width];
        const myEdgesX = [newX, myCenterX, newX + myWidth];
        for (let i = 0; i < myEdgesX.length; i++) {
          for (const targetX of targetsX) {
            if (Math.abs(myEdgesX[i] - targetX) < SNAP_TOLERANCE) {
              newX = newX + (targetX - myEdgesX[i]);
              lineX = targetX;
              break;
            }
          }
          if (lineX !== null) break;
        }

        // Y Snapping
        const targetsY = [comp.y, comp.y + comp.height / 2, comp.y + comp.height];
        const myEdgesY = [newY, myCenterY, newY + myHeight];
        for (let i = 0; i < myEdgesY.length; i++) {
          for (const targetY of targetsY) {
            if (Math.abs(myEdgesY[i] - targetY) < SNAP_TOLERANCE) {
              newY = newY + (targetY - myEdgesY[i]);
              lineY = targetY;
              break;
            }
          }
          if (lineY !== null) break;
        }
      }

      // Snap to device center
      const deviceCenterX = frame.width / 2;
      if (Math.abs((newX + myWidth / 2) - deviceCenterX) < SNAP_TOLERANCE) {
        newX = deviceCenterX - myWidth / 2;
        lineX = deviceCenterX;
      }
      const deviceCenterY = frame.height / 2;
      if (Math.abs((newY + myHeight / 2) - deviceCenterY) < SNAP_TOLERANCE) {
        newY = deviceCenterY - myHeight / 2;
        lineY = deviceCenterY;
      }
    }

    setSnapLines({ x: lineX, y: lineY });
    moveComponent(dragState.componentId, newX, newY);
  }, [dragState, canvasZoom, moveComponent, components, screenComponents, frame]);

  const handleMouseUp = useCallback(() => {
    if (dragState) {
      useProjectStore.getState().pushHistory('Moved component');
    }
    setDragState(null);
    setSnapLines({ x: null, y: null });
  }, [dragState]);

  // ── Canvas scale ──
  const scaledWidth = frame.width * canvasZoom;
  const scaledHeight = frame.height * canvasZoom;

  return (
    <div
      ref={canvasRef}
      className="flex h-full w-full items-center justify-center overflow-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        backgroundImage: showGrid
          ? `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
             linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`
          : 'none',
        backgroundSize: `${32 * canvasZoom}px ${32 * canvasZoom}px`,
      }}
    >
      {/* Device frame container */}
      <div className="relative" style={{ width: scaledWidth + 24, height: scaledHeight + 24 }}>
        {/* Device outer bezel */}
        <div
          className="absolute inset-0 rounded-[calc(var(--br)+12px)] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.01] shadow-2xl shadow-black/40"
          style={{
            '--br': `${frame.radius * canvasZoom}px`,
            borderRadius: `${(frame.radius + 6) * canvasZoom}px`,
          } as React.CSSProperties}
        >
          {/* Notch */}
          <div
            className="absolute left-1/2 z-20 -translate-x-1/2 rounded-b-xl bg-black/90"
            style={{
              top: `${4 * canvasZoom}px`,
              width: `${100 * canvasZoom}px`,
              height: `${22 * canvasZoom}px`,
            }}
          />
        </div>

        {/* Device screen (drop zone) */}
        <div
          ref={deviceRef}
          className="device-screen absolute overflow-hidden"
          onClick={handleCanvasClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            top: 12,
            left: 12,
            width: scaledWidth,
            height: scaledHeight,
            borderRadius: `${frame.radius * canvasZoom}px`,
            backgroundColor: activeScreen?.backgroundColor || '#0C0A1A',
            // Show crosshair cursor when a draw tool is active
            cursor: activeTool !== 'select' ? 'crosshair' : 'default',
          }}
        >
          {/* Status bar */}
          <div
            className="relative z-30 flex items-center justify-between px-6"
            style={{
              height: `${44 * canvasZoom}px`,
              fontSize: `${11 * canvasZoom}px`,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <span>9:41</span>
            <span style={{ fontSize: `${9 * canvasZoom}px` }}>●●●● 5G</span>
          </div>

          {/* Components layer */}
          <div className="absolute inset-0" style={{ top: `${44 * canvasZoom}px` }}>
            {screenComponents.map((comp) => (
              <CanvasComponent
                key={comp.id}
                component={comp}
                zoom={canvasZoom}
                isSelected={selectedComponentId === comp.id}
                onMouseDown={(e) => handleComponentMouseDown(e, comp.id)}
              />
            ))}
          </div>

          {/* Smart Guides */}
          {snapLines.x !== null && (
            <div className="absolute top-0 bottom-0 z-40 border-l border-violet-500 shadow-[0_0_4px_#8b5cf6]" style={{ left: `${snapLines.x * canvasZoom}px` }} />
          )}
          {snapLines.y !== null && (
            <div className="absolute left-0 right-0 z-40 border-t border-violet-500 shadow-[0_0_4px_#8b5cf6]" style={{ top: `${snapLines.y * canvasZoom}px` }} />
          )}

          {/* Empty state */}
          {screenComponents.length === 0 && (
            <div className="device-screen-empty absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20">
              <div
                className="rounded-2xl border-2 border-dashed border-white/10 p-6 text-center"
                style={{ fontSize: `${12 * canvasZoom}px` }}
              >
                <p className="font-medium">
                  {activeTool !== 'select' ? `Click to place ${activeTool}` : 'Drop components here'}
                </p>
                <p className="mt-1 opacity-60">Drag from the left panel or click a tool then click here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
