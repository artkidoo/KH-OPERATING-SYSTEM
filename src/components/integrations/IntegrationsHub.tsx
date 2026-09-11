import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Radio,
  HardDrive,
  ShieldCheck,
  Zap,
  Lock,
  ExternalLink,
  Activity,
  ArrowRight,
  Filter,
  ChevronRight,
  X,
  Clock,
  Cpu,
  BarChart3,
  CreditCard,
  Mail,
  Share2,
  Layers,
  Music,
  Youtube,
  Globe,
  Info,
  AlertCircle,
  FolderArchive,
  Cloud,
  Send,
  Smartphone,
  PieChart,
  Coins,
  Wallet,
  Headphones,
  Disc,
  Twitter,
  Linkedin,
  Instagram,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  IntegrationCategory,
  IntegrationConnection,
  IntegrationProviderDefinition,
  IntegrationProviderId,
  IntegrationSyncLog,
  IntegrationsHealthOverview,
  SyncTargetEntity,
} from '../../types';
import {
  INTEGRATION_CATEGORIES,
  INTEGRATION_PROVIDERS,
  getProviderById,
} from '../../integrations/providerRegistry';
import { integrationService } from '../../integrations/integrationService';

interface IntegrationsHubProps {
  onNotify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateTab?: (tab: any) => void;
}

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({
  onNotify = (_msg?: string, _type?: 'success' | 'error' | 'info') => {},
  onNavigateTab,
}) => {
  const { activeWorkspace } = useAuth();
  const workspaceId = activeWorkspace?.id || 'default_workspace';

  // State
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [syncLogs, setSyncLogs] = useState<IntegrationSyncLog[]>([]);
  const [health, setHealth] = useState<IntegrationsHealthOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Panels
  const [activeModalProvider, setActiveModalProvider] = useState<IntegrationProviderDefinition | null>(null);
  const [inspectingConnection, setInspectingConnection] = useState<IntegrationConnection | null>(null);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    healthy: boolean;
    latencyMs: number;
    message: string;
    checkedAt: string;
  } | null>(null);

  // Connect form state
  const [connectIdentifier, setConnectIdentifier] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [connectFrequency, setConnectFrequency] = useState<'manual' | 'hourly' | 'daily' | 'realtime'>('daily');
  const [connectEnvironment, setConnectEnvironment] = useState<'production' | 'sandbox'>('production');
  const [connectingSubmitting, setConnectingSubmitting] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const conns = await integrationService.getConnections(workspaceId);
      const logs = integrationService.getSyncLogs(workspaceId);
      const h = integrationService.getHealthOverview(workspaceId);
      setConnections(conns);
      setSyncLogs(logs);
      setHealth(h);
    } catch (err) {
      console.error('[IntegrationsHub] Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  // Dynamic Provider Icon Resolver
  const renderProviderIcon = (iconName: string, size = 20, color?: string) => {
    const props = { size, style: color ? { color } : undefined, className: 'shrink-0' };
    switch (iconName) {
      case 'Youtube':
        return <Youtube {...props} />;
      case 'Instagram':
        return <Instagram {...props} />;
      case 'Share2':
        return <Share2 {...props} />;
      case 'Globe':
        return <Globe {...props} />;
      case 'Twitter':
        return <Twitter {...props} />;
      case 'Linkedin':
        return <Linkedin {...props} />;
      case 'Radio':
        return <Radio {...props} />;
      case 'Music':
        return <Music {...props} />;
      case 'Headphones':
        return <Headphones {...props} />;
      case 'Disc':
        return <Disc {...props} />;
      case 'HardDrive':
        return <HardDrive {...props} />;
      case 'FolderArchive':
        return <FolderArchive {...props} />;
      case 'Cloud':
        return <Cloud {...props} />;
      case 'Mail':
        return <Mail {...props} />;
      case 'Send':
        return <Send {...props} />;
      case 'Smartphone':
        return <Smartphone {...props} />;
      case 'BarChart3':
        return <BarChart3 {...props} />;
      case 'PieChart':
        return <PieChart {...props} />;
      case 'Activity':
        return <Activity {...props} />;
      case 'CreditCard':
        return <CreditCard {...props} />;
      case 'Coins':
        return <Coins {...props} />;
      case 'Wallet':
        return <Wallet {...props} />;
      case 'ShieldCheck':
        return <ShieldCheck {...props} />;
      default:
        return <Zap {...props} />;
    }
  };

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return INTEGRATION_PROVIDERS.filter((provider) => {
      const matchCategory = selectedCategory === 'all' || provider.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.badge?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Connection lookup map
  const connectionByProviderId = useMemo(() => {
    const map = new Map<string, IntegrationConnection>();
    connections.forEach((c) => {
      map.set(c.providerId, c);
    });
    return map;
  }, [connections]);

  // Open Connect Modal
  const handleOpenConnectModal = (provider: IntegrationProviderDefinition) => {
    setActiveModalProvider(provider);
    setConnectIdentifier('');
    setSelectedScopes(provider.availableScopes.filter((s) => s.isDefault).map((s) => s.id));
    setConnectFrequency(provider.supportsAutoSync ? 'hourly' : 'daily');
    setConnectEnvironment('production');
  };

  // Submit Connect
  const handleSubmitConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProvider) return;
    if (!connectIdentifier.trim()) {
      onNotify('Please specify an account identifier or verified handle.', 'error');
      return;
    }

    try {
      setConnectingSubmitting(true);
      const conn = await integrationService.connectProvider({
        workspaceId,
        providerId: activeModalProvider.id,
        accountIdentifier: connectIdentifier,
        grantedScopes: selectedScopes,
        syncFrequency: connectFrequency,
        environment: connectEnvironment,
      });

      onNotify(`${activeModalProvider.name} successfully connected and verified!`, 'success');
      setActiveModalProvider(null);
      await loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to connect provider', 'error');
    } finally {
      setConnectingSubmitting(false);
    }
  };

  // Disconnect
  const handleDisconnect = async (connectionId: string, providerName: string) => {
    if (!window.confirm(`Safely disconnect ${providerName}? Historical telemetry remains preserved.`)) {
      return;
    }
    try {
      await integrationService.disconnectProvider(workspaceId, connectionId);
      onNotify(`${providerName} disconnected safely.`, 'info');
      setInspectingConnection(null);
      await loadData();
    } catch (err: any) {
      onNotify('Failed to disconnect provider', 'error');
    }
  };

  // Reconnect
  const handleReconnect = async (connectionId: string, providerName: string) => {
    try {
      await integrationService.reconnectProvider(workspaceId, connectionId);
      onNotify(`${providerName} credentials re-authenticated successfully.`, 'success');
      if (inspectingConnection && inspectingConnection.id === connectionId) {
        setInspectingConnection((prev) => (prev ? { ...prev, status: 'connected' } : null));
      }
      await loadData();
    } catch (err: any) {
      onNotify('Failed to reconnect provider', 'error');
    }
  };

  // Test Connection
  const handleTestConnection = async (connectionId: string) => {
    try {
      setTestingId(connectionId);
      setDiagnosticResult(null);
      const res = await integrationService.testConnection(workspaceId, connectionId);
      setDiagnosticResult(res);
      onNotify(res.healthy ? 'Diagnostic ping successful!' : 'Diagnostic test warning', res.healthy ? 'success' : 'error');
    } catch (err) {
      onNotify('Failed to execute diagnostic check', 'error');
    } finally {
      setTestingId(null);
    }
  };

  // Sync Now
  const handleSyncNow = async (connectionId: string, providerName: string) => {
    try {
      setSyncingId(connectionId);
      const res = await integrationService.syncNow(workspaceId, connectionId);
      onNotify(`Synced ${providerName}: ${res.recordsProcessed} records updated across ${res.targetEntities.join(', ')}`, 'success');
      await loadData();
      if (inspectingConnection && inspectingConnection.id === connectionId) {
        const updated = connections.find((c) => c.id === connectionId);
        if (updated) setInspectingConnection(updated);
      }
    } catch (err: any) {
      onNotify(err.message || 'Sync operation failed', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fadeIn">
      {/* Header Bento Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldCheck size={14} className="text-red-400" />
              <span>LAUNCH READINESS & EXTERNAL INTEGRATIONS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Integration & Telemetry Hub
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Connect official distribution channels, DSP streaming feeds, cloud vaults, and payment gateways.
              Keedohub ensures zero token disclosure, strict authorization isolation, and complete offline resilience.
            </p>
          </div>

          {/* Health & Launch Readiness Card */}
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 min-w-[280px] shadow-lg">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>Launch Readiness</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                {health?.overallStatus === 'ready' ? 'Production Ready' : 'Degraded Channels'}
              </span>
            </div>

            {/* Score bar */}
            <div>
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-2xl font-black text-white">{health?.launchReadinessScore ?? 85}%</span>
                <span className="text-xs text-zinc-500">
                  {health?.activeConnected ?? 0} of {INTEGRATION_PROVIDERS.length} Connected
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${health?.launchReadinessScore ?? 85}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs">
              <button
                id="btn-view-sync-logs"
                onClick={() => setShowLogsDrawer(true)}
                className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Clock size={13} className="text-zinc-400" />
                <span>Sync Audit Logs</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                  {syncLogs.length}
                </span>
              </button>
              <button
                id="btn-refresh-telemetry"
                onClick={loadData}
                disabled={loading}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security and Architecture Guarantees strip */}
        <div className="mt-6 pt-5 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
          <div className="flex items-start gap-2.5">
            <Lock size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-zinc-200 font-medium block">Zero Credential Exposure</span>
              <span className="text-zinc-500">Access tokens & secret keys are masked and restricted to server proxies.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Activity size={15} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-zinc-200 font-medium block">Data Sync Pipeline</span>
              <span className="text-zinc-500">Service → Integration → Keedohub → Analytics/Releases/Content/Campaigns.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-zinc-200 font-medium block">Graceful Offline State</span>
              <span className="text-zinc-500">Keedohub operates uninterrupted even during external service outages.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            id="tab-category-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            All Providers ({INTEGRATION_PROVIDERS.length})
          </button>
          {INTEGRATION_CATEGORIES.map((cat) => {
            const count = INTEGRATION_PROVIDERS.filter((p) => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`tab-category-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <input
            id="input-search-providers"
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Provider Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProviders.map((provider) => {
          const conn = connectionByProviderId.get(provider.id);
          const isConnected = conn?.status === 'connected';
          const isSyncing = syncingId === conn?.id;
          const isTesting = testingId === conn?.id;

          return (
            <div
              key={provider.id}
              id={`card-provider-${provider.id}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 hover:border-zinc-700/80 hover:bg-zinc-900/90 transition-all duration-200 shadow-sm hover:shadow-xl"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border border-zinc-700/50 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${provider.accentColor}15`, borderColor: `${provider.accentColor}40` }}
                    >
                      {renderProviderIcon(provider.icon, 22, provider.accentColor)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">{provider.name}</h3>
                      <span className="text-[11px] text-zinc-400">{provider.badge || (provider.authType ? provider.authType.toUpperCase() : "OAUTH")}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                      Available
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{provider.description}</p>
              </div>

              {/* Card Meta / Connection Details */}
              <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-3">
                {isConnected && conn ? (
                  <div className="space-y-1.5 bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-800/40 text-[11px]">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Masked Account</span>
                      <span className="font-mono text-zinc-200">{conn.accountIdentifier || 'act_***verified'}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Sync Target</span>
                      <span className="text-zinc-300 font-medium capitalize">
                        {provider.targetEntities.join(' & ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Last Sync</span>
                      <span className="text-zinc-300">
                        {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
                    <span>Target: {provider.targetEntities.join(', ')}</span>
                    <span>{provider.availableScopes.length} Scopes</span>
                  </div>
                )}

                {/* Card Action Controls */}
                <div className="flex items-center gap-2 pt-1">
                  {isConnected && conn ? (
                    <>
                      <button
                        id={`btn-sync-${conn.id}`}
                        onClick={() => handleSyncNow(conn.id, provider.name)}
                        disabled={isSyncing}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={isSyncing ? 'animate-spin text-red-400' : ''} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                      </button>

                      <button
                        id={`btn-inspect-${conn.id}`}
                        onClick={() => {
                          setInspectingConnection(conn);
                          setDiagnosticResult(null);
                        }}
                        className="py-2 px-3 rounded-xl text-xs font-medium bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50 transition-colors"
                        title="Manage connection & permissions"
                      >
                        <Sliders size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      id={`btn-connect-${provider.id}`}
                      onClick={() => handleOpenConnectModal(provider)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 flex items-center justify-center gap-1.5 transition-all shadow"
                    >
                      <span>Connect {provider.name.split(' ')[0]}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Connect Provider */}
      {activeModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${activeModalProvider.accentColor}20`,
                    borderColor: `${activeModalProvider.accentColor}50`,
                  }}
                >
                  {renderProviderIcon(activeModalProvider.icon, 24, activeModalProvider.accentColor)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Authorize {activeModalProvider.name}
                  </h2>
                  <p className="text-xs text-zinc-400">{activeModalProvider.description}</p>
                </div>
              </div>
              <button
                id="btn-close-connect-modal"
                onClick={() => setActiveModalProvider(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-zinc-300">
              <Lock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-100 block mb-0.5">Keedohub Security Policy</span>
                <span className="text-zinc-400">
                  Secret keys and access tokens are secured server-side and never exposed to the client. Only masked
                  identifiers are preserved for display and synchronization.
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitConnect} className="space-y-4">
              {/* Account Identifier Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Account Identifier / Verified Channel / Project ID
                </label>
                <input
                  id="input-account-identifier"
                  type="text"
                  required
                  placeholder={
                    activeModalProvider.category === 'social'
                      ? '@your_handle or Channel ID'
                      : activeModalProvider.category === 'payments'
                      ? 'acct_1NZ*** or Merchant ID'
                      : activeModalProvider.category === 'music_dsp'
                      ? 'spotify:artist:*** or Artist ID'
                      : 'Account or Bucket Reference'
                  }
                  value={connectIdentifier}
                  onChange={(e) => setConnectIdentifier(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors font-mono"
                />
                <span className="text-[11px] text-zinc-500">
                  Will be securely masked as (e.g. act_***892) upon saving.
                </span>
              </div>

              {/* Scopes Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Requested Permissions & Scopes
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeModalProvider.availableScopes.map((scope) => {
                    const isChecked = selectedScopes.includes(scope.id);
                    return (
                      <label
                        key={scope.id}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-zinc-900 border-zinc-700 text-white'
                            : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes((prev) => [...prev, scope.id]);
                            } else {
                              setSelectedScopes((prev) => prev.filter((id) => id !== scope.id));
                            }
                          }}
                          className="mt-0.5 rounded border-zinc-700 text-red-600 focus:ring-0 focus:ring-offset-0 bg-zinc-800"
                        />
                        <div className="text-xs">
                          <div className="font-medium text-zinc-200">{scope.name}</div>
                          <div className="text-[11px] text-zinc-400 leading-tight">{scope.description}</div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{scope.id}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sync Frequency & Environment Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">Sync Cadence</label>
                  <select
                    id="select-sync-cadence"
                    value={connectFrequency}
                    onChange={(e: any) => setConnectFrequency(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="hourly">Hourly Automated</option>
                    <option value="daily">Daily Snapshot</option>
                    <option value="realtime">Realtime Webhook</option>
                    <option value="manual">Manual on Demand</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">Environment</label>
                  <select
                    id="select-sync-env"
                    value={connectEnvironment}
                    onChange={(e: any) => setConnectEnvironment(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="production">Live Production</option>
                    <option value="sandbox">Sandbox / Staging</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveModalProvider(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-authorize-provider"
                  type="submit"
                  disabled={connectingSubmitting || selectedScopes.length === 0}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                  {connectingSubmitting && <RefreshCw size={13} className="animate-spin" />}
                  <span>Authorize & Register Connection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Inspect Connection & Diagnostics */}
      {inspectingConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-zinc-500 tracking-wide uppercase">
                  Connection Settings & Diagnostics
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">{inspectingConnection.name}</h2>
              </div>
              <button
                id="btn-close-inspect-modal"
                onClick={() => setInspectingConnection(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Connection Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[11px]">Status</span>
                <span className="font-semibold text-emerald-400 capitalize flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={13} />
                  {inspectingConnection.status}
                </span>
              </div>
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[11px]">Sync Count</span>
                <span className="font-semibold text-white font-mono mt-0.5 block">
                  {inspectingConnection.syncCount} runs
                </span>
              </div>
              <div className="bg-zinc-900/80 rounded-xl p-3 border border-zinc-800/80">
                <span className="text-zinc-500 block text-[11px]">Cadence</span>
                <span className="font-semibold text-zinc-200 capitalize mt-0.5 block">
                  {inspectingConnection.syncFrequency}
                </span>
              </div>
            </div>

            {/* Granted Scopes Display */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 block">Active Granted Scopes</span>
              <div className="flex flex-wrap gap-1.5">
                {inspectingConnection.grantedScopes.map((scope) => (
                  <span
                    key={scope}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono text-[11px] flex items-center gap-1"
                  >
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    {scope}
                  </span>
                ))}
              </div>
            </div>

            {/* Diagnostic Ping Output */}
            {diagnosticResult && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="font-semibold text-zinc-200">Diagnostic Ping Result</span>
                  <span className="font-mono text-emerald-400 font-bold">{diagnosticResult.latencyMs} ms</span>
                </div>
                <p className="text-zinc-400">{diagnosticResult.message}</p>
              </div>
            )}

            {/* Diagnostic & Reconnect Action Strip */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-zinc-800/80">
              <button
                id="btn-test-connection"
                onClick={() => handleTestConnection(inspectingConnection.id)}
                disabled={testingId === inspectingConnection.id}
                className="w-full sm:w-auto flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Activity size={13} className={testingId === inspectingConnection.id ? 'animate-pulse text-amber-400' : ''} />
                <span>{testingId === inspectingConnection.id ? 'Testing Handshake...' : 'Run Diagnostics'}</span>
              </button>

              <button
                id="btn-reconnect-provider"
                onClick={() => handleReconnect(inspectingConnection.id, inspectingConnection.name)}
                className="w-full sm:w-auto flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw size={13} />
                <span>Renew Auth Token</span>
              </button>

              <button
                id="btn-disconnect-provider"
                onClick={() => handleDisconnect(inspectingConnection.id, inspectingConnection.name)}
                className="w-full sm:w-auto py-2 px-3 rounded-xl text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: Sync Audit Logs */}
      {showLogsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Clock size={18} className="text-red-400" />
                  <span>Integration Data Sync Audit Trail</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Reliable data flow records between external services and Keedohub core models.
                </p>
              </div>
              <button
                id="btn-close-logs-modal"
                onClick={() => setShowLogsDrawer(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* Log Entries */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {syncLogs.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No sync logs recorded yet. Trigger a sync from any connected provider card.
                </div>
              ) : (
                syncLogs.map((log) => {
                  const provider = getProviderById(log.providerId as IntegrationProviderId);
                  return (
                    <div
                      key={log.id}
                      className="bg-zinc-900/70 border border-zinc-800/70 rounded-xl p-3 text-xs space-y-1.5 hover:border-zinc-700/80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-zinc-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>{provider?.name || log.providerId}</span>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-zinc-800">
                            {log.triggeredBy}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">{log.details}</p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/40 font-mono">
                        <span>
                          Targets: <span className="text-zinc-400">{log.targetEntities.join(', ')}</span>
                        </span>
                        <span>
                          {log.recordsProcessed} records processed in {log.durationMs}ms
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
              <span>Keedohub Ingestion Engine v3.0</span>
              <button
                onClick={() => setShowLogsDrawer(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
