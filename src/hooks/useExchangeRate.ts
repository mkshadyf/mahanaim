import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ExchangeRateService } from '../services/ExchangeRateService';
import { CurrencyCode } from '../types/transaction';

// Create a singleton instance of the service
const exchangeRateService = new ExchangeRateService(db);

export function useExchangeRate() {
  const [rate, setRate] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add listener for rate changes
    exchangeRateService.addListener((newRate) => {
      setRate(newRate.rate);
    });

    return () => {
      // Remove listener on cleanup
      exchangeRateService.dispose();
    };
  }, []);

  const convertAmount = (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => {
    try {
      return exchangeRateService.convertAmount(amount, fromCurrency, toCurrency);
    } catch (err) {
      console.error('Error converting amount:', err);
      return amount;
    }
  };

  const getCurrentRate = async (fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => {
    try {
      setLoading(true);
      setError(null);
      const rate = await exchangeRateService.getCurrentRate(fromCurrency, toCurrency);
      setRate(rate);
      return rate;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get exchange rate');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    rate,
    loading,
    error,
    convertAmount,
    getCurrentRate
  };
}
