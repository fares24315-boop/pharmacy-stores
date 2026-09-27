import React, { useState } from 'react';
import { POSView } from './POSView';
import { ReturnsView } from './ReturnsView';
import { PurchasesView } from './PurchasesView';
import { ProductsView } from './ProductsView';
import { SuppliersView } from './SuppliersView';
import { DailyReportView } from './DailyReportView';
import {
  ShoppingCart,
  RotateCcw,
  Package,
  Truck,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';

export const PharmacyPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'returns' | 'purchases' | 'products' | 'suppliers' | 'reports'>('pos');

  return (
    <div className="space-y-4">
      {/* Sub-navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'pos'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>نقطة البيع (POS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'returns'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>مرتجع المبيعات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'purchases'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>فاتورة مشتريات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأصناف والمخزون</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('suppliers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'suppliers'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>الموردين وحساباتهم</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>التقارير وتقفيل الشفت</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <main className="min-h-[500px]">
        {activeTab === 'pos' && <POSView />}
        {activeTab === 'returns' && <ReturnsView />}
        {activeTab === 'purchases' && <PurchasesView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'suppliers' && <SuppliersView />}
        {activeTab === 'reports' && <DailyReportView />}
      </main>
    </div>
  );
};
