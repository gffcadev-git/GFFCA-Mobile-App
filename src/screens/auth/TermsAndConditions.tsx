import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets }      from 'react-native-safe-area-context';
import { TermsAndConditionsProps } from '../../navigation/types';
import { useColors, useSpacing, useTypography } from '../../theme';
import { AppButton }              from '../../components/AppButton';
import { ScreenHeader }           from '../../components/ScreenHeader';

const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body:  'By accessing or using the GFF Portal application, you agree to be bound by these Terms & Conditions and our Privacy Policy. These Terms & Conditions are provided on behalf of the GFF Portal and the Ring of Shipping.',
  },
  {
    title: '2. Shipping instructions',
    body:  'The shipping instructions provided within this platform are for GFF Portal use only. Redistribution of any shipping instructions or freight, whether partial or complete, is strictly prohibited. You may not resell or redistribute content from this platform in any commercial context.',
  },
  {
    title: '3. Documentation & compliance',
    body:  'All documentation submitted through this platform must comply with applicable international trade regulations. Users are responsible for ensuring accuracy and completeness of all submitted data. GFF Portal is not liable for penalties arising from incorrect documentation.',
  },
  {
    title: '4. Account security',
    body:  'You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use. We reserve the right to terminate accounts found in violation of these terms.',
  },
  {
    title: '5. Privacy & data',
    body:  'We collect and process personal data as described in our Privacy Policy. By using this platform, you consent to such processing and warrant that all data provided is accurate.',
  },
];

export function TermsAndConditions({ navigation }: Readonly<TermsAndConditionsProps>) {
  const colors = useColors();
  const sp     = useSpacing();
  const typo   = useTypography();
  const insets = useSafeAreaInsets();

  const styles = makeStyles(sp, typo);

  return (
    <View style={[styles.root, { backgroundColor: colors.background.default }]}>
      <ScreenHeader title="Terms & Conditions" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + sp.buttonHeight + sp.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: colors.text.secondary }]}>
          Please review these terms and conditions carefully. These govern your use of the GFF Portal and Ring of Shipping applications and services.
        </Text>

        {SECTIONS.map(s => (
          <View key={s.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{s.title}</Text>
            <Text style={[styles.sectionBody,  { color: colors.text.secondary }]}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Fixed bottom button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background.paper,
            borderTopColor:  colors.border,
            paddingBottom:   insets.bottom + sp.sm,
          },
        ]}
      >
        <AppButton title="I understand & agree" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

function makeStyles(
  sp:   ReturnType<typeof useSpacing>,
  typo: ReturnType<typeof useTypography>,
) {
  return StyleSheet.create({
    root:         { flex: 1 },
    scroll:       { paddingHorizontal: sp.screenHorizontal, paddingTop: sp.lg },
    intro:        { fontSize: typo.fontSize.md, lineHeight: typo.lineHeight.normal, marginBottom: sp.lg },
    section:      { marginBottom: sp.md },
    sectionTitle: { fontSize: typo.fontSize.base, fontWeight: typo.fontWeight.semiBold, marginBottom: sp.xs },
    sectionBody:  { fontSize: typo.fontSize.md, lineHeight: typo.lineHeight.normal },
    footer:       {
      position:          'absolute',
      bottom:            0,
      left:              0,
      right:             0,
      paddingTop:        sp.sm,
      paddingHorizontal: sp.screenHorizontal,
      borderTopWidth:    1,
    },
  });
}
