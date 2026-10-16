import { collection, addDoc, doc, updateDoc, getDocs, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { uploadImageToStorage } from './storageUtils';
import { IncidentRecord, IncidentStatus } from '../types/incident';

export interface IncidentSubmissionData {
  type: string;
  description: string;
  photoUri: string | null;
  latitude: number;
  longitude: number;
}

export interface PublicIncidentSubmissionData {
  type: string;
  description: string;
  photoUri: string | null;
  latitude: number;
  longitude: number;
  villagerName?: string;
  villagerContact?: string;
}

export class IncidentService {
  /**
   * Submits an incident report from the public / villagers without requiring login.
   */
  static async submitPublicIncident(data: PublicIncidentSubmissionData): Promise<string> {
    try {
      let photoUrl = null;

      if (data.photoUri) {
        try {
          const fileName = `incidents/public_${Date.now()}.jpg`;
          photoUrl = await uploadImageToStorage(data.photoUri, fileName);
        } catch (uploadErr: any) {
          console.warn("Firebase Storage unavailable for public report, proceeding with local photo URI:", uploadErr.message);
          photoUrl = data.photoUri;
        }
      }

      const docData = {
        rangerId: null,
        reporterType: 'COMMUNITY',
        villagerName: data.villagerName?.trim() || 'Anonymous Villager',
        villagerContact: data.villagerContact?.trim() || null,
        incidentType: data.type,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        photoUrl: photoUrl,
        createdAt: serverTimestamp(),
        synchronizationStatus: 'SYNCED',
        status: 'SUBMITTED',
      };

      const docRef = await addDoc(collection(db, 'incidents'), docData);
      return docRef.id;
    } catch (error: any) {
      console.error("Public Incident Submission Error:", error);
      if (error.code === 'permission-denied') {
        throw new Error("Firestore failure: Permission denied to submit incident report.");
      }
      if (error.message?.includes('failure')) {
        throw error;
      }
      throw new Error(error.message || "Network failure or unexpected error occurred.");
    }
  }

  /**
   * Submits a complete incident report.
   * Handles photo upload to Storage and document creation in Firestore.
   */
  static async submitIncident(data: IncidentSubmissionData): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Authentication failure: You must be logged in to submit an incident.");
    }

    try {
      let photoUrl = null;

      // 1. Upload photo if present
      if (data.photoUri) {
        try {
          const fileName = `incidents/${user.uid}_${Date.now()}.jpg`;
          photoUrl = await uploadImageToStorage(data.photoUri, fileName);
        } catch (uploadErr: any) {
          console.warn("Firebase Storage unavailable, proceeding with local photo URI:", uploadErr.message);
          photoUrl = data.photoUri; // Fallback to local photo URI
        }
      }

      // 2. Create Firestore Document
      const docData = {
        rangerId: user.uid,
        reporterType: 'RANGER',
        incidentType: data.type,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        photoUrl: photoUrl,
        createdAt: serverTimestamp(),
        synchronizationStatus: 'SYNCED', // Assuming online since it's directly submitting
        status: 'SUBMITTED',
      };

      const docRef = await addDoc(collection(db, 'incidents'), docData);
      
      return docRef.id;

    } catch (error: any) {
      console.error("Submission Error:", error);
      // Map specific Firestore errors
      if (error.code === 'permission-denied') {
        throw new Error("Firestore failure: You don't have permission to write incident records.");
      }
      
      // If we already threw a friendly error, just re-throw it
      if (error.message.includes('failure')) {
        throw error;
      }
      
      throw new Error(error.message || "Network failure or unexpected error occurred.");
    }
  }

  /**
   * Fetches recent incident reports submitted by a specific ranger.
   */
  static async getIncidentsByRanger(rangerId: string): Promise<IncidentRecord[]> {
    try {
      // 1. Try index-based query
      const q = query(
        collection(db, 'incidents'),
        where('rangerId', '==', rangerId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as IncidentRecord[];
    } catch (error: any) {
      console.warn("Index query for ranger incidents failed, trying unindexed query:", error?.message);
      try {
        const fallbackQuery = query(
          collection(db, 'incidents'),
          where('rangerId', '==', rangerId)
        );
        const snapshot = await getDocs(fallbackQuery);
        const list = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as IncidentRecord[];
        
        return list.sort((a, b) => {
          const tA = a.createdAt?.seconds || (typeof a.createdAt === 'number' ? a.createdAt / 1000 : 0);
          const tB = b.createdAt?.seconds || (typeof b.createdAt === 'number' ? b.createdAt / 1000 : 0);
          return tB - tA;
        });
      } catch (fallbackErr: any) {
        console.error("Fallback Ranger Incidents Query Error:", fallbackErr);
        // If query with where clause fails due to rules or index, fetch collection
        try {
          const allSnap = await getDocs(collection(db, 'incidents'));
          const myDocs = allSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as IncidentRecord))
            .filter(d => d.rangerId === rangerId);
          return myDocs.sort((a, b) => {
            const tA = a.createdAt?.seconds || 0;
            const tB = b.createdAt?.seconds || 0;
            return tB - tA;
          });
        } catch (allErr) {
          console.error("All Docs Query Error:", allErr);
          return [];
        }
      }
    }
  }

  /**
   * Fetches all submitted incident reports for manager review.
   */
  static async getIncidents(): Promise<IncidentRecord[]> {
    try {
      const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as IncidentRecord[];
    } catch (error: any) {
      console.error("Fetch Incidents Error:", error);
      throw new Error(error.message || "Failed to retrieve incident reports.");
    }
  }

  /**
   * Updates an incident's status and records manager action notes.
   */
  static async updateIncidentStatus(
    incidentId: string, 
    status: IncidentStatus, 
    actionTakenNotes?: string
  ): Promise<void> {
    if (!incidentId) {
      throw new Error("Invalid incident ID provided.");
    }

    try {
      const incidentDocRef = doc(db, 'incidents', incidentId);
      const updateData: Record<string, any> = {
        status,
        actionTakenAt: serverTimestamp(),
      };

      if (actionTakenNotes !== undefined) {
        updateData.actionTakenNotes = actionTakenNotes;
      }

      await updateDoc(incidentDocRef, updateData);
    } catch (error: any) {
      console.error("Update Incident Status Error:", error);
      throw new Error(error.message || "Failed to update incident status.");
    }
  }
}

