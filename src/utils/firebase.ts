import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "silent-bridge-cf4cf.firebaseapp.com",
  projectId: "silent-bridge-cf4cf",
  storageBucket: "silent-bridge-cf4cf.firebasestorage.app",
  messagingSenderId: "402723350070",
  appId: "1:402723350070:web:4a203f56ec76b5e4641a97",
  measurementId: "G-8LLY395SK4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const messaging = getMessaging(app);

export { getToken, onMessage };