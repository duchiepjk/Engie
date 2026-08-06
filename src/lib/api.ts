import { Lesson, User, UserProgress, ChatMessage, QuizQuestion } from '../types';
import { saveUserToFirestore, saveProgressToFirestore, getUserFromFirestore } from './firebase';

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

export async function getLessons(params?: { category?: string; level?: string; search?: string }): Promise<Lesson[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`/api/lessons?${query}`);
  if (!res.ok) throw new Error('Failed to load lessons');
  return res.json();
}

export async function getLessonById(id: string): Promise<Lesson> {
  const res = await fetch(`/api/lessons/${id}`);
  if (!res.ok) throw new Error('Lesson not found');
  return res.json();
}

export async function createLesson(lessonData: Partial<Lesson>): Promise<Lesson> {
  const res = await fetch('/api/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lessonData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create lesson');
  }
  return res.json();
}

export async function deleteLesson(id: string): Promise<void> {
  const res = await fetch(`/api/lessons/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete lesson');
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

export async function generateAiQuiz(topic: string, level: string, count: number): Promise<QuizQuestion[]> {
  const res = await fetch('/api/ai/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, level, count }),
  });
  if (!res.ok) throw new Error('Failed to generate AI Quiz');
  const data = await res.json();
  return data.questions;
}
