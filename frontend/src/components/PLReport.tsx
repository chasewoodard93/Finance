import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { PLReport as PLReportType } from '../api/client';

interface PLReportProps {
  practiceId: number;
  periodId: number;
}

const PLReport: React.FC<PLReportProps> = ({ practiceId, periodId }) => {
  const [report, setReport] = useState<PLReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getPLReport(practiceId, periodId);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load P&L report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [practiceId, periodId]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getNetIncomeColor = (netIncome: number): string => {
    return netIncome >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading P&L report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const netIncome = report.total_revenue - report.total_expenses;
  const netIncomeMargin = report.total_revenue > 0 ? (netIncome / report.total_revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h2>
        <p className="text-sm text-gray-600 mt-1">
          {report.practice_name} - {report.location}
        </p>
        <p className="text-sm text-gray-600">
          Period: {new Date(report.period_start_date).toLocaleDateString()} - {new Date(report.period_end_date).toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-900 mt-2">
            {formatCurrency(report.total_revenue)}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-orange-600 font-medium">Total Expenses</div>
          <div className="text-2xl font-bold text-orange-900 mt-2">
            {formatCurrency(report.total_expenses)}
          </div>
        </div>
        <div className={`${netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4`}>
          <div className={`text-sm font-medium ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Net Income
          </div>
          <div className={`text-2xl font-bold mt-2 ${getNetIncomeColor(netIncome)}`}>
            {formatCurrency(netIncome)}
          </div>
        </div>
        <div className={`${netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4`}>
          <div className={`text-sm font-medium ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Net Margin
          </div>
          <div className={`text-2xl font-bold mt-2 ${getNetIncomeColor(netIncome)}`}>
            {netIncomeMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="bg-blue-100 px-6 py-3">
          <h3 className="text-lg font-semibold text-blue-900">Revenue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.revenue_categories.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(category.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {((category.amount / report.total_revenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                  Total Revenue
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-900">
                  {formatCurrency(report.total_revenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-900">
                  100.0%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="bg-orange-100 px-6 py-3">
          <h3 className="text-lg font-semibold text-orange-900">Expenses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.expense_categories.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {formatCurrency(category.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {((category.amount / report.total_revenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-orange-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-900">
                  Total Expenses
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-900">
                  {formatCurrency(report.total_expenses)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-900">
                  {((report.total_expenses / report.total_revenue) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Income Summary */}
      <div className={`${netIncome >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-lg font-semibold ${getNetIncomeColor(netIncome)}`}>
              Net Income
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {netIncome >= 0 ? 'Profit' : 'Loss'} for the period
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getNetIncomeColor(netIncome)}`}>
              {formatCurrency(netIncome)}
            </div>
            <div className={`text-lg font-medium mt-1 ${getNetIncomeColor(netIncome)}`}>
              {netIncomeMargin.toFixed(1)}% margin
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Export to PDF
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default PLReport;
