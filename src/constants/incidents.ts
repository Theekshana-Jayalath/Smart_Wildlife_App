import { IncidentType } from '../types/incident';

export interface IncidentOption {
  id: IncidentType;
  label: string;
  icon: string; // Ionicons name
}

export const INCIDENT_TYPES: IncidentOption[] = [
  { id: 'snare', label: 'Snare', icon: 'flash-outline' },
  { id: 'carcass', label: 'Animal Carcass', icon: 'skull-outline' },
  { id: 'campsite', label: 'Illegal Campsite', icon: 'bonfire-outline' },
  { id: 'footprints', label: 'At-Risk Species Footprints', icon: 'paw-outline' },
];
