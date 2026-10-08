import * as Location from 'expo-location';
import { LocationData } from '../types/incident';

export class LocationService {
  /**
   * Requests foreground location permissions from the user.
   */
  static async requestPermissionsAsync(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Fetches the current GPS coordinates.
   * Throws specific errors for permission denial or unavailable GPS.
   */
  static async getCurrentLocationAsync(): Promise<LocationData> {
    const hasPermission = await this.requestPermissionsAsync();
    
    if (!hasPermission) {
      throw new Error('PERMISSION_DENIED');
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // High accuracy is critical for conservation reporting
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Location error:', error);
      throw new Error('UNAVAILABLE');
    }
  }
}
