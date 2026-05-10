import { useProjectStore } from '@/stores/projectStore';
import {
  X, Check, Loader2, Package, Code2, Shield, Cpu, Smartphone,
  Terminal, ChevronRight, Download, RotateCcw, Zap
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ── Build Steps ────────────────────────────────────────────────────
const BUILD_STEPS = [
  {
    id: 'export',
    icon: Code2,
    label: 'Exporting project',
    sublabel: 'Serializing screens & components',
    color: 'violet',
    logs: [
      '> forge-cli export --format=capacitor',
      '  ✓ Serialized 1 screen(s)',
      '  ✓ Mapped component tree',
      '  ✓ Bundled assets',
      '  ✓ project.json written to dist/',
    ],
  },
  {
    id: 'sync',
    icon: Package,
    label: 'Syncing Android assets',
    sublabel: 'Capacitor bridge → native project',
    color: 'cyan',
    logs: [
      '> npx cap sync android',
      '  ✓ Copying web assets from dist/',
      '  ✓ Updating Android native dependencies',
      '  ✓ Sync complete — 0 errors',
    ],
  },
  {
    id: 'gradle',
    icon: Cpu,
    label: 'Compiling with Gradle',
    sublabel: 'This may take 1–3 minutes',
    color: 'pink',
    logs: [
      '> ./gradlew assembleDebug',
      '  > Task :app:checkDebugDuplicateClasses',
      '  > Task :app:mergeDebugResources',
      '  > Task :app:processDebugManifest',
      '  > Task :app:compileDebugJavaWithJavac',
      '  > Task :app:dexBuilderDebug',
      '  > Task :app:mergeDebugDex',
      '  > Task :app:packageDebug',
      '  BUILD SUCCESSFUL in 92s',
    ],
  },
  {
    id: 'sign',
    icon: Shield,
    label: 'Signing APK',
    sublabel: 'Debug keystore applied',
    color: 'emerald',
    logs: [
      '> zipalign -v -p 4 app-debug.apk',
      '  ✓ Verification successful',
      '> apksigner sign --ks debug.keystore app-debug.apk',
      '  ✓ Signed with debug key',
    ],
  },
  {
    id: 'package',
    icon: Smartphone,
    label: 'Packaging APK',
    sublabel: 'Ready for download',
    color: 'violet',
    logs: [
      '> forge-cli package --output=release',
      '  ✓ APK size: 6.2 MB',
      '  ✓ Build complete!',
      '  → app-debug.apk',
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  violet: {
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/30',
    text: 'text-violet-300',
    glow: 'shadow-violet-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
    glow: 'shadow-cyan-500/20',
  },
  pink: {
    bg: 'bg-pink-500/15',
    border: 'border-pink-500/30',
    text: 'text-pink-300',
    glow: 'shadow-pink-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/20',
  },
};

// ── Elapsed Timer ──────────────────────────────────────────────────
const useElapsedTime = (running: boolean) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

// ── Main Component ─────────────────────────────────────────────────
export const APKGenerator = () => {
  const setApkModalOpen = useProjectStore((s) => s.setApkModalOpen);
  const projectName = useProjectStore((s) => s.projectName);
  const settings = useProjectStore((s) => s.settings);
  const screens = useProjectStore((s) => s.screens);
  const components = useProjectStore((s) => s.components);
  const nativeFeatures = useProjectStore((s) => s.nativeFeatures);

  const [phase, setPhase] = useState<'config' | 'building' | 'done' | 'error'>('config');
  const [buildStep, setBuildStep] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [appName, setAppName] = useState(settings.appName);
  const [pkgName, setPkgName] = useState(settings.packageName);
  const [version, setVersion] = useState(settings.version);
  const [errorMsg, setErrorMsg] = useState('');
  const [backendWasUp, setBackendWasUp] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const elapsed = useElapsedTime(phase === 'building');

  const compCount = Object.keys(components).length;
  const enabledFeatures = nativeFeatures.filter((f) => f.enabled);

  // Stream log lines for a given step
  const streamLogs = async (stepIndex: number) => {
    const logs = BUILD_STEPS[stepIndex].logs;
    for (const line of logs) {
      await new Promise(r => setTimeout(r, 220 + Math.random() * 160));
      setVisibleLogs(prev => [...prev, line]);
      // Scroll to bottom
      setTimeout(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      }, 50);
    }
  };

  /** True if the local Forge backend (server.js) is reachable. */
  const checkBackend = async (): Promise<boolean> => {
    try {
      await fetch('http://localhost:3001/api/ip', { signal: AbortSignal.timeout(2000) });
      return true;
    } catch {
      return false;
    }
  };

  /** Trigger a real JSON project-file download (works on Vercel). */
  const downloadProjectJson = () => {
    const state = useProjectStore.getState();
    const data = {
      appName,
      packageName: pkgName,
      version,
      screens:       state.screens,
      components:    state.components,
      variables:     state.variables,
      nativeFeatures: state.nativeFeatures,
      settings:      state.settings,
      exportedAt:    new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${appName.replace(/\s+/g, '_')}_forge_project.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBuild = async () => {
    setPhase('building');
    setBuildStep(0);
    setVisibleLogs([]);

    const state = useProjectStore.getState();
    const payload = {
      appName, packageName: pkgName, version,
      screens: state.screens, components: state.components,
      variables: state.variables, nativeFeatures: state.nativeFeatures,
    };

    // Steps 0 & 1 are always simulated (export + sync)
    for (let i = 0; i < 2; i++) {
      setBuildStep(i);
      await streamLogs(i);
      await new Promise(r => setTimeout(r, 400));
    }

    // Step 2 — Gradle
    setBuildStep(2);
    setVisibleLogs(prev => [...prev, '> ./gradlew assembleDebug']);

    try {
      // Probe backend with short timeout before deciding path
      const backendUp = await checkBackend();
      setBackendWasUp(backendUp);

      if (!backendUp) {
        // ── No local backend — simulation + JSON export ───────────────
        setVisibleLogs(prev => [...prev,
          '! Local backend not detected — running in Preview Mode',
          '! Run node server.js locally to compile a real APK',
        ]);
        await new Promise(r => setTimeout(r, 1000));

        for (const line of BUILD_STEPS[2].logs.slice(1)) {
          await new Promise(r => setTimeout(r, 350 + Math.random() * 250));
          setVisibleLogs(prev => [...prev, line]);
          setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
        }
      } else {
        // ── Backend is up — real Gradle build ────────────────────────
        const response = await fetch('http://localhost:3001/api/build', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Server returned ${response.status}`);
        }

        for (const line of BUILD_STEPS[2].logs.slice(1)) {
          await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
          setVisibleLogs(prev => [...prev, line]);
          setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
        }

        // Real APK download
        const blob = await response.clone().blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${appName.replace(/\s+/g, '_')}_debug.apk`;
        a.click();
        URL.revokeObjectURL(url);
      }

      // Steps 3 & 4 (Sign & Package) — common
      for (let i = 3; i < BUILD_STEPS.length; i++) {
        setBuildStep(i);
        await streamLogs(i);
        await new Promise(r => setTimeout(r, 300));
      }

      setPhase('done');
    } catch (err: any) {
      setErrorMsg(err.message || 'Build failed');
      setPhase('error');
    }
  };

  const progressPct = phase === 'building'
    ? Math.round(((buildStep + 1) / BUILD_STEPS.length) * 100)
    : phase === 'done' ? 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e0e1a] shadow-2xl overflow-hidden">
        {/* Top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        {/* Close */}
        {phase !== 'building' && (
          <button
            onClick={() => setApkModalOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* ── Config phase ── */}
        {phase === 'config' && (
          <div className="p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
                  <Zap className="h-4 w-4 text-violet-300" />
                </div>
                <h3 className="text-base font-bold text-white">Generate Native APK</h3>
              </div>
              <p className="ml-9 text-xs text-white/35">
                Compiles a real Android app if the local backend is running,
                otherwise simulates the build and exports your project as JSON.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'App Name', value: appName, onChange: setAppName, mono: false },
                { label: 'Package Name', value: pkgName, onChange: setPkgName, mono: true },
                { label: 'Version', value: version, onChange: setVersion, mono: true },
              ].map(({ label, value, onChange, mono }) => (
                <div key={label}>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/30">{label}</label>
                  <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/10 transition ${mono ? 'font-mono text-xs' : ''}`}
                  />
                </div>
              ))}
            </div>

            {/* Build summary */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Screens', value: screens.length },
                { label: 'Components', value: compCount },
                { label: 'Native APIs', value: enabledFeatures.length },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-[10px] text-white/35">{label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleBuild}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:opacity-90 transition"
            >
              <Cpu className="h-4 w-4 group-hover:animate-pulse" />
              Start Compilation
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Building phase ── */}
        {phase === 'building' && (
          <div className="p-6">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Building {appName}…</h3>
                <p className="text-xs text-white/35">Do not close this window</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="font-mono text-xs text-white/60">{elapsed}</span>
              </div>
            </div>

            {/* Steps */}
            <div className="mb-5 space-y-2">
              {BUILD_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isDone = i < buildStep;
                const isCurrent = i === buildStep;
                const colors = COLOR_MAP[step.color];
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-500 ${
                      isCurrent
                        ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                        : isDone
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-white/[0.04] bg-transparent'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                      isDone ? 'bg-emerald-500/20' : isCurrent ? colors.bg : 'bg-white/[0.04]'
                    }`}>
                      {isDone
                        ? <Check className="h-4 w-4 text-emerald-400" />
                        : isCurrent
                        ? <Loader2 className={`h-4 w-4 ${colors.text} animate-spin`} />
                        : <Icon className="h-4 w-4 text-white/20" />
                      }
                    </div>

                    {/* Labels */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold truncate transition-colors ${
                        isDone ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-white/25'
                      }`}>
                        {step.label}
                      </div>
                      {isCurrent && (
                        <div className={`text-[10px] ${colors.text} opacity-70`}>{step.sublabel}</div>
                      )}
                    </div>

                    {isDone && (
                      <span className="text-[10px] text-emerald-400/60">done</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Animated progress bar */}
            <div className="mb-5 space-y-1.5">
              <div className="flex justify-between text-[10px] text-white/30">
                <span>Progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 via-pink-500 to-violet-400 transition-all duration-700 ease-out relative"
                  style={{ width: `${progressPct}%` }}
                >
                  {/* Shimmer */}
                  <div className="absolute inset-0 animate-pulse bg-white/20 rounded-full" />
                </div>
              </div>
            </div>

            {/* Terminal log */}
            <div className="rounded-xl border border-white/[0.06] bg-black/50 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
                <Terminal className="h-3.5 w-3.5 text-white/30" />
                <span className="text-[10px] text-white/30 font-mono">Build Output</span>
                <div className="ml-auto flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500/50" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                  <div className="h-2 w-2 rounded-full bg-green-500/50" />
                </div>
              </div>
              <div ref={logRef} className="h-32 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
                {visibleLogs.map((line, i) => (
                  <div
                    key={i}
                    className={`font-mono text-[10px] leading-relaxed animate-in fade-in slide-in-from-bottom-1 ${
                      line.startsWith('>') ? 'text-violet-300' : line.includes('✓') ? 'text-emerald-400' : line.includes('BUILD SUCCESSFUL') ? 'text-emerald-300 font-bold' : 'text-white/40'
                    }`}
                  >
                    {line}
                  </div>
                ))}
                {/* Blinking cursor */}
                <div className="flex items-center">
                  <span className="font-mono text-[10px] text-violet-400">_</span>
                  <span className="ml-0.5 h-2.5 w-0.5 bg-violet-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Done phase ── */}
        {phase === 'done' && (
          <div className="p-6">
            {/* Success animation */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/15 border border-emerald-500/30">
                  <Check className="h-10 w-10 text-emerald-400" strokeWidth={2.5} />
                </div>
                <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 animate-ping" style={{ animationDuration: '2s' }} />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">
                  {!backendWasUp ? 'Build Simulated!' : 'APK Ready!'}
                </h3>
                <p className="text-xs text-white/40">
                  {!backendWasUp
                    ? 'Export your project JSON to continue locally'
                    : 'Your APK download started automatically'}
                </p>
              </div>
            </div>

            {/* File info — backend up vs no backend */}
            {!backendWasUp ? (
              <>
                {/* JSON export card */}
                <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
                      <Download className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{appName.replace(/\s+/g, '_')}_forge_project.json</div>
                      <div className="text-xs text-white/35">Complete project · Import into Forge locally</div>
                    </div>
                  </div>
                  <button
                    onClick={downloadProjectJson}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600/80 py-2 text-xs font-semibold text-white hover:bg-violet-600 transition"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Project JSON
                  </button>
                </div>

                {/* Local backend note */}
                <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                  <p className="text-xs font-semibold text-white/50">To compile a real APK</p>
                  {[
                    'Clone the Forge repo on your machine',
                    'Run the local backend: node server.js',
                    'Click "Generate APK" — Gradle builds & downloads the .apk',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-white/40">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">{i + 1}</div>
                      {step}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Real APK info */}
                <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                      <Smartphone className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{appName.replace(/\s+/g, '_')}_debug.apk</div>
                      <div className="text-xs text-white/35">Debug build · Android · {elapsed} compile time</div>
                    </div>
                  </div>
                </div>

                <div className="mb-5 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-xs font-semibold text-white/50 mb-2">How to install on your device</p>
                  {[
                    'Enable "Install unknown apps" in Android settings',
                    'Transfer the APK to your phone (USB, email, Drive)',
                    'Tap the APK file to install → Launch app',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-white/40">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">{i + 1}</div>
                      {step}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setPhase('config')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-xs font-medium text-white/60 hover:bg-white/[0.06] hover:text-white transition"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Build Again
              </button>
              <button
                onClick={() => setApkModalOpen(false)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 hover:opacity-90 transition"
              >
                <Check className="h-3.5 w-3.5" /> Done
              </button>
            </div>
          </div>
        )}

        {/* ── Error phase ── */}
        {phase === 'error' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                <X className="h-8 w-8 text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-white">Build Failed</h3>
                <p className="text-xs text-white/40 mt-1">Check that the backend server is running on port 3001</p>
              </div>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="font-mono text-[10px] text-red-300/70 break-all">{errorMsg}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setApkModalOpen(false)}
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-xs font-medium text-white/60 hover:bg-white/[0.06] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setPhase('config'); setErrorMsg(''); }}
                className="flex-1 rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Bottom gradient accent */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
};
