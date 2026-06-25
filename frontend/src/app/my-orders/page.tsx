'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Clock, Utensils } from 'lucide-react';
import { Order } from '@/types';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import { PageLoader } from '@/components/Spinner';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    } else if (!authLoading && user && user.role !== 'user') {
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'user') return;
    ordersApi.getMy()
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh pb-12">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">My Orders</h1>
            <p className="text-slate-400 text-sm mt-1">Track and manage your order history</p>
          </div>
        </div>

        {loading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <div className="glass-card text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl max-w-xl mx-auto">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
            <p className="text-slate-500 mb-6">Craving something delicious? Order from local favorites.</p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              <Utensils size={16} /> Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="glass-card flex items-center justify-between gap-4 p-5 hover:border-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <ShoppingBag size={22} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-semibold text-white text-base">
                        {order.restaurant?.name || 'Restaurant'}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-medium">
                      <span className="text-slate-500 font-mono">#{order.id.slice(0, 6).toUpperCase()}</span>
                      <span className="text-slate-600">•</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-white font-semibold">
                        PKR {Number(order.totalAmount).toLocaleString()}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={12} />
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="inline-flex text-[10px] bg-slate-950 border border-slate-850 text-slate-400 px-2 py-0.5 rounded-md font-medium">
                          <span className="text-brand-400 font-bold mr-1">{item.quantity}x</span>
                          {item.menuItemName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
