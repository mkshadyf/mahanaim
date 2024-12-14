import {
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'agent';
  shopId?: string;
  displayName?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          role: userData?.role || 'agent',
          shopId: userData?.shopId,
          displayName: userData?.displayName || firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        role: userData?.role || 'agent',
        shopId: userData?.shopId,
        displayName: userData?.displayName || userCredential.user.displayName,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = () => firebaseSignOut(auth);

  return {
    user,
    loading,
    signIn,
    signOut,
  };
};

export default useAuth;
