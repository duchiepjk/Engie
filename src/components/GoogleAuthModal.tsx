import React, { useState } from 'react';
import { User } from '../types';
import { loginWithGoogle } from '../lib/api';
import { loginWithFirebaseGoogle } from '../lib/firebase';
import { X, Check, Shield, Lock, Chrome, Database, Sparkles } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFirebaseAuthPopup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await loginWithFirebaseGoogle();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.warn('Firebase Popup error:', err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setError('Popup đăng nhập bị chặn bởi trình duyệt iframe preview. Vui lòng thử cách đăng nhập email Google bên dưới.');
      } else {
        setError(err.message || 'Đăng nhập Google qua Firebase thất bại. Bạn có thể sử dụng hình thức nhập email bên dưới.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, name: string, avatar: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle({ email, name, avatar });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đăng nhập Google thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setError('Vui lòng nhập Email Google');
      return;
    }
    handleQuickLogin(emailInput, nameInput || emailInput.split('@')[0], 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
        id="google-auth-modal"
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center">
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Đăng nhập bằng Google</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Google OAuth 2.0 Identity Provider</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* Firebase Auth Google Popup Button */}
          <div>
            <button
              onClick={handleFirebaseAuthPopup}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Đăng nhập Google qua Firebase Auth (Popup)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-1.5 flex items-center justify-center gap-1">
              <Database className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Đồng bộ tiến độ học trực tiếp vào Firebase Firestore</span>
            </p>
          </div>

          <div className="relative flex items-center py-0.5">
            <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="shrink mx-3 text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Hoặc dùng thử tài khoản sẵn có</span>
            <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Quick Select Preset Demo Accounts */}
          <div className="space-y-2.5">
            <button
              onClick={() => handleQuickLogin('hocvien@gmail.com', 'Nguyễn Văn Học', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Học viên"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                    Nguyễn Văn Học (Học viên)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">hocvien@gmail.com</div>
                </div>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-md">
                Học viên (B1)
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('admin.englishub@gmail.com', 'Quản Trị Viên (Admin)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80')}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/60 hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  alt="Admin"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-400">
                    Quản Trị Viên (Admin)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">admin.englishub@gmail.com</div>
                </div>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 rounded-md">
                Admin
              </span>
            </button>
          </div>

          <div className="relative flex items-center py-0.5">
            <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="shrink mx-3 text-[11px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Hoặc nhập email Google cá nhân</span>
            <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Custom Google Email Form */}
          <form onSubmit={handleSubmitCustom} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tên hiển thị Google
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Trần Minh Đức"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Google Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="ductr@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Chrome className="w-4 h-4" />
                  Xác thực bằng Email Google & Đồng bộ Firestore
                </>
              )}
            </button>
          </form>

          <div className="pt-1 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xác thực Firebase Auth + Firestore Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
