import { Timestamp } from 'firebase/firestore';

export type TransactionType = 'send' | 'receive' | 'exchange';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type CurrencyCode = 'USD' | 'FC' | 'EUR';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface PartyInfo {
  id: string;
  type: 'customer' | 'agent' | 'shop';
  name: string;
  contact?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionFee {
  base: Money;
  percentage: number;
  total: Money;
  breakdown?: {
    service?: Money;
    platform?: Money;
    agent?: Money;
  };
}

export interface TransactionMetadata {
  platform: string;
  deviceId: string;
  ipAddress: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  userAgent?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  sender: PartyInfo;
  receiver: PartyInfo;
  agent: PartyInfo;
  amount: Money;
  exchangeRate?: number;
  fees: TransactionFee;
  metadata: TransactionMetadata;
  notes?: string;
  timestamps: {
    created: Timestamp;
    updated: Timestamp;
    completed?: Timestamp;
  };
  verification?: {
    method: string;
    status: 'pending' | 'verified' | 'failed';
    attempts: number;
    expiresAt: Timestamp;
  };
}

export interface TransactionInput {
  type: TransactionType;
  sender: Omit<PartyInfo, 'id'>;
  receiver: Omit<PartyInfo, 'id'>;
  amount: Money;
  metadata: Partial<TransactionMetadata>;
  notes?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface TransactionStats {
  count: number;
  volume: Record<CurrencyCode, number>;
  fees: Record<CurrencyCode, number>;
  success_rate: number;
  average_time: number;
} 