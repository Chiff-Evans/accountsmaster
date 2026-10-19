import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrandAmbassadorAuthProvider, useBrandAmbassadorAuth } from './contexts/BrandAmbassadorAuthContext';
import AppLayout from './components/layout/AppLayout';
import BrandAmbassadorLayout from './components/layout/BrandAmbassadorLayout';
import Login      from './pages/auth/Login';
import Register   from './pages/auth/Register';
import Solutions  from './pages/Solutions';
import Dashboard  from './pages/Dashboard';
import Profile     from './pages/Profile';
import ReceiptView from './pages/ReceiptView';
import Campaigns   from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import BrandAmbassadorRegister  from './pages/brand-ambassador/BrandAmbassadorRegister';
import BrandAmbassadorProfile   from './pages/brand-ambassador/BrandAmbassadorProfile';
import BrandAmbassadorCampaigns from './pages/brand-ambassador/BrandAmbassadorCampaigns';
import BrandAmbassadorCampaignDetail from './pages/brand-ambassador/BrandAmbassadorCampaignDetail';

function ProtectedRoute({ children }) {
  const { advertiser } = useAuth();
  return advertiser ? children : <Navigate to="/login" replace />;
}

function ProtectedBrandAmbassadorRoute({ children }) {
  const { brandAmbassador } = useBrandAmbassadorAuth();
  return brandAmbassador ? children : <Navigate to="/brand-ambassador/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <BrandAmbassadorAuthProvider>
          <Routes>
            <Route path="/solutions"               element={<Solutions />} />
            <Route path="/login"                   element={<Login />} />
            <Route path="/register"                element={<Register />} />
            <Route path="/brand-ambassador/login"        element={<Login />} />
            <Route path="/brand-ambassador/register"     element={<BrandAmbassadorRegister />} />
            <Route path="/receipt/:receipt_no"     element={<ReceiptView />} />

            <Route path="/brand-ambassador/campaigns" element={
              <ProtectedBrandAmbassadorRoute>
                <BrandAmbassadorLayout><BrandAmbassadorCampaigns /></BrandAmbassadorLayout>
              </ProtectedBrandAmbassadorRoute>
            } />

            <Route path="/brand-ambassador/campaigns/:id" element={
              <ProtectedBrandAmbassadorRoute>
                <BrandAmbassadorLayout><BrandAmbassadorCampaignDetail /></BrandAmbassadorLayout>
              </ProtectedBrandAmbassadorRoute>
            } />

            <Route path="/brand-ambassador/profile" element={
              <ProtectedBrandAmbassadorRoute>
                <BrandAmbassadorLayout><BrandAmbassadorProfile /></BrandAmbassadorLayout>
              </ProtectedBrandAmbassadorRoute>
            } />

            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/"             element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard"    element={<Dashboard />} />
                    <Route path="/campaigns"    element={<Campaigns />} />
                    <Route path="/campaigns/:id" element={<CampaignDetail />} />
                    <Route path="/profile"      element={<Profile />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrandAmbassadorAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
