import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle user state changes
  async function onAuthStateChanged(fbUser) {
    if (fbUser) {
      setUser(fbUser);
      // Try to load persisted worker data if available
      const storedWorker = await AsyncStorage.getItem('workerData');
      if (storedWorker) {
          setWorkerData(JSON.parse(storedWorker));
      }
    } else {
      setUser(null);
      setWorkerData(null);
      await AsyncStorage.removeItem('workerData');
    }
    
    if (loading) setLoading(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; 
  }, []);

  const login = async (userData, profileData = null) => {
    setUser(userData);
    if (profileData) {
      setWorkerData(profileData);
      await AsyncStorage.setItem('workerData', JSON.stringify(profileData));
    }
  };

  const logout = async () => {
    await auth().signOut();
    setUser(null);
    setWorkerData(null);
    await AsyncStorage.removeItem('workerData');
  };

  return (
    <AuthContext.Provider value={{ user, workerData, loading, login, logout, setWorkerData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
