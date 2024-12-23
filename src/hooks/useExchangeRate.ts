import { db } from '@/config/firebase';
import { doc, type DocumentData, DocumentSnapshot, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface ExchangeRate {
  rate: number;
  lastUpdated: Date;
  source: string;
}

interface ExchangeRateData {
  rate: number;
  lastUpdated: { toDate: () => Date };
  source: string;
}

export const useExchangeRate = () => {
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'exchange_rate'),
      (doc: DocumentSnapshot<DocumentData>) => {
        if (doc.exists()) {
          const data = doc.data() as ExchangeRateData;
          setCurrentRate({
            rate: data.rate,
            lastUpdated: data.lastUpdated.toDate(),
            source: data.source,
          });
        }
        setLoading(false);
      },
      (error: Error) => {
        setError(error instanceof Error ? error : new Error('Failed to fetch exchange rate'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const convertAmount = (amount: number, fromCurrency: 'USD' | 'FC', toCurrency: 'USD' | 'FC'): number => {
    if (!currentRate) return amount;
    if (fromCurrency === toCurrency) return amount;

    return fromCurrency === 'USD'
      ? amount * currentRate.rate // USD to FC
      : amount / currentRate.rate; // FC to USD
  };

  return {
    currentRate,
    loading,
    error,
    convertAmount,
  };
};
