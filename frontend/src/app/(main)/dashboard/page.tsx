'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  ShoppingBag, ChefHat, X, Save, UtensilsCrossed, TrendingUp, Users, DollarSign, Search
} from 'lucide-react';
import { Restaurant, MenuItem, Order, OrderStatus } from '@/types';
import { restaurantsApi, menusApi, ordersApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import StatusBadge from '@/components/StatusBadge';
import { PageLoader } from '@/components/Spinner';
import RevenueChart from '@/components/charts/RevenueChart';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Tab = 'menu' | 'orders';

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
 pending: 'confirmed',
 confirmed: 'preparing',
 preparing: 'ready',
 ready: 'delivered',
};

export default function DashboardPage() {
 const { user, loading: authLoading } = useAuth();
 const router = useRouter();
 const [tab, setTab] = useState<Tab>('orders');
 const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
 const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
 const [orders, setOrders] = useState<Order[]>([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', imageUrl: '', isAvailable: true });
  const [saving, setSaving] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuSelectedCategory, setMenuSelectedCategory] = useState('All');
  const [togglingOpen, setTogglingOpen] = useState(false);

  const toggleOpenStatus = async () => {
    if (!restaurant) return;
    setTogglingOpen(true);
    try {
      const nextState = !restaurant.isOpen;
      const res = await restaurantsApi.update(restaurant.id, { isOpen: nextState });
      setRestaurant(res.data);
      toast.success(nextState ? 'Restaurant is now OPEN' : 'Restaurant is now CLOSED');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setTogglingOpen(false);
    }
  };

 useEffect(() => {
 if (!authLoading && (!user || user.role !== 'restaurant')) {
 router.push('/');
 }
 }, [user, authLoading, router]);

 const loadData = useCallback(async () => {
 try {
 const rRes = await restaurantsApi.getMy();
 const r = rRes.data;
 setRestaurant(r);
 if (r) {
 const [mRes, oRes] = await Promise.all([
 menusApi.getByRestaurant(r.id),
 ordersApi.getRestaurantOrders(r.id),
 ]);
 setMenuItems(mRes.data);
 setOrders(oRes.data);
 }
 } catch {
 // No restaurant yet
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 if (authLoading) return;
 if (!user || user.role !== 'restaurant') {
 setLoading(false);
 return;
 }
 loadData();
 }, [authLoading, user, loadData]);

 const openCreateForm = () => {
 setEditItem(null);
 setForm({ name: '', description: '', price: '', category: '', imageUrl: '', isAvailable: true });
 setShowForm(true);
 };

 const openEditForm = (item: MenuItem) => {
 setEditItem(item);
 setForm({
 name: item.name,
 description: item.description || '',
 price: String(item.price),
 category: item.category || '',
 imageUrl: item.imageUrl || '',
 isAvailable: item.isAvailable,
 });
 setShowForm(true);
 };

 const handleSaveItem = async () => {
 if (!restaurant || !form.name || !form.price) {
 toast.error('Name and price are required');
 return;
 }
 setSaving(true);
 try {
 const payload = {
 name: form.name,
 description: form.description || undefined,
 price: Number(form.price),
 category: form.category || undefined,
 imageUrl: form.imageUrl || undefined,
 isAvailable: form.isAvailable,
 };
 if (editItem) {
 await menusApi.update(editItem.id, payload);
 toast.success('Item updated');
 } else {
 await menusApi.create(restaurant.id, payload);
 toast.success('Item added');
 }
 setShowForm(false);
 loadData();
 } catch (err: any) {
 toast.error(err.message);
 } finally {
 setSaving(false);
 }
 };

 const handleDeleteItem = async (id: string) => {
 if (!confirm('Delete this menu item?')) return;
 try {
 await menusApi.remove(id);
 toast.success('Item deleted');
 loadData();
 } catch (err: any) {
 toast.error(err.message);
 }
 };

 const handleAdvanceOrder = async (orderId: string, currentStatus: OrderStatus) => {
 const next = NEXT_STATUS[currentStatus];
 if (!next) return;
 try {
 await ordersApi.updateStatus(orderId, next);
 setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: next } : o));
 toast.success(`Order marked as ${next}`);
 } catch (err: any) {
 toast.error(err.message);
 }
 };

 const handleCancelOrder = async (orderId: string) => {
 if (!confirm('Cancel this order?')) return;
 try {
 await ordersApi.updateStatus(orderId, 'cancelled');
 setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'cancelled' } : o));
 toast.success('Order cancelled');
 } catch (err: any) {
 toast.error(err.message);
 }
 };

  if (authLoading || loading) return <div className="min-h-screen transition-colors duration-300 flex items-center justify-center"><PageLoader /></div>;

  if (!restaurant) {
    return (
      <div className="py-12 transition-colors duration-300">
        <CreateRestaurantPrompt onCreated={loadData} />
      </div>
    );
  }

 const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
 const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

 // Quick stats
 const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const categories = ['All', ...new Set(menuItems.map((i) => i.category || 'Other'))];
  
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase()));
    const matchesCategory = menuSelectedCategory === 'All' || (item.category || 'Other') === menuSelectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
 
 {/* Header Section */}
 <div className="glass-card p-6 rounded-3xl mb-8 border-brand-500/20 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-amber-500"/>
 <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"/>
 
 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
 <div className="flex items-center gap-5">
 <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary shadow-inner shrink-0 transition-colors ">
 <ChefHat size={32} className="text-brand-400"/>
 </div>
 <div>
 <h1 className="font-display text-3xl font-bold tracking-tight text-foreground transition-colors sm:text-4xl">{restaurant.name}</h1>
 <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground transition-colors sm:text-base">
 <span className="rounded-md bg-muted px-2 py-0.5 text-xs transition-colors ">{restaurant.cuisine || 'Various'}</span>
 Restaurant Dashboard
 </p>
 </div>
 </div>
 
 <div className="flex items-center gap-4">
            <button
              onClick={toggleOpenStatus}
              disabled={togglingOpen}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 border shadow-lg backdrop-blur-md transition-all active:scale-95 disabled:opacity-55 ${
                restaurant.isOpen 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-muted border-border text-muted-foreground hover:bg-secondary'
              }`}
              title="Click to toggle store opening hours"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${restaurant.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="font-bold text-sm uppercase tracking-wider">{restaurant.isOpen ? 'Accepting Orders' : 'Closed'}</span>
            </button>
 </div>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
 {[
 { label: 'Active Orders', value: activeOrders.length, icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
 { label: 'Total Revenue', value:`PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
 { label: 'Total Orders', value: orders.length, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
 { label: 'Menu Items', value: menuItems.length, icon: UtensilsCrossed, color: 'text-brand-400', bg: 'bg-brand-400/10', border: 'border-brand-400/20' },
 ].map((s) => (
 <div key={s.label} className={`glass-card p-5 border ${s.border} hover:-translate-y-1 transition-transform duration-300`}>
 <div className="flex items-start justify-between mb-4">
 <div className={`p-3 rounded-xl ${s.bg}`}>
 <s.icon size={20} className={s.color} />
 </div>
 </div>
 <div>
 <p className="text-3xl font-display font-bold text-foreground mb-1 transition-colors ">{s.value}</p>
 <p className="text-sm font-medium text-muted-foreground transition-colors ">{s.label}</p>
 </div>
 </div>
 ))}
 </div>

        {/* Revenue Chart */}
        {orders.length > 0 && (
          <div className="mb-8">
            <RevenueChart orders={orders} title="Restaurant Revenue" subtitle="Daily revenue from your delivered orders" />
          </div>
        )}

 {/* Main Content Area */}
 <div className="glass-card overflow-hidden">
 {/* Tabs */}
 <div className="flex border-b border-border transition-colors ">
 {(['orders', 'menu'] as Tab[]).map((t) => (
 <button
 key={t}
 onClick={() => setTab(t)}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
              tab === t 
                ? 'border-b-2 border-brand-400 bg-brand-500/5 text-brand-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors'
            }`}
 >
 {t === 'orders' ?`Orders ${activeOrders.length > 0 ? `(${activeOrders.length})` : ''}` : 'Menu Management'}
 </button>
 ))}
 </div>

 <div className="min-h-[400px] space-y-6 p-6 sm:p-8">
 {tab === 'orders' ? (
 <div className="space-y-6">
 {activeOrders.length === 0 && pastOrders.length === 0 ? (
 <div className="rounded-3xl border-2 border-dashed border-border py-20 text-center transition-colors ">
 <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary transition-colors ">
 <ShoppingBag size={32} className="text-muted-foreground transition-colors dark:text-muted-foreground"/>
 </div>
 <h3 className="mb-2 text-xl font-bold text-foreground transition-colors ">No orders yet</h3>
 <p className="text-muted-foreground transition-colors ">When customers place orders, they will appear here.</p>
 </div>
 ) : (
 <>
 {activeOrders.length > 0 && (
 <div className="animate-fade-in-up">
 <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground transition-colors ">
 <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400"/>
 Active Orders
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {activeOrders.map((order) => (
 <OrderCard key={order.id} order={order}
 onAdvance={() => handleAdvanceOrder(order.id, order.status)}
 onCancel={() => handleCancelOrder(order.id)} />
 ))}
 </div>
 </div>
 )}
 
 {pastOrders.length > 0 && (
 <div className="mt-12 animate-fade-in-up">
 <h2 className="mb-4 flex items-center gap-2 font-semibold text-muted-foreground transition-colors ">
 <div className="h-2 w-2 rounded-full bg-slate-400 transition-colors dark:bg-slate-600"/>
 Past Orders
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75 hover:opacity-100 transition-opacity">
 {pastOrders.map((order) => (
 <OrderCard key={order.id} order={order} onAdvance={undefined} onCancel={undefined} />
 ))}
 </div>
 </div>
 )}
 </>
 )}
 </div>
 ) : (
 <div className="animate-fade-in-up">
 <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-foreground text-lg">Menu Items</h2>
            <p className="mt-1 text-sm text-muted-foreground transition-colors">Manage what your customers can order</p>
          </div>
 <button onClick={openCreateForm} className="btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 transition-transform">
 <Plus size={16} /> <span className="hidden sm:inline">Add New Item</span>
 </button>
 </div>

        {menuItems.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border py-20 text-center transition-colors">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary transition-colors">
              <UtensilsCrossed size={32} className="text-muted-foreground transition-colors dark:text-muted-foreground"/>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No menu items</h3>
            <p className="mb-6 text-muted-foreground transition-colors dark:text-muted-foreground">Start building your menu to receive orders.</p>
            <button onClick={openCreateForm} className="btn-primary">Add First Item</button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search and Category filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search menu items by name or description..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMenuSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                      menuSelectedCategory === cat
                        ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredMenuItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border py-12 text-center">
                <p className="text-muted-foreground">No menu items match your search or filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => (
 <div key={item.id} className="flex rounded-2xl border border-border bg-card/50 p-4 transition-all hover:border-border/80 hover:shadow-lg group">
 {item.imageUrl ? (
 <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-md"/>
 ) : (
 <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary transition-colors ">
 <UtensilsCrossed size={24} className="text-muted-foreground transition-colors dark:text-muted-foreground"/>
 </div>
 )}
 <div className="flex-1 min-w-0 ml-4 flex flex-col justify-between">
 <div>
 <div className="flex items-start justify-between gap-2">
 <h4 className="truncate pr-2 font-semibold text-foreground transition-colors ">{item.name}</h4>
 <span className="shrink-0 rounded border border-border bg-secondary px-2 py-0.5 text-sm font-bold text-foreground transition-colors ">
 PKR {Number(item.price).toLocaleString()}
 </span>
 </div>
 <div className="flex items-center gap-2 mt-1.5">
 {item.category && <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors">{item.category}</span>}
 {!item.isAvailable && <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">Sold Out</span>}
 </div>
 </div>
 <div className="flex items-center justify-end gap-2 mt-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditForm(item)} className="rounded-lg border border-border bg-secondary p-2 text-muted-foreground transition-colors hover:border-brand-400 hover:bg-brand-500/10 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:bg-brand-500/20 dark:hover:text-brand-400">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} className="rounded-lg border border-border bg-secondary p-2 text-muted-foreground transition-colors hover:border-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-500/20 dark:hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
 </div>
 </div>
 </div>
              ))}
              </div>
            )}
          </div>
        )}
 </div>
 )}
 </div>
 </div>
 </div>

 {showForm && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl">
 <div className="glass-card w-full max-w-lg p-0 animate-slide-up overflow-hidden border-slate-700 shadow-2xl">
 <div className="flex items-center justify-between border-b border-border bg-secondary px-6 py-4 transition-colors ">
 <h3 className="flex items-center gap-2 font-display text-xl font-bold text-foreground transition-colors ">
 {editItem ? <Edit2 size={20} className="text-brand-400"/> : <Plus size={20} className="text-brand-400"/>}
 {editItem ? 'Edit Item' : 'Add New Item'}
 </h3>
 <button onClick={() => setShowForm(false)} className="rounded-lg border border-border bg-secondary p-2 text-muted-foreground transition-colors hover:bg-muted dark:hover:bg-slate-700">
 <X size={16} />
 </button>
 </div>
 
 <div className="p-6 space-y-5">
 <div className="grid grid-cols-2 gap-5">
 <div className="col-span-2">
 <label className="mb-1.5 inline-block font-medium text-slate-700 transition-colors ">Item Name *</label>
 <input className="input"placeholder="e.g. Zinger Burger"value={form.name}
 onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
 </div>
 <div>
 <label className="mb-1.5 inline-block font-medium text-slate-700 transition-colors ">Price (PKR) *</label>
 <input type="number"min="0"className="input"placeholder="e.g. 500"value={form.price}
 onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
 </div>
 <div>
 <label className="mb-1.5 inline-block font-medium text-slate-700 transition-colors ">Category</label>
 <input className="input"placeholder="e.g. Fast Food"value={form.category}
 onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
 </div>
 <div className="col-span-2">
 <label className="mb-1.5 inline-block font-medium text-slate-700 transition-colors ">Description</label>
 <textarea rows={2} className="input resize-none"placeholder="Briefly describe the item ingredients or taste"
 value={form.description}
 onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
 </div>
 <div className="col-span-2">
 <label className="mb-1.5 inline-block font-medium text-slate-700 transition-colors ">Image URL</label>
 <input className="input"placeholder="https://..." value={form.imageUrl}
 onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
 </div>
 
 <div className="flex items-center justify-between rounded-xl border border-border bg-secondary p-4 transition-colors ">
 <div>
 <h4 className="mb-0.5 text-sm font-semibold text-foreground transition-colors ">Availability</h4>
 <p className="text-xs text-muted-foreground transition-colors ">Can customers order this item right now?</p>
 </div>
 <button type="button"onClick={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))}
 className={`transition-colors ${form.isAvailable ? 'text-brand-400' : 'text-muted-foreground'}`}>
 {form.isAvailable ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
 </button>
 </div>
 </div>
 
 <div className="flex gap-3 border-t border-border pt-4 transition-colors ">
 <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-3">Cancel</button>
 <button onClick={handleSaveItem} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 shadow-lg shadow-brand-500/20">
 <Save size={18} /> {saving ? 'Saving...' : 'Save Item'}
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

function OrderCard({ order, onAdvance, onCancel }: {
 order: Order;
 onAdvance?: () => void;
 onCancel?: () => void;
}) {
 const canAdvance = onAdvance && NEXT_STATUS[order.status];
 
 return (
 <div className="rounded-2xl border border-border bg-card/50 p-5 shadow-lg transition-colors hover:border-border/80">
 <div className="mb-4 flex items-start justify-between gap-4 border-b border-border pb-4 transition-colors 80">
 <div>
 <div className="flex items-center gap-3 mb-1.5">
 <span className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-xs font-bold text-muted-foreground transition-colors">#{order.id.slice(0, 6).toUpperCase()}</span>
 <StatusBadge status={order.status} />
 </div>
 <p className="text-xs font-medium text-muted-foreground transition-colors dark:text-muted-foreground">{new Date(order.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</p>
 </div>
 <div className="text-right">
 <span className="block text-lg font-bold text-foreground transition-colors ">PKR {Number(order.totalAmount).toLocaleString()}</span>
 <span className="text-xs text-muted-foreground transition-colors dark:text-muted-foreground">{order.items.length} items</span>
 </div>
 </div>
 
 <div className="mb-5 space-y-2 rounded-xl border border-border bg-background/50 p-3 transition-colors /50">
 {order.items.map((item) => (
 <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground/80 transition-colors">
                        <span className="text-brand-400 mr-2">{item.quantity}x</span>
                        {item.menuItemName}
                      </span>
 </div>
 ))}
 </div>
 
 {(canAdvance || onCancel) && (
 <div className="flex gap-3">
 {canAdvance && (
 <button onClick={onAdvance} className="flex-1 btn-primary text-sm py-2.5 shadow-lg shadow-brand-500/10">
 Update to {NEXT_STATUS[order.status]}
 </button>
 )}
 {onCancel && order.status === 'pending' && (
 <button onClick={onCancel} className="px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-semibold transition-colors">
 Cancel
 </button>
 )}
 </div>
 )}
 </div>
 );
}

function CreateRestaurantPrompt({ onCreated }: { onCreated: () => void }) {
 const [form, setForm] = useState({ name: '', description: '', cuisine: '', address: '', phone: '' });
 const [saving, setSaving] = useState(false);

 const handleCreate = async () => {
 if (!form.name) { toast.error('Restaurant name is required'); return; }
 setSaving(true);
 try {
 await restaurantsApi.create(form);
 toast.success('Restaurant created successfully!');
 onCreated();
 } catch (err: any) {
 toast.error(err.message);
 } finally {
 setSaving(false);
 }
 };

 return (
 <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in-up">
 <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-500/20 rotate-3 hover:rotate-0 transition-transform">
 <ChefHat size={48} className="text-foreground"/>
 </div>
 <h2 className="mb-3 font-display text-4xl font-bold text-foreground transition-colors ">Launch Your Restaurant</h2>
 <p className="mb-10 max-w-lg text-lg text-muted-foreground transition-colors mx-auto">Set up your profile in minutes and start receiving orders from hungry customers on FoodRush.</p>
 
 <div className="glass-card p-8 sm:p-10 text-left border-slate-700/50 shadow-2xl relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-400 to-amber-400"/>
 
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <label className="font-medium text-slate-700 transition-colors ">Restaurant Name *</label>
 <input className="input text-lg py-3"placeholder="e.g. Burger Point"
 value={form.name}
 onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
 </div>
 
 <div>
 <label className="font-medium text-slate-700 transition-colors ">Primary Cuisine</label>
 <input className="input"placeholder="e.g. Fast Food"
 value={form.cuisine}
 onChange={(e) => setForm((prev) => ({ ...prev, cuisine: e.target.value }))} />
 </div>
 
 <div>
 <label className="font-medium text-slate-700 transition-colors ">Contact Number</label>
 <input className="input"placeholder="e.g. 0300 1234567"
 value={form.phone}
 onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
 </div>
 
 <div className="md:col-span-2">
 <label className="font-medium text-slate-700 transition-colors ">Full Address</label>
 <input className="input"placeholder="Shop #1, Main Street, Karachi"
 value={form.address}
 onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
 </div>
 
 <div className="md:col-span-2">
 <label className="font-medium text-slate-700 transition-colors ">Short Description</label>
 <textarea rows={3} className="input resize-none"placeholder="What makes your restaurant special?"
 value={form.description}
 onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
 </div>
 </div>
 
 <div className="border-t border-border pt-4 transition-colors ">
 <button onClick={handleCreate} disabled={saving} className="btn-primary w-full py-4 text-lg shadow-xl shadow-brand-500/20 group">
 {saving ? 'Creating...' : (
 <span className="flex items-center justify-center gap-2">
 Create My Restaurant <TrendingUp size={20} className="group-hover:translate-x-1 transition-transform"/>
 </span>
 )}
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
