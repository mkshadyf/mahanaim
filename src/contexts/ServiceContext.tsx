import React, { createContext, useContext } from 'react';
import { errorService } from '../services/ErrorService';
import { localStorageService } from '../services/LocalStorageService';
import { offlineTransactionManager } from '../services/OfflineTransactionManager';

// Define the service context type
interface ServiceContextType {
  localStorageService: typeof localStorageService;
  errorService: typeof errorService;
  offlineTransactionManager: typeof offlineTransactionManager;
}

// Create the context with default values
const ServiceContext = createContext<ServiceContextType>({
  localStorageService,
  errorService,
  offlineTransactionManager,
});

// Provider component
interface ServiceProviderProps {
  children: React.ReactNode;
}

export function ServiceProvider({ children }: ServiceProviderProps) {
  // In a real app, you might initialize services with configuration here
  
  const value: ServiceContextType = {
    localStorageService,
    errorService,
    offlineTransactionManager,
  };
  
  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

// Hook for using the service context
export function useServices() {
  const context = useContext(ServiceContext);
  
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  
  return context;
} 