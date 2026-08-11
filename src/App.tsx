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
import { Footer } from './components/Footer';
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
  const [authNoticeMessage, setAuthNoticeMessage] = useState<string | null>(null);
  const [isExportDocsOpen, setIsExportDocsOpen] = useState(false);
  const [isAiQuizOpen, setIsAiQuizOpen] = useState(false);

  const triggerLoginPrompt = (notice?: string) => {
    setAuthNoticeMessage(
      notice || 'Vui lòng đăng nhập bằng Google để bắt đầu học tập và làm trắc nghiệm.'
    );
    setIsAuthModalOpen(true);
  };

  const handleOpenAuthModalDirect = () => {
    setAuthNoticeMessage(null);
    setIsAuthModalOpen(true);
  };

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

  // Route protection: Guard tabs for Guest users & Admin permissions
  useEffect(() => {
    if (activeTab === 'admin' && user.role !== 'admin') {
      setActiveTab('home');
    } else if (user.isGuest && activeTab !== 'home' && activeTab !== 'profile') {
      setActiveTab('home');
      triggerLoginPrompt('Vui lòng đăng nhập bằng Google để bắt đầu học tập và làm trắc nghiệm.');
    }
  }, [activeTab, user.role, user.isGuest]);

  const handleTabChangeWithGuard = (targetTab: string) => {
    if (targetTab === 'home' || targetTab === 'profile') {
      setActiveTab(targetTab);
      return;
    }

    if (user.isGuest) {
      triggerLoginPrompt('Vui lòng đăng nhập bằng Google để bắt đầu học tập và làm trắc nghiệm.');
      return;
    }

    setActiveTab(targetTab);
  };

  const handleOpenAiQuizWithGuard = () => {
    if (user.isGuest) {
      triggerLoginPrompt('Vui lòng đăng nhập bằng Google để bắt đầu học tập và làm trắc nghiệm.');
      return;
    }
    setIsAiQuizOpen(true);
  };

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
    if (user.isGuest) {
      triggerLoginPrompt('Vui lòng đăng nhập bằng Google để bắt đầu học tập và làm trắc nghiệm.');
      return;
    }
    setSelectedLesson(lesson);
    setActiveTab('lesson-detail');
  };

  const handleStartQuiz = () => {
    if (user.isGuest) {
      triggerLoginPrompt('Vui lòng đăng nhập bằng Google để bắt đầu học tập và làm trắc nghiệm.');
      return;
    }
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
          <p className="text-xs font-semibold">Đang tải trải nghiệm Engie AI...</p>
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
        setActiveTab={handleTabChangeWithGuard}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenAuthModal={handleOpenAuthModalDirect}
        onOpenExportDocs={() => setIsExportDocsOpen(true)}
        onOpenAiQuiz={handleOpenAiQuizWithGuard}
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
            onNavigateTab={handleTabChangeWithGuard}
            onOpenAiQuiz={handleOpenAiQuizWithGuard}
            onOpenAuthModal={handleOpenAuthModalDirect}
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
            onOpenAuthModal={handleOpenAuthModalDirect}
            onLogout={handleLogout}
            onUpdateLevel={handleUpdateUserLevel}
          />
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthNoticeMessage(null);
        }}
        noticeMessage={authNoticeMessage}
        onSuccess={(newUser) => {
          setUser({ ...newUser, isGuest: false });
          localStorage.setItem('engie_logged_user', JSON.stringify(newUser));
          setAuthNoticeMessage(null);
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

