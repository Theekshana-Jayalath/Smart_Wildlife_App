import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import {
  ConservationReport,
  REPORT_DEFINITIONS,
  ReportKind,
  ReportSource, SourceResult,
} from '../../services/reportAnalytics';
import {
  generateConservationReport,
  ReportDateRange,
  ReportProgressStage,
} from '../../services/reportService';

const COLORS = {
  primary: '#1565C0',
  darkBlue: '#0D47A1',
  lightBlue: '#E3F2FD',
  white: '#FFFFFF',
  slate: '#546E7A',
  red: '#D32F2F',
  green: '#2E7D32',
  yellow: '#F57F17',
  border: '#D9E5EF',
};

const REPORT_OPTIONS: { kind: ReportKind; icon: keyof typeof Ionicons.glyphMap }[] = [
  { kind: 'overview', icon: 'analytics-outline' },
  { kind: 'incidents', icon: 'warning-outline' },
  { kind: 'poaching', icon: 'location-outline' },
  { kind: 'patrols', icon: 'walk-outline' },
  { kind: 'conflicts', icon: 'people-outline' },
];

const STAGES: { id: ReportProgressStage; label: string }[] = [
  { id: 'incidents', label: 'Retrieve incident records' },
  { id: 'patrols', label: 'Retrieve patrol assignments' },
  { id: 'conflicts', label: 'Check community report source' },
  { id: 'poaching', label: 'Analyse available trends and hotspots' },
  { id: 'complete', label: 'Prepare report results' },
];

type ViewState = 'idle' | 'loading' | 'results' | 'empty' | 'error';

function localDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateValue(value: string, endOfDay: boolean): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  else date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function hasReportResults(report: ConservationReport, kind: ReportKind): boolean {
  if (kind === 'overview') return report.totalAvailableRecords > 0;
  if (kind === 'incidents' || kind === 'poaching') return report.sourceResults.incidents.state === 'available';
  if (kind === 'patrols') return report.sourceResults.patrols.state === 'available';
  return report.sourceResults.conflicts.state === 'available';
}

function CountBars({
  rows,
  color,
  textColor,
}: {
  rows: { label: string; count: number }[];
  color: string;
  textColor: string;
}) {
  const maxCount = Math.max(1, ...rows.map((row) => row.count));
  return (
    <View style={styles.countBars}>
      {rows.map((row) => (
        <View key={row.label} style={styles.countRow}>
          <Text style={[styles.countLabel, { color: textColor }]} numberOfLines={1}>{row.label}</Text>
          <View style={styles.countTrack}>
            <View style={[styles.countFill, { width: `${Math.max(4, (row.count / maxCount) * 100)}%`, backgroundColor: color }]} />
          </View>
          <Text style={[styles.countValue, { color: textColor }]}>{row.count}</Text>
        </View>
      ))}
    </View>
  );
}

function TrendChart({ report, textColor }: { report: ConservationReport; textColor: string }) {
  const trend = report.kind === 'conflicts' ? report.conflicts.trend : report.incidents.trend;
  const maxCount = Math.max(1, ...trend.map((bucket) => bucket.count));
  return (
    <View style={styles.trendChart} accessibilityLabel="Records by time period">
      {trend.map((bucket, index) => (
        <View key={`${bucket.label}-${index}`} style={styles.trendColumn}>
          <Text style={[styles.trendCount, { color: textColor }]}>{bucket.count || ''}</Text>
          <View style={styles.trendTrack}>
            <View style={[styles.trendBar, { height: `${Math.max(4, (bucket.count / maxCount) * 100)}%` }]} />
          </View>
          <Text style={[styles.trendLabel, { color: textColor }]} numberOfLines={1}>{bucket.label}</Text>
        </View>
      ))}
    </View>
  );
}

function SourceStateRow({ source, label, theme }: { source: SourceResult<any>; label: string; theme: ReturnType<typeof useTheme>['theme'] }) {
  const state = source.state;
  const color = state === 'available' ? COLORS.green : state === 'empty' ? COLORS.yellow : COLORS.slate;
  const icon = state === 'available' ? 'checkmark-circle-outline' : state === 'empty' ? 'alert-circle-outline' : 'remove-circle-outline';
  const description = state === 'available'
    ? `${source.records.length} records`
    : state === 'empty'
      ? 'No records in this period'
      : source.error ?? 'Source unavailable';

  return (
    <View style={styles.sourceRow}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.sourceName, { color: theme.textPrimary }]}>{label}</Text>
      <Text style={[styles.sourceState, { color: theme.textSecondary }]}>{description}</Text>
    </View>
  );
}

function ResultPanel({
  report,
  kind,
  theme,
}: {
  report: ConservationReport;
  kind: ReportKind;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const showAll = kind === 'overview';
  const showIncidents = showAll || kind === 'incidents';
  const showPoaching = showAll || kind === 'poaching';
  const showPatrols = showAll || kind === 'patrols';
  const showConflicts = showAll || kind === 'conflicts';
  const selectedSourceUnavailable = kind === 'incidents' && report.sourceResults.incidents.state === 'unavailable'
    || kind === 'patrols' && report.sourceResults.patrols.state === 'unavailable'
    || kind === 'conflicts' && report.sourceResults.conflicts.state === 'unavailable'
    || kind === 'poaching' && report.sourceResults.incidents.state === 'unavailable';

  return (
    <View style={styles.results}>
      <View style={styles.resultHeading}>
        <View style={styles.resultHeadingText}>
          <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>{REPORT_DEFINITIONS[kind].title}</Text>
          <Text style={[styles.resultRange, { color: theme.textSecondary }]}>{formatDate(report.startDate)} – {formatDate(report.endDate)}</Text>
        </View>
        <View style={styles.generatedMark}>
          <Ionicons name="checkmark-circle" size={17} color={COLORS.green} />
          <Text style={styles.generatedText}>Generated</Text>
        </View>
      </View>

      {report.partialData && (
        <View style={styles.partialNotice}>
          <Ionicons name="alert-circle-outline" size={19} color={COLORS.yellow} />
          <Text style={styles.noticeText}>Partial data: some report sources are not connected or returned no records. Only available data is included.</Text>
        </View>
      )}

      {selectedSourceUnavailable && (
        <View style={styles.partialNotice}>
          <Ionicons name="information-circle-outline" size={19} color={COLORS.yellow} />
          <Text style={styles.noticeText}>This analysis source is unavailable. No value has been estimated or invented.</Text>
        </View>
      )}

      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Data availability</Text>
        <SourceStateRow source={report.sourceResults.incidents} label="Wildlife incidents" theme={theme} />
        <SourceStateRow source={report.sourceResults.patrols} label="Patrol assignments" theme={theme} />
        <SourceStateRow source={report.sourceResults.conflicts} label="Community reports" theme={theme} />
      </View>

      {showIncidents && report.sourceResults.incidents.state === 'available' && (
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Incident trends</Text>
          <View style={styles.metricRow}>
            <Metric label="Total incidents" value={String(report.incidents.total)} theme={theme} />
            <Metric label="Missing location" value={String(report.incidents.missingLocations)} theme={theme} />
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Incidents by time</Text>
          <TrendChart report={report} textColor={theme.textSecondary} />
          <Text style={[styles.cardSubtitle, styles.breakdownTitle, { color: theme.textSecondary }]}>Incident types</Text>
          {report.incidents.categories.length ? <CountBars rows={report.incidents.categories} color={COLORS.primary} textColor={theme.textSecondary} /> : <Text style={[styles.noBreakdown, { color: theme.textSecondary }]}>No incident categories were recorded.</Text>}
        </View>
      )}

      {showPoaching && report.sourceResults.incidents.state === 'available' && (
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Potential poaching hotspots</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Candidate incidents use matching types such as snare, trap, or illegal activity. A hotspot requires at least two located reports in the same coarse grid cell.</Text>
          <View style={styles.metricRow}>
            <Metric label="Candidate reports" value={String(report.poaching.candidateIncidentCount)} theme={theme} />
            <Metric label="Potential clusters" value={String(report.poaching.hotspots.length)} theme={theme} />
          </View>
          {report.poaching.candidateIncidentsWithoutLocation > 0 && (
            <Text style={styles.warningText}>{report.poaching.candidateIncidentsWithoutLocation} candidate report(s) have no coordinates and were excluded from clusters.</Text>
          )}
          {report.poaching.hotspots.length ? report.poaching.hotspots.map((hotspot) => (
            <View key={hotspot.label} style={styles.hotspotRow}>
              <Ionicons name="location" size={18} color={COLORS.red} />
              <Text style={[styles.areaName, { color: theme.textPrimary }]}>{hotspot.label}</Text>
              <Text style={[styles.areaCount, { color: theme.textSecondary }]}>{hotspot.incidents} reports</Text>
            </View>
          )) : <Text style={[styles.noBreakdown, { color: theme.textSecondary }]}>No potential clusters were found in the available incident locations.</Text>}
        </View>
      )}

      {showPatrols && report.sourceResults.patrols.state === 'available' && (
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Patrol coverage</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Assignment progress; GPS trail coverage cannot be calculated because recorded GPS points remain on ranger devices.</Text>
          <View style={styles.metricRow}>
            <Metric label="Assigned" value={String(report.patrols.assigned)} theme={theme} />
            <Metric label="Completed" value={String(report.patrols.completed)} theme={theme} />
            <Metric label="Completion" value={report.patrols.completionPercent === null ? '—' : `${report.patrols.completionPercent}%`} theme={theme} />
          </View>
          <Text style={[styles.plannedDistance, { color: theme.textPrimary }]}>{report.patrols.plannedDistanceKm.toFixed(1)} km planned route distance</Text>
          {report.patrols.routeProgress.map((route) => (
            <View key={route.routeName} style={styles.areaRow}>
              <Text style={[styles.areaName, { color: theme.textPrimary }]} numberOfLines={1}>{route.routeName}</Text>
              <Text style={[styles.areaCount, { color: theme.textSecondary }]}>{route.completed}/{route.assigned} complete</Text>
            </View>
          ))}
        </View>
      )}

      {showConflicts && report.sourceResults.conflicts.state === 'available' && (
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Human-wildlife conflict trends</Text>
          <View style={styles.metricRow}>
            <Metric label="Community reports" value={String(report.conflicts.total)} theme={theme} />
            <Metric label="Missing location" value={String(report.conflicts.missingLocations)} theme={theme} />
          </View>
          <TrendChart report={{ ...report, kind: 'conflicts' }} textColor={theme.textSecondary} />
          {report.conflicts.categories.length ? <CountBars rows={report.conflicts.categories} color={COLORS.yellow} textColor={theme.textSecondary} /> : <Text style={[styles.noBreakdown, { color: theme.textSecondary }]}>No conflict categories were recorded.</Text>}
        </View>
      )}

      {kind === 'patrols' && report.sourceResults.patrols.state !== 'available' && <SourceUnavailable text="Patrol assignment data is unavailable for this period." />}
      {kind === 'incidents' && report.sourceResults.incidents.state !== 'available' && <SourceUnavailable text="Incident data is unavailable for this period." />}
      {kind === 'poaching' && report.sourceResults.incidents.state !== 'available' && <SourceUnavailable text="Incident location data is unavailable for hotspot analysis." />}
      {kind === 'conflicts' && report.sourceResults.conflicts.state !== 'available' && <SourceUnavailable text="Community reports are not connected yet, so conflict trends cannot be calculated." />}

      <Text style={[styles.generatedAt, { color: theme.textSecondary }]}>Generated {formatDate(report.generatedAt)}</Text>
    </View>
  );
}

function Metric({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: theme.background }]}>
      <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

function SourceUnavailable({ text }: { text: string }) {
  return (
    <View style={styles.emptySource}>
      <Ionicons name="information-circle-outline" size={22} color={COLORS.yellow} />
      <Text style={styles.emptySourceText}>{text}</Text>
    </View>
  );
}

export function ConservationReportsScreen({ audience }: { audience: 'Park manager' | 'Researcher' }) {
  const { theme } = useTheme();
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const [kind, setKind] = useState<ReportKind>('overview');
  const [fromValue, setFromValue] = useState(localDateValue(monthStart));
  const [toValue, setToValue] = useState(localDateValue(today));
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [report, setReport] = useState<ConservationReport | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [progress, setProgress] = useState<ReportProgressStage | null>(null);

  function getRange(): ReportDateRange | null {
    const startDate = parseDateValue(fromValue.trim(), false);
    const endDate = parseDateValue(toValue.trim(), true);
    if (!startDate || !endDate) {
      setFieldError('Enter both dates using YYYY-MM-DD and check they are valid calendar dates.');
      return null;
    }
    if (startDate > endDate) {
      setFieldError('The From date must be on or before the To date.');
      return null;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (endDate > today) {
      setFieldError('The To date cannot be in the future.');
      return null;
    }
    setFieldError('');
    return { startDate, endDate };
  }

  async function handleGenerate() {
    const range = getRange();
    if (!range) return;
    setViewState('loading');
    setErrorMessage('');
    setProgress(null);

    try {
      const result = await generateConservationReport(kind, range, setProgress);
      setReport(result);
      setViewState(hasReportResults(result, kind) ? 'results' : 'empty');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The report could not be generated. Please retry.');
      setViewState('error');
    }
  }

  async function shareReport() {
    if (!report) return;
    const message = [
      `${REPORT_DEFINITIONS[kind].title}: ${formatDate(report.startDate)} – ${formatDate(report.endDate)}`,
      `Incidents: ${report.incidents.total}`,
      `Potential poaching hotspots: ${report.poaching.hotspots.length}`,
      `Patrol assignments completed: ${report.patrols.completed}/${report.patrols.assigned}`,
      `Community conflict reports: ${report.conflicts.total}`,
      report.partialData ? 'Partial data: some source collections are unavailable.' : 'All connected sources returned data.',
    ].join('\n');
    await Share.share({ title: 'Conservation report', message });
  }

  const stageIndex = progress ? STAGES.findIndex((stage) => stage.id === progress) : -1;
  const start = parseDateValue(fromValue, false);
  const end = parseDateValue(toValue, true);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><Ionicons name="analytics-outline" size={23} color={COLORS.white} /></View>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>PARK INTELLIGENCE · {audience.toUpperCase()}</Text>
            <Text style={styles.headerTitle}>Conservation reports</Text>
            <Text style={styles.headerSubtitle}>Select analysis and reporting period</Text>
          </View>
        </View>

        {viewState !== 'results' && viewState !== 'empty' && (
          <View style={styles.filterSection}>
            <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Report type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeOptions}>
              {REPORT_OPTIONS.map((option) => {
                const selected = kind === option.kind;
                return (
                  <TouchableOpacity
                    key={option.kind}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    disabled={viewState === 'loading'}
                    onPress={() => { setKind(option.kind); setReport(null); setViewState('idle'); }}
                    style={[styles.typeOption, selected && styles.typeOptionSelected, viewState === 'loading' && styles.controlDisabled]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={REPORT_OPTIONS.find((item) => item.kind === option.kind)?.icon ?? 'document-outline'} size={18} color={selected ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.typeOptionText, selected && styles.typeOptionTextSelected]}>{REPORT_DEFINITIONS[option.kind].title}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={[styles.fieldHint, { color: theme.textSecondary }]}>{REPORT_DEFINITIONS[kind].description}</Text>

            <Text style={[styles.fieldLabel, styles.dateLabel, { color: theme.textPrimary }]}>Reporting period</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={[styles.dateCaption, { color: theme.textSecondary }]}>FROM</Text>
                <TextInput
                  accessibilityLabel="From date"
                  value={fromValue}
                  onChangeText={(value) => { setFromValue(value); setFieldError(''); }}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  editable={viewState !== 'loading'}
                  style={[styles.dateInput, { color: theme.textPrimary }]}
                />
              </View>
              <View style={styles.dateField}>
                <Text style={[styles.dateCaption, { color: theme.textSecondary }]}>TO</Text>
                <TextInput
                  accessibilityLabel="To date"
                  value={toValue}
                  onChangeText={(value) => { setToValue(value); setFieldError(''); }}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  editable={viewState !== 'loading'}
                  style={[styles.dateInput, { color: theme.textPrimary }]}
                />
              </View>
            </View>
            {fieldError ? <Text style={styles.validationError}>{fieldError}</Text> : null}
            {start && end && start <= end ? (
              <Text style={[styles.dateSummary, { color: theme.textSecondary }]}>{formatDate(start)} through {formatDate(end)}</Text>
            ) : null}

            <TouchableOpacity
              accessibilityRole="button"
              onPress={handleGenerate}
              disabled={viewState === 'loading'}
              style={[styles.generateButton, viewState === 'loading' && styles.generateButtonDisabled]}
              activeOpacity={0.85}
            >
              {viewState === 'loading' ? <ActivityIndicator color={COLORS.white} /> : <Ionicons name="bar-chart-outline" size={19} color={COLORS.white} />}
              <Text style={styles.generateButtonText}>{viewState === 'loading' ? 'Generating report' : 'Generate report'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {viewState === 'idle' && (
          <View style={[styles.stateCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.stateIcon}><Ionicons name="document-text-outline" size={25} color={COLORS.primary} /></View>
            <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>Choose report criteria</Text>
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>Select an analysis and valid date range to generate the available conservation report.</Text>
          </View>
        )}

        {viewState === 'loading' && (
          <View style={[styles.stateCard, { backgroundColor: theme.cardBg }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.stateTitle, styles.loadingTitle, { color: theme.textPrimary }]}>Generating conservation analysis</Text>
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>Retrieving relevant records for the selected period.</Text>
            <View style={styles.stageList}>
              {STAGES.map((stage, index) => {
                const complete = stageIndex > index;
                const active = stageIndex === index;
                return (
                  <View key={stage.id} style={styles.stageRow}>
                    <Ionicons name={complete ? 'checkmark-circle' : active ? 'sync-circle-outline' : 'ellipse-outline'} size={18} color={complete ? COLORS.green : active ? COLORS.primary : COLORS.slate} />
                    <Text style={[styles.stageText, { color: complete || active ? theme.textPrimary : theme.textSecondary }]}>{stage.label}</Text>
                    <Text style={[styles.stageStatus, { color: complete ? COLORS.green : active ? COLORS.primary : theme.textSecondary }]}>{complete ? 'Complete' : active ? 'Processing' : 'Pending'}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {viewState === 'error' && (
          <View style={[styles.stateCard, styles.errorCard, { backgroundColor: theme.cardBg }]}>
            <View style={[styles.stateIcon, styles.errorIcon]}><Ionicons name="cloud-offline-outline" size={25} color={COLORS.red} /></View>
            <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>Report generation failed</Text>
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>{errorMessage}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={handleGenerate} style={styles.retryButton} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={17} color={COLORS.primary} /><Text style={styles.retryText}>Retry report generation</Text>
            </TouchableOpacity>
          </View>
        )}

        {viewState === 'empty' && (
          <View style={[styles.stateCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.stateIcon}><Ionicons name="file-tray-outline" size={25} color={COLORS.slate} /></View>
            <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>No relevant data found</Text>
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>No connected conservation data exists for this report period.</Text>
            {report && <SourceAvailability report={report} theme={theme} />}
            <TouchableOpacity accessibilityRole="button" onPress={() => setViewState('idle')} style={styles.retryButton} activeOpacity={0.8}>
              <Text style={styles.retryText}>Back to report options</Text>
            </TouchableOpacity>
          </View>
        )}

        {viewState === 'results' && report && (
          <>
            <ResultPanel report={report} kind={kind} theme={theme} />
            <View style={styles.resultActions}>
              <TouchableOpacity accessibilityRole="button" onPress={shareReport} style={styles.shareButton} activeOpacity={0.8}>
                <Ionicons name="share-outline" size={18} color={COLORS.primary} /><Text style={styles.shareText}>Share report summary</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={() => setViewState('idle')} style={styles.backButton} activeOpacity={0.8}>
                <Text style={styles.backText}>Back to report options</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SourceAvailability({ report, theme }: { report: ConservationReport; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={styles.sourceList}>
      <SourceStateRow source={report.sourceResults.incidents} label="Wildlife incidents" theme={theme} />
      <SourceStateRow source={report.sourceResults.patrols} label="Patrol assignments" theme={theme} />
      <SourceStateRow source={report.sourceResults.conflicts} label="Community reports" theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },
  header: { backgroundColor: COLORS.darkBlue, borderRadius: 8, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  headerCopy: { flex: 1 },
  headerEyebrow: { color: '#BBDEFB', fontSize: 9, fontWeight: '700' },
  headerTitle: { color: COLORS.white, fontSize: 21, fontWeight: '700', marginTop: 4 },
  headerSubtitle: { color: '#E3F2FD', fontSize: 12, marginTop: 3 },
  filterSection: { backgroundColor: COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 15, marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 9 },
  typeOptions: { gap: 8, paddingRight: 4 },
  typeOption: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, paddingHorizontal: 11 },
  typeOptionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeOptionText: { color: COLORS.darkBlue, fontSize: 12, fontWeight: '600' },
  typeOptionTextSelected: { color: COLORS.white },
  fieldHint: { fontSize: 11, marginTop: 8, lineHeight: 16 },
  dateLabel: { marginTop: 18 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: { flex: 1, minHeight: 70, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, paddingHorizontal: 11, paddingTop: 8 },
  dateCaption: { fontSize: 9, fontWeight: '700' },
  dateInput: { minHeight: 36, padding: 0, fontSize: 14, fontWeight: '600' },
  dateSummary: { fontSize: 11, marginTop: 7 },
  validationError: { color: COLORS.red, fontSize: 12, lineHeight: 17, marginTop: 8 },
  generateButton: { minHeight: 48, marginTop: 16, borderRadius: 6, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  generateButtonDisabled: { opacity: 0.7 },
  generateButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  controlDisabled: { opacity: 0.65 },
  stateCard: { minHeight: 190, alignItems: 'center', justifyContent: 'center', padding: 22, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  stateIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.lightBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  stateTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  stateText: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 },
  loadingTitle: { marginTop: 13 },
  stageList: { width: '100%', gap: 9, marginTop: 18 },
  stageRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 8 },
  stageText: { flex: 1, fontSize: 11 },
  stageStatus: { fontSize: 10, fontWeight: '600' },
  errorCard: { borderColor: '#F4C7C7' },
  errorIcon: { backgroundColor: '#FDECEC' },
  retryButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 14, marginTop: 13, borderRadius: 6, backgroundColor: COLORS.lightBlue },
  retryText: { color: COLORS.darkBlue, fontSize: 12, fontWeight: '700' },
  results: { gap: 12 },
  resultHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  resultHeadingText: { flex: 1, marginRight: 8 },
  resultTitle: { fontSize: 17, fontWeight: '700' },
  resultRange: { fontSize: 11, marginTop: 3 },
  generatedMark: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  generatedText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  partialNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF8E1', borderLeftWidth: 3, borderLeftColor: COLORS.yellow, borderRadius: 4, paddingHorizontal: 11, paddingVertical: 10 },
  noticeText: { flex: 1, color: COLORS.slate, fontSize: 11, lineHeight: 16 },
  sectionCard: { borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 14, gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSubtitle: { fontSize: 10, lineHeight: 15 },
  metricRow: { flexDirection: 'row', gap: 8, marginTop: 5 },
  metricCard: { flex: 1, minHeight: 70, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, padding: 9, justifyContent: 'center' },
  metricLabel: { fontSize: 9, fontWeight: '600' },
  metricValue: { fontSize: 21, fontWeight: '700', marginTop: 3 },
  countBars: { gap: 12, marginTop: 5 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  countLabel: { width: 94, fontSize: 11 },
  countTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: COLORS.lightBlue, overflow: 'hidden' },
  countFill: { height: '100%', borderRadius: 4 },
  countValue: { width: 24, textAlign: 'right', fontSize: 11, fontWeight: '700' },
  trendChart: { height: 122, flexDirection: 'row', alignItems: 'stretch', gap: 4 },
  trendColumn: { flex: 1, alignItems: 'center', minWidth: 0 },
  trendCount: { height: 15, fontSize: 9, fontWeight: '600' },
  trendTrack: { width: '100%', flex: 1, justifyContent: 'flex-end', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  trendBar: { width: '62%', minHeight: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: COLORS.primary },
  trendLabel: { height: 18, fontSize: 8, textAlign: 'center', marginTop: 4 },
  breakdownTitle: { marginTop: 6 },
  hotspotRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  areaName: { flex: 1, fontSize: 11, fontWeight: '600' },
  areaCount: { fontSize: 11, fontWeight: '700' },
  warningText: { color: '#9A5B00', fontSize: 11, lineHeight: 16 },
  plannedDistance: { color: COLORS.darkBlue, fontSize: 12, fontWeight: '700', marginTop: 2 },
  areaRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  noBreakdown: { fontSize: 11, lineHeight: 16 },
  sourceRow: { minHeight: 31, flexDirection: 'row', alignItems: 'center', gap: 7 },
  sourceName: { fontSize: 10, fontWeight: '600' },
  sourceState: { flex: 1, fontSize: 9, textAlign: 'right' },
  emptySource: { minHeight: 68, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  emptySourceText: { flex: 1, color: COLORS.slate, fontSize: 12, lineHeight: 17 },
  generatedAt: { fontSize: 10, textAlign: 'right', marginTop: 2 },
  resultActions: { gap: 9, marginTop: 14 },
  shareButton: { minHeight: 44, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  shareText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  backButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: COLORS.lightBlue },
  backText: { color: COLORS.darkBlue, fontSize: 12, fontWeight: '700' },
});
