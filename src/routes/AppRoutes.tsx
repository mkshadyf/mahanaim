import { Navigate, Route, Routes } from 'react-router-dom';
import { ReportsPage } from '../pages/ReportsPage';
import { TransactionsPage } from '../pages/TransactionsPage';

/**
 * Main application routes
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/" element={<Navigate to="/transactions" replace />} />
    </Routes>
  );
} 