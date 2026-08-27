import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ProductService } from '../../types';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Tag, 
  Users, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight, 
  Search, 
  Sparkles,
  ExternalLink,
  ShoppingBag,
  Zap,
  Globe,
  Sliders,
  Check
} from 'lucide-react';

interface ProductServiceSystemProps {
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onLinkToCampaign?: (productId: string) => void;
}

export const ProductServiceSystem: React.FC<ProductServiceSystemProps> = ({ onNotify, onLinkToCampaign }) => {
  const { products, createProduct, updateProduct, deleteProduct, activeCampaign, saveActiveCampaign, assets } = useWorkspace();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Partial<ProductService> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New product form state
  const [formData, setFormData] = useState<Partial<ProductService>>({
    name: '',
    type: 'product',
    tagline: '',
    description: '',
    category: 'Core Offering',
    pricing: {
      amount: 499,
      currency: 'USD',
      billingInterval: 'one_time',
      tierName: 'Standard',
    },
    targetAudience: '',
    keyFeatures: ['Enterprise API Access', 'Custom Workflow Automations', 'Dedicated Account Manager'],
    benefits: ['10x speed to market', 'Eliminates fragmented tools', '99.9% uptime SLA'],
    uniqueSellingPoints: ['Zero lock-in architecture', 'Built on open protocols', 'Ultra-low latency'],
    status: 'active',
  });

  const [featureInput, setFeatureInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [uspInput, setUspInput] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      type: 'product',
      tagline: '',
      description: '',
      category: 'Flagship Offering',
      pricing: {
        amount: 299,
        currency: 'USD',
        billingInterval: 'one_time',
        tierName: 'Standard',
      },
      targetAudience: 'Early adopters, high-growth teams, and scale-ups',
      keyFeatures: ['Instant Cloud Provisioning', 'Multi-tenant Permissions', 'Automated Daily Backups'],
      benefits: ['Streamlines operating workflow', 'Increases customer retention', 'Reduces overhead costs'],
      uniqueSellingPoints: ['Proprietary AI routing engine', 'Native end-to-end encryption'],
      status: 'active',
    });
    setIsCreating(true);
    setEditingProduct(null);
  };

  const handleOpenEdit = (prod: ProductService) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      onNotify('Product or Service name is required', 'error');
      return;
    }
    setIsSaving(true);
    try {
      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, formData);
        onNotify(`"${formData.name}" updated successfully!`, 'success');
      } else {
        await createProduct(formData as any);
        onNotify(`"${formData.name}" created and added to catalog!`, 'success');
      }
      setIsCreating(false);
      setEditingProduct(null);
    } catch (err: any) {
      onNotify(err.message || 'Failed to save product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete product "${name}" from catalog?`)) {
      try {
        await deleteProduct(id);
        onNotify(`"${name}" removed from catalog`, 'info');
      } catch (err: any) {
        onNotify('Failed to delete product', 'error');
      }
    }
  };

  const handleAttachToActiveCampaign = async (prod: ProductService) => {
    if (!activeCampaign) {
      onNotify('No active campaign selected. Please open Campaign Builder first.', 'info');
      return;
    }
    try {
      await saveActiveCampaign({
        productId: prod.id,
        productName: prod.name,
      });
      onNotify(`Linked "${prod.name}" to Campaign "${activeCampaign.title}"!`, 'success');
      if (onLinkToCampaign) onLinkToCampaign(prod.id);
    } catch (err: any) {
      onNotify('Failed to link product to campaign', 'error');
    }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFormData({
      ...formData,
      keyFeatures: [...(formData.keyFeatures || []), featureInput.trim()],
    });
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      keyFeatures: (formData.keyFeatures || []).filter((_, i) => i !== index),
    });
  };

  const addBenefit = () => {
    if (!benefitInput.trim()) return;
    setFormData({
      ...formData,
      benefits: [...(formData.benefits || []), benefitInput.trim()],
    });
    setBenefitInput('');
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: (formData.benefits || []).filter((_, i) => i !== index),
    });
  };

  const addUsp = () => {
    if (!uspInput.trim()) return;
    setFormData({
      ...formData,
      uniqueSellingPoints: [...(formData.uniqueSellingPoints || []), uspInput.trim()],
    });
    setUspInput('');
  };

  const removeUsp = (index: number) => {
    setFormData({
      ...formData,
      uniqueSellingPoints: (formData.uniqueSellingPoints || []).filter((_, i) => i !== index),
    });
  };

  // Metrics
  const totalOfferings = products.length;
  const activeOfferings = products.filter((p) => p.status === 'active').length;
  const totalValue = products.reduce((sum, p) => sum + (p.pricing?.amount || 0), 0);
  const avgPrice = totalOfferings > 0 ? Math.round(totalValue / totalOfferings) : 0;

  return (
    <div id="product-service-system" className="space-y-6">
      {/* Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Products & Services Catalog</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
              {totalOfferings} Items
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Central repository of products, services, SaaS tiers, and offers powering your master campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-add-product"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Offering
          </button>
        </div>
      </div>

      {/* Catalog Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5">
          <div className="text-xs text-zinc-400 font-medium">Active Catalog</div>
          <div className="text-xl font-bold text-zinc-100 mt-1">{activeOfferings} <span className="text-xs text-emerald-400 font-normal">Live</span></div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5">
          <div className="text-xs text-zinc-400 font-medium">Average Price Point</div>
          <div className="text-xl font-bold text-zinc-100 mt-1">${avgPrice} <span className="text-xs text-zinc-500 font-normal">USD</span></div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5">
          <div className="text-xs text-zinc-400 font-medium">Linked to Active Campaign</div>
          <div className="text-xl font-bold text-red-400 mt-1">
            {activeCampaign?.productId ? (products.find((p) => p.id === activeCampaign.productId)?.name || 'Linked') : 'None Linked'}
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5">
          <div className="text-xs text-zinc-400 font-medium">Catalog Readiness</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{totalOfferings > 0 ? '100%' : '0%'} <span className="text-xs text-zinc-500 font-normal">Operational</span></div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search offerings by name, tagline, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'product', 'service', 'offer', 'subscription', 'digital_good'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-all ${
                filterType === type
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {type === 'digital_good' ? 'Digital Good' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-zinc-300">No offerings found</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mt-1 mb-4">
            {searchTerm || filterType !== 'all'
              ? 'No products or services match your search filter criteria.'
              : 'Add your first product, service, subscription, or digital offering to power your campaigns.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create First Offering
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => {
            const isAttachedToActive = activeCampaign?.productId === prod.id;
            return (
              <div
                key={prod.id}
                id={`product-card-${prod.id}`}
                className={`relative group bg-zinc-900/70 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:border-zinc-700 ${
                  isAttachedToActive ? 'border-red-500/60 bg-red-950/10 shadow-lg shadow-red-950/20' : 'border-zinc-800/80'
                }`}
              >
                <div>
                  {/* Card Header & Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {prod.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">{prod.category}</span>
                    </div>

                    {isAttachedToActive && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                        <Zap className="w-3 h-3" />
                        Campaign Linked
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-red-400 transition-colors">
                    {prod.name}
                  </h3>
                  {prod.tagline && (
                    <p className="text-xs text-zinc-400 font-medium mt-1 line-clamp-1">
                      {prod.tagline}
                    </p>
                  )}

                  {/* Pricing Box */}
                  <div className="mt-3.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-zinc-500 block">Price / Investment</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold text-zinc-100">
                          ${prod.pricing?.amount ?? 0}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {prod.pricing?.currency || 'USD'}
                        </span>
                        {prod.pricing?.billingInterval && prod.pricing.billingInterval !== 'one_time' && (
                          <span className="text-xs text-zinc-500">
                            /{prod.pricing.billingInterval === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        )}
                      </div>
                    </div>

                    {prod.pricing?.tierName && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {prod.pricing.tierName}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {prod.description && (
                    <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  )}

                  {/* Key Features Pill Tags */}
                  {prod.keyFeatures && prod.keyFeatures.length > 0 && (
                    <div className="mt-3.5 space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Core Capabilities
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {prod.keyFeatures.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-300 border border-zinc-700/40"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            {f}
                          </span>
                        ))}
                        {prod.keyFeatures.length > 3 && (
                          <span className="text-[10px] text-zinc-500 self-center">
                            +{prod.keyFeatures.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Offering"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.name)}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Offering"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleAttachToActiveCampaign(prod)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isAttachedToActive
                        ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                        : 'bg-red-600/90 hover:bg-red-500 text-white shadow-sm shadow-red-600/20'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    {isAttachedToActive ? 'Re-link' : 'Link to Campaign'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">
                  {editingProduct ? 'Edit Catalog Offering' : 'New Product / Service Offering'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Define your offering specs, pricing economics, and core value proposition.
                </p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="text-zinc-400 hover:text-zinc-100 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Name & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Offering Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sovereign Vault Pro"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Offering Type</label>
                  <select
                    value={formData.type || 'product'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="product">Product</option>
                    <option value="service">Service / Agency</option>
                    <option value="offer">High-Ticket Offer</option>
                    <option value="subscription">Subscription / SaaS</option>
                    <option value="digital_good">Digital Good / Asset</option>
                    <option value="merch">Merchandise / Physical</option>
                  </select>
                </div>
              </div>

              {/* Tagline & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Tagline / Headline</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Enterprise-grade asset sovereign security"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Category</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Financial Software, Consulting, Creative"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Pricing Economics */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Pricing & Monetization Architecture
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Price Amount ($)</label>
                    <input
                      type="number"
                      value={formData.pricing?.amount ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, amount: Number(e.target.value) || 0, currency: formData.pricing?.currency || 'USD' },
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Billing Interval</label>
                    <select
                      value={formData.pricing?.billingInterval || 'one_time'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, billingInterval: e.target.value as any, amount: formData.pricing?.amount || 0, currency: formData.pricing?.currency || 'USD' },
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                    >
                      <option value="one_time">One-time Purchase</option>
                      <option value="monthly">Monthly Recurring (MRR)</option>
                      <option value="annually">Annual License</option>
                      <option value="tiered">Custom Tiered</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Tier Name</label>
                    <input
                      type="text"
                      value={formData.pricing?.tierName || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricing: { ...formData.pricing, tierName: e.target.value, amount: formData.pricing?.amount || 0, currency: formData.pricing?.currency || 'USD' },
                        })
                      }
                      placeholder="e.g. Pro, Growth, Enterprise"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Target Audience & Description */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Target Ideal Customer Profile (ICP)</label>
                  <input
                    type="text"
                    value={formData.targetAudience || ''}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g. Founders raising Seed/Series A, high-income creators, mid-market SaaS"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Description & Value Proposition</label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive description of how this product or service solves customer pain points..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Key Features List Builder */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Key Features & Deliverables</span>
                  <span className="text-[11px] text-zinc-500">{formData.keyFeatures?.length || 0} features</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Add feature and press Enter..."
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(formData.keyFeatures || []).map((feat, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 text-xs border border-zinc-700"
                    >
                      {feat}
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="text-zinc-400 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Unique Selling Points (USPs) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Unique Selling Points (Differentiators)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={uspInput}
                    onChange={(e) => setUspInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUsp())}
                    placeholder="Add differentiator and press Enter..."
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={addUsp}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(formData.uniqueSellingPoints || []).map((usp, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/40 text-red-300 text-xs border border-red-900/50"
                    >
                      {usp}
                      <button
                        type="button"
                        onClick={() => removeUsp(i)}
                        className="text-red-400 hover:text-red-200"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-zinc-800 pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingProduct ? 'Update Offering' : 'Create Offering'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
