# Mahanaim Money Mobile App

A robust mobile web application for managing financial transactions with offline capabilities.

## Features

- **Offline Transaction Management**: Create, update, and delete transactions even when offline
- **Automatic Synchronization**: Transactions are automatically synced when connectivity is restored
- **Exchange Rate Management**: Built-in exchange rate support for multiple currencies
- **Transaction Statistics**: Comprehensive statistics for transaction analysis
- **Optimized for Mobile**: Responsive design with virtualized lists for performance
- **Error Handling**: Robust error handling and recovery mechanisms

## Architecture

The application follows a service-oriented architecture with the following key components:

### Core Services

- **OfflineTransactionManager**: Central service for managing transactions with offline support
- **LocalStorageService**: Service for persistent storage of data
- **ErrorService**: Centralized error handling and reporting

### UI Components

- **TransactionList**: Virtualized list for displaying transactions
- **TransactionForm**: Form for creating and editing transactions
- **PullToRefresh**: Component for refreshing data
- **NetworkStatus**: Indicator for network connectivity status

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mahanaim-money-app.git

# Navigate to the project directory
cd mahanaim-money-app

# Install dependencies
npm install
```

### Running the Application

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Usage Examples

### Creating a Transaction

```typescript
import { offlineTransactionManager } from './services/OfflineTransactionManager';
import { TransactionType } from './types';

// Create a new transaction
const newTransaction = await offlineTransactionManager.createTransaction({
  amount: 100,
  currency: 'USD',
  type: TransactionType.DEPOSIT,
  description: 'Salary deposit',
  toAccount: '123456789'
});

console.log('Transaction created:', newTransaction);
```

### Getting Transactions with Filtering

```typescript
import { offlineTransactionManager } from './services/OfflineTransactionManager';
import { TransactionType, TransactionStatus } from './types';

// Get all completed deposits
const transactions = await offlineTransactionManager.getTransactions({
  type: TransactionType.DEPOSIT,
  status: TransactionStatus.COMPLETED,
  fromDate: '2023-01-01T00:00:00.000Z',
  toDate: '2023-12-31T23:59:59.999Z'
});

console.log('Transactions:', transactions);
```

### Using the Virtualized Transaction List Hook

```typescript
import { useVirtualizedTransactionList } from './hooks/useVirtualizedTransactionList';
import { TransactionType } from './types';

const MyTransactionList = () => {
  const {
    transactions,
    isLoading,
    error,
    loadMore,
    refresh,
    pendingSyncCount
  } = useVirtualizedTransactionList({
    limit: 20,
    type: TransactionType.DEPOSIT
  });

  return (
    <div>
      {pendingSyncCount > 0 && (
        <div className="sync-indicator">
          {pendingSyncCount} transactions pending sync
        </div>
      )}
      
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <ul>
          {transactions.map(transaction => (
            <li key={transaction.id}>
              {transaction.description}: {transaction.amount} {transaction.currency}
            </li>
          ))}
        </ul>
      )}
      
      <button onClick={loadMore}>Load More</button>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
};
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
