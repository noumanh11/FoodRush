'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, MapPin, FileText, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/useCart';
import { useAuth } from '@/context/useAuth';
import { ordersApi } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PageLoader } from '@/components/Spinner';

const DEFAULT_MENU_IMAGE = '/images/menus/default.svg';

export default function CartPage() {
 const { items, removeItem, updateQuantity, clearCart, total, restaurantId } = useCart();
 const { user, loading: authLoading } = useAuth();
 const router = useRouter();
 const [address, setAddress] = useState('');
 const [notes, setNotes] = useState('');
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (!authLoading && !user) {
 router.push('/auth');
 } else if (!authLoading && user && user.role !== 'user') {
 router.push(user.role === 'admin' ? '/admin' : '/dashboard');
 }
 }, [user, authLoading, router]);

 if (authLoading || !user || user.role !== 'user') {
 return (
 <div className="min-h-screen transition-colors duration-300 flex items-center justify-center">
 <PageLoader />
 </div>
 );
 }

 if (items.length === 0) {
 return (
 <div className="relative min-h-[50vh] overflow-hidden transition-colors duration-300">
 <div className="absolute inset-0 bg-mesh pointer-events-none opacity-30"/>
 <div className="max-w-lg mx-auto text-center py-32 px-4 relative z-10">
 <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-secondary shadow-xl shadow-slate-200/20 transition-colors dark:shadow-slate-900/20">
 <ShoppingCart size={40} className="text-muted-foreground transition-colors dark:text-muted-foreground"/>

 </div>
 <h2 className="mb-3 font-display text-3xl font-bold text-foreground transition-colors ">Your cart is empty</h2>
 <p className="mb-8 text-lg text-muted-foreground transition-colors ">Looks like you haven't added anything delicious yet.</p>
 <Link href="/" className="btn-primary inline-flex items-center gap-2 group px-8 py-3.5 text-lg shadow-brand-500/25 shadow-xl hover:shadow-brand-500/40">
 Browse Restaurants <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
 </Link>
 </div>
 </div>
 );
 }

 const handlePlaceOrder = async () => {
 if (!address.trim()) {
 toast.error('Please enter a delivery address');
 return;
 }
 setLoading(true);
 try {
 const orderData = {
 items: items.map((i) => ({
 menuItemId: i.menuItem.id,
 quantity: i.quantity,
 })),
 deliveryAddress: address,
 notes: notes || undefined,
 };
 const res = await ordersApi.create(orderData);
 clearCart();
 toast.success('Order placed successfully!');
 router.push(`/orders/${res.data.id}`);
 } catch (err: any) {
 toast.error(err.message);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="relative overflow-hidden transition-colors duration-300">
 <div className="absolute inset-0 bg-mesh pointer-events-none opacity-20"/>
 
 <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 relative z-10">
 <Link href={`/restaurants/${restaurantId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground group ">
 <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform"/> Continue Shopping
 </Link>

 <h1 className="mb-8 font-display text-4xl font-bold text-foreground transition-colors ">Checkout</h1>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 {/* Left Column: Cart Items */}
 <div className="lg:col-span-7 space-y-6">
 <div className="glass-card p-6 transition-colors">
 <div className="flex items-center justify-between border-b border-border pb-4 mb-6 transition-colors">
 <h2 className="text-lg font-semibold text-foreground transition-colors">
 Order Items <span className="ml-2 rounded-full bg-muted px-2.5 py-0.5 text-sm text-brand-500 transition-colors dark:text-brand-400">{items.length}</span>
 </h2>
 <button
 onClick={clearCart}
 className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-red-500 dark:text-muted-foreground dark:hover:text-red-400"
 >
 <Trash2 size={14} /> Clear all
 </button>
 </div>

 <div className="space-y-4">
 {items.map((cartItem) => (
 <div key={cartItem.menuItem.id} className="flex flex-col gap-4 rounded-xl border border-border bg-secondary40 p-4 transition-colors hover:border-border/80 group 40 sm:flex-row sm:items-center">
 <img
 src={cartItem.menuItem.imageUrl || DEFAULT_MENU_IMAGE}
 alt={cartItem.menuItem.name}
 className="h-20 w-20 shrink-0 rounded-xl bg-muted object-cover shadow-lg transition-colors "
 />
 
 <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
 <div className="flex justify-between items-start gap-4">
 <h3 className="truncate text-lg font-semibold text-foreground transition-colors ">{cartItem.menuItem.name}</h3>
 <button
 onClick={() => removeItem(cartItem.menuItem.id)}
 className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
 >
 <Trash2 size={16} />
 </button>
 </div>
 
 <div className="flex items-center justify-between mt-4">
 <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-1 transition-colors ">
              <button
                onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground transition-colors hover:bg-accent"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-bold text-foreground transition-colors ">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground transition-colors hover:bg-accent"
              >
                <Plus size={14} />
              </button>
 </div>
 
 <div className="text-right">
 <span className="text-lg font-bold text-brand-500 transition-colors dark:text-brand-400">
 PKR {(Number(cartItem.menuItem.price) * cartItem.quantity).toLocaleString()}
 </span>
 <p className="text-xs text-muted-foreground transition-colors dark:text-muted-foreground">PKR {Number(cartItem.menuItem.price).toLocaleString()} each</p>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Right Column: Summary + Details */}
 <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
 
 {/* Delivery details */}
 <div className="glass-card border-border70 p-6 transition-colors ">
 <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground transition-colors ">
 <MapPin size={18} className="text-brand-400"/> Delivery Details
 </h2>
 <div className="space-y-5">
 <div>
            <label className="label text-foreground transition-colors">Delivery Address</label>
 <textarea
 rows={3}
 value={address}
 onChange={(e) => setAddress(e.target.value)}
 placeholder="Enter your full delivery address (e.g., House #, Street, Block...)"
 className="input resize-none"
 />
 </div>
 <div>
            <label className="label flex items-center justify-between text-foreground transition-colors">

 <span>Special Instructions</span>
 <span className="text-xs font-normal text-muted-foreground transition-colors dark:text-muted-foreground">Optional</span>
 </label>
 <textarea
 rows={2}
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="E.g. no onions, extra sauce, call upon arrival..."
 className="input resize-none"
 />
 </div>
 </div>
 </div>

 {/* Order summary */}
 <div className="glass-card relative overflow-hidden border-brand-500/30 p-6 shadow-xl shadow-brand-500/5 transition-colors dark:border-brand-500/30">

 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-amber-400"/>
 
 <h2 className="mb-5 text-lg font-semibold text-foreground transition-colors ">Order Summary</h2>
 
 <div className="mb-6 max-h-48 space-y-3 overflow-y-auto pr-2 text-sm text-muted-foreground transition-colors ">
 {items.map((i) => (
 <div key={i.menuItem.id} className="flex justify-between items-center">
 <span className="truncate pr-4 flex-1">{i.quantity}x {i.menuItem.name}</span>
 <span className="shrink-0 font-medium">PKR {(Number(i.menuItem.price) * i.quantity).toLocaleString()}</span>
 </div>
 ))}
 </div>
 
 <div className="mb-6 space-y-3 border-t border-border pt-4 transition-colors 80">
 <div className="flex justify-between text-sm text-muted-foreground transition-colors ">
 <span>Subtotal</span>
 <span>PKR {total.toLocaleString()}</span>
 </div>
 <div className="flex justify-between text-sm text-muted-foreground transition-colors ">
 <span>Delivery Fee</span>
 <span className="font-medium text-emerald-500 transition-colors dark:text-emerald-400">Free</span>
 </div>
 <div className="mt-2 flex justify-between border-t border-border pt-2 text-xl font-bold text-foreground transition-colors 80 ">
 <span>Total</span>
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-amber-500 transition-colors dark:from-brand-400 dark:to-amber-400">
 PKR {total.toLocaleString()}
 </span>
 </div>
 </div>

 <button
 onClick={handlePlaceOrder}
 disabled={loading}
 className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 group shadow-lg shadow-brand-500/20"
 >
 {loading ? 'Processing...' : (
 <>
 Confirm Order <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
 </>
 )}
 </button>
 
 <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
 <ShieldCheck size={14} className="text-emerald-500"/>
 <span>Secure checkout powered by FoodRush</span>
 </div>
 </div>

 </div>
 </div>
 </div>
 </div>
 );
}