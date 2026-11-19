import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

const TEAL = colors.brand.teal600;
const WHITE = colors.text.inverse;

type LogoMarkProps = {
  size?: number;
  /** Draw the teal rounded-square app-icon background. */
  withBackground?: boolean;
};

// ReportIT logo mark, traced from assets/icon.png (1024 grid): a white ring
// opened at the bottom by a teal location pin, with an orange check mark in
// a white circle at the pin's head.
export function LogoMark({ size = 48, withBackground = true }: LogoMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024" accessible={false}>
      {withBackground ? <Rect width={1024} height={1024} rx={230} fill={TEAL} /> : null}
      <Circle cx={512} cy={468} r={300} fill={WHITE} />
      <Path
        d="M512 250C401 250 310 338 310 452c0 110 82 222 160 316h82c78-94 160-206 160-316 0-114-91-202-202-202Z"
        fill={TEAL}
      />
      <Path d="M470 768h82l-40 60Z" fill={TEAL} />
      <Circle cx={512} cy={440} r={112} fill={WHITE} />
      <Path
        d="M461 439l34 40 71-82"
        stroke={colors.brand.orange500}
        strokeWidth={36}
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

// App-icon mark + "ReportIT" wordmark, with "IT" in teal as on the poster.
export function Logo({ tone = 'light', size = 32 }: LogoProps) {
  const onDark = tone === 'dark';
  const wordStyle = { fontSize: size * 0.62, lineHeight: size * 0.85 };
  return (
    <View
      className="flex-row items-center"
      accessible
      accessibilityRole="image"
      accessibilityLabel="ReportIT">
      <LogoMark size={size} />
      <Text
        variant="h2"
        color={onDark ? 'inverse' : 'primary'}
        weight="semibold"
        className="ml-2"
        style={wordStyle}>
        Report
        <Text
          variant="h2"
          weight="semibold"
          style={[wordStyle, { color: onDark ? colors.brand.teal300 : colors.brand.teal600 }]}>
          IT
        </Text>
      </Text>
    </View>
  );
}
