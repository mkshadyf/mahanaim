import { errorService, ErrorSeverity, ErrorSource } from './ErrorService';

export interface StorageOptions {
  dbName: string;
  version: number;
  stores: Record<string, string>;
}

/**
 * Service for managing local storage using IndexedDB
 * Provides a simple interface for CRUD operations on local data
 */
export class LocalStorageService {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  private stores: Record<string, string>;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(options: StorageOptions) {
    this.dbName = options.dbName;
    this.version = options.version;
    this.stores = options.stores;
  }

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.version);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create object stores
          Object.entries(this.stores).forEach(([storeName, keyPath]) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath });
            }
          });
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.isInitialized = true;
          resolve();
        };

        request.onerror = (event) => {
          const error = (event.target as IDBOpenDBRequest).error;
          errorService.handleError(
            error,
            ErrorSource.DATABASE,
            ErrorSeverity.ERROR,
            { operation: 'initLocalStorage' }
          );
          reject(error);
        };
      } catch (error) {
        errorService.handleError(
          error,
          ErrorSource.DATABASE,
          ErrorSeverity.ERROR,
          { operation: 'initLocalStorage' }
        );
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * Add an item to a store
   */
  async add<T>(storeName: string, item: T): Promise<IDBValidKey> {
    await this.init();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          errorService.handleError(
            error,
            ErrorSource.DATABASE,
            ErrorSeverity.ERROR,
            { operation: 'addToLocalStorage', storeName, item }
          );
          reject(error);
        };
      } catch (error) {
        errorService.handleError(
          error,
          ErrorSource.DATABASE,
          ErrorSeverity.ERROR,
          { operation: 'addToLocalStorage', storeName, item }
        );
        reject(error);
      }
    });
  }

  /**
   * Get an item from a store by key
   */
  async get<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    await this.init();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          errorService.handleError(
            error,
            ErrorSource.DATABASE,
            ErrorSeverity.ERROR,
            { operation: 'getFromLocalStorage', storeName, key }
          );
          reject(error);
        };
      } catch (error) {
        errorService.handleError(
          error,
          ErrorSource.DATABASE,
          ErrorSeverity.ERROR,
          { operation: 'getFromLocalStorage', storeName, key }
        );
        reject(error);
      }
    });
  }

  /**
   * Get all items from a store
   */
  async getAll<T>(
    storeName: string,
    indexName?: string,
    indexValue?: IDBValidKey,
    limit?: number
  ): Promise<T[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);

        let request: IDBRequest;

        if (indexName && indexValue !== undefined) {
          const index = store.index(indexName);
          request = index.getAll(indexValue, limit);
        } else {
          request = store.getAll(null, limit);
        }

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          errorService.handleError(
            error,
            ErrorSource.DATABASE,
            ErrorSeverity.ERROR,
            { operation: 'getAllFromLocalStorage', storeName, indexName, indexValue }
          );
          reject(error);
        };
      } catch (error) {
        errorService.handleError(
          error,
          ErrorSource.DATABASE,
          ErrorSeverity.ERROR,
          { operation: 'getAllFromLocalStorage', storeName, indexName, indexValue }
        );
        reject(error);
      }
    });
  }

  /**
   * Update an item in a store
   */
  async update<T>(storeName: string, key: IDBValidKey, updates: Partial<T>): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        // First get the current item
        const getRequest = store.get(key);

        getRequest.onsuccess = () => {
          if (!getRequest.result) {
            reject(new Error(`Item with key ${key} not found in ${storeName}`));
            return;
          }

          // Merge the current item with updates
          const updatedItem = { ...getRequest.result, ...updates };

          // Put the updated item back
          const putRequest = store.put(updatedItem);

          putRequest.onsuccess = () => {
            resolve();
          };

          putRequest.onerror = (event) => {
            const error = (event.target as IDBRequest).error;
            errorService.handleError(
              error,
              ErrorSource.DATABASE,
              ErrorSeverity.ERROR,
              { operation: 'updateInLocalStorage', storeName, key, updates }
            );
            reject(error);
          };
        };

        getRequest.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          errorService.handleError(
            error,
            ErrorSource.DATABASE,
            ErrorSeverity.ERROR,
            { operation: 'updateInLocalStorage', storeName, key, updates }
          );
          reject(error);
        };
      } catch (error) {
        errorService.handleError(
          error,
          ErrorSource.DATABASE,
          ErrorSeverity.ERROR,
          { operation: 'updateInLocalStorage', storeName, key, updates }
        );
        reject(error);
      }
    });
  }

  /**
   * Delete an item from a store
   */
  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          errorService.handleError(
            error,
            ErrorSource.DATABASE,
            ErrorSeverity.ERROR,
            { operation: 'deleteFromLocalStorage', storeName, key }
          );
          reject(error);
        };
      } catch (error) {
        errorService.handleError(
          error,
          ErrorSource.DATABASE,
          ErrorSeverity.ERROR,
          { operation: 'deleteFromLocalStorage', storeName, key }
        );
        reject(error);
      }
    });
  }

  /**
   * Clear all items from a store
   */
  async clear(storeName: string): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          errorService.handleError(
            error,
            ErrorSource.DATABASE,
            ErrorSeverity.ERROR,
            { operation: 'clearLocalStorage', storeName }
          );
          reject(error);
        };
      } catch (error) {
        errorService.handleError(
          error,
          ErrorSource.DATABASE,
          ErrorSeverity.ERROR,
          { operation: 'clearLocalStorage', storeName }
        );
        reject(error);
      }
    });
  }
}

// Create and export a singleton instance
export const localStorageService = new LocalStorageService({
  dbName: 'MahanimOfflineDB',
  version: 1,
  stores: {
    transactions: 'id',
    syncQueue: 'id',
    exchangeRates: 'id',
    userPreferences: 'id'
  }
}); 