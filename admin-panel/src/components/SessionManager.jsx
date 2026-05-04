import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const SessionManager = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: centralLogout } = useAdmin();
  const timerRef = useRef(null);

  // Default to 30 minutes if not set
  const getTimeout = () => {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        return (settings.sessionTimeout || 30) * 60 * 1000; // Convert minutes to ms
      } catch (e) {
        return 30 * 60 * 1000;
      }
    }
    return 30 * 60 * 1000;
  };

  const logout = () => {
    console.log('[Session] Inactivity detected. Logging out...');
    centralLogout();
    navigate('/login', { replace: true });
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Only set timer if user is authenticated
    if (localStorage.getItem('admin_auth') === 'true' && location.pathname !== '/login') {
      timerRef.current = setTimeout(logout, getTimeout());
    }
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetTimer();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initial timer set
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [location.pathname]); // Re-run when route changes

  return children;
};

export default SessionManager;
