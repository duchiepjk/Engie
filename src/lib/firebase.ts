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
import { User, UserProgress, Lesson } from '../types';

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

/**
 * Perform Firebase Auth Google Sign-In with popup
 */
export async function loginWithFirebaseGoogle(): Promise<{ user: User; firebaseUser: FirebaseUser }> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const appUser: User = {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
    email: fbUser.email || '',
    avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: (fbUser.email && fbUser.email.includes('admin')) ? 'admin' : 'user',
    level: 'B1',
    streak: 1,
    xp: 100,
    completedLessons: []
  };

  // Check if existing document exists in Firestore
  const existing = await getUserFromFirestore(fbUser.uid);
  if (existing) {
    const mergedUser = { ...appUser, ...existing, avatar: fbUser.photoURL || existing.avatar };
    await saveUserToFirestore(mergedUser);
    return { user: mergedUser, firebaseUser: fbUser };
  } else {
    await saveUserToFirestore(appUser);
    return { user: appUser, firebaseUser: fbUser };
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function logoutFromFirebase(): Promise<void> {
  await firebaseSignOut(auth);
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
