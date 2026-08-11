import React, { useState } from 'react';
import { User, UserProgress, Lesson, CEFRLevel } from '../types';
import { 
  Flame, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Sparkles,
  UserCheck,
  LogIn,
  LogOut,
  SlidersHorizontal,
  Check,
  X,
  GraduationCap
} from 'lucide-react';

interface UserProfileViewProps {
  user: User;
  progress: UserProgress;
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
  onUpdateLevel?: (newLevel: CEFRLevel) => Promise<void> | void;
}

const LEVEL_OPTIONS: { level: CEFRLevel; title: string; desc: string; badgeColor: string }[] = [
  { level: 'A1', title: 'Sơ cấp cơ bản', desc: 'Bắt đầu làm quen từ vựng & câu giao tiếp đời sống căn bản', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300' },
  { level: 'A2', title: 'Sơ cấp', desc: 'Nắm vững cấu trúc câu & hội thoại đơn giản hàng ngày', badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300' },
  { level: 'B1', title: 'Trung cấp cơ bản', desc: 'Hiểu các bài đọc, bài nghe & diễn đạt chủ đề quen thuộc', badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300' },
  { level: 'B2', title: 'Trung cấp nâng cao', desc: 'Giao tiếp trôi chảy, hiểu nội dung phức tạp & tranh luận', badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300' },
  { level: 'C1', title: 'Cao cấp', desc: 'Thành thạo linh hoạt mọi kỹ năng trong môi trường học thuật/chuyên nghiệp', badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300' },
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  progress,
  lessons,
  onSelectLesson,
  onOpenAuthModal,
  onLogout,
  onUpdateLevel,
}) => {
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const completedLessonsList = lessons.filter((l) => progress.completedLessonIds.includes(l.id));

  const handleSelectLevel = async (newLevel: CEFRLevel) => {
    if (newLevel === user.level) {
      setIsLevelModalOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      if (onUpdateLevel) {
        await onUpdateLevel(newLevel);
      }
      setToastMessage(`✨ Đã cập nhật trình độ sang [CẤP ĐỘ ${newLevel}] thành công! Dữ liệu bài học gợi ý đã được làm mới.`);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      console.error('Error changing level:', err);
    } finally {
      setIsUpdating(false);
      setIsLevelModalOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-600 text-white font-medium text-xs rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-md shrink-0"
          />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{user.name}</h1>
              {user.role === 'admin' && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 rounded-md text-[11px] font-bold">
                  Admin
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>

            {/* Level Badge with Quick Switch Button */}
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-extrabold uppercase">
                Cấp độ {user.level}
              </span>
              <button
                onClick={() => setIsLevelModalOpen(true)}
                className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                title="Thay đổi trình độ tiếng Anh của bạn"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Đổi trình độ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user.isGuest ? (
            <button
              onClick={onOpenAuthModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
          ) : (
            onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 font-bold rounded-xl text-xs transition-all flex items-center gap-2 active:scale-95 shadow-2xs"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{user.streak} Ngày</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chuỗi học liên tục</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">{user.xp} XP</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng điểm tích lũy</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{completedLessonsList.length} / {lessons.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bài học đã hoàn thành</div>
          </div>
        </div>

      </div>

      {/* Completed Lessons Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Bài học đã hoàn thành ({completedLessonsList.length})
        </h2>

        {completedLessonsList.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 text-xs">
            Bạn chưa hoàn thành bài học nào. Hãy bắt đầu học ngay từ trang chủ!
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
            {completedLessonsList.map((lesson) => {
              const quizScore = progress.quizScores[lesson.id];

              return (
                <div
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{lesson.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-md">
                        {lesson.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{lesson.description}</p>
                  </div>

                  {quizScore && (
                    <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold shrink-0">
                      Điểm: {quizScore.score}/{quizScore.total} câu đúng
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Change CEFR Level Modal */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Cập nhật trình độ tiếng Anh
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hệ thống sẽ gợi ý danh sách bài học phù hợp nhất với cấp độ bạn chọn.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLevelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Level Selection Options */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {LEVEL_OPTIONS.map((opt) => {
                const isCurrent = user.level === opt.level;

                return (
                  <button
                    key={opt.level}
                    disabled={isUpdating}
                    onClick={() => handleSelectLevel(opt.level)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 group ${
                      isCurrent
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase shrink-0 ${opt.badgeColor}`}>
                        {opt.level}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                          <span>{opt.title}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md">
                              Đang áp dụng
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                      isCurrent
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                    }`}>
                      {isCurrent && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsLevelModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Hủy bỏ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

