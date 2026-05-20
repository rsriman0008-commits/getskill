import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ProvideServicePage from './pages/ProvideServicePage';
import SearchPage from './pages/SearchPage';

// Protected Route Component
const ProtectedRoute = ({ children, isOnboarded = false }) => {
  const { isAuthenticated, loading, isOnboarded: userOnboarded } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isOnboarded && !userOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, loading, isOnboarded } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Authenticated access - protect routes
  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Main Application Routes (Require Authentication and Onboarding) */}
      <Route path="/" element={
        <ProtectedRoute isOnboarded={true}>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute isOnboarded={true}>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/profile/edit" element={
        <ProtectedRoute isOnboarded={true}>
          <ProfilePage isEditMode={true} />
        </ProtectedRoute>
      } />
      <Route path="/profile/:id" element={
        <ProtectedRoute isOnboarded={true}>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/provide-service" element={
        <ProtectedRoute isOnboarded={true}>
          <ProvideServicePage />
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute isOnboarded={true}>
          <SearchPage />
        </ProtectedRoute>
      } />
      <Route path="/onboarding" element={
        <ProtectedRoute isOnboarded={false}>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function AppWithProvider() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}
