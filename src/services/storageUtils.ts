import * as FileSystem from 'expo-file-system/legacy';
import { auth, storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a local image file URI (file://...) to Firebase Storage.
 * Uses Native FileSystem binary upload via Firebase REST API.
 * Automatically tries both `.firebasestorage.app` and `.appspot.com` bucket domains if a 404 occurs.
 */
export async function uploadImageToStorage(uri: string, path: string): Promise<string> {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : '';
  
  let bucket = (process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'smart-wildlife-app.appspot.com')
    .trim()
    .replace(/^["']|["']$/g, '');

  let uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(path)}`;

  try {
    let response = await FileSystem.uploadAsync(uploadUrl, uri, {
      httpMethod: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'image/jpeg',
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    // Handle 404 Bucket domain mismatch (.firebasestorage.app vs .appspot.com)
    if (response.status === 404) {
      const altBucket = bucket.includes('.firebasestorage.app')
        ? bucket.replace('.firebasestorage.app', '.appspot.com')
        : bucket.includes('.appspot.com')
          ? bucket.replace('.appspot.com', '.firebasestorage.app')
          : `${bucket}.appspot.com`;

      console.log(`404 on ${bucket}, trying alternative bucket domain: ${altBucket}`);
      const altUploadUrl = `https://firebasestorage.googleapis.com/v0/b/${altBucket}/o?uploadType=media&name=${encodeURIComponent(path)}`;
      
      response = await FileSystem.uploadAsync(altUploadUrl, uri, {
        httpMethod: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'image/jpeg',
        },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });

      if (response.status === 200) {
        bucket = altBucket;
      }
    }

    if (response.status === 200) {
      const responseData = JSON.parse(response.body);
      const downloadTokens = responseData.downloadTokens || (responseData.metadata && responseData.metadata.downloadTokens) || '';
      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media${downloadTokens ? `&token=${downloadTokens}` : ''}`;
      return downloadUrl;
    }

    if (response.status === 404) {
      throw new Error(
        "Firebase Storage bucket not found (404). Please ensure Firebase Storage is enabled in your Firebase Console (Build > Storage > Get Started)."
      );
    }

    console.warn(`Native upload failed with status ${response.status}: ${response.body}, trying SDK fallback...`);
  } catch (nativeError: any) {
    if (nativeError.message?.includes('Firebase Storage bucket not found')) {
      throw nativeError;
    }
    console.warn('Native FileSystem upload error, trying SDK fallback...', nativeError);
  }

  // SDK Fallback using fetch to convert local URI to Blob
  const fetchResponse = await fetch(uri);
  const blob = await fetchResponse.blob();

  try {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        () => resolve()
      );
    });

    return await getDownloadURL(storageRef);
  } finally {
    if (blob && typeof (blob as any).close === 'function') {
      (blob as any).close();
    }
  }
}
