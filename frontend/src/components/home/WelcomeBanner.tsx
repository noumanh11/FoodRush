'use client';

import { useAuth } from '@/context/useAuth';
import { Sparkles, HandMetal, ChefHat } from 'lucide-react';

const ROLE_MESSAGES: Record<string, { emoji: string; subtitle: string }> = {
 user: {
 emoji: '🍽️',
 subtitle: 'Discover amazing restaurants and order your favorites in minutes!',
 },
 restaurant: {
 emoji: '👨‍🍳',
 subtitle: 'Manage your menu and incoming orders from your dashboard.',
 },
 admin: {
 emoji: '⚡',
 subtitle: 'Monitor platform activity and manage orders across FoodRush.',
 },
};

export default function WelcomeBanner() {
 const { user, loading } = useAuth();

 if (loading) {
 return (
 <div className="glass-card mb-8 animate-pulse p-6">
 <div className="mb-2 h-6 w-48 rounded-lg bg-muted " />
 <div className="h-4 w-72 rounded-lg bg-muted " />
 </div>
 );
 }

 if (!user) {
 return (
 <div className="glass-card p-6 sm:p-8 mb-8 relative overflow-hidden animate-fade-in-up">
 <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"/>
 <div className="flex items-start gap-4">
 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 animate-float-slow">
 <span className="text-2xl">👋</span>
 </div>
 <div>
 <h2 className="mb-1 font-display text-xl font-bold text-foreground transition-colors sm:text-2xl">
 Welcome to <span className="text-gradient-warm">FoodRush</span>!
 </h2>
 <p className="max-w-xl text-sm text-muted-foreground transition-colors sm:text-base">
 Sign in to order food, track deliveries, and chat with our AI food discovery assistant.
 Browse restaurants below and start your culinary adventure! 🚀
 </p>
 </div>
 </div>
 </div>
 );
 }

 const roleInfo = ROLE_MESSAGES[user.role] || ROLE_MESSAGES.user;
 const greeting = getGreeting();

 return (
 <div className="glass-card p-6 sm:p-8 mb-8 relative overflow-hidden animate-fade-in-up border-brand-500/20">
 <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-amber-500/5"/>
 <div className="absolute -right-12 -top-12 w-40 h-40 bg-brand-500/15 rounded-full blur-3xl animate-float"/>
 <div className="absolute -left-8 bottom-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl animate-float-slow"/>

 <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30 animate-scale-in">
 <span className="text-3xl">{roleInfo.emoji}</span>
 </div>
 <div>
 <div className="flex items-center gap-2 text-brand-400 text-sm font-medium mb-1 animate-fade-in-down">
 <Sparkles size={14} />
 <span>{greeting}</span>
 </div>
 <h2 className="font-display text-2xl font-bold text-foreground transition-colors sm:text-3xl">
 Welcome back,{' '}
 <span className="text-gradient-warm">{user.name}</span>
 <HandMetal size={22} className="inline ml-1 text-amber-400 animate-wiggle"/>
 </h2>
 <p className="mt-1.5 max-w-lg text-sm text-muted-foreground transition-colors ">{roleInfo.subtitle}</p>
 </div>
 </div>

 <div className="sm:ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border animate-slide-in-right stagger-3">
 <ChefHat size={18} className="text-brand-400"/>
 <span className="text-sm capitalize text-foreground font-semibold">{user.role} account</span>
 </div>
 </div>
 </div>
 );
}

function getGreeting(): string {
 const hour = new Date().getHours();
 if (hour < 12) return 'Good morning';
 if (hour < 17) return 'Good afternoon';
 return 'Good evening';
}
