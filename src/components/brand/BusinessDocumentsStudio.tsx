import React, { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Contact,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Heart,
  Mail,
  Pencil,
  Presentation,
  ReceiptText,
  RefreshCw,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  BusinessDocumentField,
  BusinessDocumentStyle,
  BusinessDocumentTemplate,
  BusinessDocumentType,
  businessDocumentTypeLabels,
  businessDocumentTypeOrder,
  getBusinessDocumentTemplates,
} from "../../data/businessDocuments";

interface SavedBusinessDocument {
  id: string;
  templateId: string;
  title: string;
  values: Record<string, string>;
  updatedAt: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Presentation,
  ReceiptText,
  FileSpreadsheet,
  BadgeCheck,
  Mail,
  FileText,
  AtSign,
  Contact,
};

const favoriteStorageKey = (workspaceId?: string) => `keedohub_business_document_favorites_${workspaceId || "guest"}`;
const savedStorageKey = (workspaceId?: string) => `keedohub_business_documents_${workspaceId || "guest"}`;
const today = () => new Date().toISOString().slice(0, 10);

function safeRead<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The editor remains usable when browser storage is disabled.
  }
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

function getType(template: BusinessDocumentTemplate): BusinessDocumentType {
  return template.documentType || "company-profile";
}

function getStyle(template: BusinessDocumentTemplate): BusinessDocumentStyle {
  return template.style || "minimal";
}

const styleAccent: Record<BusinessDocumentStyle, string> = {
  editorial: "#b45309",
  minimal: "#475569",
  bold: "#e11d48",
  classic: "#1d4ed8",
  modern: "#0f766e",
  studio: "#7c3aed",
};

const styleSurface: Record<BusinessDocumentStyle, string> = {
  editorial: "#fffbeb",
  minimal: "#ffffff",
  bold: "#18181b",
  classic: "#f8fafc",
  modern: "#f0fdfa",
  studio: "#1e1b4b",
};

export const BusinessDocumentsStudio: React.FC<{
  onNotify?: (message: string, type?: "success" | "info" | "error") => void;
}> = ({ onNotify }) => {
  const { activeWorkspace, user } = useAuth();
  const { workspace, brandCore } = useWorkspace();
  const [templates, setTemplates] = useState<BusinessDocumentTemplate[]>(getBusinessDocumentTemplates);
  const [activeType, setActiveType] = useState<"all" | BusinessDocumentType>("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState("company-profile-editorial");
  const [values, setValues] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedDocuments, setSavedDocuments] = useState<SavedBusinessDocument[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<BusinessDocumentTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(true);

  const availableTemplates = useMemo(() => templates.filter((template) => template.enabled !== false), [templates]);
  const selectedTemplate = availableTemplates.find((template) => template.id === selectedTemplateId) || availableTemplates[0];
  const accent = brandCore?.colorPalette?.[0]?.hex || "#dc2626";
  const headingFont = brandCore?.typographyPairing?.heading || "Space Grotesk";
  const bodyFont = brandCore?.typographyPairing?.body || "Plus Jakarta Sans";
  const brandValues = useMemo(() => ({
    companyName: brandCore?.brandName || workspace?.name || "Your Business",
    tagline: brandCore?.tagline || "",
    industry: brandCore?.industry || workspace?.genreOrNiche || "",
    website: workspace?.website || "",
    email: user?.email || "",
    date: today(),
    currency: "USD",
    contactName: user?.fullName || "",
    signatory: user?.fullName || "",
    overview: brandCore?.positioning?.positioningStatement || workspace?.bio || "",
    mission: brandCore?.positioning?.valueProposition || "",
    services: brandCore?.positioning?.uniqueSellingPoints?.join("\n") || "",
  }), [brandCore, user, workspace]);

  const createValues = (template: BusinessDocumentTemplate) => template.fields.reduce<Record<string, string>>((result, field) => {
    result[field.key] = brandValues[field.key as keyof typeof brandValues] || "";
    return result;
  }, {});

  useEffect(() => {
    setFavorites(safeRead<string[]>(favoriteStorageKey(activeWorkspace?.id), []));
    setSavedDocuments(safeRead<SavedBusinessDocument[]>(savedStorageKey(activeWorkspace?.id), []));
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (!selectedTemplate) return;
    setValues((current) => {
      if (!Object.keys(current).length) return createValues(selectedTemplate);
      const next = { ...current };
      selectedTemplate.fields.forEach((field) => {
        if (field.autoFill && (!current[field.key] || field.key === "companyName" || field.key === "tagline" || field.key === "industry")) {
          next[field.key] = brandValues[field.key as keyof typeof brandValues] || "";
        }
      });
      return next;
    });
    // Values intentionally refresh when Brand OS changes so the selected template stays connected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, brandValues]);

  useEffect(() => {
    const refreshTemplates = () => setTemplates(getBusinessDocumentTemplates());
    window.addEventListener("keedohub:business-templates-updated", refreshTemplates);
    return () => window.removeEventListener("keedohub:business-templates-updated", refreshTemplates);
  }, []);

  const filteredTemplates = useMemo(() => availableTemplates.filter((template) => {
    const matchesType = activeType === "all" || getType(template) === activeType;
    const matchesFavorite = !showFavoritesOnly || favorites.includes(template.id);
    return matchesType && matchesFavorite;
  }), [activeType, availableTemplates, favorites, showFavoritesOnly]);

  const selectTemplate = (template: BusinessDocumentTemplate) => {
    setSelectedTemplateId(template.id);
    setValues(createValues(template));
    setSavedId(null);
  };

  const toggleFavorite = (templateId: string) => {
    const next = favorites.includes(templateId) ? favorites.filter((id) => id !== templateId) : [...favorites, templateId];
    setFavorites(next);
    safeWrite(favoriteStorageKey(activeWorkspace?.id), next);
  };

  const persistDocuments = (documents: SavedBusinessDocument[]) => {
    setSavedDocuments(documents);
    safeWrite(savedStorageKey(activeWorkspace?.id), documents);
  };

  const updateValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const saveDocument = () => {
    if (!selectedTemplate) return;
    const missing = selectedTemplate.fields.find((field) => field.required && !values[field.key]?.trim());
    if (missing) {
      onNotify?.(`Add ${missing.label} before saving.`, "error");
      return;
    }
    const title = values.title || values.subject || values.companyName || selectedTemplate.name;
    const document: SavedBusinessDocument = {
      id: savedId || `${selectedTemplate.id}-${Date.now()}`,
      templateId: selectedTemplate.id,
      title,
      values,
      updatedAt: new Date().toISOString(),
    };
    persistDocuments([document, ...savedDocuments.filter((item) => item.id !== document.id)]);
    setSavedId(document.id);
    onNotify?.(`${selectedTemplate.name} saved to this workspace.`, "success");
  };

  const loadDocument = (document: SavedBusinessDocument) => {
    setSelectedTemplateId(document.templateId);
    setValues(document.values);
    setSavedId(document.id);
    setShowSaved(false);
  };

  const refreshBrandValues = () => {
    if (!selectedTemplate) return;
    setValues((current) => ({ ...current, ...createValues(selectedTemplate) }));
    onNotify?.("Brand OS information refreshed in this document.", "success");
  };

  const exportDocument = (format: "html" | "json") => {
    if (!selectedTemplate) return;
    const baseName = (values.title || values.companyName || selectedTemplate.name).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
    if (format === "json") {
      downloadFile(`${baseName || "business-document"}.json`, JSON.stringify({ template: selectedTemplate, values }, null, 2), "application/json");
      onNotify?.("Editable document data downloaded.", "success");
      return;
    }
    const documentSections = selectedTemplate.fields.filter((field) => values[field.key]?.trim()).map((field) =>
      `<section><h3>${escapeHtml(field.label)}</h3><p>${escapeHtml(values[field.key]).replace(/\n/g, "<br />")}</p></section>`).join("");
    const documentAccent = styleAccent[getStyle(selectedTemplate)] || accent;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(values.companyName || selectedTemplate.name)}</title><style>body{font-family:${bodyFont},Arial,sans-serif;color:#1f2937;max-width:860px;margin:48px auto;padding:0 32px}header{border-bottom:5px solid ${documentAccent};padding:28px 0;margin-bottom:30px}h1{font-family:${headingFont},Arial,sans-serif;margin:0 0 8px}h2{color:${documentAccent};font-size:13px;text-transform:uppercase;letter-spacing:.14em}section{margin:22px 0}h3{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin:0 0 6px}p{line-height:1.65;margin:0}</style></head><body><header><h1>${escapeHtml(values.companyName || "Your Business")}</h1><p>${escapeHtml(values.tagline || values.industry || "")}</p><h2>${escapeHtml(selectedTemplate.name)}</h2></header>${documentSections}</body></html>`;
    downloadFile(`${baseName || "business-document"}.html`, html, "text/html");
    onNotify?.("Print-ready HTML downloaded. Open it and choose Print → Save as PDF.", "success");
  };

  if (!selectedTemplate) {
    return <div className="rounded-2xl border border-[var(--bento-border)] p-10 text-center text-[var(--bento-muted)]">No document templates are enabled. Ask an admin to enable a template.</div>;
  }

  return (
    <div className="min-w-0 max-w-full space-y-8 overflow-hidden" id="business-documents-studio">
      <header className="relative overflow-hidden rounded-3xl bento-card p-6 sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--accent-light)] blur-3xl" />
        <div className="relative flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="bento-pill"><Sparkles className="h-3.5 w-3.5" /> Business Documents Studio</span>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300">Brand OS connected</span>
            </div>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-[var(--bento-text)] sm:text-4xl">Make every business touchpoint feel unmistakably yours.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--bento-muted)]">Explore a curated library of ready-to-edit business documents. Every template inherits your Brand OS name, logo, palette, typography, and contact details.</p>
          </div>
          <div className="flex min-w-0 shrink-0 flex-wrap gap-2">
            <button onClick={() => setShowFavoritesOnly((current) => !current)} className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${showFavoritesOnly ? "border-[var(--accent-border)] bg-[var(--accent-light)] text-theme-accent" : "border-[var(--bento-border)] bg-[var(--bento-card)] text-[var(--bento-muted)] hover:text-[var(--bento-text)]"}`}><Star className="h-4 w-4" fill={showFavoritesOnly ? "currentColor" : "none"} /> Favorites {favorites.length ? `(${favorites.length})` : ""}</button>
            <button onClick={() => setShowSaved((open) => !open)} className="flex items-center gap-2 rounded-xl border border-[var(--bento-border)] bg-[var(--bento-card)] px-3.5 py-2.5 text-xs font-bold text-[var(--bento-text)] hover:border-[var(--accent-border)]"><Save className="h-4 w-4" /> Saved {savedDocuments.length ? `(${savedDocuments.length})` : ""}</button>
          </div>
        </div>
      </header>

      {showSaved && <SavedDocumentsPanel documents={savedDocuments} templates={templates} onLoad={loadDocument} onDelete={(id) => persistDocuments(savedDocuments.filter((item) => item.id !== id))} />}

      <section aria-label="Template library" className="space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[11px] font-black uppercase tracking-[.18em] text-theme-accent">Template library</p><h2 className="mt-1 text-2xl font-black text-[var(--bento-text)]">Choose your starting point</h2></div>
          <span className="w-fit rounded-full bg-[var(--bento-card)] px-3 py-1.5 text-[11px] font-bold text-[var(--bento-muted)]">{filteredTemplates.length} of {availableTemplates.length} templates</span>
        </div>
        <div role="tablist" aria-label="Document categories" className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["all", ...businessDocumentTypeOrder] as ("all" | BusinessDocumentType)[]).map((type) => (
            <button key={type} role="tab" aria-selected={activeType === type} onClick={() => setActiveType(type)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${activeType === type ? "bg-theme-accent text-white font-bold shadow-xs" : "bg-[var(--bento-card)] border border-[var(--bento-border)] text-[var(--bento-muted)] hover:text-[var(--bento-text)]"}`}>{type === "all" ? "All" : businessDocumentTypeLabels[type]}</button>
          ))}
        </div>
        {filteredTemplates.length === 0 ? <div className="rounded-2xl border border-dashed border-[var(--bento-border)] p-8 text-center text-sm text-[var(--bento-muted)] sm:p-10">No favorites in this view yet. Tap the star on any template to save it.</div> : <div className="grid min-w-0 grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">{filteredTemplates.map((template) => <TemplateCard key={template.id} template={template} values={values} brandCore={brandCore} headingFont={headingFont} bodyFont={bodyFont} isFavorite={favorites.includes(template.id)} isSelected={template.id === selectedTemplate.id} onFavorite={() => toggleFavorite(template.id)} onPreview={() => setPreviewTemplate(template)} onUse={() => selectTemplate(template)} />)}</div>}
      </section>

      <section id="business-document-editor" className="bento-card scroll-mt-8 space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[var(--bento-border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <button type="button" aria-expanded={isEditorOpen} aria-controls="business-document-editor-content" onClick={() => setIsEditorOpen((open) => !open)} className="min-w-0 text-left cursor-pointer">
            <div className="flex flex-wrap items-center gap-2"><Pencil className="h-4 w-4 text-theme-accent" /><p className="text-[11px] font-black uppercase tracking-[.16em] text-theme-accent">Editor</p><span className="rounded-full bg-[var(--accent-light)] px-2 py-1 text-[10px] font-bold text-theme-accent">{selectedTemplate.styleLabel || "Brand-ready style"}</span><ChevronDown className={`h-4 w-4 text-[var(--bento-muted)] transition-transform ${isEditorOpen ? "rotate-180" : ""}`} /></div>
            <h2 className="mt-1 text-2xl font-black text-[var(--bento-text)]">{selectedTemplate.name}</h2><p className="mt-1 text-xs text-[var(--bento-muted)]">{selectedTemplate.description}</p>
          </button>
          <div className="flex flex-wrap gap-2"><button onClick={refreshBrandValues} className="flex items-center gap-2 rounded-xl border border-[var(--bento-border)] px-3 py-2 text-xs font-bold text-[var(--bento-muted)] hover:text-[var(--bento-text)]"><RefreshCw className="h-3.5 w-3.5" /> Refresh Brand OS</button><button onClick={() => setIsEditorOpen(true)} className="flex items-center gap-2 rounded-xl border border-[var(--bento-border)] px-3 py-2 text-xs font-bold text-[var(--bento-muted)] hover:text-[var(--bento-text)]"><Pencil className="h-3.5 w-3.5" /> {isEditorOpen ? "Editing" : "Open editor"}</button><button onClick={() => exportDocument("json")} className="flex items-center gap-2 rounded-xl border border-[var(--bento-border)] px-3 py-2 text-xs font-bold text-[var(--bento-muted)] hover:text-[var(--bento-text)]"><Download className="h-3.5 w-3.5" /> JSON</button><button onClick={saveDocument} className="flex items-center gap-2 rounded-xl bg-theme-accent px-4 py-2 text-xs font-black shadow-lg hover:bg-theme-accent"><Save className="h-3.5 w-3.5" /> Save document</button></div>
        </div>
        {isEditorOpen && <div id="business-document-editor-content" className="grid gap-6 xl:grid-cols-[minmax(280px,.8fr)_minmax(460px,1.2fr)]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-light)] p-3 text-xs leading-5 text-[var(--bento-muted)]"><span className="font-bold text-theme-accent">Editable content, protected design.</span> Change the fields below while the selected template keeps its layout, typography, and brand styling.</div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">{selectedTemplate.fields.map((field) => <DocumentField key={field.key} field={field} value={values[field.key] || ""} onChange={(value) => updateValue(field.key, value)} />)}</div>
          </div>
          <div className="rounded-2xl border border-[var(--bento-border)] bg-[var(--bento-bg)] p-3 sm:p-5"><DocumentCanvas template={selectedTemplate} values={values} brandCore={brandCore} headingFont={headingFont} bodyFont={bodyFont} accent={accent} /><button onClick={() => exportDocument("html")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black text-white transition hover:brightness-110" style={{ backgroundColor: accent }}><Download className="h-4 w-4" /> Download print-ready HTML</button>{savedId && <p className="mt-2 text-center text-[10px] font-bold text-emerald-400"><Check className="mr-1 inline h-3 w-3" /> Saved to this workspace</p>}</div>
        </div>}
      </section>

      {previewTemplate && <PreviewModal template={previewTemplate} values={previewTemplate.id === selectedTemplate.id ? values : createValues(previewTemplate)} brandCore={brandCore} headingFont={headingFont} bodyFont={bodyFont} onClose={() => setPreviewTemplate(null)} onUse={() => { selectTemplate(previewTemplate); setPreviewTemplate(null); document.getElementById("business-document-editor")?.scrollIntoView({ behavior: "smooth" }); }} />}
    </div>
  );
};

const TemplateCard: React.FC<{
  template: BusinessDocumentTemplate;
  values: Record<string, string>;
  brandCore: any;
  headingFont: string;
  bodyFont: string;
  isFavorite: boolean;
  isSelected: boolean;
  onFavorite: () => void;
  onPreview: () => void;
  onUse: () => void;
}> = ({ template, values, brandCore, headingFont, bodyFont, isFavorite, isSelected, onFavorite, onPreview, onUse }) => {
  const Icon = iconMap[template.icon] || FileText;
  const businessIndustry = String(brandCore?.industry || "").toLowerCase();
  const isRecommended = Boolean(businessIndustry && (template.suitedIndustries || []).some((industry) => businessIndustry.includes(industry.toLowerCase()) || industry.toLowerCase().includes(businessIndustry)));
  return <article className={`group bento-card flex min-w-0 h-full flex-col overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--accent-border)] ${isSelected ? "border-[var(--accent-border)] ring-1 ring-[var(--accent-border)]" : ""}`}>
    <div className="relative aspect-[1.4/1] min-h-[190px] overflow-hidden bg-[var(--bento-elevated)] p-3 sm:p-4"><div className="pointer-events-none mx-auto h-full max-w-[330px] origin-top scale-[.78] sm:scale-[.84]"><DocumentCanvas template={template} values={values} brandCore={brandCore} headingFont={headingFont} bodyFont={bodyFont} accent={brandCore?.colorPalette?.[0]?.hex || styleAccent[getStyle(template)]} compact /></div><div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2"><div className="flex min-w-0 flex-wrap gap-1.5"><span className="flex items-center gap-1.5 rounded-full bg-[var(--bento-card)]/90 px-2.5 py-1 text-[10px] font-bold text-[var(--bento-text)] shadow-sm"><Icon className="h-3 w-3 shrink-0 text-theme-accent" /> {template.styleLabel?.split(" / ")[0] || "Brand-ready"}</span>{isRecommended && <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[9px] font-black text-white">For your industry</span>}</div><button aria-label={`${isFavorite ? "Remove" : "Add"} ${template.name} favorite`} aria-pressed={isFavorite} onClick={onFavorite} className={`shrink-0 rounded-full border p-2.5 transition hover:scale-105 ${isFavorite ? "border-amber-400/40 bg-amber-400 text-amber-950" : "border-[var(--bento-border)] bg-[var(--bento-card)] text-[var(--bento-muted)] hover:text-[var(--bento-text)]"}`}><Heart className="h-3.5 w-3.5" fill={isFavorite ? "currentColor" : "none"} /></button></div></div>
    <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4"><div><div className="flex items-start justify-between gap-2"><h3 className="min-w-0 text-sm font-black leading-tight text-[var(--bento-text)] sm:text-base">{template.name}</h3>{isSelected && <span className="shrink-0 rounded-full bg-[var(--accent-light)] px-2 py-1 text-[9px] font-black uppercase tracking-wide text-theme-accent">In use</span>}</div><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-theme-accent sm:text-[10px]">{template.styleLabel?.split(" / ")[0] || "Brand-ready"} · {businessDocumentTypeLabels[getType(template)]}</p><p className="mt-1.5 min-h-10 text-[11px] leading-5 text-[var(--bento-muted)] sm:text-xs">{template.description}</p></div><div className="flex min-h-8 flex-wrap content-start gap-1.5">{(template.suitedIndustries || []).map((industry) => <span key={industry} className="rounded-md bg-[var(--bento-bg)] px-2 py-1 text-[9px] font-bold text-[var(--bento-subtle)]">{industry}</span>)}</div><div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row"><button onClick={onPreview} className="flex min-h-10 w-full min-w-0 items-center justify-center gap-1 rounded-xl border border-[var(--bento-border)] px-2 py-2 text-[10px] font-bold text-[var(--bento-muted)] transition hover:border-[var(--accent-border)] hover:text-[var(--bento-text)] sm:min-h-11 sm:flex-1 sm:gap-1.5 sm:px-3 sm:py-2.5 sm:text-xs"><Eye className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Preview</span></button><button onClick={onUse} className="flex min-h-10 w-full min-w-0 items-center justify-center gap-1 rounded-xl bg-theme-accent px-2 py-2 text-[10px] font-black text-white transition hover:brightness-110 sm:min-h-11 sm:flex-1 sm:gap-1.5 sm:px-3 sm:py-2.5 sm:text-xs"><span className="truncate">Use template</span> <ChevronRight className="h-3.5 w-3.5 shrink-0" /></button></div></div>
  </article>;
};

const DocumentField: React.FC<{ field: BusinessDocumentField; value: string; onChange: (value: string) => void }> = ({ field, value, onChange }) => <label className="space-y-1.5"><span className="flex items-center justify-between gap-2 text-xs font-bold text-[var(--bento-text)]">{field.label}{field.required && <span className="text-rose-400">*</span>}{field.autoFill && <span className="text-[10px] font-normal text-emerald-400">Brand OS</span>}</span>{field.type === "textarea" ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={field.key === "body" || field.key === "scope" || field.key === "lineItems" ? 5 : 3} placeholder={field.placeholder} className="w-full resize-y rounded-xl border border-[var(--bento-border)] bg-[var(--bento-bg)] px-3 py-2.5 text-xs text-[var(--bento-text)] placeholder:text-[var(--bento-subtle)] outline-none transition focus:border-[var(--accent-color)]" /> : field.type === "select" ? <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-[var(--bento-border)] bg-[var(--bento-bg)] px-3 py-2.5 text-xs text-[var(--bento-text)] outline-none focus:border-[var(--accent-color)]">{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input type={field.type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} className="w-full rounded-xl border border-[var(--bento-border)] bg-[var(--bento-bg)] px-3 py-2.5 text-xs text-[var(--bento-text)] placeholder:text-[var(--bento-subtle)] outline-none transition focus:border-[var(--accent-color)]" />}</label>;

const SavedDocumentsPanel: React.FC<{ documents: SavedBusinessDocument[]; templates: BusinessDocumentTemplate[]; onLoad: (document: SavedBusinessDocument) => void; onDelete: (id: string) => void }> = ({ documents, templates, onLoad, onDelete }) => <section className="rounded-2xl border border-[var(--bento-border)] bg-[var(--bento-card)] p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black text-[var(--bento-text)]">Saved documents</h2><span className="text-[11px] text-[var(--bento-muted)]">Workspace copies</span></div>{documents.length === 0 ? <p className="text-xs text-[var(--bento-muted)]">Save an edited document to see it here.</p> : <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-2 rounded-xl border border-[var(--bento-border)] bg-[var(--bento-bg)] p-3"><button onClick={() => onLoad(document)} className="min-w-0 text-left"><span className="block truncate text-xs font-bold text-[var(--bento-text)]">{document.title}</span><span className="mt-1 block truncate text-[10px] text-[var(--bento-muted)]">{templates.find((template) => template.id === document.templateId)?.name || "Template"} · {new Date(document.updatedAt).toLocaleDateString()}</span></button><button onClick={() => onDelete(document.id)} className="rounded-lg p-1.5 text-[var(--bento-muted)] hover:bg-rose-500/10 hover:text-rose-400" title="Delete saved document"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div>}</section>;

const PreviewModal: React.FC<{ template: BusinessDocumentTemplate; values: Record<string, string>; brandCore: any; headingFont: string; bodyFont: string; onClose: () => void; onUse: () => void }> = ({ template, values, brandCore, headingFont, bodyFont, onClose, onUse }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${template.name} preview`}><div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--bento-border)] bg-[var(--bento-card)] shadow-2xl"><div className="flex items-center justify-between border-b border-[var(--bento-border)] p-4 sm:p-5"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-theme-accent">Template preview</p><h2 className="mt-1 text-lg font-black text-[var(--bento-text)]">{template.name}</h2></div><button onClick={onClose} className="rounded-xl p-2 text-[var(--bento-muted)] hover:bg-[var(--bento-bg)] hover:text-[var(--bento-text)]" aria-label="Close preview"><X className="h-5 w-5" /></button></div><div className="flex-1 overflow-auto bg-[var(--bento-bg)] p-5 sm:p-10"><DocumentCanvas template={template} values={values} brandCore={brandCore} headingFont={headingFont} bodyFont={bodyFont} accent={brandCore?.colorPalette?.[0]?.hex || styleAccent[getStyle(template)]} /></div><div className="flex flex-wrap justify-end gap-2 border-t border-[var(--bento-border)] p-4"><button onClick={onClose} className="rounded-xl border border-[var(--bento-border)] px-4 py-2.5 text-xs font-bold text-[var(--bento-muted)]">Close</button><button onClick={onUse} className="rounded-xl bg-theme-accent px-4 py-2.5 text-xs font-black text-white hover:brightness-110">Use this template</button></div></div></div>;

const DocumentCanvas: React.FC<{ template: BusinessDocumentTemplate; values: Record<string, string>; brandCore: any; headingFont: string; bodyFont: string; accent: string; compact?: boolean }> = ({ template, values, brandCore, headingFont, bodyFont, accent, compact = false }) => {
  const style = getStyle(template);
  const layout = template.layout || style;
  const type = getType(template);
  const logo = brandCore?.logoAssets?.primaryLogoUrl;
  const company = values.companyName || "Your Business";
  const title = values.title || values.subject || businessDocumentTypeLabels[type];
  const contentFields = template.fields.filter((field) => values[field.key]?.trim() && !["companyName", "tagline", "industry", "website", "email", "phone", "address", "date", "currency"].includes(field.key));
  const infoFields = contentFields.slice(0, compact ? 3 : 7);
  const cardType = type === "business-card";
  const signatureType = type === "email-signature";
  const foreground = style === "bold" || style === "studio" ? "#ffffff" : "#111827";
  const muted = style === "bold" || style === "studio" ? "rgba(255,255,255,.62)" : "#64748b";
  const surface = styleSurface[style];
  const fieldPreview = (field: BusinessDocumentField) => <div key={field.key}><p className="text-[9px] font-black uppercase tracking-widest" style={{ color: muted }}>{field.label}</p><p className="mt-1 whitespace-pre-line text-xs leading-5" style={{ color: style === "bold" || style === "studio" ? "rgba(255,255,255,.86)" : "#334155" }}>{values[field.key]}</p></div>;
  const previewFields = infoFields.map(fieldPreview);
  if (cardType) return <div className="mx-auto flex aspect-[1.75/1] w-full max-w-[700px] overflow-hidden rounded-xl shadow-xl" style={{ background: style === "bold" ? `linear-gradient(130deg, ${accent}, #18181b)` : surface, color: foreground, fontFamily: bodyFont }}><div className="flex w-1/2 flex-col justify-between p-5 sm:p-8" style={{ borderRight: `1px solid ${style === "bold" ? "rgba(255,255,255,.22)" : "#e2e8f0"}` }}><div className="flex items-center gap-2">{logo ? <img src={logo} alt="" className="max-h-6 max-w-24 object-contain" /> : <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white" style={{ backgroundColor: accent }}>{company.charAt(0)}</span>}<span className="truncate text-[10px] font-bold uppercase tracking-wider" style={{ color: muted }}>{company}</span></div><div><p className="text-sm font-black sm:text-xl" style={{ fontFamily: headingFont }}>{values.contactName || "Your Name"}</p><p className="mt-1 text-[10px]" style={{ color: muted }}>{values.jobTitle || "Founder & Director"}</p></div></div><div className="flex w-1/2 flex-col justify-end gap-1.5 p-5 text-[9px] sm:p-8 sm:text-[11px]" style={{ color: muted }}><span>{values.email || "hello@yourbusiness.com"}</span><span>{values.phone || "+1 555 0100"}</span><span>{values.website || "yourbusiness.com"}</span><span>{values.socialLinks || "@yourbusiness"}</span></div></div>;
  if (signatureType) return <div className="mx-auto w-full max-w-[700px] rounded-xl p-6 shadow-xl" style={{ background: surface, color: foreground, fontFamily: bodyFont, borderTop: `5px solid ${accent}` }}><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: accent }}>{logo ? <img src={logo} alt="" className="max-h-9 max-w-10 object-contain" /> : <span className="font-black text-white">{company.charAt(0)}</span>}</div><div><p className="text-lg font-black" style={{ fontFamily: headingFont }}>{values.contactName || "Your Name"}</p><p className="text-xs" style={{ color: muted }}>{values.jobTitle || "Founder & Director"} · {company}</p></div></div><div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-[10px]" style={{ borderColor: style === "bold" ? "rgba(255,255,255,.2)" : "#e2e8f0", color: muted }}><span>{values.email || "hello@yourbusiness.com"}</span><span>{values.phone || "+1 555 0100"}</span><span>{values.website || "yourbusiness.com"}</span></div></div>;
  if (layout === "bold") return <div className="mx-auto min-h-[480px] w-full max-w-[700px] overflow-hidden shadow-2xl" style={{ background: `linear-gradient(145deg, ${accent}, #171717 62%)`, color: "#fff", fontFamily: bodyFont }}><div className="flex min-h-[480px] flex-col justify-between p-8 sm:p-12"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.3em] text-white/60">{businessDocumentTypeLabels[type]}</p><h3 className="mt-6 max-w-lg text-4xl font-black leading-[.95] tracking-tight sm:text-6xl" style={{ fontFamily: headingFont }}>{title}</h3></div>{logo ? <img src={logo} alt="" className="max-h-10 max-w-28 object-contain" /> : <span className="text-3xl font-black">{company.charAt(0)}</span>}</div><div className="grid gap-6 border-t border-white/25 pt-6 sm:grid-cols-[1fr_1.5fr]"><div><p className="text-xs font-bold uppercase tracking-widest text-white/50">{company}</p><p className="mt-2 text-xs text-white/70">{values.tagline || values.industry || "Distinctive business, clearly expressed."}</p></div><div className="space-y-3">{previewFields.slice(0, 3)}</div></div></div></div>;
  if (layout === "studio") return <div className="mx-auto min-h-[480px] w-full max-w-[700px] overflow-hidden shadow-2xl" style={{ backgroundColor: "#15151a", color: "#fff", fontFamily: bodyFont }}><div className="grid min-h-[480px] md:grid-cols-[.72fr_1.28fr]"><div className="flex flex-col justify-between p-7 sm:p-10" style={{ backgroundColor: accent }}><div>{logo ? <img src={logo} alt="" className="max-h-10 max-w-32 object-contain" /> : <span className="text-2xl font-black">{company.charAt(0)}</span>}<p className="mt-8 text-[10px] font-black uppercase tracking-[.2em] text-white/60">{company}</p></div><div><p className="text-xs text-white/60">{values.industry || "Independent practice"}</p><p className="mt-2 text-xl font-black" style={{ fontFamily: headingFont }}>{values.tagline || title}</p></div></div><div className="flex flex-col justify-between p-7 sm:p-10"><div><p className="text-[10px] font-black uppercase tracking-[.25em]" style={{ color: accent }}>{businessDocumentTypeLabels[type]}</p><h3 className="mt-4 text-3xl font-black leading-tight" style={{ fontFamily: headingFont }}>{title}</h3></div><div className="space-y-4">{previewFields.slice(0, 4)}</div><div className="border-t border-white/15 pt-4 text-[10px] text-white/55">{values.email || "hello@yourbusiness.com"} · {values.website || "yourbusiness.com"}</div></div></div></div>;
  if (layout === "classic") return <div className="mx-auto min-h-[480px] w-full max-w-[700px] overflow-hidden border-[12px] shadow-2xl" style={{ borderColor: `${accent}22`, backgroundColor: surface, color: foreground, fontFamily: bodyFont }}><div className="m-2 min-h-[440px] border p-8 text-center sm:p-12" style={{ borderColor: `${accent}55` }}><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white" style={{ backgroundColor: accent }}>{logo ? <img src={logo} alt="" className="max-h-8 max-w-9 object-contain" /> : company.charAt(0)}</div><p className="mt-5 text-[10px] font-black uppercase tracking-[.28em]" style={{ color: accent }}>{company}</p><h3 className="mt-5 text-3xl font-black" style={{ fontFamily: headingFont }}>{title}</h3><div className="mx-auto mt-5 h-px w-16" style={{ backgroundColor: accent }} /><div className="mx-auto mt-7 max-w-md space-y-5 text-left">{previewFields.slice(0, 4)}</div><p className="mt-8 text-[10px]" style={{ color: muted }}>{values.email || "hello@yourbusiness.com"} · {values.website || "yourbusiness.com"}</p></div></div>;
  if (layout === "minimal") return <div className="mx-auto min-h-[480px] w-full max-w-[700px] overflow-hidden border shadow-2xl" style={{ borderColor: "#e2e8f0", backgroundColor: "#fff", color: "#111827", fontFamily: bodyFont }}><div className="p-8 sm:p-12"><div className="flex items-center justify-between border-b-2 pb-8" style={{ borderColor: accent }}><div><p className="text-2xl font-black tracking-tight" style={{ fontFamily: headingFont }}>{company}</p><p className="mt-1 text-[10px] text-slate-500">{values.tagline || values.industry}</p></div>{logo && <img src={logo} alt="" className="max-h-9 max-w-28 object-contain" />}</div><div className="mt-12 max-w-xl"><p className="text-[10px] font-black uppercase tracking-[.25em]" style={{ color: accent }}>{businessDocumentTypeLabels[type]}</p><h3 className="mt-3 text-4xl font-black tracking-tight" style={{ fontFamily: headingFont }}>{title}</h3><div className="mt-10 space-y-6">{previewFields.slice(0, 4)}</div></div><div className="mt-12 border-t pt-4 text-[10px] text-slate-500" style={{ borderColor: "#e2e8f0" }}>{values.email || "hello@yourbusiness.com"} · {values.website || "yourbusiness.com"} · {values.phone || "+1 555 0100"}</div></div></div>;
  return <div className={`mx-auto min-h-[480px] w-full max-w-[700px] overflow-hidden shadow-2xl ${compact ? "min-h-[390px]" : ""}`} style={{ backgroundColor: surface, color: foreground, fontFamily: bodyFont }}>
    <div className={`relative ${style === "bold" || style === "studio" ? "bg-black/20" : ""}`} style={{ borderBottom: style === "minimal" ? `1px solid ${accent}` : undefined }}>
      {style === "modern" && <div className="absolute inset-y-0 left-0 w-2" style={{ backgroundColor: accent }} />}
      <div className={`flex items-start justify-between gap-4 p-7 ${style === "classic" ? "text-center" : ""} ${compact ? "p-5" : ""}`}><div className={style === "classic" ? "mx-auto" : ""}><p className="text-xl font-black tracking-tight" style={{ fontFamily: headingFont }}>{company}</p><p className="mt-1 text-[10px]" style={{ color: muted }}>{values.tagline || values.industry || "Business identity, clearly expressed."}</p></div>{logo ? <img src={logo} alt="" className="max-h-10 max-w-28 object-contain" /> : <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white" style={{ backgroundColor: accent }}>{company.charAt(0)}</div>}</div>
      <div className={`px-7 pb-5 ${compact ? "px-5 pb-4" : ""}`}><p className="text-[10px] font-black uppercase tracking-[.2em]" style={{ color: style === "bold" || style === "studio" ? "#fda4af" : accent }}>{businessDocumentTypeLabels[type]}</p><h3 className="mt-2 text-2xl font-black leading-tight" style={{ fontFamily: headingFont }}>{title}</h3></div>
    </div>
    <div className={`grid gap-5 p-7 ${compact ? "gap-3 p-5" : ""} ${style === "editorial" || style === "modern" ? "md:grid-cols-[1fr_1.6fr]" : ""}`}>
      {style === "editorial" || style === "modern" ? <aside className="space-y-3 border-b pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-5" style={{ borderColor: "#e2e8f0" }}><p className="text-[9px] font-black uppercase tracking-widest" style={{ color: muted }}>Prepared for</p><p className="text-sm font-bold">{values.recipientName || values.contactName || company}</p><p className="text-[10px]" style={{ color: muted }}>{values.recipientCompany || values.industry || ""}</p><p className="pt-3 text-[10px]" style={{ color: muted }}>{values.date || today()}</p></aside> : null}
      <div className="space-y-4">{infoFields.length ? infoFields.map((field) => <div key={field.key}><p className="text-[9px] font-black uppercase tracking-widest" style={{ color: muted }}>{field.label}</p>{field.key === "lineItems" ? <div className="mt-1 space-y-1">{values[field.key].split("\n").slice(0, compact ? 3 : 6).map((line) => <div key={line} className="flex justify-between border-b pb-1 text-xs" style={{ borderColor: style === "bold" || style === "studio" ? "rgba(255,255,255,.16)" : "#e2e8f0" }}><span>{line}</span><span style={{ color: accent }}>•</span></div>)}</div> : <p className="mt-1 whitespace-pre-line text-xs leading-5" style={{ color: style === "bold" || style === "studio" ? "rgba(255,255,255,.86)" : "#334155" }}>{values[field.key]}</p>}</div>) : <p className="text-sm leading-6" style={{ color: muted }}>Your editable content will appear here as you complete the fields.</p>}</div>
    </div>
    <div className={`mx-7 flex flex-wrap gap-x-4 gap-y-1 border-t py-4 text-[9px] ${compact ? "mx-5 py-3" : ""}`} style={{ borderColor: style === "bold" || style === "studio" ? "rgba(255,255,255,.2)" : "#e2e8f0", color: muted }}><span>{values.email || "hello@yourbusiness.com"}</span><span>{values.website || "yourbusiness.com"}</span><span>{values.phone || "+1 555 0100"}</span></div>
  </div>;
};
