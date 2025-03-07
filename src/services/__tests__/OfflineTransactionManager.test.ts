// import type { Transaction } from '../../types';
// import { EntityType, TransactionStatus, TransactionType } from '../../types';
// import { errorService } from '../ErrorService';
// import { localStorageService } from '../LocalStorageService';
// import { OfflineTransactionManager } from '../OfflineTransactionManager';

// // Mock dependencies
// jest.mock('../LocalStorageService', () => ({
//   localStorageService: {
//     add: jest.fn(),
//     get: jest.fn(),
//     getAll: jest.fn(),
//     update: jest.fn(),
//     delete: jest.fn()
//   }
// }));

// jest.mock('../ErrorService', () => ({
//   errorService: {
//     handleError: jest.fn()
//   },
//   ErrorSeverity: {
//     ERROR: 'error'
//   },
//   ErrorSource: {
//     DATABASE: 'database'
//   }
// }));

// // Add Jest type declarations
// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace jest {
//     interface Mock<T = any, Y extends any[] = any[]> extends Function {
//       mockImplementation: (fn: (...args: Y) => T) => this;
//       mockResolvedValue: (value: T) => this;
//     }
//     function fn<T = any>(): Mock<T>;
//     function spyOn(object: any, method: string): Mock;
//     function clearAllMocks(): void;
//   }
// }

// describe('OfflineTransactionManager', () => {
//   let offlineTransactionManager: OfflineTransactionManager;

//   // Mock navigator.onLine
//   const originalNavigatorOnLine = Object.getOwnPropertyDescriptor(navigator, 'onLine');

//   beforeEach(() => {
//     // Reset mocks
//     jest.clearAllMocks();

//     // Mock navigator.onLine
//     Object.defineProperty(navigator, 'onLine', {
//       configurable: true,
//       value: true,
//       writable: true
//     });

//     // Create instance
//     offlineTransactionManager = new OfflineTransactionManager();

//     // Mock window.setInterval
//     jest.spyOn(window, 'setInterval').mockImplementation(() => 123 as unknown as number);

//     // Mock window.clearInterval
//     jest.spyOn(window, 'clearInterval').mockImplementation(() => { });
//   });

//   afterEach(() => {
//     // Restore navigator.onLine
//     if (originalNavigatorOnLine) {
//       Object.defineProperty(navigator, 'onLine', originalNavigatorOnLine);
//     }

//     // Clean up
//     offlineTransactionManager.dispose();
//   });

//   describe('createTransaction', () => {
//     it('should create a valid transaction', async () => {
//       // Arrange
//       const transaction = {
//         amount: 100,
//         currency: 'USD' as const,
//         type: TransactionType.DEPOSIT,
//         description: 'Test deposit',
//         toAccount: '123456'
//       };

//       const expectedTransaction = expect.objectContaining({
//         ...transaction,
//         id: expect.any(String),
//         status: TransactionStatus.PENDING,
//         createdAt: expect.any(String),
//         updatedAt: expect.any(String)
//       });

//       (localStorageService.add as jest.Mock).mockResolvedValue(undefined);

//       // Act
//       const result = await offlineTransactionManager.createTransaction(transaction);

//       // Assert
//       expect(result).toEqual(expectedTransaction);
//       expect(localStorageService.add).toHaveBeenCalledWith(
//         EntityType.TRANSACTION,
//         expectedTransaction
//       );
//     });

//     it('should reject invalid transactions', async () => {
//       // Arrange
//       const transaction = {
//         amount: -100, // Invalid amount
//         currency: 'USD' as const,
//         type: TransactionType.DEPOSIT,
//         description: 'Test deposit'
//         // Missing toAccount for deposit
//       };

//       // Act & Assert
//       await expect(offlineTransactionManager.createTransaction(transaction))
//         .rejects.toThrow();

//       expect(localStorageService.add).not.toHaveBeenCalled();
//       expect(errorService.handleError).toHaveBeenCalled();
//     });
//   });

//   describe('getTransactions', () => {
//     it('should return filtered transactions', async () => {
//       // Arrange
//       const transactions: Transaction[] = [
//         {
//           id: '1',
//           amount: 100,
//           currency: 'USD',
//           type: TransactionType.DEPOSIT,
//           status: TransactionStatus.COMPLETED,
//           description: 'Completed deposit',
//           toAccount: '123456',
//           createdAt: '2023-01-01T00:00:00.000Z',
//           updatedAt: '2023-01-01T00:00:00.000Z'
//         },
//         {
//           id: '2',
//           amount: 200,
//           currency: 'EUR',
//           type: TransactionType.WITHDRAWAL,
//           status: TransactionStatus.PENDING,
//           description: 'Pending withdrawal',
//           fromAccount: '123456',
//           createdAt: '2023-01-02T00:00:00.000Z',
//           updatedAt: '2023-01-02T00:00:00.000Z'
//         }
//       ];

//       (localStorageService.getAll as jest.Mock).mockResolvedValue(transactions);

//       // Act
//       const result = await offlineTransactionManager.getTransactions({
//         type: TransactionType.DEPOSIT
//       });

//       // Assert
//       expect(result).toHaveLength(1);
//       expect(result[0].id).toBe('1');
//     });
//   });

//   describe('getTransactionStats', () => {
//     it('should calculate transaction statistics correctly', async () => {
//       // Arrange
//       const transactions: Transaction[] = [
//         {
//           id: '1',
//           amount: 100,
//           currency: 'USD',
//           type: TransactionType.DEPOSIT,
//           status: TransactionStatus.COMPLETED,
//           description: 'Completed deposit',
//           toAccount: '123456',
//           createdAt: '2023-01-01T00:00:00.000Z',
//           updatedAt: '2023-01-01T00:00:00.000Z'
//         },
//         {
//           id: '2',
//           amount: 200,
//           currency: 'EUR',
//           type: TransactionType.WITHDRAWAL,
//           status: TransactionStatus.PENDING,
//           description: 'Pending withdrawal',
//           fromAccount: '123456',
//           createdAt: '2023-01-02T00:00:00.000Z',
//           updatedAt: '2023-01-02T00:00:00.000Z'
//         }
//       ];

//       // Mock getTransactions to return our test data
//       jest.spyOn(offlineTransactionManager, 'getTransactions').mockResolvedValue(transactions);

//       // Act
//       const stats = await offlineTransactionManager.getTransactionStats();

//       // Assert
//       expect(stats.totalCount).toBe(2);
//       expect(stats.totalAmount.USD).toBe(100);
//       expect(stats.totalAmount.EUR).toBe(200);
//       expect(stats.byType[TransactionType.DEPOSIT]).toBe(1);
//       expect(stats.byType[TransactionType.WITHDRAWAL]).toBe(1);
//       expect(stats.byStatus[TransactionStatus.COMPLETED]).toBe(1);
//       expect(stats.byStatus[TransactionStatus.PENDING]).toBe(1);
//     });
//   });

//   describe('getExchangeRate', () => {
//     it('should return exchange rate from storage if available', async () => {
//       // Arrange
//       const exchangeRate = {
//         id: 'USD-EUR',
//         fromCurrency: 'USD',
//         toCurrency: 'EUR',
//         rate: 0.85,
//         lastUpdated: new Date(),
//         source: 'api'
//       };

//       (localStorageService.get as jest.Mock).mockResolvedValue(exchangeRate);

//       // Act
//       const rate = await offlineTransactionManager.getExchangeRate('USD', 'EUR');

//       // Assert
//       expect(rate).toBe(0.85);
//       expect(localStorageService.get).toHaveBeenCalledWith(
//         EntityType.EXCHANGE_RATE,
//         'USD-EUR'
//       );
//     });

//     it('should return 1 for same currency', async () => {
//       // Act
//       const rate = await offlineTransactionManager.getExchangeRate('USD', 'USD');

//       // Assert
//       expect(rate).toBe(1);
//       expect(localStorageService.get).not.toHaveBeenCalled();
//     });
//   });

//   describe('syncTransactions', () => {
//     it('should process sync queue items', async () => {
//       // Arrange
//       const syncItems = [
//         {
//           id: '1',
//           operationType: 'create',
//           entityType: EntityType.TRANSACTION,
//           entityId: 'tx1',
//           data: {
//             id: 'tx1',
//             amount: 100,
//             currency: 'USD',
//             type: TransactionType.DEPOSIT,
//             status: TransactionStatus.PENDING,
//             description: 'Test',
//             toAccount: '123',
//             createdAt: '2023-01-01T00:00:00.000Z',
//             updatedAt: '2023-01-01T00:00:00.000Z'
//           },
//           createdAt: '2023-01-01T00:00:00.000Z',
//           attempts: 0
//         }
//       ];

//       (localStorageService.getAll as jest.Mock).mockResolvedValue(syncItems);
//       (localStorageService.update as jest.Mock).mockResolvedValue(undefined);
//       (localStorageService.delete as jest.Mock).mockResolvedValue(undefined);

//       // Act
//       await offlineTransactionManager.syncTransactions();

//       // Assert
//       expect(localStorageService.update).toHaveBeenCalledWith(
//         EntityType.TRANSACTION,
//         'tx1',
//         expect.objectContaining({
//           status: TransactionStatus.COMPLETED,
//           syncedAt: expect.any(String)
//         })
//       );

//       expect(localStorageService.delete).toHaveBeenCalledWith(
//         'syncQueue',
//         '1'
//       );
//     });
//   });
// }); 