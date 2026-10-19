import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Business from './pages/config/Business';
import Menus from './pages/config/Menus';
import Roles from './pages/config/Roles';
import ProcessTypes from './pages/config/ProcessTypes';
import RefNumbers from './pages/config/RefNumbers';
import DashboardConfig from './pages/config/DashboardConfig';
import Workflows from './pages/config/Workflows';
import LoyaltyConfig from './pages/config/LoyaltyConfig';
import Users from './pages/users/Users';
import Payments from './pages/stock/Payments';
import Expenditure from './pages/stock/Expenditure';
import Salaries from './pages/stock/Salaries';
import Members from './pages/members/Members';
import ReceiptConfig from './pages/stock/ReceiptConfig';
import PublicReceipt from './pages/orders/PublicReceipt';
import CampaignsReport from './pages/reports/CampaignsReport';
import Parameters from './pages/config/Parameters';
import Transactions from './pages/transactions/Transactions';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/receipt/:receipt_no" element={<PublicReceipt />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/"                      element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard"             element={<Dashboard />} />
                    <Route path="/config/business"       element={<Business />} />
                    <Route path="/config/menus"          element={<Menus />} />
                    <Route path="/config/roles"          element={<Roles />} />
                    <Route path="/config/process-types"  element={<ProcessTypes />} />
                    <Route path="/config/ref-numbering"  element={<RefNumbers />} />
                    <Route path="/config/dashboard"      element={<DashboardConfig />} />
                    <Route path="/config/workflows"     element={<Workflows />} />
                    <Route path="/config/loyalty"       element={<LoyaltyConfig />} />
                    <Route path="/config/parameters"    element={<Parameters />} />
                    <Route path="/users"                 element={<Users />} />
                    <Route path="/stock/payments"        element={<Payments />} />
                    <Route path="/stock/expenditure"     element={<Expenditure />} />
                    <Route path="/stock/salaries"        element={<Salaries />} />
                    <Route path="/members"            element={<Members />} />
                    <Route path="/stock/receipt-config" element={<ReceiptConfig />} />
                    <Route path="/reports/campaigns"    element={<CampaignsReport />} />
                    <Route path="/transactions"         element={<Transactions />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
