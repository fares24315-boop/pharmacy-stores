export type UserRole = 'admin' | 'pharmacist' | 'cashier';

export interface GranularPermissions {
  // مبيعات ونقطة البيع (POS)
  canSell: boolean;
  canApplyDiscount: boolean;
  canViewSalesHistory: boolean;
  // مرتجعات المبيعات
  canProcessReturns: boolean;
  // مشتريات وموردين
  canAddPurchases: boolean;
  canViewSuppliers: boolean;
  canPaySuppliers: boolean;
  // الأصناف والمخزون
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canAdjustInventory: boolean;
  // الشفتات والكاشير
  canManageShifts: boolean;
  canRecordShiftExpense: boolean;
  // المالية والخزينة (لوحة الإدارة)
  canAccessAdminPortal: boolean;
  canViewTreasury: boolean;
  canTreasuryDepositWithdraw: boolean;
  canAddAdminExpenses: boolean;
  canViewNetProfits: boolean;
  // إدارة النظام والموظفين
  canManageUsersAndRoles: boolean;
  canChangeAppSettings: boolean;
  canExportDataExcel: boolean;
  canBackupAndRestore: boolean;
  canFactoryReset: boolean;
}

export interface UserPermission {
  id: string;
  label: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  permissions: string[];
  granularPermissions?: GranularPermissions;
  active: boolean;
  phone?: string;
}

export interface Product {
  id: number;
  barcode: string;
  name: string;
  arabicName?: string;
  scientificName?: string;
  category: string;
  type: string; // أقراص, شراب, حقن, مرهم, كبسولات, مستلزمات
  qty: number;
  minQty: number; // حد الطلب
  price: number; // سعر البيع
  cost: number; // سعر التكلفة
  stripsPerBox: number; // عدد الأشرطة بالعلبة
  unitsPerStrip: number; // عدد الوحدات بالشريط
  expiry: string; // YYYY-MM-DD
  supplier: string;
  supplierCode?: string;
  location?: string; // رف / درج
  notes?: string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // مستحقات المورد
  notes?: string;
}

export interface SaleItem {
  productId: number;
  name: string;
  qty: number;
  unit: 'علبة' | 'شريط' | 'قرص / وحدة';
  price: number;
  cost: number;
  discount: number; // نسبة أو مبلغ
  subtotal: number;
  expiry?: string;
  barcode?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'credit' | 'split';

export interface SaleInvoice {
  id: number;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  doctorName?: string;
  prescriptionNote?: string;
  paymentMethod: PaymentMethod;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  shiftId?: string;
  status: 'completed' | 'returned' | 'partial_return';
}

export interface ReturnItem {
  productId: number;
  name: string;
  qty: number;
  unit: string;
  refundPrice: number;
  subtotal: number;
}

export interface SaleReturn {
  id: number;
  returnNumber: string;
  saleInvoiceId: number;
  saleInvoiceNumber: string;
  date: string;
  time: string;
  processedBy: string;
  items: ReturnItem[];
  totalRefund: number;
  reason: string;
}

export interface PurchaseItem {
  productId: number;
  name: string;
  barcode?: string;
  qty: number;
  unit: string;
  cost: number;
  sellingPrice: number;
  expiry: string;
  subtotal: number;
}

export interface PurchaseInvoice {
  id: number;
  invoiceNumber: string;
  supplierInvoiceRef?: string;
  date: string;
  supplierId: number;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  paidAmount: number;
  remainingAmount: number;
  registeredBy: string;
  notes?: string;
}

export interface SupplierPayment {
  id: number;
  date: string;
  supplierId: number;
  supplierName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank';
  registeredBy: string;
  notes?: string;
}

export interface Expense {
  id: number;
  date: string;
  title: string;
  category: 'rent' | 'electricity' | 'salaries' | 'maintenance' | 'supplies' | 'other';
  amount: number;
  notes?: string;
  registeredBy: string;
}

export interface TreasuryTransaction {
  id: number;
  date: string;
  time: string;
  type: 'sale' | 'purchase' | 'expense' | 'supplier_payment' | 'return' | 'manual_deposit' | 'manual_withdrawal' | 'shift_opening' | 'shift_closing';
  amount: number; // positive or negative
  balanceAfter: number;
  title: string;
  refId?: string | number;
  registeredBy: string;
}

export interface Shift {
  id: string;
  shiftNumber: number;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  creditSales: number;
  totalReturns: number;
  totalExpenses: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface AuditLog {
  id: number;
  date: string;
  time: string;
  user: string;
  action: string;
  details: string;
}

export interface InventoryLog {
  id: number;
  date: string;
  productId: number;
  productName: string;
  changeQty: number;
  remainingQty: number;
  reason: 'sale' | 'purchase' | 'return' | 'adjustment' | 'expired';
  user: string;
  notes?: string;
}

export interface PharmacySettings {
  pharmacyName: string;
  taxNumber: string;
  commercialRecord: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number; // e.g. 0% or 15%
  receiptFooter: string;
  autoPrintReceipt: boolean;
  soundEnabled: boolean;
}

export interface PharmacyState {
  users: User[];
  products: Product[];
  suppliers: Supplier[];
  sales: SaleInvoice[];
  returns: SaleReturn[];
  purchases: PurchaseInvoice[];
  expenses: Expense[];
  supplierPayments: SupplierPayment[];
  treasury: {
    balance: number;
    transactions: TreasuryTransaction[];
  };
  shifts: Shift[];
  auditLog: AuditLog[];
  inventoryLog: InventoryLog[];
  settings: PharmacySettings;
  nextProductId: number;
  nextSaleId: number;
  nextPurchaseId: number;
  nextSupplierId: number;
  nextExpenseId: number;
  nextReturnId: number;
  nextSupplierPaymentId: number;
}
