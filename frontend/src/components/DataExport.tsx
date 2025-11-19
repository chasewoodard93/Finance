import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * DataExport Component
 * 
 * Provides data export functionality for budget reports in PDF and Excel formats.
 * Supports exporting variance reports, P&L statements, and budget data.
 * 
 * Note: Requires jspdf and xlsx libraries:
 * npm install jspdf jspdf-autotable xlsx
 */

interface DataExportProps {
  data: any[];
  fileName?: string;
  reportType?: 'variance' | 'pl' | 'budget';
}

const DataExport: React.FC<DataExportProps> = ({ 
  data, 
  fileName = 'budget-report', 
  reportType = 'budget' 
}) => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Export data to Excel format
   */
  const exportToExcel = () => {
    try {
      setExporting(true);
      setError(null);

      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      
      // Generate Excel file
      XLSX.writeFile(wb, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setExporting(false);
    } catch (err) {
      setError('Failed to export to Excel');
      setExporting(false);
      console.error('Excel export error:', err);
    }
  };

  /**
   * Export data to PDF format
   */
  const exportToPDF = () => {
    try {
      setExporting(true);
      setError(null);

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`${reportType.toUpperCase()} Report`, 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
      
      // Prepare table data
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      const rows = data.map(item => headers.map(header => item[header]));
      
      // Add table
      (doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Save PDF
      doc.save(`${fileName}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setExporting(false);
    } catch (err) {
      setError('Failed to export to PDF');
      setExporting(false);
      console.error('PDF export error:', err);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={exportToExcel}
        disabled={exporting || data.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {exporting ? 'Exporting...' : 'Export to Excel'}
      </button>

      <button
        onClick={exportToPDF}
        disabled={exporting || data.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        {exporting ? 'Exporting...' : 'Export to PDF'}
      </button>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      {data.length === 0 && (
        <div className="text-gray-500 text-sm">
          No data available to export
        </div>
      )}
    </div>
  );
};

export default DataExport;
