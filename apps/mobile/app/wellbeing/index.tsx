import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { todayString } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const metrics = [
  { key: 'sleepQuality', label: 'Sleep Quality', scale: ['Poor', 'Low', 'Fair', 'Good', 'Great'] },
  { key: 'fatigue', label: 'Fatigue', scale: ['None', 'Low', 'Moderate', 'High', 'Severe'] },
  { key: 'fingerHealth', label: 'Finger Health', scale: ['Injured', 'Sore', 'Fair', 'Good', 'Strong'] },
  { key: 'skinCondition', label: 'Skin', scale: ['Raw', 'Tender', 'Fair', 'Good', 'Fresh'] },
  { key: 'motivation', label: 'Motivation', scale: ['Low', 'Below avg', 'Neutral', 'Good', 'High'] },
  { key: 'stress', label: 'Stress', scale: ['None', 'Low', 'Moderate', 'High', 'Severe'] },
] as const;

export default function WellbeingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [date] = useState(todayString());
  const [values, setValues] = useState<Record<string, number>>({});
  const [sleepHours, setSleepHours] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [notes, setNotes] = useState('');

  const mutation = useMutation({
    mutationFn: (body: any) => api.post('/wellbeing', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellbeing'] });
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message ?? 'Failed to save');
    },
  });

  function setMetric(key: string, value: number) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    mutation.mutate({
      date,
      ...values,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      bodyWeight: bodyWeight ? parseFloat(bodyWeight) : undefined,
      notes: notes || undefined,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.dateText}>{date}</Text>

      {metrics.map(({ key, label, scale }) => (
        <View key={key} style={styles.metricRow}>
          <Text style={styles.metricLabel}>{label}</Text>
          <View style={styles.scaleRow}>
            {scale.map((text, i) => {
              const value = i + 1;
              const isActive = values[key] === value;
              return (
                <Pressable
                  key={i}
                  style={[styles.scaleButton, isActive && styles.scaleButtonActive]}
                  onPress={() => setMetric(key, value)}
                >
                  <Text style={[styles.scaleNumber, isActive && styles.scaleNumberActive]}>
                    {value}
                  </Text>
                  <Text style={[styles.scaleLabel, isActive && styles.scaleLabelActive]}>
                    {text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Sleep (hours)</Text>
          <TextInput
            style={styles.input}
            value={sleepHours}
            onChangeText={setSleepHours}
            keyboardType="decimal-pad"
            placeholder="7.5"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={bodyWeight}
            onChangeText={setBodyWeight}
            keyboardType="decimal-pad"
            placeholder="70"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <Text style={styles.inputLabel}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="How are you feeling?"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
      />

      <Pressable
        style={[styles.saveButton, mutation.isPending && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={mutation.isPending}
      >
        <Text style={styles.saveButtonText}>
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Text>
      </Pressable>
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
  dateText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  metricRow: {
    marginBottom: spacing.md,
  },
  metricLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  scaleButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scaleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  scaleNumber: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  scaleNumberActive: {
    color: colors.text,
  },
  scaleLabel: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  scaleLabelActive: {
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
