import React, { useState, useEffect } from 'react';
import { apiClient, VarianceReport as VarianceReportType } from '../api/client';

interface VarianceReportProps {
  practiceId: number;
  periodId: number;
}

const VarianceReport: React.FC<VarianceReportProps> = ({ practiceId, periodId }) => {
  const [report, setReport] = useState<VarianceReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (practiceId && periodId) {
      loadReport();
    }
  }, [practiceId, periodId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getVarianceReport(practiceId, periodId);
      if (response.data) {
        setReport(response.data);
      }
    } catch (err) {
      setError('Failed to load variance report');
      console.error('Error loading variance report:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-xl">Loading variance report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadReport}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">No variance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Variance Analysis Report</h2>
        <div className="text-gray-600">
          <p className="font-medium">{report.practice.name}</p>
          <p className="text-sm">{report.practice.location}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Budget</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(report.total_budget)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Actual</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(report.total_actual)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Variance</h3>
          <p className={`text-2xl font-bold ${getVarianceColor(report.total_variance)}`}>
            {formatCurrency(report.total_variance)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Variance %</h3>
          <p className={`text-2xl font-bold ${getVarianceColor(report.total_variance)}`}>
            {report.variance_percentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Detailed Line Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Line Item Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.line_items && report.line_items.length > 0 ? (
                report.line_items.map((item: any, index: number) => {
                  const variance = (item.actual || 0) - (item.amount || 0);
                  const variancePercent = item.amount ? ((variance / item.amount) * 100).toFixed(2) : '0.00';
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.account_category_id || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(item.amount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(item.actual || 0)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getVarianceColor(variance)}`}>
                        {formatCurrency(variance)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getVarianceColor(variance)}`}>
                        {variancePercent}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No line items available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

export default VarianceReport;
