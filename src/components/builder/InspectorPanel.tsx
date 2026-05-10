import { useProjectStore } from '@/stores/projectStore';
import { Trash2, Copy, ArrowUp, ArrowDown, Eye, EyeOff, Lock, Unlock, AlignLeft, AlignCenter, AlignRight, AlignVerticalSpaceAround, AlignHorizontalSpaceAround, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { DEVICE_FRAMES } from '@/types/builder';

export const InspectorPanel = () => {
  const selectedId = useProjectStore((s) => s.selectedComponentId);
  const components = useProjectStore((s) => s.components);
  const updateComponent = useProjectStore((s) => s.updateComponent);
  const removeComponent = useProjectStore((s) => s.removeComponent);
  const duplicateComponent = useProjectStore((s) => s.duplicateComponent);
  const bringToFront = useProjectStore((s) => s.bringToFront);
  const sendToBack = useProjectStore((s) => s.sendToBack);
  const alignComponent = useProjectStore((s) => s.alignComponent);
  const variables = useProjectStore((s) => s.variables);
  const deviceFrame = useProjectStore((s) => s.deviceFrame);

  const comp = selectedId ? components[selectedId] : null;

  if (!comp) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-3 rounded-2xl bg-white/[0.03] p-4">
          <div className="text-2xl">🎯</div>
        </div>
        <p className="text-sm font-medium text-white/40">No selection</p>
        <p className="mt-1 text-xs text-white/20">Click a component on the canvas to inspect it</p>
      </div>
    );
  }

  const updateProp = (key: string, value: any) => {
    updateComponent(comp.id, { props: { ...comp.props, [key]: value } });
  };

  const updateStyle = (key: string, value: any) => {
    updateComponent(comp.id, { styles: { ...comp.styles, [key]: value } });
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Header + actions */}
      <div className="border-b border-white/[0.06] p-3">
        <div className="flex items-center justify-between">
          <input
            className="rounded bg-transparent px-1 text-sm font-semibold text-white outline-none focus:bg-white/5 focus:ring-1 focus:ring-violet-500/40 w-full"
            value={comp.name}
            onChange={(e) => updateComponent(comp.id, { name: e.target.value })}
          />
        </div>
        <div className="mt-2 flex items-center gap-1">
          <ActionBtn icon={comp.visible ? Eye : EyeOff} title="Toggle Visibility"
            onClick={() => updateComponent(comp.id, { visible: !comp.visible })} />
          <ActionBtn icon={comp.locked ? Lock : Unlock} title="Toggle Lock"
            onClick={() => updateComponent(comp.id, { locked: !comp.locked })} />
          <ActionBtn icon={ArrowUp} title="Bring to Front" onClick={() => bringToFront(comp.id)} />
          <ActionBtn icon={ArrowDown} title="Send to Back" onClick={() => sendToBack(comp.id)} />
          <ActionBtn icon={Copy} title="Duplicate" onClick={() => duplicateComponent(comp.id)} />
          <ActionBtn icon={Trash2} title="Delete" onClick={() => removeComponent(comp.id)} danger />
        </div>
      </div>

      {/* Alignment section */}
      <div className="border-b border-white/[0.06] p-3 flex justify-between gap-1">
        <div className="flex gap-0.5 bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
          <ActionBtn icon={AlignLeft} title="Align Left" onClick={() => alignComponent(comp.id, 'left', DEVICE_FRAMES[deviceFrame].width, DEVICE_FRAMES[deviceFrame].height)} />
          <ActionBtn icon={AlignCenter} title="Align Center Horizontal" onClick={() => alignComponent(comp.id, 'center', DEVICE_FRAMES[deviceFrame].width, DEVICE_FRAMES[deviceFrame].height)} />
          <ActionBtn icon={AlignRight} title="Align Right" onClick={() => alignComponent(comp.id, 'right', DEVICE_FRAMES[deviceFrame].width, DEVICE_FRAMES[deviceFrame].height)} />
        </div>
        <div className="flex gap-0.5 bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
          <ActionBtn icon={AlignHorizontalSpaceAround} title="Align Top" onClick={() => alignComponent(comp.id, 'top', DEVICE_FRAMES[deviceFrame].width, DEVICE_FRAMES[deviceFrame].height)} />
          <ActionBtn icon={AlignVerticalJustifyCenter} title="Align Middle Vertical" onClick={() => alignComponent(comp.id, 'middle', DEVICE_FRAMES[deviceFrame].width, DEVICE_FRAMES[deviceFrame].height)} />
          <ActionBtn icon={AlignVerticalSpaceAround} title="Align Bottom" onClick={() => alignComponent(comp.id, 'bottom', DEVICE_FRAMES[deviceFrame].width, DEVICE_FRAMES[deviceFrame].height)} />
        </div>
      </div>

      {/* Layout section */}
      <Section title="Layout" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={Math.round(comp.x)} onChange={(v) => updateComponent(comp.id, { x: v })} />
          <NumberField label="Y" value={Math.round(comp.y)} onChange={(v) => updateComponent(comp.id, { y: v })} />
          <NumberField label="W" value={Math.round(comp.width)} onChange={(v) => updateComponent(comp.id, { width: Math.max(20, v) })} />
          <NumberField label="H" value={Math.round(comp.height)} onChange={(v) => updateComponent(comp.id, { height: Math.max(10, v) })} />
          <NumberField label="Padding" value={comp.styles.padding || 0} onChange={(v) => updateStyle('padding', v)} />
          <NumberField label="Margin" value={comp.styles.margin || 0} onChange={(v) => updateStyle('margin', v)} />
          <NumberField label="Rotate" value={comp.styles.rotation || 0} onChange={(v) => updateStyle('rotation', v)} />
          <NumberField label="Z-Index" value={comp.zIndex || 0} onChange={(v) => updateComponent(comp.id, { zIndex: v })} />
        </div>
      </Section>

      {/* Content section - varies by component type */}
      <Section title="Content" defaultOpen>
        {(comp.type === 'button') && (
          <TextField label="Label" value={comp.props.label || ''} onChange={(v) => updateProp('label', v)} />
        )}
        {(comp.type === 'text') && (
          <TextAreaField label="Content" value={comp.props.content || ''} onChange={(v) => updateProp('content', v)} />
        )}
        {(comp.type === 'image') && (
          <>
            <TextField label="Image URL" value={comp.props.src || ''} onChange={(v) => updateProp('src', v)} placeholder="https://..." />
            <SelectField label="Object Fit" value={comp.styles.objectFit || 'cover'} onChange={(v) => updateStyle('objectFit', v)} options={['cover', 'contain', 'fill']} />
          </>
        )}
        {(comp.type === 'input') && (
          <>
            <TextField label="Placeholder" value={comp.props.placeholder || ''} onChange={(v) => updateProp('placeholder', v)} />
            <SelectField label="Type" value={comp.props.type || 'text'} options={['text', 'email', 'password', 'number', 'tel']}
              onChange={(v) => updateProp('type', v)} />
          </>
        )}
        {(comp.type === 'textarea') && (
          <TextField label="Placeholder" value={comp.props.placeholder || ''} onChange={(v) => updateProp('placeholder', v)} />
        )}
        {(comp.type === 'switch' || comp.type === 'checkbox') && (
          <ToggleField label="Default Checked" value={comp.props.checked || false} onChange={(v) => updateProp('checked', v)} />
        )}
        {(comp.type === 'slider') && (
          <>
            <NumberField label="Min" value={comp.props.min ?? 0} onChange={(v) => updateProp('min', v)} />
            <NumberField label="Max" value={comp.props.max ?? 100} onChange={(v) => updateProp('max', v)} />
            <NumberField label="Value" value={comp.props.value ?? 50} onChange={(v) => updateProp('value', v)} />
          </>
        )}
        {(comp.type === 'card') && (
          <>
            <TextField label="Title" value={comp.props.title || ''} onChange={(v) => updateProp('title', v)} />
            <TextField label="Subtitle" value={comp.props.subtitle || ''} onChange={(v) => updateProp('subtitle', v)} />
          </>
        )}
        {(comp.type === 'list') && (
          <TextAreaField label="Items (one per line)" value={(comp.props.items || []).join('\n')}
            onChange={(v) => updateProp('items', v.split('\n').filter(Boolean))} />
        )}
        {(comp.type === 'icon') && (
          <>
            <SelectField label="Icon" value={comp.props.name || 'Star'} onChange={(v) => updateProp('name', v)}
              options={['Star', 'Heart', 'Home', 'Settings', 'User', 'Bell', 'Search', 'Menu', 'Camera', 'MapPin', 'Video', 'MessageCircle']} />
            <NumberField label="Size" value={comp.props.size || 24} onChange={(v) => updateProp('size', v)} />
          </>
        )}
        {(comp.type === 'header') && (
          <>
            <TextField label="Title" value={comp.props.title || ''} onChange={(v) => updateProp('title', v)} />
            <ToggleField label="Show Back" value={comp.props.showBack || false} onChange={(v) => updateProp('showBack', v)} />
            <ToggleField label="Show Action" value={comp.props.showAction || false} onChange={(v) => updateProp('showAction', v)} />
          </>
        )}
        {(comp.type === 'badge') && (
          <TextField label="Text" value={comp.props.text || ''} onChange={(v) => updateProp('text', v)} />
        )}
        {(comp.type === 'progress') && (
          <NumberField label="Value %" value={comp.props.value ?? 0} onChange={(v) => updateProp('value', Math.max(0, Math.min(100, v)))} />
        )}
        {(comp.type === 'tabs') && (
          <>
            <TextAreaField label="Tabs (one per line)" value={(comp.props.tabs || []).join('\n')} onChange={(v) => updateProp('tabs', v.split('\n').filter(Boolean))} />
            <NumberField label="Active Index" value={comp.props.activeIndex ?? 0} onChange={(v) => updateProp('activeIndex', v)} />
          </>
        )}
        {(comp.type === 'avatar') && (
          <>
            <TextField label="Image URL" value={comp.props.src || ''} onChange={(v) => updateProp('src', v)} />
            <TextField label="Fallback Text" value={comp.props.fallback || ''} onChange={(v) => updateProp('fallback', v)} />
          </>
        )}
        {(comp.type === 'container') && (
          <>
            <SelectField label="Flex Direction" value={comp.styles.flexDirection || 'column'} onChange={(v) => updateStyle('flexDirection', v)} options={['row', 'column']} />
            <SelectField label="Justify" value={comp.styles.justifyContent || 'flex-start'} onChange={(v) => updateStyle('justifyContent', v)} options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around']} />
            <SelectField label="Align Items" value={comp.styles.alignItems || 'stretch'} onChange={(v) => updateStyle('alignItems', v)} options={['stretch', 'flex-start', 'center', 'flex-end']} />
          </>
        )}
      </Section>

      {/* Style section */}
      <Section title="Style">
        {comp.styles.backgroundColor !== undefined && (
          <ColorField label="Background" value={comp.styles.backgroundColor} onChange={(v) => updateStyle('backgroundColor', v)} />
        )}
        {comp.styles.color !== undefined && (
          <ColorField label="Color" value={comp.styles.color} onChange={(v) => updateStyle('color', v)} />
        )}
        {comp.styles.fontSize !== undefined && (
          <NumberField label="Font Size" value={comp.styles.fontSize} onChange={(v) => updateStyle('fontSize', v)} />
        )}
        {(comp.type === 'text') && (
          <SelectField label="Text Align" value={comp.styles.textAlign || comp.props.align || 'left'} onChange={(v) => updateStyle('textAlign', v)} options={['left', 'center', 'right', 'justify']} />
        )}
        {comp.styles.fontWeight !== undefined && (
          <SelectField label="Font Weight" value={comp.styles.fontWeight} onChange={(v) => updateStyle('fontWeight', v)}
            options={['300', '400', '500', '600', '700', '800']} />
        )}
        {comp.styles.borderRadius !== undefined && (
          <NumberField label="Radius" value={comp.styles.borderRadius} onChange={(v) => updateStyle('borderRadius', v)} />
        )}
        {comp.styles.borderWidth !== undefined && (
          <NumberField label="Border" value={comp.styles.borderWidth} onChange={(v) => updateStyle('borderWidth', v)} />
        )}
        {comp.styles.opacity !== undefined && (
          <NumberField label="Opacity %" value={Math.round(comp.styles.opacity * 100)} onChange={(v) => updateStyle('opacity', Math.max(0, Math.min(100, v)) / 100)} />
        )}
        {comp.styles.boxShadow !== undefined && (
          <SelectField label="Shadow" value={comp.styles.boxShadow} onChange={(v) => updateStyle('boxShadow', v)}
            options={[
              'none',
              '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              '0 0 10px 2px rgba(139,92,246,0.3)',
            ]} />
        )}
      </Section>

      {/* Variable Bindings */}
      {variables.length > 0 && (
        <Section title="Variable Bindings">
          <div className="space-y-2">
            {Object.keys(comp.props).map((propKey) => (
              <div key={propKey} className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-16 shrink-0 truncate">{propKey}</span>
                <select
                  value={comp.variableBindings[propKey] || ''}
                  onChange={(e) =>
                    updateComponent(comp.id, {
                      variableBindings: { ...comp.variableBindings, [propKey]: e.target.value || undefined },
                    })
                  }
                  className="flex-1 rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-white outline-none"
                >
                  <option value="">None</option>
                  {variables.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

// ── Field components ────────────────────────────────────────────────

const Section = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.06]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition"
      >
        <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{title}</div>
        <ChevronDown className={`h-3 w-3 text-white/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
};

const NumberField = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center gap-2">
    <span className="w-6 text-[10px] text-white/40">{label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500/40"
    />
  </div>
);

const TextField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <span className="mb-1 block text-[10px] text-white/40">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500/40 placeholder:text-white/20"
    />
  </div>
);

const TextAreaField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <span className="mb-1 block text-[10px] text-white/40">{label}</span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500/40 resize-none"
    />
  </div>
);

const SelectField = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
  <div>
    <span className="mb-1 block text-[10px] text-white/40">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500/40"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const PRESETS = ['#6C3AED', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#FFFFFF', '#000000',
    'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.15)', 'transparent'];
  return (
    <div>
      <span className="mb-1 block text-[10px] text-white/40">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-7 w-7 shrink-0 rounded border border-white/10"
          style={{ backgroundColor: value || 'transparent' }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-[10px] text-white outline-none focus:border-violet-500/40 font-mono"
        />
      </div>
      {isOpen && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => { onChange(c); setIsOpen(false); }}
              className="h-5 w-5 rounded border border-white/10 transition hover:scale-110"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ToggleField = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-white/60">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className="relative h-5 w-9 rounded-full transition"
      style={{ backgroundColor: value ? '#6C3AED' : 'rgba(255,255,255,0.15)' }}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? 'left-4.5' : 'left-0.5'}`}
        style={{ left: value ? 18 : 2 }}
      />
    </button>
  </div>
);

const ActionBtn = ({ icon: Icon, title, onClick, danger }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`rounded p-1.5 transition ${danger ? 'text-red-400/60 hover:bg-red-500/10 hover:text-red-400' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
  >
    <Icon className="h-3.5 w-3.5" />
  </button>
);
