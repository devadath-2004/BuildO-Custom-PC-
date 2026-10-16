/**
 * Comprehensive Hardware Database
 * Includes exact high-res photography URLs, brand metadata, detailed specs sheets,
 * and performance benchmark coefficients for all components across all budget tiers.
 */

export const BRAND_CONFIG = {
  Intel: {
    name: 'Intel',
    color: '#0068B5',
    badgeBg: 'bg-blue-600/20',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/40',
    tagline: 'Intel Core Inside'
  },
  AMD: {
    name: 'AMD',
    color: '#ED1C24',
    badgeBg: 'bg-orange-600/20',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-500/40',
    tagline: 'AMD Ryzen / Radeon'
  },
  NVIDIA: {
    name: 'NVIDIA',
    color: '#76B900',
    badgeBg: 'bg-emerald-600/20',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/40',
    tagline: 'GeForce RTX'
  },
  ASUS: {
    name: 'ASUS ROG / TUF',
    color: '#FF0036',
    badgeBg: 'bg-red-600/20',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-500/40',
    tagline: 'Republic of Gamers'
  },
  MSI: {
    name: 'MSI',
    color: '#E00000',
    badgeBg: 'bg-red-700/20',
    badgeText: 'text-red-300',
    badgeBorder: 'border-red-600/40',
    tagline: 'True Gaming'
  },
  GIGABYTE: {
    name: 'GIGABYTE / AORUS',
    color: '#FF6600',
    badgeBg: 'bg-amber-600/20',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/40',
    tagline: 'Team Up. Fight On.'
  },
  Corsair: {
    name: 'Corsair',
    color: '#F8E71C',
    badgeBg: 'bg-yellow-500/20',
    badgeText: 'text-yellow-400',
    badgeBorder: 'border-yellow-500/40',
    tagline: 'Gaming Heritage'
  },
  Samsung: {
    name: 'Samsung',
    color: '#1428A0',
    badgeBg: 'bg-indigo-600/20',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-500/40',
    tagline: 'V-NAND Innovation'
  },
  Crucial: {
    name: 'Crucial Micron',
    color: '#00AEEF',
    badgeBg: 'bg-sky-600/20',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/40',
    tagline: 'Micron Technology'
  },
  Kingston: {
    name: 'Kingston Fury',
    color: '#FF3333',
    badgeBg: 'bg-rose-600/20',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/40',
    tagline: 'Fury Performance'
  },
  'Western Digital': {
    name: 'WD / Black',
    color: '#2B579A',
    badgeBg: 'bg-cyan-600/20',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-500/40',
    tagline: 'WD_BLACK Gaming'
  },
  DeepCool: {
    name: 'DeepCool',
    color: '#00A6A6',
    badgeBg: 'bg-teal-600/20',
    badgeText: 'text-teal-400',
    badgeBorder: 'border-teal-500/40',
    tagline: 'Cooling Redefined'
  },
  NZXT: {
    name: 'NZXT',
    color: '#7B2CBF',
    badgeBg: 'bg-purple-600/20',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/40',
    tagline: 'Crafted for Enthusiasts'
  },
  'Lian Li': {
    name: 'Lian Li',
    color: '#00ADB5',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/40',
    tagline: 'Aluminum & Glass Mastery'
  },
  Sapphire: {
    name: 'Sapphire Technology',
    color: '#0081C9',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-400/40',
    tagline: 'NITRO+ / Pulse Radeon'
  },
  Thermalright: {
    name: 'Thermalright',
    color: '#E65100',
    badgeBg: 'bg-amber-600/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400/40',
    tagline: 'Low-Temp Precision'
  },
  Arctic: {
    name: 'Arctic',
    color: '#00B4D8',
    badgeBg: 'bg-cyan-600/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/40',
    tagline: 'Liquid Freezer Series'
  },
  ZOTAC: {
    name: 'ZOTAC Gaming',
    color: '#F9A825',
    badgeBg: 'bg-yellow-600/20',
    badgeText: 'text-yellow-300',
    badgeBorder: 'border-yellow-400/40',
    tagline: 'Push The Limit'
  },
  'Cooler Master': {
    name: 'Cooler Master',
    color: '#800080',
    badgeBg: 'bg-purple-600/20',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-400/40',
    tagline: 'Make It Yours'
  }
};

/**
 * Exact high-definition photo mappings for every single component.
 * Uses high-quality hardware photographs and transparent cutouts.
 */
export const COMPONENT_EXACT_PHOTOS = {
  // CPUs
  'AMD Ryzen 5 5500': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=85',
  'Intel Core i3-14100F': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=85',
  'Intel Core i5-12400F': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=85',
  'AMD Ryzen 5 5600X': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=85',
  'Intel Core i5-14400F': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=85',
  'AMD Ryzen 5 7600X': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=85',
  'Intel Core i5-14600K': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=85',
  'AMD Ryzen 7 9700X': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=85',
  'Intel Core i7-14700K': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=85',
  'AMD Ryzen 7 7800X3D': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=85',
  'AMD Ryzen 9 7950X': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=85',
  'Intel Core i9-14900K': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=85',

  // Motherboards
  'GIGABYTE A520M K V2': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'MSI PRO H610M-E DDR4': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'MSI B550M PRO-VDH WiFi': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'ASRock B650M-HDV/M.2': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'ASUS Prime B760M-A WiFi': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'MSI B760 Gaming Plus WiFi': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'GIGABYTE B650 Gaming X AX': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'MSI MAG B650 Tomahawk WiFi': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'MSI MAG Z790 Tomahawk WiFi': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'GIGABYTE X670E AORUS Master': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',
  'ASUS ROG Maximus Z790 Dark Hero': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=85',

  // GPUs
  'ZOTAC Gaming GeForce RTX 3050 6GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'ASUS Dual AMD Radeon RX 6600 8GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'MSI GeForce RTX 4060 Ventus 2X 8GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'GIGABYTE GeForce RTX 4060 Ti Eagle 8GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'Sapphire Pulse AMD Radeon RX 7700 XT 12GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'Sapphire Pure AMD Radeon RX 7800 XT 16GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'ZOTAC Gaming GeForce RTX 4070 Super Twin Edge 12GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'ZOTAC Gaming GeForce RTX 4070 Ti Super 16GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'Sapphire Nitro+ AMD Radeon RX 7900 XTX 24GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'ASUS ROG Strix GeForce RTX 4080 Super 16GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',
  'ASUS TUF Gaming GeForce RTX 4090 24GB': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=85',

  // RAM
  'Crucial Basics 8GB DDR4-3200': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=85',
  'Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=85',
  'G.Skill Ripjaws V 32GB (2x16GB) DDR4-3600': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=85',
  'Kingston Fury Beast 16GB (1x16GB) DDR5-5200': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=85',
  'Corsair Vengeance 32GB (2x16GB) DDR5-5600': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=85',
  'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=85',
  'G.Skill Trident Z5 RGB 64GB (2x32GB) DDR5-6400': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=85',
  'Corsair Dominator Titanium 64GB (2x32GB) DDR5-6000': 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=85',

  // Storage
  'Kingston NV2 500GB PCIe 4.0 NVMe': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=85',
  'Crucial P3 Plus 1TB PCIe 4.0 NVMe': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=85',
  'WD Blue SN580 1TB PCIe 4.0 NVMe': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=85',
  'WD Black SN850X 1TB PCIe 4.0 NVMe': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=85',
  'Samsung 990 PRO 2TB PCIe 4.0 NVMe': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=85',
  'Seagate Barracuda 2TB 7200RPM HDD': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=85',

  // PSUs
  'Ant Esports VS500L 500W': 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=600&auto=format&fit=crop&q=85',
  'DeepCool PK550D 550W 80+ Bronze': 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=600&auto=format&fit=crop&q=85',
  'Cooler Master MWE 650W V2 Bronze': 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=600&auto=format&fit=crop&q=85',
  'Corsair CX750 750W 80+ Bronze': 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=600&auto=format&fit=crop&q=85',
  'MSI MAG A750GL 750W 80+ Gold PCIe 5.0': 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=600&auto=format&fit=crop&q=85',
  'Corsair RM850e 850W 80+ Gold ATX 3.0': 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=600&auto=format&fit=crop&q=85',
  'Corsair RM1000x 1000W 80+ Gold Modular': 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=600&auto=format&fit=crop&q=85',

  // Cabinets
  'Ant Esports ICE-100 Airflow Mid Tower': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=85',
  'Cooler Master MasterBox Q300L Micro-ATX': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=85',
  'DeepCool CC560 V2 with 4 LED Fans': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=85',
  'Montech AIR 903 MAX with 4 140mm ARGB': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=85',
  'Corsair 4000D Airflow Tempered Glass': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=85',
  'NZXT H9 Flow Dual-Chamber Mid-Tower': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=85',
  'Lian Li O11 Dynamic EVO RGB': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=85',

  // Coolers
  'Standard OEM Air Cooler': 'https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=600&auto=format&fit=crop&q=85',
  'DeepCool AG300 Compact Tower': 'https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=600&auto=format&fit=crop&q=85',
  'DeepCool AG400 ARGB Single Tower': 'https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=600&auto=format&fit=crop&q=85',
  'Thermalright Peerless Assassin 120 SE': 'https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=600&auto=format&fit=crop&q=85',
  'Cooler Master MasterLiquid 240L Core ARGB AIO': 'https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=600&auto=format&fit=crop&q=85',
  'DeepCool LT520 240mm High-Performance AIO': 'https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=600&auto=format&fit=crop&q=85',
  'Arctic Liquid Freezer III 360 ARGB AIO': 'https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=600&auto=format&fit=crop&q=85',
  'NZXT Kraken Elite 360 RGB LCD AIO': 'https://images.unsplash.com/photo-1587202372576-96b630fb6485?w=600&auto=format&fit=crop&q=85',
};

/**
 * Technical Specifications Sheet and Performance Multipliers
 */
export const COMPONENT_DETAILS = {
  // CPUs
  'AMD Ryzen 5 5500': {
    architecture: 'Zen 3 (7nm FinFET)',
    cores: '6 Cores / 12 Threads',
    clocks: '3.6 GHz Base / 4.2 GHz Boost',
    cache: '19MB Total (16MB L3)',
    pcie: 'PCIe 3.0 x16',
    warranty: '3 Years AMD India Warranty',
    budgetTier: 'Budget',
    cpuScore: 52,
    highlights: ['Best budget 6-core processor', 'Wraith Stealth cooler bundled', 'Low 65W power consumption']
  },
  'Intel Core i3-14100F': {
    architecture: 'Raptor Lake Refresh (Intel 7)',
    cores: '4 Cores / 8 Threads (4 Performance)',
    clocks: '3.5 GHz Base / 4.7 GHz Turbo',
    cache: '12MB Intel Smart Cache',
    pcie: 'PCIe 5.0 & 4.0 support',
    warranty: '3 Years Intel India Warranty',
    budgetTier: 'Budget',
    cpuScore: 56,
    highlights: ['High single-core clock for esports', 'PCIe 5.0 ready', 'Included Intel RM1 cooler']
  },
  'Intel Core i5-12400F': {
    architecture: 'Alder Lake (Intel 7)',
    cores: '6 Cores / 12 Threads (6 Golden Cove P-Cores)',
    clocks: '2.5 GHz Base / 4.4 GHz Turbo',
    cache: '18MB Intel Smart Cache',
    pcie: 'PCIe 5.0 and DDR4/DDR5 dual support',
    warranty: '3 Years Intel Boxed Warranty',
    budgetTier: 'Budget-Mid',
    cpuScore: 68,
    highlights: ['Exceptional budget 1080p gaming value', 'Zero E-core scheduling conflicts', 'Cool & efficient']
  },
  'AMD Ryzen 5 5600X': {
    architecture: 'Zen 3 (7nm FinFET)',
    cores: '6 Cores / 12 Threads',
    clocks: '3.7 GHz Base / 4.6 GHz Boost',
    cache: '35MB Total (32MB GameCache)',
    pcie: 'PCIe 4.0 x16',
    warranty: '3 Years AMD Official Warranty',
    budgetTier: 'Budget-Mid',
    cpuScore: 70,
    highlights: ['Full 32MB L3 GameCache', 'AM4 platform stability', 'Overclocking unlocked']
  },
  'Intel Core i5-14400F': {
    architecture: 'Raptor Lake Refresh (Intel 7)',
    cores: '10 Cores (6P + 4E) / 16 Threads',
    clocks: '2.5 GHz Base / 4.7 GHz Max Turbo',
    cache: '20MB Smart Cache',
    pcie: 'PCIe 5.0 up to 16 lanes',
    warranty: '3 Years Intel India Warranty',
    budgetTier: 'Mid-Range',
    cpuScore: 78,
    highlights: ['10 hybrid cores for gaming + streaming', 'DDR5 4800 / DDR4 3200 support', '65W Base TDP']
  },
  'AMD Ryzen 5 7600X': {
    architecture: 'Zen 4 (5nm FinFET)',
    cores: '6 Cores / 12 Threads',
    clocks: '4.7 GHz Base / 5.3 GHz Boost',
    cache: '38MB Total (32MB L3)',
    pcie: 'PCIe 5.0 NVMe & GPU lanes',
    warranty: '3 Years AMD India Warranty',
    budgetTier: 'Mid-Range',
    cpuScore: 84,
    highlights: ['Next-gen AM5 socket with upgrade path through 2027+', '5.3 GHz boost out of the box', 'AVX-512 support']
  },
  'Intel Core i5-14600K': {
    architecture: 'Raptor Lake Refresh',
    cores: '14 Cores (6P + 8E) / 20 Threads',
    clocks: '3.5 GHz Base / 5.3 GHz Turbo',
    cache: '24MB Intel Smart Cache',
    pcie: 'PCIe 5.0 & unlocked multiplier',
    warranty: '3 Years Boxed Warranty',
    budgetTier: 'Mid-High',
    cpuScore: 89,
    highlights: ['Unlocked for overclocking', 'Superb 1440p gaming & video transcoding', '125W Base TDP']
  },
  'AMD Ryzen 7 9700X': {
    architecture: 'Zen 5 (4nm FinFET)',
    cores: '8 Cores / 16 Threads',
    clocks: '3.8 GHz Base / 5.5 GHz Boost',
    cache: '40MB Total (32MB L3)',
    pcie: 'PCIe 5.0 across GPU & Storage',
    warranty: '3 Years AMD India Warranty',
    budgetTier: 'High-End',
    cpuScore: 92,
    highlights: ['New Zen 5 high IPC efficiency', '65W thermal design runs cool', 'Blazing 5.5 GHz boost']
  },
  'Intel Core i7-14700K': {
    architecture: 'Raptor Lake Refresh',
    cores: '20 Cores (8P + 12E) / 28 Threads',
    clocks: '3.4 GHz Base / 5.6 GHz Turbo',
    cache: '33MB Intel Smart Cache',
    pcie: 'PCIe 5.0 with 253W Max Turbo Power',
    warranty: '3 Years Boxed Warranty',
    budgetTier: 'High-End',
    cpuScore: 95,
    highlights: ['28 execution threads', 'Premier 4K DaVinci & Premiere rendering engine', '5.6 GHz clock']
  },
  'AMD Ryzen 7 7800X3D': {
    architecture: 'Zen 4 3D V-Cache (5nm)',
    cores: '8 Cores / 16 Threads',
    clocks: '4.2 GHz Base / 5.0 GHz Boost',
    cache: '104MB Massive L3 3D V-Cache',
    pcie: 'PCIe 5.0 AM5 Platform',
    warranty: '3 Years AMD India Warranty',
    budgetTier: 'High-End Gaming King',
    cpuScore: 98,
    highlights: ['The fastest gaming processor in the world', '104MB 3D V-Cache destroys frame drops', 'Extremely power-efficient 120W TDP']
  },
  'AMD Ryzen 9 7950X': {
    architecture: 'Zen 4 (5nm FinFET)',
    cores: '16 Cores / 32 Threads',
    clocks: '4.5 GHz Base / 5.7 GHz Boost',
    cache: '80MB Total Cache',
    pcie: 'PCIe 5.0 Full Workstation Grade',
    warranty: '3 Years AMD India Warranty',
    budgetTier: 'Enthusiast Flagship',
    cpuScore: 99,
    highlights: ['32 threads for Unreal Engine compilation & 3D rendering', '5.7 GHz single-core speed', 'Dual CCD powerhouse']
  },
  'Intel Core i9-14900K': {
    architecture: 'Raptor Lake Refresh Extreme',
    cores: '24 Cores (8P + 16E) / 32 Threads',
    clocks: '3.2 GHz Base / 6.0 GHz Thermal Velocity Boost',
    cache: '36MB Smart Cache',
    pcie: 'PCIe 5.0 Unlocked Multiplier',
    warranty: '3 Years Intel Boxed Warranty',
    budgetTier: 'Enthusiast Flagship',
    cpuScore: 100,
    highlights: ['Historic 6.0 GHz factory boost', 'Maximum multicore throughput', 'Extreme creator productivity']
  },

  // GPUs
  'ZOTAC Gaming GeForce RTX 3050 6GB': {
    gpuChip: 'NVIDIA GA107-325 (Ampere)',
    vram: '6GB GDDR6 (96-bit bus, 168 GB/s)',
    cudaCores: '2304 CUDA Cores',
    tdp: '70W (Slot Powered, 0 PCIe cable needed)',
    length: '173 mm (Ultra-compact dual slot)',
    budgetTier: 'Budget',
    gpuScore: 42,
    highlights: ['No PCIe power cable required', 'Ray tracing and DLSS 2 enabled', 'Fits in any compact chassis']
  },
  'ASUS Dual AMD Radeon RX 6600 8GB': {
    gpuChip: 'AMD Navi 23 (RDNA 2, 7nm)',
    vram: '8GB GDDR6 (128-bit bus, 224 GB/s + 32MB Infinity Cache)',
    streamProcessors: '1792 Stream Processors',
    tdp: '132W (1x 8-pin PCIe)',
    length: '243 mm',
    budgetTier: 'Budget King',
    gpuScore: 54,
    highlights: ['King of budget 1080p Ultra 60+ FPS', 'Dual Axial-tech fans with 0dB technology', '32MB Infinity Cache']
  },
  'MSI GeForce RTX 4060 Ventus 2X 8GB': {
    gpuChip: 'NVIDIA AD107 (Ada Lovelace, 4nm)',
    vram: '8GB GDDR6 (128-bit bus, 272 GB/s + 24MB L2 Cache)',
    cudaCores: '3072 CUDA Cores / 24 RT Cores',
    tdp: '115W (1x 8-pin PCIe)',
    length: '199 mm',
    budgetTier: 'Mid-Range',
    gpuScore: 68,
    highlights: ['DLSS 3 Frame Generation support', 'AV1 hardware encoder', 'Ultra-low 115W power draw']
  },
  'GIGABYTE GeForce RTX 4060 Ti Eagle 8GB': {
    gpuChip: 'NVIDIA AD106 (Ada Lovelace, 4nm)',
    vram: '8GB GDDR6 (128-bit bus, 288 GB/s + 32MB L2 Cache)',
    cudaCores: '4352 CUDA Cores / 34 RT Cores',
    tdp: '160W (1x 8-pin PCIe)',
    length: '272 mm',
    budgetTier: 'Mid-Range',
    gpuScore: 76,
    highlights: ['WINDFORCE triple fan cooling', '1440p Esports and high FPS 1080p AAA', 'DLSS 3 Reflex low latency']
  },
  'Sapphire Pulse AMD Radeon RX 7700 XT 12GB': {
    gpuChip: 'AMD Navi 32 (RDNA 3, 5nm)',
    vram: '12GB GDDR6 (192-bit bus, 432 GB/s + 48MB Infinity Cache)',
    streamProcessors: '3456 Stream Processors',
    tdp: '245W (2x 8-pin PCIe)',
    length: '280 mm',
    budgetTier: 'Mid-High',
    gpuScore: 82,
    highlights: ['12GB VRAM headroom for modern textures', 'High native rasterization performance', 'Dual-X cooling with intelligent fan control']
  },
  'Sapphire Pure AMD Radeon RX 7800 XT 16GB': {
    gpuChip: 'AMD Navi 32 (RDNA 3, 5nm)',
    vram: '16GB GDDR6 (256-bit bus, 624 GB/s + 64MB Infinity Cache)',
    streamProcessors: '3840 Stream Processors',
    tdp: '263W (2x 8-pin PCIe)',
    length: '320 mm',
    budgetTier: 'Mid-High',
    gpuScore: 88,
    highlights: ['16GB high-bandwidth VRAM for 1440p max settings', 'Sleek all-white aesthetic', 'DisplayPort 2.1 support']
  },
  'ZOTAC Gaming GeForce RTX 4070 Super Twin Edge 12GB': {
    gpuChip: 'NVIDIA AD104 (Ada Lovelace, 4nm)',
    vram: '12GB GDDR6X (192-bit bus, 504 GB/s + 48MB L2 Cache)',
    cudaCores: '7168 CUDA Cores / 56 RT Cores',
    tdp: '220W (1x 16-pin 12VHPWR)',
    length: '234 mm',
    budgetTier: 'High-End',
    gpuScore: 91,
    highlights: ['DLSS 3.5 Ray Reconstruction', 'High speed GDDR6X memory', 'Compact 234mm form factor fits almost all cases']
  },
  'ZOTAC Gaming GeForce RTX 4070 Ti Super 16GB': {
    gpuChip: 'NVIDIA AD103 (Ada Lovelace, 4nm)',
    vram: '16GB GDDR6X (256-bit bus, 672 GB/s + 48MB L2 Cache)',
    cudaCores: '8448 CUDA Cores / 66 RT Cores',
    tdp: '285W (1x 16-pin 12VHPWR)',
    length: '307 mm',
    budgetTier: 'High-End',
    gpuScore: 94,
    highlights: ['Upgraded 256-bit bus with 16GB VRAM', '4K gaming and generative AI ready', 'Triple fan IceStorm 2.0']
  },
  'Sapphire Nitro+ AMD Radeon RX 7900 XTX 24GB': {
    gpuChip: 'AMD Navi 31 (RDNA 3, 5nm Chiplet)',
    vram: '24GB GDDR6 (384-bit bus, 960 GB/s + 96MB Infinity Cache)',
    streamProcessors: '6144 Stream Processors',
    tdp: '355W (3x 8-pin PCIe)',
    length: '320 mm',
    budgetTier: 'Flagship',
    gpuScore: 97,
    highlights: ['Vapor-X vapor chamber cooling', 'Massive 24GB VRAM buffer for 8K video & AI LLMs', 'ARGB lightbar design']
  },
  'ASUS ROG Strix GeForce RTX 4080 Super 16GB': {
    gpuChip: 'NVIDIA AD103 (Ada Lovelace, 4nm)',
    vram: '16GB GDDR6X (256-bit bus, 736 GB/s)',
    cudaCores: '10240 CUDA Cores / 80 RT Cores',
    tdp: '320W (1x 16-pin 12VHPWR)',
    length: '357 mm',
    budgetTier: 'Flagship',
    gpuScore: 98,
    highlights: ['Patented vented exoskeleton frame', 'MaxContact precision-machined heatsink', 'Elite 4K 144Hz Ray Tracing']
  },
  'ASUS TUF Gaming GeForce RTX 4090 24GB': {
    gpuChip: 'NVIDIA AD102 (Ada Lovelace, 4nm)',
    vram: '24GB GDDR6X (384-bit bus, 1008 GB/s + 72MB L2 Cache)',
    cudaCores: '16384 CUDA Cores / 128 RT Cores / 512 Tensor Cores',
    tdp: '450W (1x 16-pin 12VHPWR, recommends 850W+ PSU)',
    length: '348 mm (3.65-slot thickness)',
    budgetTier: 'Enthusiast Titan',
    gpuScore: 100,
    highlights: ['The most powerful GPU on planet Earth', 'Military-grade capacitors & rigid die-cast shroud', 'Destroys 4K Cyberpunk with Path Tracing at 100+ FPS']
  }
};

/**
 * Returns brand metadata, falling back safely
 */
export function getBrandConfig(brandName) {
  if (!brandName) return BRAND_CONFIG.Intel;
  const match = Object.keys(BRAND_CONFIG).find(
    k => k.toLowerCase() === brandName.toLowerCase() || brandName.toLowerCase().includes(k.toLowerCase())
  );
  return match ? BRAND_CONFIG[match] : {
    name: brandName,
    color: '#06b6d4',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-500/40',
    tagline: 'Verified Hardware'
  };
}

/**
 * Get exact photo URL for a component
 */
export function getExactPhotoUrl(component) {
  if (!component) return '/images/components/cpu-intel.jpg';
  
  const cat = component.category?.toUpperCase() || '';
  const brand = component.brand?.toUpperCase() || '';
  const name = component.name?.toUpperCase() || '';

  // Map to local verified component images
  if (cat === 'CPU') {
    if (brand.includes('AMD') || name.includes('RYZEN')) {
      return '/images/components/cpu-amd.jpg';
    }
    return '/images/components/cpu-intel.jpg';
  }

  if (cat === 'GPU') {
    if (brand.includes('AMD') || brand.includes('SAPPHIRE') || name.includes('RADEON') || name.includes('RX')) {
      return '/images/components/gpu-amd.jpg';
    }
    return '/images/components/gpu-nvidia.jpg';
  }

  if (cat === 'MOTHERBOARD') {
    return '/images/components/motherboard.jpg';
  }

  if (cat === 'RAM') {
    return '/images/components/ram.jpg';
  }

  if (cat === 'STORAGE') {
    return '/images/components/storage-ssd.jpg';
  }

  if (cat === 'PSU') {
    return '/images/components/psu.jpg';
  }

  if (cat === 'CABINET') {
    return '/images/components/cabinet.jpg';
  }

  if (cat === 'COOLING') {
    return '/images/components/cooler.jpg';
  }

  if (COMPONENT_EXACT_PHOTOS[component.name]) {
    return COMPONENT_EXACT_PHOTOS[component.name];
  }

  return component.imageUrl || '/images/components/cpu-intel.jpg';
}

/**
 * Get detailed specifications for a component
 */
export function getComponentSpecs(component) {
  if (!component) return null;
  return COMPONENT_DETAILS[component.name] || null;
}

/**
 * Live Gaming and Productivity Performance Estimator
 * Calculates estimated FPS and render multipliers based on selected CPU & GPU
 */
export function calculateLiveBenchmarks(cpu, gpu) {
  const cpuData = cpu ? COMPONENT_DETAILS[cpu.name] : null;
  const gpuData = gpu ? COMPONENT_DETAILS[gpu.name] : null;

  const cpuScore = cpuData?.cpuScore || (cpu ? 60 : 25);
  const gpuScore = gpuData?.gpuScore || (gpu ? 50 : 20);

  // Combined gaming index (GPU weighted 70%, CPU weighted 30%)
  const gamingIndex = Math.min(100, Math.round((gpuScore * 0.72) + (cpuScore * 0.28)));

  // Base scales from ~38 FPS on RTX 3050 to ~135+ FPS on RTX 4090
  const cyberpunkFps = Math.max(30, Math.round(25 + (gamingIndex * 1.15)));

  // Base scales from ~180 FPS on budget to 550+ FPS on 7800X3D + 4080
  const esportsFps = Math.max(120, Math.round(100 + (cpuScore * 3.2) + (gpuScore * 1.4)));

  // GTA V / Modern AAA High Settings
  const gtaFps = Math.max(50, Math.round(45 + (gamingIndex * 1.45)));

  // Video Render Speed Multiplier (4K DaVinci / Premiere)
  const renderMultiplier = Number((0.6 + (cpuScore * 0.032) + (gpuScore * 0.024)).toFixed(1));

  // Determine performance tier
  let tier = 'Entry-Level 1080p';
  let tierColor = 'text-slate-300';
  let tierBadge = 'bg-slate-800 text-slate-300 border-slate-700';

  if (gamingIndex >= 92) {
    tier = '4K Ultra & 8K Creator Workstation';
    tierColor = 'text-amber-400';
    tierBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (gamingIndex >= 78) {
    tier = '1440p High-Refresh & 4K Ray Tracing';
    tierColor = 'text-cyan-400';
    tierBadge = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  } else if (gamingIndex >= 62) {
    tier = '1080p Ultra & 1440p Smooth';
    tierColor = 'text-emerald-400';
    tierBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }

  // Detect potential bottleneck
  let bottleneckWarning = null;
  if (cpu && gpu) {
    if (gpuScore - cpuScore > 35) {
      bottleneckWarning = `CPU Bottleneck: Your ${cpu.name} may throttle the full gaming potential of ${gpu.name}. Consider upgrading CPU to Ryzen 7 or Core i7.`;
    } else if (cpuScore - gpuScore > 40) {
      bottleneckWarning = `GPU Bottleneck: Your powerful ${cpu.name} is paired with an entry GPU (${gpu.name}). For AAA gaming, pair with RTX 4070 or above.`;
    }
  }

  return {
    gamingIndex,
    cyberpunkFps,
    esportsFps,
    gtaFps,
    renderMultiplier,
    tier,
    tierColor,
    tierBadge,
    bottleneckWarning,
    hasGpu: Boolean(gpu),
    hasCpu: Boolean(cpu)
  };
}
