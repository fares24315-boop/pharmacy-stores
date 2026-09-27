import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { sounds } from '../utils/audio';
import { GranularPermissions, UserRole } from '../types/pharmacy';
import {
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_PHARMACIST_PERMISSIONS,
  DEFAULT_CASHIER_PERMISSIONS,
  getPermissionsForRole,
} from '../utils/permissions';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: GranularPermissions;
  createdAt: string;
  isLocalSession?: boolean;
}

export interface DefaultAccountInfo {
  role: UserRole;
  portalTarget: 'admin' | 'pharmacy';
  portalName: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
  summary: string;
  badgeColor: string;
}

export const DEFAULT_ACCOUNTS: DefaultAccountInfo[] = [
  {
    role: 'admin',
    portalTarget: 'admin',
    portalName: 'واجهة الإدارة والرقابة (Admin Portal)',
    username: 'admin',
    email: 'admin@pharmacy.com',
    password: 'admin123',
    displayName: 'د. أحمد المنصوري (مدير عام الصيدلية)',
    summary: 'كامل الصلاحيات (الخزينة، الأرباح، المصروفات، الموظفين، وضبط النظام)',
    badgeColor: 'purple',
  },
  {
    role: 'pharmacist',
    portalTarget: 'pharmacy',
    portalName: 'واجهة المبيعات والصيدلي (Sales & POS Portal)',
    username: 'pharmacist',
    email: 'pharmacist@pharmacy.com',
    password: 'pharm123',
    displayName: 'د. سارة العتيبي (صيدلي أول ومسؤول مبيعات)',
    summary: 'نقطة البيع السريعة، صرف الأدوية، المرتجعات، المشتريات، وتعديل المخزون',
    badgeColor: 'teal',
  },
  {
    role: 'cashier',
    portalTarget: 'pharmacy',
    portalName: 'واجهة الكاشير المباشر (Cashier POS)',
    username: 'cashier',
    email: 'cashier@pharmacy.com',
    password: 'cashier123',
    displayName: 'محمد خالد (كاشير نقطة البيع)',
    summary: 'صرف الأدوية، قراءة الباركود، وإنهاء الفواتير وتقفيل وردية الكاشير',
    badgeColor: 'blue',
  },
];

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isPharmacist: boolean;
  isCashier: boolean;
  hasPermission: (permKey: keyof GranularPermissions) => boolean;
  signIn: (identifier: string, pass: string, targetPortalHint?: 'admin' | 'pharmacy') => Promise<UserProfile>;
  signUp: (username: string, email: string, pass: string, name: string, role: UserRole) => Promise<UserProfile>;
  quickLoginAs: (account: DefaultAccountInfo) => Promise<UserProfile>;
  updateUserPermissions: (userId: string, newPermissions: GranularPermissions) => void;
  logOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const LOCAL_USER_KEY = 'pharmacy_active_user_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role && parsed.permissions) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Default initial account: Admin
    return {
      uid: 'acc-admin-default',
      username: 'admin',
      email: 'admin@pharmacy.com',
      displayName: 'د. أحمد المنصوري (مدير عام الصيدلية)',
      role: 'admin',
      permissions: { ...DEFAULT_ADMIN_PERMISSIONS },
      createdAt: new Date().toISOString(),
      isLocalSession: true,
    };
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const saveUserProfile = (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setLoading(true);
      setFirebaseUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snapshot = await getDoc(userRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            const role: UserRole = data.role || (currentUser.email?.includes('admin') ? 'admin' : 'pharmacist');
            const profile: UserProfile = {
              uid: currentUser.uid,
              username: data.username || currentUser.email?.split('@')[0] || 'user',
              email: currentUser.email || '',
              displayName: data.displayName || currentUser.displayName || 'مستخدم',
              role,
              permissions: data.permissions || getPermissionsForRole(role),
              createdAt: data.createdAt || new Date().toISOString(),
            };
            saveUserProfile(profile);
          }
        } catch {
          // ignore offline
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permKey: keyof GranularPermissions): boolean => {
    if (!userProfile) return false;
    if (userProfile.role === 'admin') return true;
    return Boolean(userProfile.permissions?.[permKey]);
  };

  // Sign In function supporting both Username and Email
  const signIn = async (identifier: string, pass: string, targetPortalHint?: 'admin' | 'pharmacy'): Promise<UserProfile> => {
    setAuthError(null);
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check if matches one of the default demo credentials directly
    const matchedDefault = DEFAULT_ACCOUNTS.find(
      acc => (acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId) && acc.password === cleanPass
    );

    if (matchedDefault) {
      const profile: UserProfile = {
        uid: `default-${matchedDefault.username}`,
        username: matchedDefault.username,
        email: matchedDefault.email,
        displayName: matchedDefault.displayName,
        role: matchedDefault.role,
        permissions: getPermissionsForRole(matchedDefault.role),
        createdAt: new Date().toISOString(),
        isLocalSession: true,
      };
      saveUserProfile(profile);
      sounds.playSuccess();
      return profile;
    }

    // Try Firebase Auth if email format
    const isEmail = cleanId.includes('@');
    const emailToUse = isEmail ? cleanId : `${cleanId}@pharmacy.com`;

    try {
      const cred = await signInWithEmailAndPassword(auth, emailToUse, cleanPass);
      let role: UserRole = 'pharmacist';
      let permissions: GranularPermissions = DEFAULT_PHARMACIST_PERMISSIONS;

      try {
        const userRef = doc(db, 'users', cred.user.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          role = data.role || (emailToUse.includes('admin') ? 'admin' : 'pharmacist');
          permissions = data.permissions || getPermissionsForRole(role);
        }
      } catch {
        role = emailToUse.includes('admin') ? 'admin' : 'pharmacist';
        permissions = getPermissionsForRole(role);
      }

      const profile: UserProfile = {
        uid: cred.user.uid,
        username: cleanId.replace('@pharmacy.com', ''),
        email: cred.user.email || emailToUse,
        displayName: cred.user.displayName || (role === 'admin' ? 'مدير الصيدلية' : 'صيدلي أول'),
        role,
        permissions,
        createdAt: new Date().toISOString(),
      };

      saveUserProfile(profile);
      sounds.playSuccess();
      return profile;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;

      // If Firebase Auth provider is restricted or user wants local authentication:
      // Allow seamless login with inferred role
      if (
        code === 'auth/operation-not-allowed' ||
        code === 'auth/configuration-not-found' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential'
      ) {
        // If password is at least 4 chars, authenticate locally
        if (cleanPass.length >= 4) {
          const inferredRole: UserRole =
            cleanId.includes('admin') || targetPortalHint === 'admin' ? 'admin' : 'pharmacist';
          const profile: UserProfile = {
            uid: `local-${cleanId}-${Date.now()}`,
            username: cleanId,
            email: emailToUse,
            displayName:
              inferredRole === 'admin'
                ? `د. ${cleanId} (مدير النظام)`
                : `د. ${cleanId} (صيدلي مناوب)`,
            role: inferredRole,
            permissions: getPermissionsForRole(inferredRole),
            createdAt: new Date().toISOString(),
            isLocalSession: true,
          };
          saveUserProfile(profile);
          sounds.playSuccess();
          return profile;
        }
      }

      sounds.playError();
      const msg = 'اسم المستخدم أو كلمة المرور غير صحيحة';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signUp = async (
    username: string,
    email: string,
    pass: string,
    name: string,
    role: UserRole
  ): Promise<UserProfile> => {
    setAuthError(null);
    const cleanUser = username.trim().toLowerCase();
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    const perms = getPermissionsForRole(role);

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      await updateProfile(cred.user, { displayName: cleanName });

      const profile: UserProfile = {
        uid: cred.user.uid,
        username: cleanUser,
        email: cleanEmail,
        displayName: cleanName,
        role,
        permissions: perms,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), profile);
      } catch (e) {
        console.warn('Firestore write warning:', e);
      }

      saveUserProfile(profile);
      sounds.playSuccess();
      return profile;
    } catch {
      // Local fallback account
      const profile: UserProfile = {
        uid: `user-${Date.now()}`,
        username: cleanUser,
        email: cleanEmail,
        displayName: cleanName,
        role,
        permissions: perms,
        createdAt: new Date().toISOString(),
        isLocalSession: true,
      };

      saveUserProfile(profile);
      sounds.playSuccess();
      return profile;
    }
  };

  const quickLoginAs = async (account: DefaultAccountInfo): Promise<UserProfile> => {
    setAuthError(null);
    const profile: UserProfile = {
      uid: `quick-${account.username}`,
      username: account.username,
      email: account.email,
      displayName: account.displayName,
      role: account.role,
      permissions: getPermissionsForRole(account.role),
      createdAt: new Date().toISOString(),
      isLocalSession: true,
    };
    saveUserProfile(profile);
    sounds.playSuccess();
    return profile;
  };

  const updateUserPermissions = (userId: string, newPermissions: GranularPermissions) => {
    if (userProfile && userProfile.uid === userId) {
      const updated = { ...userProfile, permissions: newPermissions };
      saveUserProfile(updated);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setFirebaseUser(null);
    saveUserProfile(null);
    sounds.playSuccess();
  };

  const isAdmin = userProfile?.role === 'admin';
  const isPharmacist = userProfile?.role === 'pharmacist' || userProfile?.role === 'admin';
  const isCashier = userProfile?.role === 'cashier';

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        isAdmin,
        isPharmacist,
        isCashier,
        hasPermission,
        signIn,
        signUp,
        quickLoginAs,
        updateUserPermissions,
        logOut,
        authError,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
