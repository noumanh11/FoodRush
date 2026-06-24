'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ChefHat size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            Food<span className="text-brand-400">Rush</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {tab === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <div className="card p-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-800 p-1 mb-6">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
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
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" required value={form.email} onChange={set('email')}
                    className="input pl-10" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                    className="input pl-10 pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="label">I am a…</label>
                <div className="flex gap-3">
                  {(['user', 'restaurant'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        role === r
                          ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {r === 'user' ? '🍽 Customer' : '🏪 Restaurant'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" required value={form.name} onChange={set('name')}
                    className="input pl-10" placeholder="Your name" />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" required value={form.email} onChange={set('email')}
                    className="input pl-10" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPass ? 'text' : 'password'} required minLength={6} value={form.password} onChange={set('password')}
                    className="input pl-10 pr-10" placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Phone <span className="text-slate-600">(optional)</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="tel" value={form.phone} onChange={set('phone')}
                    className="input pl-10" placeholder="+92 300 0000000" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Admin account is pre-seeded — contact your administrator.
        </p>
      </div>
    </div>
  );
}