import React from 'react';
import { User, UserProgress, Lesson } from '../types';
import { speakEnglishText } from '../lib/audio';
import { 
  Flame, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Bookmark, 
  Volume2, 
  ShieldCheck, 
  Sparkles,
  Calendar
} from 'lucide-react';

interface UserProfileViewProps {
  user: User;
  progress: UserProgress;
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onOpenAuthModal: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  progress,
  lessons,
  onSelectLesson,
  onOpenAuthModal,
}) => {
  const completedLessonsList = lessons.filter((l) => progress.completedLessonIds.includes(l.id));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{user.name}</h1>
              <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold uppercase">
                Cấp độ {user.level}
              </span>
              {user.role === 'admin' && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 rounded-md text-[11px] font-bold">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tài khoản xác thực Google OAuth 2.0
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors shrink-0 whitespace-nowrap"
        >
          Đổi tài khoản Google
        </button>
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

    </div>
  );
};
