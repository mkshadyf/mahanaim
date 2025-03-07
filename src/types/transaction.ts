/**
 * Transaction status enum
 * Represents the current state of a transaction
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SYNCING = 'syncing'
}

/**
 * Transaction type enum
 * Represents the type of financial transaction
 */
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  SEND = 'send',
  RECEIVE = 'receive'
}

/**
 * Currency code type
 * Supported currency codes in the application
 */
export type CurrencyCode = 'USD' | 'EUR' | 'CDF' | 'FC';

/**
 * Money type
 * Represents a monetary amount with currency
 */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

/**
 * Transaction fee type
 * Represents a fee associated with a transaction
 */
export interface TransactionFee {
  amount: number;
  currency: CurrencyCode;
  description: string;
}

/**
 * Party information interface
 * Represents a party involved in a transaction
 */
export interface PartyInfo {
  id: string;
  type: 'customer' | 'agent' | 'shop';
  name: string;
  contact?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Transaction metadata interface
 * Additional metadata for a transaction
 */
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

/**
 * Basic transaction interface
 * Represents a financial transaction in the system
 */
export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  fromAccount?: string;
  toAccount?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  fees?: TransactionFee[];
  metadata?: Record<string, any>;
}

/**
 * Extended transaction interface
 * Used for more detailed transaction representation
 */
export interface ExtendedTransaction {
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
  shopId: string;
  timestamps: {
    created: Date;
    updated: Date;
    completed?: Date;
  };
  verification?: {
    method: string;
    status: 'pending' | 'verified' | 'failed';
    attempts: number;
    expiresAt: Date;
  };
}

/**
 * Transaction input interface
 * Used when creating a new transaction
 */
export interface TransactionInput {
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  description: string;
  fromAccount?: string;
  toAccount?: string;
  metadata?: Record<string, any>;
}

/**
 * Extended transaction input interface
 * Used for creating more detailed transactions
 */
export interface ExtendedTransactionInput {
  type: TransactionType;
  sender: Omit<PartyInfo, 'id'> & { id?: string };
  receiver: Omit<PartyInfo, 'id'> & { id?: string };
  amount: Money;
  metadata: Partial<TransactionMetadata>;
  notes?: string;
  shopId: string;
  agent?: PartyInfo;
}

/**
 * Transaction statistics interface
 * Used for reporting and analytics
 */
export interface TransactionStats {
  totalAmount: Record<CurrencyCode, number>;
  byType: Record<TransactionType, number>;
  byStatus: Record<TransactionStatus, number>;
  byCurrency: Record<CurrencyCode, number>;

  // Additional properties used in Dashboard components
  count?: number;
  volume?: Record<CurrencyCode, number>;
  fees?: Record<CurrencyCode, number>;
  success_rate?: number;
}

/**
 * Extended transaction statistics interface
 * Used for more detailed analytics
 */
export interface ExtendedTransactionStats {
  count: number;
  volume: Record<CurrencyCode, number>;
  fees: Record<CurrencyCode, number>;
  success_rate: number;
  average_time: number;
}

/**
 * Validation result interface
 * Used for transaction validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Sync operation type enum
 * Represents the type of synchronization operation
 */
export enum SyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

/**
 * Sync queue item interface
 * Represents an item in the sync queue
 */
export interface SyncQueueItem {
  id: string;
  entityId: string;
  entityType: EntityType;
  operation: SyncOperationType;
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

/**
 * Entity type enum
 * Represents the type of entity in the system
 */
export enum EntityType {
  TRANSACTION = 'transactions',
  EXCHANGE_RATE = 'exchangeRates',
  USER = 'users',
  SETTINGS = 'settings'
}

/**
 * Exchange rate interface
 * Represents an exchange rate between two currencies
 */
export interface ExchangeRate {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  lastUpdated: Date;
  source: string;
} 