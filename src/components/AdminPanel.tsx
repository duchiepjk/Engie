import React, { useState, useEffect } from 'react';
import { Lesson, LessonCategory, CEFRLevel, QuizQuestion, VocabularyItem, User } from '../types';
import { createLesson, updateLesson, deleteLesson, getAllUsers, updateUserRole, generateLessonContentAI } from '../lib/api';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3,
  BookOpen, 
  FileText, 
  Users, 
  Sparkles,
  Check,
  AlertCircle,
  Search,
  LayoutDashboard,
  Layers,
  Award,
  Flame,
  HelpCircle,
  Loader2,
  X,
  UserCheck,
  UserX
} from 'lucide-react';

interface AdminPanelProps {
  lessons: Lesson[];
  onRefreshLessons: () => void;
  currentUser?: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ lessons, onRefreshLessons, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'users'>('overview');
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleUpdatingId, setUserRoleUpdatingId] = useState<string | null>(null);

  // Lessons management state
  const [lessonSearchQuery, setLessonSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Lesson Modal State (for both Add & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LessonCategory>('vocabulary');
  const [level, setLevel] = useState<CEFRLevel>('B1');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  
  // Vocabulary input helpers
  const [vocabWord, setVocabWord] = useState('');
  const [vocabPhonetic, setVocabPhonetic] = useState('');
  const [vocabPartOfSpeech, setVocabPartOfSpeech] = useState('noun');
  const [vocabMeaning, setVocabMeaning] = useState('');
  const [vocabExample, setVocabExample] = useState('');
  const [vocabExampleMeaning, setVocabExampleMeaning] = useState('');
  const [vocabItems, setVocabItems] = useState<VocabularyItem[]>([]);

  // Quiz input helpers
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOption1, setQuizOption1] = useState('');
  const [quizOption2, setQuizOption2] = useState('');
  const [quizOption3, setQuizOption3] = useState('');
  const [quizOption4, setQuizOption4] = useState('');
  const [quizCorrect, setQuizCorrect] = useState('');
  const [quizExplanation, setQuizExplanation] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // AI Content Generator State
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [aiLevelInput, setAiLevelInput] = useState<CEFRLevel>('B1');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Users
  const loadUsersData = async () => {
    setIsUsersLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  // Compute Statistics
  const totalStudents = users.filter((u) => u.role === 'user').length || users.length;
  const totalLessons = lessons.length;
  const totalVocabulary = lessons.reduce((acc, lesson) => acc + (lesson.vocabularyItems?.length || 0), 0);
  const totalQuizQuestions = lessons.reduce((acc, lesson) => acc + (lesson.quizQuestions?.length || 0), 0);

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingLessonId(null);
    setTitle('');
    setCategory('vocabulary');
    setLevel('B1');
    setDescription('');
    setDurationMinutes(15);
    setVocabItems([]);
    setQuizQuestions([]);
    setAiTopicInput('');
    setAiLevelInput('B1');
    setAiNotice(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setTitle(lesson.title);
    setCategory(lesson.category);
    setLevel(lesson.level);
    setDescription(lesson.description);
    setDurationMinutes(lesson.durationMinutes);
    setVocabItems(lesson.vocabularyItems || []);
    setQuizQuestions(lesson.quizQuestions || []);
    setAiTopicInput('');
    setAiLevelInput(lesson.level || 'B1');
    setAiNotice(null);
    setIsModalOpen(true);
  };

  // AI Automatic Lesson Generator Handler
  const handleGenerateLessonAI = async () => {
    if (!aiTopicInput || !aiTopicInput.trim()) {
      setAiNotice({ 
        type: 'error', 
        text: 'Vui lòng nhập chủ đề bài học (Ví dụ: Du lịch, Công việc, Giao tiếp...)' 
      });
      return;
    }

    setIsAiGenerating(true);
    setAiNotice(null);

    try {
      const result = await generateLessonContentAI(aiTopicInput.trim(), aiLevelInput, category);

      if (result.title) setTitle(result.title);
      if (result.description) setDescription(result.description);
      setLevel(aiLevelInput);

      let newVocabCount = 0;
      let newQuizCount = 0;

      if (result.vocabularyItems && result.vocabularyItems.length > 0) {
        const formattedVocab: VocabularyItem[] = result.vocabularyItems.map((item, idx) => ({
          id: `v-ai-${Date.now()}-${idx}`,
          word: item.word || 'Word',
          phonetic: item.phonetic || '/.../',
          partOfSpeech: item.partOfSpeech || 'noun',
          meaning: item.meaning || '',
          example: item.example || '',
          exampleMeaning: item.exampleMeaning || '',
        }));
        setVocabItems(formattedVocab);
        newVocabCount = formattedVocab.length;
      }

      if (result.quizQuestions && result.quizQuestions.length > 0) {
        const formattedQuiz: QuizQuestion[] = result.quizQuestions.map((q, idx) => ({
          id: `q-ai-${Date.now()}-${idx}`,
          type: q.type || 'multiple-choice',
          question: q.question || '',
          options: q.options && q.options.length > 0 ? q.options : ['A', 'B', 'C', 'D'],
          correctAnswer: q.correctAnswer || (q.options ? q.options[0] : ''),
          explanation: q.explanation || 'Giải thích từ AI',
        }));
        setQuizQuestions(formattedQuiz);
        newQuizCount = formattedQuiz.length;
      }

      const categoryLabel = category === 'vocabulary' ? 'Từ vựng' : category === 'grammar' ? 'Ngữ pháp' : 'Luyện nghe';
      setAiNotice({
        type: 'success',
        text: `✨ AI đã tự động sinh bài học [${categoryLabel}] với ${newVocabCount} từ vựng và ${newQuizCount} câu hỏi Quiz cho chủ đề "${aiTopicInput.trim()}". Kiểm tra thông tin bên dưới và bấm "Lưu bài học"!`,
      });
    } catch (err: any) {
      console.error('AI Lesson Generation error:', err);
      setAiNotice({
        type: 'error',
        text: err.message || 'Không thể sinh bài học bằng AI. Vui lòng thử lại sau.',
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Add Vocabulary Item to local modal state
  const handleAddVocabItem = () => {
    if (!vocabWord || !vocabMeaning) return;
    const newItem: VocabularyItem = {
      id: `v-${Date.now()}`,
      word: vocabWord.trim(),
      phonetic: vocabPhonetic.trim() || '/.../',
      partOfSpeech: vocabPartOfSpeech || 'noun',
      meaning: vocabMeaning.trim(),
      example: vocabExample.trim() || `${vocabWord.trim()} is useful.`,
      exampleMeaning: vocabExampleMeaning.trim() || 'Ví dụ minh họa.',
    };
    setVocabItems([...vocabItems, newItem]);
    
    // Reset helper inputs
    setVocabWord('');
    setVocabPhonetic('');
    setVocabMeaning('');
    setVocabExample('');
    setVocabExampleMeaning('');
  };

  const handleRemoveVocabItem = (id: string) => {
    setVocabItems(vocabItems.filter((item) => item.id !== id));
  };

  // Add Quiz Question to local modal state
  const handleAddQuizQuestion = () => {
    if (!quizQuestion || !quizCorrect) return;
    const options = [quizOption1, quizOption2, quizOption3, quizOption4].filter((opt) => opt.trim().length > 0);
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: options.length > 0 ? 'multiple-choice' : 'fill-blank',
      question: quizQuestion.trim(),
      options: options.length > 0 ? options : undefined,
      correctAnswer: quizCorrect.trim(),
      explanation: quizExplanation.trim() || `Đáp án đúng là "${quizCorrect.trim()}".`,
    };
    setQuizQuestions([...quizQuestions, newQuestion]);

    // Reset quiz inputs
    setQuizQuestion('');
    setQuizOption1('');
    setQuizOption2('');
    setQuizOption3('');
    setQuizOption4('');
    setQuizCorrect('');
    setQuizExplanation('');
  };

  const handleRemoveQuizQuestion = (id: string) => {
    setQuizQuestions(quizQuestions.filter((q) => q.id !== id));
  };

  // Submit Save Lesson (Create or Update)
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !title.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề bài học!' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const lessonData: Partial<Lesson> = {
      title: title.trim(),
      category,
      level,
      description: description.trim() || 'Bài học tiếng Anh mới',
      durationMinutes: Number(durationMinutes) || 15,
      vocabularyItems: category === 'vocabulary' ? vocabItems : (vocabItems.length > 0 ? vocabItems : undefined),
      quizQuestions: quizQuestions.length > 0 ? quizQuestions : [
        {
          id: `q-default-${Date.now()}`,
          type: 'multiple-choice',
          question: `Câu hỏi ôn tập kiến thức cho bài: ${title.trim()}?`,
          options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
          correctAnswer: 'Lựa chọn A',
          explanation: 'Đáp án A là đáp án chính xác.',
        }
      ],
    };

    try {
      if (editingLessonId) {
        await updateLesson(editingLessonId, lessonData);
        setMessage({ type: 'success', text: 'Cập nhật bài học & bộ Flashcard thành công!' });
      } else {
        await createLesson(lessonData);
        setMessage({ type: 'success', text: 'Thêm mới bài học & bộ Flashcard thành công!' });
      }

      // Tự động đóng modal và re-fetch danh sách bài học
      setIsModalOpen(false);
      if (onRefreshLessons) {
        await onRefreshLessons();
      }
    } catch (err: any) {
      console.error('Lỗi khi lưu bài học (handleSaveLesson):', err);
      const errorText = err?.message || 'Có lỗi xảy ra khi lưu bài học vào Firestore/Server. Vui lòng kiểm tra lại!';
      setMessage({ type: 'error', text: errorText });
    } finally {
      // Đảm bảo luôn tắt trạng thái xoay vòng của nút Submit
      setIsLoading(false);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (id: string, lessonTitle: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài học "${lessonTitle}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await deleteLesson(id);
      setMessage({ type: 'success', text: `Đã xóa bài học "${lessonTitle}" thành công!` });
      onRefreshLessons();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi xóa bài học' });
    }
  };

  // Change User Role (User <-> Admin)
  const handleToggleUserRole = async (targetUser: User) => {
    const newRole: 'user' | 'admin' = targetUser.role === 'admin' ? 'user' : 'admin';
    const actionText = newRole === 'admin' ? 'nâng cấp thành Quản trị viên (Admin)' : 'chuyển về Học viên (User)';

    if (!window.confirm(`Xác nhận ${actionText} cho người dùng ${targetUser.name} (${targetUser.email})?`)) return;

    setUserRoleUpdatingId(targetUser.id);
    try {
      await updateUserRole(targetUser.id, newRole);
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );

      setMessage({ type: 'success', text: `Đã cập nhật vai trò cho ${targetUser.name} thành "${newRole.toUpperCase()}"!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi cập nhật vai trò người dùng' });
    } finally {
      setUserRoleUpdatingId(null);
    }
  };

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(lessonSearchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter users
  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Admin Header Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-300 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">Trang quản trị hệ thống (Admin)</h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full">
                Role: Admin
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Quản lý phân quyền học viên, quản trị kho từ vựng/flashcards và theo dõi tổng quan dữ liệu hệ thống
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 sm:px-5 py-2.5 bg-white text-purple-900 font-bold rounded-xl shadow-lg hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 whitespace-nowrap active:scale-95"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Thêm bài học & Flashcard</span>
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tổng quan dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'lessons'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Quản lý flashcards & bài học ({lessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản lý người dùng ({users.length})</span>
        </button>
      </div>

      {/* ----------------- TAB 1: OVERVIEW DASHBOARD ----------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Students */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng số học viên</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {totalStudents} <span className="text-xs font-medium text-slate-400">người dùng</span>
                </div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 inline-block">
                  {users.filter(u => u.role === 'admin').length} Admin • {users.filter(u => u.role === 'user').length} Học viên
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Total Flashcards / Vocab */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng số Từ vựng / Flashcard</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {totalVocabulary} <span className="text-xs font-medium text-slate-400">từ</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
                  Phân bổ chuẩn CEFR (A1-C1)
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Total Courses / Lessons */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng khóa học / Bài học</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {totalLessons} <span className="text-xs font-medium text-slate-400">bài học</span>
                </div>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1 inline-block">
                  Từ vựng, Ngữ pháp, Luyện nghe
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Total Quiz Questions */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đề trắc nghiệm Quiz</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {totalQuizQuestions} <span className="text-xs font-medium text-slate-400">câu hỏi</span>
                </div>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 inline-block">
                  Chấm điểm tự động & giải thích
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <HelpCircle className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Detailed Statistics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Phân bổ Bài học theo Phân loại
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-blue-700 dark:text-blue-400">Từ vựng & Flashcards</span>
                    <span>{lessons.filter(l => l.category === 'vocabulary').length} bài</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${(lessons.filter(l => l.category === 'vocabulary').length / Math.max(lessons.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-emerald-700 dark:text-emerald-400">Ngữ pháp (Grammar)</span>
                    <span>{lessons.filter(l => l.category === 'grammar').length} bài</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${(lessons.filter(l => l.category === 'grammar').length / Math.max(lessons.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-purple-700 dark:text-purple-400">Luyện nghe (Listening)</span>
                    <span>{lessons.filter(l => l.category === 'listening').length} bài</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full" 
                      style={{ width: `${(lessons.filter(l => l.category === 'listening').length / Math.max(lessons.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Admin Actions & RBAC Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Cấu hình Phân quyền (RBAC) & Bảo mật
              </h3>
              
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">1. Phân quyền truy cập tuyến đường /admin</div>
                  <p>Mỗi tài khoản lưu trong Firestore có thuộc tính <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-900 text-purple-700 dark:text-purple-300 rounded">role: 'user' | 'admin'</code>. Chỉ tài khoản Admin mới nhìn thấy nút quản trị và truy cập được vào màn hình này.</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">2. Đồng bộ Firestore & Realtime Engine</div>
                  <p>Mọi thao tác thay đổi vai trò người dùng, thêm/sửa/xóa Flashcard được lưu trữ đồng bộ trực tiếp lên Firebase Firestore Database.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- TAB 2: FLASHCARDS & LESSONS MANAGEMENT ----------------- */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          
          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài học hoặc từ vựng..."
                value={lessonSearchQuery}
                onChange={(e) => setLessonSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="all">Tất cả phân loại</option>
                <option value="vocabulary">Từ vựng & Flashcard</option>
                <option value="grammar">Ngữ pháp</option>
                <option value="listening">Luyện nghe</option>
              </select>

              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm bài học mới</span>
              </button>
            </div>
          </div>

          {/* Lessons List Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Danh sách bài học & Bộ Flashcard ({filteredLessons.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLessons.map((lesson) => (
                <div key={lesson.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      lesson.category === 'vocabulary'
                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                        : lesson.category === 'grammar'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                        : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                    }`}>
                      {lesson.level}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{lesson.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {lesson.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{lesson.description}</p>
                      
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>🎴 {lesson.vocabularyItems?.length || 0} thẻ Flashcard từ vựng</span>
                        <span>•</span>
                        <span>❓ {lesson.quizQuestions?.length || 0} câu trắc nghiệm</span>
                        <span>•</span>
                        <span>⏱️ {lesson.durationMinutes} phút</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEditModal(lesson)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Sửa
                    </button>

                    <button
                      onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}

              {filteredLessons.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không tìm thấy bài học phù hợp với từ khóa tìm kiếm.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ----------------- TAB 3: USER MANAGEMENT ----------------- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* User Search Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm người dùng theo tên hoặc email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              onClick={loadUsersData}
              disabled={isUsersLoading}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
            >
              {isUsersLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Tải lại danh sách'}
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Danh sách người dùng hệ thống ({filteredUsers.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Người dùng</th>
                    <th className="px-4 py-3">Vai trò (Role)</th>
                    <th className="px-4 py-3">Cấp độ CEFR</th>
                    <th className="px-4 py-3">Điểm XP / Streak</th>
                    <th className="px-4 py-3 text-right">Thao tác Phân quyền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            Admin (Quản trị)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                            Học viên (User)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-semibold">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md">
                          {u.level}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{u.xp} XP</span>
                          <span>•</span>
                          <span className="text-amber-600 dark:text-amber-400">{u.streak} ngày</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleUserRole(u)}
                          disabled={userRoleUpdatingId === u.id}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 ${
                            u.role === 'admin'
                              ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                          }`}
                        >
                          {userRoleUpdatingId === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : u.role === 'admin' ? (
                            <>
                              <UserX className="w-3.5 h-3.5 text-slate-500" />
                              Chuyển về Học viên
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Nâng lên Admin
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                        Chưa có người dùng nào trùng khớp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ----------------- MODAL: CREATE / EDIT LESSON & FLASHCARDS ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-300" />
                {editingLessonId ? 'Chỉnh sửa bài học & Flashcard' : 'Tạo mới bài học & bộ Flashcard'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveLesson} className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* AI Automatic Content Generator Box */}
              <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-purple-200 dark:border-purple-800/60 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-600 text-white rounded-xl shadow-xs">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                        Tạo nội dung bài học tự động bằng AI
                        <span className="px-2 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300 font-extrabold rounded-full border border-purple-300 dark:border-purple-700">
                          Gemini AI
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Nhập chủ đề và chọn cấp độ, Gemini AI sẽ tự động sinh tiêu đề, từ vựng kèm phiên âm IPA, ví dụ & bộ câu hỏi Quiz trắc nghiệm.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nhập chủ đề bài học
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Du lịch, Công việc, Giao tiếp, Mua sắm..."
                      value={aiTopicInput}
                      onChange={(e) => setAiTopicInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cấp độ (CEFR)
                    </label>
                    <select
                      value={aiLevelInput}
                      onChange={(e) => setAiLevelInput(e.target.value as CEFRLevel)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                    >
                      <option value="A1">A1 (Cơ bản)</option>
                      <option value="A2">A2 (Sơ cấp)</option>
                      <option value="B1">B1 (Trung cấp)</option>
                      <option value="B2">B2 (Trung cao)</option>
                      <option value="C1">C1 (Cao cấp)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 flex items-end">
                    <button
                      type="button"
                      disabled={isAiGenerating}
                      onClick={handleGenerateLessonAI}
                      className="w-full px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 text-xs h-[38px] disabled:opacity-60 shrink-0"
                    >
                      {isAiGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                          <span>Đang tạo...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span>Sinh từ vựng bằng AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {aiNotice && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      aiNotice.type === 'success'
                        ? 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-100/90 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {aiNotice.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <span>{aiNotice.text}</span>
                  </div>
                )}
              </div>

              {/* Basic Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[11px] tracking-wider text-purple-600">
                  Thông tin cơ bản
                </h4>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tiêu đề bài học</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Từ vựng giao tiếp văn phòng & công việc"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phân loại</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as LessonCategory)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    >
                      <option value="vocabulary">Từ vựng & Flashcard</option>
                      <option value="grammar">Ngữ pháp</option>
                      <option value="listening">Luyện nghe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Trình độ (CEFR)</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    >
                      <option value="A1">A1 (Cơ bản)</option>
                      <option value="A2">A2 (Sơ cấp)</option>
                      <option value="B1">B1 (Trung cấp)</option>
                      <option value="B2">B2 (Trung cao)</option>
                      <option value="C1">C1 (Cao cấp)</option>
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
                    placeholder="Tóm tắt ngắn gọn nội dung và mục tiêu bài học..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl"
                  />
                </div>
              </div>

              {/* Flashcards & Vocabulary Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Danh sách Từ vựng Flashcards ({vocabItems.length} từ)
                  </h4>
                  <span className="text-[11px] text-slate-400">Xem và sửa thẻ ghi nhớ</span>
                </div>

                {/* List of current vocab items */}
                {vocabItems.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                    {vocabItems.map((v) => (
                      <div key={v.id} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{v.word} <span className="text-[10px] text-slate-400 font-normal">{v.phonetic}</span></div>
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{v.meaning}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVocabItem(v.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Helper Form to Add Word */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Thêm thẻ từ vựng mới vào bài:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Từ tiếng Anh (e.g. Collaborate)"
                      value={vocabWord}
                      onChange={(e) => setVocabWord(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Phiên âm (e.g. /kəˈlæb.ə.reɪt/)"
                      value={vocabPhonetic}
                      onChange={(e) => setVocabPhonetic(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Nghĩa tiếng Việt (e.g. Hợp tác)"
                      value={vocabMeaning}
                      onChange={(e) => setVocabMeaning(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Câu ví dụ tiếng Anh (e.g. We collaborate on this project.)"
                      value={vocabExample}
                      onChange={(e) => setVocabExample(e.target.value)}
                      className="grow px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddVocabItem}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shrink-0"
                    >
                      + Thêm từ
                    </button>
                  </div>
                </div>
              </div>

              {/* Quiz Questions Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    Câu hỏi ôn tập Quiz ({quizQuestions.length} câu)
                  </h4>
                </div>

                {quizQuestions.length > 0 && (
                  <div className="space-y-2 my-2">
                    {quizQuestions.map((q, idx) => (
                      <div key={q.id} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            Câu {idx + 1}: {q.question}
                          </div>
                          <div className="text-[11px] text-amber-600 dark:text-amber-400">
                            Đáp án đúng: {q.correctAnswer}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuizQuestion(q.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Helper Form to Add Quiz Question */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Thêm câu hỏi Quiz mới:</span>
                  <input
                    type="text"
                    placeholder="Nội dung câu hỏi tiếng Anh..."
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Lựa chọn 1"
                      value={quizOption1}
                      onChange={(e) => setQuizOption1(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Lựa chọn 2"
                      value={quizOption2}
                      onChange={(e) => setQuizOption2(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Lựa chọn 3"
                      value={quizOption3}
                      onChange={(e) => setQuizOption3(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Lựa chọn 4"
                      value={quizOption4}
                      onChange={(e) => setQuizOption4(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập chính xác Đáp án đúng..."
                      value={quizCorrect}
                      onChange={(e) => setQuizCorrect(e.target.value)}
                      className="grow px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddQuizQuestion}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0"
                    >
                      + Thêm câu hỏi
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingLessonId ? 'Lưu cập nhật bài học' : 'Tạo mới bài học'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
