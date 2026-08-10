import React, { useState, useEffect } from 'react';
import { sendRoleplayMessage } from '../lib/api';
import { speakEnglishText } from '../lib/audio';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Sparkles, 
  RotateCw, 
  User, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Award,
  BookOpen,
  Languages
} from 'lucide-react';

interface RoleplayMessage {
  id: string;
  role: 'ai' | 'user';
  speakerName: string;
  english: string;
  vietnamese?: string;
  evaluation?: {
    score?: string;
    feedback?: string;
    grammarTip?: string;
    pronunciationTip?: string;
  };
}

interface RoleplayMessageBubbleProps {
  msg: RoleplayMessage;
}

const RoleplayMessageBubble: React.FC<RoleplayMessageBubbleProps> = ({ msg }) => {
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  return (
    <div
      className={`flex flex-col space-y-2 ${
        msg.role === 'user' ? 'items-end' : 'items-start'
      }`}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
        {msg.role === 'ai' ? (
          <>
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>{msg.speakerName} (AI)</span>
          </>
        ) : (
          <>
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>{msg.speakerName} (Bạn)</span>
          </>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-2xl rounded-2xl p-4 space-y-2.5 shadow-2xs ${
          msg.role === 'user'
            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm sm:text-base font-semibold leading-relaxed">{msg.english}</p>
          <button
            onClick={() => speakEnglishText(msg.english)}
            className={`p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer ${
              msg.role === 'user'
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700'
            }`}
            title="Phát âm câu này"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Vietnamese Translation - Default Hidden */}
        {msg.vietnamese && (
          <div className="space-y-1">
            {showTranslation ? (
              <div
                className={`text-xs sm:text-sm italic pt-2.5 pb-1 px-3 border-t rounded-xl animate-in fade-in slide-in-from-top-1 duration-200 ${
                  msg.role === 'user'
                    ? 'border-white/20 bg-white/10 text-indigo-100'
                    : 'border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 not-italic opacity-80 flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  <span>Bản dịch:</span>
                </div>
                <p className="leading-relaxed">{msg.vietnamese}</p>
              </div>
            ) : null}

            {/* Toggle Button */}
            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  msg.role === 'user'
                    ? 'text-indigo-100 hover:bg-white/10'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <Languages className="w-3 h-3" />
                <span>{showTranslation ? 'Ẩn bản dịch' : 'Xem bản dịch'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Card for User Turn */}
      {msg.role === 'user' && msg.evaluation && (
        <div className="max-w-xl bg-white dark:bg-slate-800/90 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-3.5 space-y-2 shadow-2xs text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" />
              Đánh giá phản xạ: {msg.evaluation.score || '8/10'}
            </span>
            <span className="text-[10px] text-slate-400">Gemini AI nhận xét</span>
          </div>

          {msg.evaluation.feedback && (
            <p className="text-slate-700 dark:text-slate-300 leading-normal">
              {msg.evaluation.feedback}
            </p>
          )}

          {msg.evaluation.grammarTip && (
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/40 font-medium">
              💡 <strong>Gợi ý ngữ pháp:</strong> {msg.evaluation.grammarTip}
            </div>
          )}

          {msg.evaluation.pronunciationTip && (
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-900 dark:text-indigo-200 border border-indigo-200/60 dark:border-indigo-900/40 font-medium">
              🗣️ <strong>Gợi ý phát âm:</strong> {msg.evaluation.pronunciationTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface AiRoleplaySectionProps {
  lessonTitle: string;
  topic: string;
  userLevel: string;
  scriptLines: { speaker: string; english: string; vietnamese: string }[];
}

export const AiRoleplaySection: React.FC<AiRoleplaySectionProps> = ({
  lessonTitle,
  topic,
  userLevel,
  scriptLines,
}) => {
  // Extract unique speaker names from script if available
  const uniqueSpeakers = Array.from(new Set(scriptLines.map((l) => l.speaker)));
  const defaultAiRole = uniqueSpeakers[0] || 'Người hỏi / Phỏng vấn';
  const defaultUserRole = uniqueSpeakers[1] || 'Người trả lời / Ứng viên';

  const [aiRole, setAiRole] = useState<string>(defaultAiRole);
  const [userRole, setUserRole] = useState<string>(defaultUserRole);

  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize conversation with the first line from script if available
  useEffect(() => {
    initConversation();
  }, [lessonTitle, topic]);

  const initConversation = () => {
    if (scriptLines && scriptLines.length > 0) {
      const firstLine = scriptLines[0];
      setMessages([
        {
          id: `msg-0`,
          role: 'ai',
          speakerName: firstLine.speaker || defaultAiRole,
          english: firstLine.english,
          vietnamese: firstLine.vietnamese,
        },
      ]);
    } else {
      setMessages([
        {
          id: `msg-0`,
          role: 'ai',
          speakerName: defaultAiRole,
          english: `Hello! Let's practice speaking about ${topic}. How are you today?`,
          vietnamese: `Xin chào! Chúng ta hãy cùng thực hành nói về chủ đề ${topic}. Hôm nay bạn thế nào?`,
        },
      ]);
    }
    setUserInput('');
    setError(null);
  };

  const handleStartSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ micro nhận diện giọng nói. Vui lòng nhập văn bản tiếng Anh bằng bàn phím.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setUserInput(transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'no-speech') {
          setError('Không nghe thấy giọng nói. Vui lòng thử nói rõ ràng hơn.');
        } else if (event.error === 'not-allowed') {
          setError('Trình duyệt chưa được cấp quyền truy cập micro.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition error:', err);
      setIsRecording(false);
      setError('Lỗi khi mở micro. Bạn có thể gõ câu trả lời bằng bàn phím.');
    }
  };

  const handleSendMessage = async () => {
    const textToSend = userInput.trim();
    if (!textToSend || isLoading) return;

    setUserInput('');
    setError(null);

    // 1. Append user message to state
    const userMsgObj: RoleplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      speakerName: userRole,
      english: textToSend,
    };

    const updatedHistory = [...messages, userMsgObj];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // 2. Call API
      const conversationHistoryForApi = updatedHistory.map((m) => ({
        role: m.role,
        text: m.english,
      }));

      const res = await sendRoleplayMessage({
        scenarioTitle: lessonTitle,
        topic,
        aiRole,
        userRole,
        userLevel,
        conversationHistory: conversationHistoryForApi,
        userMessage: textToSend,
      });

      // Update user message with evaluation
      const updatedMessagesWithEval = updatedHistory.map((m) => {
        if (m.id === userMsgObj.id) {
          return {
            ...m,
            evaluation: res.evaluation,
          };
        }
        return m;
      });

      // 3. Append AI response turn
      const aiMsgObj: RoleplayMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        speakerName: aiRole,
        english: res.aiReply,
        vietnamese: res.aiReplyVietnamese,
      };

      setMessages([...updatedMessagesWithEval, aiMsgObj]);

      // Automatically speak AI turn
      speakEnglishText(res.aiReply);
    } catch (err: any) {
      console.error('Lỗi khi nhập vai hội thoại AI:', err);
      setError(err?.message || 'Không thể nhận phản hồi từ AI. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/60 to-slate-50 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      
      {/* Roleplay Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/60 dark:border-purple-800/60 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>⚡ Luyện phản xạ chủ động</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Nhập vai hội thoại cùng AI</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            AI đóng vai nhân vật trong bài học. Hãy bấm mic nói hoặc gõ tiếng Anh để luyện phản xạ. AI sẽ đối đáp và đánh giá chi tiết câu nói của bạn.
          </p>
        </div>

        <button
          onClick={initConversation}
          className="px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 border border-purple-200 dark:border-purple-700 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Làm mới hội thoại</span>
        </button>
      </div>

      {/* Role Names Badge Info */}
      <div className="flex flex-wrap items-center gap-3 bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/60 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300">
          <Bot className="w-4 h-4 text-purple-600" />
          <span>AI đóng vai:</span>
          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-md">
            {aiRole}
          </span>
        </div>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Bạn đóng vai:</span>
          <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-md">
            {userRole}
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
        {messages.map((msg) => (
          <RoleplayMessageBubble key={msg.id} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs text-purple-700 dark:text-purple-300 font-semibold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>AI đang lắng nghe và chuẩn bị câu đối đáp tiếp theo...</span>
          </div>
        )}
      </div>

      {/* Input Form Controls */}
      <div className="space-y-2 pt-2 border-t border-purple-200/60 dark:border-purple-800/60">
        
        {isRecording && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>Đang lắng nghe giọng nói tiếng Anh của bạn... Hãy nói vào micro!</span>
            </div>
            <button
              onClick={() => setIsRecording(false)}
              className="text-[11px] underline text-rose-600 dark:text-rose-400"
            >
              Dừng ghi âm
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Speech Recording Button */}
          <button
            onClick={handleStartSpeechRecognition}
            disabled={isLoading}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-600 animate-bounce'
                : 'bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700'
            }`}
            title="Bấm để nói trực tiếp qua micro"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <input
            type="text"
            placeholder="Nhập hoặc nói câu trả lời tiếng Anh của bạn..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage();
              }
            }}
            className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-purple-200/80 dark:border-purple-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Gửi</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 pl-1">
            {error}
          </p>
        )}
      </div>

    </div>
  );
};
