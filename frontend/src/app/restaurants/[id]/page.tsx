'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, Phone, Star, Plus, Minus, ShoppingCart,
  ArrowLeft, Utensils, Tag
} from 'lucide-react';
import { Restaurant, MenuItem } from '@/types';
import { restaurantsApi, menusApi } from '@/lib/api';
import { useCart } from '@/context/useCart';
import { useAuth } from '@/context/useAuth';
import Navbar from '@/components/Navbar';
import { PageLoader } from '@/components/Spinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const { addItem, items, updateQuantity, itemCount, total, restaurantId } = useCart();
  const { user } = useAuth();
  const router = useRouter();

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
  };

  if (loading) return <div className="min-h-screen"><Navbar /><PageLoader /></div>;
  if (!restaurant) return <div className="min-h-screen"><Navbar /><p className="text-center py-20 text-slate-500">Restaurant not found</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Cover */}
      <div className="h-56 bg-gradient-to-br from-slate-800 to-slate-900 relative">
        {restaurant.imageUrl && (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 px-4 max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={15} /> All Restaurants
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">{restaurant.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-400">
            {restaurant.cuisine && <span className="text-brand-400">{restaurant.cuisine}</span>}
            {restaurant.rating && (
              <span className="flex items-center gap-1"><Star size={13} className="text-amber-400" fill="currentColor" />{restaurant.rating}</span>
            )}
            {restaurant.address && (
              <span className="flex items-center gap-1"><MapPin size={13} />{restaurant.address}</span>
            )}
            {restaurant.phone && (
              <span className="flex items-center gap-1"><Phone size={13} />{restaurant.phone}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Menu */}
        <div className="flex-1 min-w-0">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === c
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Utensils size={40} className="mx-auto mb-3 opacity-30" />
              <p>No items in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const qty = getItemQty(item.id);
                return (
                  <div
                    key={item.id}
                    className={`card flex gap-4 p-4 transition-all ${!item.isAvailable ? 'opacity-50' : 'hover:border-slate-700'}`}
                  >
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-white">{item.name}</h3>
                          {item.description && (
                            <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                          {item.category && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                              <Tag size={10} />{item.category}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-brand-400 text-lg shrink-0">
                          PKR {Number(item.price).toLocaleString()}
                        </span>
                      </div>

                      {user?.role === 'user' && (
                        item.isAvailable ? (
                          <div className="flex items-center gap-2 mt-3">
                            {qty === 0 ? (
                              <button
                                onClick={() => handleAdd(item)}
                                className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-all active:scale-95"
                              >
                                <Plus size={14} /> Add
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, qty - 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-6 text-center font-bold text-white">{qty}</span>
                                <button
                                  onClick={() => addItem(item, id)}
                                  className="w-8 h-8 flex items-center justify-center bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-red-400 mt-3 inline-block">Unavailable</span>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart sidebar */}
        {user?.role === 'user' && itemCount > 0 && restaurantId === id && (
          <div className="w-80 shrink-0 hidden lg:block">
            <div className="card p-5 sticky top-24">
              <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                <ShoppingCart size={18} className="text-brand-400" />
                Your Order
              </h3>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto scrollbar-hide">
                {items.map((cartItem) => (
                  <div key={cartItem.menuItem.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-5 h-5 bg-brand-500/20 text-brand-400 rounded text-xs flex items-center justify-center font-bold">
                        {cartItem.quantity}
                      </span>
                      <span className="text-slate-300 truncate">{cartItem.menuItem.name}</span>
                    </div>
                    <span className="text-slate-400 shrink-0">
                      PKR {(Number(cartItem.menuItem.price) * cartItem.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 pt-4 mb-4">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-300">Total</span>
                  <span className="text-brand-400 text-lg">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/cart')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile cart bar */}
      {user?.role === 'user' && itemCount > 0 && restaurantId === id && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4">
          <button
            onClick={() => router.push('/cart')}
            className="btn-primary w-full flex items-center justify-between"
          >
            <span className="w-6 h-6 bg-white/20 rounded-md text-sm font-bold flex items-center justify-center">
              {itemCount}
            </span>
            <span>View Cart</span>
            <span>PKR {total.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}