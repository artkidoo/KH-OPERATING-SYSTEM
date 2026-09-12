import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  ShieldCheck,
  Inbox,
  FileText,
  Factory,
  Eye,
  CheckCircle2,
  Truck,
  Sparkles,
  Search,
  ChevronRight,
  Clock,
  User,
  Layers,
  AlertCircle,
  MessageSquare,
  Download,
  Plus,
  BarChart3,
  Upload,
  Smile,
} from "lucide-react";

interface StudioRequestSummary {
  id: string;
  workspaceId: string;
  workspaceName: string;
  customerName: string;
  identityType: "artist" | "brand";
  requestTitle: string;
  serviceCategory: string;
  serviceName: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedDesigner?: string;
  projectId?: string;
}

interface StudioStats {
  incoming: number;
  briefing: number;
  inProduction: number;
  review: number;
  ready: number;
  delivered: number;
}

export function StudioAdmin({
  onNotify,
}: {
  onNotify: (m: string, t?: "success" | "info" | "error") => void;
}) {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<StudioStats>({
    incoming: 14,
    briefing: 6,
    inProduction: 12,
    review: 4,
    ready: 8,
    delivered: 24,
  });
  const [requests, setRequests] = useState<StudioRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const mockRequests: StudioRequestSummary[] = [
      {
        id: "req-001",
        workspaceId: "ws_4acf7d34",
        workspaceName: "Demo Artist Workspace",
        customerName: "Zack Khalifa",
        identityType: "artist",
        requestTitle: "Cover Artwork for 'Midnight in Victoria Island'",
        serviceCategory: "cover-artwork",
        serviceName: "Cover Artwork",
        status: "IN_PRODUCTION",
        priority: "high",
        createdAt: "2026-09-10T09:00:00Z",
        assignedDesigner: "Amina K.",
        projectId: "proj-001",
      },
      {
        id: "req-002",
        workspaceId: "ws_696844b3",
        workspaceName: "Demo Brand Workspace",
        customerName: "TechFlow Inc.",
        identityType: "brand",
        requestTitle: "Brand Identity System",
        serviceCategory: "brand-identity",
        serviceName: "Brand Identity",
        status: "BRIEFING",
        priority: "urgent",
        createdAt: "2026-09-11T14:30:00Z",
        projectId: "proj-002",
      },
      {
        id: "req-003",
        workspaceId: "ws_35f7ccb0",
        workspaceName: "Demo Artist Workspace 2",
        customerName: "Sarah James",
        identityType: "artist",
        requestTitle: "EPK & Press Kit",
        serviceCategory: "epk",
        serviceName: "EPK",
        status: "REVIEW",
        priority: "normal",
        createdAt: "2026-09-08T11:00:00Z",
        assignedDesigner: "Dare Balogun",
        projectId: "proj-003",
      },
      {
        id: "req-004",
        workspaceId: "ws_618c43ee",
        workspaceName: "Demo Artist Workspace 3",
        customerName: "DJ Mavin",
        identityType: "artist",
        requestTitle: "Music Visuals - 16:9 Kinetic Visualizer",
        serviceCategory: "music-visuals",
        serviceName: "Music Visuals",
        status: "ASSIGNED",
        priority: "high",
        createdAt: "2026-09-12T08:00:00Z",
        assignedDesigner: "Sarah O.",
        projectId: "proj-004",
      },
      {
        id: "req-005",
        workspaceId: "ws_d47791d3",
        workspaceName: "Demo Artist Workspace 4",
        customerName: "Luna Ray",
        identityType: "artist",
        requestTitle: "Motion Design - Logo Reveal & Social Snippets",
        serviceCategory: "motion",
        serviceName: "Motion",
        status: "READY",
        priority: "normal",
        createdAt: "2026-09-05T16:00:00Z",
        assignedDesigner: "Keedo",
        projectId: "proj-005",
      },
    ];
    setRequests(mockRequests);
    setLoading(false);
  }, []);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PRODUCTION": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      case "BRIEFING": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "ASSIGNED": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "REVIEW": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "READY": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "DELIVERED": return "text-emerald-300 bg-emerald-600/20 border-emerald-500/40";
      default: return "text-zinc-400 bg-zinc-800 border-zinc-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "IN_PRODUCTION": return "In Production";
      case "BRIEFING": return "Briefing";
      case "ASSIGNED": return "Assigned";
      case "REVIEW": return "Review";
      case "READY": return "Ready";
      case "DELIVERED": return "Delivered";
      default: return status;
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (searchQuery && !r.requestTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.customerName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-theme-main text-theme-main">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <span className="text-lg font-bold text-white font-['Space_Grotesk']">Studio Control Center</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="w-64 pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              New Request
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div onClick={() => setStatusFilter("INCOMING")} className="rounded-2xl border border-zinc-800 bg-card/60 p-4 cursor-pointer transition-all hover:border-red-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Incoming</span>
              <Inbox className="w-4 h-4 text-zinc-500" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.incoming}</span>
            <span className="text-[10px] text-zinc-500 mt-1 block">New requests</span>
          </div>
          <div onClick={() => setStatusFilter("BRIEFING")} className="rounded-2xl border border-zinc-800 bg-card/60 p-4 cursor-pointer transition-all hover:border-purple-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Briefing</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.briefing}</span>
            <span className="text-[10px] text-zinc-500 mt-1 block">In briefing phase</span>
          </div>
          <div onClick={() => setStatusFilter("IN_PRODUCTION")} className="rounded-2xl border border-zinc-800 bg-card/60 p-4 cursor-pointer transition-all hover:border-cyan-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">In Production</span>
              <Factory className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.inProduction}</span>
            <span className="text-[10px] text-zinc-500 mt-1 block">Being created</span>
          </div>
          <div onClick={() => setStatusFilter("REVIEW")} className="rounded-2xl border border-zinc-800 bg-card/60 p-4 cursor-pointer transition-all hover:border-amber-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Review</span>
              <Eye className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.review}</span>
            <span className="text-[10px] text-zinc-500 mt-1 block">Under review</span>
          </div>
          <div onClick={() => setStatusFilter("READY")} className="rounded-2xl border border-zinc-800 bg-card/60 p-4 cursor-pointer transition-all hover:border-emerald-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Ready</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.ready}</span>
            <span className="text-[10px] text-zinc-500 mt-1 block">Ready for delivery</span>
          </div>
          <div onClick={() => setStatusFilter("DELIVERED")} className="rounded-2xl border border-zinc-800 bg-card/60 p-4 cursor-pointer transition-all hover:border-emerald-500/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Delivered</span>
              <Truck className="w-4 h-4 text-emerald-300" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.delivered}</span>
            <span className="text-[10px] text-zinc-500 mt-1 block">Completed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-zinc-800 bg-card/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  Production Queue
                </h2>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="INCOMING">Incoming</option>
                  <option value="BRIEFING">Briefing</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PRODUCTION">In Production</option>
                  <option value="REVIEW">Review</option>
                  <option value="READY">Ready</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {loading ? (
                  <div className="p-8 flex items-center justify-center">
                    <Clock className="w-6 h-6 animate-spin text-zinc-500" />
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-zinc-500">No requests match the filter.</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => setSelectedRequestId(request.id)}
                      className={`px-5 py-4 cursor-pointer transition-all hover:bg-zinc-800/30 ${selectedRequestId === request.id ? "bg-zinc-800/40 border-l-2 border-red-500" : "border-l-2 border-transparent"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-white truncate">{request.requestTitle}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border ${getStatusColor(request.status)}`}>
                              {getStatusLabel(request.status)}
                            </span>
                            {request.priority === "urgent" && (
                              <span className="flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
                                <AlertCircle className="w-2.5 h-2.5" />
                                RUSH
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{request.customerName}</span>
                            <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{request.identityType}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                          {request.assignedDesigner && (
                            <div className="flex items-center gap-2 mt-2 text-[10px]">
                              <span className="text-zinc-500">Assigned:</span>
                              <span className="text-zinc-300 font-medium">{request.assignedDesigner}</span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedRequest ? (
              <div className="rounded-2xl border border-zinc-800 bg-card/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white">Request Details</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Customer</span>
                      <span className="text-white font-medium truncate ml-2">{selectedRequest.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Workspace</span>
                      <span className="text-white font-medium truncate ml-2">{selectedRequest.workspaceName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Service</span>
                      <span className="text-white font-medium">{selectedRequest.serviceName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Status</span>
                      <span className={`text-white font-medium ${getStatusColor(selectedRequest.status)} rounded-full px-2 py-0.5 text-[10px]`}>
                        {getStatusLabel(selectedRequest.status)}
                      </span>
                    </div>
                    {selectedRequest.assignedDesigner && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Designer</span>
                        <span className="text-white font-medium">{selectedRequest.assignedDesigner}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-zinc-800 space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                      Open Project
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Add Comment
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      Export Brief
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-card/60 p-8 text-center">
                <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Select a request to view details</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-card/40 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold text-zinc-500 uppercase">Quick Actions:</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              Use Creative Engine
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              Upload Working File
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              View Analytics
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              Request Revision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
