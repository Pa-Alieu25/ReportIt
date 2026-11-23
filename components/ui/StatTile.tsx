import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';

type StatTileProps = { label: string; value: number; color: string };

// Number + label tile for the 2x2 stat grids on Home and Admin. The label
// sits beside the number and wraps rather than truncating at large text sizes.
export function StatTile({ label, value, color }: StatTileProps) {
  return (
    <Card padding={12} className="flex-1 flex-row items-center" accessibilityLabel={`${label}: ${value}`}>
      <Text variant="h1" style={{ color }}>
        {value}
      </Text>
      <Text variant="label" color="secondary" className="ml-3 flex-1">
        {label}
      </Text>
    </Card>
  );
}
