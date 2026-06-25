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
    <section className="mb-24">
      <div className="text-center mb-16 animate-fade-in-up">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-6">
          <span className="animate-pulse">🌟</span> Why FoodRush?
        </span>
        <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Everything you need to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">order smarter</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          From browsing to delivery — enjoy a seamless experience built for true food lovers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`glass-card p-6 flex items-center gap-4 animate-fade-in-up ${['stagger-1', 'stagger-2', 'stagger-3'][i]} hover:-translate-y-1 transition-transform duration-300`}
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center text-2xl shadow-inner border border-slate-700/50" style={{ animationDelay: `${i * 0.2}s` }}>
              {stat.emoji}
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-medium mb-1">{stat.label}</p>
              <p className="font-display text-xl font-bold text-white flex items-center gap-2">
                <stat.icon size={18} className="text-brand-400" />
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className={`group glass-card overflow-hidden animate-fade-in-up ${feature.delay} hover:border-brand-500/30 transition-all duration-500`}
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className={`absolute top-4 left-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl`}>
                <feature.icon size={24} className={feature.iconColor} />
              </div>
            </div>
            <div className="p-6 relative">
              <div className="absolute -top-12 right-6 w-16 h-16 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-3xl shadow-xl shadow-black/50 rotate-3 group-hover:-rotate-3 transition-transform duration-500">
                {feature.emoji}
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-brand-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-base leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
