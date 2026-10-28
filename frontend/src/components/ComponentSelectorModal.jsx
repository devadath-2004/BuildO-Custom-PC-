import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { 
  X, Search, Check, AlertCircle, Sparkles, Filter, 
  Eye, CheckCircle2, ShieldAlert, ChevronRight 
} from 'lucide-react';
import ProductImage from './ProductImage';
import ComponentDetailModal from './ComponentDetailModal';

export default function ComponentSelectorModal({ category, currentSelected, currentBuild = {}, onSelect, onClose }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [budgetFilter, setBudgetFilter] = useState('ALL'); // ALL, BUDGET, MID, HIGH
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [onlyCompatible, setOnlyCompatible] = useState(false);
  const [inspectComponent, setInspectComponent] = useState(null);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    apiClient.getComponentsByCategory(category)
      .then(data => {
        setComponents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [category]);

  // Compute smart compatibility hint for each candidate
  const getCompatibilityHint = (comp) => {
    if (category === 'MOTHERBOARD' && currentBuild.CPU) {
      const match = comp.socket?.toLowerCase() === currentBuild.CPU.socket?.toLowerCase();
      return match
        ? { ok: true, text: `Matches CPU Socket (${comp.socket})` }
        : { ok: false, text: `Socket Mismatch: ${comp.socket} vs ${currentBuild.CPU.socket}` };
    }
    if (category === 'CPU' && currentBuild.MOTHERBOARD) {
      const match = comp.socket?.toLowerCase() === currentBuild.MOTHERBOARD.socket?.toLowerCase();
      return match
        ? { ok: true, text: `Matches Motherboard Socket (${comp.socket})` }
        : { ok: false, text: `Socket Mismatch: ${comp.socket} vs ${currentBuild.MOTHERBOARD.socket}` };
    }
    if (category === 'RAM' && currentBuild.MOTHERBOARD) {
      const match = comp.memoryType?.toLowerCase() === currentBuild.MOTHERBOARD.memoryType?.toLowerCase();
      return match
        ? { ok: true, text: `Matches Memory Generation (${comp.memoryType})` }
        : { ok: false, text: `Incompatible Type: ${comp.memoryType} vs ${currentBuild.MOTHERBOARD.memoryType}` };
    }
    if (category === 'CABINET' && currentBuild.MOTHERBOARD) {
      const supp = comp.supportedFormFactors?.toLowerCase() || '';
      const moboFactor = currentBuild.MOTHERBOARD.formFactor?.toLowerCase() || '';
      const match = supp.includes(moboFactor);
      return match
        ? { ok: true, text: `Supports ${currentBuild.MOTHERBOARD.formFactor} Board` }
        : { ok: false, text: `Case does not mount ${currentBuild.MOTHERBOARD.formFactor}` };
    }
    if (category === 'GPU' && currentBuild.CABINET && comp.lengthMm && currentBuild.CABINET.maxGpuLengthMm) {
      const fits = comp.lengthMm <= currentBuild.CABINET.maxGpuLengthMm;
      return fits
        ? { ok: true, text: `Fits case (${comp.lengthMm}mm / ${currentBuild.CABINET.maxGpuLengthMm}mm max)` }
        : { ok: false, text: `Too long for case (${comp.lengthMm}mm > ${currentBuild.CABINET.maxGpuLengthMm}mm)` };
    }
    return null;
  };

  // Extract unique brands for brand filter pills
  const availableBrands = Array.from(new Set(components.map(c => c.brand).filter(Boolean))).sort();

  // Multi-tier filtering
  const filtered = components
    .filter(c => {
      // 1. Text search
      const q = search.toLowerCase();
      const matchesSearch = (
        c.name.toLowerCase().includes(q) ||
        (c.brand && c.brand.toLowerCase().includes(q)) ||
        (c.model && c.model.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
      if (!matchesSearch) return false;

      // 2. Budget tier filter
      const price = Number(c.price);
      if (budgetFilter === 'BUDGET' && price > 15000) return false;
      if (budgetFilter === 'MID' && (price <= 15000 || price > 35000)) return false;
      if (budgetFilter === 'HIGH' && price <= 35000) return false;

      // 3. Brand filter
      if (selectedBrand !== 'ALL' && c.brand !== selectedBrand) return false;

      // 4. Compatibility only filter
      if (onlyCompatible) {
        const hint = getCompatibilityHint(c);
        if (hint && !hint.ok) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <>
      <div className="buildo-component-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="buildo-component-modal bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-dark-850/90">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
                  Hardware Catalog
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/40">
                  {components.length} Available
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Select {category}
                <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                  (Showing {filtered.length} matching your criteria)
                </span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search, Sort & Multi-Budget Filter Toolbar */}
          <div className="p-3 sm:p-4 border-b border-slate-800 bg-dark-900 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${category.toLowerCase()} by brand, specs or model...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value)}
                  className="bg-dark-950 border border-slate-700 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>

                {/* Only Compatible Toggle */}
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs text-slate-300 cursor-pointer hover:border-cyan-500/50 select-none">
                  <input
                    type="checkbox"
                    checked={onlyCompatible}
                    onChange={e => setOnlyCompatible(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5 bg-slate-900"
                  />
                  <span className="hidden sm:inline">Compatible Only</span>
                  <span className="sm:hidden">Compatible</span>
                </label>
              </div>
            </div>

            {/* Budget Tier Pills & Brand Filter */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {/* Budget Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3 text-cyan-400" />
                  Budget:
                </span>
                {[
                  { key: 'ALL', label: 'All Tiers' },
                  { key: 'BUDGET', label: 'Budget (< ₹15k)' },
                  { key: 'MID', label: 'Mid-Range (₹15k - ₹35k)' },
                  { key: 'HIGH', label: 'High-End (> ₹35k)' },
                ].map(b => (
                  <button
                    key={b.key}
                    onClick={() => setBudgetFilter(b.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                      budgetFilter === b.key
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                        : 'bg-dark-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Brand Pills */}
              {availableBrands.length > 1 && (
                <div className="flex flex-wrap items-center gap-1 text-xs">
                  <span className="text-[11px] font-mono text-slate-400 mr-1">Brand:</span>
                  <button
                    onClick={() => setSelectedBrand('ALL')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      selectedBrand === 'ALL'
                        ? 'bg-slate-700 text-white font-bold'
                        : 'bg-dark-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    All
                  </button>
                  {availableBrands.slice(0, 5).map(b => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        selectedBrand === b
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                          : 'bg-dark-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Component List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm">Loading verified components from catalog...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-500" />
                <p className="text-sm font-semibold text-slate-300">No components match your current filters.</p>
                <p className="text-xs text-slate-500">
                  Try clearing the budget filter or unchecking "Compatible Only".
                </p>
                <button
                  onClick={() => {
                    setBudgetFilter('ALL');
                    setSelectedBrand('ALL');
                    setOnlyCompatible(false);
                    setSearch('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filtered.map((comp, index) => {
                const isSelected = currentSelected?.id === comp.id;
                const hint = getCompatibilityHint(comp);

                return (
                  <div
                    key={comp.id}
                    className={`buildo-component-option p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                      isSelected ? 'is-selected' : ''
                    } ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                        : hint?.ok === false
                        ? 'bg-dark-950/60 border-slate-800/80 hover:border-rose-900/60'
                        : 'bg-dark-950/80 border-slate-800 hover:border-slate-700 hover:bg-dark-850'
                    }`}
                    style={{ '--buildo-stagger': `${Math.min(index, 9) * 35}ms` }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Exact Product Photo Component with hover zoom & inspect trigger */}
                      <ProductImage
                        component={comp}
                        className="w-16 h-16 sm:w-20 sm:h-20"
                        showBrandBadge={true}
                        showInspectButton={true}
                        onInspect={() => setInspectComponent(comp)}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {comp.brand}
                          </span>
                          {comp.model && (
                            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                              {comp.model}
                            </span>
                          )}
                          {hint && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                hint.ok
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                                  : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              {hint.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <h4 
                            onClick={() => setInspectComponent(comp)}
                            className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors cursor-pointer truncate"
                            title="Click to view full specs"
                          >
                            {comp.name}
                          </h4>
                          <button
                            onClick={() => setInspectComponent(comp)}
                            className="text-slate-400 hover:text-cyan-400 p-1 transition-colors flex-shrink-0"
                            title="Inspect specs and photo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {comp.description}
                        </p>

                        {/* Attribute Pills */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
                          {comp.socket && <span className="bg-slate-800/70 px-1.5 py-0.5 rounded text-slate-300">Socket: {comp.socket}</span>}
                          {comp.formFactor && <span className="bg-slate-800/70 px-1.5 py-0.5 rounded text-slate-300">Form: {comp.formFactor}</span>}
                          {comp.memoryType && <span className="bg-slate-800/70 px-1.5 py-0.5 rounded text-slate-300">RAM: {comp.memoryType}</span>}
                          {comp.tdp && <span className="bg-slate-800/70 px-1.5 py-0.5 rounded text-amber-300">{comp.tdp}W TDP</span>}
                          {comp.wattage && <span className="bg-slate-800/70 px-1.5 py-0.5 rounded text-cyan-300">{comp.wattage}W</span>}
                          {comp.efficiencyRating && <span className="bg-slate-800/70 px-1.5 py-0.5 rounded text-yellow-400">{comp.efficiencyRating}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-extrabold text-white font-mono">
                          ₹{Number(comp.price).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold font-mono">In Stock</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInspectComponent(comp)}
                          className="px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors hidden sm:flex items-center gap-1"
                        >
                          Specs
                        </button>

                        <button
                          onClick={() => onSelect(comp)}
                          disabled={isSelected}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-slate-800 text-cyan-400 cursor-default border border-cyan-500/30'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Component Detail Inspection Modal */}
      {inspectComponent && (
        <ComponentDetailModal
          component={inspectComponent}
          currentBuild={currentBuild}
          isSelected={currentSelected?.id === inspectComponent.id}
          onSelect={(comp) => {
            onSelect(comp);
            setInspectComponent(null);
          }}
          onClose={() => setInspectComponent(null)}
        />
      )}
    </>
  );
}
