'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Clock } from 'lucide-react';
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
      <div className="min-h-screen">
        <Navbar />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-white mb-6">My Orders</h1>

        {loading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No orders yet</p>
            <Link href="/" className="mt-4 inline-flex btn-primary text-sm">
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="card flex items-center gap-4 p-4 hover:border-slate-600 transition-all"
              >
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag size={18} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">
                      {order.restaurant?.name || 'Restaurant'}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-400">
                      PKR {Number(order.totalAmount).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
