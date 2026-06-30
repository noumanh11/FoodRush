'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ChefHat, LayoutDashboard, LogOut, User, Menu, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useCart } from '@/context/useCart';
import toast from 'react-hot-toast';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
 const { user, logout } = useAuth();
 const { itemCount } = useCart();
 const router = useRouter();
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 const handleLogout = async () => {
 await logout();
 toast.success('Logged out');
 setMobileMenuOpen(false);
 router.push('/auth');
 };

 const dashboardHref =
 user?.role === 'admin'
 ? '/admin'
 : user?.role === 'restaurant'
 ? '/dashboard'
 : '/my-orders';

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center group-hover:scale-105 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-300">
              <ChefHat size={20} className="text-white"/>
            </div>
            <span className="font-display font-bold text-2xl text-foreground transition-colors group-hover:text-brand-400">
              Food<span className="text-brand-400 group-hover:text-amber-400 transition-colors">Rush</span>
            </span>
          </Link>

          {/* Nav links (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/#restaurants" className="btn-ghost">Restaurants</Link>
            {user && (
              <>
                <Link href="/chatbot" className="btn-ghost flex items-center gap-2 text-brand-400 font-semibold hover:text-brand-500">
                  <Sparkles size={16} />
                  AI Chef
                </Link>
                <Link href={dashboardHref} className="btn-ghost flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  {user.role === 'admin' ? 'Admin' : user.role === 'restaurant' ? 'Dashboard' : 'My Orders'}
                </Link>
              </>
            )}
          </div>

          {/* Right side (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user?.role === 'user' && (
              <Link
                href="/cart"
                className="relative btn-ghost flex items-center gap-2"
              >
                <div className="relative">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground bg-secondary/80 px-3 py-1.5 rounded-full border border-border">
                  <User size={14} className="text-brand-400"/>
                  {user.name}
                </span>
                <button onClick={handleLogout} className="btn-ghost !px-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <Link href="/auth" className="btn-ghost">Log in</Link>
                <Link href="/auth" className="btn-primary">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            {user?.role === 'user' && (
              <Link href="/cart" className="relative text-muted-foreground hover:text-foreground transition-colors p-2">
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-border bg-background/70 p-2 text-foreground transition-colors hover:text-brand-400"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full border-b border-border bg-background/95 p-4 shadow-2xl backdrop-blur-xl z-40">
          <div className="flex flex-col gap-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-foreground transition-colors hover:bg-secondary hover:text-brand-400">
              Restaurants
            </Link>
            {user && (
              <>
                <Link href="/chatbot" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-brand-400 font-semibold hover:bg-secondary">
                  <Sparkles size={18} />
                  AI Chef
                </Link>
                <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-foreground transition-colors hover:bg-secondary hover:text-brand-400">
                  <LayoutDashboard size={18} />
                  {user.role === 'admin' ? 'Admin Dashboard' : user.role === 'restaurant' ? 'Restaurant Dashboard' : 'My Orders'}
                </Link>
              </>
            )}
            
            <div className="my-2 h-px bg-border" />
            
            {user ? (
              <>
                <div className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                  <User size={18} /> {user.name}
                </div>
                <button onClick={handleLogout} className="px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-secondary text-center">Log in</Link>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
 );
}