import { useState } from 'react';
import { Alert } from 'react-native';
import { CameraService } from '../services/cameraService';

export const useCamera = () => {
  const [loading, setLoading] = useState(false);

  const takePhoto = async (): Promise<string | null> => {
    setLoading(true);
    try {
      const uri = await CameraService.takePhotoAsync();
      return uri;
    } catch (error: any) {
      Alert.alert('Camera Error', error.message || 'An unexpected error occurred.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    takePhoto,
    loading,
  };
};
