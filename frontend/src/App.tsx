import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BudgetProvider } from './context/BudgetContext';
import { Dashboard, VarianceReport, PLReport, BudgetManager } from './components';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [selectedPracticeId, setSelectedPracticeId] = useState<number>(1);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number>(1);
  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<number>(1);

  return (
    <QueryClientProvider client={queryClient}>
      <BudgetProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dental Budget Application
                  </h1>
                  <div className="flex space-x-4">
                    <Link
                      to="/"
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/variance"
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Variance Report
                    </Link>
                    <Link
                      to="/pl-report"
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                    >
                      P&L Report
                    </Link>
                    <Link
                      to="/budget-manager"
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Budget Manager
                    </Link>
                  </div>
                </nav>
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
              <Routes>
                {/* Dashboard Route */}
                <Route
                  path="/"
                  element={<Dashboard />}
                />

                {/* Variance Report Route */}
                <Route
                  path="/variance"
                  element={
                    <VarianceReport
                      practiceId={selectedPracticeId}
                      periodId={selectedPeriodId}
                    />
                  }
                />

                {/* P&L Report Route */}
                <Route
                  path="/pl-report"
                  element={
                    <PLReport
                      practiceId={selectedPracticeId}
                      periodId={selectedPeriodId}
                    />
                  }
                />

                {/* Budget Manager Route */}
                <Route
                  path="/budget-manager"
                  element={
                    <BudgetManager
                      fiscalYearId={selectedFiscalYearId}
                      periodId={selectedPeriodId}
                    />
                  }
                />

                {/* Fallback Route */}
                <Route
                  path="*"
                  element={
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Page Not Found
                      </h2>
                      <p className="text-gray-600 mb-4">
                        The page you're looking for doesn't exist.
                      </p>
                      <Link
                        to="/"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t mt-8">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <p className="text-center text-gray-600 text-sm">
                  © 2026 Dental Budget Management Platform. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </BudgetProvider>
    </QueryClientProvider>
  );
}

export default App;
