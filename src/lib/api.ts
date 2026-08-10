import { Lesson, User, UserProgress, ChatMessage, QuizQuestion, VocabularyItem } from '../types';
import { 
  saveUserToFirestore, 
  saveProgressToFirestore, 
  getUserFromFirestore, 
  getAllUsersFromFirestore, 
  updateUserRoleInFirestore,
  saveLessonToFirestore,
  deleteLessonFromFirestore,
  getLessonsFromFirestore
} from './firebase';

export async function getCurrentUser(): Promise<User> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Failed to get user');
  const data = await res.json();
  const serverUser: User = data.user;

  // Attempt to fetch updated user document from Firestore if available
  try {
    const firestoreUser = await getUserFromFirestore(serverUser.id);
    if (firestoreUser) {
      return { ...serverUser, ...firestoreUser };
    }
  } catch (e) {
    console.warn('Firestore fetch user fallback:', e);
  }

  return serverUser;
}

export async function loginWithGoogle(profile: { name: string; email: string; avatar?: string; id?: string }): Promise<User> {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('Failed to login with Google');
  const data = await res.json();
  const user: User = data.user;

  // Sync with Firestore
  try {
    await saveUserToFirestore(user);
  } catch (e) {
    console.warn('Sync user to Firestore warning:', e);
  }

  return user;
}

export async function switchUserRole(role: 'user' | 'admin'): Promise<User> {
  const res = await fetch('/api/auth/switch-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Failed to switch role');
  const data = await res.json();
  const user: User = data.user;

  // Sync role update to Firestore
  try {
    await saveUserToFirestore(user);
  } catch (e) {
    console.warn('Firestore sync role error:', e);
  }

  return user;
}

export async function getAllUsers(): Promise<User[]> {
  try {
    // 1. Try to fetch users from Firestore
    const firestoreUsers = await getAllUsersFromFirestore();
    
    // 2. Try to fetch from server API
    let serverUsers: User[] = [];
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        serverUsers = await res.json();
      }
    } catch (err) {
      console.warn('Server users fetch error:', err);
    }

    // Combine and deduplicate users by ID
    const userMap = new Map<string, User>();
    serverUsers.forEach((u) => userMap.set(u.id, u));
    firestoreUsers.forEach((u) => userMap.set(u.id, u));

    return Array.from(userMap.values());
  } catch (e) {
    console.error('getAllUsers failed:', e);
    return [];
  }
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User> {
  // Update Firestore
  await updateUserRoleInFirestore(userId, role);

  // Update server API
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    throw new Error('Failed to update user role on server');
  }

  const data = await res.json();
  return data.user;
}

export async function getLessons(params?: { category?: string; level?: string; search?: string }): Promise<Lesson[]> {
  let serverLessons: Lesson[] = [];
  try {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/lessons?${query}`);
    if (res.ok) {
      serverLessons = await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch server lessons:', err);
  }

  let firestoreLessons: Lesson[] = [];
  try {
    firestoreLessons = await getLessonsFromFirestore();
  } catch (err) {
    console.warn('Failed to fetch firestore lessons:', err);
  }

  // Combine and deduplicate by ID, prioritizing firestore version if exists
  const lessonMap = new Map<string, Lesson>();
  serverLessons.forEach((l) => lessonMap.set(l.id, l));
  firestoreLessons.forEach((l) => lessonMap.set(l.id, l));

  let result = Array.from(lessonMap.values());

  if (params?.category) {
    result = result.filter((l) => l.category === params.category);
  }
  if (params?.level) {
    result = result.filter((l) => l.level === params.level);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
  }

  return result;
}

export async function getLessonById(id: string): Promise<Lesson> {
  try {
    const res = await fetch(`/api/lessons/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Get lesson by id server error:', err);
  }

  const allLessons = await getLessons();
  const found = allLessons.find((l) => l.id === id);
  if (!found) throw new Error('Không tìm thấy bài học');
  return found;
}

export async function createLesson(lessonData: Partial<Lesson>): Promise<Lesson> {
  let createdLesson: Lesson;

  try {
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': 'admin'
      },
      body: JSON.stringify(lessonData),
    });

    if (res.ok) {
      createdLesson = await res.json();
    } else {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Lỗi khi tạo bài học trên server');
    }
  } catch (serverErr: any) {
    console.warn('Server createLesson API fallback:', serverErr?.message);
    createdLesson = {
      id: `lesson-${Date.now()}`,
      title: lessonData.title || 'Bài học mới',
      category: lessonData.category || 'vocabulary',
      level: lessonData.level || 'B1',
      description: lessonData.description || 'Bài học mới',
      durationMinutes: Number(lessonData.durationMinutes) || 15,
      imageUrl: lessonData.category === 'vocabulary' 
        ? 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date().toISOString(),
      vocabularyItems: lessonData.vocabularyItems || [],
      grammarSections: lessonData.grammarSections || [],
      quizQuestions: lessonData.quizQuestions || [],
    };
  }

  // Sync to Firestore 'lessons' & 'flashcards' collections
  try {
    await saveLessonToFirestore(createdLesson);
  } catch (fsErr) {
    console.warn('Firestore save lesson warning:', fsErr);
  }

  return createdLesson;
}

export async function updateLesson(id: string, lessonData: Partial<Lesson>): Promise<Lesson> {
  let updatedLesson: Lesson;

  try {
    const res = await fetch(`/api/lessons/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': 'admin'
      },
      body: JSON.stringify(lessonData),
    });

    if (res.ok) {
      updatedLesson = await res.json();
    } else {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Lỗi khi cập nhật bài học trên server');
    }
  } catch (serverErr: any) {
    console.warn('Server updateLesson API fallback:', serverErr?.message);
    updatedLesson = {
      id,
      title: lessonData.title || 'Bài học',
      category: lessonData.category || 'vocabulary',
      level: lessonData.level || 'B1',
      description: lessonData.description || '',
      durationMinutes: Number(lessonData.durationMinutes) || 15,
      vocabularyItems: lessonData.vocabularyItems || [],
      grammarSections: lessonData.grammarSections || [],
      quizQuestions: lessonData.quizQuestions || [],
    } as Lesson;
  }

  // Sync to Firestore 'lessons' & 'flashcards' collections
  try {
    await saveLessonToFirestore(updatedLesson);
  } catch (fsErr) {
    console.warn('Firestore update lesson warning:', fsErr);
  }

  return updatedLesson;
}

export async function deleteLesson(id: string): Promise<void> {
  try {
    await fetch(`/api/lessons/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': 'admin' }
    });
  } catch (err) {
    console.warn('Server delete lesson warning:', err);
  }

  try {
    await deleteLessonFromFirestore(id);
  } catch (fsErr) {
    console.warn('Firestore delete lesson warning:', fsErr);
  }
}

export async function getUserProgress(): Promise<UserProgress> {
  const res = await fetch('/api/progress');
  if (!res.ok) throw new Error('Failed to load progress');
  return res.json();
}

export async function submitQuizScore(lessonId: string, score: number, total: number) {
  const res = await fetch('/api/progress/submit-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId, score, total }),
  });
  if (!res.ok) throw new Error('Failed to submit score');
  const result = await res.json();

  // Sync updated progress with Firestore
  try {
    const user = await getCurrentUser();
    if (user) {
      await saveProgressToFirestore(user.id, {
        userId: user.id,
        xp: result.totalXp,
        streakDays: user.streak,
        completedLessonIds: result.completedLessons,
        quizScores: { [lessonId]: { score, total, date: new Date().toISOString() } },
        savedVocab: []
      });
    }
  } catch (e) {
    console.warn('Firestore quiz score sync warning:', e);
  }

  return result;
}

export async function askAiTutor(messages: ChatMessage[], level: string, mode: string) {
  const res = await fetch('/api/ai/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userLevel: level, mode }),
  });
  if (!res.ok) throw new Error('Failed to connect to AI Tutor');
  return res.json();
}

export async function generateAiQuiz(
  topic: string, 
  level: string, 
  count: number = 7, 
  category?: string, 
  grammarSections?: any[], 
  vocabularyItems?: VocabularyItem[]
): Promise<QuizQuestion[]> {
  const randomSeed = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const res = await fetch('/api/ai/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      topic, 
      level, 
      count, 
      category, 
      grammarSections, 
      vocabularyItems,
      randomSeed 
    }),
  });
  if (!res.ok) throw new Error('Không thể kết nối với Gemini AI để tạo bài trắc nghiệm.');
  const data = await res.json();
  return data.questions;
}

export async function generateLessonContentAI(topic: string, level: string, category?: string): Promise<{
  title?: string;
  description?: string;
  vocabularyItems?: VocabularyItem[];
  grammarSections?: any[];
  listeningScript?: any;
  quizQuestions?: QuizQuestion[];
}> {
  const res = await fetch('/api/ai/generate-lesson-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, level, category }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Lỗi khi kết nối với AI sinh nội dung bài học');
  }
  return res.json();
}

export async function sendRoleplayMessage(params: {
  scenarioTitle: string;
  topic?: string;
  aiRole: string;
  userRole: string;
  userLevel: string;
  conversationHistory: { role: 'ai' | 'user'; text: string }[];
  userMessage: string;
}): Promise<{
  aiReply: string;
  aiReplyVietnamese: string;
  evaluation?: {
    score?: string;
    feedback?: string;
    grammarTip?: string;
    pronunciationTip?: string;
  };
}> {
  const res = await fetch('/api/ai/roleplay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi khi gửi phản hồi hội thoại tới AI');
  }
  return res.json();
}
