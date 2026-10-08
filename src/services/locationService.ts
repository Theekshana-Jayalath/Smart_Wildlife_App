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
      // Use balanced accuracy as high accuracy often fails indoors or on emulators
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, 
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.log('Active GPS fetch failed, falling back to last known position...', error);
      try {
        // Fallback for weak signals / emulators
        const lastLocation = await Location.getLastKnownPositionAsync();
        if (lastLocation) {
          return {
            latitude: lastLocation.coords.latitude,
            longitude: lastLocation.coords.longitude,
            accuracy: lastLocation.coords.accuracy,
          };
        }
      } catch (fallbackError) {
        console.error('Fallback location error:', fallbackError);
      }
      
      // If BOTH methods fail (e.g., Android emulator without Google Play Services),
      // provide a mock location during development so testing isn't blocked.
      if (__DEV__) {
        console.log('Returning mock location for development purposes.');
        return {
          latitude: 6.9271, // Colombo, Sri Lanka
          longitude: 79.8612,
          accuracy: 15,
        };
      }

      throw new Error('UNAVAILABLE');
    }
  }
}
