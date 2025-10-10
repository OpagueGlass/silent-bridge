import { getProfile, hasInterpreterProfile, Profile } from "@/utils/query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

interface AuthState {
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  session: Session | null;
  authState: AuthState;
  profile: Profile | null;
  isInterpreter: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: (user: User | null) => Promise<boolean>;
  getValidProviderToken: () => Promise<string | null>;
}

// Create the AuthContext with default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that provides authentication context to its children.
 *
 * @param props - The props for the provider.
 * @returns The AuthProvider component.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isInterpreter, setIsInterpreter] = useState<boolean>(false);
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    error: null,
  });

  // Helper to update auth state
  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // Checks for an existing session on initial load
      setSession(session);
      if (session?.user) {
        await loadProfile(session.user);
        await refreshProviderToken();
      }
      updateAuthState({ isLoading: false });
    });

    // Listens for changes to auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      // Store the refresh token whenever we get a new session
      if (session?.provider_refresh_token) {
        await AsyncStorage.setItem("providerRefreshToken", session.provider_refresh_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ??
      process?.env?.NEXT_PUBLIC_VERCEL_URL ??
      `${window.location.origin}`;
    url = url.startsWith('http') ? url : `https://${url}`
    url = url.endsWith('/') ? url : `${url}/`
    return `${url}auth/callback`;
  }

  /**
   * Signs in the user with Google OAuth and requests calendar access on first sign-in.
   */
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar.events",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        redirectTo: getURL(),
      },
    });
  };

  /**
   * Signs out the user.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.setItem("providerRefreshToken", "");
    setProfile(null);
    setProviderToken(null);
    setIsInterpreter(false);
  };

  /**
   * Helper method to check if a user has an interpreter profile.
   *
   * @param user - The user to check.
   */
  const isInterpreterProfile = async (id: string) => {
    const hasInterpreter = await hasInterpreterProfile(id);
    setIsInterpreter(hasInterpreter);
  };

  /**
   * Loads the user's profile
   *
   * @param user - The user session to load the profile for.
   * @returns A promise that resolves to true if the profile was loaded successfully, false otherwise.
   */
  const loadProfile = async (user: User | null): Promise<boolean> => {
    if (user) {
      const id = user.id;
      const profile = await getProfile(id);
      if (!profile) {
        setProfile(null);
        return false;
      }
      setProfile(profile);
      await isInterpreterProfile(id);
      return true;
    }
    return false;
  };

  /**
   * Refreshes the Google provider token when it expires
   */
  const refreshProviderToken = async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem("providerRefreshToken");
    if (!token) {
      console.error("No refresh token available");
      await signIn();
      return null;
    }

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET!,
          refresh_token: token,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        console.error(`Token refresh failed: ${response.status}`);
        if (response.status === 400 || response.status === 401) {
          // If token is invalid or expired, try to sign in again
          await signIn();
        }
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      const newToken = data.access_token;

      if (newToken) {
        setProviderToken(newToken);
        return newToken;
      }

      return null;
    } catch (error) {
      console.error("Failed to refresh provider token:", error);
      await signIn();
      return null;
    }
  };

  /**
   * Gets a valid provider token and refreshing if necessary
   */
  const getValidProviderToken = async (): Promise<string | null> => {
    if (providerToken) {
      try {
        // Test if current token is valid by making a simple Google API call
        const response = await fetch("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + providerToken);
        if (response.ok) {
          return providerToken;
        }
      } catch (error) {
        return await refreshProviderToken();
      }
    }

    return await refreshProviderToken();
  };

  const value = {
    authState,
    session,
    profile,
    isInterpreter,
    signIn,
    signOut,
    loadProfile,
    getValidProviderToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access the authentication context.
 *
 * @returns The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
