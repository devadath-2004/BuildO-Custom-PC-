import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BuildOWordmark from './BuildOWordmark';

export default function Footer() {
  const { user, setActivePage } = useApp();

  return (
    <footer className="buildo-footer mt-16 border-t border-white/10 bg-[#10110d] text-white">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-7 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <button type="button" onClick={() => setActivePage('home')} className="inline-flex items-center self-start text-left">
          <BuildOWordmark size="footer" />
        </button>

        <p className="max-w-sm text-xs leading-5 text-white/45">PC recommendations for people who care about the experience, not the spec-sheet headache.</p>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-white/50">
          <button type="button" onClick={() => setActivePage('home')} className="transition hover:text-[#d8ff43]">Home</button>
          <button type="button" onClick={() => setActivePage('configurator')} className="transition hover:text-[#d8ff43]">Build PC</button>
          <button type="button" onClick={() => setActivePage('presets')} className="transition hover:text-[#d8ff43]">Presets</button>
          {user && <button type="button" onClick={() => setActivePage(user.role === 'ROLE_ADMIN' ? 'admin' : 'orders')} className="transition hover:text-[#d8ff43]">{user.role === 'ROLE_ADMIN' ? 'Admin portal' : 'Orders'}</button>}
          {!user && <button type="button" onClick={() => setActivePage('login')} className="inline-flex items-center gap-1 transition hover:text-[#d8ff43]">Sign in <ArrowUpRight className="h-3 w-3" /></button>}
          <span className="text-white/30">© 2026 BuildO</span>
        </nav>
      </div>
    </footer>
  );
}
