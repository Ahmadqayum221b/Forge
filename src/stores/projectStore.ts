import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  AppComponent,
  AppScreen,
  AppVariable,
  DatabaseTable,
  NativeFeature,
  ProjectSettings,
  ComponentType,
  ComponentLogic,
  COMPONENT_DEFAULTS,
  DeviceFrame,
  LeftPanelTab,
  RightPanelTab,
  HistoryEntry,
} from '@/types/builder';
import { COMPONENT_DEFAULTS as DEFAULTS } from '@/types/builder';

interface ProjectState {
  // ── Project data ──
  projectId: string;
  projectName: string;
  settings: ProjectSettings;
  screens: AppScreen[];
  components: Record<string, AppComponent>;
  variables: AppVariable[];
  database: DatabaseTable[];
  nativeFeatures: NativeFeature[];

  // ── UI state ──
  activeScreenId: string;
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  leftPanelTab: LeftPanelTab;
  rightPanelTab: RightPanelTab;
  deviceFrame: DeviceFrame;
  canvasZoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  isDragging: boolean;
  isPreviewOpen: boolean;
  isApkModalOpen: boolean;
  isTemplateModalOpen: boolean;
  isFigmaModalOpen: boolean;
  isQrModalOpen: boolean;

  // ── History ──
  history: HistoryEntry[];
  historyIndex: number;

  // ── Actions ──
  setProjectName: (name: string) => void;
  setSettings: (settings: Partial<ProjectSettings>) => void;

  // Screen actions
  addScreen: (name?: string) => void;
  removeScreen: (id: string) => void;
  updateScreen: (id: string, data: Partial<AppScreen>) => void;
  reorderScreens: (fromIndex: number, toIndex: number) => void;
  setActiveScreen: (id: string) => void;
  duplicateScreen: (id: string) => void;

  // Component actions
  addComponent: (type: ComponentType, x?: number, y?: number) => string;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, data: Partial<AppComponent>) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  resizeComponent: (id: string, width: number, height: number) => void;
  selectComponent: (id: string | null) => void;
  hoverComponent: (id: string | null) => void;
  duplicateComponent: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  alignComponent: (id: string, alignment: 'left'|'center'|'right'|'top'|'middle'|'bottom', frameWidth: number, frameHeight: number) => void;

  // Logic actions
  addLogic: (componentId: string, logic: Omit<ComponentLogic, 'id'>) => void;
  updateLogic: (componentId: string, logicId: string, data: Partial<ComponentLogic>) => void;
  removeLogic: (componentId: string, logicId: string) => void;

  // Variable actions
  addVariable: (variable: Omit<AppVariable, 'id'>) => void;
  updateVariable: (id: string, data: Partial<AppVariable>) => void;
  removeVariable: (id: string) => void;

  // Database actions
  addTable: (name: string) => void;
  removeTable: (id: string) => void;
  updateTable: (id: string, data: Partial<DatabaseTable>) => void;

  // Native features
  toggleNativeFeature: (id: string) => void;

  // UI actions
  setLeftPanelTab: (tab: LeftPanelTab) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setDeviceFrame: (frame: DeviceFrame) => void;
  setCanvasZoom: (zoom: number) => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setPreviewOpen: (open: boolean) => void;
  setApkModalOpen: (open: boolean) => void;
  setTemplateModalOpen: (open: boolean) => void;
  setFigmaModalOpen: (open: boolean) => void;
  setQrModalOpen: (open: boolean) => void;

  // Batch component add (used by AI generator)
  addComponents: (components: Array<Partial<AppComponent> & { type: ComponentType }>) => void;

  // History
  pushHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;

  // Project
  loadProject: (data: any) => void;
  resetProject: () => void;
  getActiveScreenComponents: () => AppComponent[];
}

const DEFAULT_NATIVE_FEATURES: NativeFeature[] = [
  { id: 'gps', name: 'GPS / Maps', description: 'Access device location and display maps', icon: 'MapPin', enabled: false, permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'] },
  { id: 'camera', name: 'Camera & Gallery', description: 'Take photos and access the gallery', icon: 'Camera', enabled: false, permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE'] },
  { id: 'push', name: 'Push Notifications', description: 'Send push notifications to users', icon: 'Bell', enabled: false, permissions: ['POST_NOTIFICATIONS'] },
  { id: 'biometric', name: 'Biometric Login', description: 'Fingerprint and face authentication', icon: 'Fingerprint', enabled: false, permissions: ['USE_BIOMETRIC'] },
  { id: 'share', name: 'Share', description: 'Share content with other apps', icon: 'Share2', enabled: false, permissions: [] },
  { id: 'vibration', name: 'Vibration', description: 'Haptic feedback and vibration', icon: 'Vibrate', enabled: false, permissions: ['VIBRATE'] },
];

const DEFAULT_SETTINGS: ProjectSettings = {
  appName: 'My App',
  packageName: 'com.forge.myapp',
  version: '1.0.0',
  versionCode: 1,
  primaryColor: '#6C3AED',
  accentColor: '#06B6D4',
  backgroundColor: '#0C0A1A',
  icon: null,
  splashScreen: null,
  orientation: 'portrait',
};

const initialScreenId = nanoid(8);

const INITIAL_STATE = {
  projectId: nanoid(12),
  projectName: 'Untitled Project',
  settings: { ...DEFAULT_SETTINGS },
  screens: [{ id: initialScreenId, name: 'Home', backgroundColor: '#0C0A1A', statusBarColor: '#000000', order: 0 }],
  components: {} as Record<string, AppComponent>,
  variables: [] as AppVariable[],
  database: [] as DatabaseTable[],
  nativeFeatures: [...DEFAULT_NATIVE_FEATURES],
  activeScreenId: initialScreenId,
  selectedComponentId: null as string | null,
  hoveredComponentId: null as string | null,
  leftPanelTab: 'components' as LeftPanelTab,
  rightPanelTab: 'inspector' as RightPanelTab,
  deviceFrame: 'pixel8' as DeviceFrame,
  canvasZoom: 0.65,
  showGrid: true,
  snapToGrid: true,
  gridSize: 8,
  isDragging: false,
  isPreviewOpen: false,
  isApkModalOpen: false,
  isTemplateModalOpen: false,
  isFigmaModalOpen: false,
  isQrModalOpen: false,
  history: [] as HistoryEntry[],
  historyIndex: -1,
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...INITIAL_STATE,

  setProjectName: (name) => set({ projectName: name }),
  setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),

  // ── Screens ──────────────────────────────────────────
  addScreen: (name) => {
    const id = nanoid(8);
    set((st) => ({
      screens: [...st.screens, {
        id,
        name: name || `Screen ${st.screens.length + 1}`,
        backgroundColor: '#0C0A1A',
        statusBarColor: '#000000',
        order: st.screens.length,
      }],
      activeScreenId: id,
    }));
  },

  removeScreen: (id) => set((st) => {
    if (st.screens.length <= 1) return st;
    const newScreens = st.screens.filter((s) => s.id !== id);
    const newComponents = { ...st.components };
    Object.keys(newComponents).forEach((cid) => {
      if (newComponents[cid].screenId === id) delete newComponents[cid];
    });
    return {
      screens: newScreens,
      components: newComponents,
      activeScreenId: st.activeScreenId === id ? newScreens[0].id : st.activeScreenId,
      selectedComponentId: null,
    };
  }),

  updateScreen: (id, data) => set((st) => ({
    screens: st.screens.map((s) => (s.id === id ? { ...s, ...data } : s)),
  })),

  reorderScreens: (from, to) => set((st) => {
    const arr = [...st.screens];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    return { screens: arr.map((s, i) => ({ ...s, order: i })) };
  }),

  setActiveScreen: (id) => set({ activeScreenId: id, selectedComponentId: null }),

  duplicateScreen: (id) => {
    const state = get();
    const src = state.screens.find((s) => s.id === id);
    if (!src) return;
    const newId = nanoid(8);
    const srcComponents = Object.values(state.components).filter((c) => c.screenId === id);
    const newComponents: Record<string, AppComponent> = {};
    srcComponents.forEach((c) => {
      const cid = nanoid(8);
      newComponents[cid] = { ...c, id: cid, screenId: newId, name: c.name };
    });
    set((st) => ({
      screens: [...st.screens, { ...src, id: newId, name: `${src.name} (copy)`, order: st.screens.length }],
      components: { ...st.components, ...newComponents },
      activeScreenId: newId,
    }));
  },

  // ── Components ───────────────────────────────────────
  addComponent: (type, x, y) => {
    const id = nanoid(8);
    const defaults = DEFAULTS[type];
    const state = get();
    const maxZ = Math.max(0, ...Object.values(state.components).filter(c => c.screenId === state.activeScreenId).map((c) => c.zIndex));
    const comp: AppComponent = {
      id,
      type,
      screenId: state.activeScreenId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}_${id.slice(0, 4)}`,
      x: x ?? 60,
      y: y ?? 100,
      width: defaults.width ?? 200,
      height: defaults.height ?? 44,
      props: { ...(defaults.props || {}) },
      styles: { ...(defaults.styles || {}) },
      logic: [],
      variableBindings: {},
      locked: false,
      visible: true,
      zIndex: maxZ + 1,
    };
    set((st) => ({
      components: { ...st.components, [id]: comp },
      selectedComponentId: id,
      rightPanelTab: 'inspector',
    }));
    get().pushHistory(`Added ${type}`);
    return id;
  },

  removeComponent: (id) => {
    set((st) => {
      const newComponents = { ...st.components };
      delete newComponents[id];
      return {
        components: newComponents,
        selectedComponentId: st.selectedComponentId === id ? null : st.selectedComponentId,
      };
    });
    get().pushHistory('Removed component');
  },

  updateComponent: (id, data) => set((st) => ({
    components: {
      ...st.components,
      [id]: { ...st.components[id], ...data },
    },
  })),

  moveComponent: (id, x, y) => {
    const state = get();
    const gridSize = state.snapToGrid ? state.gridSize : 1;
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    set((st) => ({
      components: {
        ...st.components,
        [id]: { ...st.components[id], x: snappedX, y: snappedY },
      },
    }));
  },

  resizeComponent: (id, width, height) => set((st) => ({
    components: {
      ...st.components,
      [id]: { ...st.components[id], width: Math.max(20, width), height: Math.max(10, height) },
    },
  })),

  selectComponent: (id) => set({ selectedComponentId: id }),
  hoverComponent: (id) => set({ hoveredComponentId: id }),

  duplicateComponent: (id) => {
    const state = get();
    const src = state.components[id];
    if (!src) return;
    const newId = nanoid(8);
    set((st) => ({
      components: {
        ...st.components,
        [newId]: { ...src, id: newId, name: `${src.name}_copy`, x: src.x + 16, y: src.y + 16 },
      },
      selectedComponentId: newId,
    }));
    get().pushHistory('Duplicated component');
  },

  bringToFront: (id) => {
    const state = get();
    const maxZ = Math.max(0, ...Object.values(state.components).map((c) => c.zIndex));
    set((st) => ({
      components: { ...st.components, [id]: { ...st.components[id], zIndex: maxZ + 1 } },
    }));
  },

  sendToBack: (id) => {
    set((st) => ({
      components: { ...st.components, [id]: { ...st.components[id], zIndex: 0 } },
    }));
  },

  // ── Logic ────────────────────────────────────────────
  addLogic: (componentId, logic) => {
    const id = nanoid(8);
    set((st) => ({
      components: {
        ...st.components,
        [componentId]: {
          ...st.components[componentId],
          logic: [...st.components[componentId].logic, { ...logic, id }],
        },
      },
    }));
  },

  updateLogic: (componentId, logicId, data) => set((st) => ({
    components: {
      ...st.components,
      [componentId]: {
        ...st.components[componentId],
        logic: st.components[componentId].logic.map((l) =>
          l.id === logicId ? { ...l, ...data } : l
        ),
      },
    },
  })),

  removeLogic: (componentId, logicId) => set((st) => ({
    components: {
      ...st.components,
      [componentId]: {
        ...st.components[componentId],
        logic: st.components[componentId].logic.filter((l) => l.id !== logicId),
      },
    },
  })),

  // ── Variables ────────────────────────────────────────
  addVariable: (v) => set((st) => ({
    variables: [...st.variables, { ...v, id: nanoid(8) }],
  })),

  updateVariable: (id, data) => set((st) => ({
    variables: st.variables.map((v) => (v.id === id ? { ...v, ...data } : v)),
  })),

  removeVariable: (id) => set((st) => ({
    variables: st.variables.filter((v) => v.id !== id),
  })),

  // ── Database ─────────────────────────────────────────
  addTable: (name) => set((st) => ({
    database: [...st.database, { id: nanoid(8), name, columns: [{ id: nanoid(6), name: 'id', type: 'text' }], rows: [] }],
  })),

  removeTable: (id) => set((st) => ({
    database: st.database.filter((t) => t.id !== id),
  })),

  updateTable: (id, data) => set((st) => ({
    database: st.database.map((t) => (t.id === id ? { ...t, ...data } : t)),
  })),

  // ── Native features ─────────────────────────────────
  toggleNativeFeature: (id) => set((st) => ({
    nativeFeatures: st.nativeFeatures.map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ),
  })),

  // ── UI state ─────────────────────────────────────────
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setDeviceFrame: (frame) => set({ deviceFrame: frame }),
  setCanvasZoom: (zoom) => set({ canvasZoom: Math.max(0.25, Math.min(2, zoom)) }),
  setShowGrid: (show) => set({ showGrid: show }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setPreviewOpen: (open) => set({ isPreviewOpen: open }),
  setApkModalOpen: (open) => set({ isApkModalOpen: open }),
  setTemplateModalOpen: (open) => set({ isTemplateModalOpen: open }),
  setFigmaModalOpen: (open) => set({ isFigmaModalOpen: open }),
  setQrModalOpen: (open) => set({ isQrModalOpen: open }),

  addComponents: (comps) => {
    const state = get();
    const maxZ = Math.max(0, ...Object.values(state.components).filter(c => c.screenId === state.activeScreenId).map(c => c.zIndex));
    const newComponents: Record<string, AppComponent> = {};
    comps.forEach((c, i) => {
      const id = nanoid(8);
      const defaults = DEFAULTS[c.type];
      newComponents[id] = {
        id,
        type: c.type,
        screenId: state.activeScreenId,
        name: `${c.type}_${id.slice(0, 4)}`,
        x: c.x ?? 60,
        y: c.y ?? 100,
        width: c.width ?? defaults?.width ?? 200,
        height: c.height ?? defaults?.height ?? 44,
        props: { ...(defaults?.props || {}), ...(c.props || {}) },
        styles: { ...(defaults?.styles || {}), ...(c.styles || {}) },
        logic: [],
        variableBindings: {},
        locked: false,
        visible: true,
        zIndex: maxZ + i + 1,
      };
    });
    set(st => ({ components: { ...st.components, ...newComponents } }));
    get().pushHistory(`AI generated ${comps.length} component(s)`);
  },

  // ── History ──────────────────────────────────────────
  pushHistory: (description) => set((st) => {
    const entry: HistoryEntry = {
      timestamp: Date.now(),
      description,
      snapshot: {
        components: JSON.parse(JSON.stringify(st.components)),
        screens: JSON.parse(JSON.stringify(st.screens)),
      },
    };
    const newHistory = st.history.slice(0, st.historyIndex + 1);
    newHistory.push(entry);
    if (newHistory.length > 50) newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }),

  undo: () => set((st) => {
    if (st.historyIndex <= 0) return st;
    const prevIndex = st.historyIndex - 1;
    const entry = st.history[prevIndex];
    return {
      components: JSON.parse(JSON.stringify(entry.snapshot.components)),
      screens: JSON.parse(JSON.stringify(entry.snapshot.screens)),
      historyIndex: prevIndex,
      selectedComponentId: null,
    };
  }),

  redo: () => set((st) => {
    if (st.historyIndex >= st.history.length - 1) return st;
    const nextIndex = st.historyIndex + 1;
    const entry = st.history[nextIndex];
    return {
      components: JSON.parse(JSON.stringify(entry.snapshot.components)),
      screens: JSON.parse(JSON.stringify(entry.snapshot.screens)),
      historyIndex: nextIndex,
      selectedComponentId: null,
    };
  }),

  // ── Project ──────────────────────────────────────────
  loadProject: (data) => set({
    projectId: data.projectId || nanoid(12),
    projectName: data.projectName || 'Loaded Project',
    settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
    screens: data.screens || INITIAL_STATE.screens,
    components: data.components || {},
    variables: data.variables || [],
    database: data.database || [],
    nativeFeatures: data.nativeFeatures || [...DEFAULT_NATIVE_FEATURES],
    activeScreenId: data.screens?.[0]?.id || INITIAL_STATE.activeScreenId,
    selectedComponentId: null,
    history: [],
    historyIndex: -1,
  }),

  resetProject: () => {
    const newScreenId = nanoid(8);
    set({
      ...INITIAL_STATE,
      projectId: nanoid(12),
      screens: [{ id: newScreenId, name: 'Home', backgroundColor: '#0C0A1A', statusBarColor: '#000000', order: 0 }],
      activeScreenId: newScreenId,
      history: [],
      historyIndex: -1,
    });
  },

  getActiveScreenComponents: () => {
    const state = get();
    return Object.values(state.components)
      .filter((c) => c.screenId === state.activeScreenId)
      .sort((a, b) => a.zIndex - b.zIndex);
  },
}));
