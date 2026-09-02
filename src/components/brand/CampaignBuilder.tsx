import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Campaign, CampaignObjective, ProductService, ContentItem } from '../../types';
import { 
  Rocket, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Layers, 
  DollarSign, 
  Zap, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Sliders, 
  Check, 
  ShieldCheck, 
  Eye, 
  Share2, 
  TrendingUp, 
  MessageSquare, 
  Image as ImageIcon,
  Edit3,
  FileText,
  Compass,
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CampaignBuilderProps {
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateTab?: (tab: string) => void;
}

export const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ onNotify, onNavigateTab }) => {
  const { 
    campaigns, 
    activeCampaign, 
    activeCampaignId, 
    setActiveCampaignId, 
    createCampaign, 
    updateCampaign, 
    saveActiveCampaign, 
    deleteCampaign,
    calculateCampaignReadiness, 
    products, 
    brandCore, 
    contentItems, 
    createContentItem,
    assets,
    workspace
  } = useWorkspace();

  // Campaign Readiness Calculation
  const readiness = calculateCampaignReadiness(activeCampaign);

  // Builder sub-tabs
  type BuilderSubTab = 'overview' | 'strategy' | 'creative' | 'content' | 'sprint' | 'approvals' | 'results';
  const [subTab, setSubTab] = useState<BuilderSubTab>('overview');

  // AI Generation state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedProductIdForAI, setSelectedProductIdForAI] = useState<string>(activeCampaign?.productId || '');

  // New campaign modal
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignObjective, setNewCampaignObjective] = useState<CampaignObjective>('product_launch');
  const [newCampaignBudget, setNewCampaignBudget] = useState<number>(2500);

  // Content quick-draft state
  const [quickPostPlatform, setQuickPostPlatform] = useState<'instagram' | 'tiktok' | 'linkedin' | 'twitter'>('linkedin');
  const [quickPostConcept, setQuickPostConcept] = useState('');
  const [quickPostHook, setQuickPostHook] = useState('');

  // Sync active campaign's product selection with state
  useEffect(() => {
    if (activeCampaign?.productId) {
      setSelectedProductIdForAI(activeCampaign.productId);
    }
  }, [activeCampaign?.productId]);

  const handleCreateNewCampaign = async () => {
    if (!newCampaignTitle.trim()) {
      onNotify('Campaign title is required', 'error');
      return;
    }

    try {
      const created = await createCampaign({
        title: newCampaignTitle,
        goal: `Execute high-impact ${newCampaignObjective.replace('_', ' ')} campaign`,
        objective: newCampaignObjective,
        budget: newCampaignBudget,
        currency: 'USD',
        status: 'planning',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        platforms: ['LinkedIn', 'Twitter/X', 'Instagram'],
        productId: products[0]?.id || undefined,
        productName: products[0]?.name || undefined,
        creativeDirection: {
          themeName: 'Architectural Precision & Growth',
          visualStyle: 'High-contrast minimalist dark canvas with bold crimson accents',
          coreMessage: 'Scale your operation on an institutional foundation',
          heroHeadline: 'Command Your Sovereign Infrastructure',
          subHeadline: 'Replace fragmented tools with a single unified operating engine.',
          keyHashtags: ['#SovereignStack', '#EnterpriseGrowth', '#BuiltForScale'],
        },
        sprintDays: [
          { day: 'Day 1 - 3', task: 'Finalize brand positioning and campaign creative hero assets', completed: false },
          { day: 'Day 4 - 7', task: 'Pre-launch teaser campaign and waitlist acquisition kickoff', completed: false },
          { day: 'Day 8 - 14', task: 'Full multi-channel launch across social, PR wire, and direct outreach', completed: false },
          { day: 'Day 15 - 30', task: 'Post-launch conversion blitz, customer case studies, and scale sprint', completed: false },
        ],
        approvals: {
          creativeApproved: false,
          budgetApproved: false,
          launchApproved: false,
        },
        goals: {
          targetImpressions: 100000,
          targetLeadsOrSales: 150,
          targetRevenue: 5000,
          actualImpressions: 0,
          actualLeadsOrSales: 0,
          actualRevenue: 0,
        },
      });

      setIsCreatingNew(false);
      setNewCampaignTitle('');
      onNotify(`Master Campaign "${created.title}" initialized!`, 'success');
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err: any) {
      onNotify(err.message || 'Failed to create campaign', 'error');
    }
  };

  const handleGenerateAICampaign = async () => {
    if (!activeCampaign) {
      onNotify('Select or create a campaign first', 'info');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const selectedProduct = products.find((p) => p.id === selectedProductIdForAI);
      const res = await fetch('/api/ai/campaign-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandCore?.brandName || workspace?.name || 'Vanguard Brand',
          industry: brandCore?.industry || 'Enterprise Technology & Creative Business',
          brandVoice: brandCore?.voiceAndTone?.traits?.join(', ') || 'Bold, Precision-engineered, High-trust',
          objective: activeCampaign.objective || 'product_launch',
          productName: selectedProduct?.name || 'Flagship Offering',
          productDetails: selectedProduct?.description || 'Enterprise platform and services',
          customPrompt: aiPrompt,
        }),
      });

      const json = await res.json();
      if (json && json.data) {
        const plan = json.data;
        await saveActiveCampaign({
          goal: plan.campaignHeadline || activeCampaign.goal,
          creativeDirection: {
            themeName: plan.creativeTheme || activeCampaign.creativeDirection?.themeName || 'Modern Growth',
            visualStyle: plan.visualStyle || activeCampaign.creativeDirection?.visualStyle || 'Minimalist Noir',
            coreMessage: plan.coreMessage || activeCampaign.creativeDirection?.coreMessage || '',
            heroHeadline: plan.heroHeadline || activeCampaign.creativeDirection?.heroHeadline || '',
            subHeadline: plan.subHeadline || activeCampaign.creativeDirection?.subHeadline || '',
            keyHashtags: plan.keyHashtags || ['#Launch', '#Growth', '#Scale'],
          },
          sprintDays: (plan.sprintTimeline || []).map((s: any) => ({
            day: s.day,
            task: s.task,
            completed: false,
          })),
        });

        // Also generate initial content items if returned
        if (plan.contentHooks && plan.contentHooks.length > 0) {
          for (const hook of plan.contentHooks.slice(0, 3)) {
            await createContentItem({
              campaignId: activeCampaign.id,
              title: `${activeCampaign.title} - Hook`,
              platform: 'linkedin',
              contentType: 'Story Post',
              concept: hook,
              captionHook: hook,
              status: 'ready',
              priority: 'HIGH',
            });
          }
        }

        onNotify('AI Campaign Plan & Content generated successfully!', 'success');
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.55 } });
        } catch (e) {}
      }
    } catch (err: any) {
      onNotify('Generated automated campaign strategy!', 'info');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleToggleSprintTask = async (index: number) => {
    if (!activeCampaign) return;
    const updatedSprints = [...(activeCampaign.sprintDays || [])];
    if (updatedSprints[index]) {
      updatedSprints[index].completed = !updatedSprints[index].completed;
      await saveActiveCampaign({ sprintDays: updatedSprints });
    }
  };

  const handleApprovalToggle = async (type: 'creative' | 'budget' | 'launch') => {
    if (!activeCampaign) return;
    const current = activeCampaign.approvals || { creativeApproved: false, budgetApproved: false, launchApproved: false };
    const updated = { ...current };

    if (type === 'creative') {
      updated.creativeApproved = !updated.creativeApproved;
      updated.creativeApprovedBy = updated.creativeApproved ? (workspace?.name || 'Workspace Owner') : undefined;
    } else if (type === 'budget') {
      updated.budgetApproved = !updated.budgetApproved;
      updated.budgetApprovedBy = updated.budgetApproved ? (workspace?.name || 'Finance Lead') : undefined;
    } else if (type === 'launch') {
      updated.launchApproved = !updated.launchApproved;
      updated.launchApprovedBy = updated.launchApproved ? (workspace?.name || 'Executive Sponsor') : undefined;
      if (updated.launchApproved) {
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
    }

    await saveActiveCampaign({
      approvals: updated,
      status: updated.launchApproved ? 'active' : activeCampaign.status,
    });
    onNotify(`Approval status updated!`, 'success');
  };

  const handleCreateQuickPost = async () => {
    if (!activeCampaign) return;
    if (!quickPostHook.trim()) {
      onNotify('Please enter a caption hook or post concept', 'error');
      return;
    }

    try {
      await createContentItem({
        campaignId: activeCampaign.id,
        title: `${activeCampaign.title} - ${quickPostPlatform.toUpperCase()}`,
        platform: quickPostPlatform,
        contentType: quickPostPlatform === 'linkedin' ? 'Article / Post' : 'Video / Reel',
        concept: quickPostConcept || quickPostHook,
        captionHook: quickPostHook,
        status: 'drafted',
        priority: 'HIGH',
      });

      setQuickPostConcept('');
      setQuickPostHook('');
      onNotify(`Added post to Campaign Content Pipeline!`, 'success');
    } catch (err: any) {
      onNotify('Failed to create content item', 'error');
    }
  };

  const handleDeleteCampaign = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete campaign "${title}"?`)) {
      try {
        await deleteCampaign(id);
        onNotify(`Campaign "${title}" deleted`, 'info');
      } catch (err: any) {
        onNotify('Failed to delete campaign', 'error');
      }
    }
  };

  const campaignContent = contentItems.filter((c) => c.campaignId === activeCampaign?.id);

  if (campaigns.length === 0 && !isCreatingNew) {
    return (
      <div className="text-center py-20 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-8 max-w-2xl mx-auto space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
          <Rocket className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Initialize Your First Master Campaign</h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
            In Keedohub, the Campaign is the central operational object connecting your products, creative direction, hero assets, content engine, and sprint deadlines.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create Master Campaign
        </button>
      </div>
    );
  }

  return (
    <div id="campaign-builder-station" className="space-y-6">
      {/* Top Campaign Bar: Selector + Status + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
              <Rocket className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
                Active Master Campaign
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={activeCampaignId || ''}
                  onChange={(e) => setActiveCampaignId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1 text-base font-bold text-zinc-100 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({(c.status || "draft").toUpperCase()})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="New Campaign"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Pillar Readiness Badge Bar */}
        {activeCampaign && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="text-xs text-zinc-400">Readiness Score:</div>
              <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <span className="text-red-400">{readiness?.score ?? 0}%</span>
                <div className="w-16 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500" 
                    style={{ width: `${readiness?.score ?? 0}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${readiness?.stageColor || 'text-zinc-400 bg-zinc-800'}`}>
              Stage: {readiness?.stage || 'Planning'}
            </div>

            <div className="text-xs text-zinc-400 font-medium px-2.5 py-1 rounded-lg bg-zinc-800/80">
              {readiness?.formattedDays || 'No schedule'}
            </div>

            <button
              onClick={() => handleDeleteCampaign(activeCampaign.id, activeCampaign.title)}
              className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              title="Delete this campaign"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {activeCampaign && (
        <>
          {/* Sub-navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto pb-1">
            {[
              { id: 'overview', label: '7-Pillar Readiness', icon: ShieldCheck },
              { id: 'strategy', label: 'Objective & Product', icon: Target },
              { id: 'creative', label: 'Creative Direction & Hook', icon: Sparkles },
              { id: 'content', label: 'Content Pipeline', icon: MessageSquare },
              { id: 'sprint', label: 'Sprint Roadmap', icon: Calendar },
              { id: 'approvals', label: 'Executive Approvals', icon: Award },
              { id: 'results', label: 'KPIs & Goals', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as BuilderSubTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all cursor-pointer border-b-2 ${
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

          {/* TAB 1: 7-PILLAR READINESS ENGINE */}
          {subTab === 'overview' && (
            <div className="space-y-6">
              {/* Readiness Score Breakdown Hero */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        <span>7-Pillar Campaign Readiness Engine</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-zinc-800 text-zinc-300">
                          {readiness?.completedCount ?? 0} of {readiness?.totalCount ?? 7} Pillars Active
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        Rigorous operational certification ensuring every campaign is fully equipped before public launch.
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-red-500">{readiness?.score ?? 0}%</span>
                      <span className="block text-[11px] text-zinc-500 uppercase tracking-wider">Score</span>
                    </div>
                  </div>

                  {/* Requirements List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {(readiness?.requirements || []).map((req) => (
                      <div
                        key={req.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                          req.completed
                            ? 'bg-emerald-950/10 border-emerald-500/30'
                            : 'bg-zinc-950/60 border-zinc-800/80'
                        }`}
                      >
                        <span className={`p-1.5 rounded-lg mt-0.5 ${req.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                          {req.completed ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-200 truncate">{req.label}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                              {req.weight} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{req.description}</p>
                          <div className="text-[11px] text-zinc-500 font-medium mt-1">
                            Status: <span className={req.completed ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>{req.detail}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Items & Critical Action Card */}
                <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      Action Checklist & Blockers
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Resolve missing elements to certify launch authorization.
                    </p>

                    <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {readiness.missingItems.length === 0 ? (
                        <div className="text-center py-6 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                          <div className="text-xs font-bold text-emerald-300">All 7 Pillars Certified!</div>
                          <p className="text-[11px] text-zinc-400 mt-1">Campaign is ready for launch execution.</p>
                        </div>
                      ) : (
                        readiness.missingItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-zinc-950/80 border border-amber-500/20 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="text-xs font-semibold text-zinc-200">{item.label}</div>
                              <div className="text-[11px] text-zinc-500">{item.reason}</div>
                            </div>
                            <button
                              onClick={() => {
                                if (item.id === 'req_objective' || item.id === 'req_creative_dir') setSubTab('creative');
                                else if (item.id === 'req_product') setSubTab('strategy');
                                else if (item.id === 'req_content_pipeline') setSubTab('content');
                                else if (item.id === 'req_sprint_timeline') setSubTab('sprint');
                                else if (item.id === 'req_approvals') setSubTab('approvals');
                                else if (onNavigateTab) onNavigateTab(item.actionTab);
                              }}
                              className="text-[11px] font-bold px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-red-400 transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Resolve →
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AI Strategist Quick Trigger */}
                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Campaign Strategist
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Auto-generate hooks, creative themes, and sprint deliverables with 1 click.
                    </p>
                    <button
                      onClick={() => setSubTab('creative')}
                      className="w-full mt-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Open AI Strategist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OBJECTIVE & PRODUCT LINKER */}
          {subTab === 'strategy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Objective & Audience */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    Campaign Objective & Target Persona
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Campaign Title</label>
                      <input
                        type="text"
                        value={activeCampaign.title}
                        onChange={(e) => saveActiveCampaign({ title: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Objective Type</label>
                      <select
                        value={activeCampaign.objective || 'product_launch'}
                        onChange={(e) => saveActiveCampaign({ objective: e.target.value as any })}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="product_launch">Product Launch (Flagship Go-to-Market)</option>
                        <option value="lead_generation">High-Ticket Lead Generation</option>
                        <option value="brand_awareness">Brand Authority & Awareness</option>
                        <option value="rebrand">Brand Relaunch / Rebrand</option>
                        <option value="seasonal_promo">Seasonal & Limited Sprint Promo</option>
                        <option value="growth_sprint">Growth Sprint / Viral Acquisition</option>
                        <option value="event_announcement">Event or Keynote Announcement</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Target Audience Description</label>
                      <textarea
                        rows={3}
                        value={activeCampaign.targetAudience || ''}
                        onChange={(e) => saveActiveCampaign({ targetAudience: e.target.value })}
                        placeholder="Define the primary ICP, demographics, pain points, and buyer intent for this campaign..."
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Product / Service Linker */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-red-500" />
                      Linked Flagship Offering
                    </h3>
                    <span className="text-xs text-zinc-400">
                      {products.length} in Catalog
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Attach a specific product or service from your catalog to align messaging, features, and revenue goals.
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Select Offering</label>
                      <select
                        value={activeCampaign.productId || ''}
                        onChange={(e) => {
                          const prod = products.find((p) => p.id === e.target.value);
                          saveActiveCampaign({
                            productId: e.target.value || undefined,
                            productName: prod?.name || undefined,
                          });
                        }}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="">-- No Product Attached --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.pricing?.amount} {p.pricing?.currency}) - {p.type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {activeCampaign.productId && (
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                        {(() => {
                          const prod = products.find((p) => p.id === activeCampaign.productId);
                          if (!prod) return null;
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-zinc-100">{prod.name}</span>
                                <span className="text-xs font-bold text-emerald-400">
                                  ${prod.pricing?.amount} {prod.pricing?.currency}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400">{prod.tagline || prod.description}</p>
                              {prod.uniqueSellingPoints && prod.uniqueSellingPoints.length > 0 && (
                                <div className="pt-1 flex flex-wrap gap-1">
                                  {prod.uniqueSellingPoints.map((usp, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                                      {usp}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CREATIVE DIRECTION & AI STRATEGIST */}
          {subTab === 'creative' && (
            <div className="space-y-6">
              {/* AI Campaign Strategist Prompt Card */}
              <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-red-500/20 text-red-400">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">AI Campaign Creative Brain</h3>
                      <p className="text-xs text-zinc-400">Synthesizes Brand Core, product USPs, and objective into high-impact creative themes.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAICampaign}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {isGeneratingAI ? 'Synthesizing...' : 'Generate Creative Blueprint'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Custom direction prompt (e.g. Focus on speed, enterprise security, and disruptive luxury)..."
                    className="w-full bg-zinc-950/80 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                  <select
                    value={selectedProductIdForAI}
                    onChange={(e) => setSelectedProductIdForAI(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="">Align with general Brand Core</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        Focus on product: {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Creative Direction Form Fields */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  Codified Campaign Direction & Aesthetic Hook
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Creative Theme Name</label>
                    <input
                      type="text"
                      value={activeCampaign.creativeDirection?.themeName || ''}
                      onChange={(e) =>
                        saveActiveCampaign({
                          creativeDirection: {
                            ...(activeCampaign.creativeDirection || {
                              themeName: '',
                              visualStyle: '',
                              coreMessage: '',
                              heroHeadline: '',
                              subHeadline: '',
                              keyHashtags: [],
                            }),
                            themeName: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Architectural Sovereign Momentum"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Visual Aesthetic Style</label>
                    <input
                      type="text"
                      value={activeCampaign.creativeDirection?.visualStyle || ''}
                      onChange={(e) =>
                        saveActiveCampaign({
                          creativeDirection: {
                            ...(activeCampaign.creativeDirection || {
                              themeName: '',
                              visualStyle: '',
                              coreMessage: '',
                              heroHeadline: '',
                              subHeadline: '',
                              keyHashtags: [],
                            }),
                            visualStyle: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Minimalist Noir, High-contrast crimson glow, Monospace typography"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Hero Display Headline</label>
                    <input
                      type="text"
                      value={activeCampaign.creativeDirection?.heroHeadline || ''}
                      onChange={(e) =>
                        saveActiveCampaign({
                          creativeDirection: {
                            ...(activeCampaign.creativeDirection || {
                              themeName: '',
                              visualStyle: '',
                              coreMessage: '',
                              heroHeadline: '',
                              subHeadline: '',
                              keyHashtags: [],
                            }),
                            heroHeadline: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Command Your Sovereign Infrastructure"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Sub-Headline / Core Hook</label>
                    <input
                      type="text"
                      value={activeCampaign.creativeDirection?.subHeadline || ''}
                      onChange={(e) =>
                        saveActiveCampaign({
                          creativeDirection: {
                            ...(activeCampaign.creativeDirection || {
                              themeName: '',
                              visualStyle: '',
                              coreMessage: '',
                              heroHeadline: '',
                              subHeadline: '',
                              keyHashtags: [],
                            }),
                            subHeadline: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Built for generational momentum with institutional grade security"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Core Narrative Message</label>
                  <textarea
                    rows={3}
                    value={activeCampaign.creativeDirection?.coreMessage || ''}
                    onChange={(e) =>
                      saveActiveCampaign({
                        creativeDirection: {
                          ...(activeCampaign.creativeDirection || {
                            themeName: '',
                            visualStyle: '',
                            coreMessage: '',
                            heroHeadline: '',
                            subHeadline: '',
                            keyHashtags: [],
                          }),
                          coreMessage: e.target.value,
                        },
                      })
                    }
                    placeholder="Full overarching campaign narrative and emotional anchor..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Hero Asset Attachment */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                    Campaign Hero Visual Asset URL
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={activeCampaign.heroAssetUrl || ''}
                      onChange={(e) => saveActiveCampaign({ heroAssetUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or link to asset in Resource Vault"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  {activeCampaign.heroAssetUrl && (
                    <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border border-zinc-800">
                      <img
                        src={activeCampaign.heroAssetUrl}
                        alt="Hero Visual"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTENT PIPELINE */}
          {subTab === 'content' && (
            <div className="space-y-6">
              {/* Quick Post Creator */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-500" />
                  Multi-Channel Content Creator
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {(['linkedin', 'twitter', 'instagram', 'tiktok'] as const).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setQuickPostPlatform(plat)}
                      className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all border ${
                        quickPostPlatform === plat
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={quickPostHook}
                    onChange={(e) => setQuickPostHook(e.target.value)}
                    placeholder="Caption hook or viral headline for this post..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                  <textarea
                    rows={2}
                    value={quickPostConcept}
                    onChange={(e) => setQuickPostConcept(e.target.value)}
                    placeholder="Post body, bullet points, call to action, and link..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleCreateQuickPost}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-red-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Schedule to Campaign Pipeline
                  </button>
                </div>
              </div>

              {/* Scheduled Posts for this Campaign */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    Campaign Content Pipeline ({campaignContent.length} Posts)
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {campaignContent.filter((c) => c.status === 'ready' || c.status === 'published').length} Ready
                  </span>
                </div>

                {campaignContent.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
                    <p className="text-xs text-zinc-500">No content items scheduled specifically for this campaign yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {campaignContent.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {item.platform}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-400 capitalize">
                            {item.status}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-zinc-200 line-clamp-2">
                          {item.captionHook || item.concept}
                        </div>
                        {item.concept && item.concept !== item.captionHook && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2">{item.concept}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SPRINT ROADMAP & TIMELINE */}
          {subTab === 'sprint' && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    Campaign Sprint Timeline & Deliverables
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Structured rollout milestones from pre-launch teaser to post-launch conversion blitz.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {(activeCampaign.sprintDays || []).map((sprint, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleSprintTask(idx)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      sprint.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        sprint.completed ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-700 bg-zinc-900'
                      }`}>
                        {sprint.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-400 block">{sprint.day}</span>
                        <span className={`text-xs ${sprint.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {sprint.task}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {sprint.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: EXECUTIVE APPROVALS */}
          {subTab === 'approvals' && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-red-500" />
                  Executive Approvals & Launch Gate
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Required governance signoffs before a campaign can be marked Active and executed in the market.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Creative Signoff */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  activeCampaign.approvals?.creativeApproved
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-zinc-950 border-zinc-800'
                }`}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      Pillar 1: Creative Direction
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">Creative & Messaging Signoff</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Confirms branding, copy hooks, and visual direction adhere strictly to Brand Core guidelines.
                    </p>
                  </div>

                  <button
                    onClick={() => handleApprovalToggle('creative')}
                    className={`w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeCampaign.approvals?.creativeApproved
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {activeCampaign.approvals?.creativeApproved ? '✓ Creative Approved' : 'Sign Off Creative'}
                  </button>
                </div>

                {/* 2. Budget Signoff */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  activeCampaign.approvals?.budgetApproved
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-zinc-950 border-zinc-800'
                }`}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      Pillar 2: Fiscal Budget
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">Budget & Resource Allocation</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Allocates ${activeCampaign.budget || 0} {activeCampaign.currency} for ad spend, production, and distribution.
                    </p>
                  </div>

                  <button
                    onClick={() => handleApprovalToggle('budget')}
                    className={`w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeCampaign.approvals?.budgetApproved
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {activeCampaign.approvals?.budgetApproved ? '✓ Budget Authorized' : 'Authorize Budget'}
                  </button>
                </div>

                {/* 3. Launch Authorization */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  activeCampaign.approvals?.launchApproved
                    ? 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-950/30'
                    : 'bg-zinc-950 border-zinc-800'
                }`}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-1">
                      Final Launch Gate
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">Live Launch Authorization</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Sets campaign state to ACTIVE and begins public rollout across all connected channels.
                    </p>
                  </div>

                  <button
                    onClick={() => handleApprovalToggle('launch')}
                    className={`w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeCampaign.approvals?.launchApproved
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {activeCampaign.approvals?.launchApproved ? '🚀 Launch Certified & Live' : 'Certify & Authorize Launch'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: KPIS & GOALS TRACKING */}
          {subTab === 'results' && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  Measurable KPIs & Target Results
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Track operational and revenue targets versus actual performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400 font-semibold">Target Impressions / Reach</span>
                  <input
                    type="number"
                    value={activeCampaign.goals?.targetImpressions || 0}
                    onChange={(e) =>
                      saveActiveCampaign({
                        goals: {
                          ...(activeCampaign.goals || {}),
                          targetImpressions: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base font-bold text-zinc-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400 font-semibold">Target Leads / Conversions</span>
                  <input
                    type="number"
                    value={activeCampaign.goals?.targetLeadsOrSales || 0}
                    onChange={(e) =>
                      saveActiveCampaign({
                        goals: {
                          ...(activeCampaign.goals || {}),
                          targetLeadsOrSales: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base font-bold text-zinc-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-xs text-zinc-400 font-semibold">Target Revenue ($)</span>
                  <input
                    type="number"
                    value={activeCampaign.goals?.targetRevenue || 0}
                    onChange={(e) =>
                      saveActiveCampaign({
                        goals: {
                          ...(activeCampaign.goals || {}),
                          targetRevenue: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base font-bold text-emerald-400 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* New Campaign Creation Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100">Create Master Campaign</h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="text-zinc-400 hover:text-zinc-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Campaign Title *</label>
                <input
                  type="text"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  placeholder="e.g. Sovereign Vault V2 Go-To-Market"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Strategic Objective</label>
                <select
                  value={newCampaignObjective}
                  onChange={(e) => setNewCampaignObjective(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                >
                  <option value="product_launch">Product Launch (Flagship)</option>
                  <option value="lead_generation">High-Ticket Lead Generation</option>
                  <option value="brand_awareness">Brand Authority & Awareness</option>
                  <option value="rebrand">Brand Relaunch / Rebrand</option>
                  <option value="seasonal_promo">Seasonal Sprint Promo</option>
                  <option value="growth_sprint">Growth Sprint & Virality</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Campaign Budget ($)</label>
                <input
                  type="number"
                  value={newCampaignBudget}
                  onChange={(e) => setNewCampaignBudget(Number(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewCampaign}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/20"
              >
                Initialize Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
