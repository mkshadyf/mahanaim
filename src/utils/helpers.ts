import { format } from 'date-fns';

/**
 * Normalize a transaction type string into a valid TransactionType.
 * Throws an error if the value is invalid.
 *
 * @param value - The transaction type string from user input
 * @returns A normalized transaction type string
 */
export function normalizeTransactionType(value: string): 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'SEND' | 'RECEIVE' {
  const normalized = value.trim().toUpperCase();
  switch (normalized) {
    case 'DEPOSIT':
    case 'WITHDRAWAL':
    case 'TRANSFER':
    case 'PAYMENT':
    case 'SEND':
    case 'RECEIVE':
      return normalized;
    default:
      throw new Error(`Invalid transaction type: ${value}`);
  }
}

/**
 * Format a date using date-fns with an optional format string.
 * Default format follows locale's short date format.
 *
 * @param date - The date to format
 * @param dateFormat - Optional format string, default is 'P' (localized date)
 * @returns Formatted date string
 */
export function formatDate(date: Date, dateFormat: string = 'P'): string {
  return format(date, dateFormat);
}

import { useEffect, useRef } from 'react';

/**
 * Custom hook to run an async function with cancellation support.
 * It returns an object with the run and cancel functions.
 *
 * @param asyncFunction - The async function which takes an AbortSignal and returns a Promise
 */
export function useCancelableAsync<T>(asyncFunction: (signal: AbortSignal) => Promise<T>) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const run = async (): Promise<T | undefined> => {
    abortControllerRef.current = new AbortController();
    try {
      const result = await asyncFunction(abortControllerRef.current.signal);
      return result;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        console.log('Operation aborted');
      } else {
        throw error;
      }
    }
  };

  const cancel = () => {
    abortControllerRef.current?.abort();
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { run, cancel };
} 