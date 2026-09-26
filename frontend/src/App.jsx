import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TermsPage from './pages/TermsPage';
import DashboardPage from './pages/DashboardPage';
import PetProfilesPage from './pages/PetProfilesPage';
import PetDetailPage from './pages/PetDetailPage';
import CreatePetPage from './pages/CreatePetPage';
import EditPetPage from './pages/EditPetPage';
import PrintableTagPage from './pages/PrintableTagPage';
import PublicPetTagPage from './pages/PublicPetTagPage';
import VaccinationsPage from './pages/VaccinationsPage';
import VaccinePassportPage from './pages/VaccinePassportPage';
import TrackingRecordsPage from './pages/TrackingRecordsPage';
import RescueDirectoryPage from './pages/RescueDirectoryPage';
import ShopPage from './pages/ShopPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-gray-50/50 text-gray-800">
          <header className="print:hidden sticky top-0 z-40">
            <Navbar />
          </header>

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forget-pass" element={<ForgotPasswordPage />} />
              <Route path="/verify-reset-otp" element={<ResetPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/services/rescue" element={<RescueDirectoryPage />} />
              <Route path="/shop" element={<ShopPage />} />

              {/* Public QR Tag Scanning routes */}
              <Route path="/pet/tag/:id" element={<PublicPetTagPage />} />
              <Route path="/pet/scan/:id" element={<PublicPetTagPage />} />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pet-profiles"
                element={
                  <ProtectedRoute>
                    <PetProfilesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pet-profile/:petId"
                element={
                  <ProtectedRoute>
                    <PetDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-pet-profile"
                element={
                  <ProtectedRoute>
                    <CreatePetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pet-profile/edit/:petId"
                element={
                  <ProtectedRoute>
                    <EditPetPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pet-profile/:petId/print-tag"
                element={
                  <ProtectedRoute>
                    <PrintableTagPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vaccinations"
                element={
                  <ProtectedRoute>
                    <VaccinationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vaccinations/:petId"
                element={
                  <ProtectedRoute>
                    <VaccinationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vaccine-passport/:petId"
                element={
                  <ProtectedRoute>
                    <VaccinePassportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/records"
                element={
                  <ProtectedRoute>
                    <TrackingRecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/track/:petId"
                element={
                  <ProtectedRoute>
                    <TrackingRecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Route */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />

              {/* Catch-all 404 Route */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <footer className="print:hidden">
            <Footer />
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
