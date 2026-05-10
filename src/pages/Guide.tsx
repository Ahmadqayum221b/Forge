import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, ChevronDown, ChevronRight,
  Monitor, Smartphone, Download, QrCode, Zap, GitBranch,
  Layers, LayoutTemplate, Database, Variable, Package,
  Play, FolderOpen, MousePointer2, Type, Square,
  CheckCircle2, Terminal, ExternalLink,
} from 'lucide-react';

// ── Data ───────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'start',
    icon: Sparkles,
    color: '#A78BFA',
    title: 'Getting Started',
    steps: [
      {
        title: 'Open the Builder',
        desc: 'Click "Start Building" on the home page, or go to /builder. Your project auto-saves to local storage — no account needed.',
        tip: 'Give your project a name by clicking the title in the top toolbar.',
      },
      {
        title: 'Choose a Device Frame',
        desc: 'Use the device picker in the top toolbar (default: Pixel 7 Pro). The canvas shows your app at the exact screen size.',
        tip: 'You can switch frames at any time — your layout adapts.',
      },
      {
        title: 'Add Your First Component',
        desc: 'Drag a component from the left panel onto the device screen, OR select a tool from the floating bottom toolbar and click anywhere on the screen.',
        tip: 'Press V = Select · R = Rectangle · T = Text · O = Circle',
      },
    ],
  },
  {
    id: 'design',
    icon: MousePointer2,
    color: '#60A5FA',
    title: 'Designing Screens',
    steps: [
      {
        title: 'Floating Toolbar Tools',
        desc: 'The toolbar at the bottom of the canvas has everything you need:\n• Select (V) — move & resize components\n• Rectangle (R) — add containers/boxes\n• Circle (O) — add circular shapes\n• Text (T) — add labels & headings\n• Pen (P) — freeform shapes\n• AI (G) — AI-generated components\n• Pan (H) — scroll the canvas\n• Zoom — use +/- or pinch on trackpad',
        tip: 'The zoom % in the toolbar is clickable to reset to 100%.',
      },
      {
        title: 'Inspecting & Styling',
        desc: 'Click any component to select it, then use the right panel (Inspector tab) to change colors, fonts, borders, opacity, padding, and more.',
        tip: 'Hold Shift to multi-select. Use Ctrl+Z / Ctrl+Y to undo/redo.',
      },
      {
        title: 'Layers & Z-Order',
        desc: 'Open the Layers tab in the left panel to see all components stacked by z-index. Drag to reorder. Click the eye icon to hide/show.',
        tip: 'Locked components (🔒) can\'t be accidentally moved.',
      },
      {
        title: 'Multiple Screens',
        desc: 'Open the Screens tab in the left panel to add, rename, or delete screens. You can navigate between them with logic actions.',
        tip: 'Set a background colour for each screen individually.',
      },
    ],
  },
  {
    id: 'logic',
    icon: GitBranch,
    color: '#F59E0B',
    title: 'Adding Logic (Blueprint Editor)',
    steps: [
      {
        title: 'Open the Blueprint Editor',
        desc: 'Select a component → click the Logic tab in the right panel → click "Open Blueprint". The visual node editor opens full-screen.',
        tip: 'You can also select a component and press the Logic tab shortcut.',
      },
      {
        title: 'Add Trigger Nodes',
        desc: 'Click "Add Node" and choose an EVENT (e.g. "On Tap"). This is the starting point for any logic flow.',
        tip: 'Events: On Tap · On Double Tap · On Long Press · On Load · On Change',
      },
      {
        title: 'Add Action Nodes',
        desc: 'Add action nodes (Navigate, Show Toast, Set Variable, Open URL, etc.) and connect them by clicking the orange output port, then clicking the input port of the next node.',
        tip: 'Click a wire to delete it. Hover over a wire to see the delete ×.',
      },
      {
        title: 'Save Logic',
        desc: 'Click "Save" in the Blueprint Editor. The logic is compiled and stored with the component. It runs in the phone preview and the exported app.',
        tip: 'The Logic tab in the right panel shows a summary of saved nodes.',
      },
    ],
  },
  {
    id: 'preview',
    icon: QrCode,
    color: '#34D399',
    title: 'Previewing on a Real Phone',
    steps: [
      {
        title: 'Click the QR Button',
        desc: 'In the top toolbar, click the "QR" button. A QR code is generated instantly — no server needed when deployed on Vercel.',
        tip: 'The QR encodes your entire project into the URL itself.',
      },
      {
        title: 'Scan with Your Phone',
        desc: 'Open your phone camera (or any QR scanner app) and scan the code. Your app opens in the phone browser at the /preview route.',
        tip: 'Works on both Android and iOS. No app install required.',
      },
      {
        title: 'For Live Sync (Local Only)',
        desc: 'If you run `node server.js` locally, the QR uses your network IP instead. Any changes you make sync to the phone in real-time over WiFi.',
        tip: 'Both your PC and phone must be on the same WiFi network.',
      },
    ],
  },
  {
    id: 'apk',
    icon: Download,
    color: '#F97316',
    title: 'Generating a Real Android APK',
    steps: [
      {
        title: 'What happens on Vercel',
        desc: 'When using the hosted version (Vercel), clicking "Generate APK" runs a simulation and downloads a .json project file. This is a full export of your design — not the final APK.',
        tip: 'The JSON contains all screens, components, variables, and logic.',
      },
      {
        title: 'Step 1 — Clone the repo locally',
        desc: 'Download or clone the Forge repo to your Windows PC:\n\ngit clone https://github.com/your-repo/forge\ncd forge\nnpm install',
        tip: 'You need Node.js 18+ and Git installed.',
      },
      {
        title: 'Step 2 — Install Android requirements',
        desc: 'You need:\n• Android Studio (includes the Android SDK)\n• Java JDK 17 (bundled with Android Studio)\n\nSet environment variables:\nJAVA_HOME = C:\\path\\to\\Android Studio\\jbr\nANDROID_HOME = C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk',
        tip: 'server.js auto-detects these paths on Windows.',
      },
      {
        title: 'Step 3 — Start the local backend',
        desc: 'In the repo folder, run:\n\nnode server.js\n\nYou\'ll see: 🚀 Forge Backend running at http://localhost:3001',
        tip: 'Keep this terminal open while using the builder.',
      },
      {
        title: 'Step 4 — Build your APK',
        desc: 'Open the builder at http://localhost:5173, design your app, then click "Generate APK". Gradle compiles your app (~1-3 min) and the APK downloads automatically.',
        tip: 'The first build is slow (Gradle downloads dependencies). Subsequent builds are faster.',
      },
      {
        title: 'Step 5 — Install on your phone',
        desc: '1. Transfer the .apk to your Android phone (USB, email, or Google Drive)\n2. On Android: Settings → Security → Enable "Install unknown apps"\n3. Tap the APK file → Install → Launch',
        tip: 'You can also use ADB: adb install app-debug.apk',
      },
    ],
  },
  {
    id: 'data',
    icon: Database,
    color: '#06B6D4',
    title: 'Variables & Database',
    steps: [
      {
        title: 'Variables',
        desc: 'Open the Variables tab in the left panel to create app-wide variables (text, number, boolean). Use them in components via the Inspector, and update them with "Set Variable" logic nodes.',
        tip: 'Variables persist across screens within the same session.',
      },
      {
        title: 'Database',
        desc: 'The Database tab lets you define data collections (like tables). These can be used to populate lists and feeds dynamically.',
        tip: 'Connected to Supabase by default — configure your keys in settings.',
      },
    ],
  },
  {
    id: 'export',
    icon: Package,
    color: '#EC4899',
    title: 'Saving & Exporting',
    steps: [
      {
        title: 'Auto-save',
        desc: 'Your project saves automatically to browser local storage every time you make a change. Use Ctrl+S to force-save.',
        tip: 'Projects persist across page refreshes.',
      },
      {
        title: 'Export JSON',
        desc: 'In the APK Generator, after the build simulation, click "Download Project JSON". This file contains your full project and can be re-imported.',
        tip: 'Use this to share your project or back it up.',
      },
      {
        title: 'Figma Import',
        desc: 'Click "Import" in the top toolbar to import a Figma design. Paste your Figma file URL and access token — Forge converts frames to screens and components.',
        tip: 'Complex Figma components may need manual adjustment.',
      },
    ],
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────
const StepCard = ({ step, index, color }: { step: (typeof SECTIONS[0]['steps'][0]); index: number; color: string }) => (
  <div className="relative pl-10 pb-8 last:pb-0">
    {/* Vertical line */}
    <div className="absolute left-3.5 top-8 bottom-0 w-px bg-white/[0.06]" />
    {/* Number bubble */}
    <div
      className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold"
      style={{ borderColor: `${color}50`, background: `${color}18`, color }}
    >
      {index + 1}
    </div>
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <h4 className="mb-1.5 text-sm font-semibold text-white">{step.title}</h4>
      <p className="text-xs text-white/50 leading-relaxed whitespace-pre-line">{step.desc}</p>
      {step.tip && (
        <div
          className="mt-3 flex items-start gap-2 rounded-lg p-2.5"
          style={{ background: `${color}10`, border: `1px solid ${color}25` }}
        >
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />
          <span className="text-[11px] leading-relaxed" style={{ color: `${color}CC` }}>{step.tip}</span>
        </div>
      )}
    </div>
  </div>
);

const Section = ({ section }: { section: typeof SECTIONS[0] }) => {
  const [open, setOpen] = useState(section.id === 'start');
  const Icon = section.icon;
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0E0E1A] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-white/[0.02]"
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${section.color}18`, border: `1px solid ${section.color}35` }}
        >
          <Icon className="h-4 w-4" style={{ color: section.color }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">{section.title}</h3>
          <p className="text-[11px] text-white/35">{section.steps.length} steps</p>
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-white/30" />
          : <ChevronRight className="h-4 w-4 text-white/30" />}
      </button>
      {open && (
        <div className="border-t border-white/[0.05] px-6 pt-5 pb-6 space-y-0">
          {section.steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} color={section.color} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────
const Guide = () => {
  return (
    <div className="min-h-screen bg-[#07070F] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070F]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Forge Guide</span>
          </div>
          <div className="ml-auto">
            <Link
              to="/builder"
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition"
            >
              Open Builder <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> Complete User Guide
          </div>
          <h1 className="mb-3 text-3xl font-black tracking-tight">
            How to use{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Forge
            </span>
          </h1>
          <p className="text-sm text-white/45 max-w-lg mx-auto leading-relaxed">
            Forge lets you design Android apps visually, add logic with a node graph,
            preview on a real phone, and export a signed APK — no code required.
          </p>
        </div>

        {/* Quick links */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Monitor,    label: 'Design',   href: '#start',   color: '#A78BFA' },
            { icon: GitBranch,  label: 'Logic',    href: '#logic',   color: '#F59E0B' },
            { icon: QrCode,     label: 'Preview',  href: '#preview', color: '#34D399' },
            { icon: Download,   label: 'APK',      href: '#apk',     color: '#F97316' },
          ].map(({ icon: Icon, label, href, color }) => (
            <a
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center transition hover:bg-white/[0.05]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <span className="text-xs font-semibold text-white/70">{label}</span>
            </a>
          ))}
        </div>

        {/* APK quick-answer callout */}
        <div
          id="apk-quick"
          className="mb-8 rounded-2xl border p-5"
          style={{ borderColor: '#F9731640', background: '#F9731608' }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: '#F9731618' }}>
              <Terminal className="h-4 w-4" style={{ color: '#F97316' }} />
            </div>
            <div>
              <h3 className="mb-1 text-sm font-bold text-white">
                How to get a real APK from the JSON export
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mb-3">
                The JSON file contains your full project. To compile it into a real Android APK,
                you need to run the Forge backend locally on your PC. Here's the short version:
              </p>
              <ol className="space-y-1.5">
                {[
                  'Clone the Forge repo and run npm install',
                  'Install Android Studio + Java JDK 17',
                  'Set JAVA_HOME and ANDROID_HOME environment variables',
                  'Run node server.js in the repo folder',
                  'Open http://localhost:5173/builder → Generate APK → real .apk downloads',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold mt-0.5"
                      style={{ background: '#F9731620', color: '#F97316' }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[11px]" style={{ color: '#F97316AA' }}>
                Full instructions in the "Generating a Real Android APK" section below ↓
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div id="start" className="space-y-4">
          {SECTIONS.map(section => (
            <div key={section.id} id={section.id}>
              <Section section={section} />
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-pink-500/5 p-8 text-center">
          <h3 className="mb-2 text-lg font-bold text-white">Ready to build?</h3>
          <p className="mb-5 text-sm text-white/40">Jump into the builder and ship your first app.</p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:opacity-90 transition"
          >
            <Zap className="h-4 w-4" /> Start Building
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Guide;
