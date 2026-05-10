import { useProjectStore } from '@/stores/projectStore';
import { Toolbar } from '@/components/builder/Toolbar';
import { ComponentTray } from '@/components/builder/ComponentTray';
import { LayersPanel } from '@/components/builder/LayersPanel';
import { ScreenManager } from '@/components/builder/ScreenManager';
import { VariableManager } from '@/components/builder/VariableManager';
import { DatabasePanel } from '@/components/builder/DatabasePanel';
import { Canvas } from '@/components/builder/Canvas';
import { InspectorPanel } from '@/components/builder/InspectorPanel';
import { LogicBuilder } from '@/components/builder/LogicBuilder';
import { NativeFeaturesPanel } from '@/components/builder/NativeFeaturesPanel';
import { DevicePreview } from '@/components/builder/DevicePreview';
import { APKGenerator } from '@/components/builder/APKGenerator';
import { TemplateMarketplace } from '@/components/builder/TemplateMarketplace';
import { FigmaImport } from '@/components/builder/FigmaImport';
import { QRPreviewModal } from '@/components/builder/QRPreviewModal';
import { HistoryPanel } from '@/components/builder/HistoryPanel';
import { PackagesPanel } from '@/components/builder/PackagesPanel';
import { FloatingToolbar } from '@/components/builder/FloatingToolbar';
import { LoginPanel } from '@/components/builder/LoginPanel';
import { LoadingScreen } from '@/components/builder/LoadingScreen';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Layers, MonitorSmartphone, Variable, Database, LayoutTemplate, History, Package } from 'lucide-react';

const LEFT_TABS = [
  { id: 'components' as const, label: 'Components', icon: LayoutTemplate },
  { id: 'layers' as const, label: 'Layers', icon: Layers },
  { id: 'screens' as const, label: 'Screens', icon: MonitorSmartphone },
  { id: 'variables' as const, label: 'Variables', icon: Variable },
  { id: 'database' as const, label: 'Database', icon: Database },
  { id: 'history' as const, label: 'History', icon: History },
  { id: 'packages' as const, label: 'Packages', icon: Package },
];

const Builder = () => {
  useKeyboardShortcuts();

  const leftPanelTab = useProjectStore((s) => s.leftPanelTab);
  const setLeftPanelTab = useProjectStore((s) => s.setLeftPanelTab);
  const rightPanelTab = useProjectStore((s) => s.rightPanelTab);
  const setRightPanelTab = useProjectStore((s) => s.setRightPanelTab);
  const isPreviewOpen = useProjectStore((s) => s.isPreviewOpen);
  const isApkModalOpen = useProjectStore((s) => s.isApkModalOpen);
  const isTemplateModalOpen = useProjectStore((s) => s.isTemplateModalOpen);
  const isFigmaModalOpen = useProjectStore((s) => s.isFigmaModalOpen);
  const isQrModalOpen = useProjectStore((s) => s.isQrModalOpen);
  const isLoginOpen = useProjectStore((s) => s.isLoginOpen);
  const isLoading = useProjectStore((s) => s.isLoading);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0A0A12]">
      {/* Top toolbar */}
      <Toolbar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <div className="flex w-[280px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0E0E18]">
          {/* Tab bar */}
          <div className="flex border-b border-white/[0.06]">
            {LEFT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeftPanelTab(tab.id)}
                className={`flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-colors ${
                  leftPanelTab === tab.id
                    ? 'bg-white/[0.04] text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
                title={tab.label}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {leftPanelTab === 'components' && <ComponentTray />}
            {leftPanelTab === 'layers' && <LayersPanel />}
            {leftPanelTab === 'screens' && <ScreenManager />}
            {leftPanelTab === 'variables' && <VariableManager />}
            {leftPanelTab === 'database' && <DatabasePanel />}
            {leftPanelTab === 'history' && <HistoryPanel />}
            {leftPanelTab === 'packages' && <PackagesPanel />}
          </div>
        </div>

        {/* ── Canvas (Center) ── */}
        <div className="relative flex-1 overflow-hidden bg-[#08080F]">
          <FloatingToolbar />
          <Canvas />
        </div>

        {/* ── Right Sidebar ── */}
        <div className="flex w-[300px] shrink-0 flex-col border-l border-white/[0.06] bg-[#0E0E18]">
          {/* Tab bar */}
          <div className="flex border-b border-white/[0.06]">
            {[
              { id: 'inspector' as const, label: 'Inspector' },
              { id: 'logic' as const, label: 'Logic' },
              { id: 'native' as const, label: 'Native' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  rightPanelTab === tab.id
                    ? 'border-b-2 border-violet-500 text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {rightPanelTab === 'inspector' && <InspectorPanel />}
            {rightPanelTab === 'logic' && <LogicBuilder />}
            {rightPanelTab === 'native' && <NativeFeaturesPanel />}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {isPreviewOpen && <DevicePreview />}
      {isApkModalOpen && <APKGenerator />}
      {isTemplateModalOpen && <TemplateMarketplace />}
      {isFigmaModalOpen && <FigmaImport />}
      {isQrModalOpen && <QRPreviewModal />}
      {isLoginOpen && <LoginPanel />}
      {isLoading && <LoadingScreen />}
    </div>
  );
};

export default Builder;
