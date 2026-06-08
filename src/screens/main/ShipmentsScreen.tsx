import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets }              from 'react-native-safe-area-context';
import { useNavigation }                  from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors, useSpacing, useTypography } from '../../theme';
import type { MainStackParamList }        from '../../navigation/types';
import { TabHeader }                      from '../../components/TabHeader';
import { FilterChips }                    from '../../components/FilterChips';
import { Badge }                          from '../../components/Badge';
import { Icon }                           from '../../components/Icon';
import { BottomNavBar, BOTTOM_NAV_HEIGHT } from '../../components/BottomNavBar';
import { SHIPMENTS, SHIPMENT_STATUS_TONE, Shipment } from '../../data/shipments';

// ─── Filters ──────────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Action needed', 'Under review', 'Submitted'];

function matchesFilter(s: Shipment, filter: string): boolean {
  switch (filter) {
    case 'Action needed': return s.status === 'Pending you';
    case 'Under review':  return s.status === 'Under review';
    case 'Submitted':     return s.status === 'Submitted';
    default:              return true;
  }
}

type Nav = NativeStackNavigationProp<MainStackParamList>;

// ─── ShipmentCard ─────────────────────────────────────────────────────────────

function ShipmentCard({ data, onPress }: Readonly<{ data: Shipment; onPress: () => void }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeCardStyles(sp, typo);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.ref, { color: colors.text.link }]}>{data.ref}</Text>
          <Badge label={data.status} tone={SHIPMENT_STATUS_TONE[data.status]} />
          <View style={styles.spacer} />
          <Text style={[styles.date, { color: colors.text.secondary }]}>{data.date}</Text>
        </View>

        <View style={styles.metaRow}>
          <Icon name="map-marker-outline" size={13} color={colors.text.secondary} />
          <Text style={[styles.route, { color: colors.text.secondary }]} numberOfLines={1}>
            {data.destination} · {data.cargoType}
          </Text>
        </View>
      </View>

      <Icon name="chevron-right" size={22} color={colors.text.secondary} />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ShipmentsScreen() {
  const colors     = useColors();
  const sp         = useSpacing();
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const styles     = makeStyles(sp);

  const [filter, setFilter] = useState('All');
  const visible = SHIPMENTS.filter(s => matchesFilter(s, filter));

  function openShipment(s: Shipment) {
    if (s.status === 'Draft') {
      navigation.navigate('DraftShippingInstructions');
    } else {
      navigation.navigate('ShipmentDetail', { ref: s.ref });
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <TabHeader
        title="All shipments"
        avatarInitials="AE"
        onBellPress={() => navigation.navigate('Notifications')}
      />

      <FilterChips options={FILTERS} value={filter} onChange={setFilter} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + sp.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {visible.map(s => (
          <ShipmentCard key={s.id} data={s} onPress={() => openShipment(s)} />
        ))}
      </ScrollView>

      <BottomNavBar activeTab="Shipments" messageBadge={2} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeCardStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           sp.xs,
      borderWidth:   1,
      borderRadius:  typo.borderRadius.lg,
      padding:       sp.md,
      marginBottom:  sp.sm,
    },
    body:    { flex: 1 },
    topRow:  { flexDirection: 'row', alignItems: 'center', gap: sp.xs, marginBottom: sp.xs },
    ref:     { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.bold },
    spacer:  { flex: 1 },
    date:    { fontSize: typo.fontSize.xs },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: sp.xxs },
    route:   { flex: 1, fontSize: typo.fontSize.sm },
  });
}

function makeStyles(sp: ReturnType<typeof useSpacing>) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.sm },
  });
}
