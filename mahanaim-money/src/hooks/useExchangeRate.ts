import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

interface ExchangeRate {
  id: string;
  rate: number;
  date: Date;
  updatedBy: string;
}

export const useExchangeRate = () => {
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLatestRate();
  }, []);

  const fetchLatestRate = async () => {
    try {
      const ratesRef = collection(db, 'exchangeRates');
      const q = query(ratesRef, orderBy('date', 'desc'), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setCurrentRate({
          id: snapshot.docs[0].id,
          rate: data.rate,
          date: data.date.toDate(),
          updatedBy: data.updatedBy,
        });
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (newRate: number) => {
    if (!user) {
      throw new Error('User must be logged in to update exchange rates');
    }

    if (user.role !== 'admin') {
      throw new Error('Only admins can update exchange rates');
    }

    try {
      setLoading(true);
      const ratesRef = collection(db, 'exchangeRates');
      await addDoc(ratesRef, {
        rate: newRate,
        date: serverTimestamp(),
        updatedBy: user.uid,
      });

      await fetchLatestRate();
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const convertUSDtoFC = (usdAmount: number) => {
    if (!currentRate) return null;
    return usdAmount * currentRate.rate;
  };

  const convertFCtoUSD = (fcAmount: number) => {
    if (!currentRate) return null;
    return fcAmount / currentRate.rate;
  };

  return {
    currentRate,
    loading,
    updateRate,
    convertUSDtoFC,
    convertFCtoUSD,
  };
};
