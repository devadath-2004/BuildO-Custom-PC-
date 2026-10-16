import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import InvoiceView from '../components/InvoiceView';
import { 
  Shield, Package, DollarSign, Layers, Cpu, Check, 
  Trash2, Plus, Edit3, RefreshCw, Truck, FileText, AlertCircle,
  Search, Filter, Sparkles, CheckCircle2, XCircle, X, ExternalLink,
  Zap, CircuitBoard, HardDrive, MemoryStick, Gamepad2, Box, Fan
} from 'lucide-react';

const CATEGORY_ICONS = {
  CPU: Cpu,
  GPU: Gamepad2,
  MOTHERBOARD: CircuitBoard,
  RAM: MemoryStick,
  STORAGE: HardDrive,
  PSU: Zap,
  CABINET: Box,
  COOLING: Fan
};

// Newly launched hardware templates for fast 1-click admin addition
const NEW_LAUNCH_TEMPLATES = [
  {
    name: 'AMD Ryzen 9 9950X',
    category: 'CPU',
    brand: 'AMD',
    model: 'Ryzen 9 9950X',
    price: 59999,
    socket: 'AM5',
    tdp: 170,
    wattage: 170,
    description: 'Flagship Zen 5 desktop processor, 16 cores, 32 threads, 80MB cache, boost clock up to 5.7 GHz.',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80',
    inStock: true
  },
  {
    name: 'Intel Core Ultra 9 285K',
    category: 'CPU',
    brand: 'Intel',
    model: 'Ultra 9 285K',
    price: 57499,
    socket: 'LGA1851',
    tdp: 125,
    wattage: 250,
    description: 'Arrow Lake-S next-gen architecture, 24 cores (8P + 16E), 24 threads, 5.7 GHz max turbo, integrated NPU.',
    imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80',
    inStock: true
  },
  {
    name: 'NVIDIA GeForce RTX 5090',
    category: 'GPU',
    brand: 'NVIDIA',
    model: 'RTX 5090 Founders Edition',
    price: 189999,
    wattage: 600,
    tdp: 600,
    lengthMm: 336,
    description: 'Blackwell architecture next-generation flagship GPU with 32GB GDDR7 VRAM, DLSS 4 AI, and full path tracing.',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80',
    inStock: true
  },
  {
    name: 'NVIDIA GeForce RTX 5080',
    category: 'GPU',
    brand: 'NVIDIA',
    model: 'RTX 5080',
    price: 114999,
    wattage: 400,
    tdp: 400,
    lengthMm: 310,
    description: 'Blackwell architecture enthusiast GPU with 16GB GDDR7 memory, 4K ray tracing, and ultra-high FPS gaming.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
    inStock: true
  },
  {
    name: 'ASUS ROG Maximus Z890 Hero',
    category: 'MOTHERBOARD',
    brand: 'ASUS',
    model: 'ROG Z890 Hero',
    price: 64999,
    socket: 'LGA1851',
    formFactor: 'ATX',
    memoryType: 'DDR5',
    memorySlots: 4,
    memorySpeedMhz: 8800,
    description: 'Premium LGA1851 motherboard for Intel Core Ultra with PCIe 5.0, Thunderbolt 4, Wi-Fi 7, and 20+1+2 power stages.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    inStock: true
  },
  {
    name: 'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5-6400',
    category: 'RAM',
    brand: 'G.Skill',
    model: 'Trident Z5 RGB',
    price: 21999,
    memoryType: 'DDR5',
    memorySlots: 2,
    memorySpeedMhz: 6400,
    description: 'Ultra-fast dual-channel DDR5-6400 CL32 memory kit with custom RGB lightbar and Intel XMP 3.0 / AMD EXPO support.',
    imageUrl: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&q=80',
    inStock: true
  },
  {
    name: 'Samsung 990 PRO 4TB PCIe 4.0 NVMe M.2 SSD',
    category: 'STORAGE',
    brand: 'Samsung',
    model: '990 PRO 4TB',
    price: 32999,
    description: 'PCIe Gen 4.0 x4 M.2 SSD with read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s for lightning loads.',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80',
    inStock: true
  },
  {
    name: 'Corsair RM1000x Shift 1000W 80+ Gold ATX 3.0',
    category: 'PSU',
    brand: 'Corsair',
    model: 'RM1000x Shift',
    price: 18499,
    wattage: 1000,
    efficiencyRating: '80+ Gold',
    description: 'Fully modular ATX 3.0 power supply with side-mounted modular cables and native 12VHPWR PCIe 5.0 connector.',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80',
    inStock: true
  }
];

export default function AdminPage() {
  const { user, showNotification, setActivePage } = useApp();
  const [activeTab, setActiveTab] = useState(window.__adminInitialTab || 'orders'); // 'orders' | 'catalog' | 'presets'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [components, setComponents] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  // Search & Filter for Hardware Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Search, Filter & Editing for Customer Orders
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [trackingEdits, setTrackingEdits] = useState({});
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Add Component Form state
  const [showAddCompModal, setShowAddCompModal] = useState(false);
  const [newComp, setNewComp] = useState({
    name: '',
    category: 'CPU',
    brand: '',
    model: '',
    price: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80',
    socket: '',
    formFactor: 'ATX',
    supportedFormFactors: 'ATX,Micro-ATX,Mini-ITX',
    memoryType: 'DDR5',
    memorySlots: '4',
    memorySpeedMhz: '6000',
    wattage: '',
    tdp: '',
    efficiencyRating: '80+ Gold',
    lengthMm: '',
    coolerHeightMm: '',
    radiatorSizeMm: '',
    coolerType: 'AIR',
    inStock: true
  });

  // Edit Component Form state
  const [editComp, setEditComp] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, compsData, presetsData] = await Promise.all([
        apiClient.getAdminStats().catch(() => null),
        apiClient.getAllAdminOrders().catch(() => []),
        apiClient.getComponents().catch(() => []),
        apiClient.getPresets().catch(() => [])
      ]);
      if (statsData) setStats(statsData);
      setOrders(ordersData || []);
      setComponents(compsData || []);
      setPresets(presetsData || []);
    } catch (err) {
      console.error(err);
      showNotification('Error loading admin data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      loadData();
    }
  }, [user]);

  // Handle Quick Template Selection
  const handleApplyTemplate = (template) => {
    setNewComp({
      ...newComp,
      name: template.name,
      category: template.category,
      brand: template.brand,
      model: template.model,
      price: template.price,
      socket: template.socket || '',
      formFactor: template.formFactor || 'ATX',
      supportedFormFactors: template.supportedFormFactors || 'ATX,Micro-ATX,Mini-ITX',
      memoryType: template.memoryType || 'DDR5',
      memorySlots: template.memorySlots ? String(template.memorySlots) : '4',
      memorySpeedMhz: template.memorySpeedMhz ? String(template.memorySpeedMhz) : '6000',
      wattage: template.wattage ? String(template.wattage) : '',
      tdp: template.tdp ? String(template.tdp) : '',
      efficiencyRating: template.efficiencyRating || '80+ Gold',
      lengthMm: template.lengthMm ? String(template.lengthMm) : '',
      description: template.description,
      imageUrl: template.imageUrl,
      inStock: template.inStock ?? true
    });
    setShowAddCompModal(true);
    showNotification(`Loaded template for ${template.name}`, 'info');
  };

  // Add Component API
  const handleCreateComponent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newComp,
        price: Number(newComp.price),
        wattage: newComp.wattage ? Number(newComp.wattage) : null,
        tdp: newComp.tdp ? Number(newComp.tdp) : null,
        lengthMm: newComp.lengthMm ? Number(newComp.lengthMm) : null,
        coolerHeightMm: newComp.coolerHeightMm ? Number(newComp.coolerHeightMm) : null,
        radiatorSizeMm: newComp.radiatorSizeMm ? Number(newComp.radiatorSizeMm) : null,
        memorySlots: newComp.memorySlots ? Number(newComp.memorySlots) : null,
        memorySpeedMhz: newComp.memorySpeedMhz ? Number(newComp.memorySpeedMhz) : null,
        inStock: Boolean(newComp.inStock)
      };
      await apiClient.createComponent(payload);
      showNotification(`Added ${newComp.name} to catalog!`, 'success');
      setShowAddCompModal(false);
      setNewComp({
        name: '', category: 'CPU', brand: '', model: '', price: '',
        description: '', imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80',
        socket: '', formFactor: 'ATX', supportedFormFactors: 'ATX,Micro-ATX,Mini-ITX',
        memoryType: 'DDR5', memorySlots: '4', memorySpeedMhz: '6000', wattage: '', tdp: '',
        efficiencyRating: '80+ Gold', lengthMm: '', coolerHeightMm: '', radiatorSizeMm: '',
        coolerType: 'AIR', inStock: true
      });
      loadData();
    } catch (err) {
      showNotification('Failed to create component: ' + err.message, 'error');
    }
  };

  // Edit Component API
  const handleUpdateComponent = async (e) => {
    e.preventDefault();
    if (!editComp) return;
    try {
      const payload = {
        ...editComp,
        price: Number(editComp.price),
        wattage: editComp.wattage ? Number(editComp.wattage) : null,
        tdp: editComp.tdp ? Number(editComp.tdp) : null,
        lengthMm: editComp.lengthMm ? Number(editComp.lengthMm) : null,
        coolerHeightMm: editComp.coolerHeightMm ? Number(editComp.coolerHeightMm) : null,
        radiatorSizeMm: editComp.radiatorSizeMm ? Number(editComp.radiatorSizeMm) : null,
        memorySlots: editComp.memorySlots ? Number(editComp.memorySlots) : null,
        memorySpeedMhz: editComp.memorySpeedMhz ? Number(editComp.memorySpeedMhz) : null,
        inStock: Boolean(editComp.inStock)
      };
      await apiClient.updateComponent(editComp.id, payload);
      showNotification(`Updated ${editComp.name} successfully!`, 'success');
      setEditComp(null);
      loadData();
    } catch (err) {
      showNotification('Failed to update component: ' + err.message, 'error');
    }
  };

  // Toggle In-Stock Status
  const handleToggleStock = async (comp) => {
    try {
      const updatedStock = !comp.inStock;
      const payload = {
        ...comp,
        inStock: updatedStock
      };
      await apiClient.updateComponent(comp.id, payload);
      showNotification(`${comp.name} marked ${updatedStock ? 'In Stock' : 'Out of Stock'}`, 'info');
      setComponents(prev => prev.map(c => c.id === comp.id ? { ...c, inStock: updatedStock } : c));
    } catch (err) {
      showNotification('Failed to toggle stock status: ' + err.message, 'error');
    }
  };

  // Delete Component API
  const handleDeleteComponent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the hardware catalog?`)) return;
    try {
      await apiClient.deleteComponent(id);
      showNotification(`Component "${name}" removed from catalog`, 'info');
      setComponents(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      showNotification('Failed to delete component: ' + err.message, 'error');
    }
  };

  // Update Order Status
  const handleUpdateStatus = async (orderId, newStatus, trackingNumber) => {
    try {
      await apiClient.updateOrderStatus(orderId, newStatus, trackingNumber);
      showNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      showNotification('Failed to update order status: ' + err.message, 'error');
    }
  };

  // Filter components
  const filteredComponents = components.filter(c => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      c.name?.toLowerCase().includes(query) ||
      c.brand?.toLowerCase().includes(query) ||
      c.model?.toLowerCase().includes(query) ||
      c.socket?.toLowerCase().includes(query) ||
      c.category?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Access check
  if (!user || user.role !== 'ROLE_ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-800/60 flex items-center justify-center text-purple-400 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          The hardware management portal is restricted to authorized operations administrators.
        </p>
        <button
          onClick={() => setActivePage('home')}
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="buildo-admin-shell">
      <div className="buildo-admin max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono font-semibold mb-2 border border-purple-500/20">
            <Shield className="w-3.5 h-3.5" />
            BuildO Admin Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Operations dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor customer orders, manage your hardware catalog, and maintain curated PC builds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddCompModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add component</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Hardware Catalog</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{components.length}</div>
            <span className="text-[10px] text-cyan-400 font-mono">Active inventory parts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Graphics Cards (GPUs)</span>
            <div className="text-2xl font-black text-purple-300 font-mono mt-0.5">
              {components.filter(c => c.category === 'GPU').length}
            </div>
            <span className="text-[10px] text-purple-400 font-mono">RTX, RX & Intel Arc</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">In-Stock Products</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {components.filter(c => c.inStock !== false).length}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Ready for custom builds</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Curated Presets</span>
            <div className="text-2xl font-black text-amber-300 font-mono mt-0.5">{presets.length}</div>
            <span className="text-[10px] text-amber-400 font-mono">Gaming & Workstation builds</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Launch Showcase: Fast Add for Newly Launched CPUs & GPUs */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-dark-900 to-slate-900 border border-purple-800/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Quick-Add Newly Launched Hardware</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              1-Click Spec Presets
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Click any card below to pre-populate specs and add to catalog</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 pt-1">
          {NEW_LAUNCH_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              onClick={() => handleApplyTemplate(tmpl)}
              className="p-3 rounded-xl bg-dark-950/80 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-purple-400 px-1.5 py-0.2 rounded bg-purple-500/10">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">
                    ₹{Number(tmpl.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  {tmpl.name}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {tmpl.socket ? `Socket ${tmpl.socket} • ` : ''}{tmpl.wattage ? `${tmpl.wattage}W • ` : ''}{tmpl.brand}
                </p>
              </div>

              <span className="text-[10px] font-semibold text-cyan-400 group-hover:text-white mt-2 flex items-center gap-1">
                <span>+ Load & Add</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Customer orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Hardware catalog ({components.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curated builds ({presets.length})</span>
        </button>
      </div>

      {/* TAB 1: Hardware Catalog Management (Add / Edit / Delete / In-Stock) */}
      {activeTab === 'catalog' && (
        <div className="space-y-5">
          {/* Controls: Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search components by name, socket, brand, or model..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {['ALL', 'CPU', 'GPU', 'MOTHERBOARD', 'RAM', 'STORAGE', 'PSU', 'CABINET', 'COOLING'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {cat === 'ALL' ? 'All Items' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count & Action */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Showing {filteredComponents.length} of {components.length} components
              {selectedCategory !== 'ALL' && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>

          {/* Hardware Components Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs">Loading hardware inventory...</p>
            </div>
          ) : filteredComponents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No components matched your filter</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching with a different keyword or click below to add a new hardware item.
              </p>
              <button
                onClick={() => setShowAddCompModal(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                + Add Component
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComponents.map(comp => {
                const Icon = CATEGORY_ICONS[comp.category] || Cpu;
                const isItemInStock = comp.inStock !== false;

                return (
                  <div 
                    key={comp.id} 
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isItemInStock 
                        ? 'glass-panel border-slate-800/80 hover:border-slate-700' 
                        : 'bg-dark-950/60 border-rose-900/30 opacity-75'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Category, Icon & Stock Status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                            {comp.category}
                          </span>
                        </div>

                        {/* Quick Stock Toggle */}
                        <button
                          onClick={() => handleToggleStock(comp)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            isItemInStock
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/50 hover:bg-rose-900'
                          }`}
                          title="Click to toggle stock status"
                        >
                          {isItemInStock ? '● In Stock' : '○ Out of Stock'}
                        </button>
                      </div>

                      {/* Component Content: Image & Details */}
                      <div className="flex items-start gap-3">
                        <img 
                          src={comp.imageUrl} 
                          alt={comp.name} 
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&q=80';
                          }}
                          className="w-16 h-16 rounded-xl object-cover bg-dark-950 border border-slate-800 flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-slate-400 font-mono block truncate">
                            {comp.brand} {comp.model ? `• ${comp.model}` : ''}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate mt-0.5" title={comp.name}>
                            {comp.name}
                          </h4>
                          <div className="text-sm font-extrabold text-white font-mono mt-1">
                            ₹{Number(comp.price).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Specs Pills */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                        {comp.socket && (
                          <span className="px-1.5 py-0.5 rounded bg-dark-950 border border-slate-800 text-cyan-300">
                            Socket: {comp.socket}
                          </span>
                        )}
                        {comp.wattage > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-dark-950 border border-slate-800 text-amber-300">
                            Power: {comp.wattage}W
                          </span>
                        )}
                        {comp.tdp > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-dark-950 border border-slate-800 text-amber-300">
                            TDP: {comp.tdp}W
                          </span>
                        )}
                        {comp.formFactor && (
                          <span className="px-1.5 py-0.5 rounded bg-dark-950 border border-slate-800 text-slate-300">
                            {comp.formFactor}
                          </span>
                        )}
                        {comp.memoryType && (
                          <span className="px-1.5 py-0.5 rounded bg-dark-950 border border-slate-800 text-slate-300">
                            {comp.memoryType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">ID: #{comp.id}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditComp(comp)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold transition-all cursor-pointer"
                          title="Edit Component Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteComponent(comp.id, comp.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-all cursor-pointer"
                          title="Delete Component"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Curated Presets Management */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-mono">
              Total Pre-configured Builds: {presets.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {presets.map(preset => (
              <div key={preset.id} className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-24 h-24 rounded-xl object-cover bg-dark-950 border border-slate-800 flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = '/desk-setup.jpg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/40">
                        {preset.category}
                      </span>
                      {preset.discountPercent > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                          {preset.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white truncate">{preset.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{preset.description}</p>
                    <div className="text-base font-extrabold text-white font-mono mt-2">
                      ₹{Number(preset.basePrice).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Included Components Preview */}
                <div className="p-3 rounded-xl bg-dark-950/80 border border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="truncate text-slate-300">
                    <strong className="text-cyan-400">CPU:</strong> {preset.components?.find(c => c.category === 'CPU')?.name || 'Not configured'}
                  </div>
                  <div className="truncate text-slate-300">
                    <strong className="text-purple-400">GPU:</strong> {preset.components?.find(c => c.category === 'GPU')?.name || 'Integrated Graphics'}
                  </div>
                  <div className="truncate text-slate-300">
                    <strong className="text-amber-400">RAM:</strong> {preset.components?.find(c => c.category === 'RAM')?.name || 'Not configured'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Customer Orders & Real-Time Status Updating */}
      {activeTab === 'orders' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Controls: Search Orders & Status Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by customer, email, order ref, or tracking..."
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
              {orderSearchQuery && (
                <button
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { key: 'ALL', label: 'All Orders', count: orders.length },
                { key: 'CONFIRMED', label: 'Confirmed', count: orders.filter(o => o.status === 'CONFIRMED').length },
                { key: 'PROCESSING', label: 'Assembling', count: orders.filter(o => o.status === 'PROCESSING').length },
                { key: 'SHIPPED', label: 'Shipped', count: orders.filter(o => o.status === 'SHIPPED').length },
                { key: 'DELIVERED', label: 'Delivered', count: orders.filter(o => o.status === 'DELIVERED').length },
                { key: 'CANCELLED', label: 'Cancelled', count: orders.filter(o => o.status === 'CANCELLED').length }
              ].map(st => (
                <button
                  key={st.key}
                  onClick={() => setOrderStatusFilter(st.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    orderStatusFilter === st.key
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{st.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                    orderStatusFilter === st.key ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {st.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orders List / Management Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono">
                    <th className="p-3.5">Order Ref</th>
                    <th className="p-3.5">Customer & Shipping</th>
                    <th className="p-3.5">Build Configuration</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Fulfillment Status</th>
                    <th className="p-3.5">Tracking Number</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {orders.filter(o => {
                    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
                    const q = orderSearchQuery.toLowerCase().trim();
                    const matchesQuery = !q ||
                      o.orderNumber?.toLowerCase().includes(q) ||
                      o.customerName?.toLowerCase().includes(q) ||
                      o.customerEmail?.toLowerCase().includes(q) ||
                      o.trackingNumber?.toLowerCase().includes(q) ||
                      o.buildName?.toLowerCase().includes(q);
                    return matchesStatus && matchesQuery;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center text-slate-500 italic">
                        No customer orders match the current filter.
                      </td>
                    </tr>
                  ) : (
                    orders
                      .filter(o => {
                        const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
                        const q = orderSearchQuery.toLowerCase().trim();
                        const matchesQuery = !q ||
                          o.orderNumber?.toLowerCase().includes(q) ||
                          o.customerName?.toLowerCase().includes(q) ||
                          o.customerEmail?.toLowerCase().includes(q) ||
                          o.trackingNumber?.toLowerCase().includes(q) ||
                          o.buildName?.toLowerCase().includes(q);
                        return matchesStatus && matchesQuery;
                      })
                      .map(o => {
                        const currentTracking = trackingEdits[o.id] !== undefined ? trackingEdits[o.id] : (o.trackingNumber || '');
                        const isExpanded = expandedOrderId === o.id;

                        return (
                          <React.Fragment key={o.id}>
                            <tr className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3.5 font-mono font-bold text-cyan-400">
                                <div>{o.orderNumber}</div>
                                <span className="text-[10px] text-slate-500 font-normal">
                                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Recent'}
                                </span>
                              </td>

                              <td className="p-3.5">
                                <strong className="text-white block font-semibold">{o.customerName}</strong>
                                <span className="text-slate-400 text-[11px] block">{o.customerEmail}</span>
                                <span className="text-slate-500 text-[10px] block truncate max-w-[180px]">
                                  {o.shippingCity || 'City'}, {o.postalCode || ''}
                                </span>
                              </td>

                              <td className="p-3.5 text-slate-200">
                                <span className="font-medium text-white">{o.buildName || 'Custom Rig'}</span>
                                <span className="text-[10px] text-cyan-400 block font-mono">
                                  {o.items?.length || 0} Components Selected
                                </span>
                              </td>

                              <td className="p-3.5 text-right font-mono font-bold text-white whitespace-nowrap">
                                ₹{Number(o.finalAmount).toLocaleString('en-IN')}
                              </td>

                              <td className="p-3.5">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 whitespace-nowrap">
                                  {o.paymentMethod || 'Razorpay'} • {o.paymentStatus}
                                </span>
                              </td>

                              {/* Fulfillment Status Updating */}
                              <td className="p-3.5">
                                <select
                                  value={o.status}
                                  onChange={e => handleUpdateStatus(o.id, e.target.value, o.trackingNumber)}
                                  className={`border rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-none cursor-pointer transition-all ${
                                    o.status === 'CONFIRMED'
                                      ? 'bg-blue-950/80 border-blue-600/60 text-blue-300'
                                      : o.status === 'PROCESSING'
                                      ? 'bg-amber-950/80 border-amber-600/60 text-amber-300'
                                      : o.status === 'SHIPPED'
                                      ? 'bg-purple-950/80 border-purple-600/60 text-purple-300'
                                      : o.status === 'DELIVERED'
                                      ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300'
                                      : 'bg-rose-950/80 border-rose-600/60 text-rose-300'
                                  }`}
                                >
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="PROCESSING">ASSEMBLING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </td>

                              {/* Real-Time Tracking Number Updating */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={currentTracking}
                                    onChange={e => setTrackingEdits({ ...trackingEdits, [o.id]: e.target.value })}
                                    placeholder="TRK-..."
                                    className="w-28 px-2 py-1 bg-dark-950 border border-slate-700 rounded-md text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                                  />
                                  <button
                                    onClick={() => handleUpdateStatus(o.id, o.status, currentTracking)}
                                    title="Save & Dispatch Tracking"
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white border border-slate-700 transition-colors"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              {/* Actions: View Details & Invoice */}
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                                  >
                                    {isExpanded ? 'Hide' : 'Details'}
                                  </button>
                                  <button
                                    onClick={() => setSelectedOrderForInvoice(o)}
                                    className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-800/40 transition-colors"
                                    title="View & Download Tax Invoice"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Order Details Row */}
                            {isExpanded && (
                              <tr className="bg-slate-900/70 border-b border-slate-800/80 animate-in fade-in duration-150">
                                <td colSpan="8" className="p-4 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                                    {/* Shipping Details */}
                                    <div className="p-3 rounded-xl bg-dark-950/80 border border-slate-800 space-y-1">
                                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                                        Shipping Destination
                                      </span>
                                      <div className="text-white font-semibold">{o.customerName}</div>
                                      <div className="text-slate-400">{o.shippingAddress}</div>
                                      <div className="text-slate-400">{o.shippingCity} - {o.postalCode}</div>
                                      <div className="text-slate-400 pt-1">Phone: <span className="text-white">{o.customerPhone || 'N/A'}</span></div>
                                    </div>

                                    {/* Order Financials */}
                                    <div className="p-3 rounded-xl bg-dark-950/80 border border-slate-800 space-y-1">
                                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                                        Financial Breakdown
                                      </span>
                                      <div className="flex justify-between text-slate-400">
                                        <span>Components Subtotal:</span>
                                        <span className="text-white">₹{Number(o.subtotal).toLocaleString('en-IN')}</span>
                                      </div>
                                      <div className="flex justify-between text-slate-400">
                                        <span>GST (18%):</span>
                                        <span className="text-white">₹{Number(o.taxAmount).toLocaleString('en-IN')}</span>
                                      </div>
                                      <div className="flex justify-between text-slate-400">
                                        <span>Discount:</span>
                                        <span className="text-emerald-400">-₹{Number(o.discountAmount).toLocaleString('en-IN')}</span>
                                      </div>
                                      <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                                        <span>Total Paid:</span>
                                        <span className="text-cyan-400">₹{Number(o.finalAmount).toLocaleString('en-IN')}</span>
                                      </div>
                                    </div>

                                    {/* Included Components */}
                                    <div className="p-3 rounded-xl bg-dark-950/80 border border-slate-800 space-y-1">
                                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                                        PC Configuration ({o.items?.length || 0} Parts)
                                      </span>
                                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                                        {o.items && o.items.length > 0 ? (
                                          o.items.map((it, idx) => (
                                            <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                                              <span className="truncate max-w-[160px]">
                                                {it.component ? it.component.name : `Component #${it.componentId}`}
                                              </span>
                                              <span className="text-slate-400 whitespace-nowrap">
                                                ₹{it.component ? Number(it.component.price).toLocaleString('en-IN') : '-'}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-slate-500 italic">Custom balanced rig</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD COMPONENT TO CATALOG */}
      {showAddCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between bg-dark-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add New Component to Catalog</h3>
                  <p className="text-xs text-slate-400">Input hardware specifications or load from quick templates</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddCompModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateComponent} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Image Preview & URL */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-dark-950/80 border border-slate-800">
                <img
                  src={newComp.imageUrl}
                  alt="Preview"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&q=80'; }}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 bg-slate-900 flex-shrink-0"
                />
                <div className="flex-1">
                  <label className="block text-slate-400 mb-1 font-medium">Image URL</label>
                  <input
                    type="url"
                    value={newComp.imageUrl}
                    onChange={e => setNewComp({ ...newComp, imageUrl: e.target.value })}
                    className="w-full p-2.5 bg-dark-900 border border-slate-700 rounded-xl text-white text-xs"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              {/* Basic Info: Name, Category, Brand, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Component Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AMD Ryzen 9 9950X"
                    value={newComp.name}
                    onChange={e => setNewComp({ ...newComp, name: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category *</label>
                  <select
                    value={newComp.category}
                    onChange={e => setNewComp({ ...newComp, category: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-cyan-300 font-semibold text-xs cursor-pointer"
                  >
                    {['CPU', 'GPU', 'MOTHERBOARD', 'RAM', 'STORAGE', 'PSU', 'CABINET', 'COOLING'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AMD / NVIDIA / Intel"
                    value={newComp.brand}
                    onChange={e => setNewComp({ ...newComp, brand: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. 9950X / RTX 5090"
                    value={newComp.model}
                    onChange={e => setNewComp({ ...newComp, model: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 59999"
                    value={newComp.price}
                    onChange={e => setNewComp({ ...newComp, price: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Compatibility Attributes */}
              <div className="p-4 rounded-2xl bg-dark-950/60 border border-slate-800 space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                  Hardware Compatibility & Technical Specifications
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Socket Type</label>
                    <input
                      type="text"
                      placeholder="e.g. AM5, LGA1851, LGA1700"
                      value={newComp.socket}
                      onChange={e => setNewComp({ ...newComp, socket: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">TDP / Power Draw (W)</label>
                    <input
                      type="number"
                      placeholder="e.g. 170 (CPU) / 600 (GPU)"
                      value={newComp.tdp}
                      onChange={e => setNewComp({ ...newComp, tdp: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">PSU Wattage Capacity (W)</label>
                    <input
                      type="number"
                      placeholder="e.g. 850, 1000"
                      value={newComp.wattage}
                      onChange={e => setNewComp({ ...newComp, wattage: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Form Factor</label>
                    <input
                      type="text"
                      placeholder="e.g. ATX, Micro-ATX, Mini-ITX"
                      value={newComp.formFactor}
                      onChange={e => setNewComp({ ...newComp, formFactor: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Memory Type</label>
                    <input
                      type="text"
                      placeholder="e.g. DDR5, DDR4"
                      value={newComp.memoryType}
                      onChange={e => setNewComp({ ...newComp, memoryType: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">GPU Length (mm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 336"
                      value={newComp.lengthMm}
                      onChange={e => setNewComp({ ...newComp, lengthMm: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Description & In-Stock */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows="2"
                  value={newComp.description}
                  onChange={e => setNewComp({ ...newComp, description: e.target.value })}
                  className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white text-xs"
                  placeholder="Key hardware features, architecture, boost clock, etc."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={newComp.inStock}
                  onChange={e => setNewComp({ ...newComp, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 bg-dark-950 border-slate-700 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="inStockCheck" className="text-white font-medium cursor-pointer">
                  Mark as Available In Stock immediately
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCompModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Add Component to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT COMPONENT */}
      {editComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between bg-dark-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Component: {editComp.name}</h3>
                  <p className="text-xs text-slate-400">Modify pricing, specifications, or stock status</p>
                </div>
              </div>

              <button
                onClick={() => setEditComp(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateComponent} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Image Preview & URL */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-dark-950/80 border border-slate-800">
                <img
                  src={editComp.imageUrl}
                  alt="Preview"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&q=80'; }}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 bg-slate-900 flex-shrink-0"
                />
                <div className="flex-1">
                  <label className="block text-slate-400 mb-1 font-medium">Image URL</label>
                  <input
                    type="url"
                    value={editComp.imageUrl || ''}
                    onChange={e => setEditComp({ ...editComp, imageUrl: e.target.value })}
                    className="w-full p-2.5 bg-dark-900 border border-slate-700 rounded-xl text-white text-xs"
                    required
                  />
                </div>
              </div>

              {/* Name, Category, Brand, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Component Name *</label>
                  <input
                    type="text"
                    required
                    value={editComp.name || ''}
                    onChange={e => setEditComp({ ...editComp, name: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category *</label>
                  <select
                    value={editComp.category || 'CPU'}
                    onChange={e => setEditComp({ ...editComp, category: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-cyan-300 font-semibold text-xs cursor-pointer"
                  >
                    {['CPU', 'GPU', 'MOTHERBOARD', 'RAM', 'STORAGE', 'PSU', 'CABINET', 'COOLING'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Brand *</label>
                  <input
                    type="text"
                    required
                    value={editComp.brand || ''}
                    onChange={e => setEditComp({ ...editComp, brand: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Model</label>
                  <input
                    type="text"
                    value={editComp.model || ''}
                    onChange={e => setEditComp({ ...editComp, model: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editComp.price || ''}
                    onChange={e => setEditComp({ ...editComp, price: e.target.value })}
                    className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Compatibility Specifications */}
              <div className="p-4 rounded-2xl bg-dark-950/60 border border-slate-800 space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                  Hardware Compatibility & Technical Specifications
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Socket Type</label>
                    <input
                      type="text"
                      placeholder="AM5, LGA1851, etc."
                      value={editComp.socket || ''}
                      onChange={e => setEditComp({ ...editComp, socket: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">TDP / Power Draw (W)</label>
                    <input
                      type="number"
                      value={editComp.tdp || ''}
                      onChange={e => setEditComp({ ...editComp, tdp: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">PSU Wattage Capacity (W)</label>
                    <input
                      type="number"
                      value={editComp.wattage || ''}
                      onChange={e => setEditComp({ ...editComp, wattage: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Form Factor</label>
                    <input
                      type="text"
                      value={editComp.formFactor || ''}
                      onChange={e => setEditComp({ ...editComp, formFactor: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Memory Type</label>
                    <input
                      type="text"
                      value={editComp.memoryType || ''}
                      onChange={e => setEditComp({ ...editComp, memoryType: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">GPU Length (mm)</label>
                    <input
                      type="number"
                      value={editComp.lengthMm || ''}
                      onChange={e => setEditComp({ ...editComp, lengthMm: e.target.value })}
                      className="w-full p-2 bg-dark-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows="2"
                  value={editComp.description || ''}
                  onChange={e => setEditComp({ ...editComp, description: e.target.value })}
                  className="w-full p-2.5 bg-dark-950 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              {/* In-Stock Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editInStock"
                  checked={editComp.inStock !== false}
                  onChange={e => setEditComp({ ...editComp, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 bg-dark-950 border-slate-700 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="editInStock" className="text-white font-medium cursor-pointer">
                  Item is In Stock and Available for Building
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditComp(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INVOICE PREVIEW */}
      {selectedOrderForInvoice && (
        <InvoiceView
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
      </div>
    </div>
  );
}
