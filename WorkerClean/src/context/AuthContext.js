import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [workerUser, setWorkerUser] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const listenerRef = useRef(null);

  const fetchAndListenProfile = (uid) => {
    if (listenerRef.current) {
      listenerRef.current();
      listenerRef.current = null;
    }

    // Try direct UID first
    const unsubscribe = firestore()
      .collection('workers')
      .doc(uid)
      .onSnapshot(async (doc) => {
        if (doc.exists) {
          const docData = doc.data();
          
          // CHECK IF PROFILE IS INCOMPLETE (Missing serviceType/category or stats)
          // If it's incomplete, we might need to search for the original "rich" profile
          const isIncomplete = !docData.category && !docData.serviceType;
          
          if (isIncomplete) {
            console.log('⚠️ Found UID doc but it is incomplete. Searching for rich profile fallback...');
            await findAndMergeRichProfile(uid, docData);
          } else {
            // Profile is complete, load it
            const data = { uid, id: docData.id || doc.id, ...docData };
            setWorkerProfile(data);
            console.log('✅ Profile loaded from UID path:', data.fullName || data.name);
            setLoading(false);
          }
        } else {
          console.warn('⚠️ No doc at workers/', uid, '— trying fallbacks');
          await findAndMergeRichProfile(uid, null);
        }
      }, (error) => {
        console.error('Profile listener error:', error);
        setLoading(false);
      });

    listenerRef.current = unsubscribe;
  };

  // Improved Fallback & Merger
  const findAndMergeRichProfile = async (uid, existingData) => {
    try {
      const phone = auth().currentUser?.phoneNumber;
      if (!phone) {
        if (existingData) {
          setWorkerProfile({ uid, id: uid, ...existingData });
        }
        setLoading(false);
        return;
      }

      const cleanPhone = phone.replace('+91', '').trim();
      console.log('[Auth] Fallback search for phone:', cleanPhone);

      // Search for any doc with this phone that HAS a category/serviceType
      let snap = await firestore()
        .collection('workers')
        .where('phone', '==', cleanPhone)
        .get();

      if (snap.empty) {
        snap = await firestore()
          .collection('workers')
          .where('phone', '==', '+91' + cleanPhone)
          .get();
      }

      // Find the document that actually has the data (the "Rich" profile)
      const richDoc = snap.docs.find(d => d.id !== uid && (d.data().category || d.data().serviceType));

      if (richDoc) {
        const richData = richDoc.data();
        console.log('✅ Found rich profile at:', richDoc.id, 'Merging...');

        // MERGE: UID Doc = Rich Data + UID + Original ID
        const mergedData = { 
          ...richData, 
          uid, 
          firebaseUid: uid, 
          id: richDoc.id // Keep original ObjectID for bookings/stats
        };

        await firestore()
          .collection('workers')
          .doc(uid)
          .set(mergedData, { merge: true });

        setWorkerProfile(mergedData);
        console.log('✅ Profile successfully migrated/merged to UID path');
      } else if (existingData) {
        // No rich profile found, just use the existing one
        setWorkerProfile({ uid, id: uid, ...existingData });
      } else {
        console.warn('❌ No profile found anywhere for this user');
        setWorkerProfile(null);
      }
      setLoading(false);
    } catch (e) {
      console.error('findAndMergeRichProfile error:', e);
      if (existingData) setWorkerProfile({ uid, id: uid, ...existingData });
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(
      async (firebaseUser) => {
        if (firebaseUser) {
          console.log('Auth: User logged in', firebaseUser.uid);
          setWorkerUser(firebaseUser);
          fetchAndListenProfile(firebaseUser.uid);
        } else {
          console.log('Auth: No user logged in');
          setWorkerUser(null);
          setWorkerProfile(null);
          if (listenerRef.current) {
            listenerRef.current();
            listenerRef.current = null;
          }
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribeAuth();
      if (listenerRef.current) {
        listenerRef.current();
      }
    };
  }, []);

  const login = async (userData, profileData = null) => {
    setWorkerUser(userData);
    if (profileData) {
      setWorkerProfile({ ...profileData, uid: userData.uid });
    }
    if (userData?.uid) {
      fetchAndListenProfile(userData.uid);
    }
  };

  const refreshProfile = async () => {
    if (workerUser?.uid) {
      fetchAndListenProfile(workerUser.uid);
    }
  };

  const signOut = async () => {
    if (listenerRef.current) {
      listenerRef.current();
      listenerRef.current = null;
    }
    setWorkerProfile(null);
    setWorkerUser(null);
    await auth().signOut();
  };

  return (
    <AuthContext.Provider value={{
      user: workerUser,
      workerUser,
      workerData: workerProfile,
      workerProfile,
      loading,
      login,
      refreshProfile,
      signOut,
      logout: signOut,
      isLoggedIn: !!workerUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
