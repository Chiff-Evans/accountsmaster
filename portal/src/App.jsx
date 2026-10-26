import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login        from './pages/auth/Login';
import Register     from './pages/auth/Register';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import FundStatement from './pages/FundStatement';
import NextOfKin    from './pages/NextOfKin';
import Profile      from './pages/Profile';

function ProtectedRoute({ children }) {
  const { member } = useAuth();
  return member ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/"             element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard"    element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/transactions/:id" element={<TransactionDetail />} />
                  <Route path="/fund/:kind"   element={<FundStatement />} />
                  <Route path="/next-of-kin"  element={<NextOfKin />} />
                  <Route path="/profile"      element={<Profile />} />
                  <Route path="*"             element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
