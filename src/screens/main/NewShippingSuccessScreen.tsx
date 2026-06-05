import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { NewShippingSuccessProps }    from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { AppButton }                  from '../../components/AppButton';
import { WizardFooter }               from '../../components/WizardFooter';
import { Icon }                       from '../../components/Icon';

// ─── Constants ────────────────────────────────────────────────────────────────

const SUMMARY: { label: string; value: string }[] = [
  { label: 'Destination', value: 'Kingston, Jamaica' },
  { label: 'Booking',     value: 'MSC1234567' },
  { label: 'Carrier',     value: 'MSC Mediterranean' },
  { label: 'Container',   value: 'MSCU 123 456 7' },
  { label: 'Shipper',     value: 'Acme Exports Inc.' },
  { label: 'Consignee',   value: 'Kingston Motors Ltd.' },
  { label: 'Cargo',       value: 'Used auto × 2' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingSuccessScreen({ navigation }: Readonly<NewShippingSuccessProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const styles = makeStyles(sp, typo);

  function goToShipments() {
    navigation.popToTop();
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Minimal top bar — left-aligned title, no back action */}
      <View style={[styles.topBar, { paddingTop: insets.top + sp.sm, backgroundColor: colors.background.paper, borderBottomColor: colors.border }]}>
        <Text style={[styles.topTitle, { color: colors.text.primary }]}>Shipping instruction</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon */}
        <View style={styles.iconWrap}>
          <View style={[styles.iconHalo, { backgroundColor: colors.background.elevated, borderColor: colors.success.main }]}>
            <Icon name="check-circle" size={48} color={colors.success.main} />
          </View>
        </View>

        {/* Heading + subtitle */}
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Shipping instruction submitted
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Your SI has been sent to the GFF documentation team. You'll be notified when it's reviewed.
        </Text>

        {/* Reference pill */}
        <View style={[styles.refPill, { backgroundColor: colors.background.elevated }]}>
          <Text style={[styles.refLabel, { color: colors.text.secondary }]}>Reference </Text>
          <Text style={[styles.refValue, { color: colors.text.link }]}>#GFF-2050</Text>
        </View>

        {/* Summary card */}
        <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <Text style={[styles.cardHeading, { color: colors.text.secondary }]}>SUBMITTED SUMMARY</Text>

          {SUMMARY.map(r => (
            <View key={r.label} style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.text.secondary }]}>{r.label}</Text>
              <Text style={[styles.rowValue, { color: colors.text.primary }]}>{r.value}</Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: colors.success.dark }]}>
              <Text style={[styles.statusText, { color: colors.success.contrastText }]}>Submitted</Text>
            </View>
            <Text style={[styles.statusMeta, { color: colors.text.secondary }]}>
              Just now · awaiting docs review
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom — View shipment + Done */}
      <WizardFooter>
        <AppButton
          title="View shipment"
          variant="outline"
          onPress={goToShipments}
          icon={<Icon name="file-document-outline" size={18} color={colors.text.primary} />}
          style={styles.backBtn}
        />
        <AppButton
          title="Done"
          onPress={goToShipments}
          style={styles.nextBtn}
        />
      </WizardFooter>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBar: {
      paddingHorizontal: sp.headerHorizontal,
      paddingBottom:     sp.sm,
      borderBottomWidth: 1,
    },
    topTitle: {
      fontSize:   typo.fontSize.xl,
      fontWeight: typo.fontWeight.semiBold,
    },

    scroll: {
      paddingHorizontal: sp.screenHorizontal,
      paddingTop:        sp.xl,
      alignItems:        'center',
    },

    iconWrap: { marginBottom: sp.lg },
    iconHalo: {
      width:          88,
      height:         88,
      borderRadius:   44,
      borderWidth:    2,
      alignItems:     'center',
      justifyContent: 'center',
    },

    title: {
      fontSize:     typo.fontSize.xxl,
      fontWeight:   typo.fontWeight.bold,
      textAlign:    'center',
      marginBottom: sp.xs,
    },
    subtitle: {
      fontSize:     typo.fontSize.md,
      lineHeight:   typo.lineHeight.normal,
      textAlign:    'center',
      marginBottom: sp.lg,
    },

    refPill: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: sp.md,
      paddingVertical:   sp.xs,
      borderRadius:      typo.borderRadius.full,
      marginBottom:      sp.xl,
    },
    refLabel: { fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.medium },
    refValue: { fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.bold },

    card: {
      alignSelf:    'stretch',
      borderWidth:  1,
      borderRadius: typo.borderRadius.lg,
      padding:      sp.md,
    },
    cardHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.sm,
    },
    row: { flexDirection: 'row', marginBottom: sp.xs },
    rowLabel: { width: 90, fontSize: typo.fontSize.sm },
    rowValue: { flex: 1, fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold },

    divider: { height: 1, marginVertical: sp.sm },

    statusRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
    statusBadge: {
      paddingHorizontal: sp.sm,
      paddingVertical:   3,
      borderRadius:      typo.borderRadius.full,
    },
    statusText: { fontSize: typo.fontSize.xs, fontWeight: typo.fontWeight.semiBold },
    statusMeta: { fontSize: typo.fontSize.sm },

    backBtn: { flex: 1 },
    nextBtn: { flex: 1 },
  });
}
