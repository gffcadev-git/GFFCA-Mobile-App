import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon } from './Icon';

type Props = Readonly<{
  name: string;
  /** When true shows a green "Used" marker, otherwise a "Use" action */
  used: boolean;
  onSelect: () => void;
}>;

/**
 * A saved party/contact row used in the "SAVED OPTIONS" lists of the
 * Parties and Notify-party steps. Tapping fills the manual form below.
 */
export function SavedOptionRow({ name, used, onSelect }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.background.paper, borderColor: colors.border }]}
      onPress={onSelect}
      activeOpacity={0.75}
    >
      <Icon name="office-building-outline" size={18} color={colors.text.secondary} />
      <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
        {name}
      </Text>
      {used ? (
        <View style={styles.usedRow}>
          <Icon name="check" size={13} color={colors.success.main} />
          <Text style={[styles.usedLabel, { color: colors.success.main }]}>Used</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={onSelect} hitSlop={8}>
          <Text style={[styles.useBtn, { color: colors.text.link }]}>Use</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    row: {
      flexDirection:  'row',
      alignItems:     'center',
      borderWidth:    1,
      borderRadius:   typo.borderRadius.md,
      padding:        sp.sm,
      marginBottom:   sp.xs,
      gap:            sp.xs,
    },
    name:      { flex: 1, fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.semiBold },
    usedRow:   { flexDirection: 'row', alignItems: 'center', gap: sp.xxs },
    usedLabel: { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold },
    useBtn:    { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold },
  });
}
