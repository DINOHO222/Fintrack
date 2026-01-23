import axios from 'axios';
import { StockQuote } from '../types';

// Step 1: Environment Check & Fallback
// Default to Finnhub URL if not set, but warn about Key
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://finnhub.io/api/v1';
const API_KEY = import.meta.env.VITE_STOCK_API_KEY;

// Debug Log for Environment Variables (Safety Masked)
const maskedKey = API_KEY ? `${API_KEY.substring(0, 3)}...` : 'MISSING';
if (import.meta.env.DEV) {
  console.log(`[StockService] Environment Check - BaseURL: ${API_BASE_URL}, API Key: ${maskedKey}`);
}

export const fetchStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  const cleanSymbol = symbol ? symbol.toUpperCase() : '';

  try {
    // Basic Validation
    if (!cleanSymbol) throw new Error('Symbol is required');
    if (!API_KEY) throw new Error('VITE_STOCK_API_KEY is missing in .env');

    // Step 2: API Call with Token
    const response = await axios.get(`${API_BASE_URL}/quote`, {
      params: {
        symbol: cleanSymbol,
        token: API_KEY
      }
    });

    const { c, dp } = response.data;

    // Step 3: Validate Logic (Detect invalid symbol response from Finnhub)
    // Finnhub returns { c: 0, dp: null/0 } for invalid symbols
    const isInvalidResponse = c === 0 && (dp === null || dp === undefined || dp === 0);

    if (isInvalidResponse) {
      throw new Error(`Finnhub returned empty data for ${cleanSymbol} (Symbol likely invalid)`);
    }

    // Success Log (Development only)
    if (import.meta.env.DEV) {
      console.log(`[API Success] ${cleanSymbol}: $${c}`);
    }

    return {
      symbol: cleanSymbol,
      price: c,
      changePercent: dp ?? 0
    };

  } catch (error) {
    // Step 4: Strict Error Handling (No Mock Data)
    console.error(`[API Failed] Fetch failed for ${cleanSymbol}`, error);
    return null;
  }
};

export const fetchMultipleQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  // Using Promise.all to fetch in parallel and filter out failures
  const results = await Promise.all(symbols.map(s => fetchStockQuote(s)));
  return results.filter((q): q is StockQuote => q !== null);
};
