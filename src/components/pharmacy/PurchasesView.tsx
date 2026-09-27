import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { PurchaseItem, Product } from '../../types/pharmacy';
import { ShoppingCart, Plus, Trash2, Building2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const PurchasesView: React.FC = () => {
  const { state, createPurchase, showToast } = usePharmacy();

  const [supplierId, setSupplierId] = useState<number>(state.suppliers[0]?.id || 1);
  const [supplierInvoiceRef, setSupplierInvoiceRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Purchase items list
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(state.products[0]?.id || 1);
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemCost, setItemCost] = useState<number>(state.products[0]?.cost || 10);
  const [itemSellingPrice, setItemSellingPrice] = useState<number>(state.products[0]?.price || 15);
  const [itemExpiry, setItemExpiry] = useState<string>('2027-12-31');
  const [paidAmount, setPaidAmount] = useState<string>('');

  // When changing selected product in dropdown, update cost/price
  const handleProductChange = (pId: number) => {
    setSelectedProductId(pId);
    const prod = state.products.find(p => p.id === pId);
    if (prod) {
      setItemCost(prod.cost);
      setItemSellingPrice(prod.price);
      setItemExpiry(prod.expiry);
    }
  };

  const handleAddItem = () => {
    const prod = state.products.find(p => p.id === selectedProductId);
    if (!prod) return;

    if (itemQty <= 0 || itemCost <= 0) {
      sounds.playError();
      showToast('يرجى التأكد من إدخال كمية وسعر تكلفة صحيحين', 'error');
      return;
    }

    const subtotal = itemQty * itemCost;
    const newItem: PurchaseItem = {
      productId: prod.id,
      name: prod.name,
      barcode: prod.barcode,
      qty: itemQty,
      unit: prod.type,
      cost: itemCost,
      sellingPrice: itemSellingPrice,
      expiry: itemExpiry,
      subtotal,
    };

    setItems(prev => [...prev, newItem]);
    sounds.playScan();
    showToast(`تمت إضافة ${prod.name} لبنود الشراء`);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const total = items.reduce((acc, it) => acc + it.subtotal, 0);
  const paid = paidAmount === '' ? total : Number(paidAmount) || 0;
  const remaining = Math.max(0, total - paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) {
      sounds.playError();
      showToast('يرجى إضافة أصناف لفاتورة الشراء أولاً', 'error');
      return;
    }

    const pur = createPurchase(supplierId, supplierInvoiceRef, items, paid, notes);
    if (pur) {
      setItems([]);
      setSupplierInvoiceRef('');
      setNotes('');
      setPaidAmount('');
    }
  };

  return (
    <div className="space-y-5">
      {/* View Title */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              فاتورة مشتريات وتوريد أدوية
            </h2>
            <p className="text-xs text-slate-500">
              تسجيل استلام طلبيات جديدة من الموردين، تحديث تكلفة الشراء، وزيادة أرصدة المخزون
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Supplier & Invoice Setup - 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200">
              بيانات المورد والفاتورة
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                المورد:
              </label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {state.suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (رصيد سابق: {s.balance.toFixed(2)} {state.settings.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                رقم فاتورة المورد الورقية:
              </label>
              <input
                type="text"
                value={supplierInvoiceRef}
                onChange={e => setSupplierInvoiceRef(e.target.value)}
                placeholder="مثال: SUP-INV-9821..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                ملاحظات التوريد:
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="ملاحظات الشحنة أو بونص أو خصم تجاري..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
          </div>

          {/* Add Item form */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>إضافة صنف للفاتورة</span>
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                اختر الصنف:
              </label>
              <select
                value={selectedProductId}
                onChange={e => handleProductChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold"
              >
                {state.products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (رصيد حالي: {p.qty})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">الكمية المشتراة:</label>
                <input
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={e => setItemQty(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">سعر التكلفة:</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={itemCost}
                  onChange={e => setItemCost(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">سعر البيع للجمهور:</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={itemSellingPrice}
                  onChange={e => setItemSellingPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">تاريخ الصلاحية:</label>
                <input
                  type="date"
                  value={itemExpiry}
                  onChange={e => setItemExpiry(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold text-xs rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج الصنف في الجدول</span>
            </button>
          </div>
        </div>

        {/* Right: Items Table & Finalize Purchase - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span>بنود الشراء ({items.length})</span>
              <span className="font-mono text-teal-600 dark:text-teal-400 font-extrabold">
                {total.toFixed(2)} {state.settings.currency}
              </span>
            </h3>

            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                لم يتم إدراج أي أصناف حتى الآن
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <th className="py-2">الصنف</th>
                      <th className="py-2 text-center">الكمية</th>
                      <th className="py-2 text-center">سعر التكلفة</th>
                      <th className="py-2 text-center">سعر البيع</th>
                      <th className="py-2 text-center">الصلاحية</th>
                      <th className="py-2 text-left">الإجمالي</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                        <td className="py-2 font-sans font-bold text-slate-800 dark:text-slate-200">
                          {it.name}
                        </td>
                        <td className="py-2 text-center font-bold">{it.qty}</td>
                        <td className="py-2 text-center">{it.cost.toFixed(2)}</td>
                        <td className="py-2 text-center text-emerald-600">{it.sellingPrice.toFixed(2)}</td>
                        <td className="py-2 text-center text-[11px] text-slate-500">{it.expiry}</td>
                        <td className="py-2 text-left font-bold text-teal-600 dark:text-teal-400">
                          {it.subtotal.toFixed(2)}
                        </td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment & Supplier Ledger update */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>إجمالي الفاتورة:</span>
                <span className="font-mono text-sm text-teal-600 dark:text-teal-400">
                  {total.toFixed(2)} {state.settings.currency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">المدفوع نقداً للمورد حالياً:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    placeholder={total.toFixed(2)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-left font-bold text-xs"
                  />
                </div>
                <div className="text-left flex flex-col justify-end">
                  <span className="text-[11px] text-slate-500 block mb-1">المتبقي (آجل على حساب المورد):</span>
                  <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                    {remaining.toFixed(2)} {state.settings.currency}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={items.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                items.length === 0
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ فاتورة الشراء وتحديث الأرصدة بالمخزون</span>
            </button>
          </div>

          {/* Past Purchases History */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200 mb-3">
              سجل فواتير المشتريات السابقة ({state.purchases.length})
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-48 overflow-y-auto pr-1 text-xs">
              {state.purchases.map(p => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {p.invoiceNumber}
                    </span>
                    <div className="text-[11px] text-slate-500">
                      {p.supplierName} · {p.date} · {p.items.length} أصناف
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="font-bold text-teal-600 dark:text-teal-400">
                      {p.total.toFixed(2)} {state.settings.currency}
                    </div>
                    {p.remainingAmount > 0 && (
                      <div className="text-[10px] text-amber-600">
                        متبقي: {p.remainingAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
