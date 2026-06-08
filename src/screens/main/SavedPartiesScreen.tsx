import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { SavedPartiesProps }       from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }            from '../../components/ScreenHeader';
import { AppButton }               from '../../components/AppButton';
import { Avatar }                  from '../../components/Avatar';
import { Badge, BadgeTone }        from '../../components/Badge';
import { FilterChips }             from '../../components/FilterChips';
import { WizardFooter }            from '../../components/WizardFooter';
import { Icon }                    from '../../components/Icon';

// ─── Mock data ────────────────────────────────────────────────────────────────

type PartyType = 'Shipper' | 'Consignee' | 'Notify';
type Party = {
  id:       string;
  initials: string;
  name:     string;
  type:     PartyType;
  location: string;
  taxId:    string;
};

const TYPE_TONE: Record<PartyType, BadgeTone> = {
  Shipper:   'primary',
  Consignee: 'info',
  Notify:    'warning',
};

const PARTIES: Party[] = [
  { id: '1', initials: 'AE', name: 'Acme Exports Inc.',  type: 'Shipper',   location: 'Toronto, ON · Canada',   taxId: 'CA-872 445 109' },
  { id: '2', initials: 'KM', name: 'Kingston Motors Ltd.', type: 'Consignee', location: 'Kingston · Jamaica',     taxId: 'JM-104 552 800' },
  { id: '3', initials: 'FL', name: 'Freight Logistics JA', type: 'Notify',    location: 'Kingston · Jamaica',     taxId: '—' },
  { id: '4', initials: 'WC', name: 'West Coast Shippers', type: 'Shipper',   location: 'Vancouver, BC · Canada', taxId: 'CA-553 901 220' },
  { id: '5', initials: 'LA', name: 'Lagos Auto Imports',  type: 'Consignee', location: 'Lagos · Nigeria',        taxId: 'NG-77 003 188' },
];

const FILTERS = ['All', 'Shipper', 'Consignee', 'Notify'];

// ─── PartyCard ────────────────────────────────────────────────────────────────

function PartyCard({ data }: Readonly<{ data: Party }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeCardStyles(sp, typo);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}
      activeOpacity={0.75}
    >
      <Avatar initials={data.initials} size={44} color={colors.background.elevated} />

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>{data.name}</Text>
          <Badge label={data.type} tone={TYPE_TONE[data.type]} />
        </View>

        <View style={styles.metaRow}>
          <Icon name="map-marker-outline" size={13} color={colors.text.secondary} />
          <Text style={[styles.meta, { color: colors.text.secondary }]} numberOfLines={1}>{data.location}</Text>
        </View>
        <Text style={[styles.tax, { color: colors.text.secondary }]}>Tax ID · {data.taxId}</Text>
      </View>

      <Icon name="chevron-right" size={22} color={colors.text.secondary} />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function SavedPartiesScreen({ navigation }: Readonly<SavedPartiesProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp);

  const [filter, setFilter] = useState('All');

  const visible = filter === 'All' ? PARTIES : PARTIES.filter(p => p.type === filter);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <ScreenHeader
        title="Saved parties"
        subtitle={`${PARTIES.length} saved`}
        titleAlign="left"
        onBack={() => navigation.goBack()}
      />

      <FilterChips options={FILTERS} value={filter} onChange={setFilter} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {visible.map(p => (
          <PartyCard key={p.id} data={p} />
        ))}
      </ScrollView>

      <WizardFooter>
        <AppButton
          title="Add new party"
          onPress={() => {}}
          icon={<Icon name="plus" size={20} color={colors.primary.contrastText} />}
          style={styles.fullBtn}
        />
      </WizardFooter>
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
      gap:           sp.sm,
      borderWidth:   1,
      borderRadius:  typo.borderRadius.lg,
      padding:       sp.sm,
      marginBottom:  sp.sm,
    },
    body:    { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: sp.xs, marginBottom: sp.xxxs },
    name:    { flexShrink: 1, fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.bold },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: sp.xxs, marginBottom: sp.xxxs },
    meta:    { flex: 1, fontSize: typo.fontSize.sm },
    tax:     { fontSize: typo.fontSize.sm },
  });
}

function makeStyles(sp: ReturnType<typeof useSpacing>) {
  return StyleSheet.create({
    root:    { flex: 1 },
    scroll:  { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.sm },
    fullBtn: { flex: 1 },
  });
}
