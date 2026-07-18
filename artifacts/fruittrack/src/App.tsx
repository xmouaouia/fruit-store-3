import React, { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { BottomNav } from '@/components/BottomNav';
import { SidebarNav } from '@/components/SidebarNav';
import { StoreView } from '@/components/StoreView';
import { DashboardView } from '@/components/DashboardView';
import { AdminView } from '@/components/AdminView';
import { LoginView } from '@/components/LoginView';
import { useStore } from '@/hooks/useStore';

export type ViewType = 'store' | 'admin' | 'dashboard';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('store');
  const { data, setCurrentUser } = useStore();
  const { currentUser, users } = data;

  const renderActiveView = () => {
    switch (activeView) {
      case 'store':
        return <StoreView />;
      case 'dashboard':
        return <DashboardView />;
      case 'admin':
        return <AdminView />;
      default:
        return <StoreView />;
    }
  };

  if (!currentUser) {
    return (
      <TooltipProvider>
        <LoginView users={users} onSelectUser={setCurrentUser} />
        <Toaster />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background overflow-hidden text-foreground">
        {/* Desktop Sidebar */}
        <SidebarNav activeView={activeView} onChangeView={setActiveView} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative scroll-smooth">
          {/* Top User Profile Widget */}
          <div className="absolute top-4 right-4 z-40 bg-card/80 backdrop-blur-md border border-border px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 max-w-[200px] hover:shadow transition-all group">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              {currentUser.name[0].toUpperCase()}
            </div>
            <span className="text-xs font-bold text-foreground truncate max-w-[80px]">{currentUser.name}</span>
            <button 
              onClick={() => setCurrentUser(null)}
              className="text-[10px] bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground px-2 py-0.5 rounded-full transition-all"
            >
              Switch
            </button>
          </div>
          
          {renderActiveView()}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BottomNav activeView={activeView} onChangeView={setActiveView} />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;

