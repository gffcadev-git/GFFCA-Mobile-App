import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets }              from 'react-native-safe-area-context';
import { NewShippingCargoVehiclesProps }  from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { ScreenHeader }                   from '../../components/ScreenHeader';
import { AppInput }                       from '../../components/AppInput';
import { AppButton }                      from '../../components/AppButton';
import { StepProgress }                   from '../../components/StepProgress';
import { SaveDraftButton }                from '../../components/SaveDraftButton';
import { CaptureField }                   from '../../components/CaptureField';
import { InfoBanner }                     from '../../components/InfoBanner';
import { WizardFooter }                   from '../../components/WizardFooter';
import { Icon }                           from '../../components/Icon';
import { useSiDraftStore, Vehicle }       from '../../stores/siDraftStore';
import { analyzeVin, isVinDisplayable, extractVins } from '../../utils/vinAnalyzer';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

type FieldStatus = { state: 'valid' | 'invalid' | 'warning'; message: string } | undefined;

/** Map a VIN's analysis to a CaptureField status line. */
function vinStatusFor(raw: string): FieldStatus {
  if (!raw.trim()) return undefined;
  const a = analyzeVin(raw);
  if (!a.lengthOk) {
    return { state: 'invalid', message: `${a.vin.length}/17 characters` };
  }
  if (a.invalidChars.length > 0) {
    return { state: 'invalid', message: `Illegal character ${a.invalidChars.join(', ')} — try I→1, O→0, Q→0` };
  }
  // Length + alphabet OK. Checksum failure is a warning, not a hard reject (§2.3).
  if (a.checkDigitValid === false) {
    return { state: 'warning', message: `Checksum off — expected ${a.expectedCheckDigit}. ${a.regionAndCountry}` };
  }
  return { state: 'valid', message: `${a.regionAndCountry} · ${a.modelYear}` };
}

// ─── VehicleCard ──────────────────────────────────────────────────────────────

type VehicleCardProps = {
  index:    number;
  vehicle:  Vehicle;
  canRemove: boolean;
  onChange: (patch: Partial<Vehicle>) => void;
  onRemove: () => void;
};

function VehicleCard({ index, vehicle, canRemove, onChange, onRemove }: Readonly<VehicleCardProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeCardStyles(sp, typo);

  return (
    <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border }]}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Vehicle {index + 1}</Text>
        {canRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
            <Icon name="close" size={14} color={colors.error.main} />
            <Text style={[styles.removeText, { color: colors.error.main }]}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* VIN capture */}
      <CaptureField
        label="VIN number"
        required
        value={vehicle.vin}
        onChangeText={vin => onChange({ vin })}
        placeholder="1HGCM82633A004352"
        helperText="17 characters. We verify format, theft (RCMP) and title (Carfax)."
        status={vinStatusFor(vehicle.vin)}
        parse={text => extractVins(text)[0] ?? null}
        scanPrompt="Scan the VIN"
      />

      {/* Vehicle notes */}
      <View style={styles.notesLabelRow}>
        <Text style={[styles.notesLabel, { color: colors.text.primary }]}>Vehicle notes</Text>
        <View style={[styles.optionalBadge, { backgroundColor: colors.background.elevated }]}>
          <Text style={[styles.optionalText, { color: colors.text.secondary }]}>optional</Text>
        </View>
      </View>
      <AppInput
        label=""
        placeholder="Condition, accessories, special handling…"
        value={vehicle.notes}
        onChangeText={notes => onChange({ notes })}
        multiline
        inputContainerStyle={styles.notesInput}
        style={styles.notesText}
      />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NewShippingCargoVehiclesScreen({ navigation }: Readonly<NewShippingCargoVehiclesProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const vehicles      = useSiDraftStore(s => s.form.vehicles);
  const siRef         = useSiDraftStore(s => s.form.ref);
  const updateVehicle = useSiDraftStore(s => s.updateVehicle);
  const removeVehicle = useSiDraftStore(s => s.removeVehicle);
  const addVehicle    = useSiDraftStore(s => s.addVehicle);

  const styles = makeStyles(sp, typo);

  // Every vehicle must carry a structurally-valid VIN (length + legal alphabet)
  // before the checks can run. Checksum mismatches are surfaced as warnings, not
  // blockers (§2.3), so they don't gate here.
  const allHaveVin = vehicles.every(v => isVinDisplayable(analyzeVin(v.vin)));

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <ScreenHeader
        title={siRef ?? 'New shipping instruction'}
        subtitle="Cargo · Vehicles"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={4} />

      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sp.xxl + sp.buttonHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cargo-type chip + change */}
        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: colors.background.elevated }]}>
            <Icon name="car" size={16} color={colors.success.main} />
            <Text style={[styles.chipText, { color: colors.text.primary }]}>Used auto</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={[styles.changeLink, { color: colors.text.link }]}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Info banner */}
        <InfoBanner>
          Add every vehicle first, then run the VIN checks together — verification can take a moment per vehicle, so we batch it at the end.
        </InfoBanner>

        {/* Vehicle cards */}
        {vehicles.map((v, i) => (
          <VehicleCard
            key={v.id}
            index={i}
            vehicle={v}
            canRemove={vehicles.length > 1}
            onChange={patch => updateVehicle(v.id, patch)}
            onRemove={() => removeVehicle(v.id)}
          />
        ))}

        {/* Add another vehicle */}
        <TouchableOpacity
          style={[styles.addBtn, { borderColor: colors.border }]}
          onPress={addVehicle}
          activeOpacity={0.75}
        >
          <Icon name="plus" size={18} color={colors.text.link} />
          <Text style={[styles.addText, { color: colors.text.link }]}>Add another vehicle</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* Fixed bottom — Back + Run checks */}
      <WizardFooter>
        <AppButton
          title="← Back"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
        <AppButton
          title={`Run checks (${vehicles.length})`}
          onPress={() => navigation.navigate('NewShippingVinResults')}
          disabled={!allHaveVin}
          iconRight={<Icon name="shield-check-outline" size={18} color={colors.primary.contrastText} />}
          style={styles.nextBtn}
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
      borderWidth:  1,
      borderRadius: typo.borderRadius.lg,
      padding:      sp.md,
      marginBottom: sp.md,
    },
    headerRow: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      marginBottom:   sp.md,
    },
    cardTitle: {
      fontSize:   typo.fontSize.xl,
      fontWeight: typo.fontWeight.semiBold,
    },
    removeBtn: { flexDirection: 'row', alignItems: 'center', gap: sp.xxs },
    removeText: { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold },

    notesLabelRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           sp.xs,
      marginBottom:  sp.xs,
    },
    notesLabel: { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.medium },
    optionalBadge: {
      paddingHorizontal: sp.xs,
      paddingVertical:   sp.xxxs,
      borderRadius:      typo.borderRadius.full,
    },
    optionalText: { fontSize: typo.fontSize.xs },
    notesInput: {
      height:          88,
      alignItems:      'flex-start',
      paddingVertical: sp.xs,
    },
    notesText: { textAlignVertical: 'top', height: '100%' },
  });
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:   { flex: 1 },
    scroll: { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.md },

    chipRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           sp.sm,
      marginBottom:  sp.md,
    },
    chip: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               sp.xs,
      paddingHorizontal: sp.sm,
      paddingVertical:   sp.xs,
      borderRadius:      typo.borderRadius.full,
    },
    chipText:   { fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.semiBold },
    changeLink: { fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.semiBold },

    addBtn: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            sp.xs,
      borderWidth:    1,
      borderStyle:    'dashed',
      borderRadius:   typo.borderRadius.md,
      paddingVertical: sp.md,
      marginBottom:   sp.md,
    },
    addText: { fontSize: typo.fontSize.md, fontWeight: typo.fontWeight.semiBold },

    backBtn: { flex: 1 },
    nextBtn: { flex: 2 },
  });
}
