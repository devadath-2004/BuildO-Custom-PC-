import React from 'react';
import { Cpu, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { user, setActivePage } = useApp();

  return (
    <footer className="buildo-footer mt-16 border-t border-white/10 bg-[#10110d] text-white">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-7 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <button type="button" onClick={() => setActivePage('home')} className="inline-flex items-center gap-3 self-start text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8ff43] text-[#171910]"><Cpu className="h-4 w-4" /></span>
          <span className="text-sm font-semibold tracking-tight">BuildO<span className="text-[#d8ff43]">.</span></span>
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
