import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon }                    from './Icon';
import { Avatar }                  from './Avatar';

type Props = Readonly<{
  title: string;
  avatarInitials: string;
  onBellPress?: () => void;
  /** Shows the red unread dot on the bell */
  showBellDot?: boolean;
}>;

/**
 * Top header shared by the tab screens (Shipments, Messages, Profile):
 * a large left title with a notification bell and avatar on the right.
 */
export function TabHeader({ title, avatarInitials, onBellPress, showBellDot = true }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  return (
    <View style={[styles.header, { paddingTop: insets.top + sp.xs }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      <View style={styles.right}>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7} onPress={onBellPress}>
          <Icon name="bell-outline" size={24} color={colors.text.primary} />
          {showBellDot && (
            <View style={[styles.bellDot, { backgroundColor: colors.error.main, borderColor: colors.background.default }]} />
          )}
        </TouchableOpacity>
        <Avatar initials={avatarInitials} size={36} />
      </View>
    </View>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      paddingHorizontal: sp.screenHorizontal,
      paddingBottom:     sp.sm,
    },
    title: { fontSize: typo.fontSize.xxl, fontWeight: typo.fontWeight.bold },
    right: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
    bellBtn: { padding: sp.xxs },
    bellDot: {
      position:     'absolute',
      top:          4,
      right:        4,
      width:        9,
      height:       9,
      borderRadius: 5,
      borderWidth:  1.5,
    },
  });
}
