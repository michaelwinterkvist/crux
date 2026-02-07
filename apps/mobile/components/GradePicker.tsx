import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { getGradesForSystem, getBands, type GradeSystem, type GradeDefinition, getGradeColor } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface GradePickerProps {
  visible: boolean;
  system: GradeSystem;
  initialGrade?: string;
  onSelect: (grade: GradeDefinition) => void;
  onClose: () => void;
}

export function GradePicker({ visible, system, initialGrade, onSelect, onClose }: GradePickerProps) {
  const bands = useMemo(() => getBands(system), [system]);
  const allGrades = useMemo(() => getGradesForSystem(system), [system]);

  // Find initial band from initial grade
  const initialBand = useMemo(() => {
    if (!initialGrade) return bands[Math.floor(bands.length / 2)];
    const found = allGrades.find((g) => g.grade === initialGrade);
    return found?.band ?? bands[Math.floor(bands.length / 2)];
  }, [initialGrade, allGrades, bands]);

  const [selectedBand, setSelectedBand] = useState(initialBand);

  const gradesInBand = useMemo(
    () => allGrades.filter((g) => g.band === selectedBand),
    [allGrades, selectedBand],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Grade</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>Cancel</Text>
            </Pressable>
          </View>

          <View style={styles.columns}>
            {/* Band column */}
            <ScrollView style={styles.bandColumn} showsVerticalScrollIndicator={false}>
              {bands.map((band) => (
                <Pressable
                  key={band}
                  style={[styles.bandItem, selectedBand === band && styles.bandItemSelected]}
                  onPress={() => setSelectedBand(band)}
                >
                  <Text style={[styles.bandText, selectedBand === band && styles.bandTextSelected]}>
                    {band}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Grade column */}
            <ScrollView style={styles.gradeColumn} showsVerticalScrollIndicator={false}>
              {gradesInBand.map((g) => (
                <Pressable
                  key={g.grade}
                  style={[styles.gradeItem, { borderLeftColor: getGradeColor(g.numeric) }]}
                  onPress={() => {
                    onSelect(g);
                    onClose();
                  }}
                >
                  <Text style={styles.gradeText}>{g.grade}</Text>
                  <View style={[styles.gradeIndicator, { backgroundColor: getGradeColor(g.numeric) }]} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  closeButton: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
  columns: {
    flexDirection: 'row',
    height: 300,
  },
  bandColumn: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  bandItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  bandItemSelected: {
    backgroundColor: colors.surfaceLight,
  },
  bandText: {
    color: colors.textSecondary,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  bandTextSelected: {
    color: colors.primary,
  },
  gradeColumn: {
    flex: 1,
  },
  gradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderLeftWidth: 4,
  },
  gradeText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  gradeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
