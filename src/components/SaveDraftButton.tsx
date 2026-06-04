import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';

type Props = Readonly<{
  onPress?: () => void;
  label?: string;
}>;

/**
 * Small outlined pill button used in the right slot of ScreenHeader
 * (e.g. "Save draft" across the New shipping instruction flow).
 */
export function SaveDraftButton({ onPress, label = 'Save draft' }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  return (
    <TouchableOpacity
      style={[styles.btn, { borderColor: colors.border, backgroundColor: colors.background.elevated }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    btn: {
      borderWidth:       1,
      borderRadius:      typo.borderRadius.sm,
      paddingHorizontal: sp.sm,
      paddingVertical:   sp.xs - 2,
    },
    label: {
      fontSize:   typo.fontSize.sm,
      fontWeight: typo.fontWeight.medium,
    },
  });
}
