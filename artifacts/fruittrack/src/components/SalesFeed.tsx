import React from 'react';
import { Sale, Fruit } from '../utils/seedData';
import { formatDA, formatKg, getRelativeTimeLabel } from '../utils/format';

type SalesFeedProps = {
  sales: Sale[];
  fruits: Fruit[];
  limit?: number;
};

export const SalesFeed: React.FC<SalesFeedProps> = ({ sales, fruits, limit = 15 }) => {
  const displaySales = sales.slice(0, limit);

  if (displaySales.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
        <div className="text-5xl mb-3">📦</div>
        <h3 className="font-semibold text-lg text-foreground">No sales yet</h3>
        <p className="text-muted-foreground mt-1">Sales will appear here once logged.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h3 className="font-bold text-foreground">Recent Sales</h3>
      </div>
      <div className="divide-y divide-border">
        {displaySales.map((sale) => {
          const fruit = fruits.find(f => f.id === sale.fruitId);
          if (!fruit) return null;

          return (
            <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl shadow-sm">
                  {fruit.emoji}
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {fruit.name} <span className="text-muted-foreground font-normal text-sm ml-1">({formatKg(sale.quantityKg)})</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {getRelativeTimeLabel(sale.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-lg">{formatDA(sale.total)}</p>
                <p className="text-xs text-muted-foreground">{formatDA(sale.pricePerKg)}/kg</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
