import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const LOADING_STEPS = [
  'Initializing workspace...',
  'Loading component library...',
  'Connecting to build engine...',
  'Preparing canvas...',
  'Finalizing environment...',
];

export const LoadingScreen = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#08080F]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] bg-[radial-gradient(circle_at_center,rgba(108,58,237,0.1)_0%,transparent_70%)] animate-pulse" />
      </div>

      <div className="relative">
        <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 p-[3px] shadow-2xl shadow-violet-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[21px] bg-[#08080F]">
            <Sparkles className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>
        
        {/* Orbiting circles */}
        <div className="absolute -inset-8 animate-[spin_4s_linear_infinite]">
          <div className="h-3 w-3 rounded-full bg-violet-500 blur-[2px]" />
        </div>
        <div className="absolute -inset-12 animate-[spin_6s_linear_infinite_reverse]">
          <div className="h-2 w-2 rounded-full bg-pink-500 blur-[1px]" />
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
          <h2 className="text-xl font-bold tracking-tight text-white">
            Forge <span className="text-gradient">Studio</span>
          </h2>
        </div>
        
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-white/40 transition-all duration-300">
            {LOADING_STEPS[step]}
          </p>
          <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/5">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 to-pink-600 transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / LOADING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 text-[10px] uppercase tracking-[0.2em] text-white/20">
        Engine v1.4.2 · Secure Connection
      </div>
    </div>
  );
};
