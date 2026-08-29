import React, { useState, useMemo } from 'react';
import {
  Disc3,
  Music,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Download,
  Trash2,
  ExternalLink,
  Layers,
  Radio,
  Sliders,
  Users,
  DollarSign,
  Tag,
  Globe,
  Share2,
  Check,
  Edit3,
  Flame,
  Volume2,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useCreativeBrain } from '../context/CreativeBrainContext';
import { ContextualRadarBanner } from './CreativeRadarDashboard';
import {
  ActiveTab,
  Release,
  ContentItem,
  ContentStatus,
  ReleaseStatus,
  RolloutDayAction,
} from '../types';

interface ArtistOSProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

type ArtistOSTab = 
  | 'command' 
  | 'timeline' 
  | 'content' 
  | 'checklist' 
  | 'assets' 
  | 'pitch' 
  | 'presave' 
  | 'splits' 
  | 'lyrics';

export const ArtistOS: React.FC<ArtistOSProps> = ({ onNavigateTab }) => {
  const {
    workspace,
    releases,
    activeRelease,
    activeReleaseId,
    setActiveReleaseId,
    calculateReleaseReadiness,
    createRelease,
    updateRelease,
    deleteRelease,
    contentItems,
    createContentItem,
    updateContentItem,
    deleteContentItem,
    assets,
    saveAsset,
    milestones,
    createMilestone,
    toggleMilestone,
  } = useWorkspace();

  const { user } = useAuth();
  const { openWithContext } = useCreativeBrain();

  const [activeSubTab, setActiveSubTab] = useState<ArtistOSTab>('command');
  const [showNewReleaseModal, setShowNewReleaseModal] = useState(false);
  const [showEditReleaseModal, setShowEditReleaseModal] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);

  // New Release Form State
  const [newReleaseTitle, setNewReleaseTitle] = useState('');
  const [newReleaseArtist, setNewReleaseArtist] = useState(workspace?.name || 'Artist Name');
  const [newReleaseType, setNewReleaseType] = useState('Single');
  const [newReleaseGenre, setNewReleaseGenre] = useState(workspace?.genreOrNiche || 'Afro-Fusion');
  const [newReleaseDate, setNewReleaseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [newReleaseStory, setNewReleaseStory] = useState('');
  const [isSubmittingRelease, setIsSubmittingRelease] = useState(false);

  // Edit Release Form State
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editReleaseDate, setEditReleaseDate] = useState('');
  const [editStatus, setEditStatus] = useState<ReleaseStatus>('planning');
  const [editUpc, setEditUpc] = useState('');
  const [editIsrc, setEditIsrc] = useState('');

  // New Content Item Form State
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentPlatform, setNewContentPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | 'spotify'>('tiktok');
  const [newContentType, setNewContentType] = useState('Teaser Video');
  const [newContentConcept, setNewContentConcept] = useState('');
  const [newContentCaption, setNewContentCaption] = useState('');
  const [newContentDate, setNewContentDate] = useState('');
  const [newContentPriority, setNewContentPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');

  // New Milestone Form State
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneNotes, setNewMilestoneNotes] = useState('');

  // Content filter
  const [contentPlatformFilter, setContentPlatformFilter] = useState<string>('all');
  const [contentStatusFilter, setContentStatusFilter] = useState<string>('all');

  // Compute readiness for active release
  const readiness = useMemo(() => {
    return calculateReleaseReadiness(activeRelease);
  }, [calculateReleaseReadiness, activeRelease]);

  // Linked content items for active release
  const linkedContent = useMemo(() => {
    if (!activeRelease) return [];
    return contentItems.filter(
      (c) => c.releaseId === activeRelease.id || (activeRelease.campaignId && c.campaignId === activeRelease.campaignId)
    );
  }, [contentItems, activeRelease]);

  // Linked assets for active release
  const linkedAssets = useMemo(() => {
    if (!activeRelease) return [];
    return assets.filter(
      (a) => a.releaseId === activeRelease.id || (activeRelease.projectId && a.projectId === activeRelease.projectId)
    );
  }, [assets, activeRelease]);

  // Linked milestones
  const linkedMilestones = useMemo(() => {
    if (!activeRelease) return [];
    return milestones.filter(
      (m) => m.projectId === activeRelease.projectId || (m.notes && m.notes.includes(activeRelease.title))
    );
  }, [milestones, activeRelease]);

  // Open Edit Release Modal
  const handleOpenEditModal = () => {
    if (!activeRelease) return;
    setEditTitle(activeRelease.title);
    setEditArtist(activeRelease.artistName);
    setEditGenre(activeRelease.genre);
    setEditReleaseDate(activeRelease.releaseDate);
    setEditStatus(activeRelease.status);
    setEditUpc(activeRelease.upc || '');
    setEditIsrc(activeRelease.isrc || '');
    setShowEditReleaseModal(true);
  };

  // Handle Save Release Updates
  const handleSaveReleaseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRelease) return;
    try {
      await updateRelease(activeRelease.id, {
        title: editTitle,
        artistName: editArtist,
        genre: editGenre,
        releaseDate: editReleaseDate,
        status: editStatus,
        upc: editUpc,
        isrc: editIsrc,
      });
      setShowEditReleaseModal(false);
    } catch (err) {
      console.error('Failed to update release:', err);
    }
  };

  // Handle Create Release
  const handleCreateReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReleaseTitle.trim()) return;
    setIsSubmittingRelease(true);
    try {
      const created = await createRelease({
        title: newReleaseTitle.trim(),
        artistName: newReleaseArtist.trim() || workspace?.name || 'Artist Name',
        genre: newReleaseGenre,
        releaseType: newReleaseType,
        releaseDate: newReleaseDate,
        status: 'planning',
        narrative: newReleaseStory,
        phases: [
          {
            phaseName: 'Phase 1: Pre-Release Build & Teasers',
            focus: 'Build pre-saves, seed acoustic/raw audio hooks on TikTok, pitch DSP editors',
            timeframe: 'T-21 to T-1 Days',
            actions: [
              {
                day: 'Day -21',
                platform: 'DSP Editorial & Pre-Save',
                contentType: 'Pitch Letter & Smart Pre-Save',
                concept: 'Submit Spotify for Artists editorial pitch and deploy Pre-Save Hub.',
                captionHook: 'Pre-save link is live. First 500 pre-saves get exclusive studio stems.',
                priority: 'CRITICAL',
              },
              {
                day: 'Day -14',
                platform: 'TikTok & Reels',
                contentType: 'Studio Session Voice Memo',
                concept: 'Raw studio clip demonstrating the exact moment the hook came together.',
                captionHook: 'We made this at 4 AM and knew instantly.',
                priority: 'HIGH',
              },
              {
                day: 'Day -7',
                platform: 'Instagram & TikTok',
                contentType: 'Official Cover Artwork Reveal',
                concept: '3D animated vinyl or high-res artwork display with release date announcement.',
                captionHook: 'Official cover art by Keedohub Studio. Drops next Friday.',
                priority: 'HIGH',
              },
            ],
          },
          {
            phaseName: 'Phase 2: Drop Day Explosive Velocity',
            focus: 'Streaming platform links blitz, lyric video drop, community direct messaging',
            timeframe: 'Drop Day (T-0) to T+3 Days',
            actions: [
              {
                day: 'Day 0',
                platform: 'All Platforms',
                contentType: 'Out Now Announcement + Spotify Canvas',
                concept: 'High-energy release visualizer with active streaming links.',
                captionHook: 'OUT WORLDWIDE. Stream on Spotify, Apple Music & Audiomack now.',
                priority: 'CRITICAL',
              },
            ],
          },
        ],
        checklist: [
          { id: 'chk_1', task: 'Finalize 3000x3000px Cover Art in Cover Studio', category: 'CREATIVE', deadline: newReleaseDate, completed: false },
          { id: 'chk_2', task: 'Submit Spotify for Artists Editorial Pitch (T-14 days minimum)', category: 'EDITORIAL', deadline: newReleaseDate, completed: false },
          { id: 'chk_3', task: 'Deploy vanity Pre-Save Landing Page in Pre-Save Hub', category: 'PROMO', deadline: newReleaseDate, completed: false },
          { id: 'chk_4', task: 'Sign Splitsheet agreement with all producers and songwriters', category: 'LEGAL', deadline: newReleaseDate, completed: false },
          { id: 'chk_5', task: 'Upload & Sync LRC Lyrics in Lyrics Studio', category: 'METADATA', deadline: newReleaseDate, completed: false },
        ],
      });

      // Also create initial milestone
      await createMilestone({
        title: `Official Drop: ${created.title}`,
        targetDate: created.releaseDate,
        notes: `Release drop day for ${created.title}`,
        status: 'pending',
      });

      setNewReleaseTitle('');
      setNewReleaseStory('');
      setShowNewReleaseModal(false);
    } catch (err) {
      console.error('Failed to create release:', err);
    } finally {
      setIsSubmittingRelease(false);
    }
  };

  // Quick Add Content Item Submit
  const handleAddContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContentTitle.trim() || !activeRelease) return;
    try {
      await createContentItem({
        releaseId: activeRelease.id,
        title: newContentTitle.trim(),
        platform: newContentPlatform,
        contentType: newContentType,
        concept: newContentConcept,
        captionHook: newContentCaption,
        scheduledDate: newContentDate || activeRelease.releaseDate,
        status: 'idea',
        priority: newContentPriority,
      });
      setNewContentTitle('');
      setNewContentConcept('');
      setNewContentCaption('');
      setShowAddContentModal(false);
    } catch (err) {
      console.error('Failed to add content item:', err);
    }
  };

  // Quick Add Milestone Submit
  const handleAddMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !activeRelease) return;
    try {
      await createMilestone({
        title: newMilestoneTitle.trim(),
        targetDate: newMilestoneDate || activeRelease.releaseDate,
        notes: newMilestoneNotes || `Milestone for ${activeRelease.title}`,
        status: 'pending',
      });
      setNewMilestoneTitle('');
      setNewMilestoneNotes('');
      setShowAddMilestoneModal(false);
    } catch (err) {
      console.error('Failed to add milestone:', err);
    }
  };

  // Toggle Checklist Item
  const handleToggleChecklist = async (itemId: string) => {
    if (!activeRelease) return;
    const currentList = activeRelease.checklist || [];
    const updated = currentList.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await updateRelease(activeRelease.id, { checklist: updated });
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans pb-24 selection:bg-cyan-500/30">
      {/* Top Header / Artist Identity Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Artist Identity & Switcher */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/30">
                {workspace?.name ? workspace.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  {workspace?.name || 'Artist OS Workspace'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {workspace?.genreOrNiche || 'Afro-Fusion'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Artist OS v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Central Music Release Architecture & Production Brain
              </p>
            </div>
          </div>

          {/* Release Switcher Dropdown & Action Controls */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-inner">
              <Disc3 className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span className="text-xs text-slate-400 font-medium">Release:</span>
              <select
                value={activeRelease?.id || ''}
                onChange={(e) => setActiveReleaseId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer max-w-[160px] truncate"
              >
                {releases.length === 0 && <option value="">No releases yet</option>}
                {releases.map((rel) => (
                  <option key={rel.id} value={rel.id} className="bg-slate-900 text-white">
                    {rel.title} ({rel.releaseType})
                  </option>
                ))}
              </select>
            </div>

            {activeRelease && (
              <button
                onClick={() =>
                  openWithContext(
                    { type: 'release', id: activeRelease.id, title: activeRelease.title },
                    `Audit readiness blockers for release "${activeRelease.title}" and list what is missing`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-semibold shadow-md shadow-red-950/40 transition-all cursor-pointer"
                title="Consult Creative Brain for this release"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Ask Brain</span>
              </button>
            )}

            <button
              onClick={() => setShowNewReleaseModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Release</span>
            </button>

            {activeRelease && (
              <button
                onClick={handleOpenEditModal}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Edit Release Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Contextual Radar Signals Banner */}
        <ContextualRadarBanner category="release" onNavigateTab={onNavigateTab} />

        {/* No Active Release Warning / Hero Setup */}
        {!activeRelease && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Disc3 className="w-8 h-8 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold text-white">Initialize Your First Release</h2>
              <p className="text-sm text-slate-400 mt-1">
                Artist OS connects your Artwork, Content, DSP Pitch, Pre-Save, Lyrics, Splits, and Launch Roadmap to one central release.
              </p>
            </div>
            <button
              onClick={() => setShowNewReleaseModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Define First Music Release</span>
            </button>
          </div>
        )}

        {/* Active Release Command Banner */}
        {activeRelease && (
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Cover Art Thumbnail & Release Essentials */}
              <div className="lg:col-span-4 flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-lg relative flex items-center justify-center">
                    {activeRelease.coverUrl ? (
                      <img
                        src={activeRelease.coverUrl}
                        alt={activeRelease.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-slate-500">
                        <Disc3 className="w-8 h-8 mb-1 text-slate-600" />
                        <span className="text-[10px] uppercase font-semibold">No Artwork</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onNavigateTab('cover-studio')}
                    className="absolute inset-0 bg-slate-950/80 rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-cyan-400 text-[11px] font-semibold p-1 text-center"
                  >
                    <Edit3 className="w-4 h-4 mb-0.5" />
                    <span>Open Studio</span>
                  </button>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {activeRelease.releaseType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${readiness?.stageColor || 'text-slate-400 bg-slate-800'}`}>
                      {readiness?.stage || 'Planning'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                    {activeRelease.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium truncate">
                    by <span className="text-slate-200">{activeRelease.artistName}</span> • {activeRelease.genre}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeRelease.releaseDate}</span>
                    <span className="font-semibold text-cyan-300 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      {readiness?.formattedDays || 'No date'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real Mathematical Release Readiness Gauge */}
              <div className="lg:col-span-5 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Release Readiness
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {readiness?.completedCount ?? 0} of {readiness?.totalCount ?? 7} Verified
                    </span>
                    <span className="text-base font-black text-cyan-400 font-mono">
                      {readiness?.score ?? 0}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(readiness?.score ?? 0, 4)}%` }}
                  />
                </div>

                {/* Quick Check Icons */}
                <div className="grid grid-cols-7 gap-1 pt-1">
                  {(readiness?.requirements || []).map((req) => (
                    <button
                      key={req.id}
                      onClick={() => onNavigateTab(req.actionTab)}
                      className={`group relative flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
                        req.completed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                      title={`${req.label}: ${req.completed ? 'Ready' : 'Incomplete - Click to complete'}`}
                    >
                      {req.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[9px] font-medium tracking-tight mt-0.5 truncate w-full">
                        {req.category.slice(0, 4)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Action Launchers */}
              <div className="lg:col-span-3 flex flex-col justify-center gap-2">
                {(readiness?.missingItems && readiness.missingItems.length > 0) ? (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Next Priority Action:
                    </span>
                    <button
                      onClick={() => onNavigateTab(readiness.missingItems[0].actionTab)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all shadow-md group"
                    >
                      <span className="truncate">{readiness.missingItems[0].actionLabel}</span>
                      <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 ml-1.5" />
                    </button>
                    <p className="text-[10px] text-slate-400 truncate">
                      {readiness.missingItems[0].reason}
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>100% Launch Ready</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      All assets, metadata, splits & editorial pitches are locked.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        {activeRelease && (
          <div className="border-b border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'command', label: 'Command Center', icon: Sliders },
              { id: 'timeline', label: 'Release Timeline', icon: Calendar, badge: linkedMilestones.length },
              { id: 'content', label: 'Content Pipeline', icon: Flame, badge: linkedContent.length },
              { id: 'checklist', label: 'Promotional Checklist', icon: ListTodo, badge: activeRelease.checklist?.length },
              { id: 'assets', label: 'Release Assets', icon: Layers, badge: linkedAssets.length },
              { id: 'pitch', label: 'DSP Pitch', icon: Radio },
              { id: 'presave', label: 'Pre-Save Hub', icon: Globe },
              { id: 'splits', label: 'Splits & Rights', icon: DollarSign },
              { id: 'lyrics', label: 'Synced Lyrics', icon: Music },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as ArtistOSTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 1: Command Center Overview */}
        {activeRelease && activeSubTab === 'command' && (
          <div className="space-y-6">
            {/* Top Grid: Quick Workstation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Artwork Vault */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Artwork Vault</span>
                    <h4 className="text-sm font-bold text-white">
                      {activeRelease.coverUrl ? '3000px Art Attached' : 'Missing Artwork'}
                    </h4>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Disc3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cover Studio</span>
                  <button
                    onClick={() => onNavigateTab('cover-studio')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <span>Launch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: 30-Day Content Brain */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rollout Brain</span>
                    <h4 className="text-sm font-bold text-white">
                      {linkedContent.length > 0 ? `${linkedContent.length} Posts Scheduled` : 'No Pipeline Yet'}
                    </h4>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Content Brain</span>
                  <button
                    onClick={() => onNavigateTab('artist-brain')}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>Generate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 3: DSP Pitch */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">DSP Editorial</span>
                    <h4 className="text-sm font-bold text-white">
                      {activeRelease.dspPitch ? 'Pitch Blueprint Ready' : 'Unpitched'}
                    </h4>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Radio className="w-4 h-4" />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">DSP Pitcher</span>
                  <button
                    onClick={() => onNavigateTab('dsp-pitcher')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>Draft</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 4: Pre-Save Page */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Smart Link</span>
                    <h4 className="text-sm font-bold text-white">
                      {activeRelease.presaveSlug ? `/${activeRelease.presaveSlug}` : 'Not Deployed'}
                    </h4>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Pre-Save Hub</span>
                  <button
                    onClick={() => onNavigateTab('presave-hub')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>Configure</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Section: Detailed Readiness Breakdown & Metadata Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Requirements Breakdown Matrix */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Release Verification Matrix
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time status of all mandatory deliverables for {activeRelease.title}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {readiness?.completedCount ?? 0} / {readiness?.totalCount ?? 7} OK
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(readiness?.requirements || []).map((req) => (
                    <div
                      key={req.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all ${
                        req.completed
                          ? 'bg-slate-950/40 border-slate-800/60 text-slate-200'
                          : 'bg-amber-500/5 border-amber-500/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          req.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {req.completed ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{req.label}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({req.weight}%)</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{req.description}</p>
                        </div>
                      </div>

                      <div className="mt-2 sm:mt-0 flex items-center gap-2.5 self-end sm:self-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          req.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {req.detail}
                        </span>
                        <button
                          onClick={() => onNavigateTab(req.actionTab)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 transition-colors flex items-center gap-1"
                        >
                          <span>Go to Tool</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 1 Col: Release Metadata & Technical Specs */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-cyan-400" />
                      Metadata & Codes
                    </h3>
                    <button
                      onClick={handleOpenEditModal}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">ISRC Code:</span>
                      <span className="font-mono text-slate-200 bg-slate-950 px-2 py-1 rounded block mt-0.5 border border-slate-800">
                        {activeRelease.isrc || 'Pending assignment'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">UPC / Barcode:</span>
                      <span className="font-mono text-slate-200 bg-slate-950 px-2 py-1 rounded block mt-0.5 border border-slate-800">
                        {activeRelease.upc || 'Pending distributor'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Genre / Sonic Signature:</span>
                      <span className="text-slate-200 block mt-0.5 font-semibold">
                        {activeRelease.genre}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Concept & Story:</span>
                      <p className="text-slate-300 text-[11px] line-clamp-3 mt-0.5 italic">
                        "{activeRelease.narrative || 'Late-night driving energy, blending high-tempo rhythms with magnetic melodies.'}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => onNavigateTab('dsp-pitcher')}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>View Editorial DSP Pitch</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Release Timeline & Milestones */}
        {activeRelease && activeSubTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Release Roadmap Timeline
                </h3>
                <p className="text-xs text-slate-400">
                  Key milestones from pre-save launch to drop day and post-release retention
                </p>
              </div>
              <button
                onClick={() => setShowAddMilestoneModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {/* Interactive Timeline Cards */}
            <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
              {[
                {
                  phase: 'T-21 Days: Master & Deliverables',
                  target: 'Master audio WAV, split sheets, and cover art completed',
                  tab: 'mastering-suite' as ActiveTab,
                  label: 'Mastering Suite',
                  done: Boolean(activeRelease.coverUrl && activeRelease.splits),
                },
                {
                  phase: 'T-14 Days: DSP Editorial Pitch & Pre-Save',
                  target: 'Pitch Spotify for Artists editors & deploy vanity Pre-Save Hub link',
                  tab: 'dsp-pitcher' as ActiveTab,
                  label: 'DSP Pitcher',
                  done: Boolean(activeRelease.dspPitch && activeRelease.presaveSlug),
                },
                {
                  phase: 'T-7 Days: Teaser Campaign Blast',
                  target: 'Distribute audio snippet on TikTok/Reels with acoustic snippet & stems',
                  tab: 'artist-brain' as ActiveTab,
                  label: 'Content Brain',
                  done: linkedContent.length >= 2,
                },
                {
                  phase: `Drop Day (T-0): ${activeRelease.releaseDate}`,
                  target: 'Midnight streaming release, Canvas video live, smart links broadcast',
                  tab: 'presave-hub' as ActiveTab,
                  label: 'Pre-Save Hub',
                  done: activeRelease.status === 'released',
                },
                {
                  phase: 'T+7 Days: Post-Drop Velocity Sprint',
                  target: 'Remix release, acoustic session, DJ club pack, and fan subscriber emails',
                  tab: 'artist-brain' as ActiveTab,
                  label: 'Retention Engine',
                  done: false,
                },
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline bullet */}
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${
                    item.done ? 'bg-emerald-500 border-slate-950' : 'bg-slate-900 border-cyan-500/60'
                  }`} />

                  <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.phase}</span>
                        {item.done && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Achieved
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.target}</p>
                    </div>

                    <button
                      onClick={() => onNavigateTab(item.tab)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 flex items-center gap-1 self-start sm:self-auto shrink-0"
                    >
                      <span>Open {item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Workspace Milestones */}
            {linkedMilestones.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Custom Release Milestones ({linkedMilestones.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {linkedMilestones.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleMilestone(m.id, m.completed)}
                          className={`p-1 rounded-md border ${
                            m.completed
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'border-slate-700 text-transparent hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                        <div>
                          <span className={`text-xs font-semibold block ${m.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                            {m.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.targetDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Content Pipeline */}
        {activeRelease && activeSubTab === 'content' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-cyan-400" />
                  Promo Content Pipeline for "{activeRelease.title}"
                </h3>
                <p className="text-xs text-slate-400">
                  Manage social media reels, teasers, studio memos, and release announcements
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onNavigateTab('artist-brain')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>30-Day Brain Generator</span>
                </button>

                <button
                  onClick={() => setShowAddContentModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Post Item</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 font-medium">Platform:</span>
              {['all', 'tiktok', 'instagram', 'youtube', 'spotify'].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setContentPlatformFilter(plat)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-colors ${
                    contentPlatformFilter === plat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            {/* Content Pipeline Columns (Idea -> Drafted -> Ready -> Published) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['idea', 'drafted', 'ready', 'published'] as ContentStatus[]).map((status) => {
                const itemsInCol = linkedContent.filter(
                  (c) =>
                    c.status === status &&
                    (contentPlatformFilter === 'all' || c.platform === contentPlatformFilter)
                );

                const statusTitles: Record<string, { label: string; color: string }> = {
                  idea: { label: '💡 Ideas & Hooks', color: 'text-amber-400 border-amber-500/30' },
                  draft: { label: '📝 In Production', color: 'text-blue-400 border-blue-500/30' },
                  drafted: { label: '📝 In Production', color: 'text-blue-400 border-blue-500/30' },
                  review: { label: '🔍 In Review', color: 'text-indigo-400 border-indigo-500/30' },
                  approved: { label: '✨ Approved', color: 'text-cyan-400 border-cyan-500/30' },
                  ready: { label: '✅ Ready to Post', color: 'text-emerald-400 border-emerald-500/30' },
                  scheduled: { label: '📅 Scheduled', color: 'text-amber-400 border-amber-500/30' },
                  published: { label: '🚀 Live / Broadcast', color: 'text-purple-400 border-purple-500/30' },
                  archived: { label: '📦 Archived', color: 'text-slate-400 border-slate-500/30' },
                };

                return (
                  <div key={status} className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 flex flex-col min-h-[340px]">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <span className={`text-xs font-bold ${statusTitles[status].color}`}>
                        {statusTitles[status].label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">
                        {itemsInCol.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 flex-1 overflow-y-auto">
                      {itemsInCol.length === 0 ? (
                        <div className="text-center py-8 text-slate-600 text-xs italic">
                          No items in this stage
                        </div>
                      ) : (
                        itemsInCol.map((item) => (
                          <div
                            key={item.id}
                            className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition-colors shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900 text-slate-300">
                                {item.platform}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.scheduledDate}
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-white line-clamp-1">
                              {item.title}
                            </h5>

                            {item.concept && (
                              <p className="text-[11px] text-slate-400 line-clamp-2">
                                {item.concept}
                              </p>
                            )}

                            {item.captionHook && (
                              <div className="text-[10px] text-cyan-300/90 bg-cyan-950/40 p-1.5 rounded border border-cyan-900/40 italic line-clamp-2">
                                "{item.captionHook}"
                              </div>
                            )}

                            {/* Status mover actions */}
                            <div className="pt-1 flex items-center justify-between border-t border-slate-900 text-[10px]">
                              <button
                                onClick={() => deleteContentItem(item.id)}
                                className="text-slate-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>

                              <select
                                value={item.status}
                                onChange={(e) => updateContentItem(item.id, { status: e.target.value as ContentStatus })}
                                className="bg-slate-900 text-slate-300 text-[10px] rounded px-1.5 py-0.5 border border-slate-800 focus:outline-none"
                              >
                                <option value="idea">Idea</option>
                                <option value="drafted">In Prod</option>
                                <option value="ready">Ready</option>
                                <option value="published">Published</option>
                              </select>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Promotional Checklist */}
        {activeRelease && activeSubTab === 'checklist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-cyan-400" />
                  Pre-Release & Launch Checklist
                </h3>
                <p className="text-xs text-slate-400">
                  Granular release checkoff list synchronized with your master release
                </p>
              </div>

              <div className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                {activeRelease.checklist?.filter((c) => c.completed).length || 0} / {activeRelease.checklist?.length || 0} Completed
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
              {(!activeRelease.checklist || activeRelease.checklist.length === 0) ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No checklist items yet.
                </div>
              ) : (
                activeRelease.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-900/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleChecklist(item.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          item.completed
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-700 bg-slate-950 hover:border-slate-500'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div>
                        <span className={`text-xs font-medium block ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.task}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Release Assets & Vault */}
        {activeRelease && activeSubTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Release Asset Vault for "{activeRelease.title}"
                </h3>
                <p className="text-xs text-slate-400">
                  Master WAV files, 3000px artwork, stem folders, social teasers, and legal contracts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('cover-studio')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/25 transition-colors"
                >
                  Open Cover Studio
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {linkedAssets.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                  No assets directly linked to this release yet. Generate cover artwork or export mastering audio to populate.
                </div>
              ) : (
                linkedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                          {asset.category}
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-1 mt-1">
                          {asset.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {asset.dimensions || (asset.size ? `${(asset.size / 1024 / 1024).toFixed(1)} MB` : 'Cloud Vault')}
                      </span>
                    </div>

                    {asset.category === 'cover' && asset.url && (
                      <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                      <span className="text-[10px] text-slate-500">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </span>
                      <a
                        href={asset.url}
                        download={asset.name}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 6: DSP Pitch Quick View */}
        {activeRelease && activeSubTab === 'pitch' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  DSP Editorial Pitch Blueprint
                </h3>
                <p className="text-xs text-slate-400">
                  Spotify for Artists and Apple Music editorial playlist pitch for "{activeRelease.title}"
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('dsp-pitcher')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md"
              >
                Open in Full DSP Pitcher
              </button>
            </div>

            {activeRelease.dspPitch ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pitch Title</span>
                    <span className="text-sm font-bold text-white mt-1 block">
                      {activeRelease.dspPitch.pitchTitle || `${activeRelease.title} by ${activeRelease.artistName}`}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Primary Genre & Tags</span>
                    <span className="text-xs text-cyan-300 font-semibold mt-1 block">
                      {activeRelease.genre} • Alté • Global Fusion
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Editorial Note & Curator Hook:</span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeRelease.dspPitch.editorialNote || activeRelease.dspPitch.dspPitchShort || 'Official editorial pitch letter drafted for curator submission.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-3">
                <p className="text-xs text-slate-400">No DSP pitch letter drafted for this release yet.</p>
                <button
                  onClick={() => onNavigateTab('dsp-pitcher')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Draft Spotify Pitch Letter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Pre-Save Hub Quick View */}
        {activeRelease && activeSubTab === 'presave' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Smart Pre-Save & Direct Fan Capture
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-save URL for Spotify, Apple Music, and Audiomack
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('presave-hub')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md"
              >
                Open Full Pre-Save Hub
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active Smart Link
                </span>
                <h4 className="text-lg font-bold text-white">
                  keedohub.com/{activeRelease.presaveSlug || 'presave'}
                </h4>
                <p className="text-xs text-slate-400">
                  Automatically redirects fans to their preferred DSP when the track goes live on {activeRelease.releaseDate}.
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('presave-hub')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-colors"
              >
                Customize Page & Themes
              </button>
            </div>
          </div>
        )}

        {/* Tab 8: Splits & Rights */}
        {activeRelease && activeSubTab === 'splits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  Splitsheet & Royalty Allocation
                </h3>
                <p className="text-xs text-slate-400">
                  Master and publishing rights distribution between co-writers, producers, and labels
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('splits-calculator')}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Open Splits Calculator
              </button>
            </div>

            {activeRelease.splits?.splitsList && activeRelease.splits.splitsList.length > 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800">
                {activeRelease.splits.splitsList.map((split: any) => (
                  <div key={split.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{split.name}</span>
                      <span className="text-[11px] text-slate-400">{split.role}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span>Master: <strong className="text-cyan-400">{split.masterPercentage}%</strong></span>
                      <span>Pub: <strong className="text-indigo-400">{split.publishingPercentage}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                No split sheet saved yet. Launch Splits Calculator to finalize contract shares.
              </div>
            )}
          </div>
        )}

        {/* Tab 9: Synced Lyrics */}
        {activeRelease && activeSubTab === 'lyrics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-cyan-400" />
                  Synced LRC & Lyric Studio
                </h3>
                <p className="text-xs text-slate-400">
                  Time-stamped lyrics for Spotify, Apple Music & Instagram Stories
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('lyrics-studio')}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Open Lyrics Studio
              </button>
            </div>

            {activeRelease.lyrics?.lines && activeRelease.lyrics.lines.length > 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs max-h-96 overflow-y-auto">
                {activeRelease.lyrics.lines.map((line: any) => (
                  <div key={line.id} className="flex items-center gap-3 p-1.5 hover:bg-slate-950/60 rounded">
                    <span className="text-cyan-400 text-[11px] shrink-0">[{line.timeFormatted}]</span>
                    <span className="text-slate-200">{line.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                No synced lyrics attached to this release yet. Use Lyrics Studio to sync timecodes.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create New Release */}
      {showNewReleaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Disc3 className="w-5 h-5 text-cyan-400" />
                <span>Define New Music Release</span>
              </div>
              <button
                onClick={() => setShowNewReleaseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReleaseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Track / Release Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Lagos, Burn It Down"
                  value={newReleaseTitle}
                  onChange={(e) => setNewReleaseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Artist Name</label>
                  <input
                    type="text"
                    value={newReleaseArtist}
                    onChange={(e) => setNewReleaseArtist(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Release Type</label>
                  <select
                    value={newReleaseType}
                    onChange={(e) => setNewReleaseType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Single">Single (1 Track)</option>
                    <option value="EP">EP (3-6 Tracks)</option>
                    <option value="Album">Album (7+ Tracks)</option>
                    <option value="Mixtape">Mixtape</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Primary Genre</label>
                  <input
                    type="text"
                    placeholder="e.g. Afro-Fusion, Alté, Amapiano"
                    value={newReleaseGenre}
                    onChange={(e) => setNewReleaseGenre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Drop Date</label>
                  <input
                    type="date"
                    required
                    value={newReleaseDate}
                    onChange={(e) => setNewReleaseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Release Story & Vibe Concept</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Late-night driving energy, blending high-tempo drums with introspective lyrics."
                  value={newReleaseStory}
                  onChange={(e) => setNewReleaseStory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewReleaseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRelease}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-500/20"
                >
                  {isSubmittingRelease ? 'Initializing...' : 'Create Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Active Release */}
      {showEditReleaseModal && activeRelease && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-white font-bold text-sm">Edit Release Details</span>
              <button onClick={() => setShowEditReleaseModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveReleaseEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Artist</label>
                  <input
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Genre</label>
                  <input
                    type="text"
                    value={editGenre}
                    onChange={(e) => setEditGenre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Release Date</label>
                  <input
                    type="date"
                    value={editReleaseDate}
                    onChange={(e) => setEditReleaseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ReleaseStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="planning">Planning</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="launching">Launching</option>
                    <option value="released">Released</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">ISRC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. US-RC1-26-00001"
                    value={editIsrc}
                    onChange={(e) => setEditIsrc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">UPC / Barcode</label>
                  <input
                    type="text"
                    placeholder="e.g. 198000012345"
                    value={editUpc}
                    onChange={(e) => setEditUpc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete '${activeRelease.title}'?`)) {
                      await deleteRelease(activeRelease.id);
                      setShowEditReleaseModal(false);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 font-semibold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditReleaseModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Content Item */}
      {showAddContentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-white font-bold text-sm">Add Content Item</span>
              <button onClick={() => setShowAddContentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddContentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Post Title / Concept *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Studio Voice Memo 3 AM"
                  value={newContentTitle}
                  onChange={(e) => setNewContentTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Platform</label>
                  <select
                    value={newContentPlatform}
                    onChange={(e) => setNewContentPlatform(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="spotify">Spotify Canvas</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={newContentDate}
                    onChange={(e) => setNewContentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Caption Hook</label>
                <input
                  type="text"
                  placeholder="e.g. We wrote this melody at 4 AM."
                  value={newContentCaption}
                  onChange={(e) => setNewContentCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContentModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Add Milestone */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-white font-bold text-sm">Add Release Milestone</span>
              <button onClick={() => setShowAddMilestoneModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddMilestoneSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finalize Video Edit with Director"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Date</label>
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
