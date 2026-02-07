import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { GradePicker } from '../../components/GradePicker';
import { GradeChip } from '../../components/GradeChip';
import { ASCENT_STYLES, ASCENT_RESULTS, type GradeDefinition, type GradeSystem } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const styleLabels: Record<string, string> = {
  flash: 'Flash',
  onsight: 'Onsight',
  redpoint: 'Redpoint',
  repeat: 'Repeat',
  attempt: 'Attempt',
};

export default function NewAscentScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [gradeSystem] = useState<GradeSystem>('font');
  const [selectedGrade, setSelectedGrade] = useState<GradeDefinition | null>(null);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [style, setStyle] = useState<string>('flash');
  const [result, setResult] = useState<string>('send');
  const [attempts, setAttempts] = useState(1);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-set result based on style
  function handleStyleChange(s: string) {
    setStyle(s);
    if (s === 'flash' || s === 'onsight' || s === 'redpoint' || s === 'repeat') {
      setResult('send');
      if (s === 'flash' || s === 'onsight') setAttempts(1);
    } else if (s === 'attempt') {
      setResult('fall');
    }
  }

  const mutation = useMutation({
    mutationFn: (body: any) => api.post(`/sessions/${sessionId}/ascents`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  function handleLog(andAnother: boolean) {
    if (!selectedGrade) {
      Alert.alert('Error', 'Please select a grade');
      return;
    }

    mutation.mutate(
      {
        grade: selectedGrade.grade,
        gradeSystem,
        style,
        result,
        attempts,
        name: name || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          if (andAnother) {
            // Reset form but keep grade for speed
            setName('');
            setNotes('');
            setAttempts(1);
            setStyle('flash');
            setResult('send');
          } else {
            router.back();
          }
        },
        onError: (err: any) => {
          Alert.alert('Error', err.message ?? 'Failed to log ascent');
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Grade */}
      <Text style={styles.label}>Grade</Text>
      <Pressable style={styles.gradeButton} onPress={() => setShowGradePicker(true)}>
        {selectedGrade ? (
          <GradeChip grade={selectedGrade.grade} numeric={selectedGrade.numeric} size="lg" />
        ) : (
          <Text style={styles.gradePlaceholder}>Tap to select grade</Text>
        )}
      </Pressable>

      <GradePicker
        visible={showGradePicker}
        system={gradeSystem}
        initialGrade={selectedGrade?.grade}
        onSelect={setSelectedGrade}
        onClose={() => setShowGradePicker(false)}
      />

      {/* Style */}
      <Text style={styles.label}>Style</Text>
      <View style={styles.styleGrid}>
        {ASCENT_STYLES.map((s) => (
          <Pressable
            key={s}
            style={[styles.styleChip, style === s && styles.styleChipActive]}
            onPress={() => handleStyleChange(s)}
          >
            <Text style={[styles.styleChipText, style === s && styles.styleChipTextActive]}>
              {styleLabels[s] ?? s}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Result */}
      <Text style={styles.label}>Result</Text>
      <View style={styles.segmented}>
        {ASCENT_RESULTS.map((r) => (
          <Pressable
            key={r}
            style={[styles.segment, result === r && styles.segmentActive]}
            onPress={() => setResult(r)}
          >
            <Text style={[styles.segmentText, result === r && styles.segmentTextActive]}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Attempts */}
      <Text style={styles.label}>Attempts</Text>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepperButton}
          onPress={() => setAttempts(Math.max(1, attempts - 1))}
        >
          <Text style={styles.stepperButtonText}>-</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{attempts}</Text>
        <Pressable
          style={styles.stepperButton}
          onPress={() => setAttempts(attempts + 1)}
        >
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>

      {/* Name (optional) */}
      <Text style={styles.label}>Name (optional)</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Route or problem name"
        placeholderTextColor={colors.textMuted}
      />

      {/* Notes */}
      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Beta, conditions, etc."
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={2}
      />

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.logButton, mutation.isPending && styles.buttonDisabled]}
          onPress={() => handleLog(false)}
          disabled={mutation.isPending}
        >
          <Text style={styles.logButtonText}>Log</Text>
        </Pressable>
        <Pressable
          style={[styles.logAnotherButton, mutation.isPending && styles.buttonDisabled]}
          onPress={() => handleLog(true)}
          disabled={mutation.isPending}
        >
          <Text style={styles.logAnotherText}>Log + Another</Text>
        </Pressable>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
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
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  gradeButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradePlaceholder: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  styleChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  styleChipActive: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  styleChipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  styleChipTextActive: {
    color: colors.text,
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: colors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperButton: {
    backgroundColor: colors.surface,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperButtonText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  stepperValue: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  logButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  logButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  logAnotherButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  logAnotherText: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
