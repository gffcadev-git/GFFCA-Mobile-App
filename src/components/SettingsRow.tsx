import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon, IconName } from './Icon';

type Props = Readonly<{
  icon:   IconName;
  label:  string;
  onPress?: () => void;
  /** When provided the row shows a Switch instead of a chevron */
  toggle?: { value: boolean; onValueChange: (v: boolean) => void };
  /** Omit the bottom divider on the last row of a group */
  isLast?: boolean;
}>;

/**
 * A single row inside a grouped settings/profile list: leading icon, label
 * and a trailing chevron (navigation) or Switch (toggle). Rows render a
 * bottom hairline divider unless `isLast`.
 */
export function SettingsRow({ icon, label, onPress, toggle, isLast }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  const content = (
    <>
      <Icon name={icon} size={20} color={colors.text.secondary} />
      <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
      <View style={styles.spacer} />
      {toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onValueChange}
          trackColor={{ false: colors.border, true: colors.primary.main }}
          thumbColor={colors.white}
          ios_backgroundColor={colors.border}
        />
      ) : (
        <Icon name="chevron-right" size={22} color={colors.text.secondary} />
      )}
    </>
  );

  const rowStyle = [
    styles.row,
    !isLast && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  ];

  // Toggle rows aren't pressable themselves — the Switch handles interaction.
  if (toggle) {
    return <View style={rowStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity style={rowStyle} onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    row: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               sp.sm,
      paddingHorizontal: sp.md,
      paddingVertical:   sp.md,
    },
    label:  { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.medium },
    spacer: { flex: 1 },
  });
}
