import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList }          from './types';
import { SignInScreen }                from '../screens/auth/SignInScreen';
import { ForgotPasswordEmail }         from '../screens/auth/ForgotPasswordEmail';
import { ForgotPasswordConfirm }       from '../screens/auth/ForgotPasswordConfirm';
import { TermsAndConditions }          from '../screens/auth/TermsAndConditions';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="SignIn"                     component={SignInScreen} />
      <Stack.Screen name="ForgotPasswordEmail"        component={ForgotPasswordEmail} />
      <Stack.Screen name="ForgotPasswordConfirmation" component={ForgotPasswordConfirm} />
      <Stack.Screen name="TermsAndConditions"         component={TermsAndConditions} />
    </Stack.Navigator>
  );
}
