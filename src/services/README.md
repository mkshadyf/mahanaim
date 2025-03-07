# Services

This directory contains service classes that implement business logic and data access for the Mahanaim Money application.

## Service Architecture

The application follows a dependency injection pattern using React Context for service management. Services are instantiated in the `ServiceProvider` and made available throughout the application.

### Key Benefits

- **Testability**: Services can be easily mocked for unit testing
- **Separation of Concerns**: Business logic is separated from UI components
- **Reusability**: Services can be reused across different components
- **Maintainability**: Changes to data access or business logic can be made in one place

## Available Services

### TransactionService

Handles all transaction-related operations.

**Responsibilities:**
- Creating and managing transactions
- Calculating transaction fees
- Retrieving transaction statistics
- Validating transaction data

**Usage:**
```tsx
// Using the service through the useServices hook
import { useServices } from '@/contexts/ServiceContext';

function TransactionComponent() {
  const { transactionService } = useServices();
  
  const handleCreateTransaction = async (data) => {
    try {
      await transactionService.createTransaction(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    // Component JSX
  );
}
```

### ExchangeRateService

Manages currency exchange rates and conversions.

**Responsibilities:**
- Fetching current exchange rates
- Converting between currencies
- Caching exchange rate data

**Usage:**
```tsx
// Using the service through the useServices hook
import { useServices } from '@/contexts/ServiceContext';

function CurrencyConverter() {
  const { exchangeRateService } = useServices();
  const [amount, setAmount] = useState(0);
  const [convertedAmount, setConvertedAmount] = useState(0);
  
  const handleConvert = async () => {
    const result = await exchangeRateService.convert(amount, 'USD', 'EUR');
    setConvertedAmount(result);
  };
  
  return (
    // Component JSX
  );
}
```

## Service Provider

The `ServiceProvider` component in `src/contexts/ServiceContext.tsx` initializes all services and makes them available through React Context.

**Example:**
```tsx
// In App.tsx
import { ServiceProvider } from '@/contexts/ServiceContext';

function App() {
  return (
    <ServiceProvider>
      {/* Other providers and app content */}
    </ServiceProvider>
  );
}
```

## Creating New Services

To create a new service:

1. Define the service interface
2. Implement the service class
3. Add the service to the `Services` interface in `ServiceContext.tsx`
4. Initialize the service in the `ServiceProvider` component

**Example:**
```tsx
// 1. Define interface
export interface UserService {
  getUserProfile(userId: string): Promise<UserProfile>;
  updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void>;
}

// 2. Implement service
export class UserServiceImpl implements UserService {
  constructor(private firestore: Firestore) {}
  
  async getUserProfile(userId: string): Promise<UserProfile> {
    // Implementation
  }
  
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    // Implementation
  }
}

// 3. Add to Services interface in ServiceContext.tsx
export interface Services {
  transactionService: TransactionService;
  exchangeRateService: ExchangeRateService;
  userService: UserService; // New service
}

// 4. Initialize in ServiceProvider
const userService = new UserServiceImpl(firestore);

const services: Services = {
  transactionService,
  exchangeRateService,
  userService, // New service
};
```

## Best Practices

- Keep services focused on a specific domain or functionality
- Use interfaces to define service contracts
- Handle errors within services when appropriate
- Use dependency injection for service dependencies
- Write unit tests for service methods 