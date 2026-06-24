'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Store, MessageCircle, Flame } from 'lucide-react';
import { Restaurant } from '@/types';
import { restaurantsApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import Navbar from '@/components/Navbar';
import { PageLoader } from '@/components/Spinner';
import LandingOverlay from '@/components/home/LandingOverlay';
import WelcomeBanner from '@/components/home/WelcomeBanner';
import FeaturesSection from '@/components/home/FeaturesSection';
import RestaurantGrid, { RestaurantGridEmpty } from '@/components/home/RestaurantGrid';

const FLOATING_EMOJIS = [
  { emoji: '🍕', className: 'top-[12%] left-[8%] animate-float', delay: '0s' },
  { emoji: '🍔', className: 'top-[20%] right-[10%] animate-float-slow', delay: '0.5s' },
  { emoji: '🍣', className: 'bottom-[30%] left-[5%] animate-bounce-soft', delay: '1s' },
  { emoji: '🌮', className: 'bottom-[25%] right-[8%] animate-float', delay: '0.3s' },
  { emoji: '🍜', className: 'top-[45%] right-[4%] animate-wiggle', delay: '0.7s' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLanding, setShowLanding] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  const handleLandingComplete = useCallback(() => {
    setShowLanding(false);
    setTimeout(() => setContentReady(true), 50);
  }, []);

  useEffect(() => {
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
    <div className="min-h-screen relative overflow-hidden">
      {showLanding && <LandingOverlay onComplete={handleLandingComplete} />}

      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/8 rounded-full blur-3xl pointer-events-none" />

      {FLOATING_EMOJIS.map((item) => (
        <span
          key={item.emoji}
          className={`fixed text-2xl sm:text-3xl opacity-20 pointer-events-none select-none hidden sm:block ${item.className}`}
          style={{ animationDelay: item.delay }}
        >
          {item.emoji}
        </span>
      ))}

      <Navbar />

      <div
        className={`max-w-7xl mx-auto px-4 py-8 relative transition-opacity duration-700 ${
          contentReady || !showLanding ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Hero */}
        <section className="text-center mb-10 pt-4 sm:pt-8">
          <div className="animate-fade-in-down inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-sm font-medium mb-6">
            <Flame size={14} className="animate-pulse" />
            <span>🔥 Hot deals & fresh menus daily</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in-up">
            What are you{' '}
            <span className="shimmer-text">craving</span>
            <span className="inline-block ml-2 animate-wiggle">🤤</span>
          </h1>

          <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg animate-fade-in-up stagger-2">
            Browse local restaurants, discover dishes with AI 🧠, and order your favourite meals in minutes.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6 animate-fade-in-up stagger-3">
            {['🍛 Biryani', '🍕 Pizza', '🍔 Burgers', '🍣 Sushi', '🌮 Tacos'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs text-slate-300 hover:border-brand-500/40 hover:text-brand-400 transition-all cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <WelcomeBanner />

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12 animate-fade-in-up stagger-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/30 to-amber-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or cuisines... 🔍"
                className="input pl-11 py-3.5 bg-slate-900/90 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        <FeaturesSection />

        {/* Restaurants */}
        <section>
          <div className="flex items-center justify-between mb-6 animate-fade-in-up">
            <div>
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <Store size={22} className="text-brand-400" />
                Restaurants near you
                <span className="text-lg">📍</span>
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {filtered.length} spot{filtered.length !== 1 ? 's' : ''} ready to serve you
              </p>
            </div>
          </div>

          {loading ? (
            <PageLoader />
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/40 transition-all hover:scale-110 active:scale-95 z-40 animate-pulse-glow group"
        title={user ? 'Food discovery AI' : 'Sign in to use chatbot'}
      >
        <MessageCircle size={24} className="text-white group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-bounce-soft">
          AI
        </span>
      </Link>
    </div>
  );
}
