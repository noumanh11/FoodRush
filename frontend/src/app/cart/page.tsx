'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, MapPin, FileText, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/useCart';
import { useAuth } from '@/context/useAuth';
import { ordersApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
      <div className="min-h-screen bg-slate-950">
        <Navbar />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh pointer-events-none opacity-30" />
        <Navbar />
        <div className="max-w-lg mx-auto text-center py-32 px-4 relative z-10">
          <div className="w-24 h-24 bg-slate-900/80 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-900/20 border border-slate-800">
            <ShoppingCart size={40} className="text-slate-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-slate-400 mb-8 text-lg">Looks like you haven't added anything delicious yet.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2 group px-8 py-3.5 text-lg shadow-brand-500/25 shadow-xl hover:shadow-brand-500/40">
            Browse Restaurants <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
    <div className="min-h-screen bg-slate-950 relative">
      <div className="absolute inset-0 bg-mesh pointer-events-none opacity-20" />
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 relative z-10">
        <Link href={`/restaurants/${restaurantId}`} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
        </Link>

        <h1 className="font-display text-4xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card p-6 border-slate-700/50">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <h2 className="font-semibold text-white text-lg">
                  Order Items <span className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-800 text-brand-400 text-sm">{items.length}</span>
                </h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={14} /> Clear all
                </button>
              </div>

              <div className="space-y-4">
                {items.map((cartItem) => (
                  <div key={cartItem.menuItem.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-colors group">
                    <img
                      src={cartItem.menuItem.imageUrl || DEFAULT_MENU_IMAGE}
                      alt={cartItem.menuItem.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-lg bg-slate-900"
                    />
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-semibold text-white truncate text-lg">{cartItem.menuItem.name}</h3>
                        <button
                          onClick={() => removeItem(cartItem.menuItem.id)}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg p-1 border border-slate-700">
                          <button
                            onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-white text-sm">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-brand-400 font-bold text-lg">
                            PKR {(Number(cartItem.menuItem.price) * cartItem.quantity).toLocaleString()}
                          </span>
                          <p className="text-slate-500 text-xs">PKR {Number(cartItem.menuItem.price).toLocaleString()} each</p>
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
            <div className="glass-card p-6 border-slate-700/50">
              <h2 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-brand-400" /> Delivery Details
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="label text-slate-300">Delivery Address</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address (e.g., House #, Street, Block...)"
                    className="input resize-none bg-slate-900/80 focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="label text-slate-300 flex justify-between items-center">
                    <span>Special Instructions</span>
                    <span className="text-xs text-slate-500 font-normal">Optional</span>
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. no onions, extra sauce, call upon arrival..."
                    className="input resize-none bg-slate-900/80 focus:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="glass-card p-6 border-brand-500/30 shadow-xl shadow-brand-500/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-amber-400" />
              
              <h2 className="font-semibold text-white text-lg mb-5">Order Summary</h2>
              
              <div className="space-y-3 text-sm text-slate-300 mb-6 max-h-48 overflow-y-auto scrollbar-hide pr-2">
                {items.map((i) => (
                  <div key={i.menuItem.id} className="flex justify-between items-center">
                    <span className="truncate pr-4 flex-1">{i.quantity}x {i.menuItem.name}</span>
                    <span className="shrink-0 font-medium">PKR {(Number(i.menuItem.price) * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 border-t border-slate-700/80 pt-4 mb-6">
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Subtotal</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-white text-xl pt-2 border-t border-slate-700/80 mt-2">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-400">
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
                    Confirm Order <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Secure checkout powered by FoodRush</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}