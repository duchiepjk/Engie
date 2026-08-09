import React, { useState } from 'react';
import { QuizQuestion, Lesson } from '../types';
import { generateAiQuiz } from '../lib/api';
import { Sparkles, X, Loader2, ArrowRight } from 'lucide-react';

interface AiQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomQuiz: (quizLesson: Lesson) => void;
}

export const AiQuizGeneratorModal: React.FC<AiQuizGeneratorModalProps> = ({
  isOpen,
  onClose,
  onStartCustomQuiz,
}) => {
  const [topic, setTopic] = useState('Giao tiếp sân bay & du lịch');
  const [level, setLevel] = useState('B1');
  const [count, setCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const questions: QuizQuestion[] = await generateAiQuiz(topic, level, count);

      if (!questions || questions.length === 0) {
        throw new Error('Không thể tạo câu hỏi cho chủ đề này. Vui lòng thử từ khóa khác.');
      }

      const customLesson: Lesson = {
        id: `custom-ai-${Date.now()}`,
        title: `Trắc nghiệm AI: ${topic}`,
        category: 'vocabulary',
        level: level as any,
        description: `Bài trắc nghiệm được tạo tự động bởi Gemini AI cho chủ đề "${topic}".`,
        durationMinutes: 10,
        quizQuestions: questions,
        createdAt: new Date().toISOString(),
      };

      onStartCustomQuiz(customLesson);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra khi gọi Gemini AI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
        id="ai-quiz-modal"
      >
        <div className="p-6 pb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <h3 className="text-lg font-bold">Tạo trắc nghiệm AI tùy chỉnh</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider mb-1.5">
              Chủ đề tiếng Anh mong muốn
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Phỏng vấn xin việc, Đặt phòng khách sạn..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider mb-1.5">
                Trình độ CEFR
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="A1">A1 - Sơ cấp cơ bản</option>
                <option value="A2">A2 - Sơ cấp</option>
                <option value="B1">B1 - Trung cấp cơ bản</option>
                <option value="B2">B2 - Trung cấp</option>
                <option value="C1">C1 - Cao cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider mb-1.5">
                Số câu hỏi
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value={3}>3 câu hỏi ngắn</option>
                <option value={5}>5 câu hỏi tiêu chuẩn</option>
              </select>
            </div>
          </div>

          {/* Quick topic pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Gợi ý chủ đề nhanh:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Giao tiếp công sở', 'Ăn uống & Gọi món', 'Du lịch thế giới', 'Từ vựng IT'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg text-xs font-medium border border-amber-200/60 dark:border-amber-800/60"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gemini AI đang tạo đề trắc nghiệm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Tạo đề & bắt đầu làm ngay</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
