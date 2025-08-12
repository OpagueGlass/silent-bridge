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
  getProfile: () => Promise<void>;
  getInterpreterProfile: () => Promise<void>;
  isInterpreterProfile: () => Promise<boolean>;
  loadProfile: () => Promise<boolean>;
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
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

  const getProfile = async () => {
    if (!session) return null;
    const { data: profile } = await supabase.from('profile').select('*').eq('id', session.user.id).maybeSingle();
    if (!profile) updateAuthState({ error: 'Profile not found' });
    const { dateOfBirth, ...rest } = profile;
    const ageRange = getAgeRangeFromDOB(dateOfBirth);
    return { ...rest, ageRange };
  };

  const isInterpreterProfile = async () => {
    if (!session) return false;
    const { data: interpreterProfile } = await supabase
      .from('interpreter_profile')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    return !!interpreterProfile;
  };

  const getInterpreterProfile = async () => {
    if (!session) return null;
    const { data: interpreterProfile } = await supabase
      .from('interpreter_profile')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    if (!interpreterProfile) updateAuthState({ error: 'Interpreter profile not found' });
    return interpreterProfile;
  };

  const loadProfile = async (): Promise<boolean> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profile').select('*').eq('id', user.id).maybeSingle();
      setProfile(profile);
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
    getProfile,
    getInterpreterProfile,
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
