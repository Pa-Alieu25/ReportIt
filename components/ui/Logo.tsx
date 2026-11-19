import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

type LogoMarkProps = {
  size?: number;
  /** Pin colour. White on dark green, brand green on light surfaces. */
  color?: string;
  /** Fill inside the pin, behind the check mark. */
  innerColor?: string;
};

// ReportIT logo mark: a location pin with an orange check mark inside,
// recreated from the poster. 48x48 viewBox.
export function LogoMark({
  size = 48,
  color = colors.text.inverse,
  innerColor = colors.brand.green800,
}: LogoMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessible={false}>
      <Path
        d="M24 3C14.6 3 7 10.4 7 19.6c0 11.8 13.9 23.4 15.7 24.9a2 2 0 0 0 2.6 0C27.1 43 41 31.4 41 19.6 41 10.4 33.4 3 24 3Z"
        fill={color}
      />
      <Circle cx={24} cy={19.5} r={10.5} fill={innerColor} />
      <Path
        d="m18.8 19.8 3.6 3.6 7-7.4"
        stroke={colors.brand.orange500}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

type LogoProps = {
  /** 'light' for light surfaces, 'dark' for dark green surfaces. */
  tone?: 'light' | 'dark';
  size?: number;
};

// Mark + "ReportIT" wordmark, with "IT" in teal as on the poster.
export function Logo({ tone = 'light', size = 32 }: LogoProps) {
  const onDark = tone === 'dark';
  return (
    <View
      className="flex-row items-center"
      accessible
      accessibilityRole="image"
      accessibilityLabel="ReportIT">
      <View
        className="items-center justify-center rounded-md"
        style={{
          width: size,
          height: size,
          backgroundColor: colors.brand.teal600,
        }}>
        <LogoMark size={size * 0.78} innerColor={colors.brand.teal600} />
      </View>
      <Text
        variant="h2"
        color={onDark ? 'inverse' : 'primary'}
        weight="semibold"
        className="ml-2"
        style={{ fontSize: size * 0.62, lineHeight: size * 0.85 }}>
        Report
        <Text
          variant="h2"
          weight="semibold"
          style={{
            fontSize: size * 0.62,
            lineHeight: size * 0.85,
            color: onDark ? colors.brand.teal300 : colors.brand.teal600,
          }}>
          IT
        </Text>
      </Text>
    </View>
  );
}
