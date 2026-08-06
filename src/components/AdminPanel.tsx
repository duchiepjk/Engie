import React, { useState } from 'react';
import { Lesson, LessonCategory, CEFRLevel, QuizQuestion } from '../types';
import { createLesson, deleteLesson } from '../lib/api';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  BookOpen, 
  FileText, 
  Headphones, 
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';

interface AdminPanelProps {
  lessons: Lesson[];
  onRefreshLessons: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ lessons, onRefreshLessons }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LessonCategory>('vocabulary');
  const [level, setLevel] = useState<CEFRLevel>('B1');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  
  // Vocabulary input helpers
  const [vocabWord, setVocabWord] = useState('');
  const [vocabMeaning, setVocabMeaning] = useState('');
  const [vocabExample, setVocabExample] = useState('');
  const [vocabItems, setVocabItems] = useState<any[]>([]);

  // Quiz input helpers
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOption1, setQuizOption1] = useState('');
  const [quizOption2, setQuizOption2] = useState('');
  const [quizOption3, setQuizOption3] = useState('');
  const [quizOption4, setQuizOption4] = useState('');
  const [quizCorrect, setQuizCorrect] = useState('');
  const [quizExplanation, setQuizExplanation] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddVocabItem = () => {
    if (!vocabWord || !vocabMeaning) return;
    setVocabItems([
      ...vocabItems,
      {
        id: `v-${Date.now()}`,
        word: vocabWord,
        phonetic: '/.../',
        partOfSpeech: 'noun',
        meaning: vocabMeaning,
        example: vocabExample || `${vocabWord} is essential.`,
        exampleMeaning: 'Ví dụ minh họa.',
      },
    ]);
    setVocabWord('');
    setVocabMeaning('');
    setVocabExample('');
  };

  const handleAddQuizQuestion = () => {
    if (!quizQuestion || !quizCorrect) return;
    const options = [quizOption1, quizOption2, quizOption3, quizOption4].filter(Boolean);
    setQuizQuestions([
      ...quizQuestions,
      {
        id: `q-${Date.now()}`,
        type: options.length > 0 ? 'multiple-choice' : 'fill-blank',
        question: quizQuestion,
        options: options.length > 0 ? options : undefined,
        correctAnswer: quizCorrect,
        explanation: quizExplanation || `Đáp án đúng là ${quizCorrect}`,
      },
    ]);
    setQuizQuestion('');
    setQuizOption1('');
    setQuizOption2('');
    setQuizOption3('');
    setQuizOption4('');
    setQuizCorrect('');
    setQuizExplanation('');
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsLoading(true);
    setMessage(null);

    try {
      await createLesson({
        title,
        category,
        level,
        description,
        durationMinutes,
        vocabularyItems: category === 'vocabulary' ? vocabItems : undefined,
        quizQuestions: quizQuestions.length > 0 ? quizQuestions : [
          {
            id: `q-default`,
            type: 'multiple-choice',
            question: `Câu hỏi ôn tập cho ${title}?`,
            options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
            correctAnswer: 'Đáp án A',
            explanation: 'Đáp án đúng là A.',
          }
        ],
      });

      setMessage('Tạo bài học mới thành công!');
      setShowAddModal(false);
      onRefreshLessons();
      // Reset form
      setTitle('');
      setDescription('');
      setVocabItems([]);
      setQuizQuestions([]);
    } catch (err: any) {
      setMessage(err.message || 'Lỗi tạo bài học');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      await deleteLesson(id);
      onRefreshLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Admin Panel Header */}
      <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-300">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Trang quản trị bài học (Admin)</h1>
            <p className="text-xs text-purple-200">Quản lý, thêm/sửa/xóa bài học và đề trắc nghiệm trên hệ thống</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-white text-purple-900 font-bold rounded-xl shadow-lg hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Thêm bài học mới</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Existing Lessons List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Danh sách bài học đang có ({lessons.length})</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Quyền hạn: Admin</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                  lesson.category === 'vocabulary'
                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                    : lesson.category === 'grammar'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                    : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                }`}>
                  {lesson.level}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{lesson.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{lesson.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lesson.quizQuestions?.length || 0} câu hỏi quiz
                </span>
                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                  title="Xóa bài học này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Lesson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-purple-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Thêm bài học mới vào hệ thống
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateLesson} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tiêu đề bài học</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Từ vựng tiếng Anh chủ đề du lịch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phân loại</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LessonCategory)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="vocabulary">Từ vựng</option>
                    <option value="grammar">Ngữ pháp</option>
                    <option value="listening">Luyện nghe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cấp độ CEFR</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thời lượng (Phút)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mô tả bài học</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nội dung học..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl"
                />
              </div>

              {/* Vocabulary helper */}
              {category === 'vocabulary' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Thêm từ vựng vào bài ({vocabItems.length} từ đã thêm)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Từ tiếng Anh"
                      value={vocabWord}
                      onChange={(e) => setVocabWord(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Nghĩa tiếng Việt"
                      value={vocabMeaning}
                      onChange={(e) => setVocabMeaning(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddVocabItem}
                      className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                    >
                      + Thêm từ
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md"
                >
                  {isLoading ? 'Đang tạo...' : 'Lưu bài học mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
