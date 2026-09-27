import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  FileText,
  Activity,
  Calendar,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const AdminDashboardView: React.FC = () => {
  const { state, manualTreasuryAction, showToast } = usePharmacy();

  // Manual Treasury Action State
  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'manual_deposit' | 'manual_withdrawal'>('manual_deposit');
  const [actionAmount, setActionAmount] = useState<string>('');
  const [actionTitle, setActionTitle] = useState<string>('');

  // Calculations
  const totalSales = state.sales.reduce((acc, s) => acc + s.total, 0);
  const totalPurchases = state.purchases.reduce((acc, p) => acc + p.total, 0);
  const totalExpenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalReturns = state.returns.reduce((acc, r) => acc + r.totalRefund, 0);

  // Profit calculation: (Sales Revenue - Cost of Sold Items) - Expenses
  let totalCostOfGoodsSold = 0;
  state.sales.forEach(sale => {
    sale.items.forEach(it => {
      totalCostOfGoodsSold += (it.cost || 0) * it.qty;
    });
  });

  const grossProfit = totalSales - totalCostOfGoodsSold;
  const netProfit = grossProfit - totalExpenses;

  // Inventory valuation
  const inventoryCostValue = state.products.reduce((acc, p) => acc + p.cost * p.qty, 0);
  const inventoryRetailValue = state.products.reduce((acc, p) => acc + p.price * p.qty, 0);
  const potentialProfitInStock = inventoryRetailValue - inventoryCostValue;

  // Stock alerts
  const lowStockCount = state.products.filter(p => p.qty <= p.minQty && p.qty > 0).length;
  const outOfStockCount = state.products.filter(p => p.qty === 0).length;

  const handleTreasurySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(actionAmount);
    if (val <= 0 || !actionTitle.trim()) {
      sounds.playError();
      showToast('يرجى كتابة سبب الحركة وقيمة صالحة', 'error');
      return;
    }
    manualTreasuryAction(actionType, val, actionTitle);
    setIsTreasuryModalOpen(false);
    setActionAmount('');
    setActionTitle('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header Summary & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            لوحة الإدارة والتقارير المالية التنفيذية
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة السيولة النقدية، حركة الخزينة، الأرباح والخسائر، وتقييم المخزون الحي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActionType('manual_deposit');
              setActionTitle('إيداع سيولة نقدية بالخزينة');
              setIsTreasuryModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إيداع بالخزينة</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActionType('manual_withdrawal');
              setActionTitle('سحب نقدي من الخزينة');
              setIsTreasuryModalOpen(true);
            }}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-colors"
          >
            <MinusCircle className="w-4 h-4" />
            <span>سحب من الخزينة</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Treasury Balance */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">رصيد الخزينة الحالي</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-teal-700 dark:text-teal-400">
            {state.treasury.balance.toFixed(2)} <span className="text-xs font-sans">{state.settings.currency}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            السيولة النقدية المتوفرة حالياً بالصندوق
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">صافي الأرباح (بعد المصروفات)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {netProfit.toFixed(2)} <span className="text-xs font-sans">{state.settings.currency}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
            <span>مجمل الربح: {grossProfit.toFixed(2)}</span>
            <span>·</span>
            <span>المصروفات: {totalExpenses.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">إجمالي المبيعات</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
            {totalSales.toFixed(2)} <span className="text-xs font-sans">{state.settings.currency}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            من خلال {state.sales.length} فواتير مباعة
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">إجمالي المصروفات</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-red-600 dark:text-red-400">
            {totalExpenses.toFixed(2)} <span className="text-xs font-sans">{state.settings.currency}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            تشمل فواتير، إيجار، رواتب ومستهلكات
          </p>
        </div>
      </div>

      {/* Stock Valuation & Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Inventory Valuation */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" />
            <span>تقييم المخزون الحالي</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
              <span className="text-slate-500">القيمة الإجمالية بسعر التكلفة:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {inventoryCostValue.toFixed(2)} {state.settings.currency}
              </span>
            </div>

            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
              <span className="text-slate-500">القيمة الإجمالية بسعر البيع:</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                {inventoryRetailValue.toFixed(2)} {state.settings.currency}
              </span>
            </div>

            <div className="flex justify-between p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl text-emerald-800 dark:text-emerald-300">
              <span className="font-medium">الربح المتوقع عند بيع المخزون:</span>
              <span className="font-mono font-bold">
                +{potentialProfitInStock.toFixed(2)} {state.settings.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Stock Alerts & Shortages */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>تنبيهات النواقص بالمخزون</span>
            </span>
            <span className="text-amber-600 font-mono font-bold">{lowStockCount + outOfStockCount} صنف</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-48 overflow-y-auto pr-1 text-xs">
            {state.products
              .filter(p => p.qty <= p.minQty)
              .map(p => (
                <div key={p.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-400">المورد: {p.supplier}</div>
                  </div>
                  <div className="text-left font-mono">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        p.qty === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.qty === 0 ? 'نفد تماماً' : `متبقي: ${p.qty}`}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">حد الطلب: {p.minQty}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Supplier Balances Summary */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between">
            <span>مستحقات الموردين الآجلة</span>
            <span className="font-mono text-amber-600 font-bold">
              {state.suppliers.reduce((acc, s) => acc + s.balance, 0).toFixed(2)} {state.settings.currency}
            </span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-48 overflow-y-auto pr-1 text-xs">
            {state.suppliers.map(s => (
              <div key={s.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
                  <div className="text-[10px] text-slate-400">{s.phone}</div>
                </div>
                <div className="font-mono font-bold text-amber-600">
                  {s.balance.toFixed(2)} {state.settings.currency}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Treasury Transactions & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Treasury transactions */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-teal-600" />
              <span>آخر حركات الخزينة والنقدية</span>
            </span>
            <span className="text-[11px] text-slate-400">آخر 10 حركات</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-72 overflow-y-auto pr-1 text-xs">
            {state.treasury.transactions.slice(0, 10).map(tx => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{tx.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {tx.date} {tx.time} · بواسطة: {tx.registeredBy}
                  </div>
                </div>
                <div className="text-left font-mono">
                  <div
                    className={`font-bold text-xs ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} {state.settings.currency}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    رصيد بعدها: {tx.balanceAfter.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>سجل الرقابة والعمليات الحساسة (Audit Log)</span>
            </span>
            <span className="text-[11px] text-slate-400">آخر العمليات</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-72 overflow-y-auto pr-1 text-xs">
            {state.auditLog.slice(0, 10).map(log => (
              <div key={log.id} className="py-2.5">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                  <span className="text-[10px] font-mono text-slate-400">{log.date} {log.time}</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">{log.details}</div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">المستخدم: {log.user}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Treasury Deposit/Withdraw Modal */}
      {isTreasuryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">
              {actionType === 'manual_deposit' ? 'إيداع نقدي في الخزينة' : 'سحب نقدي من الخزينة'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              تسجيل حركة يدوية لتحديث رصيد الصندوق وإثباتها في سجل الخزينة
            </p>

            <form onSubmit={handleTreasurySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">المبلغ *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={actionAmount}
                  onChange={e => setActionAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 font-mono text-base font-bold text-center text-teal-600"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">بيان وسبب الحركة *</label>
                <input
                  type="text"
                  required
                  value={actionTitle}
                  onChange={e => setActionTitle(e.target.value)}
                  placeholder="مثال: توريد نقدي، تسوية بنكية، سحب مالك..."
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTreasuryModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm"
                >
                  تأكيد الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
