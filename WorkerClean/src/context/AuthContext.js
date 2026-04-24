import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [workerUser, setWorkerUser] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 0. Load from cache first for instant UI
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem('workerProfile');
        if (cached) {
          console.log('[AuthContext] Loaded profile from AsyncStorage');
          setWorkerProfile(JSON.parse(cached));
        }
      } catch (e) {
        console.log('[AuthContext] Cache load error:', e);
      }
    };
    loadCache();
  }, []);

  const fetchWorkerProfile = async (uid, firebaseUser = null) => {
    try {
      const userObj = firebaseUser || auth().currentUser;
      if (!userObj) return null;

      console.log('[AuthContext] Attempting to fetch profile for UID:', uid);
      
      // 1. Try direct UID match
      let doc = await firestore().collection('workers').doc(uid).get();
      if (doc.exists) {
        const data = { uid, id: doc.id, ...doc.data() };
        console.log('[AuthContext] Profile found via UID doc:', doc.id);
        setWorkerProfile(data);
        await AsyncStorage.setItem('workerProfile', JSON.stringify(data));
        return data;
      } 

      // 2. Search by firebaseUid field (most reliable link)
      const linkQuery = await firestore()
        .collection('workers')
        .where('firebaseUid', '==', uid)
        .limit(1)
        .get();

      if (!linkQuery.empty) {
        const workerDoc = linkQuery.docs[0];
        const data = { uid, id: workerDoc.id, ...workerDoc.data() };
        console.log('[AuthContext] Profile found via firebaseUid link:', workerDoc.id);
        setWorkerProfile(data);
        await AsyncStorage.setItem('workerProfile', JSON.stringify(data));
        return data;
      }

      // 3. Fallback: Search by phone number (try both formats)
      const phoneNumber = userObj.phoneNumber;
      if (phoneNumber) {
        const formats = [
          phoneNumber.replace('+91', '').trim(), // e.g. 7654321890
          phoneNumber.trim()                     // e.g. +917654321890
        ];
        
        console.log('[AuthContext] Searching by phone formats:', formats);
        
        for (const phone of formats) {
          const phoneQuery = await firestore()
            .collection('workers')
            .where('phone', '==', phone)
            .limit(1)
            .get();
          
          if (!phoneQuery.empty) {
            const workerDoc = phoneQuery.docs[0];
            const data = { uid, id: workerDoc.id, ...workerDoc.data() };
            console.log('[AuthContext] Profile found via phone lookup:', phone, workerDoc.id);
            setWorkerProfile(data);
            await AsyncStorage.setItem('workerProfile', JSON.stringify(data));
            
            // Link this document to the Firebase UID for faster future direct access
            firestore().collection('workers').doc(workerDoc.id).update({
              firebaseUid: uid
            }).catch(e => console.log('Link update error:', e));
            
            return data;
          }
        }
      }

      console.log('[AuthContext] No worker profile found for user:', uid);
      return null;
    } catch (error) {
      console.error('[AuthContext] Error fetching worker profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      console.log('[AuthContext] Auth state changed:', user ? user.uid : 'logged out');
      if (user) {
        setWorkerUser(user);
        // CRITICAL: Wait for profile fetch BEFORE setting loading=false
        await fetchWorkerProfile(user.uid, user);
      } else {
        setWorkerUser(null);
        setWorkerProfile(null);
        await AsyncStorage.removeItem('workerProfile');
      }
      setLoading(false);
      setIsInitialized(true);
    });

    return unsubscribe;
  }, []);

  // Also listen to real-time profile changes
  useEffect(() => {
    if (!workerUser) return;

    // Use the resolved profile ID or fall back to UID
    const targetId = workerProfile?.id || workerUser.uid;
    console.log('[AuthContext] Starting snapshot listener for:', targetId);

    const unsubscribe = firestore()
      .collection('workers')
      .doc(targetId)
      .onSnapshot(doc => {
        if (doc.exists) {
          setWorkerProfile(prev => ({ 
            ...prev,
            uid: workerUser.uid, 
            id: doc.id, 
            ...doc.data() 
          }));
        }
      }, err => console.log('[AuthContext] Profile Snapshot Error:', err));

    return () => unsubscribe();
  }, [workerUser, workerProfile?.id]);

  const login = async (userData, profileData = null) => {
    setWorkerUser(userData);
    if (profileData) {
      setWorkerProfile({
        ...profileData,
        id: profileData.id || profileData._id,
        uid: userData.uid
      });
    } else {
      await fetchWorkerProfile(userData.uid);
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
    } catch (e) {
      console.error('[AuthContext] Logout error:', e);
    }
    setWorkerUser(null);
    setWorkerProfile(null);
  };

  const refreshProfile = async () => {
    if (workerUser) {
      await fetchWorkerProfile(workerUser.uid);
    }
  };

  return (
    <AuthContext.Provider value={{
      workerUser,
      user: workerUser, 
      workerProfile,
      workerData: workerProfile, 
      loading: loading || !isInitialized,
      isInitialized,
      login,
      logout,
      refreshProfile,
      isLoggedIn: !!workerUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
