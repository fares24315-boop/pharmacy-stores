import React, { useState, useEffect } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShieldCheck,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Lock,
  LogOut,
  LogIn,
  RefreshCw,
  Shield,
  Stethoscope,
  AlertCircle,
  User,
} from 'lucide-react';
import { LoginPage } from '../auth/LoginPage';

interface HeaderProps {
  onOpenShiftModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShiftModal }) => {
  const {
    state,
    activePortal,
    setActivePortal,
    theme,
    toggleTheme,
    updateSettings,
    refreshState,
    showToast,
  } = usePharmacy();

  const {
    firebaseUser,
    userProfile,
    isAdmin,
    isPharmacist,
    logOut,
  } = useAuth();

  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  
  // Auth modal states
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authRequiredRole, setAuthRequiredRole] = useState<'admin' | 'any'>('any');
  const [showRoleDeniedModal, setShowRoleDeniedModal] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeShift = state.shifts.find(s => s.status === 'open');

  const handleSwitchToAdmin = () => {
    if (!userProfile) {
      // User is not signed in: open auth modal requiring admin
      setAuthRequiredRole('admin');
      setShowAuthModal(true);
      return;
    }

    if (isAdmin) {
      setActivePortal('admin');
    } else {
      // User is signed in as Pharmacist: show denial alert
      setShowRoleDeniedModal(true);
    }
  };

  const handleLogoutClick = async () => {
    if (window.confirm('هل ترغب في تسجيل الخروج من الحساب الحالي؟')) {
      await logOut();
      setActivePortal('pharmacy');
      showToast('تم تسجيل الخروج بنجاح', 'info');
    }
  };

  return (
    <header className="bg-white dark:bg-[#172033] border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors sticky top-0 z-40">
      <div className="max-w-[1700px] mx-auto px-4 lg:px-6 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Right side: Branding & Active Portal Switcher */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 font-bold text-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                  {state.settings.pharmacyName}
                </h1>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>نظام الصيدلية المتكامل</span>
                  <span>·</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-medium">Firebase Auth</span>
                </div>
              </div>
            </div>

            {/* Portal Switcher Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActivePortal('pharmacy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePortal === 'pharmacy'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>نقطة البيع والصيدلي</span>
              </button>

              <button
                type="button"
                onClick={handleSwitchToAdmin}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                  activePortal === 'admin'
                    ? 'bg-slate-900 dark:bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>لوحة الإدارة</span>
                {!isAdmin && (
                  <Lock className="w-2.5 h-2.5 text-amber-500 mr-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Left side: Live Shift Status, Auth User Profile, Tools */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end w-full md:w-auto">
            {/* Live Clock */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{dateStr}</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{timeStr}</span>
            </div>

            {/* Shift Status */}
            {activeShift ? (
              <div
                onClick={onOpenShiftModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 cursor-pointer hover:bg-emerald-100 transition-colors"
                title="اضغط للاطلاع على تقرير الشفت أو تقفيله"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>شفت مفتوح (#{activeShift.shiftNumber})</span>
                <span className="font-mono text-[11px] font-bold">
                  {activeShift.expectedCash.toFixed(2)} {state.settings.currency}
                </span>
              </div>
            ) : (
              <div
                onClick={onOpenShiftModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 cursor-pointer hover:bg-amber-100"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>لا يوجد شفت مفتوح</span>
              </div>
            )}

            {/* Firebase Auth User Status / Login Button */}
            {userProfile ? (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                  title="انقر لتبديل الحساب أو تغيير الدور"
                >
                  {isAdmin ? (
                    <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="leading-tight text-right">
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-[11px] max-w-[120px] truncate">
                      {userProfile.displayName || userProfile.email}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      {isAdmin ? (
                        <span className="text-purple-600 dark:text-purple-400 font-bold">مدير عام (Admin)</span>
                      ) : (
                        <span className="text-teal-600 dark:text-teal-400 font-bold">صيدلي (Pharmacist)</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-1"
                  title="تسجيل الخروج من الحساب"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthRequiredRole('any');
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>دخول Firebase Auth</span>
              </button>
            )}

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => updateSettings({ soundEnabled: !state.settings.soundEnabled })}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                title={state.settings.soundEnabled ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية'}
              >
                {state.settings.soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4 opacity-50" />}
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                title={theme === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Refresh State */}
              <button
                type="button"
                onClick={refreshState}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal with Dedicated Portal Gate & Permissions */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -left-3 z-10 w-9 h-9 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100"
            >
              ✕
            </button>
            <LoginPage
              isOpenAsModal={true}
              onCloseModal={() => setShowAuthModal(false)}
              onSuccessLogin={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}

      {/* Role Permission Denied Modal */}
      {showRoleDeniedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                صلاحية الدخول محظورة
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                لوحة الإدارة تتطلب صلاحية <strong>مدير النظام (Admin)</strong>.
                <br />
                دورك الحالي في Firebase Auth هو: <span className="font-bold text-teal-600">صيدلي (Pharmacist)</span>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 text-right space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">صلاحياتك كصيدلي تشمل:</p>
              <p>✓ إدارة المبيعات ونقطة البيع (POS)</p>
              <p>✓ معالجة مرتجع المبيعات</p>
              <p>✓ تسجيل فواتير المشتريات ومتابعة المخزون</p>
              <p>✓ تقفيل الشفت والتقارير اليومية</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowRoleDeniedModal(false);
                  setAuthRequiredRole('admin');
                  setShowAuthModal(true);
                }}
                className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                تسجيل الدخول كـ مدير
              </button>
              <button
                type="button"
                onClick={() => setShowRoleDeniedModal(false)}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-xs transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
