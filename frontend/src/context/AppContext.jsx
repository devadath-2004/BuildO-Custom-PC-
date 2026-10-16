import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AppContext = createContext();

export const CATEGORIES = [
  { key: 'CPU', label: 'Processor (CPU)', icon: 'Cpu', desc: 'Central Processing Unit' },
  { key: 'MOTHERBOARD', label: 'Motherboard', icon: 'CircuitBoard', desc: 'System Mainboard' },
  { key: 'RAM', label: 'Memory (RAM)', icon: 'MemoryStick', desc: 'DDR4 / DDR5 High Speed Memory' },
  { key: 'STORAGE', label: 'Storage (SSD)', icon: 'HardDrive', desc: 'PCIe NVMe M.2 Solid State Drive' },
  { key: 'GPU', label: 'Graphics Card (GPU)', icon: 'Gamepad2', desc: 'Discrete Gaming & Compute Graphics' },
  { key: 'PSU', label: 'Power Supply (PSU)', icon: 'Zap', desc: '80+ Certified Power Unit' },
  { key: 'CABINET', label: 'Cabinet / Case', icon: 'Box', desc: 'Chassis with Airflow & Glass' },
  { key: 'COOLING', label: 'Cooling Solution', icon: 'Fan', desc: 'Liquid AIO or Air Cooler' },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);

  const getPageFromHash = () => {
    try {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      if (['home', 'login', 'configurator', 'presets', 'cart', 'checkout', 'orders', 'admin'].includes(hash)) {
        return hash;
      }
    } catch {
      // ignore
    }
    return 'home';
  };

  const [activePage, setActivePageState] = useState(getPageFromHash);

  const setActivePage = (page) => {
    setActivePageState(page);
    try {
      if (window.location.hash.replace('#', '') !== page) {
        window.location.hash = page;
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onHashChange = () => {
      const page = getPageFromHash();
      setActivePageState(page);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const [customBuild, setCustomBuild] = useState({});
  const [discountCode, setDiscountCode] = useState('');
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('buildo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notification, setNotification] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [activeOrderForPayment, setActiveOrderForPayment] = useState(null);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('buildo_cart', JSON.stringify(cart));
  }, [cart]);

  // Check logged in user on mount
  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      apiClient.getCurrentUser()
        .then(userData => setUser(userData))
        .catch(() => {
          apiClient.setToken(null);
          setUser(null);
        });
    }
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const addBuildComponent = (category, component) => {
    setCustomBuild(prev => ({
      ...prev,
      [category]: component
    }));
    showNotification(`Added ${component.name} to ${category}`, 'success');
  };

  const removeBuildComponent = (category) => {
    setCustomBuild(prev => {
      const copy = { ...prev };
      delete copy[category];
      return copy;
    });
  };

  const clearCustomBuild = () => {
    setCustomBuild({});
  };

  const loadPresetIntoConfigurator = (preset) => {
    const newBuild = {};
    if (preset.components) {
      preset.components.forEach(comp => {
        newBuild[comp.category] = comp;
      });
    }
    setCustomBuild(newBuild);
    setActivePage('configurator');
    showNotification(`Loaded "${preset.name}" into Configurator. You can customize any component!`, 'success');
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i);
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    showNotification(`Added to cart!`, 'success');
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountCode('');
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
    setActivePage('home');
    showNotification('You have been signed out.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        logout,
        activePage,
        setActivePage,
        customBuild,
        setCustomBuild,
        addBuildComponent,
        removeBuildComponent,
        clearCustomBuild,
        loadPresetIntoConfigurator,
        cart,
        discountCode,
        setDiscountCode,
        addToCart,
        removeFromCart,
        clearCart,
        notification,
        showNotification,
        authModalOpen,
        setAuthModalOpen,
        selectedOrderForInvoice,
        setSelectedOrderForInvoice,
        activeOrderForPayment,
        setActiveOrderForPayment,
        CATEGORIES
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
