import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon } from './Icon';

type Props = {
  title: string;
  /** Optional subtitle rendered below the title in a smaller weight */
  subtitle?: string;
  onBack?: () => void;
  /** Optional element rendered on the right side */
  rightElement?: React.ReactNode;
  /** Title/subtitle alignment — defaults to 'center' */
  titleAlign?: 'center' | 'left';
};

export function ScreenHeader({ title, subtitle, onBack, rightElement, titleAlign = 'center' }: Readonly<Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const styles  = makeStyles(sp, typo);
  const isLeft  = titleAlign === 'left';

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:      insets.top + sp.xs,
          backgroundColor: colors.background.paper,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Left — back chevron */}
      <View style={styles.leftSide}>
        {onBack && (
          <TouchableOpacity onPress={onBack} hitSlop={16} style={styles.backBtn} activeOpacity={0.7}>
            <Icon name="chevron-left" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center — title + optional subtitle */}
      <View style={[styles.center, isLeft && styles.centerLeft]}>
        <Text style={[styles.title, isLeft && styles.titleLeft, { color: colors.text.primary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, isLeft && styles.titleLeft, { color: colors.text.secondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right — flexible width for custom elements like "Save draft" */}
      <View style={styles.rightSide}>
        {rightElement ?? null}
      </View>
    </View>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    container: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: sp.headerHorizontal,
      paddingBottom:     sp.sm,
      borderBottomWidth: 1,
    },
    leftSide: {
      width:          sp.headerSide,
      alignItems:     'flex-start',
      justifyContent: 'center',
    },
    center: {
      flex:           1,
      alignItems:     'center',
    },
    centerLeft: {
      alignItems: 'flex-start',
      paddingLeft: sp.xs,
    },
    rightSide: {
      minWidth:       sp.headerSide,
      alignItems:     'flex-end',
      justifyContent: 'center',
    },
    backBtn: { padding: sp.xxs },
    title: {
      textAlign:     'center',
      fontSize:      typo.fontSize.xl,
      fontWeight:    typo.fontWeight.semiBold,
      letterSpacing: typo.letterSpacing.tight,
    },
    titleLeft: { textAlign: 'left' },
    subtitle: {
      textAlign:  'center',
      fontSize:   typo.fontSize.sm,
      fontWeight: typo.fontWeight.regular,
      marginTop:  sp.xxxs,
    },
  });
}
