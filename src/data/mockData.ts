import { LegalContract, IntelArticle, EPKData } from "../types";

export const SAMPLE_CONTRACTS: LegalContract[] = [
  {
    id: "split-sheet",
    title: "Music Songwriter & Producer Split Sheet",
    category: "Music",
    description: "Standard industry document establishing ownership percentages for compositions, publishing, and master rights.",
    templateText: `=====================================================
KEEDOHUB CREATIVE OS — OFFICIAL MUSIC SPLIT SHEET
=====================================================

COMPOSITION TITLE: [TRACK TITLE]
RECORDING ARTIST: [ARTIST NAME]
RECORD DATE: [DATE]
STUDIO LOCATION: [STUDIO NAME & CITY]

CONTRIBUTORS & ROYALTY PERCENTAGES:
-----------------------------------------------------
1. Primary Artist / Songwriter:
   - Full Legal Name: ________________________________
   - Stage Name: ______________________________________
   - Role (Lyrics / Vocals / Melody): ________________
   - PRO Affiliation (BMI / ASCAP / PRS): ____________
   - IPI / CAE Number: _______________________________
   - Songwriting Share (%): [ e.g. 50% ]
   - Master Recording Share (%): [ e.g. 50% ]
   - Signature: __________________ Date: ______________

2. Music Producer:
   - Full Legal Name: ________________________________
   - Producer Pseudonym: _____________________________
   - Role (Beat Production / Mixing / Arrangement): __
   - PRO Affiliation: ________________________________
   - IPI / CAE Number: _______________________________
   - Songwriting Share (%): [ e.g. 50% ]
   - Master Recording Share (%): [ e.g. 50% ]
   - Signature: __________________ Date: ______________

TERMS & GOVERNING LAW:
1. Each party warrants that their respective contribution is 100% original and does not infringe upon any third-party copyright.
2. Master release rights are authorized for worldwide distribution on all digital DSPs.
3. This agreement shall be governed under the laws of Lagos State, Nigeria / Federal Republic of Nigeria.
=====================================================`,
  },
  {
    id: "producer-agreement",
    title: "Exclusive Beat & Production License Agreement",
    category: "Music",
    description: "Exclusive transfer of instrumental beat rights from music producer to recording artist, with royalty terms.",
    templateText: `=====================================================
EXCLUSIVE MUSIC PRODUCTION & MASTER LICENSE AGREEMENT
=====================================================

DATE OF AGREEMENT: [DATE]
PRODUCER ("Licensor"): [PRODUCER LEGAL NAME]
ARTIST ("Licensee"): [ARTIST LEGAL NAME]
BEAT / INSTRUMENTAL TITLE: [BEAT NAME] (BPM: [XX], Key: [XX])

1. GRANT OF RIGHTS:
Licensor hereby grants Licensee the EXCLUSIVE, irrevocable worldwide rights to record vocals over the master instrumental composition and distribute commercial recordings across all physical and digital media (Spotify, Apple Music, YouTube, Radio, TV sync).

2. CONSIDERATION & ADVANCE:
Licensee agrees to pay Licensor a one-time non-refundable production advance fee of [₦ / $ AMOUNT] upon signature of this agreement.

3. ROYALTIES & PUBLISHING:
- Publishing Share: Producer retains 50% of the musical composition copyright.
- Master Royalties: Producer receives [15% - 25%] of gross master royalties collected via distribution services.
- Producer Tag & Credit: Artist shall credit "Prod. by [PRODUCER NAME]" on all metadata, artwork, and streaming platforms.

4. SAMPLES CLEARANCE:
Licensor warrants that all stems, loops, and instruments used are either 100% original or legally licensed for commercial resale.

AGREED & ACCEPTED:
Artist Signature: _____________________ Date: ____________
Producer Signature: ___________________ Date: ____________
=====================================================`,
  },
  {
    id: "work-for-hire",
    title: "Creative Work-for-Hire & Design Agreement",
    category: "Design",
    description: "Full commercial ownership transfer for cover artworks, brand identities, websites, and visual animations.",
    templateText: `=====================================================
KEEDOHUB CREATIVE WORK-FOR-HIRE & IP ASSIGNMENT
=====================================================

PROJECT: [PROJECT NAME, e.g. Album Artwork & Brand Suite]
CLIENT: [CLIENT OR COMPANY NAME]
CREATIVE STUDIO: Keedohub Creative Studio

1. ASSIGNMENT OF INTELLECTUAL PROPERTY:
Upon receipt of full final payment, the Studio irrevocably assigns, transfers, and conveys to the Client all worldwide right, title, and interest, including all copyrights and trademarks, in the final approved deliverables.

2. 100% COMMERCIAL RIGHTS:
The Client possesses the unrestricted commercial right to reproduce, print, manufacture, advertise, and sell merchandise incorporating the finalized designs globally.

3. PORTFOLIO DISPLAY RIGHT:
The Studio retains the customary non-exclusive right to showcase the finalized designs strictly in its portfolio, case studies, and creative archives.

4. REVISIONS & DELIVERY:
Project deliverables include high-resolution print-ready files (3000x3000px 300DPI TIFF/PNG, vector SVG/PDF) delivered within the agreed milestone timeline.
=====================================================`,
  },
  {
    id: "creator-sponsorship",
    title: "Brand Sponsorship & Influencer Promo Contract",
    category: "Creator",
    description: "Legally sound agreement for sponsored Reels, TikTok videos, YouTube integrations, and brand endorsements.",
    templateText: `=====================================================
SPONSORED CONTENT & BRAND AMBASSADOR AGREEMENT
=====================================================

SPONSOR ("Brand"): [BRAND / COMPANY NAME]
CREATOR ("Influencer"): [CREATOR STAGE / REAL NAME]
CAMPAIGN TITLE: [CAMPAIGN NAME]

1. DELIVERABLES & POSTING SCHEDULE:
- 1x Dedicated TikTok / Instagram Reel (60-90s)
- 2x Instagram Stories with Swipe-Up / Trackable Promo Link
- Delivery Draft Deadline: [DATE]
- Live Public Posting Date: [DATE]

2. COMPENSATION & PAYMENT TERMS:
- Total Compensation: [AMOUNT]
- Payment Schedule: 50% upfront before production; 50% within 48 hours of live link verification.

3. USAGE RIGHTS & EXCLUSIVITY:
- Organic Creator Channels: Indefinite archival.
- Paid Ad Whitelisting (Spark Ads / Dark Ads): 30 days included.
- Category Exclusivity: Creator agrees not to promote direct competing brands for 14 days following post date.

4. DISCLOSURE & FTC / AD COMPLIANCE:
Creator will prominently include #ad or #sponsored in the first line of the caption and tag the official Brand account.
=====================================================`,
  },
];

export const INTEL_ARTICLES: IntelArticle[] = [
  {
    id: "music-rollout-blueprint",
    title: "The 30-Day Music Release Playbook: From Studio Bounce to 1M Streams",
    category: "Music Marketing",
    readTime: "6 min read",
    date: "Aug 2026",
    author: "Ojo Abdulkareem (Keedohub)",
    summary: "Why 85% of indie songs die on launch day and the precise 3-phase visual cadence required to force algorithmic momentum on Spotify, Apple Music & TikTok.",
    tags: ["Music Rollout", "DSP Pitching", "TikTok Virality", "EPK"],
    content: [
      "Most independent artists make a catastrophic error: they pour 95% of their budget and emotional energy into recording and mixing, leaving $0 and zero planned content assets for the promotional push.",
      "In the modern attention economy, the music is only 50% of the product. The visual universe, the lore, the short-form soundbites, and the pre-release tension building are what actually trigger Spotify's Discover Weekly and TikTok's FYP algorithms.",
      "Phase 1 starts at T-14 Days: Never announce your release with a static cover. Seed raw voice memos, capture producer reactions, and build a 15-second signature audio hook that answers a human emotion.",
      "Phase 2 on Drop Day: Secure minimum 200 user saves in the first 6 hours to trigger Spotify's Velocity algorithm. Pair the drop with high-contrast motion visualizers and multi-tier SmartLinks.",
      "Phase 3 Post-Drop (Days 4-30): This is where records actually break. Double down on acoustic live mic versions, remix packs for DJs, and reaction-based community content."
    ]
  },
  {
    id: "album-cover-architecture",
    title: "Cover Art Psychology: How 3000x3000px Visuals Dictate Streaming Clicks",
    category: "Design Science",
    readTime: "5 min read",
    date: "Aug 2026",
    author: "Keedohub Creative Lab",
    summary: "Analyzing the optical science of thumbnail scaling on mobile lockscreens, color contrast triggers, and why typography placement defines genre credibility.",
    tags: ["Album Art", "Typography", "Color Theory", "Visual Identity"],
    content: [
      "When a listener scrolls Spotify on a 6-inch phone screen, your cover art is rendered at barely 48x48 pixels. If your design relies on tiny intricate details with low contrast, it becomes visual mud.",
      "Rule 1: The Squint Test. If you squint your eyes from 3 feet away, the primary silhouette, color contrast, and focal point must remain instantly legible.",
      "Rule 2: Genre Signaling. Afro-futuristic palettes lean into deep obsidian and high-voltage crimson or warm amber; alté and streetwear records demand brutalist typography and film grain textures.",
      "Rule 3: 3D Dimension & Physical Nostalgia. Adding subtle vinyl ring wear, holographic sheen, or CD jewel case refraction gives digital streaming assets a tangible, collectible prestige."
    ]
  },
  {
    id: "brand-os-for-startups",
    title: "Building a Brand Operating System: Why Startups Need More Than a Logo",
    category: "Brand Strategy",
    readTime: "7 min read",
    date: "Aug 2026",
    author: "Keedohub Brand Lab",
    summary: "How modern high-growth companies build modular, systematic design systems that scale across landing pages, pitch decks, and ad engines.",
    tags: ["Brand OS", "Startups", "Design Systems", "Conversion"],
    content: [
      "A logo is not a brand. A brand is an emotional promise codified into a repeatable visual, linguistic, and structural operating system.",
      "Top venture-backed startups and cultural leaders maintain strict Design Tokens: mathematical spacing scales (8pt grid), high-contrast neutral backgrounds (≤12% brightness differences), and a distinctive display-to-body font pairing.",
      "When your visual language is cohesive across pitch decks, website micro-interactions, and social launch kits, your perceived valuation immediately triples in the eyes of investors and discerning clients."
    ]
  },
  {
    id: "creator-hook-psychology",
    title: "The 3-Second Retention Formula: 30 Viral Hooks for Reels & TikTok",
    category: "Creator Growth",
    readTime: "4 min read",
    date: "Aug 2026",
    author: "Keedohub Growth Team",
    summary: "Data-backed opening hooks, audio transitions, and frame-rate switches that prevent user scrolling and double watch time.",
    tags: ["Hooks", "TikTok", "Shorts", "Algorithm"],
    content: [
      "The first 1.5 seconds of a short-form video determine 90% of its distribution trajectory. If a user swipes away before second 3, the algorithm halts impressions immediately.",
      "Banned clichés: Never start with 'Hey guys, so today...' or 'In this video I will...'. Jump directly into the tension, contradiction, or undeniable auditory payoff.",
      "Use Visual Disruption: A sudden camera zoom, on-screen dynamic captions in JetBrains Mono or Space Grotesk, or showing the finished outcome in the first 0.5 seconds."
    ]
  }
];

export const INITIAL_EPK_DATA: EPKData = {
  artistName: "ZACK KHALIFA",
  genre: "Afro-Fusion / Alté Trap",
  hometown: "Lagos, Nigeria",
  tagline: "Bridging West African Rhythmic Heritage with Global Stadium Energy.",
  bioShort: "Zack Khalifa is a pioneering Nigerian recording artist blending infectious log drums, soaring vocal harmonies, and futuristic sonic architecture. With over 2.4M catalog streams, his records dominate radio and curated tastemaker playlists worldwide.",
  bioFull: "Born in the electric streets of Lagos, Zack Khalifa has swiftly emerged as one of the most distinctive voices in contemporary African music. Fusing traditional rhythmic cadences with cutting-edge global production, his sonic signature transcends geographical boundaries.\n\nHis breakout project 'Neon Empire' received critical acclaim from Pulse, Native Mag, and BBC 1Xtra. Under the visual direction of Keedohub Creative OS, Zack commands a 360-degree brand universe spanning sold-out live showcases, viral visualizer rollouts, and multi-territory digital campaigns.",
  monthlyListeners: "148,200",
  totalStreams: "3.2M+",
  instagramFollowers: "84.5K",
  tiktokFollowers: "120K",
  keyTracks: [
    { title: "Midnight in Victoria Island", duration: "2:48", streams: "1.2M", dsp: "Spotify / Apple" },
    { title: "Red Velvet & Log Drums", duration: "3:12", streams: "850K", dsp: "Spotify / Audiomack" },
    { title: "Solar Waves (feat. Luna)", duration: "2:35", streams: "620K", dsp: "All DSPs" }
  ],
  pressQuotes: [
    { quote: "Zack Khalifa has cracked the code of authentic African sound tailored for global arenas.", source: "The Native Mag" },
    { quote: "A masterclass in modern rollouts, sonic worldbuilding, and vocal charisma.", source: "AfroVibes Global" }
  ],
  bookingEmail: "bookings@keedohub.com.ng",
  management: "Keedohub Talent & Management Division (+234-810-446-5924)"
};

export const VIRAL_HOOKS_BANK = [
  { id: "h1", category: "Curiosity & Shock", hook: "Everyone thinks you need [X] to succeed, but here is what actually happened...", tag: "High CTR" },
  { id: "h2", category: "Music Drop", hook: "When your producer tells you to stop recording at 2 AM, but the chorus was just too crazy:", tag: "Music Viral" },
  { id: "h3", category: "Behind The Craft", hook: "Here's the exact reason why 90% of brands fail before day 30 (and the 1 fix):", tag: "Authority" },
  { id: "h4", category: "POV Emotion", hook: "POV: You finally found the song that matches your late-night drive energy 🌃", tag: "Relatable" },
  { id: "h5", category: "Unpopular Truth", hook: "Stop designing logos like this in 2026. It immediately makes you look amateur:", tag: "Educational" },
  { id: "h6", category: "Transformation", hook: "Watch what happens when we completely redesign this artist's entire release in 48 hours:", tag: "Case Study" },
  { id: "h7", category: "Challenge", hook: "If you can listen to this 15-second drop without nodding your head, you win $100:", tag: "Gamified" },
  { id: "h8", category: "Founder / Artist Story", hook: "3 years ago I was making beats in my mom's kitchen. Yesterday we just shipped this:", tag: "Inspirational" }
];

// ==========================================
// 1. PRESET LYRIC PROJECTS
// ==========================================
export const PRESET_LYRICS_PROJECTS = [
  {
    id: "victoria",
    title: "Midnight in Victoria Island",
    artist: "ZACK KHALIFA",
    bpm: 112,
    genre: "Afro-Fusion / Amapiano",
    theme: "cyber-crimson" as const,
    fontStyle: "space-grotesk" as const,
    showWaveform: true,
    glowIntensity: "vibrant" as const,
    lines: [
      { id: "l1", timeMs: 2500, timeFormatted: "00:02.50", text: "Cruising down Ahmadu Bello in the midnight rain", section: "intro" as const },
      { id: "l2", timeMs: 6200, timeFormatted: "00:06.20", text: "Log drum rolling, taking away my pain", section: "verse" as const },
      { id: "l3", timeMs: 9800, timeFormatted: "00:09.80", text: "Girl I see you shining through the tinted glass", section: "verse" as const },
      { id: "l4", timeMs: 13400, timeFormatted: "00:13.40", text: "They said our momentum wouldn't last", section: "verse" as const },
      { id: "l5", timeMs: 17100, timeFormatted: "00:17.10", text: "Tell me what you want, tell me what you need", section: "pre-chorus" as const },
      { id: "l6", timeMs: 20500, timeFormatted: "00:20.50", text: "We planting seeds in this Lagos concrete", section: "pre-chorus" as const },
      { id: "l7", timeMs: 24200, timeFormatted: "00:24.20", text: "Midnight in Victoria, we own the sound!", section: "chorus" as const },
      { id: "l8", timeMs: 28000, timeFormatted: "00:28.00", text: "Hands in the air when the rhythm hits the ground", section: "chorus" as const },
      { id: "l9", timeMs: 31800, timeFormatted: "00:31.80", text: "Keedohub master, crank it to the sky", section: "hook" as const },
      { id: "l10", timeMs: 35500, timeFormatted: "00:35.50", text: "Born to elevate, we were made to fly", section: "outro" as const }
    ]
  },
  {
    id: "night-shift",
    title: "Lagos Night Shift",
    artist: "KEEDO x DRILL LABS",
    bpm: 140,
    genre: "Alté Drill / Trap",
    theme: "neon-midnight" as const,
    fontStyle: "bold-impact" as const,
    showWaveform: true,
    glowIntensity: "hyper" as const,
    lines: [
      { id: "l1", timeMs: 1500, timeFormatted: "00:01.50", text: "Studio red lights glowing till 5 AM", section: "intro" as const },
      { id: "l2", timeMs: 4800, timeFormatted: "00:04.80", text: "Turning every single setback to a gem", section: "verse" as const },
      { id: "l3", timeMs: 8200, timeFormatted: "00:08.20", text: "Sub-bass knocking on the speaker cones", section: "verse" as const },
      { id: "l4", timeMs: 11600, timeFormatted: "00:11.60", text: "Building empires from our mobile phones", section: "verse" as const },
      { id: "l5", timeMs: 15200, timeFormatted: "00:15.20", text: "They sleep while we engineer the frequency", section: "chorus" as const },
      { id: "l6", timeMs: 18900, timeFormatted: "00:18.90", text: "Pure precision, unmatched loyalty", section: "chorus" as const }
    ]
  },
  {
    id: "silk-amber",
    title: "Silk & Amber",
    artist: "MAYA SOUL",
    bpm: 94,
    genre: "Afro-R&B / Neo-Soul",
    theme: "golden-afro" as const,
    fontStyle: "cinematic-serif" as const,
    showWaveform: true,
    glowIntensity: "subtle" as const,
    lines: [
      { id: "l1", timeMs: 2000, timeFormatted: "00:02.00", text: "Golden hour reflections on your skin", section: "intro" as const },
      { id: "l2", timeMs: 5800, timeFormatted: "00:05.80", text: "Where did this harmony even begin?", section: "verse" as const },
      { id: "l3", timeMs: 9600, timeFormatted: "00:09.60", text: "Sweet saxophone melodies in the breeze", section: "verse" as const },
      { id: "l4", timeMs: 13500, timeFormatted: "00:13.50", text: "Putting every racing anxiety at ease", section: "chorus" as const },
      { id: "l5", timeMs: 17400, timeFormatted: "00:17.40", text: "Silk and amber, timeless and profound", section: "chorus" as const }
    ]
  }
];

// ==========================================
// 2. PLAYLIST TARGETS DIRECTORY
// ==========================================
export const PRESET_PLAYLIST_TARGETS = [
  {
    id: "p1",
    name: "African Heat",
    dsp: "Spotify" as const,
    followerCount: "1.4M+ Followers",
    vibe: "High Energy, Club, Mainstream Afrobeats & Amapiano",
    idealTrackArchetype: "Log drums, infectious vocal hooks, upbeat tempo (110-120 BPM), high replay value.",
    curatorTip: "Highlight high TikTok dance engagement or DJ club support in your first 20 words."
  },
  {
    id: "p2",
    name: "Afro Pop Hits",
    dsp: "Apple Music" as const,
    followerCount: "Global Editorial",
    vibe: "Radio-Ready Melodic Afro-Fusion & R&B",
    idealTrackArchetype: "Pristine vocal mixes, memorable melodic choruses, cross-diaspora appeal.",
    curatorTip: "Emphasize radio spin records, live performance credentials, or prominent co-producers."
  },
  {
    id: "p3",
    name: "RapCaviar",
    dsp: "Spotify" as const,
    followerCount: "15.8M+ Followers",
    vibe: "Heavy Bass, Hard-Hitting Hip-Hop & Trap",
    idealTrackArchetype: "Heavy 808s, dynamic flow switches, sharp punchlines, dark or anthemic tone.",
    curatorTip: "State verified first 24h streaming spikes or prominent playlist additions in other territories."
  },
  {
    id: "p4",
    name: "Naija 100",
    dsp: "Audiomack" as const,
    followerCount: "Top Trending",
    vibe: "Street Anthems, High-Street Vibe & Afro-Street",
    idealTrackArchetype: "Relatable street lyrics, raw energy, trending local dance grooves.",
    curatorTip: "Focus on WhatsApp broadcast virality and local radio momentum in Lagos and Abuja."
  },
  {
    id: "p5",
    name: "Chilled R&B / Alté Cruise",
    dsp: "Spotify" as const,
    followerCount: "680K+ Followers",
    vibe: "Late Night Drive, Smooth Vocals, Neo-Soul",
    idealTrackArchetype: "Lush electric pianos, laidback drum grooves, introspective lyrics.",
    curatorTip: "Pitch with mood tags: 'Late Night Drive', 'Intimate', 'Chilled Study'."
  },
  {
    id: "p6",
    name: "Afro Rising",
    dsp: "Spotify" as const,
    followerCount: "450K+ Followers",
    vibe: "Breakout Independent African Artists",
    idealTrackArchetype: "Unique vocal identity, experimental sonic fusion, strong artistic story.",
    curatorTip: "Curators prioritize unique cultural backstory and independent DIY hustle."
  }
];

// ==========================================
// 3. DSP STREAMING RATES (GLOBAL DATA)
// ==========================================
export const DSP_STREAM_RATES = [
  { id: "apple", name: "Apple Music", ratePerStream: 0.0080, formatPayout: "$8,000 / 1M Streams", color: "#FC3C44", badge: "Highest Major DSP" },
  { id: "tidal", name: "Tidal Hi-Fi", ratePerStream: 0.0125, formatPayout: "$12,500 / 1M Streams", color: "#00FFFF", badge: "Audiophile Tier" },
  { id: "spotify", name: "Spotify", ratePerStream: 0.0038, formatPayout: "$3,800 / 1M Streams", color: "#1DB954", badge: "Global Volume Leader" },
  { id: "amazon", name: "Amazon Music", ratePerStream: 0.0040, formatPayout: "$4,000 / 1M Streams", color: "#FF9900", badge: "Prime Ecosystem" },
  { id: "audiomack", name: "Audiomack", ratePerStream: 0.0022, formatPayout: "$2,200 / 1M Streams", color: "#FFA200", badge: "Africa & Emerging" },
  { id: "youtube", name: "YouTube Music", ratePerStream: 0.0020, formatPayout: "$2,000 / 1M Streams", color: "#FF0000", badge: "Video & Shorts Synergy" },
  { id: "boomplay", name: "Boomplay", ratePerStream: 0.0016, formatPayout: "$1,600 / 1M Streams", color: "#00E5FF", badge: "African Powerhouse" }
];

// ==========================================
// 4. PRESET COLLABORATOR SPLIT TEMPLATES
// ==========================================
export const PRESET_SPLIT_TEMPLATES = [
  {
    name: "50/50 Standard (Artist & Producer)",
    collaborators: [
      { id: "c1", name: "Zack Khalifa", role: "Primary Artist" as const, masterPercentage: 50, publishingPercentage: 50, ipiNumber: "009847123", proAffiliation: "BMI" as const, payoutWallet: "0x89...4A" },
      { id: "c2", name: "Keedo Beatmaker", role: "Music Producer" as const, masterPercentage: 50, publishingPercentage: 50, ipiNumber: "004819445", proAffiliation: "PRS" as const, payoutWallet: "0x71...2B" }
    ]
  },
  {
    name: "Band / 3-Way Feature Collaboration",
    collaborators: [
      { id: "c1", name: "Zack Khalifa", role: "Primary Artist" as const, masterPercentage: 40, publishingPercentage: 35, ipiNumber: "009847123", proAffiliation: "BMI" as const, payoutWallet: "0x89...4A" },
      { id: "c2", name: "Maya Soul", role: "Featured Artist" as const, masterPercentage: 25, publishingPercentage: 25, ipiNumber: "007812933", proAffiliation: "ASCAP" as const, payoutWallet: "0x33...9F" },
      { id: "c3", name: "Keedo Producer", role: "Music Producer" as const, masterPercentage: 30, publishingPercentage: 35, ipiNumber: "004819445", proAffiliation: "PRS" as const, payoutWallet: "0x71...2B" },
      { id: "c4", name: "Apex Mix & Master", role: "Mixing / Mastering" as const, masterPercentage: 5, publishingPercentage: 5, ipiNumber: "001294821", proAffiliation: "SAMRO" as const, payoutWallet: "0x55...1C" }
    ]
  }
];

// ==========================================
// 5. PRESET MASTERING AUDIO STEMS
// ==========================================
export const PRESET_AUDIO_STEMS = [
  {
    id: "stem-afro",
    name: "Victoria (Afrobeats Master 320kbps)",
    genre: "Afrobeats",
    bpm: 112,
    defaultLufs: -13.8,
    defaultTruePeak: -0.6,
    defaultDr: 9,
    stereoWidth: 105,
    spectrum: [78, 85, 70, 62, 58, 45, 30] // Sub, Bass, LowMid, Mid, HighMid, Pres, Air
  },
  {
    id: "stem-trap",
    name: "Night Shift (Lagos Drill Master)",
    genre: "Drill / Trap",
    bpm: 140,
    defaultLufs: -9.4,
    defaultTruePeak: 0.2, // Over clipping threshold
    defaultDr: 6,
    stereoWidth: 118,
    spectrum: [95, 90, 55, 60, 72, 65, 40]
  },
  {
    id: "stem-acoustic",
    name: "Silk & Amber (Acoustic Neo-Soul)",
    genre: "R&B / Soul",
    bpm: 94,
    defaultLufs: -16.2,
    defaultTruePeak: -1.8,
    defaultDr: 13,
    stereoWidth: 98,
    spectrum: [40, 60, 75, 80, 65, 50, 38]
  }
];

