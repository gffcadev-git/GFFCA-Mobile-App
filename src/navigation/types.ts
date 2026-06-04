import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps }   from '@react-navigation/bottom-tabs';

// ─── Auth stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  SignIn:                      undefined;
  ForgotPasswordEmail:         undefined;
  ForgotPasswordConfirmation:  { email: string };
  TermsAndConditions:          undefined;
};

export type SignInProps                     = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;
export type ForgotPasswordEmailProps        = NativeStackScreenProps<AuthStackParamList, 'ForgotPasswordEmail'>;
export type ForgotPasswordConfirmationProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPasswordConfirmation'>;
export type TermsAndConditionsProps         = NativeStackScreenProps<AuthStackParamList, 'TermsAndConditions'>;

// ─── Main tab bar ─────────────────────────────────────────────────────────────

export type MainTabParamList = {
  Dashboard: undefined;
  Projects:  undefined;
  Messages:  undefined;
  Profile:   undefined;
};

export type DashboardTabProps = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;

// ─── Main stack (wraps tabs + full-screen flows) ──────────────────────────────

export type MainStackParamList = {
  Tabs:             undefined;
  NewShippingStep1: undefined;
  NewShippingStep2: undefined;
  NewShippingStep3: undefined;
};

export type NewShippingStep1Props = NativeStackScreenProps<MainStackParamList, 'NewShippingStep1'>;
export type NewShippingStep2Props = NativeStackScreenProps<MainStackParamList, 'NewShippingStep2'>;
export type NewShippingStep3Props = NativeStackScreenProps<MainStackParamList, 'NewShippingStep3'>;

// ─── Root navigator ───────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
