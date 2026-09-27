import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  Settings,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Building2,
  Printer,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

export const AdminSettingsBackupView: React.FC = () => {
  const {
    state,
    updateSettings,
    exportDataToCSV,
    exportFullBackup,
    restoreBackup,
    resetAllData,
    showToast,
  } = usePharmacy();

  const [formData, setFormData] = useState({ ...state.settings });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        restoreBackup(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (
      window.confirm(
        'تحذير هام: سيتم مسح كافة البيانات المسجلة محلياً وإعادة ضبط النظام على البيانات الأولية النموذجية. هل ترغب في المتابعة؟'
      )
    ) {
      resetAllData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              إعدادات الصيدلية والنسخ الاحتياطي
            </h2>
            <p className="text-xs text-slate-500">
              تخصيص ترويسة الإيصالات، الرقم الضريبي، تصدير ملفات Excel وحفظ قواعد البيانات
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pharmacy Profile Settings - 7 cols */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>بيانات المنشأة والترخيص الضريبي</span>
          </h3>

          <form onSubmit={handleSettingsSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">اسم الصيدلية التجاري</label>
                <input
                  type="text"
                  required
                  value={formData.pharmacyName}
                  onChange={e => setFormData({ ...formData, pharmacyName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">الرقم الضريبي (VAT)</label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1">السجل التجاري</label>
                <input
                  type="text"
                  value={formData.commercialRecord}
                  onChange={e => setFormData({ ...formData, commercialRecord: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">رقم الهاتف والتواصل</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">رمز العملة</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">العنوان والموقع الجغرافي</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">تذييل ورسالة الفاتورة المطبوعة</label>
              <textarea
                rows={2}
                value={formData.receiptFooter}
                onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-colors"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </div>

        {/* Exports & Backup Controls - 5 cols */}
        <div className="lg:col-span-5 space-y-5">
          {/* Excel / CSV Exports */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>تصدير البيانات إلى جداول Excel (CSV)</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => exportDataToCSV('sales')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 font-bold transition-colors text-right"
              >
                تصدير المبيعات
              </button>
              <button
                type="button"
                onClick={() => exportDataToCSV('purchases')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 font-bold transition-colors text-right"
              >
                تصدير المشتريات
              </button>
              <button
                type="button"
                onClick={() => exportDataToCSV('products')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 font-bold transition-colors text-right"
              >
                تصدير المخزون
              </button>
              <button
                type="button"
                onClick={() => exportDataToCSV('suppliers')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 font-bold transition-colors text-right"
              >
                تصدير الموردين
              </button>
              <button
                type="button"
                onClick={() => exportDataToCSV('expenses')}
                className="col-span-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 font-bold transition-colors text-right"
              >
                تصدير المصروفات
              </button>
            </div>
          </div>

          {/* Full System Backup & Restore */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Download className="w-4 h-4 text-blue-600" />
              <span>النسخ الاحتياطي والاسترجاع الشامل</span>
            </h3>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={exportFullBackup}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-bold rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تحميل نسخة احتياطية كاملة (JSON)</span>
              </button>

              <label className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>استرجاع نسخة احتياطية من ملف</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileRestore}
                  className="hidden"
                />
              </label>
            </div>

            {/* Danger Zone: Factory Reset */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold rounded-xl border border-red-200 dark:border-red-800 text-xs transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة ضبط المصنع وتفريغ كل البيانات</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
