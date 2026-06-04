import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets }        from 'react-native-safe-area-context';
import { useNavigation }            from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useColors, useTypography } from '../theme';
import { Icon, IconName }           from './Icon';
import type { MainTabParamList }    from '../navigation/types';

// ─── Constants ────────────────────────────────────────────────────────────────

export const BOTTOM_NAV_HEIGHT = 62;   // visual bar height (px)
const        FAB_SIZE          = 56;
const        FAB_OVERLAP       = 10;   // px of FAB that sits inside the bar

// ─── Types ────────────────────────────────────────────────────────────────────

export type BottomNavTab = 'Home' | 'Shipments' | 'Messages' | 'Profile';

type Props = Readonly<{
  activeTab:     BottomNavTab;
  messageBadge?: number;
  onFabPress?:   () => void;
}>;

type TabItemProps = Readonly<{
  label:       string;
  iconDefault: IconName;
  iconFilled:  IconName;
  isActive:    boolean;
  badge?:      number;
  onPress:     () => void;
}>;

type TabNav = BottomTabNavigationProp<MainTabParamList>;

// ─── TabItem ──────────────────────────────────────────────────────────────────

function TabItem({ label, iconDefault, iconFilled, isActive, badge, onPress }: TabItemProps) {
  const colors = useColors();
  const typo   = useTypography();
  const color  = isActive ? colors.primary.main : colors.text.secondary;

  return (
    <TouchableOpacity style={itemStyles.wrap} onPress={onPress} activeOpacity={0.7}>
      <View>
        <Icon name={isActive ? iconFilled : iconDefault} size={24} color={color} />
        {badge != null && badge > 0 && (
          <View style={[itemStyles.badge, { backgroundColor: colors.error.main }]}>
            <Text style={itemStyles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[itemStyles.label, { color, fontSize: typo.fontSize.xs, fontWeight: typo.fontWeight.medium }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const itemStyles = StyleSheet.create({
  wrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 8 },
  badge:     {
    position:          'absolute',
    top:               -4,
    right:             -8,
    minWidth:          16,
    height:            16,
    borderRadius:      8,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  label:     { marginTop: 3 },
});

// ─── BottomNavBar ─────────────────────────────────────────────────────────────

export function BottomNavBar({ activeTab, messageBadge, onFabPress }: Props) {
  const colors     = useColors();
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<TabNav>();

  function handleFabPress() {
    if (onFabPress) {
      onFabPress();
    } else {
      // Navigate to the NewShipping flow in the parent stack navigator.
      // React Navigation traverses up the tree so this works from inside tabs.
      (navigation as any).navigate('NewShippingStep1');
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.paper, borderTopColor: colors.border },
      ]}
    >
      {/* Floating FAB — rises above the bar */}
      <View
        style={[styles.fabWrapper, { bottom: BOTTOM_NAV_HEIGHT - FAB_OVERLAP }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary.main }]}
          onPress={handleFabPress}
          activeOpacity={0.85}
        >
          <Icon name="plus" size={28} color={colors.primary.contrastText} />
        </TouchableOpacity>
      </View>

      {/* Tab row */}
      <View style={[styles.row, { height: BOTTOM_NAV_HEIGHT }]}>
        <TabItem
          label="Home"
          iconDefault="home-outline"
          iconFilled="home"
          isActive={activeTab === 'Home'}
          onPress={() => navigation.navigate('Dashboard')}
        />
        <TabItem
          label="Shipments"
          iconDefault="layers-outline"
          iconFilled="layers"
          isActive={activeTab === 'Shipments'}
          onPress={() => navigation.navigate('Projects')}
        />

        {/* Centre placeholder — same flex width as a tab so FAB is perfectly centred */}
        <View style={styles.fabPlaceholder} />

        <TabItem
          label="Messages"
          iconDefault="chat-outline"
          iconFilled="chat"
          isActive={activeTab === 'Messages'}
          badge={messageBadge}
          onPress={() => navigation.navigate('Messages')}
        />
        <TabItem
          label="Profile"
          iconDefault="account-outline"
          iconFilled="account"
          isActive={activeTab === 'Profile'}
          onPress={() => navigation.navigate('Profile')}
        />
      </View>

      {/* Safe-area fill — matches bar colour so the home-indicator area blends in */}
      <View style={[styles.safeArea, { height: insets.bottom, backgroundColor: colors.background.paper }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position:      'absolute',
    bottom:        0,
    left:          0,
    right:         0,
    borderTopWidth: 1,
  },

  row: {
    flexDirection: 'row',
    alignItems:    'center',
  },

  fabPlaceholder: {
    flex: 1,
  },

  // Full-width overlay used just to centre the FAB horizontally
  fabWrapper: {
    position:       'absolute',
    left:           0,
    right:          0,
    height:         FAB_SIZE,
    alignItems:     'center',
    justifyContent: 'center',
  },

  fab: {
    width:          FAB_SIZE,
    height:         FAB_SIZE,
    borderRadius:   FAB_SIZE / 2,
    alignItems:     'center',
    justifyContent: 'center',
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 6 },
    shadowOpacity:  0.35,
    shadowRadius:   10,
    elevation:      10,
  },

  safeArea: {},
});
