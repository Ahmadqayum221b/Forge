import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Smartphone,
  Camera,
  MapPin,
  Bell,
  Fingerprint,
  Database,
  QrCode,
  Layers,
  MousePointer2,
  Square,
  Type,
  Image as ImageIcon,
  ToggleLeft,
  Sliders,
  Play,
  Zap,
  Check,
  Github,
  Figma,
  Download,
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { LoginPanel } from "@/components/builder/LoginPanel";
import { LoadingScreen } from "@/components/builder/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const isLoginOpen = useProjectStore((s) => s.isLoginOpen);
  const setLoginOpen = useProjectStore((s) => s.setLoginOpen);
  const isLoading = useProjectStore((s) => s.isLoading);
  const setIsLoading = useProjectStore((s) => s.setIsLoading);
  const navigate = useNavigate();

  const handleStartBuilding = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/builder");
    }, 4500); // Show loading screen for 4.5s
  };
  return (
    <div className="min-h-screen overflow-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50">
        <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
          <a href="#" className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-xl bg-gradient-aurora shadow-glow">
              <div className="absolute inset-[2px] rounded-[10px] bg-background/80 backdrop-blur" />
              <Sparkles className="absolute inset-0 m-auto h-4 w-4 text-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">Forge</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#builder" className="transition hover:text-foreground">Builder</a>
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#templates" className="transition hover:text-foreground">Templates</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => setLoginOpen(true)}>Sign in</Button>
            <Button 
              size="sm" 
              className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              onClick={handleStartBuilding}
            >
              Start free
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-5 pb-12 pt-20 md:pt-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-7">
            <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-brand-cyan" />
              <span className="text-muted-foreground">New · Figma → APK in one click</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Design it. Wire it.{" "}
              <span className="text-gradient">Ship a real APK.</span>
            </h1>
            <p className="max-w-lg text-base text-muted-foreground md:text-lg">
              Forge is the visual builder for native Android apps. Drag components onto a real device frame,
              connect logic without code, and export a signed <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.apk</code> from your browser.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                size="lg" 
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                onClick={handleStartBuilding}
              >
                Open the builder <ArrowRight className="ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="glass border-white/10 hover:bg-white/5">
                <Play className="mr-1" /> Watch 90s demo
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-cyan" /> No code</div>
              <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-cyan" /> Real APK</div>
              <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand-cyan" /> Live device preview</div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto">
            <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-aurora opacity-30 blur-3xl" />
            <div className="animate-float">
              <PhoneMock />
            </div>
            <div className="glass-strong absolute -left-6 top-10 hidden rounded-2xl p-3 text-xs shadow-soft md:block">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-brand-cyan" />
                <div>
                  <div className="font-semibold">Live on device</div>
                  <div className="text-muted-foreground">Scan to preview</div>
                </div>
              </div>
            </div>
            <div className="glass-strong absolute -right-4 bottom-12 hidden rounded-2xl p-3 text-xs shadow-pink md:block">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-brand-pink" />
                <div>
                  <div className="font-semibold">app-release.apk</div>
                  <div className="text-muted-foreground">8.4 MB · signed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo strip */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-widest text-muted-foreground">
          <span>Trusted by tinkerers at</span>
          <span className="font-bold text-foreground/70">indie.studio</span>
          <span className="font-bold text-foreground/70">northpeak</span>
          <span className="font-bold text-foreground/70">paperplane</span>
          <span className="font-bold text-foreground/70">orbital</span>
          <span className="font-bold text-foreground/70">sunset.io</span>
        </div>
      </section>

      {/* BUILDER PREVIEW */}
      <section id="builder" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 text-xs uppercase tracking-widest text-brand-cyan">The Canvas</div>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
              A real builder, not just a slideshow.
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Drag components from the tray, drop them onto a device frame, and tweak them in the inspector.
          </p>
        </div>

        <div className="glass relative overflow-hidden rounded-3xl p-3 shadow-soft md:p-5">
          <div className="grid gap-3 md:grid-cols-[200px_1fr_220px]">
            {/* Component tray */}
            <aside className="glass-strong rounded-2xl p-3">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-semibold">Components</span>
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                {[
                  { icon: Square, label: "Button" },
                  { icon: Type, label: "Text" },
                  { icon: ImageIcon, label: "Image" },
                  { icon: ToggleLeft, label: "Switch" },
                  { icon: Sliders, label: "Slider" },
                  { icon: MousePointer2, label: "Tap area" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex cursor-grab items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2 text-xs transition hover:border-brand-violet/40 hover:bg-white/5"
                  >
                    <Icon className="h-3.5 w-3.5 text-brand-cyan" />
                    {label}
                  </div>
                ))}
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-2 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
                <Figma className="h-3.5 w-3.5" /> Import Figma
              </button>
            </aside>

            {/* Canvas */}
            <div className="grid-bg relative flex min-h-[480px] items-center justify-center overflow-hidden rounded-2xl bg-background/40">
              <div className="absolute left-3 top-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-brand-pink" />
                <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
                <span className="h-2 w-2 rounded-full bg-brand-cyan" />
                <span className="ml-2">screen-1.dart</span>
              </div>
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <span className="glass rounded-md px-2 py-1 text-[10px]">100%</span>
                <span className="glass rounded-md px-2 py-1 text-[10px]">Pixel 8</span>
              </div>
              <PhoneMock compact />
            </div>

            {/* Inspector */}
            <aside className="glass-strong rounded-2xl p-3 text-xs">
              <div className="mb-3 font-semibold">Inspector</div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-muted-foreground">Element</div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">PrimaryButton</div>
                </div>
                <div>
                  <div className="mb-1 text-muted-foreground">On tap</div>
                  <div className="flex items-center justify-between rounded-lg border border-brand-violet/40 bg-brand-violet/10 px-2 py-1.5">
                    <span>Open Camera</span>
                    <Camera className="h-3.5 w-3.5 text-brand-cyan" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-muted-foreground">Fill</div>
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
                    <span className="h-3.5 w-3.5 rounded-full bg-gradient-primary" />
                    <span>Aurora 135°</span>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-muted-foreground">Radius</div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">16 px</div>
                </div>
              </div>
              <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-pink/40 bg-brand-pink/10 px-2 py-2 text-xs font-semibold text-foreground hover:bg-brand-pink/20">
                <Zap className="h-3.5 w-3.5 text-brand-pink" /> Generate APK
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <div className="mb-3 text-xs uppercase tracking-widest text-brand-pink">Pro-grade features</div>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Everything you'd expect from a native dev kit, none of the Gradle pain.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={QrCode}
            title="Live device preview"
            desc="Scan the QR. Every change you make in the browser hot-reloads on your phone in &lt;200ms."
            tone="cyan"
          />
          <FeatureCard
            icon={Database}
            title="Built-in database"
            desc="Spreadsheet-style tables with realtime sync. Build order lists, profiles, anything."
            tone="violet"
          />
          <FeatureCard
            icon={Smartphone}
            title="Native hardware"
            desc="Toggle GPS, camera, push, and biometrics. We wire the permissions for you."
            tone="pink"
          />
          <FeatureCard
            icon={Figma}
            title="One-click Figma import"
            desc="Pulls your layers via the Figma API and converts them into interactive components."
            tone="violet"
          />
          <FeatureCard
            icon={Zap}
            title="Cloud compiler"
            desc="Your design becomes Flutter, gets signed, and lands as a real .apk in your downloads."
            tone="pink"
          />
          <FeatureCard
            icon={Layers}
            title="Template marketplace"
            desc="Start from polished templates: storefront, fitness tracker, booking, and more."
            tone="cyan"
          />
        </div>

        {/* Hardware toggles */}
        <div className="glass mt-10 rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-sm font-semibold">Native capabilities</div>
            <span className="text-xs text-muted-foreground">Toggle on. We handle the manifest.</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: MapPin, label: "GPS / Maps", on: true },
              { icon: Camera, label: "Camera & Gallery", on: true },
              { icon: Bell, label: "Push notifications", on: false },
              { icon: Fingerprint, label: "Biometric login", on: true },
            ].map(({ icon: Icon, label, on }) => (
              <div
                key={label}
                className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-xs transition ${
                  on
                    ? "border-brand-violet/40 bg-brand-violet/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${on ? "text-brand-cyan" : "text-muted-foreground"}`} />
                  {label}
                </div>
                <div className={`relative h-4 w-7 rounded-full ${on ? "bg-gradient-primary" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${on ? "left-3.5" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-12 text-center">
          <div className="mb-3 text-xs uppercase tracking-widest text-brand-cyan">Pricing</div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Build free. Pay to ship.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <PricingCard
            name="Free"
            price="$0"
            tagline="Tinker forever"
            features={["Unlimited apps", "Browser preview", "Community templates", "1 collaborator"]}
          />
          <PricingCard
            name="Pro"
            price="$19"
            tagline="Ship to the Play Store"
            highlighted
            features={["Everything in Free", "Export signed APK", "Remove Forge branding", "Live device preview", "5 GB database"]}
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            tagline="White-label & scale"
            features={["White-labeled exports", "High-volume API", "SSO + audit logs", "Dedicated infra", "Priority support"]}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center shadow-glow md:p-16">
          <div className="absolute -inset-32 -z-10 bg-gradient-aurora opacity-30 blur-3xl" />
          <h3 className="mx-auto max-w-xl text-3xl font-bold tracking-tight md:text-5xl">
            Your first APK is <span className="text-gradient">ten minutes away.</span>
          </h3>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Open the builder, drag a button, and hit Generate. We'll handle the rest.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button 
              size="lg" 
              className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              onClick={handleStartBuilding}
            >
              Start building free <ArrowRight className="ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="glass border-white/10">
              <Github className="mr-1" /> Star on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gradient-aurora" />
            <span>© 2026 Forge Labs · Made for makers.</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Docs</a>
            <a href="#" className="hover:text-foreground">Changelog</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
          </div>
        </div>
      </footer>

      {isLoginOpen && <LoginPanel />}
      {isLoading && <LoadingScreen />}
    </div>
  );
};

/* ---------- subcomponents ---------- */

const PhoneMock = ({ compact = false }: { compact?: boolean }) => (
  <div
    className={`relative ${compact ? "h-[420px] w-[210px]" : "h-[520px] w-[260px]"} rounded-[44px] border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-2 shadow-soft`}
  >
    <div className="absolute left-1/2 top-1.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
    <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-background">
      {/* status */}
      <div className="flex items-center justify-between px-5 pt-3 text-[10px] text-foreground/80">
        <span>9:41</span>
        <span>●●●● 5G</span>
      </div>
      {/* hero block */}
      <div className="px-4 pt-6">
        <div className="rounded-2xl bg-gradient-aurora p-4 shadow-glow">
          <div className="text-[10px] uppercase tracking-widest text-white/80">Today</div>
          <div className="mt-1 text-xl font-bold text-white">Hi, Jordan 👋</div>
          <div className="mt-0.5 text-xs text-white/80">3 new orders waiting</div>
        </div>
      </div>
      {/* tiles */}
      <div className="grid grid-cols-2 gap-2.5 px-4 pt-4">
        {[
          { label: "Scan", icon: Camera },
          { label: "Map", icon: MapPin },
          { label: "Alerts", icon: Bell },
          { label: "Login", icon: Fingerprint },
        ].map(({ label, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-white/[0.04] p-3">
            <Icon className="h-4 w-4 text-brand-cyan" />
            <div className="mt-2 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>
      {/* list */}
      <div className="mt-4 space-y-1.5 px-4">
        {["Order #1284", "Order #1283", "Order #1282"].map((t, i) => (
          <div key={t} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
            <span>{t}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${i === 0 ? "bg-brand-pink/20 text-brand-pink" : "bg-white/5 text-muted-foreground"}`}>
              {i === 0 ? "New" : "Done"}
            </span>
          </div>
        ))}
      </div>
      {/* CTA */}
      <div className="absolute inset-x-4 bottom-5">
        <div className="rounded-2xl bg-gradient-primary py-2.5 text-center text-xs font-semibold text-white shadow-glow">
          Generate APK
        </div>
      </div>
    </div>
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  tone: "violet" | "pink" | "cyan";
}) => {
  const toneMap = {
    violet: "text-brand-violet from-brand-violet/30",
    pink: "text-brand-pink from-brand-pink/30",
    cyan: "text-brand-cyan from-brand-cyan/30",
  } as const;
  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-6 transition hover:border-white/20">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${toneMap[tone]} to-transparent opacity-60 blur-2xl transition group-hover:opacity-100`} />
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${toneMap[tone].split(" ")[0]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1.5 text-base font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: desc }} />
    </div>
  );
};

const PricingCard = ({
  name,
  price,
  tagline,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}) => (
  <div
    className={`relative rounded-3xl p-7 ${
      highlighted
        ? "glass-strong shadow-glow"
        : "glass"
    }`}
  >
    {highlighted && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-glow">
        Most popular
      </div>
    )}
    <div className="text-sm font-medium text-muted-foreground">{name}</div>
    <div className="mt-2 flex items-baseline gap-1">
      <span className="text-4xl font-extrabold tracking-tight">{price}</span>
      {price !== "Custom" && <span className="text-sm text-muted-foreground">/mo</span>}
    </div>
    <div className="mt-1 text-xs text-muted-foreground">{tagline}</div>
    <ul className="mt-6 space-y-2.5 text-sm">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2">
          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlighted ? "text-brand-cyan" : "text-muted-foreground"}`} />
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <Button
      className={`mt-6 w-full ${
        highlighted
          ? "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          : "glass border border-white/10 bg-transparent text-foreground hover:bg-white/5"
      }`}
    >
      {highlighted ? "Start Pro trial" : name === "Enterprise" ? "Talk to sales" : "Get started"}
    </Button>
  </div>
);

export default Index;
