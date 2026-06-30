'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Clock, Utensils, DollarSign } from 'lucide-react';
import { Order } from '@/types';
import { ordersApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import StatusBadge from '@/components/StatusBadge';
import { PageLoader } from '@/components/Spinner';
import RevenueChart from '@/components/charts/RevenueChart';

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
      <div className="min-h-screen transition-colors duration-300 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="pb-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <ShoppingBag size={22} className="text-brand-400"/>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground transition-colors ">My Orders</h1>
              <p className="mt-1 text-sm text-muted-foreground transition-colors ">Track and manage your order history</p>
            </div>
          </div>
          <Link href="/" className="btn-secondary text-sm py-2.5 px-5">
            Explore Restaurants
          </Link>
        </div>

        {/* Live Active Order Status Tracker */}
        {activeOrders.length > 0 && (
          <div className="glass-card border-brand-500/20 p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-amber-500 to-emerald-500 animate-pulse" />
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="font-display text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              Live Order Status ({activeOrders.length})
            </h2>
            
            <div className="space-y-6">
              {activeOrders.map((order) => {
                const statusSteps = ['pending', 'confirmed', 'preparing', 'ready'];
                const currentIdx = statusSteps.indexOf(order.status);
                
                return (
                  <div key={order.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-foreground text-base">{order.restaurant?.name || 'Restaurant'}</p>
                        <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <Link href={`/orders/${order.id}`} className="text-xs text-brand-500 hover:text-brand-400 font-bold flex items-center gap-1">
                        Open Order Tracker <ChevronRight size={12} />
                      </Link>
                    </div>
                    
                    <div className="flex items-center justify-between gap-1 mt-4">
                      {statusSteps.map((step, i) => {
                        const isActive = i <= currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                          <div key={step} className="flex-1 flex flex-col items-center relative">
                            {/* Connector Line */}
                            {i < statusSteps.length - 1 && (
                              <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                                i < currentIdx ? 'bg-brand-500' : 'bg-secondary border-t border-border'
                              }`} />
                            )}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              isActive ? 'border-brand-500 bg-brand-500 text-white' : 'border-border bg-secondary text-muted-foreground'
                            } ${isCurrent ? 'ring-4 ring-brand-500/20 scale-110' : ''}`}>
                              <span className="text-xs font-bold">{i + 1}</span>
                            </div>
                            <span className={`text-[10px] mt-2.5 capitalize font-semibold tracking-wide ${
                              isActive ? 'text-brand-500 dark:text-brand-400' : 'text-muted-foreground'
                            }`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-card p-6 border border-brand-500/10 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <ShoppingBag size={20} className="text-blue-500" />
                </div>
              </div>
              <p className="text-3xl font-display font-bold text-foreground mb-1">{orders.length}</p>
              <p className="text-muted-foreground text-sm font-semibold">Total Orders</p>
            </div>
            <div className="glass-card p-6 border border-brand-500/10 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <DollarSign size={20} className="text-emerald-500" />
                </div>
              </div>
              <p className="text-3xl font-display font-bold text-foreground mb-1">
                PKR {orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.totalAmount), 0).toLocaleString()}
              </p>
              <p className="text-muted-foreground text-sm font-semibold">Total Spent</p>
            </div>
          </div>
        )}

        {/* Spending Chart */}
        {!loading && orders.length > 0 && (
          <div className="mb-8">
            <RevenueChart orders={orders} title="Spending History" subtitle="Summary of your platform transactions over time" statusFilter="all-non-cancelled" />
          </div>
        )}

        {loading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-3xl border-2 border-dashed border-border py-20 text-center transition-colors">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary transition-colors">
              <ShoppingBag size={32} className="text-muted-foreground"/>
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground transition-colors">No orders yet</h3>
            <p className="mb-6 text-muted-foreground max-w-sm mx-auto">Craving something delicious? Order from local favorites and start your culinary adventure today.</p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              <Utensils size={16} /> Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Order History</h2>
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="glass-card flex items-center justify-between gap-4 p-5 hover:border-brand-500/40 hover:-translate-y-0.5 transition-all duration-300 group shadow-md"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary shrink-0 transition-transform group-hover:scale-105">
                    <ShoppingBag size={22} className="text-brand-400"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-semibold text-foreground text-base transition-colors">
                        {order.restaurant?.name || 'Restaurant'}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
                      <span className="text-muted-foreground font-mono">#{order.id.slice(0, 6).toUpperCase()}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground font-semibold">
                        PKR {Number(order.totalAmount).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={12} />
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="inline-flex text-[10px] bg-secondary border border-border text-muted-foreground px-2 py-0.5 rounded-md font-medium dark:border-slate-800">
                          <span className="text-brand-400 font-bold mr-1">{item.quantity}x</span>
                          {item.menuItemName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0"/>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
 );
}
