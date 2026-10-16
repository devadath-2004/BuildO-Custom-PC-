import React, { useState } from 'react';
import { getBrandConfig, getExactPhotoUrl } from '../utils/hardwareData';
import { ZoomIn, Cpu, CircuitBoard, Gamepad2, MemoryStick, HardDrive, Zap, Box, Fan } from 'lucide-react';

const CATEGORY_FALLBACK_ICONS = {
  CPU: Cpu,
  MOTHERBOARD: CircuitBoard,
  GPU: Gamepad2,
  RAM: MemoryStick,
  STORAGE: HardDrive,
  PSU: Zap,
  CABINET: Box,
  COOLING: Fan
};

export default function ProductImage({
  component,
  className = 'w-16 h-16',
  showBrandBadge = false,
  showInspectButton = false,
  onInspect = null,
  rounded = 'rounded-xl',
  alt = ''
}) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!component) {
    return (
      <div className={`${className} ${rounded} bg-dark-950 border border-slate-800 flex items-center justify-center text-slate-600`}>
        <Cpu className="w-1/2 h-1/2 opacity-30" />
      </div>
    );
  }

  const brand = getBrandConfig(component.brand);
  const photoUrl = getExactPhotoUrl(component);
  const FallbackIcon = CATEGORY_FALLBACK_ICONS[component.category] || Cpu;

  return (
    <div className={`relative group overflow-hidden ${rounded} bg-dark-950 border border-slate-800 flex-shrink-0 flex items-center justify-center select-none ${className}`}>
      {/* Background glow matching brand color */}
      <div
        className="absolute inset-0 opacity-15 blur-md pointer-events-none transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: brand.color }}
      />

      {/* Main Product Image */}
      {!hasError ? (
        <img
          src={photoUrl}
          alt={alt || component.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        /* Engineered Photorealistic Hardware Schematic Fallback */
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center relative z-10 bg-gradient-to-br from-slate-900 to-dark-950">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 border shadow-inner"
            style={{ borderColor: `${brand.color}60`, backgroundColor: `${brand.color}15` }}
          >
            <FallbackIcon className="w-4 h-4" style={{ color: brand.color }} />
          </div>
          <span className="text-[9px] font-mono font-bold text-white truncate max-w-full px-1">
            {component.brand}
          </span>
          <span className="text-[8px] font-mono text-slate-400 truncate max-w-full">
            {component.category}
          </span>
        </div>
      )}

      {/* Loading Skeleton */}
      {!loaded && !hasError && (
        <div className="absolute inset-0 bg-slate-800/60 animate-pulse flex items-center justify-center">
          <FallbackIcon className="w-5 h-5 text-slate-600 animate-spin" />
        </div>
      )}

      {/* Brand Badge (Optional overlay in top corner) */}
      {showBrandBadge && (
        <div className="absolute top-1.5 left-1.5 z-10">
          <span
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-md backdrop-blur-md border border-white/10"
            style={{ backgroundColor: `${brand.color}cc`, color: '#ffffff' }}
          >
            {component.brand || 'CERTIFIED'}
          </span>
        </div>
      )}

      {/* Hover Inspect / Zoom Overlay */}
      {showInspectButton && onInspect && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onInspect(component);
          }}
          className="absolute inset-0 bg-dark-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-20"
          title="Inspect high-res photo & specifications"
        >
          <div className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <ZoomIn className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
