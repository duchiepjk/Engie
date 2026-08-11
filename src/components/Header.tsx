import React from 'react';
import { User } from '../types';
import { BrandName } from './BrandName';
import logoImg from '../assets/images/english_hub_logo_1785896964079.jpg';
import { 
  BookOpen, 
  Sparkles, 
  Bot, 
  Flame, 
  Award, 
  ShieldCheck, 
  UserCheck, 
  LogIn,
  Layers, 
  Code,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuthModal: () => void;
  onOpenExportDocs: () => void;
  onOpenAiQuiz: () => void;
  onRoleSwitch: (role: 'user' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  isDarkMode,
  onToggleDarkMode,
  onOpenAuthModal,
  onOpenExportDocs,
  onOpenAiQuiz,
  onRoleSwitch,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
            id="header-brand-logo"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700">
              <img 
                src={logoImg} 
                alt="Engie Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <BrandName />
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'home'
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Trang chủ</span>
            </button>

            <button
              id="nav-tab-lessons"
              onClick={() => setActiveTab('lessons')}
              className={`px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'lessons'
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Bài học</span>
            </button>

            <button
              id="nav-tab-tutor"
              onClick={() => setActiveTab('tutor')}
              className={`px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tutor'
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Gia sư AI</span>
            </button>

            <button
              id="nav-tab-ai-quiz"
              onClick={onOpenAiQuiz}
              className="px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-800/60 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
              <span>Trắc nghiệm AI</span>
            </button>

            {user.role === 'admin' && (
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`px-2.5 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-semibold'
                    : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Trang quản trị</span>
              </button>
            )}
          </nav>

          {/* User Profile & Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Streak Counter */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 rounded-full text-xs font-semibold text-amber-800 dark:text-amber-300 shrink-0" title="Chuỗi ngày học liên tục">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span>{user.streak} Ngày</span>
            </div>

            {/* XP Counter */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-full text-xs font-semibold text-indigo-800 dark:text-indigo-300 shrink-0" title="Điểm kinh nghiệm XP">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{user.xp} XP</span>
            </div>

            {/* Theme Toggle Button (Light / Dark Mode) */}
            <button
              id="header-btn-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center shrink-0"
              title={isDarkMode ? "Chuyển sang giao diện sáng (Light Mode)" : "Chuyển sang giao diện tối (Dark Mode)"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform rotate-0 hover:scale-110" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 hover:scale-110 transition-transform" />
              )}
            </button>

            {/* Next.js Export Docs Button (Only visible for Admin or in DEV mode) */}
            {(import.meta.env.DEV || user.role === 'admin') && (
              <button
                id="header-btn-docs"
                onClick={onOpenExportDocs}
                className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                title="Xem hướng dẫn cấu hình Next.js & Prisma full-stack"
              >
                <Code className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Logged-in Profile & Role Section vs Guest Login Button */}
            {!user.isGuest ? (
              <div className="flex items-center gap-2 shrink-0">
                {/* Admin Badge / Role Switcher (Only visible when logged in) */}
                {(import.meta.env.DEV || user.role === 'admin') && (
                  <button
                    id="header-btn-role-switch"
                    onClick={() => import.meta.env.DEV && onRoleSwitch(user.role === 'admin' ? 'user' : 'admin')}
                    className={`px-2 sm:px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all flex items-center gap-1 shrink-0 ${
                      user.role === 'admin'
                        ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={import.meta.env.DEV ? "Nhấn để đổi vai trò (Dev Mode)" : "Xác thực vai trò tài khoản"}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{user.role === 'admin' ? 'Admin' : 'Học viên'}</span>
                  </button>
                )}

                {/* Profile Avatar Button */}
                <button
                  id="header-btn-profile"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 shrink-0 cursor-pointer"
                  title={`Hồ sơ: ${user.name} (${user.email})`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                  <span className="hidden lg:inline text-xs font-semibold text-slate-700 dark:text-slate-200 pr-2">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
              </div>
            ) : (
              <button
                id="header-btn-login"
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                title="Đăng nhập tài khoản"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 dark:border-slate-800 py-2 bg-slate-50/80 dark:bg-slate-900/90 px-2 text-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <BookOpen className="w-4 h-4" />
          Trang chủ
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'lessons' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Layers className="w-4 h-4" />
          Bài học
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'tutor' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Gia sư AI
        </button>
        <button
          onClick={onOpenAiQuiz}
          className="flex flex-col items-center gap-0.5 text-amber-700 dark:text-amber-400 font-medium"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Quiz AI
        </button>
        {user.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-0.5 ${activeTab === 'admin' ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Quản trị
          </button>
        )}
      </div>
    </header>
  );
};

