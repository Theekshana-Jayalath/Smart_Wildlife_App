import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { uploadImageToStorage } from './storageUtils';
import * as Network from 'expo-network';
import { OfflineStorageService } from './offlineStorageService';

export interface IncidentSubmissionData {
  type: string;
  description: string;
  photoUri: string | null;
  latitude: number;
  longitude: number;
}

export interface IncidentSubmissionResult {
  id: string;
  status: 'SYNCED' | 'OFFLINE';
}

export class IncidentService {
  /**
   * Submits a complete incident report.
   * Handles photo upload to Storage and document creation in Firestore,
   * or stores the incident locally if the device is offline.
   */
  static async submitIncident(data: IncidentSubmissionData): Promise<IncidentSubmissionResult> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Authentication failure: You must be logged in to submit an incident.");
    }

    // Check network connectivity
    const networkState = await Network.getNetworkStateAsync();
    // In some environments, isInternetReachable can be null, so we primarily rely on isConnected
    if (!networkState.isConnected) {
      const id = await OfflineStorageService.saveIncidentOffline(data, user.uid);
      return { id, status: 'OFFLINE' };
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
        synchronizationStatus: 'SYNCED',
        status: 'SUBMITTED',
      };

      const docRef = await addDoc(collection(db, 'incidents'), docData);
      
      return { id: docRef.id, status: 'SYNCED' };

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
   * Directly submits an incident to Firebase without a network check.
   * Used strictly by the SyncService to push pending offline incidents to the cloud.
   * Uses setDoc to prevent creating duplicate incidents if retried.
   */
  static async submitCloudIncident(data: IncidentSubmissionData, incidentId: string, rangerId: string): Promise<void> {
    try {
      let photoUrl = null;

      // 1. Upload photo if present
      if (data.photoUri) {
        const fileName = `incidents/${rangerId}_${Date.now()}.jpg`;
        photoUrl = await uploadImageToStorage(data.photoUri, fileName);
      }

      // 2. Create/Overwrite Firestore Document with specific ID
      const docData = {
        rangerId: rangerId,
        incidentType: data.type,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        photoUrl: photoUrl,
        createdAt: serverTimestamp(),
        synchronizationStatus: 'SYNCED',
        status: 'SUBMITTED',
      };

      await setDoc(doc(db, 'incidents', incidentId), docData);

    } catch (error: any) {
      console.error(`Failed to submit cloud incident ${incidentId}:`, error);
      throw error;
    }
  }
}
