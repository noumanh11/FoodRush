'use client';

import { useMemo } from 'react';
import { Order } from '@/types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface StatusPieChartProps {
  orders: Order[];
}

const STATUS_COLORS = {
  pending: '#f59e0b',    // amber-500
  confirmed: '#3b82f6',  // blue-500
  preparing: '#8b5cf6',  // violet-500
  ready: '#06b6d4',      // cyan-500
  delivered: '#10b981',  // emerald-500
  cancelled: '#ef4444',  // red-500
};

export default function StatusPieChart({ orders }: StatusPieChartProps) {
  
  const data = useMemo(() => {
    if (orders.length === 0) return [];
    
    const counts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#64748b'
    }));
  }, [orders]);

  if (data.length === 0) {
    return (
      <div className="glass-card p-6 h-80 flex flex-col items-center justify-center border-border/50 text-center">
        <PieChartIcon size={48} className="text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-foreground">No orders available</h3>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-6 border-border/50 flex flex-col h-[380px] animate-fade-in-up shadow-lg">
      <div className="mb-2">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <PieChartIcon size={18} className="text-brand-500" />
          Orders by Status
        </h3>
        <p className="text-sm text-muted-foreground">Distribution of order lifecycle</p>
      </div>
      
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '0.75rem',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ fontWeight: 'bold' }}
              formatter={(value: any) => [value, 'Orders']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
