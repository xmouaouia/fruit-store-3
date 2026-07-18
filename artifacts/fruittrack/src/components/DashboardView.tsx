import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { SummaryCard } from './SummaryCard';
import { SalesFeed } from './SalesFeed';
import { formatDA, groupSalesByDay } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, Activity, ArrowDownCircle, AlertTriangle, Trash2 } from 'lucide-react';

type FilterType = 'today' | 'week' | 'all';

export const DashboardView: React.FC = () => {
  const { data, deleteFruit } = useStore();
  const { currentUser } = data;
  const [filter, setFilter] = useState<FilterType>('today');

  const isAdmin = currentUser?.role === 'admin';

  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - 7);

    let sales = data.sales;
    let purchases = data.purchases;
    let expenses = data.expenses;

    if (filter === 'today') {
      sales = sales.filter(s => new Date(s.timestamp) >= startOfToday);
      purchases = purchases.filter(p => new Date(p.timestamp) >= startOfToday);
      expenses = expenses.filter(e => new Date(e.timestamp) >= startOfToday);
    } else if (filter === 'week') {
      sales = sales.filter(s => new Date(s.timestamp) >= startOfWeek);
      purchases = purchases.filter(p => new Date(p.timestamp) >= startOfWeek);
      expenses = expenses.filter(e => new Date(e.timestamp) >= startOfWeek);
    }

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalPurchaseCosts = purchases.reduce((sum, p) => sum + p.total, 0);
    const totalExpenseCosts = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCosts = totalPurchaseCosts + totalExpenseCosts;
    const netProfit = totalRevenue - totalCosts;

    return {
      sales,
      purchases,
      totalRevenue,
      totalCosts,
      netProfit,
      salesCount: sales.length,
    };
  }, [data, filter]);

  const chartData = useMemo(() => {
    return groupSalesByDay(data.sales); // We'll always show the last 7 days chart regardless of filter to give context
  }, [data.sales]);

  const inventoryStats = useMemo(() => {
    return data.fruits.map(fruit => {
      // Get all-time sold for inventory view context
      const sold = data.sales
        .filter(s => s.fruitId === fruit.id)
        .reduce((sum, s) => sum + s.quantityKg, 0);
      
      const margin = fruit.sellingPricePerKg - fruit.purchasePricePerKg;
      const marginPercent = fruit.sellingPricePerKg > 0 
        ? Math.round((margin / fruit.sellingPricePerKg) * 100) 
        : 0;
      
      return {
        ...fruit,
        totalSold: sold,
        margin,
        marginPercent
      };
    }).sort((a, b) => b.margin - a.margin);
  }, [data.fruits, data.sales]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your business performance.</p>
        </div>
        
        <div className="bg-muted p-1 rounded-xl inline-flex w-full md:w-auto">
          {(['today', 'week', 'all'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                filter === f 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'week' ? '7 Days' : f}
            </button>
          ))}
        </div>
      </header>

      {/* Summary Cards Grid */}
      <div className={`grid ${isAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'} gap-4 mb-8`}>
        <SummaryCard 
          title="Revenue" 
          value={formatDA(filteredData.totalRevenue)} 
          icon={<DollarSign className="w-5 h-5" />} 
          variant="success" 
        />
        {isAdmin && (
          <>
            <SummaryCard 
              title="Costs" 
              value={formatDA(filteredData.totalCosts)} 
              icon={<ArrowDownCircle className="w-5 h-5" />} 
              variant="warning" 
            />
            <SummaryCard 
              title="Net Profit" 
              value={
                <span className={filteredData.netProfit < 0 ? 'text-destructive' : ''}>
                  {filteredData.netProfit > 0 ? '+' : ''}{formatDA(filteredData.netProfit)}
                </span>
              } 
              icon={<Activity className="w-5 h-5" />} 
              variant={filteredData.netProfit >= 0 ? 'success' : 'danger'} 
            />
          </>
        )}
        <SummaryCard 
          title="Total Sales" 
          value={filteredData.salesCount.toString()} 
          icon={<ShoppingCart className="w-5 h-5" />} 
          variant="neutral" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Revenue - Last 7 Days</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-md)' }}
                  formatter={(value: number) => [`${formatDA(value)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1">
          <SalesFeed sales={data.sales} fruits={data.fruits} limit={6} />
        </div>
      </div>

      {/* Inventory metrics */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-20 md:mb-8">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg">Inventory Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Fruit</th>
                {isAdmin && <th className="px-6 py-3 font-semibold">Buy / Sell</th>}
                {isAdmin && <th className="px-6 py-3 font-semibold">Profit Margin</th>}
                <th className="px-6 py-3 font-semibold text-right">All-Time Sold</th>
                {isAdmin && <th className="px-6 py-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inventoryStats.map((stat) => {
                const marginColor = stat.marginPercent >= 30 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                  : stat.marginPercent >= 15 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20';

                return (
                  <tr key={stat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{stat.emoji}</span>
                        <span className="font-bold text-foreground">{stat.name}</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm">
                        <span className="text-muted-foreground">{stat.purchasePricePerKg}</span> 
                        <span className="mx-1 text-muted-foreground/50">/</span> 
                        <span className="font-medium text-foreground">{stat.sellingPricePerKg} DA</span>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${marginColor}`}>
                          {stat.marginPercent}% ({formatDA(stat.margin)})
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right font-bold text-foreground">
                      {stat.totalSold.toFixed(1)} kg
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${stat.name} from inventory?`)) {
                              deleteFruit(stat.id);
                            }
                          }} 
                          title="Delete Product"
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {inventoryStats.length === 0 && (
                <tr><td colSpan={isAdmin ? 5 : 2} className="px-6 py-8 text-center text-muted-foreground">No data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

