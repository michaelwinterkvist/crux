import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { SessionCard } from '../../components/SessionCard';
import { GradeChip } from '../../components/GradeChip';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: () => api.get<{ data: any }>('/stats/summary'),
    enabled: isAuthenticated,
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions', { limit: '3' }],
    queryFn: () => api.get<{ data: any[] }>('/sessions', { limit: '3' }),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.logo}>CRUX</Text>
        <Text style={styles.tagline}>Your climbing companion</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginButtonText}>Get Started</Text>
        </Pressable>
      </View>
    );
  }

  const s = stats?.data;
  const recentSessions = sessions?.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Hey, {user?.name ?? 'climber'}</Text>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{s?.sessionsThisMonth ?? 0}</Text>
          <Text style={styles.statLabel}>This month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{s?.totalSessions ?? 0}</Text>
          <Text style={styles.statLabel}>Total sessions</Text>
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

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.actionButton} onPress={() => router.push('/session/new')}>
          <Text style={styles.actionIcon}>+</Text>
          <Text style={styles.actionText}>New Session</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => router.push('/wellbeing/')}>
          <Text style={styles.actionIcon}>💪</Text>
          <Text style={styles.actionText}>Check In</Text>
        </Pressable>
      </View>

      {/* Recent Sessions */}
      <Text style={styles.sectionTitle}>Recent Sessions</Text>
      {recentSessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No sessions yet. Start logging!</Text>
        </View>
      ) : (
        recentSessions.map((session: any) => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() => router.push(`/session/${session.id}`)}
          />
        ))
      )}
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
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  logo: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  greeting: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.lg,
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  actionText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
