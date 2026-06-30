'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Store, MessageCircle, Sparkles } from 'lucide-react';
import { Restaurant } from '@/types';
import { restaurantsApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
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
    <div className="relative overflow-hidden transition-colors duration-300">
      {showLanding && <LandingOverlay onComplete={handleLandingComplete} />}

      <div className="fixed inset-0 bg-mesh pointer-events-none opacity-40"/>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"/>

      <div
        className={`max-w-7xl mx-auto px-4 py-12 sm:py-20 relative transition-all duration-1000 ${
          contentReady || !showLanding ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Hero */}
        <section className="text-center mb-16 relative z-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-4 py-2 text-sm font-medium text-brand-500 shadow-xl shadow-brand-500/5 backdrop-blur-md transition-colors dark:text-brand-400">
            <Sparkles size={16} className="text-amber-400 animate-pulse"/>
            <span>Discover the best local flavors</span>
          </div>

          <h1 className="mb-6 font-display text-5xl font-extrabold tracking-tight text-foreground transition-colors sm:text-6xl lg:text-7xl animate-fade-in-up">
            Craving something <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">extraordinary?</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground transition-colors sm:text-xl animate-fade-in-up stagger-2">
            From hidden gems to local favorites, find the perfect meal for any moment. Order directly or ask our AI to recommend something new.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-10 animate-fade-in-up stagger-3">
            {['🍛 Biryani', '🍕 Pizza', '🍔 Burgers', '🍣 Sushi', '🥗 Healthy'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearch(tag.split(' ')[1])}
                className="rounded-full border border-border bg-card/85 px-5 py-2.5 text-sm font-medium text-foreground shadow-md transition-all hover:border-brand-500/50 hover:bg-secondary hover:text-brand-500 active:scale-95"
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
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/30 via-amber-500/30 to-rose-500/30 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"/>
            <div className="relative flex items-center rounded-2xl border border-border bg-card/90 p-2 shadow-2xl backdrop-blur-xl">
              <div className="pl-4 pr-2 text-muted-foreground transition-colors group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400">
                <Search size={22} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for restaurants, cuisines, or dishes..."
                className="w-full border-none bg-transparent px-2 py-3.5 text-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0 "
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
              <h2 className="flex items-center gap-3 font-display text-3xl font-bold text-foreground transition-colors">
                <Store size={26} className="text-brand-400"/>
                Featured Restaurants
              </h2>
              <p className="mt-2 text-lg text-muted-foreground transition-colors">
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
    </div>
  );
}
