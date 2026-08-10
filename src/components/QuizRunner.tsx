import React, { useState, useEffect } from 'react';
import { QuizQuestion, Lesson } from '../types';
import { submitQuizScore, generateAiQuiz } from '../lib/api';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Sparkles,
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface QuizRunnerProps {
  lesson: Lesson;
  onFinishQuiz: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({ lesson, onFinishQuiz }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, { isCorrect: boolean; answer: string }>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // Load dynamic AI-generated quiz questions
  const loadDynamicQuestions = async () => {
    setIsLoading(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setFillBlankInput('');
    setIsAnswered(false);
    setScore(0);
    setUserAnswers({});
    setIsCompleted(false);

    try {
      // If custom AI quiz modal provided quizQuestions, use them on first load if available
      if (lesson.id.startsWith('custom-ai-') && lesson.quizQuestions && lesson.quizQuestions.length > 0 && questions.length === 0) {
        setQuestions(lesson.quizQuestions);
        setIsLoading(false);
        return;
      }

      // Generate dynamic quiz questions via Gemini AI
      const aiGeneratedQuestions = await generateAiQuiz(
        lesson.title,
        lesson.level,
        7, // Default 7 questions for standard dynamic quiz
        lesson.category,
        lesson.grammarSections,
        lesson.vocabularyItems
      );

      if (aiGeneratedQuestions && aiGeneratedQuestions.length > 0) {
        setQuestions(aiGeneratedQuestions);
      } else if (lesson.quizQuestions && lesson.quizQuestions.length > 0) {
        setQuestions(lesson.quizQuestions);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.warn('Fallback to local lesson quiz questions:', err);
      if (lesson.quizQuestions && lesson.quizQuestions.length > 0) {
        setQuestions(lesson.quizQuestions);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDynamicQuestions();
  }, [lesson.id]);

  const currentQ = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (!currentQ || isAnswered) return;

    let isCorrect = false;
    let submittedAnswer = '';

    if (currentQ.type === 'multiple-choice') {
      if (!selectedOption) return;
      submittedAnswer = selectedOption;
      isCorrect = selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    } else {
      if (!fillBlankInput) return;
      submittedAnswer = fillBlankInput;
      isCorrect = fillBlankInput.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    }

    setIsAnswered(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: { isCorrect, answer: submittedAnswer },
    }));
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setFillBlankInput('');
      setIsAnswered(false);
    } else {
      // Completed all questions
      setIsCompleted(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      try {
        const res = await submitQuizScore(lesson.id, score, questions.length);
        setEarnedXp(res.earnedXp || 110);
      } catch (err) {
        console.error('Failed to submit score:', err);
      }
    }
  };

  // Loading Screen State
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/20">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>Gemini AI đang tự động tạo bộ câu hỏi trắc nghiệm...</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Hệ thống đang sinh ngẫu nhiên bộ câu hỏi chuẩn sư phạm theo thời gian thực bao gồm chia động từ, dấu hiệu nhận biết, phân biệt khẳng định / phủ định / nghi vấn và điền từ.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 rounded-full text-xs font-semibold">
            ✨ Tạo mới ngẫu nhiên 100% • Không lặp lại
          </span>
        </div>
      </div>
    );
  }

  // Fallback if no questions available
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-8 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Chưa thể sinh câu hỏi tự động</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Vui lòng thử lại hoặc chọn một bài học khác.</p>
        <button
          onClick={loadDynamicQuestions}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử sinh lại đề</span>
        </button>
      </div>
    );
  }

  // Quiz Completed View
  if (isCompleted) {
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/30">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Hoàn thành bài trắc nghiệm!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bạn vừa tích lũy thêm điểm thưởng tiến độ cho tài khoản.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{score}/{questions.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Số câu đúng</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Độ chính xác</div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
              <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                +{earnedXp} XP
              </div>
              <div className="text-[11px] text-indigo-800 dark:text-indigo-300 font-semibold">Điểm thưởng</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={loadDynamicQuestions}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900/80 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-amber-300 dark:border-amber-800"
            >
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Sinh bộ câu hỏi mới (AI)</span>
            </button>
            <button
              onClick={onFinishQuiz}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Xem kết quả & quay lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Controls Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onFinishQuiz}
          className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-1 whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Thoát trắc nghiệm</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDynamicQuestions}
            className="px-3 py-1 bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-colors"
            title="Đổi sang bộ câu hỏi AI ngẫu nhiên khác"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Sinh đề ngẫu nhiên mới</span>
          </button>

          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full whitespace-nowrap">
            Câu {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-md">
              {currentQ.type === 'multiple-choice' ? 'Trắc nghiệm nhiều lựa chọn' : 'Điền vào chỗ trống'}
            </span>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI sinh tự động</span>
            </span>
          </div>

          <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {currentQ.question}
          </h2>
        </div>

        {/* Input Options / Multiple Choice Options */}
        {currentQ.type === 'multiple-choice' && currentQ.options && (
          <div className="space-y-2.5 sm:space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              let btnClass = 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 text-slate-800 dark:text-slate-200';

              if (isAnswered) {
                if (option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase()) {
                  btnClass = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnClass = 'bg-red-50 dark:bg-red-950/80 border-red-500 text-red-900 dark:text-red-200 font-bold';
                } else {
                  btnClass = 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-50 text-slate-500 dark:text-slate-400';
                }
              } else if (isSelected) {
                btnClass = 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold ring-2 ring-indigo-500/20';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isAnswered && setSelectedOption(option)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-base font-medium transition-all flex items-center justify-between gap-2 ${btnClass}`}
                >
                  <span>{option}</span>
                  {isAnswered && option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase() && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && isSelected && option.trim().toLowerCase() !== currentQ.correctAnswer.trim().toLowerCase() && (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === 'fill-blank' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nhập từ còn thiếu ở đây..."
              value={fillBlankInput}
              onChange={(e) => setFillBlankInput(e.target.value)}
              disabled={isAnswered}
              className="w-full p-3.5 sm:p-4 text-base bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Action Check / Submit Button */}
        {!isAnswered ? (
          <button
            onClick={handleCheckAnswer}
            disabled={
              (currentQ.type === 'multiple-choice' && !selectedOption) ||
              (currentQ.type === 'fill-blank' && !fillBlankInput.trim())
            }
            className="w-full py-3.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-40 text-white font-bold rounded-2xl shadow-md transition-all text-base"
          >
            Kiểm tra đáp án
          </button>
        ) : (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Answer Result Banner */}
            <div className={`p-4 rounded-2xl border text-sm sm:text-base space-y-1 ${
              userAnswers[currentIndex]?.isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800/80 text-red-900 dark:text-red-200'
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-base sm:text-lg">
                {userAnswers[currentIndex]?.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Chính xác! (+20 XP)
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Chưa chính xác. Đáp án đúng: "{currentQ.correctAnswer}"
                  </>
                )}
              </div>
              <div className="pt-1 text-slate-700 dark:text-slate-300 leading-relaxed font-normal text-base">
                💡 <strong>Giải thích:</strong> {currentQ.explanation}
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-md transition-all text-base flex items-center justify-center gap-2"
            >
              <span>{currentIndex === questions.length - 1 ? 'Xem kết quả cuối cùng' : 'Câu tiếp theo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
