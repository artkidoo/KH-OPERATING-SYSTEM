export type BusinessDocumentFieldType = "text" | "textarea" | "date" | "number" | "select";

export type BusinessDocumentType =
  | "company-profile"
  | "proposal"
  | "quotation"
  | "invoice"
  | "receipt"
  | "business-letter"
  | "letterhead"
  | "email-signature"
  | "business-card";

export type BusinessDocumentStyle =
  | "editorial"
  | "minimal"
  | "bold"
  | "classic"
  | "modern"
  | "studio";

export type BusinessDocumentLayout =
  | "editorial"
  | "minimal"
  | "bold"
  | "classic"
  | "modern"
  | "studio";

export interface BusinessDocumentField {
  key: string;
  label: string;
  type: BusinessDocumentFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  /** Human-readable source shown in the editor when the field is auto-filled. */
  autoFill?: string;
}

export interface BusinessDocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: "company" | "sales" | "finance" | "communication" | "identity";
  documentType?: BusinessDocumentType;
  icon: string;
  style?: BusinessDocumentStyle;
  /** Composition used by the reusable document renderer. */
  layout?: BusinessDocumentLayout;
  styleLabel?: string;
  suitedIndustries?: string[];
  fields: BusinessDocumentField[];
  isCustom?: boolean;
  enabled?: boolean;
}

export const businessDocumentTypeLabels: Record<BusinessDocumentType, string> = {
  "company-profile": "Company Profile",
  proposal: "Proposal",
  quotation: "Quotation",
  invoice: "Invoice",
  receipt: "Receipt",
  "business-letter": "Business Letter",
  letterhead: "Letterhead",
  "email-signature": "Email Signature",
  "business-card": "Business Card",
};

export const businessDocumentTypeOrder: BusinessDocumentType[] = [
  "company-profile",
  "proposal",
  "quotation",
  "invoice",
  "receipt",
  "business-letter",
  "letterhead",
  "business-card",
  "email-signature",
];

const sharedBusinessFields: BusinessDocumentField[] = [
  { key: "companyName", label: "Company name", type: "text", required: true, autoFill: "Brand OS → brand name" },
  { key: "tagline", label: "Tagline", type: "text", autoFill: "Brand OS → tagline" },
  { key: "industry", label: "Industry", type: "text", autoFill: "Brand OS → industry" },
  { key: "website", label: "Website", type: "text", placeholder: "https://yourbusiness.com", autoFill: "Workspace → website" },
  { key: "email", label: "Business email", type: "text", placeholder: "hello@yourbusiness.com", autoFill: "Account email" },
  { key: "phone", label: "Phone", type: "text", placeholder: "+1 555 0100" },
  { key: "address", label: "Business address", type: "textarea", placeholder: "Street, city, country" },
];

const contactFields: BusinessDocumentField[] = [
  { key: "recipientName", label: "Recipient name", type: "text", required: true, placeholder: "Client or contact name" },
  { key: "recipientCompany", label: "Recipient company", type: "text", placeholder: "Client company" },
  { key: "recipientEmail", label: "Recipient email", type: "text", placeholder: "client@company.com" },
];

const commercialFields: BusinessDocumentField[] = [
  { key: "reference", label: "Reference / document number", type: "text", placeholder: "DOC-001" },
  { key: "date", label: "Issue date", type: "date" },
  { key: "validUntil", label: "Valid until", type: "date" },
  { key: "currency", label: "Currency", type: "select", options: ["USD", "NGN", "GBP", "EUR"] },
  { key: "lineItems", label: "Items or services", type: "textarea", placeholder: "Service or item — quantity × unit price — total\nAdd one line per item" },
  { key: "subtotal", label: "Subtotal", type: "number", placeholder: "0.00" },
  { key: "tax", label: "Tax", type: "number", placeholder: "0.00" },
  { key: "total", label: "Total", type: "number", placeholder: "0.00" },
  { key: "paymentTerms", label: "Payment terms", type: "textarea", placeholder: "Payment due within 14 days..." },
  { key: "notes", label: "Notes", type: "textarea", placeholder: "Additional context or a thank-you note" },
];

const fieldSets: Record<BusinessDocumentType, BusinessDocumentField[]> = {
  "company-profile": [
    ...sharedBusinessFields,
    { key: "overview", label: "Company overview", type: "textarea", placeholder: "What your business does and why it matters." },
    { key: "services", label: "Products and services", type: "textarea", placeholder: "List your core offers and outcomes." },
    { key: "mission", label: "Mission and values", type: "textarea" },
  ],
  proposal: [
    ...sharedBusinessFields,
    ...contactFields,
    { key: "title", label: "Proposal title", type: "text", required: true, placeholder: "A better way to..." },
    { key: "executiveSummary", label: "Executive summary", type: "textarea" },
    { key: "scope", label: "Scope of work", type: "textarea" },
    { key: "outcomes", label: "Expected outcomes", type: "textarea" },
    { key: "investment", label: "Investment", type: "text", placeholder: "$0.00" },
    { key: "nextSteps", label: "Next steps", type: "textarea" },
  ],
  quotation: [...sharedBusinessFields, ...contactFields, ...commercialFields],
  invoice: [...sharedBusinessFields, ...contactFields, ...commercialFields.filter((field) => field.key !== "validUntil")],
  receipt: [
    ...sharedBusinessFields,
    ...contactFields,
    { key: "reference", label: "Receipt number", type: "text", placeholder: "RCPT-001" },
    { key: "date", label: "Payment date", type: "date" },
    { key: "currency", label: "Currency", type: "select", options: ["USD", "NGN", "GBP", "EUR"] },
    { key: "paymentFor", label: "Payment for", type: "textarea" },
    { key: "amountPaid", label: "Amount paid", type: "number" },
    { key: "paymentMethod", label: "Payment method", type: "text", placeholder: "Bank transfer, card, cash..." },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  "business-letter": [
    ...sharedBusinessFields,
    ...contactFields,
    { key: "date", label: "Letter date", type: "date" },
    { key: "subject", label: "Subject", type: "text", required: true, placeholder: "A clear subject line" },
    { key: "body", label: "Letter body", type: "textarea", required: true, placeholder: "Write your message..." },
    { key: "signoff", label: "Sign-off", type: "text", placeholder: "Kind regards," },
    { key: "signatory", label: "Signatory name and title", type: "text", autoFill: "Account profile" },
  ],
  letterhead: [
    ...sharedBusinessFields,
    { key: "headerLine", label: "Header line", type: "text", placeholder: "Trusted solutions. Measurable momentum." },
    { key: "footerLine", label: "Footer line", type: "text", placeholder: "Company registration • VAT number • Social handle" },
  ],
  "email-signature": [
    ...sharedBusinessFields,
    { key: "contactName", label: "Your name", type: "text", required: true, autoFill: "Account profile" },
    { key: "jobTitle", label: "Job title", type: "text", placeholder: "Founder & Director" },
    { key: "socialLinks", label: "Social links", type: "textarea", placeholder: "LinkedIn: ...\nInstagram: ..." },
  ],
  "business-card": [
    ...sharedBusinessFields,
    { key: "contactName", label: "Your name", type: "text", required: true, autoFill: "Account profile" },
    { key: "jobTitle", label: "Job title", type: "text", placeholder: "Founder & Director" },
    { key: "socialLinks", label: "Social handle", type: "text", placeholder: "@yourbusiness" },
  ],
};

type TemplateVariant = {
  style: BusinessDocumentStyle;
  layout?: BusinessDocumentLayout;
  styleLabel: string;
  name: string;
  description: string;
  suitedIndustries: string[];
};

const variants: Record<BusinessDocumentType, TemplateVariant[]> = {
  "company-profile": [
    { style: "editorial", layout: "editorial", styleLabel: "Editorial / high-trust", name: "Northstar Profile", description: "A confident narrative profile for partnerships, tenders, and stakeholder decks.", suitedIndustries: ["Consulting", "Professional services", "Technology"] },
    { style: "bold", layout: "bold", styleLabel: "Bold / founder-led", name: "Signal Profile", description: "A high-contrast, story-first profile built to make a young business memorable.", suitedIndustries: ["Startups", "Creative studios", "Consumer brands"] },
    { style: "modern", layout: "modern", styleLabel: "Modern / modular", name: "Gridline Profile", description: "A structured profile that makes services, proof points, and positioning easy to scan.", suitedIndustries: ["Agencies", "Automotive", "B2B services"] },
  ],
  proposal: [
    { style: "modern", layout: "modern", styleLabel: "Modern / modular", name: "Momentum Proposal", description: "A crisp, outcome-led proposal for moving a qualified opportunity forward.", suitedIndustries: ["Agencies", "Consulting", "Technology"] },
    { style: "editorial", layout: "editorial", styleLabel: "Editorial / high-trust", name: "Atelier Proposal", description: "A considered proposal with generous typography for premium, strategic engagements.", suitedIndustries: ["Architecture", "Creative studios", "Professional services"] },
    { style: "bold", layout: "bold", styleLabel: "Bold / founder-led", name: "Catalyst Proposal", description: "A decisive proposal format for offers that need energy, clarity, and a strong point of view.", suitedIndustries: ["Startups", "Marketing", "Consumer brands"] },
  ],
  quotation: [
    { style: "classic", styleLabel: "Classic / formal", name: "Ledger Quote", description: "A familiar, formal quote that puts scope, pricing, and terms first.", suitedIndustries: ["Trades", "Automotive", "Professional services"] },
    { style: "minimal", styleLabel: "Minimal / precise", name: "Clearline Quote", description: "A calm, spacious quote for fast approvals and straightforward buying decisions.", suitedIndustries: ["Technology", "Consulting", "Freelancers"] },
    { style: "bold", styleLabel: "Bold / commercial", name: "Counterpoint Quote", description: "A confident commercial quote designed to spotlight the total and next action.", suitedIndustries: ["Retail", "Events", "Consumer brands"] },
  ],
  invoice: [
    { style: "classic", styleLabel: "Classic / formal", name: "Balance Invoice", description: "A dependable invoice with an unmistakable payment hierarchy.", suitedIndustries: ["Professional services", "Trades", "B2B services"] },
    { style: "minimal", styleLabel: "Minimal / precise", name: "Mono Invoice", description: "A clean, low-ink invoice that keeps every line item legible.", suitedIndustries: ["Technology", "Freelancers", "Consulting"] },
    { style: "modern", styleLabel: "Modern / modular", name: "Pulse Invoice", description: "A contemporary invoice with a strong summary block for digital-first teams.", suitedIndustries: ["Startups", "Agencies", "Consumer brands"] },
  ],
  receipt: [
    { style: "minimal", styleLabel: "Minimal / precise", name: "Proof Receipt", description: "A compact receipt that makes payment confirmation feel polished and effortless.", suitedIndustries: ["Retail", "Hospitality", "Freelancers"] },
    { style: "bold", styleLabel: "Bold / branded", name: "Stamp Receipt", description: "A memorable receipt with a branded confirmation moment for customer hand-off.", suitedIndustries: ["Consumer brands", "Events", "Restaurants"] },
    { style: "classic", styleLabel: "Classic / formal", name: "Trust Receipt", description: "A traditional proof-of-payment layout for records, reimbursements, and finance teams.", suitedIndustries: ["Professional services", "Nonprofits", "B2B services"] },
  ],
  "business-letter": [
    { style: "editorial", styleLabel: "Editorial / high-trust", name: "Correspondence Letter", description: "A refined letter for important announcements, introductions, and relationship moments.", suitedIndustries: ["Professional services", "Consulting", "Nonprofits"] },
    { style: "classic", styleLabel: "Classic / formal", name: "Executive Letter", description: "A familiar formal letter with an unmistakable business rhythm.", suitedIndustries: ["Finance", "Legal", "B2B services"] },
    { style: "modern", styleLabel: "Modern / modular", name: "Openline Letter", description: "A contemporary letter that balances a warm voice with clear information design.", suitedIndustries: ["Technology", "Startups", "Creative studios"] },
  ],
  letterhead: [
    { style: "classic", styleLabel: "Classic / formal", name: "Heritage Letterhead", description: "A formal letterhead system for documents that need authority and consistency.", suitedIndustries: ["Legal", "Finance", "Professional services"] },
    { style: "bold", styleLabel: "Bold / branded", name: "Marker Letterhead", description: "A confident, high-contrast header that gives everyday correspondence presence.", suitedIndustries: ["Creative studios", "Consumer brands", "Events"] },
    { style: "minimal", styleLabel: "Minimal / precise", name: "Quiet Letterhead", description: "A restrained, modern letterhead that lets the message do the work.", suitedIndustries: ["Technology", "Architecture", "Consulting"] },
  ],
  "email-signature": [
    { style: "minimal", styleLabel: "Minimal / precise", name: "Quiet Signature", description: "A clean signature designed to look considered in every inbox.", suitedIndustries: ["Technology", "Consulting", "Freelancers"] },
    { style: "bold", styleLabel: "Bold / branded", name: "Signal Signature", description: "A compact signature with a strong brand cue and clear contact hierarchy.", suitedIndustries: ["Consumer brands", "Creative studios", "Startups"] },
    { style: "classic", styleLabel: "Classic / formal", name: "Executive Signature", description: "A formal signature for people who want dependable authority in every reply.", suitedIndustries: ["Finance", "Legal", "Professional services"] },
  ],
  "business-card": [
    { style: "bold", styleLabel: "Bold / branded", name: "Impact Card", description: "A confident card concept with a memorable front and practical contact back.", suitedIndustries: ["Consumer brands", "Creative studios", "Events"] },
    { style: "minimal", styleLabel: "Minimal / precise", name: "Essential Card", description: "A quiet, highly legible card for modern operators and service businesses.", suitedIndustries: ["Technology", "Consulting", "Freelancers"] },
    { style: "modern", styleLabel: "Modern / modular", name: "Studio Card", description: "A flexible card system that balances identity, role, and digital contact points.", suitedIndustries: ["Agencies", "Startups", "Professional services"] },
  ],
};

const categoryByType: Record<BusinessDocumentType, BusinessDocumentTemplate["category"]> = {
  "company-profile": "company",
  proposal: "sales",
  quotation: "sales",
  invoice: "finance",
  receipt: "finance",
  "business-letter": "communication",
  letterhead: "identity",
  "email-signature": "identity",
  "business-card": "identity",
};

const iconByType: Record<BusinessDocumentType, string> = {
  "company-profile": "Building2",
  proposal: "Presentation",
  quotation: "ReceiptText",
  invoice: "FileSpreadsheet",
  receipt: "BadgeCheck",
  "business-letter": "Mail",
  letterhead: "FileText",
  "email-signature": "AtSign",
  "business-card": "Contact",
};

export const defaultBusinessDocumentTemplates: BusinessDocumentTemplate[] = businessDocumentTypeOrder.flatMap((documentType) =>
  variants[documentType].map((variant, index) => ({
    id: `${documentType}-${variant.style}`,
    name: variant.name,
    description: variant.description,
    category: categoryByType[documentType],
    documentType,
    icon: iconByType[documentType],
    style: variant.style,
    layout: variant.layout || variant.style,
    styleLabel: variant.styleLabel,
    suitedIndustries: variant.suitedIndustries,
    fields: fieldSets[documentType],
    enabled: true,
    ...(index === 0 ? { isCustom: false } : {}),
  })),
);

const templateStorageKey = "keedohub_business_document_templates_v2";

export function getBusinessDocumentTemplates(): BusinessDocumentTemplate[] {
  try {
    const stored = localStorage.getItem(templateStorageKey);
    if (!stored) return defaultBusinessDocumentTemplates;
    const parsed = JSON.parse(stored) as BusinessDocumentTemplate[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultBusinessDocumentTemplates;
  } catch {
    return defaultBusinessDocumentTemplates;
  }
}

export function saveBusinessDocumentTemplates(templates: BusinessDocumentTemplate[]) {
  try {
    localStorage.setItem(templateStorageKey, JSON.stringify(templates));
  } catch {
    // Storage may be disabled; the studio still works for the current session.
  }
}

export function resetBusinessDocumentTemplates() {
  saveBusinessDocumentTemplates(defaultBusinessDocumentTemplates);
}

export const businessDocumentCategoryLabels: Record<BusinessDocumentTemplate["category"], string> = {
  company: "Company",
  sales: "Sales",
  finance: "Finance",
  communication: "Communication",
  identity: "Brand identity",
};
