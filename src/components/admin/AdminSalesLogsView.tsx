import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { SaleInvoice, PurchaseInvoice } from '../../types/pharmacy';
import {
  FileText,
  Search,
  Printer,
  Calendar,
  Eye,
  ShoppingBag,
  Truck,
  CreditCard,
  Banknote,
  Clock,
  X,
} from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';

export const AdminSalesLogsView: React.FC = () => {
  const { state } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<SaleInvoice | null>(null);

  // Filter sales
  const filteredSales = state.sales.filter(s => {
    if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.invoiceNumber.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.customerPhone && s.customerPhone.includes(q)) ||
      s.cashierName.toLowerCase().includes(q)
    );
  });

  // Filter purchases
  const filteredPurchases = state.purchases.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.invoiceNumber.toLowerCase().includes(q) ||
      p.supplierName.toLowerCase().includes(q) ||
      (p.supplierInvoiceRef && p.supplierInvoiceRef.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Title & Tabs */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              سجل الفواتير والمشتريات الشامل
            </h2>
            <p className="text-xs text-slate-500">
              استعراض كامل فواتير نقطة البيع وتوريدات الموردين مع إمكانية إعادة الطباعة
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'sales'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            فواتير المبيعات ({state.sales.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'purchases'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            فواتير المشتريات ({state.purchases.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الفاتورة، العميل، الكاشير..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          {activeTab === 'sales' && (
            <div>
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              >
                <option value="all">جميع طرق الدفع</option>
                <option value="cash">نقداً (كاش)</option>
                <option value="card">بطاقة بنكية (شبكة)</option>
                <option value="credit">آجل (ذمم)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {activeTab === 'sales' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">رقم الفاتورة</th>
                  <th className="py-3 px-3">التاريخ والوقت</th>
                  <th className="py-3 px-3">العميل</th>
                  <th className="py-3 px-3">الكاشير</th>
                  <th className="py-3 px-3 text-center">طريقة الدفع</th>
                  <th className="py-3 px-3 text-center">عدد الأصناف</th>
                  <th className="py-3 px-3 text-left">الإجمالي الصافي</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono">
                {filteredSales.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {inv.date} {inv.time}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-700 dark:text-slate-300">
                      {inv.customerName || 'عميل نقدي'}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-500 text-[11px]">
                      {inv.cashierName}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {inv.paymentMethod === 'cash' ? 'نقداً' : inv.paymentMethod === 'card' ? 'شبكة' : 'آجل'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">{inv.items.length}</td>
                    <td className="py-3 px-3 text-left font-bold text-teal-600 dark:text-teal-400">
                      {inv.total.toFixed(2)} {state.settings.currency}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inv.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {inv.status === 'completed' ? 'ناجحة' : 'تم استرجاعها'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForReceipt(inv)}
                        className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1 mx-auto transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>معاينة وطباعة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">رقم الفاتورة</th>
                  <th className="py-3 px-3">التاريخ</th>
                  <th className="py-3 px-3">المورد</th>
                  <th className="py-3 px-3">فاتورة المورد الورقية</th>
                  <th className="py-3 px-3 text-center">الأصناف الموردة</th>
                  <th className="py-3 px-3 text-left">إجمالي الفاتورة</th>
                  <th className="py-3 px-3 text-left">المدفوع نقداً</th>
                  <th className="py-3 px-3 text-left">المتبقي (آجل)</th>
                  <th className="py-3 px-3">المسجل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono">
                {filteredPurchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{p.date}</td>
                    <td className="py-3 px-3 font-sans font-bold text-slate-700 dark:text-slate-300">
                      {p.supplierName}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {p.supplierInvoiceRef || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">{p.items.length} أصناف</td>
                    <td className="py-3 px-3 text-left font-bold text-teal-600 dark:text-teal-400">
                      {p.total.toFixed(2)} {state.settings.currency}
                    </td>
                    <td className="py-3 px-3 text-left text-slate-600">
                      {p.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-left font-bold text-amber-600">
                      {p.remainingAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-500 text-[11px]">
                      {p.registeredBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        invoice={selectedInvoiceForReceipt}
        onClose={() => setSelectedInvoiceForReceipt(null)}
      />
    </div>
  );
};
