import { StockQuote } from '../types';

// Currently, this service returns a placeholder since we don't have a live API connection yet.
// In the future, replace this with a real API call (e.g., Yahoo Finance, Fugle).

export const fetchStockQuote = async (symbol: string): Promise<StockQuote> => {
  return Promise.resolve({
    symbol: symbol.toUpperCase(),
    price: 0, // 0 indicates no price data available
    changePercent: 0
  });
};

export const fetchMultipleQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  return Promise.all(symbols.map(s => fetchStockQuote(s)));
};