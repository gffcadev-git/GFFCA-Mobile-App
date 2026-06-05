import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon, IconName } from './Icon';

export type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';

type Props = Readonly<{
  label: string;
  tone?: BadgeTone;
  /** Optional leading glyph (e.g. check / clock) */
  icon?: IconName;
}>;

/**
 * Small rounded status/type pill with a tinted background and coloured text.
 * Used for shipment statuses, party types, verification states, etc.
 */
export function Badge({ label, tone = 'neutral', icon }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  const toneColor: Record<BadgeTone, string> = {
    success: colors.success.main,
    warning: colors.warning.main,
    error:   colors.error.main,
    info:    colors.info.main,
    primary: colors.primary.light,
    neutral: colors.text.secondary,
  };
  const color = toneColor[tone];
  const bg    = tone === 'neutral' ? colors.background.elevated : `${color}26`;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon && <Icon name={icon} size={12} color={color} />}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    badge: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               3,
      alignSelf:         'flex-start',
      paddingHorizontal: sp.xs,
      paddingVertical:   3,
      borderRadius:      typo.borderRadius.full,
    },
    text: { fontSize: typo.fontSize.xs, fontWeight: typo.fontWeight.semiBold },
  });
}
