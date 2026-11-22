import type { ReactNode } from 'react';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  /** Safe-area edges to pad. Tab screens pad only the top (the tab bar handles the bottom). */
  edges?: Edge[];
  background?: string;
};

// Standard screen container: brand background + safe areas.
export function Screen({ children, edges = ['top'], background = colors.surface.background }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: background }}>
      {children}
    </SafeAreaView>
  );
}
