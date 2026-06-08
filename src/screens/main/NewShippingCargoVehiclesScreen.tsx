import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Destination', 'Container', 'Parties', 'Cargo', 'Notify', 'Review'];

type Vehicle = { id: string; vin: string; notes: string };

let nextId = 3;

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

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', vin: '1HGCM82633A004352', notes: '' },
    { id: '2', vin: '', notes: '' },
  ]);

  const styles = makeStyles(sp, typo);

  function updateVehicle(id: string, patch: Partial<Vehicle>) {
    setVehicles(vs => vs.map(v => (v.id === id ? { ...v, ...patch } : v)));
  }
  function removeVehicle(id: string) {
    setVehicles(vs => vs.filter(v => v.id !== id));
  }
  function addVehicle() {
    setVehicles(vs => [...vs, { id: String(nextId++), vin: '', notes: '' }]);
  }

  const allHaveVin = vehicles.every(v => v.vin.trim().length > 0);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background.default }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <ScreenHeader
        title="New shipping instruction"
        subtitle="Cargo · Vehicles"
        onBack={() => navigation.goBack()}
        rightElement={<SaveDraftButton />}
      />

      {/* Step progress */}
      <StepProgress steps={STEPS} currentStep={4} />

      <ScrollView
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
      </ScrollView>

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
    </KeyboardAvoidingView>
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
