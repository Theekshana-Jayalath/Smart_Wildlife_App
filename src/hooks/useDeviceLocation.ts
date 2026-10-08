import { useState } from 'react';
import { LocationService } from '../services/locationService';
import { LocationData } from '../types/incident';

export const useDeviceLocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await LocationService.getCurrentLocationAsync();
      return data;
    } catch (err: any) {
      if (err.message === 'PERMISSION_DENIED') {
        setError('Location permission denied. Incident cannot be completed without a valid location.');
      } else {
        setError('GPS unavailable or weak signal. Please try again outside.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchLocation,
    loading,
    error,
    clearError: () => setError(null)
  };
};
