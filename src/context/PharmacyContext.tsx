import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  PharmacyState,
  Product,
  Supplier,
  SaleInvoice,
  SaleReturn,
  PurchaseInvoice,
  Expense,
  SupplierPayment,
  TreasuryTransaction,
  Shift,
  AuditLog,
  InventoryLog,
  PharmacySettings,
  User,
  SaleItem,
  ReturnItem,
  PurchaseItem,
  PaymentMethod,
} from '../types/pharmacy';
import { sounds } from '../utils/audio';

const STORAGE_KEY = 'pharmacy_app_v1';

const defaultSettings: PharmacySettings = {
  pharmacyName: 'صيدلية الأمل الحديثة',
  taxNumber: '300123456700003',
  commercialRecord: '1010889922',
  phone: '0501234567',
  address: 'الرياض - طريق الملك عبد العزيز، حي المروج',
  currency: 'ر.س',
  taxRate: 15,
  receiptFooter: 'شكراً لزيارتكم ونتمنى لكم الشفاء العاجل دائمًا · الأدوية لا تسترجع بعد 7 أيام',
  autoPrintReceipt: true,
  soundEnabled: true,
};

const initialProducts: Product[] = [
  {
    id: 1,
    barcode: '628100100001',
    name: 'بنادول إكسترا (Panadol Extra)',
    arabicName: 'بنادول أحمر مسكن وخافض للحرارة',
    scientificName: 'Paracetamol 500mg + Caffeine 65mg',
    category: 'مسكنات وخافض حرارة',
    type: 'أقراص',
    qty: 48,
    minQty: 15,
    price: 18.5,
    cost: 13.0,
    stripsPerBox: 2,
    unitsPerStrip: 12,
    expiry: '2027-08-15',
    supplier: 'شركة النهضة الدوائية',
    supplierCode: 'SUP-001',
    location: 'A1-2',
    notes: 'مسكن قوي للألم والصداع',
  },
  {
    id: 2,
    barcode: '628100100002',
    name: 'أوجمنتين 1 جم (Augmentin 1g)',
    arabicName: 'مضاد حيوي واسع المجال',
    scientificName: 'Amoxicillin 875mg + Clavulanic Acid 125mg',
    category: 'مضادات حيوية',
    type: 'أقراص',
    qty: 24,
    minQty: 10,
    price: 68.0,
    cost: 52.0,
    stripsPerBox: 2,
    unitsPerStrip: 7,
    expiry: '2026-11-20',
    supplier: 'شركة الأدوية المتقدمة',
    supplierCode: 'SUP-002',
    location: 'B2-1',
    notes: 'مضاد حيوي يؤخذ بعد الطعام',
  },
  {
    id: 3,
    barcode: '628100100003',
    name: 'كونكور 5 مجم (Concor 5mg)',
    arabicName: 'علاج ضغط الدم والقلب',
    scientificName: 'Bisoprolol Fumarate 5mg',
    category: 'أدوية القلب والضغط',
    type: 'أقراص',
    qty: 35,
    minQty: 8,
    price: 34.0,
    cost: 26.5,
    stripsPerBox: 3,
    unitsPerStrip: 10,
    expiry: '2027-04-10',
    supplier: 'مستودع المتحدة للأدوية',
    supplierCode: 'SUP-003',
    location: 'C1-4',
    notes: 'يؤخذ صباحاً على الريق',
  },
  {
    id: 4,
    barcode: '628100100004',
    name: 'أوميبرازول 20 مجم (Omeprazole)',
    arabicName: 'مضاد حموضة المعدة وارتجاع المريء',
    scientificName: 'Omeprazole 20mg',
    category: 'الجهاز الهضمي',
    type: 'كبسولات',
    qty: 18,
    minQty: 12,
    price: 42.0,
    cost: 30.0,
    stripsPerBox: 2,
    unitsPerStrip: 14,
    expiry: '2027-02-18',
    supplier: 'شركة النهضة الدوائية',
    supplierCode: 'SUP-001',
    location: 'A3-1',
    notes: 'قبل الإفطار بنصف ساعة',
  },
  {
    id: 5,
    barcode: '628100100005',
    name: 'كاتافلام 50 مجم (Cataflam 50mg)',
    arabicName: 'مسكن آلام ومضاد للالتهاب',
    scientificName: 'Diclofenac Potassium 50mg',
    category: 'مسكنات وخافض حرارة',
    type: 'أقراص',
    qty: 5, // low stock!
    minQty: 10,
    price: 26.0,
    cost: 19.0,
    stripsPerBox: 2,
    unitsPerStrip: 10,
    expiry: '2026-10-30', // soon
    supplier: 'شركة الأدوية المتقدمة',
    supplierCode: 'SUP-002',
    location: 'A1-4',
    notes: 'يؤخذ مع كوب ماء وفير بعد الأكل',
  },
  {
    id: 6,
    barcode: '628100100006',
    name: 'فيتامين د3 50000 وحدة (Vitamin D3)',
    arabicName: 'فيتامين د عالي التركيز كبسول أسبوعي',
    scientificName: 'Cholecalciferol 50,000 IU',
    category: 'فيتامينات ومكملات غذائية',
    type: 'كبسولات',
    qty: 29,
    minQty: 5,
    price: 75.0,
    cost: 55.0,
    stripsPerBox: 1,
    unitsPerStrip: 12,
    expiry: '2027-12-01',
    supplier: 'مستودع المتحدة للأدوية',
    supplierCode: 'SUP-003',
    location: 'D2-3',
    notes: 'كبسولة أسبوعياً بعد وجبة دسمة',
  },
  {
    id: 7,
    barcode: '628100100007',
    name: 'بخاخ أوتريفين للبالغين (Otrivin 0.1%)',
    arabicName: 'بخاخ مزيل لاحتقان الأنف',
    scientificName: 'Xylometazoline HCl 0.1%',
    category: 'أنف وأذن وحنجرة',
    type: 'شراب / بخاخ',
    qty: 14,
    minQty: 6,
    price: 16.0,
    cost: 11.5,
    stripsPerBox: 1,
    unitsPerStrip: 1,
    expiry: '2027-06-25',
    supplier: 'شركة النهضة الدوائية',
    supplierCode: 'SUP-001',
    location: 'E1-2',
    notes: 'لا يستخدم أكثر من 5 أيام متتالية',
  },
  {
    id: 8,
    barcode: '628100100008',
    name: 'حلاو ستربسلز بالعسل والليمون (Strepsils)',
    arabicName: 'أقراص استحلاب لالتهاب الحلق',
    scientificName: 'Dichlorobenzyl alcohol + Amylmetacresol',
    category: 'أنف وأذن وحنجرة',
    type: 'أقراص',
    qty: 40,
    minQty: 10,
    price: 22.0,
    cost: 15.0,
    stripsPerBox: 2,
    unitsPerStrip: 8,
    expiry: '2027-09-14',
    supplier: 'شركة النهضة الدوائية',
    supplierCode: 'SUP-001',
    location: 'E2-1',
    notes: 'قرص استحلاب كل 3 ساعات',
  },
  {
    id: 9,
    barcode: '628100100009',
    name: 'مرهم فيوسيكورت (Fucicort Cream)',
    arabicName: 'كريم مضاد حيوي وكورتيزون موضعي',
    scientificName: 'Fusidic Acid 2% + Betamethasone 0.1%',
    category: 'جلدية وتجميل',
    type: 'مرهم / كريم',
    qty: 12,
    minQty: 8,
    price: 28.5,
    cost: 21.0,
    stripsPerBox: 1,
    unitsPerStrip: 1,
    expiry: '2027-01-30',
    supplier: 'مستودع المتحدة للأدوية',
    supplierCode: 'SUP-003',
    location: 'F1-1',
    notes: 'دهان موضعي مرتين يومياً',
  },
  {
    id: 10,
    barcode: '628100100010',
    name: 'شراب بروفين للأطفال (Brufen 100mg/5ml)',
    arabicName: 'خافض حرارة ومسكن أطفال',
    scientificName: 'Ibuprofen 100mg/5ml',
    category: 'أدوية أطفال',
    type: 'شراب / بخاخ',
    qty: 20,
    minQty: 5,
    price: 19.5,
    cost: 14.0,
    stripsPerBox: 1,
    unitsPerStrip: 1,
    expiry: '2027-05-01',
    supplier: 'شركة الأدوية المتقدمة',
    supplierCode: 'SUP-002',
    location: 'B1-3',
    notes: 'رج الزجاجة جيداً قبل الاستعمال',
  }
];

const initialSuppliers: Supplier[] = [
  {
    id: 1,
    code: 'SUP-001',
    name: 'شركة النهضة الدوائية',
    phone: '0501122334',
    email: 'info@nahda-pharma.com',
    address: 'الرياض - المنطقة الصناعية الثانية',
    balance: 2450.0,
    notes: 'موزع رئيسي لمنتجات GSK ونوفارتس',
  },
  {
    id: 2,
    code: 'SUP-002',
    name: 'شركة الأدوية المتقدمة',
    phone: '0559988776',
    email: 'sales@advancedpharma.sa',
    address: 'جدة - حي الشرفية',
    balance: 1800.0,
    notes: 'توريد أسبوعي كل يوم أحد',
  },
  {
    id: 3,
    code: 'SUP-003',
    name: 'مستودع المتحدة للأدوية',
    phone: '0544332211',
    email: 'orders@united-depot.com',
    address: 'الدمام - طريق الظهران',
    balance: 950.0,
    notes: 'خصم نقدي 3% عند السداد الفوري',
  },
];

const initialUsers: User[] = [
  {
    id: 'u-1',
    username: 'admin',
    fullName: 'د. أحمد المنصوري (المدير العام)',
    role: 'admin',
    permissions: ['all', 'dashboard', 'sales', 'purchases', 'products', 'suppliers', 'reports', 'expenses', 'treasury', 'users', 'settings'],
    active: true,
    phone: '0501234567',
  },
  {
    id: 'u-2',
    username: 'pharmacist',
    fullName: 'د. سارة العتيبي (صيدلي أول)',
    role: 'pharmacist',
    permissions: ['dashboard', 'sales', 'returns', 'purchases', 'products', 'suppliers', 'reports'],
    active: true,
    phone: '0559876543',
  },
  {
    id: 'u-3',
    username: 'cashier',
    fullName: 'محمد خالد (كاشير)',
    role: 'cashier',
    permissions: ['sales', 'returns'],
    active: true,
    phone: '0567788990',
  },
];

const buildInitialState = (): PharmacyState => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().split(' ')[0];

  const initialShift: Shift = {
    id: 'shift-1',
    shiftNumber: 1,
    cashierName: 'د. سارة العتيبي (صيدلي أول)',
    startTime: `${todayStr} 08:00:00`,
    openingCash: 500,
    cashSales: 162.5,
    cardSales: 75.0,
    creditSales: 0,
    totalReturns: 0,
    totalExpenses: 25.0,
    expectedCash: 637.5,
    status: 'open',
  };

  const initialSales: SaleInvoice[] = [
    {
      id: 1,
      invoiceNumber: 'INV-2026-0001',
      date: todayStr,
      time: '08:45:20',
      cashierName: 'د. سارة العتيبي',
      customerName: 'فهد السبيعي',
      customerPhone: '0504443322',
      paymentMethod: 'cash',
      items: [
        {
          productId: 1,
          name: 'بنادول إكسترا (Panadol Extra)',
          qty: 2,
          unit: 'علبة',
          price: 18.5,
          cost: 13.0,
          discount: 0,
          subtotal: 37.0,
          barcode: '628100100001',
        },
        {
          productId: 8,
          name: 'حلاو ستربسلز بالعسل والليمون (Strepsils)',
          qty: 1,
          unit: 'علبة',
          price: 22.0,
          cost: 15.0,
          discount: 0,
          subtotal: 22.0,
          barcode: '628100100008',
        },
      ],
      subtotal: 59.0,
      discount: 0,
      tax: 0,
      total: 59.0,
      paidAmount: 100.0,
      changeAmount: 41.0,
      shiftId: 'shift-1',
      status: 'completed',
    },
    {
      id: 2,
      invoiceNumber: 'INV-2026-0002',
      date: todayStr,
      time: '09:30:10',
      cashierName: 'د. سارة العتيبي',
      customerName: 'أم عبد العزيز',
      paymentMethod: 'card',
      items: [
        {
          productId: 6,
          name: 'فيتامين د3 50000 وحدة (Vitamin D3)',
          qty: 1,
          unit: 'علبة',
          price: 75.0,
          cost: 55.0,
          discount: 0,
          subtotal: 75.0,
          barcode: '628100100006',
        },
      ],
      subtotal: 75.0,
      discount: 0,
      tax: 0,
      total: 75.0,
      paidAmount: 75.0,
      changeAmount: 0,
      shiftId: 'shift-1',
      status: 'completed',
    },
    {
      id: 3,
      invoiceNumber: 'INV-2026-0003',
      date: todayStr,
      time: '10:15:44',
      cashierName: 'د. سارة العتيبي',
      customerName: 'عميل نقدي',
      paymentMethod: 'cash',
      items: [
        {
          productId: 2,
          name: 'أوجمنتين 1 جم (Augmentin 1g)',
          qty: 1,
          unit: 'علبة',
          price: 68.0,
          cost: 52.0,
          discount: 0,
          subtotal: 68.0,
          barcode: '628100100002',
        },
        {
          productId: 10,
          name: 'شراب بروفين للأطفال (Brufen 100mg/5ml)',
          qty: 2,
          unit: 'علبة',
          price: 19.5,
          cost: 14.0,
          discount: 0,
          subtotal: 39.0,
          barcode: '628100100010',
        },
      ],
      subtotal: 107.0,
      discount: 3.5,
      tax: 0,
      total: 103.5,
      paidAmount: 110.0,
      changeAmount: 6.5,
      shiftId: 'shift-1',
      status: 'completed',
    },
  ];

  const initialExpenses: Expense[] = [
    {
      id: 1,
      date: todayStr,
      title: 'أدوات نظافة ومطهرات للصيدلية',
      category: 'supplies',
      amount: 25.0,
      notes: 'من درج الكاشير',
      registeredBy: 'د. سارة العتيبي',
    },
  ];

  return {
    users: initialUsers,
    products: initialProducts,
    suppliers: initialSuppliers,
    sales: initialSales,
    returns: [],
    purchases: [
      {
        id: 1,
        invoiceNumber: 'PUR-2026-001',
        supplierInvoiceRef: 'INV-GSK-9901',
        date: todayStr,
        supplierId: 1,
        supplierName: 'شركة النهضة الدوائية',
        items: [
          {
            productId: 1,
            name: 'بنادول إكسترا (Panadol Extra)',
            barcode: '628100100001',
            qty: 50,
            unit: 'علبة',
            cost: 13.0,
            sellingPrice: 18.5,
            expiry: '2027-08-15',
            subtotal: 650.0,
          },
        ],
        total: 650.0,
        paidAmount: 650.0,
        remainingAmount: 0,
        registeredBy: 'admin',
        notes: 'دفعة سداد أولية',
      },
    ],
    expenses: initialExpenses,
    supplierPayments: [
      {
        id: 1,
        date: todayStr,
        supplierId: 1,
        supplierName: 'شركة النهضة الدوائية',
        amount: 500,
        paymentMethod: 'bank',
        registeredBy: 'admin',
        notes: 'دفعة تحويل بنكي',
      },
    ],
    treasury: {
      balance: 1450.0,
      transactions: [
        {
          id: 1,
          date: todayStr,
          time: '08:00:00',
          type: 'shift_opening',
          amount: 500,
          balanceAfter: 500,
          title: 'رصيد افتتاح شفت الصباح',
          registeredBy: 'د. سارة العتيبي',
        },
        {
          id: 2,
          date: todayStr,
          time: '08:45:20',
          type: 'sale',
          amount: 59.0,
          balanceAfter: 559.0,
          title: 'مبيعات نقدية فاتورة INV-2026-0001',
          refId: 1,
          registeredBy: 'د. سارة العتيبي',
        },
        {
          id: 3,
          date: todayStr,
          time: '09:00:00',
          type: 'expense',
          amount: -25.0,
          balanceAfter: 534.0,
          title: 'مصروف نظافة ومطهرات',
          refId: 1,
          registeredBy: 'د. سارة العتيبي',
        },
        {
          id: 4,
          date: todayStr,
          time: '10:15:44',
          type: 'sale',
          amount: 103.5,
          balanceAfter: 637.5,
          title: 'مبيعات نقدية فاتورة INV-2026-0003',
          refId: 3,
          registeredBy: 'د. سارة العتيبي',
        },
      ],
    },
    shifts: [initialShift],
    auditLog: [
      {
        id: 1,
        date: todayStr,
        time: '08:00:00',
        user: 'د. سارة العتيبي',
        action: 'فتح شفت كاشير',
        details: 'بدء الشفت برصيد افتتاحي 500 ر.س',
      },
      {
        id: 2,
        date: todayStr,
        time: nowTime,
        user: 'admin',
        action: 'تسجيل دخول للنظام',
        details: 'تسجيل دخول ناجح للمدير العام',
      },
    ],
    inventoryLog: [
      {
        id: 1,
        date: todayStr,
        productId: 1,
        productName: 'بنادول إكسترا (Panadol Extra)',
        changeQty: -2,
        remainingQty: 48,
        reason: 'sale',
        user: 'د. سارة العتيبي',
        notes: 'فاتورة INV-2026-0001',
      },
    ],
    settings: defaultSettings,
    nextProductId: 11,
    nextSaleId: 4,
    nextPurchaseId: 2,
    nextSupplierId: 4,
    nextExpenseId: 2,
    nextReturnId: 1,
    nextSupplierPaymentId: 2,
  };
};

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PharmacyContextType {
  state: PharmacyState;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activePortal: 'pharmacy' | 'admin';
  setActivePortal: (portal: 'pharmacy' | 'admin') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  
  // Actions
  createSale: (
    items: SaleItem[],
    customerName: string,
    customerPhone: string,
    paymentMethod: PaymentMethod,
    discount: number,
    doctorName?: string,
    prescriptionNote?: string,
    paidAmount?: number
  ) => SaleInvoice | null;

  createReturn: (
    saleInvoiceId: number,
    returnItems: ReturnItem[],
    reason: string
  ) => SaleReturn | null;

  createPurchase: (
    supplierId: number,
    supplierInvoiceRef: string,
    items: PurchaseItem[],
    paidAmount: number,
    notes?: string
  ) => PurchaseInvoice | null;

  saveProduct: (product: Partial<Product>) => Product;
  deleteProduct: (id: number) => boolean;
  adjustStock: (productId: number, newQty: number, reasonText: string) => void;

  saveSupplier: (supplier: Partial<Supplier>) => Supplier;
  deleteSupplier: (id: number) => boolean;
  addSupplierPayment: (supplierId: number, amount: number, paymentMethod: 'cash' | 'bank', notes?: string) => void;

  addExpense: (title: string, category: Expense['category'], amount: number, notes?: string) => void;
  manualTreasuryAction: (type: 'manual_deposit' | 'manual_withdrawal', amount: number, title: string) => void;

  openShift: (openingCash: number) => Shift;
  closeShift: (actualCash: number, notes?: string) => Shift | null;

  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  updateSettings: (newSettings: Partial<PharmacySettings>) => void;
  exportDataToCSV: (type: 'sales' | 'purchases' | 'products' | 'suppliers' | 'expenses') => void;
  exportFullBackup: () => void;
  restoreBackup: (fileContent: string) => boolean;
  resetAllData: () => void;
  refreshState: () => void;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PharmacyState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          // Merge with default settings if missing
          return {
            ...buildInitialState(),
            ...parsed,
            settings: { ...defaultSettings, ...(parsed.settings || {}) },
          };
        }
      }
    } catch (err) {
      console.error('Failed to parse state from localStorage', err);
    }
    return buildInitialState();
  });

  const [activePortal, setActivePortal] = useState<'pharmacy' | 'admin'>('pharmacy');
  const [currentUser, setCurrentUser] = useState<User>(() => state.users[0] || initialUsers[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('pharmacy_dark_mode') === '1' ? 'dark' : 'light';
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('pharmacy_dark_mode', '1');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pharmacy_dark_mode', '0');
    }
  }, [theme]);

  // Sync sound settings with audio utility
  useEffect(() => {
    sounds.enabled = state.settings.soundEnabled;
  }, [state.settings.soundEnabled]);

  // Save to localStorage on state change
  const saveStateToStorage = useCallback((newState: PharmacyState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshState = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
        showToast('تم تحديث البيانات بنجاح', 'info');
      }
    } catch {
      showToast('خطأ أثناء تحديث البيانات', 'error');
    }
  };

  // Helper for audit logging
  const logAudit = (user: string, action: string, details: string, currentLogs: AuditLog[]): AuditLog[] => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const newLog: AuditLog = {
      id: Date.now(),
      date: todayStr,
      time: nowTime,
      user,
      action,
      details,
    };
    return [newLog, ...currentLogs.slice(0, 199)];
  };

  // CREATE SALE INVOICE
  const createSale = (
    items: SaleItem[],
    customerName: string,
    customerPhone: string,
    paymentMethod: PaymentMethod,
    discount: number,
    doctorName?: string,
    prescriptionNote?: string,
    paidAmount?: number
  ): SaleInvoice | null => {
    if (!items.length) {
      sounds.playError();
      showToast('سلة الفاتورة فارغة!', 'error');
      return null;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    // Calculate subtotal
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const finalTotal = Math.max(0, subtotal - discount);
    const actualPaid = paidAmount !== undefined ? paidAmount : finalTotal;
    const change = Math.max(0, actualPaid - finalTotal);

    // Active shift
    const activeShift = state.shifts.find(s => s.status === 'open');

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(state.nextSaleId).padStart(4, '0')}`;
    const newInvoice: SaleInvoice = {
      id: state.nextSaleId,
      invoiceNumber,
      date: todayStr,
      time: nowTime,
      cashierName: currentUser.fullName,
      customerName: customerName.trim() || 'عميل نقدي',
      customerPhone: customerPhone.trim() || undefined,
      doctorName: doctorName?.trim() || undefined,
      prescriptionNote: prescriptionNote?.trim() || undefined,
      paymentMethod,
      items,
      subtotal,
      discount,
      tax: 0,
      total: finalTotal,
      paidAmount: actualPaid,
      changeAmount: change,
      shiftId: activeShift ? activeShift.id : undefined,
      status: 'completed',
    };

    // Update product stock and log inventory
    const updatedProducts = [...state.products];
    const newInventoryLogs: InventoryLog[] = [];

    items.forEach(item => {
      const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
      if (pIdx !== -1) {
        const currentP = updatedProducts[pIdx];
        const newQty = Math.max(0, currentP.qty - item.qty);
        updatedProducts[pIdx] = { ...currentP, qty: newQty };

        newInventoryLogs.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          date: todayStr,
          productId: currentP.id,
          productName: currentP.name,
          changeQty: -item.qty,
          remainingQty: newQty,
          reason: 'sale',
          user: currentUser.fullName,
          notes: `فاتورة ${invoiceNumber}`,
        });
      }
    });

    // Update treasury if cash payment
    let newTreasuryBalance = state.treasury.balance;
    const newTreasuryTransactions = [...state.treasury.transactions];

    if (paymentMethod === 'cash') {
      newTreasuryBalance += finalTotal;
      newTreasuryTransactions.unshift({
        id: Date.now(),
        date: todayStr,
        time: nowTime,
        type: 'sale',
        amount: finalTotal,
        balanceAfter: newTreasuryBalance,
        title: `مبيعات نقدية فاتورة ${invoiceNumber}`,
        refId: newInvoice.id,
        registeredBy: currentUser.fullName,
      });
    }

    // Update active shift if any
    const updatedShifts = state.shifts.map(s => {
      if (s.status === 'open') {
        const cashDelta = paymentMethod === 'cash' ? finalTotal : 0;
        const cardDelta = paymentMethod === 'card' ? finalTotal : 0;
        const creditDelta = paymentMethod === 'credit' ? finalTotal : 0;
        return {
          ...s,
          cashSales: s.cashSales + cashDelta,
          cardSales: s.cardSales + cardDelta,
          creditSales: s.creditSales + creditDelta,
          expectedCash: s.expectedCash + cashDelta,
        };
      }
      return s;
    });

    const updatedAuditLog = logAudit(
      currentUser.fullName,
      'إصدار فاتورة مبيعات',
      `فاتورة ${invoiceNumber} بمبلغ ${finalTotal.toFixed(2)} ${state.settings.currency} (${paymentMethod})`,
      state.auditLog
    );

    const newState: PharmacyState = {
      ...state,
      sales: [newInvoice, ...state.sales],
      products: updatedProducts,
      inventoryLog: [...newInventoryLogs, ...state.inventoryLog],
      treasury: {
        balance: newTreasuryBalance,
        transactions: newTreasuryTransactions,
      },
      shifts: updatedShifts,
      auditLog: updatedAuditLog,
      nextSaleId: state.nextSaleId + 1,
    };

    saveStateToStorage(newState);
    sounds.playSuccess();
    showToast(`تم حفظ الفاتورة بنجاح: ${invoiceNumber}`, 'success');

    return newInvoice;
  };

  // CREATE RETURN
  const createReturn = (
    saleInvoiceId: number,
    returnItems: ReturnItem[],
    reason: string
  ): SaleReturn | null => {
    const saleInvoice = state.sales.find(s => s.id === saleInvoiceId);
    if (!saleInvoice) {
      sounds.playError();
      showToast('الفاتورة الأصلية غير موجودة', 'error');
      return null;
    }

    if (!returnItems.length) {
      sounds.playError();
      showToast('يرجى تحديد الأصناف المراد إرجاعها', 'error');
      return null;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const totalRefund = returnItems.reduce((acc, item) => acc + item.subtotal, 0);

    const returnNumber = `RET-${new Date().getFullYear()}-${String(state.nextReturnId).padStart(4, '0')}`;
    const newReturn: SaleReturn = {
      id: state.nextReturnId,
      returnNumber,
      saleInvoiceId: saleInvoice.id,
      saleInvoiceNumber: saleInvoice.invoiceNumber,
      date: todayStr,
      time: nowTime,
      processedBy: currentUser.fullName,
      items: returnItems,
      totalRefund,
      reason: reason.trim() || 'إرجاع بناءً على رغبة العميل',
    };

    // Increment product stock
    const updatedProducts = [...state.products];
    const newInventoryLogs: InventoryLog[] = [];

    returnItems.forEach(item => {
      const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
      if (pIdx !== -1) {
        const currentP = updatedProducts[pIdx];
        const newQty = currentP.qty + item.qty;
        updatedProducts[pIdx] = { ...currentP, qty: newQty };

        newInventoryLogs.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          date: todayStr,
          productId: currentP.id,
          productName: currentP.name,
          changeQty: item.qty,
          remainingQty: newQty,
          reason: 'return',
          user: currentUser.fullName,
          notes: `مرتجع ${returnNumber} للفاتورة ${saleInvoice.invoiceNumber}`,
        });
      }
    });

    // Reduce treasury
    const newTreasuryBalance = state.treasury.balance - totalRefund;
    const newTreasuryTransactions = [
      {
        id: Date.now(),
        date: todayStr,
        time: nowTime,
        type: 'return' as const,
        amount: -totalRefund,
        balanceAfter: newTreasuryBalance,
        title: `مرتجع مبيعات ${returnNumber}`,
        refId: newReturn.id,
        registeredBy: currentUser.fullName,
      },
      ...state.treasury.transactions,
    ];

    // Update active shift if any
    const updatedShifts = state.shifts.map(s => {
      if (s.status === 'open') {
        return {
          ...s,
          totalReturns: s.totalReturns + totalRefund,
          expectedCash: s.expectedCash - totalRefund,
        };
      }
      return s;
    });

    // Update sales invoice status
    const updatedSales = state.sales.map(s => {
      if (s.id === saleInvoiceId) {
        return { ...s, status: 'returned' as const };
      }
      return s;
    });

    const updatedAuditLog = logAudit(
      currentUser.fullName,
      'إصدار مرتجع مبيعات',
      `مرتجع ${returnNumber} للفاتورة ${saleInvoice.invoiceNumber} بمبلغ ${totalRefund.toFixed(2)} ${state.settings.currency}`,
      state.auditLog
    );

    const newState: PharmacyState = {
      ...state,
      returns: [newReturn, ...state.returns],
      sales: updatedSales,
      products: updatedProducts,
      inventoryLog: [...newInventoryLogs, ...state.inventoryLog],
      treasury: {
        balance: newTreasuryBalance,
        transactions: newTreasuryTransactions,
      },
      shifts: updatedShifts,
      auditLog: updatedAuditLog,
      nextReturnId: state.nextReturnId + 1,
    };

    saveStateToStorage(newState);
    sounds.playSuccess();
    showToast(`تم تسجيل المرتجع بنجاح: ${returnNumber}`, 'success');

    return newReturn;
  };

  // CREATE PURCHASE INVOICE
  const createPurchase = (
    supplierId: number,
    supplierInvoiceRef: string,
    items: PurchaseItem[],
    paidAmount: number,
    notes?: string
  ): PurchaseInvoice | null => {
    const supplier = state.suppliers.find(s => s.id === supplierId);
    if (!supplier) {
      sounds.playError();
      showToast('المورد غير محدد أو غير موجود', 'error');
      return null;
    }

    if (!items.length) {
      sounds.playError();
      showToast('يرجى إضافة أصناف لفاتورة الشراء', 'error');
      return null;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const total = items.reduce((acc, it) => acc + it.subtotal, 0);
    const remaining = Math.max(0, total - paidAmount);

    const invoiceNumber = `PUR-${new Date().getFullYear()}-${String(state.nextPurchaseId).padStart(4, '0')}`;
    const newPurchase: PurchaseInvoice = {
      id: state.nextPurchaseId,
      invoiceNumber,
      supplierInvoiceRef: supplierInvoiceRef.trim() || undefined,
      date: todayStr,
      supplierId,
      supplierName: supplier.name,
      items,
      total,
      paidAmount,
      remainingAmount: remaining,
      registeredBy: currentUser.fullName,
      notes: notes?.trim() || undefined,
    };

    // Update product quantities, cost, and expiry
    const updatedProducts = [...state.products];
    const newInventoryLogs: InventoryLog[] = [];

    items.forEach(it => {
      const pIdx = updatedProducts.findIndex(p => p.id === it.productId);
      if (pIdx !== -1) {
        const p = updatedProducts[pIdx];
        const newQty = p.qty + it.qty;
        updatedProducts[pIdx] = {
          ...p,
          qty: newQty,
          cost: it.cost > 0 ? it.cost : p.cost,
          price: it.sellingPrice > 0 ? it.sellingPrice : p.price,
          expiry: it.expiry || p.expiry,
        };

        newInventoryLogs.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          date: todayStr,
          productId: p.id,
          productName: p.name,
          changeQty: it.qty,
          remainingQty: newQty,
          reason: 'purchase',
          user: currentUser.fullName,
          notes: `شراء من ${supplier.name} - فاتورة ${invoiceNumber}`,
        });
      }
    });

    // Update supplier balance (adds remaining debt)
    const updatedSuppliers = state.suppliers.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          balance: s.balance + remaining,
        };
      }
      return s;
    });

    // Update treasury if paidAmount > 0
    let newTreasuryBalance = state.treasury.balance;
    const newTreasuryTransactions = [...state.treasury.transactions];

    if (paidAmount > 0) {
      newTreasuryBalance -= paidAmount;
      newTreasuryTransactions.unshift({
        id: Date.now(),
        date: todayStr,
        time: new Date().toTimeString().split(' ')[0],
        type: 'purchase',
        amount: -paidAmount,
        balanceAfter: newTreasuryBalance,
        title: `دفعة مشتريات فاتورة ${invoiceNumber} - ${supplier.name}`,
        refId: newPurchase.id,
        registeredBy: currentUser.fullName,
      });
    }

    const updatedAuditLog = logAudit(
      currentUser.fullName,
      'فاتورة مشتريات جديدة',
      `فاتورة شراء ${invoiceNumber} من المورد ${supplier.name} بإجمالي ${total.toFixed(2)} ${state.settings.currency}`,
      state.auditLog
    );

    const newState: PharmacyState = {
      ...state,
      purchases: [newPurchase, ...state.purchases],
      products: updatedProducts,
      suppliers: updatedSuppliers,
      inventoryLog: [...newInventoryLogs, ...state.inventoryLog],
      treasury: {
        balance: newTreasuryBalance,
        transactions: newTreasuryTransactions,
      },
      auditLog: updatedAuditLog,
      nextPurchaseId: state.nextPurchaseId + 1,
    };

    saveStateToStorage(newState);
    sounds.playSuccess();
    showToast(`تم حفظ فاتورة المشتريات: ${invoiceNumber}`, 'success');

    return newPurchase;
  };

  // SAVE PRODUCT
  const saveProduct = (productData: Partial<Product>): Product => {
    let savedProduct: Product;
    const todayStr = new Date().toISOString().split('T')[0];

    if (productData.id) {
      // Edit existing
      const pIdx = state.products.findIndex(p => p.id === productData.id);
      savedProduct = {
        ...state.products[pIdx],
        ...productData,
      } as Product;

      const updatedProducts = [...state.products];
      updatedProducts[pIdx] = savedProduct;

      const updatedAuditLog = logAudit(
        currentUser.fullName,
        'تعديل صنف',
        `تعديل بيانات الصنف: ${savedProduct.name}`,
        state.auditLog
      );

      saveStateToStorage({
        ...state,
        products: updatedProducts,
        auditLog: updatedAuditLog,
      });

      sounds.playSuccess();
      showToast('تم تحديث الصنف بنجاح', 'success');
    } else {
      // Create new
      const newBarcode = productData.barcode?.trim() || `6281001${String(state.nextProductId).padStart(5, '0')}`;
      savedProduct = {
        id: state.nextProductId,
        barcode: newBarcode,
        name: productData.name?.trim() || 'صنف جديد',
        arabicName: productData.arabicName?.trim() || '',
        scientificName: productData.scientificName?.trim() || '',
        category: productData.category?.trim() || 'عام',
        type: productData.type?.trim() || 'أقراص',
        qty: Number(productData.qty || 0),
        minQty: Number(productData.minQty || 5),
        price: Number(productData.price || 0),
        cost: Number(productData.cost || 0),
        stripsPerBox: Number(productData.stripsPerBox || 1),
        unitsPerStrip: Number(productData.unitsPerStrip || 10),
        expiry: productData.expiry || '2027-12-31',
        supplier: productData.supplier || (state.suppliers[0]?.name || 'عام'),
        supplierCode: productData.supplierCode || (state.suppliers[0]?.code || 'SUP-001'),
        location: productData.location || 'A1',
        notes: productData.notes || '',
      };

      const updatedAuditLog = logAudit(
        currentUser.fullName,
        'إضافة صنف جديد',
        `إضافة ${savedProduct.name} - سعر البيع ${savedProduct.price}`,
        state.auditLog
      );

      const initialInventoryLog: InventoryLog = {
        id: Date.now(),
        date: todayStr,
        productId: savedProduct.id,
        productName: savedProduct.name,
        changeQty: savedProduct.qty,
        remainingQty: savedProduct.qty,
        reason: 'adjustment',
        user: currentUser.fullName,
        notes: 'رصيد افتتاحي لإضافة الصنف',
      };

      saveStateToStorage({
        ...state,
        products: [savedProduct, ...state.products],
        inventoryLog: [initialInventoryLog, ...state.inventoryLog],
        auditLog: updatedAuditLog,
        nextProductId: state.nextProductId + 1,
      });

      sounds.playSuccess();
      showToast(`تمت إضافة الصنف: ${savedProduct.name}`, 'success');
    }

    return savedProduct;
  };

  // DELETE PRODUCT
  const deleteProduct = (id: number): boolean => {
    const p = state.products.find(item => item.id === id);
    if (!p) return false;

    const updatedProducts = state.products.filter(item => item.id !== id);
    const updatedAuditLog = logAudit(
      currentUser.fullName,
      'حذف صنف',
      `تم حذف الصنف: ${p.name}`,
      state.auditLog
    );

    saveStateToStorage({
      ...state,
      products: updatedProducts,
      auditLog: updatedAuditLog,
    });

    sounds.playSuccess();
    showToast(`تم حذف الصنف ${p.name}`, 'info');
    return true;
  };

  // ADJUST STOCK
  const adjustStock = (productId: number, newQty: number, reasonText: string) => {
    const p = state.products.find(item => item.id === productId);
    if (!p) return;

    const diff = newQty - p.qty;
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedProducts = state.products.map(item => {
      if (item.id === productId) {
        return { ...item, qty: Math.max(0, newQty) };
      }
      return item;
    });

    const newLog: InventoryLog = {
      id: Date.now(),
      date: todayStr,
      productId: p.id,
      productName: p.name,
      changeQty: diff,
      remainingQty: Math.max(0, newQty),
      reason: 'adjustment',
      user: currentUser.fullName,
      notes: reasonText || 'تسوية جرد يدوي',
    };

    const updatedAuditLog = logAudit(
      currentUser.fullName,
      'تسوية جرد يدوي',
      `تسوية كمية ${p.name} من ${p.qty} إلى ${newQty} (${reasonText})`,
      state.auditLog
    );

    saveStateToStorage({
      ...state,
      products: updatedProducts,
      inventoryLog: [newLog, ...state.inventoryLog],
      auditLog: updatedAuditLog,
    });

    sounds.playSuccess();
    showToast('تم تحديث رصيد المخزون', 'success');
  };

  // SAVE SUPPLIER
  const saveSupplier = (supplierData: Partial<Supplier>): Supplier => {
    let saved: Supplier;

    if (supplierData.id) {
      const idx = state.suppliers.findIndex(s => s.id === supplierData.id);
      saved = { ...state.suppliers[idx], ...supplierData } as Supplier;
      const updated = [...state.suppliers];
      updated[idx] = saved;

      const updatedAuditLog = logAudit(
        currentUser.fullName,
        'تعديل مورد',
        `تعديل بيانات المورد: ${saved.name}`,
        state.auditLog
      );

      saveStateToStorage({ ...state, suppliers: updated, auditLog: updatedAuditLog });
      showToast('تم تعديل بيانات المورد', 'success');
    } else {
      const code = supplierData.code?.trim() || `SUP-${String(state.nextSupplierId).padStart(3, '0')}`;
      saved = {
        id: state.nextSupplierId,
        code,
        name: supplierData.name?.trim() || 'مورد جديد',
        phone: supplierData.phone?.trim() || '',
        email: supplierData.email?.trim() || '',
        address: supplierData.address?.trim() || '',
        balance: Number(supplierData.balance || 0),
        notes: supplierData.notes || '',
      };

      const updatedAuditLog = logAudit(
        currentUser.fullName,
        'إضافة مورد جديد',
        `إضافة مورد: ${saved.name} (${saved.code})`,
        state.auditLog
      );

      saveStateToStorage({
        ...state,
        suppliers: [...state.suppliers, saved],
        auditLog: updatedAuditLog,
        nextSupplierId: state.nextSupplierId + 1,
      });
      showToast(`تمت إضافة المورد: ${saved.name}`, 'success');
    }

    sounds.playSuccess();
    return saved;
  };

  const deleteSupplier = (id: number): boolean => {
    const s = state.suppliers.find(item => item.id === id);
    if (!s) return false;

    saveStateToStorage({
      ...state,
      suppliers: state.suppliers.filter(item => item.id !== id),
      auditLog: logAudit(currentUser.fullName, 'حذف مورد', `حذف المورد: ${s.name}`, state.auditLog),
    });

    sounds.playSuccess();
    showToast(`تم حذف المورد: ${s.name}`, 'info');
    return true;
  };

  // SUPPLIER PAYMENT
  const addSupplierPayment = (supplierId: number, amount: number, paymentMethod: 'cash' | 'bank', notes?: string) => {
    const supplier = state.suppliers.find(s => s.id === supplierId);
    if (!supplier || amount <= 0) {
      sounds.playError();
      showToast('بيانات السداد غير صحيحة', 'error');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    const payment: SupplierPayment = {
      id: state.nextSupplierPaymentId,
      date: todayStr,
      supplierId,
      supplierName: supplier.name,
      amount,
      paymentMethod,
      registeredBy: currentUser.fullName,
      notes,
    };

    // Update supplier balance
    const updatedSuppliers = state.suppliers.map(s => {
      if (s.id === supplierId) {
        return { ...s, balance: Math.max(0, s.balance - amount) };
      }
      return s;
    });

    // Update treasury
    const newTreasuryBalance = state.treasury.balance - amount;
    const newTreasuryTransactions = [
      {
        id: Date.now(),
        date: todayStr,
        time: nowTime,
        type: 'supplier_payment' as const,
        amount: -amount,
        balanceAfter: newTreasuryBalance,
        title: `سداد للمورد ${supplier.name} (${paymentMethod === 'cash' ? 'نقداً' : 'تحويل بنكي'})`,
        refId: payment.id,
        registeredBy: currentUser.fullName,
      },
      ...state.treasury.transactions,
    ];

    const updatedAuditLog = logAudit(
      currentUser.fullName,
      'سند صرف مورد',
      `سداد ${amount.toFixed(2)} ${state.settings.currency} للمورد ${supplier.name}`,
      state.auditLog
    );

    saveStateToStorage({
      ...state,
      suppliers: updatedSuppliers,
      supplierPayments: [payment, ...state.supplierPayments],
      treasury: {
        balance: newTreasuryBalance,
        transactions: newTreasuryTransactions,
      },
      auditLog: updatedAuditLog,
      nextSupplierPaymentId: state.nextSupplierPaymentId + 1,
    });

    sounds.playSuccess();
    showToast(`تم تسجيل سداد ${amount} للمورد ${supplier.name}`, 'success');
  };

  // ADD EXPENSE
  const addExpense = (title: string, category: Expense['category'], amount: number, notes?: string) => {
    if (!title.trim() || amount <= 0) {
      sounds.playError();
      showToast('يرجى إدخال اسم المصروف وقيمة صالحة', 'error');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    const newExpense: Expense = {
      id: state.nextExpenseId,
      date: todayStr,
      title: title.trim(),
      category,
      amount,
      notes,
      registeredBy: currentUser.fullName,
    };

    const newTreasuryBalance = state.treasury.balance - amount;
    const newTreasuryTransactions = [
      {
        id: Date.now(),
        date: todayStr,
        time: nowTime,
        type: 'expense' as const,
        amount: -amount,
        balanceAfter: newTreasuryBalance,
        title: `مصروف: ${title.trim()}`,
        refId: newExpense.id,
        registeredBy: currentUser.fullName,
      },
      ...state.treasury.transactions,
    ];

    // Update active shift expenses
    const updatedShifts = state.shifts.map(s => {
      if (s.status === 'open') {
        return {
          ...s,
          totalExpenses: s.totalExpenses + amount,
          expectedCash: s.expectedCash - amount,
        };
      }
      return s;
    });

    const updatedAuditLog = logAudit(
      currentUser.fullName,
      'تسجيل مصروف',
      `تسجيل مصروف ${title} بمبلغ ${amount} ${state.settings.currency}`,
      state.auditLog
    );

    saveStateToStorage({
      ...state,
      expenses: [newExpense, ...state.expenses],
      treasury: {
        balance: newTreasuryBalance,
        transactions: newTreasuryTransactions,
      },
      shifts: updatedShifts,
      auditLog: updatedAuditLog,
      nextExpenseId: state.nextExpenseId + 1,
    });

    sounds.playSuccess();
    showToast('تم تسجيل المصروف وتحديث الخزينة', 'success');
  };

  // MANUAL TREASURY ACTION
  const manualTreasuryAction = (type: 'manual_deposit' | 'manual_withdrawal', amount: number, title: string) => {
    if (amount <= 0 || !title.trim()) {
      sounds.playError();
      showToast('بيانات الحركة غير صالحة', 'error');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const signedAmount = type === 'manual_deposit' ? amount : -amount;
    const newTreasuryBalance = state.treasury.balance + signedAmount;

    const newTransaction: TreasuryTransaction = {
      id: Date.now(),
      date: todayStr,
      time: nowTime,
      type,
      amount: signedAmount,
      balanceAfter: newTreasuryBalance,
      title: title.trim(),
      registeredBy: currentUser.fullName,
    };

    const actionText = type === 'manual_deposit' ? 'إيداع نقدي بالخزينة' : 'سحب نقدي من الخزينة';
    const updatedAuditLog = logAudit(
      currentUser.fullName,
      actionText,
      `${actionText}: ${amount.toFixed(2)} ${state.settings.currency} - ${title}`,
      state.auditLog
    );

    saveStateToStorage({
      ...state,
      treasury: {
        balance: newTreasuryBalance,
        transactions: [newTransaction, ...state.treasury.transactions],
      },
      auditLog: updatedAuditLog,
    });

    sounds.playSuccess();
    showToast(`تم ${type === 'manual_deposit' ? 'إيداع' : 'سحب'} ${amount} بنجاح`, 'success');
  };

  // SHIFT MANAGEMENT
  const openShift = (openingCash: number): Shift => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const shiftNumber = state.shifts.length + 1;

    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      shiftNumber,
      cashierName: currentUser.fullName,
      startTime: `${todayStr} ${nowTime}`,
      openingCash: Number(openingCash || 0),
      cashSales: 0,
      cardSales: 0,
      creditSales: 0,
      totalReturns: 0,
      totalExpenses: 0,
      expectedCash: Number(openingCash || 0),
      status: 'open',
    };

    const updatedAuditLog = logAudit(
      currentUser.fullName,
      'فتح شفت جديد',
      `شفت رقم #${shiftNumber} برصيد افتتاحي ${openingCash} ${state.settings.currency}`,
      state.auditLog
    );

    saveStateToStorage({
      ...state,
      shifts: [newShift, ...state.shifts],
      auditLog: updatedAuditLog,
    });

    sounds.playSuccess();
    showToast(`تم فتح شفت جديد بنجاح (#${shiftNumber})`, 'success');
    return newShift;
  };

  const closeShift = (actualCash: number, notes?: string): Shift | null => {
    const activeShift = state.shifts.find(s => s.status === 'open');
    if (!activeShift) {
      sounds.playError();
      showToast('لا يوجد شفت مفتوح حالياً لإغلاقه', 'error');
      return null;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const difference = actualCash - activeShift.expectedCash;

    let closedShiftObj: Shift | null = null;

    const updatedShifts = state.shifts.map(s => {
      if (s.id === activeShift.id) {
        closedShiftObj = {
          ...s,
          endTime: `${todayStr} ${nowTime}`,
          actualCash,
          difference,
          status: 'closed' as const,
          notes: notes?.trim() || undefined,
        };
        return closedShiftObj;
      }
      return s;
    });

    const diffText = difference === 0 ? 'مطابق تماماً' : difference > 0 ? `زيادة (+${difference.toFixed(2)})` : `عجز (${difference.toFixed(2)})`;

    const updatedAuditLog = logAudit(
      currentUser.fullName,
      'تقفيل شفت الكاشير',
      `إغلاق شفت #${activeShift.shiftNumber} - الفعلي: ${actualCash} - المتوقع: ${activeShift.expectedCash} (${diffText})`,
      state.auditLog
    );

    saveStateToStorage({
      ...state,
      shifts: updatedShifts,
      auditLog: updatedAuditLog,
    });

    sounds.playSuccess();
    showToast(`تم تقفيل الشفت بنجاح: رصيد الخزينة ${diffText}`, 'success');
    return closedShiftObj;
  };

  // USERS
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
    };
    saveStateToStorage({
      ...state,
      users: [...state.users, newUser],
      auditLog: logAudit(currentUser.fullName, 'إضافة مستخدم', `إضافة المستخدم: ${newUser.fullName} (${newUser.role})`, state.auditLog),
    });
    sounds.playSuccess();
    showToast(`تمت إضافة المستخدم: ${newUser.fullName}`, 'success');
  };

  const updateUser = (user: User) => {
    const updatedUsers = state.users.map(u => (u.id === user.id ? user : u));
    saveStateToStorage({
      ...state,
      users: updatedUsers,
      auditLog: logAudit(currentUser.fullName, 'تعديل مستخدم', `تعديل بيانات المستخدم: ${user.fullName}`, state.auditLog),
    });
    if (currentUser.id === user.id) {
      setCurrentUser(user);
    }
    sounds.playSuccess();
    showToast(`تم تحديث بيانات: ${user.fullName}`, 'success');
  };

  const deleteUser = (id: string) => {
    if (state.users.length <= 1) {
      sounds.playError();
      showToast('لا يمكن حذف المستخدم الوحيد المتبقي!', 'error');
      return;
    }
    const target = state.users.find(u => u.id === id);
    saveStateToStorage({
      ...state,
      users: state.users.filter(u => u.id !== id),
      auditLog: logAudit(currentUser.fullName, 'حذف مستخدم', `حذف المستخدم: ${target?.fullName || id}`, state.auditLog),
    });
    sounds.playSuccess();
    showToast('تم حذف المستخدم', 'info');
  };

  // SETTINGS
  const updateSettings = (newSettings: Partial<PharmacySettings>) => {
    const updated = { ...state.settings, ...newSettings };
    saveStateToStorage({
      ...state,
      settings: updated,
      auditLog: logAudit(currentUser.fullName, 'تحديث الإعدادات', 'تحديث إعدادات الصيدلية والطباعة', state.auditLog),
    });
    sounds.playSuccess();
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  // EXPORT CSV
  const exportDataToCSV = (type: 'sales' | 'purchases' | 'products' | 'suppliers' | 'expenses') => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // UTF-8 BOM for Arabic in Excel

    if (type === 'products') {
      csvContent += 'الباركود,اسم الصنف,التصنيف,النوع,الكمية,سعر التكلفة,سعر البيع,تاريخ الصلاحية,المورد,الموقع\n';
      state.products.forEach(p => {
        csvContent += `"${p.barcode}","${p.name}","${p.category}","${p.type}",${p.qty},${p.cost},${p.price},"${p.expiry}","${p.supplier}","${p.location || ''}"\n`;
      });
    } else if (type === 'sales') {
      csvContent += 'رقم الفاتورة,التاريخ,الوقت,الكاشير,العميل,طريقة الدفع,الإجمالي,الخصم,الصافي\n';
      state.sales.forEach(s => {
        csvContent += `"${s.invoiceNumber}","${s.date}","${s.time}","${s.cashierName}","${s.customerName}","${s.paymentMethod}",${s.subtotal},${s.discount},${s.total}\n`;
      });
    } else if (type === 'purchases') {
      csvContent += 'رقم الفاتورة,التاريخ,المورد,رقم فاتورة المورد,الإجمالي,المدفوع,المتبقي\n';
      state.purchases.forEach(p => {
        csvContent += `"${p.invoiceNumber}","${p.date}","${p.supplierName}","${p.supplierInvoiceRef || ''}",${p.total},${p.paidAmount},${p.remainingAmount}\n`;
      });
    } else if (type === 'suppliers') {
      csvContent += 'الكود,اسم المورد,الهاتف,البريد,الرصيد المستحق\n';
      state.suppliers.forEach(s => {
        csvContent += `"${s.code}","${s.name}","${s.phone}","${s.email || ''}",${s.balance}\n`;
      });
    } else if (type === 'expenses') {
      csvContent += 'التاريخ,عنوان المصروف,التصنيف,المبلغ,المسجل,ملاحظات\n';
      state.expenses.forEach(e => {
        csvContent += `"${e.date}","${e.title}","${e.category}",${e.amount},"${e.registeredBy}","${e.notes || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pharmacy_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`تم تصدير ملف ${type} بصيغة Excel CSV`, 'success');
  };

  // FULL BACKUP
  const exportFullBackup = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmacy_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('تم تنزيل النسخة الاحتياطية بنجاح', 'success');
  };

  const restoreBackup = (fileContent: string): boolean => {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.users)) {
        saveStateToStorage(parsed);
        sounds.playSuccess();
        showToast('تم استعادة النسخة الاحتياطية بنجاح', 'success');
        return true;
      }
    } catch {
      sounds.playError();
      showToast('الملف غير صالح أو تالف', 'error');
    }
    return false;
  };

  const resetAllData = () => {
    const fresh = buildInitialState();
    saveStateToStorage(fresh);
    sounds.playSuccess();
    showToast('تمت إعادة ضبط النظام إلى البيانات الافتراضية', 'info');
  };

  return (
    <PharmacyContext.Provider
      value={{
        state,
        currentUser,
        setCurrentUser,
        activePortal,
        setActivePortal,
        theme,
        toggleTheme,
        toasts,
        showToast,
        dismissToast,
        createSale,
        createReturn,
        createPurchase,
        saveProduct,
        deleteProduct,
        adjustStock,
        saveSupplier,
        deleteSupplier,
        addSupplierPayment,
        addExpense,
        manualTreasuryAction,
        openShift,
        closeShift,
        addUser,
        updateUser,
        deleteUser,
        updateSettings,
        exportDataToCSV,
        exportFullBackup,
        restoreBackup,
        resetAllData,
        refreshState,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
