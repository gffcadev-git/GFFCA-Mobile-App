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

const CIRCLE_SIZE = 24;
const LINE_FLEX   = 0.35; // flex weight for connector lines (relative to 1 per step)

// ─── StepProgress ─────────────────────────────────────────────────────────────

export function StepProgress({ steps, currentStep }: Readonly<Props>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const styles = makeStyles(sp);

  return (
    <View style={styles.container}>
      {/* ── Row 1: circles + connector lines ── */}
      <View style={styles.circleRow}>
        {steps.map((_, index) => {
          const step        = index + 1;
          const isCompleted = step < currentStep;
          const isActive    = step === currentStep;

          const circleBg = isCompleted || isActive
            ? colors.primary.main
            : colors.background.elevated;

          const lineColor = step < currentStep
            ? colors.primary.main
            : colors.border;

          return (
            <React.Fragment key={index}>
              {/* Circle */}
              <View style={styles.circleCell}>
                <View style={[styles.circle, { backgroundColor: circleBg }]}>
                  {isCompleted ? (
                    <Icon name="check" size={13} color={colors.white} />
                  ) : (
                    <Text style={[
                      styles.circleNum,
                      { color: isActive ? colors.white : colors.text.secondary },
                    ]}>
                      {step}
                    </Text>
                  )}
                </View>
              </View>

              {/* Connector line (not after last step) */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { flex: LINE_FLEX, backgroundColor: lineColor },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* ── Row 2: labels — spacers mirror the line flex so labels stay under circles ── */}
      <View style={styles.labelRow}>
        {steps.map((label, index) => {
          const step     = index + 1;
          const isActive = step === currentStep;

          return (
            <React.Fragment key={index}>
              <View style={styles.circleCell}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive
                        ? colors.primary.light
                        : colors.text.secondary,
                      fontWeight: isActive
                        ? typo.fontWeight.semiBold
                        : typo.fontWeight.regular,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {label}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View style={{ flex: LINE_FLEX }} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(sp: ReturnType<typeof useSpacing>) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: sp.screenHorizontal,
      paddingVertical:   sp.sm,
    },

    // Row 1
    circleRow: {
      flexDirection: 'row',
      alignItems:    'center',
      marginBottom:  sp.xxs,
    },
    circleCell: {
      flex:       1,
      alignItems: 'center',
    },
    circle: {
      width:          CIRCLE_SIZE,
      height:         CIRCLE_SIZE,
      borderRadius:   CIRCLE_SIZE / 2,
      alignItems:     'center',
      justifyContent: 'center',
    },
    circleNum: {
      fontSize:   10,
      fontWeight: '600',
      lineHeight: 12,
    },
    line: {
      height:       1.5,
      alignSelf:    'center',
    },

    // Row 2
    labelRow: {
      flexDirection: 'row',
    },
    label: {
      fontSize:  9,
      textAlign: 'center',
      lineHeight: 12,
    },
  });
}
