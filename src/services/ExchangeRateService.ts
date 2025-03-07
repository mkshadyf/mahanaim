import type { CurrencyCode } from '@/types/transaction';
import { doc, Firestore, getDoc, onSnapshot } from 'firebase/firestore';
import { errorService, ErrorSeverity, ErrorSource } from './ErrorService';

export interface ExchangeRate {
  rate: number;
  lastUpdated: Date;
  source: string;
}

interface ExchangeRateData {
  rate: number;
  lastUpdated: { toDate: () => Date };
  source: string;
}

export type ExchangeRateListener = (rate: ExchangeRate) => void;

export class ExchangeRateService {
  private currentRate: ExchangeRate | null = null;
  private listeners: ExchangeRateListener[] = [];
  private unsubscribe: (() => void) | null = null;

  constructor(private readonly db: Firestore) {
    // Initialize the service
    this.startListening();
  }

  private startListening(): void {
    try {
      // Stop any existing listener
      if (this.unsubscribe) {
        this.unsubscribe();
      }

      this.unsubscribe = onSnapshot(
        doc(this.db, 'settings', 'exchange_rate'),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as ExchangeRateData;
            this.currentRate = {
              rate: data.rate,
              lastUpdated: data.lastUpdated.toDate(),
              source: data.source,
            };

            // Notify all listeners
            this.notifyListeners();
          }
        },
        (error) => {
          errorService.handleError(
            error,
            ErrorSource.DATABASE,
            ErrorSeverity.ERROR,
            { operation: 'listenToExchangeRate' }
          );
        }
      );
    } catch (error) {
      errorService.handleError(
        error,
        ErrorSource.DATABASE,
        ErrorSeverity.ERROR,
        { operation: 'startListeningToExchangeRate' }
      );
    }
  }

  public async getCurrentRate(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): Promise<number> {
    try {
      // If we already have the rate cached, return it
      if (this.currentRate) {
        return this.getRateForCurrencies(fromCurrency, toCurrency);
      }

      // Otherwise, fetch it once
      const docSnapshot = await getDoc(doc(this.db, 'settings', 'exchange_rate'));

      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as ExchangeRateData;
        this.currentRate = {
          rate: data.rate,
          lastUpdated: data.lastUpdated.toDate(),
          source: data.source,
        };
        return this.getRateForCurrencies(fromCurrency, toCurrency);
      }

      // Default rate if none exists
      return 1;
    } catch (error) {
      throw errorService.handleError(
        error,
        ErrorSource.DATABASE,
        ErrorSeverity.ERROR,
        { operation: 'getCurrentRate', fromCurrency, toCurrency }
      );
    }
  }

  private getRateForCurrencies(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number {
    if (!this.currentRate) return 1;
    if (fromCurrency === toCurrency) return 1;

    // Handle FC (Congolese Franc) to USD conversion
    if (fromCurrency === 'USD' && toCurrency === 'FC' as CurrencyCode) {
      return 2000; // 1 USD = 2000 FC (example rate)
    } else if (fromCurrency === 'FC' as CurrencyCode && toCurrency === 'USD') {
      return 0.0005; // 1 FC = 0.0005 USD (example rate)
    }

    // Currently only supports USD and FC
    if (fromCurrency === 'USD' && toCurrency === 'FC') {
      return this.currentRate.rate;
    } else if (fromCurrency === 'FC' && toCurrency === 'USD') {
      return 1 / this.currentRate.rate;
    }

    // Default for unsupported currency pairs
    return 1;
  }

  public convertAmount(amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number {
    if (fromCurrency === toCurrency) return amount;

    const rate = this.getRateForCurrencies(fromCurrency, toCurrency);
    return amount * rate;
  }

  public addListener(listener: ExchangeRateListener): void {
    this.listeners.push(listener);

    // If we have a current rate, immediately notify the new listener
    if (this.currentRate) {
      listener(this.currentRate);
    }
  }

  public removeListener(listener: ExchangeRateListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    if (!this.currentRate) return;

    this.listeners.forEach(listener => {
      try {
        listener(this.currentRate!);
      } catch (error) {
        console.error('Error in exchange rate listener:', error);
      }
    });
  }

  public dispose(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
  }
} 