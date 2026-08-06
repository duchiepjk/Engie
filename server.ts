import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini AI setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Initial Database in Memory (with persistence structure)
let currentUsers = [
  {
    id: "user-1",
    name: "Nguyễn Văn Học",
    email: "hocvien@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    role: "user",
    level: "B1",
    streak: 5,
    xp: 450,
    completedLessons: ["lesson-1"],
  },
  {
    id: "admin-1",
    name: "Quản Trị Viên (Admin)",
    email: "admin.englishub@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    role: "admin",
    level: "C1",
    streak: 12,
    xp: 1250,
    completedLessons: ["lesson-1", "lesson-2"],
  },
];

let currentUser = currentUsers[0];

let lessons = [
  {
    id: "lesson-1",
    title: "Từ vựng chủ đề văn phòng & công việc (Office & Career)",
    category: "vocabulary",
    level: "B1",
    description: "Học 8 từ vựng quan trọng nhất về môi trường công sở, giao tiếp với đồng nghiệp và sếp.",
    durationMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    vocabularyItems: [
      {
        id: "v1",
        word: "Collaborate",
        phonetic: "/kəˈlæb.ə.reɪt/",
        partOfSpeech: "verb",
        meaning: "Hợp tác, làm việc cùng nhau",
        example: "We need to collaborate closely with the marketing team on this launch.",
        exampleMeaning: "Chúng ta cần hợp tác chặt chẽ với đội ngũ marketing trong đợt ra mắt này.",
      },
      {
        id: "v2",
        word: "Deadline",
        phonetic: "/ˈded.laɪn/",
        partOfSpeech: "noun",
        meaning: "Hạn chót hoàn thành công việc",
        example: "The deadline for submitting the quarterly report is next Friday.",
        exampleMeaning: "Hạn chót nộp báo cáo quý là thứ Sáu tuần tới.",
      },
      {
        id: "v3",
        word: "Negotiate",
        phonetic: "/nəˈɡəʊ.ʃi.eɪt/",
        partOfSpeech: "verb",
        meaning: "Đàm phán, thương lượng",
        example: "She managed to negotiate a better contract with our key supplier.",
        exampleMeaning: "Cô ấy đã đàm phán thành công một hợp đồng tốt hơn với nhà cung cấp chính.",
      },
      {
        id: "v4",
        word: "Productivity",
        phonetic: "/ˌprɒd.ʌkˈtɪv.ə.ti/",
        partOfSpeech: "noun",
        meaning: "Năng suất công việc",
        example: "Flexible work hours have greatly improved employee productivity.",
        exampleMeaning: "Giờ làm việc linh hoạt đã cải thiện đáng kể năng suất của nhân viên.",
      },
      {
        id: "v5",
        word: "Feedback",
        phonetic: "/ˈfiːd.bæk/",
        partOfSpeech: "noun",
        meaning: "Ý kiến phản hồi, đánh giá",
        example: "Constructive feedback helps employees grow professionally.",
        exampleMeaning: "Phản hồi mang tính xây dựng giúp nhân viên phát triển chuyên môn.",
      },
    ],
    quizQuestions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "Từ nào có nghĩa là 'Hợp tác, cùng làm việc'?",
        options: ["Deadline", "Collaborate", "Negotiate", "Productivity"],
        correctAnswer: "Collaborate",
        explanation: "'Collaborate' có nghĩa là hợp tác. Ví dụ: Collaborate with colleagues.",
      },
      {
        id: "q2",
        type: "fill-blank",
        question: "We need to meet the _____ before midnight today.",
        correctAnswer: "deadline",
        explanation: "Hạn chót hoàn thành công việc là 'deadline'.",
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "Điền từ thích hợp: Flexible hours boost staff _____.",
        options: ["Productivity", "Feedback", "Deadline", "Phonetic"],
        correctAnswer: "Productivity",
        explanation: "'Productivity' có nghĩa là năng suất làm việc.",
      },
    ],
  },
  {
    id: "lesson-2",
    title: "Thì hiện tại hoàn thành vs Thì quá khứ đơn",
    category: "grammar",
    level: "B1",
    description: "Phân biệt cách dùng Present Perfect và Past Simple để không bao giờ chia sai động từ trong đề thi và giao tiếp.",
    durationMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g1",
        title: "1. Thì quá khứ đơn (Past Simple)",
        explanation: "Diễn tả hành động ĐÃ XẢY RA và KẾT THÚC tại một thời điểm xác định trong quá khứ.",
        formula: "S + V2/ed + (O) | Dấu hiệu: yesterday, ago, last week, in 2020",
        examples: [
          { english: "I visited London in 2019.", vietnamese: "Tôi đã thăm London vào năm 2019 (thời gian xác định)." },
          { english: "She bought a new car yesterday.", vietnamese: "Cô ấy đã mua xe mới ngày hôm qua." },
        ],
      },
      {
        id: "g2",
        title: "2. Thì hiện tại hoàn thành (Present Perfect)",
        explanation: "Diễn tả hành động xảy ra trong quá khứ nhưng KẾT QUẢ hoặc ẢNH HƯỞNG vẫn kéo dài tới hiện tại.",
        formula: "S + have/has + V3/ed + (O) | Dấu hiệu: since, for, already, just, ever, never",
        examples: [
          { english: "I have lived in Hanoi for 5 years.", vietnamese: "Tôi đã sống ở Hà Nội được 5 năm (hiện tại vẫn sống ở đây)." },
          { english: "Have you ever tried Japanese sushi?", vietnamese: "Bạn đã từng ăn thử sushi Nhật Bản bao giờ chưa?" },
        ],
      },
    ],
    quizQuestions: [
      {
        id: "q4",
        type: "multiple-choice",
        question: "Choose the correct verb form: 'I _____ (live) in this city since 2015.'",
        options: ["lived", "have lived", "am living", "was living"],
        correctAnswer: "have lived",
        explanation: "Dấu hiệu 'since 2015' chỉ một hành động bắt đầu từ quá khứ kéo dài đến hiện tại -> Dùng Present Perfect (have lived).",
      },
      {
        id: "q5",
        type: "multiple-choice",
        question: "Choose the correct answer: 'They _____ (finish) the project yesterday.'",
        options: ["have finished", "finished", "had finished", "finish"],
        correctAnswer: "finished",
        explanation: "Có mốc thời gian xác định 'yesterday' -> Dùng Quá Khứ Đơn (finished).",
      },
    ],
  },
  {
    id: "lesson-3",
    title: "Luyện nghe: Phỏng vấn xin việc (Job Interview Listening)",
    category: "listening",
    level: "B2",
    description: "Luyện nghe hội thoại phỏng vấn tiếng Anh tốc độ chuẩn người bản xứ, học mẫu câu trả lời ấn tượng.",
    durationMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    listeningScript: {
      title: "Cuộc phỏng vấn giữa nhà tuyển dụng (Interviewer) và ứng viên (Alex)",
      topic: "Self-introduction & Work Experience",
      fullText: "Interviewer: Welcome Alex. Could you please introduce yourself briefly?\nAlex: Thank you. I have worked as a software developer for 4 years, specializing in modern web platforms.\nInterviewer: What do you consider your greatest professional strength?\nAlex: My key strength is solving complex problems efficiently under tight deadlines.",
      lines: [
        {
          speaker: "Interviewer",
          english: "Welcome Alex. Could you please introduce yourself briefly and tell us about your background?",
          vietnamese: "Chào mừng Alex. Bạn có thể giới thiệu ngắn gọn về bản thân và kinh nghiệm của mình không?",
        },
        {
          speaker: "Alex",
          english: "Thank you. I have worked as a software developer for 4 years, specializing in modern web applications.",
          vietnamese: "Cảm ơn ông. Tôi đã làm nhà phát triển phần mềm được 4 năm, chuyên về các ứng dụng web hiện đại.",
        },
        {
          speaker: "Interviewer",
          english: "What do you consider your greatest professional strength?",
          vietnamese: "Bạn xem điểm mạnh chuyên môn lớn nhất của mình là gì?",
        },
        {
          speaker: "Alex",
          english: "My key strength is solving complex problems efficiently while meeting tight deadlines.",
          vietnamese: "Điểm mạnh cốt lõi của tôi là giải quyết các bài toán phức tạp hiệu quả trong khi vẫn đảm bảo hạn chót gấp.",
        },
      ],
    },
    quizQuestions: [
      {
        id: "q6",
        type: "multiple-choice",
        question: "Alex has worked as a software developer for how many years?",
        options: ["2 years", "3 years", "4 years", "5 years"],
        correctAnswer: "4 years",
        explanation: "Trong bài nghe Alex nói: 'I have worked as a software developer for 4 years'.",
      },
      {
        id: "q7",
        type: "fill-blank",
        question: "Alex's main strength is solving complex problems efficiently under tight _____.",
        correctAnswer: "deadlines",
        explanation: "Từ cần điền là 'deadlines' (hạn chót).",
      },
    ],
  },
  {
    id: "lesson-4",
    title: "Từ vựng giao tiếp hàng ngày (Daily English Phrases)",
    category: "vocabulary",
    level: "A2",
    description: "Cụm từ giao tiếp thông dụng khi chào hỏi, nhờ trợ giúp, đặt món và cảm ơn.",
    durationMinutes: 12,
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    vocabularyItems: [
      {
        id: "v6",
        word: "Appreciate",
        phonetic: "/əˈpriː.ʃi.eɪt/",
        partOfSpeech: "verb",
        meaning: "Trân trọng, cảm kích",
        example: "I really appreciate your kind help today.",
        exampleMeaning: "Tôi rất trân trọng sự giúp đỡ nhiệt tình của bạn hôm nay.",
      },
      {
        id: "v7",
        word: "Recommend",
        phonetic: "/ˌrek.əˈmend/",
        partOfSpeech: "verb",
        meaning: "Gợi ý, đề xuất",
        example: "Could you recommend a good coffee shop nearby?",
        exampleMeaning: "Bạn có thể gợi ý một quán cà phê ngon gần đây không?",
      },
    ],
    quizQuestions: [
      {
        id: "q8",
        type: "multiple-choice",
        question: "Từ nào có nghĩa là 'Cảm kích, trân trọng'?",
        options: ["Recommend", "Appreciate", "Deadline", "Collaborate"],
        correctAnswer: "Appreciate",
        explanation: "'Appreciate' có nghĩa là trân trọng sự giúp đỡ của ai đó.",
      },
    ],
  },
];

let userProgress: Record<string, { xp: number; streakDays: number; completedLessonIds: string[]; quizScores: Record<string, { score: number; total: number; date: string }>; savedVocab: string[] }> = {
  "user-1": {
    xp: 450,
    streakDays: 5,
    completedLessonIds: ["lesson-1"],
    quizScores: {
      "lesson-1": { score: 3, total: 3, date: "2026-08-04" },
    },
    savedVocab: ["Collaborate", "Deadline"],
  },
};

// --- API ENDPOINTS ---

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "EnglishHub Backend API Ready" });
});

// Current user profile
app.get("/api/auth/me", (req, res) => {
  res.json({ user: currentUser });
});

// Google OAuth simulated login / user profile update
app.post("/api/auth/google", (req, res) => {
  const { email, name, avatar } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  let existing = currentUsers.find((u) => u.email === email);
  if (!existing) {
    existing = {
      id: `user-${Date.now()}`,
      name: name || email.split("@")[0],
      email: email,
      avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      role: email.includes("admin") ? "admin" : "user",
      level: "B1",
      streak: 1,
      xp: 100,
      completedLessons: [],
    };
    currentUsers.push(existing);
  }

  currentUser = existing;
  res.json({ success: true, user: currentUser });
});

// Switch role (User <-> Admin demo toggle)
app.post("/api/auth/switch-role", (req, res) => {
  const { role } = req.body;
  if (role === "admin" || role === "user") {
    currentUser.role = role;
    res.json({ success: true, user: currentUser });
  } else {
    res.status(400).json({ error: "Invalid role" });
  }
});

// Get all lessons
app.get("/api/lessons", (req, res) => {
  const { category, level, search } = req.query;
  let filtered = [...lessons];

  if (category) {
    filtered = filtered.filter((l) => l.category === category);
  }
  if (level) {
    filtered = filtered.filter((l) => l.level === level);
  }
  if (search) {
    const query = String(search).toLowerCase();
    filtered = filtered.filter(
      (l) => l.title.toLowerCase().includes(query) || l.description.toLowerCase().includes(query)
    );
  }

  res.json(filtered);
});

// Get lesson by ID
app.get("/api/lessons/:id", (req, res) => {
  const lesson = lessons.find((l) => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: "Lesson not found" });
  }
  res.json(lesson);
});

// Create new lesson (Admin)
app.post("/api/lessons", (req, res) => {
  if (currentUser.role !== "admin") {
    return res.status(403).json({ error: "Chỉ Admin mới có quyền tạo bài học" });
  }

  const { title, category, level, description, durationMinutes, vocabularyItems, grammarSections, listeningScript, quizQuestions } = req.body;

  if (!title || !category || !level) {
    return res.status(400).json({ error: "Tiêu đề, phân loại và trình độ là bắt buộc" });
  }

  const newLesson = {
    id: `lesson-${Date.now()}`,
    title,
    category,
    level,
    description: description || "Bài học mới",
    durationMinutes: Number(durationMinutes) || 15,
    imageUrl: category === "vocabulary" 
      ? "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80"
      : category === "grammar" 
      ? "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
      : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    vocabularyItems: vocabularyItems || [],
    grammarSections: grammarSections || [],
    listeningScript: listeningScript || undefined,
    quizQuestions: quizQuestions || [],
  };

  lessons.unshift(newLesson);
  res.status(201).json(newLesson);
});

// Update lesson (Admin)
app.put("/api/lessons/:id", (req, res) => {
  if (currentUser.role !== "admin") {
    return res.status(403).json({ error: "Chỉ Admin mới có quyền sửa bài học" });
  }

  const index = lessons.findIndex((l) => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Không tìm thấy bài học" });
  }

  lessons[index] = { ...lessons[index], ...req.body };
  res.json(lessons[index]);
});

// Delete lesson (Admin)
app.delete("/api/lessons/:id", (req, res) => {
  if (currentUser.role !== "admin") {
    return res.status(403).json({ error: "Chỉ Admin mới có quyền xóa bài học" });
  }

  lessons = lessons.filter((l) => l.id !== req.params.id);
  res.json({ success: true, message: "Bài học đã được xóa" });
});

// Get user progress
app.get("/api/progress", (req, res) => {
  const prog = userProgress[currentUser.id] || {
    xp: currentUser.xp || 0,
    streakDays: currentUser.streak || 1,
    completedLessonIds: currentUser.completedLessons || [],
    quizScores: {},
    savedVocab: [],
  };
  res.json(prog);
});

// Submit quiz score / update lesson progress
app.post("/api/progress/submit-quiz", (req, res) => {
  const { lessonId, score, total } = req.body;
  const userId = currentUser.id;

  if (!userProgress[userId]) {
    userProgress[userId] = {
      xp: currentUser.xp,
      streakDays: currentUser.streak,
      completedLessonIds: currentUser.completedLessons,
      quizScores: {},
      savedVocab: [],
    };
  }

  const p = userProgress[userId];
  const earnedXp = score * 20 + 50; // 20 XP per right answer + 50 completion bonus
  p.xp += earnedXp;

  if (!p.completedLessonIds.includes(lessonId)) {
    p.completedLessonIds.push(lessonId);
  }

  p.quizScores[lessonId] = {
    score,
    total,
    date: new Date().toISOString().split("T")[0],
  };

  currentUser.xp = p.xp;
  if (!currentUser.completedLessons.includes(lessonId)) {
    currentUser.completedLessons.push(lessonId);
  }

  res.json({
    success: true,
    earnedXp,
    totalXp: p.xp,
    completedLessons: p.completedLessonIds,
  });
});

// Gemini AI English Tutor Chat Endpoint
app.post("/api/ai/tutor", async (req, res) => {
  try {
    const { messages, userLevel, mode } = req.body;

    const systemPrompt = `Bạn là một gia sư Tiếng Anh tận tụy, thân thiện tên là "Engie" trên nền tảng EnglishHub. 
Trình độ hiện tại của học viên: ${userLevel || "B1"}.
Chế độ thực hành: ${mode || "general"} (Options: general, grammar_check, roleplay_interview, vocabulary_builder).

NHIỆM VỤ CỦA BẠN:
1. Trả lời bằng tiếng Anh kèm giải thích / dịch nghĩa tiếng Việt ngắn gọn, dễ hiểu bên dưới.
2. Nếu học viên có lỗi sai ngữ pháp/từ vựng trong tin nhắn của họ, hãy dịu dàng sửa lỗi (Correction) và nêu rõ lý do trước khi trả lời câu hỏi.
3. Luôn kết thúc bằng 1 câu hỏi tương tác để khuyến khích học viên đáp lại.
4. Giữ giọng văn tự nhiên, khuyến khích và chuyên nghiệp.

Định dạng phản hồi khuyến khích:
- [Nhận xét / Sửa lỗi nếu có]
- [Câu trả lời chính bằng Tiếng Anh]
- [Bản dịch tiếng Việt]
- [Suggested Reply ngắn cho học viên]`;

    const promptText = messages.map((m: any) => `${m.sender === "user" ? "User" : "Engie AI"}: ${m.text}`).join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Gemini AI Tutor Error:", error);
    res.status(500).json({ error: "Không thể kết nối với Gia sư AI. Vui lòng thử lại sau." });
  }
});

// Gemini AI Dynamic Quiz Generator
app.post("/api/ai/generate-quiz", async (req, res) => {
  try {
    const { topic, level, count } = req.body;

    const prompt = `Hãy tạo một bộ ${count || 3} câu hỏi trắc nghiệm tiếng Anh chủ đề "${topic || "Giao tiếp hàng ngày"}" trình độ ${level || "B1"}.
Trả về đúng định dạng JSON array với các thuộc tính:
- id: string
- type: "multiple-choice" hoặc "fill-blank"
- question: nội dung câu hỏi (tiếng Anh)
- options: mảng 4 lựa chọn (nếu là multiple-choice)
- correctAnswer: đáp án đúng
- explanation: giải thích đáp án bằng tiếng Việt chi tiết.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const quizData = JSON.parse(response.text || "[]");
    res.json({ questions: quizData });
  } catch (error: any) {
    console.error("Gemini AI Quiz Generation Error:", error);
    res.status(500).json({ error: "Không thể tạo bài trắc nghiệm tự động." });
  }
});

async function startServer() {
  // Vite Middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
