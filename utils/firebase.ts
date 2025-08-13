// utils/firebase.js
import './asyncStorage';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "silent-bridge-cf4cf.firebaseapp.com",
  projectId: "silent-bridge-cf4cf",
  storageBucket: "silent-bridge-cf4cf.firebasestorage.app",
  messagingSenderId: "402723350070",
  appId: "1:402723350070:web:4a203f56ec76b5e4641a97",
  measurementId: "G-8LLY395SK4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

if (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
} else {
  console.warn('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID not found in environment variables');
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const getCurrentUserToken = async () => {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (error) {
    console.error('Failed to get user token:', error);
    throw error;
  }
};

export default app;
