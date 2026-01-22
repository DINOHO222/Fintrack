import React, { useState, useEffect } from 'react';
import { Holding, StockQuote } from '../types';
import { storageService } from '../services/storageService';
import { fetchMultipleQuotes } from '../services/stockService';
import { PlusCircle, Search, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Wallet } from 'lucide-react';

interface PortfolioProps {
  portfolio: Holding[];
  onUpdate: () => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ portfolio, onUpdate }) => {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [txType, setTxType] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    loadQuotes();
  }, [portfolio]);

  const loadQuotes = async () => {
    if (portfolio.length === 0) return;
    const symbols = portfolio.map(h => h.symbol);
    try {
      const data = await fetchMultipleQuotes(symbols);
      const quoteMap: Record<string, StockQuote> = {};
      data.forEach(q => quoteMap[q.symbol] = q);
      setQuotes(quoteMap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransaction = () => {
    if (!symbol || !shares || !price) return;
    
    storageService.updateHolding(
      symbol.toUpperCase(), 
      parseFloat(shares), 
      parseFloat(price), 
      txType === 'buy'
    );
    
    setSymbol('');
    setShares('');
    setPrice('');
    setIsModalOpen(false);
    onUpdate();
  };

  // Calculations
  const totalCost = portfolio.reduce((sum, h) => sum + (h.avgCost * h.totalShares), 0);
  const hasLivePrices = Object.values(quotes).some(q => q.price > 0);

  const totalMarketValue = portfolio.reduce((sum, h) => {
    const quote = quotes[h.symbol];
    const currentPrice = quote && quote.price > 0 ? quote.price : 0;
    return sum + (currentPrice * h.totalShares);
  }, 0);

  const totalPL = hasLivePrices ? totalMarketValue - totalCost : 0;
  const totalPLPercent = hasLivePrices && totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div className="h-full px-4 pt-8 pb-4 flex flex-col">
      <header className="flex items-center justify-between mb-6 px-2 flex-shrink-0">
         <h2 className="text-xl font-bold">投資組合</h2>
         <button onClick={() => setIsModalOpen(!isModalOpen)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
             <PlusCircle className="w-6 h-6 text-primary flex-shrink-0" />
         </button>
      </header>

      {/* Asset Summary Card */}
      <div className="bg-surface rounded-xl p-5 border border-white/5 mb-6 shadow-lg relative overflow-hidden flex-shrink-0">
        {/* Decorative BG */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                    {hasLivePrices ? '淨資產價值' : '總投入成本'}
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white truncate">
                    ${(hasLivePrices ? totalMarketValue : totalCost).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </h2>
            </div>
            
            {hasLivePrices && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-bold flex-shrink-0 ${totalPL >= 0 ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'}`}>
                    {totalPL >= 0 ? <TrendingUp className="w-4 h-4 flex-shrink-0" /> : <TrendingDown className="w-4 h-4 flex-shrink-0" />}
                    <span>{totalPLPercent.toFixed(2)}%</span>
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 relative z-10">
             <div>
                 <p className="text-xs text-muted mb-1">未實現損益</p>
                 {hasLivePrices ? (
                     <p className={`font-semibold text-sm sm:text-base ${totalPL >= 0 ? 'text-primary' : 'text-danger'}`}>
                         {totalPL >= 0 ? '+' : ''}{totalPL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                     </p>
                 ) : (
                     <p className="text-sm font-medium text-white/40">---</p>
                 )}
             </div>
             <div>
                 <p className="text-xs text-muted mb-1">總成本</p>
                 <p className="font-semibold text-sm sm:text-base text-white">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
             </div>
        </div>
      </div>

      {/* Add Transaction Form (Collapsible) */}
      {isModalOpen && (
        <div className="bg-surface rounded-xl p-4 border border-white/10 mb-6 animate-in slide-in-from-top-4 fade-in duration-300 flex-shrink-0">
            <div className="flex bg-background rounded-lg p-1 mb-4">
                <button onClick={() => setTxType('buy')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${txType === 'buy' ? 'bg-white text-background' : 'text-muted'}`}>買入</button>
                <button onClick={() => setTxType('sell')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${txType === 'sell' ? 'bg-white text-background' : 'text-muted'}`}>賣出</button>
            </div>
            
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-muted ml-1">代號</label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
                        <input 
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            placeholder="如: AAPL"
                            className="w-full bg-background rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-muted border border-white/5 focus:border-primary outline-none"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="text-xs text-muted ml-1">股數</label>
                        <input 
                            type="number"
                            value={shares}
                            onChange={(e) => setShares(e.target.value)}
                            placeholder="0"
                            className="w-full bg-background rounded-lg px-4 py-2.5 text-white placeholder-muted border border-white/5 focus:border-primary outline-none"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-muted ml-1">價格</label>
                        <input 
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-background rounded-lg px-4 py-2.5 text-white placeholder-muted border border-white/5 focus:border-primary outline-none"
                        />
                    </div>
                </div>
                <button 
                    onClick={handleTransaction}
                    className="w-full bg-primary text-background font-bold py-3 rounded-lg mt-2 active:scale-95 transition-transform"
                >
                    {txType === 'buy' ? '加入組合' : '記錄賣出'}
                </button>
            </div>
        </div>
      )}

      {/* Holdings List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-20">
         <div className="flex justify-between items-center px-1 mb-2">
             <h3 className="text-sm font-bold text-muted uppercase tracking-wider">持倉明細</h3>
         </div>
         
         {portfolio.map(holding => {
             const quote = quotes[holding.symbol];
             const hasPrice = quote && quote.price > 0;
             const currentPrice = hasPrice ? quote.price : 0;
             const marketValue = currentPrice * holding.totalShares;
             const gain = marketValue - (holding.avgCost * holding.totalShares);
             const gainPercent = (gain / (holding.avgCost * holding.totalShares)) * 100;

             return (
                 <div key={holding.symbol} className="bg-surface p-4 rounded-xl border border-white/5 flex justify-between items-center hover:bg-surface/80 transition-colors">
                     <div className="flex items-center gap-3 min-w-0">
                         <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-xs font-bold border border-white/10 text-white flex-shrink-0">
                             {holding.symbol.substring(0, 4)}
                         </div>
                         <div className="min-w-0">
                             <h4 className="font-bold text-white truncate">{holding.symbol}</h4>
                             <p className="text-xs text-muted truncate">{holding.totalShares} 股 • 均價 ${holding.avgCost.toFixed(2)}</p>
                         </div>
                     </div>
                     <div className="text-right flex-shrink-0">
                         {hasPrice ? (
                            <>
                                <p className="font-bold text-white">${marketValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${gain >= 0 ? 'text-primary' : 'text-danger'}`}>
                                    {gain >= 0 ? <ArrowUp className="w-3 h-3 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 flex-shrink-0" />}
                                    {Math.abs(gainPercent).toFixed(2)}%
                                </div>
                            </>
                         ) : (
                             <>
                                <p className="font-bold text-white/50 text-sm">---</p>
                                <p className="text-xs text-muted mt-1">等待更新</p>
                             </>
                         )}
                     </div>
                 </div>
             );
         })}
         
         {portfolio.length === 0 && (
             <div className="flex flex-col items-center justify-center py-12 text-muted gap-2 border border-dashed border-white/10 rounded-xl bg-surface/50">
                 <Wallet className="w-8 h-8 opacity-50" />
                 <p className="text-sm">尚無持倉，點擊右上角 + 新增。</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default Portfolio;