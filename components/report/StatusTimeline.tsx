import type { Timestamp } from 'firebase/firestore';
import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { STATUS_ORDER } from '@/constants/status';
import { formatDateTime } from '@/lib/format';
import { colors, statusColors } from '@/theme';
import type { Status } from '@/types/models';

const STEP_TEXT: Record<Status, string> = {
  Pending: 'Waiting to be reviewed',
  'Under Review': 'The responsible team is looking at it',
  'In Progress': 'Work to fix it has started',
  Resolved: 'The problem has been fixed',
  Rejected: 'This report was closed',
};

type StatusTimelineProps = {
  status: Status;
  createdAt: Timestamp | null | undefined;
  updatedAt: Timestamp | null | undefined;
  /** Reason shown when the report was rejected. */
  rejectionReason?: string | null;
};

// Vertical progress from Pending to Resolved. Rejected is a separate end
// state, not a step. Dates: the first step shows when it was reported, the
// current step when it last changed.
export function StatusTimeline({ status, createdAt, updatedAt, rejectionReason }: StatusTimelineProps) {
  if (status === 'Rejected') {
    const c = statusColors('Rejected');
    return (
      <View className="flex-row items-start rounded-lg p-4" style={{ backgroundColor: c.bg }}>
        <Icon name="circle-x" size={22} color={c.fg} />
        <View className="ml-3 flex-1">
          <Text weight="semibold" style={{ color: c.fg }}>
            Closed without action · {formatDateTime(updatedAt)}
          </Text>
          <Text variant="label" weight="regular" color="secondary" className="mt-1">
            {rejectionReason?.trim() || 'No reason was given.'}
          </Text>
        </View>
      </View>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <View accessibilityLabel={`Progress: ${status}. Step ${currentIndex + 1} of ${STATUS_ORDER.length}.`}>
      {STATUS_ORDER.map((stage, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        const reached = done || current;
        const isLast = index === STATUS_ORDER.length - 1;
        const dotColor = current ? statusColors(stage).solid : done ? colors.brand.teal600 : colors.border.default;
        const date = index === 0 ? createdAt : current ? updatedAt : null;

        return (
          <View key={stage} className="flex-row">
            <View className="items-center" style={{ width: 28 }}>
              <View
                className="items-center justify-center rounded-full"
                style={{ width: 22, height: 22, backgroundColor: dotColor }}>
                {done ? <Icon name="check" size={14} color={colors.text.inverse} strokeWidth={3} /> : null}
                {current ? (
                  <View className="rounded-full" style={{ width: 8, height: 8, backgroundColor: colors.surface.card }} />
                ) : null}
              </View>
              {!isLast ? (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 28,
                    backgroundColor: done ? colors.brand.teal600 : colors.border.default,
                  }}
                />
              ) : null}
            </View>
            <View className="ml-3 flex-1 pb-5">
              <Text weight={current ? 'semibold' : 'medium'} color={reached ? 'primary' : 'muted'}>
                {stage}
              </Text>
              <Text variant="caption" color="muted">
                {STEP_TEXT[stage]}
                {date && reached ? ` · ${formatDateTime(date)}` : ''}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
