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
    name: "Quản trị viên (Admin)",
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
  
  // ==================== 12 BÀI HỌC CƠ BẢN DÀNH CHO 12 THÌ TỰ LẬP ====================
  {
    id: "grammar-present-simple",
    title: "Thì hiện tại đơn (Present Simple)",
    category: "grammar",
    level: "A1",
    description: "Cấu trúc S + V(s/es), quy tắc chia động từ to be / thường, dấu hiệu nhận biết và cách diễn tả thói quen, chân lý hiển nhiên.",
    durationMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-ps-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Mục tiêu của bài học hôm nay là giúp các em làm chủ thì hiện tại đơn (Present Simple) - nền tảng quan trọng nhất trong ngữ pháp tiếng Anh, giúp các em tự tin giới thiệu bản thân, thói quen hằng ngày và các sự thật trong cuộc sống."
      },
      {
        id: "g-ps-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Thì hiện tại đơn dùng để diễn tả một hành động lặp đi lặp lại như một thói quen, một sự thật hiển nhiên hoặc một lịch trình đã định sẵn trong đời sống."
      },
      {
        id: "g-ps-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Các trạng từ chỉ tần suất hay gặp: always (luôn luôn), usually (thường xuyên), often (thường), sometimes (thỉnh thoảng), never (không bao giờ); hoặc các từ như every day, every week, every month, on Mondays...",
        formula: "Chìa khóa: Always / Usually / Often / Sometimes / Never / Every day"
      },
      {
        id: "g-ps-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Động từ trong thì hiện tại đơn được chia theo hai nhóm: Động từ thường và Động từ to be.",
        formula: "Động từ thường:\n(+) Khẳng định: S + V(s/es)\n(-) Phủ định: S + do/does + not + V0\n(?) Nghi vấn: Do/Does + S + V0?\n\nĐộng từ To Be:\n(+) Khẳng định: S + am/is/are + N/Adj\n(-) Phủ định: S + am/is/are + not + N/Adj\n(?) Nghi vấn: Am/Is/Are + S + N/Adj?"
      },
      {
        id: "g-ps-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Các em hãy tham khảo các ví dụ thực tế đời thường sau đây:",
        examples: [
          { english: "She works at an international school in Hanoi.", vietnamese: "Cô ấy làm việc tại một trường quốc tế ở Hà Nội." },
          { english: "They do not play video games on weekdays.", vietnamese: "Họ không chơi trò chơi điện tử vào các ngày trong tuần." },
          { english: "Do you drink green tea every morning?", vietnamese: "Bạn có uống trà xanh mỗi sáng không?" },
          { english: "Water freezes at 0 degrees Celsius.", vietnamese: "Nước đóng băng ở 0 độ C." }
        ]
      },
      {
        id: "g-ps-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Thêm 'es' sau các động từ kết thúc bằng: -o, -s, -ch, -x, -sh, -z (ví dụ: watch -> watches, go -> goes).\n• Với chủ ngữ số ít (he, she, it, danh từ số ít), luôn phải chia động từ. Đừng quên chia trợ động từ 'does' trong câu phủ định và câu hỏi nhé!"
      }
    ],
    quizQuestions: [
      {
        id: "q-ps-1",
        type: "multiple-choice",
        question: "Choose the correct answer: 'She _____ (go) to the gym every morning.'",
        options: ["go", "goes", "is going", "went"],
        correctAnswer: "goes",
        explanation: "Chủ ngữ 'She' đi với động từ thêm 'es' ở thì hiện tại đơn -> goes."
      },
      {
        id: "q-ps-2",
        type: "multiple-choice",
        question: "Which sentence expresses a general truth?",
        options: [
          "The sun rises in the east.",
          "I am drinking coffee now.",
          "They bought a new car yesterday.",
          "She has lived here for 10 years."
        ],
        correctAnswer: "The sun rises in the east.",
        explanation: "'Mặt trời mọc ở hướng đông' là một sự thật hiển nhiên luôn đúng -> Thì hiện tại đơn."
      }
    ]
  },
  {
    id: "grammar-present-continuous",
    title: "Thì hiện tại tiếp diễn (Present Continuous)",
    category: "grammar",
    level: "A1",
    description: "Cấu trúc S + am/is/are + V-ing, diễn tả hành động đang diễn ra ngay lúc nói, kế hoạch tương lai gần và các động từ chỉ trạng thái.",
    durationMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-pc-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Bài học hôm nay cô trò mình sẽ cùng chinh phục thì hiện tại tiếp diễn (Present Continuous) để diễn tả những hành động đang diễn ra ngay lúc này hoặc các kế hoạch đã lên lịch sẵn."
      },
      {
        id: "g-pc-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Thì hiện tại tiếp diễn dùng khi hành động đang trực tiếp diễn ra tại thời điểm nói, hoặc một sự việc mang tính chất tạm thời, một kế hoạch đã thu xếp chắc chắn trong tương lai gần."
      },
      {
        id: "g-pc-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Các từ chỉ thời gian: now, right now, at the moment, at present; hoặc các câu cảm thán gây chú ý như Listen!, Look!, Be quiet!, Watch out!",
        formula: "Chìa khóa: Now / Right now / At the moment / Listen! / Look!"
      },
      {
        id: "g-pc-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Cấu trúc thì hiện tại tiếp diễn bắt buộc gồm động từ to be (am/is/are) đi cùng động từ thêm -ing (V-ing).",
        formula: "(+) Khẳng định: S + am/is/are + V-ing\n(-) Phủ định: S + am/is/are + not + V-ing\n(?) Nghi vấn: Am/Is/Are + S + V-ing?"
      },
      {
        id: "g-pc-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Xem các ví dụ thực tế dưới đây để hiểu cách dùng:",
        examples: [
          { english: "Please be quiet! The baby is sleeping.", vietnamese: "Xin hãy giữ trật tự! Em bé đang ngủ." },
          { english: "We are not working today because it is Sunday.", vietnamese: "Hôm nay chúng tôi không làm việc vì là Chủ nhật." },
          { english: "Are you preparing for the final English exam?", vietnamese: "Bạn đang chuẩn bị cho kỳ thi tiếng Anh cuối kỳ phải không?" },
          { english: "I am meeting my professor at 3 PM today.", vietnamese: "Tôi sẽ gặp giáo sư lúc 3 giờ chiều nay." }
        ]
      },
      {
        id: "g-pc-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Các động từ chỉ trạng thái, cảm xúc và nhận thức (stative verbs) như love, hate, want, know, think, understand KHÔNG dùng ở thể tiếp diễn. Ví dụ: nói 'I want some water' chứ không bao giờ nói 'I am wanting some water'."
      }
    ],
    quizQuestions: [
      {
        id: "q-pc-1",
        type: "multiple-choice",
        question: "Listen! Someone _____ (play) the piano upstairs.",
        options: ["plays", "is playing", "played", "has played"],
        correctAnswer: "is playing",
        explanation: "Dấu hiệu 'Listen!' báo hiệu hành động đang diễn ra ngay lúc nói -> is playing."
      }
    ]
  },
  {
    id: "grammar-present-perfect",
    title: "Thì hiện tại hoàn thành (Present Perfect)",
    category: "grammar",
    level: "A2",
    description: "Cấu trúc S + have/has + V3/ed, cách dùng khi diễn tả trải nghiệm, hành động xảy ra trong quá khứ kéo dài đến hiện tại.",
    durationMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-pp-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Trong buổi học này, cô sẽ giúp các em nắm vững thì hiện tại hoàn thành (Present Perfect) - cầu nối ngữ pháp quan trọng giữa quá khứ và hiện tại khi nói về trải nghiệm hoặc kết quả công việc."
      },
      {
        id: "g-pp-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Thì hiện tại hoàn thành diễn tả một hành động đã xảy ra ở thời điểm không xác định trong quá khứ, hoặc một hành động bắt đầu trong quá khứ kéo dài đến hiện tại, hoặc một sự việc vừa mới hoàn thành để lại kết quả."
      },
      {
        id: "g-pp-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Các trạng từ phổ biến: just (vừa mới), already (đã... rồi), yet (chưa), ever (đã từng), never (chưa bao giờ), recently (gần đây), so far (cho đến nay); cùng bộ đôi quan trọng since và for.",
        formula: "Chìa khóa: Since (mốc thời gian) / For (khoảng thời gian) / Just / Already / Yet / Ever / Never"
      },
      {
        id: "g-pp-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Dùng trợ động từ have/has kết hợp với động từ ở dạng quá khứ phân từ (V3 hoặc V-ed).",
        formula: "(+) Khẳng định: S + have/has + V3/ed\n(-) Phủ định: S + have/has + not + V3/ed\n(?) Nghi vấn: Have/Has + S + V3/ed?"
      },
      {
        id: "g-pp-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Cùng phân tích các ví dụ đời thực sau:",
        examples: [
          { english: "I have visited Tokyo three times.", vietnamese: "Tôi đã từng đến thăm Tokyo ba lần." },
          { english: "She has not finished her monthly report yet.", vietnamese: "Cô ấy vẫn chưa hoàn thành báo cáo tháng của mình." },
          { english: "Have you ever eaten Japanese sushi?", vietnamese: "Bạn đã từng ăn món sushi Nhật Bản bao giờ chưa?" },
          { english: "We have lived in Hanoi since 2015.", vietnamese: "Chúng tôi đã sống ở Hà Nội từ năm 2015." }
        ]
      },
      {
        id: "g-pp-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Phân biệt SINCE và FOR: Since + mốc thời gian bắt đầu (since 2020, since yesterday); For + khoảng thời gian (for 5 years, for 3 hours).\n• Nếu câu có mốc thời gian xác định hoàn toàn trong quá khứ (như yesterday, in 2010, 2 days ago), hãy dùng thì quá khứ đơn chứ không dùng hiện tại hoàn thành."
      }
    ],
    quizQuestions: [
      {
        id: "q-pp-1",
        type: "multiple-choice",
        question: "They have known each other _____ ten years.",
        options: ["since", "for", "in", "ago"],
        correctAnswer: "for",
        explanation: "'ten years' là một khoảng thời gian -> Dùng FOR."
      }
    ]
  },
  {
    id: "grammar-present-perfect-continuous",
    title: "Thì hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)",
    category: "grammar",
    level: "B1",
    description: "Cấu trúc S + have/has + been + V-ing, nhấn mạnh tính liên tục và quá trình diễn ra của hành động kéo dài từ quá khứ đến hiện tại.",
    durationMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-ppc-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Hôm nay cô trò chúng ta sẽ tìm hiểu thì hiện tại hoàn thành tiếp diễn (Present Perfect Continuous) - công cụ tuyệt vời để nhấn mạnh tính liên tục không ngừng nghỉ của một hành động."
      },
      {
        id: "g-ppc-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Diễn tả quá trình kéo dài liên tục của một hành động bắt đầu từ quá khứ và vẫn đang tiếp tục diễn ra ở hiện tại, nhấn mạnh vào khoảng thời gian và tính liên tục."
      },
      {
        id: "g-ppc-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Thường đi cùng các cụm từ nhấn mạnh thời gian: all day, all morning, for hours, for 3 days, since early morning, how long...",
        formula: "Chìa khóa: All day / All morning / For hours / How long...?"
      },
      {
        id: "g-ppc-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Cấu trúc kết hợp have/has + been + động từ thêm -ing.",
        formula: "(+) Khẳng định: S + have/has + been + V-ing\n(-) Phủ định: S + have/has + not + been + V-ing\n(?) Nghi vấn: Have/Has + S + been + V-ing?"
      },
      {
        id: "g-ppc-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Học các câu ví dụ thực tế giúp em nhớ lâu hơn:",
        examples: [
          { english: "It has been raining continuously all morning.", vietnamese: "Trời đã mưa liên tục suốt cả buổi sáng." },
          { english: "He has not been sleeping well recently.", vietnamese: "Dạo gần đây anh ấy ngủ không được ngon giấc." },
          { english: "How long have you been learning English?", vietnamese: "Bạn đã học tiếng Anh liên tục được bao lâu rồi?" }
        ]
      },
      {
        id: "g-ppc-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• So sánh: Thì hiện tại hoàn thành đơn nhấn mạnh KẾT QUẢ hoặc SỐ LƯỢNG (ví dụ: I have written 3 emails), còn thì hiện tại hoàn thành tiếp diễn nhấn mạnh QUÁ TRÌNH LÀM VIỆC LÊN CẬN HẠN (ví dụ: I have been writing emails all morning)."
      }
    ],
    quizQuestions: [
      {
        id: "q-ppc-1",
        type: "multiple-choice",
        question: "He is completely exhausted because he _____ (run) for 2 hours.",
        options: ["runs", "has been running", "was running", "had run"],
        correctAnswer: "has been running",
        explanation: "Hành động chạy diễn ra liên tục gây ra kết quả ở hiện tại (exhausted) -> Present Perfect Continuous."
      }
    ]
  },
  {
    id: "grammar-past-simple",
    title: "Thì quá khứ đơn (Past Simple)",
    category: "grammar",
    level: "A2",
    description: "Cấu trúc S + V2/ed, cách chia động từ bất quy tắc, quy tắc phát âm đuôi -ed và dấu hiệu mốc thời gian đã chấm dứt.",
    durationMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-psimp-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Bài học hôm nay cô sẽ hướng dẫn các em thì quá khứ đơn (Past Simple) - thì dùng nhiều nhất khi kể lại các sự kiện, câu chuyện đã hoàn tất trong quá khứ."
      },
      {
        id: "g-psimp-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Thì quá khứ đơn dùng để diễn tả một hành động hay sự việc đã xảy ra và kết thúc hoàn toàn tại một thời điểm xác định trong quá khứ."
      },
      {
        id: "g-psimp-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Các mốc thời gian đã qua: yesterday (hôm qua), last night / last week / last year, in 2020, 2 days ago, when I was young...",
        formula: "Chìa khóa: Yesterday / Last week / Ago / In + năm quá khứ"
      },
      {
        id: "g-psimp-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Động từ chia làm dạng có quy tắc (+ed) hoặc bất quy tắc (cột 2 V2). Trợ động từ phủ định/nghi vấn là 'did'.",
        formula: "Động từ thường:\n(+) Khẳng định: S + V2/ed\n(-) Phủ định: S + did + not + V0\n(?) Nghi vấn: Did + S + V0?\n\nĐộng từ To Be:\n(+) Khẳng định: S + was/were + N/Adj\n(-) Phủ định: S + was/were + not + N/Adj\n(?) Nghi vấn: Was/Were + S + N/Adj?"
      },
      {
        id: "g-psimp-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Dưới đây là ví dụ minh họa cụ thể:",
        examples: [
          { english: "They moved to Ho Chi Minh City two years ago.", vietnamese: "Họ đã chuyển vào Thành phố Hồ Chí Minh cách đây hai năm." },
          { english: "I did not receive your email yesterday.", vietnamese: "Tôi đã không nhận được email của bạn vào ngày hôm qua." },
          { english: "Did you watch the football match last night?", vietnamese: "Tối qua bạn có xem trận thi đấu bóng đá không?" }
        ]
      },
      {
        id: "g-psimp-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Nhớ học thuộc các động từ bất quy tắc phổ biến (go -> went, buy -> bought, see -> saw, take -> took).\n• Khi đã dùng trợ động từ 'did' hoặc 'didn't' trong câu phủ định hay nghi vấn, động từ chính luôn trở về dạng nguyên thể V0."
      }
    ],
    quizQuestions: [
      {
        id: "q-psimp-1",
        type: "multiple-choice",
        question: "My family _____ (buy) a new house two years ago.",
        options: ["bought", "has bought", "buys", "was buying"],
        correctAnswer: "bought",
        explanation: "Có mốc thời gian xác định trong quá khứ 'two years ago' -> V2 của buy là bought."
      }
    ]
  },
  {
    id: "grammar-past-continuous",
    title: "Thì quá khứ tiếp diễn (Past Continuous)",
    category: "grammar",
    level: "B1",
    description: "Cấu trúc S + was/were + V-ing, diễn tả hành động đang diễn ra tại mốc thời điểm xác định trong quá khứ hoặc phối hợp cấu trúc When / While.",
    durationMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-pcont-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Trong bài học này, cô trò mình cùng nghiên cứu thì quá khứ tiếp diễn (Past Continuous) để mô tả những hành động đang diễn ra tại một mốc thời điểm cụ thể ở quá khứ."
      },
      {
        id: "g-pcont-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Diễn tả hành động đang xảy ra tại một thời điểm chính xác trong quá khứ, hoặc hai hành động diễn ra song song cùng lúc, hoặc một hành động đang diễn ra thì hành động khác cắt ngang."
      },
      {
        id: "g-pcont-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Thường có mốc giờ cụ thể ở quá khứ (at 8 PM yesterday, at this time last week); hoặc đi kèm các từ nối khi phối hợp mệnh đề như when, while.",
        formula: "Chìa khóa: At + giờ + quá khứ / At this time last week / When / While"
      },
      {
        id: "g-pcont-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Chia động từ to be ở quá khứ (was cho chủ ngữ số ít, were cho chủ ngữ số nhiều) đi với V-ing.",
        formula: "(+) Khẳng định: S + was/were + V-ing\n(-) Phủ định: S + was/were + not + V-ing\n(?) Nghi vấn: Was/Were + S + V-ing?"
      },
      {
        id: "g-pcont-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Quan sát các câu ví dụ mẫu dưới đây:",
        examples: [
          { english: "At 8 PM yesterday, I was studying in my room.", vietnamese: "Vào lúc 8 giờ tối qua, tôi đang học bài trong phòng." },
          { english: "She was not paying attention while the teacher was explaining.", vietnamese: "Cô ấy đã không chú ý khi cô giáo đang giảng bài." },
          { english: "What were you doing when the phone rang?", vietnamese: "Bạn đang làm gì khi điện thoại reo?" }
        ]
      },
      {
        id: "g-pcont-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Ghi nhớ quy tắc phối hợp: Hành động đang diễn ra (dài hơn) chia quá khứ tiếp diễn (was/were V-ing), hành động chen ngang (ngắn hơn) chia quá khứ đơn (V2/ed)."
      }
    ],
    quizQuestions: [
      {
        id: "q-pcont-1",
        type: "multiple-choice",
        question: "At 10 AM yesterday, we _____ (have) an important meeting with our client.",
        options: ["had", "were having", "have had", "are having"],
        correctAnswer: "were having",
        explanation: "Có mốc thời gian cụ thể trong quá khứ 'At 10 AM yesterday' -> Past Continuous (were having)."
      }
    ]
  },
  {
    id: "grammar-past-perfect",
    title: "Thì quá khứ hoàn thành (Past Perfect)",
    category: "grammar",
    level: "B1",
    description: "Cấu trúc S + had + V3/ed, diễn tả hành động xảy ra và hoàn tất TRƯỚC một hành động/thời điểm khác trong quá khứ (Before/After/By the time).",
    durationMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-pastperf-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Bài học hôm nay cô sẽ giải thích thì quá khứ hoàn thành (Past Perfect) - được coi là 'quá khứ của quá khứ', giúp các em xác định rõ thứ tự trước sau của các sự việc."
      },
      {
        id: "g-pastperf-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Thì quá khứ hoàn thành dùng để diễn tả một hành động đã xảy ra và hoàn tất TRƯỚC một hành động khác hoặc một mốc thời gian khác trong quá khứ."
      },
      {
        id: "g-pastperf-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Thường xuất hiện cùng các từ nối: before (trước khi), after (sau khi), by the time (vào lúc), by 2018...",
        formula: "Chìa khóa: Before / After / By the time / By + mốc thời gian quá khứ"
      },
      {
        id: "g-pastperf-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Cấu trúc gồm trợ động từ HAD đi cùng động từ dạng phân từ 2 (V3/ed).",
        formula: "(+) Khẳng định: S + had + V3/ed\n(-) Phủ định: S + had + not + V3/ed\n(?) Nghi vấn: Had + S + V3/ed?"
      },
      {
        id: "g-pastperf-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Cùng tham khảo các ví dụ chuẩn dưới đây:",
        examples: [
          { english: "By the time the train arrived, we had bought all the tickets.", vietnamese: "Vào lúc tàu đến, chúng tôi đã mua xong toàn bộ vé rồi." },
          { english: "She had not finished dinner when her friends called.", vietnamese: "Cô ấy vẫn chưa ăn xong bữa tối khi các bạn gọi điện." },
          { english: "Had you studied English before you moved to London?", vietnamese: "Bạn đã học tiếng Anh trước khi chuyển sang London sống chưa?" }
        ]
      },
      {
        id: "g-pastperf-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Mẹo nhớ đơn giản: Trong quá khứ, hành động nào xảy ra TRƯỚC thì chia Quá khứ hoàn thành (had + V3), hành động nào xảy ra SAU chia Quá khứ đơn (V2/ed)."
      }
    ],
    quizQuestions: [
      {
        id: "q-pastperf-1",
        type: "multiple-choice",
        question: "When I reached the station, the train _____ (already / leave).",
        options: ["left", "has left", "had already left", "was leaving"],
        correctAnswer: "had already left",
        explanation: "Tàu đã chạy TRƯỚC khi tôi đến ga -> Dùng Past Perfect (had already left)."
      }
    ]
  },
  {
    id: "grammar-past-perfect-continuous",
    title: "Thì quá khứ hoàn thành tiếp diễn (Past Perfect Continuous)",
    category: "grammar",
    level: "B2",
    description: "Cấu trúc S + had + been + V-ing, nhấn mạnh quá trình diễn ra liên tục của hành động kéo dài trước một mốc thời điểm trong quá khứ.",
    durationMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-ppc2-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Cô xin giới thiệu thì quá khứ hoàn thành tiếp diễn (Past Perfect Continuous) - thì giúp biểu thị một hành động kéo dài liên tục trước một thời điểm quá khứ."
      },
      {
        id: "g-ppc2-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Diễn tả quá trình kéo dài liên tục của một hành động bắt đầu trước và tiếp diễn cho đến một thời điểm hoặc một hành động khác trong quá khứ."
      },
      {
        id: "g-ppc2-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Các cụm từ hay gặp: until then, by the time, for 2 hours before, how long...",
        formula: "Chìa khóa: Until then / For + khoảng thời gian + before..."
      },
      {
        id: "g-ppc2-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Cấu trúc gồm S + had + been + V-ing.",
        formula: "(+) Khẳng định: S + had + been + V-ing\n(-) Phủ định: S + had + not + been + V-ing\n(?) Nghi vấn: Had + S + been + V-ing?"
      },
      {
        id: "g-ppc2-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Dưới đây là các ví dụ minh họa:",
        examples: [
          { english: "They had been driving for 6 hours before they found a gas station.", vietnamese: "Họ đã lái xe liên tục 6 tiếng trước khi tìm thấy một cây xăng." },
          { english: "I had not been working there for long when the company closed.", vietnamese: "Tôi làm việc ở đó chưa được bao lâu thì công ty đóng cửa." },
          { english: "Had she been living in Paris before she moved to Rome?", vietnamese: "Có phải cô ấy đã sống liên tục ở Paris trước khi chuyển tới Rome không?" }
        ]
      },
      {
        id: "g-ppc2-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Thì này tập trung nhấn mạnh tính liên tục và nguyên nhân để lại hậu quả ở một thời điểm trong quá khứ."
      }
    ],
    quizQuestions: [
      {
        id: "q-ppc2-1",
        type: "multiple-choice",
        question: "He was wet because he _____ (walk) in the rain for an hour.",
        options: ["walked", "had been walking", "was walking", "has walked"],
        correctAnswer: "had been walking",
        explanation: "Hành động đi bộ diễn ra liên tục 1 tiếng trước đó làm ảnh hưởng ở quá khứ -> Past Perfect Continuous."
      }
    ]
  },
  {
    id: "grammar-future-simple",
    title: "Thì tương lai đơn (Future Simple)",
    category: "grammar",
    level: "A1",
    description: "Cấu trúc S + will + V0, diễn tả quyết định bộc phát tại thời điểm nói, lời hứa, đề nghị giúp đỡ và dự đoán không có căn cứ.",
    durationMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-futsim-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Hôm nay cô trò mình cùng tìm hiểu thì tương lai đơn (Future Simple) để đưa ra quyết định bộc phát, lời hứa hoặc dự đoán tương lai."
      },
      {
        id: "g-futsim-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Thì tương lai đơn diễn tả một quyết định bộc phát được đưa ra ngay tại thời điểm nói, hoặc một lời hứa, đề nghị giúp đỡ, dự đoán không có căn cứ cụ thể."
      },
      {
        id: "g-futsim-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Các từ nhận biết: tomorrow (ngày mai), next week / next month, in the future, soon; hoặc đứng sau các từ think, believe, promise, hope.",
        formula: "Chìa khóa: Tomorrow / Next week / I think / I promise / Soon"
      },
      {
        id: "g-futsim-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Sử dụng trợ động từ WILL đi cùng động từ nguyên thể V0.",
        formula: "(+) Khẳng định: S + will + V0\n(-) Phủ định: S + will not (won't) + V0\n(?) Nghi vấn: Will + S + V0?"
      },
      {
        id: "g-futsim-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Hãy học qua các ví dụ thực tế dưới đây:",
        examples: [
          { english: "Don't worry, I will help you with your homework.", vietnamese: "Đừng lo, cô sẽ giúp em làm bài tập về nhà." },
          { english: "I promise I will not be late again.", vietnamese: "Em hứa em sẽ không đi học muộn nữa." },
          { english: "Will you attend the company party tomorrow?", vietnamese: "Bạn sẽ tham dự buổi tiệc của công ty ngày mai chứ?" }
        ]
      },
      {
        id: "g-futsim-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Phân biệt với 'be going to': 'will' dùng cho quyết định bộc phát ngẫu nhiên lúc nói, còn 'be going to' dùng cho kế hoạch đã dự định và chuẩn bị từ trước."
      }
    ],
    quizQuestions: [
      {
        id: "q-futsim-1",
        type: "multiple-choice",
        question: "The phone is ringing. - OK, I _____ answer it.",
        options: ["will", "am going to", "have", "would"],
        correctAnswer: "will",
        explanation: "Quyết định tức thì ngay tại thời điểm nghe tiếng chuông điện thoại -> Dùng WILL."
      }
    ]
  },
  {
    id: "grammar-future-continuous",
    title: "Thì tương lai tiếp diễn (Future Continuous)",
    category: "grammar",
    level: "B1",
    description: "Cấu trúc S + will + be + V-ing, diễn tả hành động đang xảy ra tại một thời điểm xác định trong tương lai.",
    durationMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-futcont-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Bài học này cô sẽ hướng dẫn các em thì tương lai tiếp diễn (Future Continuous) để mô tả những sự việc đang diễn ra ở một mốc thời gian tương lai."
      },
      {
        id: "g-futcont-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Diễn tả hành động đang diễn ra tại một mốc thời điểm cụ thể hoặc một khoảng thời gian xác định trong tương lai."
      },
      {
        id: "g-futcont-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Có mốc giờ cụ thể ở tương lai: at 9 AM tomorrow, at this time next week, during this summer...",
        formula: "Chìa khóa: At + giờ + mốc tương lai / At this time next week"
      },
      {
        id: "g-futcont-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Bắt buộc gồm WILL + BE + V-ing.",
        formula: "(+) Khẳng định: S + will + be + V-ing\n(-) Phủ định: S + will not + be + V-ing\n(?) Nghi vấn: Will + S + be + V-ing?"
      },
      {
        id: "g-futcont-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Cùng đọc các ví dụ sau:",
        examples: [
          { english: "At 9 AM tomorrow, I will be taking my English exam.", vietnamese: "Vào lúc 9 giờ sáng mai, cô sẽ đang làm bài thi tiếng Anh." },
          { english: "They will not be working this time next week.", vietnamese: "Thời điểm này tuần sau họ sẽ không làm việc." },
          { english: "Will you be using your laptop tonight?", vietnamese: "Tối nay bạn có đang dùng máy tính xách tay không?" }
        ]
      },
      {
        id: "g-futcont-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Luôn ghi nhớ cấu trúc bắt buộc phải có từ 'be' ở giữa 'will' và 'V-ing' (will be V-ing)."
      }
    ],
    quizQuestions: [
      {
        id: "q-futcont-1",
        type: "multiple-choice",
        question: "Don't visit me at 8 PM tonight. I _____ (watch) the championship match.",
        options: ["watch", "will be watching", "will watch", "have watched"],
        correctAnswer: "will be watching",
        explanation: "Mốc thời gian cụ thể 8 PM tối nay -> Future Continuous (will be watching)."
      }
    ]
  },
  {
    id: "grammar-future-perfect",
    title: "Thì tương lai hoàn thành (Future Perfect)",
    category: "grammar",
    level: "B2",
    description: "Cấu trúc S + will + have + V3/ed, diễn tả một hành động sẽ hoàn tất trước một mốc thời gian hoặc một sự việc khác trong tương lai (By + time).",
    durationMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-futperf-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Trong bài học hôm nay, cô sẽ giúp các em làm chủ thì tương lai hoàn thành (Future Perfect) để nói về những cột mốc hoàn thành công việc trong tương lai."
      },
      {
        id: "g-futperf-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Thì tương lai hoàn thành dùng để diễn tả một hành động sẽ hoàn tất trước một mốc thời gian hoặc trước một hành động khác trong tương lai."
      },
      {
        id: "g-futperf-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Cụm từ bắt đầu bằng 'By': by next month, by 2030, by the time you come back, by Friday...",
        formula: "Chìa khóa: By + mốc thời gian tương lai / By the time + mệnh đề hiện tại đơn"
      },
      {
        id: "g-futperf-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Sử dụng WILL HAVE đi cùng V3/ed.",
        formula: "(+) Khẳng định: S + will + have + V3/ed\n(-) Phủ định: S + will not + have + V3/ed\n(?) Nghi vấn: Will + S + have + V3/ed?"
      },
      {
        id: "g-futperf-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Tham khảo các ví dụ thực tiễn dưới đây:",
        examples: [
          { english: "By the end of this year, I will have finished my bachelor degree.", vietnamese: "Tính đến cuối năm nay, cô sẽ hoàn thành xong bằng cử nhân của mình." },
          { english: "He will not have completed the construction by next Monday.", vietnamese: "Anh ấy sẽ chưa hoàn thành xong công trình trước thứ Hai tuần sau." },
          { english: "Will you have built the new website by tomorrow morning?", vietnamese: "Liệu bạn có hoàn thành trang web mới trước sáng mai không?" }
        ]
      },
      {
        id: "g-futperf-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Mệnh đề chỉ thời gian đứng sau 'by the time' chia ở thì hiện tại đơn, còn mệnh đề chính chứa kết quả hoàn thành chia ở thì tương lai hoàn thành."
      }
    ],
    quizQuestions: [
      {
        id: "q-futperf-1",
        type: "multiple-choice",
        question: "By the time you return next week, I _____ (complete) the assignment.",
        options: ["will complete", "will have completed", "completed", "am completing"],
        correctAnswer: "will have completed",
        explanation: "Dấu hiệu 'By the time...' báo hiệu hành động hoàn thành trước mốc tương lai -> Future Perfect."
      }
    ]
  },
  {
    id: "grammar-future-perfect-continuous",
    title: "Thì tương lai hoàn thành tiếp diễn (Future Perfect Continuous)",
    category: "grammar",
    level: "C1",
    description: "Cấu trúc S + will + have + been + V-ing, nhấn mạnh khoảng thời gian kéo dài liên tục của hành động tính đến mốc thời gian trong tương lai.",
    durationMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-futpc-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Bài học này cô trò mình sẽ chinh phục thì tương lai hoàn thành tiếp diễn (Future Perfect Continuous) - thì nâng cao để nhấn mạnh thời lượng kéo dài tính tới mốc tương lai."
      },
      {
        id: "g-futpc-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Diễn tả một hành động bắt đầu từ quá khứ hoặc hiện tại và kéo dài liên tục cho đến một thời điểm nhất định trong tương lai."
      },
      {
        id: "g-futpc-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Các cụm phối hợp: by the time..., by next year... for 10 years, how long...",
        formula: "Chìa khóa: By... for + khoảng thời gian"
      },
      {
        id: "g-futpc-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Sử dụng WILL HAVE BEEN V-ing.",
        formula: "(+) Khẳng định: S + will + have + been + V-ing\n(-) Phủ định: S + will not + have + been + V-ing\n(?) Nghi vấn: Will + S + have + been + V-ing?"
      },
      {
        id: "g-futpc-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Dưới đây là các ví dụ minh họa:",
        examples: [
          { english: "By next month, I will have been teaching English here for ten years.", vietnamese: "Tính đến tháng sau, cô sẽ dạy học tiếng Anh ở đây liên tục được 10 năm." },
          { english: "They will not have been working together for long by then.", vietnamese: "Họ sẽ làm việc cùng nhau chưa lâu tính đến lúc đó." },
          { english: "How long will you have been living in this city by 2028?", vietnamese: "Bạn sẽ sống ở thành phố này liên tục được bao lâu tính đến năm 2028?" }
        ]
      },
      {
        id: "g-futpc-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Thì này chú trọng vào con số thời gian kéo dài (thời lượng) của quá trình."
      }
    ],
    quizQuestions: [
      {
        id: "q-futpc-1",
        type: "multiple-choice",
        question: "By 5 PM, she _____ (work) on the report for 8 hours.",
        options: ["will work", "will have been working", "has been working", "worked"],
        correctAnswer: "will have been working",
        explanation: "Nhấn mạnh quá trình kéo dài 8 tiếng tính đến mốc 5 PM -> Future Perfect Continuous."
      }
    ]
  },

  // ==================== BÀI HỌC SO SÁNH & TỔNG HỢP CHUYÊN ĐỀ ====================
  {
    id: "grammar-compare-present-perfect-past-simple",
    title: "[Tổng hợp & phân biệt] Thì hiện tại hoàn thành vs Thì quá khứ đơn",
    category: "grammar",
    level: "B1",
    description: "Bảng so sánh chuyên sâu hai thì dễ nhầm lẫn nhất: Thời gian xác định vs Không xác định, hành động đã chấm dứt vs kết quả còn ảnh hưởng.",
    durationMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-comp-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Trong bài học tổng hợp này, cô sẽ giúp các em phân biệt triệt để hai thì dễ nhầm lẫn nhất trong tiếng Anh: Thì hiện tại hoàn thành và Thì quá khứ đơn."
      },
      {
        id: "g-comp-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Quá khứ đơn dùng cho hành động có thời gian XÁC ĐỊNH và đã KẾT THÚC hoàn toàn trong quá khứ. Hiện tại hoàn thành dùng cho hành động KHÔNG XÁC ĐỊNH thời gian hoặc còn kéo dài / ảnh hưởng tới hiện tại."
      },
      {
        id: "g-comp-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "• Quá khứ đơn: yesterday, ago, last year, in 2010.\n• Hiện tại hoàn thành: since, for, ever, never, just, already, so far.",
        formula: "Quá khứ đơn: Mốc thời gian xác định | Hiện tại hoàn thành: Thời gian không xác định / Since / For"
      },
      {
        id: "g-comp-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "So sánh công thức trực quan giữa hai thì:",
        formula: "Quá khứ đơn: S + V2/ed | S + did not + V0 | Did + S + V0?\nHiện tại hoàn thành: S + have/has + V3/ed | S + have/has not + V3/ed | Have/Has + S + V3/ed?"
      },
      {
        id: "g-comp-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "So sánh hai câu ví dụ để thấy rõ sự khác biệt ngữ nghĩa:",
        examples: [
          { english: "I lost my keys yesterday.", vietnamese: "Tôi đã làm mất chìa khóa hôm qua (thời gian xác định)." },
          { english: "I have lost my keys.", vietnamese: "Tôi đã làm mất chìa khóa rồi (hiện tại tôi vẫn chưa tìm thấy)." },
          { english: "She did not call me last night.", vietnamese: "Tối qua cô ấy không gọi cho tôi." },
          { english: "She has not called me yet.", vietnamese: "Cô ấy vẫn chưa gọi cho tôi." }
        ]
      },
      {
        id: "g-comp-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Khi nhìn thấy các từ chỉ thời gian quá khứ cụ thể như 'yesterday', 'last night' hay 'in 2022', lập tức chọn thì quá khứ đơn!"
      }
    ],
    quizQuestions: [
      {
        id: "q-comp-1",
        type: "multiple-choice",
        question: "Compare: 'Shakespeare _____ many famous plays.' vs 'JK Rowling _____ many books.'",
        options: ["wrote / has written", "has written / wrote", "wrote / wrote", "has written / has written"],
        correctAnswer: "wrote / has written",
        explanation: "Shakespeare đã qua đời (quá khứ đơn -> wrote). JK Rowling còn sống và có thể tiếp tục sáng tác (hiện tại hoàn thành -> has written)."
      }
    ]
  },
  {
    id: "grammar-compare-present-simple-continuous",
    title: "[Tổng hợp & phân biệt] Thì hiện tại đơn vs Thì hiện tại tiếp diễn",
    category: "grammar",
    level: "A2",
    description: "Chuyên đề phân biệt thói quen/bản chất cố định (Present Simple) với trạng thái tạm thời/hành động đang diễn ra (Present Continuous).",
    durationMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-comp2-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Bài học này cô sẽ giúp các em so sánh và làm rõ sự khác biệt giữa Thì hiện tại đơn và Thì hiện tại tiếp diễn."
      },
      {
        id: "g-comp2-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Hiện tại đơn diễn tả bản chất cố định, thói quen hằng ngày và sự thật hiển nhiên. Hiện tại tiếp diễn diễn tả sự việc tạm thời hoặc hành động đang diễn ra ngay lúc nói."
      },
      {
        id: "g-comp2-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Hiện tại đơn đi với always, usually, every day. Hiện tại tiếp diễn đi với now, right now, at the moment, Look!, Listen!",
        formula: "Hiện tại đơn: Always / Every day | Hiện tại tiếp diễn: Now / At the moment / Look!"
      },
      {
        id: "g-comp2-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Cấu trúc hai thì khác biệt rõ rệt ở động từ:",
        formula: "Hiện tại đơn: S + V(s/es) | S + do/does + not + V0\nHHiện tại tiếp diễn: S + am/is/are + V-ing"
      },
      {
        id: "g-comp2-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Cùng phân tích ví dụ đối chiếu:",
        examples: [
          { english: "I usually drink tea, but today I am drinking coffee.", vietnamese: "Tôi thường uống trà, nhưng hôm nay tôi đang uống cà phê." },
          { english: "He does not work on Saturdays.", vietnamese: "Anh ấy không làm việc vào các ngày thứ Bảy." },
          { english: "He is not working right now.", vietnamese: "Ngay lúc này anh ấy đang không làm việc." }
        ]
      },
      {
        id: "g-comp2-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Đặc biệt ghi nhớ các động từ chỉ cảm xúc và nhận thức (know, understand, love, want) luôn chia ở thì hiện tại đơn."
      }
    ],
    quizQuestions: [
      {
        id: "q-comp2-1",
        type: "multiple-choice",
        question: "I usually _____ (drink) coffee, but today I _____ (drink) tea.",
        options: ["drink / am drinking", "am drinking / drink", "drinks / drinks", "drink / drink"],
        correctAnswer: "drink / am drinking",
        explanation: "Usually chỉ thói quen -> drink (Hiện tại đơn). Today chỉ tạm thời -> am drinking (Hiện tại tiếp diễn)."
      }
    ]
  },
  {
    id: "grammar-compare-past-simple-continuous",
    title: "[Tổng hợp & phân biệt] Thì quá khứ đơn vs Thì quá khứ tiếp diễn (When & While)",
    category: "grammar",
    level: "B1",
    description: "Xử lý triệt để dạng bài tập phối hợp thì trong đề thi: Hành động đang diễn ra (Past Continuous) bị hành động khác cắt ngang (Past Simple).",
    durationMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-comp3-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Cô trò chúng ta cùng xử lý dạng bài tập kết hợp giữa Thì quá khứ đơn và Thì quá khứ tiếp diễn với liên từ When và While."
      },
      {
        id: "g-comp3-2",
        title: "2. Khái niệm & bản chất",
        explanation: "Sử dụng phối hợp khi một hành động đang diễn ra trong quá khứ (dài hơn) thì bị một hành động khác bất ngờ chen ngang (ngắn hơn)."
      },
      {
        id: "g-comp3-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Liên từ 'When' (thường đi với quá khứ đơn) và 'While' (thường đi với quá khứ tiếp diễn).",
        formula: "When + S + V2/ed | While + S + was/were + V-ing"
      },
      {
        id: "g-comp3-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Mô hình phối hợp thì quen thuộc trong đề thi:",
        formula: "While + S + was/were + V-ing, S + V2/ed\nS + was/were + V-ing + when + S + V2/ed"
      },
      {
        id: "g-comp3-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Cùng xem các câu ví dụ mẫu:",
        examples: [
          { english: "While I was driving home, it started to rain heavily.", vietnamese: "Trong khi tôi đang lái xe về nhà thì trời bắt đầu mưa to." },
          { english: "She was cooking dinner when her husband came home.", vietnamese: "Cô ấy đang nấu bữa tối thì chồng cô ấy về tới nhà." },
          { english: "What were you doing when the power went out?", vietnamese: "Bạn đang làm gì khi bị cúp điện?" }
        ]
      },
      {
        id: "g-comp3-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Khi hai hành động diễn ra song song cùng lúc trong quá khứ, chia cả hai mệnh đề ở quá khứ tiếp diễn (ví dụ: While I was reading, my brother was playing games)."
      }
    ],
    quizQuestions: [
      {
        id: "q-comp3-1",
        type: "multiple-choice",
        question: "While my mother _____ (cook) dinner, the electricity _____ (go) out.",
        options: ["was cooking / went", "cooked / was going", "was cooking / was going", "cooked / went"],
        correctAnswer: "was cooking / went",
        explanation: "Nấu ăn là hành động kéo dài (While was cooking), mất điện là hành động cắt ngang (went)."
      }
    ]
  },
  {
    id: "grammar-mastery-12-tenses",
    title: "[Tổng hợp & phân biệt] Hệ thống toàn bộ 12 thì trong tiếng Anh (Mastery guide)",
    category: "grammar",
    level: "B2",
    description: "Bản đồ ma trận 3x4 toàn diện hệ thống hóa 12 thì trong tiếng Anh giúp tra cứu, so sánh và không bao giờ chọn nhầm thì.",
    durationMinutes: 25,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    grammarSections: [
      {
        id: "g-m12-1",
        title: "1. Mục tiêu bài học",
        explanation: "Chào các em! Bài học này cô tổng hợp toàn bộ 12 thì trong tiếng Anh thành ma trận 3x4 dễ nhớ, giúp các em không bao giờ bị rối hay nhầm lẫn thì nữa."
      },
      {
        id: "g-m12-2",
        title: "2. Khái niệm & bản chất",
        explanation: "12 thì được tạo nên từ 3 mốc thời gian (Hiện tại - Quá khứ - Tương lai) kết hợp với 4 thể (Đơn - Tiếp diễn - Hoàn thành - Hoàn thành tiếp diễn)."
      },
      {
        id: "g-m12-3",
        title: "3. Dấu hiệu nhận biết",
        explanation: "Nhận biết qua các từ chìa khóa đặc trưng đại diện cho 4 thể:",
        formula: "Đơn: thói quen/sự thật | Tiếp diễn: đang xảy ra | Hoàn thành: đã xong trước 1 mốc | Hoàn thành tiếp diễn: thời lượng kéo dài"
      },
      {
        id: "g-m12-4",
        title: "4. Công thức & cách dùng chi tiết",
        explanation: "Quy tắc nhẩm nhanh công thức 4 thể:",
        formula: "• Đơn: V0 / V(s/es) / V2/ed / will V0\n• Tiếp diễn: be + V-ing\n• Hoàn thành: have/has/had/will have + V3/ed\n• Hoàn thành tiếp diễn: have/has/had/will have + been + V-ing"
      },
      {
        id: "g-m12-5",
        title: "5. Ví dụ minh họa thực tế",
        explanation: "Ví dụ chuỗi câu đại diện:",
        examples: [
          { english: "I study English every day. (Present Simple)", vietnamese: "Tôi học tiếng Anh mỗi ngày (Hiện tại đơn)." },
          { english: "I studied English yesterday. (Past Simple)", vietnamese: "Tôi đã học tiếng Anh ngày hôm qua (Quá khứ đơn)." },
          { english: "I will study English tomorrow. (Future Simple)", vietnamese: "Tôi sẽ học tiếng Anh ngày mai (Tương lai đơn)." },
          { english: "I have studied English for 3 years. (Present Perfect)", vietnamese: "Tôi đã học tiếng Anh được 3 năm (Hiện tại hoàn thành)." }
        ]
      },
      {
        id: "g-m12-6",
        title: "6. Lưu ý nhỏ & mẹo tránh lỗi sai",
        explanation: "• Nắm vững bản chất của 4 thể giúp em suy ra công thức của bất kỳ thì nào mà không cần học vẹt."
      }
    ],
    quizQuestions: [
      {
        id: "q-m12-1",
        type: "multiple-choice",
        question: "Which tense emphasizes the ongoing DURATION of an action up to a point in the future?",
        options: ["Future Simple", "Future Continuous", "Future Perfect", "Future Perfect Continuous"],
        correctAnswer: "Future Perfect Continuous",
        explanation: "Thì Tương lai hoàn thành tiếp diễn nhấn mạnh khoảng thời gian diễn ra liên tục tính đến mốc tương lai."
      }
    ]
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
    id: "listening-airport",
    title: "Luyện nghe: Thủ tục check-in tại sân bay (Airport Check-in)",
    category: "listening",
    level: "A1",
    description: "Luyện nghe hội thoại làm thủ tục bay, chọn chỗ ngồi và gửi hành lý tại quầy hàng không.",
    durationMinutes: 12,
    imageUrl: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    listeningScript: {
      title: "Hội thoại check-in tại quầy vé sân bay",
      topic: "Airport & Travel",
      fullText: "Agent: Good morning! Welcome to Sky Airways. May I see your passport and booking reference?\nPassenger: Good morning! Here is my passport and reservation code.\nAgent: Thank you. Would you prefer a window seat or an aisle seat today?\nPassenger: An aisle seat, please. Also, I have one suitcase to check in.\nAgent: Perfect. Here is your boarding pass. Gate 12, boarding starts at 2:30 PM.",
      lines: [
        {
          speaker: "Agent",
          english: "Good morning! Welcome to Sky Airways. May I see your passport and booking reference?",
          vietnamese: "Xin chào quý khách! Chào mừng đến với Sky Airways. Cho tôi xem hộ chiếu và mã đặt vé của bạn được không?",
        },
        {
          speaker: "Passenger",
          english: "Good morning! Here is my passport and reservation code.",
          vietnamese: "Chào cô! Đây là hộ chiếu và mã đặt chỗ của tôi.",
        },
        {
          speaker: "Agent",
          english: "Thank you. Would you prefer a window seat or an aisle seat today?",
          vietnamese: "Cảm ơn quý khách. Hôm nay bạn muốn chọn ghế cạnh cửa sổ hay ghế cạnh lối đi?",
        },
        {
          speaker: "Passenger",
          english: "An aisle seat, please. Also, I have one suitcase to check in.",
          vietnamese: "Cho tôi ghế cạnh lối đi nhé. Ngoài ra, tôi có một vali cần ký gửi.",
        },
        {
          speaker: "Agent",
          english: "Perfect. Here is your boarding pass. Gate 12, boarding starts at 2:30 PM.",
          vietnamese: "Hoàn hảo. Đây là thẻ lên máy bay của bạn. Cổng số 12, giờ lên máy bay bắt đầu lúc 2 giờ 30 phút chiều.",
        },
      ],
    },
    quizQuestions: [
      {
        id: "q-air-1",
        type: "multiple-choice",
        question: "What type of seat did the passenger choose?",
        options: ["Window seat", "Aisle seat", "Middle seat", "Extra legroom"],
        correctAnswer: "Aisle seat",
        explanation: "Hành khách yêu cầu: 'An aisle seat, please' (ghế cạnh lối đi).",
      },
      {
        id: "q-air-2",
        type: "multiple-choice",
        question: "What gate is the flight boarding at?",
        options: ["Gate 8", "Gate 10", "Gate 12", "Gate 14"],
        correctAnswer: "Gate 12",
        explanation: "Nhân viên thông báo: 'Gate 12, boarding starts at 2:30 PM'.",
      }
    ],
  },

  {
    id: "listening-restaurant",
    title: "Luyện nghe: Đặt món tại nhà hàng (Ordering Food at a Restaurant)",
    category: "listening",
    level: "A2",
    description: "Luyện nghe giao tiếp với bồi bàn, hỏi thực đơn, gọi món ăn đặc biệt và gọi nước uống.",
    durationMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    listeningScript: {
      title: "Hội thoại gọi món ăn tại nhà hàng phương Tây",
      topic: "Dining & Restaurant",
      fullText: "Waiter: Good evening! Are you ready to order, or do you need a few more minutes?\nCustomer: We are ready, thank you. What is the chef's special today?\nWaiter: Today's special is grilled salmon with garlic butter sauce and roasted vegetables.\nCustomer: That sounds delicious! I will have the salmon, and a glass of fresh orange juice.\nWaiter: Excellent choice! I will bring your drink right away.",
      lines: [
        {
          speaker: "Waiter",
          english: "Good evening! Are you ready to order, or do you need a few more minutes?",
          vietnamese: "Chào buổi tối quý khách! Bạn đã sẵn sàng gọi món chưa, hay cần thêm vài phút?",
        },
        {
          speaker: "Customer",
          english: "We are ready, thank you. What is the chef's special today?",
          vietnamese: "Chúng tôi sẵn sàng rồi, cảm ơn anh. Món đặc biệt của đầu bếp hôm nay là gì vậy?",
        },
        {
          speaker: "Waiter",
          english: "Today's special is grilled salmon with garlic butter sauce and roasted vegetables.",
          vietnamese: "Món đặc biệt hôm nay là cá hồi nướng sốt bơ tỏi ăn kèm rau củ nướng.",
        },
        {
          speaker: "Customer",
          english: "That sounds delicious! I will have the salmon, and a glass of fresh orange juice.",
          vietnamese: "Nghe hấp dẫn quá! Cho tôi một phần cá hồi và một ly nước cam tươi nhé.",
        },
        {
          speaker: "Waiter",
          english: "Excellent choice! I will bring your drink right away.",
          vietnamese: "Lựa chọn tuyệt vời! Tôi sẽ mang đồ uống lên cho bạn ngay lập tức.",
        },
      ],
    },
    quizQuestions: [
      {
        id: "q-rest-1",
        type: "multiple-choice",
        question: "What is the chef's special dish today?",
        options: ["Grilled chicken", "Beef steak", "Grilled salmon", "Seafood pasta"],
        correctAnswer: "Grilled salmon",
        explanation: "Bồi bàn giới thiệu món đặc biệt là 'grilled salmon with garlic butter sauce'.",
      },
    ],
  },

  {
    id: "listening-shopping",
    title: "Luyện nghe: Mua sắm & hỏi giảm giá (Shopping & Discounts)",
    category: "listening",
    level: "A2",
    description: "Luyện nghe tình huống tìm mua trang phục, chọn kích cỡ chuẩn và hỏi chương trình khuyến mãi.",
    durationMinutes: 14,
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    listeningScript: {
      title: "Hội thoại mua sắm tại cửa hàng thời trang",
      topic: "Shopping & Fashion",
      fullText: "Salesperson: Hi there! Can I help you find a specific size or color for this jacket?\nShopper: Yes, please. Do you have this blue denim jacket in medium?\nSalesperson: Let me check our stock... Yes, here is a medium for you to try on.\nShopper: It fits perfectly! Is there any discount on this item today?\nSalesperson: If you pay by card today, you get an extra 10% discount at checkout.",
      lines: [
        {
          speaker: "Salesperson",
          english: "Hi there! Can I help you find a specific size or color for this jacket?",
          vietnamese: "Xin chào! Tôi có thể giúp bạn tìm kích cỡ hay màu sắc cụ thể cho chiếc áo khoác này không?",
        },
        {
          speaker: "Shopper",
          english: "Yes, please. Do you have this blue denim jacket in medium?",
          vietnamese: "Dạ có. Bạn có chiếc áo khoác bò màu xanh này size M không?",
        },
        {
          speaker: "Salesperson",
          english: "Let me check our stock... Yes, here is a medium for you to try on.",
          vietnamese: "Để tôi kiểm tra kho... Dạ có, đây là size M cho bạn mặc thử.",
        },
        {
          speaker: "Shopper",
          english: "It fits perfectly! Is there any discount on this item today?",
          vietnamese: "Áo vừa vặn lắm! Hôm nay sản phẩm này có được giảm giá không bạn?",
        },
        {
          speaker: "Salesperson",
          english: "If you pay by card today, you get an extra 10% discount at checkout.",
          vietnamese: "Nếu bạn thanh toán bằng thẻ hôm nay, bạn sẽ được giảm thêm 10% khi tính tiền.",
        },
      ],
    },
    quizQuestions: [
      {
        id: "q-shop-1",
        type: "multiple-choice",
        question: "How much extra discount does the customer get for paying by card?",
        options: ["5%", "10%", "15%", "20%"],
        correctAnswer: "10%",
        explanation: "Nhân viên thông báo: 'you get an extra 10% discount at checkout'.",
      },
    ],
  },

  {
    id: "listening-workplace",
    title: "Luyện nghe: Giao tiếp công sở & cuộc họp dự án (Workplace Meeting)",
    category: "listening",
    level: "B1",
    description: "Luyện nghe thảo luận tiến độ phát triển dự án, phân công nhiệm vụ và cam kết thời gian.",
    durationMinutes: 18,
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    listeningScript: {
      title: "Hội thoại cuộc họp tiến độ dự án phần mềm",
      topic: "Workplace & Technology",
      fullText: "Project Lead: Good morning team! Let's review our progress for the upcoming app release.\nDeveloper: The main user interface is 90% complete, but we need more time for security testing.\nProject Lead: Can we finish the security testing before Friday's deadline?\nDeveloper: Yes, if we assign two more engineers to focus on API authentication.\nProject Lead: Great idea! I will coordinate with the QA team immediately.",
      lines: [
        {
          speaker: "Project Lead",
          english: "Good morning team! Let's review our progress for the upcoming app release.",
          vietnamese: "Chào buổi sáng cả đội! Chúng ta hãy cùng điểm qua tiến độ cho đợt ra mắt ứng dụng sắp tới.",
        },
        {
          speaker: "Developer",
          english: "The main user interface is 90% complete, but we need more time for security testing.",
          vietnamese: "Giao diện người dùng chính đã hoàn thành 90%, nhưng chúng tôi cần thêm thời gian để kiểm thử bảo mật.",
        },
        {
          speaker: "Project Lead",
          english: "Can we finish the security testing before Friday's deadline?",
          vietnamese: "Chúng ta có thể hoàn thành kiểm thử bảo mật trước hạn chót thứ Sáu không?",
        },
        {
          speaker: "Developer",
          english: "Yes, if we assign two more engineers to focus on API authentication.",
          vietnamese: "Có thể, nếu chúng ta phân công thêm hai kỹ sư tập trung vào xác thực API.",
        },
        {
          speaker: "Project Lead",
          english: "Great idea! I will coordinate with the QA team immediately.",
          vietnamese: "Ý tưởng tuyệt vời! Tôi sẽ phối hợp với đội kiểm thử chất lượng ngay lập tức.",
        },
      ],
    },
    quizQuestions: [
      {
        id: "q-work-1",
        type: "multiple-choice",
        question: "What percentage of the main user interface is complete?",
        options: ["70%", "80%", "90%", "100%"],
        correctAnswer: "90%",
        explanation: "Lập trình viên nói: 'The main user interface is 90% complete'.",
      },
    ],
  },

  {
    id: "listening-medical",
    title: "Luyện nghe: Khám bệnh tại phòng khám (Medical Checkup at Clinic)",
    category: "listening",
    level: "B1",
    description: "Luyện nghe hội thoại miêu tả triệu chứng sức khỏe và nhận lời khuyên, đơn thuốc từ bác sĩ.",
    durationMinutes: 16,
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    listeningScript: {
      title: "Hội thoại khám sức khỏe cùng bác sĩ",
      topic: "Health & Medicine",
      fullText: "Doctor: Hello Mr. Green. What symptoms have you been experiencing lately?\nPatient: Doctor, I have had a severe headache and sore throat for three days.\nDoctor: Let me check your temperature and blood pressure... You have a mild fever.\nPatient: Is it serious, doctor? Do I need to take time off work?\nDoctor: No need to worry. I will prescribe some medicine and recommend rest for two days.",
      lines: [
        {
          speaker: "Doctor",
          english: "Hello Mr. Green. What symptoms have you been experiencing lately?",
          vietnamese: "Chào anh Green. Gần đây anh gặp phải những triệu chứng sức khỏe nào?",
        },
        {
          speaker: "Patient",
          english: "Doctor, I have had a severe headache and sore throat for three days.",
          vietnamese: "Thưa bác sĩ, tôi bị đau đầu dữ dội và đau họng suốt ba ngày nay.",
        },
        {
          speaker: "Doctor",
          english: "Let me check your temperature and blood pressure... You have a mild fever.",
          vietnamese: "Để tôi kiểm tra nhiệt độ và huyết áp cho anh... Anh bị sốt nhẹ rồi.",
        },
        {
          speaker: "Patient",
          english: "Is it serious, doctor? Do I need to take time off work?",
          vietnamese: "Bệnh có nghiêm trọng không bác sĩ? Tôi có cần xin nghỉ làm không?",
        },
        {
          speaker: "Doctor",
          english: "No need to worry. I will prescribe some medicine and recommend rest for two days.",
          vietnamese: "Không cần lo lắng quá. Tôi sẽ kê đơn thuốc và khuyên anh nên nghỉ ngơi trong hai ngày.",
        },
      ],
    },
    quizQuestions: [
      {
        id: "q-med-1",
        type: "multiple-choice",
        question: "How long has the patient had a severe headache?",
        options: ["1 day", "2 days", "3 days", "1 week"],
        correctAnswer: "3 days",
        explanation: "Bệnh nhân nói: 'for three days' (được 3 ngày rồi).",
      },
    ],
  },

  {
    id: "listening-hotel",
    title: "Luyện nghe: Nhận phòng & dịch vụ khách sạn (Hotel Check-in & Concierge)",
    category: "listening",
    level: "B2",
    description: "Luyện nghe tình huống nhận phòng cao cấp, hỏi dịch vụ ăn sáng và hướng dẫn lên phòng.",
    durationMinutes: 16,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    listeningScript: {
      title: "Hội thoại check-in tại lễ tân khách sạn 5 sao",
      topic: "Hotel & Hospitality",
      fullText: "Receptionist: Good afternoon! Welcome to Grand Palace Hotel. How may I assist you?\nGuest: Hello, I have a reservation under the name David Miller for three nights.\nReceptionist: Ah yes, Mr. Miller. A deluxe ocean-view suite with breakfast included.\nGuest: That's correct. What time is breakfast served in the morning?\nReceptionist: Breakfast is served from 6:30 AM to 10:30 AM at our rooftop restaurant.",
      lines: [
        {
          speaker: "Receptionist",
          english: "Good afternoon! Welcome to Grand Palace Hotel. How may I assist you?",
          vietnamese: "Chào buổi chiều! Chào mừng quý khách đến với khách sạn Grand Palace. Tôi có thể giúp gì cho bạn?",
        },
        {
          speaker: "Guest",
          english: "Hello, I have a reservation under the name David Miller for three nights.",
          vietnamese: "Xin chào, tôi có đặt phòng trước dưới tên David Miller trong ba đêm.",
        },
        {
          speaker: "Receptionist",
          english: "Ah yes, Mr. Miller. A deluxe ocean-view suite with breakfast included.",
          vietnamese: "Dạ đúng rồi, thưa ông Miller. Phòng suite cao cấp hướng biển đã bao gồm bữa sáng.",
        },
        {
          speaker: "Guest",
          english: "That's correct. What time is breakfast served in the morning?",
          vietnamese: "Chính xác rồi. Mấy giờ thì bữa sáng được phục vụ vào buổi sáng vậy?",
        },
        {
          speaker: "Receptionist",
          english: "Breakfast is served from 6:30 AM to 10:30 AM at our rooftop restaurant.",
          vietnamese: "Bữa sáng được phục vụ từ 6 giờ 30 phút sáng đến 10 giờ 30 phút sáng tại nhà hàng trên tầng thượng.",
        },
      ],
    },
    quizQuestions: [
      {
        id: "q-hotel-1",
        type: "multiple-choice",
        question: "Where is breakfast served in the hotel?",
        options: ["Main lobby", "Poolside bar", "Rooftop restaurant", "In-room dining"],
        correctAnswer: "Rooftop restaurant",
        explanation: "Lễ tân thông báo: 'at our rooftop restaurant' (tại nhà hàng tầng thượng).",
      },
    ],
  },

  {
    id: "listening-tech-support",
    title: "Luyện nghe: Hỗ trợ kỹ thuật & xử lý sự cố (Tech Support & Troubleshooting)",
    category: "listening",
    level: "C1",
    description: "Luyện nghe trao đổi chuyên sâu xử lý lỗi phần mềm, kết nối máy chủ và hỗ trợ kỹ thuật cao cấp.",
    durationMinutes: 20,
    imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date().toISOString(),
    listeningScript: {
      title: "Hội thoại hỗ trợ kỹ thuật máy chủ & cơ sở dữ liệu",
      topic: "Tech Support & IT",
      fullText: "Support Agent: Tech Support, my name is Sarah. How can I resolve your technical issue today?\nCustomer: Hi Sarah. Our company server experienced a database timeout after the latest system patch.\nSupport Agent: I see. Have you checked the error log files for memory allocation warnings?\nCustomer: Yes, the log indicates a memory overflow in the primary connection pool.\nSupport Agent: Understood. Please increase the connection limit in config.env and restart the service.",
      lines: [
        {
          speaker: "Support Agent",
          english: "Tech Support, my name is Sarah. How can I resolve your technical issue today?",
          vietnamese: "Bộ phận hỗ trợ kỹ thuật, tôi là Sarah. Tôi có thể xử lý sự cố kỹ thuật nào cho bạn hôm nay?",
        },
        {
          speaker: "Customer",
          english: "Hi Sarah. Our company server experienced a database timeout after the latest system patch.",
          vietnamese: "Chào Sarah. Máy chủ công ty chúng tôi bị lỗi hết giờ kết nối cơ sở dữ liệu sau bản vá hệ thống mới nhất.",
        },
        {
          speaker: "Support Agent",
          english: "I see. Have you checked the error log files for memory allocation warnings?",
          vietnamese: "Tôi hiểu rồi. Bạn đã kiểm tra các tệp nhật ký lỗi xem có cảnh báo cấp phát bộ nhớ không?",
        },
        {
          speaker: "Customer",
          english: "Yes, the log indicates a memory overflow in the primary connection pool.",
          vietnamese: "Có, tệp nhật ký chỉ ra rằng có sự cố tràn bộ nhớ trong nhóm kết nối chính.",
        },
        {
          speaker: "Support Agent",
          english: "Understood. Please increase the connection limit in config.env and restart the service.",
          vietnamese: "Tôi hiểu rồi. Vui lòng tăng giới hạn kết nối trong tệp config.env và khởi động lại dịch vụ.",
        },
      ],
    },
    quizQuestions: [
      {
        id: "q-tech-1",
        type: "multiple-choice",
        question: "What issue did the company server experience after the system patch?",
        options: ["Network outage", "Database timeout", "Disk failure", "CPU overheating"],
        correctAnswer: "Database timeout",
        explanation: "Khách hàng miêu tả: 'experienced a database timeout after the latest system patch'.",
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

// Get all registered users (Admin only)
app.get("/api/admin/users", (req, res) => {
  if (currentUser.role !== "admin") {
    return res.status(403).json({ error: "Chỉ Admin mới có quyền xem danh sách người dùng" });
  }
  res.json(currentUsers);
});

// Update user role by ID (Admin only)
app.post("/api/admin/users/:id/role", (req, res) => {
  if (currentUser.role !== "admin") {
    return res.status(403).json({ error: "Chỉ Admin mới có quyền cập nhật vai trò người dùng" });
  }
  const { id } = req.params;
  const { role } = req.body;
  if (role !== "admin" && role !== "user") {
    return res.status(400).json({ error: "Vai trò không hợp lệ" });
  }

  const targetUser = currentUsers.find((u) => u.id === id);
  if (!targetUser) {
    // If user not in local array, add a mock entry with updated role
    const newUser = {
      id,
      name: "Học viên",
      email: "user@englishub.com",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      role: role as "admin" | "user",
      level: "B1",
      streak: 1,
      xp: 100,
      completedLessons: [],
    };
    currentUsers.push(newUser);
    return res.json({ success: true, user: newUser });
  }

  targetUser.role = role;
  if (targetUser.id === currentUser.id) {
    currentUser.role = role;
  }
  res.json({ success: true, user: targetUser });
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
1. Trả lời bằng tiếng Anh tự nhiên.
2. Nếu học viên có lỗi sai ngữ pháp/từ vựng trong tin nhắn của họ, hãy dịu dàng sửa lỗi (Correction) và nêu rõ lý do bằng tiếng Anh trong phần phản hồi chính.
3. Luôn kết thúc bằng 1 câu hỏi tương tác để khuyến khích học viên đáp lại.
4. Giữ giọng văn tự nhiên, khuyến khích và chuyên nghiệp.

TRẢ VỀ ĐÚNG 1 ĐỊNH DẠNG JSON DUY NHẤT VỚI CÁC TRƯỜNG:
{
  "text": "Nội dung phản hồi chính bằng Tiếng Anh (bao gồm nhận xét sửa lỗi nếu có + câu trả lời + câu hỏi tương tác). Dùng định dạng Markdown đẹp mắt.",
  "translation": "Bản dịch tiếng Việt súc tích, hoàn chỉnh của toàn bộ phần phản hồi chính bằng tiếng Anh ở trên.",
  "suggestedReply": "1 câu tiếng Anh ngắn gọn (10-15 từ) gợi ý để học viên có thể bấm đáp lại ngay"
}

QUY TẮC TIẾNG VIỆT CHO BẢN DỊCH:
Tất cả câu tiếng Việt CHỈ VIẾT HOA CHỮ CÁI ĐẦU TIÊN CỦA CÂU hoặc danh từ riêng. TUYỆT ĐỐI KHÔNG dùng Title Case.`;

    const promptText = messages.map((m: any) => `${m.sender === "user" ? "User" : "Engie AI"}: ${m.text}`).join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    let data: any = {};
    try {
      data = JSON.parse(response.text || "{}");
    } catch (e) {
      data = { text: response.text };
    }

    res.json({
      text: data.text || response.text || "I'm ready to practice English with you!",
      translation: data.translation || "",
      suggestedReply: data.suggestedReply || "",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Gemini AI Tutor Error:", error);
    res.status(500).json({ error: "Không thể kết nối với Gia sư AI. Vui lòng thử lại sau." });
  }
});

// Gemini AI Dynamic Quiz Generator (Real-time dynamic quiz generation)
app.post("/api/ai/generate-quiz", async (req, res) => {
  try {
    const { topic, level, count, category, grammarSections, vocabularyItems, randomSeed } = req.body;

    const questionCount = Math.min(Math.max(Number(count) || 7, 5), 10);
    const targetTopic = topic || "Ngữ pháp & từ vựng tiếng Anh";
    const targetLevel = level || "B1";
    const seed = randomSeed || `${Date.now()}_${Math.random()}`;

    let contextDetails = "";
    if (grammarSections && Array.isArray(grammarSections) && grammarSections.length > 0) {
      contextDetails += `\nCấu trúc bài học liên quan:\n` + grammarSections.map((g: any) => `- ${g.title}: ${g.explanation || ''} ${g.formula || ''}`).join("\n");
    }
    if (vocabularyItems && Array.isArray(vocabularyItems) && vocabularyItems.length > 0) {
      contextDetails += `\nTừ vựng trọng tâm bài học:\n` + vocabularyItems.map((v: any) => `- ${v.word} (${v.partOfSpeech}): ${v.meaning}`).join("\n");
    }

    const prompt = `Bạn là một chuyên gia thiết kế đề thi khảo thí Tiếng Anh hàng đầu.
Hãy tự động sinh ngẫu nhiên một bộ gồm ĐÚNG ${questionCount} câu hỏi trắc nghiệm tiếng Anh hoàn toàn mới cho bài học / chủ đề: "${targetTopic}" (Trình độ CEFR ${targetLevel}).

MÃ ĐỊNH DANH NGẪU NHIÊN LƯỢT SINH NÀY: ${seed}
(Đảm bảo sinh câu hỏi ngẫu nhiên, mới mẻ hoàn toàn, không lặp lại các câu hỏi cũ ở các lượt sinh trước).

${contextDetails}

YÊU CẦU CẤU TRÚC BỘ CÂU HỎI CHUẨN SƯ PHẠM (${questionCount} CÂU):
Bộ câu hỏi PHẢI BAO PHỦ ĐA DẠNG các dạng bài tập sau:
1. Chia động từ trong ngoặc (Verb conjugation)
2. Dấu hiệu nhận biết thì / từ chìa khóa (Recognition signals / time markers)
3. Phân biệt các thể: Câu khẳng định (+), phủ định (-), nghi vấn (?)
4. Tìm lỗi sai ngữ pháp / từ vựng trong câu (Error detection)
5. Điền từ thích hợp vào chỗ trống (Fill in the blank)

YÊU CẦU QUY TẮC TIẾNG VIỆT (BẮT BUỘC):
1. Tất cả phần giải thích (explanation) và nhãn bằng tiếng Việt CHỈ VIẾT HOA CHỮ CÁI ĐẦU TIÊN CỦA CÂU hoặc danh từ riêng.
2. TUYỆT ĐỐI KHÔNG dùng Title Case (viết hoa chữ cái đầu của mỗi từ). 
   - Ví dụ SAI: "Thì Hiện Tại Hoàn Thành Được Dùng Để..."
   - Ví dụ ĐÚNG: "Thì hiện tại hoàn thành được dùng để chỉ hành động vừa mới xảy ra..."

ĐỊNH DẠNG TRẢ VỀ:
Trả về ĐÚNG 1 JSON array chứa chính xác ${questionCount} câu hỏi với cấu trúc:
[
  {
    "id": "q1",
    "type": "multiple-choice" hoặc "fill-blank",
    "question": "Nội dung câu hỏi bằng tiếng Anh...",
    "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
    "correctAnswer": "Đáp án đúng chính xác",
    "explanation": "Giải thích ngắn gọn, súc tích bằng tiếng Việt (tuân thủ quy tắc viết hoa)."
  }
]`;

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

// Gemini AI Automatic Lesson Content Generator (Admin)
app.post("/api/ai/generate-lesson-content", async (req, res) => {
  try {
    const { topic, level, category } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập chủ đề bài học." });
    }

    const selectedCategory = category || 'vocabulary';
    let prompt = '';

    if (selectedCategory === 'grammar') {
      prompt = `Hãy đóng vai một chuyên gia giáo trình Tiếng Anh hàng đầu.
Hãy tự động tạo nội dung bài học NGỮ PHÁP TIẾNG ANH về chủ đề "${topic.trim()}" ở trình độ CEFR "${level || "B1"}".

Trả về ĐÚNG ĐỊNH DẠNG JSON duy nhất với cấu trúc:
{
  "title": "Tên bài học ngữ pháp (vd: Cấu trúc ${topic.trim()})",
  "description": "Mô tả ngắn 1-2 câu về cách dùng và ngữ cảnh sử dụng ngữ pháp này",
  "grammarSections": [
    {
      "id": "g1",
      "title": "Công thức & Cách dùng ${topic.trim()}",
      "explanation": "Giải thích chi tiết quy tắc ngữ pháp bằng tiếng Việt",
      "formula": "S + V(s/es) + O...",
      "examples": [
        { "english": "Câu ví dụ tiếng Anh", "vietnamese": "Dịch nghĩa tiếng Việt" }
      ]
    }
  ],
  "vocabularyItems": [
    {
      "word": "từ vựng trọng tâm liên quan",
      "phonetic": "/phiên âm IPA/",
      "partOfSpeech": "verb/noun/adj",
      "meaning": "nghĩa tiếng Việt",
      "example": "ví dụ tiếng Anh",
      "exampleMeaning": "dịch nghĩa ví dụ"
    }
  ],
  "quizQuestions": [
    {
      "type": "multiple-choice",
      "question": "Câu hỏi kiểm tra ngữ pháp ${topic.trim()}",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctAnswer": "Đáp án đúng",
      "explanation": "Giải thích cấu trúc chọn đáp án này bằng tiếng Việt"
    }
  ]
}`;
    } else if (selectedCategory === 'listening') {
      prompt = `Hãy đóng vai một chuyên gia biên soạn giáo trình Tiếng Anh hàng đầu.
Hãy tự động tạo bài học LUYỆN NGHE & NÓI HỘI THOẠI thực tế về chủ đề "${topic.trim()}" ở trình độ CEFR "${level || "B1"}".

Trả về ĐÚNG ĐỊNH DẠNG JSON duy nhất với cấu trúc:
{
  "title": "Luyện nghe: ${topic.trim()}",
  "description": "Mô tả ngắn 1-2 câu về ngữ cảnh và mục tiêu rèn luyện phản xạ nghe nói thực tế cho chủ đề này",
  "listeningScript": {
    "title": "Hội thoại luyện nghe chủ đề ${topic.trim()}",
    "topic": "${topic.trim()}",
    "fullText": "Toàn văn bài hội thoại bằng tiếng Anh ghép từ tất cả các câu thoại...",
    "lines": [
      {
        "speaker": "Tên nhân vật A (ví dụ: Receptionist / Interviewer / Waiter / Agent)",
        "english": "Câu thoại tiếng Anh giao tiếp chuẩn xác, tự nhiên...",
        "vietnamese": "Dịch nghĩa tiếng Việt câu thoại..."
      },
      {
        "speaker": "Tên nhân vật B (ví dụ: Guest / Applicant / Customer / Passenger)",
        "english": "Câu thoại phản hồi tiếng Anh...",
        "vietnamese": "Dịch nghĩa tiếng Việt câu thoại..."
      }
    ]
  },
  "vocabularyItems": [
    {
      "word": "từ vựng cốt lõi xuất hiện trong bài nghe",
      "phonetic": "/phiên âm IPA/",
      "partOfSpeech": "noun/verb/adj",
      "meaning": "nghĩa tiếng Việt",
      "example": "ví dụ tiếng Anh trong bài nghe",
      "exampleMeaning": "dịch nghĩa ví dụ"
    }
  ],
  "quizQuestions": [
    {
      "type": "multiple-choice",
      "question": "Câu hỏi trắc nghiệm kiểm tra khả năng nghe hiểu bài hội thoại bằng tiếng Anh",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Đáp án đúng chính xác",
      "explanation": "Giải thích chi tiết nội dung bài nghe liên quan bằng tiếng Việt"
    }
  ]
}

QUY TẮC BẮT BUỘC:
1. Tạo 5 đến 8 lượt hội thoại đối đáp tự nhiên giữa 2 nhân vật phù hợp với ngữ cảnh "${topic.trim()}".
2. fullText phải chứa toàn bộ các câu thoại tiếng Anh ghép lại theo thứ tự.
3. Trích xuất 3 đến 5 từ vựng cốt lõi nhất có trong đoạn hội thoại.
4. Tạo 2 đến 3 câu hỏi trắc nghiệm kiểm tra chi tiết thông tin trong bài nghe.
5. QUY TẮC CHÍNH TẢ TIẾNG VIỆT (TỐI QUAN TRỌNG): Tất cả văn bản tiếng Việt (tiêu đề, mô tả, dịch câu thoại, nghĩa từ vựng, giải thích) CHỈ VIẾT HOA CHỮ CÁI ĐẦU TIÊN CỦA CÂU hoặc danh từ riêng. KHÔNG ĐƯỢC dùng Title Case (viết hoa chữ cái đầu của từng từ).`;
    } else {
      prompt = `Hãy đóng vai một chuyên gia biên soạn giáo trình Tiếng Anh hàng đầu.
Hãy tự động sinh một bài học từ vựng Flashcard hoàn chỉnh và câu hỏi trắc nghiệm kiểm tra cho chủ đề ngách "${topic.trim()}" ở trình độ CEFR "${level || "B1"}".

Trả về ĐÚNG ĐỊNH DẠNG JSON duy nhất với cấu trúc:
{
  "title": "Từ vựng tiếng Anh chủ đề ${topic.trim()}",
  "description": "Mô tả ngắn gọn 1-2 câu về mục tiêu và ứng dụng thực tế của bộ từ vựng này trong đời sống hoặc công việc",
  "vocabularyItems": [
    {
      "word": "từ hoặc cụm từ tiếng Anh chuẩn xác",
      "phonetic": "/phiên âm IPA chuẩn quốc tế có dấu gạch chéo/",
      "partOfSpeech": "danh từ / động từ / tính từ / trạng từ / cụm danh từ",
      "meaning": "nghĩa tiếng Việt chính xác, súc tích",
      "example": "câu ví dụ tiếng Anh tự nhiên trong ngữ cảnh thực tế",
      "exampleMeaning": "dịch nghĩa tiếng Việt của câu ví dụ"
    }
  ],
  "quizQuestions": [
    {
      "type": "multiple-choice",
      "question": "Nội dung câu hỏi trắc nghiệm bằng tiếng Anh kiểm tra cách dùng hoặc nghĩa từ vựng",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctAnswer": "Đáp án đúng chính xác nằm trong 4 lựa chọn",
      "explanation": "Giải thích chi tiết lý do bằng tiếng Việt"
    }
  ]
}

QUY TẮC BẮT BUỘC:
1. Sinh chính xác 6 đến 8 từ/cụm từ vựng quan trọng, hữu ích nhất thuộc chủ đề "${topic.trim()}".
2. Tương ứng với bộ từ vựng, tạo 5 đến 6 câu hỏi trắc nghiệm trắc nghiệm để kiểm tra mức độ ghi nhớ.
3. Phiên âm IPA phải chuẩn xác có dấu gạch chéo /.../ (ví dụ: /kəˈlæb.ə.reɪt/).
4. Cung cấp đầy đủ ví dụ tiếng Anh thực tế và bản dịch tiếng Việt tương ứng.
5. QUY TẮC CHÍNH TẢ TIẾNG VIỆT (TỐI QUAN TRỌNG): Tất cả các văn bản tiếng Việt (tiêu đề, mô tả, từ loại, nghĩa, dịch ví dụ, giải thích) CHỈ VIẾT HOA CHỮ CÁI ĐẦU TIÊN CỦA CÂU hoặc danh từ riêng. KHÔNG ĐƯỢC dùng Title Case (viết hoa chữ cái đầu của từng từ).`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini AI Lesson Content Generation Error:", error);
    res.status(500).json({ error: "Không thể tạo nội dung bài học bằng AI. Vui lòng thử lại sau." });
  }
});

// Gemini AI Role-play Conversation Endpoint
app.post("/api/ai/roleplay", async (req, res) => {
  try {
    const { scenarioTitle, topic, aiRole, userRole, userLevel, conversationHistory, userMessage } = req.body;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập hoặc nói câu trả lời của bạn." });
    }

    const historyFormatted = (conversationHistory || [])
      .map((m: any) => `${m.role === 'user' ? (userRole || 'Người học') : (aiRole || 'AI')}: ${m.text}`)
      .join("\n");

    const prompt = `Bạn là một giáo viên tiếng Anh bản xứ đang đóng vai phản xạ giao tiếp thực tế với người học.
BỐI CẢNH HỘI THOẠI:
- Bài học: "${scenarioTitle || topic || 'Giao tiếp tiếng Anh'}"
- Vai của AI: ${aiRole || 'Người đối thoại'}
- Vai của người học: ${userRole || 'Người trả lời'}
- Trình độ người học: CEFR ${userLevel || 'B1'}

LỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ:
${historyFormatted || '(Mới bắt đầu hội thoại)'}

CÂU NÓI / CÂU TRẢ LỜI MỚI NHẤT CỦA NGƯỜI HỌC:
"${userMessage.trim()}"

NHIỆM VỤ CỦA BẠN:
1. Tiếp tục đóng vai nhân vật "${aiRole || 'AI'}" và đưa ra 1 câu đối đáp tự nhiên bằng tiếng Anh (aiReply).
2. Dịch câu đối đáp đó sang tiếng Việt (aiReplyVietnamese).
3. Đánh giá câu trả lời của người học bằng tiếng Việt (tuân thủ quy tắc viết hoa chữ cái đầu câu):
   - Đánh giá phản xạ (score/10, ngắn gọn)
   - Nhận xét nội dung & ngữ pháp (feedback)
   - Gợi ý phát âm / từ vựng nếu có (pronunciationTip)

YÊU CẦU QUY TẮC TIẾNG VIỆT (TỐI QUAN TRỌNG):
Tất cả câu tiếng Việt (aiReplyVietnamese, feedback, pronunciationTip) CHỈ VIẾT HOA CHỮ CÁI ĐẦU TIÊN CỦA CÂU hoặc danh từ riêng. TUYỆT ĐỐI KHÔNG dùng Title Case.

Trả về ĐÚNG 1 JSON duy nhất theo cấu trúc:
{
  "aiReply": "Câu tiếng Anh tự nhiên tiếp theo của AI...",
  "aiReplyVietnamese": "Dịch tiếng Việt của câu AI...",
  "evaluation": {
    "score": "8/10",
    "feedback": "Nhận xét câu trả lời của người học...",
    "grammarTip": "Gợi ý cải thiện ngữ pháp nếu có...",
    "pronunciationTip": "Mẹo phát âm các từ chìa khóa..."
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Gemini AI Roleplay Error:", error);
    res.status(500).json({ error: "Không thể xử lý hội thoại AI. Vui lòng thử lại sau." });
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
