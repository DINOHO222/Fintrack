import React, { useState, useEffect } from 'react';
import { Expense, TransactionType, CATEGORIES } from '../types';
import { storageService } from '../services/storageService';
import { ChevronLeft, Check, ArrowLeft } from 'lucide-react';

interface ExpenseTrackerProps {
  onBack: () => void;
  onSave: () => void;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ onBack, onSave }) => {
  const [amount, setAmount] = useState('0');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date());

  // Success Modal State
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter categories based on type
  const currentCategories = type === TransactionType.EXPENSE
    ? CATEGORIES.filter(c => c.id !== 'salary')
    : CATEGORIES.filter(c => c.id === 'salary' || c.id === 'others');

  useEffect(() => {
    if (currentCategories.length > 0) {
      setSelectedCategory(currentCategories[0].id);
    }
  }, [type]);

  const handleNumPress = (val: string) => {
    if (amount === '0' && val !== '.') {
      setAmount(val);
    } else {
      if (val === '.' && amount.includes('.')) return;
      if (amount.length > 9) return;
      setAmount(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    if (amount.length === 1) {
      setAmount('0');
    } else {
      setAmount(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (value <= 0) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: value,
      category: selectedCategory,
      date: date.toISOString(),
      type: type,
      note: CATEGORIES.find(c => c.id === selectedCategory)?.name || (type === TransactionType.INCOME ? '收入' : '支出')
    };

    storageService.saveExpense(newExpense);
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onSave();
    setAmount('0');
    setDate(new Date());
  };

  const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      setDate(newDate);
    }
  };

  const yearStr = date.getFullYear();
  const monthStr = date.getMonth() + 1;
  const dayStr = date.getDate();
  const weekDayStr = date.toLocaleDateString('zh-TW', { weekday: 'short' });
  const dateInputValue = `${yearStr}-${String(monthStr).padStart(2, '0')}-${String(dayStr).padStart(2, '0')}`;

  return (
    <div className="h-full flex flex-col bg-background select-none relative">
      {/* Header */}
      <header className="flex items-center justify-between p-6 pt-8 flex-shrink-0">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold">新增交易</h2>
        <div className="w-10" />
      </header>

      {/* Switcher */}
      <div className="flex justify-center mb-6 flex-shrink-0">
        <div className="flex bg-surface p-1 rounded-xl w-64 border border-white/5">
          <button
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === TransactionType.EXPENSE ? 'bg-primary text-background shadow-sm' : 'text-muted hover:text-white'}`}
          >
            支出
          </button>
          <button
            onClick={() => setType(TransactionType.INCOME)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === TransactionType.INCOME ? 'bg-primary text-background shadow-sm' : 'text-muted hover:text-white'}`}
          >
            收入
          </button>
        </div>
      </div>

      {/* Display Amount */}
      <div className="flex flex-col items-center justify-center mb-4 flex-1 min-h-0">
        <div className="flex items-baseline gap-1 text-muted">
          <span className="text-3xl font-light">$</span>
          <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight">{amount}</span>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="w-full mb-4 flex-shrink-0">
        <div className="flex gap-3 overflow-x-auto no-scrollbar p-4 w-fit mx-auto max-w-full flex-nowrap items-center">
          {currentCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 min-w-[64px] p-2 rounded-xl border transition-all ${selectedCategory === cat.id ? 'bg-surface border-primary scale-105 shadow-lg shadow-black/50' : 'bg-transparent border-transparent opacity-50'}`}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}33`, color: cat.color }}>
                <span className="font-bold text-lg">{cat.name.charAt(0)}</span>
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Number Pad Area - Flexible Height */}
      <div className="bg-surface rounded-t-3xl border-t border-white/5 p-2 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] flex-1 min-h-[280px] max-h-[420px] flex flex-col">
        <div className="flex justify-center -mt-4 mb-2 flex-shrink-0">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="flex flex-1 gap-2">
          {/* Numbers Grid */}
          <div className="w-3/4 grid grid-cols-3 gap-2 p-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(num => (
              <button
                key={num}
                onClick={() => handleNumPress(num.toString())}
                className="flex items-center justify-center text-2xl font-medium text-white hover:bg-white/5 rounded-xl active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button onClick={handleBackspace} className="flex items-center justify-center text-white hover:bg-white/5 rounded-xl active:scale-95 transition-all group">
              <ArrowLeft className="w-6 h-6 text-white group-active:text-danger flex-shrink-0" />
            </button>
          </div>

          {/* Actions Side */}
          <div className="w-1/4 flex flex-col gap-2 p-2 pl-0">
            {/* Custom Date Picker Button */}
            <div className="relative flex-1 group min-h-[60px]">
              <div className="absolute inset-0 bg-white/5 rounded-xl border border-white/5 group-hover:border-primary/30 group-hover:bg-white/10 transition-all" />

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 py-1">
                <span className="text-[10px] text-primary font-bold tracking-wider uppercase opacity-80">{yearStr}</span>
                <span className="text-2xl sm:text-3xl font-bold text-white leading-none my-0.5 tracking-tight">{dayStr}</span>
                <div className="flex items-center gap-1 text-[10px] text-muted font-medium bg-black/20 px-1.5 py-0.5 rounded-full">
                  <span>{monthStr}月</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-muted/50" />
                  <span>{weekDayStr}</span>
                </div>
              </div>

              <input
                type="date"
                value={dateInputValue}
                onChange={onDateChange}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="flex-[2] rounded-xl bg-primary hover:bg-green-400 text-background flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-95 transition-all min-h-[100px]"
            >
              <Check className="w-8 h-8 flex-shrink-0" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface p-6 rounded-2xl border border-white/10 shadow-2xl w-64 flex flex-col items-center transform transition-all animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-primary" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">已成功記帳</h3>
            <p className="text-muted text-sm text-center mb-6">
              {type === TransactionType.EXPENSE ? '支出' : '收入'} ${parseFloat(amount).toLocaleString()}
              <br />
              {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </p>
            <button
              onClick={handleCloseSuccess}
              className="w-full py-3 bg-primary text-background font-bold rounded-xl active:scale-95 transition-transform"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;