import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, User } from '../types';
import { askAiTutor } from '../lib/api';
import { speakEnglishText } from '../lib/audio';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  RotateCw, 
  MessageSquare, 
  CheckCircle2, 
  FileText, 
  Briefcase, 
  Lightbulb,
  Languages
} from 'lucide-react';

interface AiTutorChatProps {
  user: User;
}

interface AiChatMessageItemProps {
  msg: ChatMessage;
  user: User;
  onSendSuggestedReply: (text: string) => void;
}

const AiChatMessageItem: React.FC<AiChatMessageItemProps> = ({ msg, user, onSendSuggestedReply }) => {
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      {msg.sender === 'ai' ? (
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Bot className="w-5 h-5" />
        </div>
      ) : (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-indigo-500/20"
        />
      )}

      {/* Message Card */}
      <div className={`relative max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs ${
        msg.sender === 'user'
          ? 'bg-indigo-600 text-white rounded-tr-xs'
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-xs'
      }`}>
        {/* Main message text rendered with Markdown (English response / feedback) */}
        <div className="leading-relaxed font-medium text-sm sm:text-base [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_code]:bg-black/10 dark:[&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm">
          <ReactMarkdown>{msg.text}</ReactMarkdown>
        </div>

        {/* Vietnamese Translation Section - Hidden by default */}
        {msg.sender === 'ai' && msg.translation && (
          <div className="space-y-1">
            {showTranslation && (
              <div className="pt-2.5 pb-2 px-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/90 dark:bg-slate-900/50 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200 space-y-1">
                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Bản dịch tiếng Việt:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  {msg.translation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons and timestamps for AI messages */}
        {msg.sender === 'ai' && (
          <div className="pt-2 flex items-center justify-between text-xs sm:text-sm border-t border-slate-100 dark:border-slate-700/60 text-slate-400 dark:text-slate-500 gap-2 flex-wrap">
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-normal">{msg.timestamp}</span>
            
            <div className="flex items-center gap-2">
              {/* Toggle Translation Button */}
              {msg.translation && (
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    showTranslation
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title={showTranslation ? "Ẩn bản dịch tiếng Việt" : "Xem bản dịch tiếng Việt"}
                >
                  <Languages className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{showTranslation ? "Ẩn bản dịch" : "Xem bản dịch"}</span>
                </button>
              )}

              {/* Pronunciation audio button */}
              <button
                onClick={() => speakEnglishText(msg.text)}
                className="px-2.5 py-1 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Nghe phát âm tiếng Anh"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe phát âm</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Reply Chip */}
        {msg.suggestedReply && (
          <div className="pt-1.5">
            <button
              onClick={() => onSendSuggestedReply(msg.suggestedReply!)}
              className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-left cursor-pointer transition-all"
            >
              <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Gợi ý: "{msg.suggestedReply}"</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const AiTutorChat: React.FC<AiTutorChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello ${user.name.split(' ')[0]}! I'm Engie, your AI English Tutor. How are you feeling today? What would you like to practice?`,
      translation: `Xin chào ${user.name.split(' ')[0]}! Tôi là Engie, Gia sư Tiếng Anh AI của bạn. Hôm nay bạn thấy thế nào? Bạn muốn luyện tập nội dung gì?`,
      suggestedReply: "I'm doing great! I want to practice talking about my hobbies.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<string>('general');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInput('');
    setIsLoading(true);

    try {
      const res = await askAiTutor(newThread, user.level, mode);
      
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: res.text,
        translation: res.translation,
        suggestedReply: res.suggestedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newThread, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newThread,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: 'I apologize, I am having trouble connecting right now. Please try again in a moment!',
          translation: 'Rất tiếc, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau giây lát!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="p-3 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-md shrink-0">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2">
              Engie - Gia sư AI
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300">Trợ lý luyện nói & sửa lỗi ({user.level})</p>
          </div>
        </div>

        {/* Practice Mode Selector */}
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="text-xs bg-slate-800 text-white border border-slate-700 rounded-xl px-2.5 sm:px-3 py-1.5 focus:outline-hidden font-medium max-w-[140px] sm:max-w-none"
        >
          <option value="general">💬 Giao tiếp tự do</option>
          <option value="grammar_check">✍️ Sửa lỗi ngữ pháp</option>
          <option value="roleplay_interview">💼 Phỏng vấn xin việc</option>
        </select>
      </div>

      {/* Mode Hint Banner */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40 px-3 sm:px-5 py-2 text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 font-medium flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          Engie sẽ nhận xét câu trả lời, sửa lỗi ngữ pháp và hướng dẫn từ vựng tự nhiên nhất cho bạn.
        </span>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-2.5 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((msg) => (
          <AiChatMessageItem
            key={msg.id}
            msg={msg}
            user={user}
            onSendSuggestedReply={(text) => handleSend(text)}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
              Engie đang suy nghĩ câu trả lời...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-2.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-1.5 sm:gap-2"
        >
          <input
            type="text"
            placeholder="Nhập câu trả lời hoặc câu hỏi bằng tiếng Anh..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 sm:px-4 py-3 text-base bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 sm:px-5 py-3 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-40 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
