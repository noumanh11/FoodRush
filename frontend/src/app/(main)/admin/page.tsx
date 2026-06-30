'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store, Clock, DollarSign, X } from 'lucide-react';
import { Order } from '@/types';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import { PageLoader } from '@/components/Spinner';
import OrderTable from '@/components/admin/OrderTable';
import RevenueChart from '@/components/charts/RevenueChart';
import StatusPieChart from '@/components/charts/StatusPieChart';
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

  if (authLoading || loading) return <div className="min-h-screen transition-colors duration-300 flex items-center justify-center"><PageLoader /></div>;

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
    <div className="pb-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="glass-card p-6 rounded-3xl mb-8 border-brand-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-amber-500"/>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"/>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-secondary border border-border rounded-2xl flex items-center justify-center shadow-inner shrink-0 ">
                <Store size={32} className="text-brand-400"/>
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground transition-colors sm:text-4xl">Admin Dashboard</h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground transition-colors sm:text-base">
                  Platform Overview & Order Management
                </p>
              </div>
            </div>
            
            <div className="border border-border bg-secondary rounded-xl px-4 py-2.5 flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-400"/>
              <span className="text-sm font-semibold text-muted-foreground">{orders.length} total orders</span>
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
                <p className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1 ">{s.value}</p>
                <p className="text-muted-foreground text-sm font-medium ">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Charts */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
            <div className="lg:col-span-7 xl:col-span-8">
              <RevenueChart orders={orders} title="Platform Revenue" subtitle="Daily revenue from delivered orders" />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <StatusPieChart orders={orders} />
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="glass-card text-center py-20 border-2 border-dashed border-border rounded-3xl ">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 ">
              <Store size={32} className="text-muted-foreground dark:text-muted-foreground"/>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 ">No orders in system</h3>
            <p className="text-muted-foreground dark:text-muted-foreground">Active and past orders will show up here.</p>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <OrderTable orders={orders} onRefresh={loadOrders} />
          </div>
        )}
      </div>
    </div>
  );
}
