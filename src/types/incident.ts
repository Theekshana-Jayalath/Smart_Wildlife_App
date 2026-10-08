export type IncidentType = 'snare' | 'carcass' | 'campsite' | 'footprints';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface IncidentReport {
  id?: string;
  type: IncidentType | null;
  description: string;
  photoUri: string | null;
  location: LocationData | null;
  timestamp: number;
  status: 'pending' | 'synced';
}
