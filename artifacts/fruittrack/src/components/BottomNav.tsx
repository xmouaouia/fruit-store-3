import React from 'react';
import { Store, Settings, BarChart3 } from 'lucide-react';

export type ViewType = 'store' | 'admin' | 'dashboard';

type BottomNavProps = {
  activeView: ViewType;
  onChangeView: (view: ViewType) => void;
};

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onChangeView }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => onChangeView('store')}
          className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
            activeView === 'store' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Store className="w-6 h-6" strokeWidth={activeView === 'store' ? 2.5 : 2} />
          <span className="text-xs font-medium">Store</span>
        </button>
        
        <button
          onClick={() => onChangeView('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
            activeView === 'dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-6 h-6" strokeWidth={activeView === 'dashboard' ? 2.5 : 2} />
          <span className="text-xs font-medium">Dashboard</span>
        </button>
        
        <button
          onClick={() => onChangeView('admin')}
          className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
            activeView === 'admin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="w-6 h-6" strokeWidth={activeView === 'admin' ? 2.5 : 2} />
          <span className="text-xs font-medium">Admin</span>
        </button>
      </div>
    </div>
  );
};
