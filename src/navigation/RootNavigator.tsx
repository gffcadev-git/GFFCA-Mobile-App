import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList }         from './types';
import { AuthNavigator }              from './AuthNavigator';
import { MainNavigator }              from './MainNavigator';
import { useAuthStore }               from '../stores/authStore';
import { useColors }                  from '../theme';

const Root = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const colors          = useColors();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated      = useAuthStore((s) => s.isHydrated);
  const bootstrap       = useAuthStore((s) => s.bootstrap);

  // Load secure tokens from the Keychain/Keystore before routing.
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.default }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Root.Screen name="Main" component={MainNavigator} />
        ) : (
          <Root.Screen name="Auth" component={AuthNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
