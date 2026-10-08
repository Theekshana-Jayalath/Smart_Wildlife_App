import * as ImagePicker from 'expo-image-picker';

export class CameraService {
  /**
   * Requests camera permissions from the user.
   */
  static async requestPermissionsAsync(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Launches the camera and returns the URI of the captured image.
   * Returns null if the user cancelled.
   * Throws an error if permission is denied or something goes wrong.
   */
  static async takePhotoAsync(): Promise<string | null> {
    const hasPermission = await this.requestPermissionsAsync();
    
    if (!hasPermission) {
      throw new Error('Camera permission is required to take a photo.');
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Compress image to save storage and bandwidth
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      
      return null; // User cancelled the camera
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error('Failed to launch camera. Please try again.');
    }
  }
}
