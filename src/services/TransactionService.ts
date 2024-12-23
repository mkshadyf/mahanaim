import { db } from '@/config/firebase';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import type {
  CurrencyCode,
  Money,
  Transaction,
  TransactionFee,
  TransactionInput,
  TransactionStats,
  TransactionStatus,
  TransactionType,
  ValidationResult,
} from '@/types/transaction';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';

export class TransactionService {
  private readonly collectionName = 'transactions';

  async createTransaction(input: TransactionInput): Promise<Transaction> {
    const validation = await this.validateTransaction(input);
    if (!validation.valid) {
      throw new Error(`Invalid transaction: ${validation.errors?.join(', ')}`);
    }

    const { currentRate } = useExchangeRate();
    const fees = await this.calculateFees(input.amount);

    const transaction: Omit<Transaction, 'id'> = {
      type: input.type,
      status: 'pending',
      sender: { ...input.sender, id: crypto.randomUUID() },
      receiver: { ...input.receiver, id: crypto.randomUUID() },
      agent: {
        id: 'system',
        type: 'agent',
        name: 'System',
      },
      amount: input.amount,
      exchangeRate: currentRate?.rate,
      fees,
      metadata: {
        platform: 'web',
        deviceId: 'unknown',
        ipAddress: 'unknown',
        ...input.metadata,
      },
      notes: input.notes,
      timestamps: {
        created: Timestamp.now(),
        updated: Timestamp.now(),
      },
    };

    const docRef = await addDoc(collection(db, this.collectionName), transaction);
    return { ...transaction, id: docRef.id } as Transaction;
  }

  async validateTransaction(input: TransactionInput): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (input.amount.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!input.sender.name || !input.receiver.name) {
      errors.push('Sender and receiver names are required');
    }

    // Add more validation rules as needed

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private async calculateFees(amount: Money): Promise<TransactionFee> {
    // Basic fee calculation - should be enhanced based on business rules
    const baseAmount = amount.amount * 0.01; // 1% base fee
    const base: Money = {
      amount: baseAmount,
      currency: amount.currency,
    };

    return {
      base,
      percentage: 1,
      total: base,
      breakdown: {
        service: base,
      },
    };
  }

  async updateTransactionStatus(
    id: string,
    status: TransactionStatus
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      status,
      'timestamps.updated': serverTimestamp(),
      ...(status === 'completed' && {
        'timestamps.completed': serverTimestamp(),
      }),
    });
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Transaction) : null;
  }

  async getTransactionStats(
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date
  ): Promise<TransactionStats> {
    let q = query(collection(db, this.collectionName));

    if (type) {
      q = query(q, where('type', '==', type));
    }

    if (startDate) {
      q = query(q, where('timestamps.created', '>=', Timestamp.fromDate(startDate)));
    }

    if (endDate) {
      q = query(q, where('timestamps.created', '<=', Timestamp.fromDate(endDate)));
    }

    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Transaction
    );

    const stats: TransactionStats = {
      count: transactions.length,
      volume: {} as Record<CurrencyCode, number>,
      fees: {} as Record<CurrencyCode, number>,
      success_rate:
        transactions.length > 0
          ? (transactions.filter((t) => t.status === 'completed').length /
            transactions.length) *
          100
          : 0,
      average_time:
        transactions.length > 0
          ? transactions.reduce((acc: number, t: Transaction) => {
            if (t.timestamps.completed) {
              return (
                acc +
                (t.timestamps.completed.toMillis() - t.timestamps.created.toMillis())
              );
            }
            return acc;
          }, 0) / transactions.length
          : 0,
    };

    // Calculate volumes and fees by currency
    transactions.forEach((t: Transaction) => {
      const currency = t.amount.currency;
      if (!stats.volume[currency]) stats.volume[currency] = 0;
      if (!stats.fees[currency]) stats.fees[currency] = 0;
      stats.volume[currency] += t.amount.amount;
      stats.fees[currency] += t.fees.total.amount;
    });

    return stats;
  }
} 