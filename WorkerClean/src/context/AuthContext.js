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
      const doc = await firestore().collection('workers').doc(uid).get();
      if (doc.exists) {
        setWorkerProfile({ id: doc.id, uid, ...doc.data() });
        return;
      }
      // Fallback: search by phone number
      const phone = auth().currentUser?.phoneNumber;
      if (phone) {
        const snap = await firestore()
          .collection('workers')
          .where('phone', '==', phone.replace('+91', ''))
          .limit(1)
          .get();
        if (!snap.empty) {
          const d = snap.docs[0];
          setWorkerProfile({ id: d.id, uid, ...d.data() });
        }
      }
    } catch (e) {
      console.error('fetchWorkerProfile error:', e);
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
      refreshProfile: () => workerUser?.uid && fetchWorkerProfile(workerUser.uid),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
