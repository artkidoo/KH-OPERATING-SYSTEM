import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useCreativeBrain } from '../../context/CreativeBrainContext';
import { ProductServiceSystem } from './ProductServiceSystem';
import { CampaignBuilder } from './CampaignBuilder';
import { BrandCoreEditor } from './BrandCoreEditor';
import { ContextualRadarBanner } from '../CreativeRadarDashboard';
import { IdentityType, ActiveTab } from '../../types';
import { 
  Rocket, 
  Compass, 
  Package, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Target, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Briefcase,
  Building2,
  Tv,
  DollarSign
} from 'lucide-react';

interface BrandBusinessDashboardProps {
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigateTab?: (tab: string) => void;
}

export const BrandBusinessDashboard: React.FC<BrandBusinessDashboardProps> = ({ onNotify, onNavigateTab }) => {
  const { workspace, brandCore, activeCampaign, calculateCampaignReadiness, products, contentItems } = useWorkspace();
  const { openWithContext } = useCreativeBrain();

  type BrandWorkstationTab = 'campaigns' | 'brand_core' | 'products' | 'content_engine' | 'readiness_radar';
  const [activeTab, setActiveTab] = useState<BrandWorkstationTab>('campaigns');

  const readiness = calculateCampaignReadiness(activeCampaign);

  // Derive identity type from workspace or brandCore
  const identity: IdentityType = workspace?.identityType || brandCore?.identityType || 'brand';

  const getIdentityBadge = () => {
    return { label: 'Brand OS', icon: Building2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
  };

  const badge = getIdentityBadge();
  const BadgeIcon = badge.icon;

  return (
    <div id="brand-business-operating-system" className="space-y-6">
      {/* Identity Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-zinc-900 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-950/40">
            {(brandCore?.brandName || workspace?.name || 'K')[0]}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
                {brandCore?.brandName || workspace?.name || 'Vanguard Brand'}
              </h1>
              <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {brandCore?.tagline || 'Sovereign Brand & Business Operating Architecture'}
            </p>
          </div>
        </div>

        {/* Global Campaign Health Quick Look & Ask Brain */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() =>
              openWithContext(
                activeCampaign
                  ? { type: 'campaign', id: activeCampaign.id, title: activeCampaign.title }
                  : { type: 'brand_core', title: brandCore?.brandName || workspace?.name || 'Brand Core' },
                activeCampaign
                  ? `Is campaign "${activeCampaign.title}" ready for launch? Check all 7 readiness pillars.`
                  : `What are my priority brand campaign opportunities for ${workspace?.name || 'this workspace'}?`
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-semibold shadow-md shadow-red-950/40 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Ask Creative Brain</span>
          </button>

          {activeCampaign && (
            <div className="flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Master Campaign</span>
                <span className="text-xs font-bold text-zinc-200 truncate max-w-[140px] block">{activeCampaign.title}</span>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Readiness</span>
                <span className="text-xs font-bold text-red-400">{readiness?.score ?? 0}% ({readiness?.stage || 'Planning'})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Radar Signals Banner */}
      <ContextualRadarBanner category="campaign" onNavigateTab={onNavigateTab as (tab: ActiveTab) => void} />

      {/* Main Workstation Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800 overflow-x-auto pb-1">
        {[
          { id: 'campaigns', label: 'Master Campaign Engine', icon: Rocket, count: activeCampaign ? 'Active' : undefined },
          { id: 'brand_core', label: 'Brand Core & Identity', icon: Compass, count: 'Master Spec' },
          { id: 'products', label: 'Products & Services Catalog', icon: Package, count: `${products.length}` },
          { id: 'readiness_radar', label: 'Launch Readiness Radar', icon: ShieldCheck, count: `${readiness?.score ?? 0}%` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BrandWorkstationTab)}
              className={`flex items-center gap-2.5 px-4 py-3 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all cursor-pointer border-b-2 ${
                isActive
                  ? 'border-red-500 text-red-400 bg-red-500/10 shadow-sm'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isActive ? 'bg-red-500/20 text-red-300' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Workstation Module Rendering */}
      <div className="mt-2">
        {activeTab === 'campaigns' && (
          <CampaignBuilder onNotify={onNotify} onNavigateTab={onNavigateTab} />
        )}

        {activeTab === 'brand_core' && (
          <BrandCoreEditor onNotify={onNotify} />
        )}

        {activeTab === 'products' && (
          <ProductServiceSystem
            onNotify={onNotify}
            onLinkToCampaign={(prodId) => {
              setActiveTab('campaigns');
            }}
          />
        )}

        {activeTab === 'readiness_radar' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-red-500" />
                    7-Pillar Campaign Readiness & Certification Radar
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Audits all 7 operational pillars required to certify high-impact commercial launch execution.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-red-500">{readiness?.score ?? 0}%</span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${readiness?.stageColor || 'text-zinc-400 bg-zinc-800'}`}>
                    {readiness?.stage || 'Planning'}
                  </div>
                </div>
              </div>

              {/* 7 Pillars Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(readiness?.requirements || []).map((req, idx) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                      req.completed
                        ? 'bg-emerald-950/15 border-emerald-500/30'
                        : 'bg-zinc-950 border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${req.completed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          Pillar {idx + 1}: {req.label}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {req.weight} pts
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        {req.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${req.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {req.completed ? '✓ Certified' : '⚠ Required'}
                      </span>
                      <button
                        onClick={() => {
                          if (req.id === 'req_product') setActiveTab('products');
                          else if (req.id === 'req_creative_dir' || req.id === 'req_objective' || req.id === 'req_approvals') setActiveTab('campaigns');
                          else if (onNavigateTab) onNavigateTab(req.actionTab);
                        }}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-red-400 cursor-pointer"
                      >
                        {req.actionLabel} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
