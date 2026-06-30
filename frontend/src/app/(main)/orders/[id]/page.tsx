'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, MapPin, Store, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import StatusBadge from '@/components/StatusBadge';
import { PageLoader } from '@/components/Spinner';
import Link from 'next/link';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="card p-5 transition-colors">
        <p className="text-center font-semibold text-red-500 transition-colors dark:text-red-400">This order was cancelled</p>
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="card p-5 transition-colors">
      <h3 className="mb-4 font-semibold text-foreground transition-colors">Order Progress</h3>
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className={`flex flex-col items-center gap-1 ${i <= currentIdx ? 'text-brand-400' : 'text-muted-foreground transition-colors dark:text-muted-foreground'}`}>
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
              <div className={`mb-4 mx-1 h-0.5 flex-1 transition-all ${i < currentIdx ? 'bg-brand-500' : 'bg-border'}`} />
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
    return (
      <div className="min-h-screen transition-colors duration-300 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen transition-colors duration-300 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen transition-colors duration-300 flex items-center justify-center">
        <p className="py-20 text-center text-muted-foreground transition-colors">Order not found</p>
      </div>
    );
  }

  return (
    <div className="pb-12 transition-colors duration-300">
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        <Link href="/my-orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={15} /> My Orders
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground transition-colors">Order Details</h1>
            <p className="mt-1 text-sm text-muted-foreground transition-colors dark:text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="space-y-4">
          <OrderProgress status={order.status} />

          {/* Restaurant */}
          {order.restaurant && (
            <div className="card flex items-center gap-3 p-4 transition-colors">
              <Store size={18} className="shrink-0 text-brand-400"/>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground transition-colors">Restaurant</p>
                <p className="font-semibold text-foreground transition-colors">{order.restaurant.name}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card p-4 transition-colors">
            <h3 className="mb-3 font-semibold text-foreground transition-colors">Items Ordered</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground/90 transition-colors">
                    {item.menuItemName} <span className="text-muted-foreground transition-colors">× {item.quantity}</span>
                  </span>
                  <span className="text-muted-foreground transition-colors">PKR {Number(item.subtotal).toLocaleString()}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold transition-colors">
                <span className="text-foreground transition-colors">Total</span>
                <span className="text-brand-500 transition-colors dark:text-brand-400">PKR {Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            {order.deliveryAddress && (
              <div className="card p-4 transition-colors">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground transition-colors">
                  <MapPin size={11} /> Delivery To
                </div>
                <p className="text-sm text-foreground/80 transition-colors">{order.deliveryAddress}</p>
              </div>
            )}
            <div className="card p-4 transition-colors">
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground transition-colors">
                <Clock size={11} /> Placed At
              </div>
              <p className="text-sm text-foreground/80 transition-colors">
                {new Date(order.createdAt).toLocaleString('en-PK', {
                  dateStyle: 'medium', timeStyle: 'short',
                })}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="card p-4 transition-colors">
              <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground transition-colors">Notes</p>
              <p className="text-sm text-foreground/80 transition-colors">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}