import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import CompatibilityHUD from '../components/CompatibilityHUD';
import BenchmarkEstimator from '../components/BenchmarkEstimator';
import ComponentSelectorModal from '../components/ComponentSelectorModal';
import ComponentDetailModal from '../components/ComponentDetailModal';
import ProductImage from '../components/ProductImage';
import { 
  Cpu, CircuitBoard, MemoryStick, HardDrive, Gamepad2, Zap, Box, Fan, 
  Plus, RefreshCw, Trash2, CheckCircle2, AlertCircle, Sparkles, Eye,
  Printer, Copy, X, ShieldCheck, FileText, Check, Truck, CreditCard,
  Info, MapPin, PackageCheck, Clock, ArrowRight, Layers, Search,
  Palette, Video, Briefcase, ChevronRight
} from 'lucide-react';

const ICON_MAP = {
  CPU: Cpu,
  MOTHERBOARD: CircuitBoard,
  RAM: MemoryStick,
  STORAGE: HardDrive,
  GPU: Gamepad2,
  PSU: Zap,
  CABINET: Box,
  COOLING: Fan
};

export default function ConfiguratorPage() {
  const { 
    customBuild, 
    addBuildComponent, 
    removeBuildComponent, 
    clearCustomBuild, 
    loadPresetIntoConfigurator,
    CATEGORIES,
    showNotification,
    user,
    addToCart,
    setActivePage
  } = useApp();

  const [activeModalCategory, setActiveModalCategory] = useState(null);
  const [compatibilityReport, setCompatibilityReport] = useState(null);
  const [checking, setChecking] = useState(false);
  const [inspectComponent, setInspectComponent] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetsList, setPresetsList] = useState([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [presetCategory, setPresetCategory] = useState('ALL');
  const [presetSearch, setPresetSearch] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (showPresetModal && presetsList.length === 0) {
      setLoadingPresets(true);
      apiClient.getPresets()
        .then(data => {
          setPresetsList(data);
          setLoadingPresets(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingPresets(false);
        });
    }
  }, [showPresetModal]);

  // Normalize categories so whether items are strings or {key, label, icon, desc} objects, they render reliably as strings
  const categoryList = (CATEGORIES && CATEGORIES.length > 0 ? CATEGORIES : [
    { key: 'CPU', label: 'Processor (CPU)' },
    { key: 'MOTHERBOARD', label: 'Motherboard' },
    { key: 'RAM', label: 'Memory (RAM)' },
    { key: 'STORAGE', label: 'Storage (SSD)' },
    { key: 'GPU', label: 'Graphics Card (GPU)' },
    { key: 'PSU', label: 'Power Supply (PSU)' },
    { key: 'CABINET', label: 'Cabinet / Case' },
    { key: 'COOLING', label: 'Cooling Solution' },
  ]).map(item =>
    typeof item === 'string'
      ? { key: item, label: item }
      : { key: item.key || item.name, label: item.label || item.key || item.name }
  );

  // Trigger compatibility check whenever customBuild changes
  useEffect(() => {
    const selectedIds = Object.values(customBuild).map(c => c.id).filter(Boolean);
    if (selectedIds.length === 0) {
      setCompatibilityReport(null);
      return;
    }

    setChecking(true);
    apiClient.checkCompatibility(selectedIds)
      .then(report => {
        setCompatibilityReport(report);
        setChecking(false);
      })
      .catch(err => {
        console.error(err);
        setChecking(false);
      });
  }, [customBuild]);

  const handleSelectComponent = (comp) => {
    addBuildComponent(activeModalCategory, comp);
    setActiveModalCategory(null);
  };

  const isBuildCompatible = compatibilityReport ? (compatibilityReport.compatible ?? compatibilityReport.isCompatible) : true;

  const handleCompleteBuild = () => {
    if (compatibilityReport && !isBuildCompatible) {
      showNotification('Cannot finalize build with compatibility conflicts. Please resolve them first.', 'error');
      return;
    }

    const componentsList = Object.values(customBuild);
    if (componentsList.length === 0) {
      showNotification('Build is empty. Please select components first.', 'error');
      return;
    }

    setShowSummaryModal(true);
    showNotification('Build configuration completed & verified!', 'success');
  };

  const handleProceedToCheckout = () => {
    if (compatibilityReport && !isBuildCompatible) {
      showNotification('Cannot finalize build with compatibility conflicts. Please resolve them first.', 'error');
      return;
    }
    const componentsList = Object.values(customBuild);
    if (componentsList.length === 0) {
      showNotification('Build is empty. Please select components first.', 'error');
      return;
    }

    const cpu = customBuild['CPU'];
    const gpu = customBuild['GPU'];
    const title = cpu && gpu 
      ? `${cpu.brand} ${cpu.model} + ${gpu.model} Custom Rig`
      : 'Custom PC Rig';

    addToCart({
      id: `custom-build-${Date.now()}`,
      name: title,
      type: 'CUSTOM PC',
      price: compatibilityReport?.subtotal || componentsList.reduce((s, c) => s + Number(c.price), 0),
      components: componentsList,
      imageUrl: '/desk-setup.jpg',
      quantity: 1
    });

    setShowSummaryModal(false);
    setShowShippingModal(false);
    setActivePage('checkout');
    showNotification('Build added to cart! Proceeding to checkout.', 'success');
  };

  const handleCopySpec = () => {
    const lines = [
      '==============================',
      '   BuildO PC Specification    ',
      '==============================',
      ...Object.entries(customBuild).map(([cat, comp]) => `${cat}: ${comp.name} - ₹${Number(comp.price).toLocaleString('en-IN')}`),
      '------------------------------',
      `Subtotal: ₹${Number(compatibilityReport?.subtotal || 0).toLocaleString('en-IN')}`,
      `Total Estimated Price: ₹${Number(compatibilityReport?.totalPrice || 0).toLocaleString('en-IN')}`,
      `Compatibility: ${isBuildCompatible ? '100% Compatible' : 'Conflicts Detected'}`,
      '=============================='
    ];

    navigator.clipboard.writeText(lines.join('\n'))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        showNotification('Build specification copied to clipboard!', 'success');
      })
      .catch(() => {
        showNotification('Unable to copy specification automatically.', 'info');
      });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="buildo-shop-page buildo-builder-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold mb-2 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            INTERACTIVE HARDWARE CONFIGURATOR
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Build without the guesswork.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose every component with live socket matching, power checks, exact pricing, and gaming performance estimates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPresetModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/35 hover:to-cyan-600/35 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold shadow-sm transition-all cursor-pointer group"
          >
            <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Load balanced preset</span>
          </button>

          {Object.keys(customBuild).length > 0 && (
            <button
              onClick={clearCustomBuild}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800/40 text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear Configuration
            </button>
          )}
        </div>
      </div>

      {/* Real-time Compatibility HUD */}
      <CompatibilityHUD report={compatibilityReport} loading={checking} />

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Component Slots (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {Object.keys(customBuild).length === 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/60 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Looking for a faster start?</h4>
                  <p className="text-xs text-slate-400">Load a balanced preset now, then tune every part to make it yours.</p>
                </div>
              </div>
              <button
                onClick={() => setShowPresetModal(true)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex-shrink-0"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Choose preset</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Required components</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                {Object.keys(customBuild).length} / {categoryList.length} selected
              </span>
            </h2>
            <span className="text-xs text-cyan-400 font-mono">
              AUTO-VALIDATION ACTIVE
            </span>
          </div>

          <div className="space-y-3">
            {categoryList.map(catItem => {
              const catKey = catItem.key;
              const selected = customBuild[catKey];
              const Icon = ICON_MAP[catKey] || Cpu;

              return (
                <div
                  key={catKey}
                  className={`glass-panel p-4 rounded-2xl border transition-all ${
                    selected
                      ? 'border-cyan-500/40 bg-slate-900/60 shadow-lg'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Category icon & label */}
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        selected
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                          {catItem.label}
                        </div>
                        {selected ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-white hover:text-cyan-400 transition-colors">
                              {selected.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            No component selected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions & Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-14 sm:pl-0">
                      {selected ? (
                        <>
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-white font-mono">
                              ₹{Number(selected.price).toLocaleString('en-IN')}
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono">In Stock</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setInspectComponent(selected)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Inspect Specs"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setActiveModalCategory(catKey)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-400 border border-transparent hover:border-cyan-500/40 transition-all"
                              title="Change Component"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => removeBuildComponent(catKey)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-transparent hover:border-rose-500/40 transition-all"
                              title="Remove Component"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => setActiveModalCategory(catKey)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Choose {catItem.label}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick specs pill row */}
                  {selected && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-dark-950/80 border border-slate-800">
                        Brand: <strong className="text-slate-200">{selected.brand}</strong>
                      </span>
                      {selected.socketType && (
                        <span className="px-2 py-0.5 rounded bg-dark-950/80 border border-slate-800">
                          Socket: <strong className="text-cyan-400">{selected.socketType}</strong>
                        </span>
                      )}
                      {selected.wattage > 0 && (
                        <span className="px-2 py-0.5 rounded bg-dark-950/80 border border-slate-800">
                          Power: <strong className="text-amber-400">{selected.wattage}W</strong>
                        </span>
                      )}
                      {selected.formFactor && (
                        <span className="px-2 py-0.5 rounded bg-dark-950/80 border border-slate-800">
                          Form Factor: <strong className="text-slate-200">{selected.formFactor}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Real-time FPS Benchmark Estimator */}
          <div className="pt-4">
            <BenchmarkEstimator customBuild={customBuild} />
          </div>
        </div>

        {/* Sticky Price & Summary Sidebar (4 Cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
          <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-end justify-between">
              <span>
                <span className="buildo-page-eyebrow block">YOUR BUILD</span>
                <span className="mt-1 block">Configuration</span>
              </span>
              <span className="text-xs font-mono font-normal text-slate-400">
                {Object.keys(customBuild).length} / 8
              </span>
            </h3>

            {/* Itemized list preview */}
            <div className="space-y-2 text-xs border-y border-slate-800/80 py-4 max-h-56 overflow-y-auto">
              {Object.entries(customBuild).length === 0 ? (
                <p className="text-slate-500 italic py-2 text-center">No components selected yet</p>
              ) : (
                Object.entries(customBuild).map(([cat, comp]) => (
                  <div key={cat} className="flex justify-between items-center text-slate-300">
                    <span className="font-mono text-cyan-400 text-[10px] w-20 truncate">{cat}:</span>
                    <span className="truncate flex-1 px-2 text-slate-200">{comp.name}</span>
                    <span className="font-mono font-semibold text-white">
                      ₹{Number(comp.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Financial Totals with Shipping Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Components subtotal:</span>
                <span className="font-mono text-slate-200">
                  ₹{Number(compatibilityReport?.subtotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated GST (18%):</span>
                <span className="font-mono text-slate-200">
                  ₹{Number(compatibilityReport?.taxAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 items-center">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Shipping & Safe Packaging:</span>
                </span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-emerald-400 font-bold">₹0</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                    FREE
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-sm font-bold text-white block">Total order value</span>
                  <span className="text-[10px] text-slate-400">Includes GST & insured delivery</span>
                </div>
                <span className="text-xl font-extrabold text-cyan-400 font-mono">
                  ₹{Number(compatibilityReport?.totalPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Keep checkout prominent and group additional build tools out of the main flow. */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleProceedToCheckout}
                disabled={Object.keys(customBuild).length === 0 || (compatibilityReport && !isBuildCompatible)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer group"
              >
                <CreditCard className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Proceed to checkout</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 className={`h-3.5 w-3.5 ${compatibilityReport && !isBuildCompatible ? 'text-rose-400' : 'text-emerald-400'}`} />
                {checking ? 'Checking compatibility…' : compatibilityReport && !isBuildCompatible ? 'Resolve compatibility conflicts before checkout' : 'Compatibility verified as you build'}
              </p>

              <details className="group rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3">
                <summary className="cursor-pointer list-none text-xs font-semibold text-slate-300 marker:hidden">
                  <span className="flex items-center justify-between">
                    More build options
                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                  </span>
                </summary>
                <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                  <button
                    onClick={() => setShowShippingModal(true)}
                    disabled={Object.keys(customBuild).length === 0 || (compatibilityReport && !isBuildCompatible)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <span>Shipping & delivery details</span>
                  </button>

                  <button
                    onClick={handleCompleteBuild}
                    disabled={Object.keys(customBuild).length === 0 || (compatibilityReport && !isBuildCompatible)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verify & complete build</span>
                  </button>

                  {Object.keys(customBuild).length > 0 && (
                    <button
                      onClick={() => setShowSummaryModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>View build spec sheet</span>
                    </button>
                  )}
                </div>
              </details>
            </div>

          </div>
        </div>
      </div>

      {/* Component Selector Modal */}
      {activeModalCategory && (
        <ComponentSelectorModal
          category={activeModalCategory}
          currentSelected={customBuild[activeModalCategory]}
          currentBuild={customBuild}
          onSelect={handleSelectComponent}
          onClose={() => setActiveModalCategory(null)}
        />
      )}

      {/* Component Detail Inspection Modal */}
      {inspectComponent && (
        <ComponentDetailModal
          component={inspectComponent}
          currentBuild={customBuild}
          isSelected={Boolean(Object.values(customBuild).find(c => c.id === inspectComponent.id))}
          onSelect={(comp) => {
            addBuildComponent(comp.category, comp);
            setInspectComponent(null);
          }}
          onClose={() => setInspectComponent(null)}
        />
      )}

      {/* Build Specification Modal (Dedicated Complete Build View) */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between bg-dark-950/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Custom Build Specification</h3>
                  <p className="text-xs text-slate-400">Validated BuildO Hardware Configuration</p>
                </div>
              </div>

              <button
                onClick={() => setShowSummaryModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Compatibility Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="text-xs text-emerald-200">
                  <strong className="block font-semibold">100% Hardware Compatibility Confirmed</strong>
                  Socket type, power budget, form factor clearances, and RAM profiles verified.
                </div>
              </div>

              {/* Hardware List Table */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-dark-950/90 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Component Name</th>
                      <th className="p-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {categoryList.map(catItem => {
                      const comp = customBuild[catItem.key];
                      return (
                        <tr key={catItem.key} className="hover:bg-slate-800/30">
                          <td className="p-3 font-mono text-cyan-400 font-medium">{catItem.label}</td>
                          <td className="p-3 text-white font-medium">
                            {comp ? comp.name : <span className="text-slate-500 italic">Not Selected</span>}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-white">
                            {comp ? `₹${Number(comp.price).toLocaleString('en-IN')}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Price & Summary */}
              <div className="p-4 rounded-2xl bg-dark-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Components Subtotal:</span>
                  <span className="font-mono text-slate-200">
                    ₹{Number(compatibilityReport?.subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated GST (18%):</span>
                  <span className="font-mono text-slate-200">
                    ₹{Number(compatibilityReport?.taxAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Total Configuration Price:</span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">
                    ₹{Number(compatibilityReport?.totalPrice || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 pt-4 border-t border-slate-800 bg-dark-950/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={handleCopySpec}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{copied ? 'Copied!' : 'Copy Spec'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  <span>Print Spec Sheet</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  Continue Editing
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-slate-950" />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping & Delivery Details Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between bg-dark-950/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Shipping & Delivery Details</h3>
                  <p className="text-xs text-slate-400">
                    Doorstep delivery address, custom protective packaging & live tracking
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowShippingModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Two-Column Grid: Shipping & Payment Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Column 1: Shipping & Protective Logistics */}
                <div className="p-5 rounded-2xl bg-dark-950/70 border border-slate-800/90 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                    <PackageCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Safe Doorstep Delivery</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Insured Transit Logistics</span>
                    </div>
                  </div>

                  {/* Destination Details */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Delivery Recipient & Address</span>
                    </div>
                    <p className="text-slate-400 pl-5">
                      <span className="text-white font-semibold block">{user?.fullName || user?.username || 'Verified Customer'}</span>
                      {user?.address || '42 Silicon Enclave, Indiranagar, Bangalore - 560038'}
                    </p>
                    <div className="pl-5 pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                        <Check className="w-3 h-3" />
                        <span>PIN 560038: Serviceable via BlueDart Apex Air (2-3 Days)</span>
                      </span>
                    </div>
                  </div>

                  {/* Logistics Feature Points */}
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <strong className="text-white">Instapak® Custom Foam Cushion:</strong>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Custom-molded expanding foam injected inside the PC chassis to hold the heavy GPU and air cooler firmly, preventing PCIe slot stress during courier transit.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <strong className="text-white">Live Courier GPS Tracking:</strong>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Real-time delivery updates via BlueDart & Delhivery Express with SMS and WhatsApp alerts.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <strong className="text-white">100% In-Transit Insurance:</strong>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Comprehensive replacement insurance covering accidental drops or damage at zero extra charge.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Payment Gateways & GST Invoicing */}
                <div className="p-5 rounded-2xl bg-dark-950/70 border border-slate-800/90 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Payment Options & Invoicing</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Commercial Tax Compliance</span>
                    </div>
                  </div>

                  {/* Supported Payment Channels */}
                  <div className="space-y-2 text-xs">
                    <span className="text-slate-400 block font-medium">Supported Payment Channels:</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
                        <strong className="text-cyan-300 block">UPI / QR Code</strong>
                        <span className="text-slate-500 text-[10px]">GPay, PhonePe, Paytm (0% Fee)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
                        <strong className="text-cyan-300 block">Cards & Net Banking</strong>
                        <span className="text-slate-500 text-[10px]">Visa, RuPay, 50+ Banks</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
                        <strong className="text-cyan-300 block">No-Cost EMI</strong>
                        <span className="text-slate-500 text-[10px]">3, 6, 9 & 12 Months</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
                        <strong className="text-cyan-300 block">GST Invoicing</strong>
                        <span className="text-slate-500 text-[10px]">B2B & B2C Input Credit</span>
                      </div>
                    </div>
                  </div>

                  {/* Commercial Invoicing Specs */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                    <span className="text-slate-300 font-medium block">Tax Compliance & Warranties:</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Generated orders include itemized 18% GST calculation (CGST + SGST) with HSN 8471 codes. Each component carries individual serial numbers for manufacturer warranty claims.
                    </p>
                  </div>

                  {/* Build Valuation Breakdown */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Hardware Subtotal:</span>
                      <span className="font-mono text-slate-200">
                        ₹{Number(compatibilityReport?.subtotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>GST (18%):</span>
                      <span className="font-mono text-slate-200">
                        ₹{Number(compatibilityReport?.taxAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Insured Courier Delivery:</span>
                      <span className="font-mono text-emerald-400 font-semibold">₹0 (FREE)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="font-bold text-white">Estimated Order Total:</span>
                      <span className="font-mono text-base font-extrabold text-cyan-400">
                        ₹{Number(compatibilityReport?.totalPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-4 border-t border-slate-800 bg-dark-950/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  <span>Print Build & Shipping Spec</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  Back to Builder
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-slate-950" />
                  <span>Confirm & Proceed to Checkout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preset Build Selection Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-dark-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Load a Curated Preset Build</h3>
                  <p className="text-xs text-slate-400">Select a pre-balanced rig. All 8 parts will load into your builder for instant compatibility check.</p>
                </div>
              </div>

              <button
                onClick={() => setShowPresetModal(false)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {[
                  { key: 'ALL', label: 'All', icon: Layers },
                  { key: 'GAMING', label: 'Gaming', icon: Gamepad2 },
                  { key: 'STUDIO', label: 'Studio & 3D', icon: Palette },
                  { key: 'VIDEO_EDITING', label: 'Video Editing', icon: Video },
                  { key: 'OFFICE', label: 'Office', icon: Briefcase },
                ].map(tab => {
                  const TabIcon = tab.icon;
                  const isActive = presetCategory === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setPresetCategory(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter presets..."
                  value={presetSearch}
                  onChange={e => setPresetSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Presets List */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {loadingPresets ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-xs">Loading presets...</p>
                </div>
              ) : (() => {
                const filtered = presetsList
                  .filter(p => presetCategory === 'ALL' || p.category?.toUpperCase() === presetCategory)
                  .filter(p => {
                    const q = presetSearch.toLowerCase();
                    return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
                  });

                if (filtered.length === 0) {
                  return (
                    <div className="py-16 text-center text-slate-400 glass-panel rounded-2xl">
                      <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-300">No preset builds found.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(preset => (
                      <div
                        key={preset.id}
                        className="glass-panel p-4 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/50 flex flex-col justify-between transition-all group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                              {preset.category}
                            </span>
                            <div className="text-right font-mono font-bold text-white text-sm">
                              ₹{Number(preset.basePrice).toLocaleString('en-IN')}
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {preset.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {preset.description}
                          </p>

                          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400 font-mono">
                            <div className="truncate flex items-center gap-1">
                              <span className="text-cyan-400 font-semibold text-[10px]">CPU:</span>
                              <span className="truncate">{preset.components?.find(c => c.category === 'CPU')?.name || 'Included'}</span>
                            </div>
                            <div className="truncate flex items-center gap-1">
                              <span className="text-cyan-400 font-semibold text-[10px]">GPU:</span>
                              <span className="truncate">{preset.components?.find(c => c.category === 'GPU')?.name || 'Included'}</span>
                            </div>
                            <div className="truncate flex items-center gap-1">
                              <span className="text-cyan-400 font-semibold text-[10px]">RAM:</span>
                              <span className="truncate">{preset.components?.find(c => c.category === 'RAM')?.name || 'Included'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">8 Pre-tested parts</span>
                          <button
                            onClick={() => {
                              loadPresetIntoConfigurator(preset);
                              setShowPresetModal(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                          >
                            <span>Load this Build</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-dark-950/80 flex justify-end">
              <button
                onClick={() => setShowPresetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
