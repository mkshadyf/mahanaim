export * from './pdfGenerator';
export * from './smsNotification';

// Common currency formatter
export const formatCurrency = (amount: number, currency: 'USD' | 'FC'): string => {
  return currency === 'USD'
    ? `$${amount.toLocaleString()}`
    : `FC ${amount.toLocaleString()}`;
};

// Common date formatter
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

// Common status color mapper
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'yellow',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
  };
  return colors[status] || 'gray';
}; 