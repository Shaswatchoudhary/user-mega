import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in - fetch their data from Firestore
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .get();
          
          if (userDoc.exists) {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() });
          } else {
            // Create user document if first time
            const userData = {
              uid: firebaseUser.uid,
              phoneNumber: firebaseUser.phoneNumber,
              createdAt: firestore.FieldValue.serverTimestamp(),
              name: '',
              profilePhoto: null,
            };
            await firestore()
              .collection('users')
              .doc(firebaseUser.uid)
              .set(userData);
            setUser(userData);
          }
        } catch (error) {
          setUser({ uid: firebaseUser.uid, 
                    phoneNumber: firebaseUser.phoneNumber });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
