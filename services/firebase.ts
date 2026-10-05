import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  getDocFromServer,
  serverTimestamp,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Firestore with custom databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// Validate connection on boot as required by Firebase guidelines
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore offline or checking connection.");
    }
  }
}
testFirestoreConnection();

// Authentication helpers
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Persist user record in Firestore
  if (user) {
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          id: user.uid,
          email: user.email || "",
          displayName: user.displayName || "Creator",
          photoURL: user.photoURL || "",
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Could not sync user profile to Firestore:", e);
    }
  }

  return user;
};

export const logout = async () => {
  await signOut(auth);
};

export interface SavedProjectItem {
  id: string;
  userId: string;
  topic: string;
  category: string;
  type: "youtube" | "social";
  data: any;
  createdAt: string;
}

// Firestore operations for saved projects
export const saveProjectToFirestore = async (
  userId: string,
  project: {
    topic: string;
    category?: string;
    type: "youtube" | "social";
    data: any;
  }
): Promise<string> => {
  const colRef = collection(db, "users", userId, "savedProjects");
  const docRef = await addDoc(colRef, {
    userId,
    topic: project.topic,
    category: project.category || "General",
    type: project.type,
    data: project.data,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

export const getSavedProjectsFromFirestore = async (userId: string): Promise<SavedProjectItem[]> => {
  try {
    const colRef = collection(db, "users", userId, "savedProjects");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<SavedProjectItem, "id">),
    }));
  } catch (error) {
    console.error("Error fetching saved projects:", error);
    // Fallback without orderBy if index is still propagating
    const colRef = collection(db, "users", userId, "savedProjects");
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<SavedProjectItem, "id">),
    }));
  }
};

export const deleteSavedProjectFromFirestore = async (userId: string, projectId: string): Promise<void> => {
  const docRef = doc(db, "users", userId, "savedProjects", projectId);
  await deleteDoc(docRef);
};
