import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { GradeChip } from '../../components/GradeChip';
import { formatDate } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const styleIcons: Record<string, string> = {
  flash: '⚡',
  onsight: '👁️',
  redpoint: '🔴',
  repeat: '🔁',
  attempt: '❌',
};

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['session', id],
    queryFn: () => api.get<{ data: any }>(`/sessions/${id}`),
  });

  const deleteAscent = useMutation({
    mutationFn: (ascentId: string) => api.delete(`/ascents/${ascentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const session = data?.data;

  if (isLoading || !session) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Session Header */}
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(session.date)}</Text>
        <Text style={styles.meta}>
          {session.type}{session.locationName ? ` · ${session.locationName}` : ''}
          {session.isOutdoor ? ' · outdoor' : ''}
        </Text>
        {session.notes && <Text style={styles.notes}>{session.notes}</Text>}
      </View>

      {/* Ascents List */}
      <FlatList
        data={session.ascents ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <Pressable
            style={styles.ascentRow}
            onLongPress={() => {
              Alert.alert('Delete Ascent', `Remove this ${item.grade} ${item.style}?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteAscent.mutate(item.id),
                },
              ]);
            }}
          >
            <GradeChip grade={item.grade} numeric={item.normalizedGrade} size="md" />
            <View style={styles.ascentInfo}>
              {item.name && <Text style={styles.ascentName}>{item.name}</Text>}
              <Text style={styles.ascentStyle}>
                {styleIcons[item.style] ?? ''} {item.style}
                {item.attempts > 1 ? ` · ${item.attempts} attempts` : ''}
              </Text>
            </View>
            <Text style={styles.resultBadge}>
              {item.result === 'send' ? '✅' : item.result === 'project' ? '🔄' : '❌'}
            </Text>
          </Pressable>
        )}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            Ascents ({session.ascents?.length ?? 0})
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No ascents logged yet</Text>
        }
      />

      {/* Add Ascent FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push(`/ascent/new?sessionId=${id}`)}
      >
        <Text style={styles.fabText}>+ Log Ascent</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  date: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  notes: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  ascentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ascentInfo: {
    flex: 1,
  },
  ascentName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  ascentStyle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  resultBadge: {
    fontSize: 18,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
