import React from 'react';
import { Fruit } from '../utils/seedData';
import { formatDA } from '../utils/format';
import { Trash2 } from 'lucide-react';

type FruitCardProps = {
  fruit: Fruit;
  onClick: (fruit: Fruit) => void;
  onLogWaste: (fruit: Fruit) => void;
};

export const FruitCard: React.FC<FruitCardProps> = ({ fruit, onClick, onLogWaste }) => {
  return (
    <div
      onClick={() => onClick(fruit)}
      className="bg-card hover:bg-muted active:scale-[0.98] cursor-pointer transition-all border border-border rounded-2xl p-5 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-3 w-full relative group/card"
    >
      {/* Log Waste Icon Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLogWaste(fruit);
        }}
        title="Log Waste/Spoilage"
        className="absolute top-3 right-3 p-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all opacity-85 hover:opacity-100 shadow-sm active:scale-90"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="text-6xl mb-2 drop-shadow-sm">{fruit.emoji}</div>
      <div className="text-center w-full">
        <h3 className="font-bold text-lg text-foreground truncate">{fruit.name}</h3>
        <p className="text-muted-foreground font-medium text-sm mt-1 bg-muted/50 rounded-full py-1 px-3 inline-block">
          {formatDA(fruit.sellingPricePerKg)} / kg
        </p>
      </div>
    </div>
  );
};

