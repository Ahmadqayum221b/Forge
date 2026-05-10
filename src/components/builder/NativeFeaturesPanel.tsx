import { useProjectStore } from '@/stores/projectStore';
import { MapPin, Camera, Bell, Fingerprint, Share2, Vibrate, Shield } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin, Camera, Bell, Fingerprint, Share2, Vibrate,
};

export const NativeFeaturesPanel = () => {
  const nativeFeatures = useProjectStore((s) => s.nativeFeatures);
  const toggleNativeFeature = useProjectStore((s) => s.toggleNativeFeature);

  return (
    <div className="flex flex-col p-3">
      <div className="mb-1 text-xs font-semibold text-white/60">Native Capabilities</div>
      <p className="mb-4 text-[10px] text-white/30">Toggle hardware features. We handle the Android manifest permissions.</p>

      <div className="space-y-2">
        {nativeFeatures.map((f) => {
          const Icon = ICONS[f.icon] || Shield;
          return (
            <div key={f.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition cursor-pointer ${
                f.enabled ? 'border-violet-500/30 bg-violet-500/[0.06]' : 'border-white/[0.04] bg-white/[0.02] hover:border-white/10'
              }`}
              onClick={() => toggleNativeFeature(f.id)}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                f.enabled ? 'bg-violet-500/15' : 'bg-white/[0.04]'
              }`}>
                <Icon className={`h-4 w-4 ${f.enabled ? 'text-cyan-400' : 'text-white/30'}`} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-white/80">{f.name}</div>
                <div className="text-[10px] text-white/30">{f.description}</div>
                {f.enabled && f.permissions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {f.permissions.map((p) => (
                      <span key={p} className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-mono text-white/25">{p}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className={`relative h-5 w-9 shrink-0 rounded-full transition ${f.enabled ? 'bg-gradient-to-r from-violet-600 to-pink-600' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${f.enabled ? 'left-[18px]' : 'left-0.5'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
