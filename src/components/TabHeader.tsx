import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { useNavigation }           from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useColors, useSpacing, useTypography } from '../theme';
import type { MainTabParamList }   from '../navigation/types';
import { Icon }                    from './Icon';
import { Avatar }                  from './Avatar';

type Props = Readonly<{
  title: string;
  /** Rendered in place of the title text, e.g. the Home screen's logo. */
  leftElement?: React.ReactNode;
  avatarInitials: string;
  onBellPress?: () => void;
  /** Shows the red unread dot on the bell */
  showBellDot?: boolean;
}>;

/**
 * Top header shared by the tab screens (Shipments, Messages, Profile):
 * a large left title with a notification bell and avatar on the right.
 */
export function TabHeader({ title, leftElement, avatarInitials, onBellPress, showBellDot = true }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);
  // Tab screens are the nearest navigator's children, so this resolves to the
  // tab navigator — same pattern as BottomNavBar.
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  return (
    <View style={[styles.header, { paddingTop: insets.top + sp.xs }]}>
      {leftElement ?? (
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      )}
      <View style={styles.right}>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7} onPress={onBellPress}>
          <Icon name="bell-outline" size={24} color={colors.text.primary} />
          {showBellDot && (
            <View style={[styles.bellDot, { backgroundColor: colors.error.main, borderColor: colors.background.default }]} />
          )}
        </TouchableOpacity>
        
        {
          avatarInitials !== 'none'&&
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Profile')}>
            <Avatar initials={avatarInitials} size={36} />
          </TouchableOpacity>
        }

        {/* <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Profile')}>
          <Avatar initials={avatarInitials} size={36} />
        </TouchableOpacity> */}
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
    // Matches the Dashboard's "GFF Portal" wordmark so all tab headers align.
    title: { fontSize: typo.fontSize.xl, fontWeight: typo.fontWeight.bold },
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
