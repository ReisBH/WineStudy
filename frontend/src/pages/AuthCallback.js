import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (sessionIdMatch) {
          const sessionId = sessionIdMatch[1];
          const user = await processGoogleSession(sessionId);
          
          // Clear the hash and navigate to dashboard with user data
          window.history.replaceState(null, '', '/dashboard');
          navigate('/dashboard', { state: { user }, replace: true });
        } else {
          // No session_id found, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    processSession();
  }, [location.hash, navigate, processGoogleSession]);

  // Minimal loading UI - processes silently
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-wine-500 rounded-sm flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Wine className="w-8 h-8 text-white" />
        </div>
        <p className="text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
