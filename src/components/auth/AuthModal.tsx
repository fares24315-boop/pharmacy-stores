import React from 'react';
import { LoginPage } from './LoginPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRole?: 'admin' | 'any';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -left-3 z-10 w-9 h-9 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100"
        >
          ✕
        </button>
        <LoginPage
          isOpenAsModal={true}
          onCloseModal={onClose}
          onSuccessLogin={onClose}
        />
      </div>
    </div>
  );
};
