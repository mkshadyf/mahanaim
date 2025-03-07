# Contexts

This directory contains React Context providers that manage global state and provide services throughout the Mahanaim Money application.

## Available Contexts

### AuthContext

Manages authentication state and user information.

**Provides:**

- Current user data
- Authentication status (loading, error)
- Authentication methods (login, register, signOut)
- Role-based access control

**Usage:**

```tsx
import { useAuth } from '@/hooks/useAuth';

function AuthenticatedComponent() {
  const { user, loading, error } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Redirect to="/login" />;
  
  return (
    <div>
      <h1>Welcome, {user.displayName}</h1>
      {/* Component content */}
    </div>
  );
}
```

### ServiceContext

Implements dependency injection for services using React Context.

**Provides:**

- TransactionService
- ExchangeRateService
- Other application services

**Usage:**

```tsx
import { useServices } from '@/contexts/ServiceContext';

function TransactionComponent() {
  const { transactionService } = useServices();
  
  // Use the service
  const handleSubmit = async (data) => {
    await transactionService.createTransaction(data);
  };
  
  return (
    // Component JSX
  );
}
```

## Context Architecture

The application follows a hierarchical context structure:

```

<BrowserRouter>
  <ServiceProvider>
    <AuthProvider>
      <QueryClientProvider>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </ServiceProvider>
</BrowserRouter>
```

This structure ensures that:

1. Services are available to the authentication provider
2. Authentication state is available to all components
3. React Query is configured for data fetching with authentication

## Creating New Contexts

To create a new context:

1. Define the context interface
2. Create a context provider component
3. Implement a custom hook to access the context
4. Add the provider to the context hierarchy

**Example:**

```tsx
// 1. Define interface and create context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 2. Create provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Implement custom hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 4. Add to context hierarchy in App.tsx
function App() {
  return (
    <BrowserRouter>
      <ServiceProvider>
        <AuthProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              {/* App content */}
            </QueryClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </ServiceProvider>
    </BrowserRouter>
  );
}
```

## Best Practices

- Keep contexts focused on a specific domain or functionality
- Use custom hooks to access context values
- Implement proper error handling for missing providers
- Consider performance implications of context updates
- Use memoization to prevent unnecessary re-renders
