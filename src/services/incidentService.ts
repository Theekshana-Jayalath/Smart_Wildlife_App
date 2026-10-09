import { collection, doc, setDoc, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface IncidentAlert {
  id: string;
  animalName: string;
  species: string;
  zoneName: string;
  time: string;
  timestamp: number;
  lat: number;
  lng: number;
}

export const logIncident = async (incident: Omit<IncidentAlert, 'id'>) => {
  const newRef = doc(collection(db, 'incidents'));
  await setDoc(newRef, incident);
};

export const subscribeToIncidents = (callback: (incidents: IncidentAlert[]) => void) => {
  const q = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IncidentAlert)));
  });
};
