import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandCore, BrandColor } from '../../types';
import { 
  Palette, 
  Type, 
  Sparkles, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Layers, 
  Compass, 
  Target, 
  MessageSquare, 
  Download, 
  RefreshCw, 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BrandCoreEditorProps {
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const BrandCoreEditor: React.FC<BrandCoreEditorProps> = ({ onNotify }) => {
  const { brandCore, saveBrandCore, workspace } = useWorkspace();

  type CoreSubSection = 'identity' | 'colors' | 'typography' | 'visual' | 'voice' | 'audience' | 'positioning';
  const [subSection, setSubSection] = useState<CoreSubSection>('identity');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // New color state
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#DC2626');
  const [newColorRole, setNewColorRole] = useState('Accent CTA');

  // Input states for list arrays
  const [newKeyword, setNewKeyword] = useState('');
  const [newTrait, setNewTrait] = useState('');
  const [newDoSay, setNewDoSay] = useState('');
  const [newDontSay, setNewDontSay] = useState('');
  const [newSegment, setNewSegment] = useState('');
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newUsp, setNewUsp] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateAIStrategy = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/brand-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandCore?.brandName || workspace?.name || 'Vanguard Brand',
          industry: brandCore?.industry || 'Enterprise & Creative Tech',
          brandVibe: brandCore?.visualDirection?.aestheticKeywords?.join(', ') || 'Architectural, High-trust, Bold',
          targetAudience: brandCore?.targetAudience?.primaryIcp || 'Modern founders and scale-ups',
          primaryGoal: brandCore?.positioning?.valueProposition || 'Global brand authority & high conversion',
        }),
      });

      const json = await res.json();
      if (json && json.data) {
        const strat = json.data;
        await saveBrandCore({
          brandName: brandCore?.brandName || workspace?.name || 'Vanguard Brand',
          tagline: strat.brandTagline || brandCore?.tagline || '',
          archetype: strat.brandArchetype || brandCore?.archetype || 'The Creator & Ruler',
          colorPalette: (strat.colorPalette || []).map((c: any) => ({
            name: c.name,
            hex: c.hex,
            role: c.role || 'Brand Color',
          })),
          typographyPairing: {
            heading: strat.typographyPairing?.heading || 'Space Grotesk (Bold 700)',
            body: strat.typographyPairing?.body || 'Plus Jakarta Sans (Medium 500)',
            monospace: strat.typographyPairing?.monospace || 'JetBrains Mono',
          },
          voiceAndTone: {
            traits: strat.voiceAndTone?.traits || ['Precision', 'Bold', 'Zero Fluff'],
            doSay: strat.voiceAndTone?.doSay || [],
            dontSay: strat.voiceAndTone?.dontSay || [],
            vocabulary: ['Sovereignty', 'Momentum', 'Precision', 'High-Trust'],
            guidingPrinciples: ['Be direct', 'Quantify value', 'Avoid buzzwords'],
          },
          positioning: {
            marketCategory: brandCore?.industry || 'Enterprise Software',
            valueProposition: strat.marketPositioningStatement || '',
            uniqueSellingPoints: ['Institutional-grade infrastructure', 'Zero-friction operations'],
            competitorDifferentiators: ['Unified OS replacing fragmented tool stacks'],
            positioningStatement: strat.marketPositioningStatement || '',
          },
        });

        onNotify('Brand Strategy & Identity generated from AI Brain!', 'success');
        try {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err: any) {
      onNotify('Brand identity updated!', 'info');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddColor = async () => {
    if (!newColorName.trim()) return;
    const currentColors = brandCore?.colorPalette || [];
    const updated = [...currentColors, { name: newColorName.trim(), hex: newColorHex, role: newColorRole }];
    await saveBrandCore({ colorPalette: updated });
    setNewColorName('');
    onNotify(`Added color "${newColorName}" to palette`, 'success');
  };

  const handleRemoveColor = async (index: number) => {
    const currentColors = brandCore?.colorPalette || [];
    const updated = currentColors.filter((_, i) => i !== index);
    await saveBrandCore({ colorPalette: updated });
    onNotify('Color removed from palette', 'info');
  };

  const exportBrandGuidelines = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(brandCore, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${(brandCore?.brandName || 'Brand').replace(/\s+/g, '_')}_Brand_Core_Architecture.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onNotify('Brand Architecture JSON exported!', 'success');
  };

  if (!brandCore) {
    return (
      <div className="p-8 text-center bg-zinc-950/60 border border-zinc-800 rounded-2xl">
        <Sparkles className="w-8 h-8 text-red-500 mx-auto mb-2 animate-pulse" />
        <p className="text-sm text-zinc-400">Loading Brand Core infrastructure...</p>
      </div>
    );
  }

  return (
    <div id="brand-core-editor" className="space-y-6">
      {/* Header & Export Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Brand Core & Identity System</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
              Master Spec
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Persistent brand guidelines, visual tokens, voice parameters, and audience positioning powering Creative Brain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAIStrategy}
            disabled={isGeneratingAI}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isGeneratingAI ? 'Generating...' : 'AI Brand Strategist'}
          </button>

          <button
            onClick={exportBrandGuidelines}
            className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Kit
          </button>
        </div>
      </div>

      {/* Brand Subsections Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto pb-1">
        {[
          { id: 'identity', label: 'Identity & Monograms', icon: Compass },
          { id: 'colors', label: 'Color Tokens', icon: Palette },
          { id: 'typography', label: 'Typography Pairing', icon: Type },
          { id: 'visual', label: 'Visual Direction', icon: Layers },
          { id: 'voice', label: 'Voice & Tone', icon: MessageSquare },
          { id: 'audience', label: 'Target Audience ICP', icon: Target },
          { id: 'positioning', label: 'Positioning & USPs', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubSection(tab.id as CoreSubSection)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all cursor-pointer border-b-2 ${
                isActive
                  ? 'border-red-500 text-red-400 bg-red-500/10'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: IDENTITY & MONOGRAMS */}
      {subSection === 'identity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-red-500" />
              Core Identity Attributes
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Brand Name</label>
                <input
                  type="text"
                  value={brandCore.brandName}
                  onChange={(e) => saveBrandCore({ brandName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Brand Tagline</label>
                <input
                  type="text"
                  value={brandCore.tagline || ''}
                  onChange={(e) => saveBrandCore({ tagline: e.target.value })}
                  placeholder="e.g. Engineered for Generational Momentum"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Industry / Domain</label>
                  <input
                    type="text"
                    value={brandCore.industry || ''}
                    onChange={(e) => saveBrandCore({ industry: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Brand Archetype</label>
                  <input
                    type="text"
                    value={brandCore.archetype || ''}
                    onChange={(e) => saveBrandCore({ archetype: e.target.value })}
                    placeholder="e.g. The Ruler & Creator"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-500" />
              Logo & Visual Assets
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Primary Logo Vector / URL</label>
                <input
                  type="text"
                  value={brandCore.logoAssets?.primaryLogoUrl || ''}
                  onChange={(e) =>
                    saveBrandCore({
                      logoAssets: {
                        ...(brandCore.logoAssets || { primaryLogoUrl: '' }),
                        primaryLogoUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="https://... or SVG vector link"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Icon Mark / Favicon URL</label>
                <input
                  type="text"
                  value={brandCore.logoAssets?.iconMarkUrl || ''}
                  onChange={(e) =>
                    saveBrandCore({
                      logoAssets: {
                        ...(brandCore.logoAssets || { primaryLogoUrl: '' }),
                        iconMarkUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="https://... square icon mark"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>

              {brandCore.logoAssets?.primaryLogoUrl && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center h-28">
                  <img
                    src={brandCore.logoAssets.primaryLogoUrl}
                    alt="Logo Preview"
                    referrerPolicy="no-referrer"
                    className="max-h-20 max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: COLOR TOKENS */}
      {subSection === 'colors' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(brandCore.colorPalette || []).map((col, idx) => (
              <div
                key={idx}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div
                    className="w-full h-20 rounded-xl shadow-inner border border-white/10 flex items-end p-2 transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: col.hex }}
                  >
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {col.hex}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-zinc-100">{col.name}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{col.role}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => copyToClipboard(col.hex, `col-${idx}`)}
                    className="text-[11px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === `col-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Hex
                  </button>

                  <button
                    onClick={() => handleRemoveColor(idx)}
                    className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Color Card */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-zinc-700"
              />
              <input
                type="text"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs font-mono text-zinc-200"
              />
            </div>

            <input
              type="text"
              placeholder="Color name (e.g. Sovereign Crimson)"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200"
            />

            <input
              type="text"
              placeholder="Role (e.g. Primary CTA & Monogram mark)"
              value={newColorRole}
              onChange={(e) => setNewColorRole(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200"
            />

            <button
              onClick={handleAddColor}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-red-600/20 whitespace-nowrap cursor-pointer"
            >
              Add Token
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: TYPOGRAPHY PAIRING */}
      {subSection === 'typography' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Type className="w-4 h-4 text-red-500" />
            Typographic Scale & Pairing Architecture
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Display Heading Font</label>
              <input
                type="text"
                value={brandCore.typographyPairing?.heading || ''}
                onChange={(e) =>
                  saveBrandCore({
                    typographyPairing: {
                      ...(brandCore.typographyPairing || { heading: '', body: '', monospace: '' }),
                      heading: e.target.value,
                    },
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Body & Editorial Font</label>
              <input
                type="text"
                value={brandCore.typographyPairing?.body || ''}
                onChange={(e) =>
                  saveBrandCore({
                    typographyPairing: {
                      ...(brandCore.typographyPairing || { heading: '', body: '', monospace: '' }),
                      body: e.target.value,
                    },
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Monospace / Data Font</label>
              <input
                type="text"
                value={brandCore.typographyPairing?.monospace || ''}
                onChange={(e) =>
                  saveBrandCore({
                    typographyPairing: {
                      ...(brandCore.typographyPairing || { heading: '', body: '', monospace: '' }),
                      monospace: e.target.value,
                    },
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Live Typographic Specimen */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">
              Live Specimen Preview
            </span>
            <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">
              {brandCore.tagline || 'Command Your Sovereign Infrastructure'}
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              We engineer high-conviction tools for operators who value precision, authority, and relentless execution over superficial trends.
            </p>
            <div className="text-xs font-mono text-zinc-500">
              TOKEN_REF: {brandCore.brandName.toUpperCase().replace(/\s+/g, '_')} // SCALE_RATIO: 1.333 // LATENCY: 0.04ms
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: VISUAL DIRECTION */}
      {subSection === 'visual' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            Visual Direction & Aesthetic Keywords
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Aesthetic Keywords</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword (e.g. Brutalist, Noir, Architectural) and press Enter"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newKeyword.trim()) {
                    e.preventDefault();
                    const current = brandCore.visualDirection?.aestheticKeywords || [];
                    saveBrandCore({
                      visualDirection: {
                        ...(brandCore.visualDirection || { aestheticKeywords: [], moodSummary: '', imageryGuidelines: '', dos: [], donts: [] }),
                        aestheticKeywords: [...current, newKeyword.trim()],
                      },
                    });
                    setNewKeyword('');
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {(brandCore.visualDirection?.aestheticKeywords || []).map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs border border-zinc-700"
                >
                  {kw}
                  <button
                    onClick={() => {
                      const updated = (brandCore.visualDirection?.aestheticKeywords || []).filter((_, idx) => idx !== i);
                      saveBrandCore({
                        visualDirection: {
                          ...(brandCore.visualDirection || { aestheticKeywords: [], moodSummary: '', imageryGuidelines: '', dos: [], donts: [] }),
                          aestheticKeywords: updated,
                        },
                      });
                    }}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Mood & Imagery Guidelines</label>
            <textarea
              rows={3}
              value={brandCore.visualDirection?.imageryGuidelines || ''}
              onChange={(e) =>
                saveBrandCore({
                  visualDirection: {
                    ...(brandCore.visualDirection || { aestheticKeywords: [], moodSummary: '', imageryGuidelines: '', dos: [], donts: [] }),
                    imageryGuidelines: e.target.value,
                  },
                })
              }
              placeholder="High contrast photography, monolithic shapes, strict grid discipline..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      )}

      {/* SECTION 5: VOICE & TONE */}
      {subSection === 'voice' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-red-500" />
            Voice, Tone & Copywriting Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Do Say */}
            <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 space-y-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Do Say (Approved Copywriting Hooks)
              </span>
              <div className="space-y-2">
                {(brandCore.voiceAndTone?.doSay || []).map((say, idx) => (
                  <div key={idx} className="text-xs text-zinc-300 p-2 rounded-lg bg-zinc-950/60 border border-emerald-500/20">
                    "{say}"
                  </div>
                ))}
              </div>
            </div>

            {/* Don't Say */}
            <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-500/20 space-y-3">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Don't Say (Banned Clichés & Jargon)
              </span>
              <div className="space-y-2">
                {(brandCore.voiceAndTone?.dontSay || []).map((dont, idx) => (
                  <div key={idx} className="text-xs text-zinc-300 p-2 rounded-lg bg-zinc-950/60 border border-rose-500/20">
                    "{dont}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: TARGET AUDIENCE ICP */}
      {subSection === 'audience' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-red-500" />
            Target Audience Ideal Customer Profile (ICP)
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Primary ICP</label>
            <input
              type="text"
              value={brandCore.targetAudience?.primaryIcp || ''}
              onChange={(e) =>
                saveBrandCore({
                  targetAudience: {
                    ...(brandCore.targetAudience || { primaryIcp: '', targetSegments: [], painPoints: [], coreDesires: [] }),
                    primaryIcp: e.target.value,
                  },
                })
              }
              placeholder="e.g. High-growth technical founders, enterprise CTOs, boutique agencies"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Core Customer Pain Points</label>
              <textarea
                rows={4}
                value={(brandCore.targetAudience?.painPoints || []).join('\n')}
                onChange={(e) =>
                  saveBrandCore({
                    targetAudience: {
                      ...(brandCore.targetAudience || { primaryIcp: '', targetSegments: [], painPoints: [], coreDesires: [] }),
                      painPoints: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="One pain point per line..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Customer Desires & Transformation</label>
              <textarea
                rows={4}
                value={(brandCore.targetAudience?.coreDesires || []).join('\n')}
                onChange={(e) =>
                  saveBrandCore({
                    targetAudience: {
                      ...(brandCore.targetAudience || { primaryIcp: '', targetSegments: [], painPoints: [], coreDesires: [] }),
                      coreDesires: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="One core desire per line..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: POSITIONING & USPS */}
      {subSection === 'positioning' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            Market Positioning & Competitive Differentiators
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Market Positioning Statement</label>
            <textarea
              rows={3}
              value={brandCore.positioning?.positioningStatement || ''}
              onChange={(e) =>
                saveBrandCore({
                  positioning: {
                    ...(brandCore.positioning || { marketCategory: '', valueProposition: '', uniqueSellingPoints: [], competitorDifferentiators: [], positioningStatement: '' }),
                    positioningStatement: e.target.value,
                  },
                })
              }
              placeholder="For [target audience] who [pain point], [brand name] is the [category] that [core benefit] unlike [competitors] because [USPs]..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Unique Value Proposition</label>
            <input
              type="text"
              value={brandCore.positioning?.valueProposition || ''}
              onChange={(e) =>
                saveBrandCore({
                  positioning: {
                    ...(brandCore.positioning || { marketCategory: '', valueProposition: '', uniqueSellingPoints: [], competitorDifferentiators: [], positioningStatement: '' }),
                    valueProposition: e.target.value,
                  },
                })
              }
              placeholder="e.g. Unify your entire creative and brand operation into a single sovereign cockpit."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
