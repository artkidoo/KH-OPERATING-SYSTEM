# KEEDOHUB — Technical & Product Blueprint Specification

> **System Architect: Ojo Abdulkareem — Keedohub Studio (Lagos, Nigeria)**  
> *Authoritative technical specification for the KeedoHub creative production platform.*

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Architecture Principles](#2-architecture-principles)
3. [Workspace Architecture](#3-workspace-architecture)
4. [Identity & Security](#4-identity--security)
5. [User Roles](#5-user-roles)
6. [Artist Domain Model](#6-artist-domain-model)
7. [Brand Domain Model](#7-brand-domain-model)
8. [Profile / DNA Model](#8-profile--dna-model)
9. [Release Model](#9-release-model)
10. [Asset Kit Model](#10-asset-kit-model)
11. [Creative Request Model](#11-creative-request-model)
12. [Project Lifecycle](#12-project-lifecycle)
13. [Studio Architecture](#13-studio-architecture)
14. [Admin Workflow](#14-admin-workflow)
15. [Documents Architecture](#15-documents-architecture)
16. [Presentation Architecture](#16-presentation-architecture)
17. [Library Architecture](#17-library-architecture)
18. [Asset Lifecycle](#18-asset-lifecycle)
19. [Review / Approval Lifecycle](#19-review--approval-lifecycle)
20. [Workspace-Scoping Rules](#20-workspace-scoping-rules)
21. [Route Architecture](#21-route-architecture)
22. [State Architecture](#22-state-architecture)
23. [API / Data Rules](#23-api--data-rules)
24. [Security Boundaries](#24-security-boundaries)
25. [Design System Rules](#25-design-system-rules)
26. [Internal Production Engines](#26-internal-production-engines)
27. [Audio QA](#27-audio-qa)
28. [Legacy / Deprecation Rules](#28-legacy--deprecation-rules)
29. [Future Extensibility](#29-future-extensibility)
30. [Acceptance Criteria](#30-acceptance-criteria)
31. [Definition of Done](#31-definition-of-done)

---

## 1. Product Vision

### What is KeedoHub?

KeedoHub is a creative production platform where customers manage their creative needs and KeedoHub produces the work.

### Core Promise

> You bring your identity, information, ideas and creative needs. KeedoHub creates the professional creative work you need.

### Who KeedoHub Serves

- **Music Artists** who need professional creative work around their releases
- **Brands** who need professional creative production for their business

### What KeedoHub Is NOT

| Not This | Why |
|---|---|
| Campaign management platform | Campaigns are deliverables, not the core model |
| DIY design-tool platform | KeedoHub produces work, customers don't design |
| Canva clone | Professional production, not self-service design |
| Generic Word replacement | Branded documents, not generic editing |
| DSP pitching platform | Not part of current architecture |
| Generic CRM / ERP | Creative production, not business management |

---

## 2. Architecture Principles

### Principle 1: One Workspace

There is exactly ONE Workspace architecture. Artist and Brand are experiences within it, not separate applications.

### Principle 2: Studio is the Engine

The Workspace is the customer's control room. Studio is KeedoHub's production engine. They are conceptually and architecturally distinct.

### Principle 3: Request → Project → Production → Delivery

This is the canonical lifecycle. Everything flows through this pipeline.

### Principle 4: Workspace Isolation

Data must be isolated at every layer: routing, UI, state, API, queries, data access.

### Principle 5: Identity-Driven Production

Artist DNA and Brand Profile inform all creative production. The more KeedoHub knows, the better the output.

### Principle 6: Simple Customer Experience

Customers should understand:
- What do I have?
- What do I need?
- What is KeedoHub making?
- What is in production?
- What needs my approval?
- What has been delivered?

---

## 3. Workspace Architecture

### Canonical Structure

```text
                    KEEDOHUB WORKSPACE
                           │
              ┌────────────┴────────────┐
              │                         │
           ARTIST                     BRAND
        EXPERIENCE                  EXPERIENCE
```

### Shared Components

Both experiences share:

| Component | Implementation |
|---|---|
| WorkspaceShell | `src/components/workspace/WorkspaceShell.tsx` |
| Design System | Global CSS variables, Tailwind config |
| Navigation | Tab-based routing with identity-aware sections |
| Cards/Buttons | Shared UI component library |
| Status Components | Request status, project status, etc. |
| Modal Patterns | BriefModal, ApprovalModal, etc. |

### Artist-Only Sections

- Releases
- Asset Kits
- Music
- Artist Profile

### Brand-Only Sections

- Brand Profile
- Brand Kits
- Documents
- Presentations
- Business

### Shared Sections

- Projects
- Requests
- Library
- Membership
- Profile

---

## 4. Identity & Security

### Authentication Flow

```text
Authentication
      ↓
Active Workspace
      ↓
Workspace ID
      ↓
Workspace Type (artist | brand)
      ↓
Artist Experience OR Brand Experience
```

### Workspace Type

```typescript
type WorkspaceIdentity = 'artist' | 'brand';
```

### Isolation Layers

Workspace isolation MUST exist at:

1. **Routing** — Workspace-scoped routes
2. **UI** — Identity-aware component rendering
3. **State** — Workspace-scoped context providers
4. **API** — Workspace-scoped API endpoints
5. **Queries** — Workspace-filtered data queries
6. **Data Access** — Workspace ownership enforcement
7. **Projects** — Workspace-scoped projects
8. **Requests** — Workspace-scoped requests
9. **Assets** — Workspace-scoped assets
10. **Documents** — Workspace-scoped documents
11. **Releases** — Artist workspace-scoped
12. **Library** — Workspace-scoped archive

### Administrative Access

Administrative users may operate across customer workspaces but must never mix customer data in customer-facing views.

---

## 5. User Roles

| Role | Access | Description |
|---|---|---|
| **Customer** | Own workspace only | Artist or brand user |
| **Team Member** | Assigned workspaces | Collaborator with permissions |
| **Admin** | All workspaces | Production management |
| **Super Admin** | Full system | Platform administration |

### Workspace Roles

| Role | Permissions |
|---|---|
| Owner | Full control, billing |
| Admin | Manage team, content |
| Editor | Create, edit content |
| Viewer | Read-only access |
| Contributor | Create, limited edit |

---

## 6. Artist Domain Model

### Artist Profile

The source of truth for the artist's identity.

```typescript
interface ArtistProfile {
  identity: {
    artistName: string;
    stageName: string;
    bio: string;
    genre: string;
    subgenre: string;
    location: string;
    website: string;
    socialLinks: Record<string, string>;
    streamingLinks: Record<string, string>;
  };
  dna: {
    story: string;
    visualPersonality: string;
    colors: string[];
    typography: string[];
    photographyDirection: string;
    moodReferences: string[];
    logo: string;
    creativePreferences: Record<string, any>;
    contentTone: string;
  };
}
```

### Artist Releases

```typescript
interface Release {
  id: string;
  workspaceId: string;
  title: string;
  releaseType: 'single' | 'ep' | 'album' | 'mixtape';
  releaseDate: string;
  genre: string;
  featuredArtists: string[];
  producer: string;
  songwriter: string;
  lyrics: string;
  songStory: string;
  streamingLinks: Record<string, string>;
  presaveLinks: Record<string, string>;
  referenceMaterial: string[];
  creativeNotes: string;
  status: ReleaseStage;
}
```

### Release Workflow

```text
Artist
  ↓
New Release
  ↓
Release Information
  ↓
Creative Requests
  ↓
Asset Kit
  ↓
Studio Production
  ↓
Review
  ↓
Delivery
```

---

## 7. Brand Domain Model

### Brand Profile / Brand DNA

The source of truth for the brand's identity.

```typescript
interface BrandProfile {
  business: {
    companyName: string;
    description: string;
    industry: string;
    location: string;
    website: string;
    email: string;
    phone: string;
    socialAccounts: Record<string, string>;
    founderInfo: string;
  };
  visualIdentity: {
    logo: string;
    logoVariants: string[];
    primaryColor: string;
    secondaryColors: string[];
    accentColors: string[];
    typography: string[];
    photographyStyle: string;
    illustrationStyle: string;
    iconStyle: string;
    motionStyle: string;
    visualReferences: string[];
  };
  voice: {
    tone: string;
    writingStyle: string;
    tagline: string;
    mission: string;
    vision: string;
    values: string[];
    audience: string;
    preferredTerminology: string[];
    wordsToAvoid: string[];
  };
}
```

### Brand Production DNA Flow

```text
Brand Profile
      ↓
Brand DNA
      ↓
Creative Request
      ↓
KeedoHub Studio
      ↓
Brand-consistent Production
```

---

## 8. Profile / DNA Model

### Artist DNA Entity

Stored in `artist_dna` table / `ArtistDNAEntity` interface.

| Field | Type | Purpose |
|---|---|---|
| artistIdentity | text | Core identity statement |
| story | text | Artist narrative |
| genre | text | Primary genre |
| soundDescription | text | Sonic characteristics |
| audienceDemographics | text | Target audience |
| voiceAndLanguage | text | Communication style |
| visualDirection | text | Visual aesthetic |
| contentPillars | jsonb | Content themes |
| recurringThemes | jsonb | Recurring motifs |
| goals | text | Career objectives |
| positioning | text | Market positioning |
| platforms | jsonb | Active platforms |
| preferences | jsonb | Creative preferences |
| thingsToAvoid | jsonb | Negative preferences |

### Brand DNA Entity

Stored in `brand_dna` table / `BrandDNAEntity` interface.

| Field | Type | Purpose |
|---|---|---|
| identity | text | Brand identity statement |
| positioning | text | Market positioning |
| businessCategory | text | Industry category |
| audience | text | Target audience |
| valueProposition | text | Core value |
| offers | jsonb | Products/services |
| voice | text | Brand voice |
| visualIdentity | text | Visual direction |
| competitivePositioning | text | Competitive stance |
| contentPillars | jsonb | Content themes |
| growthGoals | jsonb | Growth objectives |
| businessModel | text | Business model |

---

## 9. Release Model

### Release Entity

```typescript
interface ReleaseEntity {
  id: string;
  workspaceId: string;
  title: string;
  releaseType: 'single' | 'ep' | 'album';
  releaseDate: string;
  genre: string;
  stage: ReleaseStage;
  status: string;
  // Metadata
  artistName: string;
  featuredArtists: string[];
  producer: string;
  songwriter: string;
  // Content
  lyrics: string;
  songStory: string;
  // Links
  streamingLinks: Record<string, string>;
  presaveSlug: string;
  // Production state
  coverUrl: string;
  audioUrl: string;
  epkData: Record<string, any>;
}
```

### Release Stages

```text
Idea → Production → Preparation → Launch → Post-Release
```

---

## 10. Asset Kit Model

### Asset Kit Types

| Kit | Contents |
|---|---|
| **Cover Artwork** | 3000x3000px master, variants |
| **Motion Package** | Animated cover, Spotify Canvas |
| **Lyric Visuals** | Lyric video, lyric cards |
| **Social Assets** | Instagram, TikTok, YouTube formats |
| **Press Kit** | EPK, press photos, bio |
| **Release Announcement** | Countdown, announcement graphics |

### Asset Kit States

```text
Not Started → In Progress → Review → Approved → Delivered
```

### Asset Entity

```typescript
interface AssetEntity {
  id: string;
  workspaceId: string;
  projectId?: string;
  releaseId?: string;
  requestId?: string;
  category: AssetCategory;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: AssetStatus;
  version: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

---

## 11. Creative Request Model

### Request Entity

```typescript
interface CreativeRequest {
  id: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  description: string;
  category: RequestCategory;
  serviceType: string;
  status: RequestStatus;
  priority: Priority;
  brief: CreativeBrief;
  references: string[];
  deadline?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Request Statuses

```text
Submitted → Briefing → In Production → Review → Changes Requested → Approved → Delivered
```

### Request Categories

**Artist:**
- Cover Artwork
- Lyric Video
- Motion Graphics
- EPK
- Social Assets
- Press Kit

**Brand:**
- Brand Identity
- Social Media Kit
- Business Documents
- Presentation
- Marketing Materials
- Web Design

---

## 12. Project Lifecycle

### Project Entity

```typescript
interface ProjectEntity {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  sections: string[];
  requestId?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Project Lifecycle

```text
Request
  ↓
Project Created
  ↓
Brief Finalized
  ↓
Production Started
  ↓
Internal Review
  ↓
Customer Review
  ↓
Changes (if needed)
  ↓
Approval
  ↓
Delivery
  ↓
Library Archive
```

### Project Statuses

```text
Planning → In Progress → Review → Completed
```

---

## 13. Studio Architecture

### Studio Concept

Studio is KeedoHub's production engine. It is NOT customer-facing.

```text
WORKSPACE                STUDIO
Customer control room    KeedoHub production engine
```

### Studio Control Center

Admin production management interface:

```text
STUDIO CONTROL CENTER

Incoming Requests
      ↓
Briefing Review
      ↓
Assignment
      ↓
In Production
      ↓
Internal QC
      ↓
Customer Review
      ↓
Revisions
      ↓
Ready for Delivery
      ↓
Delivered
```

### Studio Data Model

```typescript
interface StudioProduction {
  id: string;
  requestId: string;
  projectId: string;
  workspaceId: string;
  customerType: 'artist' | 'brand';
  serviceType: string;
  status: ProductionStatus;
  brief: CreativeBrief;
  assignedTo?: string;
  tasks: ProductionTask[];
  files: ProductionFile[];
  versions: ProductionVersion[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}
```

### Internal Production Engines

| Engine | Purpose | Customer-Facing? |
|---|---|---|
| Cover Renderer | Generate cover artwork | No |
| Lyrics Renderer | Create lyric visuals | No |
| Motion Generator | Produce motion graphics | No |
| Document Generator | Create branded documents | No |
| Presentation Generator | Design presentations | No |
| Brand Kit Generator | Compile brand kits | No |
| Asset Packager | Package final assets | No |
| Audio QA | Quality control audio | No |

---

## 14. Admin Workflow

### Admin Capabilities

Admin users can:
- Manage customers
- Inspect workspaces
- Review requests
- Manage projects
- Assign production
- Manage files
- Manage versions
- Review work
- Approve work
- Deliver assets
- Operate internal production engines
- Perform audio QA
- Manage production workflows

### Admin Dashboard Sections

| Section | Purpose |
|---|---|
| Overview | Platform analytics, metrics |
| Workspaces | Customer workspace management |
| Requests | Request queue, assignment |
| Production | Active productions, QC |
| Users | User management |
| Settings | Platform configuration |
| System | Health, feature flags |

---

## 15. Documents Architecture

### Document Types

**Business Documents:**
- Company Profile
- Letterhead
- Email Signature
- Invoice
- Receipt
- Quotation
- Proposal
- Service Agreement
- Contract
- Purchase Order
- Delivery Note

**Sales Documents:**
- Sales Proposal
- Capability Statement
- Pitch Deck
- Company Presentation
- Product Presentation
- Investor Deck

**Brand Documents:**
- Brand Guidelines
- Social Media Brand Kit
- Marketing Kit
- Media Kit
- Press Kit

### Document Editing Model

```text
Customer controls:          KeedoHub controls:
─────────────────          ──────────────────
Company address            Professional design
Contact information        Layout system
Client name                Typography
Prices                     Color system
Dates                      Visual style
Invoice number             Brand consistency
Descriptions
Service names
Payment terms
```

---

## 16. Presentation Architecture

### Presentation Workflow

```text
Brand Profile
      ↓
Presentation Request
      ↓
KeedoHub Studio
      ↓
Presentation Design
      ↓
Editable Presentation
      ↓
Review
      ↓
Approval
      ↓
Delivery
```

### Presentation Types

- Company Presentation
- Pitch Deck
- Investor Deck
- Sales Deck
- Product Presentation

---

## 17. Library Architecture

### Library Model

```text
Library
├── Releases (Artist)
├── Cover Artwork
├── Motion
├── Social Assets
├── EPK
├── Brand Identity
├── Social Kits
├── Documents
├── Presentations
├── Marketing
└── Other Assets
```

### Workspace Scoping

- Artist Library: Only artist workspace assets
- Brand Library: Only brand workspace assets
- No cross-workspace visibility

### Library Entity

```typescript
interface LibraryItem {
  id: string;
  workspaceId: string;
  assetId: string;
  category: string;
  title: string;
  description?: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
}
```

---

## 18. Asset Lifecycle

### Asset States

```text
Requested → In Production → Review → Revisions → Approved → Delivered → Archived
```

### Asset Entity

```typescript
interface AssetEntity {
  id: string;
  workspaceId: string;
  projectId?: string;
  releaseId?: string;
  requestId?: string;
  category: AssetCategory;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: AssetStatus;
  version: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### Asset Categories

```typescript
type AssetCategory =
  | 'cover_artwork'
  | 'animated_cover'
  | 'spotify_canvas'
  | 'lyric_visual'
  | 'lyric_card'
  | 'social_asset'
  | 'press_photo'
  | 'epk'
  | 'motion'
  | 'brand_identity'
  | 'document'
  | 'presentation'
  | 'marketing'
  | 'other';
```

---

## 19. Review / Approval Lifecycle

### Review States

```text
Pending Review → In Review → Changes Requested → Revised → Approved → Delivered
```

### Review Entity

```typescript
interface ReviewEntity {
  id: string;
  assetId: string;
  projectId: string;
  workspaceId: string;
  reviewerId: string;
  status: ReviewStatus;
  comments: Comment[];
  version: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 20. Workspace-Scoping Rules

### Rules

1. Every data query MUST include workspace_id filter
2. Every API endpoint MUST validate workspace access
3. Every UI component MUST respect workspace context
4. Admin cross-workspace access MUST use separate admin interfaces
5. No customer-facing view may show data from another workspace

### Implementation

```typescript
// Example: Workspace-scoped API call
async function getReleases(workspaceId: string): Promise<Release[]> {
  return await db.query(
    'SELECT * FROM releases WHERE workspace_id = $1 ORDER BY created_at DESC',
    [workspaceId]
  );
}
```

---

## 21. Route Architecture

### Public Routes

| Route | Component |
|---|---|
| `/` | HeroStudioOS |
| `/about` | AboutPage |
| `/vision` | VisionPage |
| `/contact` | ContactPage |
| `/faq` | FAQPage |
| `/help` | HelpCenterPage |
| `/docs` | DocumentationPage |
| `/resources` | ResourcesPage |
| `/login` | AuthModal |
| `/signup` | AuthModal |

### Workspace Routes

| Route | Section |
|---|---|
| `/workspace` | WorkspaceHome |
| `/workspace/projects` | ProjectsView |
| `/workspace/music` | ReleaseBuilder |
| `/workspace/releases` | ReleasesView |
| `/workspace/library` | LibraryView |
| `/workspace/requests` | RequestsView |
| `/workspace/membership` | MembershipView |
| `/workspace/profile` | ProfileView |

### Studio Routes

| Route | Component |
|---|---|
| `/studio` | Studio |
| `/studio/services` | StudioBoard |

---

## 22. State Architecture

### Context Providers

| Provider | Purpose |
|---|---|
| `AuthContext` | Authentication, user session |
| `WorkspaceContext` | Active workspace, identity |
| `ThemeContext` | Theme, color scheme |
| `CreativeBrainContext` | AI intelligence, recommendations |

### State Flow

```text
User Action
      ↓
Context Update
      ↓
Component Re-render
      ↓
API Sync (if needed)
      ↓
Persistence (if needed)
```

---

## 23. API / Data Rules

### RESTful Endpoints

| Method | Pattern | Description |
|---|---|---|
| GET | `/api/workspaces/:id` | Get workspace |
| GET | `/api/workspaces/:id/releases` | List releases |
| POST | `/api/workspaces/:id/releases` | Create release |
| GET | `/api/workspaces/:id/projects` | List projects |
| POST | `/api/workspaces/:id/projects` | Create project |
| GET | `/api/workspaces/:id/requests` | List requests |
| POST | `/api/workspaces/:id/requests` | Create request |
| GET | `/api/workspaces/:id/library` | List library items |

### Data Access Rules

1. All queries MUST filter by workspace_id
2. All mutations MUST validate workspace ownership
3. All responses MUST NOT include cross-workspace data
4. Admin endpoints MUST use separate authentication

---

## 24. Security Boundaries

### Security Layers

```text
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Route guards, component visibility)   │
├─────────────────────────────────────────┤
│            Application Layer            │
│  (Context providers, state management)  │
├─────────────────────────────────────────┤
│              API Layer                  │
│  (Endpoint validation, authentication)  │
├─────────────────────────────────────────┤
│           Data Access Layer             │
│  (Workspace-scoped queries, RLS)        │
├─────────────────────────────────────────┤
│            Database Layer               │
│  (Row-level security, constraints)      │
└─────────────────────────────────────────┘
```

### Security Requirements

- No fake authentication
- No exposed API keys
- No mock backend as production
- No cross-workspace data access
- Server-side validation on all mutations
- Environment-based secrets
- Audit logging for sensitive operations

---

## 25. Design System Rules

### Shared Design Tokens

| Token | Dark Mode | Light Mode | Role |
|---|---|---|---|
| `--canvas-bg` | `#09090B` | `#F4F4F5` | Base workspace canvas |
| `--bento-card` | `#121215` | `#FFFFFF` | Elevated modules |
| `--bento-border` | `#27272A` | `#E4E4E7` | Card dividers |
| `--accent-primary` | Theme-based | Theme-based | Primary actions |

### Typography

| Role | Font |
|---|---|
| Headings | Space Grotesk |
| Body | Plus Jakarta Sans |
| Code/Data | JetBrains Mono |

### Rules

1. Artist and Brand share the same design system
2. Differences are in identity, content, navigation, data, and services
3. NOT completely different applications
4. Consistent component library across both experiences

---

## 26. Internal Production Engines

### Production Engine Types

| Engine | Input | Output |
|---|---|---|
| Cover Renderer | Brief, references, DNA | Cover artwork files |
| Lyrics Renderer | Lyrics, timing, style | Lyric video/visuals |
| Motion Generator | Assets, brief | Motion graphics |
| Document Generator | Content, brand DNA | Branded documents |
| Presentation Generator | Content, brand DNA | Presentation deck |
| Brand Kit Generator | Brand DNA | Complete brand kit |
| Asset Packager | Final assets | Downloadable package |
| Audio QA | Audio file | QC report |

### Rules

1. Engines are internal to Studio
2. NOT customer-facing tools
3. May be used by admin for production
4. Results delivered through review/approval flow

---

## 27. Audio QA

### Audio QA Location

```text
Studio
  ↓
Music Production
  ↓
Audio QA
```

### Audio QA Checks

| Check | Description |
|---|---|
| File format | WAV, AIFF, FLAC verification |
| Sample rate | 44.1kHz, 48kHz validation |
| Bit depth | 16-bit, 24-bit verification |
| Integrated loudness | LUFS measurement |
| True peak | dBTP measurement |
| Clipping | Distortion detection |
| Duration | Track length verification |
| Waveform | Visual analysis |

### Customer-Facing Output

```text
Master Audio
✓ Approved by KeedoHub Studio
```

---

## 28. Legacy / Deprecation Rules

### Deprecated Concepts

| Concept | Status | Action |
|---|---|---|
| Campaign OS | Deprecated | Use Creative Projects |
| Campaign Builder | Deprecated | Use Project workflow |
| Programmed Brain | Deprecated | Internal production intelligence |
| Artist Content Brain | Deprecated | Internal production intelligence |
| DSP Pitcher | Deprecated | Not part of architecture |
| Curator Strategy | Deprecated | Not part of architecture |
| Customer-facing Cover Studio | Deprecated | Studio production (request-based) |
| Customer-facing Lyrics Studio | Deprecated | Studio production (request-based) |
| Customer-facing Mastering Suite | Deprecated | Internal Audio QA |
| Pre-save Hub | Deprecated | Part of release workflow |
| Splits Calculator | Deprecated | Part of release workflow |

### Deprecation Rules

1. Legacy code may remain in repository
2. Must NOT be documented as current architecture
3. Must NOT be exposed to customers
4. May be removed in future refactoring

---

## 29. Future Extensibility

### Extension Points

| Extension | Description |
|---|---|
| New Service Types | Add creative services to Studio |
| New Asset Categories | Extend asset taxonomy |
| New Document Types | Add document templates |
| New Production Engines | Add internal production tools |
| Integration APIs | Connect external services |
| Team Collaboration | Multi-user workspace features |
| Billing Integration | Service billing and payments |

### Extension Rules

1. All extensions must follow the Request → Project → Production → Delivery model
2. All extensions must respect workspace isolation
3. New production engines must be internal to Studio
4. Customer experience must remain simple

---

## 30. Acceptance Criteria

### Mandatory Requirements

| Area | Requirement | Status |
|---|---|---|
| Workspace | ONE canonical Workspace | ✅ |
| Identity | Artist and Brand are isolated | ✅ |
| Artist | Profile, Releases, Asset Kits, Requests, Projects, Library | ✅ |
| Brand | Brand Profile, Creative, Brand Kits, Documents, Presentations | ✅ |
| Studio | Central production engine | ✅ |
| Projects | Request → Project → Production → Delivery | ✅ |
| Library | Workspace-scoped asset archive | ✅ |
| Admin | Cross-workspace production access | ✅ |
| Legacy | No campaign-first architecture | ✅ |
| Legacy | No DSP Pitcher | ✅ |
| Legacy | No Programmed Brain | ✅ |
| Legacy | No customer-facing DIY Cover Studio | ✅ |

---

## 31. Definition of Done

### Feature Complete When

- [ ] Implements Request → Project → Production → Delivery flow
- [ ] Respects workspace isolation at all layers
- [ ] Uses shared design system components
- [ ] No legacy terminology in customer-facing UI
- [ ] No DIY tools presented as customer features
- [ ] Studio production engines are internal only
- [ ] Customer experience remains simple
- [ ] Documentation reflects actual implementation

### Quality Standards

- TypeScript compilation passes
- No console errors in production
- Responsive design (mobile, tablet, desktop)
- Accessibility considerations
- Performance budgets met
- Security review passed

---

## Document History

| Version | Date | Changes |
|---|---|---|
| 2.0 | 2026-09-12 | Complete rewrite for new product architecture |
| 1.0 | Previous | Legacy architecture (superseded) |
