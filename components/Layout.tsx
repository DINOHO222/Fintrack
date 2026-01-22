import React from 'react';
import { Home, PieChart, Wallet, CreditCard } from 'lucide-react';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const navItems = [
    { route: AppRoute.HOME, icon: Home, label: '首頁' },
    { route: AppRoute.EXPENSE, icon: CreditCard, label: '記帳' },
    { route: AppRoute.PORTFOLIO, icon: Wallet, label: '投資' },
    { route: AppRoute.ANALYSIS, icon: PieChart, label: '分析' },
  ];

  return (
    <div className="min-h-screen bg-background text-white flex justify-center">
      <div className="w-full max-w-md h-[100dvh] flex flex-col bg-background relative shadow-2xl overflow-hidden border-x border-white/5">
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {children}
        </main>
        
        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-white/5 pb-6 pt-2 px-6 flex justify-between items-center z-50">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted hover:text-white'}`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
                    <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;