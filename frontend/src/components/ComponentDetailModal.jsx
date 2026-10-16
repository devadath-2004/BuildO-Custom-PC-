import React, { useEffect } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Plus, 
  RefreshCw, Award, Gauge, Zap, Box, Layers, Cpu 
} from 'lucide-react';
import { getBrandConfig, getExactPhotoUrl, getComponentSpecs } from '../utils/hardwareData';
import ProductImage from './ProductImage';

export default function ComponentDetailModal({ component, currentBuild = {}, onSelect, onClose, isSelected = false }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!component) return null;

  const brand = getBrandConfig(component.brand);
  const specs = getComponentSpecs(component);
  const photoUrl = getExactPhotoUrl(component);

  // Real-time compatibility verification with currently selected build
  const checkBuildCompatibility = () => {
    const issues = [];
    const passes = [];

    if (component.category === 'CPU' && currentBuild.MOTHERBOARD) {
      if (component.socket && currentBuild.MOTHERBOARD.socket && 
          component.socket.toLowerCase() !== currentBuild.MOTHERBOARD.socket.toLowerCase()) {
        issues.push(`Socket mismatch: CPU uses ${component.socket}, but your motherboard uses ${currentBuild.MOTHERBOARD.socket}`);
      } else {
        passes.push(`Socket matched with ${currentBuild.MOTHERBOARD.name} (${component.socket})`);
      }
    }

    if (component.category === 'MOTHERBOARD' && currentBuild.CPU) {
      if (component.socket && currentBuild.CPU.socket && 
          component.socket.toLowerCase() !== currentBuild.CPU.socket.toLowerCase()) {
        issues.push(`Socket mismatch: Motherboard uses ${component.socket}, but your CPU uses ${currentBuild.CPU.socket}`);
      } else {
        passes.push(`Socket matched with ${currentBuild.CPU.name} (${component.socket})`);
      }
    }

    if (component.category === 'RAM' && currentBuild.MOTHERBOARD) {
      if (component.memoryType && currentBuild.MOTHERBOARD.memoryType && 
          component.memoryType.toLowerCase() !== currentBuild.MOTHERBOARD.memoryType.toLowerCase()) {
        issues.push(`Memory type conflict: RAM is ${component.memoryType}, but motherboard requires ${currentBuild.MOTHERBOARD.memoryType}`);
      } else {
        passes.push(`DDR Generation matched with ${currentBuild.MOTHERBOARD.name} (${component.memoryType})`);
      }
    }

    if (component.category === 'GPU' && currentBuild.CABINET && component.lengthMm && currentBuild.CABINET.maxGpuLengthMm) {
      if (component.lengthMm > currentBuild.CABINET.maxGpuLengthMm) {
        issues.push(`Physical clearance warning: GPU length (${component.lengthMm}mm) exceeds case limit (${currentBuild.CABINET.maxGpuLengthMm}mm)`);
      } else {
        passes.push(`Fits inside case: ${component.lengthMm}mm vs ${currentBuild.CABINET.maxGpuLengthMm}mm max clearance`);
      }
    }

    if (component.category === 'GPU' && currentBuild.PSU && currentBuild.PSU.wattage) {
      const minWattage = component.tdp ? (component.tdp > 280 ? 750 : 550) : 550;
      if (currentBuild.PSU.wattage < minWattage) {
        issues.push(`Power warning: GPU recommends at least a ${minWattage}W PSU, your PSU is ${currentBuild.PSU.wattage}W`);
      } else {
        passes.push(`PSU wattage adequate: ${currentBuild.PSU.wattage}W provides stable headroom`);
      }
    }

    return { issues, passes };
  };

  const { issues, passes } = checkBuildCompatibility();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center gap-3">
            <span
              className="text-xs uppercase font-mono font-bold px-2.5 py-1 rounded-md border"
              style={{ 
                backgroundColor: `${brand.color}20`, 
                borderColor: `${brand.color}50`, 
                color: brand.color 
              }}
            >
              {component.brand}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {component.category}
            </span>
            {specs?.budgetTier && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {specs.budgetTier}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Hero: Large Photo + Title & Price */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* High-Res Photo Container */}
            <div className="md:col-span-5 bg-dark-950 rounded-2xl border border-slate-800 p-4 flex items-center justify-center relative group overflow-hidden">
              <div 
                className="absolute inset-0 opacity-20 blur-xl pointer-events-none"
                style={{ backgroundColor: brand.color }}
              />
              <img
                src={photoUrl}
                alt={component.name}
                className="w-full h-56 object-contain rounded-xl relative z-10 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-2 right-2 z-20 px-2 py-1 rounded bg-dark-900/80 backdrop-blur-sm border border-slate-800 text-[10px] font-mono text-slate-400">
                Exact Verified Photo
              </div>
            </div>

            {/* Title, Model, Price and Short Description */}
            <div className="md:col-span-7 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {component.name}
              </h2>

              <p className="text-xs font-mono text-slate-400">
                Part Number / Model: <span className="text-slate-200">{component.model || 'Standard OEM'}</span>
              </p>

              <div className="pt-2">
                <div className="text-xs text-slate-400">M.R.P. Inclusive of Taxes</div>
                <div className="text-2xl font-extrabold text-cyan-400 font-mono">
                  ₹{Number(component.price).toLocaleString('en-IN')}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-dark-950/80 p-3 rounded-xl border border-slate-800/80">
                {component.description}
              </p>

              {/* Warranty & In-Stock Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock & Ready to Ship
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/50 text-blue-300 border border-blue-800/40 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {specs?.warranty || '3 Years Brand Warranty'}
                </span>
              </div>
            </div>
          </div>

          {/* Compatibility Verdict Banner */}
          {(issues.length > 0 || passes.length > 0) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Compatibility with Current Build
              </h4>

              {issues.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-1">
                  {issues.map((iss, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>{iss}</span>
                    </div>
                  ))}
                </div>
              )}

              {passes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                  {passes.map((pass, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{pass}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full Specifications Sheet */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Technical Specifications Sheet
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              {component.socket && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Socket / Interface</span>
                  <span className="text-white font-bold">{component.socket}</span>
                </div>
              )}
              {component.formFactor && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Form Factor</span>
                  <span className="text-white font-bold">{component.formFactor}</span>
                </div>
              )}
              {component.memoryType && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Memory Generation</span>
                  <span className="text-white font-bold">{component.memoryType}</span>
                </div>
              )}
              {component.memorySlots && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">DIMM Slots</span>
                  <span className="text-white font-bold">{component.memorySlots} Slots</span>
                </div>
              )}
              {component.speedMhz && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Frequency / Speed</span>
                  <span className="text-white font-bold">{component.speedMhz} MHz</span>
                </div>
              )}
              {component.tdp && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Thermal Design Power</span>
                  <span className="text-amber-300 font-bold">{component.tdp} Watts TDP</span>
                </div>
              )}
              {component.wattage && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Power Output</span>
                  <span className="text-cyan-300 font-bold">{component.wattage} Watts Continuous</span>
                </div>
              )}
              {component.efficiencyRating && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">80 PLUS Certification</span>
                  <span className="text-yellow-400 font-bold">{component.efficiencyRating}</span>
                </div>
              )}
              {component.lengthMm && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Hardware Length</span>
                  <span className="text-white font-bold">{component.lengthMm} mm</span>
                </div>
              )}
              {component.maxGpuLengthMm && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Max GPU Clearance</span>
                  <span className="text-emerald-300 font-bold">{component.maxGpuLengthMm} mm</span>
                </div>
              )}
              {component.radiatorSizeMm && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Radiator Size</span>
                  <span className="text-cyan-300 font-bold">{component.radiatorSizeMm} mm</span>
                </div>
              )}
              {specs?.cores && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Cores / Threads</span>
                  <span className="text-white font-bold">{specs.cores}</span>
                </div>
              )}
              {specs?.clocks && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Clock Speeds</span>
                  <span className="text-white font-bold">{specs.clocks}</span>
                </div>
              )}
              {specs?.vram && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">VRAM Frame Buffer</span>
                  <span className="text-white font-bold">{specs.vram}</span>
                </div>
              )}
              {specs?.architecture && (
                <div className="bg-dark-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Micro-Architecture</span>
                  <span className="text-white font-bold">{specs.architecture}</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Product Highlights */}
          {specs?.highlights && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Key Architectural Highlights
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                {specs.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 bg-dark-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <Award className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-dark-850 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          {onSelect && (
            <button
              onClick={() => {
                onSelect(component);
                onClose();
              }}
              disabled={isSelected}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isSelected
                  ? 'bg-slate-800 text-cyan-400 cursor-default border border-cyan-500/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 active:scale-95'
              }`}
            >
              {isSelected ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Currently in Your Build</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Select for Custom Build</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
