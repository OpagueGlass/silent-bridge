import { AGE_RANGE, AgeRange, Gender, State } from '@/constants/data';
import {
  signOut as firebaseSignOut,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { AsyncStorage } from '../utils/asyncStorage';
import { auth, db } from '../utils/firebase';

const getAgeRangeFromDOB = (dateOfBirth: Timestamp): AgeRange => {
  const age = Math.floor((Timestamp.now().toMillis() - dateOfBirth.toMillis()) / (1000 * 60 * 60 * 24 * 365));
  if (age < 18) return AGE_RANGE[0];
  if (age < 30) return AGE_RANGE[1];
  if (age < 40) return AGE_RANGE[2];
  if (age < 50) return AGE_RANGE[3];
  if (age < 70) return AGE_RANGE[4];
  return AGE_RANGE[5];
};

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age: AgeRange;
  gender: Gender;
  location: State;
  photo: string;
}

interface InterpreterProfile extends UserProfile {
  specialisation: string;
  languages: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  isInterpreter: boolean;
  userProfile: UserProfile | null;
  authState: AuthState;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  createDeafUserProfile: (profileData: any) => Promise<void>;
  createInterpreterProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInterpreter, setIsInterpreter] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    isSigningIn: false,
    error: null,
  });

  // Initialize Google Auth Provider
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  };

  const clearError = () => {
    updateAuthState({ error: null });
  };

  const raiseAuthError = (alt: string, error: unknown) => {
    updateAuthState({
      isSigningIn: false,
      error: error instanceof Error ? error.message : alt,
    });
  };
  const raiseSignInError = (error: unknown) => raiseAuthError('Sign-in failed', error);
  const raiseSignOutError = (error: unknown) => raiseAuthError('Sign-out failed', error);

  // Check for web redirect result
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          updateAuthState({ isSigningIn: false, isAuthenticated: true });
          const user = result.user;
          setUser(user);
          await loadUserProfile(user.uid);
        }
      } catch (error) {
        raiseSignInError(error);
      }
    };
    checkRedirectResult();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        updateAuthState({ isAuthenticated: true, isLoading: true });
        await loadUserProfile(user.uid);
      } else {
        setUser(null);
        setUserProfile(null);
        setIsInterpreter(false);
        updateAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    updateAuthState({
      isSigningIn: true,
      isLoading: true,
      error: null,
    });

    const popupSignIn = async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        updateAuthState({ isSigningIn: false });
        // onAuthStateChanged will handle user state and profile loading
      } catch (popupError: any) {
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
    };

    try {
      if (Platform.OS === 'web') await popupSignIn();
      else await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      raiseSignInError(error);
    }
  };

  const handleSignOut = async () => {
    try {
      updateAuthState({ isLoading: true, error: null });
      await firebaseSignOut(auth);
      // await AsyncStorage.clear()
      setUserProfile(null);
      updateAuthState({ isAuthenticated: false, isLoading: false });
    } catch (error) {
      raiseSignOutError(error);
    }
  };

  const loadUserProfile = async (uid: string) => {
    try {
      const deafUserRef = doc(db, 'deaf_users', uid);
      const deafUserSnap = await getDoc(deafUserRef);
      if (deafUserSnap.exists()) {
        const {uid:_, dateOfBirth, ...userData} = deafUserSnap.data();
        const ageRange = getAgeRangeFromDOB(dateOfBirth);
        const userProfile = { ...userData, age: ageRange } as UserProfile;
        setUserProfile(userProfile);
        setIsInterpreter(false);
        updateAuthState({ isLoading: false });
        return;
      }

      const interpreterRef = doc(db, 'interpreters', uid);
      const interpreterSnap = await getDoc(interpreterRef);
      if (interpreterSnap.exists()) {
        const {uid:_, dateOfBirth, ...userData} = interpreterSnap.data();
        const ageRange = getAgeRangeFromDOB(dateOfBirth);
        const userProfile = { ...userData, age: ageRange } as InterpreterProfile;
        setUserProfile(userProfile);
        setIsInterpreter(true);
        updateAuthState({ isLoading: false });
        return;
      }
      updateAuthState({
        error: 'User profile not found. Please create an account.',
        isLoading: false,
      });
    } catch (error) {
      updateAuthState({
        error: error instanceof Error ? error.message : 'Failed to load user profile',
        isLoading: false,
      });
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      updateAuthState({ error: null });
      await loadUserProfile(user.uid);
    } catch (error) {
      updateAuthState({
        error: error instanceof Error ? error.message : 'Failed to refresh profile',
      });
    }
  };

  const checkExistingUser = async (uid: string) => {
    // Check if user exists in deaf_users collection
    const deafUserRef = doc(db, 'deaf_users', uid);
    const deafUserSnap = await getDoc(deafUserRef);
    if (deafUserSnap.exists()) return true;

    // Check if user exists in interpreters collection
    const interpreterRef = doc(db, 'interpreters', uid);
    const interpreterSnap = await getDoc(interpreterRef);
    if (interpreterSnap.exists()) return true;

    return false;
  };

  const authenticateWithGoogle = async () => {
    updateAuthState({ isSigningIn: true, isLoading: true, error: null });

    try {
      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, googleProvider);
      } catch (popupError: any) {
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          await signInWithRedirect(auth, googleProvider);
          return null; // Redirect will handle the result
        }
        throw popupError;
      }

      const user = userCredential.user;

      // Check if user already exists
      const userExists = await checkExistingUser(user.uid);
      if (userExists) {
        await firebaseSignOut(auth);
        updateAuthState({ isSigningIn: false, isLoading: false });
        throw new Error('An account with this Google account already exists. Please sign in instead of signing up.');
      }

      return user;
    } catch (error) {
      updateAuthState({ isSigningIn: false, isLoading: false });
      throw error;
    }
  };

  const createDeafUserProfile = async (profileData: any) => {
    try {
      const user = await authenticateWithGoogle();
      if (!user) return; // Redirect case

      // Save to Firestore
      await setDoc(doc(db, 'deaf_users', user.uid), {
        ...profileData,
        uid: user.uid,
        email: user.email || '',
        photo: user.photoURL || '',
      });
      updateAuthState({ isSigningIn: false });
      setUser(user);
      updateAuthState({ isAuthenticated: true, isLoading: true });
      await loadUserProfile(user.uid);
    } catch (error) {
      raiseSignInError(error);
      throw error;
    }
  };

  const createInterpreterProfile = async (profileData: any) => {
    try {
      const user = await authenticateWithGoogle();
      if (!user) return; // Redirect case

      // Save to Firestore
      await setDoc(doc(db, 'interpreters', user.uid), {
        ...profileData,
        uid: user.uid,
        email: user.email || '',
        photo: user.photoURL || '',
      });
      updateAuthState({ isSigningIn: false });
      setUser(user);
      updateAuthState({ isAuthenticated: true, isLoading: true });
      await loadUserProfile(user.uid);
    } catch (error) {
      raiseSignInError(error);
      throw error;
    }
  };
  const value = {
    user,
    isInterpreter,
    userProfile,
    authState,
    handleSignIn,
    handleSignOut,
    refreshProfile,
    createDeafUserProfile,
    createInterpreterProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
