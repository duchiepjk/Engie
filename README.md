# 🚀 Engie AI - Nền Tảng Học Tiếng Anh Thông Minh

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11.2-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)

**Engie AI** là ứng dụng web học tiếng Anh toàn diện, kết hợp công nghệ Trí tuệ nhân tạo (Google Gemini AI) và lưu trữ đám mây (Firebase) nhằm mang lại trải nghiệm tương tác tự nhiên, cá nhân hóa cho từng học viên.

---

## 🌟 Tính Năng Nổi Bật

- 🤖 **Trợ lý AI Engie Tutor**: Trò chuyện trực tiếp, giải đáp ngữ pháp, sửa lỗi phát âm và phản hồi bằng định dạng Markdown trực quan.
- 📚 **Hệ thống Bài học & Từ vựng phong phú**: Đa dạng các chủ đề từ Giao tiếp cơ bản, Ngữ pháp, Từ vựng chuyên ngành đến Luyện thi.
- 🎯 **Luyện tập & Quiz tương tác**: Bài tập trắc nghiệm, điền từ, nghe & phát âm kèm tính năng chấm điểm và giải thích chi tiết.
- 🔥 **Gamification (Động lực học tập)**: Tích lũy điểm **XP**, duy trì chuỗi **Streak** học tập mỗi ngày, bảng xếp hạng và huy hiệu thành tích.
- 🔐 **Xác thực & Lưu trữ đám mây**: Đăng nhập nhanh qua **Google Auth** và đồng bộ tiến trình học trên **Firebase Firestore**.
- 🛠️ **Hệ thống Quản trị (Admin Portal)**: Quản lý danh sách học viên, tạo/sửa bài học, quản lý kho câu hỏi và cấu hình hệ thống.
- 🌓 **Giao diện Tối ưu**: Hỗ trợ giao diện Sáng/Tối (Dark/Light mode) và chuẩn hóa responsive trên mọi thiết bị di động & máy tính.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### **Frontend**
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons), Motion (Animation)
- **Formatting**: React Markdown

### **Backend & APIs**
- **Server**: Node.js, Express API Bridge
- **AI Engine**: Google Gemini API (`@google/genai` SDK)
- **Database & Auth**: Firebase Web SDK v11 (Firebase Authentication & Cloud Firestore)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Getting Started)

### **1. Yêu cầu môi trường**
Đảm bảo máy tính của bạn đã cài đặt:
- **Node.js**: Phiên bản 18.x trở lên
- **npm** (hoặc **yarn** / **pnpm**)

### **2. Tải mã nguồn về máy**
```bash
git clone https://github.com/your-username/engie-ai-english-hub.git
cd engie-ai-english-hub
```

### **3. Cài đặt các thư viện phụ thuộc**
```bash
npm install
```

### **4. Cấu hình biến môi trường (.env)**
Tạo file `.env` tại thư mục gốc của dự án (hoặc sao chép từ `.env.example`):

```bash
cp .env.example .env
```

Mở file `.env` và điền khóa **Gemini API Key** của bạn:

```env
# Google Gemini API Key (Bắt buộc cho tính năng AI Tutor)
GEMINI_API_KEY=your_gemini_api_key_here
```

> 💡 **Lưu ý**: Lấy Gemini API Key miễn phí tại [Google AI Studio](https://aistudio.google.com/).

### **5. Khởi chạy ứng dụng ở chế độ phát triển (Dev Mode)**
```bash
npm run dev
```

Sau khi chạy lệnh thành công, truy cập ứng dụng tại địa chỉ:
👉 **`http://localhost:3000`**

---

## 📦 Lệnh Biên Dịch & Đóng Gói (Scripts)

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Khởi chạy server phát triển Express + Vite tại cổng 3000 |
| `npm run build` | Biên dịch Frontend (Vite) và Bundling Backend (`server.ts` -> `dist/server.cjs`) |
| `npm run start` | Chạy ứng dụng sản phẩm từ thư mục `dist` |
| `npm run lint` | Kiểm tra lỗi cú pháp và Type Safety với TypeScript |

---

## 📂 Cấu Trúc Dự Án (Project Structure)

```text
engie-ai-english-hub/
├── public/                 # Tài nguyên tĩnh (Logo, favicon, hình ảnh)
├── src/
│   ├── assets/             # Hình ảnh & Media
│   ├── components/         # Các React Components
│   │   ├── AiTutorChat.tsx        # Giao diện chat với Gemini AI Tutor
│   │   ├── Header.tsx            # Thanh điều hướng ứng dụng
│   │   ├── GoogleAuthModal.tsx   # Modal đăng nhập Google Firebase
│   │   ├── LessonDetailView.tsx  # Chi tiết bài học & Từ vựng
│   │   ├── QuizRunner.tsx        # Giao diện làm bài tập / Quiz
│   │   └── AdminDashboard.tsx    # Bảng quản trị hệ thống
│   ├── lib/                # Cấu hình SDKs (Firebase, Gemini API, Audio)
│   │   ├── api.ts                # API client tương tác backend
│   │   ├── firebase.ts           # Cấu hình Firebase Auth & Firestore
│   │   └── audio.ts              # Xử lý phát âm Text-To-Speech
│   ├── types.ts            # Khai báo TypeScript Interfaces & Enums
│   ├── App.tsx             # Component chính chứa ứng dụng
│   ├── main.tsx            # Entry point React
│   └── index.css           # Cấu hình Tailwind CSS
├── server.ts               # Server Express backend proxy Gemini API
├── .env.example            # Mẫu khai báo biến môi trường
├── firebase-applet-config.json # Cấu hình kết nối Firebase
├── package.json            # Khai báo dependencies & scripts
├── tsconfig.json           # Cấu hình TypeScript
└── README.md               # Tài liệu hướng dẫn dự án
```

---

## 🤝 Hướng Dẫn Đóng Góp (Contributing)

Mọi sự đóng góp giúp hoàn thiện ứng dụng đều được hoan nghênh!
1. **Fork** repository này.
2. Tạo nhánh tính năng mới (`git checkout -b feature/AmazingFeature`).
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`).
4. Push lên nhánh của bạn (`git push origin feature/AmazingFeature`).
5. Mở một **Pull Request**.

---

## 📄 Bản Quyền & Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Chi tiết xem tại file [LICENSE](LICENSE).

---

<p center align="center">
  Được phát triển với ❤️ bởi <b>Engie Team</b>
</p>
