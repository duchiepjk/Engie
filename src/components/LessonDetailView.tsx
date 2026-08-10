import React, { useState } from 'react';
import { Lesson, UserProgress } from '../types';
import { speakEnglishText } from '../lib/audio';
import { AiRoleplaySection } from './AiRoleplaySection';
import { 
  ArrowLeft, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  FileText, 
  Headphones, 
  HelpCircle,
  Play,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Check,
  Eye,
  EyeOff,
  Lock,
  Ear
} from 'lucide-react';

interface LessonDetailViewProps {
  lesson: Lesson;
  progress: UserProgress;
  onBack: () => void;
  onStartQuiz: () => void;
}

export const LessonDetailView: React.FC<LessonDetailViewProps> = ({
  lesson,
  progress,
  onBack,
  onStartQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'study' | 'quiz'>('study');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>(progress.savedVocab || []);
  const [showScript, setShowScript] = useState<boolean>(false);

  const isCompleted = progress.completedLessonIds.includes(lesson.id);

  const toggleSaveWord = (word: string) => {
    if (savedWords.includes(word)) {
      setSavedWords(savedWords.filter((w) => w !== word));
    } else {
      setSavedWords([...savedWords, word]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã hoàn thành
            </span>
          )}

          <button
            onClick={onStartQuiz}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Làm bài trắc nghiệm ({lesson.quizQuestions.length} câu)</span>
          </button>
        </div>
      </div>

      {/* Lesson Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8">
        <img
          src={lesson.imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'}
          alt={lesson.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase">
              Trình độ {lesson.level}
            </span>
            <span className="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold uppercase">
              {lesson.category === 'vocabulary' ? 'Từ vựng' : lesson.category === 'grammar' ? 'Ngữ pháp' : 'Luyện nghe'}
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-300" />
              {lesson.durationMinutes} phút
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold">{lesson.title}</h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">{lesson.description}</p>
        </div>
      </div>

      {/* Content Renderers based on Category */}
      
      {/* 1. VOCABULARY CATEGORY */}
      {lesson.category === 'vocabulary' && lesson.vocabularyItems && (
        <div className="space-y-8">
          
          {/* Flashcard Component */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Thẻ từ vựng thông minh (Flashcards)
              </h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Thẻ {currentFlashcardIndex + 1} / {lesson.vocabularyItems.length}
              </span>
            </div>

            {/* Main Interactive Flashcard Box */}
            <div className="relative min-h-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between items-center text-center">
              
              {/* Flashcard Header Controls */}
              <div className="w-full flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {lesson.vocabularyItems[currentFlashcardIndex].partOfSpeech}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakEnglishText(lesson.vocabularyItems[currentFlashcardIndex].word)}
                    className="p-2.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all"
                    title="Phát âm từ vựng tiếng Anh"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleSaveWord(lesson.vocabularyItems[currentFlashcardIndex].word)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      savedWords.includes(lesson.vocabularyItems[currentFlashcardIndex].word)
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title="Lưu từ vựng này"
                  >
                    <Bookmark className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Flashcard Core Word Details */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)} 
                className="my-6 cursor-pointer space-y-3 max-w-lg w-full"
              >
                {!isFlipped ? (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="text-3xl sm:text-4xl font-extrabold text-indigo-900 dark:text-indigo-300">
                      {lesson.vocabularyItems[currentFlashcardIndex].word}
                    </div>
                    <div className="text-sm font-mono text-slate-500 dark:text-slate-400">
                      {lesson.vocabularyItems[currentFlashcardIndex].phonetic}
                    </div>
                    <div className="pt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      Nhấn vào thẻ để xem nghĩa tiếng Việt & ví dụ
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                      {lesson.vocabularyItems[currentFlashcardIndex].meaning}
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-700 dark:text-slate-200 text-left space-y-1">
                      <div className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                        <span>"{lesson.vocabularyItems[currentFlashcardIndex].example}"</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakEnglishText(lesson.vocabularyItems[currentFlashcardIndex].example);
                          }}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 italic">
                        👉 {lesson.vocabularyItems[currentFlashcardIndex].exampleMeaning}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Prev / Next Card Nav Buttons */}
              <div className="w-full flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1));
                  }}
                  disabled={currentFlashcardIndex === 0}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 rounded-xl transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Từ trước
                </button>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentFlashcardIndex(
                      Math.min(lesson.vocabularyItems!.length - 1, currentFlashcardIndex + 1)
                    );
                  }}
                  disabled={currentFlashcardIndex === lesson.vocabularyItems.length - 1}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl transition-all flex items-center gap-1"
                >
                  Từ tiếp theo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Complete Word Table View */}
          <div className="space-y-3">
            <h3 className="text-md font-bold text-slate-900 dark:text-slate-100">Danh sách chi tiết {lesson.vocabularyItems.length} từ vựng</h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {lesson.vocabularyItems.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{item.word}</span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{item.phonetic}</span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                          {item.partOfSpeech}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{item.meaning}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Ví dụ:</span> {item.example} 
                        <span className="text-slate-400 dark:text-slate-500 font-normal"> ({item.exampleMeaning})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => speakEnglishText(item.word)}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <Volume2 className="w-4 h-4" />
                        Nghe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. GRAMMAR CATEGORY */}
      {lesson.category === 'grammar' && lesson.grammarSections && (
        <div className="space-y-6">
          
          {/* Teacher Classroom Header Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/50 border border-indigo-400/30 flex items-center justify-center shrink-0 text-2xl shadow-inner">
              👩‍🏫
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                  Lớp học cùng cô giáo
                </span>
                <span className="text-xs text-indigo-200 hidden sm:inline">• Bài giảng chuẩn sư phạm</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Nội dung bài giảng & Cấu trúc chi tiết
              </h2>
              <p className="text-xs text-indigo-200 leading-normal">
                Hãy cùng theo dõi từng phần bài giảng theo đúng lộ trình sư phạm bên dưới nhé!
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {lesson.grammarSections.map((sec, idx) => {
              const titleLower = sec.title.toLowerCase();
              let sectionBadge = { icon: '📘', color: 'indigo', label: 'Bài giảng' };
              
              if (titleLower.includes('mục tiêu')) {
                sectionBadge = { icon: '🎯', color: 'indigo', label: '1. Mục tiêu bài học' };
              } else if (titleLower.includes('khái niệm')) {
                sectionBadge = { icon: '💡', color: 'blue', label: '2. Khái niệm & bản chất' };
              } else if (titleLower.includes('dấu hiệu')) {
                sectionBadge = { icon: '🔑', color: 'amber', label: '3. Dấu hiệu nhận biết' };
              } else if (titleLower.includes('công thức')) {
                sectionBadge = { icon: '📐', color: 'purple', label: '4. Công thức & cách dùng' };
              } else if (titleLower.includes('ví dụ')) {
                sectionBadge = { icon: '🌟', color: 'emerald', label: '5. Ví dụ minh họa' };
              } else if (titleLower.includes('lưu ý')) {
                sectionBadge = { icon: '📌', color: 'rose', label: '6. Lưu ý nhỏ & mẹo' };
              }

              return (
                <div key={sec.id || idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  
                  {/* Section Title Header */}
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xl">{sectionBadge.icon}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {sec.title}
                    </h3>
                  </div>

                  {/* Section Explanation Text */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {sec.explanation}
                  </p>

                  {/* Formula Box if provided */}
                  {sec.formula && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-indigo-200/80 dark:border-indigo-900/60 rounded-xl font-mono text-xs text-indigo-950 dark:text-indigo-200 space-y-2">
                      <div className="font-bold uppercase tracking-wider text-[11px] text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Công thức & cấu trúc ghi nhớ:</span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold whitespace-pre-line leading-relaxed text-indigo-900 dark:text-indigo-200 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        {sec.formula}
                      </div>
                    </div>
                  )}

                  {/* Examples List if provided */}
                  {sec.examples && sec.examples.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        Ví dụ thực tế đời thường ({sec.examples.length} câu):
                      </h4>
                      <div className="space-y-2">
                        {sec.examples.map((ex, eIdx) => (
                          <div key={eIdx} className="p-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs space-y-1 flex items-start justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                                {ex.english}
                              </div>
                              <div className="text-slate-600 dark:text-slate-400 pl-3 italic">👉 {ex.vietnamese}</div>
                            </div>
                            <button
                              onClick={() => speakEnglishText(ex.english)}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shrink-0 transition-colors"
                              title="Phát âm câu ví dụ này"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LISTENING CATEGORY */}
      {lesson.category === 'listening' && lesson.listeningScript && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Luyện nghe bài hội thoại tiếng Anh
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => speakEnglishText(lesson.listeningScript!.fullText)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white shrink-0" />
                <span>Phát toàn bộ đoạn audio</span>
              </button>

              <button
                onClick={() => setShowScript(!showScript)}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border border-purple-200 dark:border-purple-800 shadow-2xs cursor-pointer"
              >
                {showScript ? (
                  <>
                    <EyeOff className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Ẩn transcript</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Hiển thị transcript</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{lesson.listeningScript.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chủ đề: {lesson.listeningScript.topic}</p>
              </div>

              {!showScript && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-full text-xs font-bold flex items-center gap-1 self-start sm:self-auto border border-purple-200 dark:border-purple-800">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  Script đang ẩn (Chế độ tập trung)
                </span>
              )}
            </div>

            {/* Conversation Script Breakdown or Focus Mode Banner */}
            {!showScript ? (
              <div className="p-6 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-purple-800 dark:text-purple-300 font-bold text-xs bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded-full">
                    <Ear className="w-3.5 h-3.5 text-purple-600" />
                    <span>Chế độ nghe tập trung</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                    Script hội thoại đang được che lại để giúp bạn tập trung hoàn toàn vào việc lắng nghe âm thanh và rèn luyện phản xạ nghe hiểu tự nhiên. Nhấn "Phát toàn bộ đoạn audio" để nghe, sau đó nhấn "Hiển thị transcript" nếu muốn đối soát lại văn bản.
                  </p>
                </div>
                <button
                  onClick={() => setShowScript(true)}
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-700 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>Hiển thị transcript ngay</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                {lesson.listeningScript.lines.map((line, lIdx) => (
                  <div key={lIdx} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2 hover:border-purple-300 dark:hover:border-purple-500 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 rounded-md">
                        {line.speaker}
                      </span>
                      <button
                        onClick={() => speakEnglishText(line.english)}
                        className="px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Nghe dòng này
                      </button>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{line.english}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">👉 {line.vietnamese}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Roleplay Interactive Section */}
          <AiRoleplaySection
            lessonTitle={lesson.title}
            topic={lesson.listeningScript.topic || lesson.title}
            userLevel={lesson.level}
            scriptLines={lesson.listeningScript.lines}
          />
        </div>
      )}

      {/* Bottom Floating Quiz Callout */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 to-blue-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Sẵn sàng kiểm tra kiến thức của bạn?</h3>
          <p className="text-xs text-indigo-200 mt-1">Làm bài trắc nghiệm ngay để tích lũy +110 XP và tăng chuỗi học Streak!</p>
        </div>
        <button
          onClick={onStartQuiz}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm shrink-0 whitespace-nowrap"
        >
          <Sparkles className="w-5 h-5 text-slate-950 shrink-0" />
          <span>Bắt đầu làm trắc nghiệm ({lesson.quizQuestions.length} câu)</span>
        </button>
      </div>

    </div>
  );
};
