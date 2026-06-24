'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, MapPin, FileText, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/useCart';
import { useAuth } from '@/context/useAuth';
import { ordersApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
      <div className="min-h-screen">
        <Navbar />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-lg mx-auto text-center py-24 px-4">
          <ShoppingCart size={56} className="mx-auto mb-4 text-slate-700" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-6">Add items from a restaurant to get started</p>
          <Link href="/" className="btn-primary inline-flex">Browse Restaurants</Link>
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
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={15} /> Continue Shopping
        </Link>

        <h1 className="font-display text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="font-semibold text-slate-300 text-sm uppercase tracking-wider mb-3">
              Order Items
            </h2>
            {items.map((cartItem) => (
              <div key={cartItem.menuItem.id} className="card p-4 flex items-center gap-4">
                {cartItem.menuItem.imageUrl && (
                  <img src={cartItem.menuItem.imageUrl} alt={cartItem.menuItem.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{cartItem.menuItem.name}</h3>
                  <p className="text-brand-400 font-bold">
                    PKR {Number(cartItem.menuItem.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center font-bold text-white">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    onClick={() => removeItem(cartItem.menuItem.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <span className="text-slate-300 font-semibold w-24 text-right shrink-0">
                  PKR {(Number(cartItem.menuItem.price) * cartItem.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Summary + details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery details */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-white">Delivery Details</h2>
              <div>
                <label className="label flex items-center gap-1.5">
                  <MapPin size={13} /> Delivery Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address"
                  className="input resize-none"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <FileText size={13} /> Special Instructions <span className="text-slate-600 ml-1">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. no onions, extra sauce…"
                  className="input resize-none"
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm text-slate-400 mb-4">
                {items.map((i) => (
                  <div key={i.menuItem.id} className="flex justify-between">
                    <span>{i.menuItem.name} × {i.quantity}</span>
                    <span>PKR {(Number(i.menuItem.price) * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-white text-lg">
                <span>Total</span>
                <span className="text-brand-400">PKR {total.toLocaleString()}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn-primary w-full mt-5"
              >
                {loading ? 'Placing Order…' : 'Place Order'}
              </button>
              <button
                onClick={clearCart}
                className="w-full mt-2 text-sm text-slate-500 hover:text-red-400 transition-colors py-1"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}