import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, LogOut, Home, Wrench, Shield, Layers, Package, ShoppingCart, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const { activePage, setActivePage, user, logout, cart } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const totalCartCount = cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const navigate = (page) => {
    setMenuOpen(false);
    setActivePage(page);
  };

  const links = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'configurator', label: 'Build PC', icon: Wrench },
    { id: 'presets', label: 'Presets', icon: Layers },
    ...(isAdmin
      ? [{ id: 'admin-orders', label: 'Customer Orders', icon: Package, action: () => { window.__adminInitialTab = 'orders'; navigate('admin'); } }]
      : [{ id: 'orders', label: 'Orders', icon: Package }]),
    ...(isAdmin
      ? [{ id: 'admin', label: 'Admin Portal', icon: Shield, action: () => { window.__adminInitialTab = 'catalog'; navigate('admin'); } }]
      : []),
  ];

  const isActive = (link) => link.id === 'admin-orders'
    ? activePage === 'admin' && window.__adminInitialTab === 'orders'
    : link.id === 'admin'
      ? activePage === 'admin' && window.__adminInitialTab !== 'orders'
      : link.id === 'configurator'
        ? activePage === 'configurator' || activePage === 'build'
        : activePage === link.id;

  const linkClasses = (active) => `buildo-nav-link inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[13px] font-semibold transition ${
    active ? 'is-active' : 'text-white/60 hover:bg-white/[0.045] hover:text-white'
  }`;

  return (
    <header className="buildo-navbar sticky top-0 z-40 border-b border-white/10 bg-[#10110d]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-3 text-left"
          onClick={() => navigate('home')}
          aria-label="BuildO home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8ff43] text-[#171910] transition-transform hover:rotate-[-5deg] hover:scale-105">
            <Cpu className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-[-0.04em]">BuildO<span className="text-[#d8ff43]">.</span></span>
        </button>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <button key={link.id} type="button" onClick={link.action || (() => navigate(link.id))} className={linkClasses(isActive(link))}>
                <Icon className="h-4 w-4" />
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <button
              type="button"
              onClick={() => navigate('cart')}
              className={`buildo-cart-nav relative flex h-11 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition ${activePage === 'cart' || activePage === 'checkout' ? 'is-active' : 'border-white/15 text-white/70 hover:border-[#d8ff43]/50 hover:text-white'}`}
              aria-label={`Open cart${totalCartCount ? `, ${totalCartCount} items` : ''}`}
            >
              <ShoppingCart className="h-[17px] w-[17px]" />
              <span className="hidden sm:inline">Cart</span>
              {totalCartCount > 0 && <span className="min-w-5 rounded-full bg-[#d8ff43] px-1.5 py-0.5 text-center text-[10px] font-bold text-[#171910]">{totalCartCount}</span>}
            </button>
          )}

          {user && (
            <div className="hidden items-center gap-2 lg:flex">
              <div className="flex max-w-[150px] flex-col items-end">
                <span className="truncate text-xs font-semibold text-white">{user.fullName || user.username}</span>
                <span className="text-[10px] text-white/40">{isAdmin ? 'Admin' : 'Customer'}</span>
              </div>
              <button type="button" onClick={logout} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:border-rose-400/30 hover:text-rose-300" title="Sign out" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          <button type="button" onClick={() => navigate('configurator')} className="hidden min-h-11 items-center gap-2 rounded-full bg-[#d8ff43] px-5 text-[13px] font-bold text-[#171910] transition hover:bg-[#cafa25] lg:inline-flex">
            Start a build <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="buildo-app-menu"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition hover:border-[#d8ff43]/60 hover:text-[#d8ff43] xl:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="buildo-app-menu" aria-label="Mobile navigation" className="buildo-mobile-nav absolute left-0 right-0 top-full border-t border-white/10 bg-[#10110d] px-5 py-4 shadow-2xl sm:px-8 xl:hidden">
          <div className="mx-auto grid max-w-[1320px] gap-1 sm:grid-cols-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <button key={link.id} type="button" onClick={link.action || (() => navigate(link.id))} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${isActive(link) ? 'bg-[#d8ff43]/10 text-[#d8ff43]' : 'text-white/70 hover:bg-white/[0.05] hover:text-white'}`}>
                  <Icon className="h-4 w-4" />{link.label}
                </button>
              );
            })}
            {!isAdmin && <button type="button" onClick={() => navigate('cart')} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white sm:hidden"><ShoppingCart className="h-4 w-4" />Cart {totalCartCount ? `(${totalCartCount})` : ''}</button>}
            <button type="button" onClick={() => navigate('configurator')} className="mt-2 inline-flex items-center justify-between rounded-xl bg-[#d8ff43] px-4 py-3 text-sm font-bold text-[#171910] transition hover:bg-[#cafa25] sm:col-span-2 xl:hidden">Start a build<ArrowRight className="h-4 w-4" /></button>
            {user && <button type="button" onClick={() => { setMenuOpen(false); logout(); }} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white sm:col-span-2 xl:hidden"><LogOut className="h-4 w-4" />Sign out of {user.fullName || user.username}</button>}
          </div>
        </nav>
      )}
    </header>
  );
}
