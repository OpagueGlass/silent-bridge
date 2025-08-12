import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { getAgeRangeFromDOB } from '../utils/helper';

interface Profile {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  session: Session | null;
  authState: AuthState;
  profile: Profile | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: (user: User | null) => Promise<boolean>;
  isInterpreter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isInterpreter, setIsInterpreter] = useState<boolean>(false);
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    error: null,
  });

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
          await loadProfile(session.user);
        }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const isInterpreterProfile = async (user: User) => {
    const { data: interpreterProfile } = await supabase
      .from('interpreter_profile')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setIsInterpreter(!!interpreterProfile);
  };

  const loadProfile = async (user: User | null): Promise<boolean> => {

    if (user) {
      const { data: profile } = await supabase.from('profile').select('*').eq('id', user.id).maybeSingle();
      const { dateOfBirth, ...rest } = profile;
      const ageRange = getAgeRangeFromDOB(dateOfBirth);
      setProfile({ ...rest, ageRange });
      await isInterpreterProfile(user);
      return true;
    }
    return false;
  };

  const value = {
    authState,
    session,
    profile,
    signIn,
    signOut,
    isInterpreterProfile,
    loadProfile,
    isInterpreter,
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
