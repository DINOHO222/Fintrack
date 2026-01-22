import { Expense, Holding } from '../types';

const EXPENSES_KEY = 'fintrack_expenses';
const PORTFOLIO_KEY = 'fintrack_portfolio';

export const storageService = {
  getExpenses: (): Expense[] => {
    try {
      const data = localStorage.getItem(EXPENSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load expenses', e);
      return [];
    }
  },

  saveExpense: (expense: Expense) => {
    const expenses = storageService.getExpenses();
    const updated = [expense, ...expenses];
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
    return updated;
  },

  getPortfolio: (): Holding[] => {
    try {
      const data = localStorage.getItem(PORTFOLIO_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load portfolio', e);
      return [];
    }
  },

  updateHolding: (symbol: string, shares: number, price: number, isBuy: boolean) => {
    const portfolio = storageService.getPortfolio();
    const existingIndex = portfolio.findIndex(h => h.symbol === symbol);
    let updatedPortfolio = [...portfolio];

    if (existingIndex > -1) {
      const holding = updatedPortfolio[existingIndex];
      if (isBuy) {
        // Weighted Average Cost
        const totalCost = (holding.totalShares * holding.avgCost) + (shares * price);
        const newTotalShares = holding.totalShares + shares;
        updatedPortfolio[existingIndex] = {
          symbol,
          totalShares: newTotalShares,
          avgCost: totalCost / newTotalShares
        };
      } else {
        // Sell - Reduces shares, avg cost remains same (FIFO/LIFO logic simplified)
        const newTotalShares = holding.totalShares - shares;
        if (newTotalShares <= 0) {
          updatedPortfolio = updatedPortfolio.filter(h => h.symbol !== symbol);
        } else {
          updatedPortfolio[existingIndex] = {
            ...holding,
            totalShares: newTotalShares
          };
        }
      }
    } else if (isBuy) {
      updatedPortfolio.push({
        symbol,
        totalShares: shares,
        avgCost: price
      });
    }

    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(updatedPortfolio));
    return updatedPortfolio;
  }
};