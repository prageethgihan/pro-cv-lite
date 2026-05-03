import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAIjYDWd6k1TIBSDvHkjypbZaHINQ5H4BI",
  authDomain: "procv-lite.firebaseapp.com",
  projectId: "procv-lite",
  storageBucket: "procv-lite.firebasestorage.app",
  messagingSenderId: "40040148131",
  appId: "1:40040148131:web:1d1f486512dcdab7766316",
};

// ✅ Vite/React HMR safe
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);