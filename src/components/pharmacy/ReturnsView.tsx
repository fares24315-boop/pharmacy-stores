import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { SaleInvoice, ReturnItem } from '../../types/pharmacy';
import { RotateCcw, Search, AlertCircle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const ReturnsView: React.FC = () => {
  const { state, createReturn, showToast } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);
  const [returnItems, setReturnItems] = useState<{ [productId: number]: number }>({});
  const [returnReason, setReturnReason] = useState<string>('إرجاع بناءً على رغبة العميل');

  // Search invoices (completed sales)
  const filteredSales = state.sales.filter(s => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.invoiceNumber.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.customerPhone && s.customerPhone.includes(q))
    );
  });

  const handleSelectInvoice = (inv: SaleInvoice) => {
    setSelectedInvoice(inv);
    // Initialize return quantities to 0
    const initialQtys: { [productId: number]: number } = {};
    inv.items.forEach(it => {
      initialQtys[it.productId] = 0;
    });
    setReturnItems(initialQtys);
  };

  const handleQtyChange = (productId: number, maxQty: number, val: number) => {
    const safeVal = Math.max(0, Math.min(maxQty, val));
    setReturnItems(prev => ({
      ...prev,
      [productId]: safeVal,
    }));
  };

  const calculateTotalRefund = (): number => {
    if (!selectedInvoice) return 0;
    return selectedInvoice.items.reduce((acc, item) => {
      const q = returnItems[item.productId] || 0;
      return acc + q * item.price;
    }, 0);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const itemsToReturn: ReturnItem[] = [];
    selectedInvoice.items.forEach(item => {
      const q = returnItems[item.productId] || 0;
      if (q > 0) {
        itemsToReturn.push({
          productId: item.productId,
          name: item.name,
          qty: q,
          unit: item.unit,
          refundPrice: item.price,
          subtotal: q * item.price,
        });
      }
    });

    if (!itemsToReturn.length) {
      sounds.playError();
      showToast('يرجى تحديد كمية صنف واحد على الأقل للإرجاع', 'error');
      return;
    }

    const ret = createReturn(selectedInvoice.id, itemsToReturn, returnReason);
    if (ret) {
      setSelectedInvoice(null);
      setReturnItems({});
    }
  };

  return (
    <div className="space-y-5">
      {/* View Title */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              إدارة مرتجعات المبيعات
            </h2>
            <p className="text-xs text-slate-500">
              استرجاع أدوية مباعة، إعادة إدخالها للمخزون، ورد القيمة النقدية للعميل
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Invoice Search & Selection */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200">
              البحث عن الفاتورة الأصلية
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="رقم الفاتورة، اسم العميل، الهاتف..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-[480px] overflow-y-auto pr-1">
              {filteredSales.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => handleSelectInvoice(inv)}
                  className={`p-3 rounded-xl cursor-pointer transition-all my-1 text-right border ${
                    selectedInvoice?.id === inv.id
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {inv.invoiceNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                      {inv.total.toFixed(2)} {state.settings.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{inv.customerName || 'عميل نقدي'}</span>
                    <span>{inv.date} {inv.time}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {inv.items.length} أصناف · كاشير: {inv.cashierName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Return Form & Refund calculation */}
        <div className="lg:col-span-7">
          {selectedInvoice ? (
            <form onSubmit={handleSubmitReturn} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <span className="text-xs text-slate-500">معالجة مرتجع للفاتورة:</span>
                  <h3 className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">
                    {selectedInvoice.invoiceNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  إلغاء التحديد
                </button>
              </div>

              {/* Items in Invoice to return */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  حدد الكميات المسترجعة من كل صنف:
                </label>
                <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {selectedInvoice.items.map(it => {
                    const currentReturnQty = returnItems[it.productId] || 0;

                    return (
                      <div key={it.productId} className="p-3 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {it.name}
                          </h4>
                          <div className="text-[11px] text-slate-500">
                            الكمية المباعة: {it.qty} {it.unit} · سعر الوحدة: {it.price.toFixed(2)} {state.settings.currency}
                          </div>
                        </div>

                        {/* Qty Selector */}
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-slate-500">مرتجع:</label>
                          <input
                            type="number"
                            min="0"
                            max={it.qty}
                            value={currentReturnQty}
                            onChange={e => handleQtyChange(it.productId, it.qty, Number(e.target.value))}
                            className="w-16 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-xs font-mono text-center font-bold"
                          />
                          <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-400 w-20 text-left">
                            {(currentReturnQty * it.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Return Reason */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  سبب الإرجاع:
                </label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  placeholder="مثال: انتهاء الحاجة للدواء، عبوة زائدة، خطأ في الطلب..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {/* Refund Summary */}
              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-medium block">
                    إجمالي المبلغ المسترد للعميل:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    سيتم خصمه من خزينة الكاشير وإعادة الكميات للمخزون
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-amber-700 dark:text-amber-400">
                  {calculateTotalRefund().toFixed(2)} {state.settings.currency}
                </div>
              </div>

              <button
                type="submit"
                disabled={calculateTotalRefund() === 0}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                  calculateTotalRefund() === 0
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>تأكيد المرتجع ورد المبلغ النقدى</span>
              </button>
            </form>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300">
                اختر فاتورة من القائمة على اليمين لبدء الإرجاع
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                يمكنك البحث برقم الفاتورة أو اسم العميل المسجل
              </p>
            </div>
          )}

          {/* Recent Returns Table */}
          <div className="mt-5 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-3">
              سجل المرتجعات السابقة ({state.returns.length})
            </h3>
            {state.returns.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">لا توجد مرتجعات مسجلة حتى الآن</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                {state.returns.map(ret => (
                  <div key={ret.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {ret.returnNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        فاتورة {ret.saleInvoiceNumber} · {ret.date} {ret.time} · {ret.processedBy}
                      </div>
                      <div className="text-[10px] text-slate-400">{ret.reason}</div>
                    </div>
                    <div className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      -{ret.totalRefund.toFixed(2)} {state.settings.currency}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
