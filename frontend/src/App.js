import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import DashboardPage from './pages/DashboardPage';
import AtlasPage from './pages/AtlasPage';
import CountryDetailPage from './pages/CountryDetailPage';
import RegionDetailPage from './pages/RegionDetailPage';
import GrapesPage from './pages/GrapesPage';
import GrapeDetailPage from './pages/GrapeDetailPage';
import StudyPage from './pages/StudyPage';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import TastingListPage from './pages/TastingListPage';
import TastingFormPage from './pages/TastingFormPage';
import TastingDetailPage from './pages/TastingDetailPage';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wine-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// App Router Component
const AppRouter = () => {
  const location = useLocation();
  
  // Check URL fragment for session_id (Google OAuth callback)
  // This check must happen synchronously during render to prevent race conditions
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      
      {/* Atlas & Grapes - Public */}
      <Route path="/atlas" element={<Layout><AtlasPage /></Layout>} />
      <Route path="/atlas/:countryId" element={<Layout><CountryDetailPage /></Layout>} />
      <Route path="/atlas/region/:regionId" element={<Layout><RegionDetailPage /></Layout>} />
      <Route path="/grapes" element={<Layout><GrapesPage /></Layout>} />
      <Route path="/grapes/:grapeId" element={<Layout><GrapeDetailPage /></Layout>} />
      
      {/* Study - Public access to track list, lessons might be gated */}
      <Route path="/study" element={<Layout><StudyPage /></Layout>} />
      <Route path="/study/:trackId" element={<Layout><LessonPage /></Layout>} />
      <Route path="/study/:trackId/:lessonId" element={<Layout><LessonPage /></Layout>} />
      <Route path="/quiz" element={<Layout><QuizPage /></Layout>} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/tasting" element={
        <ProtectedRoute>
          <Layout><TastingListPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/tasting/new" element={
        <ProtectedRoute>
          <Layout><TastingFormPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/tasting/:tastingId" element={
        <ProtectedRoute>
          <Layout><TastingDetailPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRouter />
          <Toaster 
            position="top-right" 
            richColors 
            toastOptions={{
              className: 'font-sans',
            }}
          />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
