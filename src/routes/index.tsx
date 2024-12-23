import { Navigate, Route, Routes } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/auth/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';
import DebtManagement from '@/pages/admin/DebtManagement';
import InventoryAnalysis from '@/pages/admin/InventoryAnalysis';
import ShopDashboard from '@/pages/shop/Dashboard';
import DailyReport from '@/pages/shop/DailyReport';

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

      {/* Fallback routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
