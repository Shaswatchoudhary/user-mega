import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle user state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        try {
          const workerDoc = await firestore().collection('workers').doc(fbUser.uid).get();
          if (workerDoc.exists) {
            setWorkerData({ id: fbUser.uid, ...workerDoc.data() });
          }
        } catch (error) {
          console.error("Error fetching worker data:", error);
        }
      } else {
        setUser(null);
        setWorkerData(null);
      }
      setLoading(false);
    });
    return subscriber; 
  }, []);

  const login = async (userData, profileData = null) => {
    setUser(userData);
    if (profileData) {
      setWorkerData(profileData);
    }
  };

  const logout = async () => {
    await auth().signOut();
    setUser(null);
    setWorkerData(null);
  };

  return (
    <AuthContext.Provider value={{ user, workerData, loading, login, logout, setWorkerData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
