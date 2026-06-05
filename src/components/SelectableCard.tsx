import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon, IconName } from './Icon';

type Props = Readonly<{
  /** Leading glyph shown in a tinted square */
  icon: IconName;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}>;

/**
 * A single-select card with a leading icon, title/subtitle and a trailing
 * radio control. Selecting highlights the card with the brand colour.
 * Used for the "What are you shipping?" cargo-type list (and reusable
 * anywhere a radio-card list is needed).
 */
export function SelectableCard({ icon, title, subtitle, selected, onPress }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.background.paper,
          borderColor:     selected ? colors.primary.main : colors.border,
        },
        selected && styles.cardSelected,
        selected && { shadowColor: colors.primary.main },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Icon tile */}
      <View style={[styles.iconTile, { backgroundColor: colors.background.elevated }]}>
        <Icon name={icon} size={20} color={selected ? colors.primary.light : colors.text.secondary} />
      </View>

      {/* Title + subtitle */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        {!!subtitle && (
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
        )}
      </View>

      {/* Radio */}
      {selected ? (
        <Icon name="check-circle" size={24} color={colors.primary.main} />
      ) : (
        <Icon name="circle-outline" size={24} color={colors.text.disabled} />
      )}
    </TouchableOpacity>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           sp.sm,
      borderWidth:   1,
      borderRadius:  typo.borderRadius.lg,
      padding:       sp.md,
      marginBottom:  sp.sm,
    },
    cardSelected: {
      shadowOffset:  { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius:  8,
      elevation:     4,
    },
    iconTile: {
      width:          44,
      height:         44,
      borderRadius:   typo.borderRadius.md,
      alignItems:     'center',
      justifyContent: 'center',
    },
    body: { flex: 1 },
    title: {
      fontSize:   typo.fontSize.lg,
      fontWeight: typo.fontWeight.semiBold,
    },
    subtitle: {
      fontSize:   typo.fontSize.sm,
      marginTop:  2,
    },
  });
}
