import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets }    from 'react-native-safe-area-context';
import { ShipmentDetailProps }  from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }         from '../../components/ScreenHeader';
import { AppButton }            from '../../components/AppButton';
import { Badge }                from '../../components/Badge';
import { DetailGroup }          from '../../components/DetailGroup';
import { Icon }                 from '../../components/Icon';
import { useShipmentDetail }    from '../../hooks/useShipments';
import {
  getShipmentTimeline,
  SHIPMENT_STATUS_TONE,
  TimelineStep,
} from '../../data/shipments';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Falls back to an em dash for empty/missing values. */
function dash(value: string | undefined | null): string {
  return value?.trim() ? value : '—';
}

/** Package totals arrive as decimal strings ("0.00") — show a clean count. */
function formatCount(value: string | undefined): string {
  const n = Number(value);
  return Number.isFinite(n) && value != null ? String(n) : '—';
}

// ─── StatusTimeline ───────────────────────────────────────────────────────────

function TimelineRow({ step, isLast }: Readonly<{ step: TimelineStep; isLast: boolean }>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeTimelineStyles(sp, typo);

  const done    = step.state === 'done';
  const active  = step.state === 'active';
  const muted   = step.state === 'pending';

  const dotColor  = done ? colors.success.main : active ? colors.primary.main : colors.background.elevated;
  const lineColor = done ? colors.success.main : colors.border;

  return (
    <View style={styles.row}>
      {/* Left rail — dot + connector */}
      <View style={styles.rail}>
        <View
          style={[
            styles.dot,
            { backgroundColor: dotColor },
            muted && styles.dotMuted,
            muted && { borderColor: colors.border },
          ]}
        >
          {done && <Icon name="check" size={12} color={colors.white} />}
          {active && <View style={[styles.activeCore, { backgroundColor: colors.white }]} />}
        </View>
        {!isLast && <View style={[styles.connector, { backgroundColor: lineColor }]} />}
      </View>

      {/* Text */}
      <View style={styles.text}>
        <Text style={[styles.label, { color: muted ? colors.text.secondary : colors.text.primary }]}>
          {step.label}
        </Text>
        <Text style={[styles.meta, { color: colors.text.secondary }]}>{step.meta}</Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function ShipmentDetailScreen({ navigation, route }: Readonly<ShipmentDetailProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  const { id, ref } = route.params;
  const { data: shipment, isLoading, isError, refetch } = useShipmentDetail(id);

  // Loading / error states — header keeps the SI number from the list params.
  if (isLoading || isError || !shipment) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background.default }]}>
        <ScreenHeader title={ref ?? ''} titleAlign="left" onBack={() => navigation.goBack()} />
        <View style={styles.state}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary.main} />
          ) : (
            <>
              <Text style={[styles.stateText, { color: colors.text.secondary }]}>
                Couldn't load this shipment.
              </Text>
              <AppButton title="Retry" variant="outline" onPress={() => refetch()} style={styles.retryBtn} />
            </>
          )}
        </View>
      </View>
    );
  }

  const timeline = getShipmentTimeline(shipment.status);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <ScreenHeader
        title={shipment.ref}
        subtitle={shipment.destination}
        titleAlign="left"
        onBack={() => navigation.goBack()}
        rightElement={<Badge label={shipment.status} tone={SHIPMENT_STATUS_TONE[shipment.status]} />}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Action-needed alert */}
        {!!shipment.actionNeeded && (
          <View style={[styles.alert, { backgroundColor: `${colors.error.main}1A`, borderColor: `${colors.error.main}55` }]}>
            <Icon name="alert-outline" size={18} color={colors.error.main} />
            <Text style={[styles.alertText, { color: colors.error.light }]}>{shipment.actionNeeded}</Text>
          </View>
        )}

        {/* Status timeline */}
        <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
          <Text style={[styles.cardHeading, { color: colors.text.secondary }]}>STATUS</Text>
          {timeline.map((step, i) => (
            <TimelineRow key={step.label} step={step} isLast={i === timeline.length - 1} />
          ))}
        </View>

        {/* Summary */}
        <DetailGroup
          heading="SUMMARY"
          dividers={false}
          rows={[
            { label: 'Origin',         value: dash(shipment.origin ?? shipment.destination) },
            { label: 'Transport mode', value: dash(shipment.transportMode) },
            { label: 'Booking',        value: dash(shipment.booking) },
            { label: 'Cargo',          value: dash(shipment.cargo) },
            { label: 'Packages',       value: formatCount(shipment.totalPackages) },
            { label: 'Total weight',   value: shipment.totalWeightKg ? `${shipment.totalWeightKg} kg` : '—' },
            { label: 'Total value',    value: shipment.totalValueCad ? `CAD ${shipment.totalValueCad}` : '—' },
          ]}
        />

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            title="Messages"
            variant="outline"
            onPress={() => navigation.navigate('MessageThread', { ref: shipment.ref, subtitle: shipment.destination })}
            icon={<Icon name="chat-outline" size={18} color={colors.text.primary} />}
            style={styles.actionBtn}
          />
          <AppButton
            title="Documents"
            variant="outline"
            onPress={() => {}}
            icon={<Icon name="file-document-outline" size={18} color={colors.text.primary} />}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeTimelineStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  const DOT = 22;
  return StyleSheet.create({
    row:  { flexDirection: 'row', gap: sp.sm },
    rail: { width: DOT, alignItems: 'center' },
    dot: {
      width:          DOT,
      height:         DOT,
      borderRadius:   DOT / 2,
      alignItems:     'center',
      justifyContent: 'center',
    },
    dotMuted:   { borderWidth: 1 },
    activeCore: { width: 8, height: 8, borderRadius: 4 },
    connector:  { width: 2, flex: 1, minHeight: sp.md, marginVertical: sp.xxxs },

    text:  { flex: 1, paddingBottom: sp.md },
    label: { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.semiBold },
    meta:  { fontSize: typo.fontSize.sm, marginTop: sp.hairline },
  });
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },

    state:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: sp.md, padding: sp.xl },
    stateText: { fontSize: typo.fontSize.base },
    retryBtn:  { minWidth: 140 },

    alert: {
      flexDirection: 'row',
      alignItems:    'flex-start',
      gap:           sp.xs,
      borderWidth:   1,
      borderRadius:  typo.borderRadius.md,
      padding:       sp.sm,
      marginBottom:  sp.md,
    },
    alertText: { flex: 1, fontSize: typo.fontSize.sm, lineHeight: typo.lineHeight.normal },

    card: {
      borderWidth:  1,
      borderRadius: typo.borderRadius.lg,
      padding:      sp.md,
      marginBottom: sp.md,
    },
    cardHeading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
      marginBottom:  sp.md,
    },

    actions:   { flexDirection: 'row', gap: sp.sm },
    actionBtn: { flex: 1 },
  });
}
