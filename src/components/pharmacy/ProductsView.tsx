import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Product } from '../../types/pharmacy';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  Barcode,
  Camera,
  X,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { BarcodeScannerModal } from './BarcodeScannerModal';

export const ProductsView: React.FC = () => {
  const { state, saveProduct, deleteProduct, adjustStock, showToast } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'expiring' | 'out'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Stock Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('تسوية جرد دوري');

  // Scanner modal for product barcode
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  const categories = ['all', ...Array.from(new Set(state.products.map(p => p.category)))];

  // Expiry check helper (within 90 days or expired)
  const isExpiringSoon = (expiryDate: string): boolean => {
    const today = new Date();
    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 90;
  };

  const isExpired = (expiryDate: string): boolean => {
    const today = new Date();
    const exp = new Date(expiryDate);
    return exp < today;
  };

  // Filtered products
  const filteredProducts = state.products.filter(p => {
    // Category
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

    // Stock Status
    if (stockStatusFilter === 'low' && (p.qty > p.minQty || p.qty === 0)) return false;
    if (stockStatusFilter === 'out' && p.qty > 0) return false;
    if (stockStatusFilter === 'expiring' && !isExpiringSoon(p.expiry)) return false;

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(q)) ||
      (p.arabicName && p.arabicName.toLowerCase().includes(q))
    );
  });

  // Open Add Product
  const handleAddNew = () => {
    setEditingProduct({
      name: '',
      arabicName: '',
      scientificName: '',
      category: 'عام',
      type: 'أقراص',
      qty: 20,
      minQty: 5,
      cost: 10,
      price: 15,
      stripsPerBox: 1,
      unitsPerStrip: 10,
      expiry: '2027-12-31',
      supplier: state.suppliers[0]?.name || 'عام',
      location: 'A1',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleDelete = (p: Product) => {
    if (window.confirm(`هل أنت متأكد من حذف الصنف "${p.name}" نهائياً من قاعدة البيانات؟`)) {
      deleteProduct(p.id);
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name?.trim()) {
      sounds.playError();
      showToast('يرجى كتابة اسم الصنف على الأقل', 'error');
      return;
    }

    saveProduct(editingProduct);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleOpenAdjust = (p: Product) => {
    setAdjustingProduct(p);
    setNewStockQty(p.qty);
    setAdjustReason('تسوية جرد دوري');
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    adjustStock(adjustingProduct.id, newStockQty, adjustReason);
    setAdjustingProduct(null);
  };

  return (
    <div className="space-y-4">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              دليل الأصناف والمخزون
            </h2>
            <p className="text-xs text-slate-500">
              إدارة بطاقات الأدوية، تواريخ الصلاحية، الأسعار، ومراقبة النواقص
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف دواء جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الباركود..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c === 'all' ? 'جميع التصنيفات' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setStockStatusFilter('all')}
              className={`flex-1 py-1 rounded-lg font-bold text-center transition-colors ${
                stockStatusFilter === 'all' ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setStockStatusFilter('low')}
              className={`flex-1 py-1 rounded-lg font-bold text-center transition-colors ${
                stockStatusFilter === 'low' ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              نواقص
            </button>
            <button
              type="button"
              onClick={() => setStockStatusFilter('expiring')}
              className={`flex-1 py-1 rounded-lg font-bold text-center transition-colors ${
                stockStatusFilter === 'expiring' ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              قريب الانتهاء
            </button>
            <button
              type="button"
              onClick={() => setStockStatusFilter('out')}
              className={`flex-1 py-1 rounded-lg font-bold text-center transition-colors ${
                stockStatusFilter === 'out' ? 'bg-white dark:bg-slate-800 text-red-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              منتهي الرصيد
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">الصنف / المادة الفعالة</th>
                <th className="py-3 px-3">الباركود</th>
                <th className="py-3 px-3">التصنيف</th>
                <th className="py-3 px-3 text-center">الرصيد المتاح</th>
                <th className="py-3 px-3 text-center">سعر التكلفة</th>
                <th className="py-3 px-3 text-center">سعر البيع</th>
                <th className="py-3 px-3 text-center">هامش الربح</th>
                <th className="py-3 px-3 text-center">الصلاحية</th>
                <th className="py-3 px-3">المورد / الموقع</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredProducts.map(p => {
                const isLow = p.qty <= p.minQty && p.qty > 0;
                const isOut = p.qty === 0;
                const expired = isExpired(p.expiry);
                const nearExpiry = isExpiringSoon(p.expiry) && !expired;
                const margin = p.price - p.cost;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {p.name}
                      </div>
                      {p.scientificName && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.scientificName}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {p.barcode}
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          isOut
                            ? 'text-red-700 bg-red-100 dark:bg-red-950/60'
                            : isLow
                            ? 'text-amber-700 bg-amber-100 dark:bg-amber-950/60'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {p.qty} {p.type}
                      </span>
                      {isLow && <div className="text-[10px] text-amber-600 mt-0.5">حد الطلب: {p.minQty}</div>}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-slate-300">
                      {p.cost.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-teal-600 dark:text-teal-400">
                      {p.price.toFixed(2)} {state.settings.currency}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                      +{margin.toFixed(2)} ({((margin / (p.cost || 1)) * 100).toFixed(0)}%)
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium ${
                          expired
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : nearExpiry
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {p.expiry}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-slate-500">
                      <div>{p.supplier}</div>
                      {p.location && <div className="text-slate-400 font-mono">رف: {p.location}</div>}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(p)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="تسوية رصيد المخزون (جرد)"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="تعديل بيانات الصنف"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="حذف الصنف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-600" />
                <span>{editingProduct.id ? 'تعديل كرت الصنف' : 'إضافة صنف دواء جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">الاسم التجاري للصنف *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="مثال: بنادول إكسترا (Panadol Extra)"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">المادة الفعالة / الاسم العلمي</label>
                  <input
                    type="text"
                    value={editingProduct.scientificName || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, scientificName: e.target.value })}
                    placeholder="Paracetamol 500mg"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">الباركود الدولي</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editingProduct.barcode || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                      placeholder="تلقائي إن ترك فارغاً"
                      className="w-full pr-3 pl-8 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="absolute left-1.5 top-1.5 p-1 text-teal-600 hover:bg-teal-50 rounded"
                      title="مسح بالكاميرا"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">التصنيف الدوائي</label>
                  <input
                    type="text"
                    value={editingProduct.category || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    placeholder="مسكنات، مضادات حيوية..."
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">شكل الدواء (النوع)</label>
                  <select
                    value={editingProduct.type || 'أقراص'}
                    onChange={e => setEditingProduct({ ...editingProduct, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="أقراص">أقراص</option>
                    <option value="كبسولات">كبسولات</option>
                    <option value="شراب / بخاخ">شراب / بخاخ</option>
                    <option value="حقن">حقن</option>
                    <option value="مرهم / كريم">مرهم / كريم</option>
                    <option value="قطرة">قطرة</option>
                    <option value="مستلزمات">مستلزمات طبية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-slate-500 block mb-1">سعر التكلفة:</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={editingProduct.cost ?? 0}
                    onChange={e => setEditingProduct({ ...editingProduct, cost: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white dark:bg-slate-800 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">سعر البيع للجمهور:</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={editingProduct.price ?? 0}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white dark:bg-slate-800 font-mono text-xs font-bold text-teal-600"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">الرصيد الافتتاحي:</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.qty ?? 0}
                    onChange={e => setEditingProduct({ ...editingProduct, qty: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white dark:bg-slate-800 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">حد التنبيه (النواقص):</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.minQty ?? 5}
                    onChange={e => setEditingProduct({ ...editingProduct, minQty: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 border rounded-lg bg-white dark:bg-slate-800 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">عدد الأشرطة بالعلبة</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.stripsPerBox ?? 1}
                    onChange={e => setEditingProduct({ ...editingProduct, stripsPerBox: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">تاريخ انتهاء الصلاحية</label>
                  <input
                    type="date"
                    value={editingProduct.expiry || '2027-12-31'}
                    onChange={e => setEditingProduct({ ...editingProduct, expiry: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">موقع الدواء في الصيدلية (الرف)</label>
                  <input
                    type="text"
                    value={editingProduct.location || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, location: e.target.value })}
                    placeholder="مثال: رف A2 - درج 3"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">المورد المعتمد</label>
                <select
                  value={editingProduct.supplier || ''}
                  onChange={e => {
                    const supp = state.suppliers.find(s => s.name === e.target.value);
                    setEditingProduct({
                      ...editingProduct,
                      supplier: e.target.value,
                      supplierCode: supp?.code,
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                >
                  {state.suppliers.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">
              تسوية جرد المخزون يدويًا
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              الصنف: <span className="font-bold text-slate-800 dark:text-slate-200">{adjustingProduct.name}</span>
            </p>

            <form onSubmit={handleSaveAdjust} className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">الرصيد الحالي المسجل:</span>
                <span className="font-mono font-bold text-sm">{adjustingProduct.qty}</span>
              </div>

              <div>
                <label className="font-semibold block mb-1">الرصيد الفعلي الجديد بعد الجرد:</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockQty}
                  onChange={e => setNewStockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 font-mono text-base font-bold text-center text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">سبب التسوية:</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="مثال: جرد دوري، تلف عبوة، عجز مخزن..."
                  className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
                >
                  اعتماد التسوية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={code => {
          if (editingProduct) {
            setEditingProduct({ ...editingProduct, barcode: code });
          }
        }}
        title="التقاط باركود الصنف بالكاميرا"
      />
    </div>
  );
};
