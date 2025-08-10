// Import AsyncStorage polyfill first
import './asyncStorage';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from "@react-native-async-storage/async-storage";


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
const app = initializeApp(firebaseConfig)


// Initialize Firebase services
// initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage),
// });
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
