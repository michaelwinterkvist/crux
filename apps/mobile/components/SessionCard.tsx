import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { formatDate } from '@crux/shared';
import { GradeChip } from './GradeChip';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface SessionCardProps {
  session: {
    id: string;
    date: string;
    type: string;
    locationName?: string | null;
    ascentCount?: number;
    maxGrade?: number | null;
    isOutdoor?: boolean;
  };
  onPress: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.date}>{formatDate(session.date)}</Text>
          {session.locationName && (
            <Text style={styles.location}>{session.locationName}</Text>
          )}
        </View>
        {session.maxGrade && <GradeChip numeric={session.maxGrade} size="md" />}
      </View>
      <View style={styles.footer}>
        <Text style={styles.meta}>
          {session.type}{session.isOutdoor ? ' · outdoor' : ''}
        </Text>
        <Text style={styles.meta}>
          {session.ascentCount ?? 0} ascent{(session.ascentCount ?? 0) !== 1 ? 's' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  date: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  location: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
