import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DangerZone {
  id?: string;
  points: LatLng[];
  createdAt: number;
}

const COLLECTION_NAME = 'danger_zones';

// Fetch all zones (one time)
export const fetchDangerZones = async (): Promise<DangerZone[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<DangerZone, 'id'>)
    }));
  } catch (error) {
    console.error('Error fetching danger zones:', error);
    return [];
  }
};

// Listen to zones in real time
export const subscribeToDangerZones = (callback: (zones: DangerZone[]) => void) => {
  return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
    const zones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<DangerZone, 'id'>)
    }));
    callback(zones);
  });
};

// Since we sync the whole map, we can just clear and replace for simplicity, 
// or implement a smart sync. Given typical usage (few zones), clear and replace is fine.
export const syncDangerZones = async (zones: LatLng[][]): Promise<void> => {
  try {
    // 1. Delete all existing zones
    const existing = await getDocs(collection(db, COLLECTION_NAME));
    const deletePromises = existing.docs.map(d => deleteDoc(doc(db, COLLECTION_NAME, d.id)));
    await Promise.all(deletePromises);

    // 2. Add new zones
    const addPromises = zones.map(points => {
      return addDoc(collection(db, COLLECTION_NAME), {
        points,
        createdAt: Date.now()
      });
    });
    await Promise.all(addPromises);
  } catch (error) {
    console.error('Error syncing danger zones:', error);
    throw error;
  }
};
