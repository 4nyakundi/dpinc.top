import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBcn0VG_TrZDUr18BaZgjSFuNmmt8imZPM",
  authDomain: "dataport-b34b0.firebaseapp.com",
  projectId: "dataport-b34b0",
  storageBucket: "dataport-b34b0.firebasestorage.app",
  messagingSenderId: "670768253907",
  appId: "1:670768253907:web:ba6ce77c216050bed2fd26",
  measurementId: "G-2VW2XYRLDN"
};

// Initialize Firebase (SSR safe check)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Analytics is only supported in browser environments
export const analytics = typeof window !== "undefined" 
  ? isSupported().then((supported) => supported ? getAnalytics(app) : null) 
  : null;

export default app;
