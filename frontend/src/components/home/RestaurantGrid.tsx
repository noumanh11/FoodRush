'use client';

import Link from 'next/link';
import { Star, MapPin, ChefHat, ArrowRight } from 'lucide-react';
import { Restaurant } from '@/types';

const CUISINE_EMOJIS: Record<string, string> = {
  pakistani: '🍛',
  chinese: '🥡',
  italian: '🍝',
  'fast food': '🍔',
  indian: '🍛',
  mexican: '🌮',
  japanese: '🍣',
  default: '🍽️',
};

function getCuisineEmoji(cuisine?: string): string {
  if (!cuisine) return CUISINE_EMOJIS.default;
  const key = cuisine.toLowerCase();
  return CUISINE_EMOJIS[key] || CUISINE_EMOJIS.default;
}

const DEFAULT_RESTAURANT_IMAGE = '/images/restaurants/default.svg';

export default function RestaurantGrid({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((r, index) => {
        const staggerClass = `stagger-${Math.min(index + 1, 6)}`;
        const emoji = getCuisineEmoji(r.cuisine);
        const coverImage = r.imageUrl || DEFAULT_RESTAURANT_IMAGE;

        return (
          <Link
            key={r.id}
            href={`/restaurants/${r.id}`}
            className={`glass-card group hover:border-brand-500/40 animate-fade-in-up ${staggerClass} overflow-hidden hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500`}
          >
            <div className="h-56 relative overflow-hidden bg-slate-900">
              <img
                src={coverImage}
                alt={r.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-3xl drop-shadow-xl" style={{ animationDelay: `${index * 0.1}s` }}>
                  {emoji}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900/80 text-white font-medium text-xs backdrop-blur-md border border-white/10 shadow-lg">
                  {r.cuisine || 'Various'}
                </span>
              </div>
              {r.isOpen && (
                <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-emerald-500/90 text-white font-bold text-xs backdrop-blur-md shadow-lg shadow-emerald-500/20">
                  Open
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-400 bg-slate-900/90 px-4 py-2 rounded-lg backdrop-blur-md border border-brand-500/30">
                  View Menu <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
            <div className="p-5 relative">
              <h3 className="font-display font-bold text-white text-xl group-hover:text-brand-400 transition-colors mb-2">
                {r.name}
              </h3>
              {r.description && (
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{r.description}</p>
              )}
              <div className="flex items-center justify-between mt-auto text-sm">
                {r.rating && (
                  <span className="flex items-center gap-1.5 font-medium text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-md">
                    <Star size={14} className="text-amber-400" fill="currentColor" />
                    {r.rating}
                  </span>
                )}
                {r.address && (
                  <span className="flex items-center gap-1.5 text-slate-500 truncate max-w-[60%]">
                    <MapPin size={14} className="text-slate-600 shrink-0" />
                    <span className="truncate">{r.address}</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function RestaurantGridEmpty({ search }: { search: string }) {
  return (
    <div className="text-center py-20 animate-fade-in-up glass-card border-dashed border-2 border-slate-800">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
        <ChefHat size={40} className="text-slate-600" />
      </div>
      <p className="text-xl font-bold text-white mb-2">No restaurants found</p>
      {search ? (
        <p className="text-slate-400">We couldn't find any spots matching "{search}"</p>
      ) : (
        <p className="text-slate-400">There are currently no restaurants available.</p>
      )}
    </div>
  );
}
