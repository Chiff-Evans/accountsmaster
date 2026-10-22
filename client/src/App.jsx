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
import Users from './pages/users/Users';
import Expenditure from './pages/stock/Expenditure';
import Members from './pages/members/Members';
import MemberStatistics from './pages/members/MemberStatistics';
import FinancialReport from './pages/reports/FinancialReport';
import Parameters from './pages/config/Parameters';
import Targets from './pages/config/Targets';
import ContributionRates from './pages/config/ContributionRates';
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
                    <Route path="/config/parameters"    element={<Parameters />} />
                    <Route path="/config/targets"       element={<Targets />} />
                    <Route path="/config/contribution-rates" element={<ContributionRates />} />
                    <Route path="/users"                 element={<Users />} />
                    <Route path="/stock/expenditure"     element={<Expenditure />} />
                    <Route path="/members"            element={<Members />} />
                    <Route path="/members/statistics" element={<MemberStatistics />} />
                    <Route path="/reports/finance"      element={<FinancialReport />} />
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
