import { GranularPermissions, UserRole } from '../types/pharmacy';

export const DEFAULT_ADMIN_PERMISSIONS: GranularPermissions = {
  // مبيعات ونقطة البيع (POS)
  canSell: true,
  canApplyDiscount: true,
  canViewSalesHistory: true,
  // مرتجعات
  canProcessReturns: true,
  // مشتريات وموردين
  canAddPurchases: true,
  canViewSuppliers: true,
  canPaySuppliers: true,
  // الأصناف والمخزون
  canAddProducts: true,
  canEditProducts: true,
  canDeleteProducts: true,
  canAdjustInventory: true,
  // الشفتات والكاشير
  canManageShifts: true,
  canRecordShiftExpense: true,
  // المالية والخزينة (لوحة الإدارة)
  canAccessAdminPortal: true,
  canViewTreasury: true,
  canTreasuryDepositWithdraw: true,
  canAddAdminExpenses: true,
  canViewNetProfits: true,
  // إدارة النظام والموظفين
  canManageUsersAndRoles: true,
  canChangeAppSettings: true,
  canExportDataExcel: true,
  canBackupAndRestore: true,
  canFactoryReset: true,
};

export const DEFAULT_PHARMACIST_PERMISSIONS: GranularPermissions = {
  // مبيعات ونقطة البيع (POS)
  canSell: true,
  canApplyDiscount: true,
  canViewSalesHistory: true,
  // مرتجعات
  canProcessReturns: true,
  // مشتريات وموردين
  canAddPurchases: true,
  canViewSuppliers: true,
  canPaySuppliers: false, // يحتاج موافقة مدير
  // الأصناف والمخزون
  canAddProducts: true,
  canEditProducts: true,
  canDeleteProducts: false, // لا يحذف الأصناف نهائياً
  canAdjustInventory: true,
  // الشفتات والكاشير
  canManageShifts: true,
  canRecordShiftExpense: true,
  // المالية والخزينة (لوحة الإدارة)
  canAccessAdminPortal: false,
  canViewTreasury: false,
  canTreasuryDepositWithdraw: false,
  canAddAdminExpenses: false,
  canViewNetProfits: false,
  // إدارة النظام والموظفين
  canManageUsersAndRoles: false,
  canChangeAppSettings: false,
  canExportDataExcel: true,
  canBackupAndRestore: false,
  canFactoryReset: false,
};

export const DEFAULT_CASHIER_PERMISSIONS: GranularPermissions = {
  // مبيعات ونقطة البيع (POS)
  canSell: true,
  canApplyDiscount: false, // الخصومات بصلاحية أعلى
  canViewSalesHistory: true,
  // مرتجعات
  canProcessReturns: true,
  // مشتريات وموردين
  canAddPurchases: false,
  canViewSuppliers: false,
  canPaySuppliers: false,
  // الأصناف والمخزون
  canAddProducts: false,
  canEditProducts: false,
  canDeleteProducts: false,
  canAdjustInventory: false,
  // الشفتات والكاشير
  canManageShifts: true,
  canRecordShiftExpense: true,
  // المالية والخزينة
  canAccessAdminPortal: false,
  canViewTreasury: false,
  canTreasuryDepositWithdraw: false,
  canAddAdminExpenses: false,
  canViewNetProfits: false,
  // إدارة النظام
  canManageUsersAndRoles: false,
  canChangeAppSettings: false,
  canExportDataExcel: false,
  canBackupAndRestore: false,
  canFactoryReset: false,
};

export interface PermissionItem {
  key: keyof GranularPermissions;
  title: string;
  description: string;
}

export interface PermissionGroup {
  id: string;
  categoryTitle: string;
  iconName: string;
  permissions: PermissionItem[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'sales',
    categoryTitle: 'نقطة البيع والمبيعات (POS)',
    iconName: 'ShoppingCart',
    permissions: [
      {
        key: 'canSell',
        title: 'إصدار فواتير المبيعات',
        description: 'إضافة أصناف للسلة، مسح الباركود، وإنهاء الفاتورة نقدياً أو شبكة',
      },
      {
        key: 'canApplyDiscount',
        title: 'منح خصومات على الفاتورة',
        description: 'إدخال خصم يدوي على إجمالي الفاتورة أو الأدوية',
      },
      {
        key: 'canViewSalesHistory',
        title: 'الاطلاع على سجل المبيعات',
        description: 'عرض الفواتير السابقة وإعادة طباعة الإيصالات',
      },
    ],
  },
  {
    id: 'returns',
    categoryTitle: 'مرتجع المبيعات',
    iconName: 'RotateCcw',
    permissions: [
      {
        key: 'canProcessReturns',
        title: 'إصدار مرتجع مبيعات',
        description: 'استرجاع دواء، رد القيمة للعميل، وإعادة الكمية للمخزون',
      },
    ],
  },
  {
    id: 'purchases',
    categoryTitle: 'المشتريات والموردين',
    iconName: 'Truck',
    permissions: [
      {
        key: 'canAddPurchases',
        title: 'تسجيل فواتير توريد مشتريات',
        description: 'إدخال شحنات الأدوية الجديدة من الموردين وتحديث التكلفة',
      },
      {
        key: 'canViewSuppliers',
        title: 'استعراض بيانات الموردين',
        description: 'الاطلاع على قائمة شركات الأدوية وبيانات الاتصال',
      },
      {
        key: 'canPaySuppliers',
        title: 'إصدار سندات سداد للموردين',
        description: 'سداد دفعات مالية من حساب الصيدلية لحساب المورد',
      },
    ],
  },
  {
    id: 'inventory',
    categoryTitle: 'الأصناف والمخزون',
    iconName: 'Package',
    permissions: [
      {
        key: 'canAddProducts',
        title: 'إضافة أصناف وأدوية جديدة',
        description: 'إنشاء كروت أدوية جديدة وتحديد الأسعار وتواريخ الصلاحية',
      },
      {
        key: 'canEditProducts',
        title: 'تعديل بيانات الدواء والأسعار',
        description: 'تعديل الاسم، سعر البيع، التكلفة، ومكان الرف',
      },
      {
        key: 'canAdjustInventory',
        title: 'تسوية الجرد اليدوي',
        description: 'تعديل رصيد المخزون الفعلي وإثبات سبب العجز أو الزيادة',
      },
      {
        key: 'canDeleteProducts',
        title: 'حذف صنف من الدليل',
        description: 'حذف بطاقة الدواء نهائياً من قاعدة البيانات (صلاحية حساسة)',
      },
    ],
  },
  {
    id: 'shifts',
    categoryTitle: 'شفتات الكاشير والصندوق',
    iconName: 'Clock',
    permissions: [
      {
        key: 'canManageShifts',
        title: 'فتح وتقفيل الشفتات',
        description: 'بدء الوردية برصيد افتتاحي، ومطابقة الدرج عند نهاية الدوام',
      },
      {
        key: 'canRecordShiftExpense',
        title: 'تسجيل مصروف من صندوق الكاشير',
        description: 'صرف مبالغ نثرية طارئة مباشرة من درج النقدية',
      },
    ],
  },
  {
    id: 'treasury',
    categoryTitle: 'الخزينة والأرباح (لوحة الإدارة)',
    iconName: 'Wallet',
    permissions: [
      {
        key: 'canAccessAdminPortal',
        title: 'دخول لوحة الإدارة الرئيسية',
        description: 'الوصول إلى تبويبات الإدارة، الخزينة، والمؤشرات التنفيذية',
      },
      {
        key: 'canViewTreasury',
        title: 'الاطلاع على رصيد الخزينة',
        description: 'كشف حساب حركات النقدية الإجمالية وتدفقات الصندوق',
      },
      {
        key: 'canTreasuryDepositWithdraw',
        title: 'سحب وإيداع يدوي بالخزينة',
        description: 'تنفيذ قيود الإيداع والسحب النقدي اليدوي في الخزينة',
      },
      {
        key: 'canAddAdminExpenses',
        title: 'تسجيل المصروفات الإدارية الكبرى',
        description: 'إثبات مصروفات الإيجار، الرواتب، فواتير الكهرباء والصيانة',
      },
      {
        key: 'canViewNetProfits',
        title: 'الاطلاع على صافي الأرباح وهوامش الربح',
        description: 'عرض تقارير الربح الصافي وتقييم المخزون المالي',
      },
    ],
  },
  {
    id: 'system',
    categoryTitle: 'إدارة النظام والموظفين والبيانات',
    iconName: 'ShieldCheck',
    permissions: [
      {
        key: 'canManageUsersAndRoles',
        title: 'إدارة الموظفين وتعديل الصلاحيات',
        description: 'إضافة مستخدمين، تعيين الأدوار، وتغيير كلمات المرور',
      },
      {
        key: 'canChangeAppSettings',
        title: 'تعديل إعدادات الصيدلية والترخيص',
        description: 'تغيير الاسم، الرقم الضريبي، السجل التجاري، وترويسة الفاتورة',
      },
      {
        key: 'canExportDataExcel',
        title: 'تصدير البيانات إلى جداول Excel',
        description: 'تصدير تقارير المبيعات، المشتريات، المخزون، والمصروفات',
      },
      {
        key: 'canBackupAndRestore',
        title: 'النسخ الاحتياطي واسترجاع البيانات',
        description: 'تنزيل نسخة احتياطية مشفرة (JSON) أو استعادتها',
      },
      {
        key: 'canFactoryReset',
        title: 'إعادة ضبط المصنع وتصفير النظام',
        description: 'مسح كافة الحركات والبيانات وإعادتها للوضع الأولي',
      },
    ],
  },
];

export const getPermissionsForRole = (role: UserRole): GranularPermissions => {
  switch (role) {
    case 'admin':
      return { ...DEFAULT_ADMIN_PERMISSIONS };
    case 'pharmacist':
      return { ...DEFAULT_PHARMACIST_PERMISSIONS };
    case 'cashier':
      return { ...DEFAULT_CASHIER_PERMISSIONS };
    default:
      return { ...DEFAULT_PHARMACIST_PERMISSIONS };
  }
};
