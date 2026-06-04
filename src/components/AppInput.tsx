import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
  StyleSheet,
} from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon } from './Icon';

type Props = TextInputProps & {
  /** Pass an empty string to suppress the label row */
  label: string;
  /** Shows a red asterisk after the label */
  required?: boolean;
  rightLabel?: string;
  onRightLabelPress?: () => void;
  secureToggle?: boolean;
  /** Small helper/hint text rendered below the input */
  helperText?: string;
  /** Override styles applied to the inner input container (border, background) */
  inputContainerStyle?: StyleProp<ViewStyle>;
};

export function AppInput({
  label,
  required = false,
  rightLabel,
  onRightLabelPress,
  secureToggle = false,
  secureTextEntry,
  helperText,
  inputContainerStyle,
  style,
  ...rest
}: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  const styles = makeStyles(sp, typo);

  return (
    <View style={styles.wrapper}>
      {/* Label row — hidden when label is empty string */}
      {label.length > 0 && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>
            {label}
            {required ? (
              <Text style={{ color: colors.error.main }}> *</Text>
            ) : null}
          </Text>
          {!!rightLabel && (
            <TouchableOpacity onPress={onRightLabelPress} hitSlop={8}>
              <Text style={[styles.rightLabel, { color: colors.text.link }]}>{rightLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Input box */}
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: colors.background.paper, borderColor: colors.border },
          inputContainerStyle,
        ]}
      >
        <TextInput
          placeholderTextColor={colors.text.hint}
          style={[styles.input, { color: colors.text.primary }, style]}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          {...rest}
        />
        {!!secureToggle && (
          <TouchableOpacity onPress={() => setHidden(h => !h)} hitSlop={8} style={styles.eye}>
            <Icon name={hidden ? 'eye-off' : 'eye'} size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Helper text */}
      {helperText ? (
        <Text style={[styles.helperText, { color: colors.text.secondary }]}>{helperText}</Text>
      ) : null}
    </View>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    wrapper:    { marginBottom: sp.md },
    labelRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: sp.xs },
    label:      { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.medium },
    rightLabel: { fontSize: typo.fontSize.sm, fontWeight: typo.fontWeight.medium },
    inputWrap: {
      flexDirection:     'row',
      alignItems:        'center',
      borderWidth:       1,
      borderRadius:      typo.borderRadius.md,
      paddingHorizontal: sp.inputHorizontal,
      height:            sp.inputHeight,
    },
    input:      { flex: 1, fontSize: typo.fontSize.base },
    eye:        { paddingLeft: sp.xs },
    helperText: {
      marginTop:  sp.xxs,
      fontSize:   typo.fontSize.xs,
      lineHeight: typo.lineHeight.tight,
    },
  });
}
