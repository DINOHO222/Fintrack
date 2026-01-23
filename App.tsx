import React, { useState, useEffect } from 'react';
import { Expense, Holding, AppRoute } from './types';
import { storageService } from './services/storageService';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExpenseTracker from './pages/ExpenseTracker';
import Portfolio from './pages/Portfolio';
import Analysis from './pages/Analysis';

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExpenses(storageService.getExpenses());
    setPortfolio(storageService.getPortfolio());
  };

  const handleNavigate = (newRoute: AppRoute) => {
    setRoute(newRoute);
  };

  const renderScreen = () => {
    switch (route) {
      case AppRoute.HOME:
        return <Home expenses={expenses} portfolio={portfolio} onNavigate={handleNavigate} onUpdate={loadData} />;
      case AppRoute.EXPENSE:
        return <ExpenseTracker onBack={() => setRoute(AppRoute.HOME)} onSave={loadData} />;
      case AppRoute.PORTFOLIO:
        return <Portfolio portfolio={portfolio} onUpdate={loadData} />;
      case AppRoute.ANALYSIS:
        return <Analysis expenses={expenses} onBack={() => setRoute(AppRoute.HOME)} />;
      default:
        return <Home expenses={expenses} portfolio={portfolio} onNavigate={handleNavigate} />;
    }
  };

  const isFullScreen = route === AppRoute.EXPENSE;

  if (isFullScreen) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center">
        <div className="w-full max-w-md h-[100dvh] bg-background relative shadow-2xl overflow-hidden border-x border-white/5">
          {renderScreen()}
        </div>
      </div>
    );
  }

  return (
    <Layout currentRoute={route} onNavigate={handleNavigate}>
      {renderScreen()}
    </Layout>
  );
};

export default App;
