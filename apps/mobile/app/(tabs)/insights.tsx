import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Svg, { Line as SvgLine, Circle, Polyline, Text as SvgText } from 'react-native-svg';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { GradeChip } from '../../components/GradeChip';
import { numericToGrade } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

type TimePeriod = '30d' | '90d' | 'all';

interface ProgressionPoint {
  date: string;
  maxGrade: number;
  sendCount: number;
}

function getDateFrom(period: TimePeriod): string | undefined {
  if (period === 'all') return undefined;
  const days = period === '30d' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

const CHART_HEIGHT = 180;
const CHART_PADDING = { top: 16, right: 16, bottom: 32, left: 48 };
const screenWidth = Dimensions.get('window').width;

function GradeProgressionChart({ data }: { data: ProgressionPoint[] }) {
  const chartWidth = screenWidth - spacing.md * 2;
  const plotWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  if (data.length < 2) {
    return (
      <View style={[styles.chartEmpty, { height: CHART_HEIGHT }]}>
        <Text style={styles.emptyText}>Need at least two sessions to show trends</Text>
      </View>
    );
  }

  const minGrade = Math.min(...data.map((d) => d.maxGrade));
  const maxGrade = Math.max(...data.map((d) => d.maxGrade));
  const gradeRange = maxGrade - minGrade || 50;
  const paddedMin = minGrade - gradeRange * 0.1;
  const paddedMax = maxGrade + gradeRange * 0.1;

  const scaleX = (i: number) => CHART_PADDING.left + (i / (data.length - 1)) * plotWidth;
  const scaleY = (v: number) =>
    CHART_PADDING.top + plotHeight - ((v - paddedMin) / (paddedMax - paddedMin)) * plotHeight;

  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.maxGrade)}`).join(' ');

  // Find highest point for gold accent
  const highestIdx = data.reduce((best, d, i) => (d.maxGrade > data[best].maxGrade ? i : best), 0);

  // Y-axis labels (3-4 grade ticks)
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount }, (_, i) => {
    const numeric = paddedMin + ((paddedMax - paddedMin) * i) / (tickCount - 1);
    return { numeric, y: scaleY(numeric), label: numericToGrade(Math.round(numeric), 'font') ?? '' };
  });

  // X-axis labels (first, middle, last)
  const xLabels = [
    { i: 0, label: formatAxisDate(data[0].date) },
    { i: Math.floor(data.length / 2), label: formatAxisDate(data[Math.floor(data.length / 2)].date) },
    { i: data.length - 1, label: formatAxisDate(data[data.length - 1].date) },
  ];

  return (
    <Svg width={chartWidth} height={CHART_HEIGHT}>
      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <SvgLine
          key={i}
          x1={CHART_PADDING.left}
          y1={tick.y}
          x2={chartWidth - CHART_PADDING.right}
          y2={tick.y}
          stroke={colors.border}
          strokeWidth={1}
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((tick, i) => (
        <SvgText
          key={`y-${i}`}
          x={CHART_PADDING.left - 8}
          y={tick.y + 4}
          textAnchor="end"
          fill={colors.textSecondary}
          fontSize={11}
        >
          {tick.label}
        </SvgText>
      ))}

      {/* X-axis labels */}
      {xLabels.map(({ i, label }) => (
        <SvgText
          key={`x-${i}`}
          x={scaleX(i)}
          y={CHART_HEIGHT - 4}
          textAnchor="middle"
          fill={colors.textSecondary}
          fontSize={11}
        >
          {label}
        </SvgText>
      ))}

      {/* Line */}
      <Polyline points={points} fill="none" stroke={colors.text} strokeWidth={2} />

      {/* Data dots */}
      {data.map((d, i) => (
        <Circle
          key={i}
          cx={scaleX(i)}
          cy={scaleY(d.maxGrade)}
          r={i === highestIdx ? 5 : 3}
          fill={i === highestIdx ? colors.primary : colors.text}
        />
      ))}
    </Svg>
  );
}

function SessionVolumePlot({ data }: { data: ProgressionPoint[] }) {
  const chartWidth = screenWidth - spacing.md * 2;
  const plotWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  if (data.length < 1) {
    return (
      <View style={[styles.chartEmpty, { height: CHART_HEIGHT }]}>
        <Text style={styles.emptyText}>No session data yet</Text>
      </View>
    );
  }

  const maxSends = Math.max(...data.map((d) => d.sendCount), 1);
  const paddedMax = maxSends + 1;

  const scaleX = (i: number) =>
    CHART_PADDING.left + (data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth);
  const scaleY = (v: number) => CHART_PADDING.top + plotHeight - (v / paddedMax) * plotHeight;

  // Y-axis labels
  const tickCount = Math.min(4, paddedMax + 1);
  const yTicks = Array.from({ length: tickCount }, (_, i) => {
    const val = Math.round((paddedMax * i) / (tickCount - 1));
    return { val, y: scaleY(val) };
  });

  // X-axis labels
  const xLabels =
    data.length >= 3
      ? [
          { i: 0, label: formatAxisDate(data[0].date) },
          { i: Math.floor(data.length / 2), label: formatAxisDate(data[Math.floor(data.length / 2)].date) },
          { i: data.length - 1, label: formatAxisDate(data[data.length - 1].date) },
        ]
      : data.map((d, i) => ({ i, label: formatAxisDate(d.date) }));

  return (
    <Svg width={chartWidth} height={CHART_HEIGHT}>
      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <SvgLine
          key={i}
          x1={CHART_PADDING.left}
          y1={tick.y}
          x2={chartWidth - CHART_PADDING.right}
          y2={tick.y}
          stroke={colors.border}
          strokeWidth={1}
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((tick, i) => (
        <SvgText key={`y-${i}`} x={CHART_PADDING.left - 8} y={tick.y + 4} textAnchor="end" fill={colors.textSecondary} fontSize={11}>
          {tick.val}
        </SvgText>
      ))}

      {/* X-axis labels */}
      {xLabels.map(({ i, label }) => (
        <SvgText key={`x-${i}`} x={scaleX(i)} y={CHART_HEIGHT - 4} textAnchor="middle" fill={colors.textSecondary} fontSize={11}>
          {label}
        </SvgText>
      ))}

      {/* Dots */}
      {data.map((d, i) => (
        <Circle key={i} cx={scaleX(i)} cy={scaleY(d.sendCount)} r={4} fill={colors.textSecondary} opacity={0.8} />
      ))}
    </Svg>
  );
}

export default function InsightsScreen() {
  const { isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<TimePeriod>('90d');

  const { data: stats } = useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: () => api.get<{ data: any }>('/stats/summary'),
    enabled: isAuthenticated,
  });

  const from = getDateFrom(period);
  const { data: progression } = useQuery({
    queryKey: ['stats', 'progression', period],
    queryFn: () =>
      api.get<{ data: ProgressionPoint[] }>('/stats/progression', from ? { from } : undefined),
    enabled: isAuthenticated,
  });

  const progressionData = useMemo(() => progression?.data ?? [], [progression]);
  const s = stats?.data;

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Log in to see your insights</Text>
      </View>
    );
  }

  const sendRate = s && s.totalAscents > 0 ? Math.round((s.totalSends / s.totalAscents) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{s?.totalSends ?? 0}</Text>
          <Text style={styles.statLabel}>Total sends</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{sendRate}%</Text>
          <Text style={styles.statLabel}>Send rate</Text>
        </View>
        <View style={styles.statCard}>
          {s?.highestGrade ? (
            <GradeChip numeric={s.highestGrade} size="lg" />
          ) : (
            <Text style={styles.statValue}>-</Text>
          )}
          <Text style={styles.statLabel}>Highest</Text>
        </View>
      </View>

      {/* Period Filter */}
      <View style={styles.periodRow}>
        {(['30d', '90d', 'all'] as TimePeriod[]).map((p) => (
          <Pressable key={p} style={[styles.periodChip, period === p && styles.periodChipActive]} onPress={() => setPeriod(p)}>
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p === 'all' ? 'All' : p === '30d' ? '30 days' : '90 days'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Grade Progression Chart */}
      <Text style={styles.sectionTitle}>Grade Progression</Text>
      <View style={styles.chartCard}>
        <GradeProgressionChart data={progressionData} />
      </View>

      {/* Session Volume */}
      <Text style={styles.sectionTitle}>Session Volume</Text>
      <View style={styles.chartCard}>
        <SessionVolumePlot data={progressionData} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  periodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  periodTextActive: {
    color: colors.white,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  chartEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
