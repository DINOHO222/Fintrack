import React, { useMemo, useState } from 'react';
import { Expense, CATEGORIES, TransactionType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronLeft } from 'lucide-react';

interface AnalysisProps {
  expenses: Expense[];
  onBack: () => void;
}

const Analysis: React.FC<AnalysisProps> = ({ expenses, onBack }) => {
  const [viewType, setViewType] = useState<TransactionType>(TransactionType.EXPENSE);
  
  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;

    const filteredExpenses = expenses.filter(e => e.type === viewType);

    filteredExpenses.forEach(e => {
       data[e.category] = (data[e.category] || 0) + e.amount;
       total += e.amount;
    });

    return Object.keys(data).map(catId => {
        const category = CATEGORIES.find(c => c.id === catId);
        return {
            name: category?.name || catId,
            value: data[catId],
            color: category?.color || '#999',
            icon: category?.icon,
            percentage: total > 0 ? ((data[catId] / total) * 100).toFixed(1) : '0'
        };
    }).sort((a, b) => b.value - a.value);
  }, [expenses, viewType]);

  const totalAmount = chartData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="h-full flex flex-col pt-8 px-6">
      <header className="flex items-center justify-between mb-6 flex-shrink-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold">收支分析</h2>
        <div className="w-10" />
      </header>

      {/* Type Switcher */}
      <div className="flex justify-center mb-6 flex-shrink-0">
        <div className="flex bg-surface p-1 rounded-xl w-64 border border-white/5">
            <button 
                onClick={() => setViewType(TransactionType.EXPENSE)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewType === TransactionType.EXPENSE ? 'bg-white text-background shadow-sm' : 'text-muted hover:text-white'}`}
            >
                支出
            </button>
            <button 
                onClick={() => setViewType(TransactionType.INCOME)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewType === TransactionType.INCOME ? 'bg-primary text-background shadow-sm' : 'text-muted hover:text-white'}`}
            >
                收入
            </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="relative h-64 w-full flex items-center justify-center mb-8 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    innerRadius={75}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    {chartData.length === 0 && (
                        <Cell fill="#333" />
                    )}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm text-muted mb-1">
                {viewType === TransactionType.EXPENSE ? '總支出' : '總收入'}
            </span>
            <span className={`text-3xl font-bold tracking-tight ${viewType === TransactionType.INCOME ? 'text-primary' : 'text-white'}`}>
                ${totalAmount.toLocaleString()}
            </span>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="font-bold text-lg">
              {viewType === TransactionType.EXPENSE ? '支出明細' : '收入來源'}
          </h3>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-20">
          {chartData.map((item, index) => (
              <div key={index} className="group flex flex-col gap-2 p-4 rounded-2xl bg-surface border border-transparent hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 flex-shrink-0" style={{ color: item.color }}>
                               <span className="font-bold text-lg">{item.name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{item.name}</p>
                              <p className="text-xs text-muted">{item.percentage}% 佔比</p>
                          </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                          <p className={`font-bold ${viewType === TransactionType.INCOME ? 'text-primary' : 'text-white'}`}>
                             {viewType === TransactionType.INCOME ? '+' : '-'}${item.value.toLocaleString()}
                          </p>
                      </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1 w-full bg-background rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                      />
                  </div>
              </div>
          ))}

          {chartData.length === 0 && (
             <div className="text-center py-10 text-muted text-sm">
                 本月尚無{viewType === TransactionType.EXPENSE ? '支出' : '收入'}記錄
             </div>
          )}
      </div>
    </div>
  );
};

export default Analysis;