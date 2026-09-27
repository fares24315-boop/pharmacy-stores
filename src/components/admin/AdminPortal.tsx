import React, { useState } from 'react';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminTreasuryExpensesView } from './AdminTreasuryExpensesView';
import { AdminSalesLogsView } from './AdminSalesLogsView';
import { AdminInventoryAuditView } from './AdminInventoryAuditView';
import { AdminUsersView } from './AdminUsersView';
import { AdminSettingsBackupView } from './AdminSettingsBackupView';
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Layers,
  Users,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'treasury' | 'invoices' | 'inventory' | 'users' | 'settings'>('overview');

  return (
    <div className="space-y-4">
      {/* Admin Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-900 dark:bg-teal-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة الإدارة والأرباح</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('treasury')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'treasury'
                ? 'bg-slate-900 dark:bg-teal-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>الخزينة والمصروفات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'bg-slate-900 dark:bg-teal-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>سجل الفواتير والمشتريات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-slate-900 dark:bg-teal-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>رقابة حركات المخزون</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-slate-900 dark:bg-teal-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الموظفين والصلاحيات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-900 dark:bg-teal-700 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>الإعدادات والنسخ الاحتياطي</span>
          </button>
        </nav>
      </div>

      {/* Main Tab View */}
      <main className="min-h-[500px]">
        {activeTab === 'overview' && <AdminDashboardView />}
        {activeTab === 'treasury' && <AdminTreasuryExpensesView />}
        {activeTab === 'invoices' && <AdminSalesLogsView />}
        {activeTab === 'inventory' && <AdminInventoryAuditView />}
        {activeTab === 'users' && <AdminUsersView />}
        {activeTab === 'settings' && <AdminSettingsBackupView />}
      </main>
    </div>
  );
};
