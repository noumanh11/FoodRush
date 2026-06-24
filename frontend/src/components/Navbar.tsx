'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ChefHat, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useCart } from '@/context/useCart';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/auth');
  };

  const dashboardHref =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'restaurant'
        ? '/dashboard'
        : '/my-orders';

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-brand-500/30 transition-all duration-300">
              <ChefHat size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white group-hover:text-brand-400 transition-colors">
              Food<span className="text-brand-400 group-hover:text-brand-300">Rush</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="btn-ghost text-sm">Restaurants</Link>
            {user && (
              <Link href={dashboardHref} className="btn-ghost text-sm flex items-center gap-1.5">
                <LayoutDashboard size={15} />
                {user.role === 'admin' ? 'Admin' : user.role === 'restaurant' ? 'Dashboard' : 'My Orders'}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user?.role === 'user' && (
              <Link
                href="/cart"
                className="relative btn-ghost flex items-center gap-1.5 text-sm"
              >
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
                <span className="hidden sm:inline">Cart</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400">
                  <User size={14} />
                  {user.name}
                </span>
                <button onClick={handleLogout} className="btn-ghost text-sm flex items-center gap-1.5">
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link href="/auth" className="btn-primary text-sm py-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}