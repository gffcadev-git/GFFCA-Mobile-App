import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';

type Variant = 'primary' | 'outline' | 'ghost';

type Props = TouchableOpacityProps & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
};

export function AppButton({
  title,
  variant = 'primary',
  loading = false,
  icon,
  disabled,
  style,
  ...rest
}: Props) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();

  const bg =
    variant === 'primary' ? colors.primary.main
    : variant === 'outline' ? 'transparent'
    : 'transparent';

  const borderColor = variant === 'outline' ? colors.border : 'transparent';
  const textColor   = variant === 'primary' ? colors.primary.contrastText : colors.text.primary;

  const styles = makeStyles(sp, typo);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor, opacity: disabled ? 0.5 : 1 },
        variant === 'outline' && { borderWidth: 1 },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.label, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    btn: {
      height:            sp.buttonHeight,
      borderRadius:      typo.borderRadius.lg,
      alignItems:        'center',
      justifyContent:    'center',
      paddingHorizontal: sp.headerHorizontal,
    },
    inner: { flexDirection: 'row', alignItems: 'center' },
    icon:  { marginRight: sp.xs },
    label: {
      fontSize:      typo.fontSize.lg,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.normal,
    },
  });
}
