import React, { useState } from 'react';
import { BrandName } from './BrandName';
import logoImg from '../assets/images/english_hub_logo_1785896964079.jpg';
import { Shield, FileText, HelpCircle, X } from 'lucide-react';

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'support' | null>(null);

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 py-6 sm:py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left">
          
          {/* Left: Brand, Slogan & Copyright */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 shadow-2xs">
                <img
                  src={logoImg}
                  alt="Engie AI Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <BrandName textSize="text-sm sm:text-base" badgeSize="text-[9px]" />
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Nền tảng học tiếng Anh thông minh ứng dụng trí tuệ nhân tạo.
              </span>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
              Copyright © 2026 Engie AI. Tất cả quyền được bảo lưu.
            </p>
          </div>

          {/* Right: Useful Navigation Links */}
          <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400 flex-wrap">
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Điều khoản dịch vụ
            </button>
            <span className="text-slate-300 dark:text-slate-700 font-light">•</span>
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Chính sách bảo mật
            </button>
            <span className="text-slate-300 dark:text-slate-700 font-light">•</span>
            <button
              onClick={() => setActiveModal('support')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hỗ trợ / Liên hệ
            </button>
          </div>

        </div>
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-6 sm:p-7 relative animate-in zoom-in-95 duration-200 space-y-4 text-slate-800 dark:text-slate-200 text-sm">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'terms' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                  <FileText className="w-5 h-5" />
                  <h4>Điều khoản dịch vụ</h4>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-1">
                  <p>Chào mừng bạn đến với <strong>Engie AI</strong>. Khi truy cập và sử dụng nền tảng của chúng tôi, bạn đồng ý với các điều khoản sau:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Nền tảng cung cấp dịch vụ hỗ trợ luyện tập tiếng Anh cá nhân hóa.</li>
                    <li>Tài khoản người dùng được bảo mật nhằm lưu trữ và đồng bộ tiến trình học tập cá nhân.</li>
                    <li>Nội dung phản hồi từ Gia sư AI dùng cho mục đích tham khảo và thực hành ngôn ngữ.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                  <Shield className="w-5 h-5" />
                  <h4>Chính sách bảo mật</h4>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-1">
                  <p><strong>Engie AI</strong> tôn trọng và bảo vệ quyền riêng tư của mọi học viên:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Thông tin đăng nhập qua Google OAuth chỉ dùng để xác thực danh tính.</li>
                    <li>Chúng tôi không chia sẻ hoặc bán thông tin cá nhân của bạn cho bên thứ ba.</li>
                    <li>Dữ liệu tiến độ học tập được lưu trữ an toàn và riêng tư.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeModal === 'support' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-lg">
                  <HelpCircle className="w-5 h-5" />
                  <h4>Hỗ trợ / Liên hệ</h4>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>Bạn cần hỗ trợ hoặc muốn đóng góp ý kiến nâng cao chất lượng trải nghiệm học tập?</p>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-1 text-xs">
                    <p>📧 Email: <strong className="text-slate-800 dark:text-slate-200">support@engie.ai</strong></p>
                    <p>💬 Hỗ trợ trực tiếp: Trò chuyện với <strong>Gia sư Engie AI</strong> ngay trong phần Chat.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
