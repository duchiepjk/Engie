import React, { useState } from 'react';
import { Lesson, UserProgress, CEFRLevel, LessonCategory } from '../types';
import { 
  Search, 
  BookOpen, 
  Headphones, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ArrowLeft,
  Filter,
  Sparkles,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  defaultCategory?: string | null;
  userLevel?: string;
}

interface MainCategoryCard {
  id: LessonCategory;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeText: string;
  accentColor: 'blue' | 'emerald' | 'purple';
  bgGradient: string;
  borderColor: string;
  buttonBg: string;
  features: string[];
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  progress,
  onSelectLesson,
  defaultCategory = null,
  userLevel = 'B1',
}) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(defaultCategory);
  // Default level filter to recommended user level
  const [selectedLevel, setSelectedLevel] = useState<string>('recommended');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Sub-filter for grammar category: 'all' | 'single' (12 tenses) | 'compare' (comparison/review)
  const [grammarTypeFilter, setGrammarTypeFilter] = useState<'all' | 'single' | 'compare'>('all');

  const currentUserLevel = userLevel || 'B1';

  // Config for 3 Main Parent Categories
  const mainCategories: MainCategoryCard[] = [
    {
      id: 'vocabulary',
      title: 'Từ vựng & flashcards',
      subtitle: 'Flashcard & Phiên âm IPA',
      description: 'Học từ vựng theo chủ đề với phương pháp lặp lại ngắt quãng',
      icon: BookOpen,
      badgeText: 'Từ vựng chủ đề',
      accentColor: 'blue',
      bgGradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'border-blue-200 dark:border-blue-800/60 hover:border-blue-500 dark:hover:border-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      features: ['Flashcard từ vựng', 'Phiên âm IPA chuẩn', 'Ví dụ & dịch nghĩa', 'Quiz trắc nghiệm']
    },
    {
      id: 'grammar',
      title: 'Ngữ pháp tiếng Anh',
      subtitle: '12 Thì & Chuyên đề chuẩn',
      description: 'Nắm vững 12 thì tiếng Anh cơ bản độc lập và các chuyên đề so sánh',
      icon: FileText,
      badgeText: 'Cấu trúc ngữ pháp',
      accentColor: 'emerald',
      bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      borderColor: 'border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-500 dark:hover:border-emerald-400',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      features: ['12 thì tiếng Anh độc lập', 'Chuyên đề so sánh & tổng hợp', 'Công thức & dấu hiệu', 'Bài tập trắc nghiệm']
    },
    {
      id: 'listening',
      title: 'Luyện nghe & nói',
      subtitle: 'Phản xạ giao tiếp tự nhiên',
      description: 'Luyện phản xạ giao tiếp với các bài học âm thanh',
      icon: Headphones,
      badgeText: 'Luyện nghe & phát âm',
      accentColor: 'purple',
      bgGradient: 'from-purple-500/10 via-violet-500/5 to-transparent',
      borderColor: 'border-purple-200 dark:border-purple-800/60 hover:border-purple-500 dark:hover:border-purple-400',
      buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white',
      features: ['Giọng đọc bản ngữ', 'Luyện hội thoại', 'Phản xạ tiếng Anh', 'Đa dạng ngữ cảnh']
    }
  ];

  // Active Category details when inside Child View
  const activeCategoryInfo = mainCategories.find(c => c.id === selectedMainCategory);

  // Helper to determine if a grammar lesson is a comparison/synthesis lesson
  const isComparisonLesson = (lesson: Lesson) => {
    return (
      lesson.title.includes('[Tổng hợp') ||
      lesson.title.includes('vs') ||
      lesson.title.toLowerCase().includes('so sánh') ||
      lesson.title.toLowerCase().includes('phân biệt') ||
      lesson.title.toLowerCase().includes('mastery')
    );
  };

  // Filter lessons for the selected Main Category
  const filteredCategoryLessons = lessons.filter((lesson) => {
    if (!selectedMainCategory) return false;
    const matchesCategory = lesson.category === selectedMainCategory;
    
    let matchesLevel = true;
    if (selectedLevel === 'recommended') {
      matchesLevel = lesson.level === currentUserLevel;
    } else if (selectedLevel !== 'all') {
      matchesLevel = lesson.level === selectedLevel;
    }

    const matchesSearch =
      searchQuery === '' ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesGrammarType = true;
    if (selectedMainCategory === 'grammar') {
      const isComp = isComparisonLesson(lesson);
      if (grammarTypeFilter === 'single') {
        matchesGrammarType = !isComp;
      } else if (grammarTypeFilter === 'compare') {
        matchesGrammarType = isComp;
      }
    }

    return matchesCategory && matchesLevel && matchesSearch && matchesGrammarType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ==================== TẦNG CHA: MÀN HÌNH CHÍNH DANH MỤC LỚN ==================== */}
      {!selectedMainCategory ? (
        <div className="space-y-6">
          {/* Main Title & Description */}
          <div className="text-center max-w-2xl mx-auto space-y-2 py-2 sm:py-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Lộ trình học tập toàn diện
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Thư viện bài học tiếng Anh
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Chọn danh mục bạn muốn nâng cao hôm nay để khám phá danh sách các bài học chuyên sâu theo chuẩn CEFR
            </p>
          </div>

          {/* 3 Main Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mainCategories.map((category) => {
              const CategoryIcon = category.icon;
              const categoryLessonCount = lessons.filter(l => l.category === category.id).length;

              return (
                <div
                  key={category.id}
                  onClick={() => {
                    setSelectedMainCategory(category.id);
                    setSearchQuery('');
                    setSelectedLevel('all');
                  }}
                  className={`relative group bg-white dark:bg-slate-900 rounded-3xl p-6 border ${category.borderColor} shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden`}
                >
                  {/* Subtle Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                  <div className="relative z-10 space-y-5">
                    {/* Top Row: Icon & Lesson Count Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3.5 rounded-2xl ${
                        category.accentColor === 'blue'
                          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                          : category.accentColor === 'emerald'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                          : 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400'
                      }`}>
                        <CategoryIcon className="w-7 h-7" />
                      </div>

                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {categoryLessonCount} bài học
                      </span>
                    </div>

                    {/* Category Title & Description */}
                    <div>
                      <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
                        category.accentColor === 'blue'
                          ? 'text-blue-600 dark:text-blue-400'
                          : category.accentColor === 'emerald'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-purple-600 dark:text-purple-400'
                      }`}>
                        {category.subtitle}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                        {category.description}
                      </p>
                    </div>

                    {/* Features Bullet List */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      {category.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                            category.accentColor === 'blue'
                              ? 'text-blue-500'
                              : category.accentColor === 'emerald'
                              ? 'text-emerald-500'
                              : 'text-purple-500'
                          }`} />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Button Action */}
                  <div className="relative z-10 pt-6 mt-4">
                    <button
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-md ${category.buttonBg}`}
                    >
                      <span>Khám phá bài học</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================== TẦNG CON: MÀN HÌNH DANH SÁCH BÀI HỌC THEO DANH MỤC ==================== */
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          
          {/* Top Back Button & Active Category Header */}
          <div className="space-y-4">
            <button
              onClick={() => setSelectedMainCategory(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-xs hover:shadow-md group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>← Quay lại danh mục chính</span>
            </button>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {activeCategoryInfo && (
                  <div className={`p-3.5 rounded-2xl shrink-0 ${
                    activeCategoryInfo.accentColor === 'blue'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                      : activeCategoryInfo.accentColor === 'emerald'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                      : 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400'
                  }`}>
                    {React.createElement(activeCategoryInfo.icon, { className: 'w-6 h-6' })}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {activeCategoryInfo?.title || 'Danh mục bài học'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeCategoryInfo?.description} ({filteredCategoryLessons.length} bài học)
                  </p>
                </div>
              </div>

              {/* Search & Level Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Search Input */}
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Tìm trong danh mục..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Level Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="recommended">🎯 Phù hợp nhất ({currentUserLevel})</option>
                    <option value="all">Tất cả trình độ (A1-C1)</option>
                    <option value="A1">A1 - Sơ cấp cơ bản</option>
                    <option value="A2">A2 - Sơ cấp</option>
                    <option value="B1">B1 - Trung cấp cơ bản</option>
                    <option value="B2">B2 - Trung cấp</option>
                    <option value="C1">C1 - Cao cấp</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personalized Level Recommendation Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl text-xs">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  {selectedLevel === 'recommended' || selectedLevel === currentUserLevel
                    ? `Đang hiển thị bài học phù hợp với trình độ [${currentUserLevel}] của bạn`
                    : selectedLevel === 'all'
                    ? `Đang hiển thị tất cả bài học (Trình độ cá nhân của bạn: ${currentUserLevel})`
                    : `Đang xem bài học thuộc trình độ ${selectedLevel}`}
                </span>
              </div>
              {selectedLevel !== 'all' && (
                <button
                  onClick={() => setSelectedLevel('all')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline underline-offset-2 shrink-0"
                >
                  Xem tất cả trình độ
                </button>
              )}
            </div>

            {/* Sub-category Filter Tabs for Grammar */}
            {selectedMainCategory === 'grammar' && (
              <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Phân loại ngữ pháp:</span>
                <button
                  onClick={() => setGrammarTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    grammarTypeFilter === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Tất cả bài học ngữ pháp
                </button>
                <button
                  onClick={() => setGrammarTypeFilter('single')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    grammarTypeFilter === 'single'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  12 thì tiếng Anh (Bài học độc lập)
                </button>
                <button
                  onClick={() => setGrammarTypeFilter('compare')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    grammarTypeFilter === 'compare'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Chuyên đề so sánh & phân biệt
                </button>
              </div>
            )}
          </div>

          {/* Child Category Lesson Cards Grid */}
          {filteredCategoryLessons.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Chưa có bài học phù hợp cho bộ lọc này
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {selectedLevel === 'recommended'
                  ? `Chưa có bài học trình độ ${currentUserLevel} trong danh mục này. Thử bấm "Xem tất cả trình độ" bên dưới!`
                  : 'Thử thay đổi từ khóa tìm kiếm hoặc chọn lại cấp độ khác.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLevel('all');
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Xem tất cả trình độ (A1-C1)
                </button>
                <button
                  onClick={() => setSelectedMainCategory(null)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Quay lại danh mục chính
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCategoryLessons.map((lesson) => {
                const isCompleted = progress.completedLessonIds.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer flex flex-col group"
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
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${
                            lesson.category === 'vocabulary'
                              ? 'text-blue-600 dark:text-blue-400'
                              : lesson.category === 'grammar'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-purple-600 dark:text-purple-400'
                          }`}>
                            {lesson.category === 'vocabulary' ? 'Từ vựng' : lesson.category === 'grammar' ? 'Ngữ pháp' : 'Luyện nghe'}
                          </span>

                          {lesson.category === 'grammar' && (
                            isComparisonLesson(lesson) ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                                Chuyên đề so sánh
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                Thì độc lập
                              </span>
                            )
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {lesson.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <span>{isCompleted ? 'Ôn tập lại' : 'Học bài này'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

