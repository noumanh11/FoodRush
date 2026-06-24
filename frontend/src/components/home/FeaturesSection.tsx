'use client';

import {
  Truck,
  Bot,
  ShieldCheck,
  Clock,
  UtensilsCrossed,
  MapPin,
} from 'lucide-react';

const FEATURES = [
  {
    icon: UtensilsCrossed,
    emoji: '🍱',
    title: 'Curated Menus',
    description: 'Explore hand-picked dishes from local restaurants with photos, prices, and categories.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=240&fit=crop',
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    delay: 'stagger-1',
  },
  {
    icon: Truck,
    emoji: '🚀',
    title: 'Fast Delivery',
    description: 'Place orders in seconds and track status from pending to delivered in real time.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=240&fit=crop',
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    delay: 'stagger-2',
  },
  {
    icon: Bot,
    emoji: '🤖',
    title: 'AI Food Discovery',
    description: 'Ask our chatbot what to eat — it searches menus and recommends dishes instantly.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a7ae74?w=400&h=240&fit=crop',
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    delay: 'stagger-3',
  },
  {
    icon: ShieldCheck,
    emoji: '✨',
    title: 'Secure & Simple',
    description: 'Safe login, role-based access, and a smooth checkout without payment complexity.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=240&fit=crop',
    color: 'from-amber-500/20 to-amber-600/5',
    iconColor: 'text-amber-400',
    delay: 'stagger-4',
  },
];

const STATS = [
  { icon: Clock, emoji: '⏱️', label: 'Quick ordering', value: '< 2 min' },
  { icon: MapPin, emoji: '📍', label: 'Local spots', value: 'Near you' },
  { icon: UtensilsCrossed, emoji: '🍜', label: 'Fresh menus', value: 'Daily' },
];

export default function FeaturesSection() {
  return (
    <section className="mb-14">
      <div className="text-center mb-10 animate-fade-in-up">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4">
          <span>🌟</span> Why FoodRush?
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
          Everything you need to{' '}
          <span className="text-gradient">order smarter</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          From browsing to delivery — enjoy a delightful experience with icons, visuals, and tools built for food lovers. 🎉
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`glass-card p-4 flex items-center gap-3 animate-fade-in-up ${['stagger-1', 'stagger-2', 'stagger-3'][i]}`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl animate-bounce-soft" style={{ animationDelay: `${i * 0.2}s` }}>
              {stat.emoji}
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="font-display font-bold text-white flex items-center gap-1.5">
                <stat.icon size={14} className="text-brand-400" />
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className={`group card food-card-hover overflow-hidden animate-fade-in-up ${feature.delay}`}
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className={`absolute top-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} backdrop-blur-sm border border-white/10 flex items-center justify-center`}>
                <feature.icon size={20} className={feature.iconColor} />
              </div>
              <span className="absolute top-3 right-3 text-2xl animate-float-slow">{feature.emoji}</span>
            </div>
            <div className="p-5">
              <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-brand-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
