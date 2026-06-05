import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, useSpacing } from '../theme';

type Props = Readonly<{
  /** Footer buttons — give each an explicit flex via its own style */
  children: React.ReactNode;
}>;

/**
 * Fixed bottom action bar used by every step of the shipping-instruction
 * wizard. Pins to the bottom, lays children out in a row with a gap, and
 * adds safe-area padding so buttons clear the home indicator.
 */
export function WizardFooter({ children }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.footer,
        {
          paddingHorizontal: sp.screenHorizontal,
          paddingTop:        sp.sm,
          paddingBottom:     insets.bottom + sp.sm,
          backgroundColor:   colors.background.default,
          borderTopColor:    colors.border,
        },
      ]}
    >
      <View style={[styles.row, { gap: sp.sm }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position:      'absolute',
    bottom:        0,
    left:          0,
    right:         0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: { flexDirection: 'row' },
});
