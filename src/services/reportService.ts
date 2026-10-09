import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  buildReportSummary,
  REPORT_DEFINITIONS,
  ReportKind,
  ReportRecord,
  ReportSummary,
} from './reportAnalytics';

export type ReportPeriod = 7 | 30 | 90;

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function coordinateValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function findFirstString(data: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const value = stringValue(data[field]);
    if (value) return value;
  }
  return null;
}

function mapDocument(
  id: string,
  data: Record<string, unknown>,
  definition: typeof REPORT_DEFINITIONS[ReportKind],
): ReportRecord | null {
  const createdAt = data.createdAt;
  const occurredAt = createdAt instanceof Timestamp
    ? createdAt.toDate()
    : createdAt instanceof Date
      ? createdAt
      : null;

  if (!occurredAt || Number.isNaN(occurredAt.getTime())) return null;

  return {
    id,
    occurredAt,
    category: findFirstString(data, definition.categoryFields),
    status: findFirstString(data, ['status', 'state']),
    latitude: coordinateValue(data.latitude),
    longitude: coordinateValue(data.longitude),
    area: findFirstString(data, ['area', 'zone', 'parkName', 'locationName']),
  };
}

function dateWindow(periodDays: ReportPeriod, now = new Date()) {
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - periodDays + 1);

  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

export async function generateConservationReport(
  kind: ReportKind,
  periodDays: ReportPeriod,
): Promise<ReportSummary> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Your session has expired. Sign in again to generate a report.');
  }

  const roleSnapshot = await getDoc(doc(db, 'user_roles', user.uid));
  const role = roleSnapshot.exists() ? roleSnapshot.data().role : null;
  if (role !== 'manager' && role !== 'researcher') {
    throw new Error('Your account is not authorized to view conservation reports.');
  }

  const { startDate, endDate } = dateWindow(periodDays);
  const definition = REPORT_DEFINITIONS[kind];
  const recordsQuery = query(
    collection(db, definition.collection),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
  );

  try {
    const snapshot = await getDocs(recordsQuery);
    const records = snapshot.docs
      .map((reportDocument) => mapDocument(reportDocument.id, reportDocument.data(), definition))
      .filter((record): record is ReportRecord => record !== null);

    return buildReportSummary(kind, records, periodDays, startDate, endDate);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'permission-denied') {
      throw new Error('Firebase rules denied report access. Allow signed-in managers and researchers to read this report collection.');
    }
    if (code === 'unavailable' || code === 'network-request-failed') {
      throw new Error('The report service is offline. Check your connection and retry.');
    }
    throw new Error('The report could not be generated. Please retry.');
  }
}