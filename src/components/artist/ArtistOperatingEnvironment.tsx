import React, { useState, useMemo } from 'react';
import {
  Disc3,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Music,
  Sliders,
  Users,
  DollarSign,
  Tag,
  Globe,
  Share2,
  Edit3,
  Flame,
  Volume2,
  ListTodo,
  ExternalLink,
  ChevronDown,
  Brain,
  ShieldCheck,
  Check,
  Headphones,
  Radio,
  FileMusic,
  Maximize2,
  X
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { useCreativeBrain } from '../../context/CreativeBrainContext';
import {
  ActiveTab,
  Release,
  ContentItem,
  ContentStatus,
  ReleaseStage,
  TaskItem,
  AttentionItem
} from '../../types';

// Contextual tool integrations (embedded directly within release workflows)
import { CoverStudio } from '../CoverStudio';
import { MasteringSuite } from '../MasteringSuite';
import { LyricsStudio } from '../LyricsStudio';
import { DSPPitcher } from '../DSPPitcher';
import { SplitsCalculator } from '../SplitsCalculator';
import { PresaveHub } from '../PresaveHub';
import { EPKBuilder } from '../EPKBuilder';

export type ArtistEnvTab = 'overview' | 'releases' | 'content' | 'artist_dna';

export type ReleaseLifecycleStage = 'Idea' | 'Production' | 'Preparation' | 'Launch' | 'Post-Release';

interface ArtistOperatingEnvironmentProps {
  onNavigateTab?: (tab: ActiveTab) => void;
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ArtistOperatingEnvironment: React.FC<ArtistOperatingEnvironmentProps> = ({
  onNavigateTab,
  onNotify = (_msg: string, _type?: 'success' | 'info' | 'error') => {},
}) => {
  const {
    workspace,
    activeRelease,
    releases,
    contentItems,
    tasks,
    attentionItems,
    calculateReleaseReadiness,
    createRelease,
    updateRelease,
    createContentItem,
    updateContentItem,
    creativeMemory,
    updateCreativeMemory,
  } = useWorkspace();

  const { activeWorkspace } = useAuth();
  const { openBrainWithContext } = useCreativeBrain();

  // Primary 4-tab Navigation
  const [activeTab, setActiveTab] = useState<ArtistEnvTab>('overview');

  // Releases Contextual Drawer / Selected Release View
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(() => {
    return activeRelease?.id || releases[0]?.id || null;
  });

  // Active Contextual Release Capability Modal/Drawer
  const [activeReleaseCapability, setActiveReleaseCapability] = useState<
    | null
    | 'identity'
    | 'master'
    | 'artwork'
    | 'dsp_pitch'
    | 'presave'
    | 'lyrics'
    | 'splits'
    | 'epk'
    | 'checklist'
  >(null);

  // New Release Creation Form State
  const [isCreatingRelease, setIsCreatingRelease] = useState(false);
  const [newReleaseTitle, setNewReleaseTitle] = useState('');
  const [newReleaseType, setNewReleaseType] = useState<'single' | 'ep' | 'album'>('single');
  const [newReleaseGenre, setNewReleaseGenre] = useState(workspace?.genreOrNiche || '');
  const [newReleaseTargetDate, setNewReleaseTargetDate] = useState('');

  // Currently inspected release
  const currentRelease = useMemo(() => {
    return releases.find((r) => r.id === selectedReleaseId) || activeRelease || releases[0] || null;
  }, [releases, selectedReleaseId, activeRelease]);

  // Release Readiness Calculation
  const readiness = useMemo(() => {
    return calculateReleaseReadiness(currentRelease);
  }, [calculateReleaseReadiness, currentRelease]);

  // Real data filter for current tasks and attention items
  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed).slice(0, 5);
  }, [tasks]);

  const realAttentionItems = useMemo(() => {
    return attentionItems.slice(0, 4);
  }, [attentionItems]);

  // Content Engine lifecycle filtering
  const [contentStageFilter, setContentStageFilter] = useState<'all' | 'pre_release' | 'launch_window' | 'post_release'>('all');

  // Artist DNA Editor State (persisted via Workspace Context & Creative Memory)
  const [artistDNA, setArtistDNA] = useState({
    identity: workspace?.name || 'Artist Vanguard',
    story: workspace?.bio || 'Independent sonic artist crafting atmospheric soundscapes bridging electronic synthesis with acoustic soul.',
    genre: workspace?.genreOrNiche || 'Alternative Electronic / Alt-R&B',
    sound: 'Deep analog sub-bass, organic textured foley, pitched vocal chops, minimalist chord voicings.',
    audience: 'Ages 18-32, design-forward, late-night music discoverers, underground club culture & editorial playlist listeners.',
    voice: 'Introspective, refined, enigmatic, sincere. Speaks with brevity and artistic conviction.',
    language: 'English, occasional ambient poetic fragments.',
    visualDirection: 'Monochrome contrast, film grain, brutalist typography, warm amber backlight on deep obsidian.',
    contentPillars: ['Studio Process & Sound Architecture', 'Sonic Storytelling & Track Origins', 'Live Instrumentation & Jam Cuts', 'Aesthetic Moods & Late Night Musings'],
    recurringThemes: ['Identity & solitude', 'Modern urban kinetics', 'Nostalgia for future moments', 'Sonic minimalism'],
    goals: 'Reach 250,000 monthly algorithmic listeners, secure DSP editorial placement, build direct-to-fan vinyl subscribers.',
    positioning: 'High-craft independent sound innovator standing out against repetitive commercial formula.',
    platforms: ['Spotify', 'Apple Music', 'Instagram', 'TikTok', 'YouTube', 'SoundCloud'],
    preferences: 'Prefers 4K vertical film aesthetic over fast trending dance trends. Focuses on sonic depth.',
    thingsToAvoid: ['Generic engagement bait ("comment your favorite emoji")', 'Overly polished corporate graphics', 'Rushing rollouts before master is certified'],
  });

  const [isDNASaving, setIsDNASaving] = useState(false);

  const handleSaveDNA = async () => {
    setIsDNASaving(true);
    try {
      await updateCreativeMemory('artist_dna_core', 'strategy', JSON.stringify(artistDNA));
      onNotify('Artist DNA context saved. Creative Brain updated!', 'success');
    } catch {
      onNotify('Failed to save Artist DNA', 'error');
    } finally {
      setIsDNASaving(false);
    }
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReleaseTitle.trim()) {
      onNotify('Please enter a release title', 'error');
      return;
    }

    try {
      const created = await createRelease({
        title: newReleaseTitle.trim(),
        type: newReleaseType,
        genre: newReleaseGenre || 'Alternative',
        targetDate: newReleaseTargetDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'in_progress',
      });
      setSelectedReleaseId(created.id);
      setIsCreatingRelease(false);
      setNewReleaseTitle('');
      onNotify(`Release "${created.title}" initialized in Idea stage.`, 'success');
    } catch {
      onNotify('Failed to create release', 'error');
    }
  };

  const handleUpdateStage = async (releaseId: string, stage: ReleaseLifecycleStage) => {
    try {
      await updateRelease(releaseId, { stage } as any);
      onNotify(`Release moved to ${stage} stage.`, 'success');
    } catch {
      onNotify('Failed to update stage', 'error');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fadeIn">
      {/* Primary OS Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-red-950/80 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Artist Operating Environment</span>
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs font-mono text-zinc-400">{workspace?.name || 'Vanguard Studio'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {activeTab === 'overview' && 'Artist Overview'}
              {activeTab === 'releases' && 'Release Lifecycle Management'}
              {activeTab === 'content' && 'Release Content Engine'}
              {activeTab === 'artist_dna' && 'Artist DNA Context Layer'}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {activeTab === 'overview' && 'Live operational status, upcoming deadlines, content readiness, and next immediate actions.'}
              {activeTab === 'releases' && 'One central place to produce, prepare, certify, and launch releases with contextual toolkits.'}
              {activeTab === 'content' && 'Contextual content systems engineered for Pre-Release, Launch Week, and 6-Week Post-Release momentum.'}
              {activeTab === 'artist_dna' && 'The central memory layer feeding Creative Brain intelligence for recommendations and releases.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openBrainWithContext(`Artist Operating Environment (${activeTab})`)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Next Best Action</span>
            </button>

            <button
              onClick={() => setIsCreatingRelease(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-950/50 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Release</span>
            </button>
          </div>
        </div>

        {/* Primary 4-Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('releases')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'releases'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
          >
            <Disc3 className="w-4 h-4" />
            <span>2. Releases</span>
            {releases.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/40 text-white font-mono">
                {releases.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'content'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Content</span>
            {contentItems.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/40 text-white font-mono">
                {contentItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('artist_dna')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'artist_dna'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>4. Artist DNA</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ARTIST OVERVIEW (Real Data, Actionable, No Vanity Stats) */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Release & Stage Banner */}
          {currentRelease ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold">
                      Current Active Release
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-400 font-semibold">{((currentRelease as any).releaseType || (currentRelease as any).type || 'Single').toUpperCase()}</span>
                  </div>
                  <h2 className="text-3xl font-black text-white">{currentRelease.title}</h2>
                  <p className="text-xs text-zinc-400">
                    Genre: <span className="text-zinc-200">{currentRelease.genre || 'Electronic / Alternative'}</span> | Target Launch: <span className="text-zinc-200">{(currentRelease as any).targetDate || currentRelease.releaseDate || 'TBD'}</span>
                  </p>
                </div>

                {/* Lifecycle Progress Pipeline */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
                    {(['Idea', 'Production', 'Preparation', 'Launch', 'Post-Release'] as ReleaseLifecycleStage[]).map((stage, idx) => {
                      const stages: ReleaseLifecycleStage[] = ['Idea', 'Production', 'Preparation', 'Launch', 'Post-Release'];
                      const currentIdx = stages.indexOf((currentRelease.stage as ReleaseLifecycleStage) || 'Idea');
                      const isCurrent = (currentRelease.stage || 'Idea') === stage;
                      const isCompleted = currentIdx > idx;

                      return (
                        <div
                          key={stage}
                          onClick={() => handleUpdateStage(currentRelease.id, stage)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-red-600 text-white shadow-md shadow-red-900/50'
                              : isCompleted
                              ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/30'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {isCompleted && <Check className="w-3 h-3 text-emerald-400" />}
                          <span>{stage}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setActiveTab('releases')}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>Manage Release</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Release Readiness Pill Bar */}
              <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-black text-white">{readiness.score}%</div>
                  <div>
                    <div className="text-xs font-bold text-zinc-300">Launch Readiness Score</div>
                    <div className="text-[11px] text-zinc-500">
                      {readiness.score >= 80 ? 'Certified for Distribution' : 'Requires verification before DSP pitching'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${readiness.stageColor}`}>
                    {readiness.stage}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-4">
              <Disc3 className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Active Release Initialized</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Anchor your operating environment around an upcoming single, EP, or album to activate the content engine and release checklist.
              </p>
              <button
                onClick={() => setIsCreatingRelease(true)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Create First Release
              </button>
            </div>
          )}

          {/* 3-Column Real Operational Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Next Actions & Deadlines */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-bold text-white">Next Action & Work</h3>
                </div>
                <span className="text-xs font-mono text-zinc-500">{pendingTasks.length} open</span>
              </div>

              {pendingTasks.length > 0 ? (
                <div className="space-y-2.5">
                  {pendingTasks.map((t) => (
                    <div key={t.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200">{t.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          t.priority === 'urgent' ? 'bg-red-950 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-400'
                        }`}>
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
                  ✓ All operational tasks completed. Ready for next sprint.
                </div>
              )}
            </div>

            {/* 2. Things Requiring Attention */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Attention Required</h3>
                </div>
                <span className="text-xs font-mono text-zinc-500">{realAttentionItems.length} alerts</span>
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
                  ✓ Zero blockers detected. Release pipeline healthy.
                </div>
              )}
            </div>

            {/* 3. Content Readiness Engine */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Content Readiness</h3>
                </div>
                <button
                  onClick={() => setActiveTab('content')}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  Engine →
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Pre-Release Teasers</span>
                    <span className="text-purple-400">
                      {contentItems.filter((c) => c.status === 'ready' || c.status === 'published').length} / 5 Ready
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (contentItems.filter((c) => c.status === 'ready' || c.status === 'published').length / 5) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Post-Release Sustained Slots</span>
                    <span className="text-red-400">6 Weeks Sequenced</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Creative Brain automatically generates 18 post-release narrative angles matching your Artist DNA.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('content')}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
                >
                  Generate Rollout Content Systems
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RELEASES (Lifecycle: Idea -> Production -> Preparation -> Launch -> Post-Release) */}
      {/* ========================================================================= */}
      {activeTab === 'releases' && (
        <div className="space-y-6">
          {/* Release Selector & Lifecycle Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-400">Select Release:</span>
              <select
                value={currentRelease?.id || ''}
                onChange={(e) => setSelectedReleaseId(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
              >
                {releases.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({((r as any).releaseType || (r as any).type || 'Single').toUpperCase()}) — {(r as any).stage || 'Idea'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">
                Stage: <strong className="text-red-400">{currentRelease?.stage || 'Idea'}</strong>
              </span>
            </div>
          </div>

          {currentRelease ? (
            <div className="space-y-6">
              {/* Contextual Release Capabilities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* 1. Release Identity & Metadata */}
                <div
                  onClick={() => setActiveReleaseCapability('identity')}
                  className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-zinc-800 text-red-400 group-hover:scale-110 transition-transform">
                      <Tag className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Metadata</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      Identity & Metadata
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Title, UPC, ISRC, genre micro-tags, distribution label, and target release date.
                    </p>
                  </div>
                </div>

                {/* 2. Master Audio & Mastering Suite */}
                <div
                  onClick={() => setActiveReleaseCapability('master')}
                  className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-zinc-800 text-purple-400 group-hover:scale-110 transition-transform">
                      <Volume2 className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Audio Lab</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                      Master Audio & Suite
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Lossless 24-bit audio stems, loudness LUFS monitoring, and spectrum analysis.
                    </p>
                  </div>
                </div>

                {/* 3. Artwork & Cover Studio */}
                <div
                  onClick={() => setActiveReleaseCapability('artwork')}
                  className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-zinc-800 text-pink-400 group-hover:scale-110 transition-transform">
                      <Disc3 className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Visuals</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
                      Artwork & Cover Studio
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      3000x3000px high-resolution cover art generator formatted for DSP compliance.
                    </p>
                  </div>
                </div>

                {/* 4. DSP Pitch */}
                <div
                  onClick={() => setActiveReleaseCapability('dsp_pitch')}
                  className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-zinc-800 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Radio className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Placement</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      DSP Pitch Engine
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Direct-to-editor pitches tailored for Spotify for Artists & Apple Music playlists.
                    </p>
                  </div>
                </div>

                {/* 5. Pre-Save */}
                <div
                  onClick={() => setActiveReleaseCapability('presave')}
                  className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-zinc-800 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Share2 className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Conversion</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      Pre-Save Campaign Hub
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Multi-platform smart landing links, countdown triggers, and early listener capture.
                    </p>
                  </div>
                </div>

                {/* 6. Lyrics Studio */}
                <div
                  onClick={() => setActiveReleaseCapability('lyrics')}
                  className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 group-hover:scale-110 transition-transform">
                      <FileMusic className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Writing</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      Lyrics Studio
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Synced line-by-line lyric timestamping for Musixmatch, Genius, and Apple Music.
                    </p>
                  </div>
                </div>

                {/* 7. Splits & Royalties */}
                <div
                  onClick={() => setActiveReleaseCapability('splits')}
                  className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-zinc-800 text-emerald-400 group-hover:scale-110 transition-transform">
                      <DollarSign className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Legal</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Splits & Royalties
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Collaborator percentage split agreements, publishing shares, and exportable term sheets.
                    </p>
                  </div>
                </div>

                {/* 8. EPK & Press Kit */}
                <div
                  onClick={() => setActiveReleaseCapability('epk')}
                  className="p-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-zinc-800 text-indigo-400 group-hover:scale-110 transition-transform">
                      <Globe className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Press</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      Electronic Press Kit (EPK)
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Shareable media page for blog curators, radio directors, and booking agents.
                    </p>
                  </div>
                </div>
              </div>

              {/* Launch Checklist */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">7-Pillar Release Certification Checklist</h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {readiness.completedPillars} / {readiness.totalPillars} Pillars Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {readiness.requirements.map((req, idx) => (
                    <div
                      key={req.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        req.completed
                          ? 'bg-emerald-950/15 border-emerald-500/30'
                          : 'bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${req.completed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-xs font-bold text-zinc-200">
                            Pillar {idx + 1}: {req.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{req.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (req.id === 'req_master') setActiveReleaseCapability('master');
                          else if (req.id === 'req_cover') setActiveReleaseCapability('artwork');
                          else if (req.id === 'req_dsp_pitch') setActiveReleaseCapability('dsp_pitch');
                          else if (req.id === 'req_splits') setActiveReleaseCapability('splits');
                          else if (req.id === 'req_presave') setActiveReleaseCapability('presave');
                          else setActiveReleaseCapability('identity');
                        }}
                        className="text-[11px] font-bold text-zinc-400 hover:text-red-400 shrink-0 cursor-pointer"
                      >
                        {req.actionLabel} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ARTIST CONTENT ENGINE (Sequenced around Release Lifecycle) */}
      {/* ========================================================================= */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Content Framework Banner */}
          <div className="p-6 rounded-3xl border border-zinc-800 bg-gradient-to-r from-purple-950/20 via-zinc-900 to-black space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Release Lifecycle Content Architecture
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Reusable Content Systems, Not Merely Isolated Posts
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                  Automatically generated from your Artist DNA and release audio stems. Sustains promotion before, during, and 6 weeks post-release.
                </p>
              </div>

              {/* Stage Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setContentStageFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    contentStageFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  All Content
                </button>
                <button
                  onClick={() => setContentStageFilter('pre_release')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    contentStageFilter === 'pre_release' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Pre-Release Teasers
                </button>
                <button
                  onClick={() => setContentStageFilter('launch_window')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    contentStageFilter === 'launch_window' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Launch Week (Conversion)
                </button>
                <button
                  onClick={() => setContentStageFilter('post_release')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    contentStageFilter === 'post_release' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Weeks 1-6 Post-Release
                </button>
              </div>
            </div>
          </div>

          {/* Sequenced Content Systems */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* System 1: Pre-Release Discovery */}
            {(contentStageFilter === 'all' || contentStageFilter === 'pre_release') && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">Phase 1</span>
                    <h4 className="text-sm font-bold text-white">Pre-Release Hook Discovery</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Days -21 to 0
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <span className="font-bold text-zinc-200">Format: 'Stem Isolation Breakdown'</span>
                    <p className="text-zinc-400 leading-relaxed">
                      "I spent 4 days trying to get this bassline to speak. Watch what happens when the 808 hits."
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 font-mono">
                      <span>Platform: TikTok / Reels</span>
                      <span className="text-emerald-400 font-bold">✓ Script Ready</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <span className="font-bold text-zinc-200">Format: 'The Lyric Origin'</span>
                    <p className="text-zinc-400 leading-relaxed">
                      "The night I wrote verse 2, everything changed. Audio breakdown over raw studio monitor recording."
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 font-mono">
                      <span>Platform: Instagram Carousel</span>
                      <span className="text-purple-400 font-bold">Pre-Save CTA</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System 2: Launch Week Conversion */}
            {(contentStageFilter === 'all' || contentStageFilter === 'launch_window') && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider">Phase 2</span>
                    <h4 className="text-sm font-bold text-white">Launch Window (Conversion)</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Days 0 to +7
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <span className="font-bold text-zinc-200">Format: 'Official Visualizer Loop'</span>
                    <p className="text-zinc-400 leading-relaxed">
                      High-contrast 4K canvas loop synchronized to the main hook. Direct DSP smart-link bio placement.
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 font-mono">
                      <span>Platform: Spotify Canvas / YouTube</span>
                      <span className="text-red-400 font-bold">Release Day</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <span className="font-bold text-zinc-200">Format: 'The Producer Reaction'</span>
                    <p className="text-zinc-400 leading-relaxed">
                      First-listen playback reactions with collaborators and core discord listeners.
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 font-mono">
                      <span>Platform: TikTok / Stories</span>
                      <span className="text-emerald-400 font-bold">Stream Now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System 3: Post-Release Sustained Growth */}
            {(contentStageFilter === 'all' || contentStageFilter === 'post_release') && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Phase 3</span>
                    <h4 className="text-sm font-bold text-white">6-Week Post-Release Engine</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Weeks 2 to 6+
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <span className="font-bold text-zinc-200">Week 2: 'Acoustic / Stripped Cut'</span>
                    <p className="text-zinc-400 leading-relaxed">
                      Live acoustic piano or guitar version. Gives algorithmic listeners a fresh emotional angle.
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 font-mono">
                      <span>Save Velocity Anchor</span>
                      <span className="text-blue-400 font-bold">Week 2</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                    <span className="font-bold text-zinc-200">Week 4: 'Editorial Placement Celebration'</span>
                    <p className="text-zinc-400 leading-relaxed">
                      "Thank you for 50,000 algorithmic streams. Here is the unreleased demo version."
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 font-mono">
                      <span>Retention Driver</span>
                      <span className="text-emerald-400 font-bold">Week 4</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ARTIST DNA (Core Context Layer for Keedohub Intelligence) */}
      {/* ========================================================================= */}
      {activeTab === 'artist_dna' && (
        <div className="space-y-6">
          {/* Intelligence Notice */}
          <div className="p-5 rounded-3xl border border-red-500/30 bg-red-950/20 flex items-start gap-3">
            <Brain className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Artist DNA Context Layer
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                The Creative Brain automatically references your Artist DNA when generating content, release strategies, captions, EPK material, pitches, and creative direction. Update this anytime to calibrate your AI recommendations.
              </p>
            </div>
          </div>

          {/* DNA Editing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identity, Story & Sound */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
                <Music className="w-4 h-4 text-red-400" />
                <span>Identity & Sonic Architecture</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-semibold">Artist Identity / Moniker</label>
                  <input
                    type="text"
                    value={artistDNA.identity}
                    onChange={(e) => setArtistDNA({ ...artistDNA, identity: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Genre & Micro-Classifications</label>
                  <input
                    type="text"
                    value={artistDNA.genre}
                    onChange={(e) => setArtistDNA({ ...artistDNA, genre: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Sonic Signature & Sound Palette</label>
                  <textarea
                    rows={3}
                    value={artistDNA.sound}
                    onChange={(e) => setArtistDNA({ ...artistDNA, sound: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500 font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Artist Narrative & Story</label>
                  <textarea
                    rows={3}
                    value={artistDNA.story}
                    onChange={(e) => setArtistDNA({ ...artistDNA, story: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500 font-medium leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Audience, Voice & Visual Direction */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Audience, Voice & Visual Direction</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-semibold">Target Audience & Subcultures</label>
                  <textarea
                    rows={2}
                    value={artistDNA.audience}
                    onChange={(e) => setArtistDNA({ ...artistDNA, audience: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-purple-500 font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Voice, Tone & Language</label>
                  <input
                    type="text"
                    value={artistDNA.voice}
                    onChange={(e) => setArtistDNA({ ...artistDNA, voice: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Visual Direction & Aesthetic Tone</label>
                  <textarea
                    rows={2}
                    value={artistDNA.visualDirection}
                    onChange={(e) => setArtistDNA({ ...artistDNA, visualDirection: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-purple-500 font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold">Strategic Positioning</label>
                  <input
                    type="text"
                    value={artistDNA.positioning}
                    onChange={(e) => setArtistDNA({ ...artistDNA, positioning: e.target.value })}
                    className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleSaveDNA}
              disabled={isDNASaving}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-red-950/50 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isDNASaving ? 'Saving Context...' : 'Save & Sync Artist DNA'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTEXTUAL CAPABILITY DRAWER / MODAL FOR RELEASES */}
      {/* ========================================================================= */}
      {activeReleaseCapability && currentRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-[#0d0d12] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                  {currentRelease.title} • Contextual Capability
                </span>
                <h3 className="text-xl font-black text-white">
                  {activeReleaseCapability === 'identity' && 'Release Identity & Metadata'}
                  {activeReleaseCapability === 'master' && 'Master Audio & Sound Laboratory'}
                  {activeReleaseCapability === 'artwork' && 'Artwork & Cover Studio'}
                  {activeReleaseCapability === 'dsp_pitch' && 'DSP Editorial Pitcher'}
                  {activeReleaseCapability === 'presave' && 'Pre-Save Campaign Hub'}
                  {activeReleaseCapability === 'lyrics' && 'Lyrics Studio'}
                  {activeReleaseCapability === 'splits' && 'Splits & Royalty Terms'}
                  {activeReleaseCapability === 'epk' && 'Electronic Press Kit (EPK)'}
                </h3>
              </div>

              <button
                onClick={() => setActiveReleaseCapability(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Capabilities */}
            {activeReleaseCapability === 'identity' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 font-semibold">Title</label>
                    <input
                      type="text"
                      value={currentRelease.title}
                      onChange={(e) => updateRelease(currentRelease.id, { title: e.target.value })}
                      className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold">Type</label>
                    <select
                      value={(currentRelease as any).releaseType || (currentRelease as any).type || 'single'}
                      onChange={(e) => updateRelease(currentRelease.id, { releaseType: e.target.value, type: e.target.value } as any)}
                      className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium"
                    >
                      <option value="single">Single</option>
                      <option value="ep">EP</option>
                      <option value="album">Album</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold">ISRC Code</label>
                    <input
                      type="text"
                      placeholder="US-ABC-26-00001"
                      className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold">UPC Code</label>
                    <input
                      type="text"
                      placeholder="123456789012"
                      className="w-full mt-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
                    />
                  </div>
                </div>
                <p className="text-zinc-500 text-[11px]">
                  All metadata is validated against international DDEX standards before DSP submission.
                </p>
              </div>
            )}

            {activeReleaseCapability === 'master' && (
              <MasteringSuite onNotify={onNotify} />
            )}

            {activeReleaseCapability === 'artwork' && (
              <CoverStudio onNotify={onNotify} />
            )}

            {activeReleaseCapability === 'dsp_pitch' && (
              <DSPPitcher onNotify={onNotify} />
            )}

            {activeReleaseCapability === 'presave' && (
              <PresaveHub onNotify={onNotify} />
            )}

            {activeReleaseCapability === 'lyrics' && (
              <LyricsStudio onNotify={onNotify} />
            )}

            {activeReleaseCapability === 'splits' && (
              <SplitsCalculator onNotify={onNotify} />
            )}

            {activeReleaseCapability === 'epk' && (
              <EPKBuilder onNotify={onNotify} />
            )}
          </div>
        </div>
      )}

      {/* New Release Creation Modal */}
      {isCreatingRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0d0d12] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-red-500" />
                <span>Initialize New Release</span>
              </h3>
              <button
                onClick={() => setIsCreatingRelease(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRelease} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold">Release Title</label>
                <input
                  type="text"
                  required
                  value={newReleaseTitle}
                  onChange={(e) => setNewReleaseTitle(e.target.value)}
                  placeholder="e.g. Midnight Solitude"
                  className="w-full mt-1.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold">Format Type</label>
                  <select
                    value={newReleaseType}
                    onChange={(e) => setNewReleaseType(e.target.value as any)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold">Target Release Date</label>
                  <input
                    type="date"
                    value={newReleaseTargetDate}
                    onChange={(e) => setNewReleaseTargetDate(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingRelease(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-950/50"
                >
                  Initialize Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
