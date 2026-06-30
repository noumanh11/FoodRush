'use client';

import { useMemo } from 'react';
import { Order } from '@/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

interface RevenueChartProps {
  orders: Order[];
  title?: string;
  subtitle?: string;
  statusFilter?: 'delivered' | 'all-non-cancelled';
}

export default function RevenueChart({ 
  orders, 
  title = "Revenue Over Time", 
  subtitle = "Daily revenue from delivered orders",
  statusFilter = 'delivered'
}: RevenueChartProps) {
  
  const data = useMemo(() => {
    // 1. Filter orders based on statusFilter
    const filtered = statusFilter === 'all-non-cancelled'
      ? orders.filter(o => o.status !== 'cancelled')
      : orders.filter(o => o.status === 'delivered');
    
    // 2. Group by date string (YYYY-MM-DD)
    const grouped = filtered.reduce((acc, order) => {
      const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = 0;
      acc[dateStr] += Number(order.totalAmount) || 0;
      return acc;
    }, {} as Record<string, number>);

    // 3. Sort chronologically
    const sortedDates = Object.keys(grouped).sort();
    
    // 4. Map to chart data format
    return sortedDates.map(dateStr => {
      const d = new Date(dateStr);
      const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
      return {
        name: label,
        total: grouped[dateStr]
      };
    });
  }, [orders, statusFilter]);

  if (data.length === 0) {
    return (
      <div className="glass-card p-6 h-80 flex flex-col items-center justify-center border-border/50 text-center">
        <DollarSign size={48} className="text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-foreground">Not enough data</h3>
        <p className="text-sm text-muted-foreground mt-1">Check back when orders are completed.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 border-border/50 flex flex-col h-[380px] animate-fade-in-up shadow-lg">
      <div className="mb-6">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <TrendingUp size={18} className="text-emerald-500" />
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted-foreground/20" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11 }} 
              className="text-muted-foreground"
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11 }} 
              className="text-muted-foreground"
              width={75}
              tickFormatter={(value) => `PKR ${Number(value).toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '0.75rem',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
