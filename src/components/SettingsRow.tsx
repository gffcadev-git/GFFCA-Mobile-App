import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon, IconName } from './Icon';

type Props = Readonly<{
  icon:   IconName;
  label:  string;
  /** Secondary line under the label */
  sublabel?: string;
  /** Right-aligned value text shown before the chevron */
  value?: string;
  /** Wrap the leading icon in a subtle elevated tile */
  iconTile?: boolean;
  onPress?: () => void;
  /** When provided the row shows a Switch instead of a chevron */
  toggle?: { value: boolean; onValueChange: (v: boolean) => void };
  /** Omit the bottom divider on the last row of a group */
  isLast?: boolean;
}>;

/**
 * A single row inside a grouped settings/profile list: leading icon, a
 * label (with optional sublabel) and a trailing value + chevron (navigation)
 * or Switch (toggle). Rows render a bottom hairline divider unless `isLast`.
 */
export function SettingsRow({
  icon, label, sublabel, value, iconTile, onPress, toggle, isLast,
}: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  const glyph = <Icon name={icon} size={20} color={colors.text.secondary} />;

  const content = (
    <>
      {iconTile ? (
        <View style={[styles.tile, { backgroundColor: colors.background.elevated }]}>{glyph}</View>
      ) : (
        glyph
      )}

      <View style={styles.labelCol}>
        <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
        {!!sublabel && (
          <Text style={[styles.sublabel, { color: colors.text.secondary }]}>{sublabel}</Text>
        )}
      </View>

      {!!value && <Text style={[styles.value, { color: colors.text.secondary }]}>{value}</Text>}

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
    tile: {
      width:          34,
      height:         34,
      borderRadius:   typo.borderRadius.sm,
      alignItems:     'center',
      justifyContent: 'center',
    },
    labelCol: { flex: 1 },
    label:    { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.semiBold },
    sublabel: { fontSize: typo.fontSize.xs, marginTop: sp.hairline },
    value:    { fontSize: typo.fontSize.sm },
  });
}
