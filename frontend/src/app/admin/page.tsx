'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store, X, Clock, DollarSign, ChevronRight } from 'lucide-react';
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

  if (authLoading || loading) return <div className="min-h-screen bg-slate-950"><Navbar /><PageLoader /></div>;

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));
  const platformRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const stats = [
    { label: 'Active Orders', value: activeOrders.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { label: 'Total Revenue', value: `PKR ${platformRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { label: 'Delivered Orders', value: orders.filter((o) => o.status === 'delivered').length, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { label: 'Cancelled Orders', value: orders.filter((o) => o.status === 'cancelled').length, icon: X, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh pb-12">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="glass-card p-6 rounded-3xl mb-8 border-brand-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-amber-500" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <Store size={32} className="text-brand-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm sm:text-base mt-1 flex items-center gap-2">
                  Platform Overview & Order Management
                </p>
              </div>
            </div>
            
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-400" />
              <span className="text-sm font-semibold text-slate-300">{orders.length} total orders</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className={`glass-card p-5 border ${s.border} hover:-translate-y-1 transition-transform duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon size={20} className={s.color} />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">{s.value}</p>
                <p className="text-slate-400 text-sm font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="glass-card text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store size={32} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No orders in system</h3>
            <p className="text-slate-500">Active and past orders will show up here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeOrders.length > 0 && (
              <div className="animate-fade-in-up">
                <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Active Orders
                </h2>
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <OrderRow key={order.id} order={order} onCancel={() => handleCancelOrder(order.id)} />
                  ))}
                </div>
              </div>
            )}
            
            {pastOrders.length > 0 && (
              <div className="animate-fade-in-up">
                <h2 className="font-semibold text-slate-400 flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                  Past Orders
                </h2>
                <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                  {pastOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order, onCancel }: { order: Order; onCancel?: () => void }) {
  return (
    <div className="glass-card p-5 border border-slate-800/80 hover:border-slate-700/80 transition-colors shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center shrink-0">
          <ShoppingBag size={22} className="text-brand-400" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-700">
              #{order.id.slice(0, 6).toUpperCase()}
            </span>
            <span className="font-semibold text-white text-base">
              {order.restaurant?.name || 'Restaurant'}
            </span>
            <StatusBadge status={order.status} />
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-medium">
            <span className="text-slate-300">Customer: {order.user?.name || 'Unknown'}</span>
            <span className="text-slate-600">•</span>
            <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">PKR {Number(order.totalAmount).toLocaleString()}</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <Clock size={12} />
              {new Date(order.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {order.items.map((item, idx) => (
              <span key={idx} className="inline-flex text-[11px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                <span className="text-brand-400 font-bold mr-1">{item.quantity}x</span>
                {item.menuItemName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {onCancel && !['delivered', 'cancelled'].includes(order.status) && (
        <div className="flex md:self-center self-end">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/25 hover:border-red-500/40 rounded-xl text-xs font-semibold transition-all duration-300"
          >
            <X size={14} />
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}
