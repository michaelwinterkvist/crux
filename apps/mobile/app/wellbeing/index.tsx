import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { todayString } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const metrics = [
  { key: 'sleepQuality', label: 'Sleep Quality', emoji: ['😴', '😪', '😐', '😊', '😁'] },
  { key: 'fatigue', label: 'Fatigue', emoji: ['💪', '🙂', '😐', '😮‍💨', '😵'] },
  { key: 'fingerHealth', label: 'Finger Health', emoji: ['🤕', '😬', '😐', '👌', '💪'] },
  { key: 'skinCondition', label: 'Skin', emoji: ['🩹', '😬', '😐', '👌', '✨'] },
  { key: 'motivation', label: 'Motivation', emoji: ['😞', '😐', '🙂', '😊', '🔥'] },
  { key: 'stress', label: 'Stress', emoji: ['😌', '🙂', '😐', '😰', '🤯'] },
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.dateText}>{date}</Text>

      {metrics.map(({ key, label, emoji }) => (
        <View key={key} style={styles.metricRow}>
          <Text style={styles.metricLabel}>{label}</Text>
          <View style={styles.emojiRow}>
            {emoji.map((e, i) => (
              <Pressable
                key={i}
                style={[styles.emojiButton, values[key] === i + 1 && styles.emojiButtonActive]}
                onPress={() => setMetric(key, i + 1)}
              >
                <Text style={styles.emoji}>{e}</Text>
              </Pressable>
            ))}
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
          {mutation.isPending ? 'Saving...' : 'Save Check-in'}
        </Text>
      </Pressable>
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
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  emojiButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  emoji: {
    fontSize: 24,
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
