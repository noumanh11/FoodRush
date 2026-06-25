'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  MapPin, Phone, Star, Plus, Minus,
  ArrowLeft, Utensils, Tag, Info, Clock
} from 'lucide-react';
import { Restaurant, MenuItem } from '@/types';
import { restaurantsApi, menusApi } from '@/lib/api';
import { useCart } from '@/context/useCart';
import { useAuth } from '@/context/useAuth';
import Navbar from '@/components/Navbar';
import RestaurantCart from '@/components/cart/RestaurantCart';
import { PageLoader } from '@/components/Spinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

const DEFAULT_RESTAURANT_IMAGE = '/images/restaurants/default.svg';
const DEFAULT_MENU_IMAGE = '/images/menus/default.svg';

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const { addItem, items, updateQuantity, restaurantId } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      restaurantsApi.getOne(id),
      menusApi.getByRestaurant(id),
    ])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenuItems(mRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const categories = ['All', ...new Set(menuItems.map((i) => i.category || 'Other'))];

  const filtered =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((i) => (i.category || 'Other') === activeCategory);

  const getItemQty = (menuItemId: string) =>
    items.find((i) => i.menuItem.id === menuItemId)?.quantity || 0;

  const handleAdd = (item: MenuItem) => {
    if (restaurantId && restaurantId !== id) {
      toast((t) => (
        <div className="text-sm">
          <p className="font-semibold mb-2">Clear cart?</p>
          <p className="text-slate-400 mb-3">Your cart has items from another restaurant.</p>
          <div className="flex gap-2">
            <button
              onClick={() => { addItem(item, id); toast.dismiss(t.id); }}
              className="btn-primary text-xs py-1.5 px-3"
            >
              Clear & add
            </button>
            <button onClick={() => toast.dismiss(t.id)} className="btn-secondary text-xs py-1.5 px-3">
              Cancel
            </button>
          </div>
        </div>
      ), { duration: 8000 });
      return;
    }
    addItem(item, id);
    toast.success(`${item.name} added to cart`, { duration: 2000 });
  };

  if (loading) return <div className="min-h-screen bg-slate-950"><Navbar /><PageLoader /></div>;
  if (!restaurant) return <div className="min-h-screen bg-slate-950"><Navbar /><div className="max-w-md mx-auto text-center py-32"><Utensils size={48} className="mx-auto mb-4 text-slate-700" /><h2 className="text-2xl font-bold text-white mb-2">Restaurant not found</h2><p className="text-slate-400">The restaurant you are looking for does not exist or was removed.</p></div></div>;

  const hasCartItems = user?.role === 'user' && items.length > 0 && restaurantId === id;

  return (
    <div className={`min-h-screen bg-slate-950 relative ${hasCartItems ? 'pb-24 lg:pb-12' : 'pb-12'}`}>
      <Navbar />

      {/* Cover */}
      <div className="h-[350px] sm:h-[450px] relative">
        <div className="absolute inset-0 bg-slate-900">
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
          ) : (
            <img src={DEFAULT_RESTAURANT_IMAGE} alt={restaurant.name} className="w-full h-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 max-w-7xl mx-auto z-10">
          <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/50 backdrop-blur-md border border-slate-700/50 text-slate-300 hover:text-white text-sm mb-6 transition-all hover:bg-slate-800/80 group shadow-lg">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Restaurants
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {restaurant.isOpen ? (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/10 backdrop-blur-md">
                    Open Now
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/10 backdrop-blur-md">
                    Closed
                  </span>
                )}
                {restaurant.cuisine && (
                  <span className="px-3 py-1 bg-slate-800/80 text-white border border-slate-700 rounded-full text-xs font-medium backdrop-blur-md shadow-lg shadow-black/20">
                    {restaurant.cuisine}
                  </span>
                )}
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-xl">
                {restaurant.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-300">
                {restaurant.rating && (
                  <span className="flex items-center gap-1.5 font-semibold text-white bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-md">
                    <Star size={16} className="text-amber-400" fill="currentColor" />
                    {restaurant.rating}
                  </span>
                )}
                {restaurant.address && (
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-brand-400" />
                    {restaurant.address}
                  </span>
                )}
                {restaurant.phone && (
                  <span className="flex items-center gap-2">
                    <Phone size={16} className="text-brand-400" />
                    {restaurant.phone}
                  </span>
                )}
              </div>
            </div>
            
            {/* Info Card (Desktop) */}
            <div className="hidden sm:flex items-center gap-6 glass-card p-4 rounded-2xl border-slate-700/50 shadow-2xl shrink-0">
              <div className="text-center px-4 border-r border-slate-800">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-semibold">Delivery</p>
                <p className="font-display text-white font-bold flex items-center justify-center gap-1.5">
                  <Clock size={16} className="text-brand-400" /> 20-35 min
                </p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-semibold">Minimum</p>
                <p className="font-display text-white font-bold">
                  PKR 500
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 flex flex-col lg:flex-row gap-8 relative">
        {/* Menu Section */}
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Utensils size={24} className="text-brand-400" /> Menu
          </h2>
          
          {/* Category tabs */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide mb-8 pb-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 shadow-md ${
                  activeCategory === c
                    ? 'bg-brand-500 text-white shadow-brand-500/20 hover:bg-brand-400'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 backdrop-blur-md'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="glass-card text-center py-24 border-dashed border-2 border-slate-800 rounded-3xl">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-inner">
                <Utensils size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
              <p className="text-slate-400">There are no items available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filtered.map((item) => {
                const qty = getItemQty(item.id);
                return (
                  <div
                    key={item.id}
                    className={`glass-card flex flex-col sm:flex-row gap-4 p-5 transition-all duration-300 group ${!item.isAvailable ? 'opacity-50 grayscale' : 'hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1'}`}
                  >
                    <div className="relative w-full sm:w-28 h-48 sm:h-28 rounded-xl overflow-hidden shrink-0 shadow-lg bg-slate-900">
                      <img
                        src={item.imageUrl || DEFAULT_MENU_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-brand-400 transition-colors">{item.name}</h3>
                          <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-sm whitespace-nowrap shadow-sm">
                            PKR {Number(item.price).toLocaleString()}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                        )}
                        {item.category && (
                          <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-800">
                            <Tag size={12} />{item.category}
                          </span>
                        )}
                      </div>

                      {user?.role === 'user' && (
                        <div className="mt-4 pt-4 border-t border-slate-800/60">
                          {item.isAvailable ? (
                            <div className="flex items-center justify-end">
                              {qty === 0 ? (
                                <button
                                  onClick={() => handleAdd(item)}
                                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-brand-500 text-slate-300 hover:text-white border border-slate-700 hover:border-brand-500 text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                                >
                                  <Plus size={16} /> Add to Order
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-xl border border-slate-700 shadow-inner">
                                  <button
                                    onClick={() => updateQuantity(item.id, qty - 1)}
                                    className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="w-8 text-center font-bold text-white">{qty}</span>
                                  <button
                                    onClick={() => addItem(item, id)}
                                    className="w-9 h-9 flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors shadow-sm"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 text-sm font-medium text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg w-max">
                              <Info size={14} /> Sold Out
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {user?.role === 'user' && <RestaurantCart restaurantId={id} />}
      </div>
    </div>
  );
}