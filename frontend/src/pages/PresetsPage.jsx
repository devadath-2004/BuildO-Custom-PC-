import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { 
  Layers, Search, Filter, Wrench, ShoppingCart, 
  Gamepad2, Palette, Video, Briefcase, ChevronDown, ChevronUp, Sparkles, Check, Eye, ShieldCheck, Zap 
} from 'lucide-react';
import ProductImage from '../components/ProductImage';
import ComponentDetailModal from '../components/ComponentDetailModal';

const CATEGORY_TABS = [
  { key: 'ALL', label: 'All presets', icon: Layers },
  { key: 'GAMING', label: 'Gaming', icon: Gamepad2 },
  { key: 'STUDIO', label: 'Studio & 3D', icon: Palette },
  { key: 'VIDEO_EDITING', label: 'Video editing', icon: Video },
  { key: 'OFFICE', label: 'Office & work', icon: Briefcase },
];

const FIGMA_PRESET_PRESENTATION = {
  'Budget Esports 1080p Gamer': {
    name: 'Budget Esports 1080p',
    description: 'An affordable entry to smooth competitive gaming, tuned for low latency and dependable frame rates.',
    target: '1080P 144FPS ESPORTS & CASUAL AAA GAMING',
  },
  'Value 1440p High-FPS Gamer': {
    name: 'Value 1440p High-FPS',
    description: 'The price-to-performance sweet spot for detailed 1440p gaming and fast competitive play.',
    target: '1440P HIGH-FPS & RAY TRACING',
  },
  'Apex Dominator 4K Gaming Rig': {
    name: 'Apex Dominator 4K',
    description: 'An uncompromising 4K rig pairing elite gaming silicon with quiet, efficient cooling.',
    target: '4K ULTRA SETTINGS WITH FULL RAY TRACING',
  },
  'Budget Student & Home Office': {
    name: 'Student & Home Office',
    description: 'Fast, quiet, and efficient for everyday work, meetings, research, and multi-tab browsing.',
    target: 'SILENT OPERATION, ONLINE CLASSES & OFFICE SUITES',
  },
  'SwiftPro Productivity & Coding': {
    name: 'SwiftPro Productivity',
    description: 'Made for software developers, analysts, and power multitaskers who move through demanding work.',
    target: 'MULTI-MONITOR WORKSPACE & FAST COMPILES',
  },
  'Creator Studio Pro 3D & CAD': {
    name: 'Creator Studio Pro',
    description: 'High-fidelity workstation power for 3D rendering, real-time ray tracing, and simulation.',
    target: 'BLENDER 3D, UNREAL ENGINE & ARCHITECTURAL CAD',
  },
  'DaVinci CineRender 8K Workstation': {
    name: 'CineRender 8K Workstation',
    description: 'Built for professional editors handling multi-stream 4K/8K footage and complex visual effects.',
    target: '8K RAW TIMELINE PLAYBACK & FAST EXPORT',
  },
};

const CATEGORY_LABELS = {
  GAMING: 'GAMING',
  STUDIO: 'STUDIO & 3D',
  VIDEO_EDITING: 'VIDEO EDITING',
  OFFICE: 'OFFICE & WORK',
};

const getPresetPresentation = preset => ({
  ...preset,
  ...(FIGMA_PRESET_PRESENTATION[preset.name] || {}),
  categoryLabel: CATEGORY_LABELS[preset.category] || preset.category,
});

export default function PresetsPage() {
  const { loadPresetIntoConfigurator, addToCart, showNotification } = useApp();
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedPresetId, setExpandedPresetId] = useState(null);
  const [inspectComponent, setInspectComponent] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetcher = activeCategory === 'ALL'
      ? apiClient.getPresets()
      : apiClient.getPresetsByCategory(activeCategory);

    fetcher
      .then(data => {
        setPresets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeCategory]);

  const filteredPresets = presets.filter(p => {
    const q = search.toLowerCase();
    const presentation = getPresetPresentation(p);
    return (
      presentation.name.toLowerCase().includes(q) ||
      (presentation.description || '').toLowerCase().includes(q) ||
      (presentation.target || p.targetResolutionOrUse || '').toLowerCase().includes(q)
    );
  });

  const handleQuickBuy = (preset) => {
    const presentation = getPresetPresentation(preset);
    addToCart({
      id: `preset-${preset.id}-${Date.now()}`,
      name: presentation.name,
      type: 'PRESET',
      price: preset.components?.reduce((sum, component) => sum + Number(component.price || 0), 0) || preset.basePrice,
      components: preset.components,
      imageUrl: preset.imageUrl,
      quantity: 1
    });
  };

  return (
    <div className="buildo-shop-page buildo-presets-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono font-semibold mb-2 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          CURATED HARDWARE SOLUTIONS
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Proven builds. Ready for your desk.
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Pre-tested, performance-tuned PCs for competitive gaming, studio production, editing, and focused work.
        </p>
      </div>

      {/* Category Pills & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-dark-900/60 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {CATEGORY_TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search presets by use case..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Presets Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Retrieving curated configurations...</p>
        </div>
      ) : filteredPresets.length === 0 ? (
        <div className="py-24 text-center text-slate-400 glass-panel rounded-2xl">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-300">No presets found</p>
          <p className="text-xs text-slate-500 mt-1">Try switching categories or searching for different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPresets.map(preset => {
            const isExpanded = expandedPresetId === preset.id;
            const presentation = getPresetPresentation(preset);

            return (
              <div
                key={preset.id}
                className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Image & Header */}
                <div className="relative h-56 overflow-hidden bg-dark-950">
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-dark-900/90 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                      {presentation.categoryLabel}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {presentation.name}
                    </h3>
                    {(presentation.target || preset.targetResolutionOrUse) && (
                      <p className="text-xs text-cyan-300 font-mono mt-0.5">
                        ⚡ {presentation.target || preset.targetResolutionOrUse}
                      </p>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {presentation.description || preset.description}
                  </p>

                  {/* Core Hardware Highlights */}
                  <div className="p-4 rounded-xl bg-dark-950 border border-slate-800 space-y-3">
                    <div className="text-[11px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                      Included Hardware Core:
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                      {['CPU', 'GPU', 'RAM', 'STORAGE'].map(catKey => {
                        const comp = preset.components?.find(c => c.category === catKey);
                        return (
                          <div 
                            key={catKey}
                            onClick={() => comp && setInspectComponent(comp)}
                            className="bg-dark-900/80 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors group"
                          >
                            <span className="text-slate-500 text-[10px] block">{catKey}:</span>
                            <span className="truncate block font-semibold text-white group-hover:text-cyan-400">
                              {comp?.name || 'N/A'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Expandable full list with component details */}
                    {isExpanded && (
                      <div className="pt-3 mt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300 font-mono">
                        <div className="text-[10px] uppercase text-cyan-400 font-bold">Remaining Assembly:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {['MOTHERBOARD', 'PSU', 'CABINET', 'COOLING'].map(catKey => {
                            const comp = preset.components?.find(c => c.category === catKey);
                            return (
                              <div 
                                key={catKey}
                                onClick={() => comp && setInspectComponent(comp)}
                                className="bg-dark-900/80 p-2 rounded-lg border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors group"
                              >
                                <span className="text-slate-500 text-[10px] block">{catKey}:</span>
                                <span className="truncate block font-semibold text-white group-hover:text-cyan-400">
                                  {comp?.name || 'N/A'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedPresetId(isExpanded ? null : preset.id)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 pt-1"
                    >
                      {isExpanded ? (
                        <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>View Full 8-Part Specs & Photos <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Components Total Before GST</span>
                      <div className="text-2xl font-black text-white font-mono">
                        ₹{Number(preset.components?.reduce((sum, component) => sum + Number(component.price || 0), 0) || preset.basePrice).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Customize button: loads into configurator */}
                      <button
                        onClick={() => loadPresetIntoConfigurator(preset)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold transition-all"
                        title="Customize this preset component-by-component"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>Customize</span>
                      </button>

                      {/* Buy Now button */}
                      <button
                        onClick={() => handleQuickBuy(preset)}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Buy Preset</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2" aria-label="BuildO preset assurances">
        {[
          { title: 'Compatibility checked', detail: 'Every part verified together', Icon: Check },
          { title: 'Genuine hardware', detail: 'Brand new with warranty', Icon: ShieldCheck },
          { title: 'Power calculated', detail: 'Requirements computed live', Icon: Zap },
          { title: 'Built to evolve', detail: 'Every preset remains customizable', Icon: Layers },
        ].map(({ title, detail, Icon }) => (
          <div key={title} className="preset-assurance-card flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
            <div>
              <p className="text-xs font-semibold text-white">{title}</p>
              <p className="mt-1 text-[11px] text-slate-400">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Component Detail Inspection Modal */}
      {inspectComponent && (
        <ComponentDetailModal
          component={inspectComponent}
          onClose={() => setInspectComponent(null)}
        />
      )}
    </div>
  );
}
