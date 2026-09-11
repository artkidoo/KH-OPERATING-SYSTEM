import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  DOC_TEMPLATES,
  DocType,
  templateFor,
  DocTemplate,
} from "../../domain/documentTemplates";
import {
  FileText,
  Plus,
  Copy,
  Download,
  Printer,
  Link as LinkIcon,
  CheckCircle2,
  Trash2,
  Share2,
  Clock,
  Briefcase,
  Layers,
  ArrowUpRight,
} from "lucide-react";

type DocStatus = "draft" | "sent" | "signed" | "paid" | "active";

export function DocumentsHub({
  onNotify,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const {
    businessDocuments,
    projects,
    createBusinessDocument,
    updateBusinessDocument,
    deleteBusinessDocument,
  } = useWorkspace();

  const [selectedType, setSelectedType] = useState<DocType>("quote");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [openDocId, setOpenDocId] = useState<string | null>(
    businessDocuments[0]?.id || null
  );
  const [form, setForm] = useState<Record<string, string>>({});
  const [docStatus, setDocStatus] = useState<DocStatus>("draft");
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");

  const currentTemplate: DocTemplate = templateFor(selectedType);

  const openDoc = businessDocuments.find((d: any) => d.id === openDocId) || null;

  // Filtered list
  const filteredDocs = businessDocuments.filter((d: any) => {
    if (activeCategoryFilter === "All") return true;
    const tpl = templateFor(d.documentType);
    return tpl.category === activeCategoryFilter;
  });

  const handleCreate = async () => {
    try {
      const title = `${currentTemplate.label} — ${
        projects.find((p) => p.id === selectedProjectId)?.title || "General"
      }`;
      const res = await createBusinessDocument({
        documentType: selectedType,
        title,
        status: docStatus,
        projectId: selectedProjectId || undefined,
        content: {
          ...form,
          externalUrl,
        },
      } as never);

      setForm({});
      setExternalUrl("");
      setOpenDocId((res as { id: string }).id);
      onNotify(`${currentTemplate.label} generated.`, "success");
    } catch (e: unknown) {
      onNotify(e instanceof Error ? e.message : "Failed to create document", "error");
    }
  };

  const handleSave = async () => {
    if (!openDoc) return;
    try {
      await updateBusinessDocument(openDoc.id, {
        status: docStatus,
        content: {
          ...(openDoc.content || {}),
          ...form,
          externalUrl: externalUrl || openDoc.content?.externalUrl,
        },
      } as never);
      onNotify("Document saved successfully.", "success");
    } catch (e: unknown) {
      onNotify("Failed to update document", "error");
    }
  };

  const handleDuplicate = async () => {
    if (!openDoc) return;
    try {
      const res = await createBusinessDocument({
        documentType: openDoc.documentType,
        title: `${openDoc.title} (Copy)`,
        status: "draft",
        projectId: openDoc.projectId,
        content: openDoc.content,
      } as never);
      setOpenDocId((res as { id: string }).id);
      onNotify("Document duplicated.", "success");
    } catch (e: unknown) {
      onNotify("Failed to duplicate", "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    if (!openDoc) return;
    const content = templateFor(openDoc.documentType).body({
      ...(openDoc.content || {}),
      ...form,
    });
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${openDoc.title}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    onNotify("Exported document dossier.", "success");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">
              Business Documents & Operations
            </span>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold text-white tracking-tight">
              Documents Hub
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Agency-grade quotes, itemized commercial invoices, creative briefs, brand guidelines, release schedules, and contracts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 border-t border-zinc-800/80 pt-4">
          {["All", "Finance", "Creative", "Legal", "Press"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeCategoryFilter === cat
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-900/70 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Column: Creator & Directory */}
        <div className="space-y-5">
          {/* Creator Box */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-400" />
              New Document Generator
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Document Template
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocType)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {DOC_TEMPLATES.map((t) => (
                  <option key={t.type} value={t.type}>
                    [{t.category}] {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Attach to Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="">General (No Project)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Specific Fields */}
            <div className="space-y-2.5 pt-1">
              {currentTemplate.fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    {f.label}
                  </label>
                  {f.multiline ? (
                    <textarea
                      value={form[f.key] || ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder || f.label}
                      rows={3}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[f.key] || ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder || f.label}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                External Link or Attachment URL (Optional)
              </label>
              <input
                type="text"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={handleCreate}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate {currentTemplate.label}
            </button>
          </div>

          {/* Directory of Saved Documents */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Workspace Documents ({filteredDocs.length})
            </h3>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredDocs.map((doc: any) => {
                const isActive = doc.id === openDocId;
                const tpl = templateFor(doc.documentType);
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setOpenDocId(doc.id);
                      setDocStatus((doc.status as DocStatus) || "draft");
                      setExternalUrl(doc.content?.externalUrl || "");
                    }}
                    className={`w-full text-left rounded-2xl p-3 text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-red-500/15 border border-red-500/40 text-white shadow-sm"
                        : "bg-zinc-900/50 border border-zinc-800/80 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono font-semibold uppercase text-red-400">
                        {tpl.label}
                      </span>
                      <span className="text-[9px] font-bold uppercase rounded-md bg-black/40 px-1.5 py-0.5 text-zinc-400">
                        {doc.status || "Draft"}
                      </span>
                    </div>
                    <p className="font-bold truncate mt-1">{doc.title}</p>
                  </button>
                );
              })}

              {filteredDocs.length === 0 && (
                <p className="text-xs text-zinc-500 py-3 text-center">
                  No documents in this category yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Document Dossier */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-8 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-6">
          {openDoc ? (
            <div className="space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">
                      {templateFor(openDoc.documentType).category} ·{" "}
                      {templateFor(openDoc.documentType).label}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <select
                      value={docStatus}
                      onChange={(e) => setDocStatus(e.target.value as DocStatus)}
                      className="rounded-full bg-zinc-900 border border-zinc-700 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="signed">Signed</option>
                      <option value="paid">Paid</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                    {openDoc.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                  <button
                    onClick={handleExportText}
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Export File"
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                  <button
                    onClick={async () => {
                      await deleteBusinessDocument(openDoc.id);
                      setOpenDocId(null);
                      onNotify("Document archived.", "info");
                    }}
                    className="rounded-xl border border-zinc-800 p-2 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Archive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* External Link Pill if attached */}
              {openDoc.content?.externalUrl && (
                <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3 text-xs">
                  <LinkIcon className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-zinc-400">Attached Link:</span>
                  <a
                    href={openDoc.content.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-white hover:underline truncate flex items-center gap-1"
                  >
                    {openDoc.content.externalUrl}
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                </div>
              )}

              {/* Printable High-Fidelity Pre-formatted Render */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8 font-mono text-xs text-zinc-200 shadow-inner whitespace-pre-wrap leading-relaxed">
                {templateFor(openDoc.documentType).body({
                  ...(openDoc.content || {}),
                  ...form,
                })}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <FileText className="mx-auto w-12 h-12 text-zinc-600" />
              <h3 className="text-base font-bold text-white">No document selected</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Select a document from the left directory or create an agency estimate, invoice, brief, or contract.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
