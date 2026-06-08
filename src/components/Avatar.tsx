import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors, useTypography } from '../theme';

type Props = Readonly<{
  /** Initials shown inside the circle, e.g. "AE" */
  initials: string;
  /** Diameter in px (defaults to 40) */
  size?: number;
  /** Circle background — defaults to the brand colour */
  color?: string;
}>;

/**
 * Circular initials avatar used in headers and conversation rows.
 * Text scales with the circle size.
 */
export function Avatar({ initials, size = 40, color }: Props) {
  const colors = useColors();
  const typo   = useTypography();

  return (
    <View
      style={[
        styles.circle,
        {
          width:           size,
          height:          size,
          borderRadius:    size / 2,
          backgroundColor: color ?? colors.primary.main,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.primary.contrastText, fontSize: size * 0.4, fontWeight: typo.fontWeight.bold }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text:   {},
});
