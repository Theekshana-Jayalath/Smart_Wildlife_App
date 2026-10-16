export type IncidentType = 'snare' | 'carcass' | 'campsite' | 'footprints';

export type IncidentStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'RESOLVED' | 'DISMISSED';

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

export type ReporterType = 'RANGER' | 'COMMUNITY';

export interface IncidentRecord {
  id: string;
  rangerId?: string | null;
  reporterType?: ReporterType;
  villagerName?: string | null;
  villagerContact?: string | null;
  incidentType: IncidentType | string;
  description: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  createdAt: any;
  synchronizationStatus: string;
  status: IncidentStatus;
  actionTakenNotes?: string;
  actionTakenAt?: any;
}

