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
  Tabs:                 undefined;
  /** `ref` is set when resuming a draft SI — drives the header title. */
  NewShippingStep1:     { ref?: string } | undefined;
  NewShippingStep2:     undefined;
  NewShippingStep3:     undefined;
  NewShippingStep4:     undefined;
  NewShippingCargoVehicles: undefined;
  NewShippingVinResults:    undefined;
  NewShippingStep5:     undefined;
  NewShippingStep6:     undefined;
  NewShippingSuccess:   undefined;
  MessageThread:        { ref: string; subtitle: string };
  Notifications:        undefined;
  CompanyDetails:       undefined;
  SavedParties:         undefined;
  TaxCompliance:        undefined;
  Preferences:          undefined;
  DraftShippingInstructions: undefined;
  /** `id` drives the detail fetch; `ref` (SI number) shows instantly in the header. */
  ShipmentDetail:       { id: string; ref?: string };
};

export type NewShippingStep1Props = NativeStackScreenProps<MainStackParamList, 'NewShippingStep1'>;
export type NewShippingStep2Props = NativeStackScreenProps<MainStackParamList, 'NewShippingStep2'>;
export type NewShippingStep3Props = NativeStackScreenProps<MainStackParamList, 'NewShippingStep3'>;
export type NewShippingStep4Props = NativeStackScreenProps<MainStackParamList, 'NewShippingStep4'>;
export type NewShippingCargoVehiclesProps = NativeStackScreenProps<MainStackParamList, 'NewShippingCargoVehicles'>;
export type NewShippingVinResultsProps    = NativeStackScreenProps<MainStackParamList, 'NewShippingVinResults'>;
export type NewShippingStep5Props = NativeStackScreenProps<MainStackParamList, 'NewShippingStep5'>;
export type NewShippingStep6Props = NativeStackScreenProps<MainStackParamList, 'NewShippingStep6'>;
export type NewShippingSuccessProps = NativeStackScreenProps<MainStackParamList, 'NewShippingSuccess'>;
export type MessageThreadProps      = NativeStackScreenProps<MainStackParamList, 'MessageThread'>;
export type NotificationsProps      = NativeStackScreenProps<MainStackParamList, 'Notifications'>;
export type CompanyDetailsProps     = NativeStackScreenProps<MainStackParamList, 'CompanyDetails'>;
export type SavedPartiesProps       = NativeStackScreenProps<MainStackParamList, 'SavedParties'>;
export type TaxComplianceProps      = NativeStackScreenProps<MainStackParamList, 'TaxCompliance'>;
export type PreferencesProps        = NativeStackScreenProps<MainStackParamList, 'Preferences'>;
export type DraftShippingInstructionsProps = NativeStackScreenProps<MainStackParamList, 'DraftShippingInstructions'>;
export type ShipmentDetailProps     = NativeStackScreenProps<MainStackParamList, 'ShipmentDetail'>;

// ─── Root navigator ───────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
