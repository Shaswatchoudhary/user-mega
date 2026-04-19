import { getFirestore, collection, query, where, getDocs, doc, getDoc } from '@react-native-firebase/firestore';
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

/**
 * Fetches real workers from the backend API.
 * Uses axios with a 15s timeout (configured in index.js).
 */
export const fetchWorkers = async (category = null) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workers`);
    let workers = response.data;

    // Filter by category if provided (Backend returns raw data)
    if (category) {
      workers = workers.filter(w => w.serviceType === category || w.category === category);
    }

    return { success: true, data: workers };
  } catch (error) {
    console.error('[WorkerService] Fetch workers failed:', error.message);
    return { success: false, error: 'Could not connect to service. Please try again.' };
  }
};

/**
 * Checks a worker's specific status/availability in real-time Firestore.
 * (Modular API)
 */
export const getWorkerRealtimeData = async (workerId) => {
  try {
    const db = getFirestore();
    const workerRef = doc(db, 'workers', workerId);
    const workerSnap = await getDoc(workerRef);
    
    if (workerSnap.exists()) {
      return { success: true, data: workerSnap.data() };
    }
    return { success: false, error: 'Worker not found' };
  } catch (error) {
    console.error('[WorkerService] Get worker data failed:', error.message);
    return { success: false, error: error.message };
  }
};
