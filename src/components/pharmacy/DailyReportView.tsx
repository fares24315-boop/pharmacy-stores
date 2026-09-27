import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Shift, Expense } from '../../types/pharmacy';
import {
  FileSpreadsheet,
  Clock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  CreditCard,
  DollarSign,
  PlusCircle,
  X,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const DailyReportView: React.FC = () => {
  const { state, openShift, closeShift, addExpense, showToast } = usePharmacy();

  const activeShift = state.shifts.find(s => s.status === 'open');

  // Open Shift Form
  const [openingCashInput, setOpeningCashInput] = useState<string>('500');
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState<boolean>(false);

  // Close Shift Form
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [shiftClosingNotes, setShiftClosingNotes] = useState<string>('');
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState<boolean>(false);
  const [lastClosedShift, setLastClosedShift] = useState<Shift | null>(null);

  // Quick Expense modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [expenseTitle, setExpenseTitle] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('supplies');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseNotes, setExpenseNotes] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = state.sales.filter(s => s.date === todayStr);
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.total, 0);
  const todayCashSales = todaySales.filter(s => s.paymentMethod === 'cash').reduce((acc, s) => acc + s.total, 0);
  const todayCardSales = todaySales.filter(s => s.paymentMethod === 'card').reduce((acc, s) => acc + s.total, 0);
  const todayReturnsTotal = state.returns.filter(r => r.date === todayStr).reduce((acc, r) => acc + r.totalRefund, 0);
  const todayExpensesTotal = state.expenses.filter(e => e.date === todayStr).reduce((acc, e) => acc + e.amount, 0);

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(openingCashInput) || 0;
    openShift(val);
    setIsOpenShiftModalOpen(false);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    const actual = Number(actualCashInput) || 0;
    const closed = closeShift(actual, shiftClosingNotes);
    if (closed) {
      setLastClosedShift(closed);
      setIsCloseShiftModalOpen(false);
      setActualCashInput('');
      setShiftClosingNotes('');
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(expenseAmount);
    if (!expenseTitle.trim() || amt <= 0) {
      sounds.playError();
      showToast('يرجى كتابة عنوان المصروف وقيمة صحيحة', 'error');
      return;
    }
    addExpense(expenseTitle, expenseCategory, amt, expenseNotes);
    setIsExpenseModalOpen(false);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              التقارير اليومية وإدارة شفت الكاشير
            </h2>
            <p className="text-xs text-slate-500">
              متابعة صندوق النقدية، المصروفات، تقفيل الوردية، ومطابقة العجز والزيادة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل مصروف كاشير</span>
          </button>

          {activeShift ? (
            <button
              type="button"
              onClick={() => {
                setActualCashInput(activeShift.expectedCash.toString());
                setIsCloseShiftModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-600/20"
            >
              تقفيل شفت الكاشير الحالي
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
            >
              فتح شفت كاشير جديد
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Card */}
      {activeShift ? (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                الشفت النشط حالياً (#{activeShift.shiftNumber})
              </h3>
            </div>
            <div className="text-xs text-slate-500">
              الكاشير: <span className="font-bold text-slate-800 dark:text-slate-200">{activeShift.cashierName}</span> · بدء: {activeShift.startTime}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-400 block mb-1">الرصيد الافتتاحي:</span>
              <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">
                {activeShift.openingCash.toFixed(2)} {state.settings.currency}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block mb-1">مبيعات نقدية (كاش):</span>
              <span className="text-sm font-bold font-mono text-emerald-800 dark:text-emerald-300">
                +{activeShift.cashSales.toFixed(2)} {state.settings.currency}
              </span>
            </div>

            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/60">
              <span className="text-[11px] text-blue-700 dark:text-blue-400 block mb-1">مبيعات بطاقة (شبكة):</span>
              <span className="text-sm font-bold font-mono text-blue-800 dark:text-blue-300">
                {activeShift.cardSales.toFixed(2)} {state.settings.currency}
              </span>
            </div>

            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/60">
              <span className="text-[11px] text-amber-700 dark:text-amber-400 block mb-1">مرتجعات مبيعات:</span>
              <span className="text-sm font-bold font-mono text-amber-800 dark:text-amber-300">
                -{activeShift.totalReturns.toFixed(2)} {state.settings.currency}
              </span>
            </div>

            <div className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/60">
              <span className="text-[11px] text-red-700 dark:text-red-400 block mb-1">مصروفات الصندوق:</span>
              <span className="text-sm font-bold font-mono text-red-800 dark:text-red-300">
                -{activeShift.totalExpenses.toFixed(2)} {state.settings.currency}
              </span>
            </div>

            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-300 dark:border-teal-800">
              <span className="text-[11px] text-teal-800 dark:text-teal-300 font-bold block mb-1">النقد المتوقع بالدرج:</span>
              <span className="text-base font-extrabold font-mono text-teal-700 dark:text-teal-400">
                {activeShift.expectedCash.toFixed(2)} {state.settings.currency}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <Clock className="w-10 h-10 mx-auto text-amber-500 mb-2 opacity-80" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            لا يوجد شفت كاشير مفتوح حالياً
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            قم بفتح شفت لتسجيل الرصيد الافتتاحي وبدء حساب المبيعات والمصروفات بدقة
          </p>
          <button
            type="button"
            onClick={() => setIsOpenShiftModalOpen(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20"
          >
            فتح شفت كاشير جديد
          </button>
        </div>
      )}

      {/* Today Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 block mb-1">إجمالي مبيعات اليوم:</span>
          <span className="text-lg font-bold font-mono text-teal-700 dark:text-teal-400">
            {todaySalesTotal.toFixed(2)} {state.settings.currency}
          </span>
          <div className="text-[11px] text-slate-400 mt-1">
            كاش: {todayCashSales.toFixed(2)} · شبكة: {todayCardSales.toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 block mb-1">عدد الفواتير الصادرة اليوم:</span>
          <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
            {todaySales.length} فاتورة
          </span>
          <div className="text-[11px] text-slate-400 mt-1">
            متوسط الفاتورة: {(todaySales.length ? todaySalesTotal / todaySales.length : 0).toFixed(2)} {state.settings.currency}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 block mb-1">إجمالي المرتجعات اليوم:</span>
          <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
            {todayReturnsTotal.toFixed(2)} {state.settings.currency}
          </span>
          <div className="text-[11px] text-slate-400 mt-1">
            خصمت من صندوق الكاشير
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs text-slate-500 block mb-1">مصروفات اليوم:</span>
          <span className="text-lg font-bold font-mono text-red-600 dark:text-red-400">
            {todayExpensesTotal.toFixed(2)} {state.settings.currency}
          </span>
          <div className="text-[11px] text-slate-400 mt-1">
            {state.expenses.filter(e => e.date === todayStr).length} بنود مصروف
          </div>
        </div>
      </div>

      {/* Closed Shifts History */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-3">
          سجل الشفتات المغلقة السابقة
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">رقم الشفت</th>
                <th className="py-2.5 px-3">الكاشير</th>
                <th className="py-2.5 px-3">وقت البداية / النهاية</th>
                <th className="py-2.5 px-3 text-center">الافتتاحي</th>
                <th className="py-2.5 px-3 text-center">مبيعات كاش</th>
                <th className="py-2.5 px-3 text-center">مبيعات شبكة</th>
                <th className="py-2.5 px-3 text-center">المتوقع بالدرج</th>
                <th className="py-2.5 px-3 text-center">الفعلي بالعد</th>
                <th className="py-2.5 px-3 text-center">الفارق</th>
                <th className="py-2.5 px-3 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono">
              {state.shifts.map(shift => (
                <tr key={shift.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750">
                  <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                    #{shift.shiftNumber}
                  </td>
                  <td className="py-2.5 px-3 font-sans">{shift.cashierName}</td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-500">
                    <div>{shift.startTime}</div>
                    {shift.endTime && <div className="text-slate-400">{shift.endTime}</div>}
                  </td>
                  <td className="py-2.5 px-3 text-center">{shift.openingCash.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600">+{shift.cashSales.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center text-blue-600">{shift.cardSales.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center font-bold">{shift.expectedCash.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-teal-600">
                    {shift.actualCash !== undefined ? shift.actualCash.toFixed(2) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {shift.difference !== undefined ? (
                      <span
                        className={`font-bold ${
                          shift.difference === 0
                            ? 'text-emerald-600'
                            : shift.difference > 0
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}
                      >
                        {shift.difference > 0 ? `+${shift.difference.toFixed(2)}` : shift.difference.toFixed(2)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        shift.status === 'open'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {shift.status === 'open' ? 'نشط الآن' : 'مغلق'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Shift Modal */}
      {isOpenShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">
              فتح شفت كاشير جديد
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              أدخل الرصيد الافتتاحي (الفكة) الموجودة في درج الكاشير عند بدء العمل
            </p>

            <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">الرصيد الافتتاحي بالدرج:</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={openingCashInput}
                  onChange={e => setOpeningCashInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 text-center font-mono text-base font-bold text-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenShiftModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  بدء الشفت الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {isCloseShiftModalOpen && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
              تقفيل شفت الكاشير (#{activeShift.shiftNumber})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              قم بعد النقود الموجودة في الدرج وأدخل المبلغ الفعلي للمطابقة
            </p>

            <form onSubmit={handleCloseShiftSubmit} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">الرصيد الافتتاحي:</span>
                  <span className="font-mono font-bold">{activeShift.openingCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">+ مبيعات كاش:</span>
                  <span className="font-mono font-bold text-emerald-600">+{activeShift.cashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">- مرتفعات ومصروفات:</span>
                  <span className="font-mono font-bold text-red-600">
                    -{(activeShift.totalReturns + activeShift.totalExpenses).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                  <span>المبلغ المفترض بالدرج:</span>
                  <span className="font-mono text-teal-600">{activeShift.expectedCash.toFixed(2)} {state.settings.currency}</span>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">المبلغ الفعلي المحسوب في الدرج:</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={actualCashInput}
                  onChange={e => setActualCashInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 font-mono text-base font-bold text-center text-teal-600"
                />
              </div>

              {actualCashInput !== '' && (
                <div className="p-2.5 rounded-xl border text-center font-bold">
                  {Number(actualCashInput) - activeShift.expectedCash === 0 ? (
                    <span className="text-emerald-600 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>صندوق الدرج مطابق تماماً للحسابات</span>
                    </span>
                  ) : Number(actualCashInput) - activeShift.expectedCash > 0 ? (
                    <span className="text-blue-600">
                      يوجد زيادة نقدية قدرها +{(Number(actualCashInput) - activeShift.expectedCash).toFixed(2)} {state.settings.currency}
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center justify-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>يوجد عجز نقدي قدره {(Number(actualCashInput) - activeShift.expectedCash).toFixed(2)} {state.settings.currency}</span>
                    </span>
                  )}
                </div>
              )}

              <div>
                <label className="font-semibold block mb-1">ملاحظات تقفيل الشفت / التسليم:</label>
                <textarea
                  rows={2}
                  value={shiftClosingNotes}
                  onChange={e => setShiftClosingNotes(e.target.value)}
                  placeholder="ملاحظات التسليم للكاشير التالي..."
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseShiftModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm"
                >
                  تأكيد إغلاق الشفت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Cashier Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">
              تسجيل مصروف من صندوق الكاشير
            </h3>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">بيان المصروف *</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  placeholder="مثال: مطهرات، بكر فواتير، ضيافة..."
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">المبلغ *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 font-mono text-base font-bold text-center text-red-600"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">التصنيف</label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as Expense['category'])}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white dark:bg-slate-800"
                  >
                    <option value="supplies">أدوات ومستهلكات</option>
                    <option value="maintenance">صيانة</option>
                    <option value="electricity">فواتير وخدمات</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">ملاحظات إضافية:</label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm"
                >
                  صرف المبلغ وتحديث الدرج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Closed Shift Slip Modal (printable) */}
      {lastClosedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                تقرير تقفيل الشفت (#{lastClosedShift.shiftNumber})
              </h3>
              <p className="text-xs text-slate-500 mt-1">{state.settings.pharmacyName}</p>
            </div>

            <div className="py-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>الكاشير:</span>
                <span className="font-bold">{lastClosedShift.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>تاريخ الإغلاق:</span>
                <span>{lastClosedShift.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span>الرصيد الافتتاحي:</span>
                <span className="font-mono">{lastClosedShift.openingCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>مبيعات نقدية:</span>
                <span className="font-mono text-emerald-600">+{lastClosedShift.cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>مبيعات بطاقة (شبكة):</span>
                <span className="font-mono text-blue-600">{lastClosedShift.cardSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>مرتجعات ومصروفات:</span>
                <span className="font-mono text-red-600">
                  -{(lastClosedShift.totalReturns + lastClosedShift.totalExpenses).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                <span>المبلغ المتوقع:</span>
                <span className="font-mono">{lastClosedShift.expectedCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>المبلغ الفعلي بالعد:</span>
                <span className="font-mono text-teal-600">{lastClosedShift.actualCash?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200">
                <span>الفارق:</span>
                <span
                  className={`font-mono ${
                    (lastClosedShift.difference || 0) === 0
                      ? 'text-emerald-600'
                      : (lastClosedShift.difference || 0) > 0
                      ? 'text-blue-600'
                      : 'text-red-600'
                  }`}
                >
                  {(lastClosedShift.difference || 0) > 0 ? `+${lastClosedShift.difference?.toFixed(2)}` : lastClosedShift.difference?.toFixed(2)} {state.settings.currency}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLastClosedShift(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الإيصال</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
