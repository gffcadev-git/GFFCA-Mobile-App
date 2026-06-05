import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon, IconName } from './Icon';

type Props = Readonly<{
  /** Banner copy */
  children: string;
  /** Leading icon — defaults to an info glyph */
  icon?: IconName;
  /** Icon tint — defaults to the info colour */
  iconColor?: string;
}>;

/**
 * Subtle outlined banner with a leading icon, used to surface contextual
 * hints across the shipping-instruction flow (Step 1, Cargo · Vehicles, Notify…).
 */
export function InfoBanner({ children, icon = 'information-outline', iconColor }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  return (
    <View style={[styles.banner, { backgroundColor: colors.background.elevated, borderColor: colors.border }]}>
      <Icon name={icon} size={18} color={iconColor ?? colors.info.main} />
      <Text style={[styles.text, { color: colors.text.secondary }]}>{children}</Text>
    </View>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems:    'flex-start',
      gap:           sp.xs,
      borderWidth:   1,
      borderRadius:  typo.borderRadius.md,
      padding:       sp.sm,
      marginBottom:  sp.lg,
    },
    text: {
      flex:       1,
      fontSize:   typo.fontSize.sm,
      lineHeight: typo.lineHeight.normal,
    },
  });
}
