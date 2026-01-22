
export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string; // ISO string
  type: TransactionType;
  note: string;
}

export interface Holding {
  symbol: string;
  totalShares: number;
  avgCost: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  changePercent: number;
}

export enum AppRoute {
  HOME = 'HOME',
  EXPENSE = 'EXPENSE',
  PORTFOLIO = 'PORTFOLIO',
  ANALYSIS = 'ANALYSIS'
}

export const CATEGORIES = [
  { id: 'salary', name: '薪水', icon: 'Banknote', color: '#10B981' },
  { id: 'food', name: '餐飲', icon: 'Utensils', color: '#EF4444' },
  { id: 'transport', name: '交通', icon: 'Bus', color: '#3B82F6' },
  { id: 'shopping', name: '購物', icon: 'ShoppingBag', color: '#F59E0B' },
  { id: 'entertainment', name: '娛樂', icon: 'Film', color: '#EC4899' },
  { id: 'others', name: '其他', icon: 'MoreHorizontal', color: '#6B7280' },
];
