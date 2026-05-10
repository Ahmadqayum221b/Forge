import { useProjectStore } from '@/stores/projectStore';
import { X, Sparkles, Loader2, AlertCircle, Wand2, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import type { ComponentType } from '@/types/builder';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an expert Android UI designer and JSON generator for a no-code app builder.
When given a description of a UI screen or component, you return ONLY a valid JSON array of component definitions — nothing else, no markdown, no explanation.

DESIGN PRINCIPLES:
- Use modern, premium aesthetics (Glassmorphism, vibrant gradients, subtle borders).
- Layout components logically for a mobile device (390x800).
- Standard spacing: 12-20px. 
- Use the "container" type for grouping related elements.

COMPONENT SCHEMA:
Each component object must have these fields:
- type: "button" | "text" | "image" | "input" | "textarea" | "switch" | "slider" | "checkbox" | "radio" | "container" | "card" | "divider" | "spacer" | "list" | "icon" | "header" | "badge" | "progress" | "tabs" | "avatar"
- x: number (20-350)
- y: number (starts from 20)
- width: number
- height: number
- props: object with component-specific props:
  - button: { label: string }
  - text: { content: string, align: "left"|"center"|"right" }
  - input: { placeholder: string, type: "text"|"email"|"password" }
  - card: { title: string, subtitle: string }
  - list: { items: string[] }
  - icon: { name: string, size: number }
  - header: { title: string }
  - badge: { text: string }
  - progress: { value: number }
- styles: object with CSS-like properties.

STYLING GUIDELINES:
- Primary Buttons: { backgroundColor: "#6C3AED", color: "#FFFFFF", borderRadius: 12, fontWeight: "600" }
- Glass Cards: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }
- Typography: Default color #FFFFFF. Font sizes 12-32.

Return ONLY a valid JSON array.`;

const DEMO_PROMPTS = [
  'A login screen with email input, password field, and sign in button',
  'A fitness dashboard with calories card, steps, and a start workout button',
  'A product card with title, price text, rating, and add to cart button',
  'A profile screen with name, bio text, follower stats, and follow button',
  'A to-do app with task list, add task input, and submit button',
];

interface AIGeneratorPanelProps {
  onClose: () => void;
}

export const AIGeneratorPanel = ({ onClose }: AIGeneratorPanelProps) => {
  const addComponents = useProjectStore(s => s.addComponents);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('groq_api_key'));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('groq_api_key', apiKey.trim());
      setShowKeyInput(false);
    }
  };

  const handleGenerate = async () => {
    const key = localStorage.getItem('groq_api_key');
    if (!key) { setShowKeyInput(true); return; }
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt.trim() },
          ],
          temperature: 0.4,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content || '';

      // Extract JSON array from response (handle potential backtick wrapping)
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('AI returned no valid component data. Try rephrasing.');

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('AI returned empty component list. Try a more specific description.');
      }

      // Validate types
      const validTypes: ComponentType[] = ['button', 'text', 'image', 'input', 'textarea', 'switch', 'slider', 'checkbox', 'radio', 'container', 'card', 'divider', 'spacer', 'list', 'icon', 'map', 'video'];
      const valid = parsed.filter(c => validTypes.includes(c.type));
      if (valid.length === 0) throw new Error('No valid component types found in AI response.');

      addComponents(valid);
      setSuccess(`✨ Success! Forge AI generated ${valid.length} components.`);
      setPrompt('');
      
      // Impactful success toast
      toast.success('UI Generated Successfully', {
        description: `Added ${valid.length} components based on your prompt.`,
        duration: 4000,
      });

      setTimeout(() => { setSuccess(null); onClose(); }, 1500);

    } catch (e: any) {
      setError(e.message || 'Generation failed. Check your API key or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col border-t border-white/[0.06] bg-[#0c0c1a]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-white/80">AI Component Generator</span>
        </div>
        <button onClick={onClose} className="rounded p-0.5 text-white/30 hover:text-white/70 transition">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* API Key setup */}
        {showKeyInput && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
            <p className="text-[10px] text-amber-300/80 font-medium">Enter your Groq API key to continue</p>
            <p className="text-[10px] text-white/30">Get free key at <span className="text-violet-300">console.groq.com</span></p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveApiKey()}
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-500/40 font-mono"
              />
              <button
                onClick={saveApiKey}
                disabled={!apiKey.trim()}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Prompt input */}
        <div className="space-y-1.5">
          <textarea
            ref={textareaRef}
            rows={3}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the UI you want to generate…"
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-white placeholder:text-white/25 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/10 transition leading-relaxed"
          />
        </div>

        {/* Demo prompts */}
        <div className="space-y-1">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/20">Try these</p>
          <div className="space-y-1">
            {DEMO_PROMPTS.slice(0, 3).map((p, i) => (
              <button
                key={i}
                onClick={() => setPrompt(p)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[10px] text-white/35 hover:bg-white/[0.04] hover:text-white/60 transition group"
              >
                <ChevronRight className="h-3 w-3 shrink-0 text-violet-500/40 group-hover:text-violet-400 transition" />
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
            <p className="text-[10px] text-red-300/80">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <span className="text-[10px] text-emerald-300/80">{success}</span>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Wand2 className="h-3.5 w-3.5" />
              Generate Components
            </>
          )}
        </button>

        {!showKeyInput && (
          <button
            onClick={() => setShowKeyInput(true)}
            className="w-full text-center text-[9px] text-white/20 hover:text-white/40 transition"
          >
            Change API key
          </button>
        )}
      </div>
    </div>
  );
};
