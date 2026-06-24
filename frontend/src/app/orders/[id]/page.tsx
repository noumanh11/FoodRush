'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, MapPin, Store, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import { PageLoader } from '@/components/Spinner';
import Link from 'next/link';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="card p-5 bg-red-500/5 border-red-500/20">
        <p className="text-red-400 font-semibold text-center">This order was cancelled</p>
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-white mb-4">Order Progress</h3>
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className={`flex flex-col items-center gap-1 ${i <= currentIdx ? 'text-brand-400' : 'text-slate-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                i < currentIdx ? 'bg-brand-500 border-brand-500' :
                i === currentIdx ? 'border-brand-400 bg-brand-500/10' :
                'border-slate-700'
              }`}>
                {i < currentIdx ? (
                  <CheckCircle2 size={16} className="text-white" fill="white" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              <span className="text-[10px] font-medium capitalize whitespace-nowrap">{step}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 transition-all ${i < currentIdx ? 'bg-brand-500' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    ordersApi.getOne(id)
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      ordersApi.getOne(id).then((res) => setOrder(res.data)).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [id, user]);

  if (authLoading || !user) {
    return <div className="min-h-screen"><Navbar /><PageLoader /></div>;
  }

  if (loading) return <div className="min-h-screen"><Navbar /><PageLoader /></div>;
  if (!order) return <div className="min-h-screen"><Navbar /><p className="text-center py-20 text-slate-500">Order not found</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/my-orders" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={15} /> My Orders
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Order Details</h1>
            <p className="text-slate-500 text-sm mt-1">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="space-y-4">
          <OrderProgress status={order.status} />

          {/* Restaurant */}
          {order.restaurant && (
            <div className="card p-4 flex items-center gap-3">
              <Store size={18} className="text-brand-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Restaurant</p>
                <p className="font-semibold text-white">{order.restaurant.name}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card p-4">
            <h3 className="font-semibold text-white mb-3">Items Ordered</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-300">
                    {item.menuItemName} <span className="text-slate-500">× {item.quantity}</span>
                  </span>
                  <span className="text-slate-400">PKR {Number(item.subtotal).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between font-bold">
                <span className="text-slate-200">Total</span>
                <span className="text-brand-400">PKR {Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            {order.deliveryAddress && (
              <div className="card p-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-1">
                  <MapPin size={11} /> Delivery To
                </div>
                <p className="text-sm text-slate-300">{order.deliveryAddress}</p>
              </div>
            )}
            <div className="card p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-1">
                <Clock size={11} /> Placed At
              </div>
              <p className="text-sm text-slate-300">
                {new Date(order.createdAt).toLocaleString('en-PK', {
                  dateStyle: 'medium', timeStyle: 'short',
                })}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="card p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-slate-300">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}