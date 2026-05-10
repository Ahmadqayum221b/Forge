// ── Forge Builder Type Definitions ──────────────────────────────────

export type ComponentType =
  | 'button'
  | 'text'
  | 'image'
  | 'input'
  | 'textarea'
  | 'switch'
  | 'slider'
  | 'checkbox'
  | 'radio'
  | 'container'
  | 'card'
  | 'divider'
  | 'spacer'
  | 'list'
  | 'icon'
  | 'map'
  | 'video'
  | 'header'
  | 'badge'
  | 'progress'
  | 'tabs'
  | 'avatar';

export type TriggerType = 'on_click' | 'on_double_click' | 'on_long_press' | 'on_swipe_left' | 'on_swipe_right' | 'on_change' | 'on_load';

export type ActionType =
  | 'navigate'
  | 'go_back'
  | 'open_url'
  | 'open_camera'
  | 'get_location'
  | 'show_notification'
  | 'vibrate'
  | 'set_variable'
  | 'save_to_db'
  | 'read_from_db'
  | 'show_alert'
  | 'show_toast'
  | 'show_loading'
  | 'hide_loading'
  | 'share'
  | 'open_email'
  | 'open_phone'
  | 'play_sound'
  | 'delay'
  | 'animate'
  | 'condition_if'
  | 'loop'
  | 'api_request'
  | 'set_state'
  | 'math_operation'
  | 'format_date'
  | 'validate_form'
  | 'logic_gate'
  | 'logic_switch'
  | 'math_multi'
  | 'data_transform'
  | 'user_auth'
  | 'file_upload';

export type VariableType = 'string' | 'number' | 'boolean' | 'image' | 'list';

export type DeviceFrame = 'iphone15' | 'pixel8' | 'ipad' | 'custom';

export interface ComponentLogic {
  id: string;
  trigger: TriggerType;
  action: ActionType;
  params: Record<string, any>;
}

export interface AppComponent {
  id: string;
  type: ComponentType;
  screenId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, any>;
  styles: Record<string, any>;
  logic: ComponentLogic[];
  variableBindings: Record<string, string>; // propName -> variableId
  locked: boolean;
  visible: boolean;
  zIndex: number;
}

export interface AppScreen {
  id: string;
  name: string;
  backgroundColor: string;
  statusBarColor: string;
  order: number;
}

export interface AppVariable {
  id: string;
  name: string;
  type: VariableType;
  defaultValue: any;
  description: string;
}

export interface DatabaseColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'image_url';
}

export interface DatabaseTable {
  id: string;
  name: string;
  columns: DatabaseColumn[];
  rows: Record<string, any>[];
}

export interface NativeFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  permissions: string[];
}

export interface ProjectSettings {
  appName: string;
  packageName: string;
  version: string;
  versionCode: number;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  icon: string | null;
  splashScreen: string | null;
  orientation: 'portrait' | 'landscape' | 'both';
}

export interface HistoryEntry {
  timestamp: number;
  description: string;
  snapshot: {
    components: Record<string, AppComponent>;
    screens: AppScreen[];
  };
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: ProjectSettings;
  screens: AppScreen[];
  components: Record<string, AppComponent>;
  variables: AppVariable[];
  database: DatabaseTable[];
  nativeFeatures: NativeFeature[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  screens: AppScreen[];
  components: Record<string, AppComponent>;
  variables: AppVariable[];
  database: DatabaseTable[];
  tags: string[];
}

export type TemplateCategory =
  | 'ecommerce'
  | 'fitness'
  | 'social'
  | 'booking'
  | 'productivity'
  | 'education'
  | 'restaurant';

export type LeftPanelTab = 'components' | 'layers' | 'screens' | 'variables' | 'database' | 'history' | 'packages';
export type RightPanelTab = 'inspector' | 'logic' | 'native';

// ── Component defaults ─────────────────────────────────────────────

export const COMPONENT_DEFAULTS: Record<ComponentType, Partial<AppComponent>> = {
  button: {
    width: 200,
    height: 44,
    props: { label: 'Button', variant: 'filled' },
    styles: {
      backgroundColor: '#6C3AED',
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      borderRadius: 12,
      borderWidth: 0,
      borderColor: '#000000',
      boxShadow: 'none',
      opacity: 1,
    },
  },
  text: {
    width: 200,
    height: 28,
    props: { content: 'Text Label', align: 'left' },
    styles: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
  },
  image: {
    width: 200,
    height: 150,
    props: { src: '', alt: 'Image', fit: 'cover' },
    styles: {
      borderRadius: 12,
      borderWidth: 0,
      borderColor: '#000000',
      opacity: 1,
      boxShadow: 'none',
    },
  },
  input: {
    width: 260,
    height: 44,
    props: { placeholder: 'Enter text...', type: 'text', label: '' },
    styles: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#FFFFFF',
      fontSize: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
      paddingX: 12,
    },
  },
  textarea: {
    width: 260,
    height: 100,
    props: { placeholder: 'Enter text...', rows: 4 },
    styles: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#FFFFFF',
      fontSize: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
      paddingX: 12,
      paddingY: 10,
    },
  },
  switch: {
    width: 52,
    height: 28,
    props: { checked: false, label: '' },
    styles: {
      activeColor: '#6C3AED',
      inactiveColor: 'rgba(255,255,255,0.15)',
    },
  },
  slider: {
    width: 260,
    height: 32,
    props: { min: 0, max: 100, value: 50, step: 1, label: '' },
    styles: {
      trackColor: 'rgba(255,255,255,0.15)',
      activeColor: '#6C3AED',
      thumbColor: '#FFFFFF',
    },
  },
  checkbox: {
    width: 200,
    height: 28,
    props: { checked: false, label: 'Option' },
    styles: {
      color: '#FFFFFF',
      activeColor: '#6C3AED',
      fontSize: 14,
    },
  },
  radio: {
    width: 200,
    height: 28,
    props: { selected: false, label: 'Choice', group: 'default' },
    styles: {
      color: '#FFFFFF',
      activeColor: '#6C3AED',
      fontSize: 14,
    },
  },
  container: {
    width: 280,
    height: 200,
    props: { direction: 'column', gap: 8 },
    styles: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
      padding: 16,
      boxShadow: 'none',
      opacity: 1,
    },
  },
  card: {
    width: 260,
    height: 180,
    props: { title: 'Card Title', subtitle: 'Description' },
    styles: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      padding: 16,
      boxShadow: 'none',
      opacity: 1,
    },
  },
  divider: {
    width: 260,
    height: 1,
    props: {},
    styles: {
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
  },
  spacer: {
    width: 260,
    height: 24,
    props: {},
    styles: {},
  },
  list: {
    width: 280,
    height: 240,
    props: { items: ['Item 1', 'Item 2', 'Item 3'], itemHeight: 48 },
    styles: {
      backgroundColor: 'rgba(255,255,255,0.04)',
      borderRadius: 16,
      dividerColor: 'rgba(255,255,255,0.08)',
      itemColor: '#FFFFFF',
      fontSize: 14,
    },
  },
  icon: {
    width: 40,
    height: 40,
    props: { name: 'star', size: 24 },
    styles: {
      color: '#6C3AED',
    },
  },
  map: {
    width: 280,
    height: 200,
    props: { lat: 37.7749, lng: -122.4194, zoom: 12 },
    styles: {
      borderRadius: 16,
    },
  },
  video: {
    width: 280,
    height: 180,
    props: { src: '', autoplay: false, controls: true },
    styles: {
      borderRadius: 16,
    },
  },
  header: {
    width: 393,
    height: 60,
    props: { title: 'Page Title', showBack: true, showAction: false },
    styles: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  },
  badge: {
    width: 60,
    height: 24,
    props: { text: 'New' },
    styles: { backgroundColor: '#EC4899', color: '#FFFFFF', borderRadius: 12, fontSize: 10, fontWeight: '700' },
  },
  progress: {
    width: 260,
    height: 8,
    props: { value: 60 },
    styles: { trackColor: 'rgba(255,255,255,0.1)', activeColor: '#6C3AED', borderRadius: 4 },
  },
  tabs: {
    width: 393,
    height: 48,
    props: { tabs: ['Home', 'Search', 'Profile'], activeIndex: 0 },
    styles: { backgroundColor: 'transparent', activeColor: '#FFFFFF', inactiveColor: 'rgba(255,255,255,0.4)', indicatorColor: '#6C3AED' },
  },
  avatar: {
    width: 48,
    height: 48,
    props: { src: '', fallback: 'US' },
    styles: { borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  },
};

// ── Device frame dimensions ────────────────────────────────────────

export const DEVICE_FRAMES: Record<DeviceFrame, { width: number; height: number; name: string; radius: number }> = {
  iphone15: { width: 393, height: 852, name: 'iPhone 15', radius: 44 },
  pixel8: { width: 412, height: 915, name: 'Pixel 8', radius: 36 },
  ipad: { width: 820, height: 1180, name: 'iPad Air', radius: 24 },
  custom: { width: 400, height: 800, name: 'Custom', radius: 20 },
};

// ── Action definitions ─────────────────────────────────────────────

export interface ActionDefinition {
  type: ActionType;
  label: string;
  category: string;
  icon: string;
  params: { key: string; label: string; type: 'string' | 'number' | 'screen' | 'variable' | 'boolean' }[];
  inputs?: { id: string; label: string; type: string }[];
  outputs?: { id: string; label: string; type: string }[];
}

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  { type: 'navigate', label: 'Go to Screen', category: 'Navigation', icon: 'ArrowRight', params: [{ key: 'screenId', label: 'Target Screen', type: 'screen' }] },
  { type: 'go_back', label: 'Go Back', category: 'Navigation', icon: 'ArrowLeft', params: [] },
  { type: 'open_url', label: 'Open URL', category: 'Navigation', icon: 'ExternalLink', params: [{ key: 'url', label: 'URL', type: 'string' }] },
  { type: 'set_variable', label: 'Set Variable', category: 'Data', icon: 'Variable', params: [{ key: 'variableId', label: 'Variable', type: 'variable' }, { key: 'value', label: 'Value', type: 'string' }] },
  { type: 'save_to_db', label: 'Save to Database', category: 'Data', icon: 'Database', params: [{ key: 'table', label: 'Table', type: 'string' }] },
  { type: 'read_from_db', label: 'Read from Database', category: 'Data', icon: 'Download', params: [{ key: 'table', label: 'Table', type: 'string' }] },
  { type: 'open_camera', label: 'Open Camera', category: 'Device', icon: 'Camera', params: [] },
  { type: 'get_location', label: 'Get Location', category: 'Device', icon: 'MapPin', params: [] },
  { type: 'show_notification', label: 'Show Notification', category: 'Device', icon: 'Bell', params: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'body', label: 'Body', type: 'string' }] },
  { type: 'vibrate', label: 'Vibrate', category: 'Device', icon: 'Smartphone', params: [] },
  { type: 'show_alert', label: 'Show Alert', category: 'UI', icon: 'AlertCircle', params: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'message', label: 'Message', type: 'string' }] },
  { type: 'show_toast', label: 'Show Toast', category: 'UI', icon: 'MessageSquare', params: [{ key: 'message', label: 'Message', type: 'string' }] },
  { type: 'show_loading', label: 'Show Loading', category: 'UI', icon: 'Loader', params: [] },
  { type: 'hide_loading', label: 'Hide Loading', category: 'UI', icon: 'X', params: [] },
  { type: 'share', label: 'Share', category: 'Social', icon: 'Share2', params: [{ key: 'text', label: 'Text', type: 'string' }] },
  { type: 'open_email', label: 'Open Email', category: 'Social', icon: 'Mail', params: [{ key: 'to', label: 'Email', type: 'string' }] },
  { type: 'open_phone', label: 'Open Phone', category: 'Social', icon: 'Phone', params: [{ key: 'number', label: 'Phone Number', type: 'string' }] },
  { type: 'play_sound', label: 'Play Sound', category: 'UI', icon: 'Volume2', params: [{ key: 'soundUrl', label: 'Sound URL', type: 'string' }] },
  { type: 'delay', label: 'Wait / Delay', category: 'Logic', icon: 'Clock', params: [{ key: 'durationMs', label: 'Duration (ms)', type: 'number' }] },
  { type: 'animate', label: 'Animate', category: 'UI', icon: 'Wand2', params: [{ key: 'animationType', label: 'Type (bounce, fade, etc)', type: 'string' }] },
  { type: 'condition_if', label: 'If Condition', category: 'Logic', icon: 'GitBranch', params: [{ key: 'condition', label: 'Expression (e.g. x > 5)', type: 'string' }] },
  { type: 'loop', label: 'For Each Loop', category: 'Logic', icon: 'Repeat', params: [{ key: 'listVariable', label: 'List Variable', type: 'variable' }] },
  { type: 'api_request', label: 'API Request', category: 'Data', icon: 'Globe', params: [{ key: 'url', label: 'Endpoint URL', type: 'string' }, { key: 'method', label: 'Method (GET, POST)', type: 'string' }] },
  { type: 'set_state', label: 'Set Component State', category: 'UI', icon: 'Settings2', params: [{ key: 'componentId', label: 'Target Component', type: 'string' }, { key: 'property', label: 'Property (e.g. visible)', type: 'string' }, { key: 'value', label: 'New Value', type: 'string' }] },
  { type: 'math_operation', label: 'Math Operation', category: 'Logic', icon: 'Calculator', params: [{ key: 'expression', label: 'Equation (e.g. x + y)', type: 'string' }] },
  { type: 'format_date', label: 'Format Date', category: 'Data', icon: 'Calendar', params: [{ key: 'date', label: 'Date Value', type: 'string' }, { key: 'format', label: 'Format String', type: 'string' }] },
  { type: 'validate_form', label: 'Validate Form', category: 'Data', icon: 'CheckSquare', params: [{ key: 'formId', label: 'Form Container ID', type: 'string' }] },
  { 
    type: 'logic_gate', 
    label: 'Logical Gate (AND/OR)', 
    category: 'Logic', 
    icon: 'GitBranch', 
    params: [{ key: 'op', label: 'Operator', type: 'string' }],
    inputs: [
      { id: 'in1', label: 'Input A', type: 'boolean' },
      { id: 'in2', label: 'Input B', type: 'boolean' }
    ],
    outputs: [
      { id: 'out', label: 'Result', type: 'boolean' }
    ]
  },
  {
    type: 'math_multi',
    label: 'Advanced Math',
    category: 'Logic',
    icon: 'Calculator',
    params: [],
    inputs: [
      { id: 'a', label: 'A', type: 'number' },
      { id: 'b', label: 'B', type: 'number' },
      { id: 'c', label: 'C', type: 'number' }
    ],
    outputs: [
      { id: 'sum', label: 'Sum', type: 'number' },
      { id: 'avg', label: 'Average', type: 'number' }
    ]
  },
  {
    type: 'user_auth',
    label: 'User Authentication',
    category: 'Social',
    icon: 'UserCheck',
    params: [],
    inputs: [
      { id: 'email', label: 'Email', type: 'string' },
      { id: 'pass', label: 'Password', type: 'string' }
    ],
    outputs: [
      { id: 'success', label: 'Success', type: 'event' },
      { id: 'error', label: 'Error', type: 'event' }
    ]
  }
];
