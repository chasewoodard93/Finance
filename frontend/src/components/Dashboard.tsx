import React, { useState, useEffect } from 'react';
import { apiClient, Practice } from '../api/client';
import { useBudget } from '../hooks/useBudget';

interface DashboardProps {
  onPracticeSelect?: (practice: Practice) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPracticeSelect }) => {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { budgets, loading: budgetsLoading } = useBudget(
    selectedPractice?.id.toString() || '',
    new Date().getFullYear()
  );

  useEffect(() => {
    loadPractices();
  }, []);

  const loadPractices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPractices();
      if (response.data) {
        setPractices(response.data);
        if (response.data.length > 0) {
          handlePracticeSelect(response.data[0]);
        }
      }
    } catch (err) {
      setError('Failed to load practices');
      console.error('Error loading practices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeSelect = (practice: Practice) => {
    setSelectedPractice(practice);
    onPracticeSelect?.(practice);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Budget Dashboard</h1>
        <p className="text-gray-600 mt-2">Dental Practice Financial Management</p>
      </div>

      {/* Practice Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Practice
        </label>
        <select
          value={selectedPractice?.id || ''}
          onChange={(e) => {
            const practice = practices.find(p => p.id === parseInt(e.target.value));
            if (practice) handlePracticeSelect(practice);
          }}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {practices.map(practice => (
            <option key={practice.id} value={practice.id}>
              {practice.name} - {practice.location}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {selectedPractice && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Practice</h3>
            <p className="text-2xl font-bold text-gray-900">{selectedPractice.name}</p>
            <p className="text-sm text-gray-500 mt-1">{selectedPractice.location}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
            <p className="text-2xl font-bold text-green-600">{selectedPractice.status}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Budget Entries</h3>
            <p className="text-2xl font-bold text-gray-900">
              {budgetsLoading ? '...' : budgets.length}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            View Budgets
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Add Budget
          </button>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Variance Report
          </button>
          <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
            P&L Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
