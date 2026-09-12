// ============================================================
// BRAND KITS — "I am good to go" experience
// Brand OS rebuild Phase 3 §4.
// Each kit moves: Not Started → In Progress → Review → Approved → Delivered
// Kit status is derived from workspace state (requests + assets + profile).
// ============================================================

export type BrandKitStatus = "Not Started" | "In Progress" | "Review" | "Approved" | "Delivered";

export interface BrandKitDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  deliverables: string[];
  requestType: string;
  dependsOn: "profile" | "identity" | "documents" | "presentation" | "none";
}

export const BRAND_KITS: BrandKitDef[] = [
  {
    id: "brand-identity-kit",
    name: "Brand Identity Kit",
    tagline: "Logo, colours, typography, guidelines",
    description: "The master identity system — logo suite, colour tokens, typography hierarchy and usage rules designed by KeedoHub Studio.",
    deliverables: ["Primary logo + variants", "Colour palette tokens", "Typography hierarchy", "Brand Guidelines PDF"],
    requestType: "brand_identity",
    dependsOn: "profile",
  },
  {
    id: "social-media-kit",
    name: "Social Media Kit",
    tagline: "Profile assets, templates, graphics",
    description: "Everything the brand needs to look professional on social — profile assets, post templates and launch graphics.",
    deliverables: ["Profile + cover assets", "Post templates (1:1, 4:5, 9:16)", "Launch graphics pack", "Caption + hashtag starter"],
    requestType: "social_content_pack",
    dependsOn: "identity",
  },
  {
    id: "business-document-kit",
    name: "Business Document Kit",
    tagline: "Letterhead, invoice, proposal, profile",
    description: "Professionally designed business documents using Brand DNA automatically — letterhead, invoice, quotation, proposal, company profile.",
    deliverables: ["Letterhead", "Invoice + Receipt", "Quotation + Proposal", "Company Profile"],
    requestType: "business_documents",
    dependsOn: "profile",
  },
  {
    id: "presentation-kit",
    name: "Presentation Kit",
    tagline: "Company, pitch, investor, sales decks",
    description: "Professionally designed presentations built from Brand DNA — company, pitch, investor and sales decks as editable presentations.",
    deliverables: ["Company Presentation", "Pitch Deck", "Investor Deck", "Sales Deck"],
    requestType: "presentation",
    dependsOn: "identity",
  },
  {
    id: "marketing-kit",
    name: "Marketing Kit",
    tagline: "Flyers, brochures, promo graphics",
    description: "Marketing materials that look like the brand — flyers, brochures, promotional and product graphics.",
    deliverables: ["Flyer set", "Brochure layout", "Promotional graphics", "Product graphics"],
    requestType: "marketing_materials",
    dependsOn: "identity",
  },
  {
    id: "digital-brand-kit",
    name: "Digital Brand Kit",
    tagline: "Website, UI, motion, email signature",
    description: "The digital face of the brand — website design direction, UI assets, motion graphics and email signature.",
    deliverables: ["Website design direction", "UI asset pack", "Logo animation / social motion", "Email signature"],
    requestType: "digital_brand",
    dependsOn: "identity",
  },
];

export const KIT_STATUS_ORDER: BrandKitStatus[] = ["Not Started", "In Progress", "Review", "Approved", "Delivered"];

export function kitStatusColor(status: BrandKitStatus): string {
  switch (status) {
    case "Delivered": return "text-emerald-300 bg-emerald-500/15 border-emerald-500/30";
    case "Approved": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "Review": return "text-purple-300 bg-purple-500/10 border-purple-500/20";
    case "In Progress": return "text-amber-300 bg-amber-500/10 border-amber-500/20";
    default: return "text-zinc-400 bg-zinc-800 border-zinc-700";
  }
}

/** Derive a kit status from completion signals. Pure + testable. */
export function deriveKitStatus(signals: {
  profileComplete: boolean;
  hasRequest: boolean;
  requestInReview: boolean;
  requestApproved: boolean;
  hasDeliveredAsset: boolean;
}): BrandKitStatus {
  if (signals.hasDeliveredAsset || signals.requestApproved) {
    // Delivered assets in Library = the strongest "good to go" signal
    return signals.hasDeliveredAsset ? "Delivered" : "Approved";
  }
  if (signals.requestInReview) return "Review";
  if (signals.hasRequest) return "In Progress";
  if (signals.profileComplete) return "In Progress";
  return "Not Started";
}
