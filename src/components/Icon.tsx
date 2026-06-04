import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// All icon names used in this app — extend as needed.
export type IconName =
  // Navigation
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-right'
  | 'arrow-left'
  // Auth / forms
  | 'eye'
  | 'eye-off'
  | 'lock'
  | 'fingerprint'
  | 'face-recognition'
  // States
  | 'check'
  | 'check-circle'
  | 'check-circle-outline'
  // Shipping / forms
  | 'information-outline'
  | 'camera-outline'
  | 'tray-arrow-up'
  | 'ferry'
  | 'office-building-outline'
  | 'link-variant'
  // Dashboard
  | 'bell-outline'
  | 'plus'
  // Tab bar
  | 'home'
  | 'home-outline'
  | 'layers'
  | 'layers-outline'
  | 'chat'
  | 'chat-outline'
  | 'account'
  | 'account-outline'
  | 'folder-open-outline';

type Props = Readonly<{
  name: IconName;
  size?: number;
  color?: string;
}>;

export function Icon({ name, size = 24, color = '#FFFFFF' }: Props) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
