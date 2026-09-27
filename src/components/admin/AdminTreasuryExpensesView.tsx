import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Expense } from '../../types/pharmacy';
import {
  Wallet,
  Receipt,
  Plus,
  Filter,
  DollarSign,
  TrendingDown,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const AdminTreasuryExpensesView: React.FC = () => {
  const { state, addExpense, showToast } = usePharmacy();

  // Expense form state
  const [expenseTitle, setExpenseTitle] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('rent');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseNotes, setExpenseNotes] = useState<string>('');

  // Filters
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [treasuryTypeFilter, setTreasuryTypeFilter] = useState<string>('all');

  const categoriesMap: { [key in Expense['category']]: string } = {
    rent: 'إيجار المحل',
    electricity: 'كهرباء ومياه وخدمات',
    salaries: 'رواتب موظفين',
    maintenance: 'صيانة ونظافة',
    supplies: 'مستهلكات وأدوات',
    other: 'مصروفات أخرى',
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(expenseAmount);
    if (!expenseTitle.trim() || val <= 0) {
      sounds.playError();
      showToast('يرجى ملء بيان المصروف بمبلغ صحيح', 'error');
      return;
    }

    addExpense(expenseTitle, expenseCategory, val, expenseNotes);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');
  };

  const filteredExpenses = state.expenses.filter(e => {
    if (expenseCategoryFilter !== 'all' && e.category !== expenseCategoryFilter) return false;
    return true;
  });

  const filteredTransactions = state.treasury.transactions.filter(t => {
    if (treasuryTypeFilter !== 'all' && t.type !== treasuryTypeFilter) return false;
    return true;
  });

  const totalExpenseSum = filteredExpenses.reduce((acc, it) => acc + it.amount, 0);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              إدارة الخزينة والمصروفات الإدارية
            </h2>
            <p className="text-xs text-slate-500">
              تسجيل قيود المصروفات، متابعة تدفقات السيولة، وسجل حركات الصندوق
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">رصيد الخزينة:</span>
          <span className="text-lg font-black font-mono text-teal-700 dark:text-teal-400">
            {state.treasury.balance.toFixed(2)} {state.settings.currency}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Add Expense Form - 4 cols */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-red-500" />
              <span>تسجيل مصروف إداري جديد</span>
            </h3>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">بيان المصروف *</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  placeholder="مثال: فاتورة الكهرباء لشهر سبتمبر..."
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">المبلغ المطلوب *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 font-mono text-sm font-bold text-center text-red-600"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">التصنيف المحاسبي</label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value as Expense['category'])}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="rent">إيجار المحل</option>
                  <option value="electricity">كهرباء ومياه وإنترنت</option>
                  <option value="salaries">رواتب وحوافز موظفين</option>
                  <option value="supplies">أكياس ومطبوعات ومستهلكات</option>
                  <option value="maintenance">صيانة دورية وأجهزة</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  placeholder="رقم الفاتورة أو المستند..."
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 transition-colors"
              >
                خصم المبلغ وتسجيل المصروف
              </button>
            </form>
          </div>
        </div>

        {/* Right: Expenses & Treasury Log - 8 cols */}
        <div className="lg:col-span-8 space-y-5">
          {/* Expenses Log */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-600" />
                <span>سجل المصروفات المسجلة ({filteredExpenses.length})</span>
              </h3>

              <div className="flex items-center gap-2">
                <select
                  value={expenseCategoryFilter}
                  onChange={e => setExpenseCategoryFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900"
                >
                  <option value="all">جميع التصنيفات</option>
                  <option value="rent">إيجار</option>
                  <option value="electricity">فواتير</option>
                  <option value="salaries">رواتب</option>
                  <option value="supplies">مستهلكات</option>
                  <option value="maintenance">صيانة</option>
                  <option value="other">أخرى</option>
                </select>

                <span className="font-mono text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
                  المجموع: {totalExpenseSum.toFixed(2)} {state.settings.currency}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-56 overflow-y-auto pr-1 text-xs">
              {filteredExpenses.length === 0 ? (
                <div className="py-8 text-center text-slate-400">لا توجد مصروفات مسجلة</div>
              ) : (
                filteredExpenses.map(e => (
                  <div key={e.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{e.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {e.date} · {categoriesMap[e.category] || e.category} · بواسطة: {e.registeredBy}
                        {e.notes && <span> · {e.notes}</span>}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-sm text-red-600">
                      -{e.amount.toFixed(2)} {state.settings.currency}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Treasury Transactions Log */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-teal-600" />
                <span>كشف حساب حركات الخزينة المالي ({filteredTransactions.length})</span>
              </h3>

              <select
                value={treasuryTypeFilter}
                onChange={e => setTreasuryTypeFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900"
              >
                <option value="all">جميع أنواع الحركات</option>
                <option value="sale">مبيعات نقدية</option>
                <option value="purchase">مشتريات</option>
                <option value="expense">مصروفات</option>
                <option value="return">مرتجعات</option>
                <option value="supplier_payment">سداد موردين</option>
                <option value="manual_deposit">إيداع يدوي</option>
                <option value="manual_withdrawal">سحب يدوي</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">التاريخ والوقت</th>
                    <th className="py-2.5 px-3">البيان والحركة</th>
                    <th className="py-2.5 px-3 text-center">نوع العملية</th>
                    <th className="py-2.5 px-3 text-left">المبلغ</th>
                    <th className="py-2.5 px-3 text-left">الرصيد بعدها</th>
                    <th className="py-2.5 px-3">المستخدم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750">
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {t.date} {t.time}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {t.title}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-left font-bold">
                        <span className={t.amount > 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {t.amount > 0 ? `+${t.amount.toFixed(2)}` : t.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-left font-bold text-slate-700 dark:text-slate-300">
                        {t.balanceAfter.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">
                        {t.registeredBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
