import { ActiveTab, BrandCore, ProductService, Workspace, Asset, ContentItem, StudioServiceCategory } from "../types";

export type BrandIndustry =
  | "automotive"
  | "artist"
  | "startup"
  | "business"
  | "brand"
  | "creator"
  | "restaurant"
  | "other";

export type NeedStatus = "complete" | "attention" | "not_started";
export type NeedPriority = "high" | "medium" | "low";

export interface BrandNeedAnalysis {
  need: BrandNeed;
  status: NeedStatus;
  priority: NeedPriority;
  importance: "critical" | "important" | "useful";
  industryRelevance: "direct" | "relevant" | "general";
  impact: string;
  whyRecommended: string;
  action: string;
  connectedCapability: ActiveTab;
}

export interface BrandRecommendation {
  title: string;
  reason: string;
  priority: NeedPriority;
  impact: string;
  action: string;
  connectedCapability: ActiveTab;
  needId: string;
}

export interface BrandNeed {
  id: string;
  label: string;
  description: string;
  category?: BrandNeedCategory;
  recommendedFor?: BrandIndustry[];
  actionTab?: ActiveTab;
  studioServiceCategory?: StudioServiceCategory;
}

export type BrandNeedCategory =
  | "Brand Foundation"
  | "Business Documents"
  | "Digital Presence"
  | "Marketing"
  | "Sales"
  | "Growth";

export interface BrandNeedCategoryConfig {
  id: BrandNeedCategory;
  description: string;
  needs: BrandNeed[];
}

export function getCompletedNeedsStorageKey(workspaceId?: string): string {
  return `keedohub-brand-os-completed:${workspaceId || "current"}`;
}

export const brandNeedCategories: BrandNeedCategoryConfig[] = [
  {
    id: "Brand Foundation",
    description: "The core identity people recognise and trust.",
    needs: [
      { id: "logo", label: "Logo", description: "A primary logo that represents the business.", actionTab: "brand-os" },
      { id: "colors", label: "Brand Colors", description: "A consistent, documented color palette.", actionTab: "brand-os" },
      { id: "typography", label: "Typography", description: "Defined type choices for clear communication.", actionTab: "brand-os" },
      { id: "guidelines", label: "Brand Guidelines", description: "Simple rules for using the identity consistently.", actionTab: "brand-os" },
      { id: "artist-identity", label: "Artist Identity", description: "A distinct creative identity audiences can recognise.", actionTab: "artist-os", recommendedFor: ["artist"] },
      { id: "business-card", label: "Business Card", description: "A professional contact asset for conversations.", actionTab: "studio", studioServiceCategory: "business_documents", recommendedFor: ["business", "brand", "automotive"] },
      { id: "letterhead", label: "Letterhead", description: "Branded documents for formal communication.", actionTab: "studio", studioServiceCategory: "business_documents", recommendedFor: ["business", "brand", "startup", "automotive"] },
      { id: "email-signature", label: "Email Signature", description: "A consistent signature for every business email.", actionTab: "studio", studioServiceCategory: "business_documents" },
    ],
  },
  {
    id: "Business Documents",
    description: "Practical documents that help you operate professionally.",
    needs: [
      { id: "proposal", label: "Proposal", description: "A clear way to present an offer to a prospect.", actionTab: "studio", studioServiceCategory: "business_documents" },
      { id: "quotation", label: "Quotation", description: "A consistent quote for products or services.", actionTab: "studio", studioServiceCategory: "business_documents" },
      { id: "invoice", label: "Invoice", description: "A professional record of what a customer owes.", actionTab: "studio", studioServiceCategory: "business_documents" },
      { id: "receipt", label: "Receipt", description: "Proof of payment customers can keep.", actionTab: "studio", studioServiceCategory: "business_documents" },
      { id: "company-profile", label: "Company Profile", description: "A concise introduction to the business.", actionTab: "studio", studioServiceCategory: "business_documents" },
      { id: "epk", label: "Electronic Press Kit", description: "A professional profile for media, partners, and bookers.", actionTab: "epk-builder", recommendedFor: ["artist", "creator"] },
      { id: "business-letter", label: "Business Letter", description: "A reusable formal communication template.", actionTab: "studio", studioServiceCategory: "business_documents" },
    ],
  },
  {
    id: "Digital Presence",
    description: "The places customers discover and contact you.",
    needs: [
      { id: "website", label: "Website", description: "A destination that explains what you do and how to act.", actionTab: "brand-os", recommendedFor: ["business", "brand", "startup", "automotive", "restaurant"] },
      { id: "social-profiles", label: "Social Media Profiles", description: "Consistent, complete profiles where customers spend time.", actionTab: "content-engine", recommendedFor: ["artist", "creator", "automotive", "restaurant"] },
      { id: "social-media-kit", label: "Social Media Kit", description: "Reusable profile and post assets for consistent publishing.", actionTab: "content-engine", recommendedFor: ["artist", "creator"] },
      { id: "google-business", label: "Google Business Presence", description: "A discoverable local business listing.", actionTab: "brand-os" },
      { id: "whatsapp-business", label: "WhatsApp Business", description: "A direct channel for customer conversations.", actionTab: "brand-os" },
      { id: "online-catalogue", label: "Online Catalogue", description: "A clear view of products or services available.", actionTab: "brand-os", recommendedFor: ["automotive", "restaurant", "business", "brand"] },
      { id: "vehicle-catalogue", label: "Vehicle Catalogue", description: "An organised presentation of available vehicles.", actionTab: "brand-os", recommendedFor: ["automotive"] },
      { id: "online-showroom", label: "Online Showroom", description: "A digital space for customers to browse your inventory.", actionTab: "brand-os", recommendedFor: ["automotive"] },
    ],
  },
  {
    id: "Marketing",
    description: "The assets and systems that make the business visible.",
    needs: [
      { id: "social-content", label: "Social Media Content", description: "Useful, consistent content for your audience.", actionTab: "content-engine" },
      { id: "promotional-graphics", label: "Promotional Graphics", description: "Campaign-ready visuals for offers and announcements.", actionTab: "studio" },
      { id: "short-form-video", label: "Short-form Video", description: "Video assets designed for modern discovery.", actionTab: "studio", recommendedFor: ["artist", "creator", "automotive", "restaurant"] },
      { id: "vehicle-content", label: "Vehicle Content", description: "Content that makes vehicles easy to discover and compare.", actionTab: "content-engine", recommendedFor: ["automotive"] },
      { id: "campaign-creatives", label: "Campaign Creatives", description: "A coherent set of assets for a campaign.", actionTab: "brand-os" },
      { id: "content-strategy", label: "Content Strategy", description: "A purposeful plan for what to publish and why.", actionTab: "content-engine" },
      { id: "release-promotion", label: "Release Promotion", description: "A focused plan for building attention around a release.", actionTab: "artist-os", recommendedFor: ["artist"] },
    ],
  },
  {
    id: "Sales",
    description: "The tools that turn interest into customer action.",
    needs: [
      { id: "product-catalogue", label: "Product/Service Catalogue", description: "A structured view of what customers can buy.", actionTab: "brand-os", recommendedFor: ["automotive", "business", "brand", "restaurant", "startup"] },
      { id: "enquiry-system", label: "Enquiry System", description: "A reliable path from question to response.", actionTab: "brand-os" },
      { id: "whatsapp-enquiries", label: "WhatsApp Enquiries", description: "A direct route for customers to ask about availability.", actionTab: "brand-os", recommendedFor: ["automotive"] },
      { id: "customer-follow-up", label: "Customer Follow-up", description: "A repeatable way to keep conversations moving.", actionTab: "workflow", recommendedFor: ["automotive", "business", "brand", "restaurant", "startup"] },
      { id: "sales-materials", label: "Sales Materials", description: "Helpful proof and information for buying decisions.", actionTab: "brand-os" },
    ],
  },
  {
    id: "Growth",
    description: "Foundations for learning, reach, and sustainable growth.",
    needs: [
      { id: "search-visibility", label: "Search Visibility", description: "Ways for people to find the business when they need it.", actionTab: "brand-os" },
      { id: "advertising", label: "Advertising", description: "A considered way to reach new audiences.", actionTab: "brand-os" },
      { id: "analytics", label: "Analytics", description: "Measurement that informs better decisions.", actionTab: "analytics" },
      { id: "customer-insights", label: "Customer Insights", description: "Knowledge of who buys and what they need.", actionTab: "creative-brain" },
      { id: "growth-strategy", label: "Growth Strategy", description: "A focused plan for the next stage of the business.", actionTab: "brand-os" },
    ],
  },
];

const industryAliases: Record<string, BrandIndustry> = {
  automotive: "automotive",
  automotive_business: "automotive",
  artist: "artist",
  musician: "artist",
  startup: "startup",
  business: "business",
  brand: "brand",
  creator: "creator",
  restaurant: "restaurant",
};

export function getBrandIndustry(workspace?: Workspace | null, brandCore?: BrandCore | null): BrandIndustry {
  const value = (brandCore?.industry || workspace?.genreOrNiche || "").toLowerCase().trim();
  return industryAliases[value] || (workspace?.identityType === "artist" ? "artist" : "other");
}

export function getIndustryLabel(industry?: BrandIndustry): string {
  if (!industry) return "General / Other";
  return industry === "artist" ? "Artist / Musician" : industry.charAt(0).toUpperCase() + industry.slice(1);
}

export function getNeedStatus(
  need: BrandNeed,
  data: { workspace?: Workspace | null; brandCore?: BrandCore | null; products: ProductService[]; assets: Asset[]; contentItems: ContentItem[] },
): NeedStatus {
  const { workspace, brandCore, products, assets, contentItems } = data;
  const has = (value: unknown) => Boolean(value);
  const locallyCompleted = typeof window !== "undefined"
    ? JSON.parse(window.localStorage.getItem(getCompletedNeedsStorageKey(workspace?.id)) || "[]") as string[]
    : [];
  const checks: Record<string, boolean> = {
    logo: has(brandCore?.logoAssets?.primaryLogoUrl),
    colors: Boolean(brandCore?.colorPalette?.length),
    typography: Boolean(brandCore?.typographyPairing?.heading && brandCore?.typographyPairing?.body),
    guidelines: has(brandCore?.brandGuidelinesText),
    website: has(workspace?.website),
    "social-content": contentItems.length > 0,
    "product-catalogue": products.length > 0,
    "campaign-creatives": assets.some((asset) => asset.category === "brand" || asset.category === "image"),
    "content-strategy": Boolean(contentItems.length && brandCore?.visualDirection?.aestheticKeywords?.length),
    analytics: false,
    "customer-insights": false,
  };
  if (checks[need.id] || locallyCompleted.includes(need.id)) return "complete";
  const hasPartialFoundation = Boolean(brandCore) && ["logo", "colors", "typography", "guidelines"].includes(need.id);
  const hasPartialStrategy = Boolean(contentItems.length) && ["content-strategy", "social-content"].includes(need.id);
  if (hasPartialFoundation || hasPartialStrategy) return "attention";
  return "not_started";
}

export function getRecommendedNeeds(industry: BrandIndustry): BrandNeed[] {
  return brandNeedCategories.flatMap((category) =>
    category.needs.filter((need) => need.recommendedFor?.includes(industry) || ["letterhead", "social-profiles", "whatsapp-business"].includes(need.id)),
  );
}

const criticalNeeds = new Set(["logo", "colors", "typography", "guidelines", "company-profile", "website", "product-catalogue"]);
const importantNeeds = new Set(["business-card", "letterhead", "email-signature", "proposal", "quotation", "invoice", "social-profiles", "whatsapp-business", "online-catalogue", "social-content", "promotional-graphics", "campaign-creatives", "content-strategy", "enquiry-system", "customer-follow-up", "sales-materials"]);

const industryImpacts: Partial<Record<BrandIndustry, Record<string, string>>> = {
  automotive: {
    "product-catalogue": "Customers can compare what is available and enquire with confidence.",
    "online-catalogue": "A clear inventory helps buyers discover the right vehicle faster.",
    "customer-follow-up": "Fast, consistent follow-up protects high-value sales opportunities.",
    "whatsapp-business": "A direct enquiry channel meets buyers where they already communicate.",
  },
  artist: {
    "social-profiles": "Consistent profiles make it easier for listeners, partners, and media to find you.",
    epk: "A professional EPK gives media and booking partners one reliable source of information.",
  },
};

export function analyzeBrandNeed(
  need: BrandNeed,
  industry: BrandIndustry,
  data: { workspace?: Workspace | null; brandCore?: BrandCore | null; products: ProductService[]; assets: Asset[]; contentItems: ContentItem[] },
): BrandNeedAnalysis {
  const status = getNeedStatus(need, data);
  const relevance = need.recommendedFor?.includes(industry) ? "direct" : need.recommendedFor?.length ? "general" : "relevant";
  const importance = criticalNeeds.has(need.id) ? "critical" : importantNeeds.has(need.id) ? "important" : "useful";
  const goal = (data.brandCore?.positioning?.valueProposition || data.workspace?.bio || "").toLowerCase();
  const goalConnected = (goal.includes("customer") || goal.includes("sales") || goal.includes("grow") || goal.includes("visibility"))
    && ["website", "social-profiles", "product-catalogue", "online-catalogue", "enquiry-system", "customer-follow-up", "sales-materials", "social-content"].includes(need.id);
  const priority: NeedPriority = status === "complete"
    ? "low"
    : importance === "critical" || goalConnected || (relevance === "direct" && importance === "important")
      ? "high"
      : importance === "important" || relevance === "direct" ? "medium" : "low";
  const impact = industryImpacts[industry]?.[need.id] || need.description;
  return {
    need,
    status,
    priority,
    importance,
    industryRelevance: relevance,
    impact,
    whyRecommended: goalConnected
      ? "This connects directly to the business outcome described in your profile."
      : relevance === "direct"
      ? `This is especially relevant to ${getIndustryLabel(industry).toLowerCase()} businesses.`
      : importance === "critical" ? "This is a core foundation that makes later marketing and sales work more effective." : "This strengthens how professionally customers experience your business.",
    action: `Create ${need.label}`,
    connectedCapability: need.actionTab || "brand-os",
  };
}

export function getBrandRecommendations(analyses: BrandNeedAnalysis[]): BrandRecommendation[] {
  return analyses
    .filter((analysis) => analysis.status !== "complete")
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.priority] - rank[b.priority] || (a.industryRelevance === "direct" ? -1 : 1);
    })
    .map((analysis) => ({
      title: analysis.action,
      reason: analysis.whyRecommended,
      priority: analysis.priority,
      impact: analysis.impact,
      action: analysis.action,
      connectedCapability: analysis.connectedCapability,
      needId: analysis.need.id,
    }));
}
