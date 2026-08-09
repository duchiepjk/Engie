import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, UserProgress, Lesson, LessonCategory, CEFRLevel } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
}) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore database with specific databaseId if provided
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
  ? firebaseConfig.firestoreDatabaseId 
  : undefined;

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// --- FIRESTORE USER & PROGRESS HELPER FUNCTIONS ---

/**
 * Save or update user profile in Firestore 'users' collection
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      level: user.level,
      streak: user.streak,
      xp: user.xp,
      completedLessons: user.completedLessons || [],
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore saveUser error:', error);
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
  } catch (error) {
    console.warn('Firestore getUser error:', error);
  }
  return null;
}

/**
 * Get all users registered in Firestore 'users' collection
 */
export async function getAllUsersFromFirestore(): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const users: User[] = [];
    snap.forEach((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        users.push({
          id: data.id || docSnap.id,
          name: data.name || 'Học viên',
          email: data.email || '',
          avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          role: data.role === 'admin' ? 'admin' : 'user',
          level: data.level || 'B1',
          streak: data.streak ?? 0,
          xp: data.xp ?? 0,
          completedLessons: data.completedLessons || []
        });
      }
    });
    return users;
  } catch (error) {
    console.warn('Firestore getAllUsers error:', error);
    return [];
  }
}

/**
 * Update a user's role in Firestore 'users' collection
 */
export async function updateUserRoleInFirestore(userId: string, role: 'user' | 'admin'): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { role, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn('Firestore updateUserRole error:', error);
  }
}

/**
 * Save user progress to Firestore
 */
export async function saveProgressToFirestore(userId: string, progress: UserProgress): Promise<void> {
  try {
    const progressRef = doc(db, 'users', userId);
    await setDoc(progressRef, {
      xp: progress.xp,
      streak: progress.streakDays,
      completedLessons: progress.completedLessonIds,
      quizScores: progress.quizScores || {},
      savedVocab: progress.savedVocab || [],
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore saveProgress error:', error);
  }
}

/**
 * Real-time listener for user profile and progress changes from Firestore
 */
export function subscribeToUserData(userId: string, callback: (data: Partial<User & UserProgress>) => void) {
  try {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as Partial<User & UserProgress>);
      }
    }, (err) => {
      console.warn('Firestore snapshot error:', err);
    });
  } catch (e) {
    console.warn('Subscribe error:', e);
    return () => {};
  }
}

// List of admin emails that are automatically assigned role: 'admin'
export const ADMIN_EMAILS = [
  'hiepsaker2004@gmail.com',
  'admin.englishub@gmail.com'
];

/**
 * Check if an email is an authorized admin email
 */
export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(normalizedEmail) || normalizedEmail.includes('admin');
}

/**
 * Sync or Initialize Firebase Auth User with Firestore 'users' collection
 */
export async function syncFirebaseUserToFirestore(fbUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userRef);

  const email = (fbUser.email || '').toLowerCase().trim();
  const isAdminEmail = isAuthorizedAdminEmail(email);
  const now = new Date().toISOString();

  if (snap.exists()) {
    // 1. Account already exists in Firestore -> Preserve existing data, update lastLogin timestamp
    const existing = snap.data();
    
    // Automatically assign or update role: "admin" if email matches admin email
    const finalRole: 'user' | 'admin' = isAdminEmail ? 'admin' : (existing.role === 'admin' ? 'admin' : 'user');

    const updatePayload = {
      lastLogin: now,
      updatedAt: now,
      role: finalRole,
      uid: fbUser.uid,
      displayName: fbUser.displayName || existing.displayName || existing.name || 'Học viên',
      email: fbUser.email || existing.email || '',
      photoURL: fbUser.photoURL || existing.photoURL || existing.avatar || '',
    };

    await setDoc(userRef, updatePayload, { merge: true });

    const appUser: User = {
      id: fbUser.uid,
      name: fbUser.displayName || existing.name || existing.displayName || 'Học viên',
      email: fbUser.email || existing.email || '',
      avatar: fbUser.photoURL || existing.avatar || existing.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: finalRole,
      level: existing.level || 'B1',
      streak: existing.streak ?? 1,
      xp: existing.xp ?? 100,
      completedLessons: existing.completedLessons || [],
      isGuest: false,
    };

    return appUser;
  } else {
    // 2. First-time login -> Initialize new user document with document ID = fbUser.uid
    const initialRole: 'user' | 'admin' = isAdminEmail ? 'admin' : 'user';

    const newUserDoc = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Học viên',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: now,
      lastLogin: now,
      role: initialRole, // Default 'user', or 'admin' if email matches admin email
      // Additional application profile properties
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Học viên',
      avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      level: 'B1',
      streak: 1,
      xp: 100,
      completedLessons: [],
      updatedAt: now,
    };

    await setDoc(userRef, newUserDoc);

    const appUser: User = {
      id: fbUser.uid,
      name: newUserDoc.displayName,
      email: newUserDoc.email,
      avatar: newUserDoc.photoURL,
      role: initialRole,
      level: 'B1',
      streak: 1,
      xp: 100,
      completedLessons: [],
      isGuest: false,
    };

    return appUser;
  }
}

/**
 * Save or update lesson in Firestore 'lessons' collection and sync flashcards
 */
export async function saveLessonToFirestore(lesson: Lesson): Promise<void> {
  try {
    const lessonRef = doc(db, 'lessons', lesson.id);
    await setDoc(lessonRef, {
      ...lesson,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Sync vocabulary items into 'flashcards' collection
    if (lesson.vocabularyItems && lesson.vocabularyItems.length > 0) {
      for (const item of lesson.vocabularyItems) {
        const flashcardRef = doc(db, 'flashcards', item.id || `fc-${lesson.id}-${Date.now()}`);
        await setDoc(flashcardRef, {
          id: item.id,
          lessonId: lesson.id,
          word: item.word,
          phonetic: item.phonetic,
          partOfSpeech: item.partOfSpeech,
          meaning: item.meaning,
          example: item.example,
          exampleMeaning: item.exampleMeaning,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    }
  } catch (error) {
    console.warn('Firestore saveLessonToFirestore error:', error);
  }
}

/**
 * Delete lesson from Firestore 'lessons' collection
 */
export async function deleteLessonFromFirestore(lessonId: string): Promise<void> {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    await setDoc(lessonRef, { deleted: true, deletedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn('Firestore deleteLessonFromFirestore error:', error);
  }
}

/**
 * Get all lessons from Firestore 'lessons' collection
 */
export async function getLessonsFromFirestore(): Promise<Lesson[]> {
  try {
    const lessonsCol = collection(db, 'lessons');
    const snap = await getDocs(lessonsCol);
    const lessonsList: Lesson[] = [];
    snap.forEach((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.deleted) {
          const validCategories: LessonCategory[] = ['vocabulary', 'grammar', 'listening'];
          const category: LessonCategory = (data.category && validCategories.includes(data.category))
            ? data.category
            : 'vocabulary';

          const normalizedLesson: Lesson = {
            id: data.id || docSnap.id,
            title: data.title || 'Bài học tiếng Anh',
            category,
            topic: data.topic || data.title || '',
            level: data.level || 'B1',
            description: data.description || '',
            durationMinutes: Number(data.durationMinutes) || 15,
            imageUrl: data.imageUrl,
            vocabularyItems: Array.isArray(data.vocabularyItems) ? data.vocabularyItems : [],
            grammarSections: Array.isArray(data.grammarSections) ? data.grammarSections : [],
            listeningScript: data.listeningScript || undefined,
            quizQuestions: Array.isArray(data.quizQuestions) ? data.quizQuestions : [],
            createdAt: data.createdAt || new Date().toISOString(),
          };

          lessonsList.push(normalizedLesson);
        }
      }
    });
    return lessonsList;
  } catch (error) {
    console.warn('Firestore getLessonsFromFirestore error:', error);
    return [];
  }
}

/**
 * Perform Firebase Auth Google Sign-In with popup
 */
export async function loginWithFirebaseGoogle(): Promise<{ user: User; firebaseUser: FirebaseUser }> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;
  const appUser = await syncFirebaseUserToFirestore(fbUser);
  return { user: appUser, firebaseUser: fbUser };
}

/**
 * Sign out from Firebase Auth
 */
export async function logoutFromFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Update user CEFR level in Firestore 'users' collection
 */
export async function updateUserLevelInFirestore(userId: string, newLevel: CEFRLevel): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      level: newLevel,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore updateUserLevelInFirestore error:', error);
  }
}

export { 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  getDocs 
};
