import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api } from '../../lib/api';
import { GradeChip } from '../../components/GradeChip';
import { formatDate } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const styleLabels: Record<string, string> = {
  flash: 'Flash',
  onsight: 'Onsight',
  redpoint: 'Redpoint',
  repeat: 'Repeat',
  attempt: 'Attempt',
};

const resultStyles: Record<string, { label: string; color: string }> = {
  send: { label: 'Sent', color: colors.primary },
  project: { label: 'Proj', color: colors.textSecondary },
  fall: { label: 'Fall', color: colors.textMuted },
};

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

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

  const deleteSession = useMutation({
    mutationFn: () => api.delete(`/sessions/${id}`),
    onSuccess: () => {
      // Remove deleted session from cache directly (tab may not be mounted)
      queryClient.setQueryData(['sessions'], (old: any) => {
        if (!old) return old;
        return { ...old, data: old.data?.filter((s: any) => s.id !== id) };
      });
      queryClient.removeQueries({ queryKey: ['session', id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Delete Failed', err.message ?? 'Could not delete session');
    },
  });

  function handleDeleteSession() {
    Alert.alert('Delete Session', 'Remove this session and all its ascents?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSession.mutate(),
      },
    ]);
  }

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
        <View style={styles.headerTop}>
          <Text style={styles.date}>{formatDate(session.date)}</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton} onPress={() => router.push(`/session/edit?id=${id}`)}>
              <Feather name="edit-2" size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.headerButton} onPress={handleDeleteSession}>
              <Feather name="trash-2" size={18} color={colors.error} />
            </Pressable>
          </View>
        </View>
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
        contentContainerStyle={[styles.list, { paddingBottom: 80 + insets.bottom }]}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => {
          const result = resultStyles[item.result] ?? resultStyles.fall;
          return (
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
                  {styleLabels[item.style] ?? item.style}
                  {item.attempts > 1 ? ` · ${item.attempts} attempts` : ''}
                </Text>
              </View>
              <Text style={[styles.resultBadge, { color: result.color }]}>
                {result.label}
              </Text>
            </Pressable>
          );
        }}
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
        style={[styles.fab, { bottom: spacing.lg + insets.bottom }]}
        onPress={() => router.push(`/ascent/new?sessionId=${id}`)}
      >
        <Text style={styles.fabText}>Log Ascent</Text>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerButton: {
    padding: spacing.xs,
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
    fontSize: fontSize.sm,
    fontWeight: '600',
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
  },
  fabText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
