import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [workerUser, setWorkerUser] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkerProfile = async (uid) => {
    try {
      // METHOD 1: Direct UID lookup
      const doc = await firestore().collection('workers').doc(uid).get();
      if (doc.exists) {
        const data = { id: doc.id, uid, ...doc.data() };
        setWorkerProfile(data);
        console.log('[Auth] Profile found by UID:', data.fullName);
        return;
      }

      // METHOD 2: Search by phone number
      const phone = auth().currentUser?.phoneNumber;
      if (phone) {
        // Normalize phone: remove all non-digits and take last 10
        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
        console.log('[Auth] Attempting phone lookup for:', normalizedPhone);
        
        let snap = await firestore()
          .collection('workers')
          .where('phone', '==', normalizedPhone)
          .limit(1)
          .get();
        
        if (snap.empty) {
          // Try with full string just in case
          snap = await firestore()
            .collection('workers')
            .where('phone', '==', phone)
            .limit(1)
            .get();
        }

        if (!snap.empty) {
          const d = snap.docs[0];
          const data = { id: d.id, uid, ...d.data() };
          setWorkerProfile(data);
          console.log('[Auth] Profile found by phone:', data.fullName || data.name);
          
          // Fix: update Firestore document to use correct UID as ID
          try {
            await firestore().collection('workers').doc(uid).set(d.data(), { merge: true });
          } catch (e) {}
          return;
        }
      }

      // METHOD 3: Search by firebaseUid field
      const snap2 = await firestore()
        .collection('workers')
        .where('firebaseUid', '==', uid)
        .limit(1)
        .get();
      
      if (!snap2.empty) {
        const d = snap2.docs[0];
        const data = { id: d.id, uid, ...d.data() };
        setWorkerProfile(data);
        console.log('[Auth] Profile found by firebaseUid:', data.fullName || data.name);
        return;
      }

      console.log('[Auth] No worker profile found for uid:', uid);
    } catch (e) {
      console.error('[Auth] fetchWorkerProfile error:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        setWorkerUser(user);
        await fetchWorkerProfile(user.uid);
      } else {
        setWorkerUser(null);
        setWorkerProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (userData, profileData = null) => {
    setWorkerUser(userData);
    if (profileData) {
      setWorkerProfile({ ...profileData, uid: userData.uid });
    } else {
      await fetchWorkerProfile(userData.uid);
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
      setWorkerUser(null);
      setWorkerProfile(null);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const refreshProfile = async () => {
    if (!auth().currentUser?.uid) return;
    const doc = await firestore()
      .collection('workers')
      .doc(auth().currentUser.uid)
      .get();
    if (doc.exists) {
      setWorkerProfile({ id: doc.id, uid: auth().currentUser.uid, ...doc.data() });
    }
  };

  return (
    <AuthContext.Provider value={{
      user: workerUser,
      workerUser,
      workerData: workerProfile,
      workerProfile,
      loading,
      login,
      logout,
      signOut: logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
