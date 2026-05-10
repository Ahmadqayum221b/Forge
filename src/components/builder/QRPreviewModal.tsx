import { useProjectStore } from '@/stores/projectStore';
import {
  X, QrCode, Copy, Check, Smartphone, Wifi, RefreshCw,
  AlertCircle, Loader2, Globe, ExternalLink,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// QR codes reliably encode ~1.8 KB of text before scanners struggle
const QR_SAFE_BYTES = 1_800;
const BACKEND_URL   = 'http://localhost:3001';

/** Try to reach the local backend. Returns true if reachable within 2 s. */
async function isBackendReachable(): Promise<boolean> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 2000);
  try {
    await fetch(`${BACKEND_URL}/api/ip`, { signal: controller.signal });
    clearTimeout(id);
    return true;
  } catch {
    clearTimeout(id);
    return false;
  }
}

/** Encode snapshot as a compact base64 URL usable in a QR code. */
async function encodeSnapshot(
  screens: any[],
  components: Record<string, any>,
  settings: Record<string, any>,
): Promise<{ url: string; bytes: number } | null> {
  try {
    // Strip heavy fields not needed for the preview renderer
    const slim = {
      screens,
      settings,
      components: Object.fromEntries(
        Object.entries(components).map(([k, c]) => [k, {
          id: c.id, name: c.name, type: c.type, screenId: c.screenId,
          x: c.x, y: c.y, width: c.width, height: c.height, zIndex: c.zIndex,
          visible: c.visible, props: c.props, styles: c.styles,
          variableBindings: c.variableBindings || {},
          logic: c.logic || [],
        }])
      ),
    };
    const jsonStr = JSON.stringify(slim);
    
    // Attempt compression if supported (shrinks payload by 60-80%)
    if (typeof CompressionStream !== 'undefined') {
      const stream = new Blob([jsonStr]).stream();
      const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
      const compressedBuffer = await new Response(compressedStream).arrayBuffer();
      const encoded = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer)));
      const url = `${window.location.origin}/preview?cproject=${encoded}`;
      return { url, bytes: encoded.length };
    }

    // Fallback: standard base64 (Unicode-safe)
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    const url     = `${window.location.origin}/preview?project=${encoded}`;
    return { url, bytes: encoded.length };
  } catch (err) {
    console.error('Encoding error:', err);
    return null;
  }
}

export const QRPreviewModal = () => {
  const setQrModalOpen = useProjectStore((s) => s.setQrModalOpen);
  const screens        = useProjectStore((s) => s.screens);
  const components     = useProjectStore((s) => s.components);
  const settings       = useProjectStore((s) => s.settings);

  const [previewUrl,    setPreviewUrl]    = useState('');
  const [networkIp,     setNetworkIp]     = useState('');
  const [vitePort]                        = useState(window.location.port || '5173');
  const [loading,       setLoading]       = useState(true);
  // 'none' | 'no-backend' | 'too-large'
  const [errorKind,     setErrorKind]     = useState<'none'|'no-backend'|'too-large'>('none');
  const [payloadBytes,  setPayloadBytes]  = useState(0);
  const [copied,        setCopied]        = useState(false);
  // Whether the backend was found this session (for the badge)
  const [backendActive, setBackendActive] = useState(false);

  const syncPreview = useCallback(async () => {
    setLoading(true);
    setErrorKind('none');
    setBackendActive(false);

    // ── 1. Check if local backend is reachable ─────────────────────────
    const reachable = await isBackendReachable();

    if (reachable) {
      // ── Backend is UP: use token-based preview ─────────────────────
      const previewController = new AbortController();
      const previewId = setTimeout(() => previewController.abort(), 5000);
      try {
        const ipRes = await fetch(`${BACKEND_URL}/api/ip`);
        const { ip } = await ipRes.json();
        setNetworkIp(ip);

        const payload    = { screens, components, settings };
        const previewRes = await fetch(`${BACKEND_URL}/api/preview`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
          signal:  previewController.signal,
        });
        const { token: newToken } = await previewRes.json();
        clearTimeout(previewId);

        const url = `http://${ip}:${vitePort}/preview?token=${newToken}&api=${BACKEND_URL}`;
        setPreviewUrl(url);
        setBackendActive(true);
      } catch {
        clearTimeout(previewId);
        // Backend answered health-check but errored on preview endpoint → fall back
        setErrorKind('no-backend');
      }
      setLoading(false);
      return;
    }

    // ── 2. No backend: encode project into a self-contained URL ────────
    const encoded = encodeSnapshot(screens, components, settings);

    if (!encoded) {
      setErrorKind('too-large');
      setLoading(false);
      return;
    }

    if (encoded.bytes > QR_SAFE_BYTES) {
      setErrorKind('too-large');
      setPayloadBytes(encoded.bytes);
      setPreviewUrl(encoded.url); // still set so user can copy/open
    } else {
      setPreviewUrl(encoded.url);
    }

    setLoading(false);
  }, [screens, components, settings, vitePort]);

  useEffect(() => { syncPreview(); }, [syncPreview]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const noBackend  = errorKind === 'no-backend';
  const tooLarge   = errorKind === 'too-large';
  const showQR     = !loading && !noBackend && !(tooLarge && !previewUrl);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121e] p-6 shadow-2xl">
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent rounded-t-2xl" />

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
          <p className="text-xs text-white/40 ml-9">
            {backendActive
              ? 'Scan to open on your Android device (same WiFi)'
              : 'Scan to open your app on any device with internet access'}
          </p>
        </div>

        {/* No-backend banner */}
        {noBackend && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-amber-300">Preview endpoint error</p>
              <p className="text-[10px] text-white/40 leading-relaxed">
                Backend responded but the preview API failed. Try retrying.
              </p>
              <button
                onClick={syncPreview}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-1.5 text-[10px] font-medium text-amber-300 hover:bg-amber-500/25 transition"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Too-large banner */}
        {tooLarge && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-amber-300">Project too large for QR code</p>
              <p className="text-[10px] text-white/40 leading-relaxed">
                {payloadBytes > 0
                  ? `Encoded size (${Math.round(payloadBytes / 1024)}KB) exceeds the ~1.8KB QR limit.`
                  : 'Project data is too large to encode into a QR code.'}
                {' '}Use the link below to open directly.
              </p>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-1.5 text-[10px] font-medium text-violet-300 hover:bg-violet-500/25 transition"
                >
                  <ExternalLink className="h-3 w-3" /> Open Preview Link
                </a>
              )}
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
                  <p className="text-[10px] text-black/40">Generating preview…</p>
                </div>
              </div>
            ) : showQR ? (
              <QRCodeSVG
                value={previewUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#0a0a12"
                level="M"
                includeMargin={false}
              />
            ) : (
              <div className="flex h-[200px] w-[200px] flex-col items-center justify-center gap-2">
                <QrCode className="h-12 w-12 text-black/10" />
                <p className="text-[10px] text-black/30 text-center">
                  {tooLarge ? 'Use link below' : 'Unavailable'}<br />to open preview
                </p>
              </div>
            )}

            {/* Corner accents */}
            <div className="absolute left-1 top-1 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-violet-500" />
            <div className="absolute right-1 top-1 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-violet-500" />
            <div className="absolute bottom-1 left-1 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-violet-500" />
            <div className="absolute bottom-1 right-1 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-violet-500" />
          </div>

          {/* Status badge */}
          {!loading && (
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
              backendActive
                ? 'border-emerald-500/25 bg-emerald-500/[0.08]'
                : 'border-violet-500/25 bg-violet-500/[0.08]'
            }`}>
              <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${backendActive ? 'bg-emerald-400' : 'bg-violet-400'}`} />
              <span className={`text-[10px] font-mono ${backendActive ? 'text-emerald-300' : 'text-violet-300'}`}>
                {backendActive
                  ? `Network: ${networkIp}:${vitePort}`
                  : 'Works on any device · No WiFi required'}
              </span>
            </div>
          )}

          {/* URL row */}
          {!loading && previewUrl && !noBackend && (
            <div className="flex w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5">
              <span className="flex-1 truncate font-mono text-[10px] text-white/40">{previewUrl}</span>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-lg bg-white/[0.06] p-1.5 text-white/50 hover:bg-white/[0.1] hover:text-white transition"
                title="Open in browser"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={syncPreview}
                title="Refresh"
                className="shrink-0 rounded-lg bg-white/[0.06] p-1.5 text-white/50 hover:bg-white/[0.1] hover:text-white transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {(backendActive
            ? [
                { icon: Wifi,       text: 'Connect phone & PC to same WiFi' },
                { icon: QrCode,     text: 'Scan QR code with your Android camera' },
                { icon: Smartphone, text: 'Your app opens instantly on the phone' },
              ]
            : [
                { icon: Globe,      text: 'QR works on any device with internet access' },
                { icon: QrCode,     text: 'Scan QR code with your phone camera' },
                { icon: Smartphone, text: 'Your app opens instantly — no install needed' },
              ]
          ).map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[10px] font-bold text-violet-400">{i + 1}</div>
                <Icon className="h-3.5 w-3.5 shrink-0 text-white/30" />
                <span className="text-xs text-white/50">{step.text}</span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[10px] text-white/20">
          {backendActive
            ? 'Requires: local backend · Same WiFi network'
            : 'No backend needed · Powered by Forge'}
        </p>
      </div>
    </div>
  );
};
