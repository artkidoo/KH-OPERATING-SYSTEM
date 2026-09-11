# KEEDOHUB — Creative Workspace & Agency Platform
> **System Architect: Ojo Abdulkareem — Keedohub Studio (Lagos, Nigeria)**  
> *The creative headquarters where customers manage, create, request, approve, store, share and reuse all their creative work.*

---

## 🏛️ 00 — The Core Thesis: Your Creative Headquarters, Powered by KeedoHub

**KeedoHub is a creative agency platform where customer workspaces connect to internal production capabilities.**

Customers see a simple workspace.

KeedoHub internally operates a powerful production system.

```
KEEDOHUB — Creative Workspace & Agency Platform
│
├── Artist Workspace
│   ├── Projects
│   ├── Creative Library
│   ├── Release Builder
│   ├── Cover Studio
│   ├── Lyrics Studio
│   ├── EPK Builder
│   └── Music Tools
│
├── Brand Workspace
│   ├── Projects
│   ├── Creative Library
│   ├── Brand Identity
│   ├── Business Documents
│   ├── Content Engine
│   └── Document Templates
│
├── Creative Requests
│   ├── Submit Requests
│   ├── Track Progress
│   └── Request Revisions
│
├── Creative Memory
│   ├── Identity & Visual Style
│   ├── Approved Assets
│   ├── Favorites
│   └── Project History
│
├── Membership
│   ├── Artist Free / Pro
│   ├── Brand Free / Pro
│   └── Entitlements
│
└── Admin Production Center (Admin Only)
    ├── Request Queue
    ├── Studio Routing
    ├── Production Workflow
    ├── Quality Control
    ├── Revisions
    └── Deliveries
```

---

## 🧭 01 — KeedoHub Architecture

KeedoHub is organized into customer-facing workspaces and an internal production system:

| Component | Status | Description |
|---|---|---|
| **Artist Workspace** | ✅ Active | Music artist tools: Release Builder, Cover Studio (3000px), Lyrics Studio, DSP Pitcher, EPK Builder, Mastering Suite, Presave Hub, Content Engine. |
| **Brand Workspace** | ✅ Active | Brand/business tools: Brand OS with color systems, typography hierarchy, Business Documents Studio, Content Engine, product/service management. |
| **Projects** | ✅ Active | Project management with tasks, milestones, budget tracking, and collaboration features. |
| **Creative Library** | ✅ Active | Asset management with folders, categories, search, favorites, and approved asset marking. |
| **Creative Requests** | ✅ Active | Request creation, tracking, revision system with membership-based limits, delivery tracking. |
| **Creative Memory** | ✅ Active | Learns from workspace activity: identity, colors, typography, voice, approved assets, favorites, project history, common requests. |
| **Smart Search** | ✅ Active | Structured search across projects, assets, documents, releases, requests, and favorites with metadata awareness. |
| **Membership** | ✅ Active | Artist Free/Pro, Brand Free/Pro with configurable entitlements. Team/Agency/Label/Enterprise ready. |
| **Admin Production Center** | ✅ Active | Admin-only: Request queue, studio routing (9 studios), production workflow (11 stages), revisions, deliveries, QC. |
| **Usage & Credits** | ✅ Active | Track generation, export, storage, premium tool, and production request usage against plan limits. |
| **Command Palette** | ✅ Active | Global `⌘ K` / `Ctrl K` Quick Search and command launcher. |
| **Multi-Theme Palette** | ✅ Active | 4 curated studio aesthetics + Dark/Light modes. |

---

## 🚀 02 — Workstations & Problem-Solving Capabilities

### 1. 🎵 Music Artist Content Brain & 30-Day Rollout (`ArtistContentBrain.tsx`)
- **Problem**: 85% of music releases lose momentum within 48 hours because artists lack structured promotional calendars and DSP curator assets.
- **Solution**:
  - Automatically synthesizes a 30-day, multi-phase content rollout calendar spanning Instagram, TikTok, YouTube, and X.
  - Generates viral video prompts with exact on-screen hooks and caption copy.
  - Pre-formats 50-word editorial pitch statements for DSP curators.

### 2. 🎨 Cover Studio — 3000 × 3000px 300DPI (`CoverStudio.tsx`)
- **Problem**: Distribution rejections due to non-compliant dimensions, blurred typography, or missing spec sheets.
- **Solution**:
  - Live 1:1 square canvas editor with real-time typography styling and texture overlays (vinyl dust, grain, plastic wrap).
  - 3D Mockup Visualizers: Spinning Vinyl Record, CD Jewel Case, Urban Street Billboard, and Phone Lockscreen player.
  - Instant export of print-ready cover artwork and master technical specification sheets.

### 3. 📝 Live Lyrics Studio & Kinetic Synchronizer (`LyricsStudio.tsx`)
- **Problem**: Substandard lyric videos and lack of timed karaoke data for social snippet rollouts.
- **Solution**:
  - Interactive millisecond-accurate lyric timing editor with section tags (Verse, Chorus, Hook).
  - Kinetic live visualizer themes (Cyber Crimson, Golden Afro, Neon Midnight, Minimal Noir).
  - Instant LRC timestamped format export and JSON project backup.

### 4. 🎯 DSP Editorial Pitcher & Curator Hub (`DSPPitcher.tsx`)
- **Problem**: Independent artists missing the 14-day editorial pitch window for Spotify for Artists and Apple Music.
- **Solution**:
  - Generates algorithmically scored pitch submissions analyzing musical mood, genre tagging, and diaspora narrative.
  - Targeted curator directory for Afrobeat, Amapiano, Hip-Hop, and Alternative playlists across Spotify, Apple, Audiomack, and Boomplay.

### 5. 🎚️ Broadcast Audio Mastering & Loudness Inspector (`MasteringSuite.tsx`)
- **Problem**: Inconsistent loudness levels causing Spotify, Apple Music, and YouTube normalization algorithms to crush song dynamics.
- **Solution**:
  - Real-time client-side Web Audio API analyzer measuring Integrated LUFS, True Peak dBFS, Dynamic Range (DR), and Stereo Width.
  - Platform-specific compatibility verdicts (e.g. Spotify -14 LUFS, Apple Music -16 LUFS, Club DJ -8 LUFS).

### 6. 📜 Producer Split Sheet & Legal Vault (`SplitsCalculator.tsx` & `ResourceVault.tsx`)
- **Problem**: Lost publishing royalties and copyright disputes caused by informal verbal agreements between producers and songwriters.
- **Solution**:
  - Visual 100% Master & Publishing ownership split calculator with IPI, PRO affiliation (BMI, ASCAP, PRS, SAMRO, MCSN), and payout wallet fields.
  - Instant digital contract generation with downloadable signed legal agreements.

### 7. 🔗 Pre-Save Page & Smart Link Hub (`PresaveHub.tsx`)
- **Problem**: Fragmented fan traffic across different streaming services on release day.
- **Solution**:
  - Live preview smart link hub routing fans to Spotify, Apple Music, Audiomack, Boomplay, Deezer, Tidal, and YouTube.
  - Integrated email & phone lead capture for SMS drop announcements.

### 8. 📄 EPK Dossier & Vector PDF Engine (`EPKBuilder.tsx` & `EPKExportModal.tsx`)
- **Problem**: Cluttered, unreadable PDF press kits that get discarded by booking agents and festival curators.
- **Solution**:
  - Comprehensive electronic press kit compiler with verified streaming numbers, discography playback, media acclaim, and contact info.
  - High-resolution, multi-page vector PDF generation with configurable Midnight Onyx and Editorial Ivory themes.

---

## 🎨 03 — Design Tokens & Visual Hierarchy

| Token | Dark Mode (`dark`) | Light Mode (`light`) | Role |
|---|---|---|---|
| **Canvas Background** | `#09090B` (Obsidian) | `#F4F4F5` (Off-white) | Base workspace canvas |
| **Bento Surface** | `#121215` (Card) | `#FFFFFF` (Pure white) | Elevated workstation modules |
| **Bento Border** | `#27272A` | `#E4E4E7` | Precision geometric card dividers |
| **Accent Primary** | `#EF4444` / Theme Hex | `#DC2626` / Theme Hex | Primary actions, status badges, glows |
| **Heading Font** | `Space Grotesk` | `Space Grotesk` | High-impact architectural titles |
| **Body Font** | `Plus Jakarta Sans` | `Plus Jakarta Sans` | Modern readability & clean UI hierarchy |
| **Code / Data Font** | `JetBrains Mono` | `JetBrains Mono` | Technical metadata, pricing, timestamps |

---

## 🛣️ 04 — Blueprint Roadmap to V1 / Production Next Steps

1. **Phase 1: Persistent Workspaces & Cloud Storage** — Integrate Supabase / Firestore for cloud asset persistence in the Creative Vault.
2. **Phase 2: Multi-User Workspace Collaboration** — Role-based access control (Owner, Producer, Manager, Designer) with asset review commenting.
3. **Phase 3: Automated Publishing Webhooks** — Webhook integrations to push approved pre-save links and release notifications directly to social channels.
4. **Phase 4: Internal Studio Command** — Team-facing administration queue for human-in-the-loop creative assignments.

---

## ⚡ 05 — Technology Stack

- **Framework**: React 19 + TypeScript + Vite 6 + Express.js API proxy.
- **Styling & Layout**: Tailwind CSS v4 with dynamic CSS variable theming (`[data-theme]` & `.dark`).
- **Icons & Motion**: Lucide React + Motion (`motion/react`).
- **Audio & Media**: Web Audio API (Analysers, BiquadFilters, GainNodes) + HTML5 Canvas.
- **PDF Compilation**: `jspdf` vector document builder.
- **AI Acceleration**: `@google/genai` Gemini 3.7 server-side integration with deterministic offline algorithmic fallbacks.
