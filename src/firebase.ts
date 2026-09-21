import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot, 
  getDocFromServer,
  Timestamp 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile, LeaderboardEntry, VipRequest } from './types';

// Initialize Firebase with Long-Polling transport to avoid WebSocket/stream drops in sandboxed iframe environments
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Validate Connection to Firestore as required by firebase-skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore offline status note: Operating in local cache/offline mode.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Functions
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/popup-blocked'
    ) {
      console.warn('Google Sign-In popup closed or blocked by browser:', error?.message);
      return null;
    }
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

// User Profile Firestore Operations
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline') || error?.message?.includes('unavailable')) {
      console.warn('Firestore operating offline: skipping remote profile fetch, preserving local state.');
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.userId}`;
  try {
    const docRef = doc(db, 'users', profile.userId);
    const existingSnap = await getDoc(docRef);

    const payload: Record<string, any> = {
      userId: profile.userId,
      displayName: profile.displayName.slice(0, 100),
      highestLevel: Math.max(1, Math.floor(profile.highestLevel)),
      totalScore: Math.max(0, Math.floor(profile.totalScore)),
      starsEarned: Math.max(0, Math.floor(profile.starsEarned)),
      currentStreak: Math.max(0, Math.floor(profile.currentStreak)),
      puzzlesSolved: Math.max(0, Math.floor(profile.puzzlesSolved)),
      updatedAt: new Date().toISOString(),
    };

    if (profile.photoURL) {
      payload.photoURL = profile.photoURL.slice(0, 500);
    }

    if (existingSnap.exists()) {
      await updateDoc(docRef, payload);
    } else {
      payload.createdAt = new Date().toISOString();
      await setDoc(docRef, payload);
    }

    // Also update leaderboard entry for this user
    await saveLeaderboardEntry({
      userId: profile.userId,
      displayName: profile.displayName.slice(0, 100),
      photoURL: profile.photoURL?.slice(0, 500),
      score: profile.totalScore,
      highestLevel: profile.highestLevel,
      stars: profile.starsEarned,
    });
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline') || error?.message?.includes('unavailable')) {
      console.warn('Firestore operating offline: profile update stored locally.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Leaderboard Firestore Operations
export async function saveLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
  const path = `leaderboard/${entry.userId}`;
  try {
    const docRef = doc(db, 'leaderboard', entry.userId);
    const payload: Record<string, any> = {
      userId: entry.userId,
      displayName: entry.displayName.slice(0, 100),
      score: Math.max(0, Math.floor(entry.score)),
      highestLevel: Math.max(1, Math.floor(entry.highestLevel)),
      stars: Math.max(0, Math.floor(entry.stars)),
      updatedAt: new Date().toISOString(),
    };

    if (entry.photoURL) {
      payload.photoURL = entry.photoURL.slice(0, 500);
    }

    await setDoc(docRef, payload, { merge: true });
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline') || error?.message?.includes('unavailable')) {
      console.warn('Firestore operating offline: leaderboard entry stored locally.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchTopLeaderboard(count: number = 20): Promise<LeaderboardEntry[]> {
  const path = 'leaderboard';
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    const results: LeaderboardEntry[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data() as LeaderboardEntry);
    });
    return results;
  } catch (error) {
    // If permission or offline error occurs, don't crash the whole app; log structured error
    console.warn('Leaderboard fetch warning, falling back to local/cached data:', error);
    return [];
  }
}

// VIP Requests Operations
export async function submitVipRequest(request: VipRequest): Promise<void> {
  try {
    const docRef = doc(db, 'vip_requests', request.id);
    await setDoc(docRef, {
      id: request.id,
      userId: request.userId,
      name: request.name.slice(0, 100),
      number: request.number.slice(0, 30),
      utr: request.utr.slice(0, 40),
      plan: request.plan,
      amount: Math.floor(request.amount),
      status: 'pending',
      createdAt: request.createdAt,
    });
  } catch (error) {
    console.warn('Firestore VIP request save note:', error);
  }

  // Also sync with Google Sheet if webhook configured or cached locally
  try {
    syncWithGoogleSheet(request);
  } catch (err) {
    console.warn('Google Sheet webhook sync note:', err);
  }
}

export async function checkVipRequestStatus(requestId: string): Promise<VipRequest | null> {
  try {
    const docRef = doc(db, 'vip_requests', requestId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as VipRequest;
    }
    return null;
  } catch (error) {
    console.warn('Check VIP request status warning:', error);
    return null;
  }
}

export async function fetchAllVipRequests(): Promise<VipRequest[]> {
  try {
    const q = query(
      collection(db, 'vip_requests'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    const list: VipRequest[] = [];
    querySnapshot.forEach((d) => {
      list.push(d.data() as VipRequest);
    });
    return list;
  } catch (error) {
    console.warn('Fetch all VIP requests warning:', error);
    return [];
  }
}

export async function updateVipRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<void> {
  try {
    const docRef = doc(db, 'vip_requests', requestId);
    await updateDoc(docRef, {
      status,
      approvedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Update VIP status warning:', error);
    throw error;
  }
}

// Google Sheets Webhook Sender
export async function syncWithGoogleSheet(data: VipRequest): Promise<boolean> {
  const webhookUrl = typeof window !== 'undefined' ? localStorage.getItem('cyber_gsheet_webhook_url') : null;
  if (!webhookUrl) return false;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        number: data.number,
        utr: data.utr,
        amount: data.amount,
        plan: data.plan,
        status: data.status,
        date: data.createdAt,
      }),
    });
    return true;
  } catch (e) {
    console.warn('Google Sheet POST failed:', e);
    return false;
  }
}
