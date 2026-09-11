import React, { useEffect, useState } from "react";
import { Check, FileText, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { SystemAdminRole } from "../../types";
import {
  BusinessDocumentField,
  BusinessDocumentTemplate,
  businessDocumentCategoryLabels,
  defaultBusinessDocumentTemplates,
  getBusinessDocumentTemplates,
  resetBusinessDocumentTemplates,
  saveBusinessDocumentTemplates,
} from "../../data/businessDocuments";

interface DocumentTemplateManagementTabProps {
  currentUserRole: SystemAdminRole;
}

export const DocumentTemplateManagementTab: React.FC<DocumentTemplateManagementTabProps> = ({ currentUserRole }) => {
  const [templates, setTemplates] = useState<BusinessDocumentTemplate[]>(getBusinessDocumentTemplates);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFields, setNewFields] = useState("title\ncontent");
  const canManage = currentUserRole === "super_admin" || currentUserRole === "admin";

  useEffect(() => {
    setTemplates(getBusinessDocumentTemplates());
  }, [currentUserRole]);

  const publish = (next: BusinessDocumentTemplate[]) => {
    setTemplates(next);
    saveBusinessDocumentTemplates(next);
    window.dispatchEvent(new Event("keedohub:business-templates-updated"));
  };

  const toggleTemplate = (id: string) => {
    publish(templates.map((template) => template.id === id ? { ...template, enabled: template.enabled === false } : template));
  };

  const removeTemplate = (id: string) => {
    const target = templates.find((template) => template.id === id);
    if (!target?.isCustom) return;
    publish(templates.filter((template) => template.id !== id));
  };

  const createTemplate = () => {
    if (!newName.trim()) return;
    const fields: BusinessDocumentField[] = newFields.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => ({
      key: line.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_match, character) => character.toUpperCase()),
      label: line,
      type: line.toLowerCase().includes("content") || line.toLowerCase().includes("body") ? "textarea" : "text",
    }));
    const template: BusinessDocumentTemplate = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      description: newDescription.trim() || "Custom business document template.",
      category: "communication",
      icon: "FileText",
      fields,
      isCustom: true,
      enabled: true,
    };
    publish([...templates, template]);
    setNewName("");
    setNewDescription("");
    setNewFields("title\ncontent");
    setIsCreating(false);
  };

  const restoreDefaults = () => {
    resetBusinessDocumentTemplates();
    setTemplates(defaultBusinessDocumentTemplates);
    window.dispatchEvent(new Event("keedohub:business-templates-updated"));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div><h2 className="text-xl font-bold text-foreground flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" />Business Document Templates</h2><p className="text-xs text-muted-foreground mt-1 max-w-2xl">Manage the reusable templates available in Business Documents Studio. Disabled templates remain in the library and can be enabled again at any time.</p></div>
        <div className="flex gap-2">{canManage && <><button onClick={() => setIsCreating((open) => !open)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"><Plus className="w-4 h-4" /> New template</button><button onClick={restoreDefaults} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground"><RotateCcw className="w-3.5 h-3.5" /> Reset defaults</button></>}</div>
      </div>

      {!canManage && <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-400">Read-only access. Admin or Super Admin permission is required to change templates.</div>}

      {isCreating && canManage && <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 space-y-4"><div className="grid md:grid-cols-2 gap-3"><label className="space-y-1 text-xs font-semibold text-foreground">Template name<input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Client Brief" className="w-full mt-1 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs" /></label><label className="space-y-1 text-xs font-semibold text-foreground">Description<input value={newDescription} onChange={(event) => setNewDescription(event.target.value)} placeholder="What this template is for" className="w-full mt-1 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs" /></label></div><label className="block space-y-1 text-xs font-semibold text-foreground">Fields <span className="font-normal text-muted-foreground">(one label per line)</span><textarea value={newFields} onChange={(event) => setNewFields(event.target.value)} rows={3} className="w-full mt-1 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs" /></label><button onClick={createTemplate} disabled={!newName.trim()} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-40"><Save className="w-3.5 h-3.5" /> Create template</button></div>}

      <div className="grid md:grid-cols-2 gap-4">{templates.map((template) => <div key={template.id} className={`rounded-2xl border p-5 space-y-4 ${template.enabled === false ? "border-border/40 bg-card/20 opacity-70" : "border-border/60 bg-card/60"}`}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 mb-1"><span className="text-[10px] uppercase tracking-wider font-bold text-blue-400">{businessDocumentCategoryLabels[template.category]}</span>{template.isCustom && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">CUSTOM</span>}</div><h3 className="text-sm font-bold text-foreground">{template.name}</h3><p className="text-xs text-muted-foreground mt-1">{template.description}</p></div>{canManage && <button onClick={() => toggleTemplate(template.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${template.enabled === false ? "bg-accent text-muted-foreground" : "bg-emerald-500/15 text-emerald-400"}`} title={template.enabled === false ? "Enable template" : "Disable template"}><Check className="w-4 h-4" /></button>}</div><div className="flex flex-wrap gap-1.5">{template.fields.map((field) => <span key={field.key} className="px-2 py-1 rounded-lg text-[10px] bg-accent text-muted-foreground">{field.label}</span>)}</div>{canManage && template.isCustom && <button onClick={() => removeTemplate(template.id)} className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /> Delete custom template</button>}</div>)}</div>
    </div>
  );
};
