import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { generateConservationReport, ReportPeriod } from '../../services/reportService';
import { REPORT_DEFINITIONS, ReportKind, ReportSummary } from '../../services/reportAnalytics';

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

const bannerImage = require('../../assets/banner.jpg');

const REPORT_OPTIONS: { kind: ReportKind; icon: keyof typeof Ionicons.glyphMap }[] = [
  { kind: 'incidents', icon: 'warning-outline' },
  { kind: 'patrols', icon: 'walk-outline' },
  { kind: 'wildlife', icon: 'paw-outline' },
  { kind: 'community', icon: 'people-outline' },
];

const PERIOD_OPTIONS: { days: ReportPeriod; label: string }[] = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

type ViewState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function CountBars({ rows, color, textColor }: { rows: { label: string; count: number }[]; color: string; textColor: string }) {
  const maxCount = Math.max(1, ...rows.map((row) => row.count));

  return (
    <View style={styles.countBars}>
      {rows.map((row) => (
        <View key={row.label} style={styles.countRow}>
          <Text style={[styles.countLabel, { color: textColor }]} numberOfLines={1}>{row.label}</Text>
          <View style={styles.countTrack}>
            <View style={[styles.countFill, { width: `${Math.max(5, (row.count / maxCount) * 100)}%`, backgroundColor: color }]} />
          </View>
          <Text style={[styles.countValue, { color: textColor }]}>{row.count}</Text>
        </View>
      ))}
    </View>
  );
}

function TrendChart({ summary, textColor }: { summary: ReportSummary; textColor: string }) {
  const maxCount = Math.max(1, ...summary.trend.map((bucket) => bucket.count));

  return (
    <View style={styles.trendChart} accessibilityLabel="Report activity trend">
      {summary.trend.map((bucket, index) => (
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

function SummaryResults({ summary, theme }: { summary: ReportSummary; theme: ReturnType<typeof useTheme>['theme'] }) {
  const categoryRows = summary.categories.slice(0, 5);
  const statusRows = summary.statuses.slice(0, 4);
  const hasIncompleteRecords = summary.recordsWithoutCategory > 0 || summary.recordsWithoutArea > 0;

  return (
    <View style={styles.results}>
      <View style={styles.resultHeading}>
        <View style={styles.resultHeadingText}>
          <Text style={[styles.resultTitle, { color: theme.textPrimary }]}>{REPORT_DEFINITIONS[summary.kind].title}</Text>
          <Text style={[styles.resultRange, { color: theme.textSecondary }]}>
            {formatDate(summary.startDate)} â€“ {formatDate(summary.endDate)}
          </Text>
        </View>
        <View style={styles.generatedMark}>
          <Ionicons name="checkmark-circle" size={17} color={COLORS.green} />
          <Text style={styles.generatedText}>Generated</Text>
        </View>
      </View>

      {hasIncompleteRecords && (
        <View style={styles.qualityNotice}>
          <Ionicons name="information-circle-outline" size={19} color={COLORS.yellow} />
          <Text style={styles.qualityText}>
            Some records are missing categories or locations. Related breakdowns may be incomplete.
          </Text>
        </View>
      )}

      <View style={styles.metricRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Records found</Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{summary.total}</Text>
          <Text style={[styles.metricHint, { color: theme.textSecondary }]}>{summary.periodDays}-day period</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Weekly average</Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{summary.averagePerWeek}</Text>
          <Text style={[styles.metricHint, { color: theme.textSecondary }]}>records per 7 days</Text>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Activity over time</Text>
        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Records by period</Text>
        <TrendChart summary={summary} textColor={theme.textSecondary} />
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>By category</Text>
        {categoryRows.length > 0 ? (
          <CountBars rows={categoryRows} color={COLORS.primary} textColor={theme.textSecondary} />
        ) : (
          <Text style={[styles.noBreakdown, { color: theme.textSecondary }]}>Category details are not available for these records.</Text>
        )}
      </View>

      {statusRows.length > 0 && (
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>By status</Text>
          <CountBars rows={statusRows} color={COLORS.green} textColor={theme.textSecondary} />
        </View>
      )}

      {summary.areas.length > 0 && (
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.areaHeading}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Reported areas</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Locations are grouped to a coarse area</Text>
            </View>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          </View>
          {summary.areas.map((area, index) => (
            <View key={area.label} style={styles.areaRow}>
              <Text style={[styles.areaRank, { color: theme.textSecondary }]}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={[styles.areaName, { color: theme.textPrimary }]} numberOfLines={1}>{area.label}</Text>
              <Text style={[styles.areaCount, { color: theme.textSecondary }]}>{area.count}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.generatedAt, { color: theme.textSecondary }]}>Generated {formatDate(summary.generatedAt)}</Text>
    </View>
  );
}

export function ConservationReportsScreen({ audience }: { audience: 'Park manager' | 'Researcher' }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [kind, setKind] = useState<ReportKind>('incidents');
  const [period, setPeriod] = useState<ReportPeriod>(30);
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleGenerate() {
    setViewState('loading');
    setErrorMessage('');

    try {
      const report = await generateConservationReport(kind, period);
      setSummary(report);
      setViewState(report.total > 0 ? 'success' : 'empty');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The report could not be generated. Please retry.');
      setViewState('error');
    }
  }

  const activeDefinition = REPORT_DEFINITIONS[kind];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <Image source={bannerImage} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerOverlay}>
            <View style={styles.headerIcon}>
              <Ionicons name="analytics-outline" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>PARK INTELLIGENCE · {audience.toUpperCase()}</Text>
              <Text style={styles.headerTitle}>Reports</Text>
              <Text style={styles.headerSubtitle}>Explore activity across a selected period</Text>
            </View>
            <TouchableOpacity style={styles.darkToggleBtn} onPress={toggleTheme} activeOpacity={0.8}>
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Report type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeOptions}>
            {REPORT_OPTIONS.map((option) => {
              const selected = kind === option.kind;
              const definition = REPORT_DEFINITIONS[option.kind];
              return (
                <TouchableOpacity
                  key={option.kind}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={viewState === 'loading'}
                  onPress={() => {
                    setKind(option.kind);
                    setSummary(null);
                    setViewState('idle');
                  }}
                  style={[styles.typeOption, selected && styles.typeOptionSelected, viewState === 'loading' && styles.controlDisabled]}
                  activeOpacity={0.8}
                >
                  <Ionicons name={option.icon} size={19} color={selected ? COLORS.white : COLORS.primary} />
                  <Text style={[styles.typeOptionText, selected && styles.typeOptionTextSelected]}>{definition.title}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={[styles.fieldHint, { color: theme.textSecondary }]}>{activeDefinition.description}</Text>

          <Text style={[styles.fieldLabel, styles.periodLabel, { color: theme.textPrimary }]}>Date range</Text>
          <View style={styles.periodOptions}>
            {PERIOD_OPTIONS.map((option) => {
              const selected = period === option.days;
              return (
                <TouchableOpacity
                  key={option.days}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={viewState === 'loading'}
                  onPress={() => {
                    setPeriod(option.days);
                    setSummary(null);
                    setViewState('idle');
                  }}
                  style={[styles.periodOption, selected && styles.periodOptionSelected, viewState === 'loading' && styles.controlDisabled]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.periodText, selected && styles.periodTextSelected]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleGenerate}
            disabled={viewState === 'loading'}
            style={[styles.generateButton, viewState === 'loading' && styles.generateButtonDisabled]}
            activeOpacity={0.85}
          >
            {viewState === 'loading' ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Ionicons name="bar-chart-outline" size={19} color={COLORS.white} />
            )}
            <Text style={styles.generateButtonText}>{viewState === 'loading' ? 'Generating report' : 'Generate report'}</Text>
          </TouchableOpacity>
        </View>

        {viewState === 'idle' && (
          <View style={[styles.stateCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.stateIcon}>
              <Ionicons name="document-text-outline" size={25} color={COLORS.primary} />
            </View>
            <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>Ready to analyse</Text>
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>Choose a report type and date range, then generate your report.</Text>
          </View>
        )}

        {viewState === 'loading' && (
          <View style={[styles.stateCard, { backgroundColor: theme.cardBg }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.stateTitle, styles.loadingTitle, { color: theme.textPrimary }]}>Analysing park records</Text>
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>Fetching records and preparing the selected report.</Text>
          </View>
        )}

        {viewState === 'error' && (
          <View style={[styles.stateCard, styles.errorCard, { backgroundColor: theme.cardBg }]}>
            <View style={[styles.stateIcon, styles.errorIcon]}>
              <Ionicons name="cloud-offline-outline" size={25} color={COLORS.red} />
            </View>
            <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>Report unavailable</Text>
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>{errorMessage}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={handleGenerate} style={styles.retryButton} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={17} color={COLORS.primary} />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {viewState === 'empty' && (
          <View style={[styles.stateCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.stateIcon}>
              <Ionicons name="file-tray-outline" size={25} color={COLORS.slate} />
            </View>
            <Text style={[styles.stateTitle, { color: theme.textPrimary }]}>No records in this period</Text>
            <Text style={[styles.stateText, { color: theme.textSecondary }]}>
              No {activeDefinition.title.toLowerCase()} were found for the selected {period}-day range. Try a wider range or another report type.
            </Text>
          </View>
        )}

        {viewState === 'success' && summary && <SummaryResults summary={summary} theme={theme} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },
  header: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 8,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  headerCopy: { flex: 1 },
  headerEyebrow: { color: '#BBDEFB', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  headerSubtitle: { color: '#E3F2FD', fontSize: 13, marginTop: 4, fontWeight: '500' },
  filterSection: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 16,
  },
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 9 },
  typeOptions: { gap: 8, paddingRight: 4 },
  typeOption: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 11,
  },
  typeOptionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeOptionText: { color: COLORS.darkBlue, fontSize: 12, fontWeight: '600' },
  typeOptionTextSelected: { color: COLORS.white },
  fieldHint: { fontSize: 11, marginTop: 8, lineHeight: 16 },
  periodLabel: { marginTop: 19 },
  periodOptions: { flexDirection: 'row', gap: 8 },
  periodOption: {
    flex: 1,
    minHeight: 39,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F8FB',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodOptionSelected: { backgroundColor: COLORS.lightBlue, borderColor: COLORS.primary },
  controlDisabled: { opacity: 0.65 },
  periodText: { color: COLORS.slate, fontSize: 12, fontWeight: '600' },
  periodTextSelected: { color: COLORS.darkBlue },
  generateButton: {
    minHeight: 48,
    marginTop: 18,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  generateButtonDisabled: { opacity: 0.7 },
  generateButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  stateCard: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  stateTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  stateText: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 },
  loadingTitle: { marginTop: 13 },
  errorCard: { borderColor: '#F4C7C7' },
  errorIcon: { backgroundColor: '#FDECEC' },
  retryButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    marginTop: 13,
    borderRadius: 6,
    backgroundColor: COLORS.lightBlue,
  },
  retryText: { color: COLORS.darkBlue, fontSize: 13, fontWeight: '700' },
  results: { gap: 12 },
  resultHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  resultHeadingText: { flex: 1, marginRight: 8 },
  resultTitle: { fontSize: 17, fontWeight: '700' },
  resultRange: { fontSize: 11, marginTop: 3 },
  generatedMark: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  generatedText: { color: COLORS.green, fontSize: 10, fontWeight: '700' },
  qualityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.yellow,
    borderRadius: 4,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  qualityText: { flex: 1, color: COLORS.slate, fontSize: 11, lineHeight: 16 },
  metricRow: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, minHeight: 108, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 13 },
  metricLabel: { fontSize: 11, fontWeight: '600' },
  metricValue: { fontSize: 26, fontWeight: '700', marginTop: 5 },
  metricHint: { fontSize: 10, marginTop: 2 },
  sectionCard: { borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSubtitle: { fontSize: 10, marginTop: 3 },
  countBars: { gap: 12, marginTop: 14 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  countLabel: { width: 94, fontSize: 11 },
  countTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: COLORS.lightBlue, overflow: 'hidden' },
  countFill: { height: '100%', borderRadius: 4 },
  countValue: { width: 24, textAlign: 'right', fontSize: 11, fontWeight: '700' },
  noBreakdown: { fontSize: 11, marginTop: 12 },
  trendChart: { height: 132, flexDirection: 'row', alignItems: 'stretch', gap: 4, marginTop: 14 },
  trendColumn: { flex: 1, alignItems: 'center', minWidth: 0 },
  trendCount: { height: 15, fontSize: 9, fontWeight: '600' },
  trendTrack: { width: '100%', flex: 1, justifyContent: 'flex-end', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  trendBar: { width: '62%', minHeight: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: COLORS.primary },
  trendLabel: { height: 18, fontSize: 8, textAlign: 'center', marginTop: 4 },
  areaHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  areaRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  areaRank: { width: 30, fontSize: 10, fontWeight: '700' },
  areaName: { flex: 1, fontSize: 11, fontWeight: '600' },
  areaCount: { fontSize: 11, fontWeight: '700' },
  generatedAt: { fontSize: 10, textAlign: 'right', marginTop: -3 },
});
