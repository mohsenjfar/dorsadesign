// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, signUp, signIn, signOut, signInWithOAuth, resetPassword, updatePassword } from '../lib/supabase';
import type { Profile } from '../types/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  // Auth actions
  signUp: (email: string, password: string, fullName?: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile when user changes
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auth action wrappers
  const handleSignUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await signUp(email, password, fullName);
      return { user: data.user, error };
    } catch (err) {
      return { user: null, error: err as AuthError };
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);
      return { user: data.user, error };
    } catch (err) {
      return { user: null, error: err as AuthError };
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await signInWithOAuth(provider);
  };

  const handleResetPassword = async (email: string) => {
    await resetPassword(email);
  };

  const handleUpdatePassword = async (newPassword: string) => {
    await updatePassword(newPassword);
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        signInWithOAuth: handleOAuth,
        resetPassword: handleResetPassword,
        updatePassword: handleUpdatePassword,
        updateProfile: handleUpdateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};