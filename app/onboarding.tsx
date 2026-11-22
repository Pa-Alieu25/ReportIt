import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Logo, LogoMark } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { setOnboardingComplete } from '@/lib/onboarding';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { colors, radius, shadows } from '@/theme';

type Slide = {
  step: string;
  title: string;
  body: string;
  illustration: 'see' | 'report' | 'fix';
};

const SLIDES: Slide[] = [
  {
    step: 'See it.',
    title: 'Spot a problem in your community',
    body: "Potholes, rubbish that hasn't been collected, broken streetlights, flooding or a burst pipe. If it needs fixing, it matters.",
    illustration: 'see',
  },
  {
    step: 'Report it.',
    title: 'Report it in under a minute',
    body: 'Take a photo and add your location. ReportIT sends it to the council or authority responsible.',
    illustration: 'report',
  },
  {
    step: 'Fix it.',
    title: "Follow it until it's fixed",
    body: "See every step, from received to resolved, and get a notification when something changes.",
    illustration: 'fix',
  },
];

function Bubble({ icon, tint, style }: { icon: IconName; tint: string; style: object }) {
  return (
    <View
      className="absolute items-center justify-center"
      style={[
        {
          width: 52,
          height: 52,
          borderRadius: radius.lg,
          backgroundColor: colors.surface.card,
          ...shadows.raised,
        },
        style,
      ]}>
      <Icon name={icon} size={26} color={tint} />
    </View>
  );
}

// Simple, lightweight illustrations made from brand shapes and icons:
// no image downloads, crisp at any size.
function Illustration({ kind }: { kind: Slide['illustration'] }) {
  const centre =
    kind === 'see' ? (
      <Icon name="camera" size={56} color={colors.text.inverse} />
    ) : kind === 'report' ? (
      <LogoMark size={88} />
    ) : (
      <Icon name="success" size={60} color={colors.text.inverse} />
    );

  return (
    <View className="items-center justify-center" style={{ height: 260 }} accessible={false}>
      <View
        className="absolute rounded-full"
        style={{ width: 240, height: 240, backgroundColor: colors.brand.teal600, opacity: 0.18 }}
      />
      <View
        className="absolute rounded-full"
        style={{ width: 170, height: 170, backgroundColor: colors.brand.teal600, opacity: 0.3 }}
      />
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 120,
          height: 120,
          backgroundColor: kind === 'fix' ? colors.status.Resolved.solid : colors.brand.teal600,
        }}>
        {centre}
      </View>

      {kind === 'see' ? (
        <>
          <Bubble icon="road" tint="#0B5F53" style={{ left: 24, top: 36 }} />
          <Bubble icon="waste" tint={colors.brand.teal600} style={{ right: 22, top: 58 }} />
          <Bubble icon="light" tint="#B45309" style={{ left: 44, bottom: 24 }} />
          <Bubble icon="flood" tint="#1E5AA8" style={{ right: 40, bottom: 18 }} />
        </>
      ) : kind === 'report' ? (
        <>
          <Bubble icon="photo" tint={colors.brand.teal600} style={{ left: 30, top: 50 }} />
          <Bubble icon="pin" tint={colors.feedback.error.fg} style={{ right: 30, top: 40 }} />
          <Bubble icon="council" tint={colors.brand.green800} style={{ right: 48, bottom: 20 }} />
        </>
      ) : (
        <>
          <Bubble icon="clock" tint={colors.status.Pending.fg} style={{ left: 28, top: 44 }} />
          <Bubble icon="in-progress" tint={colors.status['In Progress'].fg} style={{ right: 26, top: 64 }} />
          <Bubble icon="bell" tint={colors.brand.teal600} style={{ left: 52, bottom: 18 }} />
        </>
      )}
    </View>
  );
}

export default function OnboardingScreen() {
  const setCompleted = useOnboardingStore((state) => state.setCompleted);
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const handleFinish = () => {
    // Flip the store immediately for a snappy transition; Stack.Protected in
    // the root layout routes to sign-in. Persisting doesn't need to block it.
    setCompleted(true);
    void setOnboardingComplete();
  };

  const goTo = (next: number) => {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <Screen edges={['top', 'bottom']} background={colors.brand.green900}>
      <StatusBar style="light" />

      <View className="flex-row items-center justify-between px-5 pt-2" style={{ minHeight: 52 }}>
        <Logo tone="dark" size={30} />
        {!isLast ? (
          <Pressable
            onPress={handleFinish}
            accessibilityRole="button"
            accessibilityLabel="Skip introduction"
            hitSlop={8}
            className="items-center justify-center px-3"
            style={{ minHeight: 44 }}>
            <Text variant="label" weight="semibold" color="inverseMuted">
              Skip
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        className="flex-1">
        {SLIDES.map((slide, i) => (
          <ScrollView
            key={slide.step}
            style={{ width }}
            contentContainerClassName="flex-grow justify-center px-7 py-4"
            accessibilityLabel={`Step ${i + 1} of ${SLIDES.length}`}>
            <Illustration kind={slide.illustration} />
            <Text variant="h2" weight="bold" className="mt-6" style={{ color: colors.brand.teal300 }}>
              {slide.step}
            </Text>
            <Text variant="display" color="inverse" className="mt-1" accessibilityRole="header">
              {slide.title}
            </Text>
            <Text color="inverseMuted" className="mt-3">
              {slide.body}
            </Text>
          </ScrollView>
        ))}
      </ScrollView>

      <View className="px-7 pb-4">
        <View className="mb-5 flex-row items-center justify-center gap-2" accessible={false}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.step}
              className="h-2 rounded-full"
              style={{
                width: i === index ? 24 : 8,
                backgroundColor: i === index ? colors.brand.teal300 : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </View>

        <Button
          label={isLast ? 'Get started' : 'Next'}
          size="lg"
          haptic={isLast}
          onPress={isLast ? handleFinish : () => goTo(index + 1)}
        />
        <Text variant="caption" align="center" color="inverseMuted" className="mt-4">
          Your Community. Your Voice.
        </Text>
      </View>
    </Screen>
  );
}
