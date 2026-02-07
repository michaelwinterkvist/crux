import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getGradeColor, numericToGrade } from '@crux/shared';
import { borderRadius, fontSize } from '../theme';

interface GradeChipProps {
  grade?: string;
  numeric?: number;
  system?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GradeChip({ grade, numeric, size = 'md' }: GradeChipProps) {
  const displayGrade = grade ?? (numeric ? numericToGrade(numeric, 'font') ?? '?' : '?');
  const numericValue = numeric ?? 500;
  const color = getGradeColor(numericValue);

  const sizes = {
    sm: { paddingH: 6, paddingV: 2, fontSize: fontSize.xs },
    md: { paddingH: 10, paddingV: 4, fontSize: fontSize.sm },
    lg: { paddingH: 14, paddingV: 6, fontSize: fontSize.md },
  };

  const s = sizes[size];

  return (
    <View style={[styles.chip, { backgroundColor: color, paddingHorizontal: s.paddingH, paddingVertical: s.paddingV }]}>
      <Text style={[styles.text, { fontSize: s.fontSize }]}>{displayGrade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
