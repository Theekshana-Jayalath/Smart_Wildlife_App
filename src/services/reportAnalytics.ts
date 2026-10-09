export type ReportKind = 'incidents' | 'patrols' | 'wildlife' | 'community';

export interface ReportRecord {
  id: string;
  occurredAt: Date;
  category: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  area: string | null;
}

export interface ReportBucket {
  label: string;
  count: number;
}

export interface ReportCount {
  label: string;
  count: number;
}

export interface ReportSummary {
  kind: ReportKind;
  total: number;
  periodDays: number;
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  averagePerWeek: number;
  categories: ReportCount[];
  statuses: ReportCount[];
  trend: ReportBucket[];
  areas: ReportCount[];
  recordsWithoutCategory: number;
  recordsWithoutArea: number;
}

export const REPORT_DEFINITIONS: Record<ReportKind, {
  title: string;
  description: string;
  collection: string;
  categoryFields: string[];
}> = {
  incidents: {
    title: 'Incident trends',
    description: 'Wildlife incidents and suspected poaching reports',
    collection: 'incidents',
    categoryFields: ['incidentType', 'type'],
  },
  patrols: {
    title: 'Patrol activity',
    description: 'Assigned and completed ranger patrol records',
    collection: 'patrols',
    categoryFields: ['patrolType', 'routeName', 'zone'],
  },
  wildlife: {
    title: 'Wildlife alerts',
    description: 'Tracked animal and risk alert records',
    collection: 'wildlife_alerts',
    categoryFields: ['species', 'animalType', 'alertType'],
  },
  community: {
    title: 'Community reports',
    description: 'Human-wildlife conflict and community submissions',
    collection: 'community_reports',
    categoryFields: ['conflictType', 'incidentType', 'type'],
  },
};

function readableLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function countBy(values: (string | null)[]): ReportCount[] {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label: readableLabel(label), count }))
    .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label));
}

function getBucketLabel(date: Date, periodDays: number): string {
  return date.toLocaleDateString('en', { day: 'numeric', month: 'short' });
}

export function buildReportSummary(
  kind: ReportKind,
  records: ReportRecord[],
  periodDays: number,
  startDate: Date,
  endDate: Date,
  generatedAt = new Date(),
): ReportSummary {
  const bucketCount = periodDays <= 7 ? 7 : periodDays <= 30 ? 5 : 12;
  const rangeMilliseconds = Math.max(1, endDate.getTime() - startDate.getTime() + 1);
  const trend = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(startDate.getTime() + (rangeMilliseconds * index) / bucketCount);
    return { label: getBucketLabel(bucketStart, periodDays), count: 0 };
  });

  records.forEach((record) => {
    const elapsed = record.occurredAt.getTime() - startDate.getTime();
    const bucketIndex = Math.min(
      bucketCount - 1,
      Math.max(0, Math.floor((elapsed / rangeMilliseconds) * bucketCount)),
    );
    trend[bucketIndex].count += 1;
  });

  const locations = new Map<string, number>();
  records.forEach((record) => {
    const area = record.area?.trim()
      || (record.latitude !== null && record.longitude !== null
        ? `${record.latitude.toFixed(1)}, ${record.longitude.toFixed(1)}`
        : null);
    if (area) locations.set(area, (locations.get(area) ?? 0) + 1);
  });

  const categories = countBy(records.map((record) => record.category));
  const statuses = countBy(records.map((record) => record.status));

  return {
    kind,
    total: records.length,
    periodDays,
    startDate,
    endDate,
    generatedAt,
    averagePerWeek: Math.round((records.length / (periodDays / 7)) * 10) / 10,
    categories,
    statuses,
    trend,
    areas: [...locations.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))
      .slice(0, 5),
    recordsWithoutCategory: records.filter((record) => !record.category).length,
    recordsWithoutArea: records.filter((record) => !record.area && (record.latitude === null || record.longitude === null)).length,
  };
}