import React, { useState } from 'react';
import { Fruit } from '../utils/seedData';
import { formatDA } from '../utils/format';
import { Minus, Plus, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/hooks/useStore';

type WeightStepperProps = {
  fruit: Fruit;
  onClose: () => void;
  onSave: (fruitId: string, quantityKg: number, pricePerKg: number) => void;
  mode?: 'sale' | 'waste';
  onSaveWaste?: (fruitId: string, quantityKg: number) => void;
};

export const WeightStepper: React.FC<WeightStepperProps> = ({ 
  fruit, 
  onClose, 
  onSave, 
  mode = 'sale',
  onSaveWaste 
}) => {
  const [weight, setWeight] = useState<string>('1.0');
  const { toast } = useToast();
  const { data } = useStore();
  const { currentUser } = data;
  const isAdmin = currentUser?.role === 'admin';

  const isWaste = mode === 'waste';

  const handleIncrement = () => {
    setWeight(prev => {
      const val = parseFloat(prev) || 0;
      return (val + 0.5).toFixed(2);
    });
  };

  const handleDecrement = () => {
    setWeight(prev => {
      const val = parseFloat(prev) || 0;
      return Math.max(0.5, val - 0.5).toFixed(2);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(e.target.value);
  };

  const handleSave = () => {
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight greater than 0.",
        variant: "destructive"
      });
      return;
    }
    
    if (isWaste) {
      if (onSaveWaste) {
        onSaveWaste(fruit.id, numWeight);
        toast({
          title: `🗑️ Logged ${numWeight} kg of ${fruit.name} as Waste`,
          description: isAdmin 
            ? `Estimated Cost Loss: ${formatDA(numWeight * fruit.purchasePricePerKg)}` 
            : `Logged under ${currentUser?.name}`,
          variant: "destructive"
        });
      }
    } else {
      onSave(fruit.id, numWeight, fruit.sellingPricePerKg);
      toast({
        title: `✅ Sold ${numWeight} kg of ${fruit.name}`,
        description: `Total: ${formatDA(numWeight * fruit.sellingPricePerKg)}`,
        className: "bg-primary text-primary-foreground border-none",
      });
    }
    onClose();
  };

  const currentTotal = (parseFloat(weight) || 0) * fruit.sellingPricePerKg;
  const estimatedLoss = (parseFloat(weight) || 0) * fruit.purchasePricePerKg;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-card w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-4 duration-300 relative border-t-4 border-t-primary"
        style={{ borderTopColor: isWaste ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mt-2 mb-6">
          <div className="text-7xl mb-4">{fruit.emoji}</div>
          <h2 className="text-2xl font-bold text-foreground">
            {isWaste ? `Log Waste: ${fruit.name}` : fruit.name}
          </h2>
          <p className="text-muted-foreground text-lg">
            {isWaste 
              ? (isAdmin ? `Cost: ${formatDA(fruit.purchasePricePerKg)} / kg` : 'Logging Spoilage') 
              : `${formatDA(fruit.sellingPricePerKg)} / kg`}
          </p>
        </div>

        {/* Stepper controls */}
        <div className="flex items-center justify-between bg-muted rounded-2xl p-2 mb-4">
          <button 
            onClick={handleDecrement}
            className="w-14 h-14 bg-background rounded-xl shadow-sm flex items-center justify-center text-foreground hover:bg-card active:scale-95 transition-all"
          >
            <Minus className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={weight}
                onChange={handleInputChange}
                className="w-24 text-center text-4xl font-bold bg-transparent border-none outline-none text-foreground p-0"
                step="0.1"
                min="0.1"
              />
              <span className="text-xl font-bold text-muted-foreground">kg</span>
            </div>
          </div>
          
          <button 
            onClick={handleIncrement}
            className="w-14 h-14 bg-background rounded-xl shadow-sm flex items-center justify-center text-foreground hover:bg-card active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Quick-Tap Weight Buttons */}
        <div className="flex justify-center gap-2 mb-6">
          {['+0.5', '+1.0', '+2.0'].map((label) => (
            <button
              key={label}
              onClick={() => {
                setWeight(prev => {
                  const val = parseFloat(prev) || 0;
                  const increment = parseFloat(label);
                  return (val + increment).toFixed(1);
                });
              }}
              className="px-4 py-2 bg-muted hover:bg-primary/20 hover:text-primary rounded-full text-xs font-bold transition-all active:scale-95 border border-border"
              style={{
                '&:hover': {
                  color: isWaste ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                  backgroundColor: isWaste ? 'hsl(var(--destructive)/0.2)' : 'hsl(var(--primary)/0.2)'
                }
              }}
            >
              {label} kg
            </button>
          ))}
        </div>

        {/* Total calculation panel */}
        {isWaste ? (
          isAdmin ? (
            <div className="bg-destructive/10 rounded-2xl p-4 mb-6 text-center border border-destructive/20">
              <p className="text-destructive font-medium mb-1">Estimated Cost Loss</p>
              <p className="text-3xl font-bold text-destructive">{formatDA(estimatedLoss)}</p>
            </div>
          ) : (
            <div className="bg-destructive/5 rounded-2xl p-4 mb-6 text-center border border-destructive/10">
              <p className="text-muted-foreground font-medium mb-1">Marking as Waste</p>
              <p className="text-2xl font-bold text-destructive">{weight} kg</p>
            </div>
          )
        ) : (
          <div className="bg-primary/10 rounded-2xl p-4 mb-6 text-center border border-primary/20">
            <p className="text-primary/80 font-medium mb-1">Total Price</p>
            <p className="text-3xl font-bold text-primary">{formatDA(currentTotal)}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          className={`w-full text-xl font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all text-white ${
            isWaste 
              ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/20' 
              : 'bg-primary hover:bg-primary/90 shadow-primary/20'
          }`}
        >
          {isWaste ? 'Log Waste / Spoilage' : 'Log Sale'}
        </button>
      </div>
    </div>
  );
};

