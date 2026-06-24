'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  ShoppingBag, ChefHat, X, Save, UtensilsCrossed
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

  if (authLoading || loading) return <div className="min-h-screen"><Navbar /><PageLoader /></div>;

  if (!restaurant) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <CreateRestaurantPrompt onCreated={loadData} />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">{restaurant.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{restaurant.cuisine} • Restaurant Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${restaurant.isOpen ? 'status-ready' : 'status-cancelled'}`}>
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Active Orders', value: activeOrders.length, color: 'text-amber-400' },
            { label: 'Menu Items', value: menuItems.length, color: 'text-brand-400' },
            { label: 'Total Orders', value: orders.length, color: 'text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
          {(['orders', 'menu'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'orders' ? `Orders ${activeOrders.length > 0 ? `(${activeOrders.length})` : ''}` : 'Menu'}
            </button>
          ))}
        </div>

        {tab === 'orders' ? (
          <div className="space-y-4">
            {activeOrders.length === 0 && pastOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                <p>No orders yet</p>
              </div>
            ) : (
              <>
                {activeOrders.length > 0 && (
                  <>
                    <h2 className="font-semibold text-white text-sm uppercase tracking-wider">Active Orders</h2>
                    {activeOrders.map((order) => (
                      <OrderCard key={order.id} order={order}
                        onAdvance={() => handleAdvanceOrder(order.id, order.status)}
                        onCancel={() => handleCancelOrder(order.id)} />
                    ))}
                  </>
                )}
                {pastOrders.length > 0 && (
                  <>
                    <h2 className="font-semibold text-slate-500 text-sm uppercase tracking-wider mt-6">Past Orders</h2>
                    {pastOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onAdvance={undefined} onCancel={undefined} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Menu Items</h2>
              <button onClick={openCreateForm} className="btn-primary flex items-center gap-1.5 text-sm py-2">
                <Plus size={15} /> Add Item
              </button>
            </div>

            {menuItems.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
                <p>No menu items yet</p>
                <button onClick={openCreateForm} className="mt-4 btn-primary text-sm">Add First Item</button>
              </div>
            ) : (
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="card flex items-center gap-4 p-4">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{item.name}</span>
                        {!item.isAvailable && <span className="badge bg-red-500/15 text-red-400 border border-red-500/30 text-[10px]">Unavailable</span>}
                      </div>
                      {item.category && <span className="text-slate-500 text-xs">{item.category}</span>}
                    </div>
                    <span className="text-brand-400 font-bold">PKR {Number(item.price).toLocaleString()}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEditForm(item)} className="btn-ghost p-2"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteItem(item.id)} className="btn-ghost p-2 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-xl text-white">
                {editItem ? 'Edit Item' : 'Add Menu Item'}
              </h3>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Item Name *</label>
                  <input className="input" placeholder="e.g. Chicken Biryani" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Price (PKR) *</label>
                  <input type="number" min="0" className="input" placeholder="350" value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input className="input" placeholder="e.g. Rice, Burgers" value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea rows={2} className="input resize-none" placeholder="Short description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label">Image URL</label>
                  <input className="input" placeholder="https://…" value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <button type="button" onClick={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))}
                    className={`transition-colors ${form.isAvailable ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {form.isAvailable ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                  <span className="text-sm text-slate-300">
                    {form.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSaveItem} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-1.5">
                  <Save size={15} /> {saving ? 'Saving…' : 'Save Item'}
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
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleString('en-PK')}</p>
        </div>
        <span className="text-brand-400 font-bold">PKR {Number(order.totalAmount).toLocaleString()}</span>
      </div>
      <div className="space-y-1 mb-3">
        {order.items.map((item) => (
          <div key={item.id} className="text-sm text-slate-400">
            {item.menuItemName} × {item.quantity}
          </div>
        ))}
      </div>
      {(canAdvance || onCancel) && (
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          {canAdvance && (
            <button onClick={onAdvance} className="btn-primary text-xs py-1.5 px-3">
              Mark as {NEXT_STATUS[order.status]}
            </button>
          )}
          {onCancel && order.status === 'pending' && (
            <button onClick={onCancel} className="btn-secondary text-xs py-1.5 px-3 text-red-400 border-red-500/30 hover:bg-red-500/10">
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
      toast.success('Restaurant created!');
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ChefHat size={32} className="text-brand-400" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white mb-2">Set Up Your Restaurant</h2>
      <p className="text-slate-400 mb-8">Create your restaurant profile to start receiving orders</p>
      <div className="card p-6 text-left space-y-4">
        {[
          { key: 'name', label: 'Restaurant Name *', placeholder: 'e.g. Al-Baik Karachi' },
          { key: 'cuisine', label: 'Cuisine Type', placeholder: 'e.g. Pakistani, Chinese, Fast Food' },
          { key: 'address', label: 'Address', placeholder: 'Full address' },
          { key: 'phone', label: 'Contact Number', placeholder: '+92 300 …' },
        ].map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <input className="input" placeholder={f.placeholder}
              value={(form as any)[f.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} />
          </div>
        ))}
        <div>
          <label className="label">Description</label>
          <textarea rows={2} className="input resize-none" placeholder="Tell customers about your restaurant"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
        </div>
        <button onClick={handleCreate} disabled={saving} className="btn-primary w-full">
          {saving ? 'Creating…' : 'Create Restaurant'}
        </button>
      </div>
    </div>
  );
}
