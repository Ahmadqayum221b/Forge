import { useProjectStore } from '@/stores/projectStore';
import { X, Figma, Upload, AlertCircle, FileText, CheckCircle2, ChevronRight, Clock, Settings2, Palette, Type, LayoutTemplate, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RECENT_FILES = [
  { id: '1', name: 'E-commerce App UI Kit', time: '2 hours ago', gradient: 'from-blue-500/40 to-cyan-400/40' },
  { id: '2', name: 'Fitness Tracker', time: 'Yesterday', gradient: 'from-emerald-500/40 to-teal-400/40' },
  { id: '3', name: 'Fintech Mobile App', time: '3 days ago', gradient: 'from-violet-500/40 to-fuchsia-500/40' },
  { id: '4', name: 'Social Media Dashboard', time: '1 week ago', gradient: 'from-orange-500/40 to-rose-400/40' },
];

const IMPORT_STEPS = [
  { id: 'auth', label: 'Authenticating with Figma API...' },
  { id: 'fetch', label: 'Fetching document layers...' },
  { id: 'parse', label: 'Parsing design tokens & components...' },
  { id: 'convert', label: 'Converting to native widgets...' },
];

const EXTRACTION_LOGS = [
  "Connecting to Figma servers...",
  "Authenticating access token...",
  "Fetching document tree...",
  "Found 14 pages and 120 frames.",
  "Extracting 45 color tokens...",
  "Extracting 12 typography styles...",
  "Parsing component variants...",
  "Optimizing vector assets...",
  "Mapping auto-layouts to native flexbox...",
  "Generating responsive constraints...",
  "Finalizing import package..."
];

export const FigmaImport = () => {
  const setFigmaModalOpen = useProjectStore((s) => s.setFigmaModalOpen);
  const addScreen = useProjectStore((s) => s.addScreen);
  
  const [fileUrl, setFileUrl] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  
  // Settings
  const [importSettings, setImportSettings] = useState({
    components: true,
    colors: true,
    typography: true,
    images: true
  });

  const isUrlValid = useMemo(() => {
    if (!fileUrl) return null;
    return fileUrl.includes('figma.com/file/') || fileUrl.includes('figma.com/design/');
  }, [fileUrl]);

  // Simulate import process
  useEffect(() => {
    if (status === 'importing') {
      const stepDuration = 2500;
      let step = 0;
      
      const stepInterval = setInterval(() => {
        step++;
        if (step < IMPORT_STEPS.length) {
          setCurrentStep(step);
        } else {
          clearInterval(stepInterval);
          setStatus('success');
          // Mock success: add a new screen
          setTimeout(() => {
            addScreen('Figma Imported Screen');
            setFigmaModalOpen(false);
          }, 2000);
        }
      }, stepDuration);

      const logInterval = setInterval(() => {
        setCurrentLogIndex(prev => Math.min(prev + 1, EXTRACTION_LOGS.length - 1));
      }, 800);

      return () => {
        clearInterval(stepInterval);
        clearInterval(logInterval);
      };
    }
  }, [status, setFigmaModalOpen, addScreen]);

  const handleImport = () => {
    if (!fileUrl.trim() || !isUrlValid) return;
    setStatus('importing');
    setCurrentStep(0);
    setCurrentLogIndex(0);
  };

  const handleRecentClick = (file: any) => {
    setFileUrl(`https://www.figma.com/file/${file.id}/${file.name.replace(/ /g, '-')}`);
  };

  const toggleSetting = (key: keyof typeof importSettings) => {
    setImportSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A0A14]/80 shadow-[0_0_100px_rgba(139,92,246,0.15)]"
      >
        {/* Dynamic Mesh Gradient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.2, 1, 1.1, 1] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -left-[20%] -top-[20%] h-[60%] w-[60%] rounded-full bg-violet-600/20 blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              rotate: [360, 270, 180, 90, 0],
              scale: [1, 1.3, 1, 1.2, 1] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -right-[20%] -bottom-[20%] h-[60%] w-[60%] rounded-full bg-pink-600/20 blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              y: [0, -50, 0, 50, 0],
              x: [0, 50, 0, -50, 0] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[20%] bottom-[10%] h-[40%] w-[40%] rounded-full bg-cyan-600/10 blur-[80px]" 
          />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col h-[85vh] max-h-[700px]">
          <button onClick={() => setFigmaModalOpen(false)}
            className="absolute right-6 top-6 rounded-full p-2.5 text-white/40 transition-all hover:bg-white/10 hover:text-white hover:rotate-90 z-20 bg-black/20 backdrop-blur-md">
            <X className="h-5 w-5" />
          </button>

          <div className="mb-8 flex items-center gap-5 shrink-0">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/10 shadow-lg group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 opacity-0 blur transition-opacity duration-500 group-hover:opacity-20" />
              <Figma className="h-8 w-8 text-violet-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">Import Design</h3>
              <p className="text-sm text-white/50 mt-1 font-medium">Turn your Figma layers into native code components instantly.</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Inputs */}
                  <div className="space-y-5">
                    <div className="group">
                      <label className="mb-2 block text-sm font-semibold text-white/70 transition-colors group-focus-within:text-violet-400">Figma File URL</label>
                      <div className="relative">
                        <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
                          placeholder="https://www.figma.com/design/..."
                          className={`w-full rounded-2xl border bg-black/40 backdrop-blur-md px-5 py-4 pl-12 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:bg-black/60 shadow-inner
                            ${isUrlValid === false ? 'border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.15)] focus:border-red-500' : 
                              isUrlValid === true ? 'border-emerald-500/50 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:border-emerald-500' : 
                              'border-white/10 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] focus:border-violet-500/50'}`} />
                        <LinkIcon className="absolute left-4 top-4 h-5 w-5 text-white/30" />
                        {isUrlValid === true && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-emerald-400 animate-in zoom-in" />}
                        {isUrlValid === false && <AlertCircle className="absolute right-4 top-4 h-5 w-5 text-red-400 animate-in zoom-in" />}
                      </div>
                      {isUrlValid === false && <p className="text-red-400 text-xs mt-2 ml-1">Please enter a valid Figma file URL.</p>}
                    </div>

                    <div className="group">
                      <div className="flex justify-between items-baseline mb-2">
                        <label className="block text-sm font-semibold text-white/70 transition-colors group-focus-within:text-violet-400">Personal Access Token</label>
                        <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 hover:underline underline-offset-4 transition-all">How to get a token?</a>
                      </div>
                      <input value={token} onChange={(e) => setToken(e.target.value)} type="password"
                        placeholder="figd_xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-5 py-4 text-sm font-mono text-white outline-none transition-all placeholder:text-white/20 focus:border-violet-500/50 focus:bg-black/60 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] shadow-inner" />
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden transition-all">
                    <button 
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex w-full items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-white/5">
                          <Settings2 className="h-4 w-4 text-white/60" />
                        </div>
                        <span className="text-sm font-medium text-white/80">Advanced Import Settings</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-white/40 transition-transform duration-300 ${showAdvanced ? 'rotate-90' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-white/5"
                        >
                          <div className="p-4 grid grid-cols-2 gap-3 bg-black/40">
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                              <input type="checkbox" checked={importSettings.components} onChange={() => toggleSetting('components')} className="accent-violet-500 w-4 h-4 rounded" />
                              <LayoutTemplate className="h-4 w-4 text-violet-400" />
                              <span className="text-xs font-medium text-white/70">UI Components</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                              <input type="checkbox" checked={importSettings.colors} onChange={() => toggleSetting('colors')} className="accent-pink-500 w-4 h-4 rounded" />
                              <Palette className="h-4 w-4 text-pink-400" />
                              <span className="text-xs font-medium text-white/70">Color Tokens</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                              <input type="checkbox" checked={importSettings.typography} onChange={() => toggleSetting('typography')} className="accent-cyan-500 w-4 h-4 rounded" />
                              <Type className="h-4 w-4 text-cyan-400" />
                              <span className="text-xs font-medium text-white/70">Typography Styles</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                              <input type="checkbox" checked={importSettings.images} onChange={() => toggleSetting('images')} className="accent-emerald-500 w-4 h-4 rounded" />
                              <FileText className="h-4 w-4 text-emerald-400" />
                              <span className="text-xs font-medium text-white/70">Extract Images</span>
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Recent Files */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-white/40" />
                        <h4 className="text-sm font-semibold text-white/60">Recent Imports</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {RECENT_FILES.map((file) => (
                        <button 
                          key={file.id}
                          onClick={() => handleRecentClick(file)}
                          className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 text-left transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-xl group flex flex-col gap-3 h-[100px]"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${file.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                          <div className="relative z-10 flex-1">
                            <div className="text-sm font-bold text-white/90 group-hover:text-white line-clamp-1">{file.name}</div>
                            <div className="text-[10px] font-medium text-white/40 mt-1 uppercase tracking-wider">{file.time}</div>
                          </div>
                          <div className="relative z-10 flex justify-end">
                            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-colors">
                              <ChevronRight className="h-3 w-3 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

              {(status === 'importing' || status === 'success') && (
                <motion.div 
                  key="importing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center h-full justify-center min-h-[400px]"
                >
                  <div className="relative mb-16 flex justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-40 w-40 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
                      <div className="h-24 w-24 animate-ping opacity-20 rounded-full bg-pink-500/40 blur-xl" />
                    </div>
                    <motion.div 
                      animate={{ rotate: status === 'success' ? 0 : 360 }}
                      transition={{ duration: 10, ease: "linear", repeat: status === 'success' ? 0 : Infinity }}
                      className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-white/20 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.3)]"
                    >
                      {status === 'success' ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}>
                          <CheckCircle2 className="h-14 w-14 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                        </motion.div>
                      ) : (
                        <Figma className="h-14 w-14 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                      )}
                    </motion.div>
                  </div>

                  <div className="w-full max-w-md">
                    <div className="space-y-6 mb-8">
                      {IMPORT_STEPS.map((step, idx) => {
                        const isActive = idx === currentStep;
                        const isPast = idx < currentStep;
                        const isSuccess = status === 'success';

                        return (
                          <div key={step.id} className={`flex items-center gap-5 transition-all duration-500 ${isPast || isSuccess ? 'opacity-100 translate-x-0' : isActive ? 'opacity-100 translate-x-2' : 'opacity-20 translate-x-0'}`}>
                            <div className="relative flex h-10 w-10 items-center justify-center shrink-0">
                              {isPast || isSuccess ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                  </div>
                                </motion.div>
                              ) : isActive ? (
                                <div className="h-8 w-8 rounded-full border-[3px] border-violet-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(139,92,246,0.2)]" />
                              ) : (
                                <div className="h-3 w-3 rounded-full bg-white/20" />
                              )}
                            </div>
                            <span className={`text-base font-medium ${isPast || isSuccess ? 'text-white/90' : isActive ? 'text-white' : 'text-white/40'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Live Extraction Log */}
                    {status === 'importing' && (
                      <div className="mt-8 rounded-xl bg-black/50 border border-white/5 p-4 h-32 overflow-hidden relative font-mono text-xs">
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/50 to-transparent z-10" />
                        <div className="flex flex-col justify-end h-full gap-1.5 opacity-80">
                          {EXTRACTION_LOGS.slice(Math.max(0, currentLogIndex - 4), currentLogIndex + 1).map((log, i, arr) => (
                            <motion.div 
                              key={`${log}-${i}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: i === arr.length - 1 ? 1 : 0.4, y: 0 }}
                              className={`flex items-start gap-2 ${i === arr.length - 1 ? 'text-violet-300' : 'text-white/40'}`}
                            >
                              <span className="shrink-0 text-white/20">{`>`}</span>
                              <span className="truncate">{log}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Footer */}
          {status === 'idle' && (
            <div className="pt-6 mt-2 border-t border-white/10 shrink-0">
              <button 
                onClick={handleImport} 
                disabled={!fileUrl.trim() || !isUrlValid}
                className="relative overflow-hidden w-full rounded-2xl bg-white text-[#0A0A14] py-4 text-base font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_100%] animate-gradient-x" />
                <span className="relative z-10 flex items-center gap-2">
                  <Upload className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" /> 
                  Begin Import
                </span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

