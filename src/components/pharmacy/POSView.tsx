import React, { useState, useEffect, useRef } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Product, SaleItem, SaleInvoice, PaymentMethod } from '../../types/pharmacy';
import {
  Search,
  Barcode,
  Camera,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  Clock,
  User,
  Phone,
  FileText,
  AlertCircle,
  Tag,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ReceiptModal } from '../common/ReceiptModal';

export const POSView: React.FC = () => {
  const { state, createSale, showToast } = usePharmacy();

  // Search & Barcode
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const [prescriptionNote, setPrescriptionNote] = useState<string>('');
  const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

  // Financials
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paidInput, setPaidInput] = useState<string>('');

  // Modals
  const [completedInvoice, setCompletedInvoice] = useState<SaleInvoice | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts (F2 to checkout, F4 for barcode focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === 'F4') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customerName, customerPhone, paymentMethod, discountAmount, paidInput, doctorName, prescriptionNote]);

  // Categories list
  const categories = ['all', ...Array.from(new Set(state.products.map(p => p.category)))];

  // Filtered products for quick-click grid
  const filteredProducts = state.products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat;
    const matchesText =
      p.name.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(query)) ||
      (p.arabicName && p.arabicName.toLowerCase().includes(query));
    return matchesCat && matchesText;
  });

  // Add product to cart
  const addToCart = (product: Product, unit: SaleItem['unit'] = 'علبة') => {
    if (product.qty <= 0) {
      sounds.playError();
      showToast(`عفواً، الصنف ${product.name} نفد من المخزون!`, 'error');
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id && item.unit === unit);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const currentItem = updated[existingIdx];
        if (currentItem.qty + 1 > product.qty) {
          sounds.playError();
          showToast(`الكمية المطلوبة تتجاوز الرصيد المتاح (${product.qty})`, 'error');
          return prev;
        }
        const newQty = currentItem.qty + 1;
        const subtotal = newQty * currentItem.price;
        updated[existingIdx] = { ...currentItem, qty: newQty, subtotal };
        sounds.playScan();
        return updated;
      } else {
        // Calculate unit price if strip
        let itemPrice = product.price;
        if (unit === 'شريط' && product.stripsPerBox > 1) {
          itemPrice = Number((product.price / product.stripsPerBox).toFixed(2));
        }

        const newItem: SaleItem = {
          productId: product.id,
          name: product.name,
          qty: 1,
          unit,
          price: itemPrice,
          cost: product.cost,
          discount: 0,
          subtotal: itemPrice,
          expiry: product.expiry,
          barcode: product.barcode,
        };
        sounds.playScan();
        return [newItem, ...prev];
      }
    });
  };

  // Add by barcode
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const found = state.products.find(p => p.barcode === code);
    if (found) {
      addToCart(found);
      setBarcodeInput('');
      showToast(`تمت إضافة ${found.name}`);
    } else {
      sounds.playError();
      showToast(`لم يتم العثور على دواء بهذا الباركود (${code})`, 'error');
    }
  };

  const handleBarcodeScanned = (code: string) => {
    const found = state.products.find(p => p.barcode === code);
    if (found) {
      addToCart(found);
      showToast(`تم مسح وإضافة ${found.name}`);
    } else {
      sounds.playError();
      showToast(`باركود غير مسجل بالمخزون: ${code}`, 'error');
    }
  };

  // Cart quantity controls
  const updateQty = (idx: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[idx];
      const product = state.products.find(p => p.id === item.productId);
      const newQty = item.qty + delta;

      if (newQty <= 0) {
        return updated.filter((_, i) => i !== idx);
      }

      if (product && newQty > product.qty) {
        sounds.playError();
        showToast(`الرصيد المتاح بالمخزون هو ${product.qty} فقط`, 'error');
        return prev;
      }

      item.qty = newQty;
      item.subtotal = item.qty * item.price;
      return updated;
    });
  };

  const removeItem = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  // Calculations
  const subtotal = cart.reduce((acc, it) => acc + it.subtotal, 0);
  const total = Math.max(0, subtotal - discountAmount);
  const paidVal = paidInput === '' ? total : Number(paidInput) || 0;
  const change = Math.max(0, paidVal - total);

  // Checkout
  const handleCheckout = () => {
    if (!cart.length) {
      sounds.playError();
      showToast('سلة المبيعات فارغة، يرجى اختيار أصناف أولاً', 'error');
      return;
    }

    if (paymentMethod === 'cash' && paidVal < total) {
      sounds.playError();
      showToast('المبلغ المدفوع أقل من إجمالي الفاتورة', 'error');
      return;
    }

    const created = createSale(
      cart,
      customerName,
      customerPhone,
      paymentMethod,
      discountAmount,
      doctorName,
      prescriptionNote,
      paidVal
    );

    if (created) {
      setCompletedInvoice(created);
      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDoctorName('');
      setPrescriptionNote('');
      setDiscountAmount(0);
      setPaidInput('');
      barcodeInputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Keyboard shortcuts tip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>نقطة بيع الصيدلية السريعة (POS)</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
          <span>اختصارات:</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono font-bold text-slate-700 dark:text-slate-200">F2 دفع وطباعة</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono font-bold text-slate-700 dark:text-slate-200">F4 تركيز الباركود</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (Catalog & Fast Search) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search & Barcode Header Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Barcode scanner input */}
              <form onSubmit={handleBarcodeSubmit} className="relative flex items-center">
                <Barcode className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  placeholder="مسح أو كتابة الباركود (F4)..."
                  className="w-full pr-9 pl-11 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="absolute left-1.5 p-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-lg transition-colors"
                  title="فتح كاميرا قارئ الباركود"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </form>

              {/* Drug Name / Scientific Name Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم الدواء، المادة الفعالة..."
                  className="w-full pr-9 pl-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium text-xs transition-colors ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {cat === 'all' ? 'جميع الأدوية' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-200">الأصناف المتاحة ({filteredProducts.length})</span>
              <span>انقر على الصنف لإضافته مباشرة</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredProducts.map(prod => {
                const isLowStock = prod.qty <= prod.minQty;
                const isOutOfStock = prod.qty <= 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => !isOutOfStock && addToCart(prod)}
                    className={`relative p-3 rounded-xl border transition-all text-right group ${
                      isOutOfStock
                        ? 'opacity-50 border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/20 cursor-not-allowed'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-teal-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {prod.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isOutOfStock
                            ? 'text-red-700 bg-red-100 dark:bg-red-900/50'
                            : isLowStock
                            ? 'text-amber-700 bg-amber-100 dark:bg-amber-900/50'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        المتاح: {prod.qty}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-teal-600 transition-colors">
                      {prod.name}
                    </h4>

                    {prod.scientificName && (
                      <p className="text-[10px] text-slate-500 truncate mt-0.5" title={prod.scientificName}>
                        {prod.scientificName}
                      </p>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400 font-mono">
                        {prod.price.toFixed(2)} <span className="text-[10px] font-sans">{state.settings.currency}</span>
                      </span>

                      {prod.stripsPerBox > 1 && !isOutOfStock && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            addToCart(prod, 'شريط');
                          }}
                          className="text-[10px] px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded border border-teal-200 dark:border-teal-800 hover:bg-teal-100"
                          title="إضافة شريط منفرد"
                        >
                          + شريط
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Cart, Billing & Checkout) - 5 cols */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-4">
          
          {/* Cart Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                {cart.length}
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                سلة الفاتورة الحالية
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تفريغ السلة</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Barcode className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p>السلة فارغة حالياً</p>
                <p className="text-[11px] text-slate-500 mt-1">امسح الباركود أو انقر على صنف لإضافته</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.productId}-${item.unit}-${idx}`} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded font-medium">
                        {item.unit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {item.price.toFixed(2)} × {item.qty} = <span className="font-bold text-slate-700 dark:text-slate-200">{item.subtotal.toFixed(2)} {state.settings.currency}</span>
                    </div>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQty(idx, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-mono font-bold text-xs">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(idx, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors mr-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer / Doctor Info Toggle */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <button
              type="button"
              onClick={() => setShowExtraDetails(!showExtraDetails)}
              className="text-xs text-teal-700 dark:text-teal-400 font-bold flex items-center justify-between w-full"
            >
              <span>+ بيانات العميل / الروشتة (اختياري)</span>
              <span>{showExtraDetails ? 'إخفاء' : 'إظهار'}</span>
            </button>

            {showExtraDetails && (
              <div className="mt-3 space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="اسم العميل..."
                      className="w-full pr-8 pl-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="رقم الهاتف..."
                      className="w-full pr-8 pl-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    <input
                      type="text"
                      value={doctorName}
                      onChange={e => setDoctorName(e.target.value)}
                      placeholder="اسم الطبيب المعالج..."
                      className="w-full pr-8 pl-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    <input
                      type="text"
                      value={prescriptionNote}
                      onChange={e => setPrescriptionNote(e.target.value)}
                      placeholder="ملاحظات الجرعة والاستعمال..."
                      className="w-full pr-8 pl-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              طريقة السداد:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>نقداً (كاش)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>شبكة (مدى)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'credit'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>آجل (ذمم)</span>
              </button>
            </div>
          </div>

          {/* Totals & Calculations Box */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>المجموع الفرعي:</span>
              <span className="font-mono font-bold">{subtotal.toFixed(2)} {state.settings.currency}</span>
            </div>

            {/* Line for Discount */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-red-500" />
                <span>الخصم الإضافي:</span>
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={discountAmount || ''}
                  onChange={e => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-left text-xs"
                />
                <span className="text-[10px] text-slate-500">{state.settings.currency}</span>
              </div>
            </div>

            {/* Net Total */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
              <span className="font-extrabold text-sm">الإجمالي النهائي الصافي:</span>
              <span className="font-mono text-lg font-black text-teal-600 dark:text-teal-400">
                {total.toFixed(2)} {state.settings.currency}
              </span>
            </div>

            {/* Paid & Change if cash */}
            {paymentMethod === 'cash' && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">المبلغ المستلم من العميل:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={paidInput}
                    onChange={e => setPaidInput(e.target.value)}
                    placeholder={total.toFixed(2)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-left text-xs font-bold focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="text-left flex flex-col justify-end">
                  <span className="text-[11px] text-slate-500 block mb-1">المتبقي للعميل (الباقي):</span>
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {change.toFixed(2)} {state.settings.currency}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              cart.length === 0
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25 active:scale-[0.99]'
            }`}
          >
            <Printer className="w-5 h-5" />
            <span>حفظ الفاتورة وطباعة الإيصال (F2)</span>
          </button>
        </div>
      </div>

      {/* Camera Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleBarcodeScanned}
      />

      {/* Thermal Receipt Print Modal */}
      <ReceiptModal
        invoice={completedInvoice}
        onClose={() => setCompletedInvoice(null)}
      />
    </div>
  );
};
