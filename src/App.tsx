import React, { useState, useEffect } from 'react';
import { User, Lesson, UserProgress } from './types';
import { getCurrentUser, getLessons, getUserProgress, switchUserRole } from './lib/api';
import { subscribeToUserData } from './lib/firebase';
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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    userId: 'user-1',
    xp: 450,
    streakDays: 5,
    completedLessonIds: ['lesson-1'],
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

  const loadData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);

      const lessonsData = await getLessons();
      setLessons(lessonsData);

      const progressData = await getUserProgress();
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time listener for user data & progress in Firestore
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeToUserData(user.id, (firestoreData) => {
      if (firestoreData) {
        setUser((prev) => prev ? { ...prev, ...firestoreData } : prev);
        if (firestoreData.xp !== undefined || firestoreData.completedLessons !== undefined) {
          setProgress((prev) => ({
            ...prev,
            xp: firestoreData.xp ?? prev.xp,
            streakDays: firestoreData.streak ?? prev.streakDays,
            completedLessonIds: firestoreData.completedLessons ?? prev.completedLessonIds,
            quizScores: firestoreData.quizScores ?? prev.quizScores
          }));
        }
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setActiveTab('lesson-detail');
  };

  const handleStartQuiz = () => {
    setActiveTab('quiz');
  };

  const handleFinishQuiz = async () => {
    // Refresh progress data
    try {
      const updatedProgress = await getUserProgress();
      setProgress(updatedProgress);
      if (user) {
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs font-semibold">Đang tải nền tảng Engie AI...</p>
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
          />
        )}

        {activeTab === 'lessons' && (
          <LessonList
            lessons={lessons}
            progress={progress}
            onSelectLesson={handleSelectLesson}
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
            onRefreshLessons={loadData}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            user={user}
            progress={progress}
            lessons={lessons}
            onSelectLesson={handleSelectLesson}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-700 dark:text-indigo-400 font-logo-rounded">Engie AI</span>
            <span>- Nền tảng học tiếng Anh thông minh</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span>Next.js 14 App Router Ready</span>
            <span>Google OAuth 2.0</span>
            <span>Gemini AI Tutor</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newUser) => {
          setUser(newUser);
          loadData();
        }}
      />

      <ExportGuideModal
        isOpen={isExportDocsOpen}
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
