import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useAuth, DEFAULT_ACCOUNTS } from '../../context/AuthContext';
import { User, UserRole, GranularPermissions } from '../../types/pharmacy';
import {
  Users,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  Sliders,
  Shield,
  Stethoscope,
  Info,
  Check,
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import {
  PERMISSION_GROUPS,
  getPermissionsForRole,
  DEFAULT_ADMIN_PERMISSIONS,
} from '../../utils/permissions';

export const AdminUsersView: React.FC = () => {
  const { state, addUser, updateUser, deleteUser, showToast } = usePharmacy();
  const { userProfile, updateUserPermissions } = useAuth();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  const [customPermissions, setCustomPermissions] = useState<GranularPermissions>(DEFAULT_ADMIN_PERMISSIONS);

  // New User Form
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('pharmacist');
  const [phone, setPhone] = useState<string>('');

  // Password change for existing user
  const [changePassUserId, setChangePassUserId] = useState<string>(state.users[0]?.id || '');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  // Admin master password update
  const [masterAdminPass, setMasterAdminPass] = useState<string>('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      sounds.playError();
      showToast('يرجى كتابة اسم المستخدم والاسم الكامل', 'error');
      return;
    }

    const initialGranular = getPermissionsForRole(role);

    addUser({
      username: username.trim().toLowerCase(),
      password: password.trim() || '123456',
      fullName: fullName.trim(),
      role,
      permissions: ['sales', 'dashboard'],
      granularPermissions: initialGranular,
      active: true,
      phone: phone.trim() || undefined,
    });

    setIsAddUserModalOpen(false);
    setUsername('');
    setPassword('');
    setFullName('');
    setPhone('');
    showToast(`تم إنشاء حساب المستخدم "${fullName}" بنجاح`, 'success');
  };

  const handleOpenPermissionsEditor = (u: User) => {
    setSelectedUserForPermissions(u);
    setCustomPermissions(u.granularPermissions || getPermissionsForRole(u.role));
  };

  const handleTogglePermission = (key: keyof GranularPermissions) => {
    setCustomPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePermissions = () => {
    if (!selectedUserForPermissions) return;

    const updated: User = {
      ...selectedUserForPermissions,
      granularPermissions: { ...customPermissions },
    };

    updateUser(updated);

    // If currently logged-in user is updated, sync auth context
    if (userProfile && (userProfile.username === updated.username || userProfile.uid === updated.id)) {
      updateUserPermissions(userProfile.uid, customPermissions);
    }

    setSelectedUserForPermissions(null);
    sounds.playSuccess();
    showToast(`تم تحديث مصفوفة الصلاحيات للمستخدم ${updated.fullName}`, 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      sounds.playError();
      showToast('يرجى إدخال كلمة المرور الجديدة', 'error');
      return;
    }

    const target = state.users.find(u => u.id === changePassUserId);
    if (!target) return;

    updateUser({
      ...target,
      password: newPasswordInput.trim(),
    });

    setNewPasswordInput('');
    showToast(`تم تغيير كلمة المرور للمستخدم ${target.fullName} بنجاح`, 'success');
  };

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterAdminPass.trim()) return;

    const admin = state.users.find(u => u.role === 'admin');
    if (admin) {
      updateUser({
        ...admin,
        password: masterAdminPass.trim(),
      });
      localStorage.setItem('pharmacy_admin_password', masterAdminPass.trim());
      setMasterAdminPass('');
      showToast('تم تحديث كلمة مرور الإدارة الرئيسية بنجاح', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              إدارة الموظفين والتحكم في الصلاحيات المفصلة
            </h2>
            <p className="text-xs text-slate-500">
              تحديد أدوار المديرين والصيادلة والكاشير، تخصيص الصلاحيات بدقة، وإدارة الحسابات
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      {/* Default System Accounts Overview Card */}
      <div className="bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-teal-600" />
            <span>الحسابات الافتراضية المعتمدة للنظام (Default Login Accounts)</span>
          </h3>
          <span className="text-[11px] text-slate-400">بيانات تسجيل الدخول الافتراضية</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEFAULT_ACCOUNTS.map(acc => (
            <div
              key={acc.username}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-right"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                  {acc.displayName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    acc.role === 'admin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                  }`}
                >
                  {acc.role.toUpperCase()}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">اليوزر:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{acc.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">الباسورد:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{acc.password}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">الواجهة:</span>
                  <span className="text-slate-500 font-sans">{acc.portalName}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                {acc.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Users List Table - 8 cols */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100">
              قائمة المستخدمين والموظفين المسجلين ({state.users.length})
            </h3>
            <span className="text-[11px] text-slate-400">انقر على أيقونة الصلاحيات لتخصيص الأذونات</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">الاسم الكامل</th>
                  <th className="py-2.5 px-3">اسم الدخول</th>
                  <th className="py-2.5 px-3 text-center">الدور / الرتبة</th>
                  <th className="py-2.5 px-3">الهاتف</th>
                  <th className="py-2.5 px-3 text-center">الصلاحيات المفصلة</th>
                  <th className="py-2.5 px-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {state.users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {u.fullName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      @{u.username}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : u.role === 'pharmacist'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {u.role === 'admin' ? 'مدير عام' : u.role === 'pharmacist' ? 'صيدلي' : 'كاشير'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {u.phone || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenPermissionsEditor(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>تخصيص الصلاحيات</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {state.users.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف حساب ${u.fullName}؟`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="حذف المستخدم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Password Reset Boxes - 4 cols */}
        <div className="lg:col-span-4 space-y-4">
          {/* User Password Reset */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>تغيير كلمة مرور موظف</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">الموظف:</label>
                <select
                  value={changePassUserId}
                  onChange={e => setChangePassUserId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                >
                  {state.users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">كلمة المرور الجديدة:</label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة مرور جديدة..."
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                تحديث كلمة المرور
              </button>
            </form>
          </div>

          {/* Master Admin Password Update */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>تغيير كلمة مرور مدير النظام الرئيسية</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              كلمة مرور حساب Admin (الافتراضية: admin123)
            </p>

            <form onSubmit={handleUpdateAdminPassword} className="space-y-3 text-xs">
              <div>
                <input
                  type="password"
                  required
                  value={masterAdminPass}
                  onChange={e => setMasterAdminPass(e.target.value)}
                  placeholder="كلمة مرور الإدارة الجديدة..."
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                حفظ كلمة مرور المدير
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Granular Permissions Editor Modal */}
      {selectedUserForPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-teal-700 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    تخصيص مصفوفة الصلاحيات المفصلة
                  </h3>
                  <p className="text-xs text-teal-200">
                    الموظف: <strong>{selectedUserForPermissions.fullName}</strong> (@{selectedUserForPermissions.username})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForPermissions(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Permissions Categories List */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">
                  قم بتفعيل أو إيقاف الصلاحيات المناسبة لهذا الموظف بشكل فردي:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomPermissions({ ...DEFAULT_ADMIN_PERMISSIONS })}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                  >
                    تفعيل الكل (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPermissions({ ...getPermissionsForRole(selectedUserForPermissions.role) })}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300"
                  >
                    استعادة الافتراضي
                  </button>
                </div>
              </div>

              {PERMISSION_GROUPS.map(grp => (
                <div
                  key={grp.id}
                  className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-750 space-y-2.5"
                >
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span>{grp.categoryTitle}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {grp.permissions.map(p => {
                      const isAllowed = Boolean(customPermissions[p.key]);
                      return (
                        <div
                          key={p.key}
                          onClick={() => handleTogglePermission(p.key)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                            isAllowed
                              ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                              isAllowed
                                ? 'bg-teal-600 text-white'
                                : 'border border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isAllowed && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                              {p.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-100 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedUserForPermissions(null)}
                className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all"
              >
                حفظ مصفوفة الصلاحيات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>إضافة حساب موظف جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="مثال: د. عبد الله الشمري"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">اسم المستخدم (Login) *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="abdullah"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">الدور والصلاحية</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="pharmacist">صيدلي (نقطة بيع + مشتريات + مخزون)</option>
                    <option value="cashier">كاشير (نقطة بيع فقط)</option>
                    <option value="admin">مدير نظام (كامل الصلاحيات)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
                >
                  إنشاء الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
