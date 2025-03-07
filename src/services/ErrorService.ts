import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

/**
 * Enum for error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Enum for error sources
 */
export enum ErrorSource {
  API = 'api',
  DATABASE = 'database',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  UI = 'ui',
  UNKNOWN = 'unknown',
  SYSTEM = 'system',
  OFFLINE_TRANSACTION_MANAGER = 'offline_transaction_manager'
}

/**
 * Interface for error metadata
 */
export interface ErrorMetadata {
  [key: string]: any;
}

/**
 * Interface for error log entry
 */
export interface ErrorLogEntry {
  timestamp: string;
  message: string;
  stack?: string;
  source: ErrorSource;
  severity: ErrorSeverity;
  metadata?: ErrorMetadata;
}

/**
 * Interface for error context
 */
export interface ErrorContext {
  showNotification?: boolean;
  metadata?: Record<string, any>;
  operation?: string;

  // Additional properties used in services
  storeName?: string;
  key?: any;
  item?: any;
  updates?: any;
  indexName?: string;
  indexValue?: any;
  limit?: number;

  // ExchangeRateService properties
  fromCurrency?: string;
  toCurrency?: string;

  // TransactionService properties
  input?: any;
  id?: string;
  status?: string;
  type?: string;
  amount?: any;
  startDate?: Date;
  endDate?: Date;
  shopId?: string;
}

/**
 * Interface for error report
 */
export interface ErrorReport {
  message: string;
  severity: ErrorSeverity;
  source: ErrorSource;
  error: Error;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * Service for handling and logging errors
 */
class ErrorService {
  private errorLog: ErrorLogEntry[] = [];

  /**
   * Handle an error with optional context
   */
  handleError(
    error: unknown,
    source: ErrorSource = ErrorSource.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context: ErrorContext = {}
  ): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[${source}] ${errorMessage}`, {
      severity,
      error,
      metadata: context.metadata
    });

    if (context.showNotification) {
      this.showErrorNotification(errorMessage, severity);
    }
  }

  /**
   * Report an error with detailed information
   */
  reportError(report: ErrorReport): void {
    const { message, severity, source, error, metadata } = report;
    const timestamp = report.timestamp || new Date();

    console.error(`[${source}] ${message}`, {
      severity,
      error,
      timestamp,
      metadata
    });

    // In a real app, we might send this to a logging service
    // logService.captureError(report);

    // Show notification for errors and critical issues
    if (severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL) {
      this.showErrorNotification(message, severity);
    }
  }

  /**
   * Log an error without showing a notification
   */
  logError(report: ErrorReport): void {
    const { message, severity, source, error, metadata } = report;
    const timestamp = report.timestamp || new Date();

    console.error(`[${source}] ${message}`, {
      severity,
      error,
      timestamp,
      metadata
    });

    // In a real app, we might send this to a logging service
    // logService.captureError(report);
  }

  /**
   * Show an error notification to the user
   */
  private showErrorNotification(message: string, severity: ErrorSeverity): void {
    const color = this.getSeverityColor(severity);

    notifications.show({
      title: this.getSeverityTitle(severity),
      message,
      color,
      autoClose: severity !== ErrorSeverity.CRITICAL
    });
  }

  /**
   * Get color based on severity
   */
  private getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'blue';
      case ErrorSeverity.WARNING:
        return 'yellow';
      case ErrorSeverity.ERROR:
        return 'red';
      case ErrorSeverity.CRITICAL:
        return 'dark';
      default:
        return 'gray';
    }
  }

  /**
   * Get title based on severity
   */
  private getSeverityTitle(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'Information';
      case ErrorSeverity.WARNING:
        return 'Warning';
      case ErrorSeverity.ERROR:
        return 'Error';
      case ErrorSeverity.CRITICAL:
        return 'Critical Error';
      default:
        return 'Notification';
    }
  }


  /**
   * Persist error log to local storage
   */
  private persistErrorLog(): void {
    try {
      localStorage.setItem('mahanaim_error_log', JSON.stringify(this.errorLog));
    } catch (error) {
      // If we can't persist, just log to console
      console.error('Failed to persist error log:', error);
    }
  }

  /**
   * Get the error log
   */
  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  /**
   * Clear the error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
    this.persistErrorLog();
  }
}

// Create and export a singleton instance
export const errorService = new ErrorService();

// React hook for using the error service
export const useError = () => {
  const { t } = useTranslation();

  // Get color based on severity
  const getColorForSeverity = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'blue';
      case ErrorSeverity.WARNING:
        return 'yellow';
      case ErrorSeverity.ERROR:
        return 'red';
      case ErrorSeverity.CRITICAL:
        return 'dark';
      default:
        return 'gray';
    }
  };

  // Handle an error with optional notification
  const handleError = (
    error: unknown,
    source: ErrorSource = ErrorSource.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    options: {
      showNotification?: boolean;
      metadata?: ErrorMetadata;
    } = {
        showNotification: true,
        metadata: undefined
      }
  ): void => {
    const { showNotification = true, metadata } = options;

    // Handle the error using the service
    errorService.handleError(error, source, severity, { showNotification, metadata });

    // Show notification if requested
    if (showNotification) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      notifications.show({
        title: t(`errors.${severity}`),
        message: t(`errors.${source}`, { defaultValue: errorMessage }),
        color: getColorForSeverity(severity),
      });
    }
  };

  return { handleError };
}; 