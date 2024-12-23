import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

interface PendingOperation {
  id: string;
  collection: string;
  operation: 'add' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending operations from IndexedDB
    loadPendingOperations();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      syncPendingOperations();
    }
  }, [isOnline, pendingOperations]);

  const loadPendingOperations = async () => {
    try {
      const stored = localStorage.getItem('pendingOperations');
      if (stored) {
        setPendingOperations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading pending operations:', error);
    }
  };

  const savePendingOperations = async (operations: PendingOperation[]) => {
    try {
      localStorage.setItem('pendingOperations', JSON.stringify(operations));
      setPendingOperations(operations);
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  };

  const addPendingOperation = async (
    collectionName: string,
    operation: 'add' | 'update' | 'delete',
    data: any
  ) => {
    const newOperation: PendingOperation = {
      id: Math.random().toString(36).substr(2, 9),
      collection: collectionName,
      operation,
      data,
      timestamp: Date.now(),
    };

    const updatedOperations = [...pendingOperations, newOperation];
    await savePendingOperations(updatedOperations);

    if (isOnline) {
      syncPendingOperations();
    }
  };

  const syncPendingOperations = async () => {
    if (!isOnline || pendingOperations.length === 0) return;

    const failedOperations: PendingOperation[] = [];

    for (const op of pendingOperations) {
      try {
        const collectionRef = collection(db, op.collection);

        switch (op.operation) {
          case 'add':
            await addDoc(collectionRef, {
              ...op.data,
              timestamp: serverTimestamp(),
            });
            break;
          // Implement update and delete cases as needed
        }
      } catch (error) {
        console.error(`Error syncing operation:`, error);
        failedOperations.push(op);
      }
    }

    await savePendingOperations(failedOperations);
  };

  return {
    isOnline,
    pendingOperations,
    addPendingOperation,
    syncPendingOperations,
  };
};
