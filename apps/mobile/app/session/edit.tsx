import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { SESSION_TYPES } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

export default function EditSessionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => api.get<{ data: any }>(`/sessions/${id}`),
  });

  const session = data?.data;

  const [date, setDate] = useState('');
  const [type, setType] = useState<string>('bouldering');
  const [locationId, setLocationId] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [energyLevel, setEnergyLevel] = useState<number | undefined>();

  useEffect(() => {
    if (session) {
      setDate(session.date);
      setType(session.type);
      setLocationId(session.locationId ?? undefined);
      setNotes(session.notes ?? '');
      setEnergyLevel(session.energyLevel ?? undefined);
    }
  }, [session]);

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.get<{ data: any[] }>('/locations'),
  });

  const locations = locationsData?.data ?? [];

  const mutation = useMutation({
    mutationFn: (body: any) => api.put(`/sessions/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message ?? 'Failed to update session');
    },
  });

  function handleSave() {
    mutation.mutate({
      date,
      type,
      locationId,
      notes: notes || undefined,
      energyLevel,
    });
  }

  if (isLoading || !session) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Date */}
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textMuted}
      />

      {/* Type */}
      <Text style={styles.label}>Type</Text>
      <View style={styles.segmented}>
        {SESSION_TYPES.map((t) => (
          <Pressable
            key={t}
            style={[styles.segment, type === t && styles.segmentActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.segmentText, type === t && styles.segmentTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Location */}
      <Text style={styles.label}>Location</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
        <Pressable
          style={[styles.locationChip, !locationId && styles.locationChipActive]}
          onPress={() => setLocationId(undefined)}
        >
          <Text style={[styles.locationChipText, !locationId && styles.locationChipTextActive]}>
            None
          </Text>
        </Pressable>
        {locations.map((loc: any) => (
          <Pressable
            key={loc.id}
            style={[styles.locationChip, locationId === loc.id && styles.locationChipActive]}
            onPress={() => setLocationId(loc.id)}
          >
            <Text style={[styles.locationChipText, locationId === loc.id && styles.locationChipTextActive]}>
              {loc.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Energy */}
      <Text style={styles.label}>Energy Level</Text>
      <View style={styles.segmented}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            style={[styles.segment, energyLevel === n && styles.segmentActive]}
            onPress={() => setEnergyLevel(n)}
          >
            <Text style={[styles.segmentText, energyLevel === n && styles.segmentTextActive]}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Notes */}
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="How did it go?"
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
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
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
  locationScroll: {
    marginBottom: spacing.sm,
  },
  locationChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationChipActive: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  locationChipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  locationChipTextActive: {
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
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
