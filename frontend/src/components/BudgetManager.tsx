import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';

interface BudgetLine {
  id: number;
  category_id: number;
  category_name: string;
  amount: number;
  is_editable: boolean;
}

interface BudgetManagerProps {
  fiscalYearId: number;
  periodId: number;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ fiscalYearId, periodId }) => {
  const { budgetLines, categories, updateBudgetLine, deleteBudgetLine } = useBudget();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter budget lines for the current period
  const currentBudgetLines = budgetLines.filter(
    (line) => line.period_id === periodId
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (line: BudgetLine) => {
    setEditingId(line.id);
    setEditAmount(line.amount.toString());
  };

  const handleSave = async (lineId: number) => {
    try {
      const amount = parseFloat(editAmount);
      if (isNaN(amount) || amount < 0) {
        setError('Please enter a valid positive number');
        return;
      }
      await updateBudgetLine(lineId, { amount });
      setEditingId(null);
      setEditAmount('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget line');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditAmount('');
    setError(null);
  };

  const handleDelete = async (lineId: number) => {
    if (window.confirm('Are you sure you want to delete this budget line?')) {
      try {
        await deleteBudgetLine(lineId);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete budget line');
      }
    }
  };

  const handleAdd = async () => {
    if (!selectedCategory || !newAmount) {
      setError('Please select a category and enter an amount');
      return;
    }

    try {
      const amount = parseFloat(newAmount);
      if (isNaN(amount) || amount < 0) {
        setError('Please enter a valid positive number');
        return;
      }

      // This would call the API to create a new budget line
      // await apiClient.createBudgetLine({
      //   period_id: periodId,
      //   category_id: selectedCategory,
      //   amount: amount,
      // });

      setShowAddForm(false);
      setSelectedCategory(null);
      setNewAmount('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add budget line');
    }
  };

  const getTotalBudget = (): number => {
    return currentBudgetLines.reduce((sum, line) => sum + line.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Manager</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Budget: {formatCurrency(getTotalBudget())}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          Add Budget Line
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Budget Line</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedCategory(null);
                  setNewAmount('');
                  setError(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Lines Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBudgetLines.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                    No budget lines found. Click "Add Budget Line" to create one.
                  </td>
                </tr>
              ) : (
                currentBudgetLines.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {line.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {editingId === line.id ? (
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-32 px-2 py-1 border border-blue-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        formatCurrency(line.amount)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {editingId === line.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSave(line.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {line.is_editable && (
                            <>
                              <button
                                onClick={() => handleEdit(line)}
                                className="px-3 py-1 text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(line.id)}
                                className="px-3 py-1 text-red-600 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {!line.is_editable && (
                            <span className="text-gray-400 text-xs">Calculated</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-gray-900">
                  {formatCurrency(getTotalBudget())}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-900 font-medium">Budget Management Tips</p>
            <p className="text-sm text-blue-700 mt-1">
              Calculated budget lines (like formulas) cannot be edited directly. Edit the source categories instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;
