# KEEDOHUB — Creative Production Platform

> **System Architect: Ojo Abdulkareem — Keedohub Studio (Lagos, Nigeria)**  
> *Where artists and brands come to get their creative work done.*

---

## What is KeedoHub?

**KeedoHub is a creative production platform for artists and customers.**

KeedoHub is **not** a campaign-management platform.
KeedoHub is **not** a DIY design-tool platform.
KeedoHub is **not** trying to make every customer become their own designer.

KeedoHub is the **creative partner and production engine**.

### The Core Promise

> You bring your identity, information, ideas and creative needs. KeedoHub creates the professional creative work you need.

### The Platform Combines

```text
Customer Workspace
+
Creative Requests
+
Projects
+
KeedoHub Studio
+
Asset Library
```

---

## Product Architecture

```text
                         KEEDOHUB
                            │
             ┌──────────────┴──────────────┐
             │                             │
         WORKSPACE                       STUDIO
        CUSTOMER SIDE                 PRODUCTION SIDE
             │                             │
       ┌─────┴─────┐                 ┌────┴────┐
       │           │                 │         │
    ARTIST       BRAND            CREATIVE   AUDIO
    EXPERIENCE   EXPERIENCE       PRODUCTION   QA
       │           │
       │           │
   Artist Profile  Brand Profile
   Releases        Creative
   Asset Kits      Brand Kits
   Projects        Documents
   Requests        Presentations
   Library         Projects
                   Requests
                   Library
```

---

## Core Operating Model

The entire product follows:

```text
CUSTOMER
   ↓
PROFILE / CREATIVE DNA
   ↓
CREATIVE REQUEST
   ↓
PROJECT
   ↓
KEEDOHUB STUDIO
   ↓
PRODUCTION
   ↓
REVIEW
   ↓
APPROVAL
   ↓
DELIVERY
   ↓
LIBRARY
```

---

## One Workspace Architecture

KeedoHub has **ONE Workspace** architecture.

```text
                    KEEDOHUB WORKSPACE
                           │
              ┌────────────┴────────────┐
              │                         │
           ARTIST                     BRAND
        EXPERIENCE                  EXPERIENCE
              │                         │
       Artist Profile             Brand Profile
       Releases                   Creative
       Asset Kits                 Brand Kits
       Projects                   Documents
       Requests                   Presentations
       Library                    Projects
                                  Requests
                                  Library
```

Both use the same global WorkspaceShell and design system. The active workspace determines the experience.

**Workspace isolation** exists at: routing, UI, state, API, queries, data access, projects, requests, assets, documents, releases, and library.

---

## Artist Experience

The Artist Workspace exists to help artists get everything they need around their music releases.

**The artist should NOT have to become a designer.** KeedoHub creates the creative work.

### Artist Profile

The source of truth for the artist's identity:

- **Identity**: Artist name, stage name, bio, genre, location, social links
- **Artist DNA**: Story, visual personality, colors, typography, photography direction, mood references

### Artist Releases

The primary release workflow:

```text
Artist → New Release → Release Information → Creative Requests → Asset Kit → Studio Production → Review → Delivery
```

### Artist Asset Kits

Every release can have a complete creative asset kit produced by KeedoHub:

- Cover Artwork
- Animated Cover
- Spotify Canvas
- Lyric Visuals
- Release Announcement
- Social Assets (Instagram, TikTok, YouTube)
- Press One-Sheet / EPK
- Motion Package

### Artist "Good to Go" State

```text
Artist Profile ✓
Artist Identity ✓
Release Created ✓
Cover Requested ✓
Release Asset Kit ✓
Motion ✓
Lyrics Visuals ✓
Social Assets ✓
EPK ✓
Library ✓
```

---

## Brand Experience

The Brand Workspace exists to make a brand feel: *"I am good to go with KeedoHub."*

### Brand Profile / Brand DNA

The Brand Profile becomes the source of truth for everything KeedoHub creates:

- **Business Identity**: Company name, description, industry, founder info
- **Visual Identity**: Logo, colors, typography, photography/motion style
- **Brand Voice**: Tone, mission, vision, values, audience
- **Business Info**: Details needed for branded business materials

### Brand Creative Services

Major categories:

| Category | Services |
|---|---|
| **Brand Identity** | Logo, Brand Identity, Brand Guidelines |
| **Social** | Social Media Kit, Templates, Graphics |
| **Marketing** | Promotional Graphics, Product Graphics |
| **Motion** | Motion Graphics, Logo Animation |
| **Digital** | Website Design, App Design, UI/UX |
| **Presentation** | Company Presentation, Pitch Deck, Investor Deck |
| **Print** | Letterhead, Business Cards, Brochures |

### Brand Kits

- Brand Identity Kit
- Social Media Kit
- Business Document Kit
- Presentation Kit
- Marketing Kit
- Digital Brand Kit

### Brand Business Documents

KeedoHub designs professional branded documents:

- Company Profile, Letterhead, Email Signature
- Invoice, Receipt, Quotation, Proposal
- Service Agreement, Contract, Purchase Order
- Sales Proposal, Capability Statement, Pitch Deck
- Brand Guidelines, Media Kit, Press Kit

### Brand "Good to Go" State

```text
Brand Profile ✓
Brand Identity ✓
Social Media Kit ✓
Business Documents ✓
Presentation ✓
Marketing Assets ✓
Digital Assets ✓
Brand Library ✓
```

---

## Creative Requests

Requests are the simple front door into KeedoHub production.

Customer submits:

```text
What do I need?
What is it for?
What information do you need?
References
Deadline
Notes
```

### Request Statuses

```text
Submitted → Briefing → In Production → Review → Changes Requested → Approved → Delivered
```

---

## Projects

Projects are the execution containers. Every meaningful creative request becomes a project.

### Project Lifecycle

```text
Request → Project → Brief → Production → Review → Approval → Delivery
```

---

## Library

The customer's permanent creative archive.

**Artist Library**: Releases, Cover Artwork, Motion, Social, EPK, Other Assets

**Brand Library**: Brand Identity, Social Kits, Documents, Presentations, Marketing, Motion

Library is **workspace-scoped** — Artist assets never appear in Brand Library and vice versa.

---

## KeedoHub Studio

### Studio is the Engine

The Workspace is where customers manage their needs. Studio is where KeedoHub produces the work.

```text
WORKSPACE                STUDIO
Customer control room    KeedoHub production engine
```

### Studio Control Center

```text
STUDIO CONTROL CENTER

Incoming → Briefing → In Production → Review → Ready → Delivered
```

### Internal Production Engines

Useful production technology exists inside Studio:

- Cover Renderer
- Lyrics Renderer
- Motion Generator
- Document Generator
- Presentation Generator
- Brand Kit Generator
- Asset Packager
- Audio QA

These are **production engines**, not separate customer-facing operating systems.

---

## What KeedoHub is NOT

KeedoHub is **not**:

- A campaign management platform
- A generic project management platform
- A Canva clone
- A generic Word/Office replacement
- A DIY cover-art generator
- A DSP pitching platform
- A generic CRM or accounting platform
- A collection of disconnected AI tools

KeedoHub is:

> A creative production platform where customers manage their creative needs and KeedoHub produces the work.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript + Vite 6 |
| **Server** | Express.js API proxy |
| **Styling** | Tailwind CSS v4 with dynamic CSS variable theming |
| **Icons** | Lucide React |
| **Motion** | Motion (`motion/react`) |
| **Audio** | Web Audio API (Analysers, BiquadFilters, GainNodes) |
| **PDF** | `jspdf` vector document builder |
| **AI** | `@google/genai` Gemini (server-side) |
| **Database** | PostgreSQL/Supabase (planned persistence) |

---

## Project Structure

```text
KH-OPERATING-SYSTEM/
├── src/
│   ├── components/
│   │   ├── workspace/        # WorkspaceShell, WorkspaceHome, ProjectsView, LibraryView
│   │   ├── artist/           # ArtistOperatingEnvironment
│   │   ├── brand/            # BrandOperatingEnvironment, BrandProfileView
│   │   ├── admin/            # AdminDashboard
│   │   ├── Studio.tsx        # KeedoHub Studio services
│   │   ├── RequestsView.tsx  # Creative Requests
│   │   └── ...               # Other workspace components
│   ├── context/              # AuthContext, WorkspaceContext, CreativeBrainContext
│   ├── domain/               # Core domain models (workspace, projects, releases)
│   ├── services/             # API service layer
│   ├── utils/                # Navigation, admin access
│   └── types.ts              # ActiveTab, domain types
├── server/
│   ├── routes.ts             # Express API routes
│   ├── db/                   # Data models, persistence, Supabase schema
│   ├── ai/                   # Creative brain service
│   ├── radar/                # Creative radar service
│   ├── workflow/             # Workflow engine
│   └── command/              # Command center service
└── package.json
```

---

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/artkidoo/KH-OPERATING-SYSTEM.git
cd KH-OPERATING-SYSTEM

# Install dependencies
npm install

# Start development server (Express API + Vite frontend)
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with API proxy |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run TypeScript type checking |

---

## Roadmap Philosophy

The architecture supports KeedoHub operating as a creative service business:

```text
Customer → Request → Creative Service → Project → Studio → Designer/Production → Review → Delivery
```

Future development priorities:

1. **Persistent Workspaces** — Cloud-based workspace and asset storage
2. **Multi-User Collaboration** — Role-based access (Owner, Producer, Manager, Designer)
3. **Production Workflows** — Enhanced studio production pipelines
4. **Billing Integration** — Service billing and payment tracking

---

## Legacy Concepts

The following concepts are **deprecated** and being phased out of the architecture:

| Legacy Concept | Status | Replacement |
|---|---|---|
| Campaign OS / Campaign Builder | Deprecated | Creative Projects |
| Programmed Brain / Artist Content Brain | Deprecated | Internal production intelligence |
| DSP Pitcher / Curator Strategy | Deprecated | Not part of current architecture |
| Customer-facing Cover Studio | Deprecated | Studio production (request-based) |
| Customer-facing Lyrics Studio | Deprecated | Studio production (request-based) |
| Customer-facing Mastering Inspector | Deprecated | Internal Audio QA in Studio |

These components may still exist in the codebase but are **not part of the current product architecture**.

---

## License

KeedoHub — Creative Production Platform
