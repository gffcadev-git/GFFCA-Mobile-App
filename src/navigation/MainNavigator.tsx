import React from 'react';
import { StyleSheet, Text }               from 'react-native';
import { createBottomTabNavigator }       from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator }     from '@react-navigation/native-stack';
import { MainTabParamList, MainStackParamList } from './types';
import { DashboardScreen }                from '../screens/main/DashboardScreen';
import { MessagesScreen }                 from '../screens/main/MessagesScreen';
import { MessageThreadScreen }            from '../screens/main/MessageThreadScreen';
import { ProfileScreen }                  from '../screens/main/ProfileScreen';
import { NewShippingStep1Screen }         from '../screens/main/NewShippingStep1Screen';
import { NewShippingStep2Screen }         from '../screens/main/NewShippingStep2Screen';
import { NewShippingStep3Screen }         from '../screens/main/NewShippingStep3Screen';
import { NewShippingStep4Screen }         from '../screens/main/NewShippingStep4Screen';
import { NewShippingCargoVehiclesScreen } from '../screens/main/NewShippingCargoVehiclesScreen';
import { NewShippingVinResultsScreen }    from '../screens/main/NewShippingVinResultsScreen';
import { NewShippingStep5Screen }         from '../screens/main/NewShippingStep5Screen';
import { NewShippingStep6Screen }         from '../screens/main/NewShippingStep6Screen';
import { NewShippingSuccessScreen }       from '../screens/main/NewShippingSuccessScreen';
import { useColors }                      from '../theme';

// ─── Tab navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

function PlaceholderScreen({ name }: Readonly<{ name: string }>) {
  const colors = useColors();
  return (
    <Text style={[styles.placeholder, { color: colors.text.primary }]}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  placeholder: { textAlign: 'center', marginTop: 60 },
});

function ShipmentsScreen() { return <PlaceholderScreen name="Shipments" />; }

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      // Native tab bar hidden — BottomNavBar is rendered inside each screen
      tabBar={() => null}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Projects"  component={ShipmentsScreen} />
      <Tab.Screen name="Messages"  component={MessagesScreen}  />
      <Tab.Screen name="Profile"   component={ProfileScreen}   />
    </Tab.Navigator>
  );
}

// ─── Main stack (tabs + full-screen flows) ────────────────────────────────────

const MainStack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Tabs"             component={TabNavigator}          />
      <MainStack.Screen name="NewShippingStep1" component={NewShippingStep1Screen} />
      <MainStack.Screen name="NewShippingStep2" component={NewShippingStep2Screen} />
      <MainStack.Screen name="NewShippingStep3" component={NewShippingStep3Screen} />
      <MainStack.Screen name="NewShippingStep4" component={NewShippingStep4Screen} />
      <MainStack.Screen name="NewShippingCargoVehicles" component={NewShippingCargoVehiclesScreen} />
      <MainStack.Screen name="NewShippingVinResults"    component={NewShippingVinResultsScreen} />
      <MainStack.Screen name="NewShippingStep5" component={NewShippingStep5Screen} />
      <MainStack.Screen name="NewShippingStep6" component={NewShippingStep6Screen} />
      <MainStack.Screen name="NewShippingSuccess" component={NewShippingSuccessScreen} />
      <MainStack.Screen name="MessageThread" component={MessageThreadScreen} />
    </MainStack.Navigator>
  );
}
