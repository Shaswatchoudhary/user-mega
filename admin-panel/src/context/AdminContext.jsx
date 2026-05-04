import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true';

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/profile');
      if (response.data.data) {
        setProfile(response.data.data);
        localStorage.setItem('admin_profile', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching global profile:', error);
      const savedProfile = localStorage.getItem('admin_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated]);

  const refreshProfile = () => fetchProfile();

  const logout = () => {
    setProfile(null);
    localStorage.removeItem('admin_profile');
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AdminContext.Provider value={{ profile, setProfile, loading, refreshProfile, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
