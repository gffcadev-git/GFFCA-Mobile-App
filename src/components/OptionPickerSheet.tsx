import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon } from './Icon';

export type PickerOption = {
  /** Text shown to the user */
  label: string;
  /** API-friendly value stored in state (e.g. 'en-CA', 'CAD', 'metric') */
  value: string;
  /** Optional secondary line */
  description?: string;
};

type Props = Readonly<{
  visible: boolean;
  title: string;
  options: PickerOption[];
  /** Currently selected option's `value` */
  selectedValue: string;
  onSelect: (option: PickerOption) => void;
  onClose: () => void;
}>;

/**
 * Bottom-sheet single-select picker. Slides up from the bottom with a
 * dimmed backdrop; tapping an option selects it and dismisses the sheet.
 * Used for Preferences (language, currency, units, date format) and reusable
 * anywhere a value needs to be chosen from a list.
 */
export function OptionPickerSheet({
  visible, title, options, selectedValue, onSelect, onClose,
}: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(sp, typo);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background.paper, paddingBottom: insets.bottom + sp.md },
          ]}
        >
          {/* Grabber */}
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />

          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>

          {/* Options */}
          <ScrollView bounces={false} style={styles.list}>
            {options.map(option => {
              const selected = option.value === selectedValue;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    { borderColor: selected ? colors.primary.main : colors.border },
                    selected && { backgroundColor: colors.background.elevated },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <View style={styles.optionBody}>
                    <Text style={[styles.optionLabel, { color: colors.text.primary }]}>{option.label}</Text>
                    {!!option.description && (
                      <Text style={[styles.optionDesc, { color: colors.text.secondary }]}>{option.description}</Text>
                    )}
                  </View>
                  {selected && <Icon name="check-circle" size={22} color={colors.primary.main} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

    sheetWrap: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
      borderTopLeftRadius:  typo.borderRadius.lg * 1.5,
      borderTopRightRadius: typo.borderRadius.lg * 1.5,
      paddingHorizontal:    sp.screenHorizontal,
      paddingTop:           sp.sm,
      maxHeight:            '75%',
    },
    grabber: {
      alignSelf:    'center',
      width:        40,
      height:       4,
      borderRadius: 2,
      marginBottom: sp.md,
    },
    title: {
      fontSize:     typo.fontSize.xl,
      fontWeight:   typo.fontWeight.bold,
      marginBottom: sp.md,
    },
    list: { flexGrow: 0 },
    option: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      gap:            sp.sm,
      borderWidth:    1,
      borderRadius:   typo.borderRadius.md,
      paddingHorizontal: sp.md,
      paddingVertical:   sp.sm,
      marginBottom:   sp.xs,
    },
    optionBody:  { flex: 1 },
    optionLabel: { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.semiBold },
    optionDesc:  { fontSize: typo.fontSize.sm, marginTop: 1 },
  });
}
