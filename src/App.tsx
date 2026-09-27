import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { PharmacyPortal } from './components/pharmacy/PharmacyPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { LoginPage } from './components/auth/LoginPage';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activePortal, setActivePortal } = usePharmacy();
  const { userProfile, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-[#f3f7fb] dark:bg-[#0f172a] text-[#1f2937] dark:text-[#e5eef5] transition-colors flex flex-col font-sans">
      <Header />
      <ToastContainer />

      <div className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-5 flex flex-col justify-center">
        {!userProfile ? (
          // Dedicated Login Gateway when logged out
          <div className="py-6">
            <LoginPage onSuccessLogin={target => setActivePortal(target)} />
          </div>
        ) : activePortal === 'pharmacy' ? (
          <PharmacyPortal />
        ) : (
          // Admin portal role guard
          isAdmin ? (
            <AdminPortal />
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  لوحة الإدارة تتطلب صلاحية مدير (Admin)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  حسابك الحالي مسجل بدور: <span className="font-bold text-teal-600">صيدلي (Pharmacist)</span>.
                  <br />
                  تم حظر الوصول إلى الخزينة والمصروفات والأرباح وفقاً لمصفوفة الصلاحيات المحددة.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePortal('pharmacy')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  العودة إلى نقطة البيع (POS)
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <footer className="mt-auto py-3 px-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
        نظام إدارة الصيدلية المتكامل · بوابة تسجيل الدخول والأدوار (Admin vs Pharmacist) · {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PharmacyProvider>
        <MainApp />
      </PharmacyProvider>
    </AuthProvider>
  );
}
