import { auth } from '@/config/firebase';
import type { User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState((prev) => ({ ...prev, user, loading: false }));
      },
      (error) => {
        setState((prev) => ({ ...prev, error, loading: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to sign in'),
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to sign up'),
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await signOut(auth);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to sign out'),
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    logout,
  };
};

export default useAuth;
