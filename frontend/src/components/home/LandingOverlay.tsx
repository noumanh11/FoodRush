'use client';

import { useEffect, useState } from 'react';
import { ChefHat, Sparkles } from 'lucide-react';

const FOOD_EMOJIS = ['🍕', '🍔', '🍣', '🌮', '🍜', '🥗', '🍰', '🍩'];

export default function LandingOverlay({ onComplete }: { onComplete: () => void }) {
 const [exiting, setExiting] = useState(false);
 const [visible, setVisible] = useState(true);

 useEffect(() => {
 // Disable body scrollbar during landing animation to prevent vertical scrolling
 document.body.style.overflow = 'hidden';

 const timer = setTimeout(() => setExiting(true), 400);
 const hideTimer = setTimeout(() => {
 setVisible(false);
 onComplete();
 document.body.style.overflow = '';
 }, 1200);

 return () => {
 clearTimeout(timer);
 clearTimeout(hideTimer);
 document.body.style.overflow = '';
 };
 }, [onComplete]);

 if (!visible) return null;

 return (
 <div
 className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 ${
 exiting ? 'animate-landing-exit' : ''
 }`}
 >
 <div className="absolute inset-0 bg-mesh"/>
 <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl animate-pulse-glow"/>
 <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl animate-float-slow"/>

 <div className="relative text-center px-6">
 <div className="flex justify-center gap-3 mb-8">
 {FOOD_EMOJIS.map((emoji, i) => (
 <span
 key={emoji}
 className="text-2xl sm:text-3xl animate-bounce-soft"
 style={{ animationDelay: `${i * 0.12}s`}}
 >
 {emoji}
 </span>
 ))}
 </div>

 <div className="animate-scale-in flex flex-col items-center">
 <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-brand-500/40 animate-pulse-glow">
 <ChefHat size={40} className="text-white"/>
 </div>
 <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-2">
 Food<span className="shimmer-text">Rush</span>
 </h1>
 <p className="text-muted-foreground flex items-center gap-2 animate-fade-in-up stagger-2">
 <Sparkles size={16} className="text-brand-400"/>
 Delicious food, delivered fast
 </p>
 </div>

 <div className="mt-10 flex justify-center gap-1.5">
 {[0, 1, 2].map((i) => (
 <div
 key={i}
 className="w-2 h-2 rounded-full bg-brand-500 animate-bounce-soft"
 style={{ animationDelay: `${i * 0.15}s`}}
 />
 ))}
 </div>
 </div>
 </div>
 );
}
