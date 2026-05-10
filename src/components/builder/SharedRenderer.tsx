import type { AppComponent } from '@/types/builder';
import * as LucideIcons from 'lucide-react';
import React, { useState, useEffect } from 'react';

const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Star;
  return Icon;
};

// Wrapper for inputs to maintain local state when not bound to a variable
const InteractiveInput = ({ value, type, placeholder, onChange, className, style }: any) => {
  const [localVal, setLocalVal] = useState(value);
  useEffect(() => setLocalVal(value), [value]);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={localVal}
      onChange={(e) => {
        setLocalVal(e.target.value);
        if (onChange) onChange(e.target.value);
      }}
      className={className}
      style={style}
    />
  );
};

const InteractiveTextarea = ({ value, placeholder, onChange, className, style }: any) => {
  const [localVal, setLocalVal] = useState(value);
  useEffect(() => setLocalVal(value), [value]);
  return (
    <textarea
      placeholder={placeholder}
      value={localVal}
      onChange={(e) => {
        setLocalVal(e.target.value);
        if (onChange) onChange(e.target.value);
      }}
      className={className}
      style={style}
    />
  );
};

interface SharedRendererProps {
  component: AppComponent;
  zoom: number;
  isInteractive?: boolean;
  localVariables?: Record<string, any>;
  onVariableChange?: (variableId: string, value: any) => void;
}

export const SharedRenderer = ({ component: comp, zoom, isInteractive, localVariables = {}, onVariableChange }: SharedRendererProps) => {
  const s = comp.styles;
  const p = comp.props;
  const fs = (size: number) => size * zoom;

  // Resolve variable bindings
  const boundValue = (propKey: string, fallback: any) => {
    const varId = comp.variableBindings[propKey];
    if (varId && localVariables[varId] !== undefined) return localVariables[varId];
    return fallback;
  };

  const handleUpdate = (propKey: string, value: any) => {
    const varId = comp.variableBindings[propKey];
    if (isInteractive && varId && onVariableChange) {
      onVariableChange(varId, value);
    }
  };

  const baseStyle: React.CSSProperties = {
    padding: s.padding ? fs(s.padding) : undefined,
    margin: s.margin ? fs(s.margin) : undefined,
    transform: s.rotation ? `rotate(${s.rotation}deg)` : undefined,
  };

  switch (comp.type) {
    case 'button':
      return (
        <div
          className={`flex h-full w-full items-center justify-center font-medium transition-all ${isInteractive ? 'hover:brightness-110 active:scale-95' : ''}`}
          style={{
            ...baseStyle,
            backgroundColor: s.backgroundColor || '#6C3AED',
            color: s.color || '#FFF',
            fontSize: fs(s.fontSize || 14),
            fontWeight: s.fontWeight || '600',
            borderRadius: fs(s.borderRadius || 12),
            border: s.borderWidth ? `${s.borderWidth}px solid ${s.borderColor}` : 'none',
            boxShadow: s.boxShadow || (isInteractive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'),
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          {boundValue('label', p.label || 'Button')}
        </div>
      );

    case 'text':
      return (
        <div
          className="flex h-full w-full items-start"
          style={{
            ...baseStyle,
            color: s.color || '#FFF',
            fontSize: fs(s.fontSize || 16),
            fontWeight: s.fontWeight || '400',
            lineHeight: s.lineHeight || 1.5,
            textAlign: s.textAlign || p.align || 'left',
          }}
        >
          {boundValue('content', p.content || 'Text')}
        </div>
      );

    case 'image':
      const src = boundValue('src', p.src);
      return src ? (
        <img
          src={src}
          alt={p.alt || ''}
          className="h-full w-full shadow-lg"
          style={{
            ...baseStyle,
            objectFit: s.objectFit || 'cover',
            borderRadius: fs(s.borderRadius || 12),
            boxShadow: s.boxShadow || '0 4px 12px rgba(0,0,0,0.1)',
            opacity: s.opacity ?? 1,
          }}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-white/5"
          style={{ ...baseStyle, borderRadius: fs(s.borderRadius || 12), border: '2px dashed rgba(255,255,255,0.15)', boxShadow: s.boxShadow || 'none' }}
        >
          <LucideIcons.Image className="h-6 w-6 text-white/20" />
        </div>
      );

    case 'input':
      const val = boundValue('value', p.value || '');
      const inputStyle: React.CSSProperties = {
        ...baseStyle,
        backgroundColor: s.backgroundColor || 'rgba(255,255,255,0.05)',
        color: s.color || '#FFF',
        fontSize: fs(s.fontSize || 14),
        borderRadius: fs(s.borderRadius || 12),
        border: `${s.borderWidth || 1}px solid ${s.borderColor || 'rgba(255,255,255,0.1)'}`,
        paddingLeft: fs(s.paddingX || 12),
        paddingRight: fs(s.paddingX || 12),
        outline: 'none',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      };
      
      if (isInteractive) {
        return (
          <InteractiveInput
            type={p.type || 'text'}
            placeholder={p.placeholder || 'Enter text...'}
            value={val}
            onChange={(v: string) => handleUpdate('value', v)}
            className="h-full w-full transition-colors focus:border-violet-500/50 focus:bg-white/10"
            style={inputStyle}
          />
        );
      }
      return (
        <div className="flex h-full w-full items-center truncate" style={{ ...inputStyle, color: val ? inputStyle.color : 'rgba(255,255,255,0.3)' }}>
          {val || p.placeholder || 'Enter text...'}
        </div>
      );

    case 'textarea':
      const textVal = boundValue('value', p.value || '');
      const areaStyle: React.CSSProperties = {
        ...baseStyle,
        backgroundColor: s.backgroundColor || 'rgba(255,255,255,0.05)',
        color: s.color || '#FFF',
        fontSize: fs(s.fontSize || 14),
        borderRadius: fs(s.borderRadius || 12),
        border: `${s.borderWidth || 1}px solid ${s.borderColor || 'rgba(255,255,255,0.1)'}`,
        padding: `${fs(s.paddingY || 10)}px ${fs(s.paddingX || 12)}px`,
        outline: 'none',
        resize: 'none',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      };

      if (isInteractive) {
        return (
          <InteractiveTextarea
            placeholder={p.placeholder || 'Enter text...'}
            value={textVal}
            onChange={(v: string) => handleUpdate('value', v)}
            className="h-full w-full transition-colors focus:border-violet-500/50 focus:bg-white/10"
            style={areaStyle}
          />
        );
      }
      return (
        <div className="flex h-full w-full items-start overflow-hidden" style={{ ...areaStyle, color: textVal ? areaStyle.color : 'rgba(255,255,255,0.3)' }}>
          {textVal || p.placeholder || 'Enter text...'}
        </div>
      );

    case 'switch':
      const isChecked = boundValue('checked', p.checked || false);
      const toggleSwitch = () => { if (isInteractive) handleUpdate('checked', !isChecked); };
      
      return (
        <div className="flex h-full w-full items-center gap-2" onClick={toggleSwitch} style={{ ...baseStyle, cursor: isInteractive ? 'pointer' : 'default' }}>
          <div
            className="relative rounded-full transition-colors"
            style={{
              width: fs(44), height: fs(24),
              backgroundColor: isChecked ? (s.activeColor || '#6C3AED') : (s.inactiveColor || 'rgba(255,255,255,0.15)'),
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md transition-all"
              style={{
                width: fs(18), height: fs(18),
                left: isChecked ? `calc(100% - ${fs(20)}px)` : `${fs(2)}px`,
              }}
            />
          </div>
          {p.label && <span style={{ color: '#FFF', fontSize: fs(12) }}>{p.label}</span>}
        </div>
      );

    case 'slider':
      const sliderVal = boundValue('value', p.value || 50);
      return (
        <div className="flex h-full w-full flex-col justify-center gap-1" style={baseStyle}>
          {p.label && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: fs(11) }}>{p.label}</span>}
          <div className="relative w-full" style={{ height: fs(4) }}>
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: s.trackColor || 'rgba(255,255,255,0.15)' }} />
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${sliderVal}%`, backgroundColor: s.activeColor || '#6C3AED' }} />
            <div className="absolute top-1/2 -translate-y-1/2 rounded-full shadow-md" style={{
              left: `${sliderVal}%`, width: fs(14), height: fs(14), marginLeft: fs(-7),
              backgroundColor: s.thumbColor || '#FFF',
            }} />
            {isInteractive && (
              <input type="range" min={p.min||0} max={p.max||100} value={sliderVal}
                onChange={(e)=>handleUpdate('value', Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            )}
          </div>
        </div>
      );

    case 'checkbox':
      const cbChecked = boundValue('checked', p.checked || false);
      const toggleCb = () => { if (isInteractive) handleUpdate('checked', !cbChecked); };
      
      return (
        <div className="flex h-full w-full items-center gap-2" onClick={toggleCb} style={{ ...baseStyle, cursor: isInteractive ? 'pointer' : 'default' }}>
          <div
            className="flex items-center justify-center rounded"
            style={{
              width: fs(18), height: fs(18),
              backgroundColor: cbChecked ? (s.activeColor || '#6C3AED') : 'transparent',
              border: `2px solid ${cbChecked ? (s.activeColor || '#6C3AED') : 'rgba(255,255,255,0.3)'}`,
            }}
          >
            {cbChecked && <LucideIcons.Check style={{ color: '#FFF', width: fs(12), height: fs(12) }} />}
          </div>
          <span style={{ color: s.color || '#FFF', fontSize: fs(s.fontSize || 14) }}>{p.label || 'Option'}</span>
        </div>
      );

    case 'radio':
      return (
        <div className="flex h-full w-full items-center gap-2" style={baseStyle}>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: fs(18), height: fs(18),
              border: `2px solid ${p.selected ? (s.activeColor || '#6C3AED') : 'rgba(255,255,255,0.3)'}`,
            }}
          >
            {p.selected && (
              <div className="rounded-full" style={{ width: fs(10), height: fs(10), backgroundColor: s.activeColor || '#6C3AED' }} />
            )}
          </div>
          <span style={{ color: s.color || '#FFF', fontSize: fs(s.fontSize || 14) }}>{p.label || 'Choice'}</span>
        </div>
      );

    case 'container':
      return (
        <div
          className="h-full w-full overflow-hidden"
          style={{
            ...baseStyle,
            backgroundColor: s.backgroundColor || 'rgba(255,255,255,0.04)',
            borderRadius: fs(s.borderRadius || 16),
            border: `${s.borderWidth || 1}px solid ${s.borderColor || 'rgba(255,255,255,0.08)'}`,
            boxShadow: s.boxShadow || 'none',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: s.flexDirection || 'column',
            justifyContent: s.justifyContent || 'flex-start',
            alignItems: s.alignItems || 'stretch',
          }}
        />
      );

    case 'card':
      return (
        <div
          className="flex h-full w-full flex-col overflow-hidden"
          style={{
            ...baseStyle,
            backgroundColor: s.backgroundColor || 'rgba(255,255,255,0.08)',
            borderRadius: fs(s.borderRadius || 16),
            border: `${s.borderWidth || 1}px solid ${s.borderColor || 'rgba(255,255,255,0.1)'}`,
            boxShadow: s.boxShadow || '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ color: '#FFF', fontSize: fs(16), fontWeight: '600' }}>{boundValue('title', p.title || 'Card')}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: fs(12), marginTop: fs(4) }}>{boundValue('subtitle', p.subtitle || 'Description')}</div>
        </div>
      );

    case 'divider':
      return (
        <div className="flex h-full w-full items-center" style={baseStyle}>
          <div className="w-full" style={{ height: 1, backgroundColor: s.backgroundColor || 'rgba(255,255,255,0.12)' }} />
        </div>
      );

    case 'spacer':
      return (
        <div className="flex h-full w-full items-center justify-center" style={baseStyle}>
          <div className="h-px w-full border-t border-dashed border-white/10" />
        </div>
      );

    case 'list':
      const listItems = boundValue('items', p.items || ['Item 1', 'Item 2', 'Item 3']);
      return (
        <div
          className="flex h-full w-full flex-col overflow-hidden"
          style={{
            ...baseStyle,
            backgroundColor: s.backgroundColor || 'rgba(255,255,255,0.04)',
            borderRadius: fs(s.borderRadius || 16),
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {(Array.isArray(listItems) ? listItems : []).map((item: string, i: number) => (
            <div
              key={i}
              className="flex items-center px-3 hover:bg-white/[0.02]"
              style={{
                height: fs(p.itemHeight || 48),
                borderBottom: `1px solid ${s.dividerColor || 'rgba(255,255,255,0.08)'}`,
                color: s.itemColor || '#FFF',
                fontSize: fs(s.fontSize || 14),
                paddingLeft: fs(12),
              }}
            >
              {item}
            </div>
          ))}
        </div>
      );

    case 'icon': {
      const DynamicIcon = getIcon(p.name || 'Star');
      return (
        <div className="flex h-full w-full items-center justify-center drop-shadow-md" style={baseStyle}>
          <DynamicIcon style={{ color: s.color || '#6C3AED', width: fs(p.size || 24), height: fs(p.size || 24) }} />
        </div>
      );
    }

    case 'map':
      return (
        <div
          className="flex h-full w-full items-center justify-center bg-slate-800/50"
          style={{ ...baseStyle, borderRadius: fs(s.borderRadius || 16), border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <LucideIcons.MapPin className="text-white/30" style={{ width: fs(24), height: fs(24) }} />
        </div>
      );

    case 'video':
      return (
        <div
          className="flex h-full w-full items-center justify-center bg-slate-800/50"
          style={{ ...baseStyle, borderRadius: fs(s.borderRadius || 16), border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <LucideIcons.Video className="text-white/30" style={{ width: fs(24), height: fs(24) }} />
        </div>
      );

    case 'header':
      return (
        <div
          className="flex h-full w-full items-center justify-between"
          style={{
            ...baseStyle,
            backgroundColor: s.backgroundColor || 'rgba(255,255,255,0.05)',
            padding: `0 ${fs(16)}px`,
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          <div className="flex items-center gap-3">
            {p.showBack && <LucideIcons.ChevronLeft style={{ width: fs(24), height: fs(24), color: s.color || '#FFF' }} />}
            <span style={{ color: s.color || '#FFF', fontSize: fs(s.fontSize || 16), fontWeight: s.fontWeight || '600' }}>
              {boundValue('title', p.title || 'Page Title')}
            </span>
          </div>
          {p.showAction && <LucideIcons.MoreVertical style={{ width: fs(20), height: fs(20), color: s.color || '#FFF' }} />}
        </div>
      );

    case 'badge':
      return (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            ...baseStyle,
            backgroundColor: s.backgroundColor || '#EC4899',
            color: s.color || '#FFF',
            borderRadius: fs(s.borderRadius || 12),
            fontSize: fs(s.fontSize || 10),
            fontWeight: s.fontWeight || '700',
            padding: `0 ${fs(8)}px`,
          }}
        >
          {boundValue('text', p.text || 'New')}
        </div>
      );

    case 'progress':
      const progressVal = boundValue('value', p.value || 60);
      return (
        <div className="flex h-full w-full items-center" style={baseStyle}>
          <div className="relative w-full overflow-hidden" style={{ height: fs(s.height || 8), backgroundColor: s.trackColor || 'rgba(255,255,255,0.1)', borderRadius: fs(s.borderRadius || 4) }}>
            <div className="absolute left-0 top-0 h-full transition-all" style={{ width: `${progressVal}%`, backgroundColor: s.activeColor || '#6C3AED' }} />
          </div>
        </div>
      );

    case 'tabs':
      const tabs = boundValue('tabs', p.tabs || ['Home', 'Search', 'Profile']);
      const activeIdx = boundValue('activeIndex', p.activeIndex || 0);
      return (
        <div className="flex h-full w-full items-center justify-around" style={{ ...baseStyle, backgroundColor: s.backgroundColor || 'transparent' }}>
          {tabs.map((t: string, i: number) => (
            <div key={i} className="flex flex-col items-center justify-between h-full pt-3 cursor-pointer">
              <span style={{ color: i === activeIdx ? (s.activeColor || '#FFF') : (s.inactiveColor || 'rgba(255,255,255,0.4)'), fontSize: fs(14), fontWeight: i === activeIdx ? '600' : '400' }}>
                {t}
              </span>
              <div style={{ width: fs(30), height: fs(3), backgroundColor: i === activeIdx ? (s.indicatorColor || '#6C3AED') : 'transparent', borderRadius: `${fs(3)}px ${fs(3)}px 0 0` }} />
            </div>
          ))}
        </div>
      );

    case 'avatar':
      const avatarSrc = boundValue('src', p.src);
      return (
        <div
          className="flex h-full w-full items-center justify-center overflow-hidden"
          style={{
            ...baseStyle,
            backgroundColor: s.backgroundColor || 'rgba(255,255,255,0.1)',
            borderRadius: fs(s.borderRadius || 24),
            color: s.color || '#FFF',
            fontSize: fs(s.fontSize || 16),
            fontWeight: s.fontWeight || '600',
            boxShadow: s.boxShadow || 'none',
          }}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span>{boundValue('fallback', p.fallback || 'US')}</span>
          )}
        </div>
      );

    default:
      return <div className="flex h-full w-full items-center justify-center bg-red-500/20 text-white/50 text-xs rounded">Unknown</div>;
  }
};
