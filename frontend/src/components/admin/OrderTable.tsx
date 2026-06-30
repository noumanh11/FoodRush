'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Search, MoreVertical, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, 
  Trash2, Filter, CheckCircle2, Clock
} from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
  onRefresh: () => void;
}

type SortCol = 'date' | 'total' | 'id';
type SortDir = 'asc' | 'desc';

export default function OrderTable({ orders, onRefresh }: OrderTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortCol, setSortCol] = useState<SortCol>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtering
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = 
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        o.restaurant?.name.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA, valB;
      if (sortCol === 'date') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortCol === 'total') {
        valA = Number(a.totalAmount);
        valB = Number(b.totalAmount);
      } else {
        valA = a.id;
        valB = b.id;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortCol, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when filters change
  useEffect(() => setPage(1), [search, statusFilter]);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(o => o.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkCancel = async () => {
    if (!confirm(`Cancel ${selectedIds.size} orders?`)) return;
    setIsUpdating(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => ordersApi.cancel(id)));
      toast.success('Orders cancelled');
      setSelectedIds(new Set());
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel some orders');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!confirm(`Change order status to ${status}?`)) return;
    setIsUpdating(true);
    setActiveMenuId(null);
    try {
      await ordersApi.updateStatus(id, status);
      toast.success('Status updated');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-border bg-card shadow-lg flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/20">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-foreground"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="pl-9 pr-8 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none text-foreground"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 w-full md:w-auto bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-lg animate-fade-in-up">
            <span className="text-sm font-semibold text-brand-500">{selectedIds.size} selected</span>
            <div className="h-4 w-px bg-brand-500/30" />
            <button
              onClick={handleBulkCancel}
              disabled={isUpdating}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} /> Bulk Cancel
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/50 text-xs uppercase text-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 w-12 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size === paginated.length && paginated.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-border text-brand-500 focus:ring-brand-500"
                />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-muted/80" onClick={() => handleSort('id')}>
                Order ID {sortCol === 'id' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-muted/80" onClick={() => handleSort('date')}>
                Date {sortCol === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Restaurant</th>
              <th className="px-4 py-3 cursor-pointer hover:bg-muted/80" onClick={() => handleSort('total')}>
                Total {sortCol === 'total' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search size={32} className="mb-2 opacity-20" />
                    <p>No orders found matching your criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((order) => (
                <tr key={order.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${selectedIds.has(order.id) ? 'bg-brand-500/5' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="rounded border-border text-brand-500 focus:ring-brand-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">
                    #{order.id.slice(0, 6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-muted-foreground/50" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {order.user?.name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    {order.restaurant?.name || 'Restaurant'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-500">
                    PKR {Number(order.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                      className="p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {/* Action Dropdown Menu */}
                    {activeMenuId === order.id && (
                      <div className="absolute right-8 top-10 z-50 w-48 rounded-xl border border-border bg-card p-1 shadow-xl animate-fade-in-up">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Update Status
                        </div>
                        {['pending', 'preparing', 'ready', 'delivered', 'cancelled'].map(status => (
                          <button
                            key={status}
                            disabled={order.status === status || isUpdating}
                            onClick={() => updateStatus(order.id, status)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between ${
                              order.status === status 
                                ? 'bg-secondary text-muted-foreground cursor-not-allowed' 
                                : 'text-foreground hover:bg-brand-500 hover:text-white transition-colors'
                            }`}
                          >
                            <span className="capitalize">{status}</span>
                            {order.status === status && <CheckCircle2 size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-background border border-border rounded px-2 py-1 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>per page</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{Math.max(1, totalPages)}</span>
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1 rounded-lg border border-border bg-background text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
