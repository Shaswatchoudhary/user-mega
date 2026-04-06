import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('[AuthContext] Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Handle Firebase user state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((fbUser) => {
      setFirebaseUser(fbUser);
      
      // If Firebase user is gone, clear MongoDB user as well (logout sync)
      if (!fbUser) {
        setUser(null);
        AsyncStorage.removeItem('user');
      }
      
      if (loading) setLoading(false);
    });
    return subscriber; // Unsubscribe on unmount
  }, [loading]);

  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await auth().signOut();
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('[AuthContext] Logout Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
