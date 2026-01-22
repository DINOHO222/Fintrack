import React, { useMemo } from 'react';
import { Expense, Holding, AppRoute, TransactionType } from '../types';
import { TrendingUp, DollarSign } from 'lucide-react';
import { CATEGORIES } from '../types';

interface HomeProps {
  expenses: Expense[];
  portfolio: Holding[];
  onNavigate: (route: AppRoute) => void;
}

const Home: React.FC<HomeProps> = ({ expenses, portfolio, onNavigate }) => {
  // Calculate Monthly Stats (Optimized to single pass)
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.reduce(
      (acc, e) => {
        const d = new Date(e.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          if (e.type === TransactionType.INCOME) {
            acc.income += e.amount;
            acc.net += e.amount;
          } else {
            acc.expense += e.amount;
            acc.net -= e.amount;
          }
        }
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );
  }, [expenses]);

  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses]);

  return (
    <div className="px-6 pt-12 pb-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">歡迎回來</p>
          <h1 className="text-2xl font-bold">FinTrack</h1>
        </div>
      </div>

      {/* Hero Section - Net Balance */}
      <div className="flex flex-col items-center justify-center mb-8 relative flex-shrink-0">
        <div className={`absolute w-40 h-40 blur-[60px] rounded-full pointer-events-none ${monthlyStats.net >= 0 ? 'bg-primary/20' : 'bg-danger/20'}`} />
        <p className="text-muted font-medium mb-2 text-sm">本月結餘</p>
        <h2 className={`text-4xl sm:text-5xl font-bold mb-3 tracking-tighter ${monthlyStats.net >= 0 ? 'text-white' : 'text-white'}`}>
          {monthlyStats.net < 0 ? '-' : ''}${Math.abs(monthlyStats.net).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </h2>
        
        {/* Small stats row */}
        <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 bg-surface/50 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-xs text-muted whitespace-nowrap">收 ${monthlyStats.income.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface/50 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                <span className="text-xs text-muted whitespace-nowrap">支 ${monthlyStats.expense.toLocaleString()}</span>
            </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 flex-shrink-0">
        <button 
            onClick={() => onNavigate(AppRoute.EXPENSE)}
            className="group relative h-36 sm:h-40 bg-surface rounded-2xl p-5 text-left border border-white/5 hover:border-primary/30 transition-all overflow-hidden"
        >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-4 sm:mb-6 flex-shrink-0">
                <DollarSign className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="relative z-10">
                <h3 className="text-base sm:text-lg font-bold leading-tight">每日<br/>記帳</h3>
                <p className="text-[10px] sm:text-xs text-muted mt-1">記錄收支</p>
            </div>
        </button>

        <button 
            onClick={() => onNavigate(AppRoute.PORTFOLIO)}
            className="group relative h-36 sm:h-40 bg-surface rounded-2xl p-5 text-left border border-white/5 hover:border-secondary/30 transition-all overflow-hidden"
        >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary mb-4 sm:mb-6 flex-shrink-0">
                <TrendingUp className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="relative z-10">
                <h3 className="text-base sm:text-lg font-bold leading-tight">股票<br/>投資</h3>
                <p className="text-[10px] sm:text-xs text-muted mt-1">市值追蹤</p>
            </div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <h3 className="font-bold text-lg">近期活動</h3>
        <button onClick={() => onNavigate(AppRoute.ANALYSIS)} className="text-primary text-sm font-medium hover:text-primary/80 transition-colors">查看全部</button>
      </div>

      <div className="space-y-3 pb-20 flex-1 overflow-y-auto no-scrollbar">
        {recentExpenses.length === 0 ? (
            <div className="p-8 text-center text-muted bg-surface rounded-xl border border-white/5 border-dashed">
                尚無近期交易
            </div>
        ) : (
            recentExpenses.map(expense => {
                const category = CATEGORIES.find(c => c.id === expense.category);
                const isIncome = expense.type === TransactionType.INCOME;
                return (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5 hover:bg-surface/80 transition-colors">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: `${category?.color || '#333'}33`, color: category?.color }}>
                                {category?.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm truncate pr-2">{expense.note || category?.name}</p>
                                <p className="text-xs text-muted">{new Date(expense.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p className={`font-bold text-sm flex-shrink-0 ${isIncome ? 'text-primary' : 'text-white'}`}>
                            {isIncome ? '+' : '-'}${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default Home;