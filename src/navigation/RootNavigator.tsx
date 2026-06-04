import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList }         from './types';
import { AuthNavigator }              from './AuthNavigator';
import { MainNavigator }              from './MainNavigator';

const Root = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  // TODO: replace this with real auth state (e.g. from AuthContext)
  const isAuthenticated = true;

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
