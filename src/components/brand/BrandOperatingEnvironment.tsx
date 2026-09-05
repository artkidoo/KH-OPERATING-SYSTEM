import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  Briefcase,
  Sparkles,
  Brain,
  Layers,
  ArrowRight,
  Plus,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Clock,
  Send,
  Users,
  Check,
  Target,
  Rocket,
  ShieldCheck,
  Package,
  FileCheck,
  CreditCard,
  FolderKanban,
  Edit3
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { useCreativeBrain } from '../../context/CreativeBrainContext';
import { CampaignBuilder } from './CampaignBuilder';
import { ProductServiceSystem } from './ProductServiceSystem';
import { BusinessDocumentsStudio } from './BusinessDocumentsStudio';
import { BrandCoreEditor } from './BrandCoreEditor';
import { TaskItem, AttentionItem, Campaign, ContentItem } from '../../types';

export type BrandEnvTab = 'overview' | 'growth' | 'operations' | 'content' | 'brand_dna';

interface BrandOperatingEnvironmentProps {
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateTab?: (tab: string) => void;
}

export const BrandOperatingEnvironment: React.FC<BrandOperatingEnvironmentProps> = ({
  onNotify = (_msg: string, _type?: 'success' | 'info' | 'error') => {},
  onNavigateTab,
}) => {
  const {
    workspace,
    brandCore,
    activeCampaign,
    campaigns,
    products,
    contentItems,
    tasks,
    projects,
    attentionItems,
    calculateCampaignReadiness,
    updateCreativeMemory,
    loadBrandDNA,
    saveBrandDNA,
  } = useWorkspace();

  const { openBrainWithContext } = useCreativeBrain();

  // Primary 5-Tab Navigation
  const [activeTab, setActiveTab] = useState<BrandEnvTab>('overview');

  // Growth View Sub-sections: 'campaigns' | 'offers' | 'initiatives'
  const [growthSubSection, setGrowthSubSection] = useState<'campaigns' | 'offers' | 'strategy'>('campaigns');

  // Operations View Sub-sections: 'catalog' | 'documents' | 'invoices' | 'projects'
  const [operationsSubSection, setOperationsSubSection] = useState<'catalog' | 'documents' | 'invoices' | 'projects'>('catalog');

  // Real data helpers
  const currentObjective = workspace?.primaryGoal || brandCore?.valueProposition || 'Accelerate enterprise client acquisition and scale predictable recurring revenue.';
  
  const activeProjectsList = useMemo(() => {
    return projects.filter((p) => p.status === 'active').slice(0, 5);
  }, [projects]);

  const pendingTasksList = useMemo(() => {
    return tasks.filter((t) => !t.completed).slice(0, 6);
  }, [tasks]);

  const realAttentionItems = useMemo(() => {
    return attentionItems.slice(0, 4);
  }, [attentionItems]);

  const campaignReadiness = useMemo(() => {
    return calculateCampaignReadiness(activeCampaign);
  }, [calculateCampaignReadiness, activeCampaign]);

  // Brand DNA State (persisted to brand_dna database table)
  const [brandDNA, setBrandDNA] = useState({
    identity: brandCore?.brandName || workspace?.name || '',
    positioning: brandCore?.positioningStatement || workspace?.positioning || '',
    businessCategory: brandCore?.industry || workspace?.genreOrNiche || '',
    audience: brandCore?.targetAudience || workspace?.targetAudience || '',
    valueProposition: brandCore?.valueProposition || '',
    offers: [],
    voice: '',
    visualIdentity: '',
    competitivePositioning: '',
    contentPillars: [],
    growthGoals: [],
    businessModel: '',
    marketingPriorities: [],
    platforms: [],
    preferences: '',
    thingsToAvoid: [],
  });

  const [isDNASaving, setIsDNASaving] = useState(false);
  const [dnaLoaded, setDnaLoaded] = useState(false);

  // Load Brand DNA from database on mount
  useEffect(() => {
    const loadDNA = async () => {
      try {
        const dna = await loadBrandDNA();
        if (dna) {
          setBrandDNA({
            identity: dna.identity || brandCore?.brandName || workspace?.name || '',
            positioning: dna.positioning || brandCore?.positioningStatement || workspace?.positioning || '',
            businessCategory: dna.businessCategory || brandCore?.industry || workspace?.genreOrNiche || '',
            audience: dna.audience || brandCore?.targetAudience || workspace?.targetAudience || '',
            valueProposition: dna.valueProposition || brandCore?.valueProposition || '',
            offers: dna.offers || [],
            voice: dna.voice || '',
            visualIdentity: dna.visualIdentity || '',
            competitivePositioning: dna.competitivePositioning || '',
            contentPillars: dna.contentPillars || [],
            growthGoals: dna.growthGoals || [],
            businessModel: dna.businessModel || '',
            marketingPriorities: dna.marketingPriorities || [],
            platforms: dna.platforms || [],
            preferences: dna.preferences || '',
            thingsToAvoid: dna.thingsToAvoid || [],
          });
        }
      } catch {
        // DNA not yet created, use empty state
      } finally {
        setDnaLoaded(true);
      }
    };
    loadDNA();
  }, [workspace?.id]);

  const handleSaveBrandDNA = async () => {
    setIsDNASaving(true);
    try {
      await saveBrandDNA({
        identity: brandDNA.identity,
        positioning: brandDNA.positioning,
        businessCategory: brandDNA.businessCategory,
        audience: brandDNA.audience,
        valueProposition: brandDNA.valueProposition,
        offers: brandDNA.offers,
        voice: brandDNA.voice,
        visualIdentity: brandDNA.visualIdentity,
        competitivePositioning: brandDNA.competitivePositioning,
        contentPillars: brandDNA.contentPillars,
        growthGoals: brandDNA.growthGoals,
        businessModel: brandDNA.businessModel,
        marketingPriorities: brandDNA.marketingPriorities,
        platforms: brandDNA.platforms,
        preferences: brandDNA.preferences,
        thingsToAvoid: brandDNA.thingsToAvoid,
      });
      onNotify('Brand DNA context saved. Creative Brain synchronized!', 'success');
    } catch {
      onNotify('Failed to save Brand DNA', 'error');
    } finally {
      setIsDNASaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fadeIn">
      {/* Primary OS Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-950/80 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Brand Operating Environment</span>
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs font-mono text-zinc-400">{brandDNA.identity}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {activeTab === 'overview' && 'Brand Overview'}
              {activeTab === 'growth' && 'Growth & Launch Engine'}
              {activeTab === 'operations' && 'Business Operations'}
              {activeTab === 'content' && 'Brand Content Hub'}
              {activeTab === 'brand_dna' && 'Brand DNA Context Layer'}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {activeTab === 'overview' && 'Real operational objectives, next actions, active projects, and business items requiring attention.'}
              {activeTab === 'growth' && 'Campaigns, core offers, audience strategy, and contextual launch planning in one place.'}
              {activeTab === 'operations' && 'Products & services, proposals, quotations, contracts, invoices, and operational tasks.'}
              {activeTab === 'content' && 'Strategic brand storytelling systems, thought leadership pillars, and scheduled releases.'}
              {activeTab === 'brand_dna' && 'The central memory layer feeding Creative Brain for strategy, marketing, copy, and documents.'}
            </p>
          </div>

          {/* Quick Brain Intelligence Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openBrainWithContext(`Brand Operating Environment (${activeTab})`)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Next Strategic Action</span>
            </button>
          </div>
        </div>

        {/* Primary 5-Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('growth')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'growth'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>2. Growth</span>
            {campaigns.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/40 text-white font-mono">
                {campaigns.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('operations')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'operations'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>3. Operations</span>
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'content'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>4. Content</span>
          </button>

          <button
            onClick={() => setActiveTab('brand_dna')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'brand_dna'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>5. Brand DNA</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BRAND OVERVIEW (Real Data, Actionable, No Fake Stats) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Objective Banner */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">
                Current Operational Objective
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                {currentObjective}
              </h2>
            </div>

            {/* Real Operational Signals */}
            <div className="mt-6 pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] text-zinc-500 font-semibold">Active Projects</span>
                <p className="text-xl font-black text-white mt-0.5">{activeProjectsList.length}</p>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 font-semibold">Open Tasks</span>
                <p className="text-xl font-black text-white mt-0.5">{pendingTasksList.length}</p>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 font-semibold">Live Offerings</span>
                <p className="text-xl font-black text-white mt-0.5">{products.length || brandDNA.offers.length}</p>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 font-semibold">Campaign Readiness</span>
                <p className="text-xl font-black text-blue-400 mt-0.5">{campaignReadiness.score}%</p>
              </div>
            </div>
          </div>

          {/* 3-Column Real Operational Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Next Action & Open Tasks */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Next Action & Work</h3>
                </div>
                <span className="text-xs font-mono text-zinc-500">{pendingTasksList.length} open</span>
              </div>

              {pendingTasksList.length > 0 ? (
                <div className="space-y-2.5">
                  {pendingTasksList.map((t) => (
                    <div key={t.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200">{t.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {t.priority}
                        </span>
                      </div>
                      {t.dueDate && (
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                  ✓ All operational items up to date.
                </div>
              )}
            </div>

            {/* 2. Active Projects & Pending Approvals */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Active Projects</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('operations');
                    setOperationsSubSection('projects');
                  }}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {activeProjectsList.length > 0 ? (
                <div className="space-y-2.5">
                  {activeProjectsList.map((p) => (
                    <div key={p.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200">{p.name}</span>
                        <span className="text-[10px] font-bold text-emerald-400">Active</span>
                      </div>
                      {p.description && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{p.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                  No active client projects initialized.
                </div>
              )}
            </div>

            {/* 3. Items Requiring Attention */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Attention Required</h3>
                </div>
                <span className="text-xs font-mono text-zinc-500">{realAttentionItems.length} items</span>
              </div>

              {realAttentionItems.length > 0 ? (
                <div className="space-y-2.5">
                  {realAttentionItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-2xl bg-amber-950/10 border border-amber-500/20 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed pl-5">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                  ✓ Zero operational blockers detected.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GROWTH (Campaigns, Offers, Launch Planning, Audience Strategy) */}
      {/* ========================================================================= */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          {/* Sub-section Navigation */}
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGrowthSubSection('campaigns')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  growthSubSection === 'campaigns'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Campaigns & Launch
              </button>

              <button
                onClick={() => setGrowthSubSection('offers')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  growthSubSection === 'offers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Core Offers & Funnels
              </button>

              <button
                onClick={() => setGrowthSubSection('strategy')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  growthSubSection === 'strategy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Audience Strategy
              </button>
            </div>

            {/* Contextual Readiness Pill (embedded, not a separate dashboard) */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-zinc-400">Campaign Readiness:</span>
              <span className={`px-2.5 py-0.5 rounded-full border ${campaignReadiness.stageColor}`}>
                {campaignReadiness.score}% ({campaignReadiness.stage})
              </span>
            </div>
          </div>

          {/* Sub-section Contents */}
          {growthSubSection === 'campaigns' && (
            <CampaignBuilder onNotify={onNotify} />
          )}

          {growthSubSection === 'offers' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span>Core Commercial Offers</span>
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab('operations');
                      setOperationsSubSection('catalog');
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Manage Full Catalog →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brandDNA.offers.map((offer) => (
                    <div key={offer.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{offer.name}</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">{offer.price}</span>
                      </div>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {offer.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {growthSubSection === 'strategy' && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Audience Strategy & Positioning Grounding</span>
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Brand growth initiatives are anchored directly in your target demographic definition and buyer personas.
              </p>
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-zinc-300">Audience Persona Profile:</span>
                <p className="text-zinc-400 leading-relaxed font-sans">{brandDNA.audience}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OPERATIONS (Products/Services, Proposals, Contracts, Invoices, Approvals) */}
      {/* ========================================================================= */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          {/* Operations Sub-Navigation */}
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOperationsSubSection('catalog')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  operationsSubSection === 'catalog'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Products & Services</span>
              </button>

              <button
                onClick={() => setOperationsSubSection('documents')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  operationsSubSection === 'documents'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Proposals & Contracts</span>
              </button>

              <button
                onClick={() => setOperationsSubSection('invoices')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  operationsSubSection === 'invoices'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Invoices & Billing</span>
              </button>

              <button
                onClick={() => setOperationsSubSection('projects')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  operationsSubSection === 'projects'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Client Projects</span>
              </button>
            </div>
          </div>

          {/* Sub-section Components */}
          {operationsSubSection === 'catalog' && (
            <ProductServiceSystem onNotify={onNotify} />
          )}

          {operationsSubSection === 'documents' && (
            <BusinessDocumentsStudio onNotify={onNotify} />
          )}

          {operationsSubSection === 'invoices' && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Invoices & Accounts Receivable</h3>
                  <p className="text-xs text-zinc-400">Track and issue standardized commercial invoices.</p>
                </div>
                <button
                  onClick={() => onNotify('Invoicing modal active', 'info')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                >
                  Create Invoice
                </button>
              </div>

              <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2">
                <CreditCard className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">All client billing is kept in sync with verified Products & Services.</p>
              </div>
            </div>
          )}

          {operationsSubSection === 'projects' && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Client Projects & Deliveries</h3>
                  <p className="text-xs text-zinc-400">Active operational workflows tied to client proposals.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProjectsList.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      <span className="text-xs text-emerald-400 font-bold">Active</span>
                    </div>
                    {p.description && <p className="text-xs text-zinc-400">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTENT (Brand Content Hub) */}
      {/* ========================================================================= */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-zinc-800 bg-gradient-to-r from-blue-950/20 via-zinc-900 to-black space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Brand Content Hub
            </span>
            <h3 className="text-xl font-black text-white">
              Narrative & Thought Leadership Systems
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Grounded in your Brand DNA content pillars. Engineered to generate high-trust authority before, during, and after service launches.
            </p>
          </div>

          {brandDNA.contentPillars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brandDNA.contentPillars.map((pillar, idx) => (
                <div key={idx} className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Pillar {idx + 1}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{pillar}</h4>
                  <p className="text-xs text-zinc-400">
                    Automated prompts for LinkedIn carousels, founder letters, and case study breakdowns.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-zinc-500" />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">No Content Pillars Yet</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Define your content pillars in the Brand DNA section to guide your content strategy.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. BRAND DNA (Core Context Layer for Creative Brain) */}
      {/* ========================================================================= */}
      {activeTab === 'brand_dna' && (
        <div className="space-y-6">
          {/* Intelligence Notice */}
          <div className="p-5 rounded-3xl border border-blue-500/30 bg-blue-950/20 flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Brand DNA Context Layer
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The Creative Brain automatically references your Brand DNA when generating strategy, marketing copy, proposals, contracts, client correspondence, and content.
              </p>
            </div>
          </div>

          {/* DNA Editing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identity & Positioning */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Identity, Positioning & Category</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-semibold">Brand Identity / Enterprise Name</label>
                  <input
                    type="text"
                    value={brandDNA.identity}
                    onChange={(e) => setBrandDNA({ ...brandDNA, identity: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Business Category & Industry</label>
                  <input
                    type="text"
                    value={brandDNA.businessCategory}
                    onChange={(e) => setBrandDNA({ ...brandDNA, businessCategory: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Value Proposition</label>
                  <textarea
                    rows={2}
                    value={brandDNA.valueProposition}
                    onChange={(e) => setBrandDNA({ ...brandDNA, valueProposition: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Competitive Positioning Statement</label>
                  <textarea
                    rows={3}
                    value={brandDNA.positioning}
                    onChange={(e) => setBrandDNA({ ...brandDNA, positioning: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Audience, Voice & Visual Direction */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Audience, Voice & Visual Guidelines</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-semibold">Target Audience & Buyer Persona</label>
                  <textarea
                    rows={2}
                    value={brandDNA.audience}
                    onChange={(e) => setBrandDNA({ ...brandDNA, audience: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Voice & Tone Directives</label>
                  <input
                    type="text"
                    value={brandDNA.voice}
                    onChange={(e) => setBrandDNA({ ...brandDNA, voice: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Visual Identity Directives</label>
                  <textarea
                    rows={2}
                    value={brandDNA.visualIdentity}
                    onChange={(e) => setBrandDNA({ ...brandDNA, visualIdentity: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Business Model</label>
                  <input
                    type="text"
                    value={brandDNA.businessModel}
                    onChange={(e) => setBrandDNA({ ...brandDNA, businessModel: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleSaveBrandDNA}
              disabled={isDNASaving}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-950/50 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isDNASaving ? 'Saving Context...' : 'Save & Sync Brand DNA'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
