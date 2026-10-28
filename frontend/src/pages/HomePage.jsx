import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Gamepad2,
  Layers,
  LogOut,
  Menu,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import BuildOWordmark from '../components/BuildOWordmark';

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Tell us what matters',
    description: 'Games, apps, budget, resolution—we ask only what changes the recommendation.',
    icon: Gamepad2,
  },
  {
    number: '02',
    title: 'Get a balanced build',
    description: 'Every component is selected as a system, not a list of expensive individual parts.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Make it your own',
    description: 'Swap, upgrade, or dial it back. Compatibility and price update as you go.',
    icon: Wrench,
  },
];

const BUILD_PATHS = [
  {
    number: '01',
    eyebrow: 'I KNOW MY PARTS',
    title: 'Build from the ground up.',
    description: 'Pick every component yourself while BuildO checks sockets, dimensions, power, and cooling in real time.',
    icon: Wrench,
    image: '/pc-setup.jpg',
    imageLabel: 'Customize a PC component by component',
    imageCaption: 'Every part, your call',
    cta: 'Open custom builder',
    onChoose: ({ setActivePage }) => setActivePage('configurator'),
    features: ['Socket and power checks', 'Live price updates', 'Swap parts whenever you like'],
  },
  {
    number: '02',
    eyebrow: 'RECOMMEND IT TO ME',
    title: 'Answer a few. Get your build.',
    description: 'Share your games, workload, and budget. We’ll produce a tuned starting point you can still customize.',
    icon: Sparkles,
    image: '/setup-bg.jpg',
    imageLabel: 'A balanced gaming PC ready to customize',
    imageCaption: 'A balanced build to start from',
    cta: 'Get my recommendation',
    onChoose: ({ setActivePage }) => setActivePage('presets'),
    features: ['Curated preset builds', 'See the included components', 'Customize in the builder'],
  },
];

const formatPrice = (price) => {
  if (price === undefined || price === null || price === '') return 'Price on request';
  const amount = Number(price);
  if (!Number.isFinite(amount)) return 'Price on request';
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

function PresetCard({ preset, index, onLoad }) {
  const fallbackImage = preset.category === 'OFFICE'
    ? '/desk-setup.jpg'
    : preset.category === 'STUDIO' || preset.category === 'VIDEO_EDITING'
      ? '/setup-bg.jpg'
      : index === 0 ? '/pc-setup.jpg' : '/setup-bg.jpg';
  const image = preset.imageUrl || fallbackImage;
  const cpu = preset.components?.find((component) => component.category === 'CPU')?.name;
  const gpu = preset.components?.find((component) => component.category === 'GPU')?.name;

  return (
    <article className="home-preset-card home-reveal group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151711] text-white transition duration-300 hover:-translate-y-1 hover:border-[#d8ff43]/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)]" data-home-reveal="up" style={{ '--home-reveal-delay': `${index * 110}ms` }}>
      <div className="relative aspect-[1.45] overflow-hidden bg-[#191b14]">
        <img
          src={image}
          alt={`${preset.name} PC build`}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-[#10110d]/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          {preset.category || (index === 0 ? 'CREATOR / 4K' : 'GAMING BUILD')}
        </span>
        <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 text-xs font-semibold text-white">
          <BadgeCheck className="h-4 w-4 text-[#d8ff43]" />
          Compatibility checked
        </span>
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d8ff43]">
              {preset.category || 'BUILD O PRESET'}
            </p>
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
              {preset.name}
            </h3>
          </div>
          <p className="pt-1 text-lg font-semibold tracking-tight text-white">
            {formatPrice(preset.basePrice)}
          </p>
        </div>

        <p className="mt-3 min-h-12 text-sm leading-6 text-white/55">
          {preset.description || 'A carefully balanced starting point, ready for you to customize.'}
        </p>

        {(cpu || gpu) && (
          <div className="mt-5 grid grid-cols-1 gap-2 border-t border-white/10 pt-4 text-xs text-white/55 sm:grid-cols-2">
            {cpu && <p className="truncate"><span className="font-semibold text-white">CPU</span> · {cpu}</p>}
            {gpu && <p className="truncate"><span className="font-semibold text-white">GPU</span> · {gpu}</p>}
          </div>
        )}

        <button
          type="button"
          onClick={() => onLoad(preset)}
          className="mt-6 inline-flex w-full items-center justify-between rounded-full bg-[#d8ff43] px-5 py-3.5 text-sm font-bold text-[#171910] transition hover:bg-[#cafa25] focus:outline-none focus:ring-2 focus:ring-[#829c12] focus:ring-offset-2"
        >
          <span>Load into builder</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

export default function HomePage() {
  const { user, cart, logout, setActivePage, loadPresetIntoConfigurator } = useApp();
  const [presets, setPresets] = useState([]);
  const [componentCount, setComponentCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presetError, setPresetError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient.getPresets()
      .then((data) => {
        if (active) setPresets(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active) setPresetError(error.message || 'Preset builds could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    apiClient.getComponents()
      .then((data) => {
        if (active) setComponentCount(Array.isArray(data) ? data.length : null);
      })
      .catch(() => {
        if (active) setComponentCount(null);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-home-reveal]');
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    revealItems.forEach((item) => {
      if (!item.classList.contains('is-visible')) observer.observe(item);
    });

    return () => observer.disconnect();
  }, [loading, presets.length]);

  const cartCount = cart?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navigateTo = (page) => {
    setMenuOpen(false);
    setActivePage(page);
  };

  const loadPreset = (preset) => {
    loadPresetIntoConfigurator(preset);
  };

  const menuLinks = [
    { label: 'How it works', action: () => scrollTo('how') },
    { label: 'Build paths', action: () => scrollTo('paths') },
    { label: 'Popular builds', action: () => scrollTo('builds') },
    {
      label: !user ? 'Sign in' : user.role === 'ROLE_ADMIN' ? 'Admin portal' : 'My orders',
      action: () => navigateTo(!user ? 'login' : user.role === 'ROLE_ADMIN' ? 'admin' : 'orders'),
    },
    ...(user ? [{ label: 'Cart', action: () => navigateTo('cart'), count: cartCount }] : []),
  ];

  return (
    <div id="top" className="home-page min-h-screen font-sans text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#10110d]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => scrollTo('top')}
            className="inline-flex items-center text-left"
            aria-label="BuildO home"
          >
            <BuildOWordmark size="nav" />
          </button>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
            {menuLinks.filter((link) => link.label !== 'Cart').map((link) => (
              <button
                type="button"
                key={link.label}
                onClick={link.action}
                className={link.label === 'Sign in'
                  ? 'inline-flex items-center rounded-full border border-[#d8ff43]/40 bg-[#d8ff43]/10 px-4 py-2 text-[13px] font-semibold text-[#d8ff43] shadow-[inset_0_0_18px_rgba(216,255,67,0.06)] transition hover:border-[#d8ff43]/75 hover:bg-[#d8ff43]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8ff43] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10110d]'
                  : 'text-[13px] font-medium text-white/65 transition hover:text-[#d8ff43]'}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={() => navigateTo('cart')}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[#d8ff43]/60 hover:text-[#d8ff43]"
                aria-label={`Open cart${cartCount ? `, ${cartCount} items` : ''}`}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d8ff43] px-1 text-[10px] font-bold text-[#171910]">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigateTo('configurator')}
              className="hidden min-h-11 items-center gap-3 rounded-full bg-[#d8ff43] px-5 text-[13px] font-bold text-[#171910] transition hover:bg-[#cafa25] lg:inline-flex"
            >
              Start a build <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="buildo-home-menu"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 transition hover:border-[#d8ff43]/60 hover:text-[#d8ff43] lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="buildo-home-menu" className="absolute left-0 right-0 top-full border-t border-white/10 bg-[#10110d] px-5 py-5 text-white shadow-2xl sm:px-8 lg:px-12">
            <div className="mx-auto grid max-w-[1320px] gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {menuLinks.map((link) => (
                <button
                  type="button"
                  key={link.label}
                  onClick={link.action}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${link.label === 'Sign in' ? 'bg-[#d8ff43]/10 font-semibold text-[#d8ff43] ring-1 ring-inset ring-[#d8ff43]/25 hover:bg-[#d8ff43]/15' : 'text-white/75 hover:bg-white/5 hover:text-[#d8ff43]'}`}
                >
                  <span>{link.label}</span>
                  {link.count > 0 && <span className="rounded-full bg-[#d8ff43] px-2 py-0.5 text-xs font-bold text-[#171910]">{link.count}</span>}
                </button>
              ))}
              <button
                type="button"
                onClick={() => navigateTo('configurator')}
                className="mt-2 inline-flex items-center justify-between rounded-xl bg-[#d8ff43] px-4 py-3 text-sm font-bold text-[#171910] transition hover:bg-[#cafa25] sm:col-span-2 lg:col-span-1"
              >
                <span>Start a build</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out of {user.fullName || user.username}
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      <main>
        <section className="home-hero overflow-hidden bg-[#10110d] text-white">
          <div className="grid lg:min-h-[min(760px,calc(100svh-76px))] lg:grid-cols-[44%_56%]">
            <div className="home-reveal relative z-10 flex items-center px-5 py-16 sm:px-8 sm:py-20 lg:py-16 lg:pl-[max(7.5vw,3rem)] lg:pr-8" data-home-reveal="left">
              <div className="max-w-[570px]">
              <p className="mb-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#d8ff43]">
                <span className="h-px w-10 bg-[#d8ff43]" />
                Your build. Actually yours.
              </p>
              <h1 className="max-w-[760px] text-[clamp(3.2rem,6.4vw,5.1rem)] font-semibold leading-[0.91] tracking-[-0.075em]">
                Built around<br />
                <span className="text-[#d8ff43]">how you play.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                Tell us what you play, create, and spend. BuildO turns it into a compatible PC that makes sense—no jargon, no guesswork.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigateTo('configurator')}
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#d8ff43] px-7 text-sm font-bold text-[#171910] transition hover:bg-[#cafa25] focus:outline-none focus:ring-2 focus:ring-[#d8ff43] focus:ring-offset-2 focus:ring-offset-[#10110d]"
                >
                  Find my perfect PC <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('how')}
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  See how it works
                </button>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/65">
                {['Compatibility checked', 'Real-time pricing', 'Built for your games'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d8ff43] text-[#171910]"><Check className="h-3 w-3" /></span>
                    {item}
                  </span>
                ))}
              </div>
              </div>
            </div>

            <div className="home-reveal home-hero-visual relative min-h-[360px] overflow-hidden bg-[#151711] sm:min-h-[480px] lg:min-h-[620px]" data-home-reveal="right">
              <img
                src="/desk-setup.jpg"
                alt="A custom gaming PC and dual-monitor workstation"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#10110d]/40 via-transparent to-black/10" />
              <div className="home-hero-catalog absolute left-5 top-5 rounded-2xl border border-white/15 bg-[#10110d]/80 p-4 backdrop-blur-md sm:left-7 sm:top-7">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">Curated builds</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-white">{loading ? '—' : presets.length}</p>
              </div>
              <div className="home-hero-confidence absolute bottom-5 right-5 w-[220px] rounded-2xl border border-white/10 bg-[#10110d]/90 p-5 text-white shadow-2xl backdrop-blur-md sm:bottom-7 sm:right-7 sm:w-[265px]">
                <p className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">
                  Build confidence <span className="h-2 w-2 rounded-full bg-[#d8ff43] shadow-[0_0_16px_#d8ff43]" />
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.06em]">100<span className="ml-1 text-[#d8ff43]">%</span></p>
                <p className="mt-1 text-xs text-white/55">compatible</p>
              </div>
              <div className="home-hero-image-glow pointer-events-none absolute inset-y-0 left-0 w-24" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section aria-label="BuildO highlights" className="home-stats border-y border-white/10 bg-white/[0.015]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 px-5 py-2 sm:px-8 md:grid-cols-4 lg:px-12">
            {[
              { value: '8', label: 'Part categories' },
              { value: componentCount === null ? '—' : componentCount.toLocaleString('en-IN'), label: 'Catalog components' },
              { value: '0', label: 'Compatibility surprises' },
              { value: 'Live', label: 'FPS estimates' },
            ].map((stat, index) => (
              <div key={stat.label} className={`home-reveal px-4 py-7 sm:px-7 sm:py-9 ${index % 2 ? 'border-l border-white/10 md:border-l' : ''} ${index > 1 ? 'border-t border-white/10 md:border-t-0' : ''} ${index === 2 ? 'md:border-l' : ''}`} data-home-reveal="up" style={{ '--home-reveal-delay': `${index * 70}ms` }}>
                <p className="text-3xl font-semibold leading-none tracking-[-0.06em] text-white sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45 sm:text-[11px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="home-section home-how scroll-mt-24 py-12 sm:py-16">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div className="home-reveal" data-home-reveal="left">
                <h2 className="max-w-2xl text-4xl font-semibold leading-[0.98] tracking-[-0.07em] sm:text-6xl">
                  Less research.<br />Better decisions.
                </h2>
              </div>
              <p className="home-reveal max-w-xl text-sm leading-7 text-white/55 lg:justify-self-end lg:text-base" data-home-reveal="right">
                BuildO handles the technical checks behind the scenes, so you can focus on the experience you want in front of the screen.
              </p>
            </div>

            <div className="mt-9 grid border-y border-white/10 sm:grid-cols-3">
              {PROCESS_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                <article key={step.number} className={`home-reveal py-7 sm:px-6 sm:py-9 lg:px-9 ${index > 0 ? 'border-t border-white/10 sm:border-l sm:border-t-0' : ''}`} data-home-reveal="up" style={{ '--home-reveal-delay': `${index * 90}ms` }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold tracking-[0.2em] text-white/40">/ {step.number}</p>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.045] text-[#d8ff43]"><Icon className="h-5 w-5" /></span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">{step.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/50">{step.description}</p>
                </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="paths" className="home-section home-paths scroll-mt-24 py-12 sm:py-16">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="home-reveal max-w-2xl" data-home-reveal="left">
              <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.07em] sm:text-6xl">Start where you’re comfortable.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
                Full control or a fast recommendation. Both routes end with a compatible, balanced PC.
              </p>
            </div>

            <div className="mt-9 grid gap-5 lg:grid-cols-2">
              {BUILD_PATHS.map((path, index) => {
                const Icon = path.icon;
                return (
                  <article key={path.number} className={`home-path-card home-reveal relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[2rem] p-7 sm:p-10 ${index === 0 ? 'home-path-card-dark text-white' : 'home-path-card-lime text-[#171910]'}`} data-home-reveal={index === 0 ? 'left' : 'right'} style={{ '--home-reveal-delay': `${index * 100}ms` }}>
                    <div className={`pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl ${index === 0 ? 'bg-[#d8ff43]/[0.08]' : 'bg-black/[0.08]'}`} />
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${index === 0 ? 'bg-[#d8ff43] text-[#171910]' : 'bg-[#10110d] text-[#d8ff43]'}`}><Icon className="h-6 w-6" /></span>
                        <span className={`text-[10px] font-semibold tracking-[0.16em] ${index === 0 ? 'text-white/40' : 'text-[#171910]/45'}`}>PATH / {path.number}</span>
                      </div>
                      <p className={`mt-8 text-[10px] font-bold uppercase tracking-[0.2em] ${index === 0 ? 'text-[#d8ff43]' : 'text-[#171910]/65'}`}>{path.eyebrow}</p>
                      <h3 className="mt-4 max-w-md text-3xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-5xl">{path.title}</h3>
                      <p className={`mt-5 max-w-lg text-sm leading-7 ${index === 0 ? 'text-white/60' : 'text-[#171910]/65'}`}>{path.description}</p>
                      <ul className="mt-7 space-y-3">
                        {path.features.map((feature) => (
                          <li key={feature} className={`flex items-center gap-3 text-xs sm:text-sm ${index === 0 ? 'text-white/75' : 'text-[#171910]/75'}`}>
                            <Check className={`h-4 w-4 flex-shrink-0 ${index === 0 ? 'text-[#d8ff43]' : 'text-[#171910]'}`} />{feature}
                          </li>
                        ))}
                      </ul>
                      <div className={`home-path-photo relative mt-7 flex h-28 items-end overflow-hidden rounded-2xl border ${index === 0 ? 'border-white/10' : 'border-black/10'}`}>
                        <img
                          src={path.image}
                          alt={path.imageLabel}
                          loading="lazy"
                          decoding="async"
                          className="home-path-photo-image absolute inset-0 h-full w-full object-cover"
                        />
                        <div className={`absolute inset-0 ${index === 0 ? 'home-path-photo-shade-dark' : 'home-path-photo-shade-lime'}`} />
                        <span className={`relative z-10 px-4 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] ${index === 0 ? 'text-white/80' : 'text-[#171910]/80'}`}>
                          {path.imageCaption}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => path.onChoose({ setActivePage })}
                      className={`relative mt-6 inline-flex min-h-14 items-center justify-between rounded-full px-6 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#d8ff43] focus:ring-offset-2 ${index === 0 ? 'border border-white/20 text-white hover:border-[#d8ff43]/70 hover:text-[#d8ff43] focus:ring-offset-[#151711]' : 'bg-[#10110d] text-white hover:bg-[#202219] focus:ring-offset-[#d8ff43]'}`}
                    >
                      {path.cta}<ArrowRight className="h-4 w-4" />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="builds" className="home-section home-builds scroll-mt-24 py-12 sm:py-16">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="home-reveal" data-home-reveal="left">
                <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.07em] sm:text-6xl">Builds with a purpose.</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">Choose a balanced preset and load it straight into the builder to make it your own.</p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('presets')}
                className="home-reveal inline-flex items-center gap-2 self-start rounded-full border border-white/20 px-5 py-3 text-xs font-bold text-white transition hover:border-[#d8ff43]/70 hover:bg-white/5 sm:self-auto"
                data-home-reveal="right"
              >
                Browse all presets <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-2" aria-label="Loading preset builds">
                {[0, 1].map((index) => (
                  <div key={index} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151711]">
                    <div className="aspect-[1.45] animate-pulse bg-white/10" />
                    <div className="space-y-3 p-7"><div className="h-6 w-2/5 animate-pulse rounded bg-white/10" /><div className="h-4 w-4/5 animate-pulse rounded bg-white/10" /></div>
                  </div>
                ))}
              </div>
            ) : presets.length > 0 ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {presets.slice(0, 2).map((preset, index) => (
                  <PresetCard key={preset.id ?? preset.name ?? index} preset={preset} index={index} onLoad={loadPreset} />
                ))}
              </div>
            ) : (
              <div className="home-reveal mt-8 rounded-[1.75rem] border border-white/10 bg-[#151711] px-6 py-10 text-center" data-home-reveal="up">
                <p className="text-lg font-semibold text-white">{presetError ? 'Preset builds are temporarily unavailable.' : 'Preset builds are being prepared.'}</p>
                <p className="mt-2 text-sm text-white/55">You can still build a PC from the ground up.</p>
                <button type="button" onClick={() => navigateTo('configurator')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d8ff43] px-5 py-3 text-sm font-bold text-[#171910] hover:bg-[#cafa25]">
                  Open custom builder <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="home-section home-cta px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-12">
          <div className="home-reveal mx-auto flex max-w-[1320px] flex-col gap-6 rounded-[2rem] border border-white/10 bg-[#151711] p-7 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-12" data-home-reveal="up">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.07em] sm:text-6xl">Stop comparing.<br />Start building.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">Your next PC starts with the parts that fit your life and your budget.</p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('configurator')}
              className="inline-flex min-h-14 items-center justify-between gap-8 rounded-full bg-[#d8ff43] px-6 text-sm font-bold text-[#171910] transition hover:bg-[#cafa25]"
            >
              Build my PC <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-[#10110d] px-5 pb-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => scrollTo('top')} className="inline-flex items-center self-start text-left">
            <BuildOWordmark size="footer" />
          </button>
          <p className="max-w-sm text-xs leading-5 text-white/45">PC recommendations for people who care about the experience, not the spec-sheet headache.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/50">
            <button type="button" onClick={() => scrollTo('how')} className="transition hover:text-[#d8ff43]">How it works</button>
            <button type="button" onClick={() => navigateTo('presets')} className="transition hover:text-[#d8ff43]">Presets</button>
            {user && <button type="button" onClick={() => navigateTo(user?.role === 'ROLE_ADMIN' ? 'admin' : 'orders')} className="transition hover:text-[#d8ff43]">Orders</button>}
            {!user && <button type="button" onClick={() => navigateTo('login')} className="transition hover:text-[#d8ff43]">Sign in</button>}
            <span>© 2026 BuildO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
