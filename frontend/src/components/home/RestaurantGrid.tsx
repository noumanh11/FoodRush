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

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop',
];

export default function RestaurantGrid({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((r, index) => {
        const staggerClass = `stagger-${Math.min(index + 1, 6)}`;
        const placeholderImg = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
        const emoji = getCuisineEmoji(r.cuisine);

        return (
          <Link
            key={r.id}
            href={`/restaurants/${r.id}`}
            className={`card group food-card-hover animate-fade-in-up ${staggerClass}`}
          >
            <div className="h-44 relative overflow-hidden">
              <img
                src={r.imageUrl || placeholderImg}
                alt={r.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-2xl animate-bounce-soft" style={{ animationDelay: `${index * 0.1}s` }}>
                  {emoji}
                </span>
                <span className="badge bg-brand-500/90 text-white border-0 text-[10px] backdrop-blur-sm">
                  {r.cuisine || 'Various'}
                </span>
              </div>
              {r.isOpen && (
                <span className="absolute top-3 right-3 badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] backdrop-blur-sm">
                  Open now
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                  View menu <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-display font-bold text-white text-lg group-hover:text-brand-400 transition-colors">
                {r.name}
              </h3>
              {r.description && (
                <p className="text-slate-500 text-xs mt-1 line-clamp-2">{r.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                {r.rating && (
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    {r.rating}
                  </span>
                )}
                {r.address && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={12} className="text-brand-400 shrink-0" />
                    {r.address}
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
    <div className="text-center py-16 animate-fade-in-up">
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center animate-float">
        <ChefHat size={40} className="text-slate-600" />
      </div>
      <p className="text-lg text-slate-400">No restaurants found</p>
      {search && <p className="text-sm mt-1 text-slate-500">Try a different search term 🔍</p>}
    </div>
  );
}
