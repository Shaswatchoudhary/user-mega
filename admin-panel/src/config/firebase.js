import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCFP98jwXHRkMXLmm5mNo3vCuak4VVrdOQ",
  authDomain: "workeasemega.firebaseapp.com",
  projectId: "workeasemega",
  storageBucket: "workeasemega.firebasestorage.app",
  messagingSenderId: "52160897198",
  appId: "1:52160897198:android:d0a74f59bc6e5b60584d3f"
};

const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
