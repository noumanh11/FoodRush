'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
 ShoppingCart,
 ArrowRight,
 ChevronUp,
 X,
 Plus,
 Minus,
} from 'lucide-react';
import { useCart } from '@/context/useCart';

interface RestaurantCartProps {
 restaurantId: string;
}

export default function RestaurantCart({ restaurantId }: RestaurantCartProps) {
 const {
 items,
 updateQuantity,
 itemCount,
 total,
 restaurantId: cartRestaurantId,
 } = useCart();
 const router = useRouter();
 const [sheetOpen, setSheetOpen] = useState(false);

 const isActive = itemCount > 0 && cartRestaurantId === restaurantId;

 useEffect(() => {
 if (!isActive) setSheetOpen(false);
 }, [isActive]);

 useEffect(() => {
 if (!sheetOpen) return;
 const prev = document.body.style.overflow;
 document.body.style.overflow = 'hidden';
 return () => {
 document.body.style.overflow = prev;
 };
 }, [sheetOpen]);

 if (!isActive) return null;

 const cartContent = (
 <>
 <div className="space-y-3 mb-5 max-h-[40vh] overflow-y-auto scrollbar-hide pr-1">
 {items.map((cartItem) => (
 <div
 key={cartItem.menuItem.id}
 className="flex items-center justify-between gap-3 text-sm"
 >
 <div className="flex-1 min-w-0">
 <p className="text-slate-200 font-medium truncate">
 {cartItem.menuItem.name}
 </p>
 <p className="text-muted-foreground text-xs mt-0.5">
 PKR {Number(cartItem.menuItem.price).toLocaleString()} each
 </p>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
 <button
 onClick={() =>
 updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)
 }
 className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
 aria-label="Decrease quantity"
 >
 <Minus size={14} />
 </button>
 <span className="w-6 text-center font-semibold text-white text-xs">
 {cartItem.quantity}
 </span>
 <button
 onClick={() =>
 updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)
 }
 className="w-7 h-7 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-400 rounded-md transition-colors"
 aria-label="Increase quantity"
 >
 <Plus size={14} />
 </button>
 </div>
 <span className="text-white font-semibold w-20 text-right">
 PKR{' '}
 {(
 Number(cartItem.menuItem.price) * cartItem.quantity
 ).toLocaleString()}
 </span>
 </div>
 </div>
 ))}
 </div>

 <div className="border-t border-slate-700/60 pt-4 space-y-2 mb-5">
 <div className="flex justify-between text-muted-foreground text-sm">
 <span>Subtotal</span>
 <span>PKR {total.toLocaleString()}</span>
 </div>
 <div className="flex justify-between text-muted-foreground text-sm">
 <span>Delivery</span>
 <span className="text-emerald-400">Free</span>
 </div>
 <div className="flex justify-between font-bold text-white pt-2">
 <span>Total</span>
 <span className="text-brand-400">PKR {total.toLocaleString()}</span>
 </div>
 </div>

 <button
 onClick={() => router.push('/cart')}
 className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
 >
 Go to Checkout
 <ArrowRight size={18} />
 </button>
 </>
 );

 return (
 <>
 {/* Desktop sidebar — only appears when cart has items */}
 <aside className="hidden lg:block w-72 xl:w-80 shrink-0 animate-slide-in-right">
 <div className="glass-card p-5 sticky top-24 border-slate-700/50 shadow-xl">
 <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
 <ShoppingCart size={20} className="text-brand-400"/>
 Your Order
 <span className="ml-auto text-xs font-medium text-muted-foreground bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
 {itemCount} {itemCount === 1 ? 'item' : 'items'}
 </span>
 </h3>
 {cartContent}
 </div>
 </aside>

 {/* Mobile floating bar */}
 <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 flex justify-center pointer-events-none">
 <button
 onClick={() => setSheetOpen(true)}
 className="pointer-events-auto w-full max-w-md flex items-center gap-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl px-4 py-3 shadow-2xl shadow-black/40 active:scale-[0.98] transition-transform"
 aria-label="View cart"
 >
 <span className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-brand-500/30">
 <ShoppingCart size={18} className="text-white"/>
 </span>
 <div className="flex-1 text-left min-w-0">
 <p className="text-white font-semibold text-sm">
 {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
 </p>
 <p className="text-muted-foreground text-xs">Tap to review your order</p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <span className="text-white font-bold text-sm">
 PKR {total.toLocaleString()}
 </span>
 <ChevronUp size={18} className="text-muted-foreground"/>
 </div>
 </button>
 </div>

 {/* Mobile bottom sheet */}
 {sheetOpen && (
 <div className="lg:hidden fixed inset-0 z-50">
 <button
 type="button"
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={() => setSheetOpen(false)}
 aria-label="Close cart"
 />
 <div
 className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700/60 rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto animate-fade-in-up shadow-2xl"
 role="dialog"
 aria-modal="true"
 aria-label="Cart summary"
 >
 <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-5"/>
 <div className="flex items-center justify-between mb-5">
 <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
 <ShoppingCart size={22} className="text-brand-400"/>
 Your Order
 </h3>
 <button
 onClick={() => setSheetOpen(false)}
 className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
 aria-label="Close"
 >
 <X size={20} />
 </button>
 </div>
 {cartContent}
 </div>
 </div>
 )}
 </>
 );
}
