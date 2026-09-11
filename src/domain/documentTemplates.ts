// PHASE 2 — unified agency document architecture.
export type DocType =
  | "quote"
  | "invoice"
  | "brief"
  | "deck"
  | "guidelines"
  | "contract"
  | "schedule"
  | "epk"
  | "nda"
  | "receipt";

export interface DocField {
  key: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
}

export interface DocTemplate {
  type: DocType;
  label: string;
  category: "Finance" | "Creative" | "Legal" | "Press";
  fields: DocField[];
  body: (d: Record<string, string>) => string;
}

export const DOC_TEMPLATES: DocTemplate[] = [
  {
    type: "quote",
    label: "Quote / Estimate",
    category: "Finance",
    fields: [
      { key: "fromName", label: "Agency / Issuer (KeedoHub Studio)" },
      { key: "clientName", label: "Client / Artist Name" },
      { key: "subject", label: "Estimate Number or Ref (e.g. EST-2026-08)" },
      { key: "amount", label: "Estimated Total (e.g. $3,500 / ₦2,500,000)" },
      { key: "validUntil", label: "Valid Until Date" },
      {
        key: "details",
        label: "Scope of Deliverables & Line Items",
        multiline: true,
        placeholder: "1. Album Cover Art Direction & 3D Typography\n2. 5x Social Motion Video Loops (9:16)\n3. DSP Header Suite (Spotify, Apple Music, YouTube)\n4. Press One-Sheet / EPK PDF Dossier",
      },
    ],
    body: (d) =>
      `KEEDOHUB CREATIVE AGENCY\nESTIMATE / QUOTE: ${d.subject || "EST-2026"}\n` +
      `Issued By: ${d.fromName || "KeedoHub Studio"}\n` +
      `Prepared For: ${d.clientName || "Valued Client"}\n` +
      `Valid Until: ${d.validUntil || "14 days from issue"}\n` +
      `Estimated Amount: ${d.amount || "TBD"}\n\n` +
      `--------------------------------------------------\n` +
      `SCOPE OF WORK & DELIVERABLES:\n` +
      `${d.details || "Comprehensive creative execution across digital and print channels."}\n` +
      `--------------------------------------------------\n` +
      `Terms: 50% deposit required prior to production commencement. Remainder due upon final package delivery.`,
  },
  {
    type: "invoice",
    label: "Commercial Invoice",
    category: "Finance",
    fields: [
      { key: "fromName", label: "Agency / Studio (KeedoHub Creative)" },
      { key: "clientName", label: "Billed To (Artist / Brand)" },
      { key: "subject", label: "Invoice Number (e.g. INV-2026-042)" },
      { key: "amount", label: "Total Due (e.g. $2,400)" },
      { key: "paymentDetails", label: "Payment / Bank Route Info" },
      {
        key: "details",
        label: "Itemized Deliverables & Service Description",
        multiline: true,
      },
    ],
    body: (d) =>
      `KEEDOHUB STUDIO — COMMERCIAL INVOICE\n` +
      `Invoice #: ${d.subject || "INV-001"}\n` +
      `Billed To: ${d.clientName || "Client"}\n` +
      `From: ${d.fromName || "KeedoHub Creative Group"}\n` +
      `Total Due: ${d.amount || "0.00"}\n\n` +
      `SERVICES RENDERED:\n` +
      `${d.details || "Creative production services as contracted."}\n\n` +
      `PAYMENT INSTRUCTIONS:\n` +
      `${d.paymentDetails || "Bank Transfer / Stripe Invoice Portal"}\n\n` +
      `Status: Net 7 terms apply. Thank you for your collaboration.`,
  },
  {
    type: "brief",
    label: "Creative Brief",
    category: "Creative",
    fields: [
      { key: "fromName", label: "Lead Strategist / Client" },
      { key: "clientName", label: "Target Audience" },
      { key: "subject", label: "Campaign / Project Focus" },
      { key: "deliverables", label: "Required Deliverables" },
      {
        key: "details",
        label: "Creative Objective, Mood & Key Message",
        multiline: true,
      },
    ],
    body: (d) =>
      `KEEDOHUB CREATIVE BRIEF\nProject Focus: ${d.subject || "Untitled Campaign"}\n` +
      `Client / Artist: ${d.fromName || "Workspace"}\n` +
      `Audience Demographics: ${d.clientName || "Core digital listeners"}\n` +
      `Required Deliverables: ${d.deliverables || "Artwork, Motion, Social, Press"}\n\n` +
      `OBJECTIVE & ARTISTIC DIRECTION:\n` +
      `${d.details || "Establish high-impact editorial presence across primary channels."}`,
  },
  {
    type: "deck",
    label: "Pitch Deck Dossier",
    category: "Creative",
    fields: [
      { key: "fromName", label: "Presenter / Agency" },
      { key: "clientName", label: "Recipient / Partner" },
      { key: "subject", label: "Presentation Title" },
      {
        key: "details",
        label: "Executive Summary & Slide Outline",
        multiline: true,
      },
    ],
    body: (d) =>
      `PITCH DECK OUTLINE: ${d.subject || "Strategic Presentation"}\n` +
      `Prepared By: ${d.fromName || "KeedoHub Creative"}\n` +
      `Presented To: ${d.clientName || "Brand Stakeholders"}\n\n` +
      `SLIDE OUTLINE & NARRATIVE ARC:\n` +
      `${d.details || "1. Market Opportunity\n2. Creative Thesis\n3. Visual System\n4. Rollout Timeline\n5. Commercial Impact"}`,
  },
  {
    type: "guidelines",
    label: "Brand Guidelines",
    category: "Creative",
    fields: [
      { key: "fromName", label: "Brand Name" },
      { key: "subject", label: "Brand Purpose / Motto" },
      { key: "palette", label: "Primary Palette Codes" },
      { key: "typography", label: "Typography Rules" },
      {
        key: "details",
        label: "Logo Rules & Tone of Voice",
        multiline: true,
      },
    ],
    body: (d) =>
      `BRAND IDENTITY GUIDELINES: ${d.fromName || "Brand System"}\n` +
      `Core Motto: ${d.subject || "Excellence in Craft"}\n` +
      `Color Codes: ${d.palette || "Obsidian (#09090B), Signal Red (#EF4444), Chalk (#F4F4F5)"}\n` +
      `Typography: ${d.typography || "Space Grotesk (Headings) + Plus Jakarta Sans (Body)"}\n\n` +
      `USAGE & TONE RULES:\n` +
      `${d.details || "Maintain generous negative space. Do not alter logo aspect ratios. Maintain high contrast."}`,
  },
  {
    type: "contract",
    label: "Contract / Agreement",
    category: "Legal",
    fields: [
      { key: "fromName", label: "First Party (Agency)" },
      { key: "clientName", label: "Second Party (Client)" },
      { key: "subject", label: "Agreement Scope / Title" },
      { key: "amount", label: "Total Consideration / Fee" },
      {
        key: "details",
        label: "Key Clauses, Rights & Term",
        multiline: true,
      },
    ],
    body: (d) =>
      `CREATIVE SERVICES AGREEMENT\n` +
      `Scope: ${d.subject || "Creative Production"}\n` +
      `Between: ${d.fromName || "KeedoHub Studio"} ("Agency")\n` +
      `And: ${d.clientName || "Client"} ("Client")\n` +
      `Consideration: ${d.amount || "Agreed fee schedule"}\n\n` +
      `TERMS & CONDITIONS:\n` +
      `${d.details || "1. Deliverable approvals\n2. Copyright assignment upon full settlement\n3. Confidentiality obligations."}\n\n` +
      `Authorized Signatory:\nKeedoHub Studio: ___________________  Date: __________\n` +
      `Client: ___________________________  Date: __________`,
  },
  {
    type: "schedule",
    label: "Release Schedule",
    category: "Press",
    fields: [
      { key: "fromName", label: "Artist / Brand Name" },
      { key: "subject", label: "Release Title" },
      { key: "targetDate", label: "Drop Date" },
      {
        key: "details",
        label: "Rollout Milestones (T-minus countdown)",
        multiline: true,
        placeholder: "T-21: Pre-save Launch & Teaser Video\nT-14: Tracklist Reveal & Press Push\nT-7: Official Trailer & TikTok Audio Push\nDay 0: Worldwide Drop & DSP Playlist Pitches\nT+7: Visualizer & Acoustic Variant",
      },
    ],
    body: (d) =>
      `OFFICIAL ROLLOUT SCHEDULE: ${d.subject || "Project Drop"}\n` +
      `Artist / Brand: ${d.fromName || "Artist"}\n` +
      `Drop Date: ${d.targetDate || "TBD"}\n\n` +
      `MILESTONE TIMELINE:\n` +
      `${d.details || "Chronological roadmap for digital asset release."}`,
  },
  {
    type: "epk",
    label: "EPK / One-Sheet",
    category: "Press",
    fields: [
      { key: "fromName", label: "Artist / Project Name" },
      { key: "subject", label: "Headline / Pitch Angle" },
      { key: "genre", label: "Genre & Sound Classification" },
      { key: "streamingStats", label: "Key Stats / Achievements" },
      {
        key: "details",
        label: "Artist Bio & Press Quote",
        multiline: true,
      },
    ],
    body: (d) =>
      `ELECTRONIC PRESS KIT (EPK) ONE-SHEET\n` +
      `Subject: ${d.fromName || "Artist Name"}\n` +
      `Pitch Angle: ${d.subject || "Breakout Sound of 2026"}\n` +
      `Sound: ${d.genre || "Afro-Fusion / Soul"}\n` +
      `Traction: ${d.streamingStats || "1M+ Global Streams, Featured on Spotify NMF"}\n\n` +
      `PRESS BIO & NOTABLE COVERAGE:\n` +
      `${d.details || "Editorial biography and quotes."}\n\n` +
      `Booking & Press Contact: press@keedohub.com`,
  },
];

export function templateFor(t: string): DocTemplate {
  return DOC_TEMPLATES.find((d) => d.type === t) ?? DOC_TEMPLATES[0];
}
