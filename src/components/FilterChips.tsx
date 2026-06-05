import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';

type Props = Readonly<{
  options: string[];
  value: string;
  onChange: (option: string) => void;
}>;

/**
 * Horizontally-scrollable single-select chip row used to filter lists
 * (saved parties, shipments, …). The active chip uses the brand colour.
 */
export function FilterChips({ options, value, onChange }: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map(option => {
        const active = option === value;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            activeOpacity={0.75}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary.main : colors.background.elevated,
                borderColor:     active ? colors.primary.main : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.primary.contrastText : colors.text.secondary },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    row: {
      gap:               sp.xs,
      paddingHorizontal: sp.screenHorizontal,
      paddingVertical:   sp.xs,
    },
    chip: {
      borderWidth:       1,
      borderRadius:      typo.borderRadius.full,
      paddingHorizontal: sp.md,
      paddingVertical:   sp.xs,
    },
    label: { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.semiBold },
  });
}
