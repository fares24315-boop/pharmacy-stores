import React from 'react';
import { SaleInvoice } from '../../types/pharmacy';
import { usePharmacy } from '../../context/PharmacyContext';
import { Printer, X, Check, Building2, Phone, Calendar, Clock, User, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  invoice: SaleInvoice | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ invoice, onClose }) => {
  const { state } = usePharmacy();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden my-8">
        {/* Modal Action Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              إيصال فاتورة مبيعات
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الإيصال</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Body (Designed for both on-screen preview & 80mm thermal print) */}
        <div className="p-6 bg-white text-slate-900 printable-area font-sans">
          <div className="max-w-[320px] mx-auto text-center border-b border-dashed border-slate-300 pb-4 mb-4">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {state.settings.pharmacyName}
            </h2>
            <p className="text-xs text-slate-600 mt-1">{state.settings.address}</p>
            <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
              <p>هاتف: {state.settings.phone}</p>
              <p>الرقم الضريبي: {state.settings.taxNumber}</p>
              <p>س.ت: {state.settings.commercialRecord}</p>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="text-[11px] text-slate-700 space-y-1 border-b border-dashed border-slate-300 pb-3 mb-3">
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">رقم الفاتورة:</span>
              <span className="font-mono font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">التاريخ والوقت:</span>
              <span>{invoice.date} {invoice.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">الكاشير:</span>
              <span>{invoice.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">العميل:</span>
              <span>{invoice.customerName || 'عميل نقدي'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">طريقة الدفع:</span>
              <span className="font-bold">
                {invoice.paymentMethod === 'cash' ? 'نقداً (كاش)' : invoice.paymentMethod === 'card' ? 'بطاقة بنكية (شبكة)' : 'آجل'}
              </span>
            </div>
            {invoice.doctorName && (
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">الطبيب المعالج:</span>
                <span>{invoice.doctorName}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <table className="w-full text-right text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 font-bold">
                  <th className="py-1">الصنف</th>
                  <th className="py-1 text-center">الكمية</th>
                  <th className="py-1 text-center">السعر</th>
                  <th className="py-1 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-1.5 font-medium pr-1">
                      <div className="text-slate-900 leading-tight">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.unit}</div>
                    </td>
                    <td className="py-1.5 text-center font-mono">{item.qty}</td>
                    <td className="py-1.5 text-center font-mono">{item.price.toFixed(2)}</td>
                    <td className="py-1.5 text-left font-mono font-bold">{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي:</span>
              <span className="font-mono font-medium">{invoice.subtotal.toFixed(2)} {state.settings.currency}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>الخصم:</span>
                <span className="font-mono font-medium">-{invoice.discount.toFixed(2)} {state.settings.currency}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>الإجمالي النهائي:</span>
              <span className="font-mono text-teal-700">{invoice.total.toFixed(2)} {state.settings.currency}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>المدفوع:</span>
              <span className="font-mono">{invoice.paidAmount.toFixed(2)} {state.settings.currency}</span>
            </div>
            {invoice.changeAmount > 0 && (
              <div className="flex justify-between text-[11px] text-slate-700 font-bold">
                <span>المتبقي للعميل:</span>
                <span className="font-mono text-emerald-700">{invoice.changeAmount.toFixed(2)} {state.settings.currency}</span>
              </div>
            )}
          </div>

          {/* Simulated QR & Barcode Representation */}
          <div className="mt-5 pt-3 border-t border-dashed border-slate-300 text-center">
            {/* Visual simplified QR representation */}
            <div className="w-20 h-20 mx-auto border-2 border-slate-800 p-1 mb-2 grid grid-cols-4 gap-0.5 bg-white">
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-white"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-white"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-white"></div>
              <div className="bg-white"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-white"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
              <div className="bg-slate-900 rounded-[1px]"></div>
            </div>

            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              *{invoice.invoiceNumber}*
            </p>
            <p className="text-[10px] text-slate-600 mt-2 px-2 leading-relaxed">
              {state.settings.receiptFooter}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            إغلاق النافذة
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
