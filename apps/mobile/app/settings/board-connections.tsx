import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { api } from '../../lib/api';
import { BOARD_TYPES } from '@crux/shared';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const SUPPORTED_BOARDS = ['kilter'] as const;

interface BoardConnection {
  id: string;
  boardType: string;
  username: string;
  boardUserId: string | null;
  lastSyncAt: string | null;
  syncEnabled: boolean;
}

interface ImportResult {
  sessionsCreated: number;
  ascentsImported: number;
  duplicatesSkipped: number;
}

export default function BoardConnectionsScreen() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [boardType, setBoardType] = useState<string>('kilter');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [syncResult, setSyncResult] = useState<ImportResult | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['board-connections'],
    queryFn: () => api.get<{ data: BoardConnection[] }>('/board-connections'),
  });

  const connections = data?.data ?? [];

  const connectMutation = useMutation({
    mutationFn: (body: { boardType: string; username: string; password: string }) =>
      api.post<{ data: BoardConnection }>('/board-connections', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-connections'] });
      setShowForm(false);
      setUsername('');
      setPassword('');
    },
    onError: (err: any) => {
      Alert.alert('Connection Failed', err.message ?? 'Could not connect to board');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/board-connections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-connections'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) =>
      api.post<{ data: ImportResult }>(`/board-connections/${id}/sync`),
    onSuccess: (result) => {
      setSyncResult(result.data);
      queryClient.invalidateQueries({ queryKey: ['board-connections'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (err: any) => {
      Alert.alert('Sync Failed', err.message ?? 'Could not sync board data');
    },
  });

  function handleConnect() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Enter your board username and password');
      return;
    }
    connectMutation.mutate({ boardType, username: username.trim(), password });
  }

  function handleDelete(connection: BoardConnection) {
    Alert.alert(
      'Disconnect Board',
      `Remove your ${connection.boardType} connection? Imported sessions will remain.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(connection.id),
        },
      ],
    );
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Board Integrations</Text>
      <Text style={styles.subtitle}>
        Connect your spray wall accounts to auto-import climbing history.
      </Text>

      {/* Existing connections */}
      {connections.map((conn) => (
        <View key={conn.id} style={styles.connectionCard}>
          <View style={styles.connectionHeader}>
            <View>
              <Text style={styles.boardName}>
                {conn.boardType.charAt(0).toUpperCase() + conn.boardType.slice(1)} Board
              </Text>
              <Text style={styles.connectionMeta}>
                {conn.username} · Last sync: {formatDate(conn.lastSyncAt)}
              </Text>
            </View>
            <Pressable onPress={() => handleDelete(conn)} style={styles.deleteButton}>
              <Feather name="trash-2" size={16} color={colors.error} />
            </Pressable>
          </View>
          <Pressable
            style={[styles.syncButton, syncMutation.isPending && styles.buttonDisabled]}
            onPress={() => { setSyncResult(null); syncMutation.mutate(conn.id); }}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.syncButtonText}>Sync Now</Text>
            )}
          </Pressable>
        </View>
      ))}

      {/* Sync result */}
      {syncResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Import Complete</Text>
          <Text style={styles.resultText}>
            {syncResult.sessionsCreated} sessions created · {syncResult.ascentsImported} ascents imported
          </Text>
          {syncResult.duplicatesSkipped > 0 && (
            <Text style={styles.resultMeta}>
              {syncResult.duplicatesSkipped} duplicates skipped
            </Text>
          )}
        </View>
      )}

      {/* Add connection form */}
      {!showForm && connections.length < BOARD_TYPES.length && (
        <Pressable
          style={styles.addButton}
          onPress={() => setShowForm(true)}
        >
          <Feather name="plus" size={18} color={colors.primary} />
          <Text style={styles.addButtonText}>Connect Board</Text>
        </Pressable>
      )}

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.label}>Board Type</Text>
          <View style={styles.segmented}>
            {SUPPORTED_BOARDS.map((t) => (
              <Pressable
                key={t}
                style={[styles.segment, boardType === t && styles.segmentActive]}
                onPress={() => setBoardType(t)}
              >
                <Text style={[styles.segmentText, boardType === t && styles.segmentTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Board account username"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Board account password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <View style={styles.formActions}>
            <Pressable style={styles.cancelButton} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.connectButton, connectMutation.isPending && styles.buttonDisabled]}
              onPress={handleConnect}
              disabled={connectMutation.isPending}
            >
              <Text style={styles.connectButtonText}>
                {connectMutation.isPending ? 'Connecting...' : 'Connect'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {isLoading && connections.length === 0 && (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      )}
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
  heading: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  connectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  boardName: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  connectionMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  syncButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  syncButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resultCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resultTitle: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  resultText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  resultMeta: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    backgroundColor: colors.background,
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
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  connectButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
  },
  connectButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
