import React, { useMemo, useState } from "react";
import { ArrowUpRight, Building2, CheckCircle2, Circle, Clock3, Sparkles, X, Zap } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { BrandIndustry, brandNeedCategories, getBrandIndustry, getIndustryLabel, getNeedStatus, getRecommendedNeeds, NeedStatus, analyzeBrandNeed, getBrandRecommendations, BrandNeedAnalysis, NeedPriority } from "../../data/brandNeeds";
import { ActiveTab } from "../../types";

interface BrandNeedsOverviewProps {
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
  onNavigateTab?: (tab: string) => void;
  brandMode?: boolean;
}

const industries: BrandIndustry[] = ["automotive", "artist", "startup", "business", "brand", "creator", "restaurant", "other"];

const statusConfig: Record<NeedStatus, { label: string; className: string; icon: React.ElementType }> = {
  complete: { label: "Complete", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  attention: { label: "Needs Attention", className: "text-amber-300 bg-amber-500/10 border-amber-500/20", icon: Clock3 },
  not_started: { label: "Not Started", className: "text-zinc-400 bg-zinc-800/70 border-zinc-700", icon: Circle },
};

export const BrandNeedsOverview: React.FC<BrandNeedsOverviewProps> = ({ onNotify, onNavigateTab, brandMode = false }) => {
  const { workspace, brandCore, products, assets, contentItems, updateCurrentWorkspace } = useWorkspace();
  const [isSavingIndustry, setIsSavingIndustry] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<BrandNeedAnalysis | null>(null);
  const industry = brandMode && workspace?.identityType === "artist" ? "business" : getBrandIndustry(workspace, brandCore);
  const data = { workspace, brandCore, products, assets, contentItems };

  const statuses = useMemo(
    () => new Map(brandNeedCategories.flatMap((category) => category.needs.map((need) => [need.id, getNeedStatus(need, data)]))),
    [workspace, brandCore, products, assets, contentItems],
  );
  const allNeeds = brandNeedCategories.flatMap((category) =>
    category.needs.filter((need) => !brandMode || !need.recommendedFor?.length || !need.recommendedFor.every((item) => item === "artist")),
  );
  const analyses = allNeeds.map((need) => analyzeBrandNeed(need, industry, data));
  const recommendations = getBrandRecommendations(analyses);
  const missingNeeds = analyses.filter((analysis) => analysis.status !== "complete");
  const recommendedNeeds = getRecommendedNeeds(industry).filter((need) => statuses.get(need.id) !== "complete").slice(0, 3);
  const priorityNeeds = recommendations.slice(0, 5);
  const completeCount = allNeeds.filter((need) => statuses.get(need.id) === "complete").length;
  const attentionCount = allNeeds.filter((need) => statuses.get(need.id) === "attention").length;
  const notStartedCount = allNeeds.filter((need) => statuses.get(need.id) === "not_started").length;
  const completedNeeds = allNeeds.filter((need) => statuses.get(need.id) === "complete").slice(0, 4);
  const businessName = brandCore?.brandName || workspace?.name || "Your business";

  const changeIndustry = async (nextIndustry: BrandIndustry) => {
    setIsSavingIndustry(true);
    try {
      await updateCurrentWorkspace({ genreOrNiche: nextIndustry === "other" ? "" : nextIndustry });
      onNotify("Business category updated.", "success");
    } catch {
      onNotify("We could not update the business category.", "error");
    } finally {
      setIsSavingIndustry(false);
    }
  };

  const navigate = (tab?: ActiveTab) => {
    if (tab && onNavigateTab) onNavigateTab(tab);
  };
  const navigateNeed = (need: { actionTab?: ActiveTab; studioServiceCategory?: string }) => {
    if (need.actionTab === "studio" && need.studioServiceCategory) {
      onNavigateTab?.(need.studioServiceCategory === "business_documents" ? "business-studio" : `studio:${need.studioServiceCategory}`);
      return;
    }
    navigate(need.actionTab);
  };

  return (
    <div className="space-y-6">
      <section className="bento-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-red-400">
              <Building2 className="h-4 w-4" /> Business Identity
            </div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl">{businessName}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Your Brand OS identifies the foundations your business needs to look professional, become visible, and grow.
            </p>
          </div>
          <label className="w-full max-w-xs text-xs font-semibold text-zinc-400">
            Business type / industry
            <select
              value={industry}
              disabled={isSavingIndustry}
              onChange={(event) => void changeIndustry(event.target.value as BrandIndustry)}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500"
            >
              {industries.map((item) => <option key={item} value={item}>{getIndustryLabel(item)}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Description", brandMode && workspace?.identityType === "artist" ? "Add a short description of your business and the customers you serve." : workspace?.bio || "Add a short description in your business profile."],
            ["Main goal", brandMode && workspace?.identityType === "artist" ? "Define the outcome your business is working toward." : brandCore?.positioning?.valueProposition || "Define what you want the business to achieve."],
            ["Current progress", `${completeCount} completed · ${attentionCount} need attention · ${notStartedCount} not started`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[var(--bento-border)] bg-[var(--bento-input)]/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-200">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="bento-card-highlight p-5 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-red-300">Brand OS Health</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-2xl font-black text-zinc-100">{completeCount} needs completed</p><p className="text-sm text-zinc-400">{attentionCount} need attention · {notStartedCount} not started</p></div>
          <span className="text-sm font-semibold text-amber-300">{missingNeeds.length ? "Your business foundation is taking shape." : "Your foundation is ready."}</span>
          </div>
        </div>
        <div className="bento-card p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Your next move</p>
          <p className="mt-3 text-lg font-bold text-zinc-100">{priorityNeeds[0]?.title || "Review your setup"}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{priorityNeeds[0]?.reason || "Your core setup is ready for review."}</p>
          <button onClick={() => { const next = priorityNeeds[0] && analyses.find((analysis) => analysis.need.id === priorityNeeds[0].needId); if (next) navigateNeed(next.need); }} className="mt-3 text-xs font-bold text-red-400 hover:text-red-300">Start <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Overview</p><h3 className="mt-1 text-xl font-bold text-zinc-100">Business needs by category</h3></div><span className="text-xs text-zinc-500">{completeCount} complete</span></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {brandNeedCategories.map((category) => {
            const visibleNeeds = category.needs.filter((need) => !brandMode || !need.recommendedFor?.length || !need.recommendedFor.every((item) => item === "artist"));
            const categoryMissing = visibleNeeds.filter((need) => statuses.get(need.id) !== "complete").length;
            return <div key={category.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-zinc-100">{category.id}</h4><p className="mt-1 text-xs leading-5 text-zinc-500">{category.description}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${categoryMissing ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-400"}`}>{categoryMissing ? "Needs Attention" : "Complete"}</span></div>
              <div className="mt-4 space-y-2">{visibleNeeds.slice(0, 4).map((need) => { const status = statuses.get(need.id) || "not_started"; const config = statusConfig[status]; const Icon = config.icon; return <button key={need.id} onClick={() => setSelectedNeed(analyses.find((analysis) => analysis.need.id === need.id) || null)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-800/80 px-3 py-2 text-left hover:border-zinc-600"><span className="flex items-center gap-2 text-xs text-zinc-300"><Icon className="h-3.5 w-3.5" />{need.label}</span><span className={`rounded-full border px-2 py-0.5 text-[10px] ${config.className}`}>{config.label}</span></button>; })}</div>
              {visibleNeeds.length > 4 && <p className="mt-3 text-[11px] text-zinc-500">+ {visibleNeeds.length - 4} more requirements</p>}
            </div>;
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"><div className="flex items-center gap-2"><Zap className="h-4 w-4 text-amber-300" /><h3 className="font-bold text-zinc-100">Priority items</h3></div><p className="mt-1 text-xs text-zinc-500">Important work ordered by foundation, industry relevance, and current status.</p><div className="mt-4 space-y-3">{priorityNeeds.map((recommendation) => <button key={recommendation.needId} onClick={() => setSelectedNeed(analyses.find((analysis) => analysis.need.id === recommendation.needId) || null)} className="flex w-full items-center justify-between gap-3 border-b border-zinc-800 pb-3 text-left last:border-0 last:pb-0"><div><p className="text-sm font-semibold text-zinc-200">{recommendation.title}</p><p className="text-xs text-zinc-500">{recommendation.impact}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${recommendation.priority === "high" ? "bg-red-500/10 text-red-300" : recommendation.priority === "medium" ? "bg-amber-500/10 text-amber-300" : "bg-zinc-800 text-zinc-400"}`}>{recommendation.priority}</span></button>)}</div></div>
        <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-zinc-900/60 p-5"><h3 className="font-bold text-zinc-100">Recommended by KeedoHub</h3><p className="mt-1 text-xs leading-5 text-zinc-400">Build the essentials first. These recommendations are based on your category and the evidence currently in your workspace.</p><div className="mt-4 space-y-3">{recommendedNeeds.length ? recommendedNeeds.map((need) => <button key={need.id} onClick={() => navigateNeed(need)} className="flex w-full items-center justify-between rounded-xl border border-red-500/20 bg-zinc-950/40 p-3 text-left hover:bg-zinc-950/70"><span><span className="block text-sm font-semibold text-zinc-200">{need.label}</span><span className="text-xs text-zinc-500">{need.description}</span></span><ArrowUpRight className="h-4 w-4 text-red-400" /></button>) : <p className="text-sm text-zinc-400">Your core setup is in good shape. Review the full checklist for what is next.</p>}</div></div>
      </section>

      {completedNeeds.length > 0 && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Recent completed work</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {completedNeeds.map((need) => <span key={need.id} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" />{need.label}</span>)}
          </div>
        </section>
      )}

      {selectedNeed && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="brand-need-detail-title">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">{selectedNeed.need.category || "Business need"}</p>
                <h3 id="brand-need-detail-title" className="mt-2 text-2xl font-black text-zinc-100">{selectedNeed.need.label}</h3>
              </div>
              <button onClick={() => setSelectedNeed(null)} aria-label="Close need details" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusConfig[selectedNeed.status].className}`}>{statusConfig[selectedNeed.status].label}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${selectedNeed.priority === "high" ? "bg-red-500/10 text-red-300" : selectedNeed.priority === "medium" ? "bg-amber-500/10 text-amber-300" : "bg-zinc-800 text-zinc-400"}`}>{selectedNeed.priority} priority</span>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div><p className="font-bold text-zinc-200">Why this matters</p><p className="mt-1 leading-6 text-zinc-400">{selectedNeed.impact}</p></div>
              <div><p className="font-bold text-zinc-200">Why KeedoHub recommends it</p><p className="mt-1 leading-6 text-zinc-400">{selectedNeed.whyRecommended}</p></div>
              <div><p className="font-bold text-zinc-200">What completing it unlocks</p><p className="mt-1 leading-6 text-zinc-400">A stronger foundation for the next stage of your business visibility and customer experience.</p></div>
            </div>
            <button onClick={() => { navigateNeed(selectedNeed.need); setSelectedNeed(null); }} className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-500">{selectedNeed.action} with KeedoHub <ArrowUpRight className="ml-1 inline h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};
