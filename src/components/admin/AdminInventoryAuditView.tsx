import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  Layers,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export const AdminInventoryAuditView: React.FC = () => {
  const { state } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');

  const filteredLogs = state.inventoryLog.filter(log => {
    if (reasonFilter !== 'all' && log.reason !== reasonFilter) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      log.productName.toLowerCase().includes(q) ||
      (log.notes && log.notes.toLowerCase().includes(q)) ||
      log.user.toLowerCase().includes(q)
    );
  });

  const reasonLabels: { [key: string]: string } = {
    sale: 'مبيعات (صرف)',
    purchase: 'مشتريات (توريد)',
    return: 'مرتجع مبيعات',
    adjustment: 'تسوية جرد يدوي',
    expired: 'تالف أو منتهي',
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              سجل حركات المخزون والرقابة الدوائية (Inventory Audit)
            </h2>
            <p className="text-xs text-slate-500">
              تتبع زمني دقيق لكل علبة دواء دخلت أو خرجت من الصيدلية مع توثيق اسم المستخدم
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالصنف، الملاحظات، أو المستخدم..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <select
              value={reasonFilter}
              onChange={e => setReasonFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            >
              <option value="all">جميع أسباب الحركة (صرف، توريد، تسوية، مرتجع)</option>
              <option value="sale">صرف مبيعات</option>
              <option value="purchase">توريد مشتريات</option>
              <option value="return">مرتجع مبيعات</option>
              <option value="adjustment">تسوية جرد</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-3">اسم الصنف</th>
                <th className="py-3 px-3 text-center">نوع الحركة</th>
                <th className="py-3 px-3 text-center">الكمية المتغيرة</th>
                <th className="py-3 px-3 text-center">الرصيد المتبقي</th>
                <th className="py-3 px-3">البيان والمستند</th>
                <th className="py-3 px-4">الموظف المسؤول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono">
              {filteredLogs.map(log => {
                const isAddition = log.changeQty > 0;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750">
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {log.date}
                    </td>
                    <td className="py-3 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">
                      {log.productName}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {reasonLabels[log.reason] || log.reason}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isAddition ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {isAddition ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{isAddition ? `+${log.changeQty}` : log.changeQty}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {log.remainingQty}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-600 dark:text-slate-400 text-[11px]">
                      {log.notes || '-'}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                      {log.user}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
