'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Tab = 'login' | 'register';
type Role = 'user' | 'restaurant';

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [role, setRole] = useState<Role>('user');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '',
  });
  const { login, register } = useAuth();
  const router = useRouter();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const redirectAfterAuth = (userRole: string) => {
    if (userRole === 'admin') router.push('/admin');
    else if (userRole === 'restaurant') router.push('/dashboard');
    else router.push('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      redirectAfterAuth(user.role);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success('Account created!');
      redirectAfterAuth(role);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-slate-950 flex flex-col lg:flex-row lg:overflow-hidden">
      {/* Left side: Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 lg:h-screen lg:shrink-0 relative flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <img
            src="/images/auth_split_bg.png"
            alt="Gourmet food"
            className="w-full h-full object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
        </div>
        
        <div className="relative z-10 p-12">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <ChefHat size={22} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">
              Food<span className="text-brand-400">Rush</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 p-12 pb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50 backdrop-blur-md text-brand-400 text-sm font-medium mb-6">
            <span className="animate-pulse">✨</span> Premium food discovery
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            Satisfy your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">cravings</span><br/> in just a few clicks.
          </h1>
          <p className="text-slate-300 text-lg max-w-md">
            Join thousands of food lovers discovering the best local restaurants and exclusive menus around them.
          </p>
        </div>
      </div>

      {/* Right side: Auth Form — scrolls independently when register form is taller */}
      <div className="w-full lg:w-1/2 lg:h-screen lg:min-h-0 lg:overflow-y-auto relative">
        <div className="min-h-full flex items-center justify-center p-6 sm:p-12 py-10">
          <div className="absolute inset-0 bg-mesh pointer-events-none opacity-50 lg:opacity-30" />

          <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 group mx-auto mb-4">
              <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                <ChefHat size={26} className="text-white" />
              </div>
            </Link>
            <h1 className="font-display text-3xl font-bold text-white">
              Food<span className="text-brand-400">Rush</span>
            </h1>
            <p className="text-slate-400 mt-2">Sign in or create an account</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              {tab === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-400">
              {tab === 'login' ? 'Enter your details to access your account' : 'Start your culinary journey today'}
            </p>
          </div>

          <div className="glass-card p-6 sm:p-8">
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-800/80 p-1 mb-8">
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    tab === t
                      ? 'bg-brand-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    <input type="email" required value={form.email} onChange={set('email')}
                      className="input pl-12" placeholder="name@example.com" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="label mb-0">Password</label>
                    <a href="#" className="text-xs text-brand-400 hover:text-brand-300 font-medium">Forgot password?</a>
                  </div>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                      className="input pl-12 pr-12" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-4 text-base flex items-center justify-center gap-2 group">
                  {loading ? 'Signing in...' : (
                    <>
                      Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Role selector */}
                <div>
                  <label className="label">Account Type</label>
                  <div className="flex gap-3">
                    {(['user', 'restaurant'] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                          role === r
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                            : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xl mb-1">{r === 'user' ? '😋' : '🏪'}</span>
                        {r === 'user' ? 'Customer' : 'Restaurant'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Full Name</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    <input type="text" required value={form.name} onChange={set('name')}
                      className="input pl-12" placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    <input type="email" required value={form.email} onChange={set('email')}
                      className="input pl-12" placeholder="name@example.com" />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    <input type={showPass ? 'text' : 'password'} required minLength={6} value={form.password} onChange={set('password')}
                      className="input pl-12 pr-12" placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Phone <span className="text-slate-600 font-normal">(optional)</span></label>
                  <div className="relative group">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    <input type="tel" value={form.phone} onChange={set('phone')}
                      className="input pl-12" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-4 text-base flex items-center justify-center gap-2 group">
                  {loading ? 'Creating account...' : (
                    <>
                      Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          
          {/* Admin hint */}
          <div className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div className="text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300 block mb-1">Demo Access</span>
              Admin account is pre-seeded. Contact your system administrator to receive credentials if you need platform-wide access.
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
