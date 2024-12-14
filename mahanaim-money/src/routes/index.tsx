import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import ShopDashboard from '../pages/shop/Dashboard';
import DailyReport from '../pages/shop/DailyReport';
import ShopManagement from '../pages/admin/ShopManagement';
import UserManagement from '../pages/admin/UserManagement';
import Layout from '../components/Layout';

const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole?: 'admin' | 'agent';
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/shops"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <ShopManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Shop Routes */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute requiredRole="agent">
            <Layout>
              <ShopDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shop/report"
        element={
          <ProtectedRoute requiredRole="agent">
            <Layout>
              <DailyReport />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
