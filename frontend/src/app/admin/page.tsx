'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store, X, Clock } from 'lucide-react';
import { Order } from '@/types';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import { PageLoader } from '@/components/Spinner';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await ordersApi.getAllAdmin();
      setOrders(res.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }
    loadOrders();
  }, [authLoading, user, loadOrders]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await ordersApi.cancel(orderId);
      toast.success('Order cancelled');
      loadOrders();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen"><Navbar /><PageLoader /></div>;

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Platform overview & order management</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
            <ShoppingBag size={16} className="text-brand-400" />
            <span className="text-sm text-slate-300">{orders.length} total orders</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Orders', value: activeOrders.length, color: 'text-amber-400' },
            { label: 'Delivered', value: orders.filter((o) => o.status === 'delivered').length, color: 'text-emerald-400' },
            { label: 'Cancelled', value: orders.filter((o) => o.status === 'cancelled').length, color: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Store size={40} className="mx-auto mb-3 opacity-30" />
            <p>No orders in the system yet</p>
          </div>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <>
                <h2 className="font-semibold text-white text-sm uppercase tracking-wider mb-3">Active Orders</h2>
                <div className="space-y-3 mb-8">
                  {activeOrders.map((order) => (
                    <OrderRow key={order.id} order={order} onCancel={() => handleCancelOrder(order.id)} />
                  ))}
                </div>
              </>
            )}
            {pastOrders.length > 0 && (
              <>
                <h2 className="font-semibold text-slate-500 text-sm uppercase tracking-wider mb-3">Past Orders</h2>
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <OrderRow key={order.id} order={order} onCancel={undefined} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order, onCancel }: { order: Order; onCancel?: () => void }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
        <ShoppingBag size={18} className="text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-white text-sm">{order.restaurant?.name || 'Restaurant'}</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{order.user?.name || 'Unknown'}</span>
          <span>•</span>
          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>PKR {Number(order.totalAmount).toLocaleString()}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
          </span>
        </div>
      </div>
      {onCancel && !['delivered', 'cancelled'].includes(order.status) && (
        <button onClick={onCancel} className="btn-ghost p-2 text-red-400 hover:text-red-300">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
