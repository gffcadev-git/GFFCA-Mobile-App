import React from 'react';
import { createBottomTabNavigator }       from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator }     from '@react-navigation/native-stack';
import { MainTabParamList, MainStackParamList } from './types';
import { DashboardScreen }                from '../screens/DashboardScreen';
import { MessagesScreen }                 from '../screens/message/MessagesScreen';
import { MessageThreadScreen }            from '../screens/message/MessageThreadScreen';
import { ProfileScreen }                  from '../screens/profile/ProfileScreen';
import { ShipmentsScreen }                from '../screens/shipmentInstructions/ShipmentsScreen';
import { NotificationsScreen }            from '../screens/main/NotificationsScreen';
import { CompanyDetailsScreen }           from '../screens/profile/CompanyDetailsScreen';
import { SavedPartiesScreen }             from '../screens/profile/SavedPartiesScreen';
import { TaxComplianceScreen }            from '../screens/TaxComplianceScreen';
import { PreferencesScreen }              from '../screens/profile/PreferencesScreen';
import { DraftShippingInstructionsScreen } from '../screens/shipmentInstructions/DraftShippingInstructionsScreen';
import { ShipmentDetailScreen }           from '../screens/shipmentInstructions/ShipmentDetailScreen';
import { NewShippingStep1Screen }         from '../screens/shipmentInstructions/NewShippingStep1Screen';
import { NewShippingStep2Screen }         from '../screens/shipmentInstructions/NewShippingStep2Screen';
import { NewShippingStep3Screen }         from '../screens/shipmentInstructions/NewShippingStep3Screen';
import { NewShippingStep4Screen }         from '../screens/shipmentInstructions/NewShippingStep4Screen';
import { NewShippingCargoVehiclesScreen } from '../screens/shipmentInstructions/NewShippingCargoVehiclesScreen';
import { NewShippingVinResultsScreen }    from '../screens/shipmentInstructions/NewShippingVinResultsScreen';
import { NewShippingStep5Screen }         from '../screens/shipmentInstructions/NewShippingStep5Screen';
import { NewShippingStep6Screen }         from '../screens/shipmentInstructions/NewShippingStep6Screen';
import { NewShippingSuccessScreen }       from '../screens/shipmentInstructions/NewShippingSuccessScreen';

// ─── Tab navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

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
      <MainStack.Screen name="Notifications" component={NotificationsScreen} />
      <MainStack.Screen name="CompanyDetails" component={CompanyDetailsScreen} />
      <MainStack.Screen name="SavedParties" component={SavedPartiesScreen} />
      <MainStack.Screen name="TaxCompliance" component={TaxComplianceScreen} />
      <MainStack.Screen name="Preferences" component={PreferencesScreen} />
      <MainStack.Screen name="DraftShippingInstructions" component={DraftShippingInstructionsScreen} />
      <MainStack.Screen name="ShipmentDetail" component={ShipmentDetailScreen} />
    </MainStack.Navigator>
  );
}
