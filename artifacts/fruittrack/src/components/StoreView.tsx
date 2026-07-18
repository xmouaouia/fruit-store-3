import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { FruitCard } from './FruitCard';
import { WeightStepper } from './WeightStepper';
import { formatDA } from '../utils/format';
import { Fruit } from '../utils/seedData';
import { TrendingUp, ShoppingBag, Clock, ClipboardCopy, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const StoreView: React.FC = () => {
  const { data, addSale, addWaste, resetShift } = useStore();
  const { currentUser } = data;
  const { toast } = useToast();
  
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);
  const [stepperMode, setStepperMode] = useState<'sale' | 'waste'>('sale');
  const [showShiftModal, setShowShiftModal] = useState(false);

  // Calculate today's sales
  const todaysSalesTotal = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return data.sales
      .filter(sale => new Date(sale.timestamp) >= today)
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [data.sales]);

  // Calculate shift statistics
  const shiftSales = useMemo(() => {
    const start = new Date(data.shiftStartTimestamp);
    return data.sales.filter(sale => new Date(sale.timestamp) >= start);
  }, [data.sales, data.shiftStartTimestamp]);

  const shiftTotalKg = useMemo(() => {
    return shiftSales.reduce((sum, sale) => sum + sale.quantityKg, 0);
  }, [shiftSales]);

  const shiftTotalMoney = useMemo(() => {
    return shiftSales.reduce((sum, sale) => sum + sale.total, 0);
  }, [shiftSales]);

  const handleOpenSale = (fruit: Fruit) => {
    setStepperMode('sale');
    setSelectedFruit(fruit);
  };

  const handleOpenWaste = (fruit: Fruit) => {
    setStepperMode('waste');
    setSelectedFruit(fruit);
  };

  const handleCopyShiftSummary = () => {
    const formattedDate = new Date().toLocaleDateString();
    const startTimeStr = new Date(data.shiftStartTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const endTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const summaryText = `🍓 FRUITTRACK SHIFT SUMMARY 🍓\n` +
      `Date: ${formattedDate}\n` +
      `Time: ${startTimeStr} - ${endTimeStr}\n` +
      `-----------------------------------\n` +
      `Total Weight Sold: ${shiftTotalKg.toFixed(2)} kg\n` +
      `Total Cash Collected: ${formatDA(shiftTotalMoney)}\n` +
      `-----------------------------------\n` +
      `Logged by: ${currentUser?.name || 'Staff'}`;

    navigator.clipboard.writeText(summaryText);
    toast({
      title: "📋 Copied to Clipboard!",
      description: "Shift summary is ready to paste into your group chat.",
      className: "bg-primary text-primary-foreground border-none",
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-4 hidden md:block">Store Front</h1>
        
        <div className="bg-primary hover:bg-primary/95 transition-colors rounded-3xl p-6 shadow-lg shadow-primary/20 text-primary-foreground flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-primary-foreground/80 font-medium text-sm md:text-base uppercase tracking-wider mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Today's Revenue
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {formatDA(todaysSalesTotal)}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm text-center">
              <span className="font-medium text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <button
              onClick={() => setShowShiftModal(true)}
              className="bg-white text-primary hover:bg-white/90 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" /> End Shift
            </button>
          </div>
        </div>
      </header>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" /> Products
        </h2>
        <span className="bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full">
          {data.fruits.length} Items
        </span>
      </div>

      {data.fruits.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="text-6xl mb-4">🍓</div>
          <h3 className="text-xl font-bold text-foreground mb-2">No fruits available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your store is empty. Head over to the Admin tab to add your first product and start selling!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {data.fruits.map(fruit => (
            <FruitCard 
              key={fruit.id} 
              fruit={fruit} 
              onClick={handleOpenSale}
              onLogWaste={handleOpenWaste} 
            />
          ))}
        </div>
      )}

      {selectedFruit && (
        <WeightStepper
          fruit={selectedFruit}
          mode={stepperMode}
          onClose={() => setSelectedFruit(null)}
          onSave={addSale}
          onSaveWaste={addWaste}
        />
      )}

      {/* End Shift Popup Dialog */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowShiftModal(false)}>
          <div 
            className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in scale-in duration-300 relative border border-border"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowShiftModal(false)}
              className="absolute top-4 right-4 p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mt-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">End Shift Summary</h2>
              <p className="text-muted-foreground text-sm mt-1">Review the sales logged during this session.</p>
            </div>

            <div className="space-y-3 bg-muted/50 p-4 rounded-2xl border border-border mb-6">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Shift Started:</span>
                <span className="font-semibold">
                  {new Date(data.shiftStartTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} ({new Date(data.shiftStartTimestamp).toLocaleDateString()})
                </span>
              </div>
              <div className="border-t border-border/50 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold text-sm">Kilograms Sold:</span>
                <span className="text-lg font-bold text-foreground">{shiftTotalKg.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold text-sm">Money Collected:</span>
                <span className="text-lg font-bold text-primary">{formatDA(shiftTotalMoney)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopyShiftSummary}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <ClipboardCopy className="w-4 h-4" /> Copy Shift Summary
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to end this shift and reset logs for the next shift? This won't delete historical sales, but will reset the active shift total.")) {
                    resetShift();
                    setShowShiftModal(false);
                    toast({
                      title: "🔄 Shift Ended & Reset",
                      description: "A new shift session has been initialized.",
                      className: "bg-primary text-primary-foreground border-none"
                    });
                  }
                }}
                className="w-full bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground text-destructive font-bold py-3 rounded-xl transition-all"
              >
                Reset & Start New Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

