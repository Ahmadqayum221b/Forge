import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { X, Mail, Lock, User, Github, Chrome, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const LoginPanel = () => {
  const setLoginOpen = useProjectStore((s) => s.setLoginOpen);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isLogin ? 'Welcome back to Forge!' : 'Welcome to the Forge family!');
    setLoginOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0E0E18]/90 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-pink-600/10 blur-3xl" />

        <button
          onClick={() => setLoginOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 p-[2px] shadow-lg shadow-violet-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0E0E18]">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="mt-1 text-sm text-white/50">
            {isLogin ? 'Sign in to your Forge account' : 'Start building native apps today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-medium text-white/50">Password</label>
              {isLogin && (
                <button type="button" className="text-xs text-violet-400 hover:text-violet-300">
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
                required
              />
            </div>
          </div>

          <Button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-6 font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-90">
            {isLogin ? 'Sign In' : 'Get Started Free'}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0E0E18] px-2 text-white/30">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
            <Github className="h-4 w-4" /> Github
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
            <Chrome className="h-4 w-4" /> Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-white/40">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};
