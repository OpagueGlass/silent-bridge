import { hasInterpreterProfile, getProfile, Profile } from "@/utils/query";
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
  providerToken: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: (user: User | null) => Promise<boolean>;
  isInterpreter: boolean;
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
      setProviderToken(session?.provider_token || null);
      if (session?.user) {
        await loadProfile(session.user);
      }
      updateAuthState({ isLoading: false });
    });

    // Listens for changes to auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setProviderToken(session?.provider_token || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Signs in the user with Google OAuth and requests calendar access on first sign-in.
   */
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar.events",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  /**
   * Signs out the user.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
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

  const value = {
    authState,
    session,
    profile,
    providerToken,
    signIn,
    signOut,
    loadProfile,
    isInterpreter,
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
