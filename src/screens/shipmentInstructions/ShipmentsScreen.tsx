import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets }              from 'react-native-safe-area-context';
import { useNavigation }                  from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors, useSpacing, useTypography } from '../../theme';
import type { MainStackParamList }        from '../../navigation/types';
import { TabHeader }                      from '../../components/TabHeader';
import { FilterChips }                    from '../../components/FilterChips';
import { Badge }                          from '../../components/Badge';
import { Icon }                           from '../../components/Icon';
import { AppButton }                      from '../../components/AppButton';
import { BottomNavBar, BOTTOM_NAV_HEIGHT } from '../../components/BottomNavBar';
import { SHIPMENT_STATUS_TONE, Shipment } from '../../data/shipments';
import { useShipments } from '../../hooks/useShipments';

// ─── Filters ──────────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Action needed', 'Under review', 'Submitted', 'Draft'];

function matchesFilter(s: Shipment, filter: string): boolean {
  switch (filter) {
    case 'Action needed': return s.status === 'Pending you';
    case 'Under review':  return s.status === 'Under review';
    case 'Submitted':     return s.status === 'Submitted';
    case 'Draft':         return s.status === 'Draft';
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
  const typo       = useTypography();
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const styles     = makeStyles(sp, typo);

  const { data: shipments = [], isLoading, isError, refetch } = useShipments();
  const [filter, setFilter] = useState('All');
  // Show every SI here — including drafts. "All" lists everything; "Draft" isolates them.
  const visible = shipments.filter(s => matchesFilter(s, filter));

  function openShipment(s: Shipment) {
    // Drafts resume in the multi-step SI form; everything else opens its detail.
    if (s.status === 'Draft') {
      navigation.navigate('NewShippingStep1', { id: s.id, ref: s.ref });
      return;
    }
    navigation.navigate('ShipmentDetail', { id: s.id, ref: s.ref });
  }

  function renderBody() {
    if (isLoading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.state}>
          <Text style={[styles.stateText, { color: colors.text.secondary }]}>Couldn't load shipments.</Text>
          <AppButton title="Retry" variant="outline" onPress={() => refetch()} style={styles.retryBtn} />
        </View>
      );
    }
    if (visible.length === 0) {
      return (
        <View style={styles.state}>
          <Text style={[styles.stateText, { color: colors.text.secondary }]}>No shipments to show.</Text>
        </View>
      );
    }
    return visible.map(s => (
      <ShipmentCard key={s.id} data={s} onPress={() => openShipment(s)} />
    ));
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
        {renderBody()}
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

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:      { flex: 1 },
    scroll:    { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.sm },
    state:     { alignItems: 'center', paddingTop: sp.xxl, gap: sp.md },
    stateText: { fontSize: typo.fontSize.base },
    retryBtn:  { minWidth: 140 },
  });
}
