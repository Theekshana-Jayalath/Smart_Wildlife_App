import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { uploadImageToStorage } from './storageUtils';

export interface IncidentSubmissionData {
  type: string;
  description: string;
  photoUri: string | null;
  latitude: number;
  longitude: number;
}

export class IncidentService {
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
}
