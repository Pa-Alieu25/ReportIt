import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { InlineMessage } from '@/components/ui/InlineMessage';
import { TextArea } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { ALL_STATUSES } from '@/constants/status';
import { deleteReport, updateReportStatus } from '@/lib/reports';
import { colors } from '@/theme';
import type { Report, Status } from '@/types/models';

function friendlyError(err: unknown, action: 'save' | 'delete'): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === 'permission-denied') {
    return action === 'save'
      ? "You don't have permission to change this report."
      : "You don't have permission to delete this report.";
  }
  return action === 'save'
    ? "Couldn't save the changes. Check your connection and try again."
    : "Couldn't delete this report. Check your connection and try again.";
}

// Admin-only panel on the report detail screen. The draft is seeded once
// from the report and not overwritten by live updates while editing.
export function AdminControls({ report }: { report: Report }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(report.status);
  const [notes, setNotes] = useState(report.adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = status !== report.status || notes.trim() !== (report.adminNotes ?? '').trim();

  const save = async () => {
    setError(null);
    if (status === 'Rejected' && !notes.trim()) {
      setError('Add a short reason for the reporter before closing this report.');
      return;
    }
    setSaving(true);
    try {
      await updateReportStatus(report.id, status, notes.trim() ? notes.trim() : null);
      toast.show('Report updated. The reporter will be notified.');
    } catch (err) {
      console.error('Failed to update report:', err);
      setError(friendlyError(err, 'save'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete this report?', 'It will be removed for everyone. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setError(null);
          setDeleting(true);
          try {
            await deleteReport(report.id);
            toast.show('Report deleted.');
            router.back();
          } catch (err) {
            console.error('Failed to delete report:', err);
            setError(friendlyError(err, 'delete'));
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Card style={{ borderColor: colors.brand.teal100 }}>
      <View className="mb-3 flex-row items-center">
        <Icon name="admin" size={20} color={colors.brand.teal600} />
        <Text variant="h3" className="ml-2">
          Update this report
        </Text>
      </View>

      <Text variant="label" color="secondary" className="mb-2">
        Status
      </Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {ALL_STATUSES.map((option) => (
          <Chip key={option} label={option} selected={status === option} onPress={() => setStatus(option)} />
        ))}
      </View>

      <TextArea
        label={status === 'Rejected' ? 'Reason for closing (shown to the reporter)' : 'Message to the reporter'}
        value={notes}
        onChangeText={setNotes}
        maxLength={2000}
        placeholder="e.g. A team has been scheduled to repair this road next week."
        className="mb-4"
      />

      {error ? <InlineMessage tone="error" message={error} className="mb-3" /> : null}

      <Button label="Save changes" loading={saving} loadingLabel="Saving…" disabled={!dirty} onPress={save} />
      <Button
        label="Delete report"
        icon="delete"
        variant="danger"
        className="mt-3"
        loading={deleting}
        onPress={confirmDelete}
      />
    </Card>
  );
}
