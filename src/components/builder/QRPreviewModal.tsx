import { useProjectStore } from '@/stores/projectStore';
import { X, QrCode, Copy, Check, Smartphone, Wifi, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const BACKEND = 'http://localhost:3001';

const STEPS = [
  { icon: Wifi, text: 'Connect phone & PC to same WiFi' },
  { icon: QrCode, text: 'Scan QR code with your Android camera' },
  { icon: Smartphone, text: 'Your app opens instantly on the phone' },
];

export const QRPreviewModal = () => {
  const setQrModalOpen = useProjectStore(s => s.setQrModalOpen);
  const screens = useProjectStore(s => s.screens);
  const components = useProjectStore(s => s.components);
  const settings = useProjectStore(s => s.settings);

  const [previewUrl, setPreviewUrl] = useState('');
  const [networkIp, setNetworkIp] = useState('');
  const [vitePort] = useState(window.location.port || '8080');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch network IP from backend & store project snapshot
  const syncPreview = useCallback(async () => {
    setLoading(true);
    setBackendError(false);

    try {
      // 1. Get the machine's local network IP from backend
      const ipRes = await fetch(`${BACKEND}/api/ip`, { signal: AbortSignal.timeout(3000) });
      const { ip } = await ipRes.json();
      setNetworkIp(ip);

      // 2. Push the project snapshot to backend
      const payload = { screens, components, settings };
      const previewRes = await fetch(`${BACKEND}/api/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
      const { token: newToken } = await previewRes.json();
      setToken(newToken);

      // 3. Build the scannable URL using network IP + Vite port
      const url = `http://${ip}:${vitePort}/preview?token=${newToken}&api=http://${ip}:3001`;
      setPreviewUrl(url);
    } catch {
      setBackendError(true);
    } finally {
      setLoading(false);
    }
  }, [screens, components, settings, vitePort]);

  useEffect(() => {
    syncPreview();
  }, [syncPreview]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121e] p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={() => setQrModalOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
              <Smartphone className="h-4 w-4 text-violet-300" />
            </div>
            <h3 className="text-base font-bold text-white">Live Phone Preview</h3>
          </div>
          <p className="text-xs text-white/40 ml-9">Scan to open your app on a real Android device</p>
        </div>

        {/* Backend error state */}
        {backendError && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-300">Backend server not running</p>
              <p className="text-[10px] text-white/40 leading-relaxed">
                The QR preview requires the backend server. Open a second terminal and run:
              </p>
              <code className="block rounded-lg bg-black/40 px-3 py-2 font-mono text-[10px] text-violet-300">
                node server.js
              </code>
              <button
                onClick={syncPreview}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-1.5 text-[10px] font-medium text-amber-300 hover:bg-amber-500/25 transition"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* QR Code area */}
        <div className="flex flex-col items-center gap-4 mb-5">
          <div className="relative rounded-2xl border border-white/10 bg-white p-4 shadow-2xl shadow-violet-500/10">
            {loading ? (
              <div className="flex h-[200px] w-[200px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                  <p className="text-[10px] text-black/40">Connecting to backend…</p>
                </div>
              </div>
            ) : backendError ? (
              <div className="flex h-[200px] w-[200px] flex-col items-center justify-center gap-2">
                <QrCode className="h-12 w-12 text-black/10" />
                <p className="text-[10px] text-black/30 text-center">Start backend<br/>to generate QR</p>
              </div>
            ) : (
              <QRCodeSVG
                value={previewUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#0a0a12"
                level="M"
                includeMargin={false}
              />
            )}

            {/* Corner accents */}
            <div className="absolute left-1 top-1 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-violet-500" />
            <div className="absolute right-1 top-1 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-violet-500" />
            <div className="absolute bottom-1 left-1 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-violet-500" />
            <div className="absolute bottom-1 right-1 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-violet-500" />
          </div>

          {/* Network IP badge */}
          {networkIp && !backendError && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-mono">
                Network: {networkIp}:{vitePort}
              </span>
            </div>
          )}

          {/* URL row */}
          {!backendError && !loading && (
            <div className="flex w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5">
              <span className="flex-1 truncate font-mono text-[10px] text-white/40">{previewUrl}</span>
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={syncPreview}
                title="Refresh preview"
                className="shrink-0 rounded-lg bg-white/[0.06] p-1.5 text-white/50 hover:bg-white/[0.1] hover:text-white transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[10px] font-bold text-violet-400">
                  {i + 1}
                </div>
                <Icon className="h-3.5 w-3.5 shrink-0 text-white/30" />
                <span className="text-xs text-white/50">{step.text}</span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[10px] text-white/20">
          Requires: <span className="font-mono text-white/30">node server.js</span> running · Same WiFi network
        </p>
      </div>
    </div>
  );
};
