import {
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs,
  query, orderBy, limit, onSnapshot,
  serverTimestamp, type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface OnboardingData {
  preference?: string;
  gender?:     string;
  cycle?:      string;
  goal?:       string;
  time?:       string | number;
}

export interface EmotionRecord {
  date:      string;   // toDateString() format
  emotion:   string;
}

export interface UserProfile {
  uid:             string;
  email:           string | null;
  displayName:     string;
  onboarded:       boolean;
  cycleEnabled:    boolean;
  onboardingData:  OnboardingData;
  streak?:         number;
  lastCheckin?:    string;
  todayEmotion?:   string;
  emotionHistory?: EmotionRecord[];
  createdAt:       Timestamp | null;
  updatedAt:       Timestamp | null;
}

export interface JournalMessage {
  id?:       string;
  role:      "user" | "assistant";
  content:   string;
  imageUrl?: string;
  createdAt: Timestamp | null;
}

// ════════════════════════════════════════════════════════════════
// USER PROFILE — CRUD
// ════════════════════════════════════════════════════════════════

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(
  user: User,
  extra: Partial<UserProfile> = {}
): Promise<void> {
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid:            user.uid,
      email:          user.email,
      displayName:    extra.displayName ?? user.displayName ?? "",
      onboarded:      extra.onboarded ?? false,
      cycleEnabled:   extra.cycleEnabled ?? false,
      onboardingData: extra.onboardingData ?? {},
      createdAt:      serverTimestamp(),
      updatedAt:      serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ════════════════════════════════════════════════════════════════
// JOURNAL MESSAGES — CRUD
// ════════════════════════════════════════════════════════════════

export async function saveJournalMessage(
  uid: string,
  msg: Pick<JournalMessage, "role" | "content" | "imageUrl">
): Promise<string> {
  const ref = await addDoc(collection(db, "users", uid, "journal"), {
    ...msg,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getJournalMessages(
  uid: string,
  count = 60
): Promise<JournalMessage[]> {
  const q = query(
    collection(db, "users", uid, "journal"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as JournalMessage))
    .reverse(); // cronológico
}

// ════════════════════════════════════════════════════════════════
// JOURNAL MESSAGES — REAL-TIME LISTENER
// ════════════════════════════════════════════════════════════════

/**
 * Subscribes to the last `count` journal messages in real time.
 * Returns an unsubscribe function — call it on component unmount.
 *
 * Usage:
 *   const unsub = subscribeToJournal(uid, (msgs) => setMessages(msgs));
 *   return () => unsub();
 */
export function subscribeToJournal(
  uid: string,
  onMessages: (msgs: JournalMessage[]) => void,
  count = 60
): () => void {
  const q = query(
    collection(db, "users", uid, "journal"),
    orderBy("createdAt", "asc"),
    limit(count)
  );

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as JournalMessage));
    onMessages(msgs);
  });
}
