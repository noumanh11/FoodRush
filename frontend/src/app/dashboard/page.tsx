'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  ShoppingBag, ChefHat, X, Save, UtensilsCrossed, TrendingUp, Users, DollarSign
} from 'lucide-react';
import { Restaurant, MenuItem, Order, OrderStatus } from '@/types';
import { restaurantsApi, menusApi, ordersApi } from '@/lib/api';
import { useAuth } from '@/context/useAuth';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import { PageLoader } from '@/components/Spinner';
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

  if (authLoading || loading) return <div className="min-h-screen bg-slate-950"><Navbar /><PageLoader /></div>;

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <CreateRestaurantPrompt onCreated={loadData} />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  // Quick stats
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="glass-card p-6 rounded-3xl mb-8 border-brand-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-amber-500" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <ChefHat size={32} className="text-brand-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">{restaurant.name}</h1>
                <p className="text-slate-400 text-sm sm:text-base mt-1 flex items-center gap-2">
                  <span className="bg-slate-800 px-2 py-0.5 rounded-md text-xs">{restaurant.cuisine || 'Various'}</span>
                  Restaurant Dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border shadow-lg backdrop-blur-md ${
                restaurant.isOpen 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${restaurant.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span className="font-bold text-sm uppercase tracking-wider">{restaurant.isOpen ? 'Accepting Orders' : 'Closed'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Orders', value: activeOrders.length, icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
            { label: 'Total Revenue', value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
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
                <p className={`text-3xl font-display font-bold text-white mb-1`}>{s.value}</p>
                <p className="text-slate-400 text-sm font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="glass-card overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            {(['orders', 'menu'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                  tab === t 
                    ? 'text-brand-400 border-b-2 border-brand-400 bg-brand-500/5' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {t === 'orders' ? `Orders ${activeOrders.length > 0 ? `(${activeOrders.length})` : ''}` : 'Menu Management'}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 min-h-[400px]">
            {tab === 'orders' ? (
              <div className="space-y-6">
                {activeOrders.length === 0 && pastOrders.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
                    <p className="text-slate-500">When customers place orders, they will appear here.</p>
                  </div>
                ) : (
                  <>
                    {activeOrders.length > 0 && (
                      <div className="animate-fade-in-up">
                        <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
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
                        <h2 className="font-semibold text-slate-400 flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-slate-600" />
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
                    <h2 className="font-bold text-white text-lg">Menu Items</h2>
                    <p className="text-sm text-slate-400 mt-1">Manage what your customers can order</p>
                  </div>
                  <button onClick={openCreateForm} className="btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 transition-transform">
                    <Plus size={16} /> <span className="hidden sm:inline">Add New Item</span>
                  </button>
                </div>

                {menuItems.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UtensilsCrossed size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No menu items</h3>
                    <p className="text-slate-500 mb-6">Start building your menu to receive orders.</p>
                    <button onClick={openCreateForm} className="btn-primary">Add First Item</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                      <div key={item.id} className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl flex p-4 transition-all hover:shadow-lg group">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-md" />
                        ) : (
                          <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-700">
                            <UtensilsCrossed size={24} className="text-slate-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 ml-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-white truncate pr-2">{item.name}</h4>
                              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-sm shrink-0 border border-slate-700">
                                PKR {Number(item.price).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              {item.category && <span className="text-xs font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700/50">{item.category}</span>}
                              {!item.isAvailable && <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">Sold Out</span>}
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditForm(item)} className="p-2 bg-slate-800 hover:bg-brand-500 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-brand-500">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-colors border border-slate-700 hover:border-red-500/30">
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
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-0 animate-slide-up overflow-hidden border-slate-700 shadow-2xl">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                {editItem ? <Edit2 size={20} className="text-brand-400" /> : <Plus size={20} className="text-brand-400" />}
                {editItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="label text-slate-300 mb-1.5 inline-block">Item Name *</label>
                  <input className="input bg-slate-900/50" placeholder="e.g. Zinger Burger" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-slate-300 mb-1.5 inline-block">Price (PKR) *</label>
                  <input type="number" min="0" className="input bg-slate-900/50" placeholder="e.g. 500" value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-slate-300 mb-1.5 inline-block">Category</label>
                  <input className="input bg-slate-900/50" placeholder="e.g. Fast Food" value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label text-slate-300 mb-1.5 inline-block">Description</label>
                  <textarea rows={2} className="input resize-none bg-slate-900/50" placeholder="Briefly describe the item ingredients or taste"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label text-slate-300 mb-1.5 inline-block">Image URL</label>
                  <input className="input bg-slate-900/50" placeholder="https://..." value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
                </div>
                
                <div className="col-span-2 p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">Availability</h4>
                    <p className="text-xs text-slate-400">Can customers order this item right now?</p>
                  </div>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))}
                    className={`transition-colors ${form.isAvailable ? 'text-brand-400' : 'text-slate-600'}`}>
                    {form.isAvailable ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-slate-800">
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
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-lg">
      <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">#{order.id.slice(0, 6).toUpperCase()}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-slate-500 text-xs font-medium">{new Date(order.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
        <div className="text-right">
          <span className="text-white font-bold text-lg block">PKR {Number(order.totalAmount).toLocaleString()}</span>
          <span className="text-slate-500 text-xs">{order.items.length} items</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-5 bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">
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
        <ChefHat size={48} className="text-slate-900" />
      </div>
      <h2 className="font-display text-4xl font-bold text-white mb-3">Launch Your Restaurant</h2>
      <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">Set up your profile in minutes and start receiving orders from hungry customers on FoodRush.</p>
      
      <div className="glass-card p-8 sm:p-10 text-left border-slate-700/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-400 to-amber-400" />
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label text-slate-300">Restaurant Name *</label>
              <input className="input text-lg py-3" placeholder="e.g. Burger Point"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            
            <div>
              <label className="label text-slate-300">Primary Cuisine</label>
              <input className="input" placeholder="e.g. Fast Food"
                value={form.cuisine}
                onChange={(e) => setForm((prev) => ({ ...prev, cuisine: e.target.value }))} />
            </div>
            
            <div>
              <label className="label text-slate-300">Contact Number</label>
              <input className="input" placeholder="e.g. 0300 1234567"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            
            <div className="md:col-span-2">
              <label className="label text-slate-300">Full Address</label>
              <input className="input" placeholder="Shop #1, Main Street, Karachi"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
            </div>
            
            <div className="md:col-span-2">
              <label className="label text-slate-300">Short Description</label>
              <textarea rows={3} className="input resize-none" placeholder="What makes your restaurant special?"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-800">
            <button onClick={handleCreate} disabled={saving} className="btn-primary w-full py-4 text-lg shadow-xl shadow-brand-500/20 group">
              {saving ? 'Creating...' : (
                <span className="flex items-center justify-center gap-2">
                  Create My Restaurant <TrendingUp size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
