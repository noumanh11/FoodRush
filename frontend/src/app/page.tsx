'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Store, MessageCircle, Flame, Sparkles } from 'lucide-react';
import { Restaurant } from '@/types';
import { restaurantsApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import Navbar from '@/components/Navbar';
import { PageLoader } from '@/components/Spinner';
import LandingOverlay from '@/components/home/LandingOverlay';
import WelcomeBanner from '@/components/home/WelcomeBanner';
import FeaturesSection from '@/components/home/FeaturesSection';
import RestaurantGrid, { RestaurantGridEmpty } from '@/components/home/RestaurantGrid';

export default function HomePage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLanding, setShowLanding] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  const handleLandingComplete = useCallback(() => {
    setShowLanding(false);
    setTimeout(() => setContentReady(true), 50);
  }, []);

  useEffect(() => {
    // Only show landing screen once per session
    const seen = sessionStorage.getItem('foodrush_landing_seen');
    if (!seen) {
      setShowLanding(true);
      sessionStorage.setItem('foodrush_landing_seen', 'true');
    } else {
      setContentReady(true);
    }

    restaurantsApi.getAll()
      .then((res) => setRestaurants(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? restaurants.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.cuisine && r.cuisine.toLowerCase().includes(search.toLowerCase())),
      )
    : restaurants;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {showLanding && <LandingOverlay onComplete={handleLandingComplete} />}

      <div className="fixed inset-0 bg-mesh pointer-events-none opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      <div
        className={`max-w-7xl mx-auto px-4 py-12 sm:py-20 relative transition-all duration-1000 ${
          contentReady || !showLanding ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Hero */}
        <section className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-md text-brand-400 text-sm font-medium mb-8 animate-fade-in-down shadow-xl shadow-brand-500/5">
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
            <span>Discover the best local flavors</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight animate-fade-in-up">
            Craving something <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">extraordinary?</span>
          </h1>

          <p className="text-slate-300 max-w-2xl mx-auto text-lg sm:text-xl animate-fade-in-up stagger-2 leading-relaxed">
            From hidden gems to local favorites, find the perfect meal for any moment. Order directly or ask our AI to recommend something new.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-10 animate-fade-in-up stagger-3">
            {['🍛 Biryani', '🍕 Pizza', '🍔 Burgers', '🍣 Sushi', '🥗 Healthy'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearch(tag.split(' ')[1])}
                className="px-5 py-2.5 rounded-full bg-slate-900/60 border border-slate-700 hover:border-brand-500/50 hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-brand-400 transition-all shadow-md active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <WelcomeBanner />

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-20 animate-fade-in-up stagger-4 relative z-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/30 via-amber-500/30 to-rose-500/30 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl">
              <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-brand-400 transition-colors">
                <Search size={22} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for restaurants, cuisines, or dishes..."
                className="w-full bg-transparent border-none px-2 py-3.5 text-slate-100 placeholder-slate-500 text-lg focus:outline-none focus:ring-0"
              />
              <button 
                className="btn-primary py-3 px-6 text-sm whitespace-nowrap hidden sm:block"
                onClick={() => document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Find Food
              </button>
            </div>
          </div>
        </div>

        <FeaturesSection />

        {/* Restaurants */}
        <section id="restaurants" className="scroll-mt-24">
          <div className="flex items-end justify-between mb-8 animate-fade-in-up">
            <div>
              <h2 className="font-display text-3xl font-bold text-white flex items-center gap-3">
                <Store size={26} className="text-brand-400" />
                Featured Restaurants
              </h2>
              <p className="text-slate-400 mt-2 text-lg">
                Explore {filtered.length} curated options ready to serve you
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-20"><PageLoader /></div>
          ) : filtered.length === 0 ? (
            <RestaurantGridEmpty search={search} />
          ) : (
            <RestaurantGrid restaurants={filtered} />
          )}
        </section>
      </div>

      {/* Chatbot FAB */}
      <Link
        href={user ? '/chatbot' : '/auth'}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-16 h-16 bg-gradient-to-br from-brand-500 to-amber-500 rounded-full flex items-center justify-center shadow-2xl shadow-brand-500/40 hover:shadow-brand-500/60 transition-all duration-300 hover:scale-110 active:scale-95 z-40 group"
        title={user ? 'Food discovery AI' : 'Sign in to use AI'}
      >
        <MessageCircle size={28} className="text-white group-hover:-mt-1 transition-all" />
        <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 border-2 border-slate-950 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-bounce-soft">
          AI
        </span>
      </Link>
    </div>
  );
}
