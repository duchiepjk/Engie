import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { User, Lesson, UserProgress } from '../types';
import { 
  Flame, 
  Award, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Bot, 
  BookOpen, 
  Headphones, 
  FileText, 
  TrendingUp, 
  ArrowRight,
  Clock,
  PartyPopper
} from 'lucide-react';

interface HomeDashboardProps {
  user: User;
  progress: UserProgress;
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAiQuiz: () => void;
  onOpenAuthModal?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  progress,
  lessons,
  onSelectLesson,
  onNavigateTab,
  onOpenAiQuiz,
  onOpenAuthModal,
}) => {
  const completedCount = progress.completedLessonIds.length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const vocabularyLessons = lessons.filter((l) => l.category === 'vocabulary');
  const grammarLessons = lessons.filter((l) => l.category === 'grammar');
  const listeningLessons = lessons.filter((l) => l.category === 'listening');

  const triggerStreakConfetti = () => {
    // Initial rich particle burst
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899', '#8b5cf6']
    });

    // Side cannons burst sequence
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#6366f1']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  useEffect(() => {
    // Fire celebratory confetti once per session when user has maintained a streak
    if (user.streak > 0) {
      const celebratedKey = `streak_celebrated_${user.streak}`;
      if (!sessionStorage.getItem(celebratedKey)) {
        triggerStreakConfetti();
        sessionStorage.setItem(celebratedKey, 'true');
      }
    }
  }, [user.streak]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Guest Mode Sync Alert Banner */}
      {user.isGuest && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Bạn đang duyệt ở trạng thái Khách!</div>
              <div className="text-xs text-amber-800/90 dark:text-amber-300/90">
                Đăng nhập bằng tài khoản Google để tự động lưu điểm XP, chuỗi học liên tục và đồng bộ tiến độ Firestore.
              </div>
            </div>
          </div>
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0 whitespace-nowrap"
            >
              Đăng nhập Google ngay
            </button>
          )}
        </div>
      )}

      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 sm:p-8 shadow-xl">
        {/* Subtle background glow graphics */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Chào mừng trở lại! Nền tảng học tiếng Anh thông minh</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Xin chào, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Hôm nay là ngày tuyệt vời để nâng cao kỹ năng Tiếng Anh của bạn. Bạn đã duy trì chuỗi <strong className="text-amber-300">{user.streak} ngày học liên tục</strong>!
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="btn-continue-learning"
                onClick={() => {
                  const uncompleted = lessons.find((l) => !progress.completedLessonIds.includes(l.id));
                  if (uncompleted) onSelectLesson(uncompleted);
                  else if (lessons[0]) onSelectLesson(lessons[0]);
                }}
                className="px-5 py-2.5 bg-white text-indigo-900 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-indigo-900 shrink-0" />
                <span>Tiếp tục học ngay</span>
              </button>

              <button
                id="btn-celebrate-streak"
                onClick={triggerStreakConfetti}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                title="Bắn pháo hoa ăn mừng chuỗi học của bạn"
              >
                <PartyPopper className="w-4 h-4 text-amber-950 shrink-0" />
                <span>Ăn mừng chuỗi học 🔥</span>
              </button>

              <button
                id="btn-ask-ai-tutor"
                onClick={() => onNavigateTab('tutor')}
                className="px-5 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold rounded-xl border border-indigo-400/30 backdrop-blur-md transition-all flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hỏi gia sư AI Engie</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 text-white space-y-4 shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-200 tracking-wider">
              <span>Mục tiêu học tập</span>
              <span>{progressPercent}% hoàn thành</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-indigo-950/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div 
                onClick={triggerStreakConfetti}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-amber-400/40 text-center cursor-pointer transition-all hover:scale-105 group relative"
                title="Nhấn để ăn mừng chuỗi học!"
              >
                <div className="text-xl font-bold text-amber-300 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
                  {user.streak}
                </div>
                <div className="text-[11px] text-amber-200 font-semibold group-hover:underline flex items-center justify-center gap-1">
                  <span>Chuỗi ngày 🎉</span>
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-center">
                <div className="text-xl font-bold text-indigo-200 flex items-center justify-center gap-1">
                  <Award className="w-5 h-5 text-indigo-300" />
                  {user.xp}
                </div>
                <div className="text-[11px] text-indigo-200 font-medium">Điểm kinh nghiệm</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigateTab('lessons')} 
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm sm:text-base">
            Từ vựng tiếng Anh
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {vocabularyLessons.length} bài học flashcard & phát âm
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('lessons')} 
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm sm:text-base">
            Ngữ pháp chuẩn
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {grammarLessons.length} bài phân tích công thức & ví dụ
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('lessons')} 
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Headphones className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm sm:text-base">
            Luyện nghe nói
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {listeningLessons.length} bài nghe tốc độ người bản xứ
          </p>
        </div>

        <div 
          onClick={onOpenAiQuiz} 
          className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400 dark:hover:border-amber-500 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-amber-200 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors text-sm sm:text-base flex items-center gap-1">
            Trắc nghiệm AI
          </h3>
          <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
            Tạo đề trắc nghiệm tự động theo chủ đề tùy chọn
          </p>
        </div>

      </div>

      {/* Featured Lessons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Danh sách bài học nổi bật</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Được sắp xếp theo cấp độ và tiến độ cá nhân của bạn</p>
          </div>
          <button
            onClick={() => onNavigateTab('lessons')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>Xem tất cả ({lessons.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.slice(0, 6).map((lesson) => {
            const isCompleted = progress.completedLessonIds.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer flex flex-col group"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={lesson.imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                  {isCompleted && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã xong
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-200" />
                      <span>Thời lượng: {lesson.durationMinutes} phút</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-bold text-white shadow-xs">
                      {lesson.level}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        lesson.category === 'vocabulary'
                          ? 'text-blue-600 dark:text-blue-400'
                          : lesson.category === 'grammar'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-purple-600 dark:text-purple-400'
                      }`}>
                        {lesson.category === 'vocabulary' ? 'Từ vựng' : lesson.category === 'grammar' ? 'Ngữ pháp' : 'Luyện nghe'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>{isCompleted ? 'Ôn tập lại' : 'Bắt đầu bài học'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
