import React, { useState } from 'react';
import { useAuth, DEFAULT_ACCOUNTS, DefaultAccountInfo } from '../../context/AuthContext';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  Shield,
  Stethoscope,
  Lock,
  User,
  KeyRound,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  LayoutDashboard,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PERMISSION_GROUPS } from '../../utils/permissions';

interface LoginPageProps {
  onSuccessLogin?: (portal: 'admin' | 'pharmacy') => void;
  isOpenAsModal?: boolean;
  onCloseModal?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccessLogin,
  isOpenAsModal = false,
  onCloseModal,
}) => {
  const { signIn, quickLoginAs, authError, clearAuthError } = useAuth();
  const { setActivePortal } = usePharmacy();

  const [selectedTarget, setSelectedTarget] = useState<'pharmacy' | 'admin'>('pharmacy');
  const [usernameInput, setUsernameInput] = useState<string>('pharmacist');
  const [passwordInput, setPasswordInput] = useState<string>('pharm123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState<boolean>(false);

  // Switch tabs & fill defaults
  const handleSelectPortalTab = (target: 'pharmacy' | 'admin') => {
    setSelectedTarget(target);
    clearAuthError();
    if (target === 'admin') {
      setUsernameInput('admin');
      setPasswordInput('admin123');
    } else {
      setUsernameInput('pharmacist');
      setPasswordInput('pharm123');
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await signIn(usernameInput, passwordInput, selectedTarget);
      const targetPortal = user.role === 'admin' && selectedTarget === 'admin' ? 'admin' : 'pharmacy';
      setActivePortal(targetPortal);
      if (onSuccessLogin) onSuccessLogin(targetPortal);
      if (onCloseModal) onCloseModal();
    } catch {
      // error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle1ClickLogin = async (acc: DefaultAccountInfo) => {
    setIsSubmitting(true);
    try {
      const user = await quickLoginAs(acc);
      const targetPortal = acc.portalTarget;
      setActivePortal(targetPortal);
      if (onSuccessLogin) onSuccessLogin(targetPortal);
      if (onCloseModal) onCloseModal();
    } catch {
      // error handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20 mb-1">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
          بوابة تسجيل الدخول والتحكم بالصلاحيات
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          اختر الواجهة المطلوبة (المبيعات أو الإدارة) مع إمكانية الدخول بالحسابات الافتراضية بنقرة واحدة
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Portal Selection Tabs */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleSelectPortalTab('pharmacy')}
            className={`py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedTarget === 'pharmacy'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <div className="text-right">
              <div>دخول واجهة المبيعات والصيدلي</div>
              <div className="text-[10px] opacity-80 font-normal">نقطة البيع (POS) والمخزون</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPortalTab('admin')}
            className={`py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              selectedTarget === 'admin'
                ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <div className="text-right">
              <div>دخول واجهة الإدارة والرقابة</div>
              <div className="text-[10px] opacity-80 font-normal">الخزينة، الأرباح، والموظفين</div>
            </div>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick 1-Click Cards Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-teal-600" />
                <span>الحسابات الافتراضية السريعة (جاهزة للدخول الفوري):</span>
              </span>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full">
                نقرة واحدة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {DEFAULT_ACCOUNTS.filter(acc =>
                selectedTarget === 'admin' ? acc.role === 'admin' : acc.role !== 'admin'
              ).map(acc => {
                const isAdminAcc = acc.role === 'admin';
                return (
                  <div
                    key={acc.username}
                    className={`p-4 rounded-2xl border transition-all text-right space-y-3 relative group ${
                      isAdminAcc
                        ? 'border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/20 hover:border-purple-400'
                        : 'border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/20 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {isAdminAcc ? (
                            <Shield className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                          )}
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                            {acc.displayName}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {acc.summary}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAdminAcc
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                            : 'bg-teal-100 text-teal-700 dark:text-teal-900/60 dark:text-teal-300'
                        }`}
                      >
                        {acc.role.toUpperCase()}
                      </span>
                    </div>

                    {/* Credentials Display Box */}
                    <div className="bg-white/80 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">اسم المستخدم:</span>
                        <strong className="text-slate-800 dark:text-slate-100">{acc.username}</strong>
                      </div>
                      <div className="border-r border-slate-200 dark:border-slate-700 pr-3 mr-3">
                        <span className="text-[10px] text-slate-400 font-sans block">كلمة المرور:</span>
                        <strong className="text-teal-600 dark:text-teal-400">{acc.password}</strong>
                      </div>
                    </div>

                    {/* Quick Button */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handle1ClickLogin(acc)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                        isAdminAcc
                          ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                          : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                      }`}
                    >
                      <span>دخول مباشر بهذا الحساب</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></span>
            <span className="text-xs text-slate-400 font-medium">أو تسجيل الدخول اليدوي</span>
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></span>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Manual Input Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  اسم المستخدم أو البريد الإلكتروني
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    placeholder="مثال: admin أو pharmacist"
                    className="w-full pr-10 pl-3 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="أدخل كلمة المرور..."
                    className="w-full pr-10 pl-10 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                selectedTarget === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
              }`}
            >
              {isSubmitting ? (
                <span>جاري تسجيل الدخول...</span>
              ) : (
                <>
                  <span>
                    {selectedTarget === 'admin'
                      ? 'تسجيل الدخول إلى لوحة الإدارة'
                      : 'تسجيل الدخول إلى واجهة المبيعات'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Granular Permissions Matrix Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowPermissionsMatrix(!showPermissionsMatrix)}
              className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-between transition-colors border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <span>دليل مصفوفة الصلاحيات المفصلة (مقارنة Admin vs Pharmacist vs Cashier)</span>
              </div>
              {showPermissionsMatrix ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Permissions Matrix Detail Drawer */}
            {showPermissionsMatrix && (
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-96 overflow-y-auto animate-in fade-in duration-200">
                <div className="text-xs text-slate-500 mb-2 leading-relaxed">
                  يوضح الجدول أدناه كافة الصلاحيات المتاحة في النظام وكيفية توزيعها بين الأدوار المختلفة:
                </div>

                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(grp => (
                    <div
                      key={grp.id}
                      className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/80 dark:border-slate-750 space-y-2"
                    >
                      <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center justify-between">
                        <span>{grp.categoryTitle}</span>
                        <div className="flex items-center gap-4 text-[10px] font-normal text-slate-400 pl-2">
                          <span className="w-14 text-center">المدير (Admin)</span>
                          <span className="w-16 text-center">الصيدلي (Pharm)</span>
                          <span className="w-14 text-center">الكاشير (Cash)</span>
                        </div>
                      </h5>

                      <div className="space-y-1.5">
                        {grp.permissions.map(perm => (
                          <div
                            key={perm.key}
                            className="flex items-center justify-between text-xs py-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded px-1.5"
                          >
                            <div className="pr-1">
                              <span className="font-bold text-slate-700 dark:text-slate-200 block">
                                {perm.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {perm.description}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 pl-2 shrink-0">
                              {/* Admin */}
                              <div className="w-14 flex justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              </div>
                              {/* Pharmacist */}
                              <div className="w-16 flex justify-center">
                                {[
                                  'canAccessAdminPortal',
                                  'canViewTreasury',
                                  'canTreasuryDepositWithdraw',
                                  'canAddAdminExpenses',
                                  'canViewNetProfits',
                                  'canManageUsersAndRoles',
                                  'canChangeAppSettings',
                                  'canBackupAndRestore',
                                  'canFactoryReset',
                                  'canDeleteProducts',
                                  'canPaySuppliers',
                                ].includes(perm.key) ? (
                                  <XCircle className="w-4 h-4 text-red-400 opacity-60" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                )}
                              </div>
                              {/* Cashier */}
                              <div className="w-14 flex justify-center">
                                {[
                                  'canSell',
                                  'canViewSalesHistory',
                                  'canProcessReturns',
                                  'canManageShifts',
                                  'canRecordShiftExpense',
                                ].includes(perm.key) ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400 opacity-60" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
