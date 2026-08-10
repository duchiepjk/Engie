import React, { useState, useEffect } from 'react';
import { User, Lesson, UserProgress, CEFRLevel } from './types';
import { getLessons, getUserProgress, switchUserRole } from './lib/api';
import { 
  auth, 
  onAuthStateChanged, 
  getUserFromFirestore, 
  saveUserToFirestore, 
  syncFirebaseUserToFirestore,
  subscribeToUserData, 
  logoutFromFirebase,
  updateUserLevelInFirestore
} from './lib/firebase';
import { Header } from './components/Header';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ExportGuideModal } from './components/ExportGuideModal';
import { HomeDashboard } from './components/HomeDashboard';
import { LessonList } from './components/LessonList';
import { LessonDetailView } from './components/LessonDetailView';
import { QuizRunner } from './components/QuizRunner';
import { AiTutorChat } from './components/AiTutorChat';
import { AiQuizGeneratorModal } from './components/AiQuizGeneratorModal';
import { AdminPanel } from './components/AdminPanel';
import { UserProfileView } from './components/UserProfileView';
import { Loader2 } from 'lucide-react';

const GUEST_USER: User = {
  id: 'guest-user',
  name: 'Khách (Chưa đăng nhập)',
  email: 'guest@englishub.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: 'user',
  level: 'B1',
  streak: 0,
  xp: 0,
  completedLessons: [],
  isGuest: true
};

export default function App() {
  const [user, setUser] = useState<User>(GUEST_USER);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    userId: 'guest-user',
    xp: 0,
    streakDays: 0,
    completedLessonIds: [],
    quizScores: {},
    savedVocab: [],
  });

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExportDocsOpen, setIsExportDocsOpen] = useState(false);
  const [isAiQuizOpen, setIsAiQuizOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // Load Lessons data
  const loadLessonsData = async () => {
    try {
      const lessonsData = await getLessons();
      setLessons(lessonsData);
    } catch (err) {
      console.error('Failed to load lessons data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLessonsData();
  }, []);

  // Firebase Auth State Listener & Local User Loader
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // User logged in via Firebase Auth Google
        const appUser = await syncFirebaseUserToFirestore(fbUser);
        setUser(appUser);
        localStorage.setItem('engie_logged_user', JSON.stringify(appUser));
      } else {
        // Check if there is a saved logged in user in localStorage
        const savedJson = localStorage.getItem('engie_logged_user');
        if (savedJson) {
          try {
            const parsedUser: User = JSON.parse(savedJson);
            const firestoreUser = await getUserFromFirestore(parsedUser.id);
            if (firestoreUser) {
              setUser({ ...parsedUser, ...firestoreUser, isGuest: false });
            } else {
              setUser({ ...parsedUser, isGuest: false });
            }
          } catch {
            setUser(GUEST_USER);
          }
        } else {
          setUser(GUEST_USER);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time listener for user profile & progress in Firestore
  useEffect(() => {
    if (!user?.id || user.isGuest) {
      setProgress({
        userId: 'guest-user',
        xp: 0,
        streakDays: 0,
        completedLessonIds: [],
        quizScores: {},
        savedVocab: [],
      });
      return;
    }

    const unsubscribeStore = subscribeToUserData(user.id, (firestoreData) => {
      if (firestoreData) {
        setUser((prev) => prev ? { ...prev, ...firestoreData, isGuest: false } : prev);
        setProgress((prev) => ({
          ...prev,
          userId: user.id,
          xp: firestoreData.xp ?? prev.xp,
          streakDays: firestoreData.streak ?? prev.streakDays,
          completedLessonIds: firestoreData.completedLessons ?? prev.completedLessonIds,
          quizScores: firestoreData.quizScores ?? prev.quizScores
        }));
      }
    });

    return () => unsubscribeStore();
  }, [user?.id, user?.isGuest]);

  // Route protection: Only users with role === 'admin' can access 'admin' tab
  useEffect(() => {
    if (activeTab === 'admin' && user.role !== 'admin') {
      setActiveTab('home');
    }
  }, [activeTab, user.role]);

  const handleLogout = async () => {
    try {
      await logoutFromFirebase();
    } catch (e) {
      console.warn('Logout warning:', e);
    }
    localStorage.removeItem('engie_logged_user');
    setUser(GUEST_USER);
    setActiveTab('home');
  };

  const handleUpdateUserLevel = async (newLevel: CEFRLevel) => {
    setUser((prev) => ({ ...prev, level: newLevel }));
    if (user && !user.isGuest && user.id) {
      await updateUserLevelInFirestore(user.id, newLevel);
    }
    const savedJson = localStorage.getItem('engie_logged_user');
    if (savedJson) {
      try {
        const parsed = JSON.parse(savedJson);
        localStorage.setItem('engie_logged_user', JSON.stringify({ ...parsed, level: newLevel }));
      } catch (e) {
        console.warn('Error updating local storage level:', e);
      }
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setActiveTab('lesson-detail');
  };

  const handleStartQuiz = () => {
    setActiveTab('quiz');
  };

  const handleFinishQuiz = async () => {
    try {
      const updatedProgress = await getUserProgress();
      setProgress(updatedProgress);
      if (user && !user.isGuest) {
        setUser({ ...user, xp: updatedProgress.xp, completedLessons: updatedProgress.completedLessonIds });
      }
    } catch (e) {
      console.error(e);
    }
    setActiveTab('lesson-detail');
  };

  const handleStartCustomAiQuiz = (customLesson: Lesson) => {
    setSelectedLesson(customLesson);
    setActiveTab('quiz');
  };

  const handleAddCustomLesson = (newLesson: Lesson) => {
    setLessons((prev) => [newLesson, ...prev]);
  };

  const handleRoleSwitch = async (role: 'user' | 'admin') => {
    try {
      const updatedUser = await switchUserRole(role);
      setUser(updatedUser);
      if (role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs font-semibold">Đang tải nền tảng Engie AI & Firestore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Navigation Bar Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenExportDocs={() => setIsExportDocsOpen(true)}
        onOpenAiQuiz={() => setIsAiQuizOpen(true)}
        onRoleSwitch={handleRoleSwitch}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'home' && (
          <HomeDashboard
            user={user}
            progress={progress}
            lessons={lessons}
            onSelectLesson={handleSelectLesson}
            onNavigateTab={setActiveTab}
            onOpenAiQuiz={() => setIsAiQuizOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonList
            lessons={lessons}
            progress={progress}
            onSelectLesson={handleSelectLesson}
            onAddCustomLesson={handleAddCustomLesson}
            userLevel={user.level}
          />
        )}

        {activeTab === 'lesson-detail' && selectedLesson && (
          <LessonDetailView
            lesson={selectedLesson}
            progress={progress}
            onBack={() => setActiveTab('lessons')}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {activeTab === 'quiz' && selectedLesson && (
          <QuizRunner
            lesson={selectedLesson}
            onFinishQuiz={handleFinishQuiz}
          />
        )}

        {activeTab === 'tutor' && (
          <AiTutorChat user={user} />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            lessons={lessons}
            onRefreshLessons={loadLessonsData}
            currentUser={user}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            user={user}
            progress={progress}
            lessons={lessons}
            onSelectLesson={handleSelectLesson}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onUpdateLevel={handleUpdateUserLevel}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-5 sm:py-6 pb-8 sm:pb-6 text-xs text-slate-500 dark:text-slate-400 overflow-x-hidden transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span className="font-bold text-indigo-700 dark:text-indigo-400 font-logo-rounded text-sm sm:text-xs">Engie AI</span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Nền tảng học tiếng Anh thông minh với Firebase</span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal">
            <span className="hidden sm:inline-flex items-center gap-3">
              <span>Firebase Auth Google</span>
              <span>•</span>
              <span>Firestore Database</span>
              <span>•</span>
              <span>Gemini AI Tutor</span>
            </span>
            <span className="inline-block sm:hidden">
              Tích hợp Firebase Firestore & Gemini AI
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newUser) => {
          setUser({ ...newUser, isGuest: false });
          localStorage.setItem('engie_logged_user', JSON.stringify(newUser));
        }}
      />

      <ExportGuideModal
        isOpen={isExportDocsOpen && (import.meta.env.DEV || user.role === 'admin')}
        onClose={() => setIsExportDocsOpen(false)}
      />

      <AiQuizGeneratorModal
        isOpen={isAiQuizOpen}
        onClose={() => setIsAiQuizOpen(false)}
        onStartCustomQuiz={handleStartCustomAiQuiz}
      />

    </div>
  );
}

