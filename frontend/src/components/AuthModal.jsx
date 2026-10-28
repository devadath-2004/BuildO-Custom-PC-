import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import BuildOWordmark from './BuildOWordmark';
import { X, Lock, Mail, User as UserIcon, Shield, ArrowRight } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const { setUser, showNotification } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await apiClient.login({ usernameOrEmail: username, password });
        apiClient.setToken(res.token);
        setUser(res);
        showNotification(`Welcome back, ${res.fullName || res.username}!`, 'success');
        onClose();
      } else {
        const res = await apiClient.register({ username, email, password, fullName, phone, address });
        apiClient.setToken(res.token);
        setUser(res);
        showNotification(`Account created successfully! Welcome, ${res.fullName}!`, 'success');
        onClose();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userType) => {
    setLoading(true);
    try {
      const credentials = userType === 'admin'
        ? { usernameOrEmail: 'admin', password: 'admin123' }
        : { usernameOrEmail: 'customer', password: 'customer123' };

      const res = await apiClient.login(credentials);
      apiClient.setToken(res.token);
      setUser(res);
      showNotification(`Logged in as demo ${userType}!`, 'success');
      onClose();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase font-mono font-semibold tracking-wider text-cyan-400">
              <BuildOWordmark size="label" />
              Identity
            </span>
            <h3 className="text-lg font-bold text-white">
              {isLogin ? 'Sign In to Your Account' : 'Create a New Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="p-4 bg-dark-950/70 border-b border-slate-800">
          <span className="block text-[11px] font-semibold text-slate-400 mb-2 font-mono uppercase">
            ⚡ Quick Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/40 text-xs font-semibold transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/40 text-xs font-semibold transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              Demo Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username or Email
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username or email"
                className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-3.5 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
          >
            {loading ? (
              <div className="animate-spin w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-cyan-400 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up now" : 'Already registered? Sign in instead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
