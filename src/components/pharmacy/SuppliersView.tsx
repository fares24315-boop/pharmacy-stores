import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Supplier } from '../../types/pharmacy';
import { Truck, Plus, Phone, Mail, MapPin, DollarSign, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const SuppliersView: React.FC = () => {
  const { state, saveSupplier, deleteSupplier, addSupplierPayment, showToast } = usePharmacy();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);

  // Payment voucher modal
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const handleAddNew = () => {
    setEditingSupplier({
      name: '',
      phone: '',
      email: '',
      address: '',
      balance: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (s: Supplier) => {
    setEditingSupplier({ ...s });
    setIsModalOpen(true);
  };

  const handleDelete = (s: Supplier) => {
    if (s.balance > 0) {
      sounds.playError();
      showToast('لا يمكن حذف مورد له مستحقات مالية متبقية!', 'error');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف المورد ${s.name}؟`)) {
      deleteSupplier(s.id);
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier || !editingSupplier.name?.trim()) {
      sounds.playError();
      showToast('يرجى كتابة اسم المورد', 'error');
      return;
    }

    saveSupplier(editingSupplier);
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleOpenPayment = (s: Supplier) => {
    setPayingSupplier(s);
    setPaymentAmount(s.balance);
    setPaymentNotes('سداد دفعة من الحساب');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || paymentAmount <= 0) {
      sounds.playError();
      showToast('المبلغ المدفوع غير صحيح', 'error');
      return;
    }

    addSupplierPayment(payingSupplier.id, paymentAmount, paymentMethod, paymentNotes);
    setPayingSupplier(null);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              دليل ومستحقات الموردين
            </h2>
            <p className="text-xs text-slate-500">
              إدارة بيانات شركات الأدوية، تتبع الأرصدة الآجلة، وتسجيل سندات الصرف والسداد
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد جديد</span>
        </button>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.suppliers.map(s => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 relative group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded font-bold">
                  {s.code}
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {s.name}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEdit(s)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  title="تعديل"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{s.phone || 'غير مسجل'}</span>
              </div>
              {s.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{s.email}</span>
                </div>
              )}
              {s.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{s.address}</span>
                </div>
              )}
            </div>

            {/* Balance Box */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">المستحقات المتبقية:</span>
                <span
                  className={`text-base font-extrabold font-mono ${
                    s.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {s.balance.toFixed(2)} {state.settings.currency}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenPayment(s)}
                className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-xs rounded-xl border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>سداد دفعة</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-600" />
                <span>{editingSupplier.id ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">اسم شركة التوريد *</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.name || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  placeholder="مثال: شركة النهضة الدوائية"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={editingSupplier.phone || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                  placeholder="05XXXXXXXX"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editingSupplier.email || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                  placeholder="info@supplier.com"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">العنوان والمقر</label>
                <input
                  type="text"
                  value={editingSupplier.address || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                  placeholder="المدينة، الحي، المنطقة..."
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">الرصيد الافتتاحي المستحق للمورد</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editingSupplier.balance ?? 0}
                  onChange={e => setEditingSupplier({ ...editingSupplier, balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Voucher Modal (سند صرف) */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>سند صرف وسداد لمورد</span>
              </h3>
              <button
                type="button"
                onClick={() => setPayingSupplier(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">المورد:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{payingSupplier.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الرصيد المستحق حالياً:</span>
                  <span className="font-mono font-bold text-amber-600">{payingSupplier.balance.toFixed(2)} {state.settings.currency}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">المبلغ المراد سداده الآن:</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 font-mono text-base font-bold text-center text-teal-600"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">طريقة السداد:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 rounded-xl border font-bold text-xs ${
                      paymentMethod === 'cash' ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    نقداً من الخزينة
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`py-2 rounded-xl border font-bold text-xs ${
                      paymentMethod === 'bank' ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    تحويل بنكي
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">ملاحظات السند / رقم الحوالة:</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="رقم الشيك أو الحوالة البنكية..."
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm"
                >
                  تأكيد السداد والخصم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
