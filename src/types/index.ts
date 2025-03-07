/**
 * Core transaction types
 */

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SYNCING = 'syncing'
}

// Transaction type enum
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment'
}

// Currency code type
export type CurrencyCode = 'USD' | 'EUR' | 'CDF';
export type Currency = CurrencyCode; // Alias for backward compatibility

// Money type
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

// Balance type (for backward compatibility)
export interface Balance {
  usd: number;
  fc: number;
}

// Transaction fee type
export interface TransactionFee {
  amount: number;
  currency: CurrencyCode;
  description: string;
}

// Party information interface
export interface PartyInfo {
  id: string;
  type: 'customer' | 'agent' | 'shop';
  name: string;
  contact?: string;
  metadata?: Record<string, unknown>;
}

// Simple party interface (for backward compatibility)
export interface Party {
  name: string;
  contact?: string;
}

// Transaction metadata interface
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

// Basic transaction interface
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

// Transaction input interface
export interface TransactionInput {
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  description: string;
  fromAccount?: string;
  toAccount?: string;
  metadata?: Record<string, any>;
}

// Transaction statistics interface
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

// Simple stats interface (for backward compatibility)
export interface Stats {
  count: number;
  volume: Balance;
  fees: Balance;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Sync operation type enum
export enum SyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

// Sync queue item interface
export interface SyncQueueItem {
  id: string;
  entityId: string;
  entityType: EntityType;
  operation: SyncOperationType;
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Entity type enum
export enum EntityType {
  TRANSACTION = 'transactions',
  EXCHANGE_RATE = 'exchangeRates',
  USER = 'users',
  SETTINGS = 'settings'
}

// Exchange rate interface
export interface ExchangeRate {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  lastUpdated: Date;
  source: string;
}

/**
 * Form-related types
 */
export interface BaseForm {
  notes?: string;
}

export interface MoneyForm extends BaseForm {
  amount: number;
  currency: Currency;
}

/**
 * UI component props
 */
export interface TableProps {
  loading?: boolean;
  onRefresh?: () => void;
}

export interface ModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * User-related types
 */
export type Status = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type UserRole = 'admin' | 'shop' | 'user'; 