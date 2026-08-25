export type ActiveTab = 
  | 'overview'
  | 'artist-brain'
  | 'cover-studio'
  | 'lyrics-studio'
  | 'dsp-pitcher'
  | 'mastering-suite'
  | 'splits-calculator'
  | 'presave-hub'
  | 'brand-os'
  | 'creator-os'
  | 'epk-builder'
  | 'project-console'
  | 'resource-vault'
  | 'intel-hub';

export type ColorTheme = 'keedohub-red' | 'flame-gold' | 'neon-emerald' | 'royal-amethyst';
export type ThemeMode = 'dark' | 'light';

export interface ThemeOption {
  id: ColorTheme;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
}

export interface RolloutDayAction {
  day: string;
  platform: string;
  contentType: string;
  concept: string;
  captionHook: string;
  timeToPost?: string;
  algorithmTip?: string;
  soundSnippet?: string;
  hashtags?: string[];
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface RolloutPhase {
  phaseName: string;
  focus: string;
  timeframe: string;
  actions: RolloutDayAction[];
}

export interface RolloutPlan {
  tagline: string;
  diasporaAngle: string;
  phases: RolloutPhase[];
  dspPitch: {
    pitchTitle: string;
    genreTags: string[];
    moodTags: string[];
    instruments: string[];
    editorialNote: string;
    targetPlaylists?: string[];
    curatorAngle?: string;
  };
  pressReleaseExcerpt: string;
  contentHooks: string[];
  hashtags?: string[];
  algorithmStrategy?: {
    soundBiteRule: string;
    retentionMetric: string;
    postingCadence: string;
    smartLinkTactic: string;
  };
  releaseChecklist?: {
    id: string;
    task: string;
    category: 'METADATA' | 'CREATIVE' | 'EDITORIAL' | 'PROMO';
    deadline: string;
    completed: boolean;
  }[];
}

export interface CoverStudioState {
  title: string;
  artist: string;
  subtitle: string;
  genreTag: string;
  themePreset: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  showParentalAdvisory: boolean;
  parentalAdvisoryStyle: 'white' | 'black' | 'minimal' | 'red';
  showStreamingBadges: boolean;
  showBarcode: boolean;
  showAudioWave: boolean;
  textureOverlay: 'none' | 'vinyl-dust' | 'plastic-wrap' | 'grain' | 'grid';
  previewMode: 'canvas' | 'vinyl' | 'cd-jewel' | 'billboard' | 'phone';
}

export interface BrandColor {
  name: string;
  hex: string;
  role: string;
}

export interface BrandStrategy {
  brandTagline: string;
  brandArchetype: string;
  voiceAndTone: {
    traits: string[];
    doSay: string[];
    dontSay: string[];
  };
  colorPalette: BrandColor[];
  typographyPairing: {
    heading: string;
    body: string;
    monospace: string;
  };
  marketPositioningStatement: string;
  launchSprint: {
    day: string;
    task: string;
  }[];
}

export interface EPKData {
  artistName: string;
  genre: string;
  hometown: string;
  tagline: string;
  bioShort: string;
  bioFull: string;
  monthlyListeners: string;
  totalStreams: string;
  instagramFollowers: string;
  tiktokFollowers: string;
  keyTracks: { title: string; duration: string; streams: string; dsp: string }[];
  pressQuotes: { quote: string; source: string }[];
  bookingEmail: string;
  management: string;
}

export interface LegalContract {
  id: string;
  title: string;
  category: 'Music' | 'Design' | 'Business' | 'Creator';
  description: string;
  templateText: string;
}

export interface IntelArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  summary: string;
  tags: string[];
  content: string[];
}

// 1. Lyric Studio Types
export interface LyricLine {
  id: string;
  timeMs: number; // e.g. 14500 (14.5s)
  timeFormatted: string; // "00:14.50"
  text: string;
  section?: 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'hook' | 'bridge' | 'outro';
}

export interface LyricProject {
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  lines: LyricLine[];
  theme: 'cyber-crimson' | 'golden-afro' | 'neon-midnight' | 'minimal-noir' | 'cassette-lofi' | 'acid-green';
  fontStyle: 'space-grotesk' | 'cinematic-serif' | 'mono-terminal' | 'bold-impact';
  showWaveform: boolean;
  glowIntensity: 'subtle' | 'vibrant' | 'hyper';
}

// 2. DSP Pitcher Types
export interface DSPPitchData {
  trackTitle: string;
  artistName: string;
  featuredArtists: string;
  releaseDate: string;
  primaryGenre: string;
  subGenres: string[];
  moods: string[];
  instruments: string[];
  language: string;
  isExplicit: boolean;
  recordingLocation: string;
  culturalStory: string;
  marketingBudgetUSD: number;
  preSaveCount: number;
  dspPitchShort: string;
  pressPitchFull: string;
  curatorDMEmail: string;
  pitchScore: number;
}

export interface PlaylistTarget {
  id: string;
  name: string;
  dsp: 'Spotify' | 'Apple Music' | 'Audiomack' | 'Boomplay';
  followerCount: string;
  vibe: string;
  idealTrackArchetype: string;
  curatorTip: string;
}

// 3. Audio Mastering & Loudness Types
export interface MasteringReport {
  integratedLufs: number; // e.g. -14.2
  truePeakDbfs: number; // e.g. -0.8
  dynamicRangeDr: number; // e.g. 9
  stereoWidthPct: number; // e.g. 110%
  lowEndMonoCheck: 'PASS' | 'WARNING' | 'FAIL';
  clippingAlert: boolean;
  dspCompatibility: {
    spotify: 'OPTIMAL' | 'TOO_LOUD' | 'TOO_QUIET';
    appleMusic: 'OPTIMAL' | 'TOO_LOUD' | 'TOO_QUIET';
    youtube: 'OPTIMAL' | 'TOO_LOUD' | 'TOO_QUIET';
    clubDJ: 'OPTIMAL' | 'TOO_LOUD' | 'TOO_QUIET';
  };
  recommendations: string[];
}

// 4. Splits & Royalty Calculator Types
export interface CollaboratorSplit {
  id: string;
  name: string;
  role: 'Primary Artist' | 'Music Producer' | 'Featured Artist' | 'Songwriter / Topliner' | 'Mixing / Mastering' | 'Executive Producer';
  masterPercentage: number;
  publishingPercentage: number;
  ipiNumber: string;
  proAffiliation: 'BMI' | 'ASCAP' | 'PRS' | 'SAMRO' | 'MCSN' | 'SOCAN' | 'Other';
  payoutWallet: string;
}

// 5. Smart Link & Pre-Save Hub Types
export interface PresavePageData {
  title: string;
  artist: string;
  releaseDate: string;
  coverArtUrl: string;
  bioSnippet: string;
  audioPreviewUrl?: string;
  vanitySlug: string;
  themeStyle: 'dark-crimson' | 'emerald-glow' | 'sunset-gold' | 'glass-minimal';
  dspLinks: {
    spotify: string;
    appleMusic: string;
    audiomack: string;
    youtubeMusic: string;
    boomplay: string;
    deezer: string;
    tidal: string;
    soundcloud: string;
  };
}

export interface FanLead {
  id: string;
  email: string;
  phone: string;
  country: string;
  subscribedAt: string;
}

