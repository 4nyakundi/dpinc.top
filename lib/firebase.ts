import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBcn0VG_TrZDUr18BaZgjSFuNmmt8imZPM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dataport-b34b0.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dataport-b34b0",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dataport-b34b0.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "670768253907",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:670768253907:web:ba6ce77c216050bed2fd26",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2VW2XYRLDN"
};

// Initialize Firebase (SSR safe check)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// Analytics is only supported in browser environments
export const analytics = typeof window !== "undefined" 
  ? isSupported().then((supported) => supported ? getAnalytics(app) : null) 
  : null;

export default app;
