import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/admin/Dashboard';
import DebtManagement from '@/pages/admin/DebtManagement';
import InventoryAnalysis from '@/pages/admin/InventoryAnalysis';
import UserManagement from '@/pages/admin/UserManagement';
import Login from '@/pages/auth/Login';
import DailyReport from '@/pages/shop/DailyReport';
import ShopDashboard from '@/pages/shop/Dashboard';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { TransactionsPage } from '../pages/TransactionsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Outlet />
            </Layout>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="debts" element={<DebtManagement />} />
        <Route path="inventory" element={<InventoryAnalysis />} />
      </Route>

      {/* Protected shop routes */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute allowedRoles={['manager', 'user']}>
            <Layout>
              <Outlet />
            </Layout>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ShopDashboard />} />
        <Route path="daily-report" element={<DailyReport />} />
      </Route>

      {/* Transactions route */}
      <Route
        path="/transactions"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'user']}>
            <TransactionsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
