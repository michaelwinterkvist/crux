import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { GradeChip } from '../../components/GradeChip';
import { formatDateShort } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

export default function ProjectsScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects', 'active'],
    queryFn: () => api.get<{ data: any[] }>('/projects', { status: 'active' }),
  });

  const projects = data?.data ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.projectName}>{item.name}</Text>
              {item.normalizedGrade && (
                <GradeChip numeric={item.normalizedGrade} grade={item.grade} size="md" />
              )}
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>{item.type}</Text>
              {item.targetDate && (
                <Text style={styles.metaText}>Target: {formatDateShort(item.targetDate)}</Text>
              )}
            </View>
            {item.notes && (
              <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active projects</Text>
            <Text style={styles.emptySubtext}>
              Projects track routes or problems you're working toward sending
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  notes: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
