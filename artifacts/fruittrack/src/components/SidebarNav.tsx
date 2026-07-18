import React from 'react';
import { Store, Settings, BarChart3, TrendingUp } from 'lucide-react';
import { ViewType } from './BottomNav';

type SidebarNavProps = {
  activeView: ViewType;
  onChangeView: (view: ViewType) => void;
};

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeView, onChangeView }) => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
          <TrendingUp className="w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">FruitTrack</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <button
          onClick={() => onChangeView('store')}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
            activeView === 'store' 
              ? 'bg-primary/10 text-primary font-semibold' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
          }`}
        >
          <Store className="w-6 h-6" />
          <span className="text-lg">Store</span>
        </button>
        
        <button
          onClick={() => onChangeView('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
            activeView === 'dashboard' 
              ? 'bg-primary/10 text-primary font-semibold' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
          }`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-lg">Dashboard</span>
        </button>
        
        <button
          onClick={() => onChangeView('admin')}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
            activeView === 'admin' 
              ? 'bg-primary/10 text-primary font-semibold' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-lg">Admin</span>
        </button>
      </nav>
      
      <div className="p-6 mt-auto">
        <div className="bg-muted p-4 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">Store is open</p>
          <p className="font-medium text-foreground mt-1">Ready for sales</p>
        </div>
      </div>
    </div>
  );
};
