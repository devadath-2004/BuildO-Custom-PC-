import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound,
  LoaderCircle, Lock, Mail, MailCheck, RefreshCw, ShieldCheck, Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import useGestures from '../hooks/useGestures';
import BuildOWordmark from '../components/BuildOWordmark';

const inputClass = 'w-full rounded-xl border border-[#d9d8cd] bg-white px-4 py-3 text-sm text-[#171910] placeholder:text-[#96978e] outline-none transition duration-200 focus:border-[#829c12] focus:ring-4 focus:ring-[#d8ff43]/35 disabled:cursor-not-allowed disabled:bg-[#f0efe8]';

function FieldLabel({ children }) {
  return <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#62645b]">{children}</label>;
}

export default function LoginPage() {
  const { setUser, setActivePage, showNotification } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [imageScale, setImageScale] = useState(1);
  const containerRef = useRef(null);

  function handleSwitchTab(loginTab) {
    setIsLogin(loginTab);
    setStep('form');
    setOtp('');
    setDevOtp('');
  }

  useGestures(containerRef, {
    onPinch: (scale) => setImageScale((current) => Math.min(Math.max(current * scale, 0.9), 1.15)),
    onSwipe: (direction) => {
      if (step !== 'form') return;
      if (direction === 'left') handleSwitchTab(false);
      if (direction === 'right') handleSwitchTab(true);
    },
  });

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const response = await apiClient.login({ usernameOrEmail: username, password });
        apiClient.setToken(response.token);
        setUser(response);
        showNotification(`Welcome back, ${response.fullName || response.username}!`, 'success');
        setActivePage(response.role === 'ROLE_ADMIN' ? 'admin' : 'home');
        return;
      }

      if (step === 'form') {
        const response = await apiClient.sendOtp({ username, email, password, fullName });
        setDevOtp(response.devOtp || '');
        setOtp('');
        setCountdown(60);
        setStep('otp');
        showNotification(
          response.devOtp
            ? 'Email delivery is disabled. Use the local development code shown below.'
            : `Verification email sent to ${email}`,
          'success',
        );
        return;
      }

      if (!otp || otp.trim().length < 6) {
        showNotification('Please enter the full 6-digit verification code.', 'error');
        return;
      }
      const response = await apiClient.verifyOtp({ email, otp: otp.trim() });
      apiClient.setToken(response.token);
      setUser(response);
      showNotification(`Account verified! Welcome to BuildO, ${response.fullName}!`, 'success');
      setActivePage('home');
    } catch (error) {
      showNotification(error.message || 'Authentication failed. Please verify your details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    try {
      const response = await apiClient.resendOtp(email);
      setDevOtp(response.devOtp || '');
      setCountdown(60);
      showNotification(
        response.devOtp
          ? 'Email delivery is disabled. Use the new local development code shown below.'
          : `A fresh verification email was sent to ${email}`,
        'success',
      );
    } catch (error) {
      showNotification(error.message || 'Failed to resend code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const title = isLogin ? 'Welcome back.' : step === 'otp' ? 'Check your inbox.' : 'Make it yours.';
  const intro = isLogin
    ? 'Sign in to pick up your build, parts list, and orders.'
    : step === 'otp'
      ? `We sent a six-digit verification code to ${email}.`
      : 'Save your builds, compare compatible parts, and check out when you are ready.';

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-[#10110d] font-sans text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="login-grid absolute inset-0 opacity-65" />
        <img
          src="/desk-setup.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.12] transition-transform duration-500"
          style={{ transform: `scale(${imageScale})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_16%,rgba(216,255,67,0.15),transparent_27%),radial-gradient(circle_at_87%_84%,rgba(110,136,255,0.12),transparent_30%),linear-gradient(115deg,rgba(16,17,13,0.95),rgba(16,17,13,0.73))]" />
        <div className="animate-login-orb absolute -left-28 top-[24%] h-64 w-64 rounded-full bg-[#d8ff43]/10 blur-3xl" />
      </div>

      <header className="relative z-20 mx-auto flex w-full max-w-[1320px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="inline-flex items-center text-left transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#d8ff43] focus:ring-offset-2 focus:ring-offset-[#10110d]"
          aria-label="Go to BuildO home"
        >
          <BuildOWordmark size="nav" />
        </button>
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-[#d8ff43]/60 hover:text-[#d8ff43] focus:outline-none focus:ring-2 focus:ring-[#d8ff43]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to home
        </button>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-[1200px] items-stretch gap-6 px-5 pb-10 pt-4 sm:px-8 sm:pb-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(430px,0.82fr)] lg:gap-8 lg:px-12 lg:pb-16 lg:pt-10">
        <aside className="animate-login-side relative hidden min-h-[650px] overflow-hidden rounded-[2rem] border border-white/15 bg-[#191b14] p-9 shadow-[0_30px_90px_rgba(0,0,0,0.32)] lg:flex lg:flex-col">
          <img src="/pc-setup.jpg" alt="Custom gaming PC setup" className="absolute inset-0 h-full w-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,17,13,0.18),rgba(16,17,13,0.82)_64%,rgba(16,17,13,0.98))]" />
          <div className="relative flex items-center justify-between">
            <span className="rounded-full border border-[#d8ff43]/50 bg-[#10110d]/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e4ff8e] backdrop-blur-sm">Built around you</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#d8ff43] backdrop-blur-sm"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>
          </div>
          <div className="relative mt-auto">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#d8ff43]">YOUR BUILD. ACTUALLY YOURS.</p>
            <h1 className="max-w-md text-5xl font-semibold leading-[0.96] tracking-[-0.065em] text-white">The right parts, before you buy.</h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/70">BuildO keeps compatibility, price, and performance in one clear view while you create a PC that fits how you play.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-[#10110d]/70 p-4 backdrop-blur-md">
                <ShieldCheck className="h-5 w-5 text-[#d8ff43]" aria-hidden="true" />
                <p className="mt-4 text-xl font-semibold tracking-[-0.04em]">100%</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/55">Compatibility checked</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-[#10110d]/70 p-4 backdrop-blur-md">
                <CheckCircle2 className="h-5 w-5 text-[#d8ff43]" aria-hidden="true" />
                <p className="mt-4 text-xl font-semibold tracking-[-0.04em]">Live</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/55">Price updates</p>
              </div>
            </div>
          </div>
        </aside>

        <section
          onPointerDown={(event) => event.stopPropagation()}
          className="animate-login-panel relative overflow-hidden rounded-[2rem] border border-[#ddddd3] bg-[#f7f6ef] p-5 text-[#171910] shadow-[0_30px_90px_rgba(0,0,0,0.3)] sm:p-8 lg:p-9"
        >
          <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[6rem] bg-[#d8ff43]/35" aria-hidden="true" />
          <div className="relative">
            <div className="mb-7 flex items-center justify-between gap-4 lg:hidden">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f772f]"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />Build with confidence</div>
              <span className="rounded-lg bg-[#171910] px-2.5 py-2"><BuildOWordmark size="compact" /></span>
            </div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6f772f]">Account access</p>
            <h2 className="max-w-sm text-4xl font-semibold leading-[0.98] tracking-[-0.06em] text-[#171910] sm:text-5xl">{title}</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#686960]">{intro}</p>

            {step === 'form' && (
              <div className="mt-7 grid grid-cols-2 rounded-2xl border border-[#d9d8cd] bg-[#eeede5] p-1.5">
                <button type="button" onClick={() => handleSwitchTab(true)} aria-pressed={isLogin} className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#829c12] ${isLogin ? 'bg-[#171910] text-white shadow-sm' : 'text-[#65665d] hover:text-[#171910]'}`}>Sign in</button>
                <button type="button" onClick={() => handleSwitchTab(false)} aria-pressed={!isLogin} className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#829c12] ${!isLogin ? 'bg-[#171910] text-white shadow-sm' : 'text-[#65665d] hover:text-[#171910]'}`}>Create account</button>
              </div>
            )}

            <form key={`${isLogin}-${step}`} onSubmit={handleSubmit} className="animate-login-form mt-7 space-y-4">
              {step === 'form' ? (
                <>
                  <div>
                    <FieldLabel>{isLogin ? 'Username or email' : 'Username'}</FieldLabel>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c7d75]" aria-hidden="true" />
                      <input type="text" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder={isLogin ? 'username or email' : 'choose a username'} className={`${inputClass} pl-11`} autoComplete="username" />
                    </div>
                  </div>
                  {!isLogin && <>
                    <div>
                      <FieldLabel>Full name</FieldLabel>
                      <input type="text" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" className={inputClass} autoComplete="name" />
                    </div>
                    <div>
                      <FieldLabel>Email address</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c7d75]" aria-hidden="true" />
                        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className={`${inputClass} pl-11`} autoComplete="email" />
                      </div>
                    </div>
                  </>}
                  <div>
                    <FieldLabel>Password</FieldLabel>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c7d75]" aria-hidden="true" />
                      <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className={`${inputClass} pl-11 pr-12`} autoComplete={isLogin ? 'current-password' : 'new-password'} />
                      <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#64655d] transition hover:bg-[#eff0e8] hover:text-[#171910] focus:outline-none focus:ring-2 focus:ring-[#829c12]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="group mt-2 flex w-full items-center justify-between rounded-xl bg-[#d8ff43] px-5 py-3.5 text-sm font-bold text-[#171910] shadow-[0_14px_32px_rgba(166,202,37,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#cafa25] hover:shadow-[0_18px_38px_rgba(166,202,37,0.36)] focus:outline-none focus:ring-2 focus:ring-[#829c12] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0">
                    <span>{loading ? 'Working on it…' : isLogin ? 'Continue to BuildO' : 'Send verification code'}</span>
                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />}
                  </button>
                  <p className="pt-1 text-center text-xs text-[#74756d]">
                    {isLogin ? 'New to BuildO? ' : 'Already have an account? '}
                    <button type="button" onClick={() => handleSwitchTab(!isLogin)} className="font-bold text-[#4f6510] underline decoration-[#a1bc37] underline-offset-4 transition hover:text-[#171910] focus:outline-none focus:ring-2 focus:ring-[#829c12]">{isLogin ? 'Create an account' : 'Sign in'}</button>
                  </p>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-[#d9d8cd] bg-[#eeede5] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#171910] text-[#d8ff43]"><MailCheck className="h-4 w-4" aria-hidden="true" /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#77786f]">{devOtp ? 'Development code for' : 'Verification email sent to'}</p>
                          <p className="truncate pt-1 text-sm font-semibold text-[#171910]">{email}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setStep('form')} className="shrink-0 text-xs font-bold text-[#4f6510] underline underline-offset-4 transition hover:text-[#171910] focus:outline-none focus:ring-2 focus:ring-[#829c12]">Change</button>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Six-digit code</FieldLabel>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f772f]" aria-hidden="true" />
                      <input type="text" inputMode="numeric" maxLength={6} autoFocus value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="••••••" className={`${inputClass} min-h-[58px] pl-12 pr-4 text-center font-mono text-2xl tracking-[0.38em] placeholder:tracking-[0.3em]`} aria-label="Six-digit verification code" />
                    </div>
                    {devOtp && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#b8ca64] bg-[#f3f8da] px-3 py-2.5 text-xs text-[#3f500e]">
                      <span>Development code: <strong className="font-mono text-sm text-[#171910]">{devOtp}</strong></span>
                      <button type="button" onClick={() => setOtp(devOtp)} className="rounded-lg border border-[#a8bf43] bg-white px-2.5 py-1 font-bold transition hover:bg-[#d8ff43] focus:outline-none focus:ring-2 focus:ring-[#829c12]">Fill code</button>
                    </div>}
                  </div>
                  <div className="flex items-center justify-between gap-4 px-1 text-xs text-[#72736b]">
                    <span>Didn’t receive it?</span>
                    {countdown > 0
                      ? <span>Resend in <strong className="font-mono text-[#4f6510]">{countdown}s</strong></span>
                      : <button type="button" onClick={handleResendOtp} disabled={loading} className="inline-flex items-center gap-1.5 font-bold text-[#4f6510] underline underline-offset-4 transition hover:text-[#171910] focus:outline-none focus:ring-2 focus:ring-[#829c12] disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Resend code</button>}
                  </div>
                  <button type="submit" disabled={loading || otp.length < 6} className="group mt-2 flex w-full items-center justify-between rounded-xl bg-[#d8ff43] px-5 py-3.5 text-sm font-bold text-[#171910] shadow-[0_14px_32px_rgba(166,202,37,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#cafa25] hover:shadow-[0_18px_38px_rgba(166,202,37,0.36)] focus:outline-none focus:ring-2 focus:ring-[#829c12] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0">
                    <span>{loading ? 'Verifying your code…' : 'Verify and activate account'}</span>
                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />}
                  </button>
                  <button type="button" onClick={() => setStep('form')} className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-semibold text-[#686960] transition hover:text-[#171910] focus:outline-none focus:ring-2 focus:ring-[#829c12]"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Back to account details</button>
                </>
              )}
            </form>

            <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#deded4] pt-5 text-center text-[11px] leading-5 text-[#74756d]">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#6f772f]" aria-hidden="true" />
              Your account keeps builds, saved parts, and checkout details together.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
