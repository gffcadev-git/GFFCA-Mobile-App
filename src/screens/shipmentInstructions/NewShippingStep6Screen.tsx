import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import { NewShippingStep6Props }      from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }               from '../../components/ScreenHeader';
import { AppButton }                  from '../../components/AppButton';
import { StepProgress }               from '../../components/StepProgress';
import { SaveDraftButton }            from '../../components/SaveDraftButton';
import { WizardFooter }               from '../../components/WizardFooter';
import { Icon }                       from '../../components/Icon';
import { useSiDraftStore }            from '../../stores/siDraftStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

/** Falls back to an em dash for empty values in the review. */
const dash = (v: string) => (v.trim() ? v : '—');

// ─── ReviewSection ────────────────────────────────────────────────────────────

type Row = { label: string; value: string };

type SectionProps = {
  heading:  string;
  rows:     Row[];
  onEdit:   () => void;
  /** Optional footer note shown under the rows */
  note?:    { text: string; tone: 'success' | 'error' };
};

function ReviewSection({ heading, rows, onEdit, note }: Readonly<SectionProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeSectionStyles(sp, typo);

  const noteColor = note?.tone === 'error' ? colors.error.main : colors.success.main;

  return (
    <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.text.secondary }]}>{heading}</Text>
        <TouchableOpacity onPress={onEdit} hitSlop={8} style={styles.editBtn}>
          <Icon name="pencil-outline" size={14} color={colors.text.link} />
          <Text style={[styles.editText, { color: colors.text.link }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Rows */}
      {rows.map(r => (
        <View key={r.label} style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.text.secondary }]}>{r.label}</Text>
          <Text style={[styles.rowValue, { color: colors.text.primary }]}>{r.value}</Text>
        </View>
      ))}

      {/* Note */}
      {note && (
        <View style={styles.noteRow}>
          <Icon
            name={note.tone === 'error' ? 'alert-circle-outline' : 'check-circle-outline'}
            size={14}
            color={noteColor}
          />
          <Text style={[styles.noteText, { color: noteColor }]}>{note.text}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingStep6Screen({ navigation }: Readonly<NewShippingStep6Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const form = useSiDraftStore(s => s.form);

  const styles = makeStyles(sp, typo);

  const vehicleCount = form.vehicles.filter(v => v.vin.trim()).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <ScreenHeader
        title={form.ref ?? 'New shipping instruction'}
        subtitle="Review & submit"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={6} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: colors.text.secondary }]}>
          Review every section before submitting. Tap Edit to jump back.
        </Text>

        <ReviewSection
          heading="DESTINATION & BOOKING"
          onEdit={() => navigation.navigate('NewShippingStep1')}
          rows={[
            { label: 'To',        value: dash(form.destination) },
            { label: 'Booking',   value: dash(form.bookingNumber) },
            { label: 'Container', value: `${dash(form.containerNumber)} · Seal: ${dash(form.sealNumber)}` },
          ]}
        />

        <ReviewSection
          heading="PARTIES"
          onEdit={() => navigation.navigate('NewShippingStep3')}
          rows={[
            { label: 'Shipper', value: dash(form.shipperName) },
            { label: 'Notify',  value: dash(form.notifyName) },
          ]}
        />

        <ReviewSection
          heading="CARGO"
          onEdit={() => navigation.navigate('NewShippingStep4')}
          rows={[
            { label: 'Type',     value: dash(form.cargoTypeId) },
            { label: 'Vehicles', value: vehicleCount ? `${vehicleCount} with VIN` : '—' },
          ]}
        />

        <ReviewSection
          heading="DOCUMENTS REQUIRED"
          onEdit={() => navigation.navigate('NewShippingStep4')}
          rows={[
            { label: 'Title',     value: 'Per vehicle · 2 files' },
            { label: 'Invoice',   value: 'Commercial invoice' },
            { label: 'Bill',      value: 'Bill of lading' },
          ]}
        />
      </ScrollView>

      {/* Fixed bottom — Back + Submit */}
      <WizardFooter>
        <AppButton
          title="← Back"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <AppButton
          title="Submit SI"
          onPress={() => navigation.navigate('NewShippingSuccess')}
          icon={<Icon name="send-outline" size={18} color={colors.primary.contrastText} />}
          style={styles.nextBtn}
        />
      </WizardFooter>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeSectionStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    card: {
      borderWidth:  1,
      borderRadius: typo.borderRadius.lg,
      padding:      sp.md,
      marginBottom: sp.md,
    },
    headerRow: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      marginBottom:   sp.sm,
    },
    heading: {
      fontSize:      typo.fontSize.xs,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.wide,
    },
    editBtn:  { flexDirection: 'row', alignItems: 'center', gap: sp.xxxs },
    editText: { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold },

    row: {
      flexDirection: 'row',
      marginBottom:  sp.xs,
    },
    rowLabel: { width: 90, fontSize: typo.fontSize.sm },
    rowValue: { flex: 1, fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold },

    noteRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           sp.xxs,
      marginTop:     sp.xs,
    },
    noteText: { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.medium },
  });
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },

    intro: {
      fontSize:     typo.fontSize.md,
      lineHeight:   typo.lineHeight.normal,
      marginBottom: sp.md,
    },

    backBtn: { flex: 1 },
    nextBtn: { flex: 2 },
  });
}
