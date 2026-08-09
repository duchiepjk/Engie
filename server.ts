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
        title: "1. Công thức thì hiện tại đơn",
        explanation: "Diễn tả hành động lặp đi lặp lại như một thói quen hoặc sự thật hiển nhiên luôn luôn đúng.",
        formula: "Động từ Thường: (+) S + V(s/es) | (-) S + do/does + not + V0 | (?) Do/Does + S + V0?\nĐộng từ To Be: (+) S + am/is/are + N/Adj | (-) S + am/is/are + not + N/Adj",
        examples: [
          { english: "She works at an international bank in Hanoi.", vietnamese: "Cô ấy làm việc tại một ngân hàng quốc tế ở Hà Nội." },
          { english: "Water freezes at 0 degrees Celsius.", vietnamese: "Nước đóng băng ở 0 độ C." },
          { english: "They do not play football on weekdays.", vietnamese: "Họ không chơi bóng đá vào các ngày trong tuần." }
        ]
      },
      {
        id: "g-ps-2",
        title: "2. Dấu hiệu nhận biết & quy tắc thêm s/es",
        explanation: "Dùng với trạng từ chỉ tần suất: always, usually, often, sometimes, never, every day/week/month.",
        formula: "Thêm 'es' sau động từ kết thúc bằng: -o, -s, -ch, -x, -sh, -z (Ví dụ: watch -> watches, go -> goes)",
        examples: [
          { english: "He always drinks green tea after breakfast.", vietnamese: "Anh ấy luôn uống trà xanh sau bữa sáng." },
          { english: "My father watches the evening news every day.", vietnamese: "Bố tôi xem thời sự buổi tối mỗi ngày." }
        ]
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
        title: "1. Công thức & cách sử dụng chính",
        explanation: "Diễn tả hành động đang diễn ra trực tiếp ngay tại thời điểm nói hoặc một kế hoạch đã lên lịch sẵn trong tương lai gần.",
        formula: "(+) S + am/is/are + V-ing | (-) S + am/is/are + not + V-ing | (?) Am/Is/Are + S + V-ing?",
        examples: [
          { english: "Please be quiet! The baby is sleeping.", vietnamese: "Xin hãy giữ trật tự! Bé đang ngủ." },
          { english: "I am meeting my professor at 3 PM today.", vietnamese: "Tôi sẽ gặp giáo sư lúc 3 giờ chiều nay." }
        ]
      },
      {
        id: "g-pc-2",
        title: "2. Dấu hiệu nhận biết & lưu ý stative verbs",
        explanation: "Dấu hiệu: now, right now, at the moment, Listen!, Look!, Be careful! Lưu ý: Các động từ trạng thái (love, hate, want, know, think, understand) không dùng ở thể tiếp diễn.",
        formula: "Đúng: I want some water. (KHÔNG dùng: I am wanting some water)",
        examples: [
          { english: "Look! The bus is coming.", vietnamese: "Nhìn kìa! Xe buýt đang đến." },
          { english: "I understand the grammar rule now.", vietnamese: "Bây giờ tôi đã hiểu quy tắc ngữ pháp này rồi." }
        ]
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
        title: "1. Công thức & các trường hợp sử dụng",
        explanation: "Diễn tả hành động xảy ra ở thời điểm không xác định trong quá khứ, hành động vừa mới hoàn thành hoặc trải nghiệm tính đến hiện tại.",
        formula: "(+) S + have/has + V3/ed | (-) S + have/has + not + V3/ed | (?) Have/Has + S + V3/ed?",
        examples: [
          { english: "I have visited Tokyo twice.", vietnamese: "Tôi đã từng đến thăm Tokyo hai lần." },
          { english: "She has just finished her master's thesis.", vietnamese: "Cô ấy vừa mới hoàn thiện luận văn thạc sĩ." }
        ]
      },
      {
        id: "g-pp-2",
        title: "2. Dấu hiệu SINCE & FOR",
        explanation: "SINCE + mốc thời gian bắt đầu (since 2018, since last month). FOR + khoảng thời gian (for 5 years, for 3 hours).",
        formula: "Since + Time Point (2020) | For + Time Period (2 years)",
        examples: [
          { english: "We have lived in this city since 2015.", vietnamese: "Chúng tôi đã sống ở thành phố này từ năm 2015." },
          { english: "He has learned English for three years.", vietnamese: "Anh ấy đã học tiếng Anh được 3 năm." }
        ]
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
        title: "1. Công thức & Tính chất nhấn mạnh tính liên tục",
        explanation: "Diễn tả hành động bắt đầu trong quá khứ, tiếp diễn liên tục không ngắt quãng đến hiện tại và có thể còn kéo dài tiếp.",
        formula: "(+) S + have/has + been + V-ing | (-) S + have/has + not + been + V-ing",
        examples: [
          { english: "It has been raining for five hours non-stop.", vietnamese: "Trời đã mưa liên tục trong suốt 5 tiếng đồng hồ." },
          { english: "I have been waiting for the bus since 7 AM.", vietnamese: "Tôi đã đứng chờ xe buýt liên tục từ 7 giờ sáng." }
        ]
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
        title: "1. Công thức & cách dùng cho quá khứ kết thúc",
        explanation: "Diễn tả hành động đã xảy ra và hoàn toàn kết thúc tại một thời điểm xác định trong quá khứ.",
        formula: "(+) S + V2/ed | (-) S + did + not + V0 | (?) Did + S + V0?",
        examples: [
          { english: "I graduated from university in 2021.", vietnamese: "Tôi đã tốt nghiệp đại học vào năm 2021." },
          { english: "Did you watch the football match last night?", vietnamese: "Bạn có xem trận bóng đá tối qua không?" }
        ]
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
        title: "1. Công thức & thời điểm cụ thể trong quá khứ",
        explanation: "Diễn tả hành động đang xảy ra tại một giờ chính xác trong quá khứ.",
        formula: "(+) S + was/were + V-ing | (-) S + was/were + not + V-ing | (?) Was/Were + S + V-ing?",
        examples: [
          { english: "At 9 PM last night, I was studying in the library.", vietnamese: "Vào lúc 9 giờ tối qua, tôi đang học trong thư viện." },
          { english: "What were you doing at this time yesterday?", vietnamese: "Bạn đang làm gì vào giờ này ngày hôm qua?" }
        ]
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
        title: "1. Cấu trúc & quy tắc 'Hành động xảy ra trước trong quá khứ'",
        explanation: "Khi có hai hành động cùng xảy ra trong quá khứ: Hành động nào xảy ra TRƯỚC -> Dùng quá khứ hoàn thành. Hành động xảy ra SAU -> Dùng quá khứ đơn.",
        formula: "(+) S + had + V3/ed | (-) S + had + not + V3/ed | (?) Had + S + V3/ed?",
        examples: [
          { english: "By the time the police arrived, the thief had escaped.", vietnamese: "Vào lúc cảnh sát đến nơi thì tên trộm đã tẩu thoát rồi." },
          { english: "She had eaten dinner before her friends called.", vietnamese: "Cô ấy đã ăn tối trước khi các bạn cô ấy gọi điện." }
        ]
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
        title: "1. Công thức & nhấn mạnh quá trình quá khứ",
        explanation: "Nhấn mạnh khoảng thời gian kéo dài liên tục trước khi một sự việc khác xảy ra trong quá khứ.",
        formula: "(+) S + had + been + V-ing | (-) S + had + not + been + V-ing",
        examples: [
          { english: "They had been driving for 6 hours before they found a gas station.", vietnamese: "Họ đã lái xe liên tục 6 tiếng trước khi tìm thấy một cây xăng." }
        ]
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
        title: "1. Công thức & quyết định ngay lúc nói",
        explanation: "Đưa ra quyết định tức thì, không có kế hoạch tính toán trước.",
        formula: "(+) S + will + V0 | (-) S + will not (won't) + V0 | (?) Will + S + V0?",
        examples: [
          { english: "Hold on! I will open the door for you.", vietnamese: "Chờ chút! Tôi sẽ mở cửa giúp bạn." },
          { english: "I promise I will not be late tomorrow.", vietnamese: "Tôi hứa ngày mai tôi sẽ không đến muộn." }
        ]
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
        title: "1. Công thức & mốc thời gian cụ thể ở tương lai",
        explanation: "Nhấn mạnh hành động đang diễn ra tại một giờ cụ thể trong tương lai.",
        formula: "(+) S + will + be + V-ing | (-) S + will not + be + V-ing",
        examples: [
          { english: "At 10 AM tomorrow, I will be taking my final exam.", vietnamese: "Vào lúc 10 giờ sáng mai, tôi đang làm bài thi học kỳ." }
        ]
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
        title: "1. Cấu trúc & quy tắc 'Hoàn thành trước mốc tương lai'",
        explanation: "Thường đi kèm với cụm 'By...' (By 2030, By next month, By the time you arrive).",
        formula: "(+) S + will + have + V3/ed | (-) S + will not + have + V3/ed",
        examples: [
          { english: "By December, we will have finished the building construction.", vietnamese: "Cho đến trước tháng 12, chúng tôi sẽ hoàn thành xong việc xây dựng tòa nhà này." }
        ]
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
        title: "1. Công thức & tính thời lượng tương lai",
        explanation: "Diễn tả tính liên tục kéo dài tính đến mốc thời gian tương lai.",
        formula: "(+) S + will + have + been + V-ing",
        examples: [
          { english: "By next month, I will have been living in San Francisco for 10 years.", vietnamese: "Tính đến tháng sau, tôi sẽ sống liên tục ở San Francisco tròn 10 năm." }
        ]
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
        title: "1. So sánh cốt lõi: Quá khứ đơn vs Hiện tại hoàn thành",
        explanation: "• Quá khứ đơn: Thời gian XÁC ĐỊNH (yesterday, last year, in 2020) & Hành động ĐÃ KẾT THÚC HOÀN TOÀN.\n• Hiện tại hoàn thành: Thời gian KHÔNG XÁC ĐỊNH hoặc kéo dài tới hiện tại (for, since, ever, never).",
        formula: "Past Simple: S + V2/ed + time_in_past | Present Perfect: S + have/has + V3/ed (+ since/for)",
        examples: [
          { english: "I lost my keys yesterday. (I got them back or it happened yesterday).", vietnamese: "Tôi đã mất chìa khóa hôm qua (thời gian xác định)." },
          { english: "I have lost my keys! (I still don't have them right now).", vietnamese: "Tôi bị mất chìa khóa rồi! (kết quả là hiện tại tôi vẫn không có chìa khóa)." }
        ]
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
        title: "1. Bản chất cố định vs Tạm thời",
        explanation: "• Hiện tại đơn: Thói quen, sự thật, lịch trình cố định.\n• Hiện tại tiếp diễn: Sự việc tạm thời chỉ diễn ra dạo này hoặc ngay bây giờ.",
        formula: "Present Simple: S + V(s/es) | Present Continuous: S + am/is/are + V-ing",
        examples: [
          { english: "He usually drives to work, but today he is taking the bus.", vietnamese: "Anh ấy thường lái xe đi làm (thói quen), nhưng hôm nay anh ấy đi xe buýt (tạm thời)." }
        ]
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
        title: "1. Quy tắc WHEN và WHILE",
        explanation: "• WHEN + Quá Khứ Đơn (Hành động cắt ngang ngắn).\n• WHILE + Quá Khứ Tiếp Diễn (Hành động đang diễn ra kéo dài dài hơn).",
        formula: "When + Past Simple, Past Continuous | While + Past Continuous, Past Simple",
        examples: [
          { english: "When the phone rang, I was taking a shower.", vietnamese: "Khi chuông điện thoại reo (ngắn), tôi đang tắm (kéo dài)." },
          { english: "While we were having a picnic, it started to rain.", vietnamese: "Trong khi chúng tôi đang đi dã ngoại, trời bắt đầu đổ mưa." }
        ]
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
        title: "1. Ma trận 3 x 4 của 12 thì tiếng Anh",
        explanation: "12 thì hình thành bằng cách kết hợp 3 Khung Thời Gian (Hiện tại - Quá khứ - Tương lai) với 4 Thể (Đơn - Tiếp diễn - Hoàn thành - Hoàn thành tiếp diễn).\n• Đơn: Sự việc nói chung / thói quen\n• Tiếp diễn: Đang diễn ra\n• Hoàn thành: Đã xong trước một mốc\n• Hoàn thành tiếp diễn: Quá trình kéo dài liên tục",
        formula: "3 Mốc x 4 Thể = 12 Thì Chuẩn CEFR",
        examples: [
          { english: "Present Simple: I work | Past Simple: I worked | Future Simple: I will work", vietnamese: "Hiện tại đơn - Quá khứ đơn - Tương lai đơn" }
        ]
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
      prompt = `Hãy đóng vai một chuyên gia giáo trình Tiếng Anh hàng đầu.
Hãy tự động tạo bài học LUYỆN NGHE & NÓI về chủ đề "${topic.trim()}" ở trình độ CEFR "${level || "B1"}".

Trả về ĐÚNG ĐỊNH DẠNG JSON duy nhất với cấu trúc:
{
  "title": "Tên bài luyện nghe (vd: Hội thoại Luyện nghe: ${topic.trim()})",
  "description": "Mô tả ngắn về tình huống giao tiếp luyện nghe",
  "listeningScript": {
    "title": "Hội thoại luyện nghe ${topic.trim()}",
    "topic": "${topic.trim()}",
    "fullText": "Toàn văn bài hội thoại bằng tiếng Anh...",
    "lines": [
      {
        "speaker": "Person A",
        "english": "Lời thoại tiếng Anh...",
        "vietnamese": "Dịch tiếng Việt..."
      },
      {
        "speaker": "Person B",
        "english": "Lời thoại tiếng Anh...",
        "vietnamese": "Dịch tiếng Việt..."
      }
    ]
  },
  "vocabularyItems": [
    {
      "word": "từ vựng xuất hiện trong bài nghe",
      "phonetic": "/phiên âm IPA/",
      "partOfSpeech": "noun/verb",
      "meaning": "nghĩa tiếng Việt",
      "example": "ví dụ tiếng Anh",
      "exampleMeaning": "dịch nghĩa ví dụ"
    }
  ],
  "quizQuestions": [
    {
      "type": "multiple-choice",
      "question": "Câu hỏi kiểm tra khả năng nghe hiểu bài hội thoại trên bằng tiếng Anh",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Đáp án đúng",
      "explanation": "Giải thích nội dung bài nghe liên quan bằng tiếng Việt"
    }
  ]
}`;
    } else {
      prompt = `Hãy đóng vai một chuyên gia giáo trình Tiếng Anh hàng đầu.
Hãy tự động tạo bộ từ vựng Flashcard và câu hỏi trắc nghiệm tiếng Anh cho bài học chủ đề "${topic.trim()}" ở trình độ CEFR "${level || "B1"}".

Trả về ĐÚNG ĐỊNH DẠNG JSON duy nhất với cấu trúc:
{
  "title": "Từ vựng Tiếng Anh chủ đề ${topic.trim()}",
  "description": "Mô tả ngắn gọn 1-2 câu về mục tiêu bài học từ vựng",
  "vocabularyItems": [
    {
      "word": "từ tiếng Anh",
      "phonetic": "phiên âm IPA chuẩn với dấu gạch chéo, vd: /kəˈlæb.ə.reɪt/",
      "partOfSpeech": "noun / verb / adjective / adverb",
      "meaning": "nghĩa tiếng Việt ngắn gọn, chính xác",
      "example": "câu ví dụ tiếng Anh có chứa từ",
      "exampleMeaning": "bản dịch tiếng Việt của câu ví dụ"
    }
  ],
  "quizQuestions": [
    {
      "type": "multiple-choice",
      "question": "Nội dung câu hỏi trắc nghiệm kiểm tra từ vựng bằng tiếng Anh",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctAnswer": "Đáp án đúng chính xác trong 4 lựa chọn",
      "explanation": "Giải thích chi tiết lý do bằng tiếng Việt"
    }
  ]
}

Yêu cầu:
1. Tạo 5 từ vựng tiêu biểu, thực tế và hữu ích nhất cho chủ đề "${topic.trim()}".
2. Tương ứng với mỗi từ vựng, tự động tạo 1 câu hỏi trắc nghiệm Quiz kiểm tra từ đó.
3. Phiên âm IPA phải chuẩn xác có dấu gạch chéo /.../.
4. Cung cấp đầy đủ ví dụ tiếng Anh và bản dịch tiếng Việt.`;
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
