import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors, useSpacing, useTypography } from '../theme';
import { Icon } from './Icon';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  /** Array of step labels — length determines total step count */
  steps: string[];
  /** 1-indexed number of the currently active step */
  currentStep: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CIRCLE_SIZE     = 26;
const LINE_THICKNESS  = 2;
const LINE_INSET      = CIRCLE_SIZE / 2 + 4; // gap between circle edge and dash

// ─── StepProgress ─────────────────────────────────────────────────────────────

export function StepProgress({ steps, currentStep }: Readonly<Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp, typo);

  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const step        = index + 1;
        const isCompleted = step < currentStep;
        const isActive    = step === currentStep;
        const isUpcoming  = !isCompleted && !isActive;
        const isLast      = index === steps.length - 1;

        // Circle fill: green when done, purple when active, dark otherwise
        const circleBg = isCompleted
          ? colors.success.main
          : isActive
            ? colors.primary.main
            : colors.background.elevated;

        // Label colour follows the same green / purple / gray logic
        const labelColor = isCompleted
          ? colors.success.main
          : isActive
            ? colors.primary.light
            : colors.text.secondary;

        return (
          <View key={index} style={styles.cell}>
            {/* Connector dash — spans from this circle's centre to the next.
                Absolutely positioned so circles stay evenly distributed. */}
            {!isLast && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: colors.border },
                ]}
              />
            )}

            {/* Circle */}
            <View
              style={[
                styles.circle,
                { backgroundColor: circleBg },
                isUpcoming && styles.circleUpcoming,
                isUpcoming && { borderColor: colors.border },
                isActive   && styles.circleActiveGlow,
                isActive   && { shadowColor: colors.primary.main },
              ]}
            >
              {isCompleted ? (
                <Icon name="check" size={14} color={colors.white} />
              ) : (
                <Text
                  style={[
                    styles.circleNum,
                    { color: isActive ? colors.white : colors.text.secondary },
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                {
                  color:      labelColor,
                  fontWeight: isActive ? typo.fontWeight.semiBold : typo.fontWeight.medium,
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    container: {
      flexDirection:     'row',
      alignItems:        'flex-start',
      // Slightly tighter than screen padding so the 6 labels have room to sit
      // on a single line (matches the design).
      paddingHorizontal: sp.md,
      paddingTop:        sp.sm,
      paddingBottom:     sp.sm,
    },

    // Each step occupies an equal share of the width → circles are evenly spaced
    cell: {
      flex:       1,
      alignItems: 'center',
      position:   'relative',
    },

    // Connector runs from this cell's centre (50%) to the next cell's centre
    // (-50%), inset on both ends so it sits cleanly between the two circles.
    line: {
      position:    'absolute',
      top:         (CIRCLE_SIZE - LINE_THICKNESS) / 2,
      left:        '50%',
      right:       '-50%',
      height:      LINE_THICKNESS,
      marginLeft:  LINE_INSET,
      marginRight: LINE_INSET,
      borderRadius: LINE_THICKNESS / 2,
    },

    circle: {
      width:          CIRCLE_SIZE,
      height:         CIRCLE_SIZE,
      borderRadius:   CIRCLE_SIZE / 2,
      alignItems:     'center',
      justifyContent: 'center',
    },
    circleUpcoming: {
      borderWidth: 1,
    },
    circleActiveGlow: {
      shadowOffset:  { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius:  6,
      elevation:     6,
    },
    circleNum: {
      fontSize:   typo.fontSize.xs,
      fontWeight: typo.fontWeight.bold,
    },

    label: {
      marginTop:  sp.xs,
      fontSize:   typo.fontSize.xxs,
      textAlign:  'center',
      letterSpacing: typo.letterSpacing.tight,
    },
  });
}
