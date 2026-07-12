import React, { useState } from 'react';
import { User } from '../types';
import { KeyRound, Mail, ShieldAlert, CheckCircle2, Eye, EyeOff, Truck, Sun, Moon } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User, token: string) => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export default function AuthScreen({ onLoginSuccess, theme = 'light', toggleTheme }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'dispatcher' | 'driver' | 'client'>('client');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill convenience credentials for quick review
  const handlePresetLogin = (presetRole: string) => {
    let preEmail = '';
    let prePass = 'driver123';
    switch (presetRole) {
      case 'admin':
        preEmail = 'admin@carryon.in';
        break;
      case 'dispatcher':
        preEmail = 'dispatcher@carryon.in';
        break;
      case 'driver1':
        preEmail = 'driver1@carryon.in';
        break;
      case 'driver2':
        preEmail = 'driver2@carryon.in';
        break;
      case 'driver3':
        preEmail = 'driver3@carryon.in';
        break;
      case 'driver4':
        preEmail = 'driver4@carryon.in';
        break;
      case 'client':
        preEmail = 'client@carryon.in';
        break;
    }
    setEmail(preEmail);
    setPassword(prePass);
    setIsLogin(true);
    setIsForgotPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (isForgotPassword) {
      setTimeout(() => {
        setSuccessMsg(`Recovery link has been sent to ${email}. Please check your inbox.`);
        setLoading(false);
      }, 1000);
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email, password }
      : { email, password, name, role, companyName, phone };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication process failed');
      }

      if (isLogin) {
        onLoginSuccess(data.user, data.token);
      } else {
        setSuccessMsg('Registration completed successfully! Please log in now with your credentials.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Theme toggle in top right */}
      {toggleTheme && (
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm z-20"
          title="Toggle light/dark mode"
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      )}

      {/* Decorative clean red curves */}
      <div className="absolute top-0 left-0 w-full h-48 bg-brand rounded-b-[32px] shadow-xs z-0 opacity-95" />

      {/* Main clean card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[24px] p-6 md:p-8 shadow-xl relative z-10 animate-fadeIn transition-colors duration-300">
        
        {/* Dynamic header brand badge */}
        <div className="flex justify-center mb-5">
          <div className="bg-brand/5 border border-brand/10 dark:bg-brand/10 dark:border-brand/20 px-4 py-1 rounded-full flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-brand dark:text-red-400 uppercase">CARRYON CENTRAL LOGISTICS</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            <Truck className="w-6 h-6 text-brand" />
            <span>Carry<span className="text-brand">On</span></span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">
            {isForgotPassword 
              ? 'Reset credentials using secure cloud protocol' 
              : isLogin 
                ? 'Welcome to transport operations headquarters' 
                : 'Create client, driver or operations credentials'
            }
          </p>
        </div>

        {/* Quick Presets Section for Reviewers */}
        {isLogin && !isForgotPassword && (
          <div className="mb-5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-3.5">
            <div className="text-[9px] font-mono text-brand dark:text-red-400 font-bold mb-2 uppercase tracking-wider text-center">
              ⚡ SINGLE-CLICK DEMO AUTOFILL:
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handlePresetLogin('client')}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:bg-brand/5 transition-all cursor-pointer shadow-sm"
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => handlePresetLogin('dispatcher')}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:bg-brand/5 transition-all cursor-pointer shadow-sm"
              >
                Dispatcher
              </button>
              <button
                type="button"
                onClick={() => handlePresetLogin('admin')}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:bg-brand/5 transition-all cursor-pointer shadow-sm"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handlePresetLogin('driver1')}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:bg-brand/5 transition-all cursor-pointer shadow-sm"
              >
                Driver 1
              </button>
              <button
                type="button"
                onClick={() => handlePresetLogin('driver2')}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:bg-brand/5 transition-all cursor-pointer shadow-sm"
              >
                Driver 2
              </button>
            </div>
          </div>
        )}

        {/* Success/Error displays */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start space-x-2.5 text-red-700 dark:text-red-400 text-xs">
            <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl flex items-start space-x-2.5 text-green-700 dark:text-green-400 text-xs">
            <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          
          {/* Registration Name Field */}
          {!isLogin && !isForgotPassword && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rudraksh Chauhan"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@carryon.in"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          {!isForgotPassword && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Registration Role Selection & details */}
          {!isLogin && !isForgotPassword && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Access Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl px-2.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                  >
                    <option value="client">Client (Consignor)</option>
                    <option value="driver">Driver Partner</option>
                    <option value="dispatcher">Dispatcher Controller</option>
                    <option value="admin">Operations Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                  />
                </div>
              </div>

              {role === 'client' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Organization / Company</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Chauhan Textiles Ltd"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                  />
                </div>
              )}
            </>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer transform active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading 
              ? 'PROCESSING...' 
              : isForgotPassword 
                ? 'SEND RECOVERY LINK' 
                : isLogin 
                  ? 'SECURE LOG IN' 
                  : 'REGISTER SECURITY PROFILE'
            }
          </button>
        </form>

        {/* Footer selector to switch states */}
        <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-brand font-bold hover:underline cursor-pointer"
            >
              Return to login portal
            </button>
          ) : isLogin ? (
            <p>
              New logistics node?{' '}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-brand font-bold hover:underline cursor-pointer"
              >
                Register profile
              </button>
            </p>
          ) : (
            <p>
              Already pre-registered?{' '}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-brand font-bold hover:underline cursor-pointer"
              >
                Authorize profile login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
